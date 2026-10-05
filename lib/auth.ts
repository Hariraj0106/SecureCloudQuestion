import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { JWTPayload, UserRole } from "@/types/auth";

export const COOKIE_NAME = "sc_qpms_token";
const JWT_SECRET = process.env.JWT_SECRET || "sc_qpms_default_jwt_secret_change_in_prod";
const TOKEN_EXPIRY = "8h";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function setAuthCookie(response: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60, // 8 hours in seconds
  });
}

export function clearAuthCookie(response: NextResponse): void {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Extracts and verifies session token from NextRequest or next/headers cookies.
 */
export async function getSessionUser(req?: NextRequest): Promise<JWTPayload | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      // Also support Authorization: Bearer token for programmatic API access
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // In case called outside request context
      token = undefined;
    }
  }

  if (!token) return null;
  return verifyToken(token);
}
