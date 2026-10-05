"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FilePlus } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import PaperTable from "@/components/papers/PaperTable";
import ReviewPaperModal from "@/components/papers/ReviewPaperModal";
import ScheduleExamModal from "@/components/papers/ScheduleExamModal";
import ReleasePaperModal from "@/components/papers/ReleasePaperModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import { IQuestionPaper } from "@/types/paper";
import { useAuth } from "@/components/ui/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";

export default function PapersListPage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [reviewPaperId, setReviewPaperId] = useState<string | null>(null);
  const [schedulePaper, setSchedulePaper] = useState<IQuestionPaper | null>(null);
  const [releasePaper, setReleasePaper] = useState<IQuestionPaper | null>(null);
  const [deletePaper, setDeletePaper] = useState<IQuestionPaper | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPapers = useCallback(async () => {
    try {
      const res = await fetch("/api/papers");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load examination papers");
      }
    } catch {
      error("Network error fetching question papers");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // Authority direct approve
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
      success(`Question paper "${paper.title}" approved successfully.`);
      fetchPapers();
    } catch {
      error("Network error during approval.");
    }
  };

  // Admin delete
  const handleConfirmDelete = async () => {
    if (!deletePaper) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/papers/${deletePaper._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to delete question paper.");
        return;
      }
      success(`Question paper "${deletePaper.title}" deleted.`);
      setDeletePaper(null);
      fetchPapers();
    } catch {
      error("Failed to delete paper.");
    } finally {
      setDeleting(false);
    }
  };

  const canCreate = user?.role === "Question Setter" || user?.role === "Admin";

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Institutional Question Papers Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Confidential examination papers governed by end-to-end cryptographic controls.
            </p>
          </div>

          {canCreate && (
            <Link href="/setter/create">
              <Button
                variant="primary"
                size="sm"
                icon={<FilePlus className="w-4 h-4 text-sky-400" />}
              >
                Create Secure Paper
              </Button>
            </Link>
          )}
        </div>

        <PaperTable
          papers={papers}
          loading={loading}
          onRefresh={fetchPapers}
          onOpenReview={(p) => setReviewPaperId(p._id)}
          onOpenApprove={handleApprove}
          onOpenSchedule={(p) => setSchedulePaper(p)}
          onOpenRelease={(p) => setReleasePaper(p)}
          onDeletePaper={(p) => setDeletePaper(p)}
          title="Question Papers Registry"
          subtitle="All lifecycle stages and release statuses"
        />

        {/* Modals */}
        <ReviewPaperModal
          paperId={reviewPaperId}
          isOpen={!!reviewPaperId}
          onClose={() => setReviewPaperId(null)}
          onSuccess={fetchPapers}
        />

        <ScheduleExamModal
          paper={schedulePaper}
          isOpen={!!schedulePaper}
          onClose={() => setSchedulePaper(null)}
          onSuccess={fetchPapers}
        />

        <ReleasePaperModal
          paper={releasePaper}
          isOpen={!!releasePaper}
          onClose={() => setReleasePaper(null)}
          onSuccess={fetchPapers}
        />

        <ConfirmDialog
          isOpen={!!deletePaper}
          onClose={() => setDeletePaper(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Question Paper"
          message={`Are you sure you want to permanently delete question paper "${deletePaper?.title}"?`}
          confirmText="Delete Paper"
          loading={deleting}
        />
      </div>
    </AppShell>
  );
}
