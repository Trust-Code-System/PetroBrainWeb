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
| `PB_PERSISTENCE_BACKEND` | `postgres` *(optional)* | **default `local_json` writes an ephemeral JSONL → the AI audit log resets per deploy**; set `postgres` (+ `PB_DATABASE_URL`) to make it durable — see Step 7. Do **not** instead flip `PB_ENVIRONMENT` to `production` (see Step 7 warning). |

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

## Step 7 — (optional) make the AI audit log durable across deploys

The `/admin/audit` log **populates as the copilot is used**, but whether it survives a deploy depends
on **one env var**: `PB_PERSISTENCE_BACKEND` (verified in the backend source —
`app/db/audit_events_repository.py::get_audit_events_repository` + `app/config.py`).

- **`PB_PERSISTENCE_BACKEND=local_json`** (the field default) → `/admin/audit` is served from an
  append-only JSONL file (`PB_AUDIT_EVENTS_STORE_PATH`, default `data/audit_events.jsonl`). On Render's
  ephemeral container filesystem this is **wiped on every deploy**, so the AI Governance
  "Account-wide AI activity log" panel looks empty after each redeploy even though auth + filters work.
- **`PB_PERSISTENCE_BACKEND=postgres`** → `/admin/audit` reads/writes the `audit_events` table over
  `PB_DATABASE_URL` (durable across deploys). This is what the `render.yaml` "promote to production"
  path prescribes.

To make it durable:

1. Set **`PB_PERSISTENCE_BACKEND=postgres`** in Render → Environment.
2. Set **`PB_DATABASE_URL`** to the Neon Postgres DSN (the `render.yaml` blueprint expects this pasted
   in the dashboard; `sync: false`).
3. Ensure the `audit_events` table exists — migration `app/db/migrations/002_audit_events.sql`.
   `main.py` does **not** auto-run migrations; the Dockerfile `CMD` runs the migration step before
   `uvicorn` (see the `render.yaml` note at the `web` service), so a normal deploy applies it. If
   `/admin/audit` 500s about a missing table, run `python -m app.db.pg` (→ `run_migrations()`) once via
   Render → Shell.
4. **Save Changes** (redeploys), use the copilot a few times, reload AI Governance, redeploy, and
   confirm the rows are still there.

> ⚠️ **Do NOT instead flip `PB_ENVIRONMENT` to `production` to "turn off demo".** `validate_production_settings`
> (runs at boot, `app/main.py:45`) will **refuse to start** unless you *also* set a non-default
> `PB_JWT_SECRET`, `PB_PERSISTENCE_BACKEND=postgres`, `PB_ENABLE_SELF_SIGNUP=false`, **and clear
> `PB_BOOTSTRAP_PLATFORM_ADMIN_EMAILS`** — which Session 19 deliberately set to bootstrap the admin. So
> flipping `PB_ENVIRONMENT` would break the current boot; `PB_PERSISTENCE_BACKEND` is the correct,
> isolated lever for audit durability.

## Step 8 — Backup & restore (Neon) — verify BEFORE holding real customer data

All durable data lives in **Neon Postgres**, not on Render (Render's container filesystem is
ephemeral). So "backups" = Neon's history retention / point-in-time restore (PITR). `DEPLOY.md §7`
flags **tested backup-restore + RTO/RPO** as an out-of-repo launch blocker — this step closes it.
The AI assistant can't open the Neon console; do these in **console.neon.tech**.

> **Topology — there are TWO Neon projects** (verified 2026-06-22). Drill *both*:
> 1. **Auth store** — Neon project `PetroBrain Web` (`broad-breeze-15165574`, us-east-1). Holds the
>    `neon_auth` schema only (accounts/sessions/orgs). This is the Neon Auth side.
> 2. **Backend store** — the project behind **`PB_DATABASE_URL`** (`silent-recipe-25520880` /
>    `petrobrain`, eu-central-1, db `neondb`). Holds the app schema in `public` (tenants, users,
>    assets, documents, audit_events, tasks, permits, mrv_inventories, …) **plus** its own
>    `neon_auth` copy. This is the one with operational/customer data — the more important drill.

**8a. Confirm continuous backup (PITR) is on and sized.**

- Neon Console → your project → **Settings → Storage** (a.k.a. *History retention*). Confirm the
  **retention window** is non-zero. Free/Hobby defaults to ~24h; **bump to ≥7 days** before launch
  (longer window = older point you can restore to = your effective backup depth).
- Neon keeps a continuous WAL history, so the **RPO is effectively seconds** (not a nightly snapshot).
  There is no "enable backups" toggle to miss — but a **0-retention** project can't restore, hence 8a.

**8b. Run a non-destructive restore drill (proves it actually works — this is the part people skip).**

1. Note a known row (e.g. a `users` or `audit_events` id + a timestamp a few minutes ago).
2. Neon Console → **Branches → New branch → "From a point in time"**, pick a timestamp from before
   now, name it `restore-drill`. (A branch is a copy-on-write clone — zero risk to `main`/prod.)
3. Connect to the branch (Neon gives a separate DSN) and confirm the row is present and correct:
   `psql "<branch-dsn>" -c "select count(*) from audit_events;"`
4. **Measure RTO** = wall-clock from "start branch" to "queried good data" (Neon PITR branches are
   typically a few minutes). Record it.
5. Delete the `restore-drill` branch when done so it doesn't accrue storage.

**8c. Record the result.** Update the line below each time you drill, so launch sign-off has evidence:

> **Backup/restore last drilled: 2026-06-22** — RPO ≈ continuous (Neon WAL), RTO ≈ a few minutes
> (PITR branch spins up in seconds). **Both projects verified** via point-in-time `restore-drill`
> branches: auth store (us-east-1) restored 2 users / 41 sessions; backend store (eu-central-1)
> restored 6 tenants / 10 users / 215 audit_events / 1 asset / 1 task. **Caveat:** retention is the
> Free-plan **6h** on both — **upgrade to ≥7 days before holding real customer data** (a 6h window
> means an issue noticed the next morning is unrecoverable). Re-drill after any major schema migration.

**8d. Also protect the Neon Auth data.** Neon Auth (Better Auth) stores users/sessions in its own
Neon-managed store. Confirm that project/branch has the same retention policy, or that user identities
can be re-provisioned (Step 5 maps `token.sub → users.id`, so the backend `users` table is the
source of truth that actually matters for access).

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
