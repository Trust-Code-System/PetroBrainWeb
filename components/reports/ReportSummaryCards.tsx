"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { fmtNum } from "@/lib/emissions/labels";
import type { ReportSummary } from "@/lib/reports/types";

/**
 * ReportSummaryCards — total emissions, data points, completeness and data quality for the
 * configured period (oil-&-gas-native take on the CarbonScope reports layout). All
 * backend-computed; null renders as "—", never a fabricated zero.
 */
export function ReportSummaryCards({
  summary,
  isLoading,
  isError,
}: {
  summary: ReportSummary | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  const cards: { label: string; render: () => React.ReactNode }[] = [
    {
      label: "Total emissions",
      render: () =>
        summary && summary.totalEmissions.value !== null
          ? value(fmtNum(summary.totalEmissions.value), summary.totalEmissions.unit)
          : empty(),
    },
    {
      label: "Data points",
      render: () => (summary && summary.dataPoints !== null ? value(fmtNum(summary.dataPoints)) : empty()),
    },
    {
      label: "Completeness",
      render: () =>
        summary && summary.completenessPct !== null ? value(`${fmtNum(summary.completenessPct)}`, "%") : empty(),
    },
    {
      label: "Data quality",
      render: () =>
        summary && summary.dataQuality.score !== null
          ? value(fmtNum(summary.dataQuality.score), summary.dataQuality.label)
          : empty(summary?.dataQuality.label),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label} className="p-4">
          <p className="font-mono text-xs uppercase tracking-wider text-faint">{c.label}</p>
          <div className="mt-1.5">
            {isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : isError ? (
              <p className="text-sm text-faint">Unavailable</p>
            ) : (
              c.render()
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function value(main: string, suffix?: string) {
  return (
    <p className="font-mono text-2xl font-semibold tabular-nums text-primary">
      {main}
      {suffix && <span className="ml-1 text-sm font-normal text-secondary">{suffix}</span>}
    </p>
  );
}

function empty(note?: string) {
  return (
    <div>
      <p className="font-mono text-2xl font-semibold text-grey-600" aria-hidden="true">
        —
      </p>
      <p className="mt-0.5 text-xs text-faint">{note ?? "No data yet"}</p>
    </div>
  );
}
