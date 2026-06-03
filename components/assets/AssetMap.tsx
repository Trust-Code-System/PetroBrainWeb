"use client";

import { useMemo, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/cn";
import { useTheme } from "@/components/app/ThemeProvider";
import { mapStyleFor } from "@/lib/maps";
import { ASSET_TYPE_COLOR, assetTypeLabel } from "@/lib/assets/labels";
import type { AssetSummary } from "@/lib/assets/types";

/**
 * AssetMap — MapLibre GL map of located assets (no token; free CARTO style, theme-aware).
 * Markers are coloured by asset type; clicking one selects the asset and opens a popup.
 * Assets without coordinates are simply not plotted (they still appear in the list) — we
 * never invent a location. Loaded client-only (dynamic import, ssr:false) from the workspace.
 */

type Located = AssetSummary & { lat: number; lon: number };

export function AssetMap({
  assets,
  selectedId,
  onSelect,
}: {
  assets: AssetSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { theme } = useTheme();
  const located = useMemo(
    () => assets.filter((a): a is Located => a.lat !== null && a.lon !== null),
    [assets],
  );
  const [popupId, setPopupId] = useState<string | null>(null);

  const initialViewState = useMemo(() => {
    if (located.length === 0) return { longitude: 8.7, latitude: 9.1, zoom: 3 }; // default: Nigeria
    const lon = located.reduce((s, a) => s + a.lon, 0) / located.length;
    const lat = located.reduce((s, a) => s + a.lat, 0) / located.length;
    return { longitude: lon, latitude: lat, zoom: located.length === 1 ? 6 : 4 };
  }, [located]);

  const popupAsset = popupId ? located.find((a) => a.id === popupId) : undefined;

  return (
    <Map
      initialViewState={initialViewState}
      mapStyle={mapStyleFor(theme)}
      style={{ width: "100%", height: "100%" }}
      onClick={() => setPopupId(null)}
    >
      <NavigationControl position="top-right" showCompass={false} />

      {located.map((a) => (
        <Marker
          key={a.id}
          longitude={a.lon}
          latitude={a.lat}
          anchor="bottom"
          onClick={() => {
            onSelect(a.id);
            setPopupId(a.id);
          }}
        >
          <span
            aria-label={`${a.name} (${assetTypeLabel(a.type)})`}
            className={cn(
              "block h-3.5 w-3.5 cursor-pointer rounded-full border-2 border-base shadow-elev-1 transition-transform",
              a.id === selectedId && "scale-150 ring-2 ring-white/70",
            )}
            style={{ backgroundColor: ASSET_TYPE_COLOR[a.type] }}
          />
        </Marker>
      ))}

      {popupAsset && (
        <Popup
          longitude={popupAsset.lon}
          latitude={popupAsset.lat}
          anchor="top"
          closeOnClick={false}
          onClose={() => setPopupId(null)}
          offset={12}
        >
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-grey-900">{popupAsset.name}</p>
            <p className="text-xs text-grey-700">{assetTypeLabel(popupAsset.type)}</p>
            {popupAsset.operator && <p className="text-xs text-grey-700">{popupAsset.operator}</p>}
          </div>
        </Popup>
      )}
    </Map>
  );
}
