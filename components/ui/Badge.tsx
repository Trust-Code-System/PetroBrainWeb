import { cn } from "@/lib/cn";

/**
 * Badge — small status/label pill. Tones map to the semantic tokens and are used
 * sparingly. For intelligence capabilities use <StageBadge> (below) — never invent
 * a new stage label.
 *
 * Usage: <Badge tone="info">Beta</Badge>
 */
export type Tone = "neutral" | "accent" | "safe" | "warn" | "danger" | "info";

const toneClass: Record<Tone, string> = {
  neutral: "bg-surface-2 text-secondary border-border-strong",
  accent: "bg-accent-muted text-accent border-accent/40",
  safe: "bg-safe/10 text-safe border-safe/40",
  warn: "bg-warn/10 text-warn border-warn/40",
  danger: "bg-danger/10 text-danger border-danger/40",
  info: "bg-info/10 text-info border-info/40",
};

type BadgeProps = {
  children: React.ReactNode;
  tone?: Tone;
  /** Show a leading status dot. */
  dot?: boolean;
  className?: string;
};

export function Badge({ children, tone = "neutral", dot = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm border px-2.5 py-0.5 text-xs font-medium leading-5",
        toneClass[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */

/**
 * StageBadge — the MANDATORY, site-wide honesty label for every intelligence
 * capability. Renders exactly one of three canonical stages with a fixed color:
 *   - "live"     → "Live"            (green)
 *   - "expanding"→ "Expanding"       (amber)
 *   - "roadmap"  → "On the roadmap"  (grey)
 *
 * `note` appends an honest qualifier (e.g. "(your data)") without changing the stage.
 * Never relabel these strings — the badge system is a brand-trust contract.
 *
 * Usage:
 *   <StageBadge stage="live" />
 *   <StageBadge stage="expanding" note="West African benchmarks" />
 */
export type Stage = "live" | "expanding" | "roadmap";

const STAGE: Record<Stage, { label: string; tone: Tone }> = {
  live: { label: "Live", tone: "safe" },
  expanding: { label: "Expanding", tone: "warn" },
  roadmap: { label: "On the roadmap", tone: "neutral" },
};

export function StageBadge({
  stage,
  note,
  className,
}: {
  stage: Stage;
  note?: string;
  className?: string;
}) {
  const { label, tone } = STAGE[stage];
  return (
    <Badge tone={tone} dot className={cn("font-mono", className)}>
      {label}
      {note ? <span className="font-sans text-secondary">· {note}</span> : null}
    </Badge>
  );
}
