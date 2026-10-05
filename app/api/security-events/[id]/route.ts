import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

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
    const resolved = typeof body.resolved === "boolean" ? body.resolved : true;

    const event = await prisma.securityEvent.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, message: "Security event not found" },
        { status: 404 }
      );
    }

    const updatedEvent = await prisma.securityEvent.update({
      where: { id },
      data: {
        resolved,
        resolvedBy: resolved ? session.userId : null,
        resolvedAt: resolved ? new Date() : null,
      },
    });

    await logAudit({
      userId: session.userId,
      userName: session.name,
      role: session.role,
      action: "UPDATE_USER",
      resourceType: "SecurityEvent",
      resourceId: id,
      description: `Admin ${session.name} marked security event [${
        event.type
      }] as ${resolved ? "RESOLVED" : "UNRESOLVED"}`,
      req,
    });

    return NextResponse.json({
      success: true,
      message: `Security event marked as ${
        resolved ? "resolved" : "unresolved"
      }`,
      data: {
        ...updatedEvent,
        _id: updatedEvent.id,
      },
    });
  } catch (error) {
    console.error("Update Security Event Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update security event status" },
      { status: 500 }
    );
  }
}
