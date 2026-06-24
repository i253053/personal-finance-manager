# Folder Structure

Monorepo layout with separate `client` and `server` packages. No shared code package in MVP (duplicate types only if needed; consider a `shared/` package later).

```
personal-finance-manager/
├── README.md
├── .gitignore
├── .env.example                 # Root env reference (document vars)
│
├── client/                      # React + Vite + Tailwind
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css            # Tailwind directives
│   │   │
│   │   ├── api/                 # Axios/fetch wrappers
│   │   │   ├── client.js        # Base instance + interceptors
│   │   │   ├── auth.js
│   │   │   ├── transactions.js
│   │   │   ├── categories.js
│   │   │   ├── budgets.js
│   │   │   └── reports.js
│   │   │
│   │   ├── components/
│   │   │   ├── ui/              # Reusable primitives
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   └── EmptyState.jsx
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── MobileNav.jsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── SummaryCards.jsx
│   │   │   │   ├── RecentTransactions.jsx
│   │   │   │   ├── BudgetAlerts.jsx
│   │   │   │   └── MiniTrendChart.jsx
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionList.jsx
│   │   │   │   ├── TransactionRow.jsx
│   │   │   │   ├── TransactionForm.jsx
│   │   │   │   └── TransactionFilters.jsx
│   │   │   ├── categories/
│   │   │   │   ├── CategoryList.jsx
│   │   │   │   └── CategoryForm.jsx
│   │   │   ├── budgets/
│   │   │   │   ├── BudgetList.jsx
│   │   │   │   ├── BudgetProgressBar.jsx
│   │   │   │   └── BudgetForm.jsx
│   │   │   └── reports/
│   │   │       ├── IncomeExpenseChart.jsx
│   │   │       ├── CategoryPieChart.jsx
│   │   │       └── DateRangePicker.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   ├── CategoriesPage.jsx
│   │   │   ├── BudgetsPage.jsx
│   │   │   ├── ReportsPage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useTransactions.js
│   │   │   └── useDebounce.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── utils/
│   │   │   ├── formatCurrency.js
│   │   │   ├── formatDate.js
│   │   │   └── budgetStatus.js
│   │   │
│   │   └── routes/
│   │       └── index.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example             # VITE_API_URL=
│   └── vercel.json              # SPA rewrites
│
├── server/                      # Node.js + Express
│   ├── src/
│   │   ├── index.js             # Entry: load env, start server
│   │   ├── app.js               # Express app setup
│   │   │
│   │   ├── config/
│   │   │   ├── db.js            # Pool / Prisma client
│   │   │   └── env.js           # Validated env vars
│   │   │
│   │   ├── middleware/
│   │   │   ├── authenticate.js
│   │   │   ├── validate.js
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimiter.js
│   │   │
│   │   ├── routes/
│   │   │   ├── index.js         # Mount all routers
│   │   │   ├── auth.routes.js
│   │   │   ├── users.routes.js
│   │   │   ├── categories.routes.js
│   │   │   ├── transactions.routes.js
│   │   │   ├── budgets.routes.js
│   │   │   └── reports.routes.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── users.controller.js
│   │   │   ├── categories.controller.js
│   │   │   ├── transactions.controller.js
│   │   │   ├── budgets.controller.js
│   │   │   └── reports.controller.js
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── category.service.js
│   │   │   ├── transaction.service.js
│   │   │   ├── budget.service.js
│   │   │   └── report.service.js
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── transaction.validator.js
│   │   │   └── budget.validator.js
│   │   │
│   │   └── utils/
│   │       ├── jwt.js
│   │       ├── hash.js
│   │       └── seedCategories.js
│   │
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile               # Optional for Railway
│
├── database/
│   ├── migrations/
│   │   ├── 001_create_enums.sql
│   │   ├── 002_create_users.sql
│   │   └── ...
│   ├── seeds/
│   │   └── default_categories.sql
│   ├── docker-compose.yml       # PostgreSQL for local dev
│   └── README.md                # How to run migrations
│
└── docs/
    ├── 01-software-requirements.md
    ├── 02-user-stories.md
    ├── 03-database-schema.md
    ├── 04-api-endpoints.md
    ├── 05-folder-structure.md
    ├── 06-ui-wireframes.md
    ├── 07-milestones.md
    ├── 08-weekly-plan.md
    └── architecture.md          # Optional: system diagram
```

---

## Layer Responsibilities

### Client
- **Pages:** route-level composition, data fetching orchestration
- **Components:** presentational + light local state
- **api/:** HTTP layer only; no business logic
- **hooks/context:** auth state, shared data patterns

### Server
- **Routes:** HTTP method + path → controller
- **Controllers:** parse request, call service, send response
- **Services:** business logic + DB queries
- **Validators:** request schema (Zod recommended)
- **Middleware:** cross-cutting concerns

### Database
- SQL migrations versioned in git
- `docker-compose.yml` for local PostgreSQL
- Production DB on Render/Railway/Neon/Supabase

---

## Environment Variables

### Server (`.env`)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/finance_db
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
CLIENT_URL=http://localhost:5173
```

### Client (`.env`)
```
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Naming Conventions

| Area | Convention | Example |
|------|------------|---------|
| React components | PascalCase | `TransactionForm.jsx` |
| Hooks | camelCase, `use` prefix | `useAuth.js` |
| API routes | kebab-case plural | `/transactions` |
| DB tables | snake_case plural | `transactions` |
| DB columns | snake_case | `transaction_date` |
| JSON responses | camelCase | `transactionDate` |

---

## Git Branch Strategy (recommended)

```
main          → production
develop       → integration (optional for solo)
feature/*     → feature branches
fix/*         → bug fixes
```

For a solo portfolio project, trunk-based (`main` + feature branches) is fine.
