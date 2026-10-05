export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE_PAPER"
  | "VIEW_PAPER"
  | "SUBMIT_REVIEW"
  | "APPROVE_PAPER"
  | "REJECT_PAPER"
  | "SCHEDULE_PAPER"
  | "RELEASE_PAPER"
  | "CREATE_USER"
  | "UPDATE_USER"
  | "DEACTIVATE_USER"
  | "ACTIVATE_USER"
  | "RESET_PASSWORD"
  | "FAILED_LOGIN"
  | "FAILED_ACCESS"
  | "FAILED_DEVICE_VALIDATION"
  | "INTEGRITY_FAILURE";

export interface IAuditLog {
  _id: string;
  userId?: string;
  userName?: string;
  role?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string | Date;
}

export type SecurityEventType =
  | "UNAUTHORIZED_ACCESS"
  | "INVALID_DEVICE"
  | "INTEGRITY_FAILURE"
  | "EARLY_RELEASE_ATTEMPT"
  | "INVALID_SESSION"
  | "FAILED_LOGIN"
  | "SUSPICIOUS_ACTIVITY";

export type SecuritySeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ISecurityEvent {
  _id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  userName?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  resourceId?: string;
  timestamp: string | Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string | Date;
}
