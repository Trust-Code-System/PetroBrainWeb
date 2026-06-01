import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Badge, StageBadge, type Stage } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { TechBackground } from "@/components/ui/TechBackground";
import { ctas, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "PetroBrain is built by people who’ve done the work — decades across upstream, midstream and downstream. Our mission, why us, and the staged vision from operations copilot to the definitive intelligence platform for the African upstream.",
};

/* Why-us points. */
const whyUs = [
  {
    title: "We’ve made the calls ourselves",
    body: "The people building PetroBrain have stood on the rig floor and sat in the boardroom. We know which answers are safety-critical because we’ve been accountable for them.",
  },
  {
    title: "Domain-locked on purpose",
    body: "We didn’t bolt oil & gas onto a general chatbot. The product is built from the industry’s standards, hazards and workflows outward — which is why it knows when to say “verify this”.",
  },
  {
    title: "On the ground, not flying over",
    body: "We’re close to the operators we serve — their regulators, their fields, their realities. That proximity is the foundation everything else is built on.",
  },
];

/* The staged vision — future tense, mapped onto the three honesty badges. */
const stages: { stage: Stage; n: string; title: string; body: string }[] = [
  {
    stage: "live",
    n: "Stage 1 · Today",
    title: "AI reasoning over your own data and the public record",
    body: "PetroBrain reasons over the operator’s own operations — production, maintenance, incidents — together with free public data (EIA, OPEC, IEA, NUPRC, public satellite methane). This is live now, and it’s the foundation the rest stands on.",
  },
  {
    stage: "expanding",
    n: "Stage 2 · Next",
    title: "Make the market feeds you already pay for usable",
    body: "We build connectors so an operator who already subscribes to a market feed can have PetroBrain reason over it in context with their own operations — the customer’s licence, used on their behalf. We become the intelligence layer over data they already buy.",
  },
  {
    stage: "roadmap",
    n: "Stage 3 · The horizon",
    title: "The definitive intelligence platform for the African upstream",
    body: "Over time — usage-generated, public-record-assembled, and selectively licensed — a proprietary West African upstream dataset that the global incumbents can’t easily replicate. The definitive intelligence platform for the niche first, then beyond.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <TechBackground variant="contour" />
        <Container className="relative py-16 lg:py-24">
          <Eyebrow>About PetroBrain</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-display font-semibold text-primary">
            We come from the rig floor, not the venture office.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">
            PetroBrain is built by oil &amp; gas people for oil &amp; gas people. Everything
            about it — the safety-first instinct, the refusal to guess, the obsession with
            citing sources — comes from having been the person on the hook for the answer.
          </p>
        </Container>
      </section>

      {/* 1 — Founder / senior-engineer story */}
      <Section surface="1" bordered>
        <Eyebrow>The founder</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          Decades in the field — wellsite to boardroom.
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          {/* Photo placeholder */}
          <div>
            <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border-strong bg-surface-2">
              <div className="text-center">
                <p className="font-mono text-xs uppercase tracking-wider text-faint">Founder photo</p>
                <p className="mt-1 text-xs text-faint">placeholder — replace</p>
              </div>
            </div>
            <Badge tone="warn" className="mt-3">
              Placeholder content
            </Badge>
          </div>

          {/* Bio with clearly-marked placeholders */}
          <div>
            <p className="text-lg font-semibold text-primary">
              [Founder name], [Title — e.g. Founder &amp; Principal Engineer]
            </p>
            <div className="mt-4 space-y-4 text-secondary">
              <p>
                [Placeholder bio — replace with the real story.] A petroleum/process engineer
                with [X]+ years across the value chain: [upstream — drilling, well integrity,
                production], [midstream — pipelines, integrity], and [downstream — refining,
                process safety]. From the wellsite to the boardroom, [he/she/they] has carried
                the responsibility that PetroBrain is designed to support.
              </p>
              <p>
                [Placeholder — a specific, credible career detail or two: operators worked with,
                a hard problem solved, the moment that made the case for a safety-first AI built
                for this industry. Keep it concrete and true; no invented metrics.]
              </p>
              <p>
                [Placeholder — why this person is building PetroBrain now: the conviction that the
                industry’s hardest-won knowledge shouldn’t retire with the people who hold it.]
              </p>
            </div>
            <Banner variant="info" className="mt-6">
              Editorial note (not shown in production): swap every bracketed item for the real
              bio, photo and credentials. Keep claims specific and verifiable — no fabricated
              numbers or titles.
            </Banner>
          </div>
        </div>
      </Section>

      {/* 2 — Mission */}
      <Section surface="base" bordered>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="text-center">Our mission</Eyebrow>
          <p className="mt-4 text-h2 font-semibold leading-snug text-primary">
            Make the work safer — and less stressful — for everyone in the sector.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-secondary">
            From the junior engineer at 2 a.m. to the HSE lead carrying a deadline, the people who
            run this industry deserve tools that have their back: instant, sourced, honest answers,
            and a system that knows the difference between a helpful suggestion and a
            safety-critical decision.
          </p>
        </div>
      </Section>

      {/* 3 — Why us */}
      <Section surface="1" bordered>
        <Eyebrow>Why us</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          Built by industry people — not Silicon Valley tourists.
        </h2>
        <p className="mt-4 max-w-2xl text-secondary">
          Plenty of teams can build a chatbot. Very few understand why a wrong torque value or a
          fabricated production figure isn’t a bug — it’s a hazard. That difference is the whole
          company.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {whyUs.map((w) => (
            <div key={w.title} className="rounded-lg border border-border-subtle bg-surface-2 p-6">
              <h3 className="text-lg font-semibold text-primary">{w.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{w.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 4 — The staged vision (future tense, visually distinct) */}
      <Section surface="base" bordered>
        <div className="rounded-2xl border border-border-strong bg-surface-1 p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>The vision · future tense</Eyebrow>
            <Badge tone="info">Where we’re going — not today’s product</Badge>
          </div>
          <h2 className="mt-4 max-w-2xl text-h2 font-semibold text-primary">
            From operations copilot to the intelligence platform the African upstream never had.
          </h2>
          <p className="mt-4 max-w-2xl text-secondary">
            We’re not trying to out-data the global incumbents from day one. We’re building the one
            thing they can’t — the AI intelligence layer that starts inside the operator’s own
            world — and letting that foundation grow into the data platform the African upstream has
            never had. In the right order, and honest at every stage about where on the path we
            stand.
          </p>

          {/* Timeline */}
          <ol className="mt-10 space-y-px">
            {stages.map((s) => (
              <li key={s.n} className="relative grid gap-4 border-l-2 border-dashed border-border-strong pl-6 pb-8 last:pb-0 sm:grid-cols-[auto_1fr] sm:gap-6">
                {/* node */}
                <span
                  aria-hidden="true"
                  className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-accent bg-base"
                />
                <div className="sm:w-44">
                  <p className="font-mono text-xs uppercase tracking-wider text-accent">{s.n}</p>
                  <div className="mt-2">
                    <StageBadge stage={s.stage} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary">{s.title}</h3>
                  <p className="mt-2 text-secondary">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <Banner variant="info" title="A note on tense" className="mt-8">
            Stage 1 is live today. Stages 2 and 3 are the trajectory — described in the future
            tense on purpose. We market every capability at the stage it’s truly at, and the
            honesty badges above will upgrade themselves as the work ships.
          </Banner>
        </div>
      </Section>

      {/* 5 — CTA */}
      <section className="relative overflow-hidden border-t border-border-subtle bg-base">
        <TechBackground variant="grid" />
        <Container className="relative py-20 text-center md:py-24">
          <h2 className="mx-auto max-w-2xl text-h1 font-semibold text-primary">
            Build it with people who’ve been in your boots.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary">
            See what an AI built by oil &amp; gas engineers does with your hardest question.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href={ctas.primary.href} size="lg">
              {ctas.primary.label}
            </Button>
          </div>
          <p className="mt-6 font-mono text-xs text-faint">{site.origin}</p>
        </Container>
      </section>
    </>
  );
}
