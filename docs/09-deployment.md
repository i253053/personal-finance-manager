# Deployment Guide

Deploy the frontend to **Vercel** and the backend + database to **Render**.

---

## 1. Backend + Database (Render)

### Option A: Blueprint (recommended)

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect the repo — Render reads `render.yaml` automatically
4. Set `CLIENT_URL` to your Vercel URL (e.g. `https://your-app.vercel.app`)
5. Deploy

### Option B: Manual

1. Create a **PostgreSQL** database on Render (free tier)
2. Create a **Web Service**:
   - Root directory: `server`
   - Build: `npm install`
   - Pre-deploy: `npm run migrate`
   - Start: `npm start`
3. Add environment variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | From Render Postgres (Internal URL) |
| `JWT_ACCESS_SECRET` | Random 32+ char string |
| `JWT_REFRESH_SECRET` | Random 32+ char string |
| `CLIENT_URL` | Your Vercel frontend URL |
| `SEED_SECRET` | Optional — secret for demo seed endpoint |

4. Note your API URL: `https://finance-api-xxxx.onrender.com`

### Seed demo data (production)

After deploy, run locally pointing at production DB, or use the seed endpoint:

```bash
curl -X POST https://your-api.onrender.com/api/v1/dev/seed \
  -H "Content-Type: application/json" \
  -d '{"secret":"YOUR_SEED_SECRET"}'
```

Or from the server directory:

```bash
DATABASE_URL=your_production_url npm run seed
```

**Demo credentials:** `demo@financeapp.com` / `Demo1234`

---

## 2. Frontend (Vercel)

1. Go to [Vercel](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Set **Root Directory** to `client`
4. Framework preset: **Vite**
5. Add environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-api.onrender.com/api/v1` |

6. Deploy

### Update CORS

After Vercel deploys, copy the production URL and set it as `CLIENT_URL` on Render.

For preview deploys, use comma-separated origins:

```
https://your-app.vercel.app,https://your-app-git-main.vercel.app
```

---

## 3. Verify

```bash
# Health check
curl https://your-api.onrender.com/api/v1/health

# Should return: {"status":"ok","db":"connected"}
```

Open your Vercel URL → Login with demo account → confirm dashboard loads.

---

## 4. Custom domain (optional)

- **Vercel:** Project Settings → Domains
- **Render:** Service Settings → Custom Domain
- Update `CLIENT_URL` and `VITE_API_URL` accordingly

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error | `CLIENT_URL` must exactly match frontend origin (no trailing slash) |
| 503 on health | Database not connected — check `DATABASE_URL`, run migrations |
| Cold start slow | Render free tier sleeps after 15 min — first request may take ~30s |
| JWT errors | Ensure secrets are 32+ characters and set on Render |
