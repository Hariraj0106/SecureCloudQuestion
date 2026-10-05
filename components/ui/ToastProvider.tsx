"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = "info", title?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => addToast(message, "success", title),
    [addToast]
  );
  const error = useCallback(
    (message: string, title?: string) => addToast(message, "error", title),
    [addToast]
  );
  const warning = useCallback(
    (message: string, title?: string) => addToast(message, "warning", title),
    [addToast]
  );
  const info = useCallback(
    (message: string, title?: string) => addToast(message, "info", title),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              t.type === "success"
                ? "bg-white border-emerald-300 text-slate-800 shadow-emerald-500/5"
                : t.type === "error"
                ? "bg-white border-rose-300 text-slate-800 shadow-rose-500/5"
                : t.type === "warning"
                ? "bg-white border-amber-300 text-slate-800 shadow-amber-500/5"
                : "bg-white border-slate-300 text-slate-800 shadow-slate-500/5"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              )}
              {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {t.type === "warning" && (
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              )}
              {t.type === "info" && <Info className="w-5 h-5 text-sky-600" />}
            </div>
            <div className="flex-1 text-sm">
              {t.title && <div className="font-semibold text-slate-900">{t.title}</div>}
              <div className="text-slate-600 leading-snug">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
