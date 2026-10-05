import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canApprovePaper } from "@/lib/permissions";
import { rejectPaperSchema } from "@/lib/validations";
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
        description: `Unauthorized rejection attempt by role: ${session.role}`,
        req,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Only Examination Authority or Administrators can reject papers.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = rejectPaperSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.errors[0]?.message || "Invalid rejection payload",
        },
        { status: 400 }
      );
    }

    const { paperId, reason } = parseResult.data;

    const paper = await prisma.questionPaper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, message: "Question paper not found" },
        { status: 404 }
      );
    }

    const updatedPaper = await prisma.questionPaper.update({
      where: { id: paperId },
      data: {
        status: "Rejected",
        rejectionReason: reason,
      },
    });

    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: "REJECT_PAPER",
      resourceType: "QuestionPaper",
      resourceId: paper.id,
      description: `Paper "${paper.title}" was rejected by ${session.name}. Reason: ${reason}`,
      req,
    });

    return NextResponse.json({
      success: true,
      message: "Question paper rejected and returned for revision.",
      data: {
        _id: updatedPaper.id,
        id: updatedPaper.id,
        status: updatedPaper.status,
        rejectionReason: updatedPaper.rejectionReason,
      },
    });
  } catch (error) {
    console.error("Reject Paper Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to reject question paper" },
      { status: 500 }
    );
  }
}
