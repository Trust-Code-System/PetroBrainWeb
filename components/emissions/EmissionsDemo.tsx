"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { emissionsDemo } from "@/lib/emissionsDemo";
import { usePrefersReducedMotion, useTypedReveal } from "@/components/shared/useTypedReveal";
import { Badge } from "@/components/ui/Badge";
import { CitationChip } from "@/components/ui/CitationChip";
import { ConfidenceLabel } from "@/components/ui/ConfidenceLabel";
import { Banner } from "@/components/ui/Banner";
import { Logo } from "@/components/ui/Logo";
import { demosEnabled } from "@/lib/featureFlags";
import { DemoDisabledBadge, DemoDisabledNote } from "@/components/shared/DemoDisabled";

/**
 * EmissionsDemo — the page's killer proof: reconcile the operator's REPORTED flaring
 * against independent SATELLITE observation, quantify the variance, and flag where
 * observed exceeds reported. This is the verification no horizontal carbon tool has.
 * Canned, no backend. Reuses the homepage typing engine
 * (components/shared/useTypedReveal) and honours prefers-reduced-motion. All content
 * is editable in lib/emissionsDemo.ts.
 *
 * HONESTY: the satellite-observed figure is ILLUSTRATIVE and labelled as such — we
 * never present an observation we didn't pull as if it were live.
 */

const fmt = new Intl.NumberFormat("en-US");

export function EmissionsDemo() {
  const [runToken, setRunToken] = useState(0);
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const disabled = !demosEnabled;

  const d = emissionsDemo;
  const variancePct = +(((d.observed.value - d.reported.value) / d.reported.value) * 100).toFixed(1);
  const observedExceeds = d.observed.value > d.reported.value;

  const blocks = buildBlocks(variancePct, observedExceeds);
  const { introLen, blocks: revealed, typingDone } = useTypedReveal({
    intro: d.intro,
    blockCount: blocks.length,
    runToken,
    reduced,
  });

  // Start on scroll-into-view (so "See it work" lands fresh).
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
          <Badge tone="warn">Illustrative</Badge>
          <Badge tone="accent" dot>
            Verified vs satellite
          </Badge>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5" aria-live="polite">
        <div className="flex justify-end">
          <p className="max-w-[88%] rounded-lg rounded-br-sm bg-surface-3 px-3.5 py-2 text-sm text-primary">
            {d.question}
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
                <p className="text-sm leading-relaxed text-secondary">{d.intro}</p>
                <DemoDisabledNote />
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-secondary">
                  {d.intro.slice(0, introLen)}
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

function buildBlocks(variancePct: number, observedExceeds: boolean): React.ReactNode[] {
  const d = emissionsDemo;
  const blocks: React.ReactNode[] = [];

  // 1 — The reconciliation readout: reported vs observed vs variance, mono numbers.
  blocks.push(
    <div className="overflow-hidden rounded-md border border-border-subtle">
      <div className="flex items-center justify-between bg-surface-2 px-3 py-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-faint">
          Q3 flaring · reported vs observed
        </span>
      </div>
      <table className="w-full text-sm">
        <tbody className="font-mono">
          <tr className="border-b border-border-subtle">
            <td className="px-3 py-2">
              <span className="font-sans text-secondary">Reported</span>
            </td>
            <td className="px-3 py-2 text-right text-primary">
              {fmt.format(d.reported.value)} <span className="text-faint">{d.reported.unit}</span>
            </td>
          </tr>
          <tr className="border-b border-border-subtle">
            <td className="px-3 py-2">
              <span className="font-sans text-secondary">Observed</span>{" "}
              <span className="font-sans text-faint">· satellite</span>
            </td>
            <td className="px-3 py-2 text-right text-primary">
              {fmt.format(d.observed.value)} <span className="text-faint">{d.observed.unit}</span>
            </td>
          </tr>
          <tr>
            <td className="px-3 py-2">
              <span className="font-sans text-secondary">Variance</span>
            </td>
            <td
              className={cn(
                "px-3 py-2 text-right font-semibold",
                observedExceeds ? "text-danger" : "text-safe",
              )}
            >
              {variancePct > 0 ? "+" : ""}
              {variancePct.toFixed(1)}%
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle bg-surface-2 px-3 py-2">
        <CitationChip source={d.reported.source} href={d.reported.href} />
        <CitationChip source={`${d.observed.source} (illustrative)`} href={d.observed.href} />
      </div>
    </div>,
  );

  // 2 — How the reconciliation was built.
  blocks.push(
    <div className="space-y-2">
      {d.steps.map((step, i) => (
        <div key={i} className="flex gap-2.5 text-sm text-secondary">
          <span className="mt-0.5 font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
          <span className="leading-relaxed">{step}</span>
        </div>
      ))}
    </div>,
  );

  // 3 — The flag (only meaningful when observed exceeds reported).
  if (observedExceeds) {
    blocks.push(
      <Banner variant="warn" title={`Flag — observed exceeds reported by ${variancePct.toFixed(1)}%`}>
        {d.flagWhenObservedExceeds}
      </Banner>,
    );
  }

  // 4 — Sources, confidence, verification.
  blocks.push(
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {d.citations.map((c) => (
          <CitationChip key={c.source} source={c.source} href={c.href} />
        ))}
      </div>
      <ConfidenceLabel level="medium" note={d.confidenceNote} />
      <Banner variant="warn" title="Verify with the competent person">
        {d.verification}
      </Banner>
    </div>,
  );

  return blocks;
}
