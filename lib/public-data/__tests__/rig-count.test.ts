import { afterEach, describe, expect, it, vi } from "vitest";
import { parseBakerHughesRigCount, rigCountProvider } from "../sources/rig-count";
import { ProviderUnavailableError } from "../types";

const signal = new AbortController().signal;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseBakerHughesRigCount", () => {
  it("parses the public overview summary rows", () => {
    const snapshot = parseBakerHughesRigCount(`
      Area Last Count Count Change from Prior Count Date of Prior Count Change from Last Year Date of Last Year's Count
      U.S.29 May 2026 562+4 22 May 2026-1 30 May 2025
      Canada 29 May 2026 162+24 22 May 2026+50 30 May 2025
      International May 2026 1046+10 Apr 2026-25 May 2025
    `);

    expect(snapshot.counts).toEqual([
      { region: "U.S.", count: 562, asOf: "2026-05-29", changeFromPrevious: 4 },
      { region: "Canada", count: 162, asOf: "2026-05-29", changeFromPrevious: 24 },
      { region: "International", count: 1046, asOf: "2026-05", changeFromPrevious: 10 },
    ]);
  });

  it("returns an empty snapshot for unrecognized source text", () => {
    expect(parseBakerHughesRigCount("no table here")).toEqual({ counts: [] });
  });
});

describe("rigCountProvider", () => {
  it("fetches and parses Baker Hughes rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "U.S. 29 May 2026 562 +4 Canada 29 May 2026 162 +24 International May 2026 1046 +10",
      }),
    );

    const snapshot = await rigCountProvider.load(signal);

    expect(snapshot.counts.map((count) => count.region)).toEqual(["U.S.", "Canada", "International"]);
  });

  it("is unavailable when Baker Hughes returns no usable rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => "empty page" }),
    );

    await expect(rigCountProvider.load(signal)).rejects.toBeInstanceOf(ProviderUnavailableError);
  });
});
