// 全站 404 页。`app/not-found.tsx` 是 Next App Router 的约定文件名：
// 任何路由没命中、或代码里调用 notFound() 时，都会渲染这个组件。
//
// 静态导出（output:"export"）下，它会被生成成 out/404.html。
// GitHub Pages 正好把所有「找不到的路径」回退到 404.html，所以这一个文件就覆盖了全站的 404。
//
// 为什么是「服务器组件」（没有 "use client"）？
//   这页只有固定文字和两个链接，零交互、零状态。让它在构建期就渲染成纯 HTML 最划算：
//   用户与爬虫都能立刻看到内容，且完全不需要加载客户端 JS。
//
// 关于样式作用域：404 不在 /blog/** 下，拿不到 app/blog/blog.css；
//   但根布局已全局引入 globals.css，所以这里能复用 .frame / .glitch / .icon-btn / .prompt 等类，
//   再加上本文件专属的 not-found.css 负责「整页居中 + 终端窗口」排版。
import type { Metadata } from "next";
import Link from "next/link";
import { urlFor, SITE_NAME } from "@/lib/site";
import "./not-found.css";

// 404 不是真实内容页，不该被搜索引擎收录：用 robots.noindex 明确告诉爬虫跳过它。
export const metadata: Metadata = {
  title: `404 — 页面未找到 / Not Found · ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="notfound">
      <div className="notfound-window frame">
        {/* 终端窗口顶栏：三个交通灯点 + 标签，纯装饰，对屏幕阅读器隐藏（aria-hidden）。 */}
        <div className="notfound-titlebar">
          <span className="notfound-dot r" aria-hidden="true" />
          <span className="notfound-dot y" aria-hidden="true" />
          <span className="notfound-dot g" aria-hidden="true" />
          <span className="label">~/404 — zsh</span>
        </div>

        <div className="notfound-body">
          {/* 模拟在终端里敲了一条命令、shell 回了「没有这个文件」。$ 是装饰性提示符。 */}
          <p className="notfound-cmd">
            <span className="prompt" aria-hidden="true">
              $
            </span>
            cd ./requested-page
          </p>
          <p className="notfound-err">cd: no such file or directory: 404</p>

          {/* 巨大的 404：data-text 供 .glitch 的伪元素读取，做 RGB 色散抖动效果。 */}
          <div className="notfound-code">
            <span className="glitch" data-text="404">
              404
            </span>
          </div>

          {/* 双语静态文案：先中文后英文，与全站「zh / en 并列」的口径一致。 */}
          <h1 className="notfound-title">页面未找到 · Page not found</h1>
          <p className="notfound-msg">
            你访问的页面不存在、已被移动，或从未存在过。
            <br />
            The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
          </p>

          {/* 两个出口：返回首页 / 浏览博客。href 走 urlFor()，保证是「绝对 + 带结尾斜杠」的规范地址，
              与全站 trailingSlash:true 的 URL 形态一致。 */}
          <div className="notfound-links">
            <Link className="icon-btn" href={urlFor("/")}>
              ← 返回首页 / Home
            </Link>
            <Link className="icon-btn" href={urlFor("/blog")}>
              浏览博客 / Blog →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
