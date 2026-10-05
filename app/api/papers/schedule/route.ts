import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canSchedulePaper } from "@/lib/permissions";
import { schedulePaperSchema } from "@/lib/validations";
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

    if (!canSchedulePaper(session.role)) {
      await recordSecurityEvent({
        type: "UNAUTHORIZED_ACCESS",
        severity: "HIGH",
        userId: session.userId,
        userName: session.name,
        description: `Unauthorized exam scheduling attempt by role: ${session.role}`,
        req,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Only Examination Authority or Administrators can schedule examinations.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = schedulePaperSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.errors[0]?.message || "Invalid schedule data",
        },
        { status: 400 }
      );
    }

    const { paperId, examDate, examTime } = parseResult.data;

    const paper = await prisma.questionPaper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, message: "Question paper not found" },
        { status: 404 }
      );
    }

    if (paper.status === "Released" || paper.releaseStatus === "Released") {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot reschedule an already released examination paper.",
        },
        { status: 400 }
      );
    }

    if (paper.status !== "Approved" && paper.status !== "Scheduled") {
      return NextResponse.json(
        {
          success: false,
          message: `Only approved papers can be scheduled. Current status: ${paper.status}`,
        },
        { status: 400 }
      );
    }

    const scheduledDate = new Date(examTime);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { success: false, message: "Invalid scheduled examination date/time format." },
        { status: 400 }
      );
    }

    const updatedPaper = await prisma.questionPaper.update({
      where: { id: paperId },
      data: {
        status: "Scheduled",
        releaseStatus: "Locked",
        examDate,
        examTime: scheduledDate,
        scheduledById: session.userId,
        scheduledAt: new Date(),
      },
    });

    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: "SCHEDULE_PAPER",
      resourceType: "QuestionPaper",
      resourceId: paper.id,
      description: `Scheduled examination for "${paper.title}" at ${scheduledDate.toUTCString()}`,
      req,
    });

    return NextResponse.json({
      success: true,
      message: "Examination scheduled successfully.",
      data: {
        _id: updatedPaper.id,
        id: updatedPaper.id,
        status: updatedPaper.status,
        releaseStatus: updatedPaper.releaseStatus,
        examDate: updatedPaper.examDate,
        examTime: updatedPaper.examTime,
      },
    });
  } catch (error) {
    console.error("Schedule Paper Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to schedule examination" },
      { status: 500 }
    );
  }
}
