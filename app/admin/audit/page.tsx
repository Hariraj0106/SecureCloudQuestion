"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import ActivityLogView from "@/components/security/ActivityLogView";

export default function AdminAuditPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Institutional Audit Records & Surveillance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, non-repudiable audit logs tracking every cryptographic operation, authorization, and lifecycle transition.
          </p>
        </div>

        <ActivityLogView
          title="All System Operations & Audit Trail"
          subtitle="Real-time log stream"
        />
      </div>
    </AppShell>
  );
}
