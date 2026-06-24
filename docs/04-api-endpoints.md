# API Endpoints

**Base URL:** `https://api.yourapp.com/api/v1` (production)  
**Local:** `http://localhost:5000/api/v1`

**Conventions:**
- JSON request/response bodies
- Auth: `Authorization: Bearer <access_token>`
- Dates: ISO 8601 (`2026-06-24` or full timestamp)
- Amounts: decimal strings or numbers with 2 decimal places
- Pagination: `?page=1&limit=20`
- Errors: `{ "error": { "code": "...", "message": "..." } }`

---

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 204 | No content (DELETE) |
| 400 | Validation error |
| 401 | Missing/invalid token |
| 403 | Forbidden (not owner) |
| 404 | Resource not found |
| 409 | Conflict (duplicate email, budget) |
| 429 | Rate limited |
| 500 | Server error |

---

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | `{ "status": "ok", "db": "connected" }` |

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | Login |
| POST | `/auth/logout` | Yes | Invalidate refresh token |
| POST | `/auth/refresh` | No* | New access token (*requires refresh token) |
| POST | `/auth/forgot-password` | No | Send reset email |
| POST | `/auth/reset-password` | No | Reset with token |

### POST `/auth/register`
```json
// Request
{
  "email": "user@example.com",
  "password": "securePass1",
  "displayName": "Alex"
}

// Response 201
{
  "user": { "id": "uuid", "email": "...", "displayName": "..." },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### POST `/auth/login`
```json
// Request
{ "email": "user@example.com", "password": "securePass1" }

// Response 200 — same shape as register
```

### POST `/auth/refresh`
```json
// Request
{ "refreshToken": "eyJ..." }

// Response 200
{ "accessToken": "eyJ..." }
```

---

## Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | Yes | Current user profile |
| PATCH | `/users/me` | Yes | Update display name, currency |
| DELETE | `/users/me` | Yes | Delete account (cascade) |

### GET `/users/me`
```json
// Response 200
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "Alex",
  "currency": "USD",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

---

## Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | Yes | List all (filter: `?type=expense`) |
| POST | `/categories` | Yes | Create category |
| GET | `/categories/:id` | Yes | Get one |
| PATCH | `/categories/:id` | Yes | Update |
| DELETE | `/categories/:id` | Yes | Delete (with reassignment option) |

### POST `/categories`
```json
// Request
{
  "name": "Coffee",
  "type": "expense",
  "color": "#8B4513",
  "icon": "☕"
}

// Response 201
{
  "id": "uuid",
  "name": "Coffee",
  "type": "expense",
  "color": "#8B4513",
  "icon": "☕",
  "isDefault": false
}
```

### DELETE `/categories/:id`
```json
// Optional query: ?reassignTo=<categoryId>
// Response 204 or 400 if transactions exist and no reassignTo
```

---

## Transactions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/transactions` | Yes | List with filters |
| POST | `/transactions` | Yes | Create |
| GET | `/transactions/:id` | Yes | Get one |
| PATCH | `/transactions/:id` | Yes | Update |
| DELETE | `/transactions/:id` | Yes | Delete |

### GET `/transactions` — Query params

| Param | Type | Example |
|-------|------|---------|
| `page` | int | `1` |
| `limit` | int | `20` (max 100) |
| `type` | string | `income` \| `expense` |
| `categoryId` | uuid | |
| `startDate` | date | `2026-06-01` |
| `endDate` | date | `2026-06-30` |
| `search` | string | notes or amount |
| `sort` | string | `date_desc` (default), `date_asc`, `amount_desc` |

### POST `/transactions`
```json
// Request
{
  "amount": 45.99,
  "type": "expense",
  "categoryId": "uuid",
  "transactionDate": "2026-06-24",
  "notes": "Grocery run"
}

// Response 201
{
  "id": "uuid",
  "amount": 45.99,
  "type": "expense",
  "categoryId": "uuid",
  "category": { "id": "...", "name": "Food", "color": "#..." },
  "transactionDate": "2026-06-24",
  "notes": "Grocery run",
  "createdAt": "..."
}
```

### GET `/transactions` — Response
```json
{
  "data": [ /* transaction objects */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

---

## Budgets

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/budgets` | Yes | List for month (`?month=6&year=2026`) |
| POST | `/budgets` | Yes | Create or upsert |
| PATCH | `/budgets/:id` | Yes | Update amount |
| DELETE | `/budgets/:id` | Yes | Remove budget |
| POST | `/budgets/copy` | Yes | Copy from previous month |

### GET `/budgets?month=6&year=2026`
```json
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "categoryId": "uuid",
      "category": { "name": "Food", "color": "#..." },
      "month": 6,
      "year": 2026,
      "amount": 500.00,
      "spent": 387.50,
      "percentUsed": 77.5,
      "status": "ok"  // "ok" | "warning" | "over"
    }
  ]
}
```

### POST `/budgets`
```json
// Request
{
  "categoryId": "uuid",
  "month": 6,
  "year": 2026,
  "amount": 500.00
}
```

### POST `/budgets/copy`
```json
// Request
{ "fromMonth": 5, "fromYear": 2026, "toMonth": 6, "toYear": 2026 }

// Response 201 — array of created budgets
```

---

## Reports / Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reports/summary` | Yes | Dashboard totals |
| GET | `/reports/trends` | Yes | Monthly income vs expense |
| GET | `/reports/categories` | Yes | Category breakdown |
| GET | `/reports/export` | Yes | CSV download |

### GET `/reports/summary?month=6&year=2026`
```json
{
  "balance": 12450.00,
  "monthlyIncome": 5200.00,
  "monthlyExpenses": 3180.50,
  "netSavings": 2019.50,
  "transactionCount": 47
}
```

### GET `/reports/trends?months=6`
```json
{
  "data": [
    { "month": "2026-01", "income": 5000, "expenses": 3200 },
    { "month": "2026-02", "income": 5200, "expenses": 2900 }
  ]
}
```

### GET `/reports/categories?startDate=2026-06-01&endDate=2026-06-30`
```json
{
  "data": [
    { "categoryId": "uuid", "name": "Food", "color": "#...", "total": 450.00, "percent": 28.5 }
  ],
  "grandTotal": 1578.00
}
```

---

## Goals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/goals` | Yes | List savings goals |
| POST | `/goals` | Yes | Create goal |
| PATCH | `/goals/:id` | Yes | Update goal |
| POST | `/goals/:id/contribute` | Yes | Add contribution |
| DELETE | `/goals/:id` | Yes | Delete goal |

### POST `/goals`
```json
// Request
{
  "name": "Emergency Fund",
  "targetAmount": 10000,
  "currentAmount": 0,
  "targetDate": "2026-12-31"
}

// Response 201
{
  "id": "uuid",
  "name": "Emergency Fund",
  "targetAmount": 10000,
  "currentAmount": 0,
  "targetDate": "2026-12-31",
  "percentComplete": 0,
  "isComplete": false
}
```

### POST `/goals/:id/contribute`
```json
// Request
{ "amount": 250.00 }
```

---

## Dev

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/dev/seed` | No | Seed demo data (requires `SEED_SECRET` in production) |

---

## Middleware Stack (server)

```
Request
  → cors
  → helmet
  → rateLimiter (auth routes)
  → express.json()
  → authenticate (protected routes)
  → validate (per-route schema)
  → controller
  → errorHandler
```

---

## API Versioning

- Prefix all routes with `/api/v1`
- Breaking changes → `/api/v2`
- For portfolio MVP, v1 only is sufficient
