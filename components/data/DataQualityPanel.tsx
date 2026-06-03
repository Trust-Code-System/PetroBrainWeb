"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import { DATASET_OPTIONS, SEVERITY_TONE } from "@/lib/data/labels";
import { useDataQuality } from "@/lib/data/hooks";
import type { DataDataset } from "@/lib/data/types";

/**
 * DataQualityPanel — AI anomaly checks over a dataset (backend-run). Shows an overall
 * quality score and the flagged issues, CLEARLY marked AI-generated + decision-support.
 * Never fabricates a score.
 */
export function DataQualityPanel() {
  const [dataset, setDataset] = useState<DataDataset>("emissions");
  const q = useDataQuality(dataset);
  const data = q.data;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-primary">Data quality</h3>
          <Badge tone="accent" dot>
            AI checks
          </Badge>
        </div>
        <div className="w-48">
          <Select options={DATASET_OPTIONS} value={dataset} onChange={(v) => setDataset(v as DataDataset)} />
        </div>
      </div>

      {q.isLoading ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : q.isError ? (
        <p className="text-sm text-faint">Couldn’t run the data-quality checks.</p>
      ) : (
        <>
          <div className="rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5">
            <p className="text-xs text-faint">Overall quality score</p>
            <p className="mt-0.5 font-mono text-2xl font-semibold tabular-nums text-primary">
              {data && data.score !== null ? `${data.score}/100` : "—"}
            </p>
          </div>

          {data && data.checks.length > 0 ? (
            <ul className="space-y-2">
              {data.checks.map((c) => (
                <li key={c.id} className={cn("rounded-md border bg-surface-1 p-3", borderFor(c.severity))}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-primary">{c.title}</p>
                    <Badge tone={SEVERITY_TONE[c.severity]}>{c.severity}</Badge>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-secondary">{c.detail}</p>
                  {c.recordRef && <p className="mt-1 font-mono text-xs text-faint">{c.recordRef}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-secondary">No anomalies flagged for this dataset.</p>
          )}

          <p className="text-xs text-faint">
            AI-generated anomaly checks — decision-support only. Verify against the source records
            before acting.
          </p>
        </>
      )}
    </Card>
  );
}

function borderFor(severity: "info" | "warn" | "critical") {
  if (severity === "critical") return "border-danger/40";
  if (severity === "warn") return "border-warn/40";
  return "border-border-subtle";
}
