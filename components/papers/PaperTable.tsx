"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  CheckSquare,
  Calendar,
  KeyRound,
  Trash2,
  Lock,
  ShieldCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { IQuestionPaper, PaperStatus, getUserDisplayName } from "@/types/paper";
import { PaperStatusBadge, ReleaseStatusBadge } from "../ui/StatusBadge";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import EmptyState from "../ui/EmptyState";
import LoadingSpinner from "../ui/LoadingSpinner";
import { useAuth } from "../ui/AuthProvider";

interface PaperTableProps {
  papers: IQuestionPaper[];
  loading?: boolean;
  onRefresh?: () => void;
  onOpenReview?: (paper: IQuestionPaper) => void;
  onOpenApprove?: (paper: IQuestionPaper) => void;
  onOpenSchedule?: (paper: IQuestionPaper) => void;
  onOpenRelease?: (paper: IQuestionPaper) => void;
  onDeletePaper?: (paper: IQuestionPaper) => void;
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const PaperTable: React.FC<PaperTableProps> = ({
  papers,
  loading = false,
  onOpenReview,
  onOpenApprove,
  onOpenSchedule,
  onOpenRelease,
  onDeletePaper,
  title,
  subtitle,
  actionButton,
}) => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Filtering
  const filteredPapers = papers.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.subject && p.subject.toLowerCase().includes(search.toLowerCase())) ||
      (p.course && p.course.toLowerCase().includes(search.toLowerCase())) ||
      getUserDisplayName(p.createdBy, "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      {/* Table Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          {title && (
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actionButton}

          {/* Search */}
          <div className="w-56">
            <Input
              placeholder="Search papers or setter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5" />}
              className="py-1.5 text-xs"
            />
          </div>

          {/* Status Filter */}
          <div className="w-36">
            <Select
              options={[
                { value: "ALL", label: "All Statuses" },
                { value: "Created", label: "Created" },
                { value: "Reviewed", label: "Reviewed" },
                { value: "Approved", label: "Approved" },
                { value: "Scheduled", label: "Scheduled" },
                { value: "Released", label: "Released" },
                { value: "Rejected", label: "Rejected" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Table Body */}
      {loading ? (
        <LoadingSpinner label="Loading question papers..." />
      ) : filteredPapers.length === 0 ? (
        <EmptyState
          title="No Question Papers Found"
          description={
            search || statusFilter !== "ALL"
              ? "No examination papers match the applied filter criteria."
              : "No examination papers currently exist in this institutional queue."
          }
          className="m-4"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Paper ID</th>
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Author / Setter</th>
                <th className="py-3 px-4">Lifecycle Status</th>
                <th className="py-3 px-4">Release Lock</th>
                <th className="py-3 px-4">Scheduled Exam</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPapers.map((paper) => {
                const isSetter = user?.role === "Question Setter";
                const isReviewer = user?.role === "Reviewer";
                const isAuthority = user?.role === "Examination Authority";
                const isExamCenter = user?.role === "Examination Center";
                const isAdmin = user?.role === "Admin";

                return (
                  <tr
                    key={paper._id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Paper ID */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      #{paper._id.substring(paper._id.length - 6).toUpperCase()}
                    </td>

                    {/* Title & Subject */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/papers/${paper._id}`}
                        className="font-semibold text-slate-900 hover:text-sky-600 block transition-colors leading-snug"
                      >
                        {paper.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {paper.course && (
                          <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                            {paper.course}
                          </span>
                        )}
                        {paper.subject && <span>{paper.subject}</span>}
                      </div>
                    </td>

                    {/* Setter */}
                    <td className="py-3.5 px-4 text-slate-700">
                      {getUserDisplayName(paper.createdBy, "Author")}
                    </td>

                    {/* Lifecycle Status */}
                    <td className="py-3.5 px-4">
                      <PaperStatusBadge status={paper.status} />
                    </td>

                    {/* Release Lock */}
                    <td className="py-3.5 px-4">
                      <ReleaseStatusBadge status={paper.releaseStatus} />
                    </td>

                    {/* Scheduled Exam */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {paper.examTime ? (
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(paper.examTime).toLocaleDateString()}</span>
                          <span className="text-slate-400">
                            {new Date(paper.examTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not scheduled</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Dossier */}
                        <Link href={`/papers/${paper._id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            title="View Question Paper Dossier"
                            icon={<Eye className="w-3.5 h-3.5" />}
                          >
                            View
                          </Button>
                        </Link>

                        {/* Reviewer Action */}
                        {(isReviewer || isAdmin) &&
                          paper.status === "Created" &&
                          onOpenReview && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => onOpenReview(paper)}
                              icon={<CheckSquare className="w-3.5 h-3.5 text-sky-600" />}
                            >
                              Review
                            </Button>
                          )}

                        {/* Authority Approval */}
                        {(isAuthority || isAdmin) &&
                          paper.status === "Reviewed" &&
                          onOpenApprove && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onOpenApprove(paper)}
                              icon={<CheckSquare className="w-3.5 h-3.5 text-emerald-400" />}
                            >
                              Approve
                            </Button>
                          )}

                        {/* Authority Scheduling */}
                        {(isAuthority || isAdmin) &&
                          (paper.status === "Approved" ||
                            paper.status === "Scheduled") &&
                          onOpenSchedule && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => onOpenSchedule(paper)}
                              icon={<Calendar className="w-3.5 h-3.5 text-purple-600" />}
                            >
                              Schedule
                            </Button>
                          )}

                        {/* Examination Center Release */}
                        {(isExamCenter || isAdmin) &&
                          paper.releaseStatus !== "Released" &&
                          (paper.status === "Scheduled" ||
                            paper.status === "Approved") &&
                          onOpenRelease && (
                            <Button
                              variant="cyan"
                              size="sm"
                              onClick={() => onOpenRelease(paper)}
                              icon={<KeyRound className="w-3.5 h-3.5" />}
                            >
                              Release
                            </Button>
                          )}

                        {/* Admin Delete */}
                        {isAdmin && onDeletePaper && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeletePaper(paper)}
                            title="Delete Paper"
                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaperTable;
