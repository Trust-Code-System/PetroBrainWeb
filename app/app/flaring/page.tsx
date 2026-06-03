import type { Metadata } from "next";
import { FlaringWorkspace } from "@/components/flaring/FlaringWorkspace";

export const metadata: Metadata = {
  title: "Flaring & Methane",
};

/**
 * /app/flaring — flaring volume/intensity, routine vs non-routine, flare efficiency,
 * methane intensity vs the OGMP 2.0 target, the zero-routine-by-2030 tracker, the modeled
 * value of wasted gas, and a real satellite (World Bank/NOAA VIIRS) overlay. All figures
 * from the backend / public-data layer; nothing computed client-side.
 */
export default function FlaringPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight text-primary">Flaring &amp; Methane</h1>
        <p className="mt-1 text-sm text-secondary">
          Cut wasted gas and methane — and prove it against independent satellite data.
        </p>
      </div>
      <FlaringWorkspace />
    </div>
  );
}
