"use client";

import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Textarea from "../ui/Textarea";
import { IQuestionPaper, getUserDisplayName } from "@/types/paper";
import { useToast } from "../ui/ToastProvider";
import { ShieldCheck, XCircle, CheckCircle2, Lock } from "lucide-react";
import LoadingSpinner from "../ui/LoadingSpinner";

interface ReviewPaperModalProps {
  paperId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewPaperModal: React.FC<ReviewPaperModalProps> = ({
  paperId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paper, setPaper] = useState<IQuestionPaper | null>(null);
  const [comments, setComments] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    if (paperId && isOpen) {
      setLoading(true);
      fetch(`/api/papers/${paperId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setPaper(json.data);
            setComments(json.data.reviewComments || "");
          } else {
            error(json.message || "Failed to load paper details for review");
          }
        })
        .catch(() => error("Failed to load paper details"))
        .finally(() => setLoading(false));
    } else {
      setPaper(null);
      setComments("");
      setRejectionReason("");
      setActionType(null);
    }
  }, [paperId, isOpen, error]);

  const handleReviewSubmit = async (status: "Reviewed" | "Rejected") => {
    if (!paperId) return;

    if (status === "Rejected" && !rejectionReason.trim()) {
      error("Rejection reason is required when rejecting a question paper.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/papers/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId,
          status,
          comments,
          rejectionReason: status === "Rejected" ? rejectionReason : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to submit review decision.");
        return;
      }

      success(
        status === "Reviewed"
          ? "Paper review submitted successfully and forwarded to Examination Authority."
          : "Question paper rejected and returned to Question Setter."
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Review submit error:", err);
      error("Network error occurred while submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={paper ? `Review: ${paper.title}` : "Review Question Paper"}
      subtitle="Authorized peer evaluation and cryptographic integrity inspection"
      maxWidth="3xl"
    >
      {loading ? (
        <LoadingSpinner label="Decrypting and verifying question paper..." />
      ) : paper ? (
        <div className="space-y-5 text-xs">
          {/* Metadata & Integrity Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Subject
              </span>
              <span className="font-semibold text-slate-800">
                {paper.subject || "General"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Course Code
              </span>
              <span className="font-semibold text-slate-800">
                {paper.course || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Setter
              </span>
              <span className="font-semibold text-slate-800">
                {getUserDisplayName(paper.createdBy, "Setter")}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                SHA-256 Integrity
              </span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Valid
              </span>
            </div>
          </div>

          {/* Decrypted Content Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Decrypted Examination Content
            </label>
            <div className="p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs whitespace-pre-wrap max-h-72 overflow-y-auto border border-slate-800 leading-relaxed">
              {paper.content || "No decrypted content available."}
            </div>
          </div>

          {/* Review Comments */}
          <Textarea
            label="Review Evaluation & Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            placeholder="Document examination syllabus coverage, difficulty assessment, and structural clarity..."
          />

          {/* Rejection Reason (if rejecting) */}
          {actionType === "reject" && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-2 animate-in fade-in">
              <Textarea
                label="Rejection Reason (Required)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                placeholder="State specific revisions or syllabus corrections required by setter..."
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              {actionType !== "reject" ? (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setActionType("reject")}
                    disabled={submitting}
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    Reject Paper
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleReviewSubmit("Reviewed")}
                    loading={submitting}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  >
                    Approve Review
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActionType(null)}
                    disabled={submitting}
                  >
                    Back
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleReviewSubmit("Rejected")}
                    loading={submitting}
                    icon={<XCircle className="w-4 h-4" />}
                  >
                    Confirm Rejection
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

export default ReviewPaperModal;
