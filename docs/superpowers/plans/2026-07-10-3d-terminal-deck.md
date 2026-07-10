# 3D Terminal Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive 3D terminal deck to the résumé hero and extend the same restrained depth language across the homepage without changing résumé content or static-export behavior.

**Architecture:** Keep all pointer math in a pure `lib/tilt.ts` module, expose browser event wiring through a reusable `usePointerTilt` hook, and isolate hero scene markup in `HeroDeck.tsx`. Use CSS custom properties for high-frequency transforms and shared CSS selectors for the lower-page depth treatment, so pointer movement never re-renders the full résumé tree.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, CSS 3D transforms, Vitest, pnpm.

## Global Constraints

- Preserve static export and the existing bilingual content model.
- Keep `/ljl-new.png` as the portrait source and `ID_0001` as the identity label.
- Do not add Three.js, React Three Fiber, WebGL, canvas, remote images, sound, or 3D asset files.
- Do not modify `lib/data.ts`, blog information architecture, `scripts/resume-html.mjs`, `scripts/build-pdf.mjs`, or `scripts/build-encrypted.mjs`.
- Desktop tilt is limited to 6 degrees; coarse pointers use gentle CSS drift; `prefers-reduced-motion: reduce` is fully static.
- Decorative panels are hidden from assistive technology; the portrait has localized alternative text.
- Match the repository's beginner-friendly Chinese comment density in all edited TypeScript and TSX files.

---

## File Map

- Create `lib/tilt.ts`: pure pointer-to-angle calculation, types, clamping, and invalid-dimension fallback.
- Create `lib/tilt.test.ts`: unit tests for center, corners, clamping, and invalid bounds.
- Modify `components/effects.tsx`: export `usePointerTilt`, which schedules DOM writes through `requestAnimationFrame`.
- Create `components/HeroDeck.tsx`: render the portrait identity panel and decorative terminal layers.
- Modify `components/Hero.tsx`: replace the old flat photo column with `HeroDeck` while preserving all left-column résumé content.
- Modify `components/ImageSlot.tsx`: accept a caller-provided localized `alt` string instead of the generic `avatar` label.
- Modify `app/globals.css`: add the hero deck, shared spatial-card styles, responsive behavior, reduced-motion rules, focus styles, and print fallback.

### Task 1: Pure tilt calculation

**Files:**
- Create: `lib/tilt.test.ts`
- Create: `lib/tilt.ts`

**Interfaces:**
- Consumes: numeric pointer coordinates, container bounds, optional maximum angle.
- Produces: `calculateTilt(input: TiltInput): TiltResult`, where `TiltResult` is `{ rotateX: number; rotateY: number }`.

- [ ] **Step 1: Write the failing unit tests**

```ts
import { describe, expect, it } from "vitest";
import { calculateTilt } from "./tilt";

describe("calculateTilt", () => {
  const bounds = { left: 100, top: 50, width: 200, height: 100 };

  it("returns zero rotation at the center", () => {
    expect(calculateTilt({ pointerX: 200, pointerY: 100, bounds })).toEqual({ rotateX: 0, rotateY: 0 });
  });

  it("maps the top-right corner to the configured maximum", () => {
    expect(calculateTilt({ pointerX: 300, pointerY: 50, bounds, maxAngle: 6 })).toEqual({ rotateX: 6, rotateY: 6 });
  });

  it("clamps pointers outside the element", () => {
    expect(calculateTilt({ pointerX: 999, pointerY: 999, bounds, maxAngle: 4 })).toEqual({ rotateX: -4, rotateY: 4 });
  });

  it("falls back to zero for invalid dimensions", () => {
    expect(calculateTilt({ pointerX: 1, pointerY: 1, bounds: { ...bounds, width: 0 } })).toEqual({ rotateX: 0, rotateY: 0 });
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm test -- lib/tilt.test.ts`

Expected: FAIL because `./tilt` does not exist.

- [ ] **Step 3: Implement the minimum pure function**

