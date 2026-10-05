"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Clock, KeyRound, FileCheck2, ShieldCheck, Cpu } from "lucide-react";
import StatCard from "./StatCard";
import PaperTable from "../papers/PaperTable";
import ReleasePaperModal from "../papers/ReleasePaperModal";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "../ui/ToastProvider";

export const ExamCenterDashboard: React.FC = () => {
  const { error } = useToast();
  const [papers, setPapers] = useState<IQuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasePaper, setReleasePaper] = useState<IQuestionPaper | null>(null);

  const fetchPapers = useCallback(async () => {
    try {
      const res = await fetch("/api/papers");
      const json = await res.json();
      if (json.success && json.data) {
        setPapers(json.data);
      } else {
        error(json.message || "Failed to load examination center papers");
      }
    } catch {
      error("Network error fetching center papers");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  // Statistics
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todaysExams = papers.filter((p) => {
    if (!p.examTime) return false;
    const t = new Date(p.examTime).getTime();
    return t >= todayStart.getTime() && t <= todayEnd.getTime();
  });

  const readyForRelease = papers.filter(
    (p) =>
      p.releaseStatus !== "Released" &&
      (p.status === "Scheduled" || p.status === "Approved")
  );

  const releasedPapers = papers.filter((p) => p.releaseStatus === "Released");

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Examination Center Terminal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hardware-authenticated question paper distribution point with cryptographic release at scheduled start times.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-md text-slate-700">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <span>Authorized Terminals:</span>
          <span className="font-mono font-semibold text-slate-900">CENTER-001 / CENTER-002</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Today's Examinations"
          value={todaysExams.length}
          subtitle="Scheduled for today's session"
          icon={<Clock className="w-5 h-5" />}
          variant="sky"
        />
        <StatCard
          title="Pending / Locked Papers"
          value={readyForRelease.length}
          subtitle="Awaiting release timestamp"
          icon={<KeyRound className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Released Examinations"
          value={releasedPapers.length}
          subtitle="Decrypted and delivered to desks"
          icon={<FileCheck2 className="w-5 h-5" />}
          variant="emerald"
        />
      </div>

      {/* Paper Table */}
      <PaperTable
        papers={papers}
        loading={loading}
        onRefresh={fetchPapers}
        onOpenRelease={(p) => setReleasePaper(p)}
        title="Examination Papers Distribution Queue"
        subtitle="Perform device validation and paper decryption at scheduled start time"
      />

      {/* Release Paper Modal */}
      <ReleasePaperModal
        paper={releasePaper}
        isOpen={!!releasePaper}
        onClose={() => setReleasePaper(null)}
        onSuccess={fetchPapers}
      />
    </div>
  );
};

export default ExamCenterDashboard;
