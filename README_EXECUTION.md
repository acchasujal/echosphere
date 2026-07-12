# README_EXECUTION.md — Developer Execution Guide

This document defines the exact workflow for finishing the EcoSphere project during the remaining hackathon hours.

---

## Technical Onboarding (Express + Prisma)

### Backend Services Startup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run database migration and seed logic:
   ```bash
   npx prisma db push
   npm run db:seed
   ```
3. Start the watch dev server:
   ```bash
   npm run dev
   ```

### Frontend Scaffold (Planned)
1. Initialize Vite React template:
   ```bash
   npm create vite@latest frontend -- --template react-ts
   ```
2. Install dependencies:
   ```bash
   cd frontend
   npm install react-router-dom axios lucide-react recharts
   ```

---

## Git Workflow: Parallel Feature Branches

To prevent integration blocks:
1. Work is split into parallel worktrees:
   * `backend/` - Pre-existing backend operations.
   * `frontend/` - React UI pages.
2. Commit messages must use clear identifiers:
   `feat(ui): Add dashboard scorecards`

---

## Integration Checkpoints

*   **12:00 PM:** Initialize React shell and sidebar navigation.
*   **1:00 PM:** Complete ESG Scorecards and Recharts graph data binding.
*   **2:00 PM:** Integrate Carbon logs form and CSR list tables.
*   **3:00 PM:** Final feature freeze. Verify all routes locally via `node verify.js`.
*   **4:00 PM:** Demo rehearsal and video recording.
