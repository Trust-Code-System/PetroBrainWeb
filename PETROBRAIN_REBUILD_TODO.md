# PetroBrain Rebuild — Master TODO

> Single source of truth for the rebuild of PetroBrain into a **vertical AI Operations
> Intelligence Platform for oil & gas**. Any AI/dev session must read this file first,
> continue from **Next steps**, and tick boxes as work completes.

Last updated: 2026-06-21 · Session 17 (Task ownership → assigned_to_user_ids mapping wired; Item 1 RBAC code-complete, deploy-blocked)

---

## 1. Project vision summary

PetroBrain turns scattered documents, reports, compliance records, HSE updates,
maintenance logs, and energy/environmental data into **trusted answers, tracked actions,
risk insights, dashboards, and management-ready reports** for oil & gas operators.

It is **not** a generic chatbot. It is an operational intelligence system with strict
AI-trust rules: cite sources, admit missing data, never make final safety/compliance
decisions, require human review for safety-critical output, and log AI usage.

---

## 2. Current codebase findings (audit)

**Stack (do not change without reason):**
- Next.js **16** (App Router, `--webpack`), React **19**, TypeScript 5.7.
- Styling: **Tailwind 3.4** with a custom semantic token system (`bg-base`, `surface-1/2/3`,
  `accent`, `border-subtle/strong`, `text-primary/secondary/faint`, `safe/warn/danger/info`).
  No component library — UI is hand-built in `components/ui/*`.
- Icons: **inline SVG only** (`components/app/icons.tsx`), no icon library.
- Data: `@tanstack/react-query` v5; per-domain client+hooks+types under `lib/<domain>/`.
- Auth: **Neon Auth (Stack)** — session read server-side in `app/app/layout.tsx`,
  route protection in middleware/proxy. Access token forwarded to backend.
- Backend: external PetroBrain API on Render via BFF proxy `app/api/pb/[...path]` and
  copilot stream `app/api/copilot/chat`. Many endpoints not yet implemented backend-side
  (see memory notes); UI uses honest fallbacks.
- Content: marketing site uses Contentlayer2 (`app/(marketing)/*`). **Do not touch
  marketing for this rebuild** unless explicitly asked.
- Tests: vitest (unit) + Playwright (e2e). Existing tests under `**/__tests__/`.

**Route layout:**
- `app/(marketing)/*` — public marketing site (Nav/Footer chrome). Out of scope.
- `app/app/*` — the **logged-in product** (Sidebar + TopBar + CopilotBubble chrome).
  Base path is **`/app`** and auth/proxy depend on it → we keep `/app` as the base and
  nest the new IA underneath it (no root-level `/dashboard`, `/copilot` moves).
- `app/api/*` — route handlers (proxy, copilot, uploads, public-data, health, leads).

**App shell (strong, reuse it):**
- `app/app/layout.tsx` — providers (Theme, Query, Toast, AppAction, Chrome, Auth,
  ActiveAsset, PageContext) + `Sidebar` + `TopBar` + `CopilotBubble`.
- `components/app/Sidebar.tsx` — desktop collapsible rail + mobile slide-in drawer.
  **Responsive sidebar already works** (overlay, Escape, close-on-route-change, menu
  button in TopBar). The user's responsiveness concerns are largely already met.
- `lib/appNav.ts` — single source of truth for nav groups + title/active-route lookup.
- `components/app/icons.tsx` — inline SVG nav + UI icons.
- `components/app/PagePlaceholder.tsx` — "coming soon" stub body.
- `components/ui/{Card,Badge,Button,PageHeader,...}.tsx` — design system primitives.

**Copilot (already capable — UPGRADE, do not duplicate):**
- `components/app/CopilotBubble.tsx` — page-aware side panel: streaming, markdown,
  citations, conversation history (new/load/delete), route-tuned suggestions, seed-prompt
  open, read-only.
- `lib/copilot/*` — `useCopilotChat`, `stream`, `client`, `conversations`, `suggestions`,
  `actions`, `types`. `components/copilot/*` — `MessageBubble`, `ActionCard`,
  `AppActionProvider`, `PageContextProvider`, `Markdown`.
- Action protocol + confirm-on-write infra already exists (`AppActionProvider`).

---

## 3. Existing features found (keep / reuse)

- [x] App shell, theming (dark/light scoped to `#app-shell`), providers
- [x] Responsive sidebar (desktop collapse + mobile drawer)
- [x] Page-aware streaming Copilot bubble + history + suggestions + actions
- [x] Dashboard (`/app`) with live KPIs + copilot strip + regulatory band
- [x] Emissions & MRV (`/app/emissions`) — full module
- [x] Flaring & Methane (`/app/flaring`) — charts (Gauge/BarList/SplitBar/MilestoneTrack)
- [x] Climate Risk (`/app/climate-risk`) — risk map + hazard overlays
- [x] Assets (`/app/assets`) — registry + MapLibre map + CRUD
- [x] Calculations (`/app/calc`) — deterministic engine, catalog-driven forms
- [x] Documents (`/app/documents`) — upload → RAG ingestion + filterable list
- [x] Analytics (`/app/analytics`) + Reports (`/app/reports`)
- [x] Intelligence: Market / Cost / Asset (`/app/intelligence/*`) + Opportunities
- [x] Data Tools (`/app/data`), Settings (`/app/settings`), Profile (`/app/profile`)
- [x] Notifications bell + BFF proxy + public-data layer

---

## 4. Existing features that need upgrading

- [~] **Copilot → full workspace page** (Phase 4): per-answer create-action / save-answer /
      copy + sources panel + saved-answers panel + trust messaging DONE. Attach-files and
      generate-report deferred (need backend support). (Bubble stays unchanged.)
- [x] **Dashboard → Command Center** (Phase 3): AI daily-briefing card, operational-status
      cards (HSE/actions/docs/maintenance), report/upload/copilot shortcuts. Real data
      wiring pending those module back ends.
- [x] **Documents → Documents & Knowledge Base** (Phase 5): category overview + metadata
      drawer + AI extraction hand-off + expiry tracking (bridges to Permits). Inline file
      preview deferred (needs a backend file URL) — honest note instead of a broken viewer.
- [x] **Merge** Market+Cost+Opportunities, Emissions+Flaring+Climate, Analytics+Reports,
      Asset(s)+Calc — all four hubs now DEEPENED with live shared widgets (Market band,
      environmental KPI strip, cross-module BI snapshot, and the Maintenance & Assets snapshot
      surfaced on `/app/assets`: asset count + open maintenance actions + quick calc entry).

---

## 5. New features to add (modules)

- [ ] AI Copilot workspace page (`/app/copilot`)
- [x] Operations Log (`/app/operations/logs`) — functional (local-first): daily entries by
      type/site/dept, issues, extract action items → Action Tracker
- [x] Permits & Certificates (`/app/compliance/permits`) — functional (local-first): expiry
      tracking with derived status + reminder window, renewals → Action Tracker, feeds Command Center
- [x] HSE Center (`/app/operations/hse`) — functional (local-first): report incidents/near
      misses/observations, severity/status, raise corrective actions into Action Tracker
- [x] Action Tracker (`/app/operations/actions`) — functional (local-first): full CRUD,
      counts, filters, overdue derivation, source-module linking
- [x] Compliance Guardian (`/app/compliance/guardian`) — functional (local-first): obligations
      register + status/evidence tracking + readiness score + live permits summary
- [x] Permits & Certificates (`/app/compliance/permits`)
- [x] Audit Evidence (`/app/compliance/audit-evidence`) — functional (local-first): evidence
      register + readiness score + obligation linking (syncs Guardian missing-evidence) + gap actions
- [x] AI Governance (`/app/governance/ai-usage`) — functional (local-first): live oversight of
      copilot usage (questions/answers/citations/safety flags), source-grounding rate, recent AI
      activity, sources relied on; honest roadmap for backend-gated logs
