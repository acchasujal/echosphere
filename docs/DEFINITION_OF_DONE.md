# DEFINITION_OF_DONE.md — Merge Validation Checklist

Use this checklist for validation prior to committing any feature.

---

## Pre-Commit Verification (Self-Check)

### Backend Checks
- [ ] **No syntax errors:** Express server runs without throwing compilation errors.
- [ ] **Verification suite passes:** `node verify.js` completes successfully.
- [ ] **Standard response format:** Payload returned by routes is wrapped in `{ success: true, data: ... }` (except when explicitly matching legacy structures like `/dashboard`).

### Frontend Checks
- [ ] **Dev server starts:** React app compiles and runs.
- [ ] **Try/Catch blocks:** All Axios or Fetch calls are wrapped in exception handlers.
- [ ] **No console errors:** No red warnings exist in the browser console.

---

## Integration Test Flow

Before merging a frontend component, verify data connectivity:
1. Start the Express server on port 3000.
2. Verify API routes handle POST/GET requests.
3. Validate that UI forms trigger appropriate API requests and refresh dashboard charts.
