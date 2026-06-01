import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TechBackground } from "@/components/ui/TechBackground";
import { ctas } from "@/lib/site";

/**
 * FinalCta — full-width dark close. One message, one primary action.
 */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-border-subtle bg-base">
      <TechBackground variant="grid" />
      <Container className="relative py-20 text-center md:py-28">
        <h2 className="mx-auto max-w-2xl text-h1 font-semibold text-primary">
          See PetroBrain reason over your own operations.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-secondary">
          A focused walkthrough on your terms — cited, calculated, and honest about what it
          can and can’t see.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href={ctas.primary.href} size="lg">
            {ctas.primary.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
