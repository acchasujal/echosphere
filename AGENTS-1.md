# AGENTS.md — EcoSphere Execution OS

**Read this entirely before writing any code.** This is the single source of truth for architecture, scope, resilience, and how we ship a demoable MVP by 5 PM.

---

## 1. Non-Negotiable Architecture Rules

**Do not deviate from these.** Deviation breaks integration and wastes time.

### Stack (Frozen)
- **Backend:** FastAPI + SQLAlchemy + Pydantic + PostgreSQL
- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Charts:** Recharts. **Forms:** react-hook-form + zod.
- **Architecture:** Monolith (no microservices). Clean layered backend: Models → CRUDBase → Services → Routes.

### Folder Ownership (Strict Boundaries)
- **Backend agents:** Write only to `apps/api/**`. Do not touch frontend.
- **Frontend agents:** Write only to `apps/web/**`. Do not touch backend.
- **Shared:** `API_SPEC.md` is the contract. If your code doesn't match, the spec wins.

### API Response Envelope (Mandatory)
Every API response, without exception, must follow this shape:
```json
{
  "success": true,
  "data": { /* actual payload */ },
  "error": null
}
```

Error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descriptive message",
    "fields": { "email": "Already exists" }
  }
}
```

**Why:** The frontend API adapter expects this exact shape. If your endpoint returns `{ "data": [...] }` without `success`, the frontend adapter will break silently. Test this immediately.

### Base Model (Every Table)
Every SQLAlchemy model inherits:
```python
class Base(DeclarativeBase):
    pass