- [x] Organization (`/app/governance/organization`) — functional (local-first): company profile +
      department register + team members w/ roles; department names feed Action/Ops/HSE fields
- [ ] Environment & Energy hub (`/app/intelligence/environment-energy`)
- [ ] Market & Cost Intelligence hub (`/app/intelligence/market-cost`)
- [ ] Analytics & Reports hub (`/app/intelligence/reports`)

---

## 6. Sidebar restructuring checklist

New IA (groups → items), base path `/app`:

- [x] OVERVIEW: Command Center (`/app`), AI Copilot (`/app/copilot`)
- [x] OPERATIONS: Operations Log, HSE Center, Maintenance & Assets (`/app/assets`),
      Action Tracker, Documents (`/app/documents`)
- [x] COMPLIANCE: Compliance Guardian, Permits & Certificates, Audit Evidence
- [x] INTELLIGENCE: Market & Cost Intelligence, Environment & Energy, Analytics & Reports
- [x] GOVERNANCE: AI Governance, Data Sources (`/app/data`), Organization, Settings, Profile
- [x] New icon set added (inline SVG) for all new modules
- [x] Active-route + page-title lookup handles nested + legacy routes
- [x] Mobile drawer + desktop collapse verified working

---

## 7. Page/module checklist

- [x] Command Center (`/app`) — upgraded: greeting + AI briefing + operational-status cards
      + shortcuts. Live cross-module KPIs now include Open findings (compliance) alongside
      HSE actions / Overdue / Expiring documents / Maintenance — each honest-null until data exists
- [x] AI Copilot page (`/app/copilot`) — workspace built on existing chat infra
- [x] Operations Log — functional local-first module (entries, issues, extract actions)
- [x] HSE Center — functional local-first module (report, filter, raise corrective actions)
- [x] Maintenance & Assets (`/app/assets`) — merged hub: leads with a live MaintenanceSnapshot
      (asset count + open maintenance actions + quick calc entry) above the asset registry
- [x] Action Tracker — functional local-first module (CRUD, counts, filters, overdue)
- [x] Documents & Knowledge Base (Phase 5 done: category overview, metadata drawer, AI
      extraction hand-off, expiry tracking bridged to Permits; inline preview deferred)
- [x] Compliance Guardian — functional local-first module (obligations register, status +
      evidence tracking, readiness score, live permits/expiry summary, raise actions)
- [x] Permits & Certificates — functional local-first module (expiry tracking, renewals)
- [x] Audit Evidence — functional local-first module (evidence register, status tracking,
      readiness score, obligation linking with Guardian sync, raise gap actions)
- [x] Market & Cost Intelligence hub — deepened: live public MarketBand surfaced inline
- [x] Environment & Energy hub — deepened: live environmental KPI strip (OperationsKpis) inline
- [x] Analytics & Reports hub — deepened: live CrossModuleSnapshot (cross-module BI) inline
- [x] AI Governance — functional local-first module (copilot-usage oversight, grounding rate,
      recent activity, sources relied on; backend-gated logs honestly on the roadmap)
- [x] Data Sources (existing `/app/data`)
- [x] Organization — functional local-first module (company profile, department register, team +
      roles; department names feed the Action/Ops/HSE department fields)
- [x] Settings / Profile (existing)

---

## 8. Database / schema checklist (PLAN — not started)

> Inspect existing backend models before creating anything. Many entities live on the
> external API; do not duplicate. Plan tables/collections:
- [ ] organizations, workspaces, users, roles, permissions, departments
- [ ] documents, document_chunks, document_categories, document_tags, document_versions
- [ ] ai_queries, ai_answers, ai_sources, ai_activity_logs
- [ ] action_items, notifications, comments
- [ ] hse_incidents, hse_observations, hse_corrective_actions, hse_inspections
- [ ] assets, maintenance_logs, asset_inspections
- [ ] compliance_obligations, permits_certificates, audit_evidence, vendor_documents
- [ ] operations_logs, reports, report_templates
- [ ] energy_records, emissions_records
- [ ] data_sources, integration_logs

---

## 9. API / backend checklist (not started)

- [x] Map each new module to backend endpoints via `/api/pb` proxy — done via the June-2026
      OpenAPI audit (94 routes): Action Tracker→`/tasks` ✅, Permits→`/admin/permits`,
      Org→`/organizations/current`+`/admin/company/*`, AI Governance→`/admin/audit/*`,
      Notifications→`/admin/notifications`, Documents preview→`/documents/preview`. HSE / ops log /
      compliance obligations / audit evidence have **no** backend route (stay local-first).
- [x] Action Tracker CRUD endpoint contract — `GET/POST /tasks`, `PATCH/DELETE /tasks/{id}`
      (+ `complete/pause/resume`, `/due`, `/digests`). **Wired dual-mode** (see Session 12).
- [ ] HSE incident/observation/corrective-action endpoints — not implemented backend-side
- [ ] Compliance obligations endpoints — not implemented; **Permits → `/admin/permits` exists**
- [ ] Operations log endpoints — not implemented backend-side
- [x] AI governance / usage-log endpoints — `/admin/audit` (+ export) **wired** (Session 14),
      `/chat/feedback` + `/admin/feedback{,/summary,/trend}` **wired** (Session 15); honest
      "unavailable" when admin reads are not accessible
- [x] Keep honest fallbacks where backend not ready — `lib/sync/syncedCollection.ts` falls back to
      device-local storage on any 401/unavailable/offline; non-destructive hydrate

---

## 10. AI Copilot checklist

