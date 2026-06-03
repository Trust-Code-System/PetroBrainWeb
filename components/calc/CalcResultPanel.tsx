"use client";

import { Banner } from "@/components/ui/Banner";
import { Badge } from "@/components/ui/Badge";
import type { CalcResult, CalcResultLine } from "@/lib/calc/types";

const DEFAULT_VERIFICATION =
  "Verify before acting. This is decision-support output from the deterministic engine — confirm against your well-control program and engineering authority before use.";

/**
 * CalcResultPanel — renders an engine result verbatim: the verification banner (when
 * safety-critical), formula, echoed inputs, worked steps, and the result line(s). Every
 * number here is the backend's; nothing is recomputed.
 */
export function CalcResultPanel({ result }: { result: CalcResult }) {
  return (
    <div className="space-y-4">
      {result.safetyCritical && (
        <Banner variant="warn" title="Safety-critical calculation">
          {result.verification ?? DEFAULT_VERIFICATION}
        </Banner>
      )}

      {/* Result line(s) — the headline output. */}
      <div className="rounded-lg border border-border-strong bg-surface-2 p-4">
        <p className="mb-2 font-mono text-xs uppercase tracking-wider text-faint">Result</p>
        <ul className="space-y-1.5">
          {result.results.map((r, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3">
              <span className="text-sm text-secondary">{r.label}</span>
              <span className="font-mono text-lg font-semibold tabular-nums text-primary">
                {formatValue(r)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {result.formula && (
        <Section label="Formula">
          <code className="block overflow-x-auto rounded-md border border-border-subtle bg-surface-2 p-3 font-mono text-sm text-primary">
            {result.formula}
          </code>
        </Section>
      )}

      {result.inputs.length > 0 && (
        <Section label="Inputs">
          <dl className="divide-y divide-border-subtle rounded-md border border-border-subtle">
            {result.inputs.map((inp, i) => (
              <div key={i} className="flex items-center justify-between gap-3 px-3 py-2">
                <dt className="text-sm text-secondary">{inp.label}</dt>
                <dd className="font-mono text-sm tabular-nums text-primary">{formatValue(inp)}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {result.steps.length > 0 && (
        <Section label="Steps">
          <ol className="space-y-2">
            {result.steps.map((s, i) => (
              <li key={i} className="rounded-md border border-border-subtle bg-surface-1 px-3 py-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm text-secondary">
                    <span className="mr-1.5 font-mono text-faint">{i + 1}.</span>
                    {s.label}
                  </span>
                  {(s.value !== undefined) && (
                    <span className="font-mono text-sm tabular-nums text-primary">
                      {formatValue({ label: s.label, value: s.value, unit: s.unit })}
                    </span>
                  )}
                </div>
                {s.expression && (
                  <code className="mt-1 block font-mono text-xs text-faint">{s.expression}</code>
                )}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {result.notes && <p className="text-xs leading-relaxed text-faint">{result.notes}</p>}

      {result.references && result.references.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {result.references.map((ref) => (
            <Badge key={ref} tone="neutral">
              {ref}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-1.5 font-mono text-xs uppercase tracking-wider text-faint">{label}</p>
      {children}
    </section>
  );
}

function formatValue(line: CalcResultLine): string {
  const v = typeof line.value === "number" ? line.value.toLocaleString("en-US", { maximumFractionDigits: 4 }) : line.value;
  return line.unit ? `${v} ${line.unit}` : `${v}`;
}
