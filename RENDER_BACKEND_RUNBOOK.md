# Render Backend Runbook — make the deployed web app show LIVE data

> **Scope:** the **PetroBrain AI backend** (FastAPI) on **Render**, service `petrobrain-api`
> (`https://petrobrain-api.onrender.com`). This is the backend this web app proxies to — see
> [ARCHITECTURE.md](ARCHITECTURE.md). Run this when the deployed web app shows "unavailable" /
> empty data, or when backend code changes (RBAC, endpoints) need to go live.
>
> **The frontend is already deployed and correct.** Everything below is on the **backend/Render**
> side. You do these in the Render dashboard + the backend repo (`C:\Users\Admin\Desktop\PetroBrain
> Backend` = `Trust-Code-System/PetroBrain`). The AI assistant can't click Render or set its env vars.

Last verified: 2026-06-21.

---

## Why the app shows "unavailable" right now (root cause)

The FastAPI backend **rejects the Neon Auth token** (→ 401 on every authenticated call) unless **all**
of these are true (`app/api/deps.py::_neon_principal`):

1. `PB_NEON_AUTH_ENABLED=true` — **defaults to false**, so right now every token is rejected.
2. `NEON_AUTH_BASE_URL` is set (JWKS signature/expiry verification).
3. The signed-in user **already exists as an active row in the backend `users` table** (mapped
   `token.sub → users.id`). **No trust-on-first-use** — an unprovisioned user gets 401.

Plus, the deployed build must be the code that actually has the new routes (e.g. `GET /auth/me`).

When the token is rejected the web UI does the honest thing and shows "unavailable" / empty — it is
**not** a frontend bug.

---

## Step 1 — Make Render build the code that has your latest backend changes

Render service `petrobrain-api` (Service ID `srv-d8e6kdkm0tmc73ejeotg`) was building from
**`Idansss/PetroBrain @ main`**, but your latest backend work (e.g. `GET /auth/me`, RBAC enforcement)
is in **`Trust-Code-System/PetroBrain @ main`** (your local `PetroBrain Backend`). Pick ONE:

- **Option A (recommended) — point Render at the authoritative repo.** Render → `petrobrain-api` →
  **Settings → Build & Deploy → Repository** → connect **`Trust-Code-System/PetroBrain`**, branch
  `main`. (Render may need GitHub access to that org.)
- **Option B — push your backend commits to the repo Render already builds.** In
  `C:\Users\Admin\Desktop\PetroBrain Backend`: add `Idansss/PetroBrain` as a remote and push `main`
  there (mirrors how this web repo was reconciled to Trust-Code-System).

Confirm the branch HEAD that Render builds contains `app/api/routes_auth.py` with `@router.get("/me")`.

## Step 2 — Set the backend env vars (Render → `petrobrain-api` → Environment)

Add / confirm, then **Save Changes** (this triggers a redeploy):

| Key | Value | Notes |
|---|---|---|
| `PB_NEON_AUTH_ENABLED` | `true` | **the critical switch** — without it, all auth = 401 |
| `NEON_AUTH_BASE_URL` | *exact value the Vercel frontend uses* | Vercel → `petro-brain-web` → Settings → Environment Variables → copy `NEON_AUTH_BASE_URL`. **Must match.** |
| `PB_DATABASE_URL` | *(should already be set)* | Postgres (Neon) connection; persists data across redeploys |
| `ANTHROPIC_API_KEY` | *(should already be set)* | required for the copilot/AI |

