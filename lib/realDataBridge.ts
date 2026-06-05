import { assetsApi } from "@/lib/assets/client";
import type { AnalyticsFilters, EmissionsAnalytics, InsightCard, InsightsResponse } from "@/lib/analytics/types";
import type { ClimateRiskAssets } from "@/lib/climate-risk/types";
import type {
  EmissionCategory,
  EmissionScope,
  EmissionSource,
  FlaringReconciliation,
  ScopeSummary,
  SourceFilters,
  SourceInventory,
} from "@/lib/emissions/types";
import { inventoryApi, type InventoryLine, type InventoryResult, type InventorySummary } from "@/lib/emissions/inventory";
import type {
  FlaringAssets,
  GasOpportunity,
  MethaneIntensity,
  ZeroRoutineTracker,
} from "@/lib/flaring/types";
import type { ReportSummary } from "@/lib/reports/types";

async function optional<T>(p: Promise<T>): Promise<T | undefined> {
  try {
    return await p;
  } catch {
    return undefined;
  }
}

function timestamp(row: InventorySummary): number {
  const t = Date.parse(row.created_utc ?? "");
  return Number.isFinite(t) ? t : 0;
}

function selectLatest(rows: InventorySummary[], p: { period?: string } = {}): InventorySummary | undefined {
  const filtered = p.period ? rows.filter((r) => r.period === p.period) : rows;
  return [...filtered].sort((a, b) => timestamp(b) - timestamp(a) || b.period.localeCompare(a.period))[0];
}

function filterByDateRange(rows: InventorySummary[], from?: string, to?: string): InventorySummary[] {
  return rows.filter((row) => {
    const periodDate = `${row.period.slice(0, 7)}-01`;
    if (from && periodDate < from) return false;
    if (to && periodDate > to) return false;
    return true;
  });
}

async function latestInventory(signal?: AbortSignal, p: { period?: string } = {}): Promise<InventoryResult | undefined> {
  const list = await optional(inventoryApi.list(signal));
  const latest = selectLatest(list?.inventories ?? [], p);
  if (!latest) return undefined;
  return optional(inventoryApi.get(latest.inventory_id, signal));
}

function lineScope(line: InventoryLine): EmissionScope {
  const raw = String(line.scope ?? "").toLowerCase();
  if (raw.includes("3")) return "scope_3";
  if (raw.includes("2")) return "scope_2";
  return "scope_1";
}

function lineCategory(line: InventoryLine): EmissionCategory {
  const raw = String(line.source_type ?? "").toLowerCase();
  if (raw.includes("flar")) return "flaring";
  if (raw.includes("vent")) return "venting";
  if (raw.includes("fugitive")) return "fugitives";
  return "combustion";
}

function sourceAssetName(result: InventoryResult): string {
  const reportAsset = result.ghgemp_report.asset;
  if (typeof reportAsset === "string" && reportAsset.trim()) return reportAsset;
  return result.inventory.facility_id;
}

function sourceId(line: InventoryLine, index: number): string {
  return String(line.source_id || `${line.source_type || "source"}-${index + 1}`);
}

function sumByScope(result: InventoryResult, scope: EmissionScope): number {
  const values = result.inventory.lines
    .filter((line) => lineScope(line) === scope)
    .map((line) => line.co2e_tonnes)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return values.reduce((sum, value) => sum + value, 0);
}

export async function inventoryScopeSummary(
  p: { period?: string; assetId?: string } = {},
  signal?: AbortSignal,
): Promise<ScopeSummary | undefined> {
  const result = await latestInventory(signal, p);
  if (!result) return undefined;

  const scope1 = sumByScope(result, "scope_1");
  const scope2 = sumByScope(result, "scope_2");
  const scope3 = sumByScope(result, "scope_3");
  const lineTotal = scope1 + scope2 + scope3;
  const fallbackScope1 = lineTotal > 0 ? scope1 : result.inventory.totals.co2e_tonnes;

  return {
    scope1: { co2e: fallbackScope1, unit: "tCO2e" },
    scope2: { co2e: scope2 || null, unit: "tCO2e" },
    scope3: { co2e: scope3 || null, unit: "tCO2e" },
    asOf: result.created_utc,
    basis: `saved MRV inventory - ${result.inventory.period}`,
  };
}

