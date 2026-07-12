# API_SPEC.md — Frozen Contract

**This spec is frozen.** If your code doesn't match it, the spec wins. Do not deviate.

Base URL: `http://localhost:8000/api/v1`

---

## Response Envelope (Mandatory for Every Endpoint)

### Success Response
```json
{
  "success": true,
  "data": { /* actual payload */ },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "fields": { /* optional validation errors */ }
  }
}
```

**Error codes:**
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED` - Missing or invalid JWT
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `INTERNAL_ERROR` - Server error (catch-all)

---

## Authentication

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@company.com",
      "department_id": 10,
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null
}
```

**Response (401):**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid email or password",
    "fields": {}
  }
}
```

### Signup
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "newuser@company.com",
  "password": "password123",
  "department_id": 10
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "email": "newuser@company.com",
      "department_id": 10,
      "role": "employee"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "error": null
}
```

**JWT Payload:**
```json
{
  "user_id": 1,
  "email": "user@company.com",
  "department_id": 10,
  "role": "admin",
  "exp": 1720000000
}
```

---

## Master Data

### List Departments
```http
GET /api/v1/departments
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "name": "Operations",
      "code": "OPS",
      "employee_count": 45,
      "parent_department_id": null,
      "head_user_id": 1,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "error": null
}
```

### Create Department
```http
POST /api/v1/departments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Marketing",
  "code": "MKT",
  "employee_count": 15,
  "parent_department_id": null,
  "head_user_id": 5
}
```

**Response (201):** Same shape as GET list item.

### List Categories
```http
GET /api/v1/categories
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Community Service",
      "type": "csr",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "error": null
}
```

### List Emission Factors (Read-only, Pre-seeded)
```http
GET /api/v1/emission-factors
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "name": "Natural Gas (kg CO2e/unit)",
      "factor_value": 2.04,
      "unit": "m³",
      "category": "energy",
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "id": 102,
      "name": "Electricity (kg CO2e/kWh)",
      "factor_value": 0.85,
      "unit": "kWh",
      "category": "energy",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "error": null
}
```

---

## Environmental Module

### Log Carbon Transaction
```http
POST /api/v1/carbon-transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "department_id": 10,
  "emission_factor_id": 101,
  "quantity": 150.5,
  "transaction_date": "2024-07-12"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "department_id": 10,
    "emission_factor_id": 101,
    "quantity": 150.5,
    "calculated_emission": 307.02,
    "transaction_date": "2024-07-12",
    "created_at": "2024-07-12T14:30:00Z"
  },
  "error": null
}
```

**Side effect:** On POST, server recalculates `department_scores.environmental_score` for the department and updates `updated_at`.

### List Carbon Transactions
```http
GET /api/v1/carbon-transactions?department_id=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { /* same shape as POST response */ }
  ],
  "error": null
}
```

---

## Social Module

### Create CSR Activity
```http
POST /api/v1/csr-activities
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Beach Cleanup Drive",
  "description": "Remove plastic from beaches in Mumbai",
  "category_id": 1,
  "department_id": 10,
  "points_value": 50
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 5001,
    "title": "Beach Cleanup Drive",
    "description": "Remove plastic from beaches in Mumbai",
    "category_id": 1,
    "department_id": 10,
    "points_value": 50,
    "created_at": "2024-07-12T14:30:00Z",
    "updated_at": "2024-07-12T14:30:00Z"
  },
  "error": null
}
```

### List CSR Activities
```http
GET /api/v1/csr-activities?department_id=10
Authorization: Bearer <token>
```

**Response (200):** Array of CSR activities.

### Employee Participates in CSR
```http
POST /api/v1/participations
Authorization: Bearer <token>
Content-Type: application/json

{
  "activity_id": 5001,
  "proof_url": "https://s3.amazonaws.com/photos/beach-cleanup.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 3001,
    "user_id": 1,
    "activity_id": 5001,
    "status": "pending",
    "proof_url": "https://s3.amazonaws.com/photos/beach-cleanup.jpg",
    "created_at": "2024-07-12T14:30:00Z",
    "updated_at": "2024-07-12T14:30:00Z"
  },
  "error": null
}
```

**Note:** Status is `pending`. Admin must approve. User does NOT earn points yet.

### Admin Approves Participation
```http
PATCH /api/v1/participations/3001/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approval_status": "approved"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 3001,
    "user_id": 1,
    "activity_id": 5001,
    "status": "approved",
    "proof_url": "https://s3.amazonaws.com/photos/beach-cleanup.jpg",
    "created_at": "2024-07-12T14:30:00Z",
    "updated_at": "2024-07-12T14:35:00Z"
  },
  "error": null
}
```

**Side effects:**
- User's `xp_points` += activity's `points_value`
- Check if user has unlocked any badges (see Gamification module)
- Recalculate `department_scores.social_score` for the department

---

## Governance Module

### List Policies
```http
GET /api/v1/policies
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2001,
      "title": "Sustainability Policy",
      "description": "Company-wide commitment to carbon neutrality by 2030",
      "category": "environmental",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "error": null
}
```

### Create Policy
```http
POST /api/v1/policies
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Ethics Policy",
  "description": "Employee conduct and compliance guidelines",
  "category": "governance"
}
```

