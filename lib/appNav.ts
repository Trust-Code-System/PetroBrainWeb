/**
 * App navigation model — the single source of truth for the logged-in /app shell's
 * left-nav groups and the route → page-title lookup used by the top bar and the
 * "Coming soon" stub pages. Groups + ordering follow PETROBRAIN_PLATFORM_BLUEPRINT.md
 * exactly. `icon` is a key into components/app/icons.tsx (no icon library — inline SVGs).
 */

export type AppIconKey =
  | "dashboard"
  | "market"
  | "asset"
  | "cost"
  | "opportunities"
  | "emissions"
  | "flaring"
  | "climate"
  | "assets"
  | "calc"
  | "documents"
  | "analytics"
  | "reports"
  | "data"
  | "settings"
  | "profile";

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
    items: [{ label: "Dashboard", href: "/app", icon: "dashboard" }],
  },
  {
    heading: "Intelligence",
    items: [
      { label: "Cross-domain", href: "/app/intelligence", icon: "market" },
      { label: "Market", href: "/app/intelligence/market", icon: "market" },
      { label: "Asset", href: "/app/intelligence/asset", icon: "asset" },
      { label: "Cost Intelligence", href: "/app/intelligence/cost", icon: "cost" },
      {
        label: "Opportunities",
        href: "/app/opportunities",
        icon: "opportunities",
        badgeKey: "opportunities-unread",
      },
    ],
  },
  {
    heading: "Emissions & Environment",
    items: [
      { label: "Emissions & MRV", href: "/app/emissions", icon: "emissions" },
      { label: "Flaring & Methane", href: "/app/flaring", icon: "flaring" },
      { label: "Climate Risk", href: "/app/climate-risk", icon: "climate" },
    ],
  },
  {
    heading: "Operations",
    items: [
      { label: "Assets", href: "/app/assets", icon: "assets" },
      { label: "Calculations", href: "/app/calc", icon: "calc" },
      { label: "Documents", href: "/app/documents", icon: "documents" },
    ],
  },
  {
    heading: "Analysis & Reporting",
    items: [
      { label: "Analytics", href: "/app/analytics", icon: "analytics" },
      { label: "Reports", href: "/app/reports", icon: "reports" },
    ],
  },
  {
    heading: "Organization",
    items: [
      { label: "Data Tools", href: "/app/data", icon: "data" },
      { label: "Settings", href: "/app/settings", icon: "settings" },
      { label: "Profile", href: "/app/profile", icon: "profile" },
    ],
  },
];

/** Flat list of every nav item (e.g. for title lookup / route generation). */
export const appNavItems: AppNavItem[] = appNav.flatMap((g) => g.items);

/**
 * Resolve a human page title for a route. Matches the deepest nav item whose href is
 * a prefix of the pathname (so /app/emissions/EM-1 still titles "Emissions & MRV").
 * Falls back to "Dashboard" for the app root and a generic title otherwise.
 */
export function getPageTitle(pathname: string): string {
  if (pathname === "/app") return "Dashboard";
  const match = appNavItems
    .filter((i) => i.href !== "/app" && pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "PetroBrain";
}

/**
 * The single active nav href for a pathname: the LONGEST nav item whose href the path
 * matches (exact, or a `/`-segment prefix). Longest-match means an index route like
 * /app/intelligence doesn't also light up when a sub-route (/app/intelligence/market) is
 * active — only the most specific item highlights.
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
