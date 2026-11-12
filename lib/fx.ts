// 特效用到的「纯计算」都放在这里。
//
// 概念：纯函数 = 只根据传入的参数算出结果，不读也不改外面的任何东西
// （不碰 DOM、不读 window、不依赖当前时间）。好处有两个：
//   1. 好测试 —— 给定输入就该得到固定输出，见同目录的 fx.test.ts；
//   2. 好理解 —— 组件里只剩「把浏览器事件接到这些函数上」的胶水代码。
// 这和 lib/tilt.ts 是同一个思路：算角度的逻辑在 lib 里，监听鼠标的代码在组件里。
import type { Lang } from "./types";

// 把数值夹在 [min, max] 之间。
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

// 线性插值：t=0 得到 a，t=1 得到 b，中间按比例过渡。动画里到处都会用到。
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// 把数字补成两位："3" → "03"。区块编号、要点序号都用它。
export const pad2 = (n: number): string => String(n).padStart(2, "0");

// ---------- 经历要点 ----------

export type BulletParts = { title: string; body: string };

// 要点如果以「**小标题**：」开头，拆成标题和正文；否则整句都是正文。
// 例："**核心模型服务**：端到端负责…" → { title: "核心模型服务", body: "端到端负责…" }
// 注意只认「加粗后面紧跟冒号」：像 "**WebP 0day** 漏洞应急：…" 这种加粗只是句中强调，不拆。
export function splitBullet(text: string): BulletParts {
  const match = /^\*\*([^*]+)\*\*\s*[：:]\s*/.exec(text);
  if (!match) return { title: "", body: text };
  return { title: match[1], body: text.slice(match[0].length) };
}

// 横向时间线里每段只露前三条、每条还会被截成几行。
// 条数多、或者有哪一条比较长时，就需要一个「查看完整内容」的入口。
export function needsFullView(bullets: string[], lang: Lang): boolean {
  if (bullets.length > 3) return true;
  const limit = lang === "zh" ? 70 : 160; // 中文一个字比英文一个字母占的地方大，所以阈值不同
  return bullets.some((b) => b.length > limit);
}

// "字节跳动 · 安全与风控" → 公司名用大字，部门用小字。没有 " · " 时部门为空。
export function splitCompany(company: string): { name: string; dept: string } {
  const parts = company.split(" · ");
  return { name: parts[0], dept: parts.slice(1).join(" · ") };
}

// 数据里的日期是语言中立的 "2026.11 — Present"；中文界面把 Present 显示成「至今」。
export function formatDate(date: string, lang: Lang, presentLabel: string): string {
  return lang === "zh" ? date.replace("Present", presentLabel) : date;
}

// 取日期开头的年份："2025.07 — 2026.05" → 2025。取不到时返回 0。
export function startYear(date: string): number {
  const year = parseInt(date.slice(0, 4), 10);
  return Number.isFinite(year) ? year : 0;
}

// ---------- 「关于」逐词点亮 ----------

export type WordToken = { text: string; bold: boolean; space: boolean };

// 把一段话拆成可以逐个点亮的小块：中文逐字，英文逐词；**加粗** 的部分打上 bold 标记。
// 为什么不用 Intl.Segmenter 做中文分词？因为页面先在构建时（Node）渲染一遍、
// 再在浏览器里渲染一遍，两边的分词结果可能不一样，会触发 hydration 不匹配。
// 逐字拆在哪都一样，稳妥。
export function splitWords(text: string, lang: Lang): WordToken[] {
  const tokens: WordToken[] = [];
  for (const part of text.split(/(\*\*[^*]+\*\*)/g)) {
    if (!part) continue;
    const bold = part.length > 4 && part.startsWith("**") && part.endsWith("**");
    const plain = bold ? part.slice(2, -2) : part;
    // 英文按空白切开并保留空白（split 的正则带括号时，分隔符也会留在结果里）；
    // 中文用 Array.from 逐字切，它能正确处理 emoji 这类占两个编码单元的字符。
    const pieces = lang === "zh" ? Array.from(plain) : plain.split(/(\s+)/);
    for (const piece of pieces) {
      if (!piece) continue;
      if (/^\s+$/.test(piece)) tokens.push({ text: " ", bold: false, space: true });
      else tokens.push({ text: piece, bold, space: false });
    }
  }
  return tokens;
}

