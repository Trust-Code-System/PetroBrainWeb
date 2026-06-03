"use client";

import { Button } from "@/components/ui/Button";
import { SparkleIcon } from "@/components/app/icons";
import { fmtDate } from "@/lib/opportunities/labels";

/**
 * OpportunitiesEmptyState — carries the "never empty" promise. Even before any backend data
 * (e.g. the ingestion service isn't wired yet, so the list comes back empty), the page still
 * explains what's tracked, the planned regulator coverage, and invites the copilot — never a
 * dead blank. If the backend reports a scheduled first ingestion, we say when it arrives.
 */
export function OpportunitiesEmptyState({
  nextIngestionAt,
  onAsk,
  onAlerts,
}: {
  nextIngestionAt?: string;
  onAsk: () => void;
  onAlerts: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border-strong bg-surface-1 p-10 text-center">
      <div className="mx-auto max-w-xl space-y-3">
        <h2 className="text-lg font-semibold text-primary">No rounds to show yet</h2>
        <p className="text-sm leading-relaxed text-secondary">
          This is where you’ll discover and track oil &amp; gas{" "}
          <strong className="text-primary">licensing rounds</strong> and{" "}
          <strong className="text-primary">marginal-field rounds</strong> across West Africa —
          deadlines, blocks on offer, official documents, and changes — curated from public
          regulator sources. We track NUPRC (Nigeria) first, expanding to Ghana, Senegal, Côte
          d’Ivoire, Angola and more.
        </p>
        {nextIngestionAt && (
          <p className="text-sm text-secondary">
            First data is scheduled to arrive around{" "}
            <span className="font-medium text-primary">{fmtDate(nextIngestionAt)}</span>.
          </p>
        )}
        <p className="text-xs text-faint">
          PetroBrain only shows rounds it can verify from a public source — it never invents a
          round, a date, or a fiscal term.
        </p>
        <div className="flex flex-col items-center justify-center gap-2 pt-1 sm:flex-row">
          <Button variant="secondary" onClick={onAlerts}>
            Set up alerts
          </Button>
          <Button variant="ghost" onClick={onAsk}>
            <SparkleIcon className="h-4 w-4 text-accent" />
            Ask the copilot
          </Button>
        </div>
      </div>
    </div>
  );
}
