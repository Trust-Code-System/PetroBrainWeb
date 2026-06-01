"use client";

import { useEffect, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

/**
 * MrvBand — a live countdown to the NUPRC Tier-3 MRV deadline (1 Jan 2027) and a
 * hook into the 2-minute readiness check. The countdown is computed client-side from
 * the real current date (no fabricated number); renders a stable placeholder before
 * mount to avoid hydration mismatch.
 */
const DEADLINE = new Date("2027-01-01T00:00:00Z");

function daysUntil(target: Date): number {
  const ms = target.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function MrvBand() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntil(DEADLINE));
    const id = setInterval(() => setDays(daysUntil(DEADLINE)), 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Section surface="base" bordered>
      <div className="overflow-hidden rounded-xl border border-accent/30 bg-surface-1">
        <div className="grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <Eyebrow>NUPRC Tier-3 MRV</Eyebrow>
            <h2 className="mt-3 text-h2 font-semibold text-primary">
              The methane deadline is a date, not a someday.
            </h2>
            <p className="mt-3 max-w-xl text-secondary">
              Source-level, audit-grade reporting is becoming mandatory. Find out where you
              stand — and what’s missing — in about two minutes.
            </p>
            <div className="mt-6">
              <Button href="/mrv" size="lg">
                Check your readiness
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-border-subtle bg-base px-6 py-5">
            <div className="text-center">
              <p
                className="font-mono text-4xl font-semibold tabular-nums text-accent"
                aria-live="polite"
              >
                {days === null ? "—" : days.toLocaleString()}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-faint">days left</p>
            </div>
            <div className="h-12 w-px bg-border-subtle" aria-hidden="true" />
            <p className="text-sm leading-snug text-secondary">
              to 1 Jan 2027
              <br />
              <span className="text-faint">Tier-3 MRV</span>
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
