"use client";

import { useEffect, useRef, useState } from "react";
import { type DemoExample } from "@/lib/demoExamples";
import { usePrefersReducedMotion, useTypedReveal } from "@/components/shared/useTypedReveal";
import { buildExampleBlocks } from "@/components/shared/exampleBlocks";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import { demosEnabled } from "@/lib/featureFlags";
import { DemoDisabledBadge, DemoDisabledNote } from "@/components/shared/DemoDisabled";

/**
 * ExampleDemo — single canned-example demo widget (no question selector). Reuses the
 * shared typing engine and block renderer, so it behaves identically to the homepage
 * hero demo. Starts on scroll-into-view, honours prefers-reduced-motion, offers replay.
 * Used by the value-chain pages — one segment-relevant example each.
 */
export function ExampleDemo({ example }: { example: DemoExample }) {
  const [runToken, setRunToken] = useState(0);
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const disabled = !demosEnabled;

  const blocks = buildExampleBlocks(example);
  const { introLen, blocks: revealed, typingDone } = useTypedReveal({
    intro: example.intro,
    blockCount: blocks.length,
    runToken,
    reduced,
  });

  useEffect(() => {
    if (disabled) return; // demos off — never auto-run
    const node = rootRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !startedRef.current) {
          startedRef.current = true;
          setRunToken((t) => t + 1);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [disabled]);

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-xl border border-border-strong bg-surface-1 shadow-elev-3"
    >
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-2 px-4 py-2.5">
        <Logo asLink={false} className="[&_span]:text-sm" />
        <div className="flex items-center gap-2">
          {disabled && <DemoDisabledBadge />}
          {example.illustrative && <Badge tone="warn">Illustrative</Badge>}
          <Badge tone="accent" dot>
            Domain-locked
          </Badge>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5" aria-live="polite">
        <div className="flex justify-end">
          <p className="max-w-[88%] rounded-lg rounded-br-sm bg-surface-3 px-3.5 py-2 text-sm text-primary">
            {example.question}
          </p>
        </div>

        <div className="flex gap-3">
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-2 text-accent"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path d="M6 15c2-6 4-6 6 0s4 6 6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>

          <div className="min-w-0 flex-1 space-y-3">
            {disabled ? (
              /* Demos off — static, inert preview (no typing, no canned answer). */
              <>
                <p className="text-sm leading-relaxed text-secondary">{example.intro}</p>
                <DemoDisabledNote />
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-secondary">
                  {example.intro.slice(0, introLen)}
                  {!typingDone && (
                    <span className="ml-0.5 inline-block h-4 w-1.5 -translate-y-px animate-pulse-soft bg-accent align-middle" />
                  )}
                </p>

                {typingDone &&
                  blocks.slice(0, revealed).map((block, idx) => (
                    <div key={idx} className="animate-online-in">
                      {block}
                    </div>
                  ))}

                {typingDone && revealed >= blocks.length && (
                  <button
                    type="button"
                    onClick={() => setRunToken((t) => t + 1)}
                    className="text-xs text-faint underline underline-offset-2 hover:text-secondary"
                  >
                    ↻ Replay
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
