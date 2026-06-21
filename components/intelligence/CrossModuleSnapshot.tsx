"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { navIcons } from "@/components/app/icons";
import type { AppIconKey } from "@/lib/appNav";
import { actionCounts, useActions } from "@/lib/actions/store";
import { useHseRecords } from "@/lib/hse/store";
import { useOpsLogs } from "@/lib/operations/store";
import { obligationCounts, readinessScore, useObligations } from "@/lib/compliance/store";
import { permitCounts, usePermits } from "@/lib/permits/store";
import { auditReadiness, evidenceCounts, useEvidence } from "@/lib/audit/store";

/**
 * CrossModuleSnapshot — the live business-intelligence overview for the Analytics & Reports hub.
 * Reads every local-first module store and surfaces the cross-module figures a management report
 * is built from (open actions, overdue, HSE, ops issues, compliance findings, expiring documents)
 * plus two readiness scores. These are real counts from the on-device modules — 0 is a truthful
 * count, and the readiness cards stay "—" until there's something to score. Swaps to backend
 * figures when the module APIs land (same component API).
 */

type Tile = {
  label: string;
  icon: AppIconKey;
  href: string;
  value: number;
  emphasis?: "danger" | "warn";
  hint: string;
};

export function CrossModuleSnapshot() {
  const actions = useActions();
  const hse = useHseRecords();
  const ops = useOpsLogs();
  const obligations = useObligations();
  const permits = usePermits();
  const evidence = useEvidence();

  const { tiles, complianceReadiness, audit } = useMemo(() => {
    const ac = actionCounts(actions);
    const oc = obligationCounts(obligations);
    const pc = permitCounts(permits);
    const ec = evidenceCounts(evidence);
    const openHse = hse.filter((r) => r.status !== "closed").length;
    const openOps = ops.filter((e) => e.status !== "closed").length;

    const tiles: Tile[] = [
      {
        label: "Open actions",
        icon: "actions",
        href: "/app/operations/actions",
        value: ac.open + ac.inProgress,
        hint: "Across all modules",
      },
      {
        label: "Overdue actions",
        icon: "actions",
        href: "/app/operations/actions",
        value: ac.overdue,
        emphasis: "danger",
        hint: "Past their due date",
      },
      {
        label: "Open HSE reports",
        icon: "hse",
        href: "/app/operations/hse",
        value: openHse,
        hint: "Incidents / observations",
      },
      {
        label: "Open ops issues",
        icon: "operations-log",
        href: "/app/operations/logs",
        value: openOps,
        hint: "From the operations log",
      },
      {
        label: "Compliance findings",
        icon: "compliance",
        href: "/app/compliance/guardian",
        value: oc.openFindings,
        emphasis: "danger",
        hint: "Obligations at risk or unmet",
      },
      {
        label: "Expiring documents",
        icon: "permits",
        href: "/app/compliance/permits",
        value: pc.expiringSoon + pc.expired,
        emphasis: "warn",
        hint: "Permits & certificates",
      },
    ];

    return {
      tiles,
      complianceReadiness: readinessScore(obligations),
      audit: { score: auditReadiness(evidence), openGaps: ec.openGaps },
    };
  }, [actions, hse, ops, obligations, permits, evidence]);

  return (
    <section aria-labelledby="snapshot-heading" className="space-y-4">
      <div>
        <h2 id="snapshot-heading" className="text-lg font-semibold tracking-tight text-primary">
          Cross-module snapshot
        </h2>
        <p className="mt-0.5 text-sm text-secondary">
          The live figures a management report is built from — drawn across operations, HSE and
          compliance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {tiles.map((t) => {
          const Icon = navIcons[t.icon];
          const nonZero = t.value > 0;
          return (
            <Card key={t.label} href={t.href} className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2 text-secondary">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-primary">{t.label}</span>
              </div>
              <p
                className={cn(
                  "font-mono text-2xl font-semibold tabular-nums",
                  !nonZero
                    ? "text-grey-600"
                    : t.emphasis === "danger"
                      ? "text-danger"
                      : t.emphasis === "warn"
                        ? "text-warn"
                        : "text-primary",
                )}
              >
                {t.value}
              </p>
              <p className="text-xs text-faint">{t.hint}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ReadinessCard
          title="Compliance readiness"
          hint="Met & evidenced, of in-scope obligations"
          score={complianceReadiness}
          href="/app/compliance/guardian"
        />
        <ReadinessCard
          title="Audit readiness"
          hint={`Evidence collected${audit.openGaps > 0 ? ` · ${audit.openGaps} open gap(s)` : ""}`}
          score={audit.score}
          href="/app/compliance/audit-evidence"
        />
      </div>

      <p className="text-xs text-faint">
        Figures are live from the on-device modules until the reporting backend is connected. The
        copilot can turn this snapshot into an editable, exportable report below.
      </p>
    </section>
  );
}

function ReadinessCard({
  title,
  hint,
  score,
  href,
}: {
  title: string;
  hint: string;
  score: number | null;
  href: string;
}) {
  return (
    <Card href={href} className="flex flex-col gap-2 p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-primary">{title}</p>
        {score !== null && (
          <span
            className={cn(
              "font-mono text-2xl font-semibold tabular-nums",
              score >= 80 ? "text-safe" : score >= 50 ? "text-warn" : "text-danger",
            )}
          >
            {score}%
          </span>
        )}
      </div>
      {score === null ? (
        <p className="font-mono text-2xl font-semibold text-grey-600">—</p>
      ) : (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className={cn(
              "h-full rounded-full",
              score >= 80 ? "bg-safe" : score >= 50 ? "bg-warn" : "bg-danger",
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
      <p className="text-xs text-faint">{hint}</p>
    </Card>
  );
}
