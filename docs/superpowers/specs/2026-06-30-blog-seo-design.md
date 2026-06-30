# Blog / SEO feature — design spec

**Date:** 2026-06-30
**Status:** awaiting user review
**Author:** Claude (with 李姜磊)

## 1. Goal & context

Add a Markdown-driven blog to the existing résumé site so 李姜磊 can publish technical docs and gain SEO surface area. The résumé (`app/page.tsx`, its sections, `lib/data.ts`) and the PDF/encrypted-doc pipeline (`scripts/*`) are not touched, **except two small additive edits**: `metadataBase` in the root layout (§10.2) and a blog link in `TopBar` (§11) — neither changes how the résumé renders. The site is Next.js 15.5 (App Router) + React 19 + TypeScript, **statically exported** (`output: "export"`), deployed to GitHub Pages from the `gh-pages` branch (built `out/`), custom domain **https://www.lijianglei.com** (`public/CNAME`). Package manager **pnpm**. No CI — build + deploy is manual.

### Chosen options (from brainstorming)
- **Aesthetic:** Hybrid — terminal top bar + `▸ /blog / <title>` breadcrumb, clean ~720px reading column for the body.
- **Languages:** one language per post (`lang: zh | en` frontmatter); no forced translation, no bilingual pairs.
- **Extras included:** tags + tag pages; math (KaTeX) + diagrams (Mermaid); reading time + published/updated dates.
- **SEO core (always on):** build-time code highlighting, `sitemap.xml`, `robots.txt`, JSON-LD, Open Graph/Twitter, canonical URLs.
- **Not included:** RSS feed (see §16 — review recommends reconsidering; cheap to add).

## 2. Non-goals (v1)
- No MDX / React-in-articles (plain `.md` only).
- No bilingual *pairs* / hreflang (no translated equivalents to cross-link).
- No runtime OG image generation (impossible under `output: export`).
- No build-time Mermaid→SVG (deferred; see §6).
- No comments, search, or pagination (low post count; revisit later).

## 3. Content model

Posts live in **`content/posts/<slug>.md`**. The filename (minus `.md`) is the URL slug. Frontmatter:

```yaml
---
title: 用 Rust 写一个解释器        # required
description: 一句话摘要，用于 meta description 和列表页   # required
date: 2026-06-30                  # required (ISO date)
updated: 2026-07-02               # optional; drives dateModified + sitemap lastmod
lang: zh                          # required; "zh" | "en"
tags: [rust, compiler]            # optional; ASCII tokens preferred (see §7.3)
draft: false                      # optional; default false
cover: /blog/covers/rust.png      # optional; absolute-from-root static path
---
```

- **Required fields** (`title`, `description`, `date`, `lang`): the build **throws** if any is missing or `lang` is not `zh`/`en`. A post must never ship without SEO metadata.
- **Draft handling:** `draft: true` posts are filtered out in **one shared loader** (`lib/posts.ts`) so they cannot leak into the index, tag lists, `generateStaticParams`, or the sitemap.
- **Raw HTML policy:** posts are **pure Markdown**. `remark-rehype` drops raw HTML by default; we keep it that way (safer, cleaner SEO HTML). No `rehype-raw`. Mermaid uses a code *fence*, so it's unaffected.

## 4. URL structure & `trailingSlash`

Set **`trailingSlash: true`** in `next.config.ts`. Routes export as `out/<route>/index.html`, giving clean live URLs ending in `/` — the GitHub-Pages-friendly shape (avoids the 308/301 redirect on slash-less directory requests). The résumé root still exports to `out/index.html` and is unaffected; `_next/*` asset URLs are not slash-rewritten.

| Route | Live URL | Notes |
|---|---|---|
| Blog index | `/blog/` | lists published posts, newest first |
| Article | `/blog/<slug>/` | one per non-draft post |
| Tag page | `/blog/tag/<tagSlug>/` | `noindex,follow` (see §10.6) |

**Consistency rule (must-fix):** a single **`urlFor(path)`** helper in `lib/site.ts` prepends `SITE_URL` and guarantees a trailing slash. Every emitted URL — canonical, `og:url`, sitemap `<loc>`, JSON-LD `url`/`mainEntityOfPage`, and all internal `<Link>` hrefs — goes through it. Mismatched slash shapes split the canonical and cause redirect churn.

## 5. Markdown rendering pipeline

Build-time only (no client JS for markdown/math/code). In `lib/markdown.ts`, an **async** `unified` processor — **`.process()`, never `.processSync()`** (rehype-pretty-code/shiki is async). **Locked plugin order** (wrong order silently breaks math or anchors):

