import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/setter",
  "/reviewer",
  "/authority",
  "/exam-center",
  "/admin",
  "/papers",
  "/audit",
  "/security",
  "/activity",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sc_qpms_token")?.value;

  // Check if route is protected
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode JWT payload without crypto in middleware
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], "base64").toString("utf-8");
        const payload = JSON.parse(payloadJson);
        const role = payload.role;

        // Role-based route guard
        if (pathname.startsWith("/admin") && role !== "Admin") {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        if (pathname.startsWith("/setter") && role !== "Question Setter" && role !== "Admin") {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        if (pathname.startsWith("/reviewer") && role !== "Reviewer" && role !== "Admin") {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        if (
          pathname.startsWith("/authority") &&
          role !== "Examination Authority" &&
          role !== "Admin"
        ) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }

        if (
          pathname.startsWith("/exam-center") &&
          role !== "Examination Center" &&
          role !== "Admin"
        ) {
          return NextResponse.redirect(new URL("/unauthorized", request.url));
        }
      }
    } catch {
      // If token parsing fails, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // If already logged in and visiting /login, redirect to /dashboard
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/setter/:path*",
    "/reviewer/:path*",
    "/authority/:path*",
    "/exam-center/:path*",
    "/admin/:path*",
    "/papers/:path*",
    "/audit/:path*",
    "/security/:path*",
    "/activity/:path*",
    "/login",
  ],
};
