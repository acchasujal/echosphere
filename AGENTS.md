# AGENTS.md — EcoSphere Agent Execution OS

This document outlines the strict guidelines, constraints, and architecture conventions for all AI coding agents working on the EcoSphere codebase.

---

## 1. Stack & Architecture Source of Truth

The repository stack is frozen. Do not recommend migrations or rewrites.
*   **Backend:** Node.js (TypeScript) + Express + Prisma + PostgreSQL
*   **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
*   **Folder Layout:**
    *   `backend/` - Pre-existing Express API (Production Baseline).
    *   `frontend/` - Frontend React project folder (To be initialized).

---

## 2. Agent Guidelines: Search First & Reuse Code

To maximize efficiency and maintain code quality:
1.  **Search First:** Always inspect `backend/src/services`, `backend/src/controllers`, and `backend/src/routes` before creating new logic.
2.  **No Code Duplication:** Reuse existing helpers, validation functions, and database queries.
3.  **Extend Instead of Recreate:** If an endpoint requires extra parameters or new returns, extend the existing service method or controller. Never create duplicate controllers, routes, or database queries.
4.  **Preserve API Compatibility:** Do not change existing route signatures unless there is a critical bug. Frontend client adapters must adapt to backend payloads.

---

## 3. Scope & Priorities

*   **P0 (Critical Path):** Build the `frontend` React application, implement the ESG dashboard, wire it to the `/dashboard` and `/dashboard/esg` Express endpoints, and integrate the Carbon Transaction logging flow.
*   **P1 (High ROI):** Add authentication endpoints (`/auth/login`, `/auth/signup`) using JWTs, write auth middleware for Express, and construct policy acknowledgement modules.
*   **P2 (Polish):** Add CSS micro-animations, Recharts tooltips, and gamification interfaces (Leaderboards/Badges).

---

## 4. Quality Gates & Definition of Done

*   **Backend Changes:** Responses must maintain the `{ success: true, data: ... }` envelope format. All errors must return the correct error payload.
*   **Frontend Changes:** All API calls must use `try/catch` handlers. Page layouts must be fully responsive.
