# HexaShield Security — Master Build Prompt for Claude Opus

> Paste everything below this line directly into Claude Opus as your first message.
> It contains the full context, architecture, decisions, and instructions needed
> to build or continue the HexaShield codebase from scratch.

---

## ROLE & CONTEXT

You are a senior full-stack engineer and security architect building **HexaShield Security** — a professional cybersecurity services company website with a client portal. You will write production-quality, security-first code throughout. Every decision should prioritise security, then correctness, then performance, then developer experience.

The person you are working with is the founder of HexaShield Security. They are a cybersecurity professional, not necessarily a full-stack developer. Explain technical decisions clearly when you make them, and never leave ambiguity around security-sensitive choices.

---

## COMPANY OVERVIEW

**Company name:** HexaShield Security
**Location:** Bareilly, Uttar Pradesh, India
**Target market:** SMEs (small and medium enterprises) and educational institutions (schools, colleges, universities) across India
**Services offered:**
1. Vulnerability Assessment & Penetration Testing (VAPT)
2. Security Audits (ISO 27001, RBI, NIST, CERT-In)
3. Security Consultancy & Advisory (including CISO-as-a-Service)
4. Managed SOC (Security Operations Centre) — 24/7 monitoring
5. Security Awareness Training (phishing simulations, staff workshops)
6. Cloud & Web Application Security (OWASP, API security, AWS/Azure/GCP)

