# BikaSafe — Digital VSLA Platform

**BikaSafe** is a full-stack digital Village Savings and Loan Association (VSLA) management platform built for community savings groups in Rwanda and across East Africa.

## ✨ Features

### Core VSLA Operations
- **Savings Contributions** — Track member contributions with automated reference numbers, fund types (Savings/Social), and late/missed status tracking
- **Loan Management** — Request, approve, and track loans with configurable interest rates, deadlines, and guarantor co-signing
- **Payout Disbursements** — Multi-approval payout system with treasury balance verification to prevent overdrafts
- **Penalty Engine** — Automated penalty assessment for missed contributions with idempotency protection and admin waiver capability

### Group Administration
- **Role-Based Access** — Admin, Treasurer, Member, and Auditor roles with JWT-secured endpoints
- **Meetings & Attendance** — Schedule meetings and track member attendance
- **Announcements** — Post group-wide announcements (General, Meeting, Urgent, Reminder types)
- **Polls & Voting** — Democratic decision-making with one-vote-per-member enforcement
- **Audit Logs** — Complete financial audit trail for every transaction

### Advanced Features
- **Progressive Web App (PWA)** — Installable on mobile devices with offline caching for low-connectivity areas
- **Automated SMS Reminders** — Daily CRON jobs alert members about upcoming loan deadlines and unpaid penalties
- **Loan Guarantors** — Members can co-sign loans for peer accountability
- **Financial Reports** — Downloadable Excel reports for group treasurers
- **USSD Integration** — Basic USSD endpoint for feature phone access

### Security & Reliability
- **Rate Limiting** — Brute-force protection on authentication routes
- **Input Validation** — Zod schemas on all financial endpoints preventing negative-value injection
- **Treasury Safety** — Real-time liquidity checks before payout approval
- **Password Policy** — Force-change on first login, secure bcrypt hashing

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express 5, TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma ORM |
| Auth | JWT with bcrypt password hashing |
| PWA | vite-plugin-pwa with Workbox |
| Deployment | Render (render.yaml blueprint) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Clone the Repository
```bash
git clone https://github.com/nyves377-bit/BikaSafe.git
cd BikaSafe
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Edit with your real credentials
npx prisma db push      # Create/sync database tables
npm run dev              # Starts on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev              # Starts on http://localhost:3000
```

### 4. Demo Login
Once both servers are running, use the demo login endpoint:
```
POST http://localhost:5001/api/auth/demo-login
```

---

## 📁 Project Structure

```
BikaSafe/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (15 models)
│   └── src/
│       ├── index.ts             # Express server entry point
│       ├── middleware/auth.ts   # JWT authentication guard
│       ├── routes/              # API route handlers
│       │   ├── auth.ts          # Register, login, demo-login
│       │   ├── contribution.ts  # Savings & social fund contributions
│       │   ├── loan.ts          # Loan requests & repayments
│       │   ├── payout.ts        # Disbursement approvals
│       │   ├── penalty.ts       # Fines & waiver system
│       │   ├── group.ts         # Group CRUD & member management
│       │   ├── announcement.ts  # Group announcements
│       │   ├── meeting.ts       # Meeting scheduling
│       │   ├── poll.ts          # Voting system
│       │   ├── audit.ts         # Audit log viewer
│       │   ├── report.ts        # Excel report generation
│       │   ├── upload.ts        # File upload handler
│       │   └── ussd.ts          # USSD gateway
│       └── services/            # Business logic
│           ├── cronService.ts   # Scheduled SMS reminders
│           ├── penaltyEngine.ts # Automated penalty assessment
│           ├── groupService.ts  # Treasury liquidity calculator
│           ├── smsService.ts    # SMS dispatch
│           ├── emailService.ts  # Email notifications
│           └── paymentService.ts # Mobile Money integration
├── frontend/
│   └── src/
│       ├── App.tsx              # Router & auth guard
│       ├── pages/
│       │   ├── LandingPage.tsx  # Marketing homepage
│       │   ├── LoginPage.tsx    # Authentication
│       │   ├── SignupPage.tsx   # Group + user registration
│       │   └── Dashboard.tsx    # Main application dashboard
│       ├── components/          # Shared components
│       ├── api/instance.ts      # Axios with JWT interceptors
│       └── context/             # React context providers
└── render.yaml                  # Render deployment blueprint
```

---

## 🌍 Deployment

BikaSafe uses a [Render Blueprint](https://render.com/docs/blueprint-spec) for one-click deployment:

1. Push to GitHub
2. Connect repository in Render Dashboard
3. Render auto-detects `render.yaml` and provisions:
   - **Backend** — Node.js web service
   - **Frontend** — Static site (Vite build)
   - **Database** — PostgreSQL instance

---

## 📄 License

ISC

---

Built with ❤️ for community savings groups across East Africa.
