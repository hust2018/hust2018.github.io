import type { MetadataRoute } from "next";
import { urlFor } from "@/lib/site";

// 静态导出只收录当前公开的简历首页，不再生成博客链接。
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: urlFor("/") }];
}
