# PetroBrain — Deploy Checklist

Single Next.js 14 app: the public marketing site **and** the logged-in product at `/app`.
Deploy target: **Vercel** (or any Node host running `next start`).

---

## 1. Environment variables

Set these in the host (Vercel → Project → Settings → Environment Variables). `NEXT_PUBLIC_*`
are exposed to the browser (no secrets); everything else is server-only.

### Required for the logged-in app
| Var | Scope | Purpose |
|-----|-------|---------|
| `PETROBRAIN_API_URL` | **server** | Base URL of the data backend (e.g. `https://petrobrain-api.onrender.com`). `/api/pb/*`, `/api/copilot/chat`, and the upload routes proxy here and attach the signed-in user's Neon Auth JWT as Bearer. **No `NEXT_PUBLIC_` prefix.** |
| `NEON_AUTH_BASE_URL` | **server** | Neon Auth (Better Auth) "Auth URL" — from Neon console → Auth → Configuration. |
| `NEON_AUTH_COOKIE_SECRET` | **server** | Secret for the Neon Auth session cookie (≥32 chars: `openssl rand -base64 32`). **No `NEXT_PUBLIC_` prefix.** |
| `NEXT_PUBLIC_SITE_URL` | public | Canonical site URL for metadata / robots / sitemap (e.g. `https://petrobrain.ai`). |

### Public data (server-only; each degrades to an honest "unavailable" if unset)
| Var | Purpose |
|-----|---------|
| `EIA_API_KEY` | Live Brent + WTI spot prices (free key: eia.gov/opendata). |
| `WORLD_BANK_FLARING_INDICATOR` | World Bank flaring indicator code (keyless API) for the satellite flaring overlay. |

> Not yet wired (need a licensed feed / file ingest, never fabricated): Bonny Light, Baker
> Hughes rig count, OPEC MOMR production, NUPRC figures.

### Maps & climate hazard layers (client; optional)
| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_MAP_STYLE` | MapLibre basemap style URL. Defaults to CARTO dark-matter (no token). |
| `NEXT_PUBLIC_CLIMATE_TILE_URL_FLOOD` / `_HEAT` / `_COASTAL` / `_EROSION` | Raster hazard overlay tile templates. Unset → map shows "layer source not connected" (no fake overlay). |

### Marketing / misc (optional)
| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` / `NEXT_PUBLIC_PLAUSIBLE_SRC` | Privacy-respecting analytics (blank = disabled). |
| `CRM_WEBHOOK_URL` | Demo-form lead webhook (server-only). |
| `NEXT_PUBLIC_CALCOM_URL` | Cal.com booking embed on `/demo`. |
| `NEXT_PUBLIC_DEMOS_ENABLED` | `true` enables the marketing interactive demos. Default off. |
| `NEXT_PUBLIC_APP_URL` | Legacy; unused by nav. Leave blank. |

---

## 2. Backend endpoints to provision (contract)

The frontend talks to the backend through `/api/pb/*` (and the auth/copilot/upload routes),
each isolated in a `lib/**/client.ts` so paths are a one-file change. **Endpoints the
backend doesn't implement yet surface as honest loading → unavailable/invitation states —
never fake data.**

> **Wired to the live backend (no `/api/v1` prefix).** As of the contract bridge, the proxy
> + clients target the deployed PetroBrain backend's real routes (verified on Render). Older
> bullets below that still show `/api/v1` or assumed names are the *desired* contract for
> endpoints not yet built — treat the bridged ones (auth, copilot, and the generic proxy) as
> authoritative.

