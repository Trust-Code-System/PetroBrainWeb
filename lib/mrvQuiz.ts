/**
 * NUPRC Tier-3 MRV readiness self-assessment — questions, scoring and bands.
 *
 * EDIT FREELY: this is the single source for the quiz. Each option carries `points`
 * (higher = more ready) and, when the answer reveals a gap, a `gap` with a short title
 * and a detailed recommendation. The free result shows the band + gap count; the full
 * gap detail is revealed after email capture in components/mrv/MrvQuiz.tsx.
 */

export type MrvGap = { title: string; detail: string };

export type MrvOption = {
  id: string;
  label: string;
  /** 0 = not started … 3 = best practice. */
  points: number;
  gap?: MrvGap;
};

export type MrvQuestion = {
  id: string;
  question: string;
  help?: string;
  options: MrvOption[];
};

export const MRV_MAX_PER_QUESTION = 3;

export const mrvQuestions: MrvQuestion[] = [
  {
    id: "tier",
    question: "How do you quantify methane emissions today?",
    help: "Tier 3 means measurement-based quantification, not generic emission factors.",
    options: [
      { id: "none", label: "We don’t formally quantify methane yet", points: 0, gap: { title: "No quantification baseline", detail: "Start with a source inventory and a quantification method per source. Tier 3 requires measurement or engineering calculation at the source level — generic national factors won’t satisfy it." } },
      { id: "tier1", label: "Tier 1 — standard/national emission factors", points: 1, gap: { title: "Factor-based reporting (Tier 1)", detail: "Move from average factors to source-specific quantification. Prioritise your largest sources (flares, vents, high-count fugitive components) for measurement first." } },
      { id: "tier2", label: "Tier 2 — facility-specific factors / engineering estimates", points: 2, gap: { title: "Tier 2, not yet measurement-based", detail: "You’re partway. Tier 3 needs direct measurement or measurement-validated engineering calculation on key sources, reconciled against observation." } },
      { id: "tier3", label: "Tier 3 — measurement-based at the source level", points: 3 },
    ],
  },
  {
    id: "measurement",
    question: "What continuous measurement coverage do you have on major sources?",
    options: [
      { id: "none", label: "None — periodic estimates only", points: 0, gap: { title: "No continuous measurement", detail: "Identify your highest-emitting sources and deploy continuous or high-frequency measurement there first. Continuous data is what turns a Tier 2 estimate into a Tier 3 number." } },
      { id: "some", label: "A few key sources", points: 1, gap: { title: "Partial measurement coverage", detail: "Extend coverage to all material sources. Gaps in coverage become assumptions — and assumptions are where audits push back." } },
      { id: "most", label: "Most major sources", points: 2, gap: { title: "Near-complete coverage", detail: "Close the remaining measurement gaps and document why any source is excluded, so the inventory is defensibly complete." } },
      { id: "all", label: "All material sources, continuously", points: 3 },
    ],
  },
  {
    id: "ogi",
    question: "How do you run optical gas imaging (OGI) surveys?",
    help: "OGI cameras make otherwise-invisible hydrocarbon leaks visible for detection.",
    options: [
      { id: "none", label: "We don’t use OGI", points: 0, gap: { title: "No OGI capability", detail: "Introduce OGI surveys for component-level leak detection. It’s the workhorse of credible LDAR and a common regulatory expectation." } },
      { id: "occasional", label: "Occasional third-party surveys", points: 1, gap: { title: "Ad-hoc OGI only", detail: "Move to a scheduled OGI programme with defined frequency and coverage, rather than one-off external campaigns." } },
      { id: "scheduled", label: "Scheduled in-house OGI surveys", points: 2, gap: { title: "Scheduled but not continuous", detail: "Good cadence. Consider supplementing periodic OGI with continuous monitoring on your highest-risk areas." } },
      { id: "continuous", label: "Scheduled OGI plus continuous monitoring", points: 3 },
    ],
  },
  {
    id: "ldar",
    question: "What does your leak detection & repair (LDAR) workflow look like?",
    options: [
      { id: "none", label: "No formal LDAR programme", points: 0, gap: { title: "No LDAR programme", detail: "Stand up a documented LDAR programme: survey, tag, repair, re-verify. Without it, detected leaks don’t reliably become fixed leaks." } },
      { id: "adhoc", label: "Ad hoc — we fix leaks when noticed", points: 1, gap: { title: "Reactive leak handling", detail: "Formalise detection-to-repair with defined timelines and re-survey verification, so repairs are provable, not anecdotal." } },
      { id: "periodic", label: "Documented periodic LDAR", points: 2, gap: { title: "Periodic, not closed-loop", detail: "Add closed-loop tracking: every find tracked to repair and re-verification, with the data feeding your emissions inventory." } },
      { id: "closedloop", label: "Closed-loop LDAR with full tracking", points: 3 },
    ],
  },
  {
    id: "flaring",
    question: "How is flaring and venting volume captured?",
    options: [
      { id: "estimated", label: "Estimated", points: 0, gap: { title: "Flaring/venting estimated", detail: "Meter flare and vent streams. Flaring is often the single largest reported source — estimates here undermine the whole inventory’s credibility." } },
      { id: "partial", label: "Partially metered", points: 1, gap: { title: "Partial flare/vent metering", detail: "Complete metering across flare and vent points and record continuously, so reported volumes are measured rather than back-calculated." } },
      { id: "metered", label: "Fully metered and recorded", points: 3 },
    ],
  },
  {
    id: "reporting",
    question: "How do you compile and submit regulatory reports?",
    options: [
      { id: "manual", label: "Manual spreadsheets", points: 0, gap: { title: "Manual reporting", detail: "Manual compilation is slow and hard to audit. Move toward a system that assembles the report from source data with a traceable lineage." } },
      { id: "mixed", label: "A mix of tools and spreadsheets", points: 1, gap: { title: "Fragmented reporting", detail: "Consolidate into one workflow so every reported figure traces back to its measurement — which is exactly what an audit asks for." } },
      { id: "automated", label: "Automated, with an audit trail", points: 3 },
    ],
  },
  {
    id: "reconciliation",
    question: "Do you reconcile your inventory against independent observation?",
    help: "Public satellite methane data (e.g. Sentinel-5P / TROPOMI) can flag plumes your bottom-up inventory misses.",
    options: [
      { id: "none", label: "No — we report our bottom-up numbers only", points: 0, gap: { title: "No top-down reconciliation", detail: "Cross-check your bottom-up inventory against satellite observation to catch unexplained plumes before a regulator or NGO does." } },
      { id: "aware", label: "We’re aware of satellite data but don’t use it", points: 1, gap: { title: "Reconciliation not operationalised", detail: "Build satellite reconciliation into your routine so discrepancies are investigated and resolved, not discovered externally." } },
      { id: "active", label: "We actively reconcile bottom-up vs. satellite", points: 3 },
    ],
  },
];

