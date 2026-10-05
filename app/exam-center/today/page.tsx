"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PaperTable from "@/components/papers/PaperTable";
import ReleasePaperModal from "@/components/papers/ReleasePaperModal";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "@/components/ui/ToastProvider";

export default function TodayExamsPage() {
  const { error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasePaper, setReleasePaper] = useState<IQuestionPaper | null>(null);

  const fetchTodayPapers = useCallback(async () => {
    try {
      const res = await fetch("/api/papers?filter=today");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load today's examination schedule");
      }
    } catch {
      error("Network error fetching today's examinations");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchTodayPapers();
  }, [fetchTodayPapers]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Today&apos;s Examination Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Papers scheduled for distribution today. Releases require terminal device authentication and start-time clearance.
          </p>
        </div>

        <PaperTable
          papers={papers}
          loading={loading}
          onRefresh={fetchTodayPapers}
          onOpenRelease={(p) => setReleasePaper(p)}
          title="Scheduled Examinations (Today)"
          subtitle="Real-time terminal release queue"
        />

        <ReleasePaperModal
          paper={releasePaper}
          isOpen={!!releasePaper}
          onClose={() => setReleasePaper(null)}
          onSuccess={fetchTodayPapers}
        />
      </div>
    </AppShell>
  );
}
