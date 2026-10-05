"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import ReviewerDashboard from "@/components/dashboard/ReviewerDashboard";

export default function ReviewerPage() {
  return (
    <AppShell>
      <ReviewerDashboard />
    </AppShell>
  );
}
