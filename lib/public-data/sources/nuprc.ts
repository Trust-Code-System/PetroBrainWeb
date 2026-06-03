import { ProviderUnavailableError, type DataProvider, type NuprcSnapshot, type SourceMeta } from "../types";

const SOURCE: SourceMeta = {
  name: "Nigerian Upstream Petroleum Regulatory Commission (NUPRC)",
  url: "https://www.nuprc.gov.ng/",
  description: "Official Nigerian upstream figures (production, reserves) where published.",
};

export const nuprcProvider: DataProvider<NuprcSnapshot> = {
  key: "nuprc",
  source: SOURCE,
  ttlSeconds: 60 * 60 * 24, // figures update monthly at most
  async load() {
    // NUPRC publishes figures on its portal/reports, not via a public API. TODO(nuprc):
    // wire an official data feed or a vetted ingest of the published monthly production /
    // reserves figures, then return them here. No fabrication until a real source exists.
    throw new ProviderUnavailableError(
      "NUPRC figures aren’t connected yet (no public API — needs an official feed or a vetted report ingest).",
    );
  },
};
