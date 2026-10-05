import React from "react";
import Badge from "./Badge";
import { PaperStatus, ReleaseStatus } from "@/types/paper";
import { SecuritySeverity } from "@/types/audit";
import { UserRole } from "@/types/auth";

export const PaperStatusBadge: React.FC<{ status: PaperStatus }> = ({ status }) => {
  switch (status) {
    case "Created":
      return (
        <Badge variant="slate" dot>
          Created
        </Badge>
      );
    case "Reviewed":
      return (
        <Badge variant="indigo" dot>
          Reviewed
        </Badge>
      );
    case "Approved":
      return (
        <Badge variant="sky" dot>
          Approved
        </Badge>
      );
    case "Scheduled":
      return (
        <Badge variant="purple" dot>
          Scheduled
        </Badge>
      );
    case "Released":
      return (
        <Badge variant="emerald" dot>
          Released
        </Badge>
      );
    case "Rejected":
      return (
        <Badge variant="rose" dot>
          Rejected
        </Badge>
      );
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};

export const ReleaseStatusBadge: React.FC<{ status: ReleaseStatus }> = ({ status }) => {
  switch (status) {
    case "Locked":
      return (
        <Badge variant="slate" dot>
          Locked
        </Badge>
      );
    case "Ready":
      return (
        <Badge variant="amber" dot>
          Ready
        </Badge>
      );
    case "Released":
      return (
        <Badge variant="emerald" dot>
          Released
        </Badge>
      );
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};

export const SeverityBadge: React.FC<{ severity: SecuritySeverity }> = ({ severity }) => {
  switch (severity) {
    case "CRITICAL":
      return (
        <Badge variant="rose" dot size="md">
          CRITICAL
        </Badge>
      );
    case "HIGH":
      return (
        <Badge variant="rose" dot>
          HIGH
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge variant="amber" dot>
          MEDIUM
        </Badge>
      );
    case "LOW":
      return (
        <Badge variant="slate" dot>
          LOW
        </Badge>
      );
    default:
      return <Badge variant="slate">{severity}</Badge>;
  }
};

export const RoleBadge: React.FC<{ role: UserRole | string }> = ({ role }) => {
  switch (role) {
    case "Admin":
      return (
        <Badge variant="purple" size="sm">
          Admin
        </Badge>
      );
    case "Question Setter":
      return (
        <Badge variant="indigo" size="sm">
          Question Setter
        </Badge>
      );
    case "Reviewer":
      return (
        <Badge variant="sky" size="sm">
          Reviewer
        </Badge>
      );
    case "Examination Authority":
      return (
        <Badge variant="emerald" size="sm">
          Authority
        </Badge>
      );
    case "Examination Center":
      return (
        <Badge variant="amber" size="sm">
          Exam Center
        </Badge>
      );
    default:
      return <Badge variant="slate">{role}</Badge>;
  }
};
