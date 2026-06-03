"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { CitationChip } from "@/components/ui/CitationChip";
import { BarList } from "@/components/ui/charts/BarList";
import { ReconciliationPanel } from "@/components/emissions/ReconciliationPanel";
import { useFlaring } from "@/lib/public-data/hooks";
import { fmtNum } from "@/lib/emissions/labels";
import type { FlaringReconciliation } from "@/lib/emissions/types";

/**
 * SatelliteOverlay — the public satellite-observed flaring overlay. Two honest layers:
 *   1. Public World Bank / NOAA VIIRS flaring by country (real, pre-filled via the
 *      public-data layer) — observed, with a source citation.
 *   2. Your asset's reported vs observed reconciliation (backend A3), reused from the
 *      emissions module, with "illustrative" labels on sample data.
 * Observed (satellite) and reported (your data) are always labelled distinctly.
 */
export function SatelliteOverlay({
  reconciliation,
  reconLoading,
  reconError,
}: {
  reconciliation: FlaringReconciliation | undefined;
  reconLoading: boolean;
  reconError: boolean;
}) {
  const flaring = useFlaring();
  const env = flaring.data;

  return (
    <section aria-labelledby="satellite-heading" className="space-y-4">
      <h2 id="satellite-heading" className="text-lg font-semibold tracking-tight text-primary">
        Satellite flaring overlay
      </h2>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-primary">Observed flaring by country</h3>
            <p className="text-xs text-secondary">Satellite-measured — public reference</p>
          </div>
          <Badge tone="info" dot>
            Observed (satellite)
          </Badge>
        </div>

        {flaring.isLoading ? (
          <div className="space-y-2" aria-busy="true">
            <span className="sr-only">Loading satellite data…</span>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ) : flaring.isError || !env ? (
          <p className="text-sm text-faint">Couldn’t reach the public satellite source.</p>
        ) : env.status === "unavailable" ? (
          <p className="text-sm leading-relaxed text-secondary">{env.reason}</p>
        ) : (
          <>
            <BarList
              unit="bcm"
              format={fmtNum}
              items={[...env.data.records]
                .sort((a, b) => b.flaringBcm - a.flaringBcm)
                .slice(0, 8)
                .map((r) => ({ label: r.country, value: r.flaringBcm, sublabel: String(r.year), tone: "bg-info" }))}
            />
            <CitationChip source={env.source.name} href={env.source.url} />
          </>
        )}
      </Card>

      {/* Your data vs satellite — reused reconciliation panel (asset-level). */}
      <ReconciliationPanel data={reconciliation} isLoading={reconLoading} isError={reconError} />
    </section>
  );
}
