"use client";

import React, { useEffect, useState, useCallback } from "react";
import AppShell from "@/components/layout/AppShell";
import PaperTable from "@/components/papers/PaperTable";
import ReleasePaperModal from "@/components/papers/ReleasePaperModal";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "@/components/ui/ToastProvider";

export default function CenterReleaseQueuePage() {
  const { error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasePaper, setReleasePaper] = useState<IQuestionPaper | null>(null);

  const fetchReleaseQueue = useCallback(async () => {
    try {
      const res = await fetch("/api/papers?filter=release");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load release queue");
      }
    } catch {
      error("Network error fetching release queue");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchReleaseQueue();
  }, [fetchReleaseQueue]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Controlled Paper Release Terminal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Papers scheduled or approved for distribution. Release is cryptographically unlocked only on authorized hardware devices at the designated exam time.
          </p>
        </div>

        <PaperTable
          papers={papers}
          loading={loading}
          onRefresh={fetchReleaseQueue}
          onOpenRelease={(p) => setReleasePaper(p)}
          title="Release Queue"
          subtitle="Select paper to authenticate terminal device and trigger decryption"
        />

        <ReleasePaperModal
          paper={releasePaper}
          isOpen={!!releasePaper}
          onClose={() => setReleasePaper(null)}
          onSuccess={fetchReleaseQueue}
        />
      </div>
    </AppShell>
  );
}
