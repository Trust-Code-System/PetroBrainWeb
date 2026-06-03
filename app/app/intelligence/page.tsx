import type { Metadata } from "next";
import { IntelligenceView } from "@/components/intelligence/IntelligenceView";

export const metadata: Metadata = {
  title: "Intelligence",
};

/**
 * /app/intelligence — the cross-domain reasoning layer (Stage-1: public data). Live market
 * data (Brent/WTI/Bonny Light, differentials, OPEC), the headline cross-domain question
 * pre-seeded to the copilot, cost intelligence (your costs + public + Expanding W. African
 * benchmarks), and an honesty box stating what data is and isn't available.
 */
export default function IntelligencePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Intelligence</h1>
        <p className="mt-1 text-sm text-secondary">
          Your operations, reasoned against the market — inside-out, and honest about what it
          can and can’t see.
        </p>
      </div>
      <IntelligenceView />
    </div>
  );
}
