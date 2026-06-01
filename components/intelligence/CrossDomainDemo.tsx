"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion, useTypedReveal } from "@/components/shared/useTypedReveal";
import { Badge } from "@/components/ui/Badge";
import { CitationChip } from "@/components/ui/CitationChip";
import { ConfidenceLabel } from "@/components/ui/ConfidenceLabel";
import { Banner } from "@/components/ui/Banner";
import { Logo } from "@/components/ui/Logo";
import { demosEnabled } from "@/lib/featureFlags";
import { DemoDisabledBadge, DemoDisabledNote } from "@/components/shared/DemoDisabled";

/**
 * CrossDomainDemo — the page's killer proof: one question reasoned across PUBLIC
 * market data and the operator's OWN field economics, returning a ranked list with
 * breakeven math. Canned, no backend. Reuses the homepage typing engine
 * (components/shared/useTypedReveal) and honours prefers-reduced-motion.
 *
 * HONESTY: every figure here is ILLUSTRATIVE and labelled as such. We never present
 * data we don't own as if we do.
 */

const QUESTION = "Brent just dropped 8% — which of my fields go cash-negative?";

const INTRO =
  "This spans public market data and your own field economics — the half a market dashboard can't answer, because it doesn't know your wells. Reasoning across both (figures below are illustrative):";

// Illustrative market reference.
const BRENT = 78.0;
const NEW_BRENT = +(BRENT * 0.92).toFixed(1); // −8%

// Illustrative field economics ("the operator's own data").
type FieldRow = { name: string; basin: string; breakeven: number };
const FIELDS: FieldRow[] = [
  { name: "Field Cresta", basin: "Deepwater", breakeven: 80 },
  { name: "Field Aso", basin: "Niger Delta", breakeven: 74 },
  { name: "Field Bele", basin: "Swamp", breakeven: 68 },
  { name: "Field Delta", basin: "Onshore", breakeven: 58 },
];

function ranked() {
  return FIELDS.map((f) => ({
    ...f,
    margin: +(NEW_BRENT - f.breakeven).toFixed(1),
    negative: f.breakeven > NEW_BRENT,
  })).sort((a, b) => a.margin - b.margin);
}

export function CrossDomainDemo() {
  const [runToken, setRunToken] = useState(0);
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const disabled = !demosEnabled;

  const rows = ranked();
  const negatives = rows.filter((r) => r.negative);

  const blocks = buildBlocks(rows, negatives);
  const { introLen, blocks: revealed, typingDone } = useTypedReveal({
    intro: INTRO,
    blockCount: blocks.length,
    runToken,
    reduced,
  });

  // Start on scroll-into-view.
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
            Domain-locked
          </Badge>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-5" aria-live="polite">
        <div className="flex justify-end">
          <p className="max-w-[88%] rounded-lg rounded-br-sm bg-surface-3 px-3.5 py-2 text-sm text-primary">
            {QUESTION}
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
                <p className="text-sm leading-relaxed text-secondary">{INTRO}</p>
                <DemoDisabledNote />
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-secondary">
                  {INTRO.slice(0, introLen)}
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

type Row = FieldRow & { margin: number; negative: boolean };

function buildBlocks(rows: Row[], negatives: Row[]): React.ReactNode[] {
  const blocks: React.ReactNode[] = [];

  // 1 — Market context (public).
  blocks.push(
    <div className="rounded-md border border-border-subtle bg-base p-3">
      <p className="font-mono text-xs uppercase tracking-wider text-faint">Public market</p>
      <code className="mt-1 block font-mono text-sm text-primary">
        Brent ≈ <span className="text-accent">${BRENT.toFixed(1)}</span>/bbl → −8% ≈{" "}
        <span className="text-accent">${NEW_BRENT.toFixed(1)}</span>/bbl
      </code>
      <div className="mt-2">
        <CitationChip source="EIA · Brent spot (illustrative)" />
      </div>
    </div>,
  );

  // 2 — Breakeven relation.
  blocks.push(
    <div className="rounded-md border border-border-subtle bg-base p-3">
      <code className="block font-mono text-sm text-accent">
        cash_margin/bbl = realised_price − (OPEX + transport + royalty)
      </code>
      <p className="mt-1.5 font-mono text-[0.7rem] text-faint">
        breakeven = the realised price at which cash_margin = 0
      </p>
    </div>,
  );

  // 3 — Ranked list across the operator's own fields.
  blocks.push(
    <div className="overflow-hidden rounded-md border border-border-subtle">
      <div className="flex items-center justify-between bg-surface-2 px-3 py-1.5">
        <span className="font-mono text-xs text-faint">your fields · ranked by margin @ ${NEW_BRENT.toFixed(1)}</span>
        <CitationChip source="Your connected cost data (illustrative)" />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-left text-xs text-faint">
            <th className="px-3 py-1.5 font-medium">Field</th>
            <th className="px-3 py-1.5 font-medium">Breakeven</th>
            <th className="px-3 py-1.5 font-medium">Margin</th>
            <th className="px-3 py-1.5 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-border-subtle last:border-0">
              <td className="px-3 py-2">
                <span className="font-sans text-primary">{r.name}</span>{" "}
                <span className="font-sans text-faint">· {r.basin}</span>
              </td>
              <td className="px-3 py-2 text-secondary">${r.breakeven.toFixed(1)}</td>
              <td className={cn("px-3 py-2", r.negative ? "text-danger" : "text-safe")}>
                {r.margin > 0 ? "+" : ""}
                {r.margin.toFixed(1)}
              </td>
              <td className="px-3 py-2">
                {r.negative ? (
                  <Badge tone="danger">cash-negative</Badge>
                ) : (
                  <Badge tone="safe">positive</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
  );

  // 4 — Result + the inside-out point.
  blocks.push(
    <div className="space-y-2">
      <p className="rounded-md border-l-2 border-accent bg-surface-2 px-3 py-2 text-sm font-medium text-primary">
        {negatives.length} of {rows.length} fields go cash-negative at ${NEW_BRENT.toFixed(1)}/bbl
        (illustrative): {negatives.map((n) => n.name).join(" and ")}.
      </p>
      <p className="text-sm leading-relaxed text-secondary">
        The market half is public; the field-economics half is yours. A market-data vendor has
        the first and none of the second — which is why it can show you the price move, but not
        which of <em>your</em> fields it puts underwater.
      </p>
    </div>,
  );

  // 5 — Sources, confidence, honesty.
  blocks.push(
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <CitationChip source="EIA · Brent spot (illustrative)" />
        <CitationChip source="Your connected cost data (illustrative)" />
      </div>
      <ConfidenceLabel
        level="low"
        note="shown with illustrative field economics — connect yours for real figures"
      />
      <Banner variant="warn" title="Illustrative — not live data">
        These fields and figures are an example. PetroBrain reasons over your real fields once
        connected, cites every source, and won&apos;t invent a number to fill a gap.
      </Banner>
    </div>,
  );

  return blocks;
}
