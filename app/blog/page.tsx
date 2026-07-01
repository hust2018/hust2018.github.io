// 博客索引页（/blog/）：列出全部已发布文章 + 全部标签（服务器组件，构建期就把内容渲染成静态 HTML）。
//
// 为什么这是「服务器组件」而不用 "use client"？
//   它只读构建期数据（getAllPosts / getAllTags 会读文件系统），不需要任何浏览器交互或状态。
//   服务器组件在导出时直接生成静态 HTML，零客户端 JS——这正是 SEO 想要的：爬虫拿到的就是完整内容。
import type { Metadata } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { PostCard } from "@/components/blog/PostCard";
import { TagChip } from "@/components/blog/TagChip";
import { Breadcrumb } from "@/components/blog/Breadcrumb";
import { urlFor, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/site";

// 列表页的规范地址：始终指向 /blog/（带结尾斜杠，与 trailingSlash:true 一致）。
// 所有 metadata 里的 URL 都走 urlFor()，避免出现 localhost 或缺斜杠导致 canonical 分裂。
const canonical = urlFor("/blog");

// 页面级 metadata：Next 会据此在 <head> 里生成 <title> / <meta> / canonical / Open Graph。
// 这是个静态导出页，metadata 是常量（不像文章页要按 slug 动态算），所以直接 export const 即可。
export const metadata: Metadata = {
  title: `博客 / Blog — ${SITE_NAME}`,
  description: "技术笔记与文章：AI Agent、前端、安全研发等主题。",
  // canonical 告诉搜索引擎「这页的唯一权威地址」，杜绝带参数/不带斜杠的重复收录。
  alternates: { canonical },
  openGraph: {
    type: "website",
    title: `博客 / Blog — ${SITE_NAME}`,
    description: "技术笔记与文章：AI Agent、前端、安全研发等主题。",
    url: canonical,
    // 列表页没有专属封面，用站点兜底社交图（1200×630）。
    images: [DEFAULT_OG_IMAGE],
    locale: "zh_CN",
  },
};

export default function BlogIndexPage() {
  // 构建期一次性取数据：已发布文章（按日期倒序）+ 去重排序后的全部标签。
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <>
      {/* 面包屑：Home → Blog。最后一项 blog 不给 href，表示「当前就在这页」。 */}
      <Breadcrumb items={[{ label: "~", href: urlFor("/") }, { label: "blog" }]} />

      {/* 大标题：沿用终端风的「提示符 + display 字体」。.prompt-char 是开头那个发光的 $。 */}
      <h1 className="blog-title">
        <span className="prompt-char" aria-hidden="true">
          $
        </span>
        博客 / Blog
      </h1>
      <p className="blog-subtitle">技术笔记与文章 · technical notes &amp; writing</p>

      {/* 标签云：把每个 Tag 渲染成可点击的 chip，点进去是 /blog/tag/<slug>/ 聚合页。
          标签为空（还没写文章）时整块不渲染，避免出现一行空荡荡的容器。 */}
      {tags.length > 0 && (
        <div className="tag-list">
          {tags.map((tag) => (
            <TagChip key={tag.slug} tag={tag} />
          ))}
        </div>
      )}

      {/* 文章列表：每篇一张 PostCard。key 用 slug（稳定且唯一），帮 React 高效 diff。
          没有任何文章时给一句占位提示，而不是渲染一片空白。 */}
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post.slug} post={post} />)
      ) : (
        <p className="blog-subtitle">还没有文章 / No posts yet.</p>
      )}
    </>
  );
}
