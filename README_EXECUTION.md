# EcoSphere Hackathon Execution System

**This system is optimized for shipping a demoable MVP by 5 PM in 8 hours.**

---

## The 4 Documents (Read in This Order)

### 1. **AGENTS.md** (Operating System)
**Read this first. Read it entirely before coding.**

- Architecture rules (stack, folder ownership, API envelope)
- Quality gates & Definition of Done
- Resilience rules (how we survive AI mistakes)
- Git workflow & parallelism strategy
- Demo readiness rules

**Purpose:** The single source of truth for "how we build this." Reference this whenever you're uncertain about architecture, scope, or quality standards.

**Time to read:** 20 minutes

---

### 2. **API_SPEC.md** (The Contract)
**Read this entirely before writing backend code.**

- Every endpoint: request/response shapes
- Authentication: JWT structure and login/signup flows
- Scoring formulas: exact math for Env/Social/Governance/Total scores
- Dashboard: exact response shapes for all queries
- Error codes and examples

**Purpose:** The frozen contract between backend and frontend. If your code doesn't match this, the spec wins. Backend agents generate code here. Frontend agents test against this.

**Time to read:** 15 minutes

---

### 3. **TASKS.md** (Execution Queue)
**Reference this throughout the hackathon.**

- 6 backend tasks (B1-B6) with exact dependencies
- 3 frontend tasks (F1-F3) with exact dependencies
- For each task:
  - Owner + worktree
  - Time estimate
  - AI prompt (copy-paste into Claude)
  - Definition of Done
  - Fallback strategy
- Integration checkpoints
- Emergency protocols

**Purpose:** The deployment manifest. When you're unsure what to build next, check TASKS.md. When an AI agent completes a task, verify it against the Definition of Done.

**Time to read:** 10 minutes (scan for your role)

---

### 4. **DEFINITION_OF_DONE.md** (Merge Checklist)
**Use this for every merge to main.**

- Pre-commit checklist (developer self-check, 5 min)
- Code review checklist (human reviewer, 5 min)
- Integration test (smoke test, 5 min)
- Merge decision tree
- Common failures & fixes

**Purpose:** Lightweight validation before every merge. Designed to catch showstoppers (500 errors, crashes) without slowing you down.

**Time to review:** 5-10 minutes per merge

---

## How to Use This System

### Setup (First 10 minutes)

1. **Freeze the spec:**
   - AGENTS.md, API_SPEC.md, TASKS.md are locked. Do not change them during the hackathon.

2. **Create Git worktrees:**
   ```bash
   git worktree add ../ecosphere-be-core main
   git worktree add ../ecosphere-be-score main
   git worktree add ../ecosphere-fe-auth main
   git worktree add ../ecosphere-fe-crud main
   ```

3. **Split responsibilities:**
   - **Sujal:** Worktrees `ecosphere-be-core`. Tasks: B1 (Models) → B2 (Auth) → B5 (Governance)
   - **Shriraj:** Worktrees `ecosphere-be-score` + `ecosphere-fe-*`. Tasks: B3 (Scoring) → B4 (APIs), then F1 (Auth UI) → F2 (Dashboard)

### Main Loop (10:00 AM - 2:00 PM)

**Every hour:**

1. **Pick next task from TASKS.md** (same priority tier, dependencies met)
2. **Copy AI prompt** from TASKS.md task definition
3. **Paste into Claude:** "Here's my task: [prompt]"
4. **AI generates code**
5. **Developer tests locally** (run pre-commit checklist from DEFINITION_OF_DONE.md)
6. **Human reviewer merges** (run code review + integration test checklist)
7. **Pull latest from main** → `git pull origin main` in your worktree
8. **Move to next task**

### Integration Checkpoints (Scheduled)

| Time | What | Owner | Success = |
|---|---|---|---|
| **11:00** | Merge B1, B2, B3, B4 + Smoke Test | Sujal, Shriraj | Carbon → Score → Dashboard works |
| **11:30** | Swap Frontend from Mock → Live API | Shriraj | Forms update live scores |
| **12:00** | Merge B5, F3 (Governance + Gamification) | Both | Routes load, no crashes |
| **02:00** | **FREEZE CODE.** Bug fixes only. | Both | No new features after this |
| **03:00** | Record demo video as fallback | Both | Video shows full flow |
| **04:00** | Rehearse live demo (3 times) | Both | Timing, no crashes |
| **05:00** | SUBMIT | Both | Link in submission portal |

---

## Emergency Decision Tree

**If a task fails to merge...**

