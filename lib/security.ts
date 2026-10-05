import { NextRequest } from "next/server";
import prisma from "./prisma";
import { SecurityEventType, SecuritySeverity } from "@/types/audit";
import { getClientIp, getUserAgent } from "./audit";

interface SecurityEventParams {
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  userName?: string;
  description: string;
  resourceId?: string;
  req?: NextRequest;
}

/**
 * Validates a client device ID against server-configured AUTHORIZED_DEVICE_IDS.
 */
export function isDeviceAuthorized(deviceId: string): boolean {
  if (!deviceId || typeof deviceId !== "string") {
    return false;
  }

  const rawEnvDevices =
    process.env.AUTHORIZED_DEVICE_IDS ||
    "CENTER-001,CENTER-002,CENTER-003,EXAM-DESK-ALPHA,EXAM-DESK-BETA";
  const authorizedList = rawEnvDevices
    .split(",")
    .map((d) => d.trim().toUpperCase())
    .filter(Boolean);

  return authorizedList.includes(deviceId.trim().toUpperCase());
}

/**
 * Records a security violation or anomaly into the SecurityEvent collection.
 */
export async function recordSecurityEvent(
  params: SecurityEventParams
): Promise<void> {
  try {
    const ipAddress = getClientIp(params.req);
    const userAgent = getUserAgent(params.req);

    await prisma.securityEvent.create({
      data: {
        type: params.type,
        severity: params.severity,
        userId: params.userId || undefined,
        userName: params.userName || undefined,
        description: params.description,
        resourceId: params.resourceId,
        ipAddress,
        userAgent,
        timestamp: new Date(),
        resolved: false,
      },
    });
  } catch (error) {
    console.error("Failed to record security event:", error);
  }
}
