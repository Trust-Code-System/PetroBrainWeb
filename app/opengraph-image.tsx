import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/**
 * Default Open Graph / Twitter card image (1200×630), generated at the edge so every page
 * inherits a branded social preview. Route-level `opengraph-image` files can override this
 * per page; the root layout's `twitter: { card: "summary_large_image" }` pairs with it.
 */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#0B0E13",
          color: "#ffffff",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -1 }}>{site.name}</div>
        <div style={{ fontSize: 34, fontWeight: 400, marginTop: 20, color: "#9CA3AF", maxWidth: 900 }}>
          {site.tagline}
        </div>
      </div>
    ),
    size,
  );
}
