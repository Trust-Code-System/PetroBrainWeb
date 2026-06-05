import type { StyleSpecification } from "maplibre-gl";

/**
 * MapLibre basemap style, theme-aware. Resolution order:
 *   1. NEXT_PUBLIC_MAP_STYLE - an explicit style URL, overrides both themes.
 *   2. NEXT_PUBLIC_MAPTILER_KEY - branded MapTiler styles, still theme-aware.
 *   3. Local CARTO raster style - avoids a remote style JSON dependency and gives a
 *      visibly filled basemap even when vector glyph/sprite requests are slow or blocked.
 */
function cartoRasterStyle(theme: "light" | "dark"): StyleSpecification {
  const variant = theme === "light" ? "light_all" : "dark_all";
  return {
    version: 8,
    sources: {
      carto: {
        type: "raster",
        tiles: [
          `https://a.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}.png`,
          `https://b.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}.png`,
          `https://c.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}.png`,
          `https://d.basemaps.cartocdn.com/${variant}/{z}/{x}/{y}.png`,
        ],
        tileSize: 256,
        attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: "carto",
        type: "raster",
        source: "carto",
      },
    ],
  };
}

export function mapStyleFor(theme: "light" | "dark"): string | StyleSpecification {
  if (process.env.NEXT_PUBLIC_MAP_STYLE) return process.env.NEXT_PUBLIC_MAP_STYLE;

  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (key) {
    const style = theme === "light" ? "dataviz-light" : "dataviz-dark";
    return `https://api.maptiler.com/maps/${style}/style.json?key=${key}`;
  }

  return cartoRasterStyle(theme);
}
