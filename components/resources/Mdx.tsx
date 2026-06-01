"use client";

import { useMDXComponent } from "next-contentlayer2/hooks";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Mdx — renders a Contentlayer-compiled MDX `code` string with a styled components
 * map (we hand-style instead of the typography plugin, to control the dark theme and
 * keep code/formulas in mono). Clean reading rhythm via element margins.
 */

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

const components = {
  h2: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 {...p} className="mt-12 scroll-mt-24 text-h3 font-semibold text-primary" />
  ),
  h3: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 {...p} className="mt-8 scroll-mt-24 text-lg font-semibold text-primary" />
  ),
  p: (p: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...p} className="mt-4 leading-relaxed text-secondary" />
  ),
  ul: (p: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...p} className="mt-4 list-disc space-y-2 pl-6 text-secondary marker:text-faint" />
  ),
  ol: (p: React.HTMLAttributes<HTMLOListElement>) => (
    <ol {...p} className="mt-4 list-decimal space-y-2 pl-6 text-secondary marker:text-faint" />
  ),
  li: (p: React.HTMLAttributes<HTMLLIElement>) => <li {...p} className="leading-relaxed" />,
  a: ({ href = "#", ...rest }: AnchorProps) => {
    const internal = href.startsWith("/") || href.startsWith("#");
    const className = "font-medium text-accent underline underline-offset-2 hover:text-accent-hover";
    return internal ? (
      <Link href={href} className={className} {...rest} />
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...rest} />
    );
  },
  blockquote: (p: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...p}
      className="mt-6 border-l-2 border-accent bg-surface-1 px-4 py-3 text-secondary [&>p]:mt-0"
    />
  ),
  hr: () => <hr className="my-10 border-border-subtle" />,
  strong: (p: React.HTMLAttributes<HTMLElement>) => <strong {...p} className="font-semibold text-primary" />,
  code: ({ className, ...rest }: React.HTMLAttributes<HTMLElement>) => (
    // Inline code (block code is wrapped by <pre> below).
    <code
      className={cn("rounded-sm bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-accent", className)}
      {...rest}
    />
  ),
  pre: (p: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...p}
      className="mt-6 overflow-x-auto rounded-md border border-border-subtle bg-base p-4 font-mono text-sm leading-relaxed text-secondary [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-secondary"
    />
  ),
  table: (p: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="mt-6 overflow-x-auto rounded-md border border-border-subtle">
      <table {...p} className="w-full text-sm" />
    </div>
  ),
  th: (p: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th {...p} className="border-b border-border-subtle bg-surface-2 px-3 py-2 text-left font-medium text-primary" />
  ),
  td: (p: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td {...p} className="border-b border-border-subtle px-3 py-2 text-secondary" />
  ),
};

export function Mdx({ code }: { code: string }) {
  const MDXContent = useMDXComponent(code);
  return <MDXContent components={components} />;
}
