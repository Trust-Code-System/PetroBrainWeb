# PetroBrain Web — Production-Readiness Audit

**Audited:** 2026-06-21 · **Branch:** `main` · **Auditor role:** full-stack / DevOps / security / production-readiness
**Method:** real checks run against the actual repo (build, typecheck, lint, 184 unit tests, `npm audit`, live header/route/rate-limit probing against `next start`), plus a static read of every API route, the auth layer, CSP, CI, and `DEPLOY.md`. Findings below cite exact files and lines.

---

## 0. What this project actually is

| | |
|---|---|
| **Framework** | Next.js **16.2.7** (App Router, React 19.2) |
| **Package manager** | npm (`package-lock.json`, `.npmrc` → `legacy-peer-deps=true`) |
| **Build system** | `next build --webpack` (Webpack, not Turbopack — Contentlayer needs it) |
| **Hosting** | Vercel (frontend). Consumes a **separate** FastAPI backend on Render via `PETROBRAIN_API_URL` |
| **Content** | Contentlayer2 (MDX articles under `content/resources/`) |
| **Auth** | Neon Auth (Better Auth) — `@neondatabase/auth@^0.4.1-beta`; session in httpOnly cookie; route gate in `proxy.ts` |
| **DB** | **None in this repo.** All data lives behind the backend; this app is a BFF/proxy. No ORM, no SQL, no migrations here |
| **Payments** | **None.** No Stripe/checkout. `Permissions-Policy` even disables `payment=()` |
| **File uploads** | Documents / data / assets / avatar — validated multipart proxies (`lib/uploads.ts`) |
| **Email** | No direct send; leads forwarded to `CRM_WEBHOOK_URL`; invites/email are backend (Resend) |
| **External integrations** | EIA, World Bank, MapTiler/CARTO (maps), Plausible (analytics), Cal.com (booking), Render backend |
| **API routes (12)** | `auth/[...path]`, `pb/[...path]`, `copilot/chat`, `documents/upload`, `data/import`, `assets/import`, `profile/avatar`, `invitations/accept`, `demo`, `mrv-lead`, `public-data/[dataset]`, `health` |

> **Architectural reality check (read `DEPLOY.md` §2a):** the public **marketing site** is feature-complete. The logged-in **`/app` product** is mostly an *honest shell* — only Auth, Copilot, Assets, Calc, Documents (list), Tasks, Notifications, and AI-Governance are wired to the live backend. Emissions needs a rework; Flaring, Climate-Risk, Analytics, Reports, Data Tools, Opportunities, Settings/Profile all render "unavailable/empty" because the backend endpoints don't exist yet. That's by design (no fabricated data) — but it means **"production ready" means different things for the two halves of this app.**

---

## 1. Overall score: **82 / 100**

| Area | Score | Notes |
|---|---:|---|
| Build / type safety / tests | 98 | `build`, `typecheck`, `lint`, **184/184** unit tests all green |
| Security (headers/auth/proxy/uploads/rate-limit) | 88 | Verified live; deductions for `'unsafe-inline'` CSP + per-instance rate limiter |
| Dependency hygiene | 70 | 35 advisories; 1 critical + 3 high (mostly dev-only, but `better-auth` high is runtime) |
| Performance / caching | 90 | Static/SSG marketing, dynamic imports for heavy libs, no raster images |
| SEO | 80 | Strong metadata/sitemap/robots; **no OG image** |
| Accessibility | 85 | axe-core in CI, reduced-motion, focus rings, ARIA; not independently pa11y-scored yet |
| Monitoring / observability | 65 | Health endpoint + error hook exist but **no vendor wired, no uptime monitor, no alerting** |
| CI/CD | 88 | Typecheck+lint+test+build+e2e/axe on every PR; no security scans, no Dependabot |
| Backend/API completeness | 55 | Most `/app` features unbuilt backend-side (honest stubs) |
| Deployment config | 85 | Excellent `DEPLOY.md`; minor drift; no `vercel.json` (defaults are fine) |

**Verdict:** The **marketing site is launch-ready (~90)**. The **full `/app` product is not** — not because of bugs, but because the backend behind most pages doesn't exist yet. Ship the marketing site + the wired `/app` slice now; gate the rest behind the honest "coming" states already in place.

---

## 2. Critical blockers (fix before launch)

