import type { Metadata } from "next";
import { ClimateRiskWorkspace } from "@/components/climate-risk/ClimateRiskWorkspace";

export const metadata: Metadata = {
  title: "Climate Risk",
};

/**
 * /app/climate-risk — climate-risk layer (O&G-scoped). A map of assets coloured by risk
 * band with optional flood/heat/coastal/erosion overlays (public geospatial data, labelled
 * modeled vs observed), per-asset risk scores + recommended actions + estimated exposure,
 * and a site-selection tool. Every risk number is backend-computed — never fabricated.
 */
export default function ClimateRiskPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Climate Risk</h1>
        <p className="mt-1 text-sm text-secondary">
          Physical climate exposure across your assets — flood, heat, coastal and erosion —
          with the honest line between modeled and observed.
        </p>
      </div>
      <ClimateRiskWorkspace />
    </div>
  );
}
