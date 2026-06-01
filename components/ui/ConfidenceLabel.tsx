import { cn } from "@/lib/cn";

/**
 * ConfidenceLabel — calibrated-honesty indicator for a reasoned answer.
 * Expresses how sure PetroBrain is, in plain language with a small meter. Pairs with
 * CitationChip to show "here's the answer, here's how confident, here's the source".
 *
 * Usage:
 *   <ConfidenceLabel level="high" />
 *   <ConfidenceLabel level="low" note="No field-level production data connected" />
 */
type Level = "high" | "medium" | "low";

const META: Record<Level, { label: string; filled: number; tone: string }> = {
  high: { label: "High confidence", filled: 3, tone: "text-safe" },
  medium: { label: "Medium confidence", filled: 2, tone: "text-warn" },
  low: { label: "Low confidence", filled: 1, tone: "text-danger" },
};

export function ConfidenceLabel({
  level,
  note,
  className,
}: {
  level: Level;
  /** Honest caveat — e.g. what data is missing. */
  note?: string;
  className?: string;
}) {
  const { label, filled, tone } = META[level];
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-xs", className)}
      role="img"
      aria-label={note ? `${label}. ${note}` : label}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-3 w-1 rounded-[1px]",
              i < filled ? cn(tone, "bg-current") : "bg-border-strong",
            )}
          />
        ))}
      </span>
      <span className={cn("font-mono font-medium", tone)}>{label}</span>
      {note && <span className="text-faint">— {note}</span>}
    </span>
  );
}
