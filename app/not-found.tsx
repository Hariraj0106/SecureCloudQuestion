import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl max-w-md w-full p-8 text-center space-y-6">
        <div className="w-14 h-14 bg-slate-100 border border-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto">
          <FileQuestion className="w-7 h-7 text-slate-600" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 font-mono">
            404 NOT FOUND
          </span>
          <h1 className="text-xl font-bold text-slate-900">
            PAGE NOT FOUND
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            The requested institutional examination resource or dossier does not exist.
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <Link href="/dashboard">
            <Button
              variant="primary"
              size="md"
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
