# 🌱 EcoSphere — AI-Powered Enterprise ESG Management Platform

> **Transform Sustainability into Measurable Action.**

EcoSphere is a full-stack Enterprise ESG (Environmental, Social & Governance) management platform built for the **Odoo Hackathon 2026**. It enables organizations to monitor sustainability performance, manage ESG operations, engage employees through gamification, and gain AI-powered insights from a unified executive dashboard.

Unlike traditional ESG tracking tools that operate in silos, EcoSphere integrates Environmental, Social, Governance, Compliance, Audits, Challenges, Rewards, and AI-powered analytics into a single enterprise platform.

> **AI-Assisted Development:** AI was used to accelerate development, architecture, UI generation, documentation, and code review. All generated code was integrated, reviewed, tested, and refined by the team.

---

# ✨ Key Features

## 📊 Executive ESG Dashboard

The central command center for organizational sustainability.

Features:

- Live Environmental, Social & Governance Scores
- Overall ESG Score
- Department-wise ESG comparison
- Interactive charts & visualizations
- Top performing employees
- Recent organizational activity
- AI-generated sustainability insights
- Executive KPI overview

---

## 🌿 Environmental Management

Track and reduce organizational environmental impact.

Features:

- Carbon transaction logging
- Automatic CO₂ estimation
- Department-wise emission tracking
- Environmental performance scoring
- Historical carbon records
- Environmental goals monitoring

---

## ❤️ CSR & Social Engagement

Encourage employee participation in sustainability initiatives.

Features:

- CSR activity management
- Employee participation tracking
- CSR approval workflow
- Points-based engagement
- Social ESG scoring

---

## 🏛 Governance & Compliance

Improve organizational governance and accountability.

Features:

- ESG Policy management
- Policy acknowledgements
- Compliance issue tracking
- Resolution workflow
- Governance scoring
- Audit scheduling & monitoring

---

## 🎯 Sustainability Challenges

Promote sustainability through gamification.

Features:

- Sustainability challenge management
- Employee participation
- Progress tracking
- Department engagement

---

## 🏆 Gamification

Increase employee engagement through rewards.

Features:

- XP system
- Leaderboard
- Achievement badges
- Rewards catalogue
- Reward redemption
- Employee recognition

---

## 🤖 AI ESG Insights

AI-powered executive assistance.

Features:

- ESG performance summary
- Sustainability recommendations
- Risk identification
- Organizational priorities
- Executive decision support

---

## ⚙️ Administration

Manage organizational structure and configuration.

Features:

- Department registry
- Organization settings
- ESG configuration
- Employee management foundation

---

# 📈 ESG Scoring

EcoSphere computes ESG scores using live organizational data.

### Environmental

Calculated from:

- Carbon emissions
- Department emission intensity
- Environmental activities

### Social

Calculated from:

- CSR participation
- Employee engagement
- Sustainability initiatives

### Governance

Calculated from:

- Policy acknowledgements
- Compliance status
- Governance participation

These combine into an overall ESG score displayed throughout the platform.

---

# 🏗 Architecture

```
React + Vite + TypeScript
        │
React Query + Axios
        │
────────────────────────────
Express.js API
Controllers
Services
Prisma ORM
────────────────────────────
SQLite Database
```

---

# 🛠 Technology Stack

## Frontend

- React 19
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- React Router
- Axios
- Recharts
- Lucide React

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM

## Database

- SQLite (Development)
- PostgreSQL Compatible Schema

## AI

- Google Gemini
- AI-generated ESG Insights

---

# 📂 Project Modules

| Module | Status |
|---------|--------|
| Executive Dashboard | ✅ Complete |
| Carbon Tracking | ✅ Complete |
| CSR Management | ✅ Complete |
| Governance | ✅ Complete |
| Compliance Issues | ✅ Complete |
| Audit Management | ✅ Complete |
| Sustainability Challenges | ✅ Complete |
| Gamification | ✅ Complete |
| Rewards | ✅ Complete |
| Notifications | ✅ Complete |
| AI ESG Insights | ✅ Complete |
| Settings | ✅ Complete |

---

# 📊 Demo Dataset

The platform includes a realistic enterprise dataset representing a medium-sized organization.

Seeded data includes:

- 10 Departments
- 45+ Employees
- 100+ Carbon Transactions
- CSR Activities
- ESG Policies
- Policy Acknowledgements
- Compliance Issues
- Audits
- Sustainability Challenges
- Employee Participations
- Badges
- Rewards
- Notifications

This enables every dashboard, chart, leaderboard, and management page to demonstrate realistic enterprise workflows.

---

# 🚀 Quick Start

## Backend

```bash
cd backend

npm install

npx prisma db push

npm run db:seed

npm run dev
```

Runs on:

```
http://localhost:3000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Runs on:

```
http://localhost:5173
```

The frontend communicates with the backend through the Vite proxy.

---

## Verify Backend

```bash
cd backend

node verify.js
```

Runs the backend smoke tests to verify API functionality.

---

# 🎬 Suggested Demo Flow

### 1. Executive Dashboard

- Overall ESG score
- AI Insights
- Department comparison
- KPI cards

### 2. Carbon Tracking

- Log emissions
- View history
- Department statistics

### 3. CSR

- Create CSR activity
- Track participation
- Demonstrate social engagement

### 4. Governance

- Publish policy
- Record acknowledgement
- Create compliance issue
- Schedule audit

### 5. Challenges

- Browse sustainability challenges
- Join challenge
- Track participation

### 6. Gamification

- Leaderboard
- Badges
- Rewards redemption

### 7. Settings

- Organization configuration
- Department management

---

# 📁 Repository Structure

```
echosphere/

├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   └── verify.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   └── App.tsx
│   └── index.html
│
└── docs/
    ├── AGENTS.md
    ├── API_SPEC.md
    ├── DESIGN_SYSTEM.md
    ├── TASKS.md
    └── README.md
```

---

# ⚠️ Current Limitations

To stay within the hackathon timeline, a few production features remain outside the MVP:

- Authentication is simulated using a demo employee context.
- Email notifications are not implemented.
- Multi-tenant organization support is not included.
- Report export (PDF/Excel) is planned for future iterations.
- Historical analytics are limited to the seeded demonstration dataset.

These limitations do not affect the core ESG workflow demonstrated by the platform.

---

# 👥 Team

**Team BRUH**

Built for the **Odoo Hackathon 2026**

---

## Vision

> *"Making sustainability measurable, engaging, and actionable through intelligent enterprise software."*
