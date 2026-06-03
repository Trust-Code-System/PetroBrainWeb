"use client";

import { useMemo, useState } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/cn";
import { useTheme } from "@/components/app/ThemeProvider";
import { mapStyleFor } from "@/lib/maps";
import { bandColor, HAZARD_LABEL } from "@/lib/climate-risk/labels";
import { HAZARD_TILE_URL } from "@/lib/climate-risk/client";
import type { AssetRisk, Hazard } from "@/lib/climate-risk/types";

/**
 * ClimateRiskMap — MapLibre map of assets coloured by backend risk band, with an optional
 * raster hazard overlay (flood/heat/coastal/erosion) shown only when a tile source is
 * configured for that hazard. When a layer is selected but unconfigured, a clear note says
 * so — no fabricated overlay. Basemap is theme-aware. Loaded client-only (ssr:false).
 */
type Located = AssetRisk & { lat: number; lon: number };

export function ClimateRiskMap({
  assets,
  selectedId,
  onSelect,
  activeLayer,
}: {
  assets: AssetRisk[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  activeLayer: Hazard | null;
}) {
  const { theme } = useTheme();
  const located = useMemo(
    () => assets.filter((a): a is Located => a.lat !== null && a.lon !== null),
    [assets],
  );
  const [popupId, setPopupId] = useState<string | null>(null);

  const initialViewState = useMemo(() => {
    if (located.length === 0) return { longitude: 6.5, latitude: 5.5, zoom: 5 }; // Niger Delta default
    const lon = located.reduce((s, a) => s + a.lon, 0) / located.length;
    const lat = located.reduce((s, a) => s + a.lat, 0) / located.length;
    return { longitude: lon, latitude: lat, zoom: located.length === 1 ? 7 : 5 };
  }, [located]);

  const activeUrl = activeLayer ? HAZARD_TILE_URL[activeLayer] : undefined;
  const popupAsset = popupId ? located.find((a) => a.assetId === popupId) : undefined;

  return (
    <div className="relative h-full w-full">
      <Map
        initialViewState={initialViewState}
        mapStyle={mapStyleFor(theme)}
        style={{ width: "100%", height: "100%" }}
        onClick={() => setPopupId(null)}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {activeUrl && (
          <Source key={activeLayer} id="hazard" type="raster" tiles={[activeUrl]} tileSize={256}>
            <Layer id="hazard-layer" type="raster" paint={{ "raster-opacity": 0.55 }} />
          </Source>
        )}

        {located.map((a) => (
          <Marker
            key={a.assetId}
            longitude={a.lon}
            latitude={a.lat}
            anchor="bottom"
            onClick={() => {
              onSelect(a.assetId);
              setPopupId(a.assetId);
            }}
          >
            <span
              aria-label={a.name}
              className={cn(
                "block h-3.5 w-3.5 cursor-pointer rounded-full border-2 border-base shadow-elev-1 transition-transform",
                a.assetId === selectedId && "scale-150 ring-2 ring-white/70",
              )}
              style={{ backgroundColor: bandColor(a.band) }}
            />
          </Marker>
        ))}

        {popupAsset && (
          <Popup
            longitude={popupAsset.lon}
            latitude={popupAsset.lat}
            anchor="top"
            offset={12}
            closeOnClick={false}
            onClose={() => setPopupId(null)}
          >
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-grey-900">{popupAsset.name}</p>
              <p className="text-xs text-grey-700">
                Risk: {popupAsset.band ?? "unscored"}
                {popupAsset.overallScore !== null ? ` · ${popupAsset.overallScore}/100` : ""}
              </p>
            </div>
          </Popup>
        )}
      </Map>

      {activeLayer && !activeUrl && (
        <div className="absolute left-3 top-3 rounded-md border border-border-subtle bg-surface-1/90 px-3 py-1.5 text-xs text-faint backdrop-blur">
          {HAZARD_LABEL[activeLayer]} layer source not connected
        </div>
      )}
    </div>
  );
}
