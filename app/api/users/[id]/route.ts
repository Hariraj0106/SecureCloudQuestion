import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { updateUserSchema } from "@/lib/validations";
import { logAudit } from "@/lib/audit";
import { AuditAction } from "@/types/audit";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    const { id } = await params;

    if (!session || session.role !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Administrative privilege required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = updateUserSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parseResult.error.errors[0]?.message || "Invalid update data",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const { name, role, isActive, password } = parseResult.data;

    let auditAction: AuditAction = "UPDATE_USER";
    let desc = `Updated user ${user.email}`;

    const updateData: Record<string, unknown> = {};

    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
      auditAction = isActive ? "ACTIVATE_USER" : "DEACTIVATE_USER";
      desc = `${isActive ? "Activated" : "Deactivated"} user account for ${user.email}`;
    }
    if (password) {
      updateData.password = await hashPassword(password);
      auditAction = "RESET_PASSWORD";
      desc = `Reset password for user ${user.email}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: auditAction,
      resourceType: "User",
      resourceId: user.id,
      description: desc,
      req,
    });

    return NextResponse.json({
      success: true,
      message: "User account updated successfully",
      data: {
        _id: updatedUser.id,
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error("Update User Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    const { id } = await params;

    if (!session || session.role !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Administrative privilege required" },
        { status: 403 }
      );
    }

    if (session.userId === id) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete your own administrative account",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.delete({
      where: { id },
    });

    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: "DEACTIVATE_USER",
      resourceType: "User",
      resourceId: id,
      description: `Permanently removed user account: ${user.email}`,
      req,
    });

    return NextResponse.json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user account" },
      { status: 500 }
    );
  }
}