```ts
export type TiltBounds = { left: number; top: number; width: number; height: number };
export type TiltInput = { pointerX: number; pointerY: number; bounds: TiltBounds; maxAngle?: number };
export type TiltResult = { rotateX: number; rotateY: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function calculateTilt({ pointerX, pointerY, bounds, maxAngle = 6 }: TiltInput): TiltResult {
  if (bounds.width <= 0 || bounds.height <= 0 || !Number.isFinite(bounds.width) || !Number.isFinite(bounds.height)) {
    return { rotateX: 0, rotateY: 0 };
  }
  const x = clamp((pointerX - bounds.left) / bounds.width, 0, 1);
  const y = clamp((pointerY - bounds.top) / bounds.height, 0, 1);
  return {
    rotateX: Number(((0.5 - y) * maxAngle * 2).toFixed(4)),
    rotateY: Number(((x - 0.5) * maxAngle * 2).toFixed(4)),
  };
}
```

- [ ] **Step 4: Run focused and full unit tests**

Run: `pnpm test -- lib/tilt.test.ts && pnpm test`

Expected: the four tilt tests pass, followed by the complete Vitest suite with zero failures.

- [ ] **Step 5: Commit the tested calculation**

```bash
git add lib/tilt.ts lib/tilt.test.ts
git commit -m "feat: add tested pointer tilt calculation"
```

### Task 2: Pointer hook and hero deck component

**Files:**
- Modify: `components/effects.tsx:9-18,265`
- Create: `components/HeroDeck.tsx`
- Modify: `components/ImageSlot.tsx:22-48`
- Modify: `components/Hero.tsx:85`

**Interfaces:**
- Consumes: `calculateTilt` from Task 1 and `Lang` from `lib/types.ts`.
- Produces: `usePointerTilt<T extends HTMLElement>(maxAngle?: number): RefObject<T | null>` and `HeroDeck({ lang }: { lang: Lang })`.

- [ ] **Step 1: Add the reusable hook with frame cleanup**

Update the React imports to include `useCallback`, import `calculateTilt`, then add:

```ts
export function usePointerTilt<T extends HTMLElement>(maxAngle = 6): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  const frameRef = useRef<number | null>(null);

  const writeTilt = useCallback((rotateX: number, rotateY: number) => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--tilt-x", `${rotateX}deg`);
    element.style.setProperty("--tilt-y", `${rotateY}deg`);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const result = calculateTilt({
          pointerX: event.clientX,
          pointerY: event.clientY,
          bounds: element.getBoundingClientRect(),
          maxAngle,
        });
        writeTilt(result.rotateX, result.rotateY);
      });
    };
    const onLeave = () => writeTilt(0, 0);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [maxAngle, writeTilt]);

  return ref;
}
```

- [ ] **Step 2: Localize the portrait alternative text API**

Change `ImageSlot` to accept `alt` and pass it to `<img>`:

```tsx
export function ImageSlot({ src, placeholder, alt }: { src?: string; placeholder: string; alt: string }) {
  // existing error fallback stays unchanged
  return <img className="image-slot-img" src={src} alt={alt} onError={() => setError(true)} />;
}
```

Update the existing `Hero` call in the same step so this intermediate commit remains buildable:

```tsx
<ImageSlot
  src="/ljl-new.png"
  placeholder={lang === "zh" ? "把头像放到 public/" : "drop photo in public/"}
  alt={lang === "zh" ? "李姜磊的头像" : "Portrait of Jianglei Li"}
/>
```

- [ ] **Step 3: Create the isolated `HeroDeck` scene**

