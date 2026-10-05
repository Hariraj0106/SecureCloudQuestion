import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { recordSecurityEvent } from "@/lib/security";
import { UserRole } from "@/types/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.errors[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      await recordSecurityEvent({
        type: "FAILED_LOGIN",
        severity: "LOW",
        description: `Failed login attempt for non-existent email: ${email}`,
        req,
      });

      return NextResponse.json(
        { success: false, message: "Invalid institutional credentials" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      await recordSecurityEvent({
        type: "UNAUTHORIZED_ACCESS",
        severity: "MEDIUM",
        userId: user.id,
        userName: user.name,
        description: `Login attempt on deactivated account: ${email}`,
        req,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Account has been deactivated. Please contact your system administrator.",
        },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      await recordSecurityEvent({
        type: "FAILED_LOGIN",
        severity: "MEDIUM",
        userId: user.id,
        userName: user.name,
        description: `Incorrect password entered for account: ${email}`,
        req,
      });

      await logAudit({
        userId: user.id,
        userName: user.name,
        role: user.role,
        action: "FAILED_LOGIN",
        description: `Failed authentication for ${email}`,
        req,
      });

      return NextResponse.json(
        { success: false, message: "Invalid institutional credentials" },
        { status: 401 }
      );
    }

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create JWT Token
    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set secure HTTP-only cookie
    setAuthCookie(response, token);

    // Audit log
    await logAudit({
      userId: user.id,
      userName: user.name,
      role: user.role,
      action: "LOGIN",
      description: `Institutional user ${user.name} (${user.role}) logged in successfully`,
      req,
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication service unavailable" },
      { status: 500 }
    );
  }
}