### C1 — Beta auth dependency carrying a **high** runtime advisory
- **Where:** `package.json:16` → `@neondatabase/auth@^0.4.1-beta` (pulls `better-auth <=1.6.1`).
- **`npm audit` (high, runtime):** Better Auth (a) *OAuth callback accepts mismatched `state` when cookie-backed state storage is used without PKCE*, and (b) *rate limiter is bypassable via IPv6 prefix rotation* (GHSA-p6v2-xcpg-h6xw).
- **Why it's a blocker:** this is your **login/session layer**, on a **beta** pin, in production.
- **Fix:**
  ```bash
  npm i @neondatabase/auth@latest          # pick up the patched better-auth transitive
  npm audit --omit=dev | grep -A3 better-auth   # confirm the high advisory is gone
  npm run build && npm test
  ```
  If a patched version isn't published yet, the IPv6-rate-limit bypass is **already mitigated** at the edge by `app/api/auth/[...path]/route.ts` (your own limiter runs *in front* of the sensitive paths) — but the **OAuth `state` issue is not**: confirm you are **not** using cookie-backed OAuth without PKCE, or disable social login until patched. Document the decision in `DEPLOY.md §7`.

### C2 — Production secrets must be rotated + correctly scoped
- **Where:** `.env.local` (correctly **gitignored**, not in history ✓) currently holds *real* values: `NEON_AUTH_COOKIE_SECRET`, `EIA_API_KEY`, `NEXT_PUBLIC_MAPTILER_KEY`.
- **Why:** these have been shared/handled in dev. Before prod:
  - **Rotate** `NEON_AUTH_COOKIE_SECRET` and set it only in Vercel (never reuse the dev value). Generate: `openssl rand -base64 32`.
  - `NEXT_PUBLIC_MAPTILER_KEY` is **shipped to the browser by design** — it is only safe if **HTTP-referrer-restricted** in the MapTiler dashboard to your production origin. Currently unrestricted. **Restrict it.**
  - Keep `EIA_API_KEY` server-only (it is — no `NEXT_PUBLIC_` prefix ✓).
- **Not a code change — an ops action**, but a launch blocker.

### C3 — Decide & label the backend-gated `/app` scope
- **Where:** `DEPLOY.md §2a` — Emissions (rework), Flaring, Climate-Risk, Analytics, Reports, Data Tools, Opportunities, Settings/Profile are **not implemented backend-side**.
- **Why it's a blocker for a *product* launch:** a paying user landing on `/app/analytics` sees an empty/"unavailable" state. That's honest, but it's not a shippable *feature*.
- **Fix (choose one, before charging anyone):**
  1. **Soft-launch:** hide unbuilt nav entries behind a feature flag (`lib/featureFlags.ts` already exists) so users only see wired pages; or
  2. Build the backend endpoints in `DEPLOY.md §2`; or
  3. Ship as an explicit "early access" with the current honest states and say so in onboarding.

---

## 3. High-priority issues

