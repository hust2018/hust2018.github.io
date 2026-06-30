// 博客专用布局：包住 /blog/** 所有页面，统一加载阅读区样式 + KaTeX 样式。
// 注意：KaTeX 的 CSS 只在这里引入（博客作用域），不进全局，简历页保持干净。
import type { ReactNode } from "react";
import "katex/dist/katex.min.css";
import "./blog.css";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <div className="blog-shell">{children}</div>;
}
