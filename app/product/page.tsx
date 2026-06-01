import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TechBackground } from "@/components/ui/TechBackground";
import { ArchitectureDiagram } from "@/components/product/ArchitectureDiagram";
import { ctas } from "@/lib/site";

export const metadata: Metadata = {
  title: "How PetroBrain works",
  description:
    "The architecture: a cloud knowledge tier and an on-prem operational tier behind your OT firewall. Answers grounded in your documents, numbers from a deterministic engine, humans in the loop — and a clear list of what it will never do.",
};

/* Section 3 — grounding pipeline. */
const pipeline = [
  { step: "01", title: "Model selects the method", body: "The reasoning layer picks the right formula or procedure and explains why — grounded in your documents and the relevant standard." },
  { step: "02", title: "Engine computes the number", body: "The deterministic calculation engine does the arithmetic. The language model never produces the figure itself." },
  { step: "03", title: "Answer returns with its sources", body: "You get the result, the working, and a citation to the document or standard it came from — ready to verify." },
];

/* Section 4 — human-in-the-loop. */
const loop = [
  { title: "It proposes; you dispose", body: "PetroBrain surfaces the reasoning and the recommendation. The decision — and the accountability — stay with the competent person." },
  { title: "Safety-critical = explicit verify", body: "Anything that touches safety carries an instruction to confirm against the controlling document and a qualified person before acting." },
  { title: "Traceable by design", body: "Every answer is reconstructable: the sources it used and the figures it cited, so a reviewer can audit the path, not just the conclusion." },
];

/* Section 5 — the boundaries. */
const neverDoes = [
  { title: "Never actuates equipment", body: "There is no control path from PetroBrain into your OT. It reads a historian replica; it cannot write a setpoint, open a valve, or move a single piece of plant." },
  { title: "Never auto-sends or auto-files", body: "It drafts; it does not dispatch. No report is submitted, no message is sent, and no action is taken on your behalf without a person choosing to do it." },
  { title: "Never answers outside the domain", body: "It’s domain-locked to oil & gas. Ask it something off-topic and it declines, rather than guessing in a field where a confident wrong answer is dangerous." },
  { title: "Never invents the math", body: "Numbers come from the deterministic engine, not the model. If it can’t compute or source a figure, it tells you — it doesn’t fabricate one." },
];

