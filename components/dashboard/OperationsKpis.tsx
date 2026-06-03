"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useChrome } from "@/components/app/ChromeProvider";
import { navIcons, SparkleIcon } from "@/components/app/icons";
import type { AppIconKey } from "@/lib/appNav";
import { useScopeSummary, useAssets } from "@/lib/emissions/hooks";
import { useFlaringAssets } from "@/lib/flaring/hooks";
import { fmtNum } from "@/lib/emissions/labels";
import type { ScopeSummary } from "@/lib/emissions/types";

/**
 * OperationsKpis — section 2: the operator's own KPIs. Each card shows a LIVE backend
 * figure when it exists (so the dashboard updates the moment data lands — e.g. after a
 * copilot-confirmed emission write), and otherwise an INVITATION the copilot can fulfil —
 * never a dead "0.00". Methane intensity has no org-level metric yet, so it stays an
 * invitation until configured.
 */

type KpiView = {
  label: string;
  unit: string;
  icon: AppIconKey;
  href: string;
  seed: string;
  /** Live value, or null → render the invitation. */
  value: number | null;
  loading: boolean;
};

function sumScopes(s: ScopeSummary | undefined): number | null {
  if (!s) return null;
  const vals = [s.scope1.co2e, s.scope2.co2e, s.scope3.co2e].filter((v): v is number => v !== null);
  return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
}

export function OperationsKpis() {
  const { openCopilotWith } = useChrome();
  const scope = useScopeSummary({});
  const flaring = useFlaringAssets({});
  const assets = useAssets();

  const flaringTotal = (() => {
    const items = flaring.data?.items ?? [];
    const vals = items.map((a) => a.flaringVolume).filter((v): v is number => v != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) : null;
  })();
  const assetCount = assets.data?.items.length ?? 0;

  const kpis: KpiView[] = [
    {
      label: "Emissions",
      unit: scope.data?.scope1.unit ?? "tCO₂e",
      icon: "emissions",
      href: "/app/emissions",
      seed: "Help me add our emissions data so the dashboard reflects our operations.",
      value: sumScopes(scope.data),
      loading: scope.isLoading,
    },
    {
      label: "Flaring",
      unit: flaring.data?.items[0]?.volumeUnit ?? "Mscf",
      icon: "flaring",
      href: "/app/flaring",
      seed: "Set up flaring tracking for our assets so I can monitor it against NUPRC Tier-3.",
      value: flaringTotal,
      loading: flaring.isLoading,
    },
    {
      label: "Methane intensity",
      unit: "%",
      icon: "climate",
      href: "/app/flaring",
      seed: "Help me calculate our methane intensity from our production and emissions data.",
      value: null, // no org-level metric yet → invitation
      loading: false,
    },
    {
      label: "Assets",
      unit: "tracked",
      icon: "assets",
      href: "/app/assets",
      seed: "Help me add our asset hierarchy — fields, facilities and wells.",
      value: assetCount > 0 ? assetCount : null,
      loading: assets.isLoading,
    },
  ];

  return (
    <section aria-labelledby="ops-heading">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="ops-heading" className="text-lg font-semibold tracking-tight text-primary">
          Your operations
        </h2>
        <Link href="/app/data" className="text-sm text-accent underline-offset-2 hover:underline">
          Connect your data
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = navIcons[kpi.icon];
          return (
            <Card key={kpi.label} className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2 text-secondary">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2 text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-primary">{kpi.label}</span>
              </div>

              {kpi.loading ? (
                <div className="space-y-2">
                  <span className="sr-only">Loading {kpi.label}…</span>
                  <Skeleton className="h-8 w-24" />
                </div>
              ) : kpi.value !== null ? (
                <>
                  <div>
                    <p className="font-mono text-3xl font-semibold tabular-nums text-primary">
                      {fmtNum(kpi.value)}
                      <span className="ml-1 text-sm font-normal text-secondary">{kpi.unit}</span>
                    </p>
                  </div>
                  <Link
                    href={kpi.href}
                    className="mt-auto text-xs text-accent underline-offset-2 hover:underline"
                  >
                    View {kpi.label.toLowerCase()} →
                  </Link>
                </>
              ) : (
                <>
                  <div>
                    {/* Honest "no data yet" — never a fabricated 0.00. */}
                    <p className="font-mono text-3xl font-semibold text-grey-600" aria-hidden="true">
                      —
                    </p>
                    <p className="mt-0.5 text-xs text-faint">No data yet · {kpi.unit}</p>
                  </div>
                  <p className="text-xs leading-relaxed text-secondary">
                    Add your data — or ask the copilot to set it up.
                  </p>
                  <div className="mt-auto flex flex-col gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openCopilotWith(kpi.seed)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
                    >
                      <SparkleIcon className="h-4 w-4" />
                      Ask the copilot
                    </button>
                    <Link
                      href={kpi.href}
                      className="text-center text-xs text-secondary underline-offset-2 hover:text-primary hover:underline"
                    >
                      Add data manually
                    </Link>
                  </div>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