class EntityBase(Base):
    __abstract__ = True
    id: Mapped[int] = mapped_column(BIGSERIAL, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

Every table must have these three fields. No exceptions.

---

## 2. Scope & Feature Tier (Odoo Judging Optimization)

Odoo rewards: "Do less, do it well." We ship only what we can demo flawlessly.

| Tier | Feature | Decision | Demo Value | Fallback if Fails |
|---|---|---|---|---|
| **P0** | Auth (Login/Signup) | **BUILD** | Essential gate | Manual token in localStorage |
| **P0** | DB Models & CRUD Base | **BUILD** | Foundation | None—must work |
| **P0** | Carbon Transactions → Env Score | **BUILD** | Core loop | Hardcode formula in route |
| **P0** | CSR Approval → Social Score | **BUILD** | Core loop | Drop XP accrual, just update score |
| **P0** | Dashboard (Org + Dept Views) | **BUILD** | Primary demo | Show flat scores, omit trend chart |
| **P1** | Governance (Policy Ack) | **BUILD if P0 done** | Scoring completeness | Drop entirely, set gov weight to 0 |
| **P1** | Gamification (XP, Badges, Leaderboard) | **BUILD if P0 + P1 done** | Polish | Hide routes, show "Coming Soon" |
| **UI** | Reports, Audits | **PROTOTYPE ONLY** | Design credibility | Static mock UI with "Prototype" badge |
| **CUT** | Auto Emission Calc, Diversity Scoring | **DO NOT BUILD** | Nice-to-have | List in README under "Future Vision" |

**Decision Rule:** If you're unsure whether to build a feature, ask: *"Can I demo the core loop (Carbon → Score → Dashboard) without this?"* If yes, cut it or prototype it.

---

## 3. Quality Gates & Definition of Done

Every piece of code merged to `main` must satisfy these gates before commit. No exceptions.

### Merge Checklist (MANDATORY - Enforce Before Pushing)

**For Backend Routes (All routes):**
- [ ] Response envelope matches `API_SPEC.md` exactly (test by hand if needed)
- [ ] Error cases return proper error envelope with code + message
- [ ] No bare `return [...]` or `return {...}` without `{ "success": true, "data": ... }`
- [ ] JWT auth implemented (if protected route)
- [ ] CORS headers set (FastAPI `allow_origins=["*"]` for hackathon)

**For Score Engine (Critical Path):**
- [ ] Function signature matches `API_SPEC.md` Scoring Rules section
- [ ] `tests/test_scoring.py` exists and has ≥3 parametrized test cases
- [ ] `pytest tests/test_scoring.py` passes (human must run before merge)
- [ ] Expected outputs verified by hand (human checks math, not code)
- [ ] No database side effects (pure functions only)

**For Frontend Routes/Components:**
- [ ] Route wired to mock API adapter (or live API if backend ready)
- [ ] `try/catch` wraps all fetch/axios calls
- [ ] Non-critical API failures render empty state (not crash)
- [ ] No console errors or warnings
- [ ] Forms use `react-hook-form` + `zod` validation

**For Database Migrations:**
- [ ] Models regenerated from `models/` → run `alembic revision --autogenerate -m "description"`
- [ ] Migration tested locally (create, seed, run migration, verify schema)

---

## 4. Resilience Rules (AI Hallucination Defense)

Assume AI will make mistakes. Design the system to survive them.

### Frontend Resilience
- **Non-Critical APIs** (Badges, Leaderboard, Rewards): If fetch fails, render an empty state or skeleton. **Do not crash the Dashboard route.**
- **Critical APIs** (Auth, Dashboard, Carbon, CSR): If fetch fails after 2 retries, redirect to `/error` with a user-facing message.
- **Mock API Fallback:** Before 11:00 AM, frontend uses mock data. After 11:00 AM (backend integration), swap base URL. If backend is down, swap back to mock.

### Backend Resilience
- **Score Calculation Failure:** If `calculate_department_total()` raises an exception, catch it, log it, and return the last known cached score from the `department_scores` table (or `0.0`). **Never return a 500 on a GET request.**
- **Missing Seed Data:** If an API tries to access emission_factors and the table is empty, check that the seed script ran. Provide a clear error message ("Seed data not found. Run `python apps/api/seed.py`").

### Integration Safety
- **Mock ↔ Live Swap:** Frontend maintains a `USE_MOCK_API` environment variable (`.env`). Set to `true` for development, `false` for live demo. Swap is a single line change.
- **Branch Testing:** Test all critical flows on feature branches before merging. Don't merge broken code and fix it later.

---

## 5. Git Workflow & Parallelism (Maximize Throughput)

Use Git Worktrees to allow 4 agents to write in parallel without conflicts.

### Setup (First 10 Minutes)
```bash
# Main repo
git clone <repo>
cd ecosphere

# Create 4 isolated worktrees
git worktree add ../ecosphere-backend-core main
git worktree add ../ecosphere-backend-score main
git worktree add ../ecosphere-frontend-auth main
git worktree add ../ecosphere-frontend-crud main

# Each agent works in their own directory
cd ../ecosphere-backend-core  # Agent 1
cd ../ecosphere-backend-score # Agent 2
cd ../ecosphere-frontend-auth # Agent 3
cd ../ecosphere-frontend-crud # Agent 4
```

### Commit Strategy (Avoid Conflicts)
- **Backend agents:** Each commits to their own branch (`feat/models-crud`, `feat/score-engine`). After merge, `git pull` from main to stay in sync.
- **Frontend agents:** Each commits to their own branch (`feat/auth-shell`, `feat/forms-crud`). After merge, `git pull` from main.
- **Never merge to `main` until reviewed.** Use pull requests (even if solo).

### Merge Order (Critical Dependencies)
1. **Backend Core (Models + CRUD)** → required by all other tasks
2. **Score Engine + Tests** → required for Dashboard
3. **Frontend Auth + Shell** → required by all frontend routes
4. **Backend APIs (Carbon, CSR, Governance)** → integrates with Frontend
5. **Frontend Routes (Carbon, CSR, Governance)** → integrates with Backend APIs
6. **Gamification (Backend + Frontend)** → last, lowest priority

---

## 6. Demo Readiness Rules

By 4:00 PM, the demo must be flawless. These rules ensure that.

### Demo Script (Locked by 3:00 PM)
The demo follows exactly this flow (5 minutes max):
1. Open app, show login screen (1s)
2. Sign in as admin (2s)
3. Log a carbon transaction (5s)
4. Verify environmental score updated in dashboard (3s)
5. Approve a CSR activity (5s)
6. Verify social score updated in dashboard (3s)
7. Show governance policy acknowledgement (3s)
8. Show total ESG score and leaderboard (2s)

**Nothing else.** No deep dives, no extra features. This is the demo.

### Demo Environment (Frozen at 2:00 PM)
- **No code changes after 2:00 PM.** Only bug fixes.
- **Use seeded test data** (3 departments, 10 users, realistic transactions).
- **Take screenshots of the demo before 4:00 PM** in case the live demo fails.
- **Record a 2-minute walkthrough video** as fallback.

### Showstopper Bugs (Must Fix Before Demo)
- [ ] Login doesn't work
- [ ] Dashboard doesn't load
- [ ] Carbon transaction crashes the backend
- [ ] Score doesn't update after transaction
- [ ] Any 500 errors in the backend
- [ ] Console errors in the browser

Fix these. Ship the demo. Everything else is bonus.

---

## 7. AI Agent Rules (How to Prompt Effectively)

### Before Generating Code
1. **Read the entire `API_SPEC.md`.** Do not skip it.
2. **Read the Merge Checklist** above. Your code must pass every item.
3. **Read the task prompt** in `TASKS.md`. Follow it exactly.

### While Generating Code
1. **Test envelope immediately.** If you generate an API route, test it with `curl` or Postman against the spec.
2. **No fabricated data.** Do not invent realistic-looking ERPintegrations that don't exist. If you're unsure, cut the feature.
3. **Error handling first.** Before adding features, add `try/catch` and proper error responses.
4. **Seed data is sacred.** The seed script is the source of truth for test data. Use it.

### Commit Message Format
```
<type>(<scope>): <subject>

<body (optional)>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`. Example:
```
feat(auth): Add JWT token generation and login endpoint

- Implements login/signup routes per API_SPEC.md
- Uses FastAPI security with JWT tokens
- Tested against envelope schema
```

---

## 8. Review Process (Speed Over Perfection)

### Human Review (Asynchronous)
- **Backend:** Sujal or Shriraj reviews diffs. Focus on: Does it match the spec? Does it return the right envelope? Will it integrate?
- **Frontend:** Focus on: Does it follow component structure? Does the form validation work? Are there console errors?
- **Score Engine:** Human verifies the test math by hand (not the code). Runs `pytest`. If green, merge.

### Time Budget for Review
- Code review: **5 minutes per merge** (focus on blocking issues, not style)
- Test verification: **5 minutes**
- Integration check: **5 minutes**

If review takes longer, it's a sign the code is too complex. Ask the AI to simplify.

### Failing Code
If a merge fails smoke test:
1. Revert immediately (don't debug live)
2. Create an issue with the error
3. Re-prompt the AI with the error message
4. Test on a branch before re-merging

---

## 9. Failure Modes & How We Recover

### If Backend Integration Fails at 12:00 PM
- Frontend stays on mock API
- Extend demo to show both mock + static screenshots of live backend working
- "Frontend ready to go live once backend APIs finalized"

### If Score Engine is Wrong
- Use a hardcoded formula in the route instead
- Show scores incrementing in the demo
- Note: "Scoring logic simplified for demo; production version uses advanced ML."

### If Gamification Breaks
- Hide the routes. Show "Coming Soon" badge.
- Demo the core loop (Carbon → Social → Governance scores)
- List Gamification in README as Phase 2

### If Database Seeding Fails
- Manually insert 3 test records into the database before demo
- Document the manual INSERT statements in `seed.py` comments

### If We Run Out of Time at 1:30 PM
- Freeze code
- Focus on: Auth works, Dashboard loads, one end-to-end flow works (Carbon → Score)
- Show the other features in screenshots/video
- Submit what you have

---

## 10. Environment Setup (One-Time)

### Prerequisites
- Python 3.11+, PostgreSQL 14+, Node.js 18+
- `pip install fastapi sqlalchemy pydantic pytest`
- `npm install` in `apps/web`

### Startup Script
```bash
# Backend
cd apps/api
python -m pytest tests/  # Run all tests
python seed.py          # Seed database
uvicorn main:app --reload

# Frontend (in another terminal)
cd apps/web
npm run dev
```

### Mock API Setup
Frontend maintains `apps/web/api/mock.ts`:
- Exports a mock adapter that returns exact `API_SPEC.md` responses
- Used until 11:00 AM (before backend integration)
- Zero latency, predictable behavior, great for UI development

---

## Summary: The Job of Every Developer

1. **Sujal:** Backend Core (Models + CRUD) → Score Engine + Tests → Dashboard APIs
2. **Shriraj:** Frontend Shell + Auth → Mock API adapter → Dashboard UI + Forms
3. **AI Agents:** Generate code following task prompts in `TASKS.md`
4. **Humans:** Review, merge, test, demo

**Success metric:** At 5:00 PM, judges see:
- A working app
- Admin logs a carbon transaction
- Environmental score updates
- Admin approves a CSR activity
- Social score updates
- All scores visible in dashboard

Ship that. Everything else is polish.
