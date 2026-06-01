import type { Metadata } from "next";
import { allArticles } from "contentlayer/generated";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ResourceIndex, type ArticleCard } from "@/components/resources/ResourceIndex";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Field notes on AI, safety and regulation in oil & gas — plain-English explainers from the people building PetroBrain.",
  alternates: { canonical: "/resources" },
  openGraph: {
    type: "website",
    title: "Resources · PetroBrain",
    description:
      "Field notes on AI, safety and regulation in oil & gas — plain-English explainers from the people building PetroBrain.",
  },
};

export default function ResourcesPage() {
  const articles: ArticleCard[] = allArticles
    .slice()
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map((a) => ({
      title: a.title,
      excerpt: a.excerpt,
      date: a.date,
      tag: a.tag,
      url: a.url,
      readingTime: a.readingTime,
    }));

  return (
    <Container className="py-16 lg:py-20">
      <Eyebrow>Resources</Eyebrow>
      <h1 className="mt-3 max-w-2xl text-display font-semibold text-primary">
        Field notes on AI, safety and regulation in oil &amp; gas.
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-secondary">
        Plain-English explainers from the people building PetroBrain — no hype, no fabricated
        numbers, just the things worth understanding.
      </p>

      <div className="mt-12">
        <ResourceIndex articles={articles} />
      </div>
    </Container>
  );
}