export async function inventorySources(
  filters: SourceFilters,
  signal?: AbortSignal,
): Promise<SourceInventory | undefined> {
  const result = await latestInventory(signal);
  if (!result) return undefined;

  const assetName = sourceAssetName(result);
  const items = result.inventory.lines.map(
    (line, index): EmissionSource => ({
      id: `${result.inventory_id ?? result.inventory.facility_id}-${sourceId(line, index)}`,
      assetId: filters.assetId || result.inventory.facility_id,
      assetName,
      scope: lineScope(line),
      category: lineCategory(line),
      source: sourceId(line, index),
      period: result.inventory.period,
      quantity: line.co2e_tonnes ?? 0,
      unit: "tCO2e source total",
      co2e: line.co2e_tonnes ?? null,
      co2eUnit: "tCO2e",
    }),
  );

  const q = filters.q.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (filters.scope && item.scope !== filters.scope) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (q && !`${item.source} ${item.assetName}`.toLowerCase().includes(q)) return false;
    return true;
  });

  return { items: filtered, total: filtered.length };
}

export async function inventoryFlaringAssets(
  p: { assetId?: string; period?: string } = {},
  signal?: AbortSignal,
): Promise<FlaringAssets | undefined> {
  const result = await latestInventory(signal, p);
  if (!result) return undefined;
  const flaringLines = result.inventory.lines.filter((line) => lineCategory(line) === "flaring");
  if (flaringLines.length === 0) return { items: [], period: result.inventory.period };

  const flaringCo2e = flaringLines.reduce((sum, line) => sum + (line.co2e_tonnes ?? 0), 0);
  const assetId = p.assetId || result.inventory.facility_id;
  return {
    period: result.inventory.period,
    items: [
      {
        assetId,
        assetName: sourceAssetName(result),
        flaringVolume: flaringCo2e,
        volumeUnit: "tCO2e",
        intensity: null,
        intensityUnit: "Requires production data",
        routineVolume: null,
        nonRoutineVolume: flaringCo2e,
        flareEfficiencyPct: null,
      },
    ],
  };
}

export async function inventoryMethaneIntensity(signal?: AbortSignal): Promise<MethaneIntensity | undefined> {
  const result = await latestInventory(signal);
  if (!result) return undefined;
  return {
    intensityPct: null,
    targetPct: 0.2,
    observedPct: null,
    basis: `saved MRV inventory - ${result.inventory.period}`,
    note: "Real methane tonnes are connected; throughput is needed to compute methane intensity.",
  };
}

export async function inventoryZeroRoutineTracker(signal?: AbortSignal): Promise<ZeroRoutineTracker | undefined> {
  const result = await latestInventory(signal);
  if (!result) return undefined;
  const flaring = await inventoryFlaringAssets({}, signal);
  const current = flaring?.items[0]?.flaringVolume ?? null;
  return {
    targetYear: 2030,
    baselineYear: Number(result.inventory.period.slice(0, 4)) || new Date().getFullYear(),
    baselineRoutineVolume: null,
    currentRoutineVolume: current,
    unit: flaring?.items[0]?.volumeUnit ?? "tCO2e",
    reductionPct: null,
    onTrack: null,
    note: "Real flaring inventory is connected; routine/non-routine tagging is needed for zero-routine progress.",
  };
}

export async function inventoryGasOpportunity(signal?: AbortSignal): Promise<GasOpportunity | undefined> {
  const result = await latestInventory(signal);
  if (!result) return undefined;
  const flaring = await inventoryFlaringAssets({}, signal);
  return {
    wastedGasVolume: flaring?.items[0]?.flaringVolume ?? null,
    unit: flaring?.items[0]?.volumeUnit ?? "tCO2e",
    economicValue: null,
    currency: "USD",
    modeled: true,
    options: [
      { pathway: "gas_to_power", label: "Gas-to-power", potentialValue: null, currency: "USD", note: "Needs gas composition and tariff assumptions." },
      { pathway: "lpg", label: "LPG recovery", potentialValue: null, currency: "USD", note: "Needs liquids yield assumptions." },
      { pathway: "cng", label: "CNG trucking", potentialValue: null, currency: "USD", note: "Needs logistics assumptions." },
    ],
    note: `Real flaring inventory is connected from ${result.inventory.period}; economic value needs the calc backend.`,
  };
}

export async function inventoryFlaringReconciliation(
  p: { assetId?: string; period?: string } = {},
  signal?: AbortSignal,
): Promise<FlaringReconciliation | undefined> {
  const flaring = await inventoryFlaringAssets(p, signal);
  const row = flaring?.items[0];
  if (!row) return undefined;
  return {
    illustrative: false,
    observedSource: "Reported inventory only",
    note: "Real reported flaring is connected; satellite observed volume is not connected yet.",
    items: [
      {
        assetId: row.assetId,
        assetName: row.assetName,
        reported: row.flaringVolume,
        observed: null,
        unit: row.volumeUnit,
        variance: null,
        variancePct: null,
        source: "Saved MRV inventory",
      },
    ],
  };
}

