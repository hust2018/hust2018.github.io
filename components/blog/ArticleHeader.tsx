// 文章头部：单篇文章页正文上方的大标题区——标题 + 发布/更新时间 + 阅读时长 + 标签
//（服务器组件，纯展示）。样式见 app/blog/blog.css 的 .article-header。
import type { PostMeta } from "@/lib/posts";
import { tagSlug } from "@/lib/posts";
import { TagChip } from "./TagChip";

export function ArticleHeader({ meta }: { meta: PostMeta }) {
  return (
    <header className="article-header">
      {/* 文章真正的 H1：每页应有且仅有一个，利于无障碍与 SEO 的标题层级。 */}
      <h1>{meta.title}</h1>

      <div className="post-meta">
        {/* 发布时间：dateTime 给机器读，文本给人读。 */}
        <time dateTime={meta.date}>{meta.date}</time>
        {/* 更新时间是可选字段：只有 frontmatter 里写了 updated 才显示。
            && 短路：左侧为「假」（undefined）时整个表达式不渲染——React 里隐藏元素的常用写法。
            前缀 ↻ 表示「已更新」，语言中性。 */}
        {meta.updated && (
          <time dateTime={meta.updated} title="Updated">
            ↻ {meta.updated}
          </time>
        )}
        {/* 阅读时长（语言中性的 min，原因同 PostCard）。 */}
        <span>{meta.readingMinutes} min</span>
        {/* 语言徽章，ZH / EN。 */}
        <span className="lang-badge">{meta.lang.toUpperCase()}</span>
      </div>

      {/* 标签区：有标签才渲染。把字符串标签就地转 Tag 交给 TagChip，slug 复用同一个 tagSlug()。 */}
      {meta.tags.length > 0 && (
        <div className="tag-list">
          {meta.tags.map((name) => (
            <TagChip key={name} tag={{ name, slug: tagSlug(name) }} />
          ))}
        </div>
      )}
    </header>
  );
}
