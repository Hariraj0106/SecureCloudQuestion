"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PaperTable from "@/components/papers/PaperTable";
import ReviewPaperModal from "@/components/papers/ReviewPaperModal";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "@/components/ui/ToastProvider";

export default function ReviewQueuePage() {
  const { error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/papers?filter=queue");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load review queue");
      }
    } catch {
      error("Network error fetching review queue");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Pending Examination Review Queue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Papers submitted by Question Setters requiring formal peer review and syllabus verification.
          </p>
        </div>

        <PaperTable
          papers={papers}
          loading={loading}
          onRefresh={fetchQueue}
          onOpenReview={(p) => setSelectedPaperId(p._id)}
          title="Review Queue"
          subtitle="Click Review to decrypt and verify question paper contents"
        />

        <ReviewPaperModal
          paperId={selectedPaperId}
          isOpen={!!selectedPaperId}
          onClose={() => setSelectedPaperId(null)}
          onSuccess={fetchQueue}
        />
      </div>
    </AppShell>
  );
}
