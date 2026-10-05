import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { createUserSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { recordSecurityEvent } from "@/lib/security";

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
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (role && role !== "ALL") {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const rawUsers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const users = rawUsers.map((u) => ({
      ...u,
      _id: u.id,
    }));

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch user directory" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);

    if (!session || session.role !== "Admin") {
      await recordSecurityEvent({
        type: "UNAUTHORIZED_ACCESS",
        severity: "HIGH",
        userId: session?.userId,
        userName: session?.name,
        description: `Unauthorized attempt to create user by role: ${session?.role}`,
        req,
      });

      return NextResponse.json(
        { success: false, message: "Administrative privilege required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = createUserSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parseResult.error.errors[0]?.message || "Invalid user creation data",
        },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parseResult.data;

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this institutional email already exists.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        isActive: true,
      },
    });

    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: "CREATE_USER",
      resourceType: "User",
      resourceId: newUser.id,
      description: `Created new user account: ${name} (${email}) with role [${role}]`,
      req,
    });

    return NextResponse.json({
      success: true,
      message: `User ${name} created successfully as ${role}.`,
      data: {
        _id: newUser.id,
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Create User Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create user account" },
      { status: 500 }
    );
  }
}
