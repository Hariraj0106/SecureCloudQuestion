# SC-QPMS: Secure Cloud-Based Question Paper Management System

**SC-QPMS** is an institutional-grade, cloud-native examination security platform designed for colleges, universities, and examination boards. It governs sensitive examination question papers through the complete lifecycle—from cryptographically sealed authoring to hardware-validated, time-locked release at examination centers.

---

## 1. System Architecture & Workflow

```
[ Question Setter ]
       │ (1. Author & AES-256 Encrypt + SHA-256 Hash)
       ▼
[ Question Paper Sealed in MongoDB Atlas ]
       │ (2. Forward to Review Queue)
       ▼
[ Reviewer Panel ]
       │ (3. Authorized Decrypt & Syllabus Compliance Verification)
       ▼
[ Examination Authority Board ]
       │ (4. Final Approval & Separation-of-Duties Enforcement)
       │ (5. Date & Time Scheduling with Automated Lock)
       ▼
[ Encrypted Storage Node ]
       │
       ▼ (6. Examination Day Verification)
[ Examination Center Terminal ]
       ├─► Hardware Device ID Authentication (AUTHORIZED_DEVICE_IDS)
       ├─► Scheduled Start Time Compliance (No Early Unlock)
       ├─► SHA-256 Checksum Cryptographic Verification
       ▼ (7. Controlled Plaintext Decryption)
[ Examination Delivery & Printing ]
```

---

