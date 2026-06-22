# Harari PCC Portal — Professional Competence Certificate

The official **Professional Competence Certificate (PCC)** portal for the **Harari People Regional State, Ethiopia**. Operated by the Trade, Industry & Tourism Development Bureau, this platform allows citizens to apply for the mandatory competence certification required to open and operate a business in the Harari Region.

Built with **Next.js 16**, **TypeScript**, **Prisma**, and a Harari-cultured design system inspired by the colorful walls of historic Harar Jugol (UNESCO World Heritage Site).

---

## Features

### For Applicants (Citizens)
- **Online Application** — 5-step wizard: Personal → Business → Documents → Assessment → Review & Submit
- **Document Upload** — Upload National ID, Business Plan, TIN, Health Certificate, Lease Agreement, and more (PDF/JPG/PNG/DOCX up to 5 MB each, stored encrypted as base64)
- **Competence Assessment** — Randomized 10-question test from a 17-question bank covering:
  - Ethiopian business registration & TIN
  - VAT & taxation
  - Harari regional regulations
  - Consumer protection law
  - Labour law
  - Health & hygiene (food businesses)
  - Accounting & record-keeping
  - Banking & finance
  - Business ethics
- **Real-time Tracking** — DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED → CERTIFICATE_ISSUED
- **Certificate View & Print** — Beautiful Harari-styled certificate with Print/Save-as-PDF support
- **Timeline View** — Full audit trail of every action on your application

### For Reviewers / Admins (Regional Officers)
- **Application Queue** — Filter by status (Submitted, Under Review, Issued, Rejected) and full-text search
- **Dashboard Analytics** — Counts by status, certificates issued by sector, recent activity feed
- **Review Workflow** — Claim → Approve (auto-issues certificate) or Reject (with mandatory reason)
- **Document Viewer** — Open any uploaded document in a new browser tab
- **Certificate Verification** — View issued certificates with full detail

### Platform-Wide
- **Role-based Access** — APPLICANT / REVIEWER / ADMIN roles enforced server-side
- **Audit Logging** — Every login, application change, review action, and certificate issuance is logged
- **In-app Notifications** — Applicants are notified on submission, claim, approval, and rejection; reviewers are notified on new submissions
- **Secure Session** — JWT-based sessions in httpOnly cookies (7-day expiry)
- **Harari Cultural Design** — Color palette (royal purple, gold, terracotta, cream, green), 8-pointed Islamic star motif, geometric Harar-Jugol-inspired patterns, Playfair Display serif typography

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Database | Prisma ORM with SQLite |
| Auth | bcryptjs + jose (JWT) — httpOnly cookies |
| Icons | Lucide React |
| Fonts | Geist Sans / Mono + Playfair Display |
| State | React hooks + TanStack Query |
| Notifications | sonner (toast) |
| Forms | Native React state + shadcn form components |

---

## Project Structure

```
.
├── prisma/
│   └── schema.prisma              # Database models
├── public/
│   └── favicon.svg                # Harari star favicon
├── scripts/
│   └── seed.ts                    # Database seed script
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── applications/      # CRUD + submit endpoint
│   │   │   ├── assessment/        # Question bank + grading
│   │   │   ├── auth/              # register / login / logout / me
│   │   │   ├── certificates/      # List + public verification
│   │   │   ├── documents/         # Upload / list / delete / fetch
│   │   │   ├── admin/stats/       # Reviewer dashboard analytics
│   │   │   ├── notifications/     # In-app notification feed
│   │   │   └── review/            # Reviewer action endpoint
│   │   ├── globals.css            # Harari-themed design system
│   │   ├── layout.tsx
│   │   └── page.tsx               # Single-page app shell
│   ├── components/
│   │   ├── applicant/             # Applicant dashboard + assessment runner
│   │   ├── auth/                  # Login/register card
│   │   ├── certificate/           # Certificate render view
│   │   ├── harari/                # Cultural decorations (stars, borders, patterns)
│   │   ├── landing/               # Public landing page
│   │   ├── reviewer/              # Reviewer/admin console
│   │   └── ui/                    # shadcn/ui components
│   ├── hooks/
│   │   └── useAuth.ts
│   └── lib/
│       ├── assessment.ts          # 17-question bank
│       ├── auth.ts                # JWT session helpers
│       ├── db.ts                  # Prisma client
│       └── helpers.ts             # Reference number + formatting utils
├── .env                           # DATABASE_URL
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- **Node.js 18+** (recommended for Windows users) — download from https://nodejs.org
- **OR Bun** (faster, recommended for Mac/Linux) — install from https://bun.sh
- **Prisma CLI** (comes automatically with `npm install` / `bun install`)

### Installation

```bash
# Install dependencies
npm install
# OR if you have Bun installed:
# bun install

# Push the database schema
npx prisma db push
# OR: bun run db:push

# Seed default admin / reviewer / applicant accounts
npx tsx scripts/seed.ts
# OR: bun run scripts/seed.ts
```

### Running the Dev Server

```bash
npm run dev
# OR: bun run dev
```

Open `http://localhost:3000` in your browser.

> **Note for Windows users:** Use `npx` and `npm` commands. The project's `package.json` is fully cross-platform — no Unix-specific commands like `tee` or `cp` are used.

### Default Demo Accounts

After running the seed script, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Applicant | `applicant@example.com` | `Applicant@2026` |
| Reviewer | `reviewer@hararipcc.gov.et` | `Reviewer@2026` |
| Admin | `admin@hararipcc.gov.et` | `Admin@2026` |

---

## Application Workflow