/* ------------------------------ scoring ------------------------------ */

export type MrvBandId = "not-started" | "behind" | "on-track" | "ready";

export type MrvBand = {
  id: MrvBandId;
  label: string;
  tone: "danger" | "warn" | "info" | "safe";
  headline: string;
  summary: string;
};

const BANDS: MrvBand[] = [
  {
    id: "not-started",
    label: "Not started",
    tone: "danger",
    headline: "You’re at the starting line — and the clock is running.",
    summary:
      "The foundations of measurement-based MRV aren’t in place yet. That’s common, and it’s recoverable — but it needs to start now, not in Q4.",
  },
  {
    id: "behind",
    label: "Behind",
    tone: "warn",
    headline: "You’ve begun, but there are real gaps to close.",
    summary:
      "Some pieces exist, but key measurement, LDAR or reporting elements aren’t Tier-3-ready. The gaps are addressable with a focused plan.",
  },
  {
    id: "on-track",
    label: "On track",
    tone: "info",
    headline: "Solid foundations — a few gaps stand between you and ready.",
    summary:
      "You have meaningful measurement and process in place. Closing the remaining gaps gets you to defensible Tier-3 reporting.",
  },
  {
    id: "ready",
    label: "Ready",
    tone: "safe",
    headline: "You’re in strong shape for Tier-3 MRV.",
    summary:
      "Measurement, LDAR, metering and reporting are largely where they need to be. The opportunity now is to make it effortless and audit-grade.",
  },
];

export type MrvResult = {
  points: number;
  max: number;
  percent: number;
  band: MrvBand;
  gaps: MrvGap[];
};

export function getBand(percent: number): MrvBand {
  if (percent >= 80) return BANDS[3]!;
  if (percent >= 55) return BANDS[2]!;
  if (percent >= 30) return BANDS[1]!;
  return BANDS[0]!;
}

/** Score a completed answer map (questionId -> optionId). */
export function scoreMrv(answers: Record<string, string>): MrvResult {
  let points = 0;
  let max = 0;
  const gaps: MrvGap[] = [];

  for (const q of mrvQuestions) {
    const best = Math.max(...q.options.map((o) => o.points));
    max += best;
    const chosen = q.options.find((o) => o.id === answers[q.id]);
    if (!chosen) continue;
    points += chosen.points;
    if (chosen.gap) gaps.push(chosen.gap);
  }

  const percent = max === 0 ? 0 : Math.round((points / max) * 100);
  return { points, max, percent, band: getBand(percent), gaps };
}
