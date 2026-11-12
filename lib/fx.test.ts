import { describe, expect, it } from "vitest";
import {
  advanceMarquee,
  clamp,
  fitFontSize,
  formatDate,
  lerp,
  litCount,
  marqueeShift,
  needsFullView,
  pinnedOffset,
  scrambleFrame,
  scrollBoost,
  splitBullet,
  splitCompany,
  splitWords,
  startYear,
} from "./fx";

describe("clamp / lerp", () => {
  it("clamps into the range", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.4, 0, 1)).toBe(0.4);
  });
  it("interpolates linearly", () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
    expect(lerp(10, 20, 0.5)).toBe(15);
  });
});

describe("splitBullet", () => {
  it("splits a leading bold title followed by a Chinese colon", () => {
    expect(splitBullet("**核心模型服务**：端到端负责平台。")).toEqual({
      title: "核心模型服务",
      body: "端到端负责平台。",
    });
  });
  it("splits a leading bold title followed by an ASCII colon", () => {
    expect(splitBullet("**Core platform**: Owned delivery.")).toEqual({
      title: "Core platform",
      body: "Owned delivery.",
    });
  });
  it("leaves mid-sentence emphasis alone", () => {
    const text = "**WebP 0day** 漏洞应急：48 小时内开发检测工具。";
    expect(splitBullet(text)).toEqual({ title: "", body: text });
  });
  it("leaves plain bullets alone", () => {
    expect(splitBullet("研发容器微隔离 **HFW v3**。")).toEqual({
      title: "",
      body: "研发容器微隔离 **HFW v3**。",
    });
  });
});

describe("needsFullView", () => {
  it("is true when there are more than three bullets", () => {
    expect(needsFullView(["a", "b", "c", "d"], "zh")).toBe(true);
  });
  it("is true when any bullet is long", () => {
    expect(needsFullView(["字".repeat(71)], "zh")).toBe(true);
    expect(needsFullView(["x".repeat(161)], "en")).toBe(true);
  });
  it("is false for a few short bullets and for none", () => {
    expect(needsFullView(["短", "也短"], "zh")).toBe(false);
    expect(needsFullView([], "zh")).toBe(false);
  });
});

describe("splitCompany / formatDate / startYear", () => {
  it("separates the department from the company name", () => {
    expect(splitCompany("字节跳动 · 安全与风控")).toEqual({ name: "字节跳动", dept: "安全与风控" });
    expect(splitCompany("tapnow")).toEqual({ name: "tapnow", dept: "" });
  });
  it("localizes Present only in Chinese", () => {
    expect(formatDate("2026.11 — Present", "zh", "至今")).toBe("2026.11 — 至今");
    expect(formatDate("2026.11 — Present", "en", "至今")).toBe("2026.11 — Present");
  });
  it("reads the starting year", () => {
    expect(startYear("2025.07 — 2026.05")).toBe(2025);
    expect(startYear("")).toBe(0);
  });
});

describe("splitWords", () => {
  it("splits Chinese per character and keeps the bold flag", () => {
    const tokens = splitWords("我是 **李姜磊**。", "zh");
    expect(tokens.map((t) => t.text).join("")).toBe("我是 李姜磊。");
    expect(tokens.filter((t) => t.bold).map((t) => t.text)).toEqual(["李", "姜", "磊"]);
    expect(tokens.filter((t) => t.space)).toHaveLength(1);
  });
  it("splits English per word and keeps spaces as their own tokens", () => {
    const tokens = splitWords("I'm **Jianglei Li**, an engineer", "en");
    expect(tokens.filter((t) => !t.space).map((t) => t.text)).toEqual([
      "I'm",
      "Jianglei",
      "Li",
      ",",
      "an",
      "engineer",
    ]);
    expect(tokens.filter((t) => t.bold).map((t) => t.text)).toEqual(["Jianglei", "Li"]);
  });
});

