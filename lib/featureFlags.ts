/**
 * Central feature flags. ONE switch controls every interactive demo on the site.
 *
 * Flip the env var to re-enable all demos with no other change:
 *   NEXT_PUBLIC_DEMOS_ENABLED=true   → demos run as normal
 *   (unset or anything else)         → demos render but are disabled (preview only)
 *
 * Default is DISABLED. The value is inlined at build time (NEXT_PUBLIC_ prefix), so it
 * is identical on the server and the client — no hydration mismatch.
 *
 * Demos controlled by this flag:
 *   - components/home/HeroDemo.tsx                  → "/"
 *   - components/intelligence/CrossDomainDemo.tsx   → "/intelligence"
 *   - components/emissions/EmissionsDemo.tsx        → "/emissions-intelligence"
 *   - components/shared/ExampleDemo.tsx             → "/upstream", "/midstream", "/downstream"
 *   - components/mrv/MrvQuiz.tsx                    → "/mrv"
 */
export const demosEnabled: boolean = process.env.NEXT_PUBLIC_DEMOS_ENABLED === "true";

/**
 * Launch stage for the logged-in /app product.
 *
 *   NEXT_PUBLIC_APP_STAGE=full          → every nav module is shown.
 *   (unset / anything else, default)    → "early-access": only the modules wired to the live
 *                                          backend appear in the nav (see DEPLOY.md §2a). The
 *                                          rest stay reachable by deep link but render their
 *                                          honest "unavailable" state — they're just not
 *                                          advertised until the backend endpoints ship.
 *
 * Inlined at build time (NEXT_PUBLIC_ prefix), so server and client agree — no hydration
 * mismatch. Flip to `full` (no code change) once the backend contract is complete.
 */
export const appStage: "early-access" | "full" =
  process.env.NEXT_PUBLIC_APP_STAGE === "full" ? "full" : "early-access";

/**
 * /app module hrefs verified end-to-end against the deployed backend. Edit this set (one line
 * each) as endpoints come online; or set NEXT_PUBLIC_APP_STAGE=full to reveal everything.
 */
const LIVE_APP_HREFS = new Set<string>([
  "/app", // Command Center (assets KPIs + public market data)
  "/app/copilot", // POST /chat
  "/app/assets", // /assets CRUD
  "/app/operations/actions", // Action Tracker → /tasks
  "/app/documents", // GET /documents
  "/app/governance/ai-usage", // AI Governance → /admin/audit
  "/app/governance/organization", // /organizations/current
  "/app/intelligence/market-cost", // market tiles + copilot (cost half is honest-unavailable)
  "/app/profile", // account essentials
]);

/** Whether a given /app nav href should be shown in the current launch stage. */
export function isAppHrefLive(href: string): boolean {
  return appStage === "full" || LIVE_APP_HREFS.has(href);
}
