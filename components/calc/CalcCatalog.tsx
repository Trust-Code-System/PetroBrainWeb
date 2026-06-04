"use client";

import { cn } from "@/lib/cn";
import { CALC_CATEGORIES, CALC_CATEGORY_LABEL } from "@/lib/calc/catalog";
import type { CalcDef } from "@/lib/calc/types";

/**
 * CalcCatalog — the calc picker, grouped by category, from the backend-sourced catalog. A
 * small amber dot marks safety-critical calcs (the authoritative flag still comes from the
 * engine result). Empty categories are hidden.
 */
export function CalcCatalog({
  catalog,
  selectedId,
  onSelect,
}: {
  catalog: CalcDef[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Calculations" className="space-y-4">
      {CALC_CATEGORIES.filter((cat) => catalog.some((c) => c.category === cat)).map((cat) => (
        <div key={cat}>
          <p className="px-2 pb-1 font-mono text-xs uppercase tracking-wider text-faint">
            {CALC_CATEGORY_LABEL[cat]}
          </p>
          <ul className="space-y-0.5">
            {catalog.filter((c) => c.category === cat).map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-current={c.id === selectedId ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    c.id === selectedId
                      ? "bg-surface-2 text-primary"
                      : "text-secondary hover:bg-surface-2 hover:text-primary",
                  )}
                >
                  {c.safetyCritical && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-label="Safety-critical" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{c.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
