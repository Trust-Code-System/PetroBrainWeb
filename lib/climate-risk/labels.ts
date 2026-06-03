import type { Hazard } from "./types";

/** Hazard + risk-band display helpers. One source of truth. */

export const HAZARDS: Hazard[] = ["flood", "heat", "coastal", "erosion"];

export const HAZARD_LABEL: Record<Hazard, string> = {
  flood: "Flood",
  heat: "Heat",
  coastal: "Coastal",
  erosion: "Erosion",
};

/** Mirrors the Badge component's tone union. */
type Tone = "neutral" | "accent" | "safe" | "warn" | "danger" | "info";

/** Normalise an arbitrary backend band string to a known key. */
function normBand(band: string | undefined): "low" | "moderate" | "high" | "severe" | "unknown" {
  const b = (band ?? "").toLowerCase();
  if (b.startsWith("low")) return "low";
  if (b.startsWith("mod") || b.startsWith("med")) return "moderate";
  if (b.startsWith("sev") || b.startsWith("crit") || b.startsWith("extreme")) return "severe";
  if (b.startsWith("high")) return "high";
  return "unknown";
}

/** Marker / fill hex colour for a risk band. */
export function bandColor(band: string | undefined): string {
  switch (normBand(band)) {
    case "low":
      return "#1FB85C";
    case "moderate":
      return "#FFB020";
    case "high":
      return "#FF7A00";
    case "severe":
      return "#FF4D4D";
    default:
      return "#525B6B"; // grey-600 — unknown / not assessed
  }
}

/** Badge tone for a risk band. */
export function bandTone(band: string | undefined): Tone {
  switch (normBand(band)) {
    case "low":
      return "safe";
    case "moderate":
      return "warn";
    case "high":
      return "accent";
    case "severe":
      return "danger";
    default:
      return "neutral";
  }
}
