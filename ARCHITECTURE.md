# PetroBrain — System Architecture & Repo Map

> **Read this first if you're coming back to the project and unsure how the pieces fit.**
> Short version: there are **two products** and **one shared backend**. This repo (PetroBrain
> **Web**) is a frontend only — it has **no backend of its own**; it calls the PetroBrain **AI**
> backend on Render through a server-side proxy.

Last confirmed: 2026-06-21 (by inspecting the code + the Render/Vercel dashboards).

---

## 1. The two products

| | **PetroBrain (the AI)** | **PetroBrain Web (this repo)** |
|---|---|---|
| What it is | The FastAPI **AI/operations backend** (chat/copilot, deep research, emissions, calc, documents/RAG, assets, tasks, auth, admin/RBAC) **+ its own Next.js `frontend/`** | The public **marketing site** + the logged-in **`/app` operations-intelligence product** (Command Center, Copilot workspace, HSE, Action Tracker, Compliance, Governance, etc.) |
| Stack | Python / FastAPI (Docker) + a Next.js `frontend/` | Next.js 16 / React 19 / Tailwind (no backend) |
| Local folder | `C:\Users\Admin\Desktop\PetroBrain Backend` | `C:\Users\Admin\Desktop\PetroBrain Web` |
| Repo | `Trust-Code-System/PetroBrain` (monorepo: `app/` + `frontend/`) | `Trust-Code-System/PetroBrainWeb` |
| Hosting | **Render** (Docker web service `petrobrain-api`) — because Vercel can't host the Python backend | **Vercel** (`petro-brain-web`) |
| Public URL | `https://petrobrain-api.onrender.com` | the Vercel production domain |

**Why the backend is on Render:** Vercel runs Node/serverless, not a long-running Python/FastAPI
Docker service. So the AI backend was deployed to Render and the web frontend to Vercel.

---

## 2. How they're linked (the one connection that matters)

This web app has **no database and no backend logic of its own**. It reaches the AI backend through
a single server-side env var and a BFF (backend-for-frontend) proxy:

```
Browser ──> PetroBrain Web (Vercel, Next.js)
                │
                │  server-side only (Bearer = Neon Auth JWT attached here)
                ▼
        /api/pb/[...path]        ──> ${PETROBRAIN_API_URL}/<path>     (e.g. /tasks, /admin/audit)
        /api/copilot/chat        ──> ${PETROBRAIN_API_URL}/chat
        /api/documents/upload    ──> ${PETROBRAIN_API_URL}/documents
        /api/*/import|avatar     ──> ${PETROBRAIN_API_URL}/...
                │
                ▼
        PetroBrain AI backend  =  https://petrobrain-api.onrender.com  (FastAPI on Render)
```

- **`PETROBRAIN_API_URL`** (server-only, set in Vercel) is the entire link. Point it at the Render
  origin and the web app is wired to the AI backend.
- The proxy lives in [`app/api/pb/[...path]/route.ts`](app/api/pb/[...path]/route.ts); the copilot
  stream in [`app/api/copilot/chat`](app/api/copilot/chat); each feature client is isolated in
  `lib/<domain>/client.ts` so a path change is one file.
- **Auth:** the browser authenticates with **Neon Auth (Better Auth)**. The web app reads the session
  server-side and forwards the Neon JWT as a `Bearer` token on every proxied call. The AI backend
  **verifies** that JWT (see §4) and resolves tenant/role from its own `users` table.

So: "the web has the AI in it" = the web **consumes** the AI backend. The copilot, calc, emissions,
documents, tasks, audit, etc. are all the AI backend's endpoints, surfaced in this UI.

---

## 3. Two frontends talk to one backend (don't confuse them)

```
                         ┌─────────────────────────────────────────┐
   Trust-Code-System/    │     PetroBrain AI backend (FastAPI)      │
   PetroBrain  (monorepo)│     https://petrobrain-api.onrender.com  │
     ├── app/  ───────────────────────▲───────────────▲────────────┘
     └── frontend/ (its own Next UI) ──┘               │
                                                       │  PETROBRAIN_API_URL
   Trust-Code-System/PetroBrainWeb  (THIS repo) ───────┘
       (Vercel)  — the marketing site + /app product
```

