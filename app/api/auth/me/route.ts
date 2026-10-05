import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "User account inactive or removed" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: user.id,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Auth Me API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
