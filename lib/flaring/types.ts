/**
 * Flaring & Methane types — the UI's view of the backend flaring/calc engine. All figures
 * are backend-computed; the client only formats. Economic/opportunity figures are modeled
 * estimates (labelled as such); satellite-observed figures come from public data.
 */

export interface FlaringAsset {
  assetId: string;
  assetName: string;
  /** Total flared volume in the period. */
  flaringVolume: number | null;
  volumeUnit: string;
  /** Flaring intensity (e.g. volume per unit production). */
  intensity: number | null;
  intensityUnit: string;
  routineVolume: number | null;
  nonRoutineVolume: number | null;
  /** Combustion/flare efficiency, percent (e.g. 98). */
  flareEfficiencyPct: number | null;
}

export interface FlaringAssets {
  items: FlaringAsset[];
  /** Reporting period label. */
  period?: string;
}

export interface MethaneIntensity {
  /** Reported methane intensity, percent of throughput. Null if not yet measured. */
  intensityPct: number | null;
  /** OGMP 2.0 target, percent (0.2). */
  targetPct: number;
  /** Satellite-observed intensity, percent, if available. */
  observedPct?: number | null;
  basis?: string;
  note?: string;
}

export interface ZeroRoutineTracker {
  targetYear: number;
  baselineYear: number;
  baselineRoutineVolume: number | null;
  currentRoutineVolume: number | null;
  unit: string;
  /** Percent reduction from baseline toward zero. */
  reductionPct: number | null;
  /** Whether on track to zero routine flaring by the target year. */
  onTrack: boolean | null;
  note?: string;
}

export type GasPathway = "gas_to_power" | "lpg" | "cng";

export interface GasOpportunityOption {
  pathway: GasPathway;
  label: string;
  potentialValue: number | null;
  currency: string;
  note?: string;
}

export interface GasOpportunity {
  /** Wasted (flared) gas that could be captured. */
  wastedGasVolume: number | null;
  unit: string;
  /** Economic value of the wasted gas. */
  economicValue: number | null;
  currency: string;
  /** Always true here — these are modeled reference estimates, never owned truth. */
  modeled: boolean;
  options: GasOpportunityOption[];
  note?: string;
}
