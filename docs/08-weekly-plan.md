# Weekly Development Plan

**Duration:** 8 weeks (part-time, ~10–15 hrs/week)  
**Assumption:** Solo developer, learning or reinforcing full-stack skills

---

## Week 0 (Prep) — Before You Code

| Day | Task | Hours |
|-----|------|-------|
| 1 | Read all docs in `/docs`; finalize tech choices (Prisma vs Knex, Recharts vs Chart.js) | 2 |
| 2 | Create GitHub repo; sketch logo/name; pick color palette | 1 |
| 3 | Install Node, Docker, PostgreSQL client; verify tooling | 1 |

**Output:** Repo exists; decisions documented in README.

---

## Week 1 — Foundation + Auth (M0 + M1)

| Day | Focus | Tasks |
|-----|-------|-------|
| Mon | M0 | Init monorepo; Vite + React + Tailwind; Express scaffold; Docker PostgreSQL |
| Tue | M0 | First migrations (`users`, enums); health endpoint; env setup |
| Wed | M1 | Auth service: register, login, bcrypt, JWT pair |
| Thu | M1 | Refresh token table + logout; auth middleware |
| Fri | M1 | Login/Register UI; AuthContext; ProtectedRoute |
| Sat | M1 | Seed categories on register; test full auth flow; fix bugs |
| Sun | Buffer | README setup section; commit "feat: authentication" |

**Week 1 exit criteria:** Register → login → see protected empty page.

---

## Week 2 — Categories + Transaction API (M2 part 1)

| Day | Focus | Tasks |
|-----|-------|-------|
| Mon | DB | Migrations: `categories`, `transactions` |
| Tue | API | Category CRUD endpoints + validation |
| Wed | API | Transaction create + list (pagination) |
| Thu | API | Transaction update, delete, filters, search |
| Fri | UI | Build `Button`, `Input`, `Modal`, `Card` components |
| Sat | UI | Categories page (list + form) |
| Sun | Test | Postman/Thunder Client collection for all endpoints |

**Week 2 exit criteria:** All category and transaction APIs work via API client.

---

## Week 3 — Transactions UI (M2 part 2)

| Day | Focus | Tasks |
|-----|-------|-------|
| Mon | UI | Transactions list + table row component |
| Tue | UI | Add transaction modal |
| Wed | UI | Edit + delete with confirmation |
| Thu | UI | Filters bar + URL query sync |
| Fri | UI | Search with debounce |
| Sat | UX | Empty states, loading spinners, error toasts |
| Sun | Polish | Mobile layout for transactions; commit "feat: transactions" |

**Week 3 exit criteria:** Full transaction CRUD from UI; filters work.

---

## Week 4 — Dashboard (M3)

| Day | Focus | Tasks |
|-----|-------|-------|
| Mon | API | `GET /reports/summary`; recent transactions query |
| Tue | UI | App layout: sidebar, header, mobile nav |
| Wed | UI | Summary cards component |
| Thu | UI | Recent transactions widget |
| Fri | UI | Month selector; wire dashboard to API |
| Sat | UX | Skeleton loaders; dashboard empty state |
| Sun | Test | Add 20 sample transactions; verify totals |

**Week 4 exit criteria:** Dashboard shows accurate monthly summary.

---

## Week 5 — Budgets (M4)

| Day | Focus | Tasks |
|-----|-------|-------|
| Mon | DB + API | `budgets` migration; CRUD endpoints |
| Tue | API | Spent calculation + status (ok/warning/over) |
| Wed | UI | Budgets page with progress bars |
| Thu | UI | Add/edit budget modal |
| Fri | UI | Budget alerts on dashboard |
| Sat | Feature | Copy previous month budgets (if time) |
| Sun | Test | Edge cases: no budget, over 100%, new month |

**Week 5 exit criteria:** Budget progress matches transaction totals.

---

## Week 6 — Reports & Charts (M5)

| Day | Focus | Tasks |
|-----|-------|-------|
| Mon | API | `/reports/trends` and `/reports/categories` |
| Tue | UI | Install Recharts; income vs expense bar chart |
| Wed | UI | Category pie chart + legend |
| Thu | UI | Date range picker; wire reports page |
| Fri | UI | Mini trend chart on dashboard (optional) |
| Sat | UX | Chart responsiveness; tooltip formatting |
| Sun | Test | Verify chart data against raw SQL |

**Week 6 exit criteria:** Reports page with two charts; data is accurate.

---

## Week 7 — Polish (M6 part 1)

| Day | Focus | Tasks |
|-----|-------|-------|
| Mon | Security | Rate limiter; helmet; input sanitization audit |
| Tue | UX | Toast notifications; 404 page; form error messages |
| Wed | UX | Full mobile responsive pass |
| Thu | UX | Accessibility: focus states, labels, contrast |
| Fri | Docs | Architecture diagram; API docs in README |
| Sat | Data | Demo seed script or `demo@example.com` account |
| Sun | QA | Manual test checklist (all user stories) |

**Week 7 exit criteria:** App feels polished locally; no critical bugs.

---

## Week 8 — Deploy & Portfolio (M6 part 2)

| Day | Focus | Tasks |
|-----|-------|-------|
| Mon | Deploy | PostgreSQL on Neon/Render; run migrations |
| Tue | Deploy | Backend to Render/Railway; env vars; CORS |
| Wed | Deploy | Frontend to Vercel; `VITE_API_URL` production |
| Thu | Deploy | Smoke test production; fix CORS/HTTPS issues |
| Fri | Portfolio | README: screenshots, live links, features list |
| Sat | Portfolio | Record 3–5 min Loom walkthrough |
| Sun | Portfolio | Resume bullet + LinkedIn post; tag repo topics |

**Week 8 exit criteria:** Live URLs in README; recruiter-ready.

---

## Daily Workflow (Recommended)

```
1. Pull latest / review yesterday's work     (5 min)
2. Pick ONE story from current milestone     (5 min)
3. Implement backend → test with API client  (varies)
4. Implement frontend → manual test          (varies)
5. Commit with conventional message          (5 min)
6. Update personal changelog / notes         (5 min)
```

**Commit message format:** `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`

---

## If You Fall Behind

**Cut first (lowest portfolio impact):**
1. Forgot password
2. Copy previous month budgets
3. CSV export
4. Mini dashboard chart

**Never cut:**
1. Auth
2. Transaction CRUD
3. Dashboard summary
4. At least one chart on Reports
5. Deployment + README

---

## If You're Ahead

**Add in order:**
1. Dark mode (quick visual win)
2. CSV export (practical feature)
3. Savings goals (extra entity + UI)
4. Forgot password (completes auth story)

---

## Time Budget Summary

| Week | Milestone | Est. hours |
|------|-----------|------------|
| 1 | M0 + M1 | 12–15 |
| 2 | M2 API | 10–12 |
| 3 | M2 UI | 12–15 |
| 4 | M3 Dashboard | 10–12 |
| 5 | M4 Budgets | 10–12 |
| 6 | M5 Reports | 12–15 |
| 7 | M6 Polish | 10–12 |
| 8 | M6 Deploy | 10–12 |
| **Total** | | **~90–105 hrs** |

---

## Sample Data Script (Week 4+)

Create a dev-only endpoint or script to insert:
- 3 months of transactions
- Varied categories
- 4–5 budgets for current month

This accelerates dashboard/chart development and demo recording.
