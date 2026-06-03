"use client";

import Link from "next/link";
import { Banner } from "@/components/ui/Banner";
import { Skeleton } from "@/components/ui/Skeleton";
import { useChrome } from "@/components/app/ChromeProvider";
import { useRegisterPageContext } from "@/components/copilot/PageContextProvider";
import { RoundDetail } from "./RoundDetail";
import { useRound } from "@/lib/opportunities/hooks";
import { buildRoundSeed } from "@/lib/opportunities/seed";
import { countryLabel, statusLabel } from "@/lib/opportunities/labels";
import type { Round } from "@/lib/opportunities/types";

/**
 * RoundDetailRoute — full-page detail at /app/opportunities/[id] (deep-linkable, e.g. from a
 * notification). Renders the same RoundDetail as the list drawer, fetched by id, and registers
 * the round as copilot page context so "ask about this round" reasons over exactly what's shown.
 */
export function RoundDetailRoute({ id }: { id: string }) {
  const { openCopilotWith } = useChrome();
  const { data: round, isLoading, isError } = useRound(id);

  useRegisterPageContext({
    selectedEntityId: id,
    visibleRecords: round
      ? [{ id: round.id, summary: `${round.name} · ${countryLabel(round.country)} · ${statusLabel(round.status)}` }]
      : [],
    data: round ? { selectedRound: round } : undefined,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/app/opportunities"
        className="mb-4 inline-flex items-center gap-1 text-sm text-secondary hover:text-primary"
      >
        <span aria-hidden="true">←</span> All rounds
      </Link>

      {isLoading ? (
        <div className="space-y-3" aria-busy="true">
          <span className="sr-only">Loading round…</span>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : isError || !round ? (
        <Banner variant="danger" title="Couldn’t load this round">
          It may not exist yet, or the rounds service isn’t connected. Go back to{" "}
          <Link href="/app/opportunities" className="text-accent underline-offset-2 hover:underline">
            all rounds
          </Link>
          .
        </Banner>
      ) : (
        <RoundDetail round={round} onAskCopilot={(r: Round) => openCopilotWith(buildRoundSeed(r))} />
      )}
    </div>
  );
}
