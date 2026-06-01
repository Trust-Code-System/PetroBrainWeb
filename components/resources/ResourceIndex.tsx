"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";

/**
 * ResourceIndex — client-side tag filter over a prerendered article list. The page is
 * statically generated with every card in the HTML; this only toggles visibility, so
 * SEO and no-JS readers still get the full grid.
 */
export type ArticleCard = {
  title: string;
  excerpt: string;
  date: string; // ISO
  tag: string;
  url: string;
  readingTime: string;
};

export function ResourceIndex({ articles }: { articles: ArticleCard[] }) {
  const tags = useMemo(
    () => ["All", ...Array.from(new Set(articles.map((a) => a.tag))).sort()],
    [articles],
  );
  const [active, setActive] = useState("All");

  const visible = active === "All" ? articles : articles.filter((a) => a.tag === active);

  return (
    <div>
      {/* Tag filter */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tag">
        {tags.map((t) => {
          const isActive = t === active;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setActive(t)}
              aria-pressed={isActive}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-accent/50 bg-accent-muted text-accent"
                  : "border-border-subtle bg-surface-2 text-secondary hover:border-border-strong hover:text-primary",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((a) => (
          <Link
            key={a.url}
            href={a.url}
            className="group flex flex-col rounded-lg border border-border-subtle bg-surface-1 p-6 transition-colors hover:border-border-strong hover:bg-surface-2"
          >
            <div className="flex items-center gap-2">
              <Badge tone="accent">{a.tag}</Badge>
              <span className="text-xs text-faint">{a.readingTime}</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold leading-snug text-primary group-hover:text-primary">
              {a.title}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-secondary">{a.excerpt}</p>
            <div className="mt-5 flex items-center justify-between">
              <time dateTime={a.date} className="text-xs text-faint">
                {format(new Date(a.date), "d LLL yyyy")}
              </time>
              <span aria-hidden="true" className="text-accent">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-10 text-center text-secondary">No articles in this tag yet.</p>
      )}
    </div>
  );
}
