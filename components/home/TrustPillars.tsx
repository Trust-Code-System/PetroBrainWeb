import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";

/**
 * TrustPillars — four one-line pillars that define why PetroBrain can be trusted in a
 * safety-critical setting. Links to /safety for the detail.
 */
const pillars = [
  {
    title: "Domain-locked",
    body: "It only answers within oil & gas. No off-topic guessing, no generic chatbot drift.",
    icon: (
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" strokeLinejoin="round" />
    ),
  },
  {
    title: "Cited & calculated",
    body: "Every figure shows its source and its working — never an unsourced assertion.",
    icon: <path d="M5 4h14M5 9h14M5 14h9M5 19h6" strokeLinecap="round" />,
  },
  {
    title: "Safety-first",
    body: "It defers safety-critical calls to the competent person and says so, every time.",
    icon: <path d="M12 8v5m0 3h.01M12 3l9 16H3L12 3Z" strokeLinejoin="round" strokeLinecap="round" />,
  },
  {
    title: "Auditable & sovereign",
    body: "Your data stays in your tenant; answers are traceable end to end.",
    icon: (
      <path
        d="M4 7l8-4 8 4v6c0 1-8 8-8 8s-8-7-8-8V7Zm5 5 2 2 4-4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    ),
  },
];

export function TrustPillars() {
  return (
    <Section surface="1" bordered>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Why you can trust it</Eyebrow>
          <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
            Trust is the product. These four make it real.
          </h2>
        </div>
        <Button href="/safety" variant="ghost">
          How we keep it safe →
        </Button>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p) => (
          <div key={p.title} className="rounded-lg border border-border-subtle bg-surface-2 p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-muted text-accent">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                {p.icon}
              </svg>
            </span>
            <h3 className="mt-4 text-base font-semibold text-primary">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
