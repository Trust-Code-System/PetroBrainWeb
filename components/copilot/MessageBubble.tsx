"use client";

import { Banner } from "@/components/ui/Banner";
import { CitationChip } from "@/components/ui/CitationChip";
import { ConfidenceLabel } from "@/components/ui/ConfidenceLabel";
import { SparkleIcon } from "@/components/app/icons";
import { Markdown } from "@/components/copilot/Markdown";
import { ActionCard } from "@/components/copilot/ActionCard";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/lib/copilot/types";

/**
 * MessageBubble — one turn in the copilot chat. User turns are a right-aligned bubble;
 * assistant turns render streamed markdown plus the brand's honesty furniture: a
 * verification Banner (when the orchestrator flags a safety-critical answer), source
 * CitationChips, a ConfidenceLabel, and read-tool activity. A caret shows live streaming.
 *
 * `footer` is an optional slot rendered at the bottom of an assistant turn's content column
 * (used by the full Copilot workspace to attach a per-answer action toolbar). The page-aware
 * bubble omits it, so its behaviour is unchanged.
 */
export function MessageBubble({
  message,
  footer,
}: {
  message: ChatMessage;
  footer?: React.ReactNode;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-lg rounded-br-sm bg-surface-3 px-3.5 py-2 text-sm text-primary">
          {message.content}
        </p>
      </div>
    );
  }

  const streaming = message.status === "streaming";
  const errored = message.status === "error";

  return (
    <div className="flex gap-2.5">
      <span
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-2 text-accent"
        aria-hidden="true"
      >
        <SparkleIcon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1 space-y-2.5">
        {/* Read-tool activity (calculations / reasoning). */}
        {message.tools && message.tools.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {message.tools.map((t) => (
              <li
                key={t.name}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border-subtle bg-surface-2 px-2 py-0.5 font-mono text-[0.7rem] text-secondary"
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    t.status === "running" ? "animate-pulse bg-warn motion-reduce:animate-none" : "bg-safe",
                  )}
                  aria-hidden="true"
                />
                {t.status === "running" ? `Running ${t.name}…` : `Ran ${t.name}`}
              </li>
            ))}
          </ul>
        )}

        {/* Verification / safety banner. */}
        {message.banner && (
          <Banner variant={message.banner.variant} title={message.banner.title}>
            {message.banner.text}
          </Banner>
        )}

        {/* Answer body (markdown). */}
        {message.content ? (
          <div className={cn(errored && "text-danger")}>
            <Markdown>{message.content}</Markdown>
          </div>
        ) : streaming ? (
          <p className="text-sm text-faint">Thinking…</p>
        ) : null}

        {streaming && message.content && (
          <span className="inline-block h-4 w-1.5 animate-pulse bg-accent align-text-bottom motion-reduce:animate-none" aria-hidden="true" />
        )}

        {/* Confidence + citations. */}
        {(message.confidence || (message.citations && message.citations.length > 0)) && (
          <div className="space-y-1.5 pt-0.5">
            {message.confidence && (
              <ConfidenceLabel level={message.confidence.level} note={message.confidence.note} />
            )}
            {message.citations && message.citations.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {message.citations.map((c, i) => (
                  <CitationChip key={`${c.source}-${i}`} source={c.source} href={c.href} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Proposed app actions (confirm cards for writes, chips for the rest). */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-col gap-2 pt-1">
            {message.actions.map((a) => (
              <ActionCard key={a.id} action={a} />
            ))}
          </div>
        )}

        {/* Per-answer toolbar slot (workspace only; bubble omits it). */}
        {footer && !streaming && message.content ? footer : null}
      </div>
    </div>
  );
}
