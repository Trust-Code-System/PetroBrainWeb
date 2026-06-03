"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fmtNum } from "@/lib/emissions/labels";
import type { FlaringReconciliation, ReconciliationRow } from "@/lib/emissions/types";

/**
 * ReconciliationPanel — reported vs satellite-observed flaring (backend A3). Bars are a
 * visual comparison of two backend-provided figures; the variance comes from the backend
 * where given. Sample/illustrative data is clearly labelled — never presented as owned
 * truth (messaging guardrail #2).
 */
export function ReconciliationPanel({
  data,
  isLoading,
  isError,
}: {
  data: FlaringReconciliation | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-primary">Satellite reconciliation</h3>
          <p className="text-xs text-secondary">Reported vs observed flaring{data?.observedSource ? ` · ${data.observedSource}` : ""}</p>
        </div>
        {data?.illustrative && <Badge tone="warn">Illustrative</Badge>}
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <span className="sr-only">Loading reconciliation…</span>
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-faint">Couldn’t load reconciliation data.</p>
      ) : !data || data.items.length === 0 ? (
        <p className="text-sm leading-relaxed text-secondary">
          {data?.note ??
            "No satellite reconciliation yet. Once a satellite flaring provider is connected, reported vs observed volumes appear here — sample data is always labelled."}
        </p>
      ) : (
        <ul className="space-y-4">
          {data.items.map((row) => (
            <ReconciliationItem key={row.assetId} row={row} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function ReconciliationItem({ row }: { row: ReconciliationRow }) {
  const reported = row.reported;
  const observed = row.observed;
  const max = Math.max(reported ?? 0, observed ?? 0) || 1;
  // Variance: use the backend's value; fall back to a display-only delta of the two
  // given figures (no emission factors are applied here).
  const variancePct =
    row.variancePct ??
    (reported && observed && reported !== 0 ? ((observed - reported) / reported) * 100 : null);

  return (
    <li className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-primary">{row.assetName}</span>
        <div className="flex items-center gap-2">
          {row.sample && <Badge tone="warn">illustrative</Badge>}
          {variancePct !== null && (
            <span
              className={cnVariance(variancePct)}
              title="Observed vs reported"
            >
              {variancePct > 0 ? "+" : ""}
              {fmtNum(variancePct)}%
            </span>
          )}
        </div>
      </div>

      <Bar label="Reported" value={reported} max={max} unit={row.unit} tone="bg-info" />
      <Bar label="Observed" value={observed} max={max} unit={row.unit} tone="bg-accent" />
    </li>
  );
}

function Bar({
  label,
  value,
  max,
  unit,
  tone,
}: {
  label: string;
  value: number | null;
  max: number;
  unit: string;
  tone: string;
}) {
  const pct = value === null ? 0 : Math.max(2, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 font-mono text-xs uppercase tracking-wider text-faint">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-sm bg-surface-2">
        {value !== null && <div className={`h-full rounded-sm ${tone}`} style={{ width: `${pct}%` }} />}
      </div>
      <span className="w-28 shrink-0 text-right font-mono text-xs tabular-nums text-secondary">
        {value === null ? "—" : `${fmtNum(value)} ${unit}`}
      </span>
    </div>
  );
}

function cnVariance(pct: number): string {
  const tone = Math.abs(pct) >= 10 ? "text-warn" : "text-secondary";
  return `font-mono text-xs font-medium ${tone}`;
}
