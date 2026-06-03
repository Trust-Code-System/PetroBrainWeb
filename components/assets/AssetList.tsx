"use client";

import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";
import { ASSET_TYPE_COLOR, assetTypeLabel } from "@/lib/assets/labels";
import type { AssetSummary } from "@/lib/assets/types";

/**
 * AssetList — selectable list of assets (presentational). A type-coloured dot ties each
 * row to its map marker. Selecting a row drives the detail panel + page context.
 */
export function AssetList({
  assets,
  selectedId,
  onSelect,
  isLoading,
  isError,
}: {
  assets: AssetSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-2" aria-busy="true">
        <span className="sr-only">Loading assets…</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="p-4 text-sm text-secondary">Couldn’t load assets. Please try again.</p>;
  }

  if (assets.length === 0) {
    return <p className="p-4 text-sm text-secondary">No assets match these filters.</p>;
  }

  return (
    <ul className="divide-y divide-border-subtle">
      {assets.map((a) => (
        <li key={a.id}>
          <button
            type="button"
            onClick={() => onSelect(a.id)}
            aria-current={a.id === selectedId ? "true" : undefined}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-2",
              a.id === selectedId && "bg-surface-2",
            )}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: ASSET_TYPE_COLOR[a.type] }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-primary">{a.name}</span>
              <span className="block truncate text-xs text-faint">
                {assetTypeLabel(a.type)}
                {a.operator ? ` · ${a.operator}` : ""}
                {a.lat === null || a.lon === null ? " · no location" : ""}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
