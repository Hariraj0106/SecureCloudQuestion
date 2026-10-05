"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FilePlus,
  Files,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import StatCard from "./StatCard";
import Button from "../ui/Button";
import PaperTable from "../papers/PaperTable";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "../ui/ToastProvider";

export const SetterDashboard: React.FC = () => {
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
        error(json.message || "Failed to load author papers");
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

  // Statistics
  const total = papers.length;
  const created = papers.filter((p) => p.status === "Created").length;
  const reviewed = papers.filter((p) => p.status === "Reviewed").length;
  const approved = papers.filter(
    (p) => p.status === "Approved" || p.status === "Scheduled" || p.status === "Released"
  ).length;
  const rejected = papers.filter((p) => p.status === "Rejected").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Question Setter Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Author and securely transmit confidential examination papers with end-to-end AES-256 encryption.
          </p>
        </div>
        <Link href="/setter/create">
          <Button
            variant="primary"
            size="md"
            icon={<FilePlus className="w-4 h-4 text-sky-400" />}
          >
            Create New Paper
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Authored"
          value={total}
          subtitle="All created submissions"
          icon={<Files className="w-5 h-5" />}
          variant="sky"
        />
        <StatCard
          title="Under Review"
          value={created}
          subtitle="Awaiting reviewer peer check"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Reviewed / Verified"
          value={reviewed}
          subtitle="Awaiting Authority sign-off"
          icon={<ShieldCheck className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="Approved & Scheduled"
          value={approved}
          subtitle="Ready for institutional exam"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
      </div>

      {/* Rejection Alert if any */}
      {rejected > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Action Required on Rejected Papers</span>
            <span>
              You have {rejected} question paper(s) returned with reviewer or authority revision notes. Please inspect and update.
            </span>
          </div>
        </div>
      )}

      {/* Papers Table */}
      <PaperTable
        papers={papers}
        loading={loading}
        onRefresh={fetchPapers}
        title="My Authored Question Papers"
        subtitle="Confidential examination papers drafted under your credentials"
      />
    </div>
  );
};

export default SetterDashboard;
