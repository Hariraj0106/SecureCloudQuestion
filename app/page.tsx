import Link from "next/link";
import {
  Shield,
  Key,
  Lock,
  FileCheck2,
  Calendar,
  CheckSquare,
  Cpu,
  ScrollText,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from "lucide-react";
import Button from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Institutional Top Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-slate-900 flex items-center justify-center text-sky-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 tracking-wider">
              SC-QPMS
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Institutional Examination Security
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="primary"
              size="sm"
              icon={<Lock className="w-3.5 h-3.5 text-sky-400" />}
            >
              Sign In to Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24 px-6 lg:px-12 max-w-6xl mx-auto w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>AES-256 Encrypted • Zero Plaintext Storage • Hardware Authenticated</span>
        </div>

        <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          Secure Cloud-Based Question Paper Management System
        </h1>

        <p className="text-sm lg:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          An institutional-grade platform governing confidential examination question papers across the complete lifecycle—from cryptographically sealed authoring to time-locked examination center release.
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Link href="/login">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4 text-sky-400" />}
            >
              Enter Institutional Control Center
            </Button>
          </Link>
        </div>

        {/* 3 Core Security Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-10 text-left">
          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-2">
            <div className="w-8 h-8 rounded bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">AES-256 & SHA-256</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every question paper is immediately encrypted with AES-256 using dynamic initialization vectors and verified with SHA-256 checksums to guarantee integrity.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-2">
            <div className="w-8 h-8 rounded bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Strict Role Separation</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Five isolated institutional roles (Setter, Reviewer, Authority, Exam Center, Admin) enforce zero unauthorized cross-boundary access.
            </p>
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm space-y-2">
            <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">Time & Device Locked Release</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Examination center terminals can only decrypt papers upon reaching the exact scheduled exam time and passing hardware terminal validation.
            </p>
          </div>
        </div>
      </section>

      {/* Lifecycle Workflow Diagram Section */}
      <section className="py-12 bg-white border-y border-slate-200 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-sky-600">
              Security Governance
            </span>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
              End-to-End Examination Lifecycle
            </h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Linear custody transition ensuring non-repudiation and complete traceability.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="text-[10px] font-bold font-mono text-slate-400">01. CREATION</div>
              <div className="font-bold text-xs text-slate-900">Question Setter</div>
              <p className="text-[11px] text-slate-600">
                Drafts paper; client encrypted to ciphertext + SHA-256 generated.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="text-[10px] font-bold font-mono text-slate-400">02. REVIEW</div>
              <div className="font-bold text-xs text-slate-900">Reviewer Panel</div>
              <p className="text-[11px] text-slate-600">
                Authorized peer decrypts and assesses syllabus coverage and rigor.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="text-[10px] font-bold font-mono text-slate-400">03. APPROVAL</div>
              <div className="font-bold text-xs text-slate-900">Exam Authority</div>
              <p className="text-[11px] text-slate-600">
                Executive board grants sign-off with separation of duties check.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="text-[10px] font-bold font-mono text-slate-400">04. SCHEDULING</div>
              <div className="font-bold text-xs text-slate-900">Time Lock Setup</div>
              <p className="text-[11px] text-slate-600">
                Sets exact exam date/time; status locks until release window opens.
              </p>
            </div>

            <div className="p-4 bg-slate-900 text-white border border-slate-800 rounded-lg space-y-2">
              <div className="text-[10px] font-bold font-mono text-sky-400">05. CONTROLLED RELEASE</div>
              <div className="font-bold text-xs text-white">Examination Center</div>
              <p className="text-[11px] text-slate-300">
                Terminal ID validated + time check + hash verified for live exam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 py-8 px-6 lg:px-12 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Shield className="w-4 h-4 text-sky-400" />
            <span className="font-bold">SC-QPMS</span>
            <span className="text-slate-500">• Secure Question Cloud</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Designed for Vercel Cloud Serverless & MongoDB Atlas Deployment.
          </div>
        </div>
      </footer>
    </div>
  );
}
