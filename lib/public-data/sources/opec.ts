import type { DataProvider, OpecSnapshot, SourceMeta } from "../types";

const SOURCE: SourceMeta = {
  name: "OPEC Monthly Oil Market Report (MOMR)",
  url: "https://www.opec.org/monthly-oil-market-report.html",
  description: "OPEC crude oil production from secondary sources, thousand barrels/day.",
};

const MAY_2026_APPENDIX: OpecSnapshot = {
  month: "2026-Q1 (MOMR May 2026)",
  production: [],
  // Table 11-1 reports 25.853446 mb/d for OPEC crude oil production
  // (secondary sources). Convert mb/d to kb/d and round to the nearest kb/d.
  totalKbd: 25_853,
};

export const opecProvider: DataProvider<OpecSnapshot> = {
  key: "opec",
  source: SOURCE,
  ttlSeconds: 60 * 60 * 24, // monthly publication
  async load() {
    return MAY_2026_APPENDIX;
  },
};
