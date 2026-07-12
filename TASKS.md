# TASKS.md — Execution Queue

**This is your deployment manifest.** Each task is atomic, dependency-aware, and assigned to a specific worktree.

**Setup (First 10 min):** Create 4 Git worktrees before starting:
```bash
git worktree add ../ecosphere-be-core main
git worktree add ../ecosphere-be-score main
git worktree add ../ecosphere-fe-auth main
git worktree add ../ecosphere-fe-crud main
```

Each team member works in their worktree independently. Pull from `main` after each merge to stay in sync.

---

## Timeline Overview

| Time | Backend Core | Backend Score | Frontend Auth | Frontend CRUD | Checkpoint |
|---|---|---|---|---|---|
| **09:45** | Freeze spec | Freeze spec | Freeze spec | Freeze spec | Setup worktrees |
| **10:00-10:45** | B1 + B2 (Models, Auth, Seed) | B3 + B4 (Score engine + tests) | F1 (Auth shell, mock API) | F2 (Forms, Carbon, CSR UI) | Parallel generation |
| **10:45-11:00** | Merge B1+B2 to main | Review & merge B3+B4 | Merge F1 to main | Merge F2 to main | Integration prep |
| **11:00-11:30** | Merge B5 (APIs) | — | Swap mock → live API | Swap mock → live API | End-to-end smoke test |
| **11:30-12:30** | Governance APIs (B6) | — | Governance UI (F3) | Gamification UI (F4) | Core loop locked |
| **12:30-02:00** | Polish, bug fixes | Bug fixes | Polish, responsiveness | Polish, edge cases | Iterate |
| **02:00-03:00** | Freeze code | Freeze code | Freeze code | Freeze code | Bug bash only |
| **03:00-04:00** | Demo rehearsal | Demo rehearsal | Demo rehearsal | Demo rehearsal | Record fallback video |
| **04:00-05:00** | **LIVE DEMO** | **LIVE DEMO** | **LIVE DEMO** | **LIVE DEMO** | Submit |

---

## Backend Tasks (Worktrees: ecosphere-be-core, ecosphere-be-score)

### B1: Database Models & CRUD Base (P0) - Backend Core
- **Owner:** Sujal
- **Worktree:** `ecosphere-be-core`
- **Deps:** None
- **Time:** 45 min (10:00-10:45)
- **Branch:** `feat/models-crud`
- **Files to Generate:**
  - `apps/api/models/base.py` (EntityBase class)
  - `apps/api/models/user.py` (User, Department, Role)
  - `apps/api/models/environmental.py` (CarbonTransaction, EmissionFactor)
  - `apps/api/models/social.py` (CSRActivity, Participation, Badge)
  - `apps/api/models/governance.py` (Policy, PolicyAcknowledgement)
  - `apps/api/models/scoring.py` (DepartmentScore, UserScore)
  - `apps/api/crud_base.py` (CRUDBase class with create, get, list, update, delete)

### AI Prompt for B1
```
Read AGENTS.md and API_SPEC.md entirely before writing code.

Your task: Generate SQLAlchemy models for an ESG scoring system.

Requirements:
1. Create apps/api/models/base.py with an EntityBase class that includes:
   - id: BIGSERIAL primary key
   - created_at: DateTime with default utcnow
   - updated_at: DateTime with default utcnow and onupdate

2. Create apps/api/models/user.py with:
   - User model (id, email, password_hash, department_id, role, created_at, updated_at)
   - Department model (id, name, code, employee_count, parent_department_id, head_user_id, created_at, updated_at)
   - Relationships: Department.users (back_populates), User.department

3. Create apps/api/models/environmental.py with:
   - EmissionFactor model (id, name, factor_value, unit, category, created_at, updated_at)
   - CarbonTransaction model (id, department_id, emission_factor_id, quantity, calculated_emission, transaction_date, created_at, updated_at)
   - FK: CarbonTransaction.department_id -> Department.id
   - FK: CarbonTransaction.emission_factor_id -> EmissionFactor.id

4. Create apps/api/models/social.py with:
   - CSRActivity model (id, title, description, category_id, department_id, points_value, created_at, updated_at)
   - Category model (id, name, type (enum: "csr"|"challenge"), created_at, updated_at)
   - Participation model (id, user_id, activity_id, status (enum: "pending"|"approved"|"rejected"), proof_url, created_at, updated_at)
   - Badge model (id, name, description, criteria, xp_reward, icon_url, created_at, updated_at)
   - FKs: CSRActivity.category_id -> Category.id, Participation.user_id -> User.id, Participation.activity_id -> CSRActivity.id

5. Create apps/api/models/governance.py with:
   - Policy model (id, title, description, category, created_at, updated_at)
   - PolicyAcknowledgement model (id, user_id, policy_id, acknowledged_at, created_at, updated_at)
   - FKs: PolicyAcknowledgement.user_id -> User.id, PolicyAcknowledgement.policy_id -> Policy.id

6. Create apps/api/models/scoring.py with:
   - DepartmentScore model (id, department_id, environmental_score, social_score, governance_score, total_score, score_date, created_at, updated_at)
   - UserScore model (id, user_id, xp_points, created_at, updated_at)
   - FKs: DepartmentScore.department_id -> Department.id, UserScore.user_id -> User.id

7. Create apps/api/crud_base.py with a generic CRUDBase class:
   - __init__(self, model)
   - create(self, session, obj_in: dict) -> model instance
   - get(self, session, id: int) -> model instance or None
   - list(self, session, skip: int = 0, limit: int = 100) -> list of model instances
   - update(self, session, db_obj, obj_in: dict) -> updated model instance
   - delete(self, session, id: int) -> True or raise exception

All models must inherit from EntityBase. Use proper relationships and foreign keys. No side effects.

Output: Python code. No explanations.
```

