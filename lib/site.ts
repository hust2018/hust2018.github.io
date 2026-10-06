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

// ---------------------------------------------------------------------------
// 友情链接（友链）：与其他独立博客互相交换的链接。
// 数据放在这里而不是写死在组件里，遵循本项目「内容即数据」的约定——
// 以后加新友链只改这个数组，不用动任何 JSX。
// 字段：name 站名 / author 作者 / desc 一句话描述 / url 站点地址
// ---------------------------------------------------------------------------
export type FriendLink = { name: string; author: string; desc: string; url: string };

export const FRIEND_LINKS: FriendLink[] = [
  {
    name: "Matthew Labs",
    author: "Matthew Hong",
    desc: "Thinking through the AI-native era —— AI 原生时代的架构、规范与工程笔记",
    url: "https://matthewohmygosh.com/",
  },
];
