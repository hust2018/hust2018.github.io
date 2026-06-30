// 面包屑导航：渲染终端风的 `▸ ~ / blog / 标题` 路径行（服务器组件，纯展示）。
//
// 设计要点（配合 app/blog/blog.css 里的 .blog-breadcrumb）：
//   - 每一项都是 .blog-breadcrumb 的「直接子元素」，CSS 用 `> * + *::before { content: "/" }`
//     在相邻两项之间自动插入分隔符 `/`，所以这里组件本身「不」手写斜杠。
//   - 有链接且不是最后一项 → 渲染成 <Link>（可点击跳转）。
//   - 最后一项（当前页）没有链接，加 .crumb-current 高亮，提示「你在这里」。
//   - 开头的提示符 ▸ 只贴在第一项里（作为它内部的一个 span），而不是单独成一项——
//     否则它会被 `* + *::before` 规则在后面也加上一个 `/`，变成丑陋的「▸ / ~」。
import Link from "next/link";

// items 由调用方（文章页/列表页）传入，href 已经过 urlFor() 处理成绝对+带斜杠的地址；
// 最后一项通常不传 href（表示当前所在页）。
export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="blog-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, i) => {
        const isFirst = i === 0;
        const isLast = i === items.length - 1;
        // 第一项内部前置一个装饰性的 ▸（aria-hidden：对屏幕阅读器无意义，跳过朗读）。
        const content = isFirst ? (
          <>
            <span aria-hidden="true">▸ </span>
            {item.label}
          </>
        ) : (
          item.label
        );
        // 能点的项（有 href 且不是当前页）→ 链接；否则 → 纯文本 span。
        if (item.href && !isLast) {
          return (
            <Link key={i} href={item.href}>
              {content}
            </Link>
          );
        }
        return (
          <span key={i} className={isLast ? "crumb-current" : undefined}>
            {content}
          </span>
        );
      })}
    </nav>
  );
}