// 根据滚动位置，算出一段话里「应该亮起多少个词」。
// 这段话的顶部滚到视口 82% 高度时开始亮，它的底部滚到视口 54% 高度时全部亮完。
export function litCount(args: {
  scrollY: number;
  viewportH: number;
  top: number; // 段落顶部在整个文档里的位置
  height: number; // 段落高度
  total: number; // 词的总数
}): number {
  const { scrollY, viewportH, top, height, total } = args;
  const progress = clamp(
    (scrollY + viewportH * 0.82 - top) / (height + viewportH * 0.28),
    0,
    1,
  );
  return Math.round(progress * total);
}

// ---------- 跑马灯 ----------

// 跑马灯往前走一步。x 始终落在 [0, copyWidth) 里：走满一组内容的宽度就回到 0，
// 因为后面紧跟着一模一样的另一组，所以回绕的那一下肉眼看不出来。
// boost 是滚动带来的加速倍数；ease 在悬停时会慢慢降到 0，让它缓缓停下。
export function advanceMarquee(args: {
  x: number;
  speed: number; // 像素 / 秒
  dtMs: number; // 距离上一帧的毫秒数
  boost: number;
  ease: number;
  copyWidth: number;
}): number {
  const { x, speed, dtMs, boost, ease, copyWidth } = args;
  if (copyWidth <= 0) return 0;
  return (x + (speed * boost * ease * dtMs) / 1000) % copyWidth;
}

// 把 x 换成 CSS 的 translateX：dir=-1 向左跑，dir=1 向右跑。
export function marqueeShift(x: number, copyWidth: number, dir: 1 | -1): number {
  return dir < 0 ? -x : x - copyWidth;
}

// 滚动速度（像素/帧）→ 跑马灯的加速倍数，最多加到 6 倍。
export function scrollBoost(velocity: number): number {
  return 1 + Math.min(Math.abs(velocity) * 0.12, 5);
}

// ---------- 经历：固定视口 + 横向滚动 ----------

// 竖向每滚 1px，横向内容就移 1px。top 是固定区域开始的位置，maxX 是横向一共能移多远。
export function pinnedOffset(args: { scrollY: number; top: number; maxX: number }): {
  progress: number;
  x: number;
} {
  const { scrollY, top, maxX } = args;
  if (maxX <= 0) return { progress: 0, x: 0 };
  const progress = clamp((scrollY - top) / maxX, 0, 1);
  return { progress, x: progress * maxX };
}

// ---------- 大字自适应 ----------

// 一行不换行的大字比容器宽时，按比例缩小字号；本来就放得下则返回 null（表示不用改）。
export function fitFontSize(args: {
  fontSize: number;
  boxWidth: number;
  contentWidth: number;
  min?: number;
}): number | null {
  const { fontSize, boxWidth, contentWidth, min = 24 } = args;
  if (boxWidth <= 0 || contentWidth <= boxWidth) return null;
  return Math.max(min, Math.floor(((fontSize * boxWidth) / contentWidth) * 0.985));
}

// ---------- 乱码解码 ----------

const GLYPHS = "!<>-_\\/[]{}=+*^?#01";
const GLYPHS_WIDE = "口日目田回凹凸井"; // 中文位置用全角字形，避免解码时文字宽度抖动

// 解码动画的某一帧：前 shown 个字符显示原文，其余的换成随机乱码。
// 空格和分隔符保持不动，这样文字的「骨架」从头到尾都看得出来。
// rand 是一个返回 [0, 1) 的函数，默认用 Math.random；测试时可以传固定值。
export function scrambleFrame(
  chars: string[],
  shown: number,
  rand: () => number = Math.random,
): string {
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (i < shown || c === " " || c === "·" || c === "/") {
      out += c;
      continue;
    }
    const set = /[⺀-鿿＀-￯]/.test(c) ? GLYPHS_WIDE : GLYPHS;
    out += set.charAt(Math.floor(rand() * set.length) % set.length);
  }
  return out;
}
