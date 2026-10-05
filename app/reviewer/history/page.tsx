"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PaperTable from "@/components/papers/PaperTable";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "@/components/ui/ToastProvider";

export default function ReviewerHistoryPage() {
  const { error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/papers?filter=history");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load review history");
      }
    } catch {
      error("Network error fetching review history");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Reviewed Papers Archive
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical question papers evaluated by reviewer panel.
          </p>
        </div>

        <PaperTable
          papers={papers}
          loading={loading}
          onRefresh={fetchHistory}
          title="Evaluation Archive"
          subtitle="All completed paper reviews and rejection decisions"
        />
      </div>
    </AppShell>
  );
}
