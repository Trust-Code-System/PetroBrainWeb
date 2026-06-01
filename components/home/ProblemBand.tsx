import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * ProblemBand — three sharp lines on why this matters. Plainspoken, no buzzwords.
 */
const problems = [
  {
    k: "01",
    title: "The people who know your plant are retiring.",
    body: "Decades of judgement walks out the door, and the next engineer inherits the consequences without the context.",
  },
  {
    k: "02",
    title: "The answer is buried in a 400-page manual no one has time to read.",
    body: "Standards, P&IDs, SOPs and incident history exist — but not at 2 a.m. on the rig floor when the question is urgent.",
  },
  {
    k: "03",
    title: "The methane deadline is coming, and most operators aren't ready.",
    body: "NUPRC Tier-3 MRV demands source-level, audit-grade reporting. Spreadsheets and generic factors won't pass.",
  },
];

export function ProblemBand() {
  return (
    <Section surface="1" bordered>
      <Eyebrow>The reality on the ground</Eyebrow>
      <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
        Hard problems, and the clock is running on all three.
      </h2>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {problems.map((p) => (
          <div key={p.k} className="border-t border-border-strong pt-5">
            <span className="font-mono text-sm text-accent">{p.k}</span>
            <h3 className="mt-3 text-lg font-semibold leading-snug text-primary">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
