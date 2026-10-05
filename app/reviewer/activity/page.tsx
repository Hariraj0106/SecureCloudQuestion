"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import ActivityLogView from "@/components/security/ActivityLogView";

export default function ReviewerActivityPage() {
  return (
    <AppShell>
      <ActivityLogView
        title="Reviewer Evaluation Trail"
        subtitle="Chronological log of question paper decrypts, peer reviews, and approvals"
      />
    </AppShell>
  );
}
