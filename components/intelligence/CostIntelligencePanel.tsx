"use client";

import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { SparkleIcon } from "@/components/app/icons";
import { PanelStatus } from "./PanelStatus";
import { fmtNum } from "@/lib/emissions/labels";
import type { CostIntelligence, CostLine } from "@/lib/intelligence/types";

/**
 * CostIntelligencePanel — the user's own costs layered with public project costs and
 * (Expanding) West African benchmarks. Each sub-panel is stage-badged honestly. Empty user
 * costs = an invitation to connect, never a fabricated zero.
 */
export function CostIntelligencePanel({
  data,
  isLoading,
  isError,
  onConnect,
}: {
  data: CostIntelligence | undefined;
  isLoading: boolean;
  isError: boolean;
  onConnect: () => void;
}) {
  return (
    <section aria-labelledby="cost-heading" className="space-y-3">
      <h2 id="cost-heading" className="text-lg font-semibold tracking-tight text-primary">
        Cost intelligence
      </h2>

      {isLoading ? (
        <Card className="space-y-2">
          <span className="sr-only">Loading cost intelligence…</span>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-16 w-full" />
        </Card>
      ) : isError ? (
        <Card>
          <p className="text-sm text-secondary">Couldn’t load cost intelligence.</p>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Your costs */}
          <Card className="space-y-3">
            <Header title="Your costs" kind={data && data.userCosts.length > 0 ? "live" : "connect"} />
            {data && data.userCosts.length > 0 ? (
              <CostList lines={data.userCosts} currency={data.currency} />
            ) : (
              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-secondary">
                  Connect your cost data to compare against public benchmarks — or ask the copilot.
                </p>
                <button
                  type="button"
                  onClick={onConnect}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-surface-2"
                >
                  <SparkleIcon className="h-4 w-4 text-accent" />
                  Ask the copilot
                </button>
              </div>
            )}
          </Card>

          {/* Public project costs */}
          <Card className="space-y-3">
            <Header title="Public project costs" kind="live" />
            {data && data.publicCosts.length > 0 ? (
              <CostList lines={data.publicCosts} currency={data.currency} />
            ) : (
              <p className="text-sm text-faint">No public project costs available yet.</p>
            )}
          </Card>

          {/* West African benchmarks — Expanding */}
          <Card className="space-y-3">
            <Header title="West African benchmarks" kind="expanding" />
            {data && data.benchmarksExpanding.items.length > 0 ? (
              <CostList lines={data.benchmarksExpanding.items} currency={data.currency} />
            ) : (
              <p className="text-sm text-faint">
                {data?.benchmarksExpanding.note ?? "West African cost benchmarks are still building."}
              </p>
            )}
          </Card>
        </div>
      )}
    </section>
  );
}

function Header({ title, kind }: { title: string; kind: "live" | "connect" | "expanding" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      <PanelStatus kind={kind} />
    </div>
  );
}

function CostList({ lines, currency }: { lines: CostLine[]; currency?: string }) {
  return (
    <ul className="space-y-1.5">
      {lines.map((l, i) => (
        <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-secondary">{l.label}</span>
          <span className="font-mono tabular-nums text-primary">
            {l.value === null ? "—" : `${currency ? `${currency} ` : ""}${fmtNum(l.value)} ${l.unit}`}
          </span>
        </li>
      ))}
    </ul>
  );
}
