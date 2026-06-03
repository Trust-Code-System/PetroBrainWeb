import { dirname } from "path";
import { fileURLToPath } from "url";
import { withContentlayer } from "next-contentlayer2";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Contentlayer uses a webpack plugin (no Turbopack support yet), so dev/build run with
  // --webpack (see package.json scripts). Pin the file-tracing root to this project so Next
  // doesn't infer a parent workspace from a stray lockfile.
  outputFileTracingRoot: __dirname,
};

export default withContentlayer(nextConfig);
