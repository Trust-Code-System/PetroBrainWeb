"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SparkleIcon } from "@/components/app/icons";
import { useChrome } from "@/components/app/ChromeProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { EmissionsTrend } from "./EmissionsTrend";
import { ScopeBreakdownPanel } from "./ScopeBreakdownPanel";
import { IntensityPanel } from "./IntensityPanel";
import { InsightCards } from "./InsightCards";
import { useEmissionsAnalytics, useAnalyticsInsights } from "@/lib/analytics/hooks";
import { useAssets } from "@/lib/emissions/hooks";
import type { AnalyticsFilters as Filters } from "@/lib/analytics/types";

const INSIGHT_SEED = "Explain what's driving our emissions trend and where we should focus to cut it.";
const CONNECT_SEED = "Help me connect our emissions data so I can see analytics and trends.";

function defaultFilters(): Filters {
  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - 11);
  from.setDate(1);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to), assetId: "", granularity: "monthly" };
}

/**
 * AnalyticsWorkspace — container for /app/analytics: filters, emissions trend (+forecast),
 * scope breakdown, intensity/period-over-period, and AI insight cards. Publishes a summary
 * to the copilot page context. All figures backend-computed.
 */
export function AnalyticsWorkspace() {
  const { openCopilotWith } = useChrome();
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const analytics = useEmissionsAnalytics(filters);
  const insights = useAnalyticsInsights(filters);
  const assets = useAssets();

  const assetOptions = (assets.data?.items ?? []).map((a) => ({ label: a.name, value: a.id }));
  const data = analytics.data;
  const series = data?.series ?? [];
  const showEmpty = !analytics.isLoading && !analytics.isError && series.length === 0;

  useRegisterPageContext({
    selectedEntityId: filters.assetId || undefined,
    filters: { from: filters.from, to: filters.to, granularity: filters.granularity, ...(filters.assetId ? { assetId: filters.assetId } : {}) },
    data: data
      ? {
          analytics: {
            unit: data.unit,
            comparison: data.comparison,
            scopeBreakdown: data.scopeBreakdown,
            intensity: data.intensity,
          },
        }
      : undefined,
  });

  return (
    <div className="space-y-6">
      <AnalyticsFilters
        value={filters}
        onChange={(patch) => setFilters((p) => ({ ...p, ...patch }))}
        assetOptions={assetOptions}
      />

      {showEmpty ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-surface-1 p-10 text-center">
          <div className="mx-auto max-w-md space-y-3">
            <h2 className="text-lg font-semibold text-primary">Nothing to analyze yet</h2>
            <p className="text-sm leading-relaxed text-secondary">
              Once your emissions data is connected, trends, scope breakdowns, intensity KPIs and
              AI insights appear here. Connect your data — or ask the copilot to set it up.
            </p>
            <Button variant="secondary" onClick={() => openCopilotWith(CONNECT_SEED)}>
              <SparkleIcon className="h-4 w-4 text-accent" />
              Ask the copilot
            </Button>
          </div>
        </div>
      ) : (
        <>
          <EmissionsTrend
            series={series}
            forecast={data?.forecast ?? []}
            unit={data?.unit ?? "tCO₂e"}
            isLoading={analytics.isLoading}
            isError={analytics.isError}
          />

          <div className="grid gap-4 lg:grid-cols-2">
            <ScopeBreakdownPanel
              data={data?.scopeBreakdown}
              isLoading={analytics.isLoading}
              isError={analytics.isError}
            />
            <IntensityPanel
              comparison={data?.comparison}
              intensity={data?.intensity ?? []}
              isLoading={analytics.isLoading}
              isError={analytics.isError}
            />
          </div>

          <InsightCards
            data={insights.data}
            isLoading={insights.isLoading}
            isError={insights.isError}
            onAsk={() => openCopilotWith(INSIGHT_SEED)}
          />
        </>
      )}
    </div>
  );
}
