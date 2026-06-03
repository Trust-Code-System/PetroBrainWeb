"use client";

import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { SparkleIcon } from "@/components/app/icons";
import { FRAMEWORK_OPTIONS, PERIOD_OPTIONS } from "@/lib/reports/frameworks";
import type { ReportConfig, ReportFramework, ReportPeriod } from "@/lib/reports/types";

/**
 * ReportConfigPanel — template (framework) + period + start/end dates, a Generate button,
 * and the copilot pre-seed for a board ESG summary. Pure config; generation is backend.
 */
export function ReportConfigPanel({
  value,
  onChange,
  onGenerate,
  generating,
  onBoardSummary,
}: {
  value: ReportConfig;
  onChange: (patch: Partial<ReportConfig>) => void;
  onGenerate: () => void;
  generating: boolean;
  onBoardSummary: () => void;
}) {
  return (
    <Card className="space-y-4">
      <h2 className="text-base font-semibold text-primary">Report configuration</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Template / framework"
          options={FRAMEWORK_OPTIONS}
          value={value.framework}
          onChange={(v) => onChange({ framework: v as ReportFramework })}
        />
        <Select
          label="Period"
          options={PERIOD_OPTIONS}
          value={value.period}
          onChange={(v) => onChange({ period: v as ReportPeriod })}
        />
        <Field id="report-from" label="Start date">
          <DatePicker value={value.from} onChange={(v) => onChange({ from: v, period: "custom" })} />
        </Field>
        <Field id="report-to" label="End date">
          <DatePicker value={value.to} onChange={(v) => onChange({ to: v, period: "custom" })} />
        </Field>
      </div>

      <div className="flex flex-col gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button onClick={onGenerate} disabled={generating}>
          {generating ? "Generating…" : "Generate report"}
        </Button>
        <button
          type="button"
          onClick={onBoardSummary}
          className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-surface-1 px-3.5 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-2"
        >
          <SparkleIcon className="h-4 w-4 text-accent" />
          Ask the copilot for a board ESG summary
        </button>
      </div>
      <p className="text-xs text-faint">Exports to PDF or Excel once generated — files are produced by the backend.</p>
    </Card>
  );
}
