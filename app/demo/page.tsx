import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { DemoForm } from "@/components/demo/DemoForm";

export const metadata: Metadata = {
  title: "Book a demo",
  description:
    "Request a focused PetroBrain walkthrough. A real engineer reaches out within one business day — cited, calculated, and honest about what it can and can’t see.",
};

const expectations = [
  {
    title: "A real engineer, not a sales bot",
    body: "You’ll talk to someone who knows well control, integrity and MRV — and can answer hard questions.",
  },
  {
    title: "Your problems, your data",
    body: "We tailor the walkthrough to what you wrote below, on your segment and operating context.",
  },
  {
    title: "Honest about the stage",
    body: "We’ll show what’s live now and what’s on the roadmap — clearly labelled, never blurred.",
  },
];

export default function DemoPage() {
  return (
    <Container className="py-16 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        {/* Left: framing */}
        <div className="lg:pt-2">
          <Eyebrow>Book a demo</Eyebrow>
          <h1 className="mt-3 text-h1 font-semibold text-primary">
            See PetroBrain on your own problems.
          </h1>
          <p className="mt-4 max-w-md text-secondary">
            Tell us a little about your operation. We’ll bring the right engineer and a
            walkthrough built around what you actually need to solve.
          </p>

          <ul className="mt-8 space-y-5">
            {expectations.map((x) => (
              <li key={x.title} className="flex gap-3">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <div>
                  <p className="text-sm font-semibold text-primary">{x.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-secondary">{x.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-8 font-mono text-xs text-faint">
            One business day · real engineer · no spam
          </p>
        </div>

        {/* Right: the form */}
        <div className="rounded-xl border border-border-subtle bg-surface-1 p-6 sm:p-8">
          <DemoForm />
        </div>
      </div>
    </Container>
  );
}
