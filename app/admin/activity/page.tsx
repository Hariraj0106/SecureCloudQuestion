"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import ActivityLogView from "@/components/security/ActivityLogView";

export default function AdminActivityPage() {
  return (
    <AppShell>
      <ActivityLogView
        title="Institutional System-Wide Activity"
        subtitle="Global audit trail across all users, administrative commands, and cryptographic operations"
      />
    </AppShell>
  );
}
