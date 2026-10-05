"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import ActivityLogView from "@/components/security/ActivityLogView";

export default function AuthorityActivityPage() {
  return (
    <AppShell>
      <ActivityLogView
        title="Examination Authority Activity Log"
        subtitle="Historical approvals, examination scheduling, and institutional policy executions"
      />
    </AppShell>
  );
}
