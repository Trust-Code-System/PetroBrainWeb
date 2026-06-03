"use client";

import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { bandColor, bandTone } from "@/lib/climate-risk/labels";
import type { AssetRisk } from "@/lib/climate-risk/types";

/**
 * AssetRiskList — assets ranked by risk, with a band-coloured dot tying each row to its map
 * marker. Selecting a row drives the detail panel + copilot page context.
 */
export function AssetRiskList({
  assets,
  selectedId,
  onSelect,
  isLoading,
  isError,
}: {
  assets: AssetRisk[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  isError: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-2" aria-busy="true">
        <span className="sr-only">Loading climate risk…</span>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  if (isError) {
    return <p className="p-4 text-sm text-secondary">Couldn’t load climate risk. Please try again.</p>;
  }
  if (assets.length === 0) {
    return (
      <p className="p-4 text-sm text-secondary">
        No assets to assess yet. Add assets in the registry, then climate risk appears here.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border-subtle">
      {assets.map((a) => (
        <li key={a.assetId}>
          <button
            type="button"
            onClick={() => onSelect(a.assetId)}
            aria-current={a.assetId === selectedId ? "true" : undefined}
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-2",
              a.assetId === selectedId && "bg-surface-2",
            )}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: bandColor(a.band) }}
              aria-hidden="true"
            />
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-primary">{a.name}</span>
            <Badge tone={bandTone(a.band)}>{a.band ?? "Unscored"}</Badge>
          </button>
        </li>
      ))}
    </ul>
  );
}