| # | Issue | File(s) | Fix |
|---|---|---|---|
| H1 | Rate limiter is **per-instance, in-memory** — resets on cold start, not shared across serverless instances. A distributed flood bypasses it. | `lib/rateLimit.ts` | Add a Vercel WAF rate rule **or** swap to `@upstash/ratelimit` + Upstash Redis (the module is already isolated behind `enforceRateLimit`, so it's a one-file change). |
| H2 | No error-tracking vendor wired; client + server errors go to `console` only. | `lib/observability.ts`, `.env` | Set `NEXT_PUBLIC_ERROR_REPORT_URL` (Sentry tunnel/Logflare/Datadog intake) **or** adopt `@sentry/nextjs`. Every call site already routes through `reportError`. |
| H3 | No uptime/keep-warm monitor → Render backend cold-starts (~50s) will 500 the first request after idle. | infra | Point UptimeRobot/cron-job.org at `/api/health` every ~10 min (already designed for this — `app/api/health/route.ts`). Add an alert on `backend.reachable=false`. |
| H4 | CSP allows `script-src 'unsafe-inline'` and `style-src 'unsafe-inline'` → weakens XSS defense. | `next.config.mjs:38,53` | Medium-term: move to nonce-based CSP (requires the inline theme script in `components/app/ThemeProvider.tsx:89` + JSON-LD to carry a nonce). Acceptable short-term given no untrusted HTML is rendered, but track it. |
| H5 | E2E/a11y covers **marketing pages only**; the auth-gated `/app` (the risky, stateful half) has **no end-to-end coverage**. | `playwright.config.ts`, `e2e/` | Add an authenticated Playwright project (storageState from a seeded Neon test user) hitting `/app`, `/app/assets`, `/app/copilot`. |

---

## 4. Medium-priority issues

| # | Issue | File(s) | Fix |
|---|---|---|---|
| M1 | **No Open Graph / Twitter image** despite declaring `summary_large_image`. Social shares render blank. | `app/layout.tsx:22-26` | Add `app/opengraph-image.tsx` (or a static `app/opengraph-image.png`). See §11 for code. |
| M2 | No `manifest.webmanifest` / `apple-icon` → degraded PWA/iOS add-to-home. | `app/` | Add `app/manifest.ts` + `app/apple-icon.png` (optional but cheap). |
| M3 | No Dependabot/Renovate → deps drift, advisories go unnoticed. | `.github/` | Add `.github/dependabot.yml` (§10). |
| M4 | No security scanning in CI (SAST/DAST/dependency). | `.github/workflows/` | Add Snyk + CodeQL + ZAP-baseline (§10). |
| M5 | JSON-LD injected via `dangerouslySetInnerHTML` without escaping `<`. Content is repo-authored (low risk) but a `</script>` in a title would break out. | `app/(marketing)/resources/[slug]/page.tsx:92,97` | Escape: `JSON.stringify(ld).replace(/</g, '\\u003c')`. |
| M6 | `DEPLOY.md` drift: says "Next.js 14" and "82 tests" (actually Next 16, **184** tests). | `DEPLOY.md:3,177` | Update — stale docs erode trust in the checklist. |
| M7 | No `vercel.json` → function `maxDuration`/regions rely on per-route exports only. Fine, but pin region near the Render backend to cut proxy latency. | repo root | Optional `vercel.json` with `"regions": ["<render-region>"]`. |
| M8 | Lighthouse/pa11y are documented as *manual, post-deploy* — not automated. | CI | Add LHCI + pa11y-ci workflows (§10) so regressions are caught per-PR. |

---

## 5. Low-priority improvements

- **L1** — Add CSP `report-to`/`report-uri` (CSP-Report-Only first) to learn what `'unsafe-inline'` removal would break before enforcing.
- **L2** — `public-data` in-memory cache (`lib/public-data/cache.ts`) is per-instance; the `CacheStore` seam is there to back it with Redis when you scale.
- **L3** — Add `<link rel="canonical">`/per-route canonical via `alternates.canonical` in page metadata for marketing pages.
- **L4** — Consider `next/og` dynamic OG images per article (`content/resources/*`) for richer link previews.
- **L5** — Add a `SECURITY.md` with a disclosure contact and a `.well-known/security.txt`.
- **L6** — `tasks.write` permission returns `Boolean(role)` (any authenticated user can write tasks) — `lib/auth/permissions.ts:81-82`. Intentional per the live `/tasks` contract, but tighten once the backend enforces it.

---

## 6. Gap summary by category

**Security gaps** — (a) beta auth + high advisory [C1]; (b) `'unsafe-inline'` CSP [H4]; (c) per-instance rate limiter [H1]; (d) MapTiler key unrestricted [C2]; (e) no SAST/DAST in CI [M4]. *Strengths:* httpOnly-token BFF (token never reaches client JS — `lib/auth/server.ts`, `app/api/pb/[...path]/route.ts`), every route auth-checked + rate-limited + upload-validated (verified), PII-masked lead logging (`lib/leads.ts`), full security-header set **verified live**, no `eval`, no SQL in-repo.

**Performance gaps** — none severe. Marketing is Static/SSG (homepage served `Cache-Control: s-maxage=31536000`), MapLibre/charts are dynamically imported `ssr:false`, **zero raster images** (no `next/image` needed). *Gap:* no automated Lighthouse budget [M8].

**SEO gaps** — no OG image [M1], no canonical tags [L3], no per-article OG [L4]. *Strengths:* `metadataBase`, title template, sitemap (`app/sitemap.ts`), robots disallowing `/api` + `/styleguide` (`app/robots.ts`), JSON-LD on articles.

**Accessibility gaps** — not independently scored by pa11y yet [M8]; otherwise strong: axe-core in CI, `prefers-reduced-motion` global, `:focus-visible` rings, ARIA roles, AA-tuned tokens (per `DEPLOY.md §4`).

**Backend/API gaps** — most `/app` features unimplemented backend-side [C3]; copilot is single-JSON adapted to SSE (no true streaming yet); no document-bytes/preview endpoint; Emissions model mismatch (`DEPLOY.md §2a`).

**Database gaps** — N/A in this repo (no DB). **Backend responsibility:** RLS/tenant isolation (claimed, verify), indexes/pooling, **tested backup-restore + RTO/RPO** (explicitly listed as out-of-repo in `DEPLOY.md §7` — *do not launch the platform without it*).

**Deployment gaps** — secret rotation/scoping [C2]; no region pin [M7]; doc drift [M6]. *Strength:* `DEPLOY.md` is genuinely production-grade.

**Monitoring/logging gaps** — no vendor [H2], no uptime monitor/alerting [H3]. Structured `console` logging exists and is Vercel-drain-friendly.

---

## 7. Did the named tools run? (and alternatives)

| Tool | Ran here? | Result / why | Recommended next step |
|---|---|---|---|
| **npm audit** | ✅ Yes | 35 advisories (1 critical, 3 high, 31 moderate). Critical = `vitest` UI (dev-only); highs = `better-auth` (runtime), `form-data`, `vite`/`vitest` (dev). | Fix C1; `npm audit fix` for `protobufjs`/`uuid`. |
| **snyk/cli** | ⚠️ Not run | Requires a Snyk auth token (interactive `snyk auth`) not available in this sandbox. `npm audit` is the run substitute. | `npm i -g snyk && snyk auth && snyk test --all-projects` locally + CI (§10). |
| **lighthouse-ci** | ⚠️ Not run | Needs headless Chrome + a served build; Chromium isn't provisioned in this sandbox and the run is heavy/flaky here. Build verified Static/SSG instead. | Add `.lighthouserc.json` + workflow (§10); also `npx lighthouse https://<domain>/ --view`. |
| **pa11y/pa11y-ci** | ⚠️ Not run | Same Chromium dependency. The repo already runs **`@axe-core/playwright`** in CI (functionally equivalent WCAG checks). | Add `.pa11yci.json` + workflow (§10) for an independent second opinion. |
| **OWASP ZAP Baseline** | ⚠️ Not run | DAST needs a live target URL; nothing is publicly deployed from here. **Safe to add** — baseline is passive (spider + passive rules, no attack). | Add the workflow (§10) targeting the **Vercel preview URL** per PR. |
| **Lissy93/web-check** | ⚠️ Not run | It's a recon tool for a **public** URL (DNS/SSL/headers/cookies). No public deployment to point it at. I verified headers directly via `curl` instead (§8). | After deploy, run `web-check.xyz/check/<domain>` or self-host. |
| **Mercari checklist** | ✅ Compared | See §9. | — |

---

## 8. Evidence (real probes run during this audit)

```
$ npm run typecheck     → exit 0   (contentlayer build + tsc --noEmit clean)
$ npm run lint          → exit 0   (eslint, 0 errors/warnings)
$ npm test              → 38 files, 184/184 tests passed
$ npm run build         → exit 0   (all routes compiled; marketing ○Static/●SSG, /app ƒDynamic, Proxy middleware present)

# Live server (next start -p 3210):
GET /            → CSP, HSTS(max-age=63072000; preload), X-Frame-Options: DENY,
                   X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy ALL present;
                   X-Powered-By absent ✓
GET /app         → 307 → /login            (auth gate works ✓)
GET /api/health  → 200 {"status":"ok", backend:{reachable:false…}}  (probe works ✓)
POST /api/demo {} → 422 (server-side validation ✓)
POST /api/demo ×7 → 429 after 5 (rate limiting actually enforced ✓)
```

---

## 9. Mercari production-readiness checklist comparison

| Mercari area | Status | Evidence / gap |
|---|---|---|
| **Code** (lint, format, tests, CI) | ✅ Strong | lint+typecheck+test+build+e2e in CI; 184 tests |
| **Build & release** (reproducible, rollback) | ✅ Good | Vercel immutable deploys + instant rollback; `npm ci` + pinned lockfile |
| **Configuration** (env via config, no secrets in code) | ✅ Good | All via env; `.env*` gitignored; documented in `DEPLOY.md §1` — **but rotate dev secrets [C2]** |
| **Dependencies** (pinned, scanned, updated) | ⚠️ Partial | Pinned ✓; scanned manually ✓; **no automated updates/scan in CI** [M3/M4] |
| **Observability** (logs, metrics, traces) | ⚠️ Partial | Structured logs + error hook; **no metrics/traces/vendor** [H2] |
| **Alerting / on-call** | ❌ Missing | No alerting configured [H3] |
| **Availability** (health checks, graceful degradation, timeouts) | ✅ Strong | `/api/health`, honest fallbacks, cold-start retry, `maxDuration=60`, AbortController timeout |
| **Scalability / rate limiting** | ⚠️ Partial | Per-instance limiter only [H1] |
| **Security** (authn/z, headers, input validation, least privilege) | ✅ Strong (with caveats) | Verified headers/auth/validation; caveats C1, H4, C2 |
| **Data / backup-restore (RTO/RPO)** | ❌ Out of this repo | Backend duty; **untested** per `DEPLOY.md §7` — platform-level blocker |
| **Runbook / docs** | ✅ Strong | `DEPLOY.md` is a real runbook (minor drift M6) |
| **Capacity / load testing** | ❌ Missing | No load test evidence |

---

## 10. GitHub Actions workflow suggestions

### 10a. `.github/dependabot.yml`
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule: { interval: weekly }
    open-pull-requests-limit: 10
    groups:
      dev-dependencies:
        dependency-type: development
  - package-ecosystem: github-actions
    directory: "/"
    schedule: { interval: weekly }
```

### 10b. `.github/workflows/security.yml` (Snyk + CodeQL + npm audit gate)
```yaml
name: Security
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
  schedule: [{ cron: "0 6 * * 1" }]   # weekly Monday 06:00
jobs:
  deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - name: npm audit (fail on high+)
        run: npm audit --audit-level=high --omit=dev || true   # report; flip `|| true` off once C1 is resolved
      - name: Snyk
        uses: snyk/actions/node@master
        continue-on-error: true
        env: { SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }} }
        with: { args: --severity-threshold=high }
  codeql:
    runs-on: ubuntu-latest
    permissions: { security-events: write }
    steps:
      - uses: actions/checkout@v5
      - uses: github/codeql-action/init@v3
        with: { languages: javascript-typescript }
      - uses: github/codeql-action/analyze@v3
