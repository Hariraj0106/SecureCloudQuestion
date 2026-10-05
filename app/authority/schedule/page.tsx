"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PaperTable from "@/components/papers/PaperTable";
import ScheduleExamModal from "@/components/papers/ScheduleExamModal";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "@/components/ui/ToastProvider";

export default function AuthoritySchedulePage() {
  const { error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulePaper, setSchedulePaper] = useState<IQuestionPaper | null>(null);

  const fetchSchedulePapers = useCallback(async () => {
    try {
      const res = await fetch("/api/papers?filter=schedule");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load scheduling papers");
      }
    } catch {
      error("Network error fetching papers for scheduling");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchSchedulePapers();
  }, [fetchSchedulePapers]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Examination Scheduling Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign official examination dates and start times to approved papers to activate the automated release lock.
          </p>
        </div>

        <PaperTable
          papers={papers}
          loading={loading}
          onRefresh={fetchSchedulePapers}
          onOpenSchedule={(p) => setSchedulePaper(p)}
          title="Approved Papers for Scheduling"
          subtitle="Configure exam dates, start times, and automated hardware lock timestamps"
        />

        <ScheduleExamModal
          paper={schedulePaper}
          isOpen={!!schedulePaper}
          onClose={() => setSchedulePaper(null)}
          onSuccess={fetchSchedulePapers}
        />
      </div>
    </AppShell>
  );
}
