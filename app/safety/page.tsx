import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Banner } from "@/components/ui/Banner";
import { CitationChip } from "@/components/ui/CitationChip";
import { ConfidenceLabel } from "@/components/ui/ConfidenceLabel";
import { TechBackground } from "@/components/ui/TechBackground";
import { HonestyBox } from "@/components/ui/HonestyBox";
import { AnswerExample } from "@/components/safety/AnswerExample";
import { ctas } from "@/lib/site";

export const metadata: Metadata = {
  title: "Safety, trust & honesty",
  description:
    "PetroBrain is decision-support, not a decision-maker. It’s safety-first, cites its sources, and is honest about what it can’t see. How we earn the trust of the HSE lead and the IT reviewer.",
};

/* ---------------- section 2 data ---------------- */
const principles = [
  {
    title: "Decision-support, not decision-maker",
    body: "PetroBrain informs the competent person; it never replaces them. It shows its working so a human can check it, and it makes clear that the call — and the accountability — stay with you.",
  },
  {
    title: "It won’t help bypass a safety system",
    body: "Ask it to defeat an interlock, override an ESD, or work around a permit, and it declines and explains why. Safety systems exist to be respected, not engineered around.",
  },
  {
    title: "Live emergencies go to humans first",
    body: "If a question signals an active emergency, PetroBrain’s first response is to direct you to your emergency procedure and the responsible people — not to attempt to manage the incident itself.",
  },
  {
    title: "Verify with the competent person",
    body: "Every safety-critical output carries an explicit instruction to verify against the controlling document and a qualified person before acting. No exceptions, no fine print.",
  },
];

/* ---------------- section 5 data ---------------- */
const sovereign = [
  {
    title: "Full audit trail",
    body: "Every answer is traceable — to the documents it drew on and the figures it cited. You can reconstruct how a conclusion was reached, which is what an audit actually requires.",
  },
  {
    title: "IEC 62443 alignment",
    body: "Designed against the IEC 62443 industrial-cybersecurity framework. This is an alignment of our security design — not a certification claim. Where formal certification exists, we say so explicitly.",
  },
  {
    title: "Sovereign data residency",
    body: "Your data stays in the region you choose. For operators with national data-sovereignty obligations, residency is a configuration, not a special case.",
  },
  {
    title: "Tenant isolation",
    body: "Your operational data lives in your tenant and is processed on your behalf. It is not used to train shared models and does not leak across customers.",
  },
  {
    title: "Human as the last gate",
    body: "Nothing safety-critical is actioned on the model’s say-so. A competent person remains the final authority by design, not by policy bolted on afterwards.",
  },
];

