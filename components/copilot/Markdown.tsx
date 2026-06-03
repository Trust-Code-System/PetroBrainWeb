"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Markdown — renders the copilot's streamed markdown answers on-theme. react-markdown is
 * safe by default (no raw HTML); remark-gfm adds tables / strikethrough / autolinks.
 * Element styling is mapped explicitly (no typography plugin) to match the dark theme,
 * and links open safely in a new tab.
 */

const components: Components = {
  p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h3 className="mb-2 mt-3 text-base font-semibold text-primary">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-2 mt-3 text-base font-semibold text-primary">{children}</h3>,
  h3: ({ children }) => <h3 className="mb-1.5 mt-3 text-sm font-semibold text-primary">{children}</h3>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline underline-offset-2 hover:text-accent-hover"
    >
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded-sm bg-surface-2 px-1 py-0.5 font-mono text-[0.8em] text-primary">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-md border border-border-subtle bg-surface-2 p-3 font-mono text-xs last:mb-0">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-border-subtle bg-surface-2 px-2 py-1 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="border border-border-subtle px-2 py-1">{children}</td>,
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-border-strong pl-3 text-secondary last:mb-0">
      {children}
    </blockquote>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm text-secondary">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
