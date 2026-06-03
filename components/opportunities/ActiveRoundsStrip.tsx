"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RoundCountdown } from "./RoundCountdown";
import { WatchButton } from "./WatchButton";
import { isActiveWithin, byDeadlineAsc } from "@/lib/opportunities/active";
import { countryLabel, roundTypeLabel, statusLabel, statusTone } from "@/lib/opportunities/labels";
import type { Round } from "@/lib/opportunities/types";

/** Window (days) that defines an "active" round for the strip. */
const ACTIVE_WINDOW_DAYS = 90;

/**
 * ActiveRoundsStrip — cards for rounds whose submission deadline is within 90 days, soonest
 * first, each with a live countdown and a Watch button. When none are active it shows a
 * friendly invitation (never "0") nudging the user to turn on alerts.
 */
export function ActiveRoundsStrip({
  rounds,
  onOpen,
  onAlerts,
}: {
  rounds: Round[];
  onOpen: (id: string) => void;
  onAlerts: () => void;
}) {
  const active = rounds.filter((r) => isActiveWithin(r, ACTIVE_WINDOW_DAYS)).sort(byDeadlineAsc);

  if (active.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border-strong bg-surface-1 p-5">
        <p className="text-sm text-secondary">
          No active rounds tracked right now. New rounds typically open every Q2/Q4 —{" "}
          <button
            type="button"
            onClick={onAlerts}
            className="text-accent underline-offset-2 hover:underline"
          >
            turn on alerts
          </button>{" "}
          to be notified.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Active rounds (deadline within 90 days)">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {active.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface-1 p-4 shadow-elev-1"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={() => onOpen(r.id)}
                  className="truncate text-left text-sm font-semibold text-primary hover:text-accent"
                >
                  {r.name}
                </button>
                <p className="mt-0.5 text-xs text-faint">
                  {countryLabel(r.country)} · {roundTypeLabel(r.type)}
                </p>
              </div>
              <Badge tone={statusTone(r.status)}>{statusLabel(r.status)}</Badge>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-secondary">
                {r.counts.blocks} {r.counts.blocks === 1 ? "block" : "blocks"}
              </span>
              <RoundCountdown deadline={r.submission_deadline} />
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => onOpen(r.id)}>
                View
              </Button>
              <WatchButton roundId={r.id} watched={r.watched} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
