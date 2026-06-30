// 标签聚合页（/blog/tag/<slug>/）：列出某个标签下的全部已发布文章（服务器组件，构建期生成静态 HTML）。
//
// 为什么是「服务器组件」（没有 "use client"）？
//   它只读构建期数据（getAllTags / getPostsByTag 会读文件系统），没有任何浏览器交互或状态，
//   导出时直接变成静态 HTML，零客户端 JS。
//
// 为什么标签页要 noindex（见下面 generateMetadata 的 robots）？
//   标签页是「稀薄的聚合页」——内容基本是别处文章的标题/摘要的再罗列，没有独立价值。
//   让搜索引擎收录它们反而会稀释站点权重、制造重复内容。所以 index:false（不收录本页），
//   但 follow:true（仍然顺着页内链接去爬真正的文章页），这样既不污染索引又不挡住文章被发现。
//   配套地，sitemap 也不会收录标签页（见 app/sitemap.ts）。
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTag } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import { Breadcrumb } from "@/components/blog/Breadcrumb";
import { urlFor } from "@/lib/site";

// 静态导出必须穷举所有要生成的标签页（导出模式下 dynamicParams 视为 false，
// 没在这里列出的 tagSlug 就不会有对应的 HTML 文件）。
// 路由参数名是 tagSlug——必须和文件夹名 [tagSlug] 完全一致。
export function generateStaticParams() {
  return getAllTags().map((t) => ({ tagSlug: t.slug }));
}

// 页面级 metadata 要按 tagSlug 动态算（每个标签标题不同），所以用 generateMetadata 而非常量 metadata。
// 注意：Next 15 / React 19 里 params 是个 Promise，必须先 await 再解构。
export async function generateMetadata({ params }: { params: Promise<{ tagSlug: string }> }): Promise<Metadata> {
  const { tagSlug } = await params;
  // 从全部标签里反查这个 slug 对应的「原始标签名」（用于标题展示）。找不到就返回空对象。
  const tag = getAllTags().find((t) => t.slug === tagSlug);
  if (!tag) return {};
  return {
    title: `#${tag.name} · 文章 / Blog`,
    // canonical 仍然指向本页的规范地址（带结尾斜杠），即使 noindex 也给出，避免参数变体被当成不同页。
    alternates: { canonical: urlFor(`/blog/tag/${tagSlug}`) },
    // 关键：不收录这个稀薄聚合页，但允许爬虫顺着链接去抓真正的文章。
    robots: { index: false, follow: true },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tagSlug: string }> }) {
  const { tagSlug } = await params;
  // 反查标签名 + 取该标签下的全部已发布文章（已按日期倒序）。
  const tag = getAllTags().find((t) => t.slug === tagSlug);
  const posts = getPostsByTag(tagSlug);
  // 标签不存在、或该标签下没有任何已发布文章 → 404。
  // （正常情况下 getAllTags 是从已发布文章推导出来的，二者一致；这里双重保险，杜绝空壳页面。）
  if (!tag || posts.length === 0) notFound();

  return (
    <>
      {/* 面包屑：Home → Blog → #标签。最后一项不给 href，表示「当前就在这页」。 */}
      <Breadcrumb
        items={[
          { label: "~", href: urlFor("/") },
          { label: "blog", href: urlFor("/blog") },
          { label: `#${tag.name}` },
        ]}
      />

      {/* 大标题：沿用终端风「提示符 + display 字体」，标签页用 # 作提示符（呼应「#标签」语义）。
          .prompt-char 是那个发光的前缀字符；aria-hidden 让屏幕阅读器跳过这个纯装饰符号。 */}
      <h1 className="blog-title">
        <span className="prompt-char" aria-hidden="true">
          #
        </span>
        {tag.name}
      </h1>
      <p className="blog-subtitle">
        标签下的文章 · {posts.length} 篇 / {posts.length} post{posts.length > 1 ? "s" : ""}
      </p>

      {/* 文章列表：每篇一张 PostCard，复用首页/索引页同一个卡片组件。
          key 用 slug（稳定且唯一），帮 React 高效 diff。 */}
      {posts.map((post) => (
        <PostCard key={post.slug} post={post} />
      ))}
    </>
  );
}
