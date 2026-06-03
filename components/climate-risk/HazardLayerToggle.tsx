"use client";

import { cn } from "@/lib/cn";
import { HAZARDS, HAZARD_LABEL } from "@/lib/climate-risk/labels";
import { HAZARD_TILE_URL } from "@/lib/climate-risk/client";
import type { Hazard } from "@/lib/climate-risk/types";

/**
 * HazardLayerToggle — pick a hazard overlay (flood/heat/coastal/erosion) or none. Layers
 * with no configured tile source are still selectable but the map shows "layer source not
 * connected" — we never fake an overlay.
 */
export function HazardLayerToggle({
  active,
  onChange,
}: {
  active: Hazard | null;
  onChange: (h: Hazard | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-secondary">Hazard layer:</span>
      <div className="inline-flex flex-wrap gap-1 rounded-md border border-border-subtle bg-surface-1 p-1">
        <Chip label="None" active={active === null} onClick={() => onChange(null)} />
        {HAZARDS.map((h) => (
          <Chip
            key={h}
            label={HAZARD_LABEL[h]}
            connected={Boolean(HAZARD_TILE_URL[h])}
            active={active === h}
            onClick={() => onChange(h)}
          />
        ))}
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  connected,
  onClick,
}: {
  label: string;
  active: boolean;
  connected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm transition-colors",
        active ? "bg-accent text-accent-contrast" : "text-secondary hover:bg-surface-2 hover:text-primary",
      )}
    >
      {label}
      {connected === false && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-accent-contrast/50" : "bg-grey-600")}
          title="No tile source connected"
          aria-label="No tile source connected"
        />
      )}
    </button>
  );
}
