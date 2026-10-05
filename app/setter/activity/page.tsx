"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import ActivityLogView from "@/components/security/ActivityLogView";

export default function SetterActivityPage() {
  return (
    <AppShell>
      <ActivityLogView
        title="Question Setter Activity Stream"
        subtitle="Recent paper drafting and cryptographic submission operations"
      />
    </AppShell>
  );
}
