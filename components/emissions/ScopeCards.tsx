"use client";

import { Card } from "@/components/ui/Card";
import { StageBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { fmtNum } from "@/lib/emissions/labels";
import type { ScopeFigure, ScopeSummary } from "@/lib/emissions/types";

/**
 * ScopeCards — Scope 1 / 2 / 3 KPI cards. All figures come from the backend engine.
 * A null figure renders an honest "Not yet computed" (never a fabricated 0.00). Scope 1
 * is live in the engine; Scope 2/3 are labelled by stage when the backend hasn't computed
 * them yet.
 */
export function ScopeCards({
  summary,
  isLoading,
  isError,
}: {
  summary: ScopeSummary | undefined;
  isLoading: boolean;
  isError: boolean;
}) {
  const cards: { key: keyof Pick<ScopeSummary, "scope1" | "scope2" | "scope3">; label: string; figure?: ScopeFigure }[] = [
    { key: "scope1", label: "Scope 1 — Direct", figure: summary?.scope1 },
    { key: "scope2", label: "Scope 2 — Purchased energy", figure: summary?.scope2 },
    { key: "scope3", label: "Scope 3 — Value chain", figure: summary?.scope3 },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <Card key={c.key} className="p-5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-primary">{c.label}</p>
            <ScopeStage scopeKey={c.key} figure={c.figure} loading={isLoading} />
          </div>

          {isLoading ? (
            <div className="mt-3 space-y-2">
              <span className="sr-only">Loading…</span>
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          ) : isError ? (
            <p className="mt-3 text-sm text-faint">Couldn’t load this figure.</p>
          ) : (
            <Figure figure={c.figure} />
          )}

          {summary?.basis && !isLoading && !isError && (
            <p className="mt-3 border-t border-border-subtle pt-2 text-xs text-faint">
              {summary.basis}
            </p>
          )}
        </Card>
      ))}
    </div>
  );
}

function Figure({ figure }: { figure?: ScopeFigure }) {
  if (!figure || figure.co2e === null) {
    return (
      <div className="mt-2">
        <p className="font-mono text-3xl font-semibold text-grey-600" aria-hidden="true">
          —
        </p>
        <p className="mt-0.5 text-xs text-faint">{figure?.note ?? "Not yet computed"}</p>
      </div>
    );
  }
  return (
    <div className="mt-2">
      <p className="font-mono text-3xl font-semibold tabular-nums text-primary">
        {fmtNum(figure.co2e)}
        <span className="ml-1 text-sm font-normal text-secondary">{figure.unit}</span>
      </p>
      {figure.note && <p className="mt-0.5 text-xs text-faint">{figure.note}</p>}
    </div>
  );
}

function ScopeStage({
  scopeKey,
  figure,
  loading,
}: {
  scopeKey: "scope1" | "scope2" | "scope3";
  figure?: ScopeFigure;
  loading: boolean;
}) {
  if (loading) return null;
  // Scope 1 is live in the engine; 2/3 are "expanding" until the backend computes them.
  if (scopeKey === "scope1") return <StageBadge stage="live" />;
  const computed = figure && figure.co2e !== null;
  return computed ? <StageBadge stage="live" /> : <StageBadge stage="expanding" />;
}
