import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Banner } from "@/components/ui/Banner";
import { cn } from "@/lib/cn";

/**
 * LegalLayout — shared shell for /legal/* pages. Renders a prose-width reading column,
 * a prominent "placeholder, not legal advice" banner, cross-links between the legal
 * docs, and hand-styled typography for the semantic content passed as children.
 */
const prose = cn(
  "[&_h2]:mt-10 [&_h2]:scroll-mt-24 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-primary",
  "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-primary",
  "[&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-secondary",
  "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-secondary",
  "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:text-secondary",
  "[&_li]:leading-relaxed",
  "[&_strong]:font-semibold [&_strong]:text-primary",
  "[&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2",
);

const legalLinks = [
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "DPA", href: "/legal/dpa" },
];

export function LegalLayout({
  title,
  effectiveDate = "[Effective date]",
  intro,
  children,
}: {
  title: string;
  effectiveDate?: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <Container size="prose" className="py-16 lg:py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">Legal</p>
      <h1 className="mt-3 text-h1 font-semibold text-primary">{title}</h1>
      <p className="mt-3 text-sm text-muted">Effective: {effectiveDate}</p>
      {intro && <p className="mt-4 text-lg leading-relaxed text-secondary">{intro}</p>}

      <Banner variant="warn" title="Placeholder — not legal advice" className="mt-6">
        This is template scaffolding to define structure only. The real, binding text must be
        drafted and reviewed by qualified legal counsel before launch. Do not rely on this content.
      </Banner>

      <nav aria-label="Legal documents" className="mt-6 flex flex-wrap gap-2">
        {legalLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-md border border-border-subtle bg-surface-1 px-3 py-1.5 text-sm text-secondary transition-colors hover:border-border-strong hover:text-primary"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className={cn("mt-8", prose)}>{children}</div>

      <hr className="my-10 border-border-subtle" />
      <p className="text-sm text-muted">
        Questions about this document? Contact{" "}
        <a href="mailto:[legal@petrobrain.example]" className="text-accent underline underline-offset-2">
          [legal@petrobrain.example]
        </a>
        .
      </p>
    </Container>
  );
}
