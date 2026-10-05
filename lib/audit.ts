import { NextRequest } from "next/server";
import prisma from "./prisma";
import { AuditAction } from "@/types/audit";

interface AuditLogParams {
  userId?: string;
  userName?: string;
  role?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  description: string;
  req?: NextRequest;
  ipAddress?: string;
  userAgent?: string;
}

export function getClientIp(req?: NextRequest): string {
  if (!req) return "127.0.0.1";
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export function getUserAgent(req?: NextRequest): string {
  if (!req) return "Internal / Server";
  return req.headers.get("user-agent") || "Unknown Client";
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const ipAddress = params.ipAddress || getClientIp(params.req);
    const userAgent = params.userAgent || getUserAgent(params.req);

    await prisma.auditLog.create({
      data: {
        userId: params.userId || undefined,
        userName: params.userName || undefined,
        role: params.role || undefined,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        description: params.description,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to write audit log entry:", error);
  }
}
