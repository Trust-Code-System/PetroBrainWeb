import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * robots.txt — allow indexing of marketing pages; keep the API and internal
 * styleguide out of the index. Points crawlers at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/styleguide"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
