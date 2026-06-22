import { dirname } from "path";
import { fileURLToPath } from "url";
import { withContentlayer } from "next-contentlayer2";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

/** Safely extract the origin from a URL-ish env var; null when unset/invalid. */
function originOf(url) {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

// Map/tile/analytics origins the browser legitimately talks to. Known CDNs are hardcoded;
// operator-configured styles + hazard-tile URLs are read from env so CSP doesn't block them.
const dynamicOrigins = [
  process.env.NEXT_PUBLIC_MAP_STYLE,
  process.env.NEXT_PUBLIC_PLAUSIBLE_SRC,
  process.env.NEXT_PUBLIC_CLIMATE_TILE_URL_FLOOD,
  process.env.NEXT_PUBLIC_CLIMATE_TILE_URL_HEAT,
  process.env.NEXT_PUBLIC_CLIMATE_TILE_URL_COASTAL,
  process.env.NEXT_PUBLIC_CLIMATE_TILE_URL_EROSION,
  // Sentry ingest endpoint (the browser SDK POSTs events to the DSN's host).
  process.env.NEXT_PUBLIC_SENTRY_DSN,
]
  .map(originOf)
  .filter(Boolean);

const mapHosts = [
  "https://api.maptiler.com",
  "https://*.maptiler.com",
  "https://*.cartocdn.com",
  "https://fonts.openmaptiles.org",
];

const scriptSrc = ["'self'", "'unsafe-inline'", "https://plausible.io"];
// Next/React dev tooling needs eval; production does not.
if (!isProd) scriptSrc.push("'unsafe-eval'");

const connectSrc = [...new Set(["'self'", "https://plausible.io", ...mapHosts, ...dynamicOrigins])];

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // https: kept broad on images so map raster tiles (incl. operator-set hazard layers) load.
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src ${scriptSrc.join(" ")}`,
  `connect-src ${connectSrc.join(" ")}`,
  "worker-src 'self' blob:",
  "frame-src 'self' https://cal.com https://*.cal.com",
  "manifest-src 'self'",
  // Only force https in prod — would break http://localhost in dev.
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Contentlayer uses a webpack plugin (no Turbopack support yet), so dev/build run with
  // --webpack (see package.json scripts). Pin the file-tracing root to this project so Next
  // doesn't infer a parent workspace from a stray lockfile.
  outputFileTracingRoot: __dirname,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withContentlayer(nextConfig);
