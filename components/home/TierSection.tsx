import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { MockInterface } from "./MockInterface";

/**
 * TierSection — the three ways PetroBrain shows up: field copilot, engineering
 * decision-support, compliance guardian. Each card carries a placeholder looping
 * interface mock.
 */
const tiers = [
  {
    variant: "field" as const,
    title: "Field copilot",
    body: "Plain-English answers on the rig floor and in the plant — permits, procedures, equipment, and the SOP that actually applies — sourced from your own documents.",
  },
  {
    variant: "engineering" as const,
    title: "Engineering decision-support",
    body: "Worked calculations with the formula shown and the source cited — well control, integrity, process — so a junior engineer at 2 a.m. reasons like a senior one.",
  },
  {
    variant: "compliance" as const,
    title: "Compliance guardian",
    body: "Audit-grade emissions and MRV: source-level quantification reconciled with satellite data, with every figure traceable to its origin.",
  },
];

export function TierSection() {
  return (
    <Section surface="base" bordered>
      <Eyebrow>One system, three jobs</Eyebrow>
      <h2 className="mt-3 max-w-2xl text-h2 font-semibold text-primary">
        From the question on the rig floor to the figure in the audit.
      </h2>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {tiers.map((t) => (
          <Card key={t.title} className="flex flex-col">
            <h3 className="text-lg font-semibold text-primary">{t.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary">{t.body}</p>
            <div className="mt-5">
              <MockInterface variant={t.variant} />
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}
