"use client";

import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { DOC_TYPE_FILTER_OPTIONS, DOC_STATUS_FILTER_OPTIONS } from "@/lib/documents/labels";
import type { DocFilters, DocStatus, DocumentType } from "@/lib/documents/types";

/**
 * DocumentFilters — type / status themed Selects + search (covers name & revision).
 */
export function DocumentFilters({
  value,
  onChange,
}: {
  value: DocFilters;
  onChange: (patch: Partial<DocFilters>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Select
        label="Type"
        options={DOC_TYPE_FILTER_OPTIONS}
        value={value.type}
        onChange={(v) => onChange({ type: v as DocumentType | "" })}
      />
      <Select
        label="Status"
        options={DOC_STATUS_FILTER_OPTIONS}
        value={value.status}
        onChange={(v) => onChange({ status: v as DocStatus | "" })}
      />
      <div className="space-y-1.5">
        <label htmlFor="doc-search" className="block text-sm font-medium text-primary">
          Search
        </label>
        <Input
          id="doc-search"
          type="search"
          placeholder="Name or revision…"
          value={value.q}
          onChange={(e) => onChange({ q: e.target.value })}
        />
      </div>
    </div>
  );
}
