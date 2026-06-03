// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { exportHref, templateHref } from "@/lib/data/client";
import { BATCH_OPERATIONS } from "@/lib/data/labels";
import { ExportPanel } from "@/components/data/ExportPanel";

afterEach(cleanup);

describe("data download hrefs (proxied)", () => {
  it("builds template + export URLs through /api/pb with the right query", () => {
    expect(templateHref("emissions", "csv")).toBe("/api/pb/data/template?dataset=emissions&format=csv");
    expect(exportHref("flaring", "excel")).toBe("/api/pb/data/export?dataset=flaring&format=excel");
    expect(exportHref("assets", "csv", "2026-01-01", "2026-03-31")).toBe(
      "/api/pb/data/export?dataset=assets&format=csv&from=2026-01-01&to=2026-03-31",
    );
  });
});

describe("batch operations", () => {
  it("flags only delete as destructive (drives the confirm gate)", () => {
    const destructive = BATCH_OPERATIONS.filter((o) => o.destructive).map((o) => o.value);
    expect(destructive).toEqual(["delete"]);
  });
});

describe("ExportPanel", () => {
  it("exposes a proxied export link for the default selection", () => {
    render(<ExportPanel />);
    const link = screen.getByRole("link", { name: /Export CSV/i });
    expect(link).toHaveAttribute("href", "/api/pb/data/export?dataset=emissions&format=csv");
  });
});
