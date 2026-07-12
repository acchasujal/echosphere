# DEFINITION_OF_DONE.md — Merge Validation Checklist

**Use this checklist for every merge to `main`.** It's designed for speed: 5-10 minutes per review.

Enforce these checks before committing. Don't merge code that fails any item.

---

## Pre-Commit Checklist (Developer Self-Check)

Before pushing your branch, run these locally:

### All Code
- [ ] **No syntax errors:** Code compiles/parses without errors
- [ ] **No console errors:** Run backend tests or frontend in dev mode; check console/logs for errors
- [ ] **No warnings from linter** (if using): `npm run lint` or `python -m pylint` (quick pass)

### Backend Code
- [ ] **FastAPI app starts:** `uvicorn apps/api/main:app --reload` runs without errors
- [ ] **Database connection works:** App logs "Connected to database"
- [ ] **Seed script runs:** `python apps/api/seed.py` completes without errors
- [ ] **Tests pass:** `pytest apps/api/tests/ -v` (if test file exists)

### Frontend Code
- [ ] **No build errors:** `npm run build` completes without errors
- [ ] **Dev server starts:** `npm run dev` starts without errors
- [ ] **No console errors:** Open http://localhost:5173, check browser console (F12)
- [ ] **Navigation works:** Click through main routes, no crashes

### API Routes (Backend Only)
- [ ] **Response envelope correct:** Manually test one route with curl/Postman
  ```bash
  curl -X GET http://localhost:8000/api/v1/departments \
    -H "Authorization: Bearer <token>" | jq .
  ```
  Verify response is exactly: `{ "success": true, "data": [...], "error": null }`
- [ ] **Error handling works:** Test with invalid input, verify error envelope:
  ```json
  { "success": false, "data": null, "error": { "code": "...", "message": "..." } }
  ```

### Database Mutations (Backend Only)
- [ ] **Side effects work:** If POST/PATCH triggers score recalc, verify it happens
  - Example: Log carbon transaction → Check department_scores table for updated environmental_score

### Forms (Frontend Only)
- [ ] **Validation works:** Submit form with invalid input (e.g., empty email), form shows error
- [ ] **Submit works:** Submit form with valid input, form either updates local state or calls API
- [ ] **Error handling:** If API call fails, form shows error message (not crash)

---

## Code Review Checklist (Human Reviewer)

After seeing the PR, check these in <5 minutes:

