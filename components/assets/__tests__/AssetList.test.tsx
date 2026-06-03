// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { AssetList } from "@/components/assets/AssetList";
import type { AssetSummary } from "@/lib/assets/types";

afterEach(cleanup);

const assets: AssetSummary[] = [
  { id: "a1", name: "Bonga North", type: "field", lat: 4.75, lon: 5.1, operator: "Shell" },
  { id: "a2", name: "Trans-Niger Pipeline", type: "pipeline", lat: null, lon: null },
];

describe("AssetList", () => {
  it("renders rows and flags assets without coordinates", () => {
    render(
      <AssetList assets={assets} selectedId={null} onSelect={() => {}} isLoading={false} isError={false} />,
    );
    expect(screen.getByText("Bonga North")).toBeInTheDocument();
    expect(screen.getByText(/Field · Shell/)).toBeInTheDocument();
    expect(screen.getByText(/no location/i)).toBeInTheDocument();
  });

  it("selects an asset on click", () => {
    const onSelect = vi.fn();
    render(
      <AssetList assets={assets} selectedId="a1" onSelect={onSelect} isLoading={false} isError={false} />,
    );
    fireEvent.click(screen.getByText("Trans-Niger Pipeline"));
    expect(onSelect).toHaveBeenCalledWith("a2");
  });

  it("shows an honest message when the filtered list is empty", () => {
    render(
      <AssetList assets={[]} selectedId={null} onSelect={() => {}} isLoading={false} isError={false} />,
    );
    expect(screen.getByText(/No assets match these filters/i)).toBeInTheDocument();
  });
});
