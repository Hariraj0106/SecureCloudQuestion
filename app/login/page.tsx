"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  Key,
  Layers,
  ScrollText,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/components/ui/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@sc-qpms.edu",
    password: "Admin@Secure2026!",
    name: "Security Administrator",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    role: "Question Setter",
    email: "setter@sc-qpms.edu",
    password: "Admin@Secure2026!",
    name: "Dr. Evelyn Vance",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  {
    role: "Reviewer",
    email: "reviewer@sc-qpms.edu",
    password: "Admin@Secure2026!",
    name: "Prof. Arthur Pendelton",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200",
  },
  {
    role: "Examination Authority",
    email: "authority@sc-qpms.edu",
    password: "Admin@Secure2026!",
    name: "Dean Marcus Sterling",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    role: "Examination Center",
    email: "examcenter@sc-qpms.edu",
    password: "Admin@Secure2026!",
    name: "Center Alpha Invigilator",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const { refreshUser } = useAuth();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState("admin@sc-qpms.edu");
  const [password, setPassword] = useState("Admin@Secure2026!");
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      error("Institutional email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Invalid institutional credentials.");
        return;
      }

      await refreshUser();
      success(`Authenticated successfully as ${json.data.role}.`);
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      console.error("Login Error:", err);
      error("Authentication service unavailable. Please check database connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAccounts = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/auth/seed", {
        method: "POST",
        headers: { "x-seed-force": "true" },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        success("Institutional demonstration accounts initialized in database!");
      } else {
        error(json.message || "Failed to initialize default database accounts.");
      }
    } catch {
      error("Error connecting to database seed endpoint.");
    } finally {
      setSeeding(false);
    }
  };

  const handleSelectDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    info(`Selected ${acc.name} (${acc.role})`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 lg:p-8">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT: Security Branding Section (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 text-slate-200 p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="space-y-6">
            {/* Header / Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-wider block">
                  SC-QPMS
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  Secure Institutional Core
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white leading-snug">
                Secure Cloud-Based Question Paper Management System
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure examination paper lifecycle management with controlled access, encryption and audit monitoring.
              </p>
            </div>

            {/* 3 Security Indicators */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
                <Key className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">AES-256 Encrypted</span>
                  <span className="text-slate-400 text-[11px]">
                    Zero plaintext stored at rest. Unique IV per record.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
                <Layers className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Role-Based Access</span>
                  <span className="text-slate-400 text-[11px]">
                    Separation of duties across 5 isolated institutional roles.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
                <ScrollText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block">Audit Monitored</span>
                  <span className="text-slate-400 text-[11px]">
                    Every cryptographic operation and authorization is logged.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
            SECURE VERIFICATION NODE • VERCEL SERVERLESS
          </div>
        </div>

        {/* RIGHT: Login Form Section (7 Cols) */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Institutional Sign In
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your authorized credentials to access the examination security portal.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Institutional Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@sc-qpms.edu"
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Security Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  loading={loading}
                  icon={<ShieldCheck className="w-4 h-4 text-sky-400" />}
                >
                  Sign In Securely
                </Button>
              </div>
            </form>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Authentication protected by secure session controls.</span>
            </div>

            {/* Quick Demo Switcher */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Role Switcher (Development & Review)
                </span>
                <button
                  onClick={handleSeedAccounts}
                  disabled={seeding}
                  className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
                  title="Seed default roles if not yet in database"
                >
                  <Database className="w-3 h-3" />
                  <span>{seeding ? "Seeding..." : "Init DB Accounts"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-all text-xs space-y-0.5 focus:ring-1 focus:ring-slate-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 truncate">
                        {acc.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {acc.role}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-400 border-t border-slate-100 pt-4">
            Only authorized administrators can provision institutional user accounts.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center">
          <div className="text-slate-500 text-xs font-semibold">
            Loading Security Terminal...
          </div>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
