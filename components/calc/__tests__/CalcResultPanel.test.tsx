// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CalcResultPanel } from "@/components/calc/CalcResultPanel";
import type { CalcResult } from "@/lib/calc/types";

afterEach(cleanup);

const base: CalcResult = {
  calcId: "hydrostatic",
  name: "Hydrostatic Pressure",
  formula: "P = 0.052 × MW × TVD",
  inputs: [
    { label: "Mud weight", value: 10, unit: "ppg" },
    { label: "TVD", value: 10000, unit: "ft" },
  ],
  steps: [{ label: "Apply formula", expression: "0.052 × 10 × 10000", value: 5200, unit: "psi" }],
  results: [{ label: "Hydrostatic pressure", value: 5200, unit: "psi" }],
  safetyCritical: false,
};

describe("CalcResultPanel", () => {
  it("renders formula, inputs, steps and the result line from the backend", () => {
    render(<CalcResultPanel result={base} />);
    expect(screen.getByText("P = 0.052 × MW × TVD")).toBeInTheDocument();
    expect(screen.getByText("Mud weight")).toBeInTheDocument();
    expect(screen.getAllByText("5,200 psi").length).toBeGreaterThan(0);
    expect(screen.queryByText(/Safety-critical calculation/i)).not.toBeInTheDocument();
  });

  it("shows the verification banner when the result is safety-critical", () => {
    render(<CalcResultPanel result={{ ...base, calcId: "kill_sheet", name: "Kill Sheet", safetyCritical: true }} />);
    expect(screen.getByText(/Safety-critical calculation/i)).toBeInTheDocument();
    expect(screen.getByText(/Verify before acting/i)).toBeInTheDocument();
  });

  it("uses a custom verification message when provided", () => {
    render(
      <CalcResultPanel
        result={{ ...base, safetyCritical: true, verification: "Confirm with the well-control supervisor." }}
      />,
    );
    expect(screen.getByText("Confirm with the well-control supervisor.")).toBeInTheDocument();
  });
});
