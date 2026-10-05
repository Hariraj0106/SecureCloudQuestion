import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);

    if (!session || session.role !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Administrative privilege required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);

    const severity = searchParams.get("severity");
    const status = searchParams.get("status"); // "unresolved", "resolved", "ALL"
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (severity && severity !== "ALL") {
      where.severity = severity;
    }

    if (status === "unresolved") {
      where.resolved = false;
    } else if (status === "resolved") {
      where.resolved = true;
    }

    if (search) {
      where.OR = [
        { description: { contains: search } },
        { type: { contains: search } },
        { userName: { contains: search } },
        { ipAddress: { contains: search } },
      ];
    }

    const [rawEvents, criticalCount, highCount, unresolvedCount, totalCount] =
      await Promise.all([
        prisma.securityEvent.findMany({
          where,
          orderBy: { timestamp: "desc" },
          take: 100,
        }),
        prisma.securityEvent.count({
          where: { severity: "CRITICAL", resolved: false },
        }),
        prisma.securityEvent.count({
          where: { severity: "HIGH", resolved: false },
        }),
        prisma.securityEvent.count({
          where: { resolved: false },
        }),
        prisma.securityEvent.count(),
      ]);

    const events = rawEvents.map(
      (e: { id: string; [key: string]: unknown }) => ({
        ...e,
        _id: e.id,
      })
    );

    return NextResponse.json({
      success: true,
      data: events,
      stats: {
        criticalCount,
        highCount,
        unresolvedCount,
        totalCount,
      },
    });
  } catch (error) {
    console.error("Fetch Security Events Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch security events" },
      { status: 500 }
    );
  }
}
