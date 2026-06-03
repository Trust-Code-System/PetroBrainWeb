import type { AssetType } from "./types";
import type { SelectOption } from "@/components/ui/Select";

/** Asset-type display labels, marker colours, and select options. One source of truth. */

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  field: "Field",
  well: "Well",
  pipeline: "Pipeline",
  refinery: "Refinery",
  depot: "Depot",
  lng_terminal: "LNG terminal",
  flare_site: "Flare site",
};

/** Marker/legend colour per type (hex so it works in MapLibre markers + CSS). */
export const ASSET_TYPE_COLOR: Record<AssetType, string> = {
  field: "#FF7A00", // accent amber
  well: "#FFB020", // warn
  pipeline: "#3B9EFF", // info
  refinery: "#A78BFA", // violet
  depot: "#1FB85C", // safe green
  lng_terminal: "#22D3EE", // cyan
  flare_site: "#FF4D4D", // danger red
};

export const ASSET_TYPE_OPTIONS: SelectOption[] = (Object.keys(ASSET_TYPE_LABEL) as AssetType[]).map(
  (t) => ({ label: ASSET_TYPE_LABEL[t], value: t }),
);

export const ASSET_TYPE_FILTER_OPTIONS: SelectOption[] = [
  { label: "All types", value: "" },
  ...ASSET_TYPE_OPTIONS,
];

export function assetTypeLabel(type: AssetType): string {
  return ASSET_TYPE_LABEL[type] ?? type;
}
