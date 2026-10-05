"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckSquare, Calendar, ShieldCheck, Clock, XCircle } from "lucide-react";
import StatCard from "./StatCard";
import PaperTable from "../papers/PaperTable";
import ScheduleExamModal from "../papers/ScheduleExamModal";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "../ui/ToastProvider";

export const AuthorityDashboard: React.FC = () => {
  const { success, error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [schedulePaper, setSchedulePaper] = useState<IQuestionPaper | null>(null);
  const [rejectPaper, setRejectPaper] = useState<IQuestionPaper | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchPapers = useCallback(async () => {
    try {
      const res = await fetch("/api/papers");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load examination board records");
      }
    } catch {
      error("Network error fetching examination papers");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // Direct approve action
  const handleApprovePaper = async (paper: IQuestionPaper) => {
    setSubmittingAction(true);
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

      success(`Question paper "${paper.title}" officially approved. Ready for examination scheduling.`);
      fetchPapers();
    } catch (err) {
      console.error("Approve error:", err);
      error("Network error during paper approval.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Rejection submit
  const handleConfirmReject = async () => {
    if (!rejectPaper) return;
    if (!rejectionReason.trim()) {
      error("Rejection rationale is required.");
      return;
    }

    setSubmittingAction(true);
    try {
      const res = await fetch("/api/papers/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: rejectPaper._id,
          reason: rejectionReason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to reject question paper.");
        return;
      }

      success(`Paper "${rejectPaper.title}" rejected and returned.`);
      setRejectPaper(null);
      setRejectionReason("");
      fetchPapers();
    } catch (err) {
      console.error("Reject error:", err);
      error("Network error during paper rejection.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Statistics
  const pendingApprovals = papers.filter((p) => p.status === "Reviewed");
  const approvedPapers = papers.filter((p) => p.status === "Approved");
  const scheduledExams = papers.filter((p) => p.status === "Scheduled");
  const releasedPapers = papers.filter((p) => p.status === "Released");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">
          Examination Authority Board
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Final executive approval and centralized examination scheduling with hardware release-lock enforcement.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Awaiting Approval"
          value={pendingApprovals.length}
          subtitle="Reviewed papers awaiting sign-off"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Approved (Unscheduled)"
          value={approvedPapers.length}
          subtitle="Ready to set exam date & time"
          icon={<ShieldCheck className="w-5 h-5" />}
          variant="sky"
        />
        <StatCard
          title="Scheduled Exams"
          value={scheduledExams.length}
          subtitle="Locked until exam start time"
          icon={<Calendar className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="Released Exams"
          value={releasedPapers.length}
          subtitle="Delivered to centers"
          icon={<CheckSquare className="w-5 h-5" />}
          variant="emerald"
        />
      </div>

      {/* Main Papers Table */}
      <PaperTable
        papers={papers}
        loading={loading}
        onRefresh={fetchPapers}
        onOpenApprove={handleApprovePaper}
        onOpenSchedule={(p) => setSchedulePaper(p)}
        title="Institutional Examination Papers"
        subtitle="Manage end-to-end approvals and date-time scheduling"
      />

      {/* Schedule Modal */}
      <ScheduleExamModal
        paper={schedulePaper}
        isOpen={!!schedulePaper}
        onClose={() => setSchedulePaper(null)}
        onSuccess={fetchPapers}
      />

      {/* Rejection Modal */}
      <Modal
        isOpen={!!rejectPaper}
        onClose={() => setRejectPaper(null)}
        title={`Reject: ${rejectPaper?.title}`}
        subtitle="Specify official reason for rejecting this paper back to author"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <Textarea
            label="Rejection Reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            placeholder="State policy non-compliance, duplicate questions, or scheduling cancellation..."
            required
          />

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectPaper(null)}
              disabled={submittingAction}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReject}
              loading={submittingAction}
              icon={<XCircle className="w-4 h-4" />}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AuthorityDashboard;
