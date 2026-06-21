"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { navIcons } from "@/components/app/icons";
import type { AppIconKey } from "@/lib/appNav";
import { actionCounts, useActions } from "@/lib/actions/store";
import { permitCounts, usePermits } from "@/lib/permits/store";
import { obligationCounts, useObligations } from "@/lib/compliance/store";

/**
 * CommandKpis — the Command Center's cross-module operational status row.
 *
 * Open HSE actions / Overdue actions / Maintenance issues read LIVE from the Action Tracker
 * store (device-local for now), so creating or closing an action here updates the dashboard
 * instantly. Expiring documents stays an honest "no data yet" until a permit exists; Open
 * findings likewise stays null until the first compliance obligation is registered — never a
 * fabricated count. See PETROBRAIN_REBUILD_TODO.md.
 */

type CommandKpi = {
  label: string;
  icon: AppIconKey;
  href: string;
  /** Live count, or null → honest "no data yet" invitation. */
  value: number | null;
  emphasis?: "danger" | "warn";
  hint: string;
};

export function CommandKpis() {
  const actions = useActions();
  const permits = usePermits();
  const obligations = useObligations();

  const kpis: CommandKpi[] = useMemo(() => {
    const counts = actionCounts(actions);
    const permits_ = permitCounts(permits);
    const obligations_ = obligationCounts(obligations);
    const expiringDocs = permits_.expiringSoon + permits_.expired;
    const openHse = actions.filter(
      (a) => a.sourceModule === "hse" && a.status !== "closed" && a.status !== "cancelled",
    ).length;
    const openMaintenance = actions.filter(
      (a) => a.sourceModule === "maintenance" && a.status !== "closed" && a.status !== "cancelled",
    ).length;
    return [
      {
        label: "Open HSE actions",
        icon: "hse",
        href: "/app/operations/hse",
        value: openHse,
        hint: "Corrective actions",
      },
      {
        label: "Overdue actions",
        icon: "actions",
        href: "/app/operations/actions",
        value: counts.overdue,
        emphasis: "danger",
        hint: "Past their due date",
      },
      {
        label: "Expiring documents",
        icon: "permits",
        href: "/app/compliance/permits",
        value: permits.length > 0 ? expiringDocs : null,
        emphasis: "warn",
        hint: "Permits & certificates",
      },
      {
        label: "Open findings",
        icon: "compliance",
        href: "/app/compliance/guardian",
        value: obligations.length > 0 ? obligations_.openFindings : null,
        emphasis: "danger",
        hint: "Obligations at risk or unmet",
      },
      {
        label: "Maintenance issues",
        icon: "maintenance",
        href: "/app/assets",
        value: openMaintenance,
        hint: "Open equipment actions",
      },
    ];
  }, [actions, permits, obligations]);

  return (
    <section aria-labelledby="command-kpis-heading">
      <h2
        id="command-kpis-heading"
        className="mb-3 text-lg font-semibold tracking-tight text-primary"
      >
        Operational status
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = navIcons[kpi.icon];
          const hasValue = kpi.value !== null;
          const nonZero = hasValue && (kpi.value as number) > 0;
          return (
            <Card key={kpi.label} href={kpi.href} className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2 text-secondary">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2 text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-primary">{kpi.label}</span>
              </div>

              {hasValue ? (
                <div>
                  <p
                    className={cn(
                      "font-mono text-3xl font-semibold tabular-nums",
                      !nonZero
                        ? "text-grey-600"
                        : kpi.emphasis === "danger"
                          ? "text-danger"
                          : kpi.emphasis === "warn"
                            ? "text-warn"
                            : "text-primary",
                    )}
                  >
                    {kpi.value}
                  </p>
                  <p className="mt-0.5 text-xs text-faint">{kpi.hint}</p>
                </div>
              ) : (
                <div>
                  <p className="font-mono text-3xl font-semibold text-grey-600" aria-hidden="true">
                    —
                  </p>
                  <p className="mt-0.5 text-xs text-faint">No data yet · {kpi.hint}</p>
                </div>
              )}

              <span className="mt-auto text-xs text-accent">
                {nonZero ? "View →" : "Open →"}
              </span>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
