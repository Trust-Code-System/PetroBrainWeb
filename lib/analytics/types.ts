/**
 * Analytics types. All figures are backend-computed; the frontend only charts/formats.
 * Insight cards are AI-generated server-side (the copilot reasoning over the data) and
 * clearly labelled as such in the UI.
 */

export interface TrendSeriesPoint {
  period: string;
  scope1: number | null;
  scope2: number | null;
  scope3: number | null;
  total: number | null;
  intensity?: number | null;
}

export interface ForecastPoint {
  period: string;
  value: number | null;
  low: number | null;
  high: number | null;
}

export interface Comparison {
  label: string;
  current: number | null;
  previous: number | null;
  deltaPct: number | null;
  unit: string;
}

export interface IntensityKpi {
  label: string;
  value: number | null;
  unit: string;
  deltaPct?: number | null;
}

export interface ScopeBreakdown {
  scope1: number | null;
  scope2: number | null;
  scope3: number | null;
  unit: string;
}

export interface EmissionsAnalytics {
  unit: string;
  series: TrendSeriesPoint[];
  forecast: ForecastPoint[];
  comparison: Comparison;
  intensity: IntensityKpi[];
  scopeBreakdown: ScopeBreakdown;
}

export type Granularity = "monthly" | "quarterly" | "yearly";

export interface AnalyticsFilters {
  from: string;
  to: string;
  assetId: string;
  granularity: Granularity;
}

export interface InsightCard {
  id: string;
  title: string;
  body: string;
  severity?: "info" | "warn" | "positive";
}

export interface InsightsResponse {
  items: InsightCard[];
  generatedAt?: string;
}
