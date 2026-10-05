"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import ActivityLogView from "@/components/security/ActivityLogView";

export default function GeneralActivityPage() {
  return (
    <AppShell>
      <ActivityLogView
        title="Institutional Activity Trail"
        subtitle="Chronological audit records of all examination lifecycle actions"
      />
    </AppShell>
  );
}
