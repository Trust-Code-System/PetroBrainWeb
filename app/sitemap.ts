import type { MetadataRoute } from "next";
import { allArticles } from "contentlayer/generated";
import { site } from "@/lib/site";

/**
 * Sitemap — built static marketing routes plus every MDX article.
 * Add new top-level routes here as they ship (e.g. /security, /legal/*).
 */
const staticRoutes = [
  "",
  "/product",
  "/intelligence",
  "/emissions-intelligence",
  "/upstream",
  "/midstream",
  "/downstream",
  "/safety",
  "/mrv",
  "/about",
  "/resources",
  "/demo",
  "/security",
  "/legal/privacy",
  "/legal/terms",
  "/legal/dpa",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const articles: MetadataRoute.Sitemap = allArticles.map((a) => ({
    url: `${site.url}${a.url}`,
    lastModified: new Date(a.date),
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  return [...pages, ...articles];
}
