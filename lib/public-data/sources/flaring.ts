import {
  ProviderUnavailableError,
  type DataProvider,
  type FlaringRecord,
  type FlaringSnapshot,
  type SourceMeta,
} from "../types";
import { fetchJson } from "../http";

const SOURCE: SourceMeta = {
  name: "World Bank — Global Gas Flaring Tracker (NOAA VIIRS)",
  url: "https://www.worldbank.org/en/programs/gasflaringreduction",
  description: "Annual gas flaring volume by country, satellite-measured (NOAA VIIRS), compiled by the World Bank GGFR.",
};

/**
 * Standard World Bank Indicators API response: a 2-tuple of [pagination, rows].
 * The endpoint is fully KEYLESS, which is why we wire it live here. Reality check on
 * inspection: the VIIRS flaring *volume* series is primarily a GGFR data-file product, so
 * the exact Indicators-API code must be confirmed before this returns live data — hence
 * the env gate below. The fetch + parse pipeline is real (and unit-tested with mocked
 * responses); it lights up the moment a valid code/source is configured, and reports an
 * honest "unavailable" until then — it never fabricates.
 */
type WorldBankResponse = [
  unknown,
  Array<{ countryiso3code?: string; country?: { value?: string }; date?: string; value?: number | null }>?,
];

export const flaringProvider: DataProvider<FlaringSnapshot> = {
  key: "flaring",
  source: SOURCE,
  ttlSeconds: 60 * 60 * 24 * 7, // annual data; weekly refresh is more than enough
  async load(signal) {
    // TODO(flaring): set WORLD_BANK_FLARING_INDICATOR to the confirmed World Bank flaring
    // indicator code, or repoint this provider at the GGFR flaring-tracker data file.
    const indicator = process.env.WORLD_BANK_FLARING_INDICATOR;
    if (!indicator) {
      throw new ProviderUnavailableError(
        "Flaring data isn’t connected yet (VIIRS/GGFR is a data-file product — needs the confirmed World Bank indicator code or a file ingest).",
      );
    }

    // mrnev=1 → most-recent non-empty value per country.
    const url =
      `https://api.worldbank.org/v2/country/all/indicator/${encodeURIComponent(indicator)}` +
      `?format=json&mrnev=1&per_page=400`;

    const json = await fetchJson<WorldBankResponse>(url, signal, "World Bank");
    const rows = Array.isArray(json) ? json[1] ?? [] : [];

    const records: FlaringRecord[] = [];
    for (const row of rows) {
      const country = row.country?.value;
      const year = row.date ? Number(row.date) : NaN;
      if (row.value == null || !country || Number.isNaN(year)) continue;
      records.push({
        country,
        iso3: row.countryiso3code || undefined,
        flaringBcm: row.value,
        year,
      });
    }

    if (records.length === 0) {
      throw new ProviderUnavailableError("World Bank returned no usable flaring records.");
    }
    return { records };
  },
};