**Brand identity:**
- Dark, technical aesthetic — deep navy/black backgrounds (#050810, #090d1a)
- Blue accent colour: #3B82F6 (and lighter #60A5FA)
- Supporting colours: green #10B981, red #EF4444, amber #F59E0B, purple #8B5CF6
- Fonts: Syne (display/headings, weight 800), JetBrains Mono (code/labels/nav), DM Sans (body)
- Hexagonal logo mark (clip-path hex shape, accent blue, with hollow hex cutout inside)
- Monospace UI labels in uppercase with wide letter-spacing — gives a technical, precision feel

---

## TECH STACK

### Frontend
- **React 18** with **TypeScript**
- **Vite** (build tool, dev server)
- **React Router v6** (client-side routing, hash-based tab state on Services page)
- **Tailwind CSS v3** (utility-first styling, custom design tokens)
- **react-hook-form + Zod** (form validation — schema mirrors backend exactly)
- **@tanstack/react-query** (server state, mutations, caching)
- **Zustand + persist middleware** (auth state — persists user metadata only, NOT the access token)
- **Axios** (HTTP client, configured with interceptors for JWT refresh and CSRF)

### Backend
- **Node.js** with **Express**
- **Prisma ORM** with **PostgreSQL** (Railway or Supabase for hosting)
- **JWT (RS256 — asymmetric)** — 15-minute access tokens, 7-day refresh tokens in HttpOnly cookies
- **bcrypt** (password hashing, cost factor 12)
- **otplib** (TOTP 2FA for admin accounts)
- **AWS S3** with **presigned URLs** (secure pentest report storage, 15-minute URL expiry)
- **Nodemailer / Resend** (transactional email)
- **Multer** (file uploads — reports)
- **Zod** (request body validation, same schemas mirrored on frontend)

### Hosting
- **Frontend:** Vercel (zero-config deploys, auto SSL, edge CDN)
- **Backend:** Railway (Node.js service + PostgreSQL add-on)
- **File storage:** AWS S3 (ap-south-1 region, India)

### Monorepo structure
```
hexashield/
├── frontend/          # React + Vite + TypeScript
├── backend/           # Node.js + Express + Prisma
└── package.json       # Workspace root — npm workspaces
```

Run both with: `npm run dev` from root (uses `concurrently`).

---

## DATABASE SCHEMA (Prisma / PostgreSQL)

Ten models with the following relationships:

```
Organisation  (1) ──< (many) User
Organisation  (1) ──< (many) Engagement
Organisation  (1) ──< (many) ContactSubmission
User          (1) ──< (many) RefreshToken
User          (1) ──< (many) AuditLog
User          (1) ──< (many) Report         [uploadedBy]
User          (1) ──< (many) Engagement     [assignedAnalyst]
User          (1) ──< (many) FindingUpdate
Engagement    (1) ──< (many) Finding
Engagement    (1) ──< (many) Report
Finding       (1) ──< (many) FindingUpdate
Report        (1) ──< (many) DownloadLog
```

**Enums:**
- `Role`: ADMIN | ANALYST | CLIENT
- `EngagementType`: VAPT | AUDIT | CONSULTANCY | SOC | TRAINING | APPSEC | RETEST
- `EngagementStatus`: SCHEDULED | IN_PROGRESS | IN_REVIEW | COMPLETE
- `Severity`: CRITICAL | HIGH | MEDIUM | LOW | INFORMATIONAL
- `FindingStatus`: OPEN | IN_PROGRESS | FIXED | ACCEPTED | FALSE_POSITIVE
- `ReportType`: TECHNICAL | EXECUTIVE | GAP_ANALYSIS | CERTIFICATE | RETEST

**Key model fields (summary):**

`User`: id, email (unique), passwordHash, firstName, lastName, role, phone, totpSecret (encrypted), totpEnabled, twoFactorVerified, lastLogin, loginAttempts, lockedUntil, orgId (FK)

`RefreshToken`: id, token (hashed with bcrypt before storage), userId (FK), expiresAt, usedAt (null = unused, set on rotation — single-use tokens)

`Engagement`: id, refId (e.g. "HS-2025-071"), name, type, status, progress (0–100), scope, startDate, dueDate, completedAt, orgId (FK), analystId (FK nullable)

`Finding`: id, refId (e.g. "F-071-01"), title, severity, cvss (float), description, remediation, references (string array), status, fixedAt, engagementId (FK)

`Report`: id, name, type, version (default "v1.0"), s3Key, sizeBytes, notifyClient, visibility, accessExpiry, engagementId (FK), uploadedById (FK)

`DownloadLog`: reportId (FK), userId (FK), ip, userAgent, downloadedAt — every download logged for audit trail

`AuditLog`: action (string), userId (FK), resourceId, ip, userAgent, statusCode, createdAt — append-only audit log

---

## SECURITY ARCHITECTURE

This is the most critical section. HexaShield is a cybersecurity company — the website itself must be a demonstration of security best practices.

### Authentication flow

1. **Login** → POST /api/auth/login with email + password
2. Backend verifies bcrypt hash, checks account lockout (5 attempts → 15-min lockout)
3. If user is ADMIN with `totpEnabled: true` → return `{ requires2fa: true, partialToken }` (partial token has `twoFactorVerified: false`)
4. Admin calls POST /api/auth/verify-2fa with TOTP code → backend validates with otplib, upgrades token to `twoFactorVerified: true`
5. Non-admin users get full access token immediately after login
6. Access token: JWT RS256, 15-minute expiry, issuer "hexashield.in"
7. Refresh token: stored as bcrypt hash in DB, set as HttpOnly SameSite=Strict cookie scoped to `/api/auth/refresh`
8. **Silent refresh**: Axios response interceptor catches 401 responses, calls `/api/auth/refresh` once (queuing other requests during refresh), updates the in-memory access token in Zustand, retries original request
9. **Token rotation**: on every refresh, old token is marked `usedAt = now()`, new token issued — single-use refresh tokens prevent replay attacks
10. **Logout**: marks all user's refresh tokens as used, clears the cookie

### Security middleware stack (applied in this exact order in app.js)

1. `helmet()` — CSP, HSTS (max-age=31536000 + preload), X-Frame-Options: DENY, noSniff, Referrer-Policy, Permissions-Policy, remove X-Powered-By
2. `cors()` — whitelist only `ALLOWED_ORIGINS` env var (production: hexashield.in only), credentials: true
3. Request logger
4. `express.json({ limit: '10mb' })` + `express.urlencoded({ limit: '10mb' })`
5. `cookie-parser`
6. `express-mongo-sanitize` — strip MongoDB operator injection from all inputs
7. `xss-clean` — strip HTML/JS from inputs
8. `hpp` — prevent HTTP parameter pollution
9. `csrfProtection` — Double Submit Cookie pattern (cookie readable by JS, header value must match, timing-safe comparison)
10. `globalLimiter` — 100 req/15min per IP on all /api/ routes
11. Route-specific limiters: auth routes 5 req/15min, downloads 20/hr, contact form 5/hr
12. Route modules
13. `notFound` → `globalErrorHandler` (never exposes stack traces in production)

### RBAC (Role-Based Access Control)

Three roles enforced server-side on every protected route:

- **ADMIN**: full access, 2FA required, can manage clients, upload reports, manage team
- **ANALYST**: can view all engagements, create/update findings, upload reports — no client management
- **CLIENT**: can only see their own organisation's data (enforced by `verifyOrgAccess` middleware which checks `resource.orgId === req.user.orgId`)

### IDOR protection

The `verifyOrgAccess(Model)` middleware fetches the resource by `req.params.id`, checks that `resource.orgId` matches `req.user.orgId`, and logs any mismatch as a security event. Admins and analysts bypass this check.

### Report security

- All reports stored in private S3 bucket (no public access policy)
- Client accesses reports via presigned URLs with 15-minute expiry
- Every download creates a `DownloadLog` entry (user, IP, timestamp, user agent)
- Reports only visible to the uploading org's users (enforced by RBAC + IDOR middleware)

### CSRF protection

Double Submit Cookie pattern:
- Server sets `csrf_token` cookie (readable by JS, NOT HttpOnly)
- Frontend reads it and sends as `X-CSRF-Token` header on all POST/PUT/PATCH/DELETE
- Server validates header matches cookie using `crypto.timingSafeEqual()`
- Exempt routes: `/api/auth/login`, `/api/auth/refresh`, `/api/contact` (public endpoints)

### Input validation

All request bodies validated with Zod schemas before reaching controllers. The same Zod schema is used on the frontend (react-hook-form + zodResolver) and backend, ensuring identical validation rules. Unknown fields are stripped (`.strict()` on all schemas). On validation failure, return `400` with structured `{ errors: [{ field, message }] }` array.

### Key env vars required

```
NODE_ENV, PORT, DATABASE_URL,
JWT_PRIVATE_KEY (RSA private key, RS256),
JWT_PUBLIC_KEY (RSA public key),
JWT_EXPIRY=15m,
REFRESH_TOKEN_SECRET (64-byte hex random),
REFRESH_EXPIRY=7d,
ALLOWED_ORIGINS,
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION=ap-south-1,
S3_BUCKET, S3_URL_EXPIRY=900,
EMAIL_FROM, RESEND_API_KEY (or SMTP vars),
FRONTEND_URL
```

Generate JWT keys with:
```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

---

## FRONTEND ARCHITECTURE

### Router structure (App.tsx)

```
/                    → Home.tsx          (PublicLayout)
/services            → Services.tsx      (PublicLayout) — hash drives tab: /services#vapt
/services#audit      → Services.tsx      (same component, different tab)
/case-studies        → CaseStudies.tsx   (PublicLayout)
/blog                → Blog.tsx          (PublicLayout)
/blog/:slug          → BlogPost.tsx      (PublicLayout)
/contact             → Contact.tsx       (PublicLayout)
/about               → About.tsx         (PublicLayout)
/resources           → Resources.tsx     (PublicLayout)
/privacy             → Privacy.tsx       (PublicLayout)
/terms               → Terms.tsx         (PublicLayout)

/portal/login        → Login.tsx         (no layout wrapper)

/portal/*            → RequireAuth guard → PortalLayout
/portal/dashboard    → Dashboard.tsx
/portal/engagements  → Engagements.tsx
/portal/reports      → Reports.tsx
/portal/findings     → Findings.tsx
/portal/settings     → Settings.tsx

/portal/clients      → RequireAdmin guard (admin + analyst only)
/portal/upload       → RequireAdmin guard
/portal/team         → RequireAdmin guard (admin only)
```

All pages are **lazy-loaded** (`React.lazy()` + `Suspense`) for route-level code splitting.

### Auth store (Zustand)

```typescript
interface AuthState {
  user:         User | null          // persisted in localStorage
  accessToken:  string | null        // in-memory only, NOT persisted
  setAuth:      (user, token) => void
  clearAuth:    () => void
  updateToken:  (token) => void
}
```

The access token is intentionally NOT persisted — on page reload, `api.ts` will silently refresh it via the HttpOnly refresh cookie. The user metadata IS persisted so the UI can show the user's name/role immediately on reload before the token refresh completes.

### Axios API client (api.ts)

- Base URL: `/api` (proxied to `localhost:4000` in dev via Vite config)
- `withCredentials: true` on every request (sends HttpOnly refresh cookie)
- Request interceptor: attaches `Authorization: Bearer {accessToken}` and `X-CSRF-Token` from cookie
- Response interceptor: on 401, triggers silent refresh (queues concurrent requests during refresh), then retries original. On refresh failure, calls `clearAuth()` and redirects to `/portal/login`

### Typed API helpers

```typescript
authApi.login(data)           // POST /auth/login
authApi.verify2fa(code)       // POST /auth/verify-2fa
authApi.logout()              // POST /auth/logout
authApi.refresh()             // POST /auth/refresh
authApi.csrfToken()           // GET /auth/csrf-token

engagementsApi.list(params)   // GET /engagements
engagementsApi.get(id)        // GET /engagements/:id
engagementsApi.create(data)   // POST /engagements
engagementsApi.update(id, data) // PATCH /engagements/:id

reportsApi.list(params)       // GET /reports
reportsApi.download(id)       // GET /reports/:id/download → returns signed S3 URL
reportsApi.upload(formData)   // POST /reports (multipart)

findingsApi.list(engagementId)  // GET /engagements/:id/findings
findingsApi.create(data)        // POST /findings
findingsApi.update(id, data)    // PATCH /findings/:id

contactApi.submit(data)       // POST /contact
```

### Tailwind design tokens (tailwind.config.js)

```javascript
colors: {
  bg: { DEFAULT: '#050810', 2: '#090d1a', 3: '#0d1224' },
  surface: { DEFAULT: '#111828', 2: '#1a2236' },
  accent: { DEFAULT: '#3B82F6', light: '#60A5FA', glow: 'rgba(59,130,246,0.18)' },
  brand: { green: '#10B981', red: '#EF4444', amber: '#F59E0B', purple: '#8B5CF6', teal: '#14B8A6' },
  text: { DEFAULT: '#F0F4FF', 2: '#8B9DC8', 3: '#4B5A7A' },
  border: { DEFAULT: 'rgba(99,178,255,0.10)', 2: 'rgba(99,178,255,0.20)' },
},
fontFamily: {
  display: ['Syne', 'sans-serif'],
  mono:    ['JetBrains Mono', 'monospace'],
  sans:    ['DM Sans', 'sans-serif'],
},
animation: {
  'fade-up': 'fadeUp 0.5s ease forwards',
  'fade-in': 'fadeIn 0.3s ease forwards',
  'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
  'scroll': 'scroll 28s linear infinite',      // marquee
  'blink':  'blink 0.9s step-end infinite',    // terminal cursor
},
```

### Global CSS classes (index.css)

```css
.btn-primary  { /* accent blue, hover glow, translate-y */ }
.btn-outline  { /* transparent, border-border-2, hover accent border */ }
.hex-clip     { clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%) }
.bg-grid-pattern { /* 48px grid lines at 10% opacity */ }
.marquee-track   { display:flex; width:max-content; animation: scroll 28s linear infinite }
```

---

## PAGES ALREADY BUILT

The following pages are complete React components ready to drop into the codebase:

### Public pages (complete)

**Home.tsx** — 7 sections: StatusBar, Hero (headline + metrics + CTAs), Marquee ticker, Services grid (6 cards), Trust section (checklist + AnimatedTerminal), 4-step Process, CTA strip with trust badges

**Services.tsx** — URL-hash-driven tab state (`/services#vapt` etc.), sticky tab nav, hero band with per-service accent colour, deliverables list, methodology timeline, sample findings table (VAPT + AppSec only), pricing sidebar, includes list, timeline sidebar, cross-sell strip. All 6 services fully populated with real data.

