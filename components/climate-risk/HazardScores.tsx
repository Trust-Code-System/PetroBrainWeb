"use client";

import { Badge } from "@/components/ui/Badge";
import { HAZARDS, HAZARD_LABEL, bandTone } from "@/lib/climate-risk/labels";
import type { Hazard, HazardScore } from "@/lib/climate-risk/types";

/**
 * HazardScores — the four hazard tiles (flood/heat/coastal/erosion) with score, band and a
 * modeled-vs-observed label. Shared by the asset detail and the site-selection readout.
 * Unassessed hazards say so — never a fabricated zero.
 */
export function HazardScores({ hazards }: { hazards: Partial<Record<Hazard, HazardScore>> }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {HAZARDS.map((h) => {
        const s = hazards[h];
        return (
          <div key={h} className="rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5">
            <div className="flex items-center justify-between gap-1">
              <p className="text-xs text-faint">{HAZARD_LABEL[h]}</p>
              {s?.basis && (
                <span className="font-mono text-[0.6rem] uppercase tracking-wider text-faint">
                  {s.basis}
                </span>
              )}
            </div>
            {s && s.score !== null ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-lg font-semibold tabular-nums text-primary">
                  {s.score}
                </span>
                {s.band && <Badge tone={bandTone(s.band)}>{s.band}</Badge>}
              </div>
            ) : (
              <p className="mt-1 text-sm text-faint">Not assessed</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
