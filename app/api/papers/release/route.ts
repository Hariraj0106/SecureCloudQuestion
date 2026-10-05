import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canReleasePaper } from "@/lib/permissions";
import { releasePaperSchema } from "@/lib/validations";
import { decryptContent } from "@/lib/encryption";
import { verifyHash } from "@/lib/hashing";
import { isDeviceAuthorized, recordSecurityEvent } from "@/lib/security";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // 1. Role verification
    if (!canReleasePaper(session.role)) {
      await recordSecurityEvent({
        type: "UNAUTHORIZED_ACCESS",
        severity: "CRITICAL",
        userId: session.userId,
        userName: session.name,
        description: `Unauthorized release attempt by role: ${session.role}`,
        req,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Access restricted. Only authorized Examination Center personnel can trigger paper release.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = releasePaperSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.errors[0]?.message || "Invalid release payload",
        },
        { status: 400 }
      );
    }

    const { paperId, deviceId } = parseResult.data;

    const paper = await prisma.questionPaper.findUnique({
      where: { id: paperId },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, message: "Question paper not found" },
        { status: 404 }
      );
    }

    // 2. Prevent duplicate release
    if (paper.releaseStatus === "Released") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Question paper has already been released and cannot be re-released.",
        },
        { status: 400 }
      );
    }

    // 3. Status check (Must be Scheduled or Approved)
    if (paper.status !== "Scheduled" && paper.status !== "Approved") {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot release paper with status "${paper.status}". Must be Approved or Scheduled.`,
        },
        { status: 400 }
      );
    }

    // 4. Device ID validation against server-side AUTHORIZED_DEVICE_IDS
    if (!isDeviceAuthorized(deviceId)) {
      await recordSecurityEvent({
        type: "INVALID_DEVICE",
        severity: "HIGH",
        userId: session.userId,
        userName: session.name,
        resourceId: paper.id,
        description: `Device validation failed for device ID: "${deviceId}" during release attempt on paper "${paper.title}"`,
        req,
      });

      await logAudit({
        userId: session.userId,
        userName: session.name,
        role: session.role,
        action: "FAILED_DEVICE_VALIDATION",
        resourceType: "QuestionPaper",
        resourceId: paper.id,
        description: `Device validation failed: Unauthorized device ID "${deviceId}"`,
        req,
      });

      return NextResponse.json(
        {
          success: false,
          message: `Device validation failed. Device '${deviceId}' is not authorized for paper release.`,
        },
        { status: 403 }
      );
    }

    // 5. Exam timing validation: currentTime >= scheduled examTime
    const now = new Date();
    if (paper.examTime) {
      const scheduledTime = new Date(paper.examTime);
      if (now.getTime() < scheduledTime.getTime()) {
        await recordSecurityEvent({
          type: "EARLY_RELEASE_ATTEMPT",
          severity: "HIGH",
          userId: session.userId,
          userName: session.name,
          resourceId: paper.id,
          description: `Early release attempt at ${now.toISOString()} for exam scheduled at ${scheduledTime.toISOString()} ("${paper.title}")`,
          req,
        });

        await logAudit({
          userId: session.userId,
          userName: session.name,
          role: session.role,
          action: "FAILED_ACCESS",
          resourceType: "QuestionPaper",
          resourceId: paper.id,
          description: `Early release prevented. Scheduled for ${scheduledTime.toISOString()}`,
          req,
        });

        return NextResponse.json(
          {
            success: false,
            message: `Paper cannot be released before the scheduled exam time (${scheduledTime.toLocaleString()}).`,
          },
          { status: 403 }
        );
      }
    }

    // 6. Decrypt ciphertext using AES-256
    let decryptedContent = "";
    try {
      decryptedContent = decryptContent(paper.encryptedContent, paper.iv);
    } catch (decErr) {
      console.error("AES Decryption Error:", decErr);
      return NextResponse.json(
        {
          success: false,
          message: "Cryptographic decryption failed on secure storage node.",
        },
        { status: 500 }
      );
    }

    // 7. SHA-256 Integrity Verification
    const isIntegrityValid = verifyHash(decryptedContent, paper.contentHash);
    if (!isIntegrityValid) {
      await recordSecurityEvent({
        type: "INTEGRITY_FAILURE",
        severity: "CRITICAL",
        userId: session.userId,
        userName: session.name,
        resourceId: paper.id,
        description: `CRITICAL: SHA-256 Integrity check failed during release of paper "${paper.title}"`,
        req,
      });

      await logAudit({
        userId: session.userId,
        userName: session.name,
        role: session.role,
        action: "INTEGRITY_FAILURE",
        resourceType: "QuestionPaper",
        resourceId: paper.id,
        description: "INTEGRITY CHECK FAILED: SHA-256 mismatch detected.",
        req,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "INTEGRITY CHECK FAILED: Cryptographic hash mismatch. Paper release blocked.",
        },
        { status: 400 }
      );
    }

    // 8. Commit Release State in Prisma
    const updatedPaper = await prisma.questionPaper.update({
      where: { id: paperId },
      data: {
        status: "Released",
        releaseStatus: "Released",
        releasedAt: now,
        releasedById: session.userId,
        releasedToDevice: deviceId.trim().toUpperCase(),
      },
    });

    // 9. Audit Logging
    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: "RELEASE_PAPER",
      resourceType: "QuestionPaper",
      resourceId: paper.id,
      description: `Paper "${paper.title}" successfully released to authorized device ${updatedPaper.releasedToDevice} at ${now.toISOString()}`,
      req,
    });

    return NextResponse.json({
      success: true,
      message: "Question paper released and decrypted successfully.",
      data: {
        _id: updatedPaper.id,
        id: updatedPaper.id,
        title: updatedPaper.title,
        status: updatedPaper.status,
        releaseStatus: updatedPaper.releaseStatus,
        releasedAt: updatedPaper.releasedAt,
        releasedToDevice: updatedPaper.releasedToDevice,
        content: decryptedContent,
        contentHash: updatedPaper.contentHash,
        integrityVerified: true,
      },
    });
  } catch (error) {
    console.error("Release Paper Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred during paper release",
      },
      { status: 500 }
    );
  }
}
