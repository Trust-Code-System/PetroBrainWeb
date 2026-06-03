"use client";

import { useChrome } from "@/components/app/ChromeProvider";
import { SparkleIcon } from "@/components/app/icons";

/**
 * CopilotStrip — section 4: the page-aware copilot's invitation. Three suggested
 * questions tied to what's actually on this screen (the market band, the Tier-3
 * countdown, the empty operations KPIs). Each opens the copilot pre-seeded with that
 * question; the "Open copilot" button opens it blank.
 */

const SUGGESTIONS = [
  "What's driving today's Brent–WTI spread?",
  "How do we start NUPRC Tier-3 MRV tracking before 1 Jan 2027?",
  "Set up our emissions data so this dashboard reflects our operations.",
];

export function CopilotStrip() {
  const { openCopilotWith, toggleCopilot } = useChrome();

  return (
    <section
      aria-label="Ask the copilot"
      className="rounded-lg border border-accent/30 bg-accent-muted p-5"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-muted text-accent">
            <SparkleIcon className="h-6 w-6" />
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">
              Ask me about your operations or the market
            </p>
            <p className="mt-0.5 text-sm text-secondary">
              The copilot reads this page and answers with cited, engine-backed numbers.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleCopilot}
          className="shrink-0 self-start rounded-md border border-accent/40 bg-surface-1 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-surface-2 lg:self-auto"
        >
          Open copilot
        </button>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((q) => (
          <li key={q}>
            <button
              type="button"
              onClick={() => openCopilotWith(q)}
              className="rounded-full border border-border-strong bg-surface-1 px-3.5 py-1.5 text-left text-sm text-secondary transition-colors hover:border-accent/50 hover:text-primary"
            >
              {q}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
