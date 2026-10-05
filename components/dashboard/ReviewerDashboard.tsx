"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckSquare, Clock, FileCheck2, XCircle, ShieldCheck } from "lucide-react";
import StatCard from "./StatCard";
import PaperTable from "../papers/PaperTable";
import ReviewPaperModal from "../papers/ReviewPaperModal";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "../ui/ToastProvider";

export const ReviewerDashboard: React.FC = () => {
  const { error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewPaperId, setReviewPaperId] = useState<string | null>(null);

  const fetchPapers = useCallback(async () => {
    try {
      const res = await fetch("/api/papers");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load reviewer queue");
      }
    } catch {
      error("Network error fetching review queue");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // Statistics
  const pendingReview = papers.filter((p) => p.status === "Created");
  const reviewed = papers.filter((p) => p.status === "Reviewed" || p.status === "Approved" || p.status === "Scheduled" || p.status === "Released");
  const rejected = papers.filter((p) => p.status === "Rejected");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Reviewer Evaluation Center
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Perform authorized cryptographic review, syllabus compliance evaluation, and quality assurance before final authority approval.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Pending Review Queue"
          value={pendingReview.length}
          subtitle="Awaiting peer inspection"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Reviews Completed"
          value={reviewed.length}
          subtitle="Verified & forwarded to authority"
          icon={<FileCheck2 className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          title="Papers Rejected"
          value={rejected.length}
          subtitle="Returned for revision"
          icon={<XCircle className="w-5 h-5" />}
          variant="rose"
        />
      </div>

      {/* Review Queue Table */}
      <PaperTable
        papers={papers}
        loading={loading}
        onRefresh={fetchPapers}
        onOpenReview={(p) => setReviewPaperId(p._id)}
        title="Examination Paper Queue"
        subtitle="Select a paper to decrypt, evaluate syllabus coverage, and submit review decision"
      />

      {/* Review Modal */}
      <ReviewPaperModal
        paperId={reviewPaperId}
        isOpen={!!reviewPaperId}
        onClose={() => setReviewPaperId(null)}
        onSuccess={fetchPapers}
      />
    </div>
  );
};

export default ReviewerDashboard;