1. **Is it a showstopper?** (500 error, crash, can't log in)
   - YES → Revert immediately. Debug in isolation. Re-test before re-merging.
   - NO → Skip the feature. Hide routes if frontend. Set weight to 0 if scoring.

2. **Do we have time to fix it?**
   - YES (it's 12:00 PM or earlier) → Fix it. Re-test. Re-merge.
   - NO (it's 12:30 PM or later) → Cut the feature. Move to next task.

3. **Is the core loop working?** (Carbon → Score → Dashboard)
   - YES → Ship what you have. Polish other features.
   - NO → Focus all effort on fixing core loop until it works.

---

## Optimal Merge Order

**Do not deviate from this without a good reason:**

1. **B1 (Models)** → Foundation for everything
2. **B2 (Auth)** → Required for any route
3. **F1 (Auth UI + Mock API)** → Frontend independent of backend (test in parallel)
4. **B3 (Score Engine + Tests)** → Critical path, should be tested early
5. **B4 (Dashboard + Core APIs)** → Integration ready
6. **Smoke Test** → Verify core loop works
7. **F2 (Dashboard UI + Forms)** → Wire to live backend
8. **B5 (Governance APIs)** → Nice-to-have
9. **F3 (Governance UI + Gamification)** → Nice-to-have

If B3 or B4 fail, fix them before proceeding. Everything else depends on them.

---

## Confidence Levels

### HIGH CONFIDENCE (Will Succeed)
- ✓ Auth (simple CRUD + JWT)
- ✓ Core APIs (standard FastAPI patterns)
- ✓ Dashboard (straightforward data fetching)
- ✓ Forms (react-hook-form is reliable)

### MEDIUM CONFIDENCE (Likely to Succeed, Needs Testing)
- ⚠ Score calculation (test it with pytest)
- ⚠ Frontend-backend integration (envelope mismatch risk)
- ⚠ Database relationships (ForeignKey bugs)

### LOW CONFIDENCE (High Risk, Needs Fallback)
- 🔴 Gamification (badge logic can get complex)
- 🔴 Complex filtering (query optimization)
- 🔴 Real-time updates (not planned, don't attempt)

---

## What to Prioritize (If Time-Constrained)

**At 12:00 PM, if you're behind:**

1. **Must ship:**
   - Auth (login/signup)
   - Dashboard (shows scores)
   - Carbon form (logs transaction)
   - CSR form (creates activity + approves)

2. **Nice-to-have (cut if needed):**
   - Governance (set weight to 0)
   - Gamification (hide routes)
   - Reports (show static prototype)

3. **Polish (only if time permits):**
   - Animations
   - Dark mode
   - Responsive design polish
   - Extra UI tweaks

**Demo time: 5 minutes max.** Show login → carbon → score update → CSR approval → score update → leaderboard. That's it.

---

## How to Communicate During the Hackathon

### Format for AI Agent Requests

```
I'm working on [TASK NAME] from TASKS.md.

Read this prompt and generate the code:

[PASTE PROMPT FROM TASKS.md]

Constraints:
- Follow AGENTS.md architecture rules
- Match API_SPEC.md exactly
- Use merge checklist from DEFINITION_OF_DONE.md

Output: [Python/TypeScript] code only, no explanations.
```

### Format for Human Review

```
## Merge Request: [Task Name]

**Task:** [B1/B2/etc]
**Branch:** [feat/models-crud, etc]
**Depends on:** [Previous tasks merged to main]

**Definition of Done:**
- [ ] Checklist item 1
- [ ] Checklist item 2
- [ ] ...

**Reviewer:** Run the Integration Test section of DEFINITION_OF_DONE.md before merging.
```

---

## Time Budget Sanity Check

Total available: **8 hours (10 AM - 6 PM, accounting for breaks)**

| Phase | Time | Deliverable |
|---|---|---|
| **Setup** | 10 min | Worktrees ready, specs locked |
| **Generation** | 3.5 hours | 6 backend + 3 frontend tasks generated and merged |
| **Integration** | 1 hour | Smoke tests, bug fixes, API swaps |
| **Polish** | 1.5 hours | UI polish, edge cases, demo prep |
| **Rehearsal** | 1 hour | Demo rehearsal (3x), record fallback |
| **Buffer** | 1 hour | Unexpected failures, last-minute fixes |

If generation is taking >45 min per task, code is too complex. Ask AI to simplify.

---

## Success Criteria (What Judges See)

**At 5:00 PM, when judges test the app:**

1. ✓ Login works (admin@company.com / password)
2. ✓ Dashboard shows scores (all three: Env, Social, Gov)
3. ✓ Log carbon transaction (e.g., 100 units of Natural Gas)
4. ✓ Environmental score updates (visibly decreases)
5. ✓ Create CSR activity (e.g., "Beach Cleanup")
6. ✓ Approve participation (marks as "approved")
7. ✓ Social score updates (visibly increases)
8. ✓ Show leaderboard (employees ranked by XP)
9. ✓ Acknowledge policy
10. ✓ Governance score reflects acknowledgement

**Bonus (If time permits):**
- Badges unlock on XP milestones
- Governance weight visible in score calculation
- Trend chart shows score history
- Department scores visible
- Responsive mobile design

**Minimum viable demo:** Steps 1-5. If you get past step 5, you're winning.

---

## Post-Hackathon Cleanup

**After demo (if time permits):**

1. Update README.md with project overview
2. Document setup instructions (`pip install -r requirements.txt`, etc.)
3. List features implemented vs. roadmap
4. Note any technical debt or known issues
5. Push to GitHub

---

## Final Checklist (Before Submission)

- [ ] All code pushed to main branch
- [ ] README.md exists with project description
- [ ] Seed script works (`python apps/api/seed.py`)
- [ ] Backend starts (`uvicorn apps/api/main:app --reload`)
- [ ] Frontend starts (`npm run dev`)
- [ ] Demo flows work (login → carbon → score → dashboard)
- [ ] No console errors (backend logs, browser F12)
- [ ] Git history clean (meaningful commit messages)

---

## Contact & Escalation

**If blocked:**
1. Check AGENTS.md (architecture question)
2. Check API_SPEC.md (spec question)
3. Check TASKS.md (task dependency)
4. Check DEFINITION_OF_DONE.md (merge issue)
5. Ask the other developer
6. Make a decision and move forward (perfectionism kills hackathons)

**If time pressure rises:**
1. Cut features (check priority tier in AGENTS.md)
2. Show prototypes for unfinished features
3. Record fallback demo video
4. Submit what you have

**Judges reward:** Working MVP > Broken full-featured project. Always.

---

## Good Luck! 🚀

You have a solid plan, a frozen spec, and clear tasks. Execute sequentially. Merge frequently. Test integration early.

**The hardest part isn't coding. It's saying "no" to scope creep at 3 PM.**

Commit to the plan. Ship by 5 PM.
