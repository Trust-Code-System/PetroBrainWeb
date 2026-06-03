"use client";

import { Select, MultiSelect } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import {
  COUNTRY_OPTIONS,
  ROUND_TYPE_OPTIONS,
  STATUS_OPTIONS,
  SEGMENT_OPTIONS,
  SORT_OPTIONS,
} from "@/lib/opportunities/labels";
import type { RoundFilters } from "@/lib/opportunities/types";

/**
 * OpportunityFilters — the filter row for the rounds list. Controlled; every change is
 * pushed up via `onChange` (partial patch). Country is a MultiSelect (Nigeria default);
 * type/status/segment/sort are themed Selects; keyword is a search Input. Upstream-only
 * segment for v1 (the Select still exists so the contract is future-proof).
 */
export function OpportunityFilters({
  filters,
  onChange,
}: {
  filters: RoundFilters;
  onChange: (patch: Partial<RoundFilters>) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="w-48">
        <MultiSelect
          label="Country"
          options={COUNTRY_OPTIONS}
          value={filters.country}
          onChange={(v) => onChange({ country: v })}
          placeholder="All countries"
        />
      </div>
      <div className="w-44">
        <Select
          label="Round type"
          options={ROUND_TYPE_OPTIONS}
          value={filters.type}
          onChange={(v) => onChange({ type: v })}
        />
      </div>
      <div className="w-44">
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(v) => onChange({ status: v })}
        />
      </div>
      <div className="w-36">
        <Select
          label="Segment"
          options={SEGMENT_OPTIONS}
          value={filters.segment}
          onChange={(v) => onChange({ segment: v })}
        />
      </div>
      <div className="min-w-[12rem] flex-1">
        <label htmlFor="round-search" className="block text-sm font-medium text-primary">
          Search
        </label>
        <div className="mt-1.5">
          <Input
            id="round-search"
            type="search"
            placeholder="Round or block name…"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
          />
        </div>
      </div>
      <div className="w-44">
        <Select
          label="Sort"
          options={SORT_OPTIONS}
          value={filters.sort}
          onChange={(v) => onChange({ sort: v })}
        />
      </div>
    </div>
  );
}
