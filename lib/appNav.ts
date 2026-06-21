/**
 * App navigation model — the single source of truth for the logged-in /app shell's
 * left-nav groups and the route → page-title lookup used by the top bar and stub pages.
 *
 * Information architecture (rebuild — PetroBrain AI Operations Intelligence Platform):
 *   OVERVIEW    · Command Center · AI Copilot
 *   OPERATIONS  · Operations Log · HSE Center · Maintenance & Assets · Action Tracker · Documents
 *   COMPLIANCE  · Compliance Guardian · Permits & Certificates · Audit Evidence
 *   INTELLIGENCE· Market & Cost Intelligence · Environment & Energy · Analytics & Reports
 *   GOVERNANCE  · AI Governance · Data Sources · Organization · Settings · Profile
 *
 * Base path stays `/app` (auth + the /api/pb proxy depend on it). New modules nest under it.
 * `icon` is a key into components/app/icons.tsx (no icon library — inline SVGs). Legacy
 * routes that are no longer top-level nav items (e.g. /app/emissions) are still reachable
 * via hub pages and keep a friendly title through `routeTitles`.
 */

export type AppIconKey =
  // overview
  | "dashboard"
  | "copilot"
  // operations
  | "operations-log"
  | "hse"
  | "maintenance"
  | "actions"
  | "documents"
  // compliance
  | "compliance"
  | "permits"
  | "audit"
  // intelligence
  | "market"
  | "environment"
  | "analytics"
  // governance
  | "ai-governance"
  | "data"
  | "organization"
  | "settings"
  | "profile"
  // legacy keys still referenced by dashboard KPI cards / hub pages
  | "asset"
  | "cost"
  | "opportunities"
  | "emissions"
  | "flaring"
  | "climate"
  | "assets"
  | "calc"
  | "reports";

/** Keys for live count badges rendered next to a nav item (see components/app/NavBadge.tsx). */
export type NavBadgeKey = "opportunities-unread";

export type AppNavItem = {
  label: string;
  href: string;
  icon: AppIconKey;
  /** Optional live count badge (e.g. unread updates on watched licensing rounds). */
  badgeKey?: NavBadgeKey;
};

export type AppNavGroup = {
  heading: string;
  items: AppNavItem[];
};

export const appNav: AppNavGroup[] = [
  {
    heading: "Overview",
    items: [
      { label: "Command Center", href: "/app", icon: "dashboard" },
      { label: "AI Copilot", href: "/app/copilot", icon: "copilot" },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "Operations Log", href: "/app/operations/logs", icon: "operations-log" },
      { label: "HSE Center", href: "/app/operations/hse", icon: "hse" },
      { label: "Maintenance & Assets", href: "/app/assets", icon: "maintenance" },
      { label: "Action Tracker", href: "/app/operations/actions", icon: "actions" },
      { label: "Documents", href: "/app/documents", icon: "documents" },
    ],
  },
  {
    heading: "Compliance",
    items: [
      { label: "Compliance Guardian", href: "/app/compliance/guardian", icon: "compliance" },
      { label: "Permits & Certificates", href: "/app/compliance/permits", icon: "permits" },
      { label: "Audit Evidence", href: "/app/compliance/audit-evidence", icon: "audit" },
    ],
  },
  {
    heading: "Intelligence",
    items: [
      { label: "Market & Cost Intelligence", href: "/app/intelligence/market-cost", icon: "market" },
      {
        label: "Environment & Energy",
        href: "/app/intelligence/environment-energy",
        icon: "environment",
      },
      { label: "Analytics & Reports", href: "/app/intelligence/reports", icon: "analytics" },
    ],
  },
  {
    heading: "Governance",
    items: [
      { label: "AI Governance", href: "/app/governance/ai-usage", icon: "ai-governance" },
      { label: "Data Sources", href: "/app/data", icon: "data" },
      { label: "Organization", href: "/app/governance/organization", icon: "organization" },
      { label: "Settings", href: "/app/settings", icon: "settings" },
      { label: "Profile", href: "/app/profile", icon: "profile" },
    ],
  },
];

/** Flat list of every nav item (e.g. for title lookup / route generation). */
export const appNavItems: AppNavItem[] = appNav.flatMap((g) => g.items);

/**
 * Friendly titles for routes that are NOT top-level nav items — legacy modules now reached
 * via hub pages, and sub-routes. Keyed by route prefix (longest match wins).
 */
const routeTitles: Record<string, string> = {
  "/app/emissions": "Emissions & MRV",
  "/app/flaring": "Flaring & Methane",
  "/app/climate-risk": "Climate Risk",
  "/app/calc": "Calculations",
  "/app/analytics": "Analytics",
  "/app/reports": "Reports",
  "/app/opportunities": "Opportunities",
  "/app/intelligence/market": "Market Intelligence",
  "/app/intelligence/cost": "Cost Intelligence",
  "/app/intelligence/asset": "Asset Intelligence",
  "/app/intelligence": "Intelligence",
};

/**
 * Resolve a human page title for a route. Matches the deepest nav item whose href is a
 * prefix of the pathname, then falls back to the legacy `routeTitles` map (also longest
 * prefix), then a generic title. `/app` is always the Command Center.
 */
export function getPageTitle(pathname: string): string {
  if (pathname === "/app") return "Command Center";

  const navMatch = appNavItems
    .filter((i) => i.href !== "/app" && (pathname === i.href || pathname.startsWith(`${i.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (navMatch) return navMatch.label;

  const legacy = Object.keys(routeTitles)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
  if (legacy && routeTitles[legacy]) return routeTitles[legacy];

  return "PetroBrain";
}

/**
 * The single active nav href for a pathname: the LONGEST nav item whose href the path
 * matches (exact, or a `/`-segment prefix). Longest-match means an index route like
 * /app/intelligence doesn't also light up when a sub-route is active — only the most
 * specific item highlights.
 */
export function activeNavHref(pathname: string): string | null {
  let best: string | null = null;
  for (const item of appNavItems) {
    if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
      if (!best || item.href.length > best.length) best = item.href;
    }
  }
  return best;
}
