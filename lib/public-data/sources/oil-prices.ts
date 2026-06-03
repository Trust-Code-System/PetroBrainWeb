import {
  ProviderUnavailableError,
  type DataProvider,
  type OilPrice,
  type OilPrices,
  type SourceMeta,
} from "../types";
import { fetchJson } from "../http";

const SOURCE: SourceMeta = {
  name: "U.S. Energy Information Administration (EIA)",
  url: "https://www.eia.gov/petroleum/",
  description: "Daily crude oil spot prices, USD per barrel.",
};

// EIA series ids for daily spot prices: RBRTE = Europe Brent, RWTC = WTI Cushing.
// TODO(verify): confirm the series ids + exact v2 query at https://www.eia.gov/opendata/
// once EIA_API_KEY is provisioned.
const EIA_SERIES: Record<string, "Brent" | "WTI"> = { RBRTE: "Brent", RWTC: "WTI" };

type EiaResponse = {
  response?: { data?: Array<{ period?: string; series?: string; value?: number | string }> };
};

export const oilPricesProvider: DataProvider<OilPrices> = {
  key: "oil-prices",
  source: SOURCE,
  ttlSeconds: 60 * 30, // spot prices move intraday; 30 min is plenty
  async load(signal) {
    const apiKey = process.env.EIA_API_KEY;
    if (!apiKey) {
      // No key → we genuinely have no data. Never fabricate a price.
      throw new ProviderUnavailableError(
        "Live crude prices aren’t connected yet (EIA API key not configured).",
      );
    }

    const seriesFacets = Object.keys(EIA_SERIES)
      .map((s) => `&facets[series][]=${s}`)
      .join("");
    const url =
      `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=${apiKey}` +
      `&frequency=daily&data[0]=value${seriesFacets}` +
      `&sort[0][column]=period&sort[0][direction]=desc&length=20`;

    const json = await fetchJson<EiaResponse>(url, signal, "EIA");
    const rows = json.response?.data ?? [];

    // Keep the most recent row per benchmark (rows are sorted newest-first).
    const latest = new Map<"Brent" | "WTI", OilPrice>();
    for (const row of rows) {
      const benchmark = row.series ? EIA_SERIES[row.series] : undefined;
      const value = typeof row.value === "string" ? Number(row.value) : row.value;
      if (!benchmark || value === undefined || Number.isNaN(value) || !row.period) continue;
      if (!latest.has(benchmark)) {
        latest.set(benchmark, { benchmark, priceUsd: value, asOf: row.period });
      }
    }

    const prices = [...latest.values()];
    if (prices.length === 0) {
      throw new ProviderUnavailableError("EIA returned no usable price rows.");
    }

    // Bonny Light has no free public spot-price API, so it is intentionally OMITTED here
    // rather than fabricated. TODO(bonny-light): wire an Argus/Platts/OPEC basket feed and
    // push a { benchmark: "Bonny Light", ... } entry.
    return { prices };
  },
};
