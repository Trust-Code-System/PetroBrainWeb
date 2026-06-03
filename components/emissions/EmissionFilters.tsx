"use client";

import { Select, type SelectOption } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { SCOPE_FILTER_OPTIONS, CATEGORY_FILTER_OPTIONS } from "@/lib/emissions/labels";
import type { EmissionCategory, EmissionScope, SourceFilters } from "@/lib/emissions/types";

/**
 * EmissionFilters — themed Select filters (scope, category, asset) + a search box for the
 * source inventory. Controlled; emits partial updates to the parent.
 */
export function EmissionFilters({
  value,
  onChange,
  assetOptions,
}: {
  value: SourceFilters;
  onChange: (patch: Partial<SourceFilters>) => void;
  assetOptions: SelectOption[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Select
        label="Scope"
        options={SCOPE_FILTER_OPTIONS}
        value={value.scope}
        onChange={(v) => onChange({ scope: v as EmissionScope | "" })}
      />
      <Select
        label="Category"
        options={CATEGORY_FILTER_OPTIONS}
        value={value.category}
        onChange={(v) => onChange({ category: v as EmissionCategory | "" })}
      />
      <Select
        label="Asset"
        options={[{ label: "All assets", value: "" }, ...assetOptions]}
        value={value.assetId}
        onChange={(v) => onChange({ assetId: v })}
      />
      <div className="space-y-1.5">
        <label htmlFor="emission-search" className="block text-sm font-medium text-primary">
          Search
        </label>
        <Input
          id="emission-search"
          type="search"
          placeholder="Source, asset…"
          value={value.q}
          onChange={(e) => onChange({ q: e.target.value })}
        />
      </div>
    </div>
  );
}
