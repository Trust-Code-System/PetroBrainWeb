import { cn } from "@/lib/cn";

/**
 * CitationChip — a mono "technical proof" chip showing where a number came from.
 * Core to the brand: every figure PetroBrain reasons over is sourced. Renders as a
 * link when `href` is provided, otherwise a static label.
 *
 * Usage:
 *   <CitationChip source="EIA · Short-Term Energy Outlook" />
 *   <CitationChip source="EIA STEO" href="https://www.eia.gov/outlooks/steo/" />
 */
type CitationChipProps = {
  /** Human-readable source label, e.g. "OPEC MOMR · May 2026". */
  source: string;
  href?: string;
  className?: string;
};

const inner = (source: string) => (
  <>
    <svg
      viewBox="0 0 16 16"
      className="h-3 w-3 shrink-0 text-faint"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      {/* quote / source glyph */}
      <path d="M3 4h10M3 8h10M3 12h6" strokeLinecap="round" />
    </svg>
    <span className="truncate">{source}</span>
  </>
);

export function CitationChip({ source, href, className }: CitationChipProps) {
  const classes = cn(
    "inline-flex max-w-full items-center gap-1.5 rounded-sm border border-border-subtle bg-surface-2 px-2 py-0.5 font-mono text-[0.7rem] leading-5 text-secondary",
    href && "transition-colors hover:border-border-strong hover:text-primary",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        aria-label={`Source: ${source} (opens in a new tab)`}
      >
        {inner(source)}
      </a>
    );
  }
  return (
    <span className={classes} aria-label={`Source: ${source}`}>
      {inner(source)}
    </span>
  );
}