### Definition of Done (B1)
- [ ] All model files exist under `apps/api/models/`
- [ ] CRUDBase implements all 5 methods (create, get, list, update, delete)
- [ ] No syntax errors: `python -c "from apps.api.models import *"`
- [ ] All models inherit EntityBase with id, created_at, updated_at
- [ ] Relationships defined correctly (back_populates used)
- [ ] Foreign keys defined for every cross-model reference

### Merge Checklist (B1)
- [ ] Code follows the merge checklist in AGENTS.md section 3
- [ ] Models match schema implied in API_SPEC.md
- [ ] Tested locally: `python -c "from apps.api.models import *; print('OK')"`
- [ ] No database side effects (models only)

### Fallback (If B1 fails)
- Manually write minimal models in a single file
- Use hardcoded CRUD logic instead of generic class
- Proceed to B2 anyway—B2 can work with any model structure

---

### B2: Authentication & Seed Data (P0) - Backend Core
- **Owner:** Sujal
- **Worktree:** `ecosphere-be-core`
- **Deps:** B1 (must be merged to main first)
- **Time:** 30 min (10:45-11:15 after merge)
- **Branch:** `feat/auth-seed`
- **Files to Generate:**
  - `apps/api/auth.py` (login, signup, JWT generation)
  - `apps/api/seed.py` (pre-populate database with test data)
  - `apps/api/main.py` (FastAPI app with CORS + auth routes)

### AI Prompt for B2
```
Read AGENTS.md and API_SPEC.md entirely. Assume B1 (models) was merged to main.

Your task: Implement authentication and seed data for the ESG system.

Requirements:
1. Create apps/api/auth.py with:
   - JWT secret (use "secret-key-for-hackathon")
   - JWT algorithm: HS256
   - create_jwt_token(user_id, email, department_id, role, expires_in_hours=24) -> token string
   - verify_jwt_token(token) -> dict with user_id, email, department_id, role, or raise exception
   - hash_password(password) -> hashed string
   - verify_password(plain, hashed) -> bool

2. Create FastAPI routes in apps/api/main.py:
   - POST /api/v1/auth/login with { email, password } -> { success, data: { user, token }, error }
   - POST /api/v1/auth/signup with { email, password, department_id } -> { success, data: { user, token }, error }
   - Both routes must return exact envelope from API_SPEC.md
   - Both routes must validate email/password format
   - Signup creates User with role="employee"
   - Login checks password and returns token

3. Create apps/api/seed.py with:
   - Seed 3 departments (Operations, Engineering, Marketing)
   - Seed 5 users (2 admins, 3 employees)
   - Seed 3 emission factors (Natural Gas, Electricity, Waste)
   - Seed 3 categories (Community Service, Sustainability, Diversity)
   - Seed 5 policies (Sustainability, Ethics, Diversity, Health, Security)
   - Seed 3 badges (Carbon Champion, CSR Hero, Policy Master)
   - All realistic names (no Lorem Ipsum)
   - Script must be idempotent: run it twice, no duplicates
   - Print "✓ Seeded X departments, X users, ..." to console

4. FastAPI setup in apps/api/main.py:
   - CORS: allow_origins=["*"]
   - Database connection pooling (SQLAlchemy)
   - Error handling: return proper error envelopes for validation errors
   - No hardcoded admin users (use seed.py)

Output: Python code. Test locally before committing: python seed.py should run without errors.
```

