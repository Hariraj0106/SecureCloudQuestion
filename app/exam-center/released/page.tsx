"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PaperTable from "@/components/papers/PaperTable";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "@/components/ui/ToastProvider";

export default function ReleasedPapersArchivePage() {
  const { error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReleasedPapers = useCallback(async () => {
    try {
      const res = await fetch("/api/papers?filter=released");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load released papers archive");
      }
    } catch {
      error("Network error fetching released papers");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchReleasedPapers();
  }, [fetchReleasedPapers]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Released Papers Archive
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical question papers previously decrypted and printed for examination centers.
          </p>
        </div>

        <PaperTable
          papers={papers}
          loading={loading}
          onRefresh={fetchReleasedPapers}
          title="Archive of Released Papers"
          subtitle="All officially printed examination papers"
        />
      </div>
    </AppShell>
  );
}
