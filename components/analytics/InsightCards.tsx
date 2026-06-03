"use client";

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { SparkleIcon } from "@/components/app/icons";
import { cn } from "@/lib/cn";
import type { InsightCard, InsightsResponse } from "@/lib/analytics/types";

/**
 * InsightCards — AI-generated insight cards ("Scope 3 is your highest contributor — here's
 * why"), produced by the copilot server-side from the actual data. CLEARLY marked
 * AI-generated + decision-support, never presented as ground truth. Empty → invite the
 * copilot to dig in.
 */
export function InsightCards({
  data,
  isLoading,
  isError,
  onAsk,
}: {
  data: InsightsResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  onAsk: () => void;
}) {
  return (
    <section aria-labelledby="insights-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 id="insights-heading" className="text-lg font-semibold tracking-tight text-primary">
            AI insights
          </h2>
          <Badge tone="accent" dot>
            AI-generated
          </Badge>
        </div>
        <button
          type="button"
          onClick={onAsk}
          className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-surface-2"
        >
          <SparkleIcon className="h-4 w-4 text-accent" />
          Ask the copilot
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <p className="text-sm text-secondary">Couldn’t generate insights right now.</p>
        </Card>
      ) : !data || data.items.length === 0 ? (
        <Card>
          <p className="text-sm leading-relaxed text-secondary">
            No AI insights yet. Once there’s data in range, the copilot surfaces what’s driving
            your emissions here — or ask it directly.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((card) => (
              <InsightCardItem key={card.id} card={card} />
            ))}
          </div>
          <p className="text-xs text-faint">
            AI-generated from your data — decision-support only. Verify against the figures above
            before acting.
          </p>
        </>
      )}
    </section>
  );
}

function InsightCardItem({ card }: { card: InsightCard }) {
  const tone =
    card.severity === "warn"
      ? "border-warn/40"
      : card.severity === "positive"
        ? "border-safe/40"
        : "border-border-subtle";
  return (
    <div className={cn("rounded-lg border bg-surface-1 p-4", tone)}>
      <div className="mb-1.5 flex items-center gap-1.5">
        <SparkleIcon className="h-3.5 w-3.5 text-accent" />
        <p className="text-sm font-semibold text-primary">{card.title}</p>
      </div>
      <p className="text-sm leading-relaxed text-secondary">{card.body}</p>
    </div>
  );
}
