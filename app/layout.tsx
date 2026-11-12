// 注意：这个文件没有写 "use client"，所以它是默认的「服务器组件」。
// 根布局通常应该是服务器组件——它不需要交互，只负责搭骨架，这样首屏更快。

// 导入 Metadata 类型，仅用于给下面的 metadata 对象做类型检查。
import type { Metadata, Viewport } from "next";
// 导入全局样式表。在组件里直接 import css 文件是 Next 的用法，会把样式应用到整个站点。
import "./globals.css";
// Google Analytics 4：Next 官方第三方组件。它负责在页面注入 gtag.js 统计脚本，
// 并自动上报页面浏览（page_view）——包括本站在客户端做的路由切换（普通 gtag 需要手写才能追踪这类切换）。
import { GoogleAnalytics } from "@next/third-parties/google";

// 页面元信息：浏览器标签标题、SEO 描述等。Next 会自动注入到 <head>。
// 这是 Next.js 的约定：在 layout 或 page 文件里 export 一个名为 metadata 的对象，
// Next 就会据此生成 <title>、<meta name="description"> 等标签，无需自己手写。
export const metadata: Metadata = {
  // 绝对 URL 的基准：canonical / Open Graph 的相对地址都按它解析。
  // 不设的话静态导出里会变成 http://localhost:3000，SEO 链接全废。
  metadataBase: new URL("https://www.lijianglei.com"),
  title: "李姜磊 · Jianglei Li — résumé",      // 显示在浏览器标签页上的标题
  description: "李姜磊 (Jianglei Li) 的个人简历 — AI Agent 开发工程师，前字节跳动安全研发。", // 搜索引擎/分享预览用的描述
};

// viewport 也是 Next.js 的约定导出：这里只用它设置浏览器界面的主题色
// （手机浏览器的地址栏会染成这个颜色，和页面的黑色背景连成一片）。
export const viewport: Viewport = {
  themeColor: "#08090a",
};

// app/layout.tsx 也是 Next.js 的约定文件：它是「根布局」，包裹所有页面，
// 是唯一可以渲染 <html> 和 <body> 标签的地方。
// 参数里的 children 就是被它包裹的页面内容（也就是 app/page.tsx 渲染出来的东西）。
export default function RootLayout({
  children,
}: {
  // React.ReactNode：可被渲染的任意内容的类型，这里用来描述 children。
  children: React.ReactNode;
}) {
  return (
    // lang 的初始值与 ResumeApp 的默认语言一致（中文）。
    // 为什么要一致？构建时先用这里的初始属性渲染出 HTML，浏览器水合（hydration）时要求两边一致；
    // 之后用户切换语言时，ResumeApp 的 useEffect 会动态更新这个属性。
    // 全站只有一套深色主题，所以这里不再需要任何主题相关的 data-* 属性。
    <html lang="zh-CN">
      <head>
        {/* preconnect：提前和字体服务器建立连接，让后面真正下载字体时更快 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* 引入 Google Fonts，按用途分三组（对应 globals.css 里的 --f-display / --f-body / --f-mono）：
            · 展示字：Ma Shan Zheng 马善政毛笔楷书（中文）+ Bodoni Moda 衬线斜体（英文），用于名字、区块标题、公司名；
            · 正文：Archivo（英文）+ Noto Sans SC 思源黑体（中文）；
            · 等宽：Martian Mono，用于标签、日期、邮箱和终端。
            写法说明：「wght@400..800」表示这是可变字体，取 400 到 800 之间连续的字重；
            Bodoni Moda 的「ital,opsz,wght@1,6..96,700」依次是：只要斜体（1）、
            光学尺寸取 6 到 96（字越大笔画对比越强，浏览器按字号自动选）、字重固定 700；
            Martian Mono 的「wdth,wght@87.5,400..700」是把字宽固定在 87.5%（稍窄一点），字重取 400 到 700。 */}
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400..800&family=Bodoni+Moda:ital,opsz,wght@1,6..96,700&family=Ma+Shan+Zheng&family=Martian+Mono:wdth,wght@87.5,400..700&family=Noto+Sans+SC:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        {/* 开场遮罩默认盖住整个页面，由脚本负责撤掉。
            万一访客禁用了 JavaScript，就用这条样式直接把遮罩藏起来，保证内容照样看得到。 */}
        <noscript>
          <style>{".intro{display:none}"}</style>
        </noscript>
      </head>
      <body>
        {/* 把页面内容渲染进这个 #root 容器里。{children} 即当前路由对应页面的 JSX。 */}
        <div id="root">{children}</div>
        {/* Google Analytics：只在生产构建（pnpm build）时注入，本地 pnpm dev 不上报，
            避免自己开发时的访问污染统计数据。gaId 是 GA 后台给的「衡量 ID」——
            它不是机密，最终会出现在页面源码里，任何访客都能看到，所以直接写在这里没问题。 */}
        {process.env.NODE_ENV === "production" && <GoogleAnalytics gaId="G-E3PKHCXYBD" />}
      </body>
    </html>
  );
}
