# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (zh/en), single-page résumé site in the "Signal" visual language: near-black ground, oversized kinetic type, one lime signal colour (orange marks the security era), and a particle field behind the content. Next.js 15 (App Router) + React 19 + TypeScript, statically exported. Package manager is **pnpm** (not npm).

## Commands

```bash
pnpm install        # first-time setup
pnpm dev            # dev server at http://localhost:3000 (hot reload)
pnpm build          # static export to out/ (pure HTML/CSS/JS, host anywhere)
pnpm test           # vitest — lib/**/*.test.ts
pnpm lint           # next lint
pnpm pdf            # regenerate public/resume.pdf (+ resume.md) from lib/data.ts — needs Chrome
pnpm encrypt        # build encrypted/index.html (StatiCrypt, password-gated) from lib/data.ts
pnpm publish-site   # test + build + push out/ to gh-pages (see the deploy caveat below)
```

Two environment gotchas:

- `pnpm dev` needs `NODE_ENV` unset or `development`. If the shell exports `NODE_ENV=production`, the dev server cannot compile CSS and every request returns 500 ("Module parse failed" pointing at `app/globals.css`). Run `NODE_ENV=development pnpm dev` in that case.
- Don't run `pnpm build` while `pnpm dev` is running — both write `.next/`. If the dev server starts returning 500 after a build, stop it, delete `.next/`, and start it again.

`pnpm pdf` and `pnpm encrypt` run plain Node scripts (`scripts/*.mjs`) that import `lib/data.ts` directly (Node 22+ strips the types). They are *not* part of `pnpm build` — run them by hand after résumé content changes (see "Two render paths" below).

## Architecture

**Static export.** `next.config.ts` sets `output: "export"` and `images.unoptimized: true`. There is no server at runtime: no API routes, no server actions, no server-only data fetching. Anything using browser APIs / hooks / events needs `"use client"` at the top of the file. Routes are just `/` and the 404 page.

**Single stateful page.** `components/ResumeApp.tsx` owns *all* page state — `lang`, `live` (intro finished), `introGone`, `fromIntro`, `termOpen`, `wipe` (language-switch curtain) — and composes everything in order: `ParticleField`, `Intro`, `CursorRing`, `TopBar`, `SideRail`, then the sections `Hero`, `About`, `Experience`, `Skills`, `Highlights`, `Education`, `Contact`, and finally the `Terminal` dialog. Section components are presentational: they receive `lang` as a prop and render. State flows down; events come back up through callbacks.

**Content is data, not markup.** All résumé text lives in `lib/data.ts`, typed by `lib/types.ts`. It exports `RESUME` (the résumé), `STRINGS` (fixed UI labels, `Record<string, Localized>`), and `SECTIONS` (the ordered section table: anchor id, ghost word, rail label — section numbers are derived from it, never hard-coded). To change résumé content, edit `lib/data.ts` and nothing else. Conventions inside the data:

- An experience bullet that starts with `**Title**：` (or `**Title**:`) renders as a title line plus a body paragraph (`splitBullet` in `lib/fx.ts`).
- `experience[].era` (`"agent"` | `"security"`) switches the accent colour for that entry.
- An entry with empty `bullets` renders as a compact panel (company, dates, role only).

**Bilingual model.** `Localized = { zh, en }`, `MaybeLocalized = string | Localized` (plain strings are language-neutral, e.g. tech names). Every displayed string goes through `pickLang(value, lang)` from `lib/i18n.ts`, which also falls back en → zh → "". Use `Localized` for anything human-readable, raw `string` for fixed tokens.

**Effects are layered: pure maths → one clock → hooks → components.**

- `lib/fx.ts` — pure functions for every effect's arithmetic (bullet splitting, word tokenising, marquee wrap, pinned-scroll offset, fit-to-width, scramble frames). Fully unit-tested in `lib/fx.test.ts`; add the test first when adding one.
- `lib/ticker.ts` — the single `requestAnimationFrame` loop for the whole site. `onFrame` delivers scroll position / smoothed scroll / velocity / pointer state each frame; `onLayout` fires when things must be re-measured (resize, fonts ready, document height change, `requestLayout()`). No effect starts its own loop or scroll listener.
- `lib/particles.ts` — the canvas engine (dust field + agent network), framework-free. `lib/scramble.ts` — the decode animation.
- `components/effects.tsx` — shared building blocks. Hooks: `useFrame`, `useLayout`, `useReveal`, `usePointerTilt`, `useMagnetic`, `useFitText`, `useClock`, `useShortcutLabel`. Pieces: `SectionHeader`, `Ghost`, `Decode`, `Icon`, `Chips`, `FormattedBold`, `stagger`, `scrollToSection`. Reuse them instead of reinventing.
- Feature components: `Marquee`, `Modal` (native `<dialog>` wrapper used by `Terminal` and the experience sheet), `ParticleField`, `Intro`, `CursorRing`.

Rules that keep this working:

