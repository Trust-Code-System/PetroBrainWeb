/**
 * Canned content for the /emissions-intelligence demo widget — the flaring
 * reconciliation that proves the satellite-verification capability no horizontal
 * carbon tool has. NO backend: these are pre-written, reviewed values.
 *
 * EDIT FREELY: copy and figures live here; presentation lives in
 * components/emissions/EmissionsDemo.tsx. The widget computes the variance and the
 * "observed exceeds reported" flag from these numbers, so you only edit the inputs.
 *
 * Honesty rules baked in (see messaging guardrails):
 *  - The satellite-observed figure is ILLUSTRATIVE and is labelled as such. We never
 *    present an observation we didn't actually pull as if it were live.
 *  - Every figure carries its source, and the answer ends with a verification line.
 */

export type ReconciliationFigure = {
  /** Where the number came from, shown as a CitationChip. */
  source: string;
  href?: string;
  /** The numeric value, rendered in mono. */
  value: number;
  /** Unit suffix, e.g. "MMscf". */
  unit: string;
  /** Marks a value we don't actually own (adds an "illustrative" label). */
  illustrative?: boolean;
};

export type EmissionsDemoContent = {
  /** Short label for the demo widget header. */
  context: string;
  /** The operator's question, shown as the "user" line. */
  question: string;
  /** One-line framing of the answer (this is typed out). */
  intro: string;
  /** What the operator reported (from their own metering). */
  reported: ReconciliationFigure;
  /** What independent satellite observation saw over the same assets + period. */
  observed: ReconciliationFigure;
  /** Ordered reasoning steps shown beneath the figures. */
  steps: string[];
  /** Shown as a flag when observed exceeds reported. */
  flagWhenObservedExceeds: string;
  /** Sources backing the answer (in addition to the per-figure chips). */
  citations: { source: string; href?: string }[];
  /** Honest caveat about what the answer depends on. */
  confidenceNote: string;
  /** The verification banner text — always present. */
  verification: string;
};

export const emissionsDemo: EmissionsDemoContent = {
  context: "Flaring reconciliation",
  question: "Reconcile our reported Q3 flaring against satellite observations.",
  intro:
    "I'll line up the flaring you reported from your own metering against what independent satellites observed over the same assets and quarter, then quantify the gap. The satellite figure below is illustrative — connect your assets for the live reconciliation.",
  reported: {
    source: "Operator SCADA / flare metering",
    value: 1820,
    unit: "MMscf",
  },
  observed: {
    source: "NOAA VIIRS flaring data",
    href: "https://eogdata.mines.edu/products/vnf/",
    value: 2140,
    unit: "MMscf",
    illustrative: true,
  },
  steps: [
    "Read reported Q3 flared volume from your connected SCADA / flare-meter records.",
    "Pull NOAA VIIRS nightfire detections over the same facility footprints and quarter, and convert radiant heat to flared gas volume.",
    "Align both to the same assets and period, then compute the variance between reported and observed.",
    "Where observed exceeds reported, flag it — unmetered or under-reported flaring, or a detection over a facility you don't operate that should be excluded.",
  ],
  flagWhenObservedExceeds:
    "Satellites saw more flaring than you reported. That gap is exactly what a regulator or auditor will ask about — better to find and explain it now than to file a number you can't defend.",
  citations: [
    { source: "NOAA VIIRS flaring data", href: "https://eogdata.mines.edu/products/vnf/" },
    { source: "Operator SCADA / flare metering" },
  ],
  confidenceNote:
    "Illustrative satellite figure; live reconciliation depends on which assets and meters you connect",
  verification:
    "Treat the variance as a lead to investigate, not a finished number. Confirm asset footprints, metering coverage and any non-operated detections with your competent person before it informs a regulatory filing.",
};
