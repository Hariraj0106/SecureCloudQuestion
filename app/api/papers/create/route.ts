import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { canCreatePaper } from "@/lib/permissions";
import { createPaperSchema } from "@/lib/validations";
import { encryptContent } from "@/lib/encryption";
import { generateHash } from "@/lib/hashing";
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

    if (!canCreatePaper(session.role)) {
      await recordSecurityEvent({
        type: "UNAUTHORIZED_ACCESS",
        severity: "MEDIUM",
        userId: session.userId,
        userName: session.name,
        description: `Unauthorized attempt to create paper by user with role: ${session.role}`,
        req,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            "Access denied. Only Question Setters or Administrators can create papers.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = createPaperSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parseResult.error.errors[0]?.message || "Invalid question paper data",
        },
        { status: 400 }
      );
    }

    const {
      title,
      content,
      subject,
      course,
      semester,
      department,
      examDate,
      examTime,
    } = parseResult.data;

    // 1. AES-256 Encryption
    const { encryptedContent, iv } = encryptContent(content);

    // 2. SHA-256 Integrity Hash
    const contentHash = generateHash(content);

    // 3. Create Record in Prisma Database
    const newPaper = await prisma.questionPaper.create({
      data: {
        title,
        subject,
        course,
        semester,
        department,
        encryptedContent,
        iv,
        contentHash,
        status: "Created",
        releaseStatus: "Locked",
        examDate: examDate || undefined,
        examTime: examTime ? new Date(examTime) : undefined,
        createdById: session.userId,
      },
    });

    // 4. Audit Log
    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: "CREATE_PAPER",
      resourceType: "QuestionPaper",
      resourceId: newPaper.id,
      description: `Created new secure question paper: "${title}" (SHA-256: ${contentHash.substring(0, 12)}...)`,
      req,
    });

    return NextResponse.json({
      success: true,
      message: "Question paper encrypted and created successfully",
      data: {
        _id: newPaper.id,
        id: newPaper.id,
        title: newPaper.title,
        status: newPaper.status,
        releaseStatus: newPaper.releaseStatus,
        contentHash: newPaper.contentHash,
        createdAt: newPaper.createdAt,
      },
    });
  } catch (error) {
    console.error("Create Paper Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create secure question paper" },
      { status: 500 }
    );
  }
}