### All Code
- [ ] **Diff is focused:** Changes are related to the task. No random refactoring or unrelated fixes.
- [ ] **Follows naming conventions:** Functions/variables are readable (no single-letter vars except loops)
- [ ] **No obvious bugs:** Logic looks correct on first read (don't deep-dive, just scan)

### Backend Code
- [ ] **Response envelope matches spec:** Read response shape in code, compare to API_SPEC.md. ✓ or ✗.
- [ ] **No hardcoded secrets:** No API keys, tokens, or passwords in code
- [ ] **Error handling:** Routes catch exceptions and return proper error envelope
- [ ] **Database queries reasonable:** No N+1 queries (obvious inefficiencies), no full table scans

### Frontend Code
- [ ] **No console.log left behind:** Remove debug statements
- [ ] **API calls wrapped in try/catch:** All fetch/axios calls have error handling
- [ ] **Non-critical APIs fail gracefully:** If leaderboard API fails, dashboard still renders
- [ ] **Forms use validation library:** react-hook-form + zod (not manual validation)

### API Contracts (Backend + Frontend Integration)
- [ ] **Frontend calls match backend routes:** Check that frontend fetch URL matches API_SPEC.md
- [ ] **Request body matches spec:** If POST body is `{ department_id, quantity }`, code sends exactly that
- [ ] **Response is unwrapped correctly:** Frontend code doesn't do `response.data.data` (single unwrap)

### Database Schema (Models)
- [ ] **Models inherit EntityBase:** All models have id, created_at, updated_at
- [ ] **Foreign keys defined:** Relationships between tables are explicit (ForeignKey + back_populates)
- [ ] **Validation at model level:** Required fields marked as non-nullable

---

## Integration Test (Before Merge)

Run this lightweight smoke test before merging integration branches:

### Backend Integration (After B1, B2, B3, B4 merge)
```bash
# 1. Backend running
uvicorn apps/api/main:app --reload &

# 2. Seed database
python apps/api/seed.py
# Expected: ✓ Seeded 3 departments, 5 users, ...

# 3. Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "password"}' | jq .
# Expected: { "success": true, "data": { "user": {...}, "token": "..." }, "error": null }

# 4. Test carbon transaction (requires token from step 3)
curl -X POST http://localhost:8000/api/v1/carbon-transactions \
  -H "Authorization: Bearer <token-from-step-3>" \
  -H "Content-Type: application/json" \
  -d '{"department_id": 1, "emission_factor_id": 101, "quantity": 100}' | jq .
# Expected: { "success": true, "data": { "id": 1, "calculated_emission": ... }, "error": null }

# 5. Check score updated
curl -X GET http://localhost:8000/api/v1/dashboard/department/1 \
  -H "Authorization: Bearer <token-from-step-3>" | jq .data.environmental_score
# Expected: number between 0 and 100 (not 100, since we logged a transaction)

# If all 5 steps pass: ✓ Integration OK
# If any step fails: Don't merge. Fix and re-test.
```

### Frontend Integration (After F1, F2 merge)
```bash
# 1. Frontend running
npm run dev
# Open http://localhost:5173 in browser

# 2. Click through:
#  - Login form renders
#  - Submit with credentials
#  - Redirect to dashboard
#  - Dashboard renders (even with hardcoded data)
#  - Carbon form renders
#  - CSR form renders
#  - No console errors (open F12)

# If all pass: ✓ Frontend OK
```

---

## Merge Decision Tree

```
Does code pass Pre-Commit Checklist?
├─ NO  → Don't push. Fix locally.
└─ YES → Does code pass Code Review Checklist?
         ├─ NO  → Request changes. Push to same branch.
         └─ YES → Does Integration Test pass?
                  ├─ NO  → Revert. Debug in isolation. Re-test.
                  └─ YES → ✓ MERGE to main
```

---

## Time Budget

| Phase | Time | Action |
|---|---|---|
| **Pre-Commit** | 5 min | Developer runs checklist locally |
| **Code Review** | 5 min | Reviewer scans PR, checks spec alignment |
| **Integration Test** | 5 min | Run smoke test script |
| **Total** | ~15 min | Per merge |

If any check takes >10 minutes, the code is too complex. Ask for simplification or split into smaller PR.

---

## Showstopper Failures (Revert Immediately)

If any of these occur after merge, **revert immediately** (don't fix on main):
- [ ] 500 errors on valid API requests
- [ ] Frontend crashes on route load
- [ ] Database connection fails
- [ ] Authentication broken (can't log in)
- [ ] Core demo flow broken (carbon → score → dashboard doesn't work)

For showstoppers:
1. `git revert <commit-hash>`
2. Push to main (takes 2 minutes)
3. Debug the issue on a new branch
4. Re-test locally before re-opening PR

---

## Common Failures & Fixes

| Failure | Cause | Fix |
|---|---|---|
| `502 Bad Gateway` | Backend not running or crashed | Restart `uvicorn`. Check error logs. |
| `CORS error` in browser | Backend missing `Allow-Origin` header | Add `allow_origins=["*"]` in FastAPI |
| `{"data": [...]}` instead of `{"success": true, "data": [...]}` | Response envelope wrong | Check route, wrap response in envelope dict |
| `TypeError: Cannot read property 'data' of undefined` | Frontend assuming wrong response shape | Update frontend to match API_SPEC.md |
| `pytest: No module named 'pytest'` | pytest not installed | `pip install pytest` |
| `npm: command not found` | Node not installed or wrong terminal | Ensure Node 18+ installed, use correct terminal |
| Form doesn't submit | Validation failing silently | Check browser console (F12), look for validation errors |
| Dashboard shows wrong score | Score calculation bug | Run `pytest tests/test_scoring.py -v`, verify math |

---

## Passing the Merge Checklist (Example)

### Example: Merging B1 (Models)

**Pre-Commit (Developer):**
```bash
cd ecosphere-be-core
python -c "from apps.api.models import *; print('✓ Models import OK')"
# Output: ✓ Models import OK
```

**Code Review (Reviewer, 5 min):**
- ✓ All models inherit EntityBase
- ✓ Foreign keys defined
- ✓ No hardcoded values
- ✓ Follows naming conventions

**Integration Test (Reviewer, 5 min):**
```bash
python -m pytest tests/  # No tests yet, but no errors
# Output: OK (no tests found)
```

**Decision:** ✓ **MERGE to main**

---

### Example: Merging F2 (Dashboard)

**Pre-Commit (Developer):**
```bash
npm run build
# Output: ✓ build OK
npm run dev
# (Manual: Open browser, click through dashboard, no errors in console)
```

**Code Review (Reviewer, 5 min):**
- ✓ API calls wrapped in try/catch
- ✓ Non-critical API failures render empty state
- ✓ No console.log statements
- ✓ Uses shadcn/ui components

**Integration Test (Reviewer, 5 min):**
```bash
# (Manual: Frontend loads, dashboard renders, data visible)
# ✓ Dashboard OK
```

**Decision:** ✓ **MERGE to main**

---

## Review Template (Paste into PR Comment)

Use this template for every code review:

```markdown
## Merge Checklist

### Pre-Commit
- [x] No syntax errors
- [x] No console errors
- [x] Tests pass (if applicable)

### Code Review
- [x] Diff is focused and related to task
- [x] Follows spec (API_SPEC.md or AGENTS.md)
- [x] Error handling present
- [x] No hardcoded secrets

### Integration Test
- [x] Smoke test passes
- [x] Response envelopes match spec (if backend)
- [x] Forms/routes load without crash (if frontend)

### Decision
✓ **READY TO MERGE**

---

(Or if issues found)

## Issues Found

1. Response envelope is `{ "data": [...] }` but spec requires `{ "success": true, "data": [...], "error": null }`
   - Fix: Wrap all responses in proper envelope

**Status:** 🚫 **REQUEST CHANGES**
Resubmit after fixing ^ issues.
```

---

## Final Rule

**If you're unsure about a merge, don't merge.**

Ask:
- Does this pass the checklist?
- Will this break the smoke test?
- Can we ship the demo without this?

If the answer to any is "I'm not sure," either:
1. Run the checklist manually
2. Ask another developer
3. Don't merge until certain

Better to skip a feature at 12:00 PM than to break everything at 4:00 PM.
