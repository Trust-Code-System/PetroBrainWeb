"use client";

import { Field } from "@/components/ui/Field";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select, type SelectOption } from "@/components/ui/Select";
import type { AnalyticsFilters as Filters, Granularity } from "@/lib/analytics/types";

const GRANULARITY_OPTIONS: SelectOption[] = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
];

/**
 * AnalyticsFilters — date range + branch/asset + granularity. Themed Select for asset and
 * granularity; native date inputs for the range. Controlled.
 */
export function AnalyticsFilters({
  value,
  onChange,
  assetOptions,
}: {
  value: Filters;
  onChange: (patch: Partial<Filters>) => void;
  assetOptions: SelectOption[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field id="from" label="From">
        <DatePicker value={value.from} onChange={(v) => onChange({ from: v })} />
      </Field>
      <Field id="to" label="To">
        <DatePicker value={value.to} onChange={(v) => onChange({ to: v })} />
      </Field>
      <Select
        label="Branch / asset"
        options={[{ label: "All assets", value: "" }, ...assetOptions]}
        value={value.assetId}
        onChange={(v) => onChange({ assetId: v })}
      />
      <Select
        label="Granularity"
        options={GRANULARITY_OPTIONS}
        value={value.granularity}
        onChange={(v) => onChange({ granularity: v as Granularity })}
      />
    </div>
  );
}