```
unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)            // must precede remark-rehype
  .use(remarkRehype)          // mdast → hast (drops raw HTML)
  .use(rehypeSlug)            // must precede autolink
  .use(rehypeAutolinkHeadings, { behavior: 'append',
        properties: { className: ['heading-anchor'], ariaLabel: 'Link to section' },
        content: { type: 'text', value: '#' } })
  .use(rehypeKatex)           // math → static HTML (needs katex CSS, §10.7)
  .use(liftMermaidFences)     // CUSTOM: pull ```mermaid out before shiki (§6)
  .use(rehypePrettyCode, { theme: 'github-dark-dimmed', keepBackground: false })
  .use(rehypeStringify)
```

`lib/posts.ts` reads `content/posts` once at build and exposes: `getAllPosts()` (published, sorted desc), `getPost(slug)` (→ `{ meta, html, hasMermaid, readingTime }`), `getAllTags()` (deduped `{ name, slug }`), `getPostsByTag(slug)`. It computes `readingTime` (via `reading-time`) and `hasMermaid` (set by `liftMermaidFences`, or a `/^```mermaid/m` scan).

Build with the default **webpack `next build`** (not `--turbopack`) to avoid ESM-resolution edge cases in the unified/shiki graph. The manual gh-pages flow already does this.

## 6. Mermaid (client-side, lazy, gated)

**Collision (must-fix):** `rehype-pretty-code`/shiki throws on the unknown `mermaid` grammar. A small custom rehype plugin **`liftMermaidFences`** runs **before** `rehypePrettyCode`: it finds `<code class="language-mermaid">`, replaces the wrapping `<pre><code>` with `<pre class="mermaid">{raw source}</pre>`, and sets `hasMermaid`.

**Render:** one leaf client component `components/blog/Mermaid.tsx` (`'use client'`). Inside `useEffect` (so it only runs in the browser — `window` is structurally safe, **no `next/dynamic ssr:false`**, which is disallowed in Server Components):

```ts
const m = (await import('mermaid')).default;
m.initialize({ startOnLoad: false, theme: 'dark' });
await m.run({ querySelector: '.mermaid' });
```

