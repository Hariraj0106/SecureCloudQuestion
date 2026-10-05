"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Key, FileText, Send } from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import Card from "../ui/Card";
import { useToast } from "../ui/ToastProvider";

export const CreatePaperForm: React.FC = () => {
  const router = useRouter();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    course: "",
    semester: "",
    department: "",
    examDate: "",
    examTime: "",
    content: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      error("Question paper title is required.");
      return;
    }
    if (!formData.content.trim() || formData.content.length < 10) {
      error("Question paper content must be at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      // Build ISO string if date and time provided
      let fullExamTimeIso: string | undefined = undefined;
      if (formData.examDate && formData.examTime) {
        fullExamTimeIso = new Date(`${formData.examDate}T${formData.examTime}`).toISOString();
      } else if (formData.examDate) {
        fullExamTimeIso = new Date(formData.examDate).toISOString();
      }

      const res = await fetch("/api/papers/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          examTime: fullExamTimeIso,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        error(json.message || "Failed to create encrypted question paper.");
        return;
      }

      success("Question paper encrypted using AES-256 and created successfully.");
      router.push("/setter/papers");
      router.refresh();
    } catch (err) {
      console.error("Submission error:", err);
      error("Network error occurred while submitting question paper.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Create Secure Question Paper"
      subtitle="Encrypted with AES-256 and verified with SHA-256 before storage"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Security Notice */}
        <div className="p-3.5 bg-slate-900 text-slate-200 rounded-lg flex items-start gap-3 text-xs">
          <Key className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white block">
              Zero Plaintext Storage Policy
            </span>
            <p className="text-slate-400 leading-relaxed">
              The question paper text submitted below is encrypted on the server before database insertion. Only authorized reviewers and centers at scheduled exam times can decrypt this payload.
            </p>
          </div>
        </div>

        {/* Primary Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              label="Question Paper Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., CS401: Advanced Cloud Security & Cryptography - Final Exam"
              required
            />
          </div>

          <Input
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g., Computer Science & Engineering"
          />

          <Input
            label="Course / Module Code"
            name="course"
            value={formData.course}
            onChange={handleChange}
            placeholder="e.g., CS-401"
          />

          <Input
            label="Semester / Year"
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            placeholder="e.g., Semester 8 - Spring 2026"
          />

          <Input
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g., Department of Information Technology"
          />

          <Input
            label="Proposed Exam Date"
            type="date"
            name="examDate"
            value={formData.examDate}
            onChange={handleChange}
          />

          <Input
            label="Proposed Exam Time"
            type="time"
            name="examTime"
            value={formData.examTime}
            onChange={handleChange}
          />
        </div>

        {/* Question Paper Content */}
        <div className="space-y-1.5">
          <Textarea
            label="Question Paper Content / Specifications"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={12}
            placeholder={`SECTION A (40 Marks): Answer all questions.\n1. Explain the operational differences between symmetric (AES-256) and asymmetric encryption...\n2. Define how SHA-256 guarantees non-repudiation and integrity verification...\n\nSECTION B (60 Marks):\n3. Design an institutional key management architecture for cloud examination distribution...`}
            required
            helperText="Draft the full examination questions and marking criteria here."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            icon={<Shield className="w-4 h-4 text-sky-400" />}
          >
            Encrypt & Submit Paper
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CreatePaperForm;
