# Deploy to Vercel (Full Stack)

This project deploys **frontend + API** together on Vercel, with **PostgreSQL** hosted on [Neon](https://neon.tech) (free tier).

## Architecture

```
Vercel
├── client/dist        → Static React app
└── api/index.js       → Express API (serverless)
         ↓
    Neon PostgreSQL
```

---

## Step 1: Create Neon Database

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project → copy the **connection string**
3. It looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

---

## Step 2: Deploy to Vercel

### Via Dashboard

1. Push repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repository
3. **Root Directory:** leave as `.` (project root)
4. Framework: **Other** (uses `vercel.json`)
5. Add **Environment Variables:**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_ACCESS_SECRET` | Random 32+ char string |
| `JWT_REFRESH_SECRET` | Random 32+ char string |
| `NODE_ENV` | `production` |
| `SEED_SECRET` | Random string (for demo seed) |

6. Click **Deploy**

Migrations run automatically during build (`npm run migrate`).

### Via CLI

```bash
cd personal-finance-manager
npx vercel login
npx vercel --prod
```

Set env vars:

```bash
npx vercel env add DATABASE_URL
npx vercel env add JWT_ACCESS_SECRET
npx vercel env add JWT_REFRESH_SECRET
npx vercel env add NODE_ENV
npx vercel env add SEED_SECRET
```

---

## Step 3: Seed Demo Data

After first deploy:

```bash
curl -X POST https://YOUR-APP.vercel.app/api/v1/dev/seed \
  -H "Content-Type: application/json" \
  -d '{"secret":"YOUR_SEED_SECRET"}'
```

**Demo login:** `demo@financeapp.com` / `Demo1234`

---

## Step 4: Verify

```bash
curl https://YOUR-APP.vercel.app/api/v1/health
# → {"status":"ok","db":"connected"}
```

Open `https://YOUR-APP.vercel.app` in browser.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | Min 32 characters |
| `JWT_REFRESH_SECRET` | Yes | Min 32 characters |
| `NODE_ENV` | Yes | `production` |
| `CLIENT_URL` | No | Auto-detected from `VERCEL_URL` |
| `SEED_SECRET` | No | Protects `/dev/seed` in production |
| `VITE_API_URL` | No | Defaults to `/api/v1` (same origin) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on migrate | Ensure `DATABASE_URL` is set for **Production** env |
| API 500 errors | Check Vercel Function logs; verify Neon allows connections |
| CORS errors | Same-origin deploy should not need CORS; check `CLIENT_URL` |
| Cold starts | First request after idle may take 5–10s on free tier |
