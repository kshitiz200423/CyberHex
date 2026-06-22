# Auronix Technologies

> Enterprise-grade cybersecurity services & client portal for Indian SMEs and educational institutions.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-purple)

## 🏗️ Architecture

```
auronix/
├── frontend/          # React 18 + TypeScript + Vite + Tailwind CSS
├── backend/           # Node.js + Express + Prisma + PostgreSQL
└── package.json       # Monorepo root (npm workspaces)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (local or hosted)
- A private GitHub repo for report storage (optional)

### Setup

```bash
# 1. Clone and install
git clone <your-repo-url>
cd auronix
npm install

# 2. Configure environment
cp .env.example backend/.env
# Edit backend/.env with your database URL and other settings

# 3. Generate JWT keys
cd backend
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
# Add key contents to .env (replace newlines with \n)

# 4. Set up database
npx prisma migrate dev --name init
npx prisma generate
npm run db:seed

# 5. Start development
cd ..
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:4000`.

### Default Login Credentials (from seed)

| Role    | Email                           | Password        |
|---------|--------------------------------|-----------------|
| Admin   | admin@auronix.in            | Auronix@2025 |
| Analyst | analyst@auronix.in          | Analyst@2025    |
| Client  | client@demouniversity.edu.in   | Client@2025     |

## 🔒 Security Architecture

- **JWT RS256** asymmetric tokens (15-min access, 7-day refresh)
- **bcrypt** password hashing (cost factor 12)
- **TOTP 2FA** for admin accounts
- **CSRF** double submit cookie pattern
- **Rate limiting** on all endpoints
- **Helmet** security headers (CSP, HSTS, X-Frame-Options)
- **RBAC** with three roles: Admin, Analyst, Client
- **IDOR protection** via org-scoped resource access
- **Audit logging** for all sensitive operations

## 📁 Report Storage

Reports are stored in a **private GitHub repository** (no cloud costs):
- Upload via GitHub Contents API
- Downloads proxied through backend
- Configure `GITHUB_STORAGE_*` variables in `.env`
- Falls back to local filesystem if GitHub token not configured

## 🎨 Design System

- **Primary BG:** #050810 (deep navy)
- **Accent:** #3B82F6 (blue)
- **Fonts:** Syne (display), JetBrains Mono (code), DM Sans (body)
- **Aesthetic:** Dark, technical, hexagonal motifs

## 📋 Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v3 |
| Backend  | Node.js, Express, Prisma ORM |
| Database | PostgreSQL |
| Auth     | JWT RS256, bcrypt, otplib (TOTP) |
| Storage  | GitHub API (private repo) |
| Email    | Resend / Nodemailer |

## 📜 Legal

- Privacy Policy: `/privacy`
- Terms of Service: `/terms`
- Both documents reference Indian law (IT Act 2000, DPDP Act 2023)
- **Review by a qualified Indian lawyer recommended before publishing**

---

Built with 🛡️ by Auronix Technologies, Bareilly, India