```tsx
"use client";

import { ImageSlot } from "./ImageSlot";
import { usePointerTilt } from "./effects";
import type { Lang } from "@/lib/types";

export function HeroDeck({ lang }: { lang: Lang }) {
  const deckRef = usePointerTilt<HTMLDivElement>(6);
  const portraitAlt = lang === "zh" ? "李姜磊的头像" : "Portrait of Jianglei Li";
  return (
    <div className="hero-deck-col">
      <div className="hero-deck" ref={deckRef}>
        <div className="deck-grid" aria-hidden="true" />
        <div className="deck-panel deck-panel-system" aria-hidden="true">
          <span>AGENT STATUS</span><strong>ONLINE</strong><small>04 ACTIVE NODES</small>
        </div>
        <div className="deck-panel deck-panel-telemetry" aria-hidden="true">
          <span>SYSTEM READY</span><i /><i /><i />
        </div>
        <div className="deck-panel deck-panel-id">
          <ImageSlot src="/ljl-new.png" placeholder={lang === "zh" ? "把头像放到 public/" : "drop photo in public/"} alt={portraitAlt} />
          <div className="hero-photo-label">ID_0001</div>
        </div>
        <div className="deck-laser" aria-hidden="true" />
      </div>
      <p className="hero-motto"><span className="hero-motto-arrow">▸</span>尽管提需求，我来想办法实现<span className="cursor" /></p>
    </div>
  );
}
```

- [ ] **Step 4: Run tests and TypeScript build before styling**

Run: `pnpm test && pnpm build`

Expected: tests pass; build may show the new component as unused but must have no TypeScript error.

- [ ] **Step 5: Commit the behavior and semantic structure**

```bash
git add components/effects.tsx components/HeroDeck.tsx components/ImageSlot.tsx components/Hero.tsx
git commit -m "feat: add accessible interactive hero deck"
```

### Task 3: Integrate and style the 3D hero

**Files:**
- Modify: `components/Hero.tsx:8-15,76-97`
- Modify: `app/globals.css:307-459,1014-1020`

**Interfaces:**
- Consumes: `HeroDeck({ lang })` from Task 2 and CSS variables `--tilt-x` / `--tilt-y` from `usePointerTilt`.
- Produces: the responsive hero scene used by the root résumé page.

- [ ] **Step 1: Replace the old photo column with `HeroDeck`**

Remove the direct `ImageSlot` import, import `HeroDeck`, and replace lines 76–97 with:

```tsx
<HeroDeck lang={lang} />
```

- [ ] **Step 2: Replace flat photo CSS with the deck scene**

Define `.hero-deck-col`, `.hero-deck`, `.deck-grid`, `.deck-panel`, `.deck-panel-system`, `.deck-panel-telemetry`, `.deck-panel-id`, and `.deck-laser`. The root transform must use:

```css
.hero-deck {
  --tilt-x: 0deg;
  --tilt-y: 0deg;
  width: 320px;
  height: 310px;
  position: relative;
  perspective: 1000px;
  transform-style: preserve-3d;
  transform: rotateX(var(--tilt-x)) rotateY(var(--tilt-y));
  transition: transform 180ms ease-out;
  will-change: transform;
}
.deck-panel-id { transform: translate3d(32px, 18px, 92px); }
.deck-panel-system { transform: translate3d(-34px, 8px, 30px) rotateY(7deg); }
.deck-panel-telemetry { transform: translate3d(54px, 144px, 58px) rotateY(-5deg); }
```

Keep the portrait at approximately 180×220px, use existing notch clipping and scanline treatment, and place decorative panels behind it so they never cover the face.

- [ ] **Step 3: Add responsive and motion fallbacks**

```css
@media (pointer: coarse) and (prefers-reduced-motion: no-preference) {
  .hero-deck { animation: deckDrift 8s ease-in-out infinite; }
}
@keyframes deckDrift {
  50% { transform: rotateX(2deg) rotateY(-3deg) translateY(-5px); }
}
@media (prefers-reduced-motion: reduce) {
  .hero-deck { transform: none !important; animation: none !important; transition: none; }
}
@media (max-width: 720px) {
  .hero-deck-col { justify-self: center; width: 100%; }
  .hero-deck { width: min(310px, 92vw); transform-origin: top center; }
}
```

- [ ] **Step 4: Verify tests and static export**

Run: `pnpm test && pnpm build`

Expected: all tests pass and Next reports successful static generation for every route.

- [ ] **Step 5: Commit the hero scene**

```bash
git add components/Hero.tsx app/globals.css
git commit -m "feat: integrate 3d terminal deck hero"
```

### Task 4: Extend the spatial language across the homepage

**Files:**
- Modify: `app/globals.css:225-265,474-723,889-975`

