"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { PlusIcon, navIcons } from "@/components/app/icons";
import { ActionFormDialog } from "@/components/operations/ActionFormDialog";
import {
  actionCounts,
  createAction,
  deleteAction,
  isOverdue,
  todayISO,
  updateAction,
  useActions,
} from "@/lib/actions/store";
import {
  MODULE_LABEL,
  PRIORITY_LABEL,
  PRIORITY_TONE,
  STATUS_LABEL,
  STATUS_TONE,
} from "@/lib/actions/labels";
import type { ActionItem, CreateActionInput } from "@/lib/actions/types";

type Filter = "all" | "open" | "in_progress" | "waiting_approval" | "overdue" | "closed";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "waiting_approval", label: "Waiting Approval" },
  { key: "overdue", label: "Overdue" },
  { key: "closed", label: "Closed" },
];

export function ActionTrackerWorkspace() {
  const actions = useActions();
  const today = todayISO();
  const counts = useMemo(() => actionCounts(actions, today), [actions, today]);

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; item?: ActionItem } | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return actions
      .filter((a) => {
        if (filter === "overdue") return isOverdue(a, today);
        if (filter !== "all" && a.status !== filter) return false;
        return true;
      })
      .filter((a) => {
        if (!q) return true;
        return (
          a.title.toLowerCase().includes(q) ||
          (a.owner ?? "").toLowerCase().includes(q) ||
          (a.sourceRef ?? "").toLowerCase().includes(q) ||
          (a.department ?? "").toLowerCase().includes(q)
        );
      })
      .sort(byUrgency(today));
  }, [actions, filter, query, today]);

  function handleSubmit(input: CreateActionInput) {
    if (dialog?.mode === "edit" && dialog.item) updateAction(dialog.item.id, input);
    else createAction(input);
    setDialog(null);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Action Tracker"
        description="Every important task — from HSE, compliance, maintenance, documents and operations — tracked to closure."
        actions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon className="h-4 w-4" />
            New action
          </Button>
        }
      />

      {/* Count chips */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <CountCard label="Total" value={counts.total} onClick={() => setFilter("all")} active={filter === "all"} />
        <CountCard label="Open" value={counts.open} onClick={() => setFilter("open")} active={filter === "open"} />
        <CountCard label="In Progress" value={counts.inProgress} onClick={() => setFilter("in_progress")} active={filter === "in_progress"} />
        <CountCard label="Awaiting" value={counts.waitingApproval} onClick={() => setFilter("waiting_approval")} active={filter === "waiting_approval"} />
        <CountCard label="Overdue" value={counts.overdue} tone="danger" onClick={() => setFilter("overdue")} active={filter === "overdue"} />
        <CountCard label="Closed" value={counts.closed} tone="safe" onClick={() => setFilter("closed")} active={filter === "closed"} />
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter actions">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f.key
                  ? "border-accent/50 bg-accent-muted text-primary"
                  : "border-border-subtle bg-surface-1 text-secondary hover:text-primary",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="sm:w-64">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, owner, source…"
            aria-label="Search actions"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState hasAny={actions.length > 0} onNew={() => setDialog({ mode: "create" })} />
      ) : (
        <ul className="space-y-2.5">
          {visible.map((a) => (
            <ActionRow key={a.id} action={a} today={today} onOpen={() => setDialog({ mode: "edit", item: a })} />
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-faint">
        Actions are stored on this device for now. When the backend lands they&apos;ll sync across
        your team — the data you add here carries over.
      </p>

      {dialog && (
        <ActionFormDialog
          open
          mode={dialog.mode}
          initial={dialog.item}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
          onDelete={
            dialog.mode === "edit" && dialog.item
              ? () => {
                  deleteAction(dialog.item!.id);
                  setDialog(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function CountCard({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone?: "danger" | "safe";
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-surface-1 p-3 text-left transition-colors hover:border-border-strong",
        active ? "border-accent/50" : "border-border-subtle",
      )}
    >
      <p
        className={cn(
          "font-mono text-2xl font-semibold tabular-nums",
          value === 0 ? "text-grey-600" : tone === "danger" ? "text-danger" : tone === "safe" ? "text-safe" : "text-primary",
        )}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-secondary">{label}</p>
    </button>
  );
}

function ActionRow({
  action,
  today,
  onOpen,
}: {
  action: ActionItem;
  today: string;
  onOpen: () => void;
}) {
  const overdue = isOverdue(action, today);
  const SourceIcon = navIcons[sourceIcon(action.sourceModule)];
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-3 rounded-lg border border-border-subtle bg-surface-1 p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
      >
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2 text-accent">
          <SourceIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-primary">{action.title}</span>
            {overdue && <Badge tone="danger" dot>Overdue</Badge>}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
            <span>{MODULE_LABEL[action.sourceModule]}</span>
            {action.owner && <span>· {action.owner}</span>}
            {action.dueDate && (
              <span className={cn(overdue && "text-danger")}>· Due {action.dueDate}</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge tone={STATUS_TONE[action.status]}>{STATUS_LABEL[action.status]}</Badge>
          <Badge tone={PRIORITY_TONE[action.priority]}>{PRIORITY_LABEL[action.priority]}</Badge>
        </div>
      </button>
    </li>
  );
}

function EmptyState({ hasAny, onNew }: { hasAny: boolean; onNew: () => void }) {
  const Icon = navIcons.actions;
  return (
    <Card className="flex min-h-[16rem] flex-col items-center justify-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-faint">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-medium text-primary">
        {hasAny ? "No actions match this filter" : "No actions yet"}
      </p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-secondary">
        {hasAny
          ? "Try a different filter or clear your search."
          : "Track every commitment from HSE, compliance, maintenance and operations in one place — nothing falls through the cracks."}
      </p>
      {!hasAny && (
        <Button className="mt-4" onClick={onNew}>
          <PlusIcon className="h-4 w-4" />
          Create your first action
        </Button>
      )}
    </Card>
  );
}

/** Sort: overdue first, then by soonest due date (undated last), then newest. */
function byUrgency(today: string) {
  return (a: ActionItem, b: ActionItem): number => {
    const ao = isOverdue(a, today) ? 0 : 1;
    const bo = isOverdue(b, today) ? 0 : 1;
    if (ao !== bo) return ao - bo;
    const ad = a.dueDate ?? "9999-99-99";
    const bd = b.dueDate ?? "9999-99-99";
    if (ad !== bd) return ad < bd ? -1 : 1;
    return b.createdAt - a.createdAt;
  };
}

function sourceIcon(m: ActionItem["sourceModule"]) {
  switch (m) {
    case "hse":
      return "hse" as const;
    case "compliance":
      return "compliance" as const;
    case "maintenance":
      return "maintenance" as const;
    case "documents":
      return "documents" as const;
    case "reports":
      return "reports" as const;
    case "copilot":
      return "copilot" as const;
    case "operations":
      return "operations-log" as const;
    default:
      return "actions" as const;
  }
}