### Definition of Done (B2)
- [ ] `python seed.py` runs without errors
- [ ] Database has 3 departments, 5 users, 3 emission factors after seed
- [ ] Login endpoint accepts valid credentials and returns JWT
- [ ] Signup endpoint creates a new user and returns token
- [ ] Both endpoints return `{ "success": true, "data": {...}, "error": null }` envelope
- [ ] Invalid login returns `{ "success": false, "error": { "code": "UNAUTHORIZED", ... } }`
- [ ] No hardcoded tokens in code (use JWT generation)

### Merge Checklist (B2)
- [ ] All responses match API_SPEC.md envelope exactly
- [ ] Seed data is realistic (no Lorem Ipsum)
- [ ] JWT token verified on each request (if protected routes added)
- [ ] No raw passwords in logs or responses
- [ ] CORS headers set

### Fallback (If B2 fails)
- Manually insert seed data with SQL statements
- Use hardcoded JWT validation (just check token format)
- Frontend still works with mocked auth

---

### B3: Score Engine & Tests (P0 - Critical Path) - Backend Score
- **Owner:** Shriraj
- **Worktree:** `ecosphere-be-score`
- **Deps:** B1 (models must be merged)
- **Time:** 45 min (10:00-10:45)
- **Branch:** `feat/scoring-engine`
- **Files to Generate:**
  - `apps/api/services/scoring.py` (Pure functions for all score calculations)
  - `apps/api/tests/test_scoring.py` (Parametrized pytest cases)

### AI Prompt for B3
```
Read AGENTS.md section 4 and API_SPEC.md Scoring Formulas section entirely.

Your task: Generate pure Python scoring functions and comprehensive test suite.

Requirements:
1. Create apps/api/services/scoring.py with pure functions (NO DATABASE SIDE EFFECTS):
   
   a) calculate_environmental_score(total_co2e_this_month: float, normalization_constant: float = 1000.0) -> float:
      - Formula: max(0, 100 - (total_co2e_this_month / normalization_constant) * 100)
      - Example: total_co2e_this_month=500, returns 50.0
   
   b) calculate_social_score(total_points_earned: int, total_points_possible: int) -> float:
      - Formula: (total_points_earned / total_points_possible) * 100 if total_points_possible > 0 else 100.0
      - Example: 150/200 returns 75.0
   
   c) calculate_governance_score(policies_acknowledged: int, total_policies: int) -> float:
      - Formula: (policies_acknowledged / total_policies) * 100 if total_policies > 0 else 100.0
      - Example: 3/5 returns 60.0
   
   d) calculate_department_total(env_score: float, social_score: float, gov_score: float) -> float:
      - Formula: (env_score * 0.4) + (social_score * 0.3) + (gov_score * 0.3)
      - Example: (85 * 0.4) + (60 * 0.3) + (100 * 0.3) = 34 + 18 + 30 = 82.0
   
   e) calculate_overall_esg_score(department_total_scores: list[float]) -> float:
      - Formula: sum(department_total_scores) / len(department_total_scores) if len > 0 else 0.0
      - Example: [80.0, 75.0, 85.0] returns 80.0

2. Create apps/api/tests/test_scoring.py with pytest:
   - Use pytest.mark.parametrize for each function
   - 3 test cases per function (minimum):
     * One baseline case with known inputs/expected outputs
     * One edge case (zero values, division by zero, max/min)
     * One realistic case with mixed values
   
   Example structure:
   @pytest.mark.parametrize("total_co2e,normalization,expected", [
       (500, 1000.0, 50.0),          # Baseline: half normalized
       (0, 1000.0, 100.0),           # Edge: zero emissions
       (1500, 1000.0, 0.0),          # Edge: max emissions capped at 0
       (750, 1000.0, 25.0),          # Realistic
   ])
   def test_calculate_environmental_score(total_co2e, normalization, expected):
       result = calculate_environmental_score(total_co2e, normalization)
       assert result == expected

3. All functions must:
   - Have zero database side effects (pure functions only)
   - Include docstrings with examples
   - Handle edge cases gracefully (division by zero, negative inputs)
   - Return float values

4. Test file must:
   - Run with: pytest apps/api/tests/test_scoring.py -v
   - All tests pass
   - No external dependencies (use only pytest, no mocking)

Output: Python code only. No explanations. Human will verify test math by hand, then run pytest before merge.
```

### Definition of Done (B3)
- [ ] All 5 functions exist in `scoring.py`
- [ ] All functions are pure (no database access)
- [ ] `pytest apps/api/tests/test_scoring.py -v` passes 100%
- [ ] At least 3 test cases per function
- [ ] Test expected values verified by hand (Shriraj checks math)
- [ ] No console errors or warnings
- [ ] Functions return float, not int

