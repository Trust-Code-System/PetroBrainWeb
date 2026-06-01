"use client";

import { useEffect, useState } from "react";
import { differenceInSeconds } from "date-fns";

/**
 * MrvCountdown — live client-side countdown to the NUPRC Tier-3 MRV deadline
 * (1 Jan 2027). Uses date-fns for the diff; ticks every second. Renders a stable
 * placeholder before mount to avoid hydration mismatch, and stops at zero.
 */
const DEADLINE = new Date("2027-01-01T00:00:00Z");

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function remaining(): Parts {
  const total = Math.max(0, differenceInSeconds(DEADLINE, new Date()));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

const UNITS: { key: keyof Parts; label: string }[] = [
  { key: "days", label: "days" },
  { key: "hours", label: "hrs" },
  { key: "minutes", label: "min" },
  { key: "seconds", label: "sec" },
];

export function MrvCountdown() {
  const [parts, setParts] = useState<Parts | null>(null);

  useEffect(() => {
    setParts(remaining());
    const id = setInterval(() => setParts(remaining()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="inline-flex flex-col gap-3 rounded-xl border border-accent/30 bg-surface-1 p-5"
      role="timer"
      aria-label="Time remaining until the 1 January 2027 NUPRC Tier-3 MRV deadline"
    >
      <div className="flex items-end gap-3 sm:gap-4">
        {UNITS.map(({ key, label }) => (
          <div key={key} className="text-center">
            <div className="min-w-[3.25rem] rounded-md border border-border-subtle bg-base px-2 py-2 font-mono text-3xl font-semibold tabular-nums text-accent sm:text-4xl">
              {parts === null ? "––" : String(parts[key]).padStart(2, "0")}
            </div>
            <p className="mt-1.5 text-[0.65rem] uppercase tracking-wider text-faint">{label}</p>
          </div>
        ))}
      </div>
      <p className="font-mono text-xs text-secondary">until 1 Jan 2027 · NUPRC Tier-3 MRV</p>
    </div>
  );
}
