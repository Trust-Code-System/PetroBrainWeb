"use client";

import type { CalcResult } from "@/lib/calc/types";

/**
 * RecentCalcs — recent engine results from the local cache. Clicking one re-opens it.
 * Honest empty state rather than a blank panel.
 */
export function RecentCalcs({
  items,
  onSelect,
}: {
  items: CalcResult[];
  onSelect: (result: CalcResult) => void;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs uppercase tracking-wider text-faint">Recent</p>
      {items.length === 0 ? (
        <p className="text-sm text-faint">Your recent calculations appear here.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((r, i) => {
            const primary = r.results[0];
            return (
              <li key={`${r.calcId}-${r.computedAt ?? i}`}>
                <button
                  type="button"
                  onClick={() => onSelect(r)}
                  className="w-full rounded-md border border-border-subtle bg-surface-1 px-3 py-2 text-left transition-colors hover:bg-surface-2"
                >
                  <span className="block truncate text-sm font-medium text-primary">{r.name}</span>
                  {primary && (
                    <span className="block truncate font-mono text-xs text-secondary">
                      {primary.label}: {typeof primary.value === "number" ? primary.value : primary.value}
                      {primary.unit ? ` ${primary.unit}` : ""}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
