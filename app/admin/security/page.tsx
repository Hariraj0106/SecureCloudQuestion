"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { SeverityBadge } from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { ISecurityEvent, SecuritySeverity } from "@/types/audit";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminSecurityPage() {
  const { success, error } = useToast();
  const [events, setEvents] = useState<ISecurityEvent[]>([]);
  const [stats, setStats] = useState({
    criticalCount: 0,
    highCount: 0,
    unresolvedCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchEvents = useCallback(async () => {
    try {
      const url = new URL("/api/security-events", window.location.origin);
      if (severityFilter !== "ALL") url.searchParams.set("severity", severityFilter);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success && json.data) {
        setEvents(json.data);
        if (json.stats) setStats(json.stats);
      } else {
        error(json.message || "Failed to load security telemetry");
      }
    } catch {
      error("Network error fetching security events");
    } finally {
      setLoading(false);
    }
  }, [severityFilter, statusFilter, search, error]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Toggle event resolution
  const handleToggleResolve = async (event: ISecurityEvent) => {
    try {
      const res = await fetch(`/api/security-events/${event._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolved: !event.resolved }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to update event state");
        return;
      }
      success(`Security anomaly marked as ${!event.resolved ? "resolved" : "unresolved"}.`);
      fetchEvents();
    } catch {
      error("Failed to update security event");
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Cryptographic Security & Telemetry Surveillance
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated anomaly detection: unauthorized access, early release attempts, hash integrity violations, and invalid hardware devices.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            icon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
          >
            Refresh Telemetry
          </Button>
        </div>

        {/* Severity Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Critical Anomalies"
            value={stats.criticalCount}
            subtitle="Immediate investigation required"
            icon={<AlertOctagon className="w-5 h-5" />}
            variant={stats.criticalCount > 0 ? "rose" : "emerald"}
          />
          <StatCard
            title="High Severity Events"
            value={stats.highCount}
            subtitle="Device & early unlock violations"
            icon={<ShieldAlert className="w-5 h-5" />}
            variant={stats.highCount > 0 ? "rose" : "default"}
          />
          <StatCard
            title="Unresolved Issues"
            value={stats.unresolvedCount}
            subtitle="Awaiting triage sign-off"
            icon={<ShieldAlert className="w-5 h-5" />}
            variant="amber"
          />
          <StatCard
            title="Total Logged Incidents"
            value={stats.totalCount}
            subtitle="All-time recorded events"
            icon={<ShieldCheck className="w-5 h-5" />}
            variant="purple"
          />
        </div>

        {/* Security Events Table */}
        <Card
          title="Security Event Log Stream"
          subtitle="Real-time security telemetry feed"
          action={
            <div className="flex items-center gap-2">
              <div className="w-48">
                <Input
                  placeholder="Search event type or user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="w-3.5 h-3.5" />}
                  className="py-1 text-xs"
                />
              </div>
              <div className="w-36">
                <Select
                  options={[
                    { value: "ALL", label: "All Severities" },
                    { value: "CRITICAL", label: "CRITICAL" },
                    { value: "HIGH", label: "HIGH" },
                    { value: "MEDIUM", label: "MEDIUM" },
                    { value: "LOW", label: "LOW" },
                  ]}
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="py-1 text-xs"
                />
              </div>
              <div className="w-36">
                <Select
                  options={[
                    { value: "ALL", label: "All Status" },
                    { value: "unresolved", label: "Unresolved" },
                    { value: "resolved", label: "Resolved" },
                  ]}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="py-1 text-xs"
                />
              </div>
            </div>
          }
        >
          {loading ? (
            <LoadingSpinner label="Loading security telemetry..." />
          ) : events.length === 0 ? (
            <EmptyState
              title="No Security Anomalies Detected"
              description="All cryptographic checks, hardware device handshakes, and access boundaries are verified operational."
              icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Severity</th>
                    <th className="py-3 px-3">Event Type</th>
                    <th className="py-3 px-3">Identity / User</th>
                    <th className="py-3 px-3">Description & Trace</th>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Triage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.map((evt) => (
                    <tr key={evt._id} className="hover:bg-slate-50/75">
                      <td className="py-3 px-3">
                        <SeverityBadge severity={evt.severity} />
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] font-bold text-slate-800">
                        {evt.type}
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {evt.userName || "Unknown Client"}
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-md">
                        {evt.description}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            evt.resolved
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {evt.resolved ? "Resolved" : "Active Alert"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button
                          variant={evt.resolved ? "ghost" : "outline"}
                          size="sm"
                          onClick={() => handleToggleResolve(evt)}
                        >
                          {evt.resolved ? "Reopen" : "Mark Resolved"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
