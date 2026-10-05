export type UserRole =
  | "Question Setter"
  | "Reviewer"
  | "Examination Authority"
  | "Examination Center"
  | "Admin";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  } | null;
}
