import type { Metadata } from "next";
import { type DemoExample } from "@/lib/demoExamples";
import { site } from "@/lib/site";

/**
 * Value-chain page content. The three pages (/upstream, /midstream, /downstream)
 * share ONE template (components/value-chain/ValueChainPage.tsx) and differ only in
 * this config. EDIT FREELY — copy, capabilities and the per-segment canned demo all
 * live here.
 */

export type VcSlug = "upstream" | "midstream" | "downstream";

export type VcCapabilityGroup = { title: string; items: string[] };

export type ValueChainConfig = {
  slug: VcSlug;
  name: string;
  meta: { title: string; description: string };
  hero: { eyebrow: string; headline: string; subhead: string; pains: string[] };
  capabilities: { heading: string; intro: string; groups: VcCapabilityGroup[] };
  demo: DemoExample;
  cta: { headline: string; sub: string };
};

/* ----------------------------- Upstream ----------------------------- */
const upstream: ValueChainConfig = {
  slug: "upstream",
  name: "Upstream",
  meta: {
    title: "Upstream — AI for drilling, reservoir & production",
    description:
      "PetroBrain for upstream operators: well-control and drilling support, reservoir and subsurface reasoning, and production operations — grounded in your own well data, cited and safety-first.",
  },
  hero: {
    eyebrow: "PetroBrain for upstream",
    headline: "From the rig floor to the reservoir — answers that know your wells.",
    subhead:
      "Upstream is where the fastest, highest-stakes decisions get made. PetroBrain reasons over your own well files, production and incident history — cited, calculated, and clear about what needs a competent person.",
    pains: [
      "Well-control and integrity risk where a wrong number is a safety event.",
      "Reservoir and production uncertainty spread across well files no one has time to read.",
      "Hard-won knowledge retiring faster than it’s being captured.",
    ],
  },
  capabilities: {
    heading: "Built for the upstream workflow",
    intro:
      "Drilling, subsurface and production support — reasoning over your own data, with every figure sourced.",
    groups: [
      {
        title: "Drilling & well control",
        items: [
          "Kill sheets worked, shown and cited",
          "Well-control reasoning with the standard referenced",
          "Casing, cementing and BOP references from your documents",
          "Offset-well lessons pulled from your own files",
        ],
      },
      {
        title: "Reservoir & subsurface",
        items: [
          "Productivity index and inflow reasoning over your well tests",
          "Decline and forecast context from your production history",
          "PVT and material-balance references",
          "Plain-English answers instead of dashboard-hunting",
        ],
      },
      {
        title: "Production operations",
        items: [
          "Allocation and deferment context",
          "Artificial-lift troubleshooting",
          "Well-integrity history at your fingertips",
          "Flaring and methane quantification for MRV",
        ],
      },
    ],
  },
  demo: {
    id: "upstream-pi",
    chip: "Productivity index",
    question: "Estimate the productivity index for this well from the latest test.",
    intro:
      "I’ll work the productivity index from your well-test data using the standard inflow relationship. Inputs below are illustrative — connect your latest test for the real figure.",
    formula: {
      expression: "J = q / ( P_r − P_wf )",
      caption: "J productivity index · q rate · P_r reservoir pressure · P_wf flowing bottomhole pressure",
    },
    illustrative: true,
    steps: [
      "Pull the latest well test: rate q, reservoir pressure P_r, flowing BHP P_wf.",
      "Illustrative: q = 1,800 stb/d, P_r = 3,200 psi, P_wf = 2,600 psi.",
      "J = 1,800 / (3,200 − 2,600) = 3.0 stb/d/psi.",
    ],
    result: "Productivity index ≈ 3.0 stb/d/psi (illustrative). Use it to model rate against drawdown.",
    citations: [
      { source: "Reservoir engineering fundamentals" },
      { source: "Your well-test data (illustrative)" },
    ],
    confidence: "medium",
    confidenceNote: "Needs your latest well-test data connected",
    verification:
      "Validate against a recent well test and your reservoir engineer before using for forecasting or allocation.",
  },
  cta: {
    headline: "Put it to work on your wells.",
    sub: "Bring a real well-control or reservoir question and watch it reason over your own data.",
  },
};

