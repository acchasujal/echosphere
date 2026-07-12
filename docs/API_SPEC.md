# API_SPEC.md — Express + Prisma Contract

**Base URL:** `http://localhost:3000`

---

## Response Envelope

### Success Envelope
```json
{
  "success": true,
  "data": { /* actual payload */ },
  "message": "Optional message string"
}
```

### Error Envelope
```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

---

## Implemented API Endpoints

### Employees
*   `GET /employees` - Returns array of employees.
*   `POST /employees` - Creates an employee.
    *   **Body:** `{ name, email, password, role, departmentId }`
*   `GET /employees/:id` - Returns single employee.
*   `PATCH /employees/:id` - Updates employee fields.
*   `DELETE /employees/:id` - Deletes employee.

### Carbon Transactions
*   `GET /carbon-transactions` - Returns all carbon transaction logs.
*   `POST /carbon-transactions` - Logs a carbon emission.
    *   **Body:** `{ departmentId, source, quantity, co2Amount }`
*   `GET /carbon-transactions/:id` - Returns single transaction.
*   `PATCH /carbon-transactions/:id` - Updates transaction fields.
*   `DELETE /carbon-transactions/:id` - Deletes transaction.

### CSR & Activities
*   `GET /csr` - Returns list of CSR activities.
*   `POST /csr` - Creates a CSR activity.
    *   **Body:** `{ title, description, category, location, startDate, endDate, status, pointsReward }`
*   `GET /csr/:id` - Returns single activity.
*   `PATCH /csr/:id` - Updates CSR activity.
*   `DELETE /csr/:id` - Deletes activity.

### Participations & Challenges
*   `GET /challenges` - Returns list of active challenges.
*   `POST /challenges` - Creates a new challenge.
*   `GET /participations` - Returns participations list.
*   `POST /participations` - Joins a challenge.
    *   **Body:** `{ employeeId, challengeId, status }`
*   `PATCH /participations/:id` - Marks challenge as `completed` (triggers notification/points).

### Dashboard & Scores
*   `GET /dashboard` - Returns general overview dashboard data (unwrapped).
*   `GET /dashboard/esg` - Returns current calculated ESG scores (wrapped).
    *   **Response data:** `{ environmentalScore, socialScore, governanceScore, overallScore }`

### Badges & Rewards
*   `GET /badges` - List of system badges.
*   `POST /badges/award/:employeeId` - Awards badge to employee.
*   `GET /rewards` - List of rewards.
*   `POST /rewards/:id/redeem` - Redeems a reward.
    *   **Body:** `{ employeeId }`

---

## Gaps / TODO Endpoints
*   `POST /auth/login` [TODO] - Authenticates credentials and returns JWT.
*   `POST /auth/signup` [TODO] - Registers an employee.
*   `GET /policies` [TODO] - List of policies.
*   `POST /policies` [TODO] - Creates a policy.
*   `POST /policy-acknowledgements` [TODO] - Acknowledges a policy.

---

## Scoring Logic Formulas

1.  **Environmental Score:** `50 - (totalCo2 / 100) + (completedEcoChallenges * 2)` (clamped between 0 and 100)
2.  **Social Score:** `(totalBadges * 5) + (totalParticipations * 2)` (capped at 100)
3.  **Governance Score:** `(resolvedComplianceIssues / totalComplianceIssues) * 100` (returns 100 if no issues exist)
4.  **Overall Score:** `(environmentalScore + socialScore + governanceScore) / 3`
