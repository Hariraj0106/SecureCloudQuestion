export type PaperStatus =
  | "Created"
  | "Reviewed"
  | "Rejected"
  | "Approved"
  | "Scheduled"
  | "Released";

export type ReleaseStatus = "Locked" | "Ready" | "Released";

export type UserRef =
  | {
      _id?: string;
      id?: string;
      name?: string;
      email?: string;
    }
  | string
  | null
  | undefined;

export function getUserDisplayName(
  userRef: UserRef,
  fallback: string = "Pending"
): string {
  if (!userRef) return fallback;
  if (typeof userRef === "object" && userRef !== null && "name" in userRef && userRef.name) {
    return userRef.name;
  }
  if (typeof userRef === "string") return userRef;
  return fallback;
}

export interface IQuestionPaper {
  _id: string;
  title: string;
  subject?: string;
  course?: string;
  semester?: string;
  department?: string;
  encryptedContent: string;
  iv: string;
  contentHash: string;
  status: PaperStatus;
  releaseStatus: ReleaseStatus;
  examDate?: string;
  examTime?: string; // ISO date string representing scheduled exam time
  createdBy: UserRef;
  reviewedBy?: UserRef;
  reviewedAt?: string | Date;
  reviewComments?: string;
  rejectionReason?: string;
  approvedBy?: UserRef;
  approvedAt?: string | Date;
  scheduledBy?: UserRef;
  scheduledAt?: string | Date;
  releasedBy?: UserRef;
  releasedAt?: string | Date;
  releasedToDevice?: string;
  createdAt: string | Date;
  updatedAt: string | Date;

  // Decrypted content if authorized
  content?: string;
  integrityVerified?: boolean;
}
