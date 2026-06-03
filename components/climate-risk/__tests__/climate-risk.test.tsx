// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { AssetRiskDetail } from "@/components/climate-risk/AssetRiskDetail";
import { bandColor, bandTone } from "@/lib/climate-risk/labels";
import type { AssetRisk } from "@/lib/climate-risk/types";

afterEach(cleanup);

const asset: AssetRisk = {
  assetId: "a1",
  name: "Bonny Terminal",
  lat: 4.42,
  lon: 7.16,
  overallScore: 72,
  band: "high",
  hazards: {
    flood: { score: 80, band: "severe", basis: "modeled" },
    heat: { score: 40, band: "moderate", basis: "observed" },
    coastal: { score: null }, // not assessed
  },
  recommendedAction: "Raise flood defences at the tank farm.",
  estimatedExposure: { value: 12_000_000, currency: "USD" },
};

describe("AssetRiskDetail — modeled vs observed, no fabricated risk", () => {
  it("labels each hazard's basis and shows 'Not assessed' for null", () => {
    render(<AssetRiskDetail asset={asset} />);
    expect(screen.getByText("Bonny Terminal")).toBeInTheDocument();
    expect(screen.getByText("modeled")).toBeInTheDocument();
    expect(screen.getByText("observed")).toBeInTheDocument();
    expect(screen.getAllByText("Not assessed").length).toBeGreaterThan(0); // coastal null + erosion absent
    expect(screen.getByText("Raise flood defences at the tank farm.")).toBeInTheDocument();
    expect(screen.getByText(/USD 12,000,000/)).toBeInTheDocument();
  });

  it("prompts to select when no asset is chosen (no zeros)", () => {
    render(<AssetRiskDetail asset={undefined} />);
    expect(screen.getByText(/Select an asset/i)).toBeInTheDocument();
  });
});

describe("risk band mapping", () => {
  it("maps bands to distinct colours and tones, with a neutral fallback", () => {
    expect(bandColor("severe")).not.toBe(bandColor("low"));
    expect(bandColor(undefined)).toBe("#525B6B");
    expect(bandTone("low")).toBe("safe");
    expect(bandTone("severe")).toBe("danger");
    expect(bandTone("???")).toBe("neutral");
  });
});
