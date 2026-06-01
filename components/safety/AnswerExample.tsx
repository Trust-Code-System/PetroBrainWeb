import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";

/**
 * AnswerExample — a static, console-styled exchange showing how PetroBrain answers.
 * Used on /safety (and reusable on /intelligence, /mrv) to *show* the behaviour rather
 * than describe it: a user question on the right, PetroBrain's reasoned reply below,
 * with mono "technical proof" styling. Presentational only.
 *
 * Usage:
 *   <AnswerExample label="calibrated-honesty" question="…?">
 *     …mono lines, CitationChip, ConfidenceLabel, Banner…
 *   </AnswerExample>
 */
export function AnswerExample({
  label,
  question,
  children,
  className,
}: {
  label: string;
  question: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border-strong bg-surface-1 shadow-elev-2",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-2 px-4 py-2.5">
        <span className="font-mono text-xs text-faint">{label}</span>
        <Badge tone="accent" dot>
          Domain-locked
        </Badge>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-lg rounded-br-sm bg-surface-3 px-3.5 py-2 text-sm text-primary">
            {question}
          </p>
        </div>

        <div className="flex gap-3">
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-2 text-accent"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M6 15c2-6 4-6 6 0s4 6 6 0"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <div className="min-w-0 flex-1 space-y-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
