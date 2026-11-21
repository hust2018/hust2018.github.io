// 注意：这个文件没有写 "use client"，所以它是默认的「服务器组件」。
// 根布局通常应该是服务器组件——它不需要交互，只负责搭骨架，这样首屏更快。

// 导入 Metadata 类型，仅用于给下面的 metadata 对象做类型检查。
import type { Metadata, Viewport } from "next";
// 用 Next.js 内置的 next/font/google 加载字体：构建时把字体文件下载并打包进静态产物里。
// 好处：国内访客不用连 Google Fonts 就能秒出字，也不会因为外链超时导致开场动画回退成系统字体。
import { Archivo, Bodoni_Moda, Ma_Shan_Zheng, Martian_Mono, Noto_Sans_SC } from "next/font/google";
// 导入全局样式表。在组件里直接 import css 文件是 Next 的用法，会把样式应用到整个站点。
import "./globals.css";
// Google Analytics 4：Next 官方第三方组件。它负责在页面注入 gtag.js 统计脚本，
// 并自动上报页面浏览（page_view）——包括本站在客户端做的路由切换（普通 gtag 需要手写才能追踪这类切换）。
import { GoogleAnalytics } from "@next/third-parties/google";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, urlFor } from "@/lib/site";

// 五套字体按用途分三组（对应 globals.css 里的 --f-display / --f-body / --f-mono）：
//   · 展示字：Ma Shan Zheng 马善政毛笔楷书（中文）+ Bodoni Moda 衬线斜体（英文），用于名字、区块标题、公司名；
//   · 正文：Archivo（英文）+ Noto Sans SC 思源黑体（中文）；
//   · 等宽：Martian Mono，用于标签、日期、邮箱和终端。
// variable 会生成对应的 CSS 变量（如 --font-archivo），挂在 <html> 上供 globals.css 引用。
const archivo = Archivo({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-archivo",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  weight: "variable",
  style: "italic",
  axes: ["opsz"],
  display: "swap",
  variable: "--font-bodoni",
});

// 中文字体按字集切片非常多，设 preload: false 避免给首屏塞入无用的预加载标签，
// 浏览器仍会按页面实际用到的汉字从本站静态目录按需拉取对应切片。
const maShanZheng = Ma_Shan_Zheng({
  preload: false,
  weight: "400",
  display: "swap",
  variable: "--font-ma-shan-zheng",
});

const martianMono = Martian_Mono({
  subsets: ["latin"],
  weight: "variable",
  axes: ["wdth"],
  display: "swap",
  variable: "--font-martian-mono",
});

const notoSansSC = Noto_Sans_SC({
  preload: false,
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-sc",
});

const FONT_VARS = [
  archivo.variable,
  bodoniModa.variable,
  maShanZheng.variable,
  martianMono.variable,
  notoSansSC.variable,
].join(" ");

const SITE_TITLE = `${SITE_NAME} — résumé`;
const SITE_DESC = "李姜磊 (Jianglei Li) 的个人简历 — AI Agent 开发工程师，前字节跳动安全研发。";

// 页面元信息：浏览器标签标题、SEO 描述、微信/社交软件分享卡片等。Next 会自动注入到 <head>。
// 这是 Next.js 的约定：在 layout 或 page 文件里 export 一个名为 metadata 的对象，
// Next 就会据此生成 <title>、<meta name="description">、og:* 等标签，无需自己手写。
export const metadata: Metadata = {
  // 绝对 URL 的基准：canonical / Open Graph 的相对地址都按它解析。
  // 不设的话静态导出里会变成 http://localhost:3000，SEO 链接全废。
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE, // 显示在浏览器标签页上的标题
  description: SITE_DESC, // 搜索引擎/分享预览用的描述
  alternates: {
    canonical: urlFor("/"),
  },
  // Open Graph：发链接到微信、Slack、LinkedIn 等平台时显示的标题、简介和封面图。
  openGraph: {
    type: "website",
    url: urlFor("/"),
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESC,
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_TITLE }],
  },
  // Twitter / X 分享卡片：大图模式。
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
    images: [DEFAULT_OG_IMAGE],
  },
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
    // className 把五套字体的 CSS 变量挂在根节点上，供 globals.css 里的 --f-* 使用。
    <html lang="zh-CN" className={FONT_VARS}>
      <head>
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