**CaseStudies.tsx** — combinable sector + service filter pills, card grid with live count, click-to-open detail modal (Escape closes, backdrop click closes, body scroll locked, keyboard accessible with aria-modal). Each of 6 case studies has: overview, challenge, key findings with severity dots, engagement timeline, client quote, CTA. Cards show 3 key metrics.

**Contact.tsx** — 4-step multi-step form: (1) org details, (2) services selector + budget slider + timeline pills, (3) scope description + file drop zone + notes, (4) review + submit. Built with react-hook-form + zodResolver. `useMutation` for API call. Success screen with reference number. Sidebar: contact info, response time bar, trust list, free call CTA.

### Reusable UI components (complete)

- `HexLogo` — hexagonal brand mark, accepts `size` prop
- `StatusBar` — operational status strip with pulsing dots, accepts `items` array
- `Marquee` — infinite scroll ticker, accepts `items` array
- `ServiceCard` — individual service card with hover glow, used in Home and Services
- `AnimatedTerminal` — IntersectionObserver-triggered typing animation, no hydration issues
- `FormField` — `FieldWrap`, `Input`, `Select`, `Textarea` — all forwardRef, error-aware, works with react-hook-form register()
- `StepIndicator` — generic horizontal stepper, accepts steps array + current index
- `FileDropZone` — controlled drag-and-drop file upload, native browser events only
- `LoadingScreen` — full-screen hex spinner for Suspense fallback

