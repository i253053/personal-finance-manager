# Software Requirements Specification (SRS)

**Project:** Personal Finance Manager  
**Version:** 1.0  
**Last updated:** 2026-06-24

---

## 1. Purpose & Scope

### 1.1 Purpose

Build a secure, responsive web application that helps individuals track income and expenses, set monthly budgets, visualize spending patterns, and monitor savings goals.

### 1.2 Scope (MVP)

| In scope | Out of scope (v1) |
|----------|-------------------|
| User registration & login | Bank account linking (Plaid) |
| CRUD for transactions | Real-time multi-user sharing |
| Category management | Native mobile apps |
| Monthly budgets with alerts | Tax filing / investment advice |
| Dashboard & reports | AI insights (stretch) |
| JWT authentication | |

### 1.3 Target Users

- **Primary:** Job seekers / developers building a portfolio piece
- **Secondary:** Individuals who want a simple manual expense tracker (no bank sync)

---

## 2. Functional Requirements

### 2.1 Authentication (FR-AUTH)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | Users can register with email, password, and display name | Must |
| FR-AUTH-02 | Passwords must be hashed (bcrypt, cost ≥ 10) | Must |
| FR-AUTH-03 | Users can log in and receive JWT access + refresh tokens | Must |
| FR-AUTH-04 | Users can log out (refresh token invalidated server-side) | Must |
| FR-AUTH-05 | Protected routes reject unauthenticated requests (401) | Must |
| FR-AUTH-06 | Users can request password reset via email | Should |
| FR-AUTH-07 | Email must be unique across accounts | Must |

### 2.2 Dashboard (FR-DASH)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASH-01 | Display current balance (income − expenses, all time or configurable) | Must |
| FR-DASH-02 | Show total income and expenses for the current calendar month | Must |
| FR-DASH-03 | List the 5–10 most recent transactions | Must |
| FR-DASH-04 | Show budget progress summary (categories near/over limit) | Must |
| FR-DASH-05 | Display a mini chart of spending trend (last 6 months) | Should |

### 2.3 Transactions (FR-TXN)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TXN-01 | Create transaction: amount, type (income/expense), category, date, notes | Must |
| FR-TXN-02 | Edit any field on an existing transaction | Must |
| FR-TXN-03 | Soft-delete or hard-delete a transaction | Must |
| FR-TXN-04 | List transactions with pagination (default 20/page) | Must |
| FR-TXN-05 | Filter by date range, type, category | Must |
| FR-TXN-06 | Search by notes or amount | Must |
| FR-TXN-07 | Sort by date (default: newest first) | Must |
| FR-TXN-08 | Users can only access their own transactions | Must |

### 2.4 Categories (FR-CAT)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CAT-01 | System provides default categories on registration (Food, Rent, Salary, etc.) | Must |
| FR-CAT-02 | Users can create custom categories (name, type, color, icon) | Must |
| FR-CAT-03 | Users can edit and delete custom categories | Must |
| FR-CAT-04 | Deleting a category reassigns or blocks if transactions exist | Must |
| FR-CAT-05 | Category names unique per user per type | Must |

### 2.5 Budgets (FR-BUD)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-BUD-01 | Set a monthly spending limit per category | Must |
| FR-BUD-02 | Budget applies to a specific month/year | Must |
| FR-BUD-03 | Show spent vs. limit with percentage | Must |
| FR-BUD-04 | Visual indicator when ≥ 80% (warning) or ≥ 100% (over) | Must |
| FR-BUD-05 | Copy previous month's budgets to current month | Should |

### 2.6 Reports (FR-RPT)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RPT-01 | Monthly bar/line chart of income vs. expenses | Must |
| FR-RPT-02 | Pie/donut chart of spending by category | Must |
| FR-RPT-03 | Date range selector (month, quarter, year, custom) | Must |
| FR-RPT-04 | Export summary as CSV | Should |

### 2.7 Goals (FR-GOAL) — Stretch

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-GOAL-01 | Create savings goal with target amount and deadline | Could |
| FR-GOAL-02 | Track progress with manual contributions | Could |
| FR-GOAL-03 | Show progress bar and % complete | Could |

---

## 3. Non-Functional Requirements

### 3.1 Security (NFR-SEC)

- All API traffic over HTTPS in production
- JWT access token TTL: 15 minutes; refresh token: 7 days
- Refresh tokens stored hashed in DB
- Input validation on all endpoints (express-validator / Zod)
- Rate limiting on auth endpoints (e.g., 10 req/min/IP)
- CORS restricted to frontend origin
- No sensitive data in client-side logs

### 3.2 Performance (NFR-PERF)

- Dashboard initial load < 2s on 3G (excluding chart render)
- API p95 latency < 300ms for list endpoints (< 1000 rows)
- Database queries use indexes on `user_id`, `date`, `category_id`

### 3.3 Usability (NFR-UX)

- Mobile-first responsive design (breakpoints: 640, 768, 1024, 1280)
- WCAG 2.1 AA contrast for text
- Form validation with inline error messages
- Loading skeletons for async data
- Empty states with clear CTAs

### 3.4 Reliability (NFR-REL)

- Graceful error handling with user-friendly messages
- Database migrations version-controlled
- Health check endpoint (`GET /api/health`)

### 3.5 Maintainability (NFR-MAINT)

- ESLint + Prettier on client and server
- Environment variables for secrets (never committed)
- README with setup, env vars, and deployment steps
- Consistent REST conventions and HTTP status codes

### 3.6 Deployment (NFR-DEPLOY)

- Frontend on Vercel with preview deploys per PR
- Backend on Render/Railway with PostgreSQL add-on or external DB
- Separate `development`, `staging` (optional), `production` configs

---

## 4. Assumptions & Constraints

| Assumption | Impact |
|------------|--------|
| Single currency (USD) for MVP | Simplifies formatting; multi-currency is stretch |
| Manual entry only | No transaction import from banks in MVP |
| One user per account | No household/shared budgets in v1 |
| Server timezone UTC | Dates stored as `DATE` or `TIMESTAMPTZ` consistently |

---

## 5. Success Criteria (Portfolio)

- [ ] Live demo URL in README
- [ ] GitHub repo with clean commit history
- [ ] Auth + CRUD + charts working end-to-end
- [ ] Mobile-responsive UI
- [ ] Architecture diagram in docs
- [ ] 5-minute Loom walkthrough (optional but recommended)
