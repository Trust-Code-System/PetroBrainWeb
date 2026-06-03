import { ProviderUnavailableError, type DataProvider, type OpecSnapshot, type SourceMeta } from "../types";

const SOURCE: SourceMeta = {
  name: "OPEC Monthly Oil Market Report (MOMR)",
  url: "https://www.opec.org/opec_web/en/publications/338.htm",
  description: "Member-country crude production (secondary sources), thousand barrels/day.",
};

export const opecProvider: DataProvider<OpecSnapshot> = {
  key: "opec",
  source: SOURCE,
  ttlSeconds: 60 * 60 * 24, // monthly publication
  async load() {
    // The MOMR is published as PDF/Excel, not a JSON API. TODO(opec): ingest the monthly
    // "Crude oil production" table (secondary sources) from the MOMR (or a licensed feed),
    // parse per-country kb/d + the OPEC total, and return them here. No fabrication until
    // that ingest exists.
    throw new ProviderUnavailableError(
      "OPEC production snapshot isn’t connected yet (MOMR is published as PDF/Excel — needs the monthly ingest).",
    );
  },
};
