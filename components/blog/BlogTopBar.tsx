// 博客顶栏：/blog/** 页面专用，复用简历首页同一套 .topbar 样式（定义在 app/globals.css，
// 全站共享，因为根布局 app/layout.tsx 才是唯一加载 globals.css 的地方）。
//
// 为什么需要这个文件：之前 app/blog/layout.tsx 只包了一层 .blog-shell（720px 窄栏），
// 完全没有顶栏——于是博客页面凭空少了首页那条「粘顶 + 三个圆点 + 半透明模糊」的顶栏，
// 视觉上像换了一个网站，尤其在很宽的显示器上，中间一小条窄文字飘在大片空白里，看着像没对齐。
// 顶栏本身固定宽度 1060px 居中（--max-w，见 globals.css .topbar-inner），
// 博客正文是 720px 居中——两者宽度不同是有意为之（导航条更宽、正文更窄利于长文阅读），
// 常见于很多文档/博客网站，只要顶栏本身稳定出现，读者就不会觉得「错位」。
//
// 这是纯服务器组件（没有 "use client"）：不需要读 localStorage、不需要实时时钟，
// 只展示固定文本 + 一个返回首页的链接，构建期就能渲染完，博客页因此保持零客户端 JS 的静态导出优势。
import Link from "next/link";
import { RESUME } from "@/lib/data";
import { urlFor } from "@/lib/site";

export function BlogTopBar() {
  const { meta } = RESUME;
  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* 三个圆点：纯装饰，呼应首页顶栏的终端窗口按钮观感 */}
        <div className="dots">
          <span className="dot live"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div className="topbar-title">
          <span>
            <span className="label">SESSION:</span>{" "}
            <span className="val">
              {meta.user}@{meta.host}
            </span>
          </span>
          <span className="sep">│</span>
          <span>
            <span className="label">PATH:</span> <span className="val">~/blog</span>
          </span>
        </div>
        <div className="topbar-actions">
          <Link className="icon-btn" href={urlFor("/")}>
            ← 首页 / Home
          </Link>
        </div>
      </div>
    </header>
  );
}