### Merge Checklist (B3 - Special: Math Verification Required)
- [ ] **Human verification:** Read `test_scoring.py`. Verify 3 test cases per function are mathematically correct by hand.
- [ ] Run `pytest apps/api/tests/test_scoring.py -v`. All green.
- [ ] Functions have no database side effects.
- [ ] Docstrings included with examples.

### Fallback (If B3 fails)
- Copy test expectations and hardcode into route handlers
- "Scoring logic is placeholder; uses simplified formula for demo"
- Still passes demo as long as scores update

---

### B4: Dashboard & Core APIs (P0) - Backend Score
- **Owner:** Shriraj
- **Worktree:** `ecosphere-be-score`
- **Deps:** B1, B3 (both merged)
- **Time:** 45 min (10:45-11:30 after merges)
- **Branch:** `feat/apis-dashboard`
- **Files to Generate:**
  - `apps/api/routes/dashboard.py` (GET /dashboard/department, GET /dashboard/organization)
  - `apps/api/routes/carbon.py` (POST carbon transaction, GET list)
  - `apps/api/routes/csr.py` (POST activity, GET activities, POST participation, PATCH approve)
  - `apps/api/routes/base.py` (GET departments, GET categories, GET emission-factors)

### AI Prompt for B4
```
Read API_SPEC.md Dashboard section and Scoring Formulas section entirely.

Assume B1 (models) and B3 (scoring functions) were merged to main.

Your task: Generate FastAPI routes for Dashboard and core CRUD operations.

Requirements:
1. Create apps/api/routes/dashboard.py with:
   
   a) GET /api/v1/dashboard/department/{department_id}
      - Requires JWT auth
      - Returns: { success, data: { department, environmental_score, social_score, governance_score, total_score, trend }, error }
      - trend: array of { date, total_score } for last 7 days
      - Calls scoring functions from apps/api/services/scoring.py
      - If no data for a day, omit that day
   
   b) GET /api/v1/dashboard/organization
      - Requires JWT auth
      - Returns: { success, data: { overall_esg_score, weights, department_scores }, error }
      - department_scores: array of { department_id, department_name, env_score, social_score, gov_score, total_score, employee_count }
      - Calls calculate_overall_esg_score from scoring module

2. Create apps/api/routes/carbon.py with:
   
   a) POST /api/v1/carbon-transactions
      - Body: { department_id, emission_factor_id, quantity, transaction_date }
      - Returns: { success, data: { id, department_id, emission_factor_id, quantity, calculated_emission, transaction_date, created_at }, error }
      - calculated_emission = quantity * emission_factor.factor_value
      - Save to database
      - SIDE EFFECT: Recalculate department_scores.environmental_score for the department and update timestamp
      - Use scoring function to calculate new score
   
   b) GET /api/v1/carbon-transactions?department_id=10
      - Returns: { success, data: [ {...}, {...} ], error }

3. Create apps/api/routes/csr.py with:
   
   a) POST /api/v1/csr-activities
      - Body: { title, description, category_id, department_id, points_value }
      - Returns: { success, data: { id, title, description, category_id, department_id, points_value, created_at, updated_at }, error }
   
   b) GET /api/v1/csr-activities?department_id=10
      - Returns: { success, data: [ {...}, {...} ], error }
   
   c) POST /api/v1/participations
      - Body: { activity_id, proof_url }
      - user_id extracted from JWT token
      - Returns: { success, data: { id, user_id, activity_id, status: "pending", proof_url, created_at, updated_at }, error }
      - Status is "pending" until admin approves
   
   d) PATCH /api/v1/participations/{participation_id}/approve
      - Body: { approval_status: "approved"|"rejected" }
      - Requires admin role (from JWT)
      - Returns: { success, data: { id, user_id, activity_id, status, proof_url, created_at, updated_at }, error }
      - SIDE EFFECT (on "approved"):
        * Fetch participation + activity
        * Add activity.points_value to user.xp_points
        * Check if user earned any badges (if xp >= badge threshold)
        * Recalculate department_scores.social_score for the department
        * Update timestamp

4. Create apps/api/routes/base.py with:
   
   a) GET /api/v1/departments
      - Returns: { success, data: [ { id, name, code, employee_count, parent_department_id, head_user_id, created_at, updated_at }, ... ], error }
   
   b) GET /api/v1/categories
      - Returns: { success, data: [ { id, name, type, created_at, updated_at }, ... ], error }
   
   c) GET /api/v1/emission-factors
      - Returns: { success, data: [ { id, name, factor_value, unit, category, created_at }, ... ], error }

5. All routes must:
   - Return exact envelope from API_SPEC.md
   - Include try/catch with error envelopes on exceptions
   - Handle missing resources with 404 + NOT_FOUND error code
   - Validate input (e.g., emission_factor_id exists)
   - Use apps/api/services/scoring to recalculate scores on mutations

6. Testing strategy:
   - Test endpoints manually with curl or Postman after coding
   - Verify envelope shape matches API_SPEC.md
   - No database errors

Output: Python code only. Code will be integrated with Frontend at 11:00 AM.
```

