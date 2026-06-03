"use client";

import { SparkleIcon } from "@/components/app/icons";

/**
 * CrossDomainCard — the headline cross-domain feature, made real: one prominent entry
 * point that pre-seeds the copilot to reason over the live market data on this page AND
 * the user's asset economics. The reasoning happens in the backend orchestrator (over the
 * page context + asset tools), not here.
 */
export function CrossDomainCard({
  brent,
  onAsk,
}: {
  brent: number | null;
  onAsk: () => void;
}) {
  return (
    <section
      aria-label="Cross-domain reasoning"
      className="rounded-lg border border-accent/30 bg-accent-muted p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
            <SparkleIcon className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-primary">
              Which of my fields go cash-negative at today’s Brent?
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-secondary">
              The copilot reasons over{" "}
              {brent !== null ? (
                <>today’s Brent (<span className="font-mono text-primary">${brent.toFixed(2)}/bbl</span>)</>
              ) : (
                "today’s market"
              )}{" "}
              and your asset economics — and tells you what it can’t see.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAsk}
          className="shrink-0 self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover sm:self-auto"
        >
          Ask the copilot
        </button>
      </div>
    </section>
  );
}