- Per-frame work writes straight to `element.style` / `classList`; never `setState` 60 times a second.
- An element carrying `data-reveal` must keep a **static** `className` — `useReveal` adds `.in` directly on the DOM node, and React would wipe it if the class string changed.
- React-rendered text is only mutated imperatively through `lib/scramble.ts` on a `<Decode>` (it edits the text node in place and cancels on text change).
- Every effect has a reduced-motion path (`prefers-reduced-motion`): the ticker exposes `reduced`, and CSS falls back under `html.rm`.

**Experience has two layouts.** Default is a vertical list with every bullet shown. On wide and tall viewports (`(min-width: 1024px) and (min-height: 640px)`, motion allowed) `Experience` adds `.is-pinned`: the block sticks to the viewport and vertical scroll is converted to horizontal travel. In that mode each entry shows three clamped bullets and a button that opens the full entry in a side sheet.

**Styling.** Everything is in `app/globals.css`, loaded once by `app/layout.tsx`; design tokens (colours, fonts, spacing, motion) sit in `:root` at the top. Only `transform` and `opacity` are animated. State classes to know: `html.fx` (motion enabled — added at runtime by `ResumeApp`, so content is fully visible without JavaScript) or `html.rm` (reduced motion); `.is-live` / `.from-intro` on the `.site` wrapper drive the hero entrance; `html[lang]` picks the CJK display face. The 404 page (`app/not-found.tsx` + `app/not-found.css`) reuses the same tokens and `.btn` / `.lbl`.

**Print.** `globals.css` has a minimal `@media print` block that hides the chrome. There is no in-app print button — the TopBar download links to the pre-generated `/resume.pdf` (a clean light-themed document, see below), entirely separate from the site's styling.

**Two render paths from one data source.** `lib/data.ts` feeds both the React site *and* a separate "clean document" renderer in `scripts/resume-html.mjs`. That script imports `RESUME`/`pickLang` directly and builds plain Markdown + a self-contained light-themed HTML document (its own `RESUME_CSS`, A4 `@page` rules, `noindex`) — deliberately unrelated to the site's look. Two consumers build on it:

- `scripts/build-pdf.mjs` (`pnpm pdf`) writes `resume.md` and renders the HTML to `public/resume.pdf` via headless Chrome (`CHROME_PATH` env override). `public/resume.pdf` is the file the TopBar download button serves, and it's force-tracked in git (`.gitignore` ignores `*.pdf` but allowlists `!public/resume.pdf`).
- `scripts/build-encrypted.mjs` (`pnpm encrypt`) AES-encrypts the same HTML with StatiCrypt into `encrypted/index.html` (password defaults to `lijianglei`, override with `RESUME_PW=…`). The plaintext is written to `.enc-tmp/` and deleted immediately; both `encrypted/` and `.enc-tmp/` are gitignored — the encrypted page is deployed to a *separate public repo* so crawlers only ever see ciphertext.

Implication: after editing `lib/data.ts`, the live site updates on its own, but `resume.md` / `public/resume.pdf` / the encrypted page are stale until you re-run `pnpm pdf` and/or `pnpm encrypt`.

**Dormant blog code.** `components/blog/*`, `lib/posts.ts`, `lib/markdown.ts` and `content/posts/` are not routed anywhere right now, but they are still type-checked and tested. The `FadeUp` / `useInView` / `SectionHead` exports at the bottom of `components/effects.tsx` exist only for them. Leave them in place unless asked to remove the blog.

## Critical conventions

**Hydration safety — the first client render must equal the static HTML.** There is no `localStorage` / `window` / clock at build time, so initial state must be a fixed default and only be overridden in a mount effect. Concretely: `lang` starts at `"zh"`; `useClock` starts at `null`; `useShortcutLabel` starts at `"Ctrl K"`; nothing calls `new Date()` or `Math.random()` during render; word tokenising for the About section is deterministic (per character for zh, per word for en — no `Intl.Segmenter`, whose output can differ between Node and browsers). When adding any persisted or time/random-derived value, repeat this pattern.

Persistence keys: `localStorage` → `resume-lang`; `sessionStorage` → `resume-booted` (the intro plays once per tab session).

**Deploy caveat.** `pnpm publish-site` builds from the working tree but only auto-commits `content/posts/*.md`. Any other change (résumé data, components, styles) gets deployed without being committed, and `main` silently falls behind the live site — this happened in November 2026. Commit and push source changes yourself before deploying.

**Path alias** `@/*` resolves to the project root (e.g. `@/lib/data`).

**Comment style.** This repo is deliberately over-commented in Chinese as a teaching codebase — the owner is learning frontend. When editing existing files, match that density and tone; explain the *why* of React/Next/TS concepts in-line rather than writing terse production-style code.

## Assets

Images go in `public/` (served from root, e.g. `public/portrait.jpg` → `/portrait.jpg`). The hero portrait is `public/portrait.jpg` (900×1200) and the WeChat QR is `public/wechat-qr.jpg` (587×605); both are rendered with their real pixel dimensions as `width`/`height` so the layout never shifts — update those numbers if you replace an image. The PDF/encrypted document renderer does *not* embed any image — it's text-only.
