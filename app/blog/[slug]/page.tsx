// 单篇文章页（/blog/<slug>/）：构建期把对应 .md 渲染成静态 HTML，并产出 SEO 元信息与结构化数据。
//
// 为什么是「服务器组件」（没有 "use client"）？
//   它要在构建期读文件系统（getPostBySlug）、跑 unified 流水线（renderMarkdown）——这些只能在 Node 端做。
//   渲染结果是纯静态 HTML，爬虫直接拿到完整正文 + <head> 里的 meta + JSON-LD，这正是 SEO 想要的。
//   唯一需要浏览器的部分是 Mermaid 图（见文末），它被单独拆成一个 "use client" 叶子组件按需挂载。
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";
import { Prose } from "@/components/blog/Prose";
import { ArticleHeader } from "@/components/blog/ArticleHeader";
import { Breadcrumb } from "@/components/blog/Breadcrumb";
import { Mermaid } from "@/components/blog/Mermaid";
import { urlFor, AUTHOR, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/site";
import type { Metadata } from "next";

// 静态导出必须穷举所有要生成的 slug（导出模式下 dynamicParams 视为 false）。
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

const localeOf = (lang: "zh" | "en") => (lang === "zh" ? "zh_CN" : "en_US");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;            // Next 15 / React 19：params 是 Promise，要 await
  const post = getPostBySlug(slug);
  if (!post) return {};
  const { meta } = post;
  const canonical = urlFor(`/blog/${slug}`);
  const image = meta.cover ? new URL(meta.cover, "https://www.lijianglei.com").toString() : DEFAULT_OG_IMAGE;
  return {
    title: `${meta.title} — ${SITE_NAME}`,
    description: meta.description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description,
      url: canonical,
      images: [image],
      locale: localeOf(meta.lang),
      publishedTime: meta.date,
      modifiedTime: meta.updated ?? meta.date,
    },
    twitter: { card: "summary_large_image", title: meta.title, description: meta.description, images: [image] },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const { meta } = post;
  const { html, hasMermaid } = await renderMarkdown(post.raw);
  const canonical = urlFor(`/blog/${slug}`);
  const image = meta.cover ? new URL(meta.cover, "https://www.lijianglei.com").toString() : DEFAULT_OG_IMAGE;

  // 结构化数据：BlogPosting（文章本身）+ BreadcrumbList（面包屑），帮助富结果展示。
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: meta.title.slice(0, 110),
        description: meta.description,
        datePublished: meta.date,
        dateModified: meta.updated ?? meta.date,
        inLanguage: meta.lang,
        author: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
        publisher: { "@type": "Person", name: AUTHOR.name, url: AUTHOR.url },
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        image: [image],
        url: canonical,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: urlFor("/") },
          { "@type": "ListItem", position: 2, name: "Blog", item: urlFor("/blog") },
          { "@type": "ListItem", position: 3, name: meta.title, item: canonical },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={[{ label: "~", href: urlFor("/") }, { label: "blog", href: urlFor("/blog") }, { label: meta.title }]} />
      <ArticleHeader meta={meta} />
      <Prose html={html} lang={meta.lang} />
      {hasMermaid && <Mermaid />}
    </>
  );
}
