// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { Gauge } from "@/components/ui/charts/Gauge";
import { BarList } from "@/components/ui/charts/BarList";
import { MilestoneTrack } from "@/components/ui/charts/MilestoneTrack";

const pct = (n: number) => n.toFixed(2);

describe("Gauge", () => {
  it("renders an honest empty state for a null value (no fabricated zero)", () => {
    render(<Gauge label="Methane intensity" value={null} max={0.4} unit="%" />);
    expect(screen.getByText("Not measured yet")).toBeInTheDocument();
    expect(screen.queryByText("0.00")).not.toBeInTheDocument();
  });

  it("renders the value and a target marker label", () => {
    render(
      <Gauge
        label="Reported"
        value={0.3}
        max={0.4}
        unit="%"
        format={pct}
        markers={[{ at: 0.2, label: "OGMP 2.0 target" }]}
      />,
    );
    expect(screen.getByText("0.30")).toBeInTheDocument();
    expect(screen.getByText("OGMP 2.0 target:")).toBeInTheDocument();
  });
});

describe("BarList", () => {
  it("renders values and an honest dash for null", () => {
    render(
      <BarList
        items={[
          { label: "Field A", value: 100 },
          { label: "Field B", value: null },
        ]}
      />,
    );
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("MilestoneTrack", () => {
  it("shows measured reduction when progress is known", () => {
    render(
      <MilestoneTrack baselineYear={2024} targetYear={2030} targetLabel="zero routine" progressPct={40} onTrack />,
    );
    expect(screen.getByText(/40% of routine flaring eliminated/i)).toBeInTheDocument();
    expect(screen.getByText("On track")).toBeInTheDocument();
  });

  it("is honest when progress isn't measured yet", () => {
    render(
      <MilestoneTrack baselineYear={2024} targetYear={2030} targetLabel="zero routine" progressPct={null} />,
    );
    expect(screen.getByText(/Reduction not yet measured/i)).toBeInTheDocument();
  });
});
