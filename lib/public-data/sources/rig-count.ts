import { ProviderUnavailableError, type DataProvider, type RigCountSnapshot, type SourceMeta } from "../types";

const SOURCE: SourceMeta = {
  name: "Baker Hughes Rig Count",
  url: "https://rigcount.bakerhughes.com/",
  description: "Weekly count of active drilling rigs (North America & International).",
};

export const rigCountProvider: DataProvider<RigCountSnapshot> = {
  key: "rig-count",
  source: SOURCE,
  ttlSeconds: 60 * 60 * 6, // published weekly; 6h refresh is ample
  async load() {
    // Baker Hughes publishes the rig count as a downloadable Excel/PDF workbook, not a
    // JSON API. TODO(rig-count): ingest the weekly North America + International workbook
    // from https://rigcount.bakerhughes.com/ (or a licensed feed), parse the latest
    // totals + week-over-week change, and return them here. Until that ingest exists we
    // have no real numbers to show.
    throw new ProviderUnavailableError(
      "Baker Hughes rig count isn’t connected yet (no public JSON API — needs the weekly file ingest).",
    );
  },
};
