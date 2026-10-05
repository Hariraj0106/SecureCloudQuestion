import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid institutional email address"),
  password: z.string().min(1, "Password is required"),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([
    "Question Setter",
    "Reviewer",
    "Examination Authority",
    "Examination Center",
    "Admin",
  ]),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).optional(),
  role: z
    .enum([
      "Question Setter",
      "Reviewer",
      "Examination Authority",
      "Examination Center",
      "Admin",
    ])
    .optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

export const createPaperSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  content: z.string().trim().min(10, "Question paper content must be at least 10 characters"),
  subject: z.string().trim().optional(),
  course: z.string().trim().optional(),
  semester: z.string().trim().optional(),
  department: z.string().trim().optional(),
  examDate: z.string().trim().optional(),
  examTime: z.string().trim().optional(),
});

export const reviewPaperSchema = z.object({
  paperId: z.string().min(1, "Paper ID is required"),
  status: z.enum(["Reviewed", "Rejected"]),
  comments: z.string().trim().optional(),
  rejectionReason: z.string().trim().optional(),
});

export const approvePaperSchema = z.object({
  paperId: z.string().min(1, "Paper ID is required"),
});

export const rejectPaperSchema = z.object({
  paperId: z.string().min(1, "Paper ID is required"),
  reason: z.string().trim().min(3, "Rejection reason is required"),
});

export const schedulePaperSchema = z.object({
  paperId: z.string().min(1, "Paper ID is required"),
  examDate: z.string().min(1, "Exam date is required"),
  examTime: z.string().min(1, "Exam time is required"),
});

export const releasePaperSchema = z.object({
  paperId: z.string().min(1, "Paper ID is required"),
  deviceId: z.string().trim().min(1, "Authorized Device ID is required"),
});
