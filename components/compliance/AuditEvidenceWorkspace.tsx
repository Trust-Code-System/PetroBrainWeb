"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { SelectOption } from "@/components/ui/Select";
import { cn } from "@/lib/cn";
import { PlusIcon, SparkleIcon, navIcons } from "@/components/app/icons";
import { useChrome } from "@/components/app/ChromeProvider";
import { EvidenceFormDialog } from "@/components/compliance/EvidenceFormDialog";
import {
  auditReadiness,
  createEvidence,
  deleteEvidence,
  evidenceCounts,
  raiseEvidenceAction,
  updateEvidence,
  useEvidence,
} from "@/lib/audit/store";
import {
  EVIDENCE_STATUS_LABEL,
  EVIDENCE_STATUS_TONE,
  EVIDENCE_TYPE_LABEL,
} from "@/lib/audit/labels";
import { useObligations } from "@/lib/compliance/store";
import type { CreateEvidenceInput, EvidenceItem, EvidenceStatus } from "@/lib/audit/types";

type Filter = "all" | "open_gaps" | "pending" | "collected";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open_gaps", label: "Open gaps" },
  { key: "pending", label: "Pending" },
  { key: "collected", label: "Collected" },
];

const STATUS_RANK: Record<EvidenceStatus, number> = {
  gap: 0,
  expired: 1,
  requested: 2,
  in_review: 3,
  collected: 4,
};

const COPILOT_SEED =
  "Build an audit pack for our next regulatory inspection and flag any missing evidence.";

export function AuditEvidenceWorkspace() {
  const evidence = useEvidence();
  const obligations = useObligations();
  const { openCopilotWith } = useChrome();

  const counts = useMemo(() => evidenceCounts(evidence), [evidence]);
  const readiness = useMemo(() => auditReadiness(evidence), [evidence]);
  const obligationOptions = useMemo<SelectOption[]>(
    () => obligations.map((o) => ({ value: o.id, label: o.title })),
    [obligations],
  );
  const obligationTitle = useMemo(() => {
    const map = new Map<string, string>();
    obligations.forEach((o) => map.set(o.id, o.title));
    return map;
  }, [obligations]);

  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<{ mode: "create" | "edit"; item?: EvidenceItem } | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return evidence
      .filter((e) => {
        if (filter === "all") return true;
        if (filter === "collected") return e.status === "collected";
        if (filter === "pending") return e.status === "requested" || e.status === "in_review";
        return e.status === "gap" || e.status === "expired"; // open_gaps
      })
      .filter((e) => {
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          (e.requirement ?? "").toLowerCase().includes(q) ||
          (e.owner ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const ra = STATUS_RANK[a.status];
        const rb = STATUS_RANK[b.status];
        if (ra !== rb) return ra - rb;
        return b.createdAt - a.createdAt;
      });
  }, [evidence, filter, query]);

  function handleSubmit(input: CreateEvidenceInput) {
    if (dialog?.mode === "edit" && dialog.item) updateEvidence(dialog.item.id, input);
    else createEvidence(input);
    setDialog(null);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Audit Evidence"
        description="The evidence room for inspections, audits and regulatory reviews — proof grouped by requirement, with a readiness score and gaps you can turn into actions."
        actions={
          <Button onClick={() => setDialog({ mode: "create" })}>
            <PlusIcon className="h-4 w-4" />
            Add evidence
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Open gaps"
          value={counts.openGaps}
          tone="danger"
          hint="Missing or expired"
          onClick={() => setFilter("open_gaps")}
          active={filter === "open_gaps"}
        />
        <StatCard
          label="Pending"
          value={counts.requested + counts.inReview}
          tone="warn"
          hint="Requested or in review"
          onClick={() => setFilter("pending")}
          active={filter === "pending"}
        />
        <StatCard
          label="Collected"
          value={counts.collected}
          tone="safe"
          hint="On file and current"
          onClick={() => setFilter("collected")}
          active={filter === "collected"}
        />
        <StatCard
          label="Total tracked"
          value={counts.total}
          hint="All evidence items"
          onClick={() => setFilter("all")}
          active={filter === "all"}
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col justify-between gap-3 p-5 lg:col-span-1">
          <div>
            <p className="text-sm font-medium text-primary">Audit readiness</p>
            <p className="mt-0.5 text-xs text-faint">Collected, of all tracked evidence</p>
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
            <p className="text-sm font-medium text-primary">Assemble the audit pack with the copilot</p>
            <p className="mt-1 text-sm leading-relaxed text-secondary">
              The copilot can draft an audit pack from your collected evidence and flag what&apos;s
              still missing. It cites what it uses and never signs off the audit — that stays with you.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openCopilotWith(COPILOT_SEED)}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              <SparkleIcon className="h-4 w-4" />
              Build audit pack
            </button>
            <Link
              href="/app/compliance/guardian"
              className="text-sm text-secondary underline-offset-2 hover:text-primary hover:underline"
            >
              Back to Compliance Guardian →
            </Link>
          </div>
        </Card>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter evidence">
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
            placeholder="Search evidence, requirement, owner…"
            aria-label="Search evidence"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState hasAny={evidence.length > 0} onNew={() => setDialog({ mode: "create" })} />
      ) : (
        <ul className="space-y-2.5">
          {visible.map((e) => (
            <EvidenceRow
              key={e.id}
              item={e}
              obligationTitle={e.obligationId ? obligationTitle.get(e.obligationId) : undefined}
              onOpen={() => setDialog({ mode: "edit", item: e })}
            />
          ))}
        </ul>
      )}

      <p className="mt-6 text-xs text-faint">
        Evidence is stored on this device for now. Marking a linked item &ldquo;collected&rdquo; clears that
        obligation&apos;s missing-evidence flag in the Compliance Guardian; gaps you raise appear in
        the Action Tracker.
      </p>

      {dialog && (
        <EvidenceFormDialog
          open
          mode={dialog.mode}
          initial={dialog.item}
          obligationOptions={obligationOptions}
          onClose={() => setDialog(null)}
          onSubmit={handleSubmit}
          onRaiseAction={
            dialog.mode === "edit" && dialog.item
              ? () => {
                  raiseEvidenceAction(dialog.item!);
                  setDialog(null);
                }
              : undefined
          }
          onDelete={
            dialog.mode === "edit" && dialog.item
              ? () => {
                  deleteEvidence(dialog.item!.id);
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
  const toneText = !nonZero
    ? "text-grey-600"
    : tone === "danger"
      ? "text-danger"
      : tone === "warn"
        ? "text-warn"
        : tone === "safe"
          ? "text-safe"
          : "text-primary";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-surface-1 p-4 text-left transition-colors hover:border-border-strong",
        active ? "border-accent/50" : "border-border-subtle",
      )}
    >
      <p className={cn("font-mono text-2xl font-semibold tabular-nums", toneText)}>{value}</p>
      <p className="mt-0.5 text-xs text-secondary">{label}</p>
      <p className="mt-0.5 text-xs text-faint">{hint}</p>
    </button>
  );
}

