import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// output:"export" 没有运行时服务器，约定式路由（robots.txt / sitemap.xml）默认会被当成动态路由，
// 必须显式声明成静态，构建期一次性产出文件，否则导出报错。
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