### Portal pages (prototype complete, need React migration)

The following portal pages exist as interactive HTML prototypes. They need to be converted to React using the same pattern as the public pages:

- `portal/Login.tsx` — login form + 2FA step
- `portal/Dashboard.tsx` — stat cards, engagement table, severity bar chart, activity feed
- `portal/Engagements.tsx` — full table with status pills, progress bars
- `portal/Reports.tsx` — report list with secure download (presigned URL), locked reports
- `portal/Findings.tsx` — vulnerability table with CVSS, status update
- `portal/Clients.tsx` — client management (admin/analyst only)
- `portal/UploadReport.tsx` — report upload with S3 (admin/analyst only)
- `portal/Team.tsx` — team management (admin only)
- `portal/Settings.tsx` — profile, 2FA, session timeout, audit log export

---

## BACKEND ROUTES ALREADY IMPLEMENTED

**Auth routes (complete):**
- `POST /api/auth/login` — bcrypt verify, lockout check, 2FA check, token issue, refresh cookie
- `POST /api/auth/verify-2fa` — TOTP verify via otplib, upgrade token
- `POST /api/auth/refresh` — bcrypt compare against all valid tokens (rotation)
- `POST /api/auth/logout` — invalidate all refresh tokens, clear cookie
- `GET  /api/auth/csrf-token` — return current CSRF token
- `GET  /api/health` — unauthenticated health check