### Definition of Done (B4)
- [ ] All 8 route functions exist (2 dashboard, 2 carbon, 4 CSR)
- [ ] All return exact envelope from API_SPEC.md
- [ ] Dashboard trend calculated correctly (last 7 days)
- [ ] Carbon transaction recalculates env score
- [ ] CSR approval recalculates social score and adds XP
- [ ] Admin-only routes check role from JWT
- [ ] All errors return proper error envelopes
- [ ] Tested with curl/Postman before merge

### Merge Checklist (B4)
- [ ] All 8 routes tested locally with curl/Postman
- [ ] Response envelopes match API_SPEC.md exactly
- [ ] Database side effects work (score recalculation visible after POST)
- [ ] No 500 errors on valid inputs

### Fallback (If B4 fails)
- Return static/hardcoded dashboard data
- Log mutations but don't recalculate scores
- Frontend still renders

---

### B5: Governance & Policy Routes (P1) - Backend Core or Score
- **Owner:** Sujal or Shriraj
- **Worktree:** Either `ecosphere-be-core` or `ecosphere-be-score` (pick one)
- **Deps:** B1, B4 (merged)
- **Time:** 45 min (11:30-12:15)
- **Branch:** `feat/governance`
- **Files to Generate:**
  - `apps/api/routes/governance.py` (GET policies, POST policy, POST ack, recalc gov score)

### AI Prompt for B5
```
Read API_SPEC.md Governance Module section.

Assume B1, B4 merged. Your task: Generate policy and governance routes.

Requirements:
1. Create apps/api/routes/governance.py with:
   
   a) GET /api/v1/policies
      - Returns: { success, data: [ { id, title, description, category, created_at }, ... ], error }
   
   b) POST /api/v1/policies
      - Body: { title, description, category }
      - Returns: { success, data: { id, title, description, category, created_at }, error }
   
   c) POST /api/v1/policy-acknowledgements
      - Body: { policy_id }
      - user_id extracted from JWT
      - Check if already acknowledged (no duplicates)
      - Returns: { success, data: { id, user_id, policy_id, acknowledged_at }, error }
      - SIDE EFFECT: Recalculate department_scores.governance_score for user's department
        * Count total policies in company
        * Count policies acknowledged by at least one employee in department
        * Calculate: (policies_acknowledged / total_policies) * 100
        * Update department_scores.governance_score
        * Update total_score using formula from API_SPEC.md

2. All routes must:
   - Return exact envelope from API_SPEC.md
   - Handle errors gracefully
   - Validate policy_id exists

Output: Python code only.
```

### Definition of Done (B5)
- [ ] All 3 policy routes exist
- [ ] Policy acknowledgement prevents duplicates
- [ ] Governance score recalculated after acknowledgement
- [ ] Response envelopes match API_SPEC.md

### Merge Checklist (B5)
- [ ] All 3 routes return correct envelope
- [ ] Governance score updates visible after POST acknowledgement

### Fallback (If B5 fails)
- Cut governance from core loop (set weight to 0)
- Frontend hides governance routes
- Demo still works with Env + Social

---

## Frontend Tasks (Worktrees: ecosphere-fe-auth, ecosphere-fe-crud)

