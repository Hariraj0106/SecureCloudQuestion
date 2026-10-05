"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Files,
  Clock,
  CheckCircle2,
  Calendar,
  KeyRound,
  AlertOctagon,
  ScrollText,
  Database,
  Lock,
  ArrowRight,
} from "lucide-react";
import StatCard from "./StatCard";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { PaperStatusBadge, SeverityBadge, RoleBadge } from "../ui/StatusBadge";
import { useToast } from "../ui/ToastProvider";

import { IAuditLog, ISecurityEvent } from "@/types/audit";
import { IQuestionPaper } from "@/types/paper";

export const AdminDashboard: React.FC = () => {
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPapers: 0,
    pendingReviews: 0,
    pendingApprovals: 0,
    scheduledExams: 0,
    releasedPapers: 0,
    securityEvents: 0,
    criticalEvents: 0,
    status: "SECURE",
  });

  const [recentLogs, setRecentLogs] = useState<IAuditLog[]>([]);
  const [recentEvents, setRecentEvents] = useState<ISecurityEvent[]>([]);

  const fetchAdminData = useCallback(async () => {
    try {
      const [statusRes, papersRes, usersRes, auditRes, secRes] = await Promise.all([
        fetch("/api/system/status"),
        fetch("/api/papers"),
        fetch("/api/users"),
        fetch("/api/audit?limit=5"),
        fetch("/api/security-events?limit=5"),
      ]);

      const [statusJson, papersJson, usersJson, auditJson, secJson] =
        await Promise.all([
          statusRes.json(),
          papersRes.json(),
          usersRes.json(),
          auditRes.json(),
          secRes.json(),
        ]);

      const papers: IQuestionPaper[] = papersJson.data || [];
      const users = usersJson.data || [];

      setStats({
        totalUsers: users.length,
        totalPapers: papers.length,
        pendingReviews: papers.filter((p) => p.status === "Created").length,
        pendingApprovals: papers.filter((p) => p.status === "Reviewed").length,
        scheduledExams: papers.filter((p) => p.status === "Scheduled").length,
        releasedPapers: papers.filter((p) => p.status === "Released").length,
        securityEvents: secJson.stats?.totalCount || 0,
        criticalEvents: secJson.stats?.criticalCount || 0,
        status: statusJson.data?.status || "SECURE",
      });

      setRecentLogs(auditJson.data || []);
      setRecentEvents(secJson.data || []);
    } catch {
      error("Failed to load security dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Institutional Security Control Center
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white tracking-wider">
              ADMINISTRATIVE ROOT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry, cryptographic subsystem surveillance, and user access governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin/users">
            <Button
              variant="outline"
              size="sm"
              icon={<Users className="w-3.5 h-3.5 text-slate-600" />}
            >
              User Accounts
            </Button>
          </Link>
          <Link href="/admin/audit">
            <Button
              variant="outline"
              size="sm"
              icon={<ScrollText className="w-3.5 h-3.5 text-slate-600" />}
            >
              Audit Stream
            </Button>
          </Link>
          <Link href="/admin/security">
            <Button
              variant="danger"
              size="sm"
              icon={<AlertOctagon className="w-3.5 h-3.5" />}
            >
              Security Monitor
            </Button>
          </Link>
        </div>
      </div>

      {/* System Health Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Core System
          </span>
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>OPERATIONAL</span>
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Database Cluster
          </span>
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-xs">
            <Database className="w-4 h-4 text-emerald-600" />
            <span>ONLINE (Atlas)</span>
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Cryptographic Engine
          </span>
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
            <Lock className="w-4 h-4 text-sky-600" />
            <span>AES-256 / SHA-256</span>
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Session Security
          </span>
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>JWT HTTP-Only</span>
          </div>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Audit Stream
          </span>
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 text-xs">
            <ScrollText className="w-4 h-4 text-emerald-600" />
            <span>ACTIVE LOGGING</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle="All institutional roles"
          icon={<Users className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="Total Question Papers"
          value={stats.totalPapers}
          subtitle="All lifecycle stages"
          icon={<Files className="w-5 h-5" />}
          variant="sky"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          subtitle="Under peer review"
          icon={<Clock className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingApprovals}
          subtitle="Awaiting Authority sign-off"
          icon={<CheckCircle2 className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          title="Scheduled Exams"
          value={stats.scheduledExams}
          subtitle="Locked until release time"
          icon={<Calendar className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="Released Papers"
          value={stats.releasedPapers}
          subtitle="Delivered to exam centers"
          icon={<KeyRound className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          title="Security Events"
          value={stats.securityEvents}
          subtitle="Total telemetry records"
          icon={<AlertOctagon className="w-5 h-5" />}
          variant={stats.criticalEvents > 0 ? "rose" : "default"}
        />
        <StatCard
          title="Critical Alerts"
          value={stats.criticalEvents}
          subtitle="Unresolved anomalies"
          icon={<ShieldAlert className="w-5 h-5" />}
          variant={stats.criticalEvents > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Two Column Layout: Recent Security Events & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Security Events */}
        <Card
          title="Security Surveillance & Anomalies"
          subtitle="Real-time device validation, early release, or integrity alerts"
          action={
            <Link
              href="/admin/security"
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {recentEvents.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No security anomalies detected. System operating normally.
            </p>
          ) : (
            <div className="space-y-2.5">
              {recentEvents.map((evt) => (
                <div
                  key={evt._id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={evt.severity} />
                      <span className="font-bold text-slate-800 font-mono text-[11px]">
                        {evt.type}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs">{evt.description}</p>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      evt.resolved
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {evt.resolved ? "Resolved" : "Active"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Audit Logs */}
        <Card
          title="Institutional Audit Trail"
          subtitle="Immutable record of user actions and lifecycle operations"
          action={
            <Link
              href="/admin/audit"
              className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
            >
              View Full Trail <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No audit records available yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {recentLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-slate-800 text-[11px]">
                        {log.action}
                      </span>
                      {log.role && <RoleBadge role={log.role} />}
                    </div>
                    <p className="text-slate-600 text-xs">{log.description}</p>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()} • IP: {log.ipAddress || "127.0.0.1"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
