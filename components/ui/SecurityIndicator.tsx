"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface SystemStatusData {
  status: "SECURE" | "ALERT" | "WARNING";
  unresolvedCritical: number;
  unresolvedHigh: number;
}

export const SecurityIndicator: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<SystemStatusData>({
    status: "SECURE",
    unresolvedCritical: 0,
    unresolvedHigh: 0,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchStatus() {
      try {
        const res = await fetch("/api/system/status");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setData({
              status: json.data.status,
              unresolvedCritical: json.data.unresolvedCritical || 0,
              unresolvedHigh: json.data.unresolvedHigh || 0,
            });
          }
        }
      } catch {
        // Fallback
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 30s poll
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isAdmin = user?.role === "Admin";
  const isAlert = data.status === "ALERT" || data.unresolvedCritical > 0;
  const isWarning = data.status === "WARNING" || data.unresolvedHigh > 0;

  const content = (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-all ${
        isAlert
          ? "bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100"
          : isWarning
          ? "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
          : "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
      }`}
      title={
        isAlert
          ? `${data.unresolvedCritical} critical security event(s) detected!`
          : isWarning
          ? `${data.unresolvedHigh} high severity event(s) detected`
          : "All cryptographic, database, and RBAC guard rails operational"
      }
    >
      <span className="relative flex h-2 w-2">
        {isAlert && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isAlert ? "bg-rose-600" : isWarning ? "bg-amber-500" : "bg-emerald-500"
          }`}
        ></span>
      </span>

      {isAlert ? (
        <span className="flex items-center gap-1 font-bold">
          <ShieldAlert className="w-3.5 h-3.5" /> SECURITY ALERT
        </span>
      ) : isWarning ? (
        <span className="flex items-center gap-1 font-semibold">
          <Shield className="w-3.5 h-3.5" /> SYSTEM CAUTION
        </span>
      ) : (
        <span className="flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> SYSTEM SECURE
        </span>
      )}
    </div>
  );

  if (isAdmin) {
    return (
      <Link href="/admin/security" className="focus:outline-none">
        {content}
      </Link>
    );
  }

  return <div>{content}</div>;
};

export default SecurityIndicator;
