"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Search, Filter, ScrollText, User, Calendar, Shield } from "lucide-react";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Select from "../ui/Select";
import { RoleBadge } from "../ui/StatusBadge";
import LoadingSpinner from "../ui/LoadingSpinner";
import EmptyState from "../ui/EmptyState";
import { IAuditLog } from "@/types/audit";
import { useToast } from "../ui/ToastProvider";

export const ActivityLogView: React.FC<{
  title?: string;
  subtitle?: string;
  roleFilter?: string;
}> = ({
  title = "Institutional Activity Trail",
  subtitle = "Cryptographic audit stream and historical user operations",
  roleFilter,
}) => {
  const { error } = useToast();
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  const fetchLogs = useCallback(async () => {
    try {
      const url = new URL("/api/audit", window.location.origin);
      if (roleFilter) url.searchParams.set("role", roleFilter);
      if (actionFilter !== "ALL") url.searchParams.set("action", actionFilter);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      const json = await res.json();
      if (json.success && json.data) {
        setLogs(json.data);
      } else {
        error(json.message || "Failed to load audit trail");
      }
    } catch {
      error("Network error fetching activity records");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, actionFilter, search, error]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <Card
      title={title}
      subtitle={subtitle}
      action={
        <div className="flex items-center gap-2">
          <div className="w-52">
            <Input
              placeholder="Search activity description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-3.5 h-3.5" />}
              className="py-1 text-xs"
            />
          </div>
          <div className="w-40">
            <Select
              options={[
                { value: "ALL", label: "All Actions" },
                { value: "CREATE_PAPER", label: "Create Paper" },
                { value: "SUBMIT_REVIEW", label: "Submit Review" },
                { value: "APPROVE_PAPER", label: "Approve Paper" },
                { value: "SCHEDULE_PAPER", label: "Schedule Paper" },
                { value: "RELEASE_PAPER", label: "Release Paper" },
                { value: "REJECT_PAPER", label: "Reject Paper" },
                { value: "LOGIN", label: "Login" },
                { value: "FAILED_LOGIN", label: "Failed Login" },
                { value: "FAILED_DEVICE_VALIDATION", label: "Device Failure" },
              ]}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="py-1 text-xs"
            />
          </div>
        </div>
      }
    >
      {loading ? (
        <LoadingSpinner label="Loading audit trail stream..." />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No Activity Records Found"
          description="No operations match the current filter or search criteria."
          icon={<ScrollText className="w-5 h-5" />}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User / Identity</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Description & Cryptographic Trace</th>
                <th className="py-2.5 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/75">
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">
                      {log.userName || "System / Anonymous"}
                    </div>
                    {log.role && (
                      <div className="mt-0.5">
                        <RoleBadge role={log.role} />
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 max-w-md">
                    {log.description}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                    {log.ipAddress || "127.0.0.1"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default ActivityLogView;
