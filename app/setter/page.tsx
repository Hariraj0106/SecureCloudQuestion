"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import SetterDashboard from "@/components/dashboard/SetterDashboard";

export default function SetterPage() {
  return (
    <AppShell>
      <SetterDashboard />
    </AppShell>
  );
}