## 2. Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Route Handlers, Server Actions, Edge Middleware)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with zero-config local SQLite (`dev.db`) or cloud PostgreSQL/MySQL
- **Authentication**: JWT stored in secure `HTTP-only` cookies, [bcryptjs](https://github.com/dcodeIO/bcrypt.js) password hashing (12 rounds)
- **Cryptography**: Node.js `crypto` with `AES-256-CBC` (random 16-byte IV per record), `SHA-256` integrity digests, timing-safe equality checks
- **Validation**: [Zod](https://zod.dev/) input validation
- **Deployment**: [Vercel](https://vercel.com/) (100% Serverless)

---

## 3. Core Security Features

1. **Zero Plaintext Storage**: Question paper content is encrypted with AES-256 before database insertion. Plaintext is never stored in the database.
2. **Dynamic Initialization Vectors (IV)**: Each question paper is encrypted with a unique 16-byte random IV.
3. **SHA-256 Integrity Verification**: SHA-256 hash is computed at creation. Upon decryption or release, the computed hash is matched using constant-time comparison. Any tampering immediately generates a `CRITICAL` security event and aborts release.
4. **Hardware Device Validation**: Examination Center releases are restricted to certified hardware device identifiers (e.g. `CENTER-001`, `CENTER-002`, `EXAM-DESK-ALPHA`) verified against server-side `AUTHORIZED_DEVICE_IDS`.
5. **Automated Time-Lock**: Question papers cannot be decrypted or released before the scheduled exam start time (`currentTime >= examTime`). Early release attempts generate `HIGH` severity security events.
6. **Separation of Duties**: Strict RBAC prevents authors from approving their own papers, reviewers from scheduling exams, and unauthorized roles from decrypting ciphertext.
7. **Comprehensive Audit Logging**: All sensitive actions (`LOGIN`, `CREATE_PAPER`, `VIEW_PAPER`, `SUBMIT_REVIEW`, `APPROVE_PAPER`, `SCHEDULE_PAPER`, `RELEASE_PAPER`, `FAILED_DEVICE_VALIDATION`, `INTEGRITY_FAILURE`) are recorded with user identity, timestamp, and IP address.
8. **Real-time Security Telemetry**: Live security monitoring indicator (`● SYSTEM SECURE` / `● SECURITY ALERT`) in the top navigation bar.

---

## 4. Institutional Roles & Clearance Matrix

| Role | Author Papers | Review Papers | Approve Papers | Schedule Exams | Release to Terminal | Manage Users & Logs |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Question Setter** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Reviewer** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Examination Authority** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Examination Center** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 5. Database Tables (Prisma Schema)

- `User`: User directory, institutional role, hashed passwords, active state, timestamps.
- `QuestionPaper`: Paper title, AES-256 ciphertext, IV, SHA-256 hash, lifecycle status, release lock, scheduled dates, references to creator, reviewer, authority, and release device.
- `Review`: Peer reviewer evaluation history, remarks, and rejection reasons.
- `AuditLog`: Immutable audit trail of institutional actions.
- `SecurityEvent`: Telemetry records for anomalous operations (invalid device, early release attempt, hash mismatch, unauthorized access).

---

## 6. Environment Variables

```env
# Database Connection URL (SQLite default for zero-config local run, or PostgreSQL / MySQL URL)
DATABASE_URL="file:./dev.db"

# JWT Secret for Session Authentication (minimum 32 characters)
JWT_SECRET=sc_qpms_enterprise_jwt_super_secure_secret_key_2026_production

# AES-256 Encryption Key (32 bytes / 64 hex characters or 32-character string)
ENCRYPTION_KEY=e8f9b4c2a1d3e5f7890123456789abcdef0123456789abcdef0123456789abcd

# Authorized Examination Center Device Identifiers (comma separated)
AUTHORIZED_DEVICE_IDS=CENTER-001,CENTER-002,CENTER-003,EXAM-DESK-ALPHA,EXAM-DESK-BETA

# Public Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Local Development Quickstart

Zero setup required. Run:

```bash
# 1. Start development server (dev.db is pre-seeded and ready)
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 8. Default Institutional Test Accounts

All pre-seeded demo accounts use the standard secure password: `Admin@Secure2026!`

| Role | Email | Name |
| :--- | :--- | :--- |
| **Admin** | `admin@sc-qpms.edu` | Security Administrator |
| **Question Setter** | `setter@sc-qpms.edu` | Dr. Evelyn Vance |
| **Reviewer** | `reviewer@sc-qpms.edu` | Prof. Arthur Pendelton |
| **Examination Authority** | `authority@sc-qpms.edu` | Dean Marcus Sterling |
| **Examination Center** | `examcenter@sc-qpms.edu` | Chief Invigilator - Center Alpha |

---

## 9. MongoDB Atlas Setup Guide

1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 Shared Cluster or dedicated cluster.
3. Under **Database Access**, create a user (e.g. `sc_qpms_admin`) with `Read and write to any database` privileges.
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere) to permit Vercel serverless function connections.
5. In **Database** > **Connect** > **Drivers**, copy the connection string:
   ```
   mongodb+srv://sc_qpms_admin:<password>@cluster0.xxxxx.mongodb.net/secure_question_cloud?retryWrites=true&w=majority
   ```
6. Set this value as `MONGODB_URI` in `.env.local` and Vercel Environment Variables.

---

## 10. Vercel Deployment Guide

1. Push your code to GitHub / GitLab / Bitbucket.
2. In [Vercel Dashboard](https://vercel.com/new), select **Import Project**.
3. Framework Preset will automatically detect **Next.js**.
4. In **Environment Variables**, configure:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`
   - `AUTHORIZED_DEVICE_IDS`
   - `NEXT_PUBLIC_APP_URL`
5. Click **Deploy**.
6. Once deployed, open `/login` and click **Init DB Accounts** or invoke `POST /api/auth/seed` to initialize the database users.

---

## 11. Verification & Testing Plan

1. **Authentication & Session**:
   - Sign in as `admin@sc-qpms.edu`.
   - Verify JWT cookie `sc_qpms_token` is set with `HttpOnly`, `SameSite=Lax`.
2. **Paper Creation & AES-256 Encryption**:
   - Sign in as `setter@sc-qpms.edu`.
   - Create a question paper via `/setter/create`.
   - Verify paper status is `Created` and releaseStatus is `Locked`.
   - Check MongoDB: content is stored as `encryptedContent` hex string + `iv` + `contentHash`.
3. **Peer Review**:
   - Sign in as `reviewer@sc-qpms.edu`.
   - Open Review Queue (`/reviewer/queue`), view decrypted text, submit comments, and approve review.
   - Status transitions to `Reviewed`.
4. **Authority Approval & Scheduling**:
   - Sign in as `authority@sc-qpms.edu`.
   - In `/authority/approvals`, approve the paper.
   - In `/authority/schedule`, schedule the exam date and start time.
   - Status transitions to `Scheduled`.
5. **Controlled Release & Device Validation**:
   - Sign in as `examcenter@sc-qpms.edu`.
   - In `/exam-center/release`, attempt release with unauthorized device ID (e.g. `HACKER-DEVICE`) -> verify `403 Device validation failed` and security event logged.
   - Attempt release before scheduled time -> verify `403 Paper cannot be released before scheduled exam time`.
   - Enter authorized device `CENTER-001` at or after scheduled time -> verify paper is successfully decrypted, status set to `Released`, SHA-256 verified, and print layout available.
6. **Audit & Surveillance**:
   - Sign in as `admin@sc-qpms.edu`.
   - Verify all above operations appear in `/admin/audit` and `/admin/security`.
