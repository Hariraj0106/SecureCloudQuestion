"use client";

import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { IQuestionPaper } from "@/types/paper";
import { useToast } from "../ui/ToastProvider";
import { Calendar, Clock, Lock } from "lucide-react";

interface ScheduleExamModalProps {
  paper: IQuestionPaper | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScheduleExamModal: React.FC<ScheduleExamModalProps> = ({
  paper,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");

  useEffect(() => {
    if (paper) {
      if (paper.examDate) {
        setExamDate(paper.examDate);
      } else if (paper.examTime) {
        const d = new Date(paper.examTime);
        setExamDate(d.toISOString().split("T")[0]);
        setExamTime(d.toTimeString().substring(0, 5));
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setExamDate(tomorrow.toISOString().split("T")[0]);
        setExamTime("09:00");
      }
    }
  }, [paper]);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paper) return;

    if (!examDate || !examTime) {
      error("Both examination date and start time are required.");
      return;
    }

    setSubmitting(true);
    try {
      const fullIso = new Date(`${examDate}T${examTime}`).toISOString();

      const res = await fetch("/api/papers/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paperId: paper._id,
          examDate,
          examTime: fullIso,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to schedule examination.");
        return;
      }

      success(`Examination scheduled for ${new Date(fullIso).toLocaleString()}. Status locked until release time.`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Schedule error:", err);
      error("Network error occurred while scheduling examination.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Examination"
      subtitle={paper ? `Paper: ${paper.title}` : "Set official exam date and start time"}
      maxWidth="md"
    >
      <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
        <div className="p-3 bg-slate-900 text-slate-200 rounded-lg flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-white">Controlled Timing Lock</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Once scheduled, this question paper cannot be decrypted or released by examination centers before this exact scheduled timestamp.
            </p>
          </div>
        </div>

        <Input
          label="Examination Date"
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          required
        />

        <Input
          label="Examination Start Time (Local)"
          type="time"
          value={examTime}
          onChange={(e) => setExamTime(e.target.value)}
          required
          helperText="Examination center decryption unlock occurs at this time."
        />

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={submitting}
            icon={<Calendar className="w-4 h-4 text-sky-400" />}
          >
            Confirm Examination Schedule
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ScheduleExamModal;
