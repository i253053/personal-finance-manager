# User Stories

Stories follow the format: **As a [role], I want [goal], so that [benefit].**

Priority: **Must** (MVP) · **Should** · **Could** (stretch)

---

## Epic 1: Authentication

### US-1.1 Register
**As a** new user, **I want** to create an account with my email and password, **so that** I can securely store my financial data.

**Acceptance criteria:**
- [ ] Form validates email format and password strength (min 8 chars, 1 number)
- [ ] Duplicate email returns 409 with clear message
- [ ] On success, user is logged in and redirected to dashboard
- [ ] Default categories are seeded for the new user

**Priority:** Must · **Points:** 3

---

### US-1.2 Login
**As a** returning user, **I want** to log in with my credentials, **so that** I can access my finances.

**Acceptance criteria:**
- [ ] Valid credentials return tokens and user profile
- [ ] Invalid credentials return 401 without revealing which field failed
- [ ] Token stored securely (httpOnly cookie or memory + refresh flow)

**Priority:** Must · **Points:** 2

---

### US-1.3 Logout
**As a** logged-in user, **I want** to log out, **so that** others cannot access my account on a shared device.

**Acceptance criteria:**
- [ ] Refresh token invalidated on server
- [ ] Client clears auth state and redirects to login

**Priority:** Must · **Points:** 1

---

### US-1.4 Forgot Password
**As a** user who forgot my password, **I want** to reset it via email, **so that** I can regain access.

**Acceptance criteria:**
- [ ] Request always returns 200 (no email enumeration)
- [ ] Reset link expires in 1 hour
- [ ] New password meets strength rules

**Priority:** Should · **Points:** 5

---

## Epic 2: Dashboard

### US-2.1 Financial Overview
**As a** user, **I want** to see my balance and monthly totals at a glance, **so that** I understand my current financial health.

**Acceptance criteria:**
- [ ] Balance = sum(income) − sum(expenses) for selected period
- [ ] Monthly income/expense cards update when month changes
- [ ] Values formatted as currency ($1,234.56)

**Priority:** Must · **Points:** 3

---

### US-2.2 Recent Activity
**As a** user, **I want** to see my latest transactions on the dashboard, **so that** I can quickly verify recent spending.

**Acceptance criteria:**
- [ ] Shows last 5–10 transactions with category, amount, date
- [ ] "View all" links to transactions page
- [ ] Empty state if no transactions exist

**Priority:** Must · **Points:** 2

---

### US-2.3 Budget Alerts
**As a** user, **I want** to see which budgets are at risk, **so that** I can adjust spending before overspending.

**Acceptance criteria:**
- [ ] Categories ≥ 80% show warning styling
- [ ] Categories ≥ 100% show danger styling
- [ ] Clicking a budget row navigates to budgets page

**Priority:** Must · **Points:** 3

---

## Epic 3: Transactions

### US-3.1 Add Transaction
**As a** user, **I want** to record income or expenses, **so that** my records stay up to date.

**Acceptance criteria:**
- [ ] Modal or dedicated form with amount, type, category, date, notes
- [ ] Amount must be positive; type determines sign in calculations
- [ ] Default date is today
- [ ] Success toast and list refresh

**Priority:** Must · **Points:** 3

---

### US-3.2 Edit Transaction
**As a** user, **I want** to correct a transaction, **so that** my data stays accurate.

**Acceptance criteria:**
- [ ] Pre-filled form with existing values
- [ ] Only owner can edit (403 otherwise)
- [ ] Dashboard and reports reflect changes

**Priority:** Must · **Points:** 2

---

### US-3.3 Delete Transaction
**As a** user, **I want** to remove incorrect entries, **so that** totals are not skewed.

**Acceptance criteria:**
- [ ] Confirmation dialog before delete
- [ ] Transaction removed from DB and UI

**Priority:** Must · **Points:** 1

---

### US-3.4 Search & Filter
**As a** user, **I want** to find transactions by date, category, or keyword, **so that** I can audit specific spending.

**Acceptance criteria:**
- [ ] Filter by date range, type, category
- [ ] Search matches notes (case-insensitive) and exact amount
- [ ] Filters persist in URL query params
- [ ] Pagination works with active filters

**Priority:** Must · **Points:** 5

---

## Epic 4: Categories

### US-4.1 Default Categories
**As a** new user, **I want** sensible default categories, **so that** I can start tracking immediately.

**Acceptance criteria:**
- [ ] At least 5 expense and 3 income categories created on register
- [ ] Each has name, color, and type

**Priority:** Must · **Points:** 2

---

### US-4.2 Manage Categories
**As a** user, **I want** to add, edit, and delete my own categories, **so that** labels match how I think about money.

**Acceptance criteria:**
- [ ] Custom categories distinguished from defaults (optional lock on delete for defaults)
- [ ] Cannot delete category with transactions unless reassignment flow provided
- [ ] Color picker for visual distinction in charts

**Priority:** Must · **Points:** 3

---

## Epic 5: Budgets

### US-5.1 Set Monthly Budget
**As a** user, **I want** to set a spending limit per category per month, **so that** I can control my spending.

**Acceptance criteria:**
- [ ] One budget per category per month
- [ ] Amount must be > 0
- [ ] UI shows progress bar: spent / limit

**Priority:** Must · **Points:** 3

---

### US-5.2 Overspending Alert
**As a** user, **I want** a clear alert when I exceed a budget, **so that** I know to slow down.

**Acceptance criteria:**
- [ ] Over-budget categories highlighted in red on dashboard and budgets page
- [ ] Spent can exceed limit (not blocked); display shows overage amount

**Priority:** Must · **Points:** 2

---

## Epic 6: Reports

### US-6.1 Spending Trends
**As a** user, **I want** charts showing income vs. expenses over time, **so that** I spot patterns.

**Acceptance criteria:**
- [ ] Line or bar chart for monthly totals
- [ ] Toggle between 3, 6, 12 months
- [ ] Chart is responsive and readable on mobile

**Priority:** Must · **Points:** 5

---

### US-6.2 Category Breakdown
**As a** user, **I want** a pie chart of spending by category, **so that** I see where money goes.

**Acceptance criteria:**
- [ ] Only expense transactions in breakdown
- [ ] Legend with amounts and percentages
- [ ] Respects selected date range

**Priority:** Must · **Points:** 3

---

## Epic 7: Stretch Features

| ID | Story | Priority | Points |
|----|-------|----------|--------|
| US-7.1 | Recurring transactions auto-create on schedule | Could | 8 |
| US-7.2 | Import/export transactions as CSV | Could | 5 |
| US-7.3 | Dark mode toggle with system preference | Could | 3 |
| US-7.4 | Savings goals with progress tracking | Could | 5 |
| US-7.5 | AI spending insights (monthly summary) | Could | 8 |

---

## Story Map (MVP Flow)

```
Register → Login → Dashboard
                      ↓
         ┌────────────┼────────────┐
         ↓            ↓            ↓
   Transactions   Budgets      Reports
         ↓
    Categories
```

**MVP story count:** 16 Must + 2 Should ≈ **38 story points** (~6–8 weeks part-time)
