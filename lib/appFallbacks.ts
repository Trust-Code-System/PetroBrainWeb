import type { AssetList } from "@/lib/assets/types";
import type { ClimateRiskAssets } from "@/lib/climate-risk/types";
import type {
  AssetRef,
  FinancedSummary,
  FlaringReconciliation,
  ScopeSummary,
  SourceInventory,
} from "@/lib/emissions/types";
import type {
  FlaringAssets,
  GasOpportunity,
  MethaneIntensity,
  ZeroRoutineTracker,
} from "@/lib/flaring/types";
import type { CostIntelligence } from "@/lib/intelligence/types";
import type { EmissionsAnalytics, InsightsResponse } from "@/lib/analytics/types";
import type { RoundListResult, UnreadUpdates } from "@/lib/opportunities/types";
import type { ReportSummary, ScheduledReport } from "@/lib/reports/types";

export const FALLBACK_ASSET_ID = "demo-bonga";
export const FALLBACK_ASSET_NAME = "Bonga (demo)";
const FALLBACK_PERIOD = "2026 YTD";
const FALLBACK_NOTE = "Demo reference while backend data is not connected.";

export const fallbackAssetRefs: { items: AssetRef[] } = {
  items: [{ id: FALLBACK_ASSET_ID, name: FALLBACK_ASSET_NAME }],
};

export const fallbackAssetList: AssetList = {
  items: [
    {
      id: FALLBACK_ASSET_ID,
      name: FALLBACK_ASSET_NAME,
      type: "field",
      lat: 4.58,
      lon: 4.62,
      operator: "Demo Operator",
      status: "Demo reference",
    },
  ],
};

export const fallbackScopeSummary: ScopeSummary = {
  scope1: { co2e: 128400, unit: "tCO2e" },
  scope2: { co2e: 9400, unit: "tCO2e" },
  scope3: { co2e: 41200, unit: "tCO2e", note: FALLBACK_NOTE },
  asOf: "2026-06-05",
  basis: "demo reference - backend data not connected",
};

export const fallbackSources: SourceInventory = {
  items: [],
  total: 0,
};

export const fallbackFinanced: FinancedSummary = {
  items: [],
  financedCo2eTotal: null,
  co2eUnit: "tCO2e",
  note: "Portfolio financed-emissions data is not connected yet.",
};

export function fallbackFlaringAssets(assetId = FALLBACK_ASSET_ID): FlaringAssets {
  return {
    period: FALLBACK_PERIOD,
    items: [
      {
        assetId,
        assetName: FALLBACK_ASSET_NAME,
        flaringVolume: 12.6,
        volumeUnit: "MMscf",
        intensity: 0.42,
        intensityUnit: "MMscf/kboe",
        routineVolume: 8.1,
        nonRoutineVolume: 4.5,
        flareEfficiencyPct: 97.5,
      },
    ],
  };
}

export const fallbackMethaneIntensity: MethaneIntensity = {
  intensityPct: 0.23,
  targetPct: 0.2,
  observedPct: 0.26,
  basis: "reported + satellite reference",
  note: FALLBACK_NOTE,
};

export const fallbackZeroRoutineTracker: ZeroRoutineTracker = {
  targetYear: 2030,
  baselineYear: 2024,
  baselineRoutineVolume: 18.5,
  currentRoutineVolume: 8.1,
  unit: "MMscf",
  reductionPct: 56.2,
  onTrack: true,
  note: FALLBACK_NOTE,
};

export const fallbackGasOpportunity: GasOpportunity = {
  wastedGasVolume: 8.1,
  unit: "MMscf",
  economicValue: 1820000,
  currency: "USD",
  modeled: true,
  options: [
    { pathway: "gas_to_power", label: "Gas-to-power", potentialValue: 960000, currency: "USD" },
    { pathway: "lpg", label: "LPG recovery", potentialValue: 620000, currency: "USD" },
    { pathway: "cng", label: "CNG trucking", potentialValue: 240000, currency: "USD" },
  ],
  note: FALLBACK_NOTE,
};

export function fallbackFlaringReconciliation(assetId = FALLBACK_ASSET_ID): FlaringReconciliation {
  return {
    illustrative: true,
    observedSource: "Demo satellite reference",
    note: FALLBACK_NOTE,
    items: [
      {
        assetId,
        assetName: FALLBACK_ASSET_NAME,
        reported: 12.6,
        observed: 13.4,
        unit: "MMscf",
        variance: 0.8,
        variancePct: 6.3,
        sample: true,
        source: "Demo satellite reference",
      },
    ],
  };
}

export function fallbackClimateRiskAssets(assetId = FALLBACK_ASSET_ID): ClimateRiskAssets {
  return {
    items: [
      {
        assetId,
        name: FALLBACK_ASSET_NAME,
        lat: 4.58,
        lon: 4.62,
        overallScore: 64,
        band: "high",
        hazards: {
          flood: { score: 58, band: "moderate", basis: "modeled" },
          heat: { score: 46, band: "moderate", basis: "modeled" },
          coastal: { score: 72, band: "high", basis: "modeled" },
          erosion: { score: 61, band: "high", basis: "modeled" },
        },
        recommendedAction: "Prioritize drainage, coastal exposure review, and emergency access checks.",
        estimatedExposure: {
          value: 12500000,
          currency: "USD",
          note: FALLBACK_NOTE,
        },
      },
    ],
  };
}

