"use client";

import { Badge, StageBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Markdown } from "@/components/copilot/Markdown";
import { SparkleIcon } from "@/components/app/icons";
import { useToast } from "@/components/providers/ToastProvider";
import { WatchButton } from "./WatchButton";
import { RoundNotes } from "./RoundNotes";
import { useTeam } from "@/lib/account/hooks";
import { useAssignRound } from "@/lib/opportunities/hooks";
import {
  countryLabel,
  fmtArea,
  fmtDate,
  fmtDepth,
  roundTypeLabel,
  statusLabel,
  statusTone,
  DASH,
} from "@/lib/opportunities/labels";
import type { Round } from "@/lib/opportunities/types";

/**
 * RoundDetail — the full presentational view of one round, shared by the slide-over drawer and
 * the dedicated /app/opportunities/[id] route. Everything is backend-sourced; unknown fields
 * render "—". The fiscal/qualification block is DESCRIPTIVE only and carries an explicit "not
 * bid advice" note. "Ask the copilot about this round" seeds the bubble with the round id/name.
 */
export function RoundDetail({
  round,
  onAskCopilot,
}: {
  round: Round;
  onAskCopilot: (round: Round) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={statusTone(round.status)}>{statusLabel(round.status)}</Badge>
          <Badge tone="neutral">{roundTypeLabel(round.type)}</Badge>
          <StageBadge stage="live" note="public sources" />
        </div>
        <h2 className="text-lg font-semibold text-primary">{round.name}</h2>
        <p className="text-sm text-secondary">
          {round.regulator} · {countryLabel(round.country)}
        </p>
        <SourceLine round={round} />
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <WatchButton roundId={round.id} watched={round.watched} size="sm" />
          <Button size="sm" variant="ghost" onClick={() => onAskCopilot(round)}>
            <SparkleIcon className="h-4 w-4 text-accent" />
            Ask the copilot about this round
          </Button>
        </div>
      </div>

      {round.description_md && (
        <Section label="Scope">
          <div className="text-sm leading-relaxed text-secondary">
            <Markdown>{round.description_md}</Markdown>
          </div>
        </Section>
      )}

      {/* Key dates timeline */}
      <Section label="Key dates">
        <ol className="space-y-2">
          <DateRow label="Opened" value={round.opened_at} />
          <DateRow label="Pre-qualification deadline" value={round.pre_qualification_deadline} />
          <DateRow label="Technical submission" value={round.technical_submission_deadline} />
          <DateRow label="Commercial submission" value={round.commercial_submission_deadline} />
          <DateRow label="Submission deadline" value={round.submission_deadline} />
          <DateRow label="Award expected" value={round.award_expected_at} />
        </ol>
      </Section>

      {/* Blocks / fields offered */}
      <Section label={`Blocks / fields offered (${round.counts.blocks})`}>
        {round.blocks.length > 0 ? (
          <div className="overflow-x-auto rounded-md border border-border-subtle">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left font-mono text-[11px] uppercase tracking-wider text-faint">
                <tr>
                  <th className="px-3 py-2 font-normal">Name</th>
                  <th className="px-3 py-2 font-normal">Basin</th>
                  <th className="px-3 py-2 font-normal text-right">Area</th>
                  <th className="px-3 py-2 font-normal text-right">Water depth</th>
                  <th className="px-3 py-2 font-normal">Prior activity</th>
                  <th className="px-3 py-2 font-normal">Data room</th>
                </tr>
              </thead>
              <tbody>
                {round.blocks.map((b, i) => (
                  <tr key={`${b.name}-${i}`} className="border-t border-border-subtle">
                    <td className="px-3 py-2 font-medium text-primary">{b.name}</td>
                    <td className="px-3 py-2 text-secondary">{b.basin ?? DASH}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-secondary">
                      {fmtArea(b.area_km2)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums text-secondary">
                      {fmtDepth(b.water_depth_m)}
                    </td>
                    <td className="px-3 py-2 text-secondary">{b.prior_activity ?? DASH}</td>
                    <td className="px-3 py-2 text-secondary">
                      {b.data_room === undefined ? DASH : b.data_room ? "Available" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-faint">No blocks published yet.</p>
        )}
      </Section>

      {/* Fiscal / qualification headlines — descriptive only */}
      <Section label="Fiscal & qualification headlines">
        <dl className="space-y-1.5 text-sm">
          <Row label="Fiscal regime">{round.fiscal_regime_tag ?? DASH}</Row>
          <Row label="Signature-bonus floor">{round.signature_bonus_floor ?? DASH}</Row>
        </dl>
        {round.qualification_headlines && round.qualification_headlines.length > 0 ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-secondary">
            {round.qualification_headlines.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-faint">No qualification criteria published yet.</p>
        )}
        <p className="mt-2 text-xs text-faint">
          Descriptive only — PetroBrain does not recommend whether to bid, at what amount, or how
          to structure a submission. Those are commercial decisions for your bid team.
        </p>
      </Section>

      {/* Documents */}
      <Section label={`Documents (${round.counts.documents})`}>
        {round.documents.length > 0 ? (
          <ul className="space-y-1.5">
            {round.documents.map((d, i) => (
              <li key={`${d.url}-${i}`} className="text-sm">
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  {d.title}
                </a>
                {d.published_at && <span className="ml-1 text-xs text-faint">· {fmtDate(d.published_at)}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-faint">No documents linked yet.</p>
        )}
      </Section>

      {/* Assign to */}
      <Section label="Assigned to">
        <AssignControl round={round} />
      </Section>

      {/* Activity log */}
      <Section label="Activity">
        {round.activity.length > 0 ? (
          <ol className="space-y-2">
            {round.activity.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 font-mono text-xs text-faint">{fmtDate(a.at)}</span>
                <span className="text-secondary">{a.summary}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-faint">No recorded changes yet.</p>
        )}
      </Section>

      {/* Notes */}
      <Section label="Notes">
        <RoundNotes roundId={round.id} notes={round.notes} />
      </Section>
    </div>
  );
}

function SourceLine({ round }: { round: Round }) {
  const s = round.source_attribution;
  return (
    <p className="text-xs text-faint">
      Source:{" "}
      <a
        href={s.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline-offset-2 hover:underline"
      >
        {s.regulator}
      </a>{" "}
      · verified {fmtDate(s.last_verified_at)}
    </p>
  );
}

function AssignControl({ round }: { round: Round }) {
  const { show } = useToast();
  const team = useTeam();
  const assign = useAssignRound(round.id);
  const options = [
    { label: "Unassigned", value: "" },
    ...(team.data?.items ?? []).map((m) => ({ label: m.name, value: m.id })),
  ];

  return (
    <div className="max-w-xs">
      <Select
        options={options}
        value={round.assigned_to ?? ""}
        onChange={(v) =>
          assign.mutate(v, {
            onSuccess: () => show({ message: v ? "Round assigned" : "Assignment cleared", tone: "default" }),
            onError: (e) => show({ message: (e as Error).message, tone: "danger" }),
          })
        }
        placeholder={team.isLoading ? "Loading team…" : "Unassigned"}
        disabled={assign.isPending}
      />
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-1.5 font-mono text-xs uppercase tracking-wider text-faint">{label}</p>
      {children}
    </section>
  );
}

function DateRow({ label, value }: { label: string; value?: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border-subtle/60 pb-1.5">
      <span className="text-sm text-secondary">{label}</span>
      <span className="font-mono text-xs text-primary">{fmtDate(value)}</span>
    </li>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-secondary">{label}</dt>
      <dd className="text-primary">{children}</dd>
    </div>
  );
}