**Interfaces:**
- Consumes: existing classes `.terminal`, `.skill-chips`, `.exp`, `.edu`, `.contact-block`, `.hl`, `.latest-item`, and `.section-head`.
- Produces: shared, CSS-only hover/focus depth treatment with no new component state.

- [ ] **Step 1: Add shared depth variables and base transitions**

```css
:root {
  --depth-shadow: 0 20px 50px -32px rgba(0, 0, 0, .9), 0 0 24px rgba(90, 216, 255, .05);
  --depth-shadow-active: 0 28px 60px -32px rgba(0, 0, 0, .95), 0 0 28px rgba(90, 216, 255, .13);
}
.terminal, .skill-chips, .exp, .edu, .contact-block, .hl, .latest-item {
  transform: translateZ(0);
  box-shadow: var(--depth-shadow);
  transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease, background-color .22s ease;
}
```

- [ ] **Step 2: Add restrained hover and keyboard-focus feedback**

```css
@media (hover: hover) and (pointer: fine) {
  .terminal:hover, .skill-chips:hover, .exp:hover, .edu:hover, .contact-block:hover, .hl:hover, .latest-item:hover {
    transform: translate3d(0, -3px, 0) rotateX(.35deg);
    border-color: color-mix(in oklch, var(--accent) 48%, var(--border));
    box-shadow: var(--depth-shadow-active);
  }
}
.exp:focus-within, .terminal:focus-within, .latest-item:focus-within, .contact-block:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent-soft), var(--depth-shadow-active);
}
.section-head::before {
  content: "";
  position: absolute;
  right: 0;
  bottom: -2px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent-2);
  box-shadow: -18px 0 0 color-mix(in oklch, var(--accent) 62%, transparent), 0 0 12px var(--accent-2);
}
```

The existing `.section-head::after` remains the depth line. Do not add `tabIndex` to non-interactive education, skills, or highlight content.

- [ ] **Step 3: Flatten shared motion for reduced-motion and print**

```css
@media (prefers-reduced-motion: reduce) {
  .terminal, .skill-chips, .exp, .edu, .contact-block, .hl, .latest-item { transition: none; transform: none !important; }
}
@media print {
  .hero-deck { transform: none !important; }
  .deck-panel-system, .deck-panel-telemetry, .deck-grid, .deck-laser { display: none !important; }
  .terminal, .skill-chips, .exp, .edu, .contact-block, .hl, .latest-item { box-shadow: none; transform: none; }
}
```

- [ ] **Step 4: Run complete verification**

Run: `pnpm test && pnpm build && git diff --check`

Expected: all tests pass, static export succeeds, and `git diff --check` prints nothing.

- [ ] **Step 5: Confirm scope boundaries from the diff**

Run: `git diff --name-only 29d57b9..HEAD`

Expected changed product files only: `lib/tilt.ts`, `lib/tilt.test.ts`, `components/effects.tsx`, `components/HeroDeck.tsx`, `components/ImageSlot.tsx`, `components/Hero.tsx`, and `app/globals.css`, plus the already-approved design and plan documents.

- [ ] **Step 6: Commit the full-page polish**

```bash
git add app/globals.css
git commit -m "feat: unify homepage spatial depth styling"
```

### Task 5: Final requirements audit

**Files:**
- Inspect only: all files changed in Tasks 1–4

**Interfaces:**
- Consumes: the complete implementation.
- Produces: fresh evidence that the approved design is implemented and the repository remains buildable.

- [ ] **Step 1: Re-run the authoritative commands from a clean process**

Run: `pnpm test && pnpm build`

Expected: Vitest exits with zero failures and Next.js completes the static export with exit code 0.

- [ ] **Step 2: Verify dependency and protected-file constraints**

Run: `git diff 29d57b9..HEAD -- package.json pnpm-lock.yaml lib/data.ts scripts/resume-html.mjs scripts/build-pdf.mjs scripts/build-encrypted.mjs`

Expected: no output.

- [ ] **Step 3: Verify whitespace and repository status**

Run: `git diff --check 29d57b9..HEAD && git status --short`

Expected: no whitespace errors; unrelated pre-existing untracked content remains untouched and is not included in feature commits.
