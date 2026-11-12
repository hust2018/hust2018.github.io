// 「乱码解码」动画：让一个元素里的文字先变成乱码，再从左到右逐字还原。
//
// 每一帧显示什么由纯函数 scrambleFrame（见 lib/fx.ts）决定；这里只负责计时和写回页面。
//
// 约定：目标元素要带 data-text 属性，值是最终要显示的文字（见 effects.tsx 的 <Decode>）。
// 写回时改的是元素里那个文本节点的 nodeValue，而不是 textContent——
// 因为 textContent 会「换掉」文本节点，而 React 手里还握着旧节点的引用，
// 之后语言一切换，React 更新的就是那个已经不在页面上的旧节点，文字就再也改不动了。
import { scrambleFrame } from "./fx";

// WeakMap：以元素为键存「正在跑的动画帧 id」。元素被销毁后，对应的记录会自动回收。
const running = new WeakMap<HTMLElement, number>();

export function cancelScramble(el: HTMLElement | null): void {
  if (!el) return;
  const id = running.get(el);
  if (id !== undefined) cancelAnimationFrame(id);
  running.delete(el);
  const node = el.firstChild;
  const text = el.dataset.text;
  if (node && node.nodeType === Node.TEXT_NODE && text !== undefined) node.nodeValue = text;
}

export function scramble(el: HTMLElement | null, duration?: number): void {
  if (!el || typeof window === "undefined") return;
  const text = el.dataset.text ?? el.textContent ?? "";
  const node = el.firstChild;
  if (!text || !node || node.nodeType !== Node.TEXT_NODE) return;
  // 用户要求减少动态效果时，不做这个动画。
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  cancelScramble(el);
  const chars = Array.from(text);
  // 字越多解码越久，但封顶 1.1 秒。
  const total = duration ?? Math.min(1100, 260 + chars.length * 28);
  const start = performance.now();

  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / total);
    if (progress >= 1) {
      node.nodeValue = text;
      running.delete(el);
      return;
    }
    node.nodeValue = scrambleFrame(chars, Math.floor(progress * chars.length));
    running.set(el, requestAnimationFrame(step));
  };
  running.set(el, requestAnimationFrame(step));
}
