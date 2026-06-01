import { defineDocumentType, defineNestedType, makeSource } from "contentlayer2/source-files";
import readingTime from "reading-time";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

/**
 * Contentlayer schema for the /resources MDX blog.
 * Articles live in content/resources/*.mdx. Frontmatter is typed below; `faq` is an
 * optional list used to emit FAQ structured data on the article page.
 */
const FAQItem = defineNestedType(() => ({
  name: "FAQItem",
  fields: {
    question: { type: "string", required: true },
    answer: { type: "string", required: true },
  },
}));

export const Article = defineDocumentType(() => ({
  name: "Article",
  filePathPattern: "resources/**/*.mdx",
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    excerpt: { type: "string", required: true },
    date: { type: "date", required: true },
    tag: { type: "string", required: true },
    author: { type: "string", required: false },
    faq: { type: "list", of: FAQItem, required: false },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace(/^resources\//, ""),
    },
    url: {
      type: "string",
      resolve: (doc) => `/resources/${doc._raw.flattenedPath.replace(/^resources\//, "")}`,
    },
    readingTime: {
      type: "string",
      resolve: (doc) => readingTime(doc.body.raw).text,
    },
  },
}));

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Article],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  },
});