export default function SafetyPage() {
  return (
    <>
      {/* 1 — Hero */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <TechBackground variant="grid" />
        <Container className="relative py-16 lg:py-24">
          <Eyebrow>Safety, trust &amp; honesty</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-display font-semibold text-primary">
            Trust is the product.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">
            In a safety-critical industry, an assistant that sounds confident and is quietly
            wrong is worse than no assistant at all. PetroBrain is built the other way round:
            safety-first, every figure cited and calculated, and honest about the limits of
            what it can see. We lead with those limits on purpose — they’re why you can rely
            on the rest.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Badge tone="safe" dot>
              Safety-first
            </Badge>
            <Badge tone="info" dot>
              Cited &amp; calculated
            </Badge>
            <Badge tone="accent" dot>
              Honest about limits
            </Badge>
          </div>
        </Container>
      </section>

      {/* 2 — Safety-first design principles */}
      <Section surface="1" bordered>
        <Eyebrow>How it behaves</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          Safety-first isn’t a setting. It’s the design.
        </h2>
        <p className="mt-4 max-w-2xl text-secondary">
          Four rules are wired into how PetroBrain answers — not added as a disclaimer after
          the fact.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {principles.map((p) => (
            <div
              key={p.title}
              className="rounded-lg border border-border-subtle bg-surface-2 p-6"
            >
              <h3 className="text-lg font-semibold text-primary">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{p.body}</p>
            </div>
          ))}
        </div>

        {/* SHOW it: a refusal in action */}
        <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1fr] lg:items-start">
          <AnswerExample
            label="bypass-request"
            question="How do I override the ESD so we can keep producing through the trip?"
          >
            <p className="text-sm leading-relaxed text-secondary">
              I won’t help disable or work around an emergency shutdown. The ESD tripped for a
              reason, and overriding it removes a protection layer that exists to prevent a
              loss of containment.
            </p>
            <Banner variant="danger" title="This is a safety system">
              Treat the trip as real until proven otherwise. Investigate the cause under your
              permit-to-work, and involve the competent authority before any reset. If this is
              an active emergency, follow your site emergency procedure now.
            </Banner>
          </AnswerExample>

          <div className="lg:pt-2">
            <h3 className="text-lg font-semibold text-primary">
              When the safe answer is “no”, it says no.
            </h3>
            <p className="mt-3 text-secondary">
              A general-purpose assistant will often try to be helpful by answering anyway.
              PetroBrain is domain-locked and safety-aware: it recognises a request to defeat a
              protective function and declines — then points you to the correct, safe path. The
              same Banner you see here is the component we use across the product to flag
              anything that needs human verification.
            </p>
          </div>
        </div>
      </Section>

      {/* 3 — Calibrated honesty */}
      <Section surface="base" bordered>
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <Eyebrow>Calibrated honesty</Eyebrow>
            <h2 className="mt-3 text-h2 font-semibold text-primary">
              It would rather be useful and honest than complete and wrong.
            </h2>
            <p className="mt-4 text-secondary">
              When PetroBrain isn’t certain, it says so — and tells you exactly what to check
              and against which standard. It won’t invent a torque value, a pressure rating, or
              a setpoint to seem authoritative. A calibrated “verify this” is worth more than a
              confident guess that costs you later.
            </p>
            <p className="mt-3 text-sm text-muted">
              The same instinct that stops it hallucinating a torque value stops it hallucinating
              a production figure. It’s one discipline, applied everywhere.
            </p>
          </div>

          <AnswerExample
            label="calibrated-honesty"
            question="What’s the bolt torque for the 6-inch 1500# wellhead flange?"
          >
            <p className="text-sm leading-relaxed text-secondary">
              I can give you the method, but I won’t state a single torque figure with false
              confidence — the correct value depends on the exact flange spec, gasket, bolt
              material and lubricant for your equipment.
            </p>
            <div className="rounded-md border border-border-subtle bg-base p-3">
              <code className="block font-mono text-sm text-accent">
                target_torque = f( bolt size, lubricated K-factor, target bolt stress )
              </code>
              <p className="mt-1.5 font-mono text-[0.7rem] leading-relaxed text-faint">
                K-factor changes materially with lubricant — a dry vs. lubricated assumption can
                shift torque by tens of percent.
              </p>
            </div>
            <p className="text-sm leading-relaxed text-secondary">
              Confirm the torque value and sequence against the manufacturer’s assembly
              procedure and ASME PCC-1 for your specific flange before tightening.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <CitationChip source="ASME PCC-1 · Bolted Flange Joint Assembly" />
              <CitationChip source="Manufacturer assembly procedure" />
            </div>
            <ConfidenceLabel
              level="low"
              note="No equipment-specific flange spec connected"
            />
            <Banner variant="warn" title="Verify with the competent person">
              Bolt-up torque is safety-critical. Use the controlling assembly procedure and a
              qualified technician — not a generic number.
            </Banner>
          </AnswerExample>
        </div>
      </Section>

      {/* 4 — The honesty box */}
      <Section surface="1" bordered>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow className="text-center">The honesty box</Eyebrow>
          <h2 className="mt-3 text-h2 font-semibold text-primary">
            It tells you what it can’t see.
          </h2>
          <p className="mt-4 text-secondary">
            This is a promise we make on every page where PetroBrain reasons over data — and
            we hold ourselves to it.
          </p>
        </div>

        <HonestyBox
          className="mt-8"
          note={
            <>
              No silent gaps. If a question needs data PetroBrain can’t access, it says so and
              offers what it <em>can</em> reason over — rather than filling the hole with a
              plausible-looking figure.
            </>
          }
        />
      </Section>

      {/* 5 — Auditable & sovereign */}
      <Section surface="base" bordered>
        <Eyebrow>For the IT reviewer</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          Auditable, isolated, and sovereign by design.
        </h2>
        <p className="mt-4 max-w-2xl text-secondary">
          Trust isn’t only about how it answers — it’s about where your data lives, who can see
          it, and whether you can prove what happened. The detail your security team will ask
          for:
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sovereign.map((s) => (
            <div
              key={s.title}
              className="rounded-lg border border-border-subtle bg-surface-1 p-6"
            >
              <h3 className="text-base font-semibold text-primary">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{s.body}</p>
            </div>
          ))}
          <div className="flex flex-col justify-center rounded-lg border border-dashed border-border-strong bg-surface-1 p-6">
            <p className="text-sm leading-relaxed text-secondary">
              Need the full security and data-rights detail — residency regions, sub-processors,
              the DPA?
            </p>
            <Button href="/security" variant="ghost" className="mt-3 self-start px-0">
              Read security &amp; compliance →
            </Button>
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-xs leading-relaxed text-faint">
          A note on language: we say “alignment” where we’ve designed to a standard, and
          “certified” only where a certification has actually been issued. We won’t blur the
          two — that would undercut the entire point of this page.
        </p>
      </Section>

      {/* 6 — CTA */}
      <section className="relative overflow-hidden border-t border-border-subtle bg-base">
        <TechBackground variant="contour" />
        <Container className="relative py-20 text-center md:py-24">
          <h2 className="mx-auto max-w-2xl text-h1 font-semibold text-primary">
            Bring your hardest safety question.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary">
            The fastest way to judge whether you can trust it is to watch it handle the thing
            you’d expect it to get wrong. Let’s do exactly that.
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
