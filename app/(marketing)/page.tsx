import { Hero } from "@/components/home/Hero";
import { ProblemBand } from "@/components/home/ProblemBand";
import { TierSection } from "@/components/home/TierSection";
import { ValueChainBand } from "@/components/home/ValueChainBand";
import { IntelligenceBand } from "@/components/home/IntelligenceBand";
import { TrustPillars } from "@/components/home/TrustPillars";
import { MrvBand } from "@/components/home/MrvBand";
import { ProofBand } from "@/components/home/ProofBand";
import { FinalCta } from "@/components/home/FinalCta";

/**
 * Homepage. Statically generated. Five-second job: trust. Operations + safety + MRV
 * lead; the intelligence band raises the ceiling without overweighting it.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ProblemBand />
      <TierSection />
      <ValueChainBand />
      <IntelligenceBand />
      <TrustPillars />
      <MrvBand />
      <ProofBand />
      <FinalCta />
    </>
  );
}
