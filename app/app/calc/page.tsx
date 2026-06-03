import type { Metadata } from "next";
import { CalcWorkspace } from "@/components/calc/CalcWorkspace";

export const metadata: Metadata = {
  title: "Calculations",
};

/**
 * /app/calc — UI over the deterministic calc engine. Drilling/well-control, production and
 * conversion calcs. Each shows the formula, inputs, worked steps, result and a verification
 * banner on safety-critical output. Every figure comes from the backend engine — the
 * frontend never computes (unit conversions included). The copilot can run these too.
 */
export default function CalcPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Calculations</h1>
        <p className="mt-1 text-sm text-secondary">
          Deterministic, auditable engineering calculations — with the formula and every step
          shown. Safety-critical results carry a verification banner.
        </p>
      </div>
      <CalcWorkspace />
    </div>
  );
}
