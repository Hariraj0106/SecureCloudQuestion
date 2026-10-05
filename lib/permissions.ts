import { UserRole } from "@/types/auth";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  "Question Setter": 1,
  Reviewer: 2,
  "Examination Authority": 3,
  "Examination Center": 3,
  Admin: 10,
};

export const ROLE_ROUTES: Record<UserRole, string> = {
  "Question Setter": "/setter",
  Reviewer: "/reviewer",
  "Examination Authority": "/authority",
  "Examination Center": "/exam-center",
  Admin: "/admin",
};

export function getDefaultDashboardRoute(role: UserRole): string {
  return ROLE_ROUTES[role] || "/dashboard";
}

export function hasRole(currentRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(currentRole);
}

export function canCreatePaper(role: UserRole): boolean {
  return role === "Question Setter" || role === "Admin";
}

export function canReviewPaper(role: UserRole): boolean {
  return role === "Reviewer" || role === "Admin";
}

export function canApprovePaper(role: UserRole): boolean {
  return role === "Examination Authority" || role === "Admin";
}

export function canSchedulePaper(role: UserRole): boolean {
  return role === "Examination Authority" || role === "Admin";
}

export function canReleasePaper(role: UserRole): boolean {
  return role === "Examination Center" || role === "Admin";
}

export function canManageUsers(role: UserRole): boolean {
  return role === "Admin";
}

export function canViewAuditLogs(role: UserRole): boolean {
  return role === "Admin";
}

export function canViewSecurityEvents(role: UserRole): boolean {
  return role === "Admin";
}

/**
 * Checks whether a given path is authorized for the given role.
 */
export function isRouteAuthorizedForRole(pathname: string, role: UserRole): boolean {
  if (role === "Admin") return true;

  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/setter") && role !== "Question Setter") return false;
  if (pathname.startsWith("/reviewer") && role !== "Reviewer") return false;
  if (pathname.startsWith("/authority") && role !== "Examination Authority") return false;
  if (pathname.startsWith("/exam-center") && role !== "Examination Center") return false;

  return true;
}
