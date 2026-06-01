import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { StageBadge, type Stage } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { HonestyBox } from "@/components/ui/HonestyBox";
import { TechBackground } from "@/components/ui/TechBackground";
import { CrossDomainDemo } from "@/components/intelligence/CrossDomainDemo";
import { ctas } from "@/lib/site";

export const metadata: Metadata = {
  title: "Market & asset intelligence",
  description:
    "Intelligence, reasoned — not just displayed. PetroBrain starts inside your own operations, layers public and market context on top, and reasons across both. The cross-domain answer a market-data vendor can’t give you.",
};

/* Four capability cards, each honestly stage-labelled. */
type Capability = {
  title: string;
  blurb: string;
  href?: string;
  badges: { stage: Stage; note?: string }[];
};

const capabilities: Capability[] = [
  {
    title: "Emissions & MRV Intelligence",
    blurb:
      "Source-level methane and GHG quantification, reconciled with public satellite data, in an audit-grade trail. Our strongest card — built and live.",
    href: "/mrv",
    badges: [{ stage: "live" }],
  },
  {
    title: "Asset Intelligence",
    blurb:
      "Reason over your own field, well and production reality — the data the global incumbents structurally can’t see.",
    badges: [
      { stage: "live", note: "your data" },
      { stage: "expanding", note: "West African benchmarks" },
    ],
  },
  {
    title: "Market Reasoning",
    blurb:
      "Reason over public market balances and activity. We never claim to own market data we don’t — connect your own feed and we reason over it on your behalf.",
    badges: [
      { stage: "live", note: "public: EIA, OPEC, IEA, rig counts" },
      { stage: "roadmap", note: "connect your Platts/Argus feed (on request)" },
    ],
  },
  {
    title: "Cost Intelligence",
    blurb:
      "Reason over your own cost and project data today; honest about the West African benchmark forming underneath.",
    badges: [
      { stage: "live", note: "your data" },
      { stage: "expanding", note: "West African benchmarks building" },
    ],
  },
];

/* Inside-out vs outside-in contrast. */
const outsideIn = [
  "Models your field from the outside, with global averages.",
  "Has the market price — but not your wells, costs or incidents.",
  "A dashboard you go and read; it doesn’t know your operations.",
  "Same generic answer for every operator.",
];
const insideOut = [
  "Starts from your actual production, maintenance and incident data.",
  "Layers public and market context on top of your own reality.",
  "Answers in plain English, cited and calculated, across both.",
  "Specific to your fields — because it reasons over them directly.",
];

export default function IntelligencePage() {
  return (
    <>
      {/* 1 — Hero */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <TechBackground variant="contour" />
        <Container className="relative py-16 lg:py-24">
          <Eyebrow>Market &amp; asset intelligence</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-display font-semibold text-primary">
            Intelligence, reasoned — not just displayed.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">
            PetroBrain starts inside your own operations — your production, your maintenance, your
            incidents — then layers public and market context on top and reasons across both.
            That’s intelligence a dashboard can’t give you, because a dashboard doesn’t know your
            wells.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={ctas.primary.href} size="lg">
              {ctas.primary.label}
            </Button>
            <Button href="#demo" variant="secondary" size="lg">
              See it reason
            </Button>
          </div>
        </Container>
      </section>

      {/* 2 — The killer cross-domain demo */}
      <Section surface="1" bordered>
        <div id="demo" className="scroll-mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="text-center">The proof</Eyebrow>
            <h2 className="mt-3 text-h2 font-semibold text-primary">
              The question a market-data vendor can’t answer.
            </h2>
            <p className="mt-4 text-secondary">
              One question, reasoned across public market data and your own field economics — and a
              ranked answer with the breakeven math shown. This is the whole point of an
              intelligence layer that starts inside your operations.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <CrossDomainDemo />
          </div>
        </div>
      </Section>

      {/* 3 — Capability cards */}
      <Section surface="base" bordered>
        <Eyebrow>What’s live, what’s expanding</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          Four capabilities — each labelled honestly by stage.
        </h2>
        <p className="mt-4 max-w-2xl text-secondary">
          We never blur what’s live now with what’s on the way. The badges are a contract.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {capabilities.map((c) => (
            <Card key={c.title} href={c.href} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-primary">{c.title}</h3>
                {c.href && (
                  <span aria-hidden="true" className="text-accent">
                    →
                  </span>
                )}
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary">{c.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.badges.map((b) => (
                  <StageBadge key={b.stage + (b.note ?? "")} stage={b.stage} note={b.note} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* 4 — Inside-out explainer */}
      <Section surface="1" bordered>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow className="text-center">The wedge</Eyebrow>
          <h2 className="mt-3 text-h2 font-semibold text-primary">Inside-out beats outside-in.</h2>
          <p className="mt-4 text-secondary">
            Most intelligence platforms look at your assets from the outside, with global models.
            PetroBrain starts inside — then adds the outside context. It’s a different category,
            not a cheaper version of the same thing.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-border-subtle bg-surface-2 p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-wider text-faint">
              Outside-in · the data vendors
            </p>
            <ul className="mt-4 space-y-3">
              {outsideIn.map((p) => (
                <li key={p} className="flex gap-3 text-sm text-secondary">
                  <span aria-hidden="true" className="mt-1.5 h-1 w-3 shrink-0 rounded-full bg-grey-600" />
                  <span className="leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-accent/40 bg-surface-2 p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-wider text-accent">
              Inside-out · PetroBrain
            </p>
            <ul className="mt-4 space-y-3">
              {insideOut.map((p) => (
                <li key={p} className="flex gap-3 text-sm text-primary">
                  <span aria-hidden="true" className="mt-1.5 h-1 w-3 shrink-0 rounded-full bg-accent" />
                  <span className="leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 5 — Honesty box */}
      <Section surface="base" bordered>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="text-center">The honesty box</Eyebrow>
          <h2 className="mt-3 text-h2 font-semibold text-primary">
            It never invents a number to look complete.
          </h2>
        </div>
        <HonestyBox
          className="mt-8"
          note="Market reasoning is held to the same standard as engineering reasoning: cited, calculated, and honest about what it can’t see."
        />
      </Section>

      {/* 6 — Vision strip (subtle, future tense) */}
      <Section surface="1" bordered>
        <div className="rounded-xl border border-dashed border-border-strong bg-surface-1 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-faint">
                The trajectory · future tense
              </p>
              <p className="mt-2 max-w-2xl text-lg text-primary">
                Today, the intelligence layer over your operations. Tomorrow, the definitive data
                platform for the African upstream — and beyond.
              </p>
            </div>
            <Button href="/about" variant="secondary" className="shrink-0">
              See the vision →
            </Button>
          </div>
        </div>
      </Section>

      {/* 7 — CTA */}
      <section className="relative overflow-hidden border-t border-border-subtle bg-base">
        <TechBackground variant="grid" />
        <Container className="relative py-20 text-center md:py-24">
          <h2 className="mx-auto max-w-2xl text-h1 font-semibold text-primary">
            Ask it the cross-domain question.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary">
            Bring a question that spans the market and your own operations — and watch it reason
            across both, with the sources shown.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href={ctas.primary.href} size="lg">
              {ctas.primary.label}
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
