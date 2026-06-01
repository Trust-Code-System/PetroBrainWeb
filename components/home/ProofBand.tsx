import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * ProofBand — credibility without fabrication. Founder/domain-expertise statement plus
 * placeholder pilot tiles. These tiles are intentionally generic placeholders (no
 * invented logos or testimonials) — swap for real, consented partner marks when live.
 */
export function ProofBand() {
  return (
    <Section surface="1" bordered>
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <Eyebrow>Built by the industry</Eyebrow>
          <h2 className="mt-3 text-h2 font-semibold text-primary">
            Engineered by oil &amp; gas people — not generalists with a demo.
          </h2>
          <p className="mt-4 max-w-xl text-secondary">
            PetroBrain is built and reviewed by senior petroleum and process engineers, so
            the reasoning holds up where it matters: well control, integrity, process safety
            and regulatory MRV. The hard calls still belong to your competent person — the
            system is built to respect that.
          </p>
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-faint">
            Currently in pilot with selected operators
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                className="flex h-16 items-center justify-center rounded-md border border-dashed border-border-strong bg-surface-2"
              >
                <span className="font-mono text-[0.65rem] text-faint">operator</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-faint">
            Partner marks shown once pilots are public and consented.
          </p>
        </div>
      </div>
    </Section>
  );
}
