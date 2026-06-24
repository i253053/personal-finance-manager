# Personal Finance Manager

A full-stack portfolio application for tracking income, expenses, budgets, and financial goals.

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | _Deploy to Vercel — see [Deployment](docs/09-deployment.md)_ |
| API | _Deploy to Render — see [Deployment](docs/09-deployment.md)_ |

**Demo login:** `demo@financeapp.com` / `Demo1234`

## Features

- JWT authentication (register, login, logout, token refresh)
- Transaction CRUD with search, filters, and pagination
- Category management with defaults seeded on signup
- Monthly budgets with progress bars and overspend alerts
- Savings goals with progress tracking and contributions
- Dashboard with summary cards, trends, and recent activity
- Reports with income vs expense charts and category breakdown
- Recurring transactions (daily, weekly, monthly, etc.) with auto-processing
- Dark mode toggle
- Mobile-responsive UI

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens) |
| Deployment | Vercel (full stack) + Neon PostgreSQL |

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (for local PostgreSQL)

### 1. Start the database

```bash
cd database
docker compose up -d
```

### 2. Set up the server

```bash
cd server
cp .env.example .env
npm install
npm run migrate
npm run seed          # creates demo account with sample data
npm run dev
```

Server runs at http://localhost:5000

### 3. Set up the client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Client runs at http://localhost:5173

### Demo account

After running `npm run seed`:

- **Email:** `demo@financeapp.com`
- **Password:** `Demo1234`

Includes 6 months of transactions, budgets, and savings goals.

## Deployment (Vercel)

Deploy frontend + API together on Vercel with Neon PostgreSQL.

See **[docs/10-vercel-deploy.md](docs/10-vercel-deploy.md)** for the full guide.

**Quick steps:**
1. Create free database at [neon.tech](https://neon.tech)
2. Push repo to GitHub
3. Import to [vercel.com/new](https://vercel.com/new)
4. Set env vars: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NODE_ENV=production`
5. Deploy → seed demo data via `POST /api/v1/dev/seed`

Legacy Render deploy: [docs/09-deployment.md](docs/09-deployment.md)

## API

Base URL: `http://localhost:5000/api/v1`

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `POST /auth/register` | Create account |
| `POST /auth/login` | Login |
| `GET /users/me` | Current user |
| `GET /transactions` | List transactions |
| `GET /budgets` | Monthly budgets |
| `GET /goals` | Savings goals |
| `GET /reports/summary` | Dashboard totals |
| `POST /dev/seed` | Seed demo data (dev/staging) |

See [docs/04-api-endpoints.md](docs/04-api-endpoints.md) for the full API contract.

## Project Structure

```
personal-finance-manager/
├── client/          # React frontend
├── server/          # Express API
├── database/        # Migrations + Docker Compose
├── docs/            # Design & deployment docs
└── render.yaml      # Render Blueprint
```

## Documentation

| Document | Description |
|----------|-------------|
| [Software Requirements](docs/01-software-requirements.md) | Functional & non-functional requirements |
| [User Stories](docs/02-user-stories.md) | Epics and acceptance criteria |
| [Database Schema](docs/03-database-schema.md) | Tables and relationships |
| [API Endpoints](docs/04-api-endpoints.md) | REST API contract |
| [Deployment](docs/09-deployment.md) | Vercel + Render guide |

## License

MIT
