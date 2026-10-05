import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);

    if (session) {
      await logAudit({
        userId: session.userId,
        userName: session.name,
        role: session.role,
        action: "LOGOUT",
        description: `User ${session.name} logged out`,
        req,
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    clearAuthCookie(response);
    return response;
  } catch (error) {
    console.error("Logout API Error:", error);
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
    clearAuthCookie(response);
    return response;
  }
}
