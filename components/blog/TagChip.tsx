// 标签 chip：一个链到 /blog/tag/<slug>/ 的小药丸（服务器组件，纯展示）。
//
// 为什么用 next/link 而不是裸 <a>？
//   这是 Next 推荐的站内导航方式。本项目静态导出 + 自定义域名，urlFor() 产出的是
//   「绝对 + 结尾带斜杠」的 URL（如 https://www.lijianglei.com/blog/tag/rust/），
//   Next 会把它渲染成普通 <a href="…">，对搜索引擎和直接点击都正确。
import Link from "next/link";
import type { Tag } from "@/lib/posts";
import { urlFor } from "@/lib/site";

// Tag = { name: 原始标签名（展示用）, slug: URL 安全的小写形式（路径段用）}。
// 展示时前面加 # 呼应「话题标签」的直觉；链接地址用 slug，避免中文/空格直接进 URL。
export function TagChip({ tag }: { tag: Tag }) {
  return (
    <Link className="tag-chip" href={urlFor(`/blog/tag/${tag.slug}`)}>
      #{tag.name}
    </Link>
  );
}
