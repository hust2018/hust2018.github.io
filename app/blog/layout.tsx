// 博客专用布局：包住 /blog/** 所有页面，统一加载阅读区样式 + KaTeX 样式。
// 注意：KaTeX 的 CSS 只在这里引入（博客作用域），不进全局，简历页保持干净。
//
// 顶栏：复用首页同一条 .topbar（见 BlogTopBar.tsx 顶部注释说明原因）——
// 没有它博客页会缺失全站统一的顶部 chrome，窄栏正文飘在空白里显得「没对齐」。
import type { ReactNode } from "react";
import "katex/dist/katex.min.css";
import "./blog.css";
import { BlogTopBar } from "@/components/blog/BlogTopBar";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BlogTopBar />
      <div className="blog-shell">{children}</div>
    </>
  );
}
