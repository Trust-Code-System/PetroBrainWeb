import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flaringProvider } from "../sources/flaring";
import { ProviderUnavailableError } from "../types";

const signal = new AbortController().signal;
const originalIndicator = process.env.WORLD_BANK_FLARING_INDICATOR;

function mockFetchOnce(value: { ok: boolean; body?: unknown }) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: value.ok,
      status: value.ok ? 200 : 500,
      json: async () => value.body,
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalIndicator === undefined) delete process.env.WORLD_BANK_FLARING_INDICATOR;
  else process.env.WORLD_BANK_FLARING_INDICATOR = originalIndicator;
});

describe("flaringProvider (World Bank, keyless)", () => {
  beforeEach(() => {
    process.env.WORLD_BANK_FLARING_INDICATOR = "TEST.FLARING.IND";
  });

  it("is unavailable (and makes no request) when no indicator is configured", async () => {
    delete process.env.WORLD_BANK_FLARING_INDICATOR;
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await expect(flaringProvider.load(signal)).rejects.toBeInstanceOf(ProviderUnavailableError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("parses real World Bank rows, skipping null values", async () => {
    mockFetchOnce({
      ok: true,
      body: [
        { page: 1, pages: 1 },
        [
          { country: { value: "Nigeria" }, countryiso3code: "NGA", date: "2023", value: 7.2 },
          { country: { value: "Iraq" }, countryiso3code: "IRQ", date: "2023", value: 17.8 },
          { country: { value: "Nowhere" }, countryiso3code: "NOW", date: "2023", value: null },
        ],
      ],
    });

    const result = await flaringProvider.load(signal);
    expect(result.records).toHaveLength(2);
    expect(result.records[0]).toEqual({
      country: "Nigeria",
      iso3: "NGA",
      flaringBcm: 7.2,
      year: 2023,
    });
  });

  it("is unavailable when the source returns no usable rows (not fabricated)", async () => {
    mockFetchOnce({ ok: true, body: [{ page: 1 }, []] });
    await expect(flaringProvider.load(signal)).rejects.toBeInstanceOf(ProviderUnavailableError);
  });

  it("is unavailable on an HTTP error from the source", async () => {
    mockFetchOnce({ ok: false });
    await expect(flaringProvider.load(signal)).rejects.toBeInstanceOf(ProviderUnavailableError);
  });
});