describe("litCount", () => {
  const base = { viewportH: 1000, top: 2000, height: 400, total: 100 };
  it("lights nothing before the paragraph reaches the trigger line", () => {
    expect(litCount({ ...base, scrollY: 0 })).toBe(0);
  });
  it("lights everything once the paragraph has passed", () => {
    expect(litCount({ ...base, scrollY: 5000 })).toBe(100);
  });
  it("lights about half way through the range", () => {
    // 触发范围长度 = height + 0.28 * viewportH = 680；从 top - 820 开始
    expect(litCount({ ...base, scrollY: 2000 - 820 + 340 })).toBe(50);
  });
});

describe("marquee", () => {
  it("advances by speed × time and wraps at one copy width", () => {
    expect(advanceMarquee({ x: 0, speed: 100, dtMs: 500, boost: 1, ease: 1, copyWidth: 400 })).toBe(50);
    expect(advanceMarquee({ x: 390, speed: 100, dtMs: 200, boost: 1, ease: 1, copyWidth: 400 })).toBe(10);
  });
  it("stands still while eased to zero and with no measured width", () => {
    expect(advanceMarquee({ x: 30, speed: 100, dtMs: 500, boost: 1, ease: 0, copyWidth: 400 })).toBe(30);
    expect(advanceMarquee({ x: 30, speed: 100, dtMs: 500, boost: 1, ease: 1, copyWidth: 0 })).toBe(0);
  });
  it("maps position to a translate for both directions", () => {
    expect(marqueeShift(120, 400, -1)).toBe(-120);
    expect(marqueeShift(120, 400, 1)).toBe(-280);
  });
  it("boosts with scroll speed up to a cap", () => {
    expect(scrollBoost(0)).toBe(1);
    expect(scrollBoost(-10)).toBeCloseTo(2.2);
    expect(scrollBoost(1000)).toBe(6);
  });
});

describe("pinnedOffset", () => {
  it("stays at zero before the pinned area and with nothing to scroll", () => {
    expect(pinnedOffset({ scrollY: 100, top: 500, maxX: 2000 })).toEqual({ progress: 0, x: 0 });
    expect(pinnedOffset({ scrollY: 900, top: 500, maxX: 0 })).toEqual({ progress: 0, x: 0 });
  });
  it("moves one pixel sideways per pixel scrolled", () => {
    expect(pinnedOffset({ scrollY: 1500, top: 500, maxX: 2000 })).toEqual({ progress: 0.5, x: 1000 });
  });
  it("stops at the end", () => {
    expect(pinnedOffset({ scrollY: 9000, top: 500, maxX: 2000 })).toEqual({ progress: 1, x: 2000 });
  });
});

describe("fitFontSize", () => {
  it("returns null when the text already fits", () => {
    expect(fitFontSize({ fontSize: 100, boxWidth: 500, contentWidth: 400 })).toBeNull();
  });
  it("shrinks proportionally with a small safety margin", () => {
    expect(fitFontSize({ fontSize: 100, boxWidth: 400, contentWidth: 800 })).toBe(49);
  });
  it("never goes below the minimum", () => {
    expect(fitFontSize({ fontSize: 100, boxWidth: 10, contentWidth: 800 })).toBe(24);
  });
});

describe("scrambleFrame", () => {
  const chars = Array.from("AI Agent · 工程师");
  it("shows the original text once everything is revealed", () => {
    expect(scrambleFrame(chars, chars.length)).toBe("AI Agent · 工程师");
  });
  it("keeps revealed characters, spaces and separators in place", () => {
    const out = Array.from(scrambleFrame(chars, 2, () => 0));
    expect(out.slice(0, 3).join("")).toBe("AI ");
    expect(out[8]).toBe(" ");
    expect(out[9]).toBe("·");
    expect(out).toHaveLength(chars.length);
  });
  it("uses full-width glyphs for Chinese positions", () => {
    const out = Array.from(scrambleFrame(chars, 0, () => 0));
    expect(out[out.length - 1]).toBe("口");
    expect(out[0]).toBe("!");
  });
});
