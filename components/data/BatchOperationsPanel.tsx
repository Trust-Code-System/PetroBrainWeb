"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { DATASET_OPTIONS, BATCH_OPERATIONS } from "@/lib/data/labels";
import { useRunBatch, useBatchJob } from "@/lib/data/hooks";
import type { BatchJob, BatchOperation, BatchStatus, DataDataset } from "@/lib/data/types";

const STATUS_TONE: Record<BatchStatus, "info" | "warn" | "safe" | "danger"> = {
  queued: "info",
  running: "warn",
  done: "safe",
  failed: "danger",
};

/**
 * BatchOperationsPanel — run a batch operation (recalculate / re-validate / delete) over a
 * dataset. Destructive operations require an explicit confirmation before running. The job
 * status is polled until it finishes.
 */
export function BatchOperationsPanel() {
  const [operation, setOperation] = useState<BatchOperation>("recalculate");
  const [dataset, setDataset] = useState<DataDataset>("emissions");
  const [confirmed, setConfirmed] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const runMut = useRunBatch();
  const polled = useBatchJob(jobId);
  const job: BatchJob | undefined = polled.data ?? runMut.data;

  const op = BATCH_OPERATIONS.find((o) => o.value === operation)!;
  const canRun = !op.destructive || confirmed;

  function run() {
    if (!canRun) return;
    runMut.mutate({ operation, dataset }, { onSuccess: (j) => setJobId(j.id) });
  }

  return (
    <Card className="space-y-4">
      <h3 className="text-base font-semibold text-primary">Batch operations</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Operation"
          options={BATCH_OPERATIONS.map((o) => ({ label: o.label, value: o.value }))}
          value={operation}
          onChange={(v) => {
            setOperation(v as BatchOperation);
            setConfirmed(false);
          }}
        />
        <Select label="Dataset" options={DATASET_OPTIONS} value={dataset} onChange={(v) => setDataset(v as DataDataset)} />
      </div>

      <p className="text-sm text-secondary">{op.description}</p>

      {op.destructive && (
        <label className="flex items-start gap-2 rounded-md border border-danger/40 bg-danger/10 px-3 py-2.5 text-sm text-primary">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5"
          />
          <span>I understand this permanently deletes the matching {DATASET_OPTIONS.find((d) => d.value === dataset)?.label} records.</span>
        </label>
      )}

      <Button onClick={run} disabled={!canRun || runMut.isPending} variant={op.destructive ? "secondary" : "primary"}>
        {runMut.isPending ? "Starting…" : `Run ${op.label.toLowerCase()}`}
      </Button>

      {runMut.isError && (
        <Banner variant="danger" title="Couldn’t start the batch operation">
          {(runMut.error as Error).message}
        </Banner>
      )}

      {job && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-primary">{op.label}</p>
            <p className="text-xs text-faint">
              {job.affected !== null ? `${job.affected} records` : "—"}
              {job.error ? ` · ${job.error}` : ""}
            </p>
          </div>
          <Badge tone={STATUS_TONE[job.status]} dot>
            {job.status}
          </Badge>
        </div>
      )}
    </Card>
  );
}
