import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { urlFor } from "@/lib/site";

// output:"export" 没有运行时服务器，约定式路由（sitemap.xml）默认会被当成动态路由，
// 必须显式声明成静态，构建期一次性产出文件，否则导出报错。
export const dynamic = "force-static";

// 只收录：首页、/blog/、已发布文章。标签页是稀薄聚合页，noindex 且不进 sitemap。
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((p) => ({
    url: urlFor(`/blog/${p.slug}`),
    lastModified: p.updated ?? p.date,
  }));
  return [
    { url: urlFor("/"), lastModified: new Date().toISOString().slice(0, 10) },
    { url: urlFor("/blog"), lastModified: posts[0]?.lastModified },
    ...posts,
  ];
}
