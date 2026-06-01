import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

/**
 * IntelligenceBand — "Not just operations. Intelligence." The rig-floor → control-room
 * → trading-desk progression. Deliberately secondary to ops/safety: this is the
 * "and there's more" that raises the ceiling. Carries the honesty guardrail in copy.
 */
const stops = [
  { label: "Rig floor", note: "the permit question" },
  { label: "Control room", note: "the operations picture" },
  { label: "Trading desk", note: "the cash-negative-at-today’s-Brent question" },
];

export function IntelligenceBand() {
  return (
    <Section surface="base" bordered>
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <Eyebrow>Not just operations. Intelligence.</Eyebrow>
          <h2 className="mt-3 text-h2 font-semibold text-primary">
            One domain-locked system, from the rig floor to the trading desk.
          </h2>
          <p className="mt-4 max-w-xl text-secondary">
            PetroBrain answers a field operator’s permit question and a planner’s “which
            fields are cash-negative at today’s Brent” question — reasoning over your own
            operations and the public market in one place.
          </p>
          <p className="mt-3 max-w-xl text-sm text-muted">
            It tells you what it can and can’t see, and never invents a number to look more
            complete.
          </p>
          <div className="mt-7">
            <Button href="/intelligence" variant="secondary">
              Explore the intelligence layer
            </Button>
          </div>
        </div>

        {/* Progression visual */}
        <ol className="flex items-stretch gap-2">
          {stops.map((s, i) => (
            <li key={s.label} className="flex flex-1 items-center gap-2">
              <div className="flex-1 rounded-lg border border-border-subtle bg-surface-1 p-4 text-center">
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-accent">
                  0{i + 1}
                </span>
                <p className="mt-2 text-sm font-semibold text-primary">{s.label}</p>
                <p className="mt-1 text-xs leading-snug text-faint">{s.note}</p>
              </div>
              {i < stops.length - 1 && (
                <span aria-hidden="true" className="hidden text-faint sm:block">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
