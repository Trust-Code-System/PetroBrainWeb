// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SourceInventoryTable } from "@/components/emissions/SourceInventoryTable";
import { ScopeCards } from "@/components/emissions/ScopeCards";
import type { EmissionSource, ScopeSummary } from "@/lib/emissions/types";

const noop = () => {};

describe("SourceInventoryTable — never a dead 0.00", () => {
  it("shows an invitation (not zeros) when empty and unfiltered, and wires the actions", () => {
    const onAdd = vi.fn();
    const onTell = vi.fn();
    render(
      <SourceInventoryTable
        items={[]}
        isLoading={false}
        isError={false}
        filtered={false}
        onAdd={onAdd}
        onTellCopilot={onTell}
      />,
    );

    expect(screen.getByText(/No emission sources yet/i)).toBeInTheDocument();
    expect(screen.queryByText("0.00")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add emission/i }));
    fireEvent.click(screen.getByRole("button", { name: /tell the copilot/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onTell).toHaveBeenCalledTimes(1);
  });

  it("shows a filter-specific empty message when filters are active", () => {
    render(
      <SourceInventoryTable
        items={[]}
        isLoading={false}
        isError={false}
        filtered
        onAdd={noop}
        onTellCopilot={noop}
      />,
    );
    expect(screen.getByText(/No sources match these filters/i)).toBeInTheDocument();
  });

  it("renders rows from the backend, showing 'pending' when CO₂e isn't computed", () => {
    const items: EmissionSource[] = [
      {
        id: "1",
        assetId: "a1",
        assetName: "Field A",
        scope: "scope_1",
        category: "flaring",
        source: "HP flare — Train 1",
        period: "2026-05",
        quantity: 1000,
        unit: "Mscf",
        co2e: 1234.5,
        co2eUnit: "tCO₂e",
      },
      {
        id: "2",
        assetId: "a1",
        assetName: "Field A",
        scope: "scope_1",
        category: "venting",
        source: "Tank vent",
        period: "2026-05",
        quantity: 5,
        unit: "t",
        co2e: null,
        co2eUnit: "tCO₂e",
      },
    ];
    render(
      <SourceInventoryTable
        items={items}
        isLoading={false}
        isError={false}
        filtered={false}
        onAdd={noop}
        onTellCopilot={noop}
      />,
    );

    expect(screen.getByText("HP flare — Train 1")).toBeInTheDocument();
    expect(screen.getByText("1,234.5")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
  });
});

describe("ScopeCards — honest null state", () => {
  it("formats computed scopes and shows 'Not yet computed' for null (no fabricated 0)", () => {
    const summary: ScopeSummary = {
      scope1: { co2e: 5000, unit: "tCO₂e" },
      scope2: { co2e: null, unit: "tCO₂e" },
      scope3: { co2e: null, unit: "tCO₂e", note: "Categories not configured" },
      basis: "operational control · 2026 YTD",
    };
    render(<ScopeCards summary={summary} isLoading={false} isError={false} />);

    expect(screen.getByText("5,000")).toBeInTheDocument();
    expect(screen.getByText("Not yet computed")).toBeInTheDocument();
    expect(screen.getByText("Categories not configured")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
