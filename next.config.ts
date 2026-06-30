import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生成纯静态 HTML/CSS/JS 到 out/ 目录，可上传到任意静态托管。
  output: "export",
  // 静态导出时关闭 Next 的图片优化（它需要服务器），直接用原图。
  images: { unoptimized: true },
  // 让每个路由导出成 <route>/index.html，URL 带结尾斜杠——GitHub Pages 最稳的形态。
  trailingSlash: true,
};

export default nextConfig;