export default function ProductPage() {
  return (
    <>
      {/* 1 — Hero */}
      <section className="relative overflow-hidden border-b border-border-subtle">
        <TechBackground variant="grid" />
        <Container className="relative py-16 lg:py-24">
          <Eyebrow>How it works</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-display font-semibold text-primary">
            Built like infrastructure, not a chatbot.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-secondary">
            For the technically curious: here’s the architecture underneath PetroBrain — where it
            runs, how it grounds its answers, where the numbers actually come from, and the hard
            boundaries it operates within.
          </p>
          <div className="mt-8">
            <Button href={ctas.primary.href} size="lg">
              {ctas.primary.label}
            </Button>
          </div>
        </Container>
      </section>

      {/* 2 — Two-tier model */}
      <Section surface="1" bordered>
        <Eyebrow>The two-tier model</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          Knowledge in the cloud. Your operations behind your firewall.
        </h2>
        <p className="mt-4 max-w-2xl text-secondary">
          PetroBrain splits cleanly in two. General knowledge and public data live in the cloud
          tier. Everything proprietary — your documents, your historian, your operational data, and
          the calculation engine — stays on-prem, inside your tenant, behind your OT firewall. Only
          scoped context and cited answers cross the boundary, and nothing crosses back as control.
        </p>

        <div className="mt-10">
          <ArchitectureDiagram />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-lg border border-border-subtle bg-surface-2 p-6">
            <h3 className="text-lg font-semibold text-primary">Cloud knowledge tier</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              The reasoning layer, general engineering knowledge, and license-clean public and
              market data. This is the part that scales and improves — without ever holding your
              operational data.
            </p>
          </div>
          <div className="rounded-lg border border-accent/40 bg-surface-2 p-6">
            <h3 className="text-lg font-semibold text-primary">On-prem operational tier</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Your document index, a read-only historian replica, the calculation engine, and your
              operational data — all inside your boundary. Read-only into OT, with no path to
              actuate anything.
            </p>
          </div>
        </div>
      </Section>

      {/* 3 — Grounding + calculation engine */}
      <Section surface="base" bordered>
        <Eyebrow>Grounding &amp; calculation</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          Answers grounded in your documents. Numbers from an engine, not a guess.
        </h2>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-border-subtle bg-surface-1 p-6">
            <Badge tone="info">RAG</Badge>
            <h3 className="mt-3 text-lg font-semibold text-primary">Grounded in your own documents</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              PetroBrain retrieves from your actual SOPs, P&amp;IDs, well files and reports, then
              answers from what it found — and cites it. It isn’t recalling the internet; it’s
              reading your controlling documents, so the answer reflects your plant, not a generic
              one.
            </p>
          </div>
          <div className="rounded-lg border border-accent/40 bg-surface-1 p-6">
            <Badge tone="accent">Deterministic</Badge>
            <h3 className="mt-3 text-lg font-semibold text-primary">The model never does the math</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Language models are good at language and unreliable at arithmetic. So PetroBrain
              doesn’t let the model compute. It selects the method; a separate deterministic engine
              produces the number. Same inputs, same answer, every time — and checkable.
            </p>
          </div>
        </div>

        {/* pipeline */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {pipeline.map((p) => (
            <div key={p.step} className="rounded-lg border border-border-subtle bg-surface-1 p-5">
              <span className="font-mono text-xs text-accent">{p.step}</span>
              <h4 className="mt-2 text-base font-semibold text-primary">{p.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-secondary">{p.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-md border border-border-subtle bg-base p-4">
          <code className="block font-mono text-sm text-secondary">
            model: <span className="text-primary">select method</span>{"  →  "}
            engine: <span className="text-accent">compute( inputs )</span>{"  →  "}
            answer: <span className="text-primary">result + citation</span>
          </code>
        </div>
      </Section>

      {/* 4 — Human-in-the-loop */}
      <Section surface="1" bordered>
        <Eyebrow>Safety posture</Eyebrow>
        <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
          A human is always in the loop — by design, not by policy.
        </h2>
        <p className="mt-4 max-w-2xl text-secondary">
          The architecture assumes a person makes the call. That assumption is built into how
          answers are framed and what the system is allowed to do.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {loop.map((l) => (
            <div key={l.title} className="rounded-lg border border-border-subtle bg-surface-2 p-6">
              <h3 className="text-lg font-semibold text-primary">{l.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{l.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 5 — What it does NOT do (prominent honesty box) */}
      <Section surface="base" bordered>
        <div className="rounded-2xl border border-accent/40 bg-surface-1 p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>The boundaries</Eyebrow>
            <Badge tone="accent" dot>
              Says no on purpose
            </Badge>
          </div>
          <h2 className="mt-4 max-w-2xl text-h2 font-semibold text-primary">
            What PetroBrain does not do.
          </h2>
          <p className="mt-4 max-w-2xl text-secondary">
            The limits are the point. A system you can trust in a control room is defined as much by
            what it refuses to do as by what it can.
          </p>

          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border-subtle bg-border-subtle sm:grid-cols-2">
            {neverDoes.map((n) => (
              <div key={n.title} className="bg-surface-2 p-6">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/50 text-accent"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-primary">{n.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-secondary">{n.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 6 — CTA */}
      <section className="relative overflow-hidden border-t border-border-subtle bg-base">
        <TechBackground variant="contour" />
        <Container className="relative py-20 text-center md:py-24">
          <h2 className="mx-auto max-w-2xl text-h1 font-semibold text-primary">
            See the architecture in action.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-secondary">
            We’ll walk your engineering and IT teams through exactly how it grounds, computes, and
            stays inside the lines — on your stack.
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
