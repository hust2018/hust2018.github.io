// 文章卡片：列表页（/blog/ 与 /blog/tag/<slug>/）里每篇文章一张卡（服务器组件，纯展示）。
//
// 为什么卡片根用 <article> 而不是把整张卡做成一个大 <a>？
//   卡片里既要有「标题链接」又要有「标签链接」。HTML 不允许 <a> 里再套 <a>（嵌套链接非法），
//   而且全局 a:hover 会给链接文字加下划线——整张卡变链接的话，hover 时所有文字都被划线，很丑。
//   所以根用语义化的 <article>，让标题和标签作为它内部「并列」的两组链接（互不嵌套，合法）。
//   .post-card:hover .post-card-title 的悬停高亮只需要卡片是被 hover 的容器即可，不必是链接。
import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { tagSlug } from "@/lib/posts";
import { urlFor } from "@/lib/site";
import { TagChip } from "./TagChip";

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="post-card">
      {/* 标题是唯一进文章的链接。class 放在 <Link> 上：.post-card-title 的颜色（--fg）靠类选择器
          的优先级压过全局 a 的强调色，hover 卡片时再由 .post-card:hover .post-card-title 变成强调色。 */}
      <Link className="post-card-title" href={urlFor(`/blog/${post.slug}`)}>
        {post.title}
      </Link>
      <p className="post-card-desc">{post.description}</p>

      {/* 元信息行：日期 / 阅读时长 / 语言徽章 / 标签。 */}
      <div className="post-meta">
        {/* <time dateTime> 给机器一个可解析的日期；显示文本仍是原始 ISO 串，简洁。 */}
        <time dateTime={post.date}>{post.date}</time>
        {/* 阅读时长用语言中性的 "min"：本组件接口只收 PostMeta、不收站点 lang，
            不便按界面语言切换文案，故用通用写法（中文读者也能理解 “5 min”）。 */}
        <span>{post.readingMinutes} min</span>
        {/* 语言徽章 ZH / EN：一眼区分这篇是中文还是英文。 */}
        <span className="lang-badge">{post.lang.toUpperCase()}</span>
        {/* 标签：把 PostMeta.tags（字符串数组）就地转成 Tag 对象交给 TagChip。
            slug 必须用 lib/posts 里同一个 tagSlug()，保证和标签页路由完全一致。 */}
        {post.tags.map((name) => (
          <TagChip key={name} tag={{ name, slug: tagSlug(name) }} />
        ))}
      </div>
    </article>
  );
}
