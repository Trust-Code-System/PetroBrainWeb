"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";
import { PlusIcon, SparkleIcon, navIcons } from "@/components/app/icons";
import { useChrome } from "@/components/app/ChromeProvider";
import { ObligationFormDialog } from "@/components/compliance/ObligationFormDialog";
import {
  createObligation,
  deleteObligation,
  isMissingEvidence,
  obligationCounts,
  raiseObligationAction,
  readinessScore,
  updateObligation,
  useObligations,
} from "@/lib/compliance/store";
import {
  OBLIGATION_CATEGORY_LABEL,
  OBLIGATION_FREQUENCY_LABEL,
  OBLIGATION_STATUS_LABEL,
  OBLIGATION_STATUS_TONE,
} from "@/lib/compliance/labels";
import { permitCounts, usePermits } from "@/lib/permits/store";
import type { CreateObligationInput, Obligation, ObligationStatus } from "@/lib/compliance/types";

type Filter = "all" | "open_findings" | "missing_evidence" | "met";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open_findings", label: "Open findings" },
  { key: "missing_evidence", label: "Missing evidence" },
  { key: "met", label: "Met" },
];

const COPILOT_SEED =
  "Summarise our compliance status and list anything expiring, at risk, or missing evidence this month.";

export function ComplianceGuardianWorkspace() {
  const obligations = useObligations();
  const permits = usePermits();
  const { openCopilotWith } = useChrome();

  const counts = useMemo(() => obligationCounts(obligations), [obligations]);
  const permits_ = useMemo(() => permitCounts(permits), [permits]);
  const readiness = useMemo(() => readinessScore(obligations), [obligations]);

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; item?: Obligation } | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return obligations
      .filter((o) => {
        if (filter === "all") return true;
        if (filter === "met") return o.status === "met";
        if (filter === "missing_evidence") return isMissingEvidence(o);
        // open_findings
        return o.status === "at_risk" || o.status === "not_met";
      })
      .filter((o) => {
        if (!q) return true;
        return (
          o.title.toLowerCase().includes(q) ||
          (o.authority ?? "").toLowerCase().includes(q) ||
          (o.owner ?? "").toLowerCase().includes(q) ||
          (o.description ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // At-risk / not-met first, then by soonest due date.
        const rank = (s: ObligationStatus) =>
          s === "not_met" ? 0 : s === "at_risk" ? 1 : s === "in_progress" ? 2 : s === "met" ? 3 : 4;
        const ra = rank(a.status);
        const rb = rank(b.status);
        if (ra !== rb) return ra - rb;
        const ad = a.dueDate ?? "9999-99-99";
        const bd = b.dueDate ?? "9999-99-99";
        if (ad !== bd) return ad < bd ? -1 : 1;
        return b.createdAt - a.createdAt;
      });
  }, [obligations, filter, query]);

  function handleSubmit(input: CreateObligationInput) {
    if (dialog?.mode === "edit" && dialog.item) updateObligation(dialog.item.id, input);
    else createObligation(input);
    setDialog(null);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Compliance Guardian"
        description="One live view of regulatory obligations, internal policies, expiring documents and audit readiness — so nothing lapses unnoticed and evidence is always at hand."
        actions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon className="h-4 w-4" />
            Add obligation
          </Button>
        }
      />

      {/* Cross-module status — same numbers the Command Center shows. */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Open findings"
          value={counts.openFindings}
          tone="danger"
          hint="At risk or not met"
          onClick={() => setFilter("open_findings")}
          active={filter === "open_findings"}
        />
        <StatCard
          label="Missing evidence"
          value={counts.missingEvidence}
          tone="warn"
          hint="In-scope, no proof on file"
          onClick={() => setFilter("missing_evidence")}
          active={filter === "missing_evidence"}
        />
        <StatLink
          label="Expiring soon"
          value={permits.length > 0 ? permits_.expiringSoon : null}
          tone="warn"
          hint="Permits & certificates"
          href="/app/compliance/permits"
        />
        <StatLink
          label="Expired"
          value={permits.length > 0 ? permits_.expired : null}
          tone="danger"
          hint="Permits & certificates"
          href="/app/compliance/permits"
        />
      </div>

      {/* Readiness + copilot. */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col justify-between gap-3 p-5 lg:col-span-1">
          <div>
            <p className="text-sm font-medium text-primary">Readiness</p>
            <p className="mt-0.5 text-xs text-faint">Met + evidenced, of in-scope obligations</p>
          </div>
          {readiness === null ? (
            <p className="font-mono text-3xl font-semibold text-grey-600">—</p>
          ) : (
            <div>
              <p
                className={cn(
                  "font-mono text-3xl font-semibold tabular-nums",
                  readiness >= 80 ? "text-safe" : readiness >= 50 ? "text-warn" : "text-danger",
                )}
              >
                {readiness}%
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    "h-full rounded-full",
                    readiness >= 80 ? "bg-safe" : readiness >= 50 ? "bg-warn" : "bg-danger",
                  )}
                  style={{ width: `${readiness}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-xs text-faint">Self-reported tracking signal — not a regulatory assessment.</p>
        </Card>

        <Card className="flex flex-col justify-between gap-3 p-5 lg:col-span-2">
          <div>
            <p className="text-sm font-medium text-primary">Ask the copilot for a status read-out</p>
            <p className="mt-1 text-sm leading-relaxed text-secondary">
              The copilot can summarise what&apos;s expiring, at risk or missing evidence and draft
              follow-up actions. It cites what it uses and never makes the final compliance call —
              that stays with you.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openCopilotWith(COPILOT_SEED)}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              <SparkleIcon className="h-4 w-4" />
              Summarise compliance status
            </button>
            <Link
              href="/app/compliance/permits"
              className="text-sm text-secondary underline-offset-2 hover:text-primary hover:underline"
            >
              Manage permits & certificates →
            </Link>
          </div>
        </Card>
      </div>

      {/* Obligations register. */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter obligations">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-accent/50 bg-accent-muted text-primary"
                    : "border-border-subtle bg-surface-1 text-secondary hover:text-primary",
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div className="sm:w-64">
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search obligation, authority, owner…"
            aria-label="Search obligations"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState hasAny={obligations.length > 0} onNew={() => setDialog({ mode: "create" })} />
      ) : (
        <ul className="space-y-2.5">
          {visible.map((o) => (
            <ObligationRow key={o.id} obligation={o} onOpen={() => setDialog({ mode: "edit", item: o })} />
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-faint">
        Obligations are stored on this device for now. Open findings, missing evidence and expiring
        documents feed the Command Center; follow-ups you raise appear in the Action Tracker.
      </p>

      {dialog && (
        <ObligationFormDialog
          open
          mode={dialog.mode}
          initial={dialog.item}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
          onRaiseAction={
            dialog.mode === "edit" && dialog.item
              ? () => {
                  raiseObligationAction(dialog.item!);
                  setDialog(null);
                }
              : undefined
          }
          onDelete={
            dialog.mode === "edit" && dialog.item
              ? () => {
                  deleteObligation(dialog.item!.id);
                  setDialog(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  hint,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone?: "danger" | "warn" | "safe";
  hint: string;
  active?: boolean;
  onClick: () => void;
}) {
  const nonZero = value > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-surface-1 p-4 text-left transition-colors hover:border-border-strong",
        active ? "border-accent/50" : "border-border-subtle",
      )}
    >
      <p className={cn("font-mono text-2xl font-semibold tabular-nums", toneText(value > 0 ? tone : undefined, nonZero))}>
        {value}
      </p>
      <p className="mt-0.5 text-xs text-secondary">{label}</p>
      <p className="mt-0.5 text-xs text-faint">{hint}</p>
    </button>
  );
}

function StatLink({
  label,
  value,
  tone,
  hint,
  href,
}: {
  label: string;
  value: number | null;
  tone?: "danger" | "warn" | "safe";
  hint: string;
  href: string;
}) {
  const hasValue = value !== null;
  const nonZero = hasValue && value > 0;
  return (
    <Link
      href={href}
      className="rounded-lg border border-border-subtle bg-surface-1 p-4 text-left transition-colors hover:border-border-strong"
    >
      {hasValue ? (
        <p className={cn("font-mono text-2xl font-semibold tabular-nums", toneText(tone, nonZero))}>{value}</p>
      ) : (
        <p className="font-mono text-2xl font-semibold text-grey-600" aria-hidden="true">
          —
        </p>
      )}
      <p className="mt-0.5 text-xs text-secondary">{label}</p>
      <p className="mt-0.5 text-xs text-faint">{hasValue ? hint : `No data yet · ${hint}`}</p>
    </Link>
  );
}

function toneText(tone: "danger" | "warn" | "safe" | undefined, nonZero: boolean) {
  if (!nonZero) return "text-grey-600";
  return tone === "danger"
    ? "text-danger"
    : tone === "warn"
      ? "text-warn"
      : tone === "safe"
        ? "text-safe"
        : "text-primary";
}

function ObligationRow({ obligation, onOpen }: { obligation: Obligation; onOpen: () => void }) {
  const missing = isMissingEvidence(obligation);
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-3 rounded-lg border border-border-subtle bg-surface-1 p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-primary">{obligation.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
            <span>{OBLIGATION_CATEGORY_LABEL[obligation.category]}</span>
            {obligation.authority && <span>· {obligation.authority}</span>}
            <span>· {OBLIGATION_FREQUENCY_LABEL[obligation.frequency]}</span>
            {obligation.dueDate && <span>· Due {obligation.dueDate}</span>}
            {obligation.actionIds.length > 0 && (
              <span className="text-accent">· {obligation.actionIds.length} action(s)</span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge tone={OBLIGATION_STATUS_TONE[obligation.status]} dot>
            {OBLIGATION_STATUS_LABEL[obligation.status]}
          </Badge>
          {missing && <span className="text-xs text-warn">Evidence missing</span>}
        </div>
      </button>
    </li>
  );
}

function EmptyState({ hasAny, onNew }: { hasAny: boolean; onNew: () => void }) {
  const Icon = navIcons.compliance;
  return (
    <Card className="flex min-h-[16rem] flex-col items-center justify-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-faint">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-medium text-primary">
        {hasAny ? "No obligations match this filter" : "No compliance obligations yet"}
      </p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-secondary">
        {hasAny
          ? "Try a different filter or clear your search."
          : "Track regulatory requirements, internal policies and reporting duties — with status, ownership, evidence and follow-up actions in one register."}
      </p>
      {!hasAny && (
        <Button className="mt-4" onClick={onNew}>
          <PlusIcon className="h-4 w-4" />
          Add your first obligation
        </Button>
      )}
    </Card>
  );
}