function EvidenceRow({
  item,
  obligationTitle,
  onOpen,
}: {
  item: EvidenceItem;
  obligationTitle?: string;
  onOpen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-start gap-3 rounded-lg border border-border-subtle bg-surface-1 p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-2"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-primary">{item.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
            <span>{EVIDENCE_TYPE_LABEL[item.type]}</span>
            {item.requirement && <span>· {item.requirement}</span>}
            {item.date && <span>· {item.date}</span>}
            {obligationTitle && <span className="text-accent">· Obligation: {obligationTitle}</span>}
            {item.actionIds.length > 0 && (
              <span className="text-accent">· {item.actionIds.length} action(s)</span>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <Badge tone={EVIDENCE_STATUS_TONE[item.status]} dot>
            {EVIDENCE_STATUS_LABEL[item.status]}
          </Badge>
        </div>
      </button>
    </li>
  );
}

function EmptyState({ hasAny, onNew }: { hasAny: boolean; onNew: () => void }) {
  const Icon = navIcons.audit;
  return (
    <Card className="flex min-h-[16rem] flex-col items-center justify-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-faint">
        <Icon className="h-6 w-6" />
      </span>
      <p className="mt-3 text-sm font-medium text-primary">
        {hasAny ? "No evidence matches this filter" : "No audit evidence yet"}
      </p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-secondary">
        {hasAny
          ? "Try a different filter or clear your search."
          : "Track policies, reports, certificates, inspection and training records and corrective-action proof — grouped by requirement, with a readiness score and gap actions."}
      </p>
      {!hasAny && (
        <Button className="mt-4" onClick={onNew}>
          <PlusIcon className="h-4 w-4" />
          Add your first evidence item
        </Button>
      )}
    </Card>
  );
}
