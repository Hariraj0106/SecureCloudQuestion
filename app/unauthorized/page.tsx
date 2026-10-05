import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import Button from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-8 text-center space-y-6">
        <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-rose-600 font-mono">
            403 ACCESS FORBIDDEN
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            ACCESS RESTRICTED
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            You do not have permission to access this resource. Your role does not possess the requisite clearance.
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs text-slate-600 space-y-1">
          <span className="font-semibold text-slate-800 block">Security Policy:</span>
          <p className="text-[11px] text-slate-500 leading-normal">
            This unauthorized access attempt has been logged in the institutional security surveillance audit stream.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:w-auto"
              icon={<Home className="w-4 h-4 text-sky-400" />}
            >
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