```

### 10c. `.github/workflows/lighthouse.yml` (LHCI on the built app)
```yaml
name: Lighthouse CI
on: { pull_request: { branches: [main] } }
jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
        env:
          NEON_AUTH_BASE_URL: https://ci.neonauth.invalid/neondb/auth
          NEON_AUTH_COOKIE_SECRET: ci-build-only-dummy-cookie-secret-0123456789
          PETROBRAIN_API_URL: https://api.invalid
      - run: npm i -g @lhci/cli@0.14.x
      - run: lhci autorun
```
`.lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run start -- -p 3000",
      "url": ["http://localhost:3000/", "http://localhost:3000/product", "http://localhost:3000/security"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

### 10d. `.github/workflows/pa11y.yml`
```yaml
name: pa11y
on: { pull_request: { branches: [main] } }
jobs:
  pa11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
        env:
          NEON_AUTH_BASE_URL: https://ci.neonauth.invalid/neondb/auth
          NEON_AUTH_COOKIE_SECRET: ci-build-only-dummy-cookie-secret-0123456789
          PETROBRAIN_API_URL: https://api.invalid
      - run: (npm run start -- -p 3000 &) && npx wait-on http://localhost:3000
      - run: npx pa11y-ci
```
`.pa11yci.json`:
```json
{
  "defaults": { "standard": "WCAG2AA", "timeout": 30000 },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/product",
    "http://localhost:3000/security",
    "http://localhost:3000/legal/privacy"
  ]
}
```

### 10e. `.github/workflows/zap-baseline.yml` (DAST against the Vercel preview)
```yaml
name: ZAP Baseline
on: { deployment_status: {} }     # runs when Vercel posts a successful preview deployment
jobs:
  zap:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.12.0
        with:
          target: ${{ github.event.deployment_status.target_url }}
          cmd_options: "-a"      # passive only; safe, non-destructive
```
> Baseline = passive spider + passive rules → safe to run against a live preview. Do **not** point the *active* (full) scan at production.

---

## 11. Exact code changes

### Fix M1 — add an OG image. New file `app/opengraph-image.tsx`:
```tsx
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Og() {
  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", flexDirection: "column",
        alignItems: "flex-start", justifyContent: "center", background: "#0B0E13",
        color: "#fff", padding: 80, fontSize: 64, fontWeight: 700 }}>
        <div>{site.name}</div>
        <div style={{ fontSize: 32, fontWeight: 400, marginTop: 16, color: "#9CA3AF" }}>
          {site.tagline}
        </div>
      </div>
    ),
    size,
  );
}
```
Then in `app/layout.tsx`, the `openGraph`/`twitter` blocks pick up the convention-based image automatically (Next injects `opengraph-image`).

### Fix M5 — escape JSON-LD in `app/(marketing)/resources/[slug]/page.tsx:92,97`:
```tsx
// before: dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd).replace(/</g, "\\u003c") }}
```

### Fix H1 — distributed rate limit (swap the body of `lib/rateLimit.ts`'s `enforceRateLimit`):
```ts
// npm i @upstash/ratelimit @upstash/redis
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();
// keep the existing in-memory path as fallback when UPSTASH_* env is unset
```
(Keep the current in-memory implementation as the fallback when Upstash env vars are absent — preserves local-dev DX.)

### Fix M6 — `DEPLOY.md`: change "Next.js 14" → "Next.js 16" (line 3) and "82 tests" → "184 tests" (line 177).

---

## 12. Commands to run

```bash
# 1. Resolve the runtime-auth advisory (C1)
npm i @neondatabase/auth@latest
npm audit --omit=dev          # confirm better-auth high is gone

# 2. Clear the safe transitive moderates
npm audit fix                 # protobufjs, uuid (non-breaking)

# 3. Re-gate (must stay green)
npm run lint && npm run typecheck && npm test && npm run build

# 4. Local Lighthouse / a11y before wiring CI
npm run build && (npm run start -- -p 3000 &) && npx wait-on http://localhost:3000
npx lighthouse http://localhost:3000/ --preset=desktop --view
npx pa11y-ci

# 5. Dependency scan with Snyk (needs a free token)
npm i -g snyk && snyk auth && snyk test --severity-threshold=high
```

---

## 13. Final launch checklist

**Blockers (do not launch without):**
- [ ] **C1** — Upgrade `@neondatabase/auth`/`better-auth`; confirm no high advisory; verify OAuth uses PKCE (or disable social login).
- [ ] **C2** — Rotate `NEON_AUTH_COOKIE_SECRET` (new value in Vercel only); **HTTP-referrer-restrict** `NEXT_PUBLIC_MAPTILER_KEY`.
- [ ] **C3** — Feature-flag or finish the unbuilt `/app` pages; don't expose empty product surfaces to paying users.
- [ ] Backend (separate repo): confirm tenant RLS, and a **tested** backup-restore with documented RTO/RPO before the platform holds customer data.

**High:**
- [ ] H1 distributed rate limiting (Upstash/WAF) · [ ] H2 wire error tracking (`NEXT_PUBLIC_ERROR_REPORT_URL` or Sentry) · [ ] H3 uptime monitor → `/api/health` + alert · [ ] H4 plan nonce-CSP · [ ] H5 authenticated `/app` E2E.

**Medium/Low:**
- [ ] M1 OG image · [ ] M3 Dependabot · [ ] M4 Snyk/CodeQL/ZAP workflows · [ ] M5 escape JSON-LD · [ ] M6 fix `DEPLOY.md` drift · [ ] M7 pin Vercel region · [ ] M8 LHCI + pa11y in CI · [ ] L5 `SECURITY.md` + `security.txt`.

**Pre-flight gate (all green — verified today):**
- [x] `npm run lint` · [x] `npm run typecheck` · [x] `npm test` (184) · [x] `npm run build` · [x] security headers live · [x] auth gate redirects · [x] rate limiting enforced.
```
```
