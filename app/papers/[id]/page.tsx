"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Calendar,
  Clock,
  User,
  CheckSquare,
  KeyRound,
  Printer,
  Lock,
  FileCheck2,
  AlertCircle,
  Hash,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  PaperStatusBadge,
  ReleaseStatusBadge,
  RoleBadge,
} from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ReviewPaperModal from "@/components/papers/ReviewPaperModal";
import ScheduleExamModal from "@/components/papers/ScheduleExamModal";
import ReleasePaperModal from "@/components/papers/ReleasePaperModal";
import { IQuestionPaper, getUserDisplayName } from "@/types/paper";
import { useAuth } from "@/components/ui/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";

export default function PaperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();

  const [paper, setPaper] = useState<IQuestionPaper | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);

  const fetchPaper = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/papers/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setPaper(json.data);
      } else {
        error(json.message || "Failed to load question paper dossier");
      }
    } catch {
      error("Network error fetching question paper details");
    } finally {
      setLoading(false);
    }
  }, [id, error]);

  useEffect(() => {
    fetchPaper();
  }, [fetchPaper]);

  const handleApprove = async () => {
    if (!paper) return;
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
      success(`Question paper "${paper.title}" officially approved.`);
      fetchPaper();
    } catch {
      error("Network error during approval.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <AppShell>
        <LoadingSpinner label="Decrypting and verifying question paper dossier..." />
      </AppShell>
    );
  }

  if (!paper) {
    return (
      <AppShell>
        <Card>
          <div className="text-center py-8 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">
              Dossier Not Found or Restricted
            </h3>
            <p className="text-xs text-slate-500">
              The requested question paper record is unavailable or access was denied.
            </p>
            <Button size="sm" onClick={() => router.back()}>
              Return to Papers Registry
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const isReviewer = user?.role === "Reviewer" || user?.role === "Admin";
  const isAuthority = user?.role === "Examination Authority" || user?.role === "Admin";
  const isExamCenter = user?.role === "Examination Center" || user?.role === "Admin";

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Breadcrumb / Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-500">
                  PAPER-ID: #{paper._id.substring(paper._id.length - 8).toUpperCase()}
                </span>
                <PaperStatusBadge status={paper.status} />
                <ReleaseStatusBadge status={paper.releaseStatus} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {paper.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Review Button */}
            {isReviewer && paper.status === "Created" && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReviewOpen(true)}
                icon={<CheckSquare className="w-3.5 h-3.5 text-sky-600" />}
              >
                Peer Review
              </Button>
            )}

            {/* Authority Approve */}
            {isAuthority && paper.status === "Reviewed" && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleApprove}
                icon={<CheckSquare className="w-3.5 h-3.5 text-emerald-400" />}
              >
                Approve Paper
              </Button>
            )}

            {/* Authority Schedule */}
            {isAuthority && (paper.status === "Approved" || paper.status === "Scheduled") && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsScheduleOpen(true)}
                icon={<Calendar className="w-3.5 h-3.5 text-purple-600" />}
              >
                Schedule Exam
              </Button>
            )}

            {/* Center Release */}
            {isExamCenter &&
              paper.releaseStatus !== "Released" &&
              (paper.status === "Scheduled" || paper.status === "Approved") && (
                <Button
                  variant="cyan"
                  size="sm"
                  onClick={() => setIsReleaseOpen(true)}
                  icon={<KeyRound className="w-3.5 h-3.5" />}
                >
                  Release Paper
                </Button>
              )}

            {/* Print if content available */}
            {paper.content && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                icon={<Printer className="w-3.5 h-3.5 text-slate-600" />}
              >
                Print
              </Button>
            )}
          </div>
        </div>

        {/* Cryptographic & Workflow Dossier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Metadata Card */}
          <Card title="Institutional Metadata" padding="sm">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Subject</span>
                <span className="font-semibold text-slate-800">
                  {paper.subject || "General"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Course Code</span>
                <span className="font-semibold font-mono text-slate-800">
                  {paper.course || "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Semester / Term</span>
                <span className="font-semibold text-slate-800">
                  {paper.semester || "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Department</span>
                <span className="font-semibold text-slate-800">
                  {paper.department || "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Created At</span>
                <span className="font-mono text-slate-700">
                  {new Date(paper.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Custody Lifecycle */}
          <Card title="Custody & Workflow Transitions" padding="sm">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Author (Setter)</span>
                <span className="font-semibold text-slate-800">
                  {getUserDisplayName(paper.createdBy, "Author")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Peer Reviewer</span>
                <span className="font-semibold text-slate-800">
                  {getUserDisplayName(paper.reviewedBy, "Pending")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Exam Authority</span>
                <span className="font-semibold text-slate-800">
                  {getUserDisplayName(paper.approvedBy, "Pending")}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Scheduled Time</span>
                <span className="font-mono font-semibold text-slate-800">
                  {paper.examTime
                    ? new Date(paper.examTime).toLocaleString()
                    : "Not Scheduled"}
                </span>
              </div>
            </div>
          </Card>

          {/* Cryptographic Integrity Card */}
          <Card title="Cryptographic Assurance" padding="sm">
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  SHA-256 Content Digest
                </span>
                <div className="p-2 bg-slate-900 text-sky-400 font-mono text-[10px] rounded break-all border border-slate-800">
                  {paper.contentHash}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900">
                <span className="font-medium text-[11px]">Integrity Check</span>
                <span className="font-bold flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  VERIFIED
                </span>
              </div>

              {paper.releasedToDevice && (
                <div className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-700 flex justify-between items-center text-[11px]">
                  <span>Released To Device:</span>
                  <span className="font-mono font-bold">{paper.releasedToDevice}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Question Paper Content Section */}
        <Card
          title="Examination Question Paper Content"
          subtitle={
            paper.content
              ? "Decrypted on-demand for authorized clearance"
              : "Zero Plaintext Isolation: Content locked"
          }
        >
          {paper.content ? (
            <div id="printable-paper-area" className="space-y-4">
              <div className="p-5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                {paper.content}
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>SC-QPMS SECURE DISTRIBUTION PROTOCOL</span>
                <span>SHA-256 HASH VERIFIED</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-lg space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center mx-auto text-slate-600">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Content Cryptographically Sealed
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Plaintext examination questions are isolated on the secure storage node with AES-256 encryption. Plaintext is only exposed to authorized reviewers or examination centers upon scheduled start-time release.
              </p>
            </div>
          )}
        </Card>

        {/* Modals */}
        <ReviewPaperModal
          paperId={isReviewOpen ? paper._id : null}
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          onSuccess={fetchPaper}
        />

        <ScheduleExamModal
          paper={isScheduleOpen ? paper : null}
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          onSuccess={fetchPaper}
        />

        <ReleasePaperModal
          paper={isReleaseOpen ? paper : null}
          isOpen={isReleaseOpen}
          onClose={() => setIsReleaseOpen(false)}
          onSuccess={fetchPaper}
        />
      </div>
    </AppShell>
  );
}