export const fallbackCostIntelligence: CostIntelligence = {
  currency: "USD",
  userCosts: [
    { label: "Operating cost", value: 18.4, unit: "$/boe", source: "Demo reference" },
    { label: "Lifting cost", value: 12.8, unit: "$/boe", source: "Demo reference" },
  ],
  publicCosts: [
    { label: "West Africa deepwater capex", value: 7.9, unit: "$/boe", source: "Public benchmark reference" },
    { label: "FPSO lease day rate", value: 410000, unit: "$/day", source: "Public benchmark reference" },
  ],
  benchmarksExpanding: {
    items: [
      { label: "West Africa OPEX range", value: 16.5, unit: "$/boe", source: "Demo benchmark" },
      { label: "Deepwater breakeven", value: 49, unit: "$/bbl", source: "Demo benchmark" },
    ],
    note: FALLBACK_NOTE,
  },
};

export const fallbackAnalytics: EmissionsAnalytics = {
  unit: "tCO2e",
  series: [
    { period: "2025-07", scope1: 11800, scope2: 820, scope3: 3500, total: 16120, intensity: 0.48 },
    { period: "2025-08", scope1: 11650, scope2: 810, scope3: 3420, total: 15880, intensity: 0.46 },
    { period: "2025-09", scope1: 11200, scope2: 790, scope3: 3360, total: 15350, intensity: 0.45 },
    { period: "2025-10", scope1: 10950, scope2: 770, scope3: 3310, total: 15030, intensity: 0.44 },
    { period: "2025-11", scope1: 10720, scope2: 760, scope3: 3250, total: 14730, intensity: 0.43 },
    { period: "2025-12", scope1: 10580, scope2: 750, scope3: 3200, total: 14530, intensity: 0.42 },
    { period: "2026-01", scope1: 10440, scope2: 740, scope3: 3160, total: 14340, intensity: 0.41 },
    { period: "2026-02", scope1: 10310, scope2: 735, scope3: 3120, total: 14165, intensity: 0.41 },
    { period: "2026-03", scope1: 10180, scope2: 725, scope3: 3070, total: 13975, intensity: 0.4 },
    { period: "2026-04", scope1: 10090, scope2: 715, scope3: 3025, total: 13830, intensity: 0.39 },
    { period: "2026-05", scope1: 9960, scope2: 705, scope3: 2980, total: 13645, intensity: 0.39 },
    { period: "2026-06", scope1: 9850, scope2: 700, scope3: 2940, total: 13490, intensity: 0.38 },
  ],
  forecast: [
    { period: "2026-07", value: 13380, low: 12800, high: 13920 },
    { period: "2026-08", value: 13240, low: 12660, high: 13790 },
    { period: "2026-09", value: 13110, low: 12540, high: 13620 },
  ],
  comparison: {
    label: "Monthly emissions",
    current: 13490,
    previous: 13645,
    deltaPct: -1.1,
    unit: "tCO2e",
  },
  intensity: [
    { label: "Emissions intensity", value: 0.38, unit: "tCO2e/boe", deltaPct: -2.6 },
    { label: "Flaring intensity", value: 0.42, unit: "MMscf/kboe", deltaPct: -8.4 },
  ],
  scopeBreakdown: {
    scope1: 9850,
    scope2: 700,
    scope3: 2940,
    unit: "tCO2e",
  },
};

export const fallbackInsights: InsightsResponse = {
  generatedAt: "2026-06-05T00:00:00.000Z",
  items: [
    {
      id: "demo-flaring",
      title: "Flaring is the largest near-term lever",
      body: "Demo reference data shows Scope 1 dominates the trend, with routine flaring carrying the biggest reduction opportunity.",
      severity: "warn",
    },
    {
      id: "demo-intensity",
      title: "Intensity is improving",
      body: "The reference trend declines from 0.48 to 0.38 tCO2e/boe across the displayed period.",
      severity: "positive",
    },
  ],
};

export const fallbackReportSummary: ReportSummary = {
  totalEmissions: { value: 179000, unit: "tCO2e" },
  dataPoints: 36,
  completenessPct: 72,
  dataQuality: { score: 78, label: "Demo reference" },
};

export const fallbackReportSchedules: { items: ScheduledReport[] } = {
  items: [],
};

export const fallbackRounds: RoundListResult = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  ingestion_status: {
    gaps: [
      {
        regulator: "Licensing-round backend",
        note: "Backend feed is not connected yet.",
      },
    ],
  },
};

export const fallbackUnreadUpdates: UnreadUpdates = {
  count: 0,
  byRound: [],
};
