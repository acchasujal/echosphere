# EcoSphere — ESG Management & Gamification Platform

EcoSphere is a full-stack ESG (Environmental, Social, Governance) management platform built for the **Odoo Grand Finale Hackathon 2026**. It helps organizations monitor corporate sustainability, track carbon emissions, incentivize employee participation through gamification, and govern policy compliance — all in a single polished SaaS interface.

> ⚡ **AI-Assisted Development** — This project was built with AI-assisted code generation and reviewed by the team for correctness and design quality.

---

## ✅ Implemented Features

### Dashboard
- Real-time ESG score computation (Environmental, Social, Governance)
- Department-level ESG breakdown with radar & bar charts
- Top contributors leaderboard
- System statistics panel

### Carbon Tracking
- Log corporate greenhouse gas emissions per department
- Auto-estimates CO₂ based on source type (electricity, fuel, travel, waste)
- Filter by department and source; delete records
- Running totals and volume statistics

### CSR & Social
- Create and view corporate social responsibility activities
- Category, location, date range, and points reward per activity
- Status tracking (ACTIVE / completed)

### Governance (Policies & Compliance)
- Publish ESG policies and acknowledge them per employee
- Log compliance issues with department assignment and due date
- Mark issues resolved; auto-notification sent to assignee
- Overdue issue detection with visual alerts

### Gamification & Rewards
- Employee XP leaderboard sorted by experience
- Badge catalog with unlock status per employee
- Badge auto-evaluation endpoint (award based on XP threshold)
- Rewards catalog with point-based redemption
- Per-employee notification feed (read / delete)

---

## 🚧 Partially Implemented

| Feature | Status |
|---|---|
| User authentication / login | Not implemented — simulates first employee as current user |
| Report generation | Backend service exists; no dedicated frontend page |
| Challenge management UI | Backend API exists; no frontend page |
| Audit trails | Backend API exists; no frontend page |

---

## 🔮 Future Scope

- Real authentication with JWT sessions
- Report export (PDF/CSV)
- Dark mode toggle
- Multi-tenant organization support
- Email notifications on compliance alerts
- Mobile-responsive breakpoints for tablet/phone

---

## Known Limitations

- **Current user is simulated** as `employees[0]` — no real login flow
- **DepartmentScore table** is pre-seeded; not dynamically recalculated on every carbon transaction (ESG scores from `/dashboard/esg` are formula-computed from live data)
- SQLite used for development; PostgreSQL schema-compatible

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS |
| State Management | TanStack Query v5 |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express 5, TypeScript |
| ORM | Prisma |
| Database | SQLite (dev) / PostgreSQL (prod) |

---

## Quick Start

### Backend

```bash
cd backend
npm install
# Configure .env: DATABASE_URL="file:./prisma/dev.db"
npx prisma db push
npm run db:seed
npm run dev            # Runs on http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev            # Runs on http://localhost:5173
```

The frontend proxies `/api/*` → `http://localhost:3000` via Vite dev server.

### Verify Backend

```bash
cd backend
node verify.js         # Runs API smoke tests
```

---

## Demo Flow (for Judges)

1. **Dashboard** — View overall ESG scores, department breakdown radar chart, top contributors
2. **Carbon Tracking** — Click "Log Emission", select department, enter source & quantity (CO₂ auto-estimated), submit
3. **CSR & Social** — Click "Create Activity", fill out event details, view card grid
4. **Governance** — Publish a policy, acknowledge it, log a compliance issue with due date, mark resolved
5. **Gamification** — Click "Evaluate My Badges" to auto-award badges based on XP; redeem rewards; view notifications

---

## Directory Layout

```
echosphere/
├── backend/           Express + Prisma backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── server.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── verify.js      API smoke test suite
├── frontend/          React + Vite frontend
│   ├── src/
│   │   ├── pages/     Dashboard, CarbonTracking, CSR, Governance, Rewards
│   │   ├── components/
│   │   └── lib/
│   └── index.html
└── docs/
    ├── API_SPEC.md
    ├── DESIGN_SYSTEM.md
    ├── TASKS.md
    └── AGENTS.md
```
