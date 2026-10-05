import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canApprovePaper } from "@/lib/permissions";
import { approvePaperSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { recordSecurityEvent } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    if (!canApprovePaper(session.role)) {
      await recordSecurityEvent({
        type: "UNAUTHORIZED_ACCESS",
        severity: "HIGH",
        userId: session.userId,
        userName: session.name,
        description: `Unauthorized attempt to approve paper by role: ${session.role}`,
        req,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Only Examination Authority or Administrators can approve papers.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = approvePaperSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parseResult.error.errors[0]?.message || "Invalid approval request",
        },
        { status: 400 }
      );
    }

    const { paperId } = parseResult.data;

    const paper = await prisma.questionPaper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, message: "Question paper not found" },
        { status: 404 }
      );
    }

    if (paper.status !== "Reviewed") {
      return NextResponse.json(
        {
          success: false,
          message: `Only reviewed papers can be approved. Current status: ${paper.status}`,
        },
        { status: 400 }
      );
    }

    // Separation of duties check: cannot approve own paper if user is creator
    if (paper.createdById === session.userId && session.role !== "Admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Separation of duties policy violation: Author cannot approve own paper.",
        },
        { status: 400 }
      );
    }

    const updatedPaper = await prisma.questionPaper.update({
      where: { id: paperId },
      data: {
        status: "Approved",
        approvedById: session.userId,
        approvedAt: new Date(),
      },
    });

    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: "APPROVE_PAPER",
      resourceType: "QuestionPaper",
      resourceId: paper.id,
      description: `Authority ${session.name} officially approved paper "${paper.title}"`,
      req,
    });

    return NextResponse.json({
      success: true,
      message:
        "Question paper approved successfully and is now ready for scheduling.",
      data: {
        _id: updatedPaper.id,
        id: updatedPaper.id,
        status: updatedPaper.status,
        approvedAt: updatedPaper.approvedAt,
      },
    });
  } catch (error) {
    console.error("Approve Paper Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to approve question paper" },
      { status: 500 }
    );
  }
}