/* ----------------------------- Midstream ----------------------------- */
const midstream: ValueChainConfig = {
  slug: "midstream",
  name: "Midstream",
  meta: {
    title: "Midstream — AI for pipelines, processing & storage",
    description:
      "PetroBrain for midstream operators: pipeline integrity and MAOP reasoning per ASME B31.8, processing and compression support, and storage and custody transfer — grounded, cited, safety-first.",
  },
  hero: {
    eyebrow: "PetroBrain for midstream",
    headline: "Move it safely — integrity and limits, reasoned against the code.",
    subhead:
      "Midstream lives and dies on integrity and operating limits. PetroBrain reasons over your line data, inspection records and the controlling standards — so the limit you act on is sourced, not remembered.",
    pains: [
      "Pipeline integrity and corrosion risk across long, ageing assets.",
      "Operating limits buried in standards and line lists, not at hand.",
      "Throughput and custody pressure with no margin for a wrong number.",
    ],
  },
  capabilities: {
    heading: "Built for the midstream workflow",
    intro:
      "Pipelines, processing and storage — operating limits and integrity reasoning, every figure sourced.",
    groups: [
      {
        title: "Pipelines & integrity",
        items: [
          "MAOP and operating limits per ASME B31.8",
          "Corrosion, ILI and inspection-record reasoning",
          "Pigging and integrity-management context",
          "Class location and right-of-way references",
        ],
      },
      {
        title: "Processing & compression",
        items: [
          "Separation and dehydration troubleshooting",
          "Compressor performance context",
          "Hydraulic and pressure-drop checks",
          "Gas-quality and spec compliance",
        ],
      },
      {
        title: "Storage & custody",
        items: [
          "Tank integrity and inventory context",
          "Custody-transfer and metering reasoning",
          "Vapour handling and emissions",
          "LACT unit and measurement references",
        ],
      },
    ],
  },
  demo: {
    id: "midstream-dp",
    chip: "Pipeline pressure drop",
    question: "Estimate the frictional pressure drop along this liquids line.",
    intro:
      "I’ll work the frictional pressure drop from the Darcy–Weisbach relation using your line geometry and fluid. Inputs below are illustrative — connect your line spec for the real number.",
    formula: {
      expression: "ΔP = f × (L / D) × (ρ × v² / 2)",
      caption: "f friction factor · L length · D diameter · ρ density · v velocity",
    },
    illustrative: true,
    steps: [
      "Take line geometry and flow: length L, diameter D, density ρ, velocity v, friction factor f.",
      "Illustrative: L = 12 km, D = 0.30 m, ρ = 820 kg/m³, v = 1.8 m/s, f = 0.018.",
      "ΔP = 0.018 × (12,000 / 0.30) × (820 × 1.8² / 2) ≈ 9.6 bar.",
    ],
    result: "Frictional pressure drop ≈ 9.6 bar (illustrative). Add elevation and fittings for the full hydraulic picture.",
    citations: [
      { source: "Darcy–Weisbach (fluid mechanics)" },
      { source: "Your line data (illustrative)" },
    ],
    confidence: "medium",
    confidenceNote: "Needs your line spec and fluid properties connected",
    verification:
      "Confirm against your hydraulic model and a pipeline/process engineer before any operational decision.",
  },
  cta: {
    headline: "Reason over your network.",
    sub: "Bring an integrity or operating-limit question and see it answered against the code and your records.",
  },
};

/* ----------------------------- Downstream ----------------------------- */
const downstream: ValueChainConfig = {
  slug: "downstream",
  name: "Downstream",
  meta: {
    title: "Downstream — AI for refining & petrochemicals",
    description:
      "PetroBrain for downstream operators: refining operations and process safety, petrochemical production, and turnaround and maintenance support — grounded in your unit data, cited and safety-first.",
  },
  hero: {
    eyebrow: "PetroBrain for downstream",
    headline: "Run the unit with the manual in your head — sourced and instant.",
    subhead:
      "Downstream is procedures, process safety and relentless optimisation. PetroBrain retrieves the SOP that actually applies and reasons over your unit data — cited, calculated, and deferring the safety calls to your people.",
    pains: [
      "Process-safety complexity where the right procedure is the difference.",
      "Turnarounds and troubleshooting under time and margin pressure.",
      "Product spec and energy efficiency to hold, shift after shift.",
    ],
  },
  capabilities: {
    heading: "Built for the downstream workflow",
    intro:
      "Refining, petrochemicals and turnaround support — the right procedure and the right number, both sourced.",
    groups: [
      {
        title: "Refining operations",
        items: [
          "Unit procedure and SOP retrieval, cited",
          "Process-safety and relief-system context",
          "Yield and operations troubleshooting",
          "Corrosion and materials references",
        ],
      },
      {
        title: "Petrochemicals",
        items: [
          "Reaction and utilities context",
          "Product quality and spec reasoning",
          "Energy and efficiency support",
          "Catalyst-management references",
        ],
      },
      {
        title: "Turnaround & maintenance",
        items: [
          "Turnaround planning context",
          "Maintenance and inspection history",
          "Permit-to-work and isolation references",
          "Reliability reasoning over your records",
        ],
      },
    ],
  },
  demo: {
    id: "downstream-duty",
    chip: "Exchanger heat duty",
    question: "What’s the heat duty on this exchanger stream?",
    intro:
      "I’ll work the duty from the standard sensible-heat relation using your stream data. Inputs below are illustrative — connect the unit datasheet for the real figure.",
    formula: {
      expression: "Q = ṁ × cp × ΔT",
      caption: "Q duty · ṁ mass flow · cp specific heat · ΔT temperature change",
    },
    illustrative: true,
    steps: [
      "Take the stream: mass flow ṁ, specific heat cp, inlet/outlet temperatures.",
      "Illustrative: ṁ = 25 kg/s, cp = 2.4 kJ/kg·K, ΔT = 60 K.",
      "Q = 25 × 2.4 × 60 = 3,600 kW = 3.6 MW.",
    ],
    result: "Duty ≈ 3.6 MW (illustrative). Rate the exchanger against available area and fouling.",
    citations: [
      { source: "Process heat-transfer fundamentals" },
      { source: "Your unit data (illustrative)" },
    ],
    confidence: "medium",
    confidenceNote: "Needs your stream data and unit datasheet connected",
    verification:
      "Verify duty and exchanger rating with your process engineer and the unit datasheets before acting.",
  },
  cta: {
    headline: "Bring it to your unit.",
    sub: "Ask a procedure or process question and see it sourced from your own documents.",
  },
};

export const valueChains: Record<VcSlug, ValueChainConfig> = {
  upstream,
  midstream,
  downstream,
};

/** Per-page metadata + OG, built from the segment config. */
export function valueChainMetadata(slug: VcSlug): Metadata {
  const c = valueChains[slug];
  const url = `${site.url}/${slug}`;
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      type: "website",
      title: c.meta.title,
      description: c.meta.description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: c.meta.title,
      description: c.meta.description,
    },
  };
}
