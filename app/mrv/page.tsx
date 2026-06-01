import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { StageBadge } from "@/components/ui/Badge";
import { HonestyBox } from "@/components/ui/HonestyBox";
import { TechBackground } from "@/components/ui/TechBackground";
import { MrvCountdown } from "@/components/mrv/MrvCountdown";
import { MrvQuiz } from "@/components/mrv/MrvQuiz";
import { ctas } from "@/lib/site";

export const metadata: Metadata = {
  title: "NUPRC Tier-3 methane MRV",
  description:
    "Measurement-based Tier-3 methane MRV before the 1 January 2027 deadline. See what Tier 2 → Tier 3 really means, check your readiness in two minutes, and get an honest, source-level path to compliance.",
};

const whyHard = [
  {
    title: "Continuous measurement",
    body: "Tier 3 wants measured volumes on material sources — not once-a-year estimates. Most operators don’t yet have continuous coverage where it counts.",
  },
  {
    title: "OGI & LDAR",
    body: "Optical gas imaging plus a closed-loop leak-detection-and-repair workflow is the backbone of credible fugitive reporting. Ad-hoc fixes don’t qualify.",
  },
  {
    title: "Metered flaring & venting",
    body: "Flaring is often the single biggest reported source. If it’s estimated rather than metered, the whole inventory’s credibility wobbles.",
  },
  {
    title: "Auditable reporting",
    body: "Every reported figure has to trace back to a measurement. Spreadsheets assembled by hand are slow to produce and hard to defend.",
  },
];

export default function MrvPage() {
  return (
    <>
      {/* 1 — Hero + countdown */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <TechBackground variant="contour" />
        <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-24">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow>Emissions &amp; MRV</Eyebrow>
              <StageBadge stage="live" />
            </div>
            <h1 className="mt-4 text-display font-semibold text-primary">
              NUPRC Tier-3 methane MRV — measured, not estimated.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-secondary">
              Measurement-based MRV is becoming mandatory, and the bar is real: source-level
              quantification, reconciled with observation, in an audit-grade trail. PetroBrain
              does this today — and it’s honest about exactly what it can and can’t see.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="#check" size="lg">
                Check your readiness
              </Button>
              <Button href={ctas.primary.href} variant="secondary" size="lg">
                {ctas.primary.label}
              </Button>
            </div>
          </div>

          <div className="lg:justify-self-end">
            <MrvCountdown />
          </div>
        </Container>
      </section>

      {/* 2 — Tier 2 → Tier 3 explainer */}
      <Section surface="1" bordered>
        <Eyebrow>What the deadline actually requires</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          From estimated to measured: the jump from Tier 2 to Tier 3.
        </h2>
        <p className="mt-4 max-w-2xl text-secondary">
          The tiers describe how a number is produced. The shift to Tier 3 is a shift from
          plausible estimates to defensible measurement — and that’s where the work is.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-faint">Tier 2 — where many are</p>
            <h3 className="mt-2 text-lg font-semibold text-primary">Estimated</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Facility-specific factors and engineering estimates. Better than generic
              averages, but the headline numbers are still calculated, not observed — and an
              auditor can question every assumption behind them.
            </p>
          </div>
          <div className="rounded-lg border border-accent/40 bg-surface-2 p-6">
            <p className="font-mono text-xs uppercase tracking-wider text-accent">Tier 3 — the requirement</p>
            <h3 className="mt-2 text-lg font-semibold text-primary">Measured &amp; reconciled</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Source-level quantification from direct measurement or measurement-validated
              calculation, reconciled against independent observation (including public
              satellite methane), in a trail you can hand to a regulator.
            </p>
          </div>
        </div>

        <h3 className="mt-12 text-lg font-semibold text-primary">Why it’s hard</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyHard.map((w) => (
            <div key={w.title} className="rounded-lg border border-border-subtle bg-surface-1 p-5">
              <h4 className="text-base font-semibold text-primary">{w.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{w.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-border-subtle bg-surface-2 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-primary">How PetroBrain does it</h3>
            <StageBadge stage="live" />
          </div>
          <p className="mt-3 max-w-3xl text-secondary">
            PetroBrain builds your inventory from connected source data, reconciles it against
            public satellite methane, and assembles a traceable report where every figure links
            back to its origin. It assesses only the sources you’ve connected — unconnected
            facilities are reported as gaps, never assumed compliant.
          </p>
        </div>
      </Section>

      {/* 3 — Honesty box */}
      <Section surface="base" bordered>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="text-center">The honesty box</Eyebrow>
          <h2 className="mt-3 text-h2 font-semibold text-primary">
            We won’t paper over a gap to look compliant.
          </h2>
          <p className="mt-4 text-secondary">
            Calibrated honesty about data limits is the same trust asset as calibrated honesty
            about an engineering calculation.
          </p>
        </div>
        <HonestyBox
          className="mt-8"
          note="If a facility isn’t connected, your report says so. A clean number you can’t defend is worse than an honest gap you can close."
        />
      </Section>

      {/* 4 — Readiness self-assessment */}
      <Section surface="1" bordered>
        <div id="check" className="scroll-mt-24">
          <Eyebrow>2-minute self-assessment</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
            Where do you stand on Tier-3 readiness?
          </h2>
          <p className="mt-4 max-w-2xl text-secondary">
            Seven quick questions about your measurement, detection and reporting. You’ll get
            your readiness band and score immediately — no email required.
          </p>

          <div className="mt-10 max-w-3xl">
            <MrvQuiz />
          </div>
        </div>
      </Section>

      {/* 5 — CTA */}
      <section className="relative overflow-hidden border-t border-border-subtle bg-base">
        <TechBackground variant="grid" />
        <Container className="relative py-20 text-center md:py-24">
          <h2 className="mx-auto max-w-2xl text-h1 font-semibold text-primary">
            Turn your readiness gaps into a plan.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary">
            Bring your readiness result to a focused walkthrough and we’ll map it to your actual
            sources, your deadline, and what’s achievable in time.
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
