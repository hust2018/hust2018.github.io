import type { Metadata } from "next";
import "./globals.css";

// 页面元信息：浏览器标签标题、SEO 描述等。Next 会自动注入到 <head>。
export const metadata: Metadata = {
  title: "~/resume — your-handle",
  description: "终端 / 科技风的双语个人简历",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 这些 data-* 初始值与 page.tsx 的默认 state 一致，保证首屏不闪烁。
    <html lang="zh-CN" data-variant="terminal" data-theme="dark" data-blink="on" data-crt="off">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
