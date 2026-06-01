"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { demoExamples } from "@/lib/demoExamples";
import { usePrefersReducedMotion, useTypedReveal } from "@/components/shared/useTypedReveal";
import { buildExampleBlocks } from "@/components/shared/exampleBlocks";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import { demosEnabled } from "@/lib/featureFlags";
import { DemoDisabledBadge, DemoDisabledNote } from "@/components/shared/DemoDisabled";

/**
 * HeroDemo — the canned, reduced-motion-aware demo widget.
 * Pick a sample question; PetroBrain "types" the intro, then reveals the formula,
 * steps, result, source(s), confidence and a verification banner — block by block,
 * like instrumentation coming online. With prefers-reduced-motion, everything renders
 * instantly. No backend; content is from lib/demoExamples.ts. Typing engine is shared
 * with the /intelligence cross-domain demo (components/shared/useTypedReveal).
 */
export function HeroDemo() {
  const [activeId, setActiveId] = useState<string>(demoExamples[0]!.id);
  const [runToken, setRunToken] = useState(0); // bump to (re)play the animation
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const disabled = !demosEnabled;

  const example = demoExamples.find((e) => e.id === activeId) ?? demoExamples[0]!;

  // Number of structured blocks after the intro: formula? + steps + tail(result/footer)
  const blockCount = (example.formula ? 1 : 0) + example.steps.length + 1;

  // Start the first run when the widget scrolls into view (so "See it work" lands fresh).
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
      { threshold: 0.35 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [disabled]);

  const { introLen, blocks, typingDone } = useTypedReveal({
    intro: example.intro,
    blockCount,
    runToken,
    reduced,
  });

  const select = (id: string) => {
    if (disabled) return;
    setActiveId(id);
    setRunToken((t) => t + 1);
  };

  // Build the ordered structured blocks, then reveal `blocks` of them.
  const structured = buildExampleBlocks(example);

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-xl border border-border-strong bg-surface-1 shadow-elev-3"
    >
      {/* Console header */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-2 px-4 py-2.5">
        <Logo asLink={false} className="[&_span]:text-sm" />
        <div className="flex items-center gap-2">
          {disabled && <DemoDisabledBadge />}
          <Badge tone="accent" dot>
            Domain-locked
          </Badge>
        </div>
      </div>

      {/* Question chips */}
      <div className="flex flex-wrap gap-2 border-b border-border-subtle p-3">
        {demoExamples.map((ex) => {
          const active = ex.id === activeId;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => select(ex.id)}
              disabled={disabled}
              aria-pressed={active}
              className={cn(
                "rounded-md border px-3 py-1.5 text-left text-xs font-medium transition-colors",
                active
                  ? "border-accent/50 bg-accent-muted text-accent"
                  : "border-border-subtle bg-surface-2 text-secondary hover:border-border-strong hover:text-primary",
                disabled && "cursor-not-allowed opacity-50 hover:border-border-subtle hover:text-secondary",
              )}
            >
              {ex.chip}
            </button>
          );
        })}
      </div>

      {/* Transcript */}
      <div className="space-y-4 p-4 sm:p-5" aria-live="polite">
        {/* User question */}
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-lg rounded-br-sm bg-surface-3 px-3.5 py-2 text-sm text-primary">
            {example.question}
          </p>
        </div>

        {/* Assistant answer */}
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
                {/* Typed intro */}
                <p className="text-sm leading-relaxed text-secondary">
                  {example.intro.slice(0, introLen)}
                  {!typingDone && (
                    <span className="ml-0.5 inline-block h-4 w-1.5 -translate-y-px animate-pulse-soft bg-accent align-middle" />
                  )}
                </p>

                {/* Structured blocks revealed in order */}
                {typingDone &&
                  structured.slice(0, blocks).map((block, idx) => (
                    <div key={`${example.id}-${idx}`} className="animate-online-in">
                      {block}
                    </div>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