- **Auth:** handled by **Neon Auth (Better Auth)** — the frontend uses `@neondatabase/auth` (login/signup/sessions at `/api/auth/[...path]` → Neon Auth server). The data backend must **verify the Neon JWT** sent as Bearer on every call: validate against JWKS `${NEON_AUTH_BASE_URL}/.well-known/jwks.json` (EdDSA/Ed25519, 15-min tokens), read the user id (= `neon_auth` user) + email, resolve tenant/role from its own table (auto-provision on first login). *(Frontend ✅; backend verification = follow-up in Idansss/PetroBrain.)*
- **Copilot:** `POST /chat` (body `{ message, module?, asset_context? }`) → JSON `{ answer, citations[], flags[], tool_results[] }`; the chat route adapts it into the UI's SSE `delta|citation|done` frames. *(Bridged ✅)* Future: streaming + per-turn history + the 4 app-action tools.
- **Emissions:** `GET /emissions/scope-summary`, `GET|POST /emissions/sources`, `DELETE /emissions/sources/{id}` (undo), `GET /emissions/financed`, `POST /emissions/reports`, `GET /emissions/reconciliation/flaring`.
- **Flaring:** `GET /flaring/assets|methane-intensity|zero-routine-tracker|opportunity`.
- **Assets (A9):** `GET|POST /assets`, `GET|PATCH|DELETE /assets/{id}`, `POST /assets/import`.
- **Calc:** `POST /calc/{calcId}`.
- **Intelligence:** `GET /intelligence/costs`.
- **Climate risk:** `GET /climate-risk/assets`, `POST /climate-risk/assess`.
- **Analytics:** `GET /analytics/emissions`, `GET /analytics/insights` (AI cards).
- **Reports:** `GET /reports/summary`, `POST /reports`, `GET|POST /reports/schedules`, `DELETE /reports/schedules/{id}`.
- **Documents:** `GET /documents`, `POST /documents` (multipart → RAG ingestion).
- **Data Tools:** `POST /data/import` (multipart), `GET /data/template`, `GET /data/export`, `GET /data/quality`, `POST /data/batch`, `GET /data/batch/{id}`.
- **Account:** `GET|PATCH /profile`, `POST /profile/avatar` (multipart), `GET|PATCH /org`, `GET|PATCH /settings`, `GET /team`, `GET /memory` + `PATCH|DELETE /memory/{id}`.
- **Notifications:** `GET /notifications`, `PATCH /notifications/{id}`, `POST /notifications/read-all`.
- **Opportunities (licensing rounds — NEW, none implemented yet):**
  - `GET /opportunities` (`country[],type[],status[],q,segment,watched,sort,page,pageSize`) → `{ items, total, page, pageSize, ingestion_status }`
  - `GET /opportunities/{id}` → full `Round` (blocks/dates/documents/activity/source_attribution)
  - `POST /opportunities/{id}/watch` (idempotent toggle), `GET /opportunities/watched`
  - `POST /opportunities/{id}/notes` `{ body_md }`
  - `DELETE /opportunities/{id}/notes/{noteId}` ⚠️ *assumed beyond the original spec — needed for note Undo*
  - `POST /opportunities/{id}/assign` `{ user_id }` ⚠️ *assumed beyond the original spec — for "Assign to"*
  - `GET /opportunities/{id}/updates`, `GET /opportunities/updates/unread`, `POST /opportunities/updates/mark-seen`
  - Settings: extend `GET|PATCH /settings` with an `opportunityAlerts` field (`newRoundCountries[]`, `deadlineReminders`, `addendumOnWatched`).
  - Orchestrator (A8): register read-only tools `list_rounds`, `get_round`, `list_watched`, `get_round_updates`; add the **opportunities preamble** — *describe rounds and read documents; never recommend whether to bid, at what amount, or how to structure a submission*. Map page context `selectedEntityId→selected_round_id`, `visibleRecords→visible_round_ids`. (`create_round_note` is a v1 plug-point — not wired frontend-side.)
- **Audit:** `POST /audit` (best-effort write log for copilot actions).

CORS: the backend only ever sees server-to-server calls from the Next proxy, so no browser
CORS config is needed for these.

---

## 3. Pre-deploy gate (all green)

```bash
npm ci
npm run lint        # ESLint — 0 warnings/errors
npm run typecheck   # contentlayer build + tsc --noEmit
npm test            # vitest — 81 tests
npm run build       # next build — all routes compile
```

---

## 4. Quality checklist (verified in-code)

- **No dead "0.00".** Every metric renders a real value, a skeleton, or an honest
  invitation/"unavailable"/"not yet computed" — enforced + unit-tested.
- **Copilot on every `/app` page** via the shell layout; each page registers page context;
  suggestions adapt per route.
- **Every copilot write is confirmed + audited + undoable** (`AppActionProvider`:
  create_record → confirm card → write → audit entry + toast with Undo). It never actuates
  anything operational.
- **`prefers-reduced-motion`** — global rule in `app/globals.css` neutralises all
  animation/transition; charts/skeletons also gate locally.
- **Keyboard nav + AA** — global `:focus-visible` ring; menus/dialogs/tabs use proper roles,
  `aria-*`, Escape-to-close; AA-tuned tokens (dark + light shells).
- **Tenant isolation** is enforced backend-side; the proxy only relays the Bearer token.

### Lighthouse 90+ (run post-deploy against the live URL)
```bash
npx lighthouse https://<your-domain>/app --preset=desktop --view
```
Marketing pages are static/SSG (already ≥94 perf historically). `/app` is dynamic
(cookie-gated); the heavy bits (MapLibre, charts) are dynamically imported (`ssr:false`) so
they don't block first paint. Re-run Lighthouse on `/`, `/app`, and `/app/emissions` and
confirm ≥90 perf / 100 a11y / SEO.

---

## 5. Deploy steps (Vercel)

1. Connect the repo; framework preset **Next.js** (auto).
2. Add the env vars from §1 for **Production** (and Preview if used).
3. Point `PETROBRAIN_API_URL` at the deployed backend; ensure it's reachable from Vercel's
   region and serves the §2 contract over HTTPS.
4. Deploy. Verify: marketing `/` loads; `/app` redirects to `/login` when logged out;
   sign in → dashboard; copilot streams; a `create_record` write confirms + undoes.
5. Set the production domain; confirm `robots.txt` / `sitemap.xml` use `NEXT_PUBLIC_SITE_URL`.

---

## 6. Notes
- Session is an httpOnly `pb_session` cookie (set by `/api/auth/login`); middleware gates
  `/app/*`. Ensure HTTPS in production so the `secure` cookie flag applies.
- In-memory caches (public-data TTL) are per-instance; fine for serverless. For shared
  caching, implement the `CacheStore` over Redis (seam already in `lib/public-data/cache.ts`).
