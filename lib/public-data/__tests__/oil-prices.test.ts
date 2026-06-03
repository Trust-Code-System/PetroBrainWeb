import { describe, it, expect, vi, afterEach } from "vitest";
import { oilPricesProvider } from "../sources/oil-prices";
import { ProviderUnavailableError } from "../types";

const signal = new AbortController().signal;
const originalKey = process.env.EIA_API_KEY;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalKey === undefined) delete process.env.EIA_API_KEY;
  else process.env.EIA_API_KEY = originalKey;
});

describe("oilPricesProvider (EIA, key-gated)", () => {
  it("is unavailable (no request) when EIA_API_KEY is absent — never fabricates a price", async () => {
    delete process.env.EIA_API_KEY;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(oilPricesProvider.load(signal)).rejects.toBeInstanceOf(ProviderUnavailableError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("parses the latest Brent + WTI rows when a key is configured", async () => {
    process.env.EIA_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          response: {
            data: [
              { period: "2026-05-30", series: "RBRTE", value: 82.1 },
              { period: "2026-05-30", series: "RWTC", value: 78.4 },
              { period: "2026-05-29", series: "RBRTE", value: 81.0 }, // older Brent — ignored
            ],
          },
        }),
      }),
    );

    const result = await oilPricesProvider.load(signal);
    const brent = result.prices.find((p) => p.benchmark === "Brent");
    const wti = result.prices.find((p) => p.benchmark === "WTI");

    expect(result.prices).toHaveLength(2); // Bonny Light intentionally absent, not faked
    expect(brent).toEqual({ benchmark: "Brent", priceUsd: 82.1, asOf: "2026-05-30" });
    expect(wti?.priceUsd).toBe(78.4);
  });

  it("is unavailable when EIA returns no usable rows", async () => {
    process.env.EIA_API_KEY = "test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ response: { data: [] } }) }),
    );

    await expect(oilPricesProvider.load(signal)).rejects.toBeInstanceOf(ProviderUnavailableError);
  });
});
