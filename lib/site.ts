/**
 * Site-wide configuration: metadata defaults, primary CTAs, and nav/footer structure.
 * Single source of truth so every page and the layout stay consistent.
 */

export const site = {
  name: "PetroBrain",
  // Positioning line — kept honest and present-tense.
  tagline: "The AI-native intelligence platform for oil & gas.",
  description:
    "PetroBrain is the AI-native intelligence platform for oil & gas — from the rig floor to the trading desk. Built inside-out from your own operations, layered with market context, reasoned by AI, and safety-first.",
  // Set NEXT_PUBLIC_SITE_URL in production; falls back for local/dev metadata.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://petrobrain.ai",
  origin: "Built in Nigeria, for the African and global energy industry.",
} as const;

/**
 * URL of the actual PetroBrain product app (a separate project). External to this
 * marketing site, so it's a full URL, not a route. Set NEXT_PUBLIC_APP_URL in the
 * environment; defaults to localhost:3001 for local dev (the marketing site runs on
 * 3000, so run the app on a different port, e.g. `next dev -p 3001`).
 */
export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

/** One primary CTA everywhere; one secondary (the MRV readiness check). */
export const ctas = {
  primary: { label: "Book a demo", href: "/demo" },
  secondary: { label: "MRV readiness check", href: "/mrv" },
  /** Entry into the real product app (external). */
  app: { label: "Sign in", href: appUrl },
} as const;

export type NavItem = { label: string; href: string };
/** A primary-nav entry is either a single link or a labelled dropdown group. */
export type NavEntry = NavItem | { label: string; items: NavItem[] };

export function isNavGroup(entry: NavEntry): entry is { label: string; items: NavItem[] } {
  return "items" in entry;
}

/**
 * Primary navigation. The intelligence pages (/intelligence, /emissions-intelligence,
 * /mrv) are grouped under one "Intelligence" dropdown — they're siblings and cross-link.
 */
export const primaryNav: NavEntry[] = [
  { label: "Product", href: "/product" },
  {
    label: "Intelligence",
    items: [
      { label: "Intelligence overview", href: "/intelligence" },
      { label: "Emissions Intelligence", href: "/emissions-intelligence" },
      { label: "Emissions & MRV", href: "/mrv" },
    ],
  },
  { label: "Safety", href: "/safety" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
];

/** Footer sitemap, grouped. */
export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Platform",
    items: [
      { label: "Product", href: "/product" },
      { label: "Intelligence", href: "/intelligence" },
      { label: "Emissions Intelligence", href: "/emissions-intelligence" },
      { label: "Emissions & MRV", href: "/mrv" },
      { label: "Safety", href: "/safety" },
    ],
  },
  {
    heading: "Value chain",
    items: [
      { label: "Upstream", href: "/upstream" },
      { label: "Midstream", href: "/midstream" },
      { label: "Downstream", href: "/downstream" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Resources", href: "/resources" },
      { label: "Security", href: "/security" },
      { label: "Book a demo", href: "/demo" },
    ],
  },
  {
    heading: "Legal",
    items: [
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms", href: "/legal/terms" },
      { label: "DPA", href: "/legal/dpa" },
    ],
  },
];
