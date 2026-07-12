# TASKS.md — EcoSphere Execution Roadmaps

This document serves as the roadmap for all remaining tasks required to complete the EcoSphere MVP.

---

# Current Repository Status

*   **Backend:** **55% Complete**. Express backend is running on Node/TypeScript + Prisma. Standard CRUD endpoints for employees, challenges, rewards, participations, badges, carbon transactions, and notifications are implemented.
*   **Database:** **90% Complete**. Schema exists in Prisma and is fully seeded with test data via `npm run db:seed`.
*   **API:** **50% Complete**. APIs exist but are unauthenticated. Standard response envelope wrapping is partially missing on endpoints like GET `/dashboard`.
*   **Frontend:** **0% Complete**. No frontend workspace exists.
*   **Testing:** **75% Complete**. Automated integration checks are defined in `backend/verify.js` and pass.
*   **Demo Readiness:** **5%**. Un-demoable without a frontend client.
*   **Overall Completion %:** **25%**.

---

# Remaining Critical Path

1.  **Initialize React Frontend Application:** Create a `frontend` folder at root using Vite + Tailwind + shadcn.
2.  **Dashboard UI Development:** Develop cards, charts, and tables for the main dashboard.
3.  **Dashboard API Integration:** Bind dashboard charts to the Express `/dashboard` and `/dashboard/esg` endpoints.
4.  **Carbon Logging Form:** Create UI to submit carbon transactions to `/carbon-transactions`.
5.  **CSR Logging & Approvals:** Create a UI for logging and completing CSR activities.
6.  **Responsive Polish & Charts:** Ensure Recharts graphs resize properly.
7.  **Authentication Integration (P1):** Create Login/Signup backend routes and bind them to the frontend context.
8.  **Governance & Policy Acknowledgment (P1):** Build policy ACK endpoints and UI page.
9.  **Gamification Features (P2):** Display badges and rewards.
10. **Demo Rehearsal & Submission:** Verify end-to-end integration and record the fallback presentation video.

---

## P0 (Critical Before Demo)

### F1: Create React Frontend Shell (P0)
*   **Objective:** Set up Vite + TypeScript + Tailwind + shadcn in `frontend/` directory.
*   **Files:** `frontend/*`
*   **Deps:** None
*   **Duration:** 45 mins
*   **Acceptance Criteria:** Frontend runs on port 5173 and contains a main shell.
*   **AI Prompt Summary:** Set up Vite React TS with Tailwind and shadcn UI, configuring a layout layout with sidebar.
*   **Owner:** Team BRUH
*   **Priority:** Critical
*   **Risk:** Low

### F2: Dashboard UI & Integration (P0)
*   **Objective:** Implement score cards, department tables, and Recharts graphs.
*   **Files:** `frontend/src/pages/Dashboard.tsx`
*   **Deps:** F1
*   **Duration:** 60 mins
*   **Acceptance Criteria:** Renders ESG breakdown metrics and binds `/dashboard` + `/dashboard/esg` APIs.
*   **AI Prompt Summary:** Create Dashboard page fetching ESG scores from port 3000 and displaying a Recharts radar/bar chart.
*   **Owner:** Team BRUH
*   **Priority:** Critical
*   **Risk:** Medium

### F3: Carbon Transaction Flow (P0)
*   **Objective:** Create carbon emission log form and transaction list table.
*   **Files:** `frontend/src/pages/CarbonTracking.tsx`
*   **Deps:** F1
*   **Duration:** 45 mins
*   **Acceptance Criteria:** Logs emission details to POST `/carbon-transactions` and refreshes Dashboard views.
*   **AI Prompt Summary:** Create Carbon logging form with react-hook-form and zod, mapping POST and GET requests.
*   **Owner:** Team BRUH
*   **Priority:** Critical
*   **Risk:** Medium

---

## P1 (High Value)