**Response (201):** Same shape as GET.

### Employee Acknowledges Policy
```http
POST /api/v1/policy-acknowledgements
Authorization: Bearer <token>
Content-Type: application/json

{
  "policy_id": 2001
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 4001,
    "user_id": 1,
    "policy_id": 2001,
    "acknowledged_at": "2024-07-12T14:30:00Z"
  },
  "error": null
}
```

**Side effect:** Recalculate `department_scores.governance_score` for the user's department.

---

## Gamification Module

### Get Badges
```http
GET /api/v1/badges
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 6001,
      "name": "Carbon Champion",
      "description": "Log 10+ carbon transactions",
      "criteria": "carbon_transactions >= 10",
      "xp_reward": 100,
      "icon_url": "https://icons.example.com/carbon-champion.png"
    }
  ],
  "error": null
}
```

### Get User's Badges
```http
GET /api/v1/employees/1/badges
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 6001,
      "name": "Carbon Champion",
      "earned_at": "2024-07-12T14:30:00Z"
    }
  ],
  "error": null
}
```

### Get Leaderboard
```http
GET /api/v1/leaderboard?department_id=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user_id": 1,
      "user_email": "user1@company.com",
      "department_id": 10,
      "xp_points": 500,
      "total_score": 85.3
    },
    {
      "rank": 2,
      "user_id": 2,
      "user_email": "user2@company.com",
      "department_id": 10,
      "xp_points": 450,
      "total_score": 82.1
    }
  ],
  "error": null
}
```

---

## Dashboard (Critical Demo Contract)

### Department Dashboard
```http
GET /api/v1/dashboard/department/10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "department": {
      "id": 10,
      "name": "Operations"
    },
    "environmental_score": 85.5,
    "social_score": 60.0,
    "governance_score": 100.0,
    "total_score": 80.2,
    "trend": [
      { "date": "2024-07-10", "total_score": 75.0 },
      { "date": "2024-07-11", "total_score": 77.5 },
      { "date": "2024-07-12", "total_score": 80.2 }
    ]
  },
  "error": null
}
```

**Note:** `trend` is last 7 days of daily average scores. If data doesn't exist for a day, omit that day.

### Organization Dashboard
```http
GET /api/v1/dashboard/organization
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overall_esg_score": 82.1,
    "weights": {
      "environmental": 0.4,
      "social": 0.3,
      "governance": 0.3
    },
    "department_scores": [
      {
        "department_id": 10,
        "department_name": "Operations",
        "environmental_score": 85.5,
        "social_score": 60.0,
        "governance_score": 100.0,
        "total_score": 80.2,
        "employee_count": 45
      },
      {
        "department_id": 11,
        "department_name": "Engineering",
        "environmental_score": 72.0,
        "social_score": 55.0,
        "governance_score": 90.0,
        "total_score": 73.0,
        "employee_count": 50
      }
    ]
  },
  "error": null
}
```

---

## Scoring Formulas (Implement Exactly)

### Environmental Score
```
normalized_emission_index = (total_co2e_this_month / NORMALIZATION_CONSTANT) * 100
environmental_score = max(0, 100 - normalized_emission_index)
```

**NORMALIZATION_CONSTANT:** Start with `1000.0`. Document in README. Can be tuned during demo prep.

**Example:**
- Total CO2e logged this month: 500 kg
- Normalized index: (500 / 1000) * 100 = 50
- Score: max(0, 100 - 50) = 50

### Social Score
```
completed_activities = count of approved participations for department this month
total_points_earned = sum of (participation.points_value) for all approved participations
total_points_possible = sum of (activity.points_value) for all activities in department this month

social_score = (total_points_earned / total_points_possible) * 100
```

**If total_points_possible == 0:** Return `100.0` (no activities assigned = perfect score).

**Example:**
- Activities in department: [50 points, 50 points, 100 points] = 200 total
- Earned: [50 approved, 100 approved] = 150 total
- Score: (150 / 200) * 100 = 75

### Governance Score
```
total_policies = count of all policies in company
policies_acknowledged = count of policies acknowledged by at least one employee in department

governance_score = (policies_acknowledged / total_policies) * 100
```

**If total_policies == 0:** Return `100.0`.

### Total Department Score
```
total_score = (environmental_score * 0.4) + (social_score * 0.3) + (governance_score * 0.3)
```

### Overall ESG Score (Organization)
```
overall_esg_score = average of (department_scores[i].total_score) for all departments
```

---

## Error Examples

### Validation Error
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": {
      "email": "Email is required",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

### Unauthorized
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "fields": {}
  }
}
```

### Not Found
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Department with ID 10 not found",
    "fields": {}
  }
}
```

---

## Integration Notes

- **JWT in Headers:** `Authorization: Bearer <token>`
- **CORS:** Backend must set `Access-Control-Allow-Origin: *` for hackathon. Restrict in production.
- **Content-Type:** Always `application/json`
- **Timestamps:** All datetimes in ISO 8601 format (`2024-07-12T14:30:00Z`)
- **Query Parameters:** Use `?key=value` for filtering (e.g., `GET /api/v1/carbon-transactions?department_id=10`)
