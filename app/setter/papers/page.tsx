"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FilePlus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PaperTable from "@/components/papers/PaperTable";
import Button from "@/components/ui/Button";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "@/components/ui/ToastProvider";

export default function SetterPapersPage() {
  const { error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPapers = useCallback(async () => {
    try {
      const res = await fetch("/api/papers");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load papers");
      }
    } catch {
      error("Network error fetching papers");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              My Authored Question Papers
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your drafted, submitted, and approved examination papers.
            </p>
          </div>
          <Link href="/setter/create">
            <Button
              variant="primary"
              size="sm"
              icon={<FilePlus className="w-4 h-4 text-sky-400" />}
            >
              Draft New Paper
            </Button>
          </Link>
        </div>

        <PaperTable
          papers={papers}
          loading={loading}
          onRefresh={fetchPapers}
          title="Author Paper Dossier"
          subtitle="Encrypted records in secure institutional storage"
        />
      </div>
    </AppShell>
  );
}
