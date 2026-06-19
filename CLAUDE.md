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
```

There is no test suite and no ESLint config checked in yet — `pnpm lint` will offer to set ESLint up on first run.

## Architecture

**Static export.** `next.config.ts` sets `output: "export"` and `images.unoptimized: true`. There is no server at runtime: no API routes, no server actions, no server-only data fetching. Anything using browser APIs / hooks / events needs `"use client"` at the top of the file.

**Single stateful page.** `app/page.tsx` is the one component that owns *all* app state — `lang`, `theme`, and `booted` — and composes every section (`Hero`, `About`, `Skills`, …). Section components are presentational: they receive `lang` (and occasionally `booted`) as props and render. State flows down; setters are passed to `TopBar` (controlled-component pattern).

**Content is data, not markup.** All résumé text lives in `lib/data.ts` as the `RESUME` object, typed by `lib/types.ts`. To change résumé content, edit `lib/data.ts` and nothing else. `lib/types.ts` enforces the shape; add a field there only when adding new data.

**Bilingual model.** `Localized = { zh, en }`, `MaybeLocalized = string | Localized` (plain strings are language-neutral, e.g. tech names). Every displayed string goes through `pickLang(value, lang)` from `lib/i18n.ts`, which also falls back en → zh → "". When adding content, follow this: use `Localized` for anything human-readable, raw `string` for fixed tokens.

**Theming via `<html>` attributes + CSS variables.** At runtime only `data-theme` (`dark`/`light`) is switched — `app/page.tsx` writes it onto `document.documentElement` from the TopBar toggle. The other knobs are fixed to defaults supplied statically by `app/layout.tsx`'s initial attributes (`data-variant="terminal"`, `data-blink="on"`, `data-crt="off"`) and `globals.css`'s `:root` (`--accent`, `--accent-soft`). `app/globals.css` (~1090 lines, all styling lives here) reacts with attribute selectors like `html[data-variant="ide"]` and `html[data-theme="light"][data-variant="terminal"]`. The CSS still defines all three variants (`terminal`/`ide`/`paper`), but there is no longer any in-app switcher for variant/accent/effects (the bottom-right Tweaks panel was removed). To make one switchable again, set the corresponding `data-*` attribute or CSS var on `<html>` dynamically.

**Print mode** is pure CSS: the `@media print` block in `globals.css` strips effects, expands all experience, and renders B/W. The TopBar print button just calls `window.print()`.

## Critical conventions

**Hydration safety — do not read storage as initial state.** Server render has no `localStorage`/`window`, so initial state must equal the static defaults, then be overridden in a mount `useEffect`. `app/layout.tsx` hard-codes initial `<html data-variant="terminal" data-theme="dark" data-blink="on" data-crt="off">`, and `data-theme` here **must match** `page.tsx`'s default `theme` state or the first paint flashes / React warns. Same rule for `useClock` (starts `null`). When adding a persisted setting, repeat this pattern; don't shortcut it.

Persistence keys: `localStorage` → `resume-lang`, `resume-theme`; `sessionStorage` → `resume-booted` (one boot animation per tab session).

**Shared building blocks** live in `components/effects.tsx` — reuse them instead of reinventing: `GlitchText`, `Typewriter`, `FormattedBold` (renders `**bold**` → highlighted span), `FadeUp` + `useInView` (scroll-reveal), `useClock`, `SectionHead`.

**Path alias** `@/*` resolves to the project root (e.g. `@/lib/data`).

**Comment style.** This repo is deliberately over-commented in Chinese as a teaching codebase (see commit "add detailed beginner-friendly comments throughout") — the owner is learning frontend. When editing existing files, match that density and tone; explain the *why* of React/Next/TS concepts in-line rather than writing terse production-style code.

## Assets

Images go in `public/` (served from root, e.g. `public/ljl.jpg` → `/ljl.jpg`). `components/Hero.tsx`'s `<ImageSlot src=...>` points at the avatar; `ImageSlot` shows a placeholder when the image is missing.
