/**
 * Canned demo content for the homepage hero widget. NO backend — these are
 * pre-written, reviewed answers that demonstrate the brand promise:
 * cited, calculated, and safety-first.
 *
 * EDIT FREELY: copy lives here, presentation lives in components/home/HeroDemo.tsx.
 *
 * Honesty rules baked in:
 *  - Worked numbers use ILLUSTRATIVE inputs and say so. We never present a figure
 *    as if it came from the reader's live operations.
 *  - Every answer carries a verification line and at least one source.
 */

export type DemoConfidence = "high" | "medium" | "low";

export type DemoExample = {
  id: string;
  /** Short label shown on the selectable question chip. */
  chip: string;
  /** The full question, shown as the "user" line. */
  question: string;
  /** One-line framing of the answer (this is typed out). */
  intro: string;
  /** Optional formula, rendered in mono as "technical proof". */
  formula?: { expression: string; caption?: string };
  /** Whether the worked values are illustrative (adds an "illustrative" note). */
  illustrative?: boolean;
  /** Ordered reasoning / calculation steps. */
  steps: string[];
  /** Optional headline result line. */
  result?: string;
  /** Sources backing the answer. */
  citations: { source: string; href?: string }[];
  confidence: DemoConfidence;
  /** Honest caveat about what the answer depends on. */
  confidenceNote?: string;
  /** The verification banner text — always present. */
  verification: string;
};

export const demoExamples: DemoExample[] = [
  {
    id: "kill-sheet",
    chip: "Build a kill sheet",
    question: "Build a kill sheet for our current well — wait & weight method.",
    intro:
      "I'll lay out the wait-and-weight kill sheet from your well data and the standard well-control relationships. Confirm every value against your IWCF-certified well-control supervisor before use.",
    formula: {
      expression: "KMW = OMW + ( SIDPP / (0.052 × TVD) )",
      caption: "KMW kill mud weight (ppg) · OMW original mud weight · SIDPP shut-in drillpipe pressure · TVD true vertical depth",
    },
    illustrative: true,
    steps: [
      "Read SIDPP, SICP and pit gain from the shut-in. (Illustrative: SIDPP 400 psi, TVD 9,800 ft, OMW 11.2 ppg.)",
      "Kill mud weight: 11.2 + (400 / (0.052 × 9,800)) ≈ 12.0 ppg.",
      "Initial circulating pressure (ICP) = SIDPP + slow-circulating-rate pressure.",
      "Final circulating pressure (FCP) = SCR × (KMW / OMW); build the pressure step-down schedule per the kill line.",
    ],
    result: "Kill mud weight ≈ 12.0 ppg (illustrative inputs). ICP/FCP and step-down schedule generated for your kill rate.",
    citations: [
      { source: "IWCF well-control principles" },
      { source: "API RP 59 · Well Control Operations" },
    ],
    confidence: "medium",
    confidenceNote: "Uses illustrative inputs until your live well data is connected",
    verification:
      "Kill-sheet figures must be verified by the competent person (IWCF-certified supervisor) against the controlling well-control document before any action.",
  },
  {
    id: "mawp",
    chip: "MAWP, 12-inch class-3 gas line",
    question: "What's the MAOP for a 12-inch class-3 gas pipeline?",
    intro:
      "I'll work the maximum allowable operating pressure from ASME B31.8 using the Barlow relation and the Class 3 design factor. Inputs below are illustrative — connect your line spec for the real number.",
    formula: {
      expression: "P = (2 × S × t / D) × F × E × T",
      caption: "S SMYS · t wall thickness · D outside diameter · F design factor · E joint factor · T temperature derating",
    },
    illustrative: true,
    steps: [
      "Class 3 location → design factor F = 0.50 (ASME B31.8 Table 841.1.6-1).",
      "Illustrative spec: API 5L X52 (SMYS 52,000 psi), OD 12.75 in, wall 0.375 in, E = 1.0, T = 1.0.",
      "P = (2 × 52,000 × 0.375 / 12.75) × 0.50 × 1.0 × 1.0.",
    ],
    result: "MAOP ≈ 1,530 psi for these illustrative inputs. Swap in your line spec and I'll recompute.",
    citations: [{ source: "ASME B31.8 · Gas Transmission & Distribution Piping" }],
    confidence: "high",
    confidenceNote: "Formula is exact; the result is only as good as the line spec you provide",
    verification:
      "Confirm SMYS, wall thickness and location class against the controlling pipeline document and a competent engineer before setting any operating pressure.",
  },
  {
    id: "mrv-readiness",
    chip: "Check Tier-3 methane readiness",
    question: "Check our Tier-3 methane MRV readiness for the NUPRC deadline.",
    intro:
      "I'll map your reporting against the NUPRC Tier-3 framework — source-level quantification reconciled with satellite observation — and flag the gaps. I only assess data you've connected; I won't assume coverage you don't have.",
    illustrative: false,
    steps: [
      "Inventory emission sources across your connected facilities (flares, vents, fugitive components).",
      "Tier 3 requires source-level quantification — direct measurement or engineering calculation, not generic factors.",
      "Reconcile your bottom-up inventory against public satellite methane (Sentinel-5P / TROPOMI) to surface unexplained plumes.",
      "Flag sources without a Tier-3-grade method and produce a prioritised readiness gap list.",
    ],
    result: "Readiness assessed only for connected sources; unconnected facilities are reported as gaps, never assumed compliant.",
    citations: [
      { source: "NUPRC · Guidelines for Management of Fugitive Methane & GHG" },
      { source: "Copernicus Sentinel-5P (TROPOMI) methane" },
    ],
    confidence: "medium",
    confidenceNote: "Completeness depends on which facilities and meters you've connected",
    verification:
      "Any regulatory submission must be reviewed and signed off by your competent person / regulatory liaison before filing with NUPRC.",
  },
  {
    id: "brent-breakeven",
    chip: "Which fields go cash-negative?",
    question: "Brent just dropped 8% — which of my fields go cash-negative?",
    intro:
      "This spans public market data and your own field economics — the question a market dashboard can't answer because it doesn't know your wells. Here's how I reason across both.",
    formula: {
      expression: "cash_margin/bbl = realised_price − (OPEX + transport + royalty)",
    },
    illustrative: false,
    steps: [
      "Take the current Brent reference (public, EIA) and apply the −8% move.",
      "Pull each field's per-barrel breakeven from your own connected cost and production data.",
      "Rank the fields whose breakeven now sits above the lower price — those are the cash-negative ones.",
      "Surface the biggest OPEX lever on each, from your maintenance and operating records.",
    ],
    result: "A ranked, sourced list — but only once your field-level economics are connected. Until then I'll show the method, not invented figures.",
    citations: [{ source: "EIA · Brent spot price", href: "https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm" }],
    confidence: "low",
    confidenceNote: "Needs your field-level OPEX, production and fiscal terms connected",
    verification:
      "Economic outputs depend entirely on the cost assumptions you connect — validate them with your planning team before acting.",
  },
];
