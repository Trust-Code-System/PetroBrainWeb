import { Badge } from "@/components/ui/Badge";

/**
 * MilestoneTrack — a baseline→target timeline with a progress fill, for goals like
 * "zero routine flaring by 2030". `progressPct` is how far toward the target we are
 * (backend-provided). Null progress renders honestly (no fabricated progress).
 */
export function MilestoneTrack({
  baselineYear,
  targetYear,
  targetLabel,
  progressPct,
  onTrack,
  note,
}: {
  baselineYear: number;
  targetYear: number;
  targetLabel: string;
  progressPct: number | null;
  onTrack?: boolean | null;
  note?: string;
}) {
  const pct = progressPct === null ? 0 : Math.min(100, Math.max(0, progressPct));

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-faint">{baselineYear} baseline</span>
        <StatusBadge onTrack={onTrack} hasData={progressPct !== null} />
        <span className="font-mono text-xs text-faint">{targetYear} · {targetLabel}</span>
      </div>

      <div
        className="relative mt-2 h-3 rounded-full bg-surface-2"
        role="img"
        aria-label={
          progressPct === null
            ? `Progress to ${targetLabel} by ${targetYear}: not yet measured`
            : `Progress to ${targetLabel} by ${targetYear}: ${Math.round(pct)} percent`
        }
      >
        {progressPct !== null && (
          <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
        )}
      </div>

      <p className="mt-1.5 text-xs text-faint">
        {progressPct === null ? "Reduction not yet measured." : `${Math.round(pct)}% of routine flaring eliminated vs baseline.`}
        {note ? ` ${note}` : ""}
      </p>
    </div>
  );
}

function StatusBadge({ onTrack, hasData }: { onTrack?: boolean | null; hasData: boolean }) {
  if (!hasData || onTrack === null || onTrack === undefined) {
    return <Badge tone="neutral">Tracking</Badge>;
  }
  return onTrack ? <Badge tone="safe" dot>On track</Badge> : <Badge tone="warn" dot>Off track</Badge>;
}
