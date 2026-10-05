"use client";

import React, { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "../ui/ToastProvider";
import {
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Printer,
  CheckCircle2,
  Cpu,
  Lock,
} from "lucide-react";

interface ReleasePaperModalProps {
  paper: IQuestionPaper | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReleasePaperModal: React.FC<ReleasePaperModalProps> = ({
  paper,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [deviceId, setDeviceId] = useState("CENTER-001");
  const [submitting, setSubmitting] = useState(false);
  const [releasedData, setReleasedData] = useState<{
    content: string;
    releasedAt: string;
    releasedToDevice: string;
    contentHash: string;
  } | null>(null);

  const handleRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paper) return;

    if (!deviceId.trim()) {
      error("Hardware Device Identifier is required for paper release authorization.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/papers/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: paper._id,
          deviceId: deviceId.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to release question paper.");
        return;
      }

      success("Question paper decrypted and released to authorized terminal successfully.");
      setReleasedData(json.data);
      onSuccess();
    } catch (err) {
      console.error("Release error:", err);
      error("Network error during paper release protocol.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleModalClose = () => {
    setReleasedData(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={
        releasedData
          ? `Released: ${paper?.title}`
          : `Release Paper: ${paper?.title || "Examination Paper"}`
      }
      subtitle={
        releasedData
          ? `Cryptographically released to terminal [${releasedData.releasedToDevice}]`
          : "Hardware terminal authorization and timing verification"
      }
      maxWidth={releasedData ? "4xl" : "md"}
    >
      {!releasedData ? (
        <form onSubmit={handleRelease} className="space-y-4 text-xs">
          {/* Security Protocols Notice */}
          <div className="p-3.5 bg-slate-900 text-slate-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <Lock className="w-4 h-4 text-sky-400" /> Multi-Layer Release Enforcement
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Hardware Device validation against authorized institutional list</li>
              <li>Scheduled examination start time compliance (no early unlock)</li>
              <li>SHA-256 integrity hash verification before decryption</li>
            </ul>
          </div>

          {paper?.examTime && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Scheduled Exam Time</span>
                <span>{new Date(paper.examTime).toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Device ID Input */}
          <div>
            <Input
              label="Authorized Terminal / Device ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="e.g., CENTER-001"
              leftIcon={<Cpu className="w-4 h-4 text-slate-400" />}
              required
              helperText="Hardware identifier assigned to this examination terminal."
            />

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-500 font-medium">Presets:</span>
              {["CENTER-001", "CENTER-002", "EXAM-DESK-ALPHA"].map((id) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => setDeviceId(id)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono rounded border border-slate-300 transition-colors"
                >
                  {id}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleModalClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              icon={<KeyRound className="w-4 h-4 text-sky-400" />}
            >
              Verify & Release Paper
            </Button>
          </div>
        </form>
      ) : (
        /* Post-Release Decrypted Dossier View */
        <div className="space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Released at {new Date(releasedData.releasedAt).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300">
                Device: {releasedData.releasedToDevice}
              </span>
              <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SHA-256 Verified
              </span>
            </div>
          </div>

          {/* Printable Area */}
          <div
            id="printable-paper-area"
            className="p-6 bg-white border border-slate-300 rounded-lg shadow-sm space-y-4 text-slate-900"
          >
            <div className="text-center border-b pb-4 space-y-1">
              <h2 className="text-base font-bold uppercase tracking-wider">
                Official Examination Question Paper
              </h2>
              <h3 className="text-sm font-semibold text-slate-800">{paper?.title}</h3>
              <div className="flex justify-center gap-4 text-xs text-slate-600">
                {paper?.subject && <span>Subject: {paper.subject}</span>}
                {paper?.course && <span>Course: {paper.course}</span>}
                {paper?.semester && <span>Semester: {paper.semester}</span>}
              </div>
            </div>

            <div className="font-mono text-xs whitespace-pre-wrap leading-relaxed py-2">
              {releasedData.content}
            </div>

            <div className="border-t pt-3 flex justify-between text-[10px] text-slate-500 font-mono">
              <span>SHA-256: {releasedData.contentHash}</span>
              <span>SC-QPMS SECURE DISTRIBUTION PROTOCOL</span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={handleModalClose}>
              Close Window
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer className="w-4 h-4 text-sky-400" />}
            >
              Print Question Paper
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReleasePaperModal;