- The **AI monorepo** ships its own `frontend/` (the UI that lives next to the backend).
- **This repo** is a *separate, standalone* Next.js app on Vercel.
- Both can point at the same `https://petrobrain-api.onrender.com`. Editing this repo does **not**
  change the AI monorepo's `frontend/`, and vice-versa.

---

## 4. Deployment sources & the fork gotcha (IMPORTANT)

There are parallel copies of each project under two GitHub owners — **`Idansss/*`** (older fork) and
**`Trust-Code-System/*`** (authoritative). Mixing them up is the main thing that causes "my changes
aren't live."

| Service | Deploys from | Authoritative source of latest code | Action if they differ |
|---|---|---|---|
| **Render** `petrobrain-api` (AI backend) | `Idansss/PetroBrain` @ `main` (Docker) | `Trust-Code-System/PetroBrain` @ `main` (your local `PetroBrain Backend`) | Repoint Render → `Trust-Code-System/PetroBrain`, **or** push the backend commits to `Idansss/PetroBrain@main`, then Manual Deploy |
| **Vercel** `petro-brain-web` (this app) | `Trust-Code-System/PetroBrainWeb` @ `main` | same | already aligned (local origin was corrected from `Idansss/PetroBrainWeb` on 2026-06-21) |

> ⚠️ As of last check the **backend RBAC work** (`GET /auth/me`, JWT enforcement) is committed in
> `Trust-Code-System/PetroBrain` but the Render service was still building from `Idansss/PetroBrain`,
> so `/auth/me` was not in the live OpenAPI. Reconcile the backend repo/branch the same way this web
> repo was reconciled.

### Backend auth config required for live data (Render → Environment)
The FastAPI backend **rejects the Neon token unless these are set** (otherwise every authenticated
call 401s and the web UI shows honest "unavailable" states — this is `app/api/deps.py::_neon_principal`):
- `PB_NEON_AUTH_ENABLED=true`
- `NEON_AUTH_BASE_URL=<same value the Vercel frontend uses>`
- (defaults are fine: `jwt_issuer=petrobrain`, `jwt_audience=petrobrain-api`)
- **And** the signed-in Neon user must already exist as an **active row in the backend `users`
  table** (mapped `sub` → `users.id`). No trust-on-first-use — provision via the onboarding flow or
  `POST /admin/tenants/{tenant_id}/users`.

---

## 5. Environment variables that wire it together

Web side (Vercel) — full list in [DEPLOY.md](DEPLOY.md) §1. The two that define the link:
- `PETROBRAIN_API_URL` → the Render backend origin (server-only).
- `NEON_AUTH_BASE_URL` / `NEON_AUTH_COOKIE_SECRET` → Neon Auth; the JWT forwarded to the backend.

Backend side (Render) — see §4 above + the backend repo's `render.yaml` / `app/config.py`.

---

## 6. "If I come back to this later" quickstart

1. **Frontend work** → this repo (`PetroBrain Web`). `npm run dev`, edit `/app/**`, deploy = push to
   `Trust-Code-System/PetroBrainWeb` → Vercel.
2. **Backend / AI work** → `C:\Users\Admin\Desktop\PetroBrain Backend` (`Trust-Code-System/PetroBrain`).
   Deploy = push to whatever branch Render builds (confirm in Render → Settings), then Manual Deploy.
3. **"My web change works locally but not in prod"** → check the Vercel deployment built the latest
   `main`, and that `PETROBRAIN_API_URL` points at the right Render origin.
4. **"Everything shows 'unavailable' / 401 in the deployed app"** → it's almost always backend auth
   config: `PB_NEON_AUTH_ENABLED=true` + `NEON_AUTH_BASE_URL` on Render, the backend built from the
   repo that has `/auth/me`, and your user provisioned in the backend `users` table (§4).
5. **Endpoint contracts + what's wired vs honest-fallback** → [DEPLOY.md](DEPLOY.md) §2/§2a and
   [PETROBRAIN_REBUILD_TODO.md](PETROBRAIN_REBUILD_TODO.md).
