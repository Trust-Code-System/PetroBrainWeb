"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { navIcons, SparkleIcon } from "@/components/app/icons";
import { useChrome } from "@/components/app/ChromeProvider";
import { AuditLogPanel } from "@/components/governance/AuditLogPanel";
import { FeedbackPanel } from "@/components/governance/FeedbackPanel";
import { useSavedAnswers } from "@/lib/copilot/savedAnswers";
import {
  deriveUsage,
  distinctSources,
  groundingRate,
  useConversations,
} from "@/lib/governance/usage";

const COPILOT_SEED =
  "Summarise how AI has been used in this workspace so far: how many questions, how many answers cited sources, and any answers flagged for human review.";

export function AiGovernanceWorkspace() {
  const convos = useConversations();
  const saved = useSavedAnswers();
  const { openCopilotWith } = useChrome();

  const stats = useMemo(() => deriveUsage(convos), [convos]);
  const grounding = useMemo(() => groundingRate(stats), [stats]);
  const sources = useMemo(() => distinctSources(convos, saved), [convos, saved]);

  const recent = useMemo(
    () => convos.slice(0, 8).map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt,
      turns: c.messages.filter((m) => m.role === "user").length,
    })),
    [convos],
  );

  const hasUsage = stats.conversations > 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="AI Governance"
        description="Visibility into how AI is used across PetroBrain — questions asked, how often answers are grounded in cited sources, what was flagged for human review, and which sources the AI relied on."
        actions={<Badge tone="info" dot>Read-only oversight</Badge>}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="AI conversations" value={stats.conversations} hint="Sessions on this device" />
        <StatCard label="Questions asked" value={stats.questions} hint="User turns to the copilot" />
        <StatCard
          label="Answers cited"
          value={stats.citedAnswers}
          tone={stats.citedAnswers > 0 ? "safe" : undefined}
          hint={`${stats.citationTotal} source reference(s)`}
        />
        <StatCard
          label="Flagged for review"
          value={stats.safetyFlagged}
          tone={stats.safetyFlagged > 0 ? "warn" : undefined}
          hint="Safety / verification notices"
        />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col justify-between gap-3 p-5 lg:col-span-1">
          <div>
            <p className="text-sm font-medium text-primary">Source grounding</p>
            <p className="mt-0.5 text-xs text-faint">Share of answers that cited at least one source</p>
          </div>
          {grounding === null ? (
            <p className="font-mono text-3xl font-semibold text-grey-600">—</p>
          ) : (
            <div>
              <p
                className={cn(
                  "font-mono text-3xl font-semibold tabular-nums",
                  grounding >= 80 ? "text-safe" : grounding >= 50 ? "text-warn" : "text-danger",
                )}
              >
                {grounding}%
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn(
                    "h-full rounded-full",
                    grounding >= 80 ? "bg-safe" : grounding >= 50 ? "bg-warn" : "bg-danger",
                  )}
                  style={{ width: `${grounding}%` }}
                />
              </div>
            </div>
          )}
          <p className="text-xs text-faint">
            Citations tie answers back to evidence. Answers without sources should be verified before
            you act on them.
          </p>
        </Card>

        <Card className="flex flex-col justify-between gap-3 p-5 lg:col-span-2">
          <div>
            <p className="text-sm font-medium text-primary">How PetroBrain keeps AI accountable</p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-secondary">
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-0.5 text-accent">•</span>
                The copilot is <strong className="font-medium text-primary">read-only</strong> — it
                cannot change records; every write goes through an explicit confirmation step.
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-0.5 text-accent">•</span>
                Answers cite their sources, and safety-critical output is flagged for human review.
              </li>
              <li className="flex items-start gap-2">
                <span aria-hidden className="mt-0.5 text-accent">•</span>
                AI never makes final safety or compliance decisions — those stay with your team.
              </li>
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={() => openCopilotWith(COPILOT_SEED)}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              <SparkleIcon className="h-4 w-4" />
              Summarise AI usage
            </button>
            <Link
              href="/app/copilot"
              className="text-sm text-secondary underline-offset-2 hover:text-primary hover:underline"
            >
              Open AI Copilot →
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">Recent AI activity</h2>
            {hasUsage && (
              <span className="text-xs text-faint">
                Last: {stats.lastActivity ? relativeTime(stats.lastActivity) : "—"}
              </span>
            )}
          </div>
          {recent.length === 0 ? (
            <EmptyHint text="No AI conversations recorded yet. Activity appears here as you use the copilot." />
          ) : (
            <ul className="divide-y divide-border-subtle">
              {recent.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-primary">{c.title}</p>
                    <p className="text-xs text-faint">
                      {c.turns} question{c.turns === 1 ? "" : "s"} · {relativeTime(c.updatedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-primary">Sources the AI relied on</h2>
            {sources.length > 0 && (
              <span className="text-xs text-faint">{sources.length} distinct</span>
            )}
          </div>
          {sources.length === 0 ? (
            <EmptyHint text="No cited sources yet. When the copilot grounds an answer in a document or dataset, it shows up here." />
          ) : (
            <ul className="divide-y divide-border-subtle">
              {sources.slice(0, 10).map((s) => (
                <li key={s.source} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    {s.href ? (
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-sm text-accent underline-offset-2 hover:underline"
                      >
                        {s.source}
                      </a>
                    ) : (
                      <p className="truncate text-sm text-primary">{s.source}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-xs tabular-nums text-secondary">
                    ×{s.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <AuditLogPanel />
      <FeedbackPanel />

      <Card className="mt-6 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-faint">
          On the roadmap (needs backend)
        </h2>
        <ul className="mt-3 grid gap-x-8 gap-y-2 text-sm text-secondary sm:grid-cols-2">
          {[
            "Sensitive-document access tracking and warnings",
            "Org-wide AI policy manager and approval workflow",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span
                aria-hidden
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border-strong text-[10px] text-faint"
              >
                ·
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-6 text-xs text-faint">
        The usage stats above are logged on this device from the copilot history and saved answers.
        Account-wide, per-user attribution and exportable logs come from the governance backend audit
        log — shown live when your account has access, and stated as unavailable otherwise rather than
        faked.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone?: "danger" | "warn" | "safe";
  hint: string;
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
    <div className="rounded-lg border border-border-subtle bg-surface-1 p-4">
      <p className={cn("font-mono text-2xl font-semibold tabular-nums", toneText)}>{value}</p>
      <p className="mt-0.5 text-xs text-secondary">{label}</p>
      <p className="mt-0.5 text-xs text-faint">{hint}</p>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  const Icon = navIcons["ai-governance"];
  return (
    <div className="flex min-h-[8rem] flex-col items-center justify-center text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-faint">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-secondary">{text}</p>
    </div>
  );
}

function relativeTime(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