- [x] Existing bubble preserved (page-aware, streaming, history, suggestions)
- [x] Dedicated `/app/copilot` workspace page
- [x] Source panel (rail surfaces latest answer's citations; per-message CitationChips remain)
- [ ] Attach file in chat flow (deferred — needs backend attachment support)
- [x] Create action item (per-answer, reuses ActionFormDialog + createAction) / Save answer
      (local saved-answers store + rail panel) / Copy. Generate report deferred (needs backend).
- [x] Confidence + limitation notes; human-review notice for safety-critical output
      (ConfidenceLabel + verification Banner already rendered per message; trust rail reinforces)

---

## 11. UI/UX checklist

- [x] Reuse design-system primitives (Card, Badge, PageHeader, Button)
- [x] Purposeful scaffolds for new modules (not dead empty states) — `ModuleScaffold`
- [x] Status color system available (safe/warn/danger/info/accent tokens)
- [ ] Per-module tables w/ filters, detail drawers, confirm modals (as modules are built)

---

## 12. Mobile responsiveness checklist

- [x] Sidebar collapses to drawer on <lg, menu button in TopBar, overlay + Escape
- [x] Main content full-width on mobile (`min-w-0 flex-1`)
- [ ] Verify each new module's tables/cards stack on mobile as they get real content

---

## 13. Testing checklist

- [x] `npm run typecheck` green after each session
- [x] `npm run build` green after each session
- [x] Add unit tests per new local-first module — governance usage (11), compliance derive (9),
      audit derive (6), org store CRUD + dept-unlink + profile upsert (5). Backend-wiring tests
      land with the endpoints.
- [x] Existing tests still pass (177/177 across 38 files)

---

## 14. Deployment / production readiness

- [ ] No hardcoded secrets (use env vars) — unchanged this session
- [ ] DEPLOY.md updated when env/contracts change
- [ ] Vercel build passes

---

## 15. Session log

### Session 17 — 2026-06-21 (Task ownership → assigned_to_user_ids mapping; queue item 2)

Continued the ordered queue. **Item 1 (Organization RBAC) is code-complete** — `/auth/me` principal
hydration (`lib/auth/principal.ts`), tenant-scoped member reads/invite/role-update/remove
(`lib/org/members.ts`), the canonical permission matrix (`lib/auth/permissions.ts`),
`MemberAccessDialog`, and tests all exist and pass. Its only remaining boxes are **deployment +
live verification** (push backend → Render, set Render env, deploy frontend → Vercel, live-test
roles), which are user-side ops and explicitly push-gated — so item 1 stays open and **un-ticked**,
blocked on the user, not on code. Rather than stall, built the next *buildable* item:

**Item 2 — Task ownership mapping (code complete, unit-tested; live-verify pending).** Wired the
Action Tracker's responsible-person field to real backend accounts when available, with an honest
free-text fallback.
- `lib/actions/types.ts` — added optional `ownerUserId` (backend user id; `owner` stays the display
  email / free-text value).
- `lib/actions/client.ts` — `actionToCreateBody`/`actionToUpdateBody` now send
  `assigned_to_user_ids: ownerUserId ? [ownerUserId] : []`; `taskToAction` hydrates `ownerUserId`
  from `assigned_to_user_ids` (or `assignees`/`assigned_to_users` objects) and a display `owner`
  from any echoed assignee email/name. Updated the header doc-comment (owner is no longer "local-only").
- `components/operations/ActionFormDialog.tsx` — "Responsible person" renders a real member
  `<Select>` (from `useOrgMembers()`) when the accounts endpoint returns members; otherwise the
  existing free-text `<Input>` + team datalist (honest fallback). A since-removed owner stays
  selectable on edit. `blank()`/initial-mapping/handleSubmit carry `ownerUserId`.
- `lib/actions/__tests__/client.test.ts` — +4 tests (create id vs `[]` fallback; hydrate id + display
  from `assigned_to_user_ids` and from assignee objects; empty when unassigned).

**Changed files (this session):** `lib/actions/{types.ts,client.ts}`,
`components/operations/ActionFormDialog.tsx`, `lib/actions/__tests__/client.test.ts`, `DEPLOY.md`
(§2a Action Tracker row), this file. typecheck + lint + build green; full suite **181/181** (38 files,
+4). **Blocker (carried):** the live verification of items 1 and 2 needs the backend deployed to
Render (with `/auth/me`, RBAC enforcement, and `/organizations/current/members`) + a valid admin Neon
token — the dual-mode / fallback keeps everything working locally meanwhile, but real persistence is
unconfirmed.

### Session 16 — 2026-06-21 (ordered completion queue + Organization RBAC implementation)

Converted the remaining rebuild work into the strict five-item production queue in §16 and began
item 1 across the actual Vercel frontend and Render backend repositories.
- ✅ Confirmed authoritative frontend repository `Trust-Code-System/PetroBrainWeb`; recorded that
  this dirty checkout still points at the old `Idansss` origin, so no unsafe push was attempted.
- ✅ Discovered and cloned backend `Trust-Code-System/PetroBrain` to
  `C:\Users\Admin\Desktop\PetroBrain Backend`. Verified its existing `require_role`, canonical role,
  tenant isolation, company-member administration and asset-scope enforcement.
- ✅ Added backend `GET /auth/me`, returning the principal resolved from the verified bearer token.
  The frontend now hydrates role/tenant/allowed-assets from this endpoint and defaults to least
  privilege if unavailable; it never trusts a browser-controlled role.
- ✅ Added a frontend permission matrix mirroring backend canonical roles. Organization profile,
  department controls and member-management actions now render read-only or editable from those
  permissions; Render remains authoritative on every mutation.
- ✅ Replaced the fake `/team`/device-local team presentation with real
  `/organizations/current/members`, invitation creation, and enforced role/remove endpoints.
- ✅ Closed the invitation delivery gap: Vercel now serves `/invitations/{token}` and a rate-limited
  public acceptance bridge. Acceptance activates the backend tenant membership and creates/signs in
  the matching Neon account. When Resend is disabled, the admin sees the real one-time link.

**Frontend files changed:** `lib/auth/{types,permissions,principal}.ts`,
`lib/auth/__tests__/permissions.test.ts`, `components/auth/{AuthProvider,
InvitationAcceptForm}.tsx`, `lib/org/members.ts`, `lib/org/__tests__/members.test.ts`,
`components/governance/{OrganizationWorkspace,MemberAccessDialog}.tsx`,
`components/settings/TeamPanel.tsx`, `app/api/invitations/accept/route.ts`,
`app/(marketing)/invitations/[token]/page.tsx`, `DEPLOY.md`, this file.
**Backend files changed:** `app/api/routes_auth.py`, `tests/test_auth.py` in
`C:\Users\Admin\Desktop\PetroBrain Backend`.

**Verification:** frontend typecheck + lint + production build green; full frontend suite **177/177**
(38 files). Backend focused RBAC suite 37/37 and full suite **476 passed / 54 skipped**.
**Remaining for item 1:** commit/deploy both repositories and complete the live role/invitation matrix.
**Blocker:** no authorization was given to commit/push/deploy and the frontend remote is still the
old origin. GitHub CLI is authenticated as `Lingz450`; Vercel CLI is authenticated as
`jesselingard990-2736` but this checkout has no `.vercel/project.json` link. Render deployment access
is unconfirmed. Vercel project discovery found `petro-brain-web` (root `.`; latest URL
`https://petro-brain-web.vercel.app`) as the likely target; the separate `petrobrain` project uses
root `frontend/apps/web` and appears to belong to the backend monorepo, so do not guess between them
for production deployment. **Exact next step:** with explicit approval, reconcile the frontend against
`Trust-Code-System/PetroBrainWeb`, commit/push both repositories, confirm the Render deployment and
environment, link the correct Vercel project, deploy, then execute the live RBAC matrix before
ticking queue item 1 or starting item 2.

### Session 15 — 2026-06-21 (Copilot answer feedback + Governance feedback oversight)

Completed the remaining executable `/admin/feedback*` backend integration after schema-checking
both the deployed OpenAPI and the backend source contract.
- ✅ **Copilot answer ratings → `POST /chat/feedback`.** The chat adapter now preserves the backend's
  stable `turn_id` as a stream event and stores it on the assistant message. Completed answers with a
  real turn id show **Helpful / Needs improvement** controls; submissions are idempotent on the
  backend. Older/local/error answers without a server turn id show no non-working rating controls.
- ✅ **AI Governance feedback oversight → `/admin/feedback*`.** `lib/governance/feedback.ts` maps
  summary, recent rows, and a gap-free 14-day trend defensively. `FeedbackPanel` shows total/helpful/
  improve counts, trend, and recent attributed feedback; 401/403/404/unsupported routes render an
  honest admin-access unavailable state, while an available empty dataset is stated separately.
- ⚠️ **Live end-to-end verification remains blocked.** `.env.local` points to
  `PETROBRAIN_API_URL=http://localhost:8000`, but no backend is listening on port 8000 and there is no
  authenticated admin session. The deployed backend/OpenAPI is reachable, but protected reads return
  401 without a valid token. No live persistence claim was made.

**Changed files (this session):** `lib/copilot/{types,client,useCopilotChat}.ts`,
`components/copilot/AnswerToolbar.tsx`, `lib/governance/feedback.ts` (new),
`components/governance/FeedbackPanel.tsx` (new),
`components/governance/AiGovernanceWorkspace.tsx`,
`lib/governance/__tests__/feedback.test.ts` (new),
`lib/copilot/__tests__/client.test.ts` (new), `DEPLOY.md`, this file.
Typecheck + lint + production build green; full suite **166/166** (36 files, +7 tests).

**Remaining:** live-verify Session 12–15 wiring with a running backend + valid Neon admin token;
tasks owner↔user id mapping and enforced Org RBAC still require the accounts backend; attachments,
report jobs, and stored-file URLs remain backend-gated. **Current blocker:** no local backend/admin
session. **Exact next step:** start the backend at `localhost:8000` (or point
`PETROBRAIN_API_URL` to the deployed API), sign in as an admin, then verify task CRUD, org profile
PATCH, audit export, notification acknowledgement, and Copilot feedback submit/summary/trend in one
authenticated pass.

### Session 14 — 2026-06-21 (AI Governance audit log + Notifications re-point; Documents preview ruled out)

Two more backend wirings + a third honest non-fit, all schema-verified against the live OpenAPI.
- ✅ **AI Governance → `/admin/audit` (wired).** The previously "on the roadmap (needs backend)"
  per-user/department attribution + export logs are now live.
  - `lib/governance/audit.ts` (new) — `AuditEntry` type, defensive `mapAuditEntry`, `fetchAuditLog`
    (returns `null` when 401/403/404/5xx → honest "unavailable", distinct from `[]` empty),
    `useAuditLog` (react-query) and `exportAuditLog` (handles a file-download OR a JSON download-URL).
  - `components/governance/AuditLogPanel.tsx` (new) — live account-wide log (action · module · user ·
    time · risk badge) + "Export log"; skeletons while loading; an explicit "needs admin / not
    available to this account" note when `null`; "nothing logged yet" when empty.
  - `components/governance/AiGovernanceWorkspace.tsx` — renders the panel; trimmed the roadmap card to
    the two genuinely-pending items (sensitive-doc access tracking, policy manager) and reworded the
    footnote (attribution/export now come from the live audit log, honestly degraded otherwise).
- ✅ **Notifications → `/admin/notifications` (re-pointed).** The bell read the never-built
  `/notifications`; now `lib/notifications/client.ts` targets the live admin routes with defensive
  mapping (`toNotificationList`): markRead → `/{id}/acknowledge`, markAllRead → acknowledge each
  unread (no bulk route), 401/403/404 → honest empty bell (admin-scoped). Updated the existing
  `NotificationBell` test to the new contract.
- ⚠️ **Documents inline preview → `/documents/preview`: NOT viable.** Its body is
  `DocumentIngestRequest` (requires the raw `text` to ingest) — a pre-ingestion chunk preview, not a
  viewer for a stored file's bytes. No endpoint serves stored-file content/URL, so inline preview
  stays deferred; the drawer keeps its honest note. (No code change.)

**Changed files (this session):** `lib/governance/audit.ts` (new),
`components/governance/AuditLogPanel.tsx` (new), `components/governance/AiGovernanceWorkspace.tsx`,
`lib/notifications/client.ts`, `lib/governance/__tests__/audit.test.ts` (new),
`lib/notifications/__tests__/client.test.ts` (new), `components/app/__tests__/NotificationBell.test.tsx`,
`DEPLOY.md` (§2a), memory `live-backend-route-inventory.md`, this file. typecheck + lint + build green;
full suite **159/159** (34 files, +10). Same auth-401 caveat (admin endpoints may 403/401 until the
backend verifies the Neon JWT and grants admin — honest "unavailable" states cover it).

### Session 13 — 2026-06-21 (Phase B — Org profile → /organizations/current; Permits/members ruled out by schema)

Rolling the dual-mode pattern outward — but **schema inspection corrected the Session-12 route-name
audit**: two of the three assumed Phase-B targets don't actually fit, and forcing them would violate
the honesty rules, so only the genuinely-matching piece was wired.
- ⚠️ **Permits → `/admin/permits` is a FALSE match.** Its schema is `PermitUpload`
  (id/format/status/form/generated/signatures) — a permit-to-**work** document + e-signature system,
  NOT our expiry-tracking permits-&-certificates register. **Permits stays local-first.**
- ⚠️ **Org members / departments don't fit.** Members are **invitation-based**
  (`POST /organizations/current/invitations`; `MemberUpdateRequest` is role-only) and the backend has
  **no department model**. Neither maps to our local create/edit-record flow → both stay local-first.
- ✅ **Org profile → `/organizations/current` (wired, dual-mode).** The one clean fit: a single GET/PATCH
  resource (`OrganizationUpdateRequest`).
  - `lib/org/client.ts` (new) — `fetchOrgProfile` (defensive, unwraps envelopes) / `pushOrgProfile`.
    Loose map: name⇄company_name, industry⇄company_type, region⇄primary_operating_country; `notes`
    has no backend field → local-only. Best-effort both ways.
  - `lib/org/store.ts` — the profile slice now hydrates from the backend on mount (non-destructive:
    never clobbers a local profile; retries on cold-start/offline) and `saveProfile` writes through
    via PATCH. `useProfile`/`getProfile`/`saveProfile` signatures unchanged; departments + members
    untouched (still local). (Single-record GET/PATCH, so it uses a small dedicated sync, not
    `createSyncedCollection`, which is for collections.)
  - `lib/org/__tests__/client.test.ts` (new, 4) — flat + enveloped mapping, null when nothing usable,
    PATCH body with nulls for empties.

**Changed files (this session):** `lib/org/{client.ts (new),store.ts}`,
`lib/org/__tests__/client.test.ts` (new), `DEPLOY.md` (§2a corrections), memory
`live-backend-route-inventory.md`, this file. typecheck + lint + build green; full suite **149/149**
(32 files, +4). **Not live-verified** (same auth-401 caveat as Session 12 — fallback keeps it working).

### Session 12 — 2026-06-21 (backend integration Phase A — Action Tracker → /tasks, dual-mode synced store)

Started the backend bucket. First, an **endpoint audit** (user-requested): read the live
`/openapi.json` directly — **94 routes**, materially more than DEPLOY.md §2a recorded. Findings (now
in memory `live-backend-route-inventory.md` + DEPLOY.md §2a): Action Tracker→`/tasks`,
Permits→`/admin/permits`, Org→`/organizations/current`+`/admin/company/*`, AI Governance→`/admin/audit/*`,
Notifications→`/admin/notifications`, Documents preview→`/documents/preview` are all **live**; HSE /
operations log / compliance obligations / audit evidence have no backend route (stay local-first).

Then **Phase A — the reference migration** (dual-mode, local fallback, per the user's chosen strategy):
- `lib/sync/syncedCollection.ts` (new) — generic reactive collection that keeps the SAME synchronous
  `useAll/getAll/add/update/remove` API as `createLocalCollection` (so no consumer changes) while
  syncing to a backend `SyncAdapter`: optimistic local writes that write through in the background,
  a **non-destructive** hydrate on mount (server records merged in; local-only + `pendingSync` edits
  preserved), and an honest fall back to device-local storage on any 401/unavailable/offline. Pass
  `adapter: null` for pure local-first (Phase-B modules without an endpoint). React Query is
  deliberately NOT used at the store surface — its async `{data}` shape would break the synchronous
  component API the constraint requires; the proxy is still the system of record.
- `lib/actions/client.ts` (new) — defensive `ActionItem ⇄ /tasks` mapping (`taskToAction`,
  `actionToCreateBody`/`actionToUpdateBody`, `unwrapList`, status/priority/module normalisers) + the
  `tasksAdapter` over `pbGet/pbPost/pbPatch/pbDelete`. **Caveat:** `owner` (free-text name) stays
  local-only — backend wants `assigned_to_user_ids` (needs RBAC to resolve names→ids); `department`
  rides `assigned_to_team`; `riskLevel`/`notes` have no backend field.
- `lib/actions/types.ts` — added optional `serverId` / `pendingSync` sync metadata (UI ignores them).
- `lib/actions/store.ts` — now backed by `createSyncedCollection("pb-action-items", tasksAdapter)`;
  every export (`useActions/createAction/updateAction/deleteAction/actionCounts/…`) is byte-for-byte
  the same signature, so the dashboard KPIs, Maintenance snapshot, HSE/compliance/permits raise-action
  flows and the copilot toolbar are all untouched.
- Tests: `lib/actions/__tests__/client.test.ts` (13 — mapping/normalisers/envelopes) and
  `lib/sync/__tests__/syncedCollection.test.ts` (7 — optimistic create, pendingSync on reject,
  non-destructive hydrate, local fallback on list failure, update/remove write-through).

**Changed files (this session):** `lib/sync/syncedCollection.ts` (new),
`lib/actions/{client.ts (new),store.ts,types.ts}`, `lib/{sync,actions}/__tests__/*` (new ×2),
`DEPLOY.md` (§2a re-audit + migration-pattern note), this file. typecheck + lint + build green;
full suite **145/145** (31 files, +20). **Not yet live-verified** end-to-end: the auth-401 risk
(`auth-401-backend-jwt-verify.md`) means `/tasks` may 401 in prod until the backend verifies the
Neon JWT — the dual-mode fallback keeps the module working locally regardless; verify against the
live API once a valid token is available.

### Session 11 — 2026-06-21 (Assets+Calc merge — Maintenance & Assets hub widget)

Closed the last un-deepened merge (section 4). `/app/assets` (the "Maintenance & Assets" nav
destination) now leads with a live widget above the existing registry — the same approach the
Intelligence hubs use — turning it into a genuine merged hub rather than nav-level only. No
fabricated figures.
- `components/assets/MaintenanceSnapshot.tsx` (new) — three live tiles: **Assets tracked** (live
  backend count via `useAssets`, honest "—" until data lands), **Open maintenance actions** (real
  count from the Action Tracker filtered to `sourceModule === "maintenance"`, with an overdue
  subset in danger emphasis, links to the tracker), and **Calculations** (links into the
  deterministic engine at `/app/calc` — the Assets+Calc merge). A **Log maintenance action** button
  reuses the Action Tracker's own `ActionFormDialog` pre-tagged to the maintenance source and
  persists via `createAction` (toast + undo) — genuinely working, not decorative. Plus a copilot
  hand-off ("review registry + open maintenance, flag overdue/high-risk") and a "Run a calculation"
  link.
- `app/app/assets/page.tsx` — renders `<MaintenanceSnapshot />` above `<AssetsWorkspace />`;
  title/heading/intro updated to "Maintenance & Assets" to match the nav label and the merge.

**Changed files (this session):** `components/assets/MaintenanceSnapshot.tsx` (new),
`app/app/assets/page.tsx`, this file. typecheck + lint + build green; full suite 125/125 (29 files).
The pure-frontend rebuild is now complete — all four merges deepened; remaining work is backend.

### Session 10 — 2026-06-21 (deepened the Intelligence merge hubs with live widgets)

The three Intelligence hubs were nav/hub-level only (link cards + capability lists). They now lead
with a live, real-data widget — no fabricated figures.
- `components/app/ModuleScaffold.tsx` — added an optional `children` slot rendered between the
  header and the sub-module links, so any hub can surface live widgets above its links.
- **Market & Cost** (`/app/intelligence/market-cost`) — embeds the live public `MarketBand`
  (Brent/WTI/Bonny Light/rig count/OPEC, honest per-tile states). Reuses the dashboard component.
- **Environment & Energy** (`/app/intelligence/environment-energy`) — embeds `OperationsKpis`
  (emissions / flaring / methane intensity / assets), live backend figures where they exist,
  honest "ask the copilot" invitations otherwise. Reuses the dashboard component.
- **Analytics & Reports** (`/app/intelligence/reports`) — new `components/intelligence/
  CrossModuleSnapshot.tsx`: the live BI overview a management report is built from — open/overdue
  actions, open HSE reports, open ops issues, compliance findings, expiring documents, plus
  compliance- and audit-readiness cards. Reads every local-first store; counts are truthful (0 is a
  real count), readiness cards stay "—" until there's something to score. Swaps to backend later.

**Changed files (this session):** `components/app/ModuleScaffold.tsx`,
`components/intelligence/CrossModuleSnapshot.tsx` (new),
`app/app/intelligence/{market-cost,environment-energy,reports}/page.tsx`, this file.
typecheck + lint + build green; full suite 125/125 (29 files). (IDE shows the documented
stricter-than-project inline-`style={{width}}` warning on the readiness bars — project eslint clean.)

### Session 9 — 2026-06-21 (local-first store unit tests)

Closed out the testing gap for the local-first modules (section 13). 20 new tests, suite now
125/125 across 29 files.
- `lib/compliance/__tests__/derive.test.ts` (new, 9) — `isMissingEvidence` / `isOpenFinding`,
  `obligationCounts` (status tallies + derived missing-evidence + open-findings), `readinessScore`
  (met-AND-evidenced over in-scope; null when nothing in scope; 100 when all ready).
- `lib/audit/__tests__/derive.test.ts` (new, 6) — `evidenceCounts` (status tallies + openGaps =
  gap+expired), `auditReadiness` (collected share; null when empty; 100 when all collected).
- `lib/org/__tests__/store.test.ts` (new, 5, jsdom) — department + member CRUD, profile single-record
  upsert, and the key integrity case: `deleteDepartment` unlinks only its own members. Uses
  `vi.resetModules()` + `localStorage.clear()` per test so the `createLocalCollection` module-level
  cache doesn't leak between tests.

**Changed files (this session):** `lib/compliance/__tests__/derive.test.ts` (new),
`lib/audit/__tests__/derive.test.ts` (new), `lib/org/__tests__/store.test.ts` (new), this file.
No production code changed; typecheck + lint + build green; full suite 125/125 (29 files).

### Session 8 — 2026-06-21 (cross-module team-member owner pickers)

Extended the Organization → cross-module wiring: just as department names feed the department
fields, team-member names now feed the person fields everywhere, via a shared datalist (typing a
new name still works — no hard dependency).
- `lib/org/store.ts` — added `useMemberNames()` (reactive team-member name list).
- `components/governance/TeamMemberDatalist.tsx` (new) — shared `<datalist id="pb-team-members">`
  fed by the team register (renders null when empty).
- Wired `list="pb-team-members"` into the person `<Input>`s across six forms:
  Action Tracker (owner / responsible person), Operations Log (responsible), HSE Center
  (reported by), and the three compliance forms — Permits (owner), Obligations (owner),
  Audit Evidence (owner).

**Changed files (this session):** `lib/org/store.ts`,
`components/governance/TeamMemberDatalist.tsx` (new),
`components/operations/{ActionFormDialog,OpsLogFormDialog,HseFormDialog}.tsx`,
`components/compliance/{PermitFormDialog,ObligationFormDialog,EvidenceFormDialog}.tsx`, this file.
typecheck + lint + build green; full suite 105/105 (26 files).

### Session 7 — 2026-06-21 (Command Center compliance KPI + governance unit tests)

**Command Center cross-module KPI** (`components/dashboard/CommandKpis.tsx`): added an
**Open findings** tile reading `obligationCounts(useObligations()).openFindings` (danger emphasis),
honest-null until the first compliance obligation exists — mirroring the Expiring-documents pattern.
The status row is now 5 tiles (HSE actions / Overdue / Open findings / Expiring documents /
Maintenance) on a responsive grid (`sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`).

**Unit tests** (`lib/governance/__tests__/usage.test.ts`, new, 11 tests): cover `deriveUsage`
(conversation/question/answer counts, error-answer exclusion, cited answers + citation total,
safety-flagged via banner, confidence split, last-activity, empty shape), `groundingRate`
(cited-of-answers %, null when no answers), and `distinctSources` (cross-source aggregation +
ranking, blank-source filtering). Pure-function tests, node env — no localStorage fixture needed.

**Changed files (this session):** `components/dashboard/CommandKpis.tsx`,
`lib/governance/__tests__/usage.test.ts` (new), this file.
typecheck + lint + build green; full suite 105/105 (26 files).

### Session 6 — 2026-06-21 (AI Governance + Organization — Governance group complete)

Both modules built local-first (no backend), following the `lib/<domain>/{types,labels,store}` +
workspace-component pattern. Governance nav group is now fully functional.

**AI Governance** (`/app/governance/ai-usage`): the scaffold is now a live read-only oversight view
over the copilot usage already kept on this device — no faked backend metrics.
- `lib/copilot/conversations.ts` — added `getAllConversations()` (full convos, most-recent first).
- `lib/governance/usage.ts` (new) — pure derive functions + a reactive `useConversations()` hook
  (mount-load + `storage`/`focus` refresh, since conversations use a plain key, not a collection).
  `deriveUsage` counts conversations / questions (user turns) / answers / cited answers + citation
  total / safety-flagged (banner) answers / confidence split / last activity. `distinctSources`
  ranks cited sources across conversations + saved answers. `groundingRate` = cited ÷ answers.
- `components/governance/AiGovernanceWorkspace.tsx` (new) — KPI row, source-grounding card (progress
  bar), accountability statements (read-only copilot, citations, human review), "Summarise AI usage"
  copilot hand-off, Recent AI activity + Sources-relied-on panels, and an explicit
  **On the roadmap (needs backend)** card for per-user/department attribution, export/approval logs,
  sensitive-doc access tracking and the policy manager — surfaced honestly, not faked.
- `app/app/governance/ai-usage/page.tsx` — renders the workspace.

**Organization** (`/app/governance/organization`): scaffold → functional workspace.
- `lib/org/{types,labels,store}.ts` (new) — `OrgProfile` (single-record collection), `Department`
  register, `TeamMember` with `Role` (owner/admin/manager/contributor/viewer + descriptions/tones).
  Store has 3 localStorage slices; `deleteDepartment` unlinks members; `useDepartmentNames()` exposes
  names reactively for cross-module suggestions.
- `components/governance/{DepartmentFormDialog,TeamMemberFormDialog,OrganizationWorkspace}.tsx` (new)
  — profile card (inline edit), departments list (head + member count + description), team list
  (avatar initials + title + dept + role badge), full CRUD via dialogs. Honest footnote that roles
  are descriptive labels until the accounts backend enforces RBAC.
- `components/governance/DepartmentDatalist.tsx` (new) — shared `<datalist id="pb-departments">`
  fed by the department register; **Action Tracker / Operations Log / HSE Center** department
  `<Input>`s now use `list="pb-departments"` so the same vocabulary is suggested everywhere
  (typing a new department still works — no hard dependency).
- `app/app/governance/organization/page.tsx` — renders the workspace.

**Changed files (this session):** `lib/copilot/conversations.ts`, `lib/governance/usage.ts` (new),
`lib/org/{types,labels,store}.ts` (new ×3), `components/governance/{AiGovernanceWorkspace,
DepartmentFormDialog,TeamMemberFormDialog,OrganizationWorkspace,DepartmentDatalist}.tsx` (new ×5),
`components/operations/{ActionFormDialog,OpsLogFormDialog,HseFormDialog}.tsx` (datalist wiring),
`app/app/governance/{ai-usage,organization}/page.tsx`, this file.
typecheck + build green; eslint clean; all unit tests pass (94/94).

### Session 1 — 2026-06-21 (Phase 1 + Phase 2)
**Completed:**
- Full codebase audit (this file, sections 2–4).
- Created `PETROBRAIN_REBUILD_TODO.md`.
- Restructured navigation IA in `lib/appNav.ts` to the 5-group model (OVERVIEW /
  OPERATIONS / COMPLIANCE / INTELLIGENCE / GOVERNANCE), with legacy + nested route title
  lookup so no existing route loses its title.
- Added new inline-SVG icons in `components/app/icons.tsx` (copilot, operations-log, hse,
  maintenance, actions, compliance, permits, audit, environment, ai-governance,
  organization). Kept all existing icon keys (used by OperationsKpis).
- Added `components/app/ModuleScaffold.tsx` — purposeful module scaffold (planned
  capabilities + sub-links + ask-copilot CTA), replacing bare "coming soon".
- Created new routes: `/app/copilot` (real workspace on existing chat hook),
  `/app/operations/{logs,hse,actions}`, `/app/compliance/{guardian,permits,audit-evidence}`,
  `/app/governance/{ai-usage,organization}`, and merge hubs
  `/app/intelligence/{market-cost,environment-energy,reports}`.

**Changed files:** `lib/appNav.ts`, `components/app/icons.tsx`,
`components/app/ModuleScaffold.tsx` (new), new page files under `app/app/*`,
`PETROBRAIN_REBUILD_TODO.md` (new).

**Preserved:** all existing routes/pages (emissions, flaring, climate-risk, assets, calc,
analytics, reports, intelligence/*, opportunities, documents, data, settings, profile).
They remain reachable via hub pages + direct links.

**Not done / deferred:** Phases 4–13 (deep module builds, backend wiring, schema).

### Session 5 — 2026-06-21 (Compliance Guardian + Audit Evidence + Copilot Phase 4 + Documents Phase 5)

**Documents & Knowledge Base Phase 5** (`/app/documents`): the module is backend-backed (RAG via
react-query), so upgrades use real data + existing modules — no faked backend features.
- `components/documents/DocumentCategories.tsx` (new) — category overview row: a chip per
  document type with a live count (derived from loaded docs), click to filter. Hidden when empty.
- `components/documents/DocumentDetailDrawer.tsx` (new) — right-side metadata drawer (type,
  revision, ingestion status + chunk count / error, size, mime, uploaded) with working actions:
  ask the copilot about the doc, run an AI extraction (copilot reads ingested content — both
  gated on `status === "ingested"`), and **Track expiry / renewal** which opens the real
  `PermitFormDialog` pre-filled and persists via `createPermit` (bridges to Permits &
  Certificates — no duplicate expiry logic). Honest note that inline file preview needs a
  backend file URL we don't have yet.
- `components/documents/DocumentList.tsx` — added optional `onSelect` (name becomes a button
  that opens the drawer; plain text when omitted, so the existing test stays green).
- `components/documents/DocumentsWorkspace.tsx` — wires the categories row, the drawer, the
  copilot hand-offs and the permit bridge; existing upload / filters / page-context / polling
  unchanged.
- Existing documents tests still pass (3/3).

**Copilot workspace Phase 4** (`/app/copilot`): per-answer actions, sources panel, saved answers.
- `lib/copilot/savedAnswers.ts` (new) — local saved-answers collection (dedupe by assistant
  `messageId`; `saveAnswer` / `unsaveAnswerByMessage` / `isAnswerSaved`).
- `components/copilot/AnswerToolbar.tsx` (new) — toolbar under each completed answer: **Create
  action** (reuses `ActionFormDialog` pre-filled, persists via `createAction` with toast+undo),
  **Save answer** (toggles saved state), **Copy**. Genuinely working/local-first; no dead buttons.
- `components/copilot/MessageBubble.tsx` — added optional `footer` slot (assistant turns only,
  hidden while streaming); the page-aware bubble omits it so its behaviour is unchanged.
- `app/app/copilot/page.tsx` — renders `AnswerToolbar` per assistant message (question resolved
  from the preceding user turn); rail now shows a **Sources** panel (latest answer's citations)
  and a **Saved answers** panel; refreshed trust copy. Copilot itself stays read-only.
- Attach-file + generate-report intentionally NOT added (need backend support) — noted honestly.
- Existing copilot tests still pass (3/3).

**Audit Evidence** (`/app/compliance/audit-evidence`): turned the scaffold into a working module.
- `lib/audit/{types,labels,store}.ts` — new `EvidenceItem` register (policy / procedure / report /
  certificate / inspection / training / corrective-action proof / approval / permit). `status`
  (collected / in_review / requested / gap / expired) is user-asserted; `evidenceCounts`,
  `auditReadiness` (0–100 collected-of-total; null when empty) and openGaps are DERIVED.
- **Cross-module sync:** an evidence item can link to a Guardian obligation by id;
  `syncObligationEvidence` recomputes that obligation's `hasEvidence` (true iff a linked item is
  "collected") on every create/update/delete — so collecting evidence clears the obligation's
  missing-evidence flag in the Guardian automatically, and removing it re-flags. `raiseEvidenceAction`
  pushes a gap into the Action Tracker.
- `components/compliance/{EvidenceFormDialog,AuditEvidenceWorkspace}.tsx` — add/edit dialog with a
  "Linked obligation" select (built from `useObligations`), summary row (open gaps / pending /
  collected / total), readiness card with progress bar, copilot "build audit pack" hand-off,
  filterable + searchable list sorted by status severity, honest on-device footnote.
- `app/app/compliance/audit-evidence/page.tsx` now renders the workspace.

**Compliance Guardian** (`/app/compliance/guardian`): turned the scaffold into a working module
(local-first, same pattern as Sessions 3–4).
- `lib/compliance/{types,labels,store}.ts` — new `Obligation` register (regulatory / internal
  policy / reporting / licence / HSE / environmental / financial). `status` is user-asserted;
  `isMissingEvidence`, `isOpenFinding`, `obligationCounts`, and a `readinessScore` (0–100, met +
  evidenced of in-scope; null when nothing in scope) are DERIVED. `raiseObligationAction` →
  Action Tracker (status→priority map), linked by id.
- `components/compliance/{ObligationFormDialog,ComplianceGuardianWorkspace}.tsx` — add/edit
  dialog (title required, evidence checkbox), summary row (open findings, missing evidence +
  live Expiring/Expired pulled from the **permits store** — same numbers as the Command Center),
  readiness card with progress bar, copilot "summarise compliance status" hand-off, filterable +
  searchable obligations list sorted by severity then due date, honest on-device footnote.
- `app/app/compliance/guardian/page.tsx` now renders the workspace.

**Changed files (this session):** `lib/compliance/*` (new ×3), `lib/audit/*` (new ×3),
`lib/copilot/savedAnswers.ts` (new), `components/compliance/{ObligationFormDialog,
ComplianceGuardianWorkspace,EvidenceFormDialog,AuditEvidenceWorkspace}.tsx` (new ×4),
`components/copilot/AnswerToolbar.tsx` (new), `components/copilot/MessageBubble.tsx`,
`components/documents/{DocumentCategories,DocumentDetailDrawer}.tsx` (new ×2),
`components/documents/{DocumentList,DocumentsWorkspace}.tsx`,
`app/app/compliance/{guardian,audit-evidence}/page.tsx`, `app/app/copilot/page.tsx`, this file.
typecheck + build green; eslint clean; copilot + documents tests pass (6/6). (IDE shows the
documented stricter-than-project `aria-pressed` + inline-style noise; project config passes clean.)

### Session 4 — 2026-06-21 (Operations Log + Permits & Certificates)

**Completed (both local-first, same pattern as Session 3):**
- **Operations Log** (`/app/operations/logs`): `lib/operations/{types,labels,store}.ts`
  (`extractAction` → Action Tracker), `components/operations/{OpsLogFormDialog,OpsLogWorkspace}.tsx`,
  real page. Daily entries by report-type/site/department, issues, priority/status, filters, search.
- **Permits & Certificates** (`/app/compliance/permits`): `lib/permits/{types,labels,store}.ts`
  (derived `permitStatus` valid/expiring-soon/expired from expiry + reminder window;
  `permitCounts`; `raiseRenewalAction` → Action Tracker), `components/compliance/{PermitFormDialog,
  PermitsWorkspace}.tsx`, real page. Count cards, status filters, days-to-expiry badges.
- **Command Center**: `CommandKpis` "Expiring documents" now reads the permits store live
  (expiringSoon + expired); stays null until the first permit is added.

**Changed files:** `lib/operations/*` (new), `lib/permits/*` (new),
`components/operations/{OpsLogFormDialog,OpsLogWorkspace}.tsx` (new),
`components/compliance/{PermitFormDialog,PermitsWorkspace}.tsx` (new),
`app/app/operations/logs/page.tsx`, `app/app/compliance/permits/page.tsx`,
`components/dashboard/CommandKpis.tsx`, this file. typecheck + build green; eslint clean.

### Session 3 — 2026-06-21 (Phases 6 + 7 — HSE Center & Action Tracker)

**Decision — local-first data layer:** these modules have no backend yet. Rather than fake a
server (forbidden by the honesty rules), they persist to the device via `localStorage`, the
same approach the copilot history / calc recents already use. New generic store factory
`lib/localStore.ts` (`createLocalCollection` + `useSyncExternalStore`, reactive across
components and tabs). UI clearly labels data as "on this device"; swapping to `/api/pb` later
keeps the component API.

**Completed:**
- **Action Tracker** (central module): `lib/actions/{types,labels,store}.ts` (CRUD, derived
  overdue, `actionCounts`), `components/operations/{ActionFormDialog,ActionTrackerWorkspace}.tsx`,
  real page at `/app/operations/actions`. Counts row, filter chips, search, urgency sort,
  create/edit/delete, source-module linking.
- **HSE Center**: `lib/hse/{types,labels,store}.ts` (sequential HSE-#### refs;
  `raiseCorrectiveAction` pushes a linked task into the Action Tracker; severity→priority map),
  `components/operations/{HseFormDialog,HseWorkspace}.tsx`, real page at `/app/operations/hse`.
  Dashboard stat cards (incl. live open-corrective-actions from the tracker), filters, search.
- **Command Center wired live**: `CommandKpis` now reads the Action Tracker store — Open HSE
  actions / Overdue / Maintenance issues update instantly; Expiring documents stays honest null.

**Changed files:** `lib/localStore.ts` (new), `lib/actions/*` (new), `lib/hse/*` (new),
`components/operations/*` (new ×4), `app/app/operations/{actions,hse}/page.tsx`,
`components/dashboard/CommandKpis.tsx`, this file. typecheck + build green; project eslint clean.

**Note:** IDE shows stricter-than-project a11y diagnostics on `aria-pressed`/`aria-selected`
expressions — the project's own `eslint` passes clean (verified), so they're IDE noise.

### Session 2 — 2026-06-21 (Phase 3 — Command Center)

**Completed:**
- Upgraded `/app` from the generic dashboard into the **Command Center**.
- New `components/dashboard/CommandSummary.tsx` — time-of-day greeting, AI daily-briefing
  card (honest invitation + "Generate today's briefing" copilot hand-off), and quick
  shortcuts (Upload document, New report).
- New `components/dashboard/CommandKpis.tsx` — cross-module operational-status row (open HSE
  actions, overdue actions, expiring documents, maintenance issues). Honest "no data yet"
  cards linking into each module; `value: null` swaps to a live count once back ends land.
- Recomposed `app/app/page.tsx` to: CommandSummary → CommandKpis → MarketBand →
  OperationsKpis → CopilotStrip → RegulatoryBand + RecentActivity. Existing sections kept.

**Changed files:** `app/app/page.tsx`, `components/dashboard/CommandSummary.tsx` (new),
`components/dashboard/CommandKpis.tsx` (new), this file. typecheck green.

---

## 16. Next steps for the next session

The pure-frontend rebuild is **complete**: all five nav groups have functional (local-first)
modules, and all four Intelligence/Operations merge hubs now lead with live widgets (Session 11
closed the last one — Assets+Calc). Remaining work is backend.

### Production topology and authoritative repository

- **Frontend:** Vercel, Next.js app + authenticated `/api/pb/*` BFF.
- **Backend:** Render, reached only server-to-server through `PETROBRAIN_API_URL`.
- **Authoritative frontend repository:** `https://github.com/Trust-Code-System/PetroBrainWeb`.
- **Local Git warning:** this checkout's `origin` still points to
  `https://github.com/Idansss/PetroBrainWeb.git`. Do not push until the user explicitly authorizes
  correcting the remote and the target branch is reconciled with this dirty working tree.

### Ordered execution queue — complete strictly top to bottom

- [ ] **1. Organization RBAC — IMPLEMENTED LOCALLY; DEPLOYMENT VERIFICATION PENDING.** Discover the Render backend's actual tenant/user/role
      contract; define one canonical permission matrix; hydrate the signed-in user's backend role;
      enforce permissions on backend mutations and mirror them in frontend navigation/actions; add
      denied-state and role-matrix tests. **Done means server-side authorization is authoritative —
      hiding buttons alone does not count.**
  - [x] Backend source cloned from `Trust-Code-System/PetroBrain` to
        `C:\Users\Admin\Desktop\PetroBrain Backend`; existing server-side company/admin role gates
        verified.
  - [x] Added backend `GET /auth/me` so the verified Neon principal is authoritative in the UI.
  - [x] Added frontend canonical-role/permission matrix with least-privilege fallback.
  - [x] Replaced descriptive local team access with tenant-scoped member reads, invitations, role
        updates and removals through the enforced Render endpoints.
  - [x] Added `/invitations/{token}` acceptance flow bridging backend membership and Neon Auth;
        supports Resend delivery or an honestly surfaced manual invite link.
  - [x] Added frontend RBAC/member tests and backend auth/onboarding/admin-user coverage; backend full
        suite green locally (476 passed, 54 skipped).
  - [ ] Commit/push the backend change and deploy it to Render; confirm `GET /auth/me` appears in the
        deployed OpenAPI.
  - [ ] Ensure Render has `PB_NEON_AUTH_ENABLED=true`, the matching `NEON_AUTH_BASE_URL`,
        `PB_APP_PUBLIC_BASE_URL=<Vercel production origin>`, and optional Resend variables.
  - [ ] Deploy the frontend to Vercel with `PETROBRAIN_API_URL=<Render API origin>` and live-test
        owner/admin/auditor/viewer access, invitation acceptance, role changes, self-removal denial,
        tenant isolation, and deactivation. Tick item 1 only after this passes.
- [~] **2. Task ownership mapping — CODE COMPLETE + UNIT-TESTED; LIVE-VERIFY PENDING (Session 17).**
      Replace free-text-only ownership with a backend user selector; map selected users to
      `assigned_to_user_ids`; retain an honest local/free-text fallback only when the accounts endpoint
      is unavailable; test create/update/hydrate mappings.
  - [x] `ActionItem.ownerUserId?` added (backend user id; `owner` keeps the display email/free-text).
  - [x] `lib/actions/client.ts`: `actionToCreateBody`/`actionToUpdateBody` send
        `assigned_to_user_ids: ownerUserId ? [ownerUserId] : []`; `taskToAction` hydrates `ownerUserId`
        from `assigned_to_user_ids`/`assignees` and a display `owner` from any echoed assignee email.
  - [x] `ActionFormDialog`: renders a real backend-member `<Select>` (via `useOrgMembers()`) when the
        accounts endpoint returns members; falls back to the free-text `<Input>` + team datalist when
        it's `null`/empty. Keeps a since-removed owner selectable on edit.
  - [x] Tests: create→`["u1"]` vs `[]` fallback, hydrate id+display from `assigned_to_user_ids` and
        from assignee objects, empty when unassigned (`lib/actions/__tests__/client.test.ts`, +4).
  - [ ] **Live-verify** against the deployed backend once RBAC (item 1) is live: confirm a picked
        member persists as `assigned_to_user_ids`, round-trips on hydrate, and the free-text fallback
        still works when `/organizations/current/members` is unavailable. Tick item 2 after this.
- [ ] **3. Backend-gated features — inspect and deliver independently.** In order: Copilot
      attachments, report generation/jobs, stored-document byte/URL preview, then richer AI
      Governance attribution and approval logs. For each capability, inspect the live OpenAPI first;
      implement only when the Render API exposes a matching contract; otherwise record the precise
      missing backend endpoint/schema and do not fake it.
- [ ] **4. Audit-log improvements.** Add user, module, and date-range filters backed by the real
      `/admin/audit` query parameters; preserve honest unavailable/empty states; test query mapping.
- [ ] **5. Production hardening.** Verify every rebuilt module at mobile/tablet/desktop widths;
      polish tables, drawers and destructive confirmations; audit secrets and server/client env
      boundaries; reconcile the Git remote; verify Vercel environment variables and production
      build; deploy; then run authenticated smoke tests and `/api/health` checks against Vercel and
      Render. Record URLs, results, remaining risks, and rollback steps.

**Execution rule:** complete and tick one item before starting the next. Every item requires its
relevant unit/integration tests plus `typecheck`, `lint`, full test suite, and production build. Update
this ledger immediately after each item.

1. **Backend integration — Phases A+B (partial) DONE.** Wired dual-mode: Action Tracker → `/tasks`
   (Session 12), Org profile → `/organizations/current` (Session 13). Reference patterns:
   `lib/sync/syncedCollection.ts` (collections) + `lib/<domain>/client.ts` (mapping); single-record
   resources use a small dedicated GET/PATCH sync (see `lib/org/store.ts`). **Schema inspection ruled
   out** Permits (`/admin/permits` is permit-to-work docs, not our register), Org members
   (invitation-based) and departments (not modelled) — all stay local-first; don't re-attempt.
   **Wired so far:** Action Tracker → `/tasks` (S12), Org profile → `/organizations/current` (S13),
   AI Governance audit → `/admin/audit` + Notifications → `/admin/notifications` (S14), Copilot
   answer ratings → `/chat/feedback` + AI Governance feedback oversight → `/admin/feedback*` (S15).
   **Schema-ruled-out (do not re-attempt):** Permits (`/admin/permits` = permit-to-work docs), Org
   members (invitation-based), departments (not modelled), Documents inline preview
   (`/documents/preview` is pre-ingestion text, not a file viewer). HSE / operations log / compliance
   obligations / audit evidence have no route → stay local-first.
   **What's actually left:**
   - **Live-verify** every Session 12–15 wiring once a valid Neon token (and an admin role for the
     `/admin/*` ones) is available — the auth-401 risk means these may 401/403 until the backend
     verifies the JWT; the dual-mode / honest-"unavailable" states cover it meanwhile, but real
     end-to-end persistence is unconfirmed.
   - **Tasks owner↔user mapping:** wire `assigned_to_user_ids` once Org RBAC resolves names → ids
     (today `owner` is local-only). Couples with item 2 below.
   - ✅ `/admin/feedback*` oversight + `/chat/feedback` answer ratings wired in Session 15.
   - Optional: richer `/admin/audit` filters (by user/module/date) in the panel.
2. **Org RBAC:** once an accounts backend exists, make roles enforce permissions (today they are
   descriptive labels only).
3. **Backend-gated remainders:** Copilot attach-file / generate-report, Documents inline file
   preview, and AI Governance per-user/department attribution + export-approval logs all wait on
   backend support — wire when the API exposes attachments / report jobs / file URLs / usage logs.
4. **Polish & deploy hardening:** per-module table/drawer/confirm-modal polish as real content
   lands, re-verify mobile stacking per module, confirm no hardcoded secrets, update DEPLOY.md when
   env/contracts change, confirm Vercel build passes.
5. Verify `npm run typecheck`, `npm run lint`, `npm run build` and `npm run test` are green
   before/after each change (all green as of Session 16: 177/177 tests across 38 files).

**Reusable pattern established this session:** `lib/localStore.ts` →
`createLocalCollection<T>(key)` gives reactive CRUD with no backend. Copy the
`lib/actions` / `lib/hse` shape (types + labels + store) for each new local-first module,
and feed cross-module counts into `CommandKpis`.

**Blockers / warnings:**
- Base path is `/app` (auth + proxy depend on it). Do **not** move to root `/dashboard`.
- Several backend endpoints don't exist yet — keep honest fallbacks, never fake success.
- Do not touch the marketing site under `app/(marketing)/*`.
- `components/dashboard/OperationsKpis.tsx` depends on icon keys emissions/flaring/climate/
  assets — keep those keys in `navIcons`.
