"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import AuthorityDashboard from "@/components/dashboard/AuthorityDashboard";

export default function AuthorityPage() {
  return (
    <AppShell>
      <AuthorityDashboard />
    </AppShell>
  );
}
