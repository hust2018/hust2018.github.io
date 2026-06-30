// 博客内容加载器：在「构建时」读取 content/posts/*.md，解析 frontmatter，
// 过滤草稿、排序、汇总标签。整个站点只在这里读文件系统——静态导出没有运行时服务器。
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  lang: "zh" | "en";
  tags: string[];
  cover?: string;
  readingMinutes: number;
};

export type Tag = { name: string; slug: string };

// 把标签名转成 URL 安全的 slug：小写、空白转连字符、只留 [a-z0-9-]；
// 非 ASCII（如中文）退化为百分号编码，保证能安全地做成 /blog/tag/<slug>/ 路径段。
export function tagSlug(name: string): string {
  const ascii = name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  return ascii || encodeURIComponent(name.trim().toLowerCase());
}

type RawPost = { meta: PostMeta; raw: string; draft: boolean };

// 读单个 md 文件 → 校验必填字段 → 返回结构化数据。字段缺失就抛错，绝不让没 SEO 元信息的文章上线。
function readPost(file: string): RawPost {
  const slug = file.replace(/\.md$/, "");
  const full = path.join(POSTS_DIR, file);
  const { data, content } = matter(fs.readFileSync(full, "utf8"));
  const required = ["title", "description", "date", "lang"] as const;
  for (const k of required) {
    if (!data[k]) throw new Error(`Post "${file}" is missing required frontmatter field: ${k}`);
  }
  if (data.lang !== "zh" && data.lang !== "en") {
    throw new Error(`Post "${file}" has invalid lang "${data.lang}" (must be zh|en)`);
  }
  return {
    draft: data.draft === true,
    raw: content,
    meta: {
      slug,
      title: String(data.title),
      description: String(data.description),
      date: String(data.date),
      updated: data.updated ? String(data.updated) : undefined,
      lang: data.lang,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      cover: data.cover ? String(data.cover) : undefined,
      readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    },
  };
}

// 读取并缓存所有「已发布」文章（构建期只跑一次）。
let _cache: RawPost[] | null = null;
function allRaw(): RawPost[] {
  if (_cache) return _cache;
  const files = fs.existsSync(POSTS_DIR) ? fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md")) : [];
  _cache = files.map(readPost);
  return _cache;
}
// 「已发布」= 非草稿，且文件名不以下划线开头。
// 下划线前缀（如 _fixture-*.md）是测试夹具：它们要留在仓库里供单测读取，
// 但绝不能进任何对外列表（首页/索引/标签/sitemap），所以在这唯一的入口一次性过滤掉。
function published(): RawPost[] {
  return allRaw().filter((p) => !p.draft && !p.meta.slug.startsWith("_"));
}

export function getAllPosts(): PostMeta[] {
  return published().map((p) => p.meta).sort((a, b) => (a.date < b.date ? 1 : -1));
}
export function getLatestPosts(n: number): PostMeta[] {
  return getAllPosts().slice(0, n);
}
export function getAllSlugs(): string[] {
  return published().map((p) => p.meta.slug);
}
export function getPostBySlug(slug: string): { meta: PostMeta; raw: string } | null {
  const p = published().find((x) => x.meta.slug === slug);
  return p ? { meta: p.meta, raw: p.raw } : null;
}

// 汇总所有标签，去重并校验：两个不同标签名不能映射到同一个 slug（否则 /blog/tag/ 路径会撞车）。
export function getAllTags(): Tag[] {
  const bySlug = new Map<string, string>();
  for (const p of published()) {
    for (const name of p.meta.tags) {
      const slug = tagSlug(name);
      const existing = bySlug.get(slug);
      if (existing && existing !== name) {
        throw new Error(`Tag slug collision: "${existing}" and "${name}" both → "${slug}"`);
      }
      bySlug.set(slug, name);
    }
  }
  return [...bySlug.entries()].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.slug.localeCompare(b.slug));
}
export function getPostsByTag(slug: string): PostMeta[] {
  return getAllPosts().filter((p) => p.tags.some((t) => tagSlug(t) === slug));
}

// 仅供测试：绕过 published() 的下划线过滤，直接读某个 fixture。
// 这样夹具文件可以一直留在仓库里被单测读取，却永远不会出现在线上任何列表中。
export function __readForTest(file: string) { return readPost(file); }