```
                              ┌──────────────────────────────────────┐
                              │                                      │
   [Register/Login] ─────► [Create Draft] ──► [Fill Personal Info]  │
                                                  │                  │
                                                  ▼                  │
                                          [Fill Business Info]       │
                                                  │                  │
                                                  ▼                  │
                                          [Upload Documents]         │
                                            (National ID +          │
                                             Business Plan          │
                                             required)               │
                                                  │                  │
                                                  ▼                  │
                                          [Take Assessment]          │
                                            (10 of 17 questions,    │
                                             70% to pass,           │
                                             unlimited retries)     │
                                                  │                  │
                                                  ▼                  │
                                          [Review & Submit]          │
                                                  │                  │
                                                  ▼                  │
                                          [SUBMITTED]                │
                                                  │                  │
                              ┌───────────────────┘                  │
                              ▼                                       │
                  [Reviewer: Claim for Review]                       │
                              │                                       │
                              ▼                                       │
                      [UNDER_REVIEW]                                 │
                              │                                       │
                              ├──► [Approve] ──► [CERTIFICATE_ISSUED]│
                              │                       │              │
                              │                       ▼              │
                              │              [Certificate Issued]    │
                              │              (2-year validity)       │
                              │                                      │
                              └──► [Reject] ──► [REJECTED]           │
                                                     │               │
                                                     ▼               │
                                          [Applicant can re-apply] ──┘
```

---

## Database Schema

| Model | Purpose |
|-------|---------|
| `User` | Applicants, reviewers, and admins. Includes role, region, woreda, kebele. |
| `Application` | A PCC application with all personal, business, and assessment data. |
| `Document` | Uploaded files (base64-encoded in DB for portability). |
| `Certificate` | Issued certificate with unique number and 2-year validity. |
| `AuditLog` | Every action recorded with user, target, and IP address. |
| `Notification` | In-app notifications for users. |
| `SystemSetting` | Reserved for future system configuration. |

---

## API Reference

### Auth
- `POST /api/auth/register` — Register as APPLICANT or REVIEWER
- `POST /api/auth/login` — Sign in (returns user, sets session cookie)
- `POST /api/auth/logout` — Sign out
- `GET /api/auth/me` — Current user info

### Applications
- `GET /api/applications` — List (own apps for applicants; all for reviewers)
- `POST /api/applications` — Create new draft
- `GET /api/applications/[id]` — Get full detail with documents, audit logs, certificate
- `PATCH /api/applications/[id]` — Update draft fields
- `DELETE /api/applications/[id]` — Delete draft
- `POST /api/applications/[id]/submit` — Submit for review (validates required fields + documents + assessment)

### Documents
- `POST /api/documents` — Upload (multipart/form-data, max 5MB)
- `GET /api/documents?appId=...` — List documents for an application
- `GET /api/documents?id=...` — Get single document with file content (base64)
- `DELETE /api/documents?id=...` — Delete (only on DRAFT applications)

### Assessment
- `GET /api/assessment` — Get 10 random questions (without correctIndex)
- `POST /api/assessment` — Submit answers; returns score, per-question results with explanations

### Review (REVIEWER / ADMIN only)
- `GET /api/review` — List all submitted applications
- `PATCH /api/review` — `{ applicationId, action: 'CLAIM' | 'APPROVE' | 'REJECT', note? }`

### Certificates
- `GET /api/certificates` — List user's certificates (or all for reviewers)
- `GET /api/certificates?verify=HRS-PCC-CERT-2026-0001` — **Public** verification endpoint

### Admin
- `GET /api/admin/stats` — Dashboard statistics (counts, sector breakdown, recent activity)

### Notifications
- `GET /api/notifications` — List user's notifications + unread count
- `POST /api/notifications` — Mark as read (`{ id }` or `{ markAll: true }`)

---

## Harari Design System

The portal's visual identity is rooted in Harari cultural heritage:

### Color Palette
| Color | Hex | Source |
|-------|-----|--------|
| Royal Purple | `#5B2A86` | Traditional Harari dresses |
| Gold / Ochre | `#D4A537` | Harar Jugol wall accents |
| Terracotta | `#B5471A` | Earthy red-brown from Harari pottery |
| Cream / Ivory | `#FBF3E2` | Background of traditional houses |
| Islamic Green | `#2E7A5A` | Cultural accent |
| Indigo Blue | `#1E3A5F` | Harari evening sky |

### Cultural Motifs
- **8-pointed star** (Rub el Hizb) — Used in logo, certificate seal, hero decoration
- **Geometric patterns** — Inspired by Harar Jugol's colorful house interiors
- **Pointed arch shapes** — Echoing Islamic architecture of Harar's mosques
- **Stylized corner ornaments** — On the certificate document

### Typography
- **Playfair Display** — Headings (serif, classical, ceremonial feel)
- **Geist Sans** — Body text (modern, readable)

---

## Security Considerations

This is a demo / educational project. For production deployment, you should:

1. **Change `SESSION_SECRET`** in `.env` to a strong random value
2. **Use a real database** (PostgreSQL recommended) instead of SQLite
3. **Store documents on object storage** (e.g., S3, OSS) instead of base64 in DB
4. **Add rate limiting** on auth endpoints to prevent brute force
5. **Add CAPTCHA** on registration
6. **Set up email notifications** (the system currently uses in-app notifications only)
7. **Add CSRF protection** if deploying without same-origin guarantees
8. **Conduct a security audit** before handling real citizen data
9. **Integrate with the actual ERCA TIN API** for real-time TIN verification
10. **Add official digital signatures** (e.g., PAdES) to the issued PDF certificates

---

## License

© 2026 Harari Region Trade, Industry & Tourism Development Bureau.
Built for the Harari People Regional State, Ethiopia.

---

*"Harar is the fourth holiest city of Islam, with 82 mosques within its walls, and has been a center of trade and learning for centuries. This portal continues that tradition in the digital age."*
