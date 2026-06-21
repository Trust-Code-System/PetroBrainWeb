import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { allArticles } from "contentlayer/generated";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Mdx } from "@/components/resources/Mdx";
import { ctas, site } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return allArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const article = allArticles.find((a) => a.slug === slug);
  if (!article) return {};
  const url = `${site.url}${article.url}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: article.url },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url,
      publishedTime: new Date(article.date).toISOString(),
      authors: [article.author ?? site.name],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = allArticles.find((a) => a.slug === slug);
  if (!article) notFound();

  const author = article.author ?? site.name;

  // Related: same tag first, then most recent, excluding the current article.
  const related = allArticles
    .filter((a) => a.slug !== article.slug)
    .sort((a, b) => {
      const tagA = a.tag === article.tag ? 0 : 1;
      const tagB = b.tag === article.tag ? 0 : 1;
      if (tagA !== tagB) return tagA - tagB;
      return +new Date(b.date) - +new Date(a.date);
    })
    .slice(0, 3);

  const url = `${site.url}${article.url}`;

  // Structured data — Article + (optional) FAQ.
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    datePublished: new Date(article.date).toISOString(),
    author: { "@type": "Organization", name: author },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const faqLd =
    article.faq && article.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faq.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <Container size="prose" className="py-16 lg:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd).replace(/</g, "\\u003c") }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }}
        />
      )}

      <article>
        {/* Header */}
        <header>
          <Link href="/resources" className="text-sm text-secondary hover:text-primary">
            ← All resources
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <Badge tone="accent">{article.tag}</Badge>
            <span className="text-xs text-faint">{article.readingTime}</span>
          </div>
          <h1 className="mt-4 text-h1 font-semibold leading-tight text-primary">{article.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-secondary">{article.excerpt}</p>
          <div className="mt-5 flex items-center gap-2 text-sm text-faint">
            <span>{author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.date}>{format(new Date(article.date), "d LLLL yyyy")}</time>
          </div>
        </header>

        <hr className="my-8 border-border-subtle" />

        {/* Body */}
        <div className="text-[1.0625rem]">
          <Mdx code={article.body.code} />
        </div>
      </article>

      {/* Soft CTA */}
      <aside className="mt-14 rounded-xl border border-border-subtle bg-surface-1 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-primary">See it on your own operations.</h2>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          A focused walkthrough with a real engineer — cited, calculated, and honest about what it
          can and can’t see.
        </p>
        <div className="mt-5">
          <Button href={ctas.primary.href}>{ctas.primary.label}</Button>
        </div>
      </aside>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-sm font-semibold uppercase tracking-wider text-faint">
            Related reading
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <Link
                key={r.url}
                href={r.url}
                className="group rounded-lg border border-border-subtle bg-surface-1 p-5 transition-colors hover:border-border-strong hover:bg-surface-2"
              >
                <Badge tone="neutral">{r.tag}</Badge>
                <h3 className="mt-3 text-sm font-semibold leading-snug text-primary">{r.title}</h3>
                <span className="mt-3 inline-block text-xs text-accent">Read →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
