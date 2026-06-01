import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { StageBadge, type Stage } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { HonestyBox } from "@/components/ui/HonestyBox";
import { TechBackground } from "@/components/ui/TechBackground";
import { EmissionsDemo } from "@/components/emissions/EmissionsDemo";
import { ctas } from "@/lib/site";

export const metadata: Metadata = {
  title: "Emissions Intelligence",
  description:
    "The only emissions intelligence built into your operations — measured from your real production data, verified against satellites, reported to NUPRC, OGMP 2.0 and CSRD, with abatement modelled against your actual assets. Inside-out, not outside-in. Vertical oil & gas, not horizontal ESG.",
};

/* Four capability cards — each honestly stage-labelled. */
type Capability = {
  title: string;
  blurb: string;
  href?: string;
  badges: { stage: Stage; note?: string }[];
};

const capabilities: Capability[] = [
  {
    title: "Operational emissions measurement",
    blurb:
      "Scope 1 flaring, venting, fugitives and combustion built directly from your real SCADA and production data — not generic activity factors. The inventory starts inside the operation.",
    badges: [{ stage: "live", note: "your data" }],
  },
  {
    title: "Satellite verification",
    blurb:
      "Cross-check reported flaring and methane against independent satellite observation, and surface the variance. The trust differentiator no horizontal carbon tool has.",
    badges: [{ stage: "live", note: "public satellite data" }],
  },
  {
    title: "Multi-framework reporting",
    blurb:
      "One measured inventory, every framework: NUPRC GHGEMP, OGMP 2.0, CSRD and ISO 14064. OGMP 2.0 carries a 0.2% methane-intensity target and zero routine flaring by 2030 — reported from the same source data.",
    href: "/mrv",
    badges: [{ stage: "live" }],
  },
  {
    title: "Abatement modelling",
    blurb:
      "Model reduction options and their cost against your actual assets, and surface the net-negative-cost measures — the ones that pay for themselves before any carbon price.",
    badges: [{ stage: "expanding" }],
  },
];

/* Inside-out vs outside-in contrast. */
const outsideIn = [
  "Estimates a corporate footprint from generic activity data and spend.",
  "Same emission-factor library for every operator on earth.",
  "Can't see a flare it isn't told about — and can't check the number it's given.",
  "A horizontal ESG ledger you reconcile by hand, after the fact.",
];
const insideOut = [
  "Measures Scope 1 from your real SCADA, flare meters and production data.",
  "Verifies your reported flaring and methane against independent satellites.",
  "Flags where observation and report disagree — before a regulator does.",
  "Built into the operation, vertical to oil & gas, reported to every framework.",
];

export default function EmissionsIntelligencePage() {
  return (
    <>
      {/* 1 — Hero */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <TechBackground variant="contour" />
        <Container className="relative py-16 lg:py-24">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>Emissions Intelligence</Eyebrow>
            <StageBadge stage="live" />
          </div>
          <h1 className="mt-4 max-w-4xl text-display font-semibold text-primary">
            The only emissions intelligence built{" "}
            <span className="text-accent">into your operations</span>.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-secondary">
            Measured from your real production data, verified against satellites, reported to NUPRC,
            OGMP 2.0 and CSRD, with abatement modelled against your actual assets. Every horizontal
            ESG tool calculates a footprint from the outside, with generic data. PetroBrain works{" "}
            <span className="text-primary">inside-out</span> — and it reasons over oil &amp; gas, not
            ESG in general.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={ctas.primary.href} size="lg">
              {ctas.primary.label}
            </Button>
            <Button href="#demo" variant="secondary" size="lg">
              See it work
            </Button>
          </div>
        </Container>
      </section>

      {/* 2 — The killer demo: flaring reconciliation vs satellite */}
      <Section surface="1" bordered>
        <div id="demo" className="scroll-mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="text-center">The proof</Eyebrow>
            <h2 className="mt-3 text-h2 font-semibold text-primary">
              Reconcile what you reported against what the sky saw.
            </h2>
            <p className="mt-4 text-secondary">
              Ask it to check your reported flaring against satellite observation. It returns your
              reported figure, the satellite-observed figure, the variance, and a flag where
              observation exceeds report — each line sourced. This is the verification a carbon
              calculator structurally can&apos;t do.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <EmissionsDemo />
          </div>
        </div>
      </Section>

      {/* 3 — Capability cards */}
      <Section surface="base" bordered>
        <Eyebrow>What&apos;s live, what&apos;s expanding</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          Four capabilities — each labelled honestly by stage.
        </h2>
        <p className="mt-4 max-w-2xl text-secondary">
          Measured inside your operation, verified from space, reported to every framework, and
          modelled for abatement. The badges are a contract — we never blur what&apos;s live with
          what&apos;s on the way.
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

      {/* 4 — Inside-out vs outside-in */}
      <Section surface="1" bordered>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow className="text-center">The category difference</Eyebrow>
          <h2 className="mt-3 text-h2 font-semibold text-primary">Inside-out, not outside-in.</h2>
          <p className="mt-4 text-secondary">
            Generic ESG platforms estimate your emissions from the outside, with global averages and
            spend data. PetroBrain measures them from inside your operations — and verifies them from
            space. That&apos;s a different category, not a cheaper carbon ledger.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-border-subtle bg-surface-2 p-6 sm:p-8">
            <p className="font-mono text-xs uppercase tracking-wider text-faint">
              Outside-in · horizontal ESG tools
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
            It reports what it can measure and verify.
          </h2>
        </div>
        <HonestyBox
          className="mt-8"
          note="When satellite data isn't available for an asset, it says so rather than guessing. Abatement costs are reference estimates to validate against your reality. It never invents an emission figure to look more complete."
        />
      </Section>

      {/* 6 — Regulatory-deadline tie-in (siblings: /mrv) */}
      <Section surface="1" bordered>
        <div className="rounded-xl border border-accent/40 bg-surface-2 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-wider text-accent">
                The deadlines are converging
              </p>
              <h2 className="mt-2 text-h3 font-semibold text-primary">
                NUPRC Tier-3 MRV and OGMP 2.0 are the same measured inventory.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-secondary">
                Nigeria&apos;s NUPRC Tier-3 methane deadline and OGMP 2.0&apos;s 0.2% methane-intensity
                target and zero-routine-flaring-by-2030 commitment all demand measured, verifiable
                emissions — not estimates. This page and the MRV readiness page are siblings: the
                same measurement and satellite reconciliation feed both. Check where you stand against
                the NUPRC clock.
              </p>
            </div>
            <Button href="/mrv" variant="secondary" className="shrink-0">
              See the NUPRC Tier-3 deadline →
            </Button>
          </div>
        </div>
      </Section>

      {/* 7 — CTA */}
      <section className="relative overflow-hidden border-t border-border-subtle bg-base">
        <TechBackground variant="grid" />
        <Container className="relative py-20 text-center md:py-24">
          <h2 className="mx-auto max-w-2xl text-h1 font-semibold text-primary">
            Measure it inside. Verify it from space.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary">
            Bring your flaring, venting and production data to a focused walkthrough, and watch
            PetroBrain build the inventory, reconcile it against satellites, and report it to every
            framework you answer to.
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
