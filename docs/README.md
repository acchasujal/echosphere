# EcoSphere — ESG Management & Gamification Platform

EcoSphere is a comprehensive ESG (Environmental, Social, Governance) management platform designed to help organizations monitor, analyze, and reward corporate sustainability efforts. It automates carbon emission tracking, incentivizes community service participation, validates policy governance compliance, and engages employees through a gamified badging and rewards engine.

---

## Technical Architecture

*   **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL
*   **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui (Planned/Work in Progress)
*   **Database:** PostgreSQL with Prisma Client for schema definition and migrations.

---

## Directory Layout

*   `backend/` - Complete Express + Prisma backend codebase.
*   `frontend/` - React frontend application (TODO).
*   `AGENTS.md` - Technical architecture guidelines and AI execution instructions.
*   `API_SPEC.md` - Documented API routing, payloads, and scoring formulas.
*   `TASKS.md` - Execution roadmap for remaining P0, P1, and P2 tasks.
*   `DEFINITION_OF_DONE.md` - Checklist for merge validation.
*   `README_EXECUTION.md` - Step-by-step developer onboarding and execution instructions.

---

## Quick Start (Backend)

### Prerequisites
*   Node.js 18+
*   PostgreSQL database

### Running Locally
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your database URL in a `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/echosphere"
   ```
4. Run migrations:
   ```bash
   npx prisma db push
   ```
5. Seed the database:
   ```bash
   npm run db:seed
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

The backend server runs on `http://localhost:3000`. You can verify endpoints by running the verification suite:
```bash
node verify.js
```
