"use client";

import { Banner } from "@/components/ui/Banner";
import type { IngestionStatus } from "@/lib/opportunities/types";
import { countryLabel } from "@/lib/opportunities/labels";

/**
 * IngestionGapNote — honest disclosure of regulators we don't yet ingest. The backend
 * reports gaps; we state them plainly rather than implying coverage we don't have, and invite
 * the user to flag an active round we should track. Renders nothing when there are no gaps.
 */
export function IngestionGapNote({
  ingestion,
  onAskCopilot,
}: {
  ingestion?: IngestionStatus;
  onAskCopilot: () => void;
}) {
  const gaps = ingestion?.gaps ?? [];
  if (gaps.length === 0) return null;

  return (
    <Banner variant="info" title="Coverage in progress">
      {gaps.map((g, i) => (
        <p key={`${g.regulator}-${i}`}>
          We’re not yet ingesting {g.regulator}
          {g.country ? ` (${countryLabel(g.country)})` : ""}.
          {g.note ? ` ${g.note}` : ""}
        </p>
      ))}
      <p className="mt-1">
        See an active round we should track?{" "}
        <button
          type="button"
          onClick={onAskCopilot}
          className="text-accent underline-offset-2 hover:underline"
        >
          Tell the copilot
        </button>
        .
      </p>
    </Banner>
  );
}