### F1: Auth Shell & Mock API (P0) - Frontend Auth
- **Owner:** Shriraj
- **Worktree:** `ecosphere-fe-auth`
- **Deps:** None (mock API doesn't need backend)
- **Time:** 45 min (10:00-10:45)
- **Branch:** `feat/auth-shell`
- **Files to Generate:**
  - `apps/web/src/api/client.ts` (Axios instance + envelope validation)
  - `apps/web/src/api/mock.ts` (Mock adapter matching API_SPEC.md exactly)
  - `apps/web/src/context/AuthContext.tsx` (JWT storage, login/logout)
  - `apps/web/src/routes/Login.tsx` (Login form)
  - `apps/web/src/routes/Signup.tsx` (Signup form)
  - `apps/web/src/App.tsx` (Protected routing)

### AI Prompt for F1
```
Read API_SPEC.md entirely. Read AGENTS.md Resilience section.

Your task: Generate React authentication shell, API adapter, and mock API.

Requirements:
1. Create apps/web/src/api/client.ts:
   - Axios instance configured to hit http://localhost:8000/api/v1
   - Interceptor to attach JWT token from localStorage to all requests
   - Response interceptor that validates envelope: { success, data, error }
   - If success=false, throw error with error.code + error.message
   - If success=true, return response.data (unwrap the envelope)
   - Error handling: If response is not JSON, return generic error

2. Create apps/web/src/api/mock.ts:
   - Export a mock API object that returns hardcoded data matching API_SPEC.md exactly
   - Functions: login(email, password), signup(email, password, departmentId), getMe()
   - login("admin@company.com", "password") -> { user: { id: 1, email, role: "admin", department_id: 10 }, token: "mock-jwt-..." }
   - signup(...) -> same shape as login
   - getMe() -> same user object
   - Simulate network delay: setTimeout 500ms before returning
   - NO side effects (no database calls)

3. Create apps/web/src/context/AuthContext.tsx:
   - useAuth hook
   - State: user (or null), token (or null), loading, error
   - Methods: login(email, password), signup(email, password, departmentId), logout()
   - login(): call api.login(), store token in localStorage("auth_token"), set user in context
   - logout(): clear localStorage, clear context
   - On app load: check localStorage for token, if exists, call getMe() to restore user
   - useAuth() must throw if called outside AuthProvider

4. Create apps/web/src/routes/Login.tsx:
   - Form with email + password inputs using react-hook-form + zod
   - Email validation: valid email format
   - Password validation: non-empty, min 6 chars
   - Submit button: calls auth.login(), shows loading state
   - On success: redirect to /dashboard
   - On error: show error message in UI
   - Link to /signup

5. Create apps/web/src/routes/Signup.tsx:
   - Form with email + password + department_id inputs
   - Validations: email, password (min 6), department_id required
   - Submit: calls auth.signup()
   - On success: redirect to /dashboard
   - On error: show error message
   - Link to /login

6. Create apps/web/src/App.tsx:
   - AuthProvider wraps entire app
   - Routes:
     * /login (public)
     * /signup (public)
     * /dashboard (protected)
     * /carbon (protected)
     * /csr (protected)
     * /governance (protected)
     * /gamification (protected)
     * Protected route: if no token, redirect to /login
   - Use react-router-dom

7. Environment variables:
   - Create .env file with VITE_USE_MOCK_API=true initially
   - If true: use mock.ts
   - If false: use client.ts (hit real backend)
   - At 11:00 AM, set to false to swap to live backend

Output: TypeScript/React code only. Test locally: npm run dev, click through login/signup, verify no console errors.
```

### Definition of Done (F1)
- [ ] Login form renders and accepts input
- [ ] Signup form renders and accepts input
- [ ] Successful login redirects to /dashboard
- [ ] Token stored in localStorage after login
- [ ] Logout clears token
- [ ] Protected routes redirect to /login if no token
- [ ] No console errors
- [ ] Mock API returns data matching API_SPEC.md envelope

### Merge Checklist (F1)
- [ ] Forms validate input (email, password min length)
- [ ] No console errors or warnings
- [ ] Envelope validation works (if mock returns wrong shape, error is clear)
- [ ] Redirects work on login/logout

### Fallback (If F1 fails)
- Hardcode token in localStorage
- Skip auth, go straight to dashboard
- Frontend still works

---

### F2: Dashboard & Core Forms (P0) - Frontend CRUD
- **Owner:** Shriraj
- **Worktree:** `ecosphere-fe-crud`
- **Deps:** F1 (auth must be merged first)
- **Time:** 45 min (10:45-11:30 after F1 merge)
- **Branch:** `feat/dashboard-forms`
- **Files to Generate:**
  - `apps/web/src/routes/Dashboard.tsx` (Main dashboard with scores + trend chart)
  - `apps/web/src/routes/Carbon.tsx` (Log carbon transaction form + transaction list)
  - `apps/web/src/routes/CSR.tsx` (Create activity form + activity list + approve participations)
  - `apps/web/src/components/Charts.tsx` (Recharts for scores + trend)

### AI Prompt for F2
```
Read API_SPEC.md Dashboard and Environmental/Social sections.

Assume F1 (auth) was merged to main. Your task: Generate dashboard and forms.

Requirements:
1. Create apps/web/src/routes/Dashboard.tsx:
   - Fetches GET /api/v1/dashboard/organization on mount (wraps in try/catch)
   - If fetch fails: render empty state "Dashboard data unavailable"
   - If success: render:
     * Overall ESG Score (large number, center of screen)
     * Three score cards: Environmental (40%), Social (30%), Governance (30%)
     * Department scores table with columns: Department, Env, Social, Gov, Total
     * Trend chart: Line chart showing total_score over last 7 days (use Recharts)
   - Use shadcn/ui Card, Button, Table components
   - Use Recharts for charts (LineChart, XAxis, YAxis, Tooltip, Legend)
   - Responsive: works on mobile/desktop

2. Create apps/web/src/routes/Carbon.tsx:
   - Two sections: Form + Table
   - Form:
     * Dropdown: Select department (fetch from GET /api/v1/departments)
     * Dropdown: Select emission factor (fetch from GET /api/v1/emission-factors)
     * Input: Quantity (number, required)
     * Input: Transaction date (date picker)
     * Button: Submit (POST /api/v1/carbon-transactions)
     * On success: show Toast "Transaction logged", clear form, refetch table
     * On error: show error in Toast
   - Table:
     * Columns: Date, Emission Factor, Quantity, CO2e Calculated
     * Fetch from GET /api/v1/carbon-transactions?department_id=<selected>
     * Refetch after form submit
   - Use react-hook-form + zod for form validation
   - Use try/catch for all API calls
   - If table fetch fails: render "Unable to load transactions"

3. Create apps/web/src/routes/CSR.tsx:
   - Three sections: Create Activity (admin only) + Activities + Participations (admin only)
   - Create Activity:
     * Visible only to admin (check auth.user.role)
     * Form: Title, Description, Category (dropdown from GET /api/v1/categories), Points Value
     * Submit: POST /api/v1/csr-activities
     * On success: Toast, refetch activities table
   - Activities Table:
     * Columns: Title, Category, Points, Department
     * Fetch from GET /api/v1/csr-activities?department_id=<selected>
   - Participations (Admin Approve):
     * Table of pending participations
     * Columns: Employee, Activity, Status, Proof URL (link)
     * Action: Approve/Reject button
     * On click: PATCH /api/v1/participations/{id}/approve with { approval_status: "approved"|"rejected" }
     * On success: refetch table, Toast "Approved"
   - Use react-hook-form + zod
   - Use try/catch

4. Create apps/web/src/components/Charts.tsx:
   - ScoreCard(label, value, weight) -> renders a card with score + label + weight %
   - TrendChart(data) -> renders Recharts LineChart with date on X, total_score on Y
   - Usage in Dashboard:
     * <TrendChart data={dashboard.trend} />
     * <ScoreCard label="Environmental" value={overall.environmental_score} weight={40} />

5. Styling:
   - Use Tailwind CSS for layout (grid, flexbox)
   - Use shadcn/ui for components (Card, Button, Input, Table, Select)
   - Color scheme: Green for environmental, Blue for social, Purple for governance, Gray for overall
   - Dark mode optional (use next-themes if time permits)

6. Error handling:
   - All fetch calls wrapped in try/catch
   - On fetch error: render error message or empty state, NOT crash
   - Non-critical failures (e.g., trends not available): render without that section
   - Critical failures (e.g., dashboard doesn't load): show full-page error

Output: TypeScript/React code only. Test locally: npm run dev, click through all forms, verify data flows correctly.
```

### Definition of Done (F2)
- [ ] Dashboard loads without crashing (even if API fails)
- [ ] Carbon form submits and refetches table
- [ ] CSR form works (create activity, approve participation)
- [ ] All forms use react-hook-form + zod validation
- [ ] Tables render data from API (or show empty state)
- [ ] Charts render trend data
- [ ] No console errors
- [ ] Responsive layout

### Merge Checklist (F2)
- [ ] All forms validate input before submit
- [ ] API responses match expected envelope
- [ ] Error states render gracefully
- [ ] No console errors or warnings

### Fallback (If F2 fails)
- Dashboard shows hardcoded scores
- Forms don't submit (but render)
- Tables show empty state
- Still demoable

---

### F3: Governance & Gamification (P1) - Frontend Auth or CRUD
- **Owner:** Shriraj or Sujal (whichever has capacity)
- **Worktree:** Either `ecosphere-fe-auth` or `ecosphere-fe-crud`
- **Deps:** F1, F2 (auth + dashboard merged)
- **Time:** 45 min (12:00-12:45)
- **Branch:** `feat/governance-gamification`
- **Files to Generate:**
  - `apps/web/src/routes/Governance.tsx` (Policy list + acknowledgement form)
  - `apps/web/src/routes/Gamification.tsx` (Leaderboard + badges + rewards)
  - `apps/web/src/routes/Reports.tsx` (Static prototype UI only)

### AI Prompt for F3
```
Read API_SPEC.md Governance and Gamification sections.

Your task: Generate governance and gamification routes.

Requirements:
1. Create apps/web/src/routes/Governance.tsx:
   - Two sections: Policies + Acknowledgements
   - Policies Table:
     * Fetch GET /api/v1/policies
     * Columns: Title, Category, Status (acknowledged/not acknowledged by current user)
   - Acknowledgement Form (for each policy):
     * Button: "Acknowledge" (if not acknowledged)
     * On click: POST /api/v1/policy-acknowledgements { policy_id }
     * On success: refetch table, show Toast
   - Use try/catch
   - If fetch fails: show empty state

2. Create apps/web/src/routes/Gamification.tsx:
   - Three sections: Leaderboard + Badges + Rewards
   - Leaderboard Table:
     * Fetch GET /api/v1/leaderboard?department_id=<selected>
     * Columns: Rank, Employee, XP Points, Total Score
     * Paginate if > 10 rows
   - Badges:
     * Fetch GET /api/v1/employees/{user_id}/badges
     * Grid of badge cards (image + name + description)
     * If no badges: "No badges earned yet"
   - Rewards:
     * Optional: mockup of reward redemption (don't wire to backend if time-constrained)
     * Show list of available rewards with XP cost
   - Use try/catch

3. Create apps/web/src/routes/Reports.tsx:
   - PROTOTYPE ONLY: Static UI, no backend wiring
   - Render a card that says "Reports — Coming Soon"
   - Below: mockup of what reports will look like (static screenshot or wireframe)
   - No fetch calls, no interactivity required
   - Goal: Show design direction to judges

4. Update apps/web/src/App.tsx:
   - Add routes: /governance, /gamification, /reports
   - Add nav links to sidebar/header

Output: TypeScript/React code. Governance and Gamification must wire to backend. Reports is static prototype.
```

### Definition of Done (F3)
- [ ] Governance form submits policy acknowledgements
- [ ] Leaderboard fetches and renders
- [ ] Badges display
- [ ] Reports shows prototype UI
- [ ] No console errors

### Merge Checklist (F3)
- [ ] All routes load without crashing
- [ ] Policy acknowledgement works
- [ ] Leaderboard fetches correctly

### Fallback (If F3 fails)
- Hide routes in UI (use feature flags)
- Show "Coming Soon" for all three
- Core loop (Env + Social) still demos

---

## Integration Checkpoints

| Time | Task | Owner | Success Criteria |
|---|---|---|---|
| **10:45** | Merge B1, F1 to main | Sujal, Shriraj | No conflicts, code compiles |
| **11:00** | Merge B2, B3, B4, F2 to main | Sujal, Shriraj | Smoke test passes (see below) |
| **11:15** | **SMOKE TEST:** Carbon → Score → Dashboard | Both | 1. Log transaction 2. Score updates 3. Dashboard shows new score |
| **12:00** | Merge B5, F3 to main | Sujal, Shriraj | Governance + Gamification routes load |
| **02:00** | **FREEZE CODE** | Both | No new features, bug fixes only |
| **03:00** | **Bug Bash** | Both | Fix showstoppers (500 errors, crashes) |
| **04:00** | **Demo Rehearsal** | Both | Run demo script 3 times, record fallback video |
| **05:00** | **SUBMIT** | Both | Push to repo, submit link |

---

## Smoke Test (Run at 11:15)

```bash
# Backend running
uvicorn apps/api/main:app --reload

# In another terminal, run smoke test script:
python tests/smoke.py

# Expected output:
# ✓ Login successful
# ✓ Carbon transaction logged
# ✓ Environmental score updated from 100 to 75
# ✓ Dashboard returns new score
# ✓ Smoke test passed
```

Script generates a carbon transaction, queries dashboard, verifies score changed.
If test fails: identify which step failed, rollback that merge, re-prompt AI, re-merge.

---

## Emergency Protocols

### If B1 (Models) Fails
- Manually write models in single file
- Proceed with B2 anyway

### If B3 (Score Tests) Fails
- Use hardcoded score formula in routes
- Note: "Simplified scoring for demo"

### If B4 (APIs) Fails
- Return mock data from routes
- Frontend shows working UI, static data

### If F1 (Auth) Fails
- Hardcode JWT in localStorage
- Skip auth form, go straight to dashboard

### If F2 (Dashboard) Fails
- Show hardcoded dashboard wireframe
- Explain: "UI framework ready, data binding in progress"

### If Smoke Test Fails at 11:15
- Identify failing step
- Revert that merge
- Fix in isolation
- Re-test before re-merging
- Time budget: 30 minutes. If not fixed by 11:45, continue without that feature.

---

## Definition of Done (Global)

Every commit to `main` must pass:
1. ✅ Code compiles (no syntax errors)
2. ✅ No console errors (backend logs, frontend devtools)
3. ✅ Response envelopes match API_SPEC.md
4. ✅ No database errors
5. ✅ One manual integration test (e.g., curl test for backend, click test for frontend)

If any item fails: don't merge. Fix on branch first.
