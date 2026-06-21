"use client";

import { cn } from "@/lib/cn";
import { DOC_TYPE_LABEL } from "@/lib/documents/labels";
import type { DocItem, DocumentType } from "@/lib/documents/types";

/**
 * DocumentCategories — a knowledge-base overview row: one chip per document category (type)
 * with a live count, plus "All". Clicking a chip filters the list by that category. Counts
 * are derived from the loaded documents, so the row stays honest (no category shows until a
 * document of that type exists).
 */
export function DocumentCategories({
  items,
  activeType,
  onSelect,
}: {
  items: DocItem[];
  activeType: DocumentType | "";
  onSelect: (type: DocumentType | "") => void;
}) {
  const counts = items.reduce<Record<string, number>>((acc, d) => {
    acc[d.type] = (acc[d.type] ?? 0) + 1;
    return acc;
  }, {});

  const present = (Object.keys(DOC_TYPE_LABEL) as DocumentType[]).filter((t) => counts[t]);
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
      <Chip label="All" count={items.length} active={activeType === ""} onClick={() => onSelect("")} />
      {present.map((t) => (
        <Chip
          key={t}
          label={DOC_TYPE_LABEL[t]}
          count={counts[t] ?? 0}
          active={activeType === t}
          onClick={() => onSelect(activeType === t ? "" : t)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-accent/50 bg-accent-muted text-primary"
          : "border-border-subtle bg-surface-1 text-secondary hover:text-primary",
      )}
    >
      {label}
      <span className="font-mono tabular-nums text-faint">{count}</span>
    </button>
  );
}
