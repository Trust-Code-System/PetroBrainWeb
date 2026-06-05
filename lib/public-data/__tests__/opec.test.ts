import { describe, expect, it } from "vitest";
import { opecProvider } from "../sources/opec";

const signal = new AbortController().signal;

describe("opecProvider", () => {
  it("returns the ingested MOMR May 2026 OPEC crude production total", async () => {
    const snapshot = await opecProvider.load(signal);

    expect(snapshot).toEqual({
      month: "2026-Q1 (MOMR May 2026)",
      production: [],
      totalKbd: 25_853,
    });
  });
});