Defaults that are already fine (don't need to set): `jwt_issuer=petrobrain`,
`jwt_audience=petrobrain-api`. Settings use the **`PB_` prefix** (e.g. the `neon_auth_enabled` field
= env `PB_NEON_AUTH_ENABLED`); `NEON_AUTH_BASE_URL` is read directly (no prefix). If unsure about a
name, check the backend repo's `.env.example` / `app/config.py`.

## Step 3 — Deploy

Render → `petrobrain-api` → **Manual Deploy → "Clear build cache & deploy"** (guarantees a clean
build of the current code, not a cached layer). Wait for "Deploy live".

## Step 4 — Verify the deploy (no auth needed)

```bash
# 1. health
curl https://petrobrain-api.onrender.com/health
# 2. the RBAC endpoint is now registered:
curl -s https://petrobrain-api.onrender.com/openapi.json | grep -o '"/auth/me"'
#    -> should print  "/auth/me"
```

If `/auth/me` still isn't there, Render built the wrong repo/branch (go back to Step 1). *(Ask the AI
assistant — it can re-check the live OpenAPI programmatically.)*

## Step 5 — Provision your user (the step people forget)

Even with Steps 1–4 done, a valid token 401s until your Neon user exists as an **active** row in the
backend `users` table. The backend self-signup is OFF by default (demo blueprint), so:

- **First/admin user (bootstrap):** the very first admin usually has to be seeded — via the backend
  **Shell** (Render → Shell) writing a `users` row / running a seed script, by temporarily enabling
  self-signup, or via the onboarding flow (`POST /onboarding/*`). This needs the backend owner's
  knowledge — check the backend `README.md` / `TODO.md` for the intended bootstrap.
- **Subsequent users:** an existing admin invites them — `POST /admin/tenants/{tenant_id}/users`
  (`routes_admin_users.py`). Get `tenant_id` from `GET /admin/tenants`. Each user needs a `role`
  (`owner`/`admin`/`manager`/`contributor`/`viewer`) and `allowed_assets`.

Map: the user's **`id` must equal their Neon `sub`** (Neon user id), or carry a matching `email`.

## Step 6 — Verify LIVE in the web app

Reload the Vercel app and check:
- **Action Tracker** (`/app/operations/actions`) — shows backend tasks (not just on-device).
- **AI Governance** (`/app/governance/ai-usage`) — the "Account-wide AI activity log" panel renders
  rows (not the "needs admin / unavailable" note); filters work.
- **Notifications bell** — populates.
- **Organization / roles** — `/auth/me` resolves your role; RBAC becomes authoritative.

If these show data, items 1 (RBAC), 2 (task ownership), and 4 (audit filters) from
[PETROBRAIN_REBUILD_TODO.md](PETROBRAIN_REBUILD_TODO.md) are live-verified.

---

## Troubleshooting — "still unavailable / 401"

Render → `petrobrain-api` → **Logs** (server logs the exact rejection reason; the client only ever
sees an opaque 401):

| Log line | Fix |
|---|---|
| `neon token rejected: PB_NEON_AUTH_ENABLED is false` | Step 2 — set `PB_NEON_AUTH_ENABLED=true` |
| `neon token rejected: NEON_AUTH_BASE_URL is not set` | Step 2 — set `NEON_AUTH_BASE_URL` (match Vercel) |
| `neon token rejected: signature/expiry/JWKS verification failed` | `NEON_AUTH_BASE_URL` wrong/mismatched, or token expired (15-min TTL) — re-login |
| token verifies but still 401 / no data | Step 5 — your user isn't an active row in `users` (provision it) |
| `/auth/me` 404 in OpenAPI | Step 1 — Render built a repo/branch without the route; reconcile + redeploy |

## Rollback

Render → `petrobrain-api` → **Events** → find the previous green "Deploy live" → **Rollback**. Env-var
changes are reverted by editing them back in **Environment** (each save redeploys).

---

### Related docs
- [ARCHITECTURE.md](ARCHITECTURE.md) — how Web ↔ AI backend fit together (read first).
- [DEPLOY.md](DEPLOY.md) — frontend env vars + endpoint contract (§2/§2a) + page↔backend status.
- [PETROBRAIN_REBUILD_TODO.md](PETROBRAIN_REBUILD_TODO.md) — what's wired, what's deploy-gated.