### B1: Backend JWT Auth & Guard (P1)
*   **Objective:** Implement JWT login/signup routes and middleware.
*   **Files:** `backend/src/routes/auth.routes.ts`, `backend/src/middleware/auth.ts`
*   **Deps:** None
*   **Duration:** 30 mins
*   **Acceptance Criteria:** Secures POST and DELETE endpoints.
*   **AI Prompt Summary:** Generate Express auth router for signup and login, verifying passwords via bcrypt and JWT token headers.
*   **Owner:** Team BRUH
*   **Priority:** High
*   **Risk:** Medium

### F4: Auth UI Pages (P1)
*   **Objective:** Build login and signup views in the frontend.
*   **Files:** `frontend/src/pages/Login.tsx`
*   **Deps:** B1, F1
*   **Duration:** 30 mins
*   **Acceptance Criteria:** Redirects unauthenticated users to `/login`.
*   **AI Prompt Summary:** Create simple login page matching API spec and handling token storage.
*   **Owner:** Team BRUH
*   **Priority:** High
*   **Risk:** Medium

---

## P2 (Polish)

### F5: CSR Activity Logging (P2)
*   **Objective:** Display active CSR events and volunteer signup options.
*   **Files:** `frontend/src/pages/CSR.tsx`
*   **Deps:** F1
*   **Duration:** 40 mins
*   **Acceptance Criteria:** Managers can create activities (POST `/csr`) and users can participate.
*   **Owner:** Team BRUH
*   **Priority:** Medium
*   **Risk:** Low

---

## P3 (Future Vision)
*   **AI Emission Calculations:** Automatic translation of gas/utility bills to carbon quantity.
*   **Multi-Org Hierarchy:** Managing nested departments across parent-subsidiary corporations.
*   **Third-party ESG Auditor Audits:** Validation portal for external sustainability auditors.

---

# Top 25 Remaining High ROI Improvements

The following improvements are ranked by implementation priority (ROI = Judge Visibility / Effort):

1.  **React App Scaffold:** Create standard react project structure (ROI: 10/10)
2.  **Dashboard Score Cards:** Render score gauges for E, S, G (ROI: 10/10)
3.  **Log Carbon Form:** Input fields for quantity and emissions sources (ROI: 9.5/10)
4.  **Backend Auth Router:** `/auth/login` and `/auth/signup` implementation (ROI: 9/10)
5.  **Recharts ESG Gauges:** Visual progress charts on dashboard (ROI: 9/10)
6.  **Auth Guard Context:** Store user token and protect React routes (ROI: 8.5/10)
7.  **Dashboard Standard Envelope:** Standardize backend API output wrapper (ROI: 8.5/10)
8.  **Form Validation:** Use react-hook-form + zod for transaction logging (ROI: 8/10)
9.  **Department Scores Table:** Display scores side-by-side (ROI: 8/10)
10. **Toast Notifications:** Alert users on successful writes (ROI: 7.5/10)
11. **CSS Glassmorphic Sidebar:** Sleek visual design shell (ROI: 7.5/10)
12. **CORS Configuration:** Enable Express backend CORS (ROI: 7/10)
13. **Policy List UI:** Display corporate sustainability guidelines (ROI: 7/10)
14. **Acknowledge Policy Button:** Mark policy as read (ROI: 6.5/10)
15. **Leaderboard View:** Rank employees by XP points (ROI: 6.5/10)
16. **Responsive Design:** Mobile layouts for dashboard views (ROI: 6/10)
17. **Centralized Input Validation:** Share validation methods in backend (ROI: 6/10)
18. **Prisma Score Refactor:** Calculate scoring logic with database-independent methods (ROI: 5.5/10)
19. **Badge Grid Component:** Render active employee badges (ROI: 5/10)
20. **Rewards Catalogue:** View coupons and vouchers (ROI: 5/10)
21. **Redeem Reward Button:** Spend employee XP points (ROI: 4.5/10)
22. **Mock API Layer:** Fallback offline data provider (ROI: 4/10)
23. **Dark Mode Toggle:** Style themes configuration (ROI: 3.5/10)
24. **Jest Scoring Tests:** Backend math assertion suite (ROI: 3/10)
25. **Lighthouse Audit Fixes:** Optimize images and bundle sizes (ROI: 2/10)
