import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { StageBadge } from "@/components/ui/Badge";
import { TechBackground } from "@/components/ui/TechBackground";
import { ExampleDemo } from "@/components/shared/ExampleDemo";
import { ctas } from "@/lib/site";
import { type ValueChainConfig } from "@/lib/valueChain";

/**
 * ValueChainPage — shared template for /upstream, /midstream, /downstream.
 * Layout is identical across segments; all content comes from the ValueChainConfig.
 * Clean semantic heading hierarchy (one h1, h2 per section, h3 per capability group)
 * for SEO. Static — the only client piece is the canned ExampleDemo.
 */
export function ValueChainPage({ config }: { config: ValueChainConfig }) {
  const { hero, capabilities, demo, cta } = config;

  return (
    <>
      {/* 1 — Hero */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <TechBackground variant="contour" />
        <Container className="relative py-16 lg:py-24">
          <Eyebrow>{hero.eyebrow}</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-display font-semibold text-primary">{hero.headline}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">{hero.subhead}</p>

          <ul className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            {hero.pains.map((p) => (
              <li
                key={p}
                className="rounded-lg border border-border-subtle bg-surface-1 p-4 text-sm leading-relaxed text-secondary"
              >
                {p}
              </li>
            ))}
          </ul>

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

      {/* 2 — Capabilities */}
      <Section surface="1" bordered>
        <div className="flex flex-wrap items-center gap-3">
          <Eyebrow>{capabilities.heading}</Eyebrow>
          <StageBadge stage="live" note="your data" />
        </div>
        <p className="mt-3 max-w-2xl text-secondary">{capabilities.intro}</p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {capabilities.groups.map((g) => (
            <div key={g.title} className="rounded-lg border border-border-subtle bg-surface-2 p-6">
              <h3 className="text-lg font-semibold text-primary">{g.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {g.items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-secondary">
                    <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* 3 — Segment demo */}
      <Section surface="base" bordered>
        <div id="demo" className="scroll-mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow className="text-center">See it work</Eyebrow>
            <h2 className="mt-3 text-h2 font-semibold text-primary">
              A {config.name.toLowerCase()} question, reasoned and cited.
            </h2>
            <p className="mt-4 text-secondary">
              Cited, calculated, and honest about what needs your data and your competent person.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <ExampleDemo example={demo} />
          </div>
        </div>
      </Section>

      {/* 4 — CTA */}
      <section className="relative overflow-hidden border-t border-border-subtle bg-base">
        <TechBackground variant="grid" />
        <Container className="relative py-20 text-center md:py-24">
          <h2 className="mx-auto max-w-2xl text-h1 font-semibold text-primary">{cta.headline}</h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary">{cta.sub}</p>
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