Guard with a `ran` ref (React 19 StrictMode double-invokes effects in dev; mermaid v11 stamps `data-processed`, so it's a no-op, but the guard avoids console noise). The article Server Component renders `<Mermaid />` **only when `post.hasMermaid`** — so the ~480KB lib loads only on diagram pages. Reserve space (`.mermaid { min-height }` or hidden-until-rendered) to avoid CLS. Diagrams aren't in the static HTML → not crawlable, so keep substantive text outside diagrams (zero SEO cost; prose is already static HTML).

## 7. Routing & pages

### 7.1 `app/blog/page.tsx` — index
Server Component. Lists published posts (title, description, date, reading time, tag chips, `lang` badge). Links via `urlFor`.

### 7.2 `app/blog/[slug]/page.tsx` — article
- `generateStaticParams()` → every published slug (exhaustive: **`dynamicParams` is effectively false under export**; anything not returned 404s).
- `async` component; **`params` is a Promise — await it** (Next 15/React 19).
- Renders the build-generated `html` via `dangerouslySetInnerHTML` inside `<article lang={post.lang}>` (§9), with breadcrumb + `ArticleHeader` (title, dates, reading time, tags) + conditional `<Mermaid/>`.
- `generateMetadata()` and JSON-LD per §10.

### 7.3 `app/blog/tag/[tagSlug]/page.tsx` — tag listing
- `generateStaticParams()` → deduped tag slugs.
- **Tag slug safety (must-fix):** `slugify(tag)` → lowercased `[a-z0-9-]`; non-ASCII (e.g. Chinese) percent-encoded as fallback. Maintain a `tag → slug` map; **build throws on collision** (two distinct tags → same slug). ASCII tag tokens (`rust`, `llm`, `agent`) recommended for clean URLs.
- `noindex,follow` + excluded from sitemap (§10.6).

### 7.4 `app/not-found.tsx`
Styled to match the terminal aesthetic → exported as `out/404.html`. GitHub Pages serves it with a real **HTTP 404** for any unbuilt `/blog/*` path automatically. (Static — cannot do "did you mean".)

## 8. Aesthetic, components, CSS scoping

- **Scoped styles:** `app/blog/blog.css`, imported only by the blog layout — never touches the résumé's `globals.css`. Must include rules for `rehype-pretty-code` output (`figure[data-rehype-pretty-code-figure]`, `[data-line]`, `[data-highlighted-line]`, `[data-rehype-pretty-code-title]`) since `keepBackground:false` means we own the code-block background.
- **Components** (`components/blog/`): `PostCard`, `Breadcrumb`, `ArticleHeader`, `TagChip`, `Prose` (the `dangerouslySetInnerHTML` wrapper that applies reading-column typography), `Mermaid`.
- **Blog chrome labels** (nav, "阅读时间", "标签", index heading) follow the existing site ZH/EN toggle via a small `STRINGS`-style map; the **article body** stays in its own `lang`.
- `app/blog/layout.tsx`: shared blog chrome + imports `blog.css` and `katex/dist/katex.min.css` (blog-scoped, §10.7).

## 9. Language handling

App Router allows exactly one `<html>` (the shared root layout, currently `<html lang="zh-CN">`). It **cannot vary per article** under static export (confirmed). v1 approach:
- Set the post language on **`<article lang={post.lang}>`** (browsers, screen readers, crawlers honor nearest `lang`).
- Set **`openGraph.locale`** per article (`zh_CN` / `en_US`).
- Keep root `<html lang="zh-CN">` as the site default (most posts are Chinese).
- **No hreflang** (no translated pairs → invalid).
- *Documented tradeoff:* an English post's document-level `lang` is technically `zh-CN`; the `<article lang>` + `og:locale` are the operative signals. If many English posts arrive later, revisit a `/en/blog` route group (its own root layout/`<html lang>`).

## 10. SEO machinery

### 10.1 `lib/site.ts`
Single source of truth: `SITE_URL = "https://www.lijianglei.com"`, `SITE_NAME`, `AUTHOR = { name: "李姜磊 / Jianglei Li", url: SITE_URL }`, `DEFAULT_OG_IMAGE`, and `urlFor(path)`.

### 10.2 `metadataBase` (must-fix)
Add `metadataBase: new URL(SITE_URL)` to the **root layout** metadata. Without it, relative canonical/OG URLs resolve to `http://localhost:3000` in the export (build warning only). This is the one small, non-visual change to `app/layout.tsx`.

### 10.3 Per-article `generateMetadata`
`title` + short site suffix (keep headline ≤110 chars), `description`, `alternates.canonical` (absolute, trailing-slash via `urlFor`), `openGraph` (`type:'article'`, `publishedTime`, `modifiedTime`, `url`, `images:[cover ?? DEFAULT_OG_IMAGE]`, `locale`), `twitter` (`card:'summary_large_image'`). Image URLs **absolute**.

### 10.4 JSON-LD `BlogPosting` (must-fix: complete fields)
Per article, a `<script type="application/ld+json">`: `headline`, `description`, `datePublished`, `dateModified` (= `updated ?? date`), `inLanguage` (post lang), `author` (`Person` w/ `name` + `url`), `publisher`, `mainEntityOfPage` (`@id` = canonical), `image` (absolute, `cover ?? DEFAULT_OG_IMAGE`). Validate one sample in Google Rich Results Test before deploy.

### 10.5 `BreadcrumbList` JSON-LD
The article already has a breadcrumb UI → emit `BreadcrumbList` JSON-LD (Home → Blog → Title) for cheap SERP breadcrumb eligibility.

### 10.6 `sitemap.ts` / `robots.ts`
- `app/sitemap.ts` → static `out/sitemap.xml`: **home, `/blog/`, and published articles only** (with `lastModified = updated ?? date`). **Tag pages excluded** (thin/near-duplicate aggregations → index bloat). Build URLs from `SITE_URL` (sitemap/robots do **not** use `metadataBase`). Assert every `<loc>` ends in `/`.
- `app/robots.ts` → `out/robots.txt`: allow all, `sitemap: https://www.lijianglei.com/sitemap.xml`.
- **Tag pages:** `robots: { index: false, follow: true }` via their `generateMetadata` (kept crawlable for link discovery, not indexed).

### 10.7 KaTeX CSS (must-fix)
Add `katex` as an explicit dep; import `katex/dist/katex.min.css` in `app/blog/layout.tsx` (blog-scoped). Without it, formulas render unstyled/broken and shift layout. The résumé page must not import it.

### 10.8 Default OG image (must-fix)
Ship a static `public/og-default.png` (1200×630). Use `cover ?? og-default` for OG, Twitter, and JSON-LD `image`. (Runtime `next/og` ImageResponse can't work under export. Per-post generated OG PNGs via a satori build script are a possible later add.)

## 11. Internal linking (SEO-critical)
The résumé homepage is the only high-authority page. Plan:
- **TopBar link** `BLOG`/`文章` (→ `/blog/`). *(One small edit to `components/TopBar.tsx`.)*
- **Homepage "最新文章 / Latest" block** linking the latest ~3 posts directly (depth-1). *Included in v1 (serves the SEO goal).*
- **Breadcrumb** on articles (+ BreadcrumbList JSON-LD).
- **Prev/next (or related) links** between articles — cheap, reduces crawl depth.

## 12. Dependencies

Build-time (unified stack — latest stable, caret ranges): `unified@^11`, `remark-parse@^11`, `remark-gfm@^4`, `remark-math@^6`, `remark-rehype@^11`, `rehype-slug@^6`, `rehype-autolink-headings@^7`, `rehype-katex@^7`, `rehype-stringify@^10`, `gray-matter@^4`, `reading-time@^1.5`, `katex@^0.16`.
**Pinned exactly** (pre-1.0, breaking minors): `rehype-pretty-code` (exact `0.14.x`) + `shiki` (major matching its peer range). Client-only: `mermaid@^11`.
No `transpilePackages`/`serverExternalPackages` needed (export has no server runtime; webpack transpiles the ESM-only stack). **Keep `markdown-it@14`** where it is (the PDF/encrypted scripts) — do not converge pipelines.

## 13. Build & deploy impact
- `next.config.ts`: add `trailingSlash: true` (verify résumé root still works post-build).
- `pnpm build` now also emits `/blog/**`, `/blog/tag/**`, `sitemap.xml`, `robots.txt`, `404.html`.
- Deploy unchanged: `pnpm build` → sync `out/` to `gh-pages` (+ `.nojekyll`, preserve `CNAME`/`resume.pdf`) → push. (See memory `deploy-process`.)
- New `content/` dir is build input, committed to `main` (source).

## 14. Module inventory (units to build)
| File | Responsibility |
|---|---|
| `next.config.ts` | add `trailingSlash: true` |
| `app/layout.tsx` | add `metadataBase` (only change) |
| `lib/site.ts` | SITE_URL, names, author, `urlFor`, default OG |
| `lib/markdown.ts` | async unified pipeline + `liftMermaidFences` |
| `lib/posts.ts` | read/parse/sort posts, tags, drafts, `getPost*` |
| `app/blog/layout.tsx` | blog chrome + `blog.css` + katex CSS |
| `app/blog/page.tsx` | index |
| `app/blog/[slug]/page.tsx` | article + metadata + JSON-LD |
| `app/blog/tag/[tagSlug]/page.tsx` | tag listing (noindex) |
| `app/sitemap.ts`, `app/robots.ts` | sitemap/robots |
| `app/not-found.tsx` | styled 404 |
| `components/blog/*` | PostCard, Breadcrumb, ArticleHeader, TagChip, Prose, Mermaid |
| `app/blog/blog.css` | scoped reading + code/katex styles |
| `components/TopBar.tsx` | add blog link |
| `content/posts/*.md` | the posts (a sample seed post for testing) |
| `public/og-default.png` | fallback social image |

## 15. Verification plan (no CI → manual gates)
1. `pnpm build` succeeds; `out/blog/<slug>/index.html`, `out/sitemap.xml`, `out/robots.txt`, `out/404.html` exist.
2. Grep exported article HTML: canonical/OG/JSON-LD URLs are absolute `https://www.lijianglei.com/...` with trailing slash (no `localhost`).
3. Render a seed post locally (`pnpm dev`) covering: code block (highlighted), math (KaTeX styled), a `mermaid` diagram (renders, no console errors), headings (anchors), reading time/dates.
4. Validate one article in Google Rich Results Test (BlogPosting + BreadcrumbList) and an OG/Twitter card validator.
5. Confirm résumé page visually unchanged and still at `/`.
6. Confirm a draft post and a bogus `/blog/nope/` are absent / 404.

## 16. Decisions hardened by adversarial review (log)
- `metadataBase` required (localhost trap). → §10.2
- Per-`<html lang>` impossible from nested layout → `<article lang>` + `og:locale`. → §9
- Shiki ⊥ Mermaid → `liftMermaidFences` before `rehype-pretty-code`. → §6
- Pipeline must be async; order locked; `rehype-pretty-code` pinned. → §5, §12
- `dynamicParams` can't be true under export → exhaustive `generateStaticParams`. → §7
- Tag slugs must be URL-safe + collision-checked. → §7.3
- Drafts filtered in one shared loader. → §3
- Default OG image required (no runtime `next/og`). → §10.8
- Tag pages `noindex,follow` + out of sitemap (thin content). → §10.6
- **RSS reconsider:** review flags Atom/RSS as the highest-value dropped "nice to have," trivial to emit from the same post list. Currently out of scope per user; easy to add if desired.

## 17. Resolved decisions
Spec approved 2026-06-30. Resolutions to the prior open questions:
1. **Homepage "Latest posts" block** — **included in v1** (§11).
2. **RSS feed** — **out of scope for v1** (per the earlier explicit choice); a near-free later add from the same post list if wanted (§16).
3. **Tag URLs** — **ASCII slug tokens** (lowercased `[a-z0-9-]`); non-ASCII tags percent-encoded as fallback; build asserts no slug collisions (§7.3).
4. **Frontmatter schema (§3) and `/blog` base path** — **unchanged**.