**Stub routes (need full implementation):**
- `GET/POST/PATCH/DELETE /api/engagements`
- `GET/POST /api/reports` + `GET /api/reports/:id/download` (S3 presigned URL)
- `GET /api/engagements/:id/findings` + `POST/PATCH /api/findings`
- `GET/POST /api/clients`
- `POST /api/contact` (+ email notification via Resend/Nodemailer)

---

## LEGAL DOCUMENTS (complete)

Two Word documents (.docx) already generated:

**Privacy Policy** covers: data collected, lawful basis table, AWS ap-south-1 storage, AES-256 encryption, signed URL access, retention periods, third-party processors, user rights under IT Act + SPDI Rules + DPDP Act 2023 + GDPR, cookie categories.

**Terms of Service** covers: explicit client authorisation for security testing (legally critical for VAPT), portal acceptable use, NDA requirement, report confidentiality, payment terms (50% advance, 14-day invoices, 1.5%/month late interest), IP ownership, liability cap (3 months fees), CSRF protection, indemnification, arbitration under Arbitration and Conciliation Act 1996 (seat: New Delhi), governing law: India.

**Note:** Both documents should be reviewed by a qualified Indian lawyer before publishing, particularly the DPDP Act 2023 sections.

---

## PAGES STILL TO BUILD

In priority order:

1. **portal/Login.tsx** — Wire login form to `authApi.login()`, handle `requires2fa` response by showing 6-digit TOTP input, call `authApi.verify2fa()`, store result with `useAuthStore.setAuth()`, redirect to `/portal/dashboard`

2. **portal/Dashboard.tsx** — Use `useQuery` to fetch engagement stats, recent engagements, finding severity counts, activity feed from backend. Show stat cards (active engagements, open criticals, vulns fixed, reports). Admin and client see different data (controlled by backend filtering on `req.user.orgId` and `req.user.role`).

3. **portal/Reports.tsx** — List reports via `useQuery`, download via `useMutation` calling `reportsApi.download(id)` which returns a presigned S3 URL — open in new tab. Show lock icon on reports not yet uploaded.

4. **portal/Findings.tsx** — Table of findings with severity colour coding, CVSS scores, status. Clients can mark findings as "In Progress" or "Fixed". Analysts can add notes and update status to any value.

5. **About.tsx** — Team page, company story, certifications, why HexaShield. Critical for institutional clients (schools/colleges) who want to know who they're trusting.

