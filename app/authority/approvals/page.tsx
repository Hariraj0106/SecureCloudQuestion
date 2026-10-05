"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PaperTable from "@/components/papers/PaperTable";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "@/components/ui/ToastProvider";

export default function AuthorityApprovalsPage() {
  const { success, error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch("/api/papers?filter=approvals");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load approval queue");
      }
    } catch {
      error("Network error fetching approval queue");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleApprove = async (paper: IQuestionPaper) => {
    try {
      const res = await fetch("/api/papers/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId: paper._id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to approve question paper.");
        return;
      }
      success(`Paper "${paper.title}" approved successfully.`);
      fetchApprovals();
    } catch {
      error("Network error during approval.");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Official Examination Approval Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Papers that have passed peer review awaiting official executive approval.
          </p>
        </div>

        <PaperTable
          papers={papers}
          loading={loading}
          onRefresh={fetchApprovals}
          onOpenApprove={handleApprove}
          title="Approval Queue"
          subtitle="Reviewer-verified papers ready for institutional sign-off"
        />
      </div>
    </AppShell>
  );
}
