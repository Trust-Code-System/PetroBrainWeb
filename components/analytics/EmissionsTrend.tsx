"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { TrendChart, type TrendPoint, type TrendType } from "@/components/ui/charts/TrendChart";
import { fmtNum } from "@/lib/emissions/labels";
import type { ForecastPoint, TrendSeriesPoint } from "@/lib/analytics/types";

const TYPES: TrendType[] = ["bar", "line", "area"];

/**
 * EmissionsTrend — total emissions over time with a bar/line/area toggle and a modeled
 * forecast band. Figures + forecast are backend-provided; the chart only renders them.
 */
export function EmissionsTrend({
  series,
  forecast,
  unit,
  isLoading,
  isError,
}: {
  series: TrendSeriesPoint[];
  forecast: ForecastPoint[];
  unit: string;
  isLoading: boolean;
  isError: boolean;
}) {
  const [type, setType] = useState<TrendType>("bar");

  const points: TrendPoint[] = [
    ...series.map((s) => ({ label: s.period, value: s.total })),
    ...forecast.map((f) => ({ label: f.period, value: f.value, low: f.low, high: f.high, forecast: true })),
  ];

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-primary">Emissions trend</h3>
          <span className="text-xs text-faint">{unit}</span>
          {forecast.length > 0 && <Badge tone="warn">Forecast modeled</Badge>}
        </div>
        <div className="inline-flex gap-1 rounded-md border border-border-subtle bg-surface-1 p-1">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              aria-pressed={type === t}
              className={cn(
                "rounded-sm px-3 py-1 text-sm capitalize transition-colors",
                type === t ? "bg-accent text-accent-contrast" : "text-secondary hover:bg-surface-2 hover:text-primary",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-[200px] w-full" />
      ) : isError ? (
        <p className="text-sm text-faint">Couldn’t load the emissions trend.</p>
      ) : points.length === 0 ? (
        <p className="text-sm text-faint">No emissions in this range.</p>
      ) : (
        <TrendChart points={points} type={type} unit={unit} format={fmtNum} ariaLabel="Emissions" />
      )}
    </Card>
  );
}