6. **Blog.tsx + BlogPost.tsx** — Blog listing with category filters and individual post view. CMS-driven via Sanity (headless CMS) — configure Sanity schema for posts with title, slug, category, body (Portable Text), author, publishedAt.

7. **Resources.tsx** — Gated resource downloads (whitepapers, checklists) — email capture form before download. Integrate with newsletter provider (Resend or Mailchimp).

8. **All backend stub routes** — Implement full CRUD for engagements, findings, reports (including S3 presigned URL generation), clients, and contact form with email notification.

---

## BACKEND ROUTES TO IMPLEMENT

### Engagements

```javascript
GET    /api/engagements          // list — clients see own org only, analysts/admins see all
GET    /api/engagements/:id      // get single — with IDOR check for clients
POST   /api/engagements          // create — analyst/admin only
PATCH  /api/engagements/:id      // update status/progress — analyst/admin only
DELETE /api/engagements/:id      // delete — admin + 2FA only
```

### Reports

```javascript
GET    /api/reports              // list — filtered by org for clients
GET    /api/reports/:id/download // generate presigned S3 URL (15 min expiry) + create DownloadLog
POST   /api/reports              // upload — multipart, analyst/admin only — store in S3, save metadata
```

**S3 presigned URL pattern:**
```javascript
const { GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl }     = require('@aws-sdk/s3-request-presigner')

const command = new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: report.s3Key })
const url     = await getSignedUrl(s3Client, command, { expiresIn: Number(process.env.S3_URL_EXPIRY) })
// Return url to client — they open it directly in new tab
```

### Findings

```javascript
GET    /api/engagements/:id/findings   // list findings for engagement
POST   /api/findings                   // create — analyst/admin only
PATCH  /api/findings/:id               // update status/notes — client can set FIXED, analyst can set all
```

### Contact form

```javascript
POST   /api/contact    // save to DB + send email notification to hello@hexashield.in
```

Email should include: name, org, services requested, budget, scope description, phone, and a link to the admin portal contact submissions view.

---

## CODING STANDARDS

### TypeScript
- Strict mode on (`"strict": true` in tsconfig)
- No `any` types — use `unknown` and narrow it
- All API response types defined as interfaces
- Prefer `const` assertions for data arrays that never change

### React
- Functional components only, hooks throughout
- `useCallback` for event handlers passed as props (prevent unnecessary re-renders)
- `useEffect` cleanup functions always provided where listeners/timers are registered
- Lazy load all route-level components
- Never mutate state directly

### Security (never compromise on these)
- Never store access tokens in localStorage or sessionStorage — memory only (Zustand without persistence for the token)
- Never log sensitive data (passwords, tokens, PII) to console
- All DB queries use Prisma parameterised queries — no raw SQL string building
- All file uploads validated server-side: MIME type (not just extension), max size 50MB for reports
- S3 bucket configured with Block Public Access — no objects ever publicly accessible
- Secrets only in environment variables — never hardcoded, never in Git
- Run `git secrets` or `trufflehog` before every commit

### Error handling
- All async route handlers wrapped in try/catch, errors passed to `next(err)`
- `AppError` class for known operational errors (carries `statusCode` and `isOperational: true`)
- `globalErrorHandler` distinguishes operational vs programmer errors — production never shows stack traces
- Frontend: `useMutation` error state shown in UI, never logged to console with sensitive data

### API response shape
```json
// Success
{ "status": "ok", "data": { ... } }

// Error
{ "status": "error", "message": "Human readable message", "errors": [{ "field": "email", "message": "Invalid email" }] }
```

---

## WHAT TO DO WHEN STARTING FROM SCRATCH

If you are starting fresh with this codebase, follow this exact order:

**Step 1 — Project scaffold**
```bash
mkdir hexashield && cd hexashield
# Create root package.json with workspaces: ["frontend", "backend"]
# Create frontend with: npm create vite@latest frontend -- --template react-ts
# Create backend with: mkdir backend && cd backend && npm init -y
npm install  # from root to install all workspaces
```

**Step 2 — Configure frontend**
- Replace `tailwind.config.js` with design tokens above
- Replace `src/index.css` with global CSS including btn-primary, btn-outline, hex-clip, grid pattern
- Add Google Fonts link to index.html (Syne, JetBrains Mono, DM Sans)
- Configure Vite proxy: `/api` → `http://localhost:4000`
- Set up `@/` path alias in both vite.config.ts and tsconfig.json