export async function assetLocationClimateRisk(signal?: AbortSignal): Promise<ClimateRiskAssets | undefined> {
  const list = await optional(assetsApi.list({ type: "", q: "" }, signal));
  const items = (list?.items ?? [])
    .filter((asset) => asset.lat !== null && asset.lon !== null)
    .map((asset) => ({
      assetId: asset.id,
      name: asset.name,
      lat: asset.lat,
      lon: asset.lon,
      overallScore: null,
      band: undefined,
      hazards: {},
      recommendedAction: "Asset location is connected; climate hazard scoring needs the climate-risk backend.",
      estimatedExposure: {
        value: null,
        currency: "USD",
        note: "Exposure is not computed until the climate-risk backend is connected.",
      },
    }));
  return items.length ? { items } : undefined;
}

export async function inventoryAnalytics(
  filters: AnalyticsFilters,
  signal?: AbortSignal,
): Promise<EmissionsAnalytics | undefined> {
  const list = await optional(inventoryApi.list(signal));
  const rows = filterByDateRange(list?.inventories ?? [], filters.from, filters.to).sort((a, b) =>
    a.period.localeCompare(b.period),
  );
  if (rows.length === 0) return undefined;

  const series = rows.map((row) => ({
    period: row.period,
    scope1: row.total_co2e_tonnes,
    scope2: null,
    scope3: null,
    total: row.total_co2e_tonnes,
    intensity: null,
  }));
  const current = rows.at(-1)?.total_co2e_tonnes ?? null;
  const previous = rows.at(-2)?.total_co2e_tonnes ?? null;
  const deltaPct =
    typeof current === "number" && typeof previous === "number" && previous !== 0
      ? ((current - previous) / previous) * 100
      : null;

  return {
    unit: "tCO2e",
    series,
    forecast: [],
    comparison: {
      label: "Saved inventory emissions",
      current,
      previous,
      deltaPct,
      unit: "tCO2e",
    },
    intensity: [],
    scopeBreakdown: {
      scope1: current,
      scope2: null,
      scope3: null,
      unit: "tCO2e",
    },
  };
}

export async function inventoryInsights(signal?: AbortSignal): Promise<InsightsResponse | undefined> {
  const list = await optional(inventoryApi.list(signal));
  const rows = [...(list?.inventories ?? [])].sort((a, b) => a.period.localeCompare(b.period));
  if (rows.length === 0) return undefined;

  const latest = rows.at(-1);
  const previous = rows.at(-2);
  const items: InsightCard[] = [
    {
      id: "inventory-latest",
      title: "Latest saved inventory is connected",
      body: `${latest?.facility_id ?? "Latest facility"} reports ${latest?.total_co2e_tonnes.toLocaleString() ?? "0"} tCO2e for ${latest?.period ?? "the latest period"}.`,
      severity: "info" as const,
    },
  ];
  if (latest && previous && previous.total_co2e_tonnes !== 0) {
    const delta = ((latest.total_co2e_tonnes - previous.total_co2e_tonnes) / previous.total_co2e_tonnes) * 100;
    items.push({
      id: "inventory-change",
      title: delta <= 0 ? "Emissions declined versus prior inventory" : "Emissions increased versus prior inventory",
      body: `The latest saved inventory is ${Math.abs(delta).toFixed(1)}% ${delta <= 0 ? "lower" : "higher"} than ${previous.period}.`,
      severity: delta <= 0 ? "positive" : "warn",
    });
  }

  return { items, generatedAt: new Date().toISOString() };
}

export async function inventoryReportSummary(
  p: { from: string; to: string; assetId?: string },
  signal?: AbortSignal,
): Promise<ReportSummary | undefined> {
  const list = await optional(inventoryApi.list(signal));
  const rows = filterByDateRange(list?.inventories ?? [], p.from, p.to);
  if (rows.length === 0) return undefined;

  const total = rows.reduce((sum, row) => sum + row.total_co2e_tonnes, 0);
  const readinessValues = rows
    .map((row) => row.tier_readiness_pct)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const completenessPct = readinessValues.length
    ? readinessValues.reduce((sum, value) => sum + value, 0) / readinessValues.length
    : null;

  return {
    totalEmissions: { value: total, unit: "tCO2e" },
    dataPoints: rows.length,
    completenessPct,
    dataQuality: {
      score: completenessPct,
      label: "Saved inventory",
    },
  };
}
