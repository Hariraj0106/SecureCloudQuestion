import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const filter = searchParams.get("filter") || ""; // e.g. "today", "ready", "queue", "approvals"

    // Base Prisma query
    const where: Record<string, unknown> = {};

    if (session.role === "Question Setter") {
      where.createdById = session.userId;
    } else if (session.role === "Reviewer") {
      if (filter === "queue") {
        where.status = "Created";
      } else if (filter === "history") {
        where.status = { in: ["Reviewed", "Rejected"] };
      }
    } else if (session.role === "Examination Authority") {
      if (filter === "approvals") {
        where.status = "Reviewed";
      } else if (filter === "schedule") {
        where.status = "Approved";
      }
    } else if (session.role === "Examination Center") {
      where.status = { in: ["Scheduled", "Released", "Approved"] };

      if (filter === "today") {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        where.examTime = { gte: todayStart, lte: todayEnd };
      } else if (filter === "released") {
        where.releaseStatus = "Released";
      } else if (filter === "release") {
        where.releaseStatus = { in: ["Locked", "Ready"] };
      }
    }

    // Explicit status filter
    if (status && status !== "ALL") {
      where.status = status;
    }

    // Title / subject search
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { subject: { contains: search } },
        { department: { contains: search } },
        { course: { contains: search } },
      ];
    }

    const rawPapers = await prisma.questionPaper.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        reviewedBy: { select: { id: true, name: true, email: true } },
        approvedBy: { select: { id: true, name: true, email: true } },
        scheduledBy: { select: { id: true, name: true, email: true } },
        releasedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Normalize _id for frontend compatibility
    const papers = rawPapers.map(
      (p: { id: string; [key: string]: unknown }) => ({
        ...p,
        _id: p.id,
        encryptedContent: undefined,
        iv: undefined,
      })
    );

    return NextResponse.json({
      success: true,
      data: papers,
    });
  } catch (error) {
    console.error("Fetch Papers Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve examination papers" },
      { status: 500 }
    );
  }
}