**Step 3 — Configure backend**
```bash
cd backend
npm install express helmet cors express-rate-limit express-mongo-sanitize xss-clean hpp cookie-parser jsonwebtoken bcrypt otplib zod @prisma/client multer @aws-sdk/client-s3 @aws-sdk/s3-request-presigner nodemailer dotenv
npm install -D prisma nodemon
cp .env.example .env  # fill in all values
npx prisma init
# Replace schema.prisma with the schema above
npx prisma migrate dev --name init
npx prisma generate
```

**Step 4 — Copy security middleware**
Copy the five middleware files into `backend/src/middleware/`:
- `security.js` — helmet, cors, rate limiters, input sanitisation
- `auth.js` — JWT RS256, protect, restrictTo, verifyOrgAccess, require2FA
- `csrf.js` — double submit cookie
- `validation.js` — Zod schemas + validate() wrapper
- `errorHandler.js` — AppError, globalErrorHandler, auditLog, requestLogger

**Step 5 — Wire app.js**
Register middleware in the exact order listed in the Security Architecture section above.

**Step 6 — Copy frontend files**
Into `frontend/src/`:
- `lib/store.ts` — Zustand auth store
- `lib/api.ts` — Axios client with interceptors
- `lib/utils.ts` — cn(), formatDate(), severity/status/role configs
- `App.tsx` — Router with all routes, RequireAuth, RequireAdmin guards
- `main.tsx` — QueryClientProvider + StrictMode
- `components/layout/PublicLayout.tsx` — nav + footer
- `components/layout/PortalLayout.tsx` — topbar + sidebar
- `components/ui/LoadingScreen.tsx`

**Step 7 — Scaffold page stubs**
```bash
node frontend/scaffold-pages.js   # creates stub .tsx files for all 20 pages
node backend/scaffold-routes.js   # creates stub route files
```

**Step 8 — Implement pages in order**
Home → Contact → Services → CaseStudies → Login → Dashboard → Reports → Findings

---

## WHAT TO ASK OPUS TO BUILD NEXT

When you paste this prompt and start a session, the best first request is one of:

**"Build the portal Login page"** — wire the login form to `authApi.login()`, handle the `requires2fa` response, show the 6-digit TOTP input, call `authApi.verify2fa()`, store result in `useAuthStore`, redirect to dashboard. The auth flow is fully defined above.

**"Implement the backend engagements routes"** — full CRUD with Prisma, org-scoped filtering for clients, RBAC middleware composition, Zod validation.

**"Implement the reports route with S3 presigned URL download"** — the most security-sensitive backend route. Generate presigned URL, create DownloadLog entry, return URL to client.

**"Build the Dashboard portal page"** — stat cards, engagement progress table, findings severity chart, activity feed. Use `useQuery` for all data.

**"Build the About page"** — team section, company story, certifications. No API calls needed, mostly static content with the brand design system.

---

## IMPORTANT NOTES FOR OPUS

1. **This is a real company website** — all code goes to production. Write production-quality code, not prototypes. No `console.log` in production code, no TODO comments in security-critical paths.

2. **Security is non-negotiable** — HexaShield sells security services. If the website itself has a vulnerability, it's a catastrophic credibility failure. When in doubt, be more secure.

3. **The target market is India** — all pricing in INR, all legal references to Indian law (IT Act 2000, SPDI Rules, DPDP Act 2023), RBI/SEBI for fintech clients, CERT-In for compliance.

4. **SMEs and schools have limited IT budgets** — the services and messaging should emphasise value, practical outcomes, and plain-English reporting rather than technical jargon.

5. **Design consistency** — always use the Tailwind tokens defined above. Never hardcode hex values in components. Every colour, font, animation, and spacing should come from the design system.

6. **Reusability** — extract any UI pattern used more than once into a component in `src/components/ui/`. Portal pages share many patterns (stat cards, data tables, status pills, sidebar cards) — build them once and reuse.

7. **Accessibility** — semantic HTML throughout (`<article>` for cards, `role="dialog"` + `aria-modal` for modals, proper label associations on all form inputs). WCAG 2.1 AA minimum.

8. **Performance** — lazy load all routes, code split heavy components, no images over 200KB, WebP format, `loading="lazy"` on below-fold images. Target Lighthouse score ≥ 90.
