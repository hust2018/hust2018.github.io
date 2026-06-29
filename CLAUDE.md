# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A bilingual (zh/en), single-page, terminal/cyber-aesthetic résumé site. Next.js 15 (App Router) + React 19 + TypeScript, statically exported. Package manager is **pnpm** (not npm).

## Commands

```bash
pnpm install     # first-time setup
pnpm dev         # dev server at http://localhost:3000 (hot reload)
pnpm build       # static export to out/ (pure HTML/CSS/JS, host anywhere)
pnpm start       # serve a production build
pnpm lint        # next lint
pnpm pdf         # regenerate public/resume.pdf (+ resume.md) from lib/data.ts — needs Chrome
pnpm encrypt     # build encrypted/index.html (StatiCrypt, password-gated) from lib/data.ts
```

There is no test suite and no ESLint config checked in yet — `pnpm lint` will offer to set ESLint up on first run.

`pnpm pdf` and `pnpm encrypt` run plain Node scripts (`scripts/*.mjs`) that import `lib/data.ts` directly (Node 22+ strips the types). They are *not* part of `pnpm build` — run them by hand after résumé content changes (see "Two render paths" below).

## Architecture

**Static export.** `next.config.ts` sets `output: "export"` and `images.unoptimized: true`. There is no server at runtime: no API routes, no server actions, no server-only data fetching. Anything using browser APIs / hooks / events needs `"use client"` at the top of the file.

**Single stateful page.** `app/page.tsx` is the one component that owns *all* app state — just `lang` and `booted` (theme is no longer state: it's fixed to dark) — and composes every section in order: `Hero`, `About`, `Terminal`, `Skills`, `Experience`, `Highlights`, `Education`, `Contact`, plus `SideRail`. Section components are presentational: they receive `lang` (and occasionally `booted`) as props and render. State flows down; the `setLang` setter is passed to `TopBar` (controlled-component pattern). `Terminal` (`components/Terminal.tsx`) is an interactive fake shell that replaced the old projects section — its command output is read live from `RESUME`, so it stays in sync with the résumé data automatically.

**Content is data, not markup.** All résumé text lives in `lib/data.ts`, typed by `lib/types.ts`. It exports two objects: `RESUME` (the résumé itself — typed `Resume`) and `STRINGS` (fixed UI labels like section headings and the "Download PDF" button, typed `Record<string, Localized>`). To change résumé content, edit `lib/data.ts` and nothing else. `lib/types.ts` enforces the shape; add a field there only when adding new data.

**Bilingual model.** `Localized = { zh, en }`, `MaybeLocalized = string | Localized` (plain strings are language-neutral, e.g. tech names). Every displayed string goes through `pickLang(value, lang)` from `lib/i18n.ts`, which also falls back en → zh → "". When adding content, follow this: use `Localized` for anything human-readable, raw `string` for fixed tokens.

**Theming via `<html>` attributes + CSS variables — now effectively single-theme.** `app/layout.tsx` statically sets `<html data-variant="terminal" data-theme="dark" data-blink="on" data-crt="off">` and nothing toggles them at runtime anymore (no theme/variant/accent switchers remain — the TopBar toggle and the old bottom-right Tweaks panel are both gone). `app/globals.css` (~1090 lines, all styling lives here) now only styles the terminal + dark combination: the `data-theme="light"`, `data-variant="ide"`, and `data-variant="paper"` selectors have been stripped out, so those attribute values are inert. To bring back a switchable theme/variant, you must both (a) re-add the corresponding CSS selectors in `globals.css` and (b) drive the `data-*` attribute (or a `--accent`-style CSS var) on `<html>` dynamically from `page.tsx`.

**Print mode is now WYSIWYG dark, not B/W.** The `@media print` block in `globals.css` deliberately *preserves* the dark theme via `print-color-adjust: exact` (browsers drop backgrounds by default, which previously printed white), hides chrome (topbar, rail, scan-sweep, boot, the interactive `#shell`), and expands content. **There is no in-app print button** — the TopBar's download action links to a pre-generated `/resume.pdf` (a clean light-themed document, see below), entirely separate from this print stylesheet.

**Two render paths from one data source.** `lib/data.ts` feeds both the React site *and* a separate "clean document" renderer in `scripts/resume-html.mjs`. That script imports `RESUME`/`pickLang` directly and builds plain Markdown + a self-contained light-themed HTML document (its own `RESUME_CSS`, A4 `@page` rules, `noindex`) — deliberately unrelated to the terminal aesthetic. Two consumers build on it:

- `scripts/build-pdf.mjs` (`pnpm pdf`) writes `resume.md` and renders the HTML to `public/resume.pdf` via headless Chrome (`CHROME_PATH` env override). `public/resume.pdf` is the file the TopBar download button serves, and it's force-tracked in git (`.gitignore` ignores `*.pdf` but allowlists `!public/resume.pdf`).
- `scripts/build-encrypted.mjs` (`pnpm encrypt`) AES-encrypts the same HTML with StatiCrypt into `encrypted/index.html` (password defaults to `lijianglei`, override with `RESUME_PW=…`). The plaintext is written to `.enc-tmp/` and deleted immediately; both `encrypted/` and `.enc-tmp/` are gitignored — the encrypted page is deployed to a *separate public repo* so crawlers only ever see ciphertext.

Implication: after editing `lib/data.ts`, the live site updates on its own, but `resume.md` / `public/resume.pdf` / the encrypted page are stale until you re-run `pnpm pdf` and/or `pnpm encrypt`.

## Critical conventions

**Hydration safety — do not read storage as initial state.** Server render has no `localStorage`/`window`, so initial state must equal the static defaults, then be overridden in a mount `useEffect`. `page.tsx`'s `lang` starts at the static default `"zh"` and is only overwritten from `localStorage` inside a mount effect; `<html lang>` is synced there too. `useClock` follows the same rule (starts `null`, fills in after mount) to avoid a server/client mismatch on the topbar clock. When adding any persisted or time/random-derived setting, repeat this pattern — never seed initial state from `localStorage`/`window`.

Persistence keys: `localStorage` → `resume-lang`; `sessionStorage` → `resume-booted` (one boot animation per tab session). (There is no `resume-theme` — theme is fixed.)

**Shared building blocks** live in `components/effects.tsx` — reuse them instead of reinventing: `GlitchText`, `Typewriter`, `FormattedBold` (renders `**bold**` → highlighted span), `FadeUp` + `useInView` (scroll-reveal), `useClock`, `SectionHead`.

**Path alias** `@/*` resolves to the project root (e.g. `@/lib/data`).

**Comment style.** This repo is deliberately over-commented in Chinese as a teaching codebase (see commit "add detailed beginner-friendly comments throughout") — the owner is learning frontend. When editing existing files, match that density and tone; explain the *why* of React/Next/TS concepts in-line rather than writing terse production-style code.

## Assets

Images go in `public/` (served from root, e.g. `public/ljl.jpg` → `/ljl.jpg`). `components/Hero.tsx` renders the avatar through `<ImageSlot src=...>` (the reusable component now lives in its own file, `components/ImageSlot.tsx`); `ImageSlot` shows a placeholder when the image is missing. The PDF/encrypted document renderer does *not* embed any image — it's text-only.
