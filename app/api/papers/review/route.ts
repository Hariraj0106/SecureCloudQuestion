import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canReviewPaper } from "@/lib/permissions";
import { reviewPaperSchema } from "@/lib/validations";
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

    if (!canReviewPaper(session.role)) {
      await recordSecurityEvent({
        type: "UNAUTHORIZED_ACCESS",
        severity: "MEDIUM",
        userId: session.userId,
        userName: session.name,
        description: `Unauthorized attempt to review paper by role: ${session.role}`,
        req,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Only designated Reviewers or Administrators can review papers.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = reviewPaperSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.errors[0]?.message || "Invalid review payload",
        },
        { status: 400 }
      );
    }

    const { paperId, status, comments, rejectionReason } = parseResult.data;

    const paper = await prisma.questionPaper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, message: "Question paper not found" },
        { status: 404 }
      );
    }

    if (paper.status !== "Created" && paper.status !== "Rejected") {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot review paper currently in "${paper.status}" state`,
        },
        { status: 400 }
      );
    }

    // Update paper in Prisma
    const updatedPaper = await prisma.questionPaper.update({
      where: { id: paperId },
      data: {
        status,
        reviewedById: session.userId,
        reviewedAt: new Date(),
        reviewComments: comments || "",
        rejectionReason:
          status === "Rejected"
            ? rejectionReason || comments || "Reviewer rejected paper"
            : null,
      },
    });

    // Create Review history record
    await prisma.review.create({
      data: {
        paperId: paper.id,
        reviewerId: session.userId,
        status,
        comments,
        rejectionReason: updatedPaper.rejectionReason,
      },
    });

    // Audit log
    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: status === "Reviewed" ? "SUBMIT_REVIEW" : "REJECT_PAPER",
      resourceType: "QuestionPaper",
      resourceId: paper.id,
      description: `Reviewer ${session.name} ${
        status === "Reviewed" ? "approved review for" : "rejected"
      } paper "${paper.title}"`,
      req,
    });

    return NextResponse.json({
      success: true,
      message:
        status === "Reviewed"
          ? "Paper review submitted successfully and forwarded to Examination Authority."
          : "Question paper rejected and returned to Question Setter.",
      data: {
        _id: updatedPaper.id,
        id: updatedPaper.id,
        status: updatedPaper.status,
        reviewedAt: updatedPaper.reviewedAt,
      },
    });
  } catch (error) {
    console.error("Review Paper Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
}
