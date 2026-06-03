/**
 * MapLibre basemap style, theme-aware. Resolution order:
 *   1. NEXT_PUBLIC_MAP_STYLE  — an explicit style URL, overrides both themes.
 *   2. NEXT_PUBLIC_MAPTILER_KEY — branded MapTiler styles, still theme-aware
 *      (dataviz-light in light mode, dataviz-dark in dark mode).
 *   3. CARTO (no token) — positron in light mode, dark-matter in dark mode.
 */
const POSITRON = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
const DARK_MATTER = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export function mapStyleFor(theme: "light" | "dark"): string {
  if (process.env.NEXT_PUBLIC_MAP_STYLE) return process.env.NEXT_PUBLIC_MAP_STYLE;

  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (key) {
    const style = theme === "light" ? "dataviz-light" : "dataviz-dark";
    return `https://api.maptiler.com/maps/${style}/style.json?key=${key}`;
  }

  return theme === "light" ? POSITRON : DARK_MATTER;
}
