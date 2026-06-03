// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TrendChart, type TrendPoint } from "@/components/ui/charts/TrendChart";
import { InsightCards } from "@/components/analytics/InsightCards";
import type { InsightsResponse } from "@/lib/analytics/types";

afterEach(cleanup);

describe("TrendChart", () => {
  it("summarises the series and flags a modeled forecast for screen readers", () => {
    const points: TrendPoint[] = [
      { label: "2026-01", value: 100 },
      { label: "2026-02", value: 120 },
      { label: "2026-03", value: null }, // gap — not plotted as zero
      { label: "2026-04", value: 140, forecast: true, low: 130, high: 150 },
    ];
    render(<TrendChart points={points} type="line" unit="tCO₂e" ariaLabel="Emissions" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("aria-label", expect.stringContaining("Emissions"));
    expect(img.getAttribute("aria-label")).toMatch(/modeled forecast/i);
  });

  it("renders an honest message when there's nothing to chart", () => {
    render(<TrendChart points={[]} type="bar" />);
    expect(screen.getByText(/No data to chart/i)).toBeInTheDocument();
  });
});

describe("InsightCards — clearly AI-generated", () => {
  const data: InsightsResponse = {
    items: [
      { id: "1", title: "Scope 3 is your highest contributor", body: "It's 62% of the total this period.", severity: "warn" },
    ],
  };

  it("marks insights as AI-generated and shows the verify note", () => {
    render(<InsightCards data={data} isLoading={false} isError={false} onAsk={vi.fn()} />);
    expect(screen.getByText("AI-generated")).toBeInTheDocument();
    expect(screen.getByText(/Scope 3 is your highest contributor/)).toBeInTheDocument();
    expect(screen.getByText(/decision-support only/i)).toBeInTheDocument();
  });

  it("invites the copilot when there are no insights (no fabrication)", () => {
    render(<InsightCards data={{ items: [] }} isLoading={false} isError={false} onAsk={vi.fn()} />);
    expect(screen.getByText(/No AI insights yet/i)).toBeInTheDocument();
  });
});
