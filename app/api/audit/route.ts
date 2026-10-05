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

    const action = searchParams.get("action");
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const resourceId = searchParams.get("resourceId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // If non-admin, only show their own activity
    if (session.role !== "Admin") {
      where.userId = session.userId;
    } else {
      if (role && role !== "ALL") where.role = role;
      if (resourceId) where.resourceId = resourceId;
    }

    if (action && action !== "ALL") {
      where.action = action;
    }

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { userName: { contains: search } },
        { ipAddress: { contains: search } },
      ];
    }

    const [rawLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    const logs = rawLogs.map((l: { id: string; [key: string]: unknown }) => ({
      ...l,
      _id: l.id,
    }));

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch Audit Logs Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch audit records" },
      { status: 500 }
    );
  }
}
