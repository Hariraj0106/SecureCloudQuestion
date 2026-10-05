import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { decryptContent } from "@/lib/encryption";
import { verifyHash } from "@/lib/hashing";
import { logAudit } from "@/lib/audit";
import { recordSecurityEvent } from "@/lib/security";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    const { id } = await params;

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const paper = await prisma.questionPaper.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        scheduledBy: { select: { id: true, name: true, email: true } },
        releasedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, message: "Question paper not found" },
        { status: 404 }
      );
    }

    // Role-based visibility checks
    const creatorId = paper.createdById;
    let canViewContent = false;

    if (session.role === "Admin") {
      canViewContent = true;
    } else if (session.role === "Question Setter") {
      if (creatorId === session.userId) {
        canViewContent = true;
      } else {
        await recordSecurityEvent({
          type: "UNAUTHORIZED_ACCESS",
          severity: "MEDIUM",
          userId: session.userId,
          userName: session.name,
          resourceId: id,
          description: `Question setter attempted to view unauthorized paper ${id}`,
          req,
        });
        return NextResponse.json(
          { success: false, message: "Access restricted to paper creator" },
          { status: 403 }
        );
      }
    } else if (session.role === "Reviewer") {
      canViewContent = true; // Reviewers are authorized to inspect and verify content
    } else if (session.role === "Examination Authority") {
      canViewContent = true; // Authority validates for approval and scheduling
    } else if (session.role === "Examination Center") {
      // Examination Center ONLY sees content once officially Released
      if (paper.releaseStatus === "Released") {
        canViewContent = true;
      } else {
        canViewContent = false;
      }
    }

    let decryptedText: string | undefined = undefined;
    let integrityOk = true;

    if (canViewContent && paper.encryptedContent && paper.iv) {
      try {
        decryptedText = decryptContent(paper.encryptedContent, paper.iv);
        integrityOk = verifyHash(decryptedText, paper.contentHash);

        if (!integrityOk) {
          await recordSecurityEvent({
            type: "INTEGRITY_FAILURE",
            severity: "CRITICAL",
            userId: session.userId,
            userName: session.name,
            resourceId: id,
            description: `Cryptographic SHA-256 integrity check failed for paper: ${paper.title} (ID: ${id})`,
            req,
          });
        }
      } catch (decErr) {
        console.error("Decryption failed:", decErr);
        decryptedText = "[Error: Decryption failed]";
      }
    }

    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: "VIEW_PAPER",
      resourceType: "QuestionPaper",
      resourceId: id,
      description: `Viewed question paper "${paper.title}" (Content accessible: ${canViewContent})`,
      req,
    });

    const {
      encryptedContent: _enc,
      iv: _iv,
      ...paperData
    } = paper;

    return NextResponse.json({
      success: true,
      data: {
        ...paperData,
        _id: paper.id,
        content: decryptedText,
        canViewContent,
        integrityVerified: integrityOk,
      },
    });
  } catch (error) {
    console.error("Fetch Paper Detail Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve paper details" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    const { id } = await params;

    if (!session || session.role !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Administrative privilege required" },
        { status: 403 }
      );
    }

    const paper = await prisma.questionPaper.delete({
      where: { id },
    });

    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: "FAILED_ACCESS",
      resourceType: "QuestionPaper",
      resourceId: id,
      description: `Permanently deleted question paper "${paper.title}"`,
      req,
    });

    return NextResponse.json({
      success: true,
      message: "Question paper deleted successfully",
    });
  } catch (error) {
    console.error("Delete Paper Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete question paper" },
      { status: 500 }
    );
  }
}
