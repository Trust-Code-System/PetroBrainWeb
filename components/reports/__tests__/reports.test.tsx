// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ReportSummaryCards } from "@/components/reports/ReportSummaryCards";
import { ReportResultPanel } from "@/components/reports/ReportResultPanel";
import type { ReportResult, ReportSummary } from "@/lib/reports/types";

afterEach(cleanup);

describe("ReportSummaryCards", () => {
  it("renders backend figures and an honest '—' for nulls (no fabricated zero)", () => {
    const summary: ReportSummary = {
      totalEmissions: { value: 125000, unit: "tCO₂e" },
      dataPoints: 842,
      completenessPct: null,
      dataQuality: { score: null },
    };
    render(<ReportSummaryCards summary={summary} isLoading={false} isError={false} />);
    expect(screen.getByText("125,000")).toBeInTheDocument();
    expect(screen.getByText("842")).toBeInTheDocument();
    // completeness + data quality are null → dash, not 0
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });
});

describe("ReportResultPanel — PDF/Excel export", () => {
  const result: ReportResult = {
    framework: "ghg_protocol",
    frameworkLabel: "GHG Protocol",
    periodLabel: "Q2 2026",
    generatedAt: new Date().toISOString(),
    auditHash: "abc123",
    sections: [{ heading: "Scope 1", rows: [{ label: "Total", value: "100 tCO₂e" }] }],
    exports: { pdfUrl: "reports/files/r1.pdf" }, // excel intentionally absent
  };

  it("renders content and links the available export, disabling the unavailable one", () => {
    render(<ReportResultPanel open status="ready" result={result} error={null} onClose={() => {}} />);
    expect(screen.getByText("GHG Protocol")).toBeInTheDocument();
    expect(screen.getByText("Scope 1")).toBeInTheDocument();

    const pdf = screen.getByRole("link", { name: "Export PDF" });
    expect(pdf).toHaveAttribute("href", "/api/pb/reports/files/r1.pdf");

    // Excel had no URL → not a link (disabled span).
    expect(screen.queryByRole("link", { name: "Export Excel" })).not.toBeInTheDocument();
    expect(screen.getByText("Export Excel")).toHaveAttribute("aria-disabled", "true");
  });
});
