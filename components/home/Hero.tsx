import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TechBackground } from "@/components/ui/TechBackground";
import { ctas } from "@/lib/site";
import { HeroDemo } from "./HeroDemo";

/**
 * Hero — names the category, states the trust promise, two CTAs, and shows the
 * canned demo widget. The five-second job is trust: cited, calculated, safety-first.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle">
      <TechBackground variant="contour" />
      <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:py-24">
        <div>
          <Badge tone="accent" dot>
            Built only for oil &amp; gas
          </Badge>
          <h1 className="mt-5 text-display font-semibold text-primary">
            The AI-native intelligence platform built only for oil&nbsp;&amp;&nbsp;gas.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-secondary">
            From the rig floor to the trading desk, PetroBrain reasons over your own
            operations and the public market — it cites every source, shows the working,
            and never guesses a safety-critical number.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={ctas.primary.href} size="lg">
              {ctas.primary.label}
            </Button>
            <Button href="#demo" variant="secondary" size="lg">
              See it work
            </Button>
          </div>
          <p className="mt-5 font-mono text-xs text-faint">
            Domain-locked · Cited &amp; calculated · Safety-first
          </p>
        </div>

        <div id="demo" className="scroll-mt-24">
          <HeroDemo />
        </div>
      </Container>
    </section>
  );
}
