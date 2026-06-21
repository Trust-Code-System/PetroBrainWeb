"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";
import { navIcons, SparkleIcon } from "@/components/app/icons";
import { useChrome } from "@/components/app/ChromeProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { ActionFormDialog } from "@/components/operations/ActionFormDialog";
import { createAction, deleteAction, isOverdue, useActions } from "@/lib/actions/store";
import { useAssets } from "@/lib/emissions/hooks";
import type { ActionItem, CreateActionInput } from "@/lib/actions/types";

/**
 * MaintenanceSnapshot — the live widget that makes /app/assets the merged "Maintenance & Assets"
 * hub: it pairs the asset registry below with a maintenance summary and a quick calculations
 * entry, the same way the Intelligence hubs lead with a live widget. Asset count is the live
 * backend figure (honest "—" until data lands); open/overdue maintenance actions are real counts
 * from the on-device Action Tracker (filtered to the maintenance source); the calc tile links into
 * the deterministic engine. "Log maintenance action" reuses the Action Tracker's own form, so the
 * button genuinely works (toast + undo) rather than being decorative.
 */
export function MaintenanceSnapshot() {
  const { openCopilotWith } = useChrome();
  const { show } = useToast();
  const assets = useAssets();
  const actions = useActions();
  const [logOpen, setLogOpen] = useState(false);

  const { assetCount, openMaint, overdueMaint } = useMemo(() => {
    const maint = actions.filter((a) => a.sourceModule === "maintenance");
    const open = maint.filter((a) => a.status !== "closed" && a.status !== "cancelled");
    return {
      assetCount: assets.data?.items?.length ?? 0,
      openMaint: open.length,
      overdueMaint: open.filter((a) => isOverdue(a)).length,
    };
  }, [actions, assets.data]);

  function handleLog(input: CreateActionInput) {
    const created = createAction(input);
    setLogOpen(false);
    show({
      message: "Maintenance action added to the tracker",
      tone: "success",
      undo: () => deleteAction(created.id),
    });
  }

  const AssetIcon = navIcons.assets;
  const MaintIcon = navIcons.maintenance;
  const CalcIcon = navIcons.calc;

  return (
    <section aria-labelledby="maint-heading" className="mb-8 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="maint-heading" className="text-lg font-semibold tracking-tight text-primary">
            Maintenance & Assets
          </h2>
          <p className="mt-0.5 text-sm text-secondary">
            Your registry at a glance, the open maintenance work it has raised, and a shortcut into
            the engineering calculators.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLogOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
        >
          Log maintenance action
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Assets — live backend count (we're already on the registry page, so no link). */}
        <Card className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-secondary">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-accent">
              <AssetIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-primary">Assets tracked</span>
          </div>
          {assets.isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p
              className={cn(
                "font-mono text-2xl font-semibold tabular-nums",
                assetCount > 0 ? "text-primary" : "text-grey-600",
              )}
            >
              {assetCount > 0 ? assetCount : "—"}
            </p>
          )}
          <p className="text-xs text-faint">
            {assetCount > 0 ? "In the registry below" : "Add assets in the registry below"}
          </p>
        </Card>

        {/* Open maintenance actions — live from the Action Tracker (maintenance source). */}
        <Card href="/app/operations/actions" className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-secondary">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-accent">
              <MaintIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-primary">Open maintenance actions</span>
          </div>
          <p
            className={cn(
              "font-mono text-2xl font-semibold tabular-nums",
              openMaint > 0 ? "text-primary" : "text-grey-600",
            )}
          >
            {openMaint}
          </p>
          <p className="text-xs text-faint">
            {overdueMaint > 0 ? (
              <span className="text-danger">{overdueMaint} overdue</span>
            ) : (
              "Tracked in the Action Tracker"
            )}
          </p>
        </Card>

        {/* Quick calc entry — into the deterministic engine. */}
        <Card href="/app/calc" className="flex flex-col gap-2 p-4">
          <div className="flex items-center gap-2 text-secondary">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-surface-2 text-accent">
              <CalcIcon className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-primary">Calculations</span>
          </div>
          <p className="text-sm leading-relaxed text-secondary">
            Drilling, well-control, production and unit conversions — auditable, with every step
            shown.
          </p>
          <span className="mt-auto pt-1 text-xs text-accent">Open calculators →</span>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() =>
            openCopilotWith(
              "Review our asset registry and open maintenance actions, and flag anything overdue or high-risk.",
            )
          }
          className="inline-flex items-center gap-2 text-sm text-accent underline-offset-2 hover:underline"
        >
          <SparkleIcon className="h-4 w-4" />
          Ask the copilot about maintenance
        </button>
        <Link
          href="/app/calc"
          className="text-sm text-secondary underline-offset-2 hover:text-primary hover:underline"
        >
          Run a calculation →
        </Link>
      </div>

      {logOpen && (
        <ActionFormDialog
          open
          mode="create"
          initial={maintenanceDraft()}
          onClose={() => setLogOpen(false)}
          onSubmit={handleLog}
        />
      )}
    </section>
  );
}

/** A blank Action Tracker draft pre-tagged to the maintenance source. */
function maintenanceDraft(): ActionItem {
  return {
    id: "",
    title: "",
    description: "",
    sourceModule: "maintenance",
    sourceRef: "",
    department: "Maintenance",
    owner: "",
    dueDate: "",
    priority: "medium",
    status: "open",
    riskLevel: undefined,
    notes: "",
    createdAt: 0,
    updatedAt: 0,
  };
}
