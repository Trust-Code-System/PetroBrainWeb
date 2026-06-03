/**
 * Suggested copilot prompts that adapt to the current page. Keyed by route prefix
 * (most-specific match wins); falls back to a generic set. Used by the copilot panel's
 * empty state and reused by the dashboard CopilotStrip so suggestions stay consistent.
 */

const ROUTE_SUGGESTIONS: { prefix: string; prompts: string[] }[] = [
  {
    prefix: "/app/emissions",
    prompts: [
      "Summarise our reported emissions and flag what data is missing.",
      "How do we get ready for NUPRC Tier-3 MRV before 1 Jan 2027?",
      "What's the difference between our reported and satellite-observed methane?",
    ],
  },
  {
    prefix: "/app/flaring",
    prompts: [
      "Which assets are flaring the most this month?",
      "How does our flaring compare to the World Bank country figure?",
      "What would cutting routine flaring 20% do to our emissions?",
    ],
  },
  {
    prefix: "/app/assets",
    prompts: [
      "Which of our assets are highest-risk right now?",
      "Help me add a new field with its facilities and wells.",
      "Summarise production across our asset hierarchy.",
    ],
  },
  {
    prefix: "/app/intelligence",
    prompts: [
      "What's driving today's Brent–WTI spread?",
      "How do current prices affect a marginal field's economics?",
      "What public data do you have on West African benchmarks?",
    ],
  },
  {
    prefix: "/app/opportunities",
    prompts: [
      "Which active rounds match my profile?",
      "What's NUPRC's next licensing-round deadline?",
      "Which rounds have submission deadlines in the next 90 days?",
    ],
  },
  // Dashboard / app root.
  {
    prefix: "/app",
    prompts: [
      "What's Brent today and what does it mean for a marginal field?",
      "What public market data can you see right now?",
      "How do I start tracking our flaring for NUPRC Tier-3?",
    ],
  },
];

const DEFAULT_SUGGESTIONS = [
  "What can you help me with on this page?",
  "What data can you see right now?",
  "What's the latest on the oil market?",
];

/** A specific licensing round is open — descriptive prompts only (never bid advice). */
const OPPORTUNITY_DETAIL_PROMPTS = [
  "Summarize this round",
  "What documents are required?",
  "What's the fiscal regime here?",
];

export function suggestionsForRoute(route: string): string[] {
  // The opportunities detail route (/app/opportunities/<id>) gets round-specific prompts.
  if (route.startsWith("/app/opportunities/")) return OPPORTUNITY_DETAIL_PROMPTS;

  const match = ROUTE_SUGGESTIONS.find((r) => route === r.prefix || route.startsWith(`${r.prefix}/`))
    ?? ROUTE_SUGGESTIONS.find((r) => route.startsWith(r.prefix));
  return match?.prompts ?? DEFAULT_SUGGESTIONS;
}
