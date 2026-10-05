"use client";

import React from "react";
import AppShell from "@/components/layout/AppShell";
import CreatePaperForm from "@/components/papers/CreatePaperForm";

export default function PaperCreateRoute() {
  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        <CreatePaperForm />
      </div>
    </AppShell>
  );
}
