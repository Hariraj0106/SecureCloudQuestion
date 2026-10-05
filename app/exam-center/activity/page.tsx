"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import ActivityLogView from "@/components/security/ActivityLogView";

export default function ExamCenterActivityPage() {
  return (
    <AppShell>
      <ActivityLogView
        title="Examination Center Terminal Activity"
        subtitle="Hardware device authentication attempts, time releases, and print logs"
      />
    </AppShell>
  );
}
