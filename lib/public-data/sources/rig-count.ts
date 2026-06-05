import {
  ProviderUnavailableError,
  type DataProvider,
  type RigCount,
  type RigCountSnapshot,
  type SourceMeta,
} from "../types";

const SOURCE: SourceMeta = {
  name: "Baker Hughes Rig Count",
  url: "https://rigcount.bakerhughes.com/",
  description: "Weekly count of active drilling rigs (North America & International).",
};

const MONTHS: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

export const rigCountProvider: DataProvider<RigCountSnapshot> = {
  key: "rig-count",
  source: SOURCE,
  ttlSeconds: 60 * 60 * 6, // published weekly; 6h refresh is ample
  async load(signal) {
    let res: Response;
    try {
      res = await fetch(SOURCE.url, { signal, headers: { Accept: "text/html" } });
    } catch {
      throw new ProviderUnavailableError("Couldn't reach Baker Hughes rig count.");
    }
    if (!res.ok) {
      throw new ProviderUnavailableError(`Baker Hughes rig count returned an error (HTTP ${res.status}).`);
    }

    const snapshot = parseBakerHughesRigCount(await res.text());
    if (snapshot.counts.length === 0) {
      throw new ProviderUnavailableError("Baker Hughes returned no usable rig-count rows.");
    }

    return snapshot;
  },
};

export function parseBakerHughesRigCount(htmlOrText: string): RigCountSnapshot {
  const text = toPlainText(htmlOrText);
  const counts: RigCount[] = [];

  const northAmericaPattern =
    /\b(U\.S\.|Canada)\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s+([0-9][0-9,]*)\s*([+-]\s*[0-9][0-9,]*)/g;
  for (const match of text.matchAll(northAmericaPattern)) {
    const [, region, day, month, year, rawCount, rawChange] = match;
    if (!region || !day || !month || !year || !rawCount || !rawChange) continue;

    const asOf = parseDayMonthYear(day, month, year);
    const count = parseInteger(rawCount);
    if (!asOf || count === null) continue;
    counts.push({
      region: region === "U.S." ? "U.S." : "Canada",
      count,
      asOf,
      changeFromPrevious: parseSignedInteger(rawChange) ?? undefined,
    });
  }

  const internationalPattern =
    /\bInternational\s+([A-Za-z]+)\s+(\d{4})\s+([0-9][0-9,]*)\s*([+-]\s*[0-9][0-9,]*)/;
  const international = text.match(internationalPattern);
  if (international) {
    const [, month, year, rawCount, rawChange] = international;
    if (!month || !year || !rawCount || !rawChange) return { counts };

    const asOf = parseMonthYear(month, year);
    const count = parseInteger(rawCount);
    if (asOf && count !== null) {
      counts.push({
        region: "International",
        count,
        asOf,
        changeFromPrevious: parseSignedInteger(rawChange) ?? undefined,
      });
    }
  }

  return { counts };
}

function toPlainText(htmlOrText: string): string {
  return htmlOrText
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDayMonthYear(day: string, month: string, year: string): string | null {
  const monthNumber = MONTHS[month.toLowerCase()];
  if (!monthNumber) return null;
  return `${year}-${monthNumber}-${day.padStart(2, "0")}`;
}

function parseMonthYear(month: string, year: string): string | null {
  const monthNumber = MONTHS[month.toLowerCase()];
  if (!monthNumber) return null;
  return `${year}-${monthNumber}`;
}

function parseInteger(value: string): number | null {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function parseSignedInteger(value: string): number | null {
  const compact = value.replace(/\s+/g, "");
  const parsed = Number(compact.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}
