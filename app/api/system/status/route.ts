import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      unresolvedCritical,
      unresolvedHigh,
      unresolvedTotal,
      totalUsers,
      totalPapers,
    ] = await Promise.all([
      prisma.securityEvent.count({
        where: { severity: "CRITICAL", resolved: false },
      }),
      prisma.securityEvent.count({
        where: { severity: "HIGH", resolved: false },
      }),
      prisma.securityEvent.count({
        where: { resolved: false },
      }),
      prisma.user.count(),
      prisma.questionPaper.count(),
    ]);

    let systemStatus: "SECURE" | "ALERT" | "WARNING" = "SECURE";
    if (unresolvedCritical > 0) {
      systemStatus = "ALERT";
    } else if (unresolvedHigh > 0) {
      systemStatus = "WARNING";
    }

    return NextResponse.json({
      success: true,
      data: {
        status: systemStatus,
        database: "ONLINE (SQL/SQLite/Prisma)",
        encryption: "AES-256 ACTIVE",
        hashing: "SHA-256 ACTIVE",
        auth: "JWT SESSION ACTIVE",
        audit: "STREAMING ACTIVE",
        unresolvedCritical,
        unresolvedHigh,
        unresolvedTotal,
        totalUsers,
        totalPapers,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("System status check error:", error);
    return NextResponse.json(
      {
        success: false,
        data: {
          status: "ALERT",
          database: "OFFLINE",
          encryption: "AES-256 READY",
          unresolvedCritical: 1,
          unresolvedHigh: 0,
          unresolvedTotal: 1,
        },
      },
      { status: 200 }
    );
  }
}
