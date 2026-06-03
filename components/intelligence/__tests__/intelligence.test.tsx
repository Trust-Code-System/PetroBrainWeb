// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { buildCrossDomainSeed } from "@/lib/intelligence/hooks";
import { DataAvailabilityBox } from "@/components/intelligence/DataAvailabilityBox";
import type { MarketView } from "@/lib/intelligence/types";

afterEach(cleanup);

describe("buildCrossDomainSeed", () => {
  it("pins the live Brent price when available", () => {
    expect(buildCrossDomainSeed(82.1)).toContain("$82.10/bbl");
    expect(buildCrossDomainSeed(82.1)).toMatch(/cash-negative/i);
  });

  it("stays generic when Brent isn't available", () => {
    const seed = buildCrossDomainSeed(null);
    expect(seed).not.toContain("$");
    expect(seed).toMatch(/today's Brent\?/);
  });
});

describe("DataAvailabilityBox", () => {
  const market: MarketView = {
    loading: false,
    error: false,
    brent: 82.1,
    wti: 78.4,
    bonny: null,
    spread: 3.7,
    opecTotalKbd: 27000,
    pricesAvailable: true,
    opecAvailable: true,
  };

  it("states what is live, what needs connecting, and what's expanding", () => {
    render(<DataAvailabilityBox market={market} cost={undefined} />);
    // Brand honesty line.
    expect(screen.getByText(/never invents a number/i)).toBeInTheDocument();
    // Bonny Light + your costs need connecting; benchmarks are Expanding.
    expect(screen.getAllByText("Connect your feed").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText(/Live now/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Expanding")).toBeInTheDocument();
    expect(screen.getByText(/Connect Argus \/ Platts/i)).toBeInTheDocument();
  });
});
