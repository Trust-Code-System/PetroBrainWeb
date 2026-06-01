"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * ValueChainBand — interactive Upstream → Midstream → Downstream selector.
 * Hover or tap a segment to reveal capability depth; each links to its page.
 * Keyboard-accessible (arrow/enter via native buttons + tablist semantics).
 */
type Segment = {
  id: string;
  label: string;
  href: string;
  blurb: string;
  capabilities: string[];
};

const segments: Segment[] = [
  {
    id: "upstream",
    label: "Upstream",
    href: "/upstream",
    blurb: "Drilling, well integrity and production — where safety-critical decisions happen fastest.",
    capabilities: [
      "Well-control kill sheets, worked and cited",
      "Well & reservoir reasoning over your own field data",
      "Production allocation and deferment context",
      "Methane & flaring quantification for MRV",
    ],
  },
  {
    id: "midstream",
    label: "Midstream",
    href: "/midstream",
    blurb: "Pipelines, compression and storage — integrity and operating limits under standards.",
    capabilities: [
      "MAOP / integrity limits per ASME B31.8",
      "Pigging, inspection and corrosion records reasoning",
      "Compression and throughput troubleshooting",
      "Custody-transfer and metering context",
    ],
  },
  {
    id: "downstream",
    label: "Downstream",
    href: "/downstream",
    blurb: "Refining and processing — procedures, process safety and turnaround support.",
    capabilities: [
      "Unit procedures and SOP retrieval, sourced",
      "Process-safety and relief-system context",
      "Turnaround and maintenance history reasoning",
      "Product spec and quality troubleshooting",
    ],
  },
];

export function ValueChainBand() {
  const [activeId, setActiveId] = useState(segments[0]!.id);
  const active = segments.find((s) => s.id === activeId) ?? segments[0]!;

  return (
    <Section surface="1" bordered>
      <Eyebrow>Across the value chain</Eyebrow>
      <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
        Domain depth at every stage — not a generalist with an oil-and-gas skin.
      </h2>

      <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        {/* Selector */}
        <div role="tablist" aria-label="Value chain stage" className="flex flex-col gap-2">
          {segments.map((s, i) => {
            const isActive = s.id === activeId;
            return (
              <button
                key={s.id}
                role="tab"
                id={`vc-tab-${s.id}`}
                aria-selected={isActive}
                aria-controls={`vc-panel-${s.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveId(s.id)}
                onMouseEnter={() => setActiveId(s.id)}
                onFocus={() => setActiveId(s.id)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                    e.preventDefault();
                    setActiveId(segments[(i + 1) % segments.length]!.id);
                  } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    setActiveId(segments[(i - 1 + segments.length) % segments.length]!.id);
                  }
                }}
                className={cn(
                  "group flex items-center justify-between rounded-lg border px-5 py-4 text-left transition-colors",
                  isActive
                    ? "border-accent/50 bg-accent-muted"
                    : "border-border-subtle bg-surface-2 hover:border-border-strong",
                )}
              >
                <span className="flex items-center gap-3">
                  <span className={cn("font-mono text-xs", isActive ? "text-accent" : "text-faint")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={cn("text-base font-semibold", isActive ? "text-primary" : "text-secondary")}>
                    {s.label}
                  </span>
                </span>
                <span aria-hidden="true" className={cn("text-lg", isActive ? "text-accent" : "text-faint")}>
                  →
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div
          role="tabpanel"
          id={`vc-panel-${active.id}`}
          aria-labelledby={`vc-tab-${active.id}`}
          className="rounded-lg border border-border-subtle bg-surface-2 p-6"
        >
          <p className="text-secondary">{active.blurb}</p>
          <ul className="mt-5 space-y-2.5">
            {active.capabilities.map((c) => (
              <li key={c} className="flex gap-2.5 text-sm text-primary">
                <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span className="leading-relaxed">{c}</span>
              </li>
            ))}
          </ul>
          <Link
            href={active.href}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
          >
            Explore {active.label.toLowerCase()} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </Section>
  );
}
