// 站点级常量与 URL 工具：canonical / Open Graph / sitemap / JSON-LD 都从这里取，
// 保证全站只有一个真相来源，且 URL 形态统一（带结尾斜杠，与 trailingSlash:true 一致）。
export const SITE_URL = "https://www.lijianglei.com";
export const SITE_NAME = "李姜磊 · Jianglei Li";
export const AUTHOR = { name: "李姜磊 / Jianglei Li", url: SITE_URL };
// 没有 cover 的文章用这张兜底社交图（1200×630，放在 public/）。
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

// 把任意站内路径变成「绝对 + 结尾带斜杠」的规范 URL。
// trailingSlash:true 下每个页面的真实地址都以 / 结尾，所有对外 URL 必须一致，否则 canonical 会分裂。
export function urlFor(path: string): string {
  const trimmed = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return trimmed === "" ? `${SITE_URL}/` : `${SITE_URL}/${trimmed}/`;
}
