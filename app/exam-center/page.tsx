"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import ExamCenterDashboard from "@/components/dashboard/ExamCenterDashboard";

export default function ExamCenterPage() {
  return (
    <AppShell>
      <ExamCenterDashboard />
    </AppShell>
  );
}
