// "use client" 指令：告诉 Next.js「这个文件是客户端组件」。
// 背景知识：Next.js 默认把组件当成「服务器组件」——只在服务器上跑、生成好 HTML 再发给浏览器，
//   不能用浏览器才有的东西（useState、useEffect、点击事件、window/document 等）。
// 一旦组件需要这些「交互能力」或浏览器 API，就必须在文件最顶部写 "use client"。
// 本文件里的积木都依赖 useEffect、IntersectionObserver、鼠标事件等，所以必须声明为客户端组件。
"use client";

// 这个文件是全站共用的「小积木」：各个区块组件从这里拿现成的零件，而不是各写各的。
//   展示类：FormattedBold、Icon、Decode、SectionHeader、Ghost、Chips
//   特效类：useFrame、useLayout、useReveal、usePointerTilt、useMagnetic、useFitText
//   其他：  useClock、useShortcutLabel、scrollToSection
// 约定：纯计算放在 lib/（可单元测试），这里只做「把浏览器事件接到那些函数上」的事。

import { useEffect, useRef, useState } from "react";
// import type 只在编译期用，打包后会被删掉，不产生运行时代码。
import type { CSSProperties, DependencyList, ReactNode, RefObject } from "react";
import { SECTIONS } from "@/lib/data";
import { fitFontSize, pad2 } from "@/lib/fx";
import { cancelScramble, scramble } from "@/lib/scramble";
import { calculateTilt } from "@/lib/tilt";
import { getFrameState, onFrame, onLayout, requestLayout } from "@/lib/ticker";
import type { FrameState } from "@/lib/ticker";

// ---------- 把 **xxx** 渲染成高亮 ----------
// 简易 markdown：文本里的 **加粗** 转成带高亮样式的 <b>。
export function FormattedBold({ text }: { text: string }) {
  // split 的正则带捕获分组 (...) 时，分隔符本身也会保留在结果数组里，
  // 于是 "我会**React**和**Vue**" 会被切成 ["我会","**React**","和","**Vue**",""]。
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          // key 是 React 渲染列表时给每个元素的「身份证」；这里顺序固定，用下标即可。
          <b key={i} className="hl">
            {part.slice(2, -2)}
          </b>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

// ---------- 图标 ----------
// 全站只用这一套线性图标：统一的线宽、方头端点，保证风格一致。
// Record<IconName, ReactNode> 表示「每个图标名都必须对应一段 SVG 路径」，漏写会报错。
export type IconName =
  | "download"
  | "terminal"
  | "arrowDown"
  | "arrowRight"
  | "arrowUpRight"
  | "arrowUp"
  | "copy"
  | "check"
  | "close";

const ICON_PATHS: Record<IconName, ReactNode> = {
  download: (
    <>
      <path d="M12 4v11" />
      <path d="M7 11l5 5 5-5" />
      <path d="M5 20h14" />
    </>
  ),
  terminal: (
    <>
      <path d="M5 7l5 5-5 5" />
      <path d="M12 18h7" />
    </>
  ),
  arrowDown: (
    <>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  arrowUp: (
    <>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" />
      <path d="M5 15V4h11" />
    </>
  ),
  check: <path d="M4 12l5 5L20 6" />,
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </>
  ),
};

export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    // aria-hidden：图标只是装饰，读屏软件跳过它；真正的含义由旁边的文字或按钮的 aria-label 提供。
    <svg
      className={`icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

// ---------- 可「解码」的文字 ----------
// 同一段文字渲染两份：
//   · sr-only 那份只给读屏软件，永远是真实文字；
//   · 另一份 aria-hidden，乱码动画只发生在它身上。
// 这样做动画时，读屏用户不会听到一串乱码。
// play 为 true 时播放一次解码动画；文字或 play 变化时会重新播放。
export function Decode({ text, play = false }: { text: string; play?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (play) scramble(el);
    // 清理函数：文字变了（比如切换语言）或组件卸载时，停掉还在跑的动画。
    return () => cancelScramble(el);
  }, [text, play]);
  return (
    <span className="dec">
      <span className="sr-only">{text}</span>
      <span className="dec-v" aria-hidden="true" data-text={text} ref={ref}>
        {text}
      </span>
    </span>
  );
}

// ---------- 区块标题 ----------
// 各个区块顶部统一的标题：编号 / 英文代号 + 大标题。
// 编号不是手写的，而是按这个区块在 SECTIONS 里的位置算出来的——以后增删区块，编号自动跟着变。
export function SectionHeader({ id, title }: { id: string; title: string }) {
  const index = Math.max(0, SECTIONS.findIndex((s) => s.id === id));
  const section = SECTIONS[index];
  return (
    // data-reveal：滚动到这里时由 useReveal 加上 .in，标题从遮罩下方滑出。
    <header className="sec-head" data-reveal>
      <p className="sec-idx lbl">
        <span className="sec-num">{pad2(index + 1)}</span>
        <span aria-hidden="true">/</span>
        <Decode text={section.ghost} />
      </p>
      {/* id 给 <section aria-labelledby> 用：读屏软件会把这个标题念作区块的名字 */}
      <h2 className="sec-title" id={`${id}-title`}>
        <span className="line">
          <span className="line-in">{title}</span>
        </span>
      </h2>
    </header>
  );
}

// ---------- 幽灵大字 ----------
// 区块背后那行描边的英文大字，随滚动横向滑动，纯装饰。
export function Ghost({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // 位置信息存在 ref 里而不是 state 里：它每次测量都会变，但不需要触发重新渲染。
  const box = useRef({ top: 0, height: 1 });
  const section = SECTIONS.find((s) => s.id === id);

  useLayout(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    box.current = { top: rect.top + window.scrollY, height: Math.max(1, rect.height) };
  }, []);

  useFrame((s) => {
    const el = ref.current;
    if (!el || s.reduced) return;
    // progress：这个区块从「刚从屏幕底部冒头」(0) 到「完全滚出屏幕顶部」(1) 的进度。
    const progress = (s.sy + s.vh - box.current.top) / (s.vh + box.current.height);
    if (progress < -0.1 || progress > 1.1) return; // 不在屏幕附近就不用动
    el.style.transform = `translate3d(${((0.25 - progress) * s.vw * 0.7).toFixed(1)}px,0,0)`;
  });

  if (!section) return null;
  return (
    <div className="ghost" aria-hidden="true" ref={ref}>
      {section.ghost}
    </div>
  );
}

// ---------- 错开出现的顺序 ----------
// 一组元素依次出现时，每个比前一个晚一点点。这里只是把序号写进 CSS 变量 --i，
// 真正的延迟由 globals.css 用 calc(var(--i) * 40ms) 算出来。
// 「as CSSProperties」是类型断言：React 的 style 类型里没有自定义变量，这里告诉 TS「我知道我在做什么」。
export const stagger = (index: number): CSSProperties => ({ "--i": index }) as CSSProperties;

// ---------- 技术标签 ----------
export function Chips({ items }: { items: string[] }) {
  if (!items.length) return null; // 没有标签时不输出空列表
  return (
    <ul className="chips">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

// ---------- 订阅每一帧 ----------
// 用法：useFrame((s) => { ...每帧要做的事... })。s 里有滚动位置、鼠标位置等（见 lib/ticker.ts）。
// 回调里通常直接改 DOM 的 style，而不是 setState：一秒 60 次的 setState 会让组件反复重新渲染。
export function useFrame(fn: (state: FrameState) => void): void {
  // 把最新的回调存进 ref：这样订阅只需要建立一次，但每帧调用的总是最新那份回调
  // （回调里用到的 props / state 也就总是最新的）。
  const latest = useRef(fn);
  useEffect(() => {
    latest.current = fn;
  });
  useEffect(() => onFrame((state) => latest.current(state)), []);
}

// ---------- 订阅「需要重新测量」 ----------
// 很多特效要先量出元素的位置和大小。fn 会在这些时刻被调用：
//   组件挂载后、deps 变化后（比如切换语言）、窗口大小变化、网络字体加载完成、文档高度变化。
export function useLayout(fn: () => void, deps: DependencyList): void {
  const latest = useRef(fn);
  useEffect(() => {
    latest.current = fn;
  });
  useEffect(() => {
    latest.current();
    return onLayout(() => latest.current());
    // deps 由调用方传入，这里没法让 lint 静态检查，所以关掉这一条规则。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ---------- 滚动揭示 ----------
// 给 root 里所有带 data-reveal 的元素装上「滚到才出现」的效果：进入视口时加上 .in 这个 class，
// 具体怎么出现（淡入、上移、从遮罩滑出）由 globals.css 决定。
//
// 概念：IntersectionObserver 是浏览器提供的「元素是否进入视口」的监听器，
// 比自己监听 scroll 再反复计算位置省性能得多。
//
// 注意：.in 是直接加在 DOM 上的，不经过 React。所以带 data-reveal 的元素，
// className 要保持固定（不要随 state 变化），否则 React 重写 class 时会把 .in 冲掉。
export function useReveal(root: RefObject<HTMLElement | null>, deps: DependencyList): void {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]:not(.in)"));
    if (!targets.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach((t) => t.classList.add("in"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          target.classList.add("in");
          observer.unobserve(target); // 出现过一次就不用再盯着了
          // 区块标题出现时，顺便把旁边的英文代号「解码」一下
          if (target.classList.contains("sec-head")) {
            scramble(target.querySelector<HTMLElement>(".dec-v"));
          }
        }
      },
      // rootMargin 把判定区域的底边往上收 10%：元素要真正进到屏幕里一点才算出现。
      { threshold: 0, rootMargin: "0px 0px -10% 0px" },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ---------- 指针驱动的 3D 倾斜 + 光斑 ----------
// 返回一个 ref，调用方把它挂到需要倾斜的元素上即可。
// 高频的 pointermove 不写 React state，而是经 requestAnimationFrame 合并后直接更新 CSS 变量：
//   --tilt-x / --tilt-y  倾斜角度（globals.css 里用它们拼 transform）
//   --spot-x / --spot-y  鼠标在元素内的位置（亮点卡片上跟随鼠标的光斑用）
export function usePointerTilt<T extends HTMLElement>(maxAngle = 6): RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    // 只有鼠标这类精确指针才启用；用户要求减少动态效果时也完全不注册事件。
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      // 同一帧内只保留最后一次指针位置，避免高刷新率鼠标堆积大量 DOM 写入。
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        frame = 0;
        const bounds = element.getBoundingClientRect();
        const { rotateX, rotateY } = calculateTilt({
          pointerX: event.clientX,
          pointerY: event.clientY,
          bounds,
          maxAngle,
        });
        element.style.setProperty("--tilt-x", `${rotateX}deg`);
        element.style.setProperty("--tilt-y", `${rotateY}deg`);
        element.style.setProperty("--spot-x", `${Math.round(event.clientX - bounds.left)}px`);
        element.style.setProperty("--spot-y", `${Math.round(event.clientY - bounds.top)}px`);
        element.classList.add("is-tilting");
      });
    };
    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      element.style.setProperty("--tilt-x", "0deg");
      element.style.setProperty("--tilt-y", "0deg");
      element.classList.remove("is-tilting");
    };

    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [maxAngle]);

  return ref;
}

// ---------- 磁吸按钮 ----------
// 鼠标在按钮上移动时，按钮会朝鼠标的方向偏一点，像被吸住；移开后弹回原位。
// 偏移量写进 --mx / --my 两个 CSS 变量，.btn 的 transform 会读取它们。
export function useMagnetic<T extends HTMLElement>(): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    const onMove = (event: PointerEvent) => {
      const r = element.getBoundingClientRect();
      element.style.setProperty("--mx", `${((event.clientX - (r.left + r.width / 2)) * 0.28).toFixed(1)}px`);
      element.style.setProperty("--my", `${((event.clientY - (r.top + r.height / 2)) * 0.4).toFixed(1)}px`);
    };
    const onLeave = () => {
      element.style.setProperty("--mx", "0px");
      element.style.setProperty("--my", "0px");
    };
    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return ref;
}

// ---------- 大字自适应 ----------
// 名字、公司名这类「一行不换行的大字」，文字比容器宽时自动缩小字号。
// 用法：把返回的 ref 挂在外层元素上，里面放一个带 data-fit-in 的行内块，量的就是它的宽度。
export function useFitText<T extends HTMLElement>(deps: DependencyList): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useLayout(() => {
    const el = ref.current;
    const inner = el?.querySelector<HTMLElement>("[data-fit-in]");
    if (!el || !inner) return;
    const before = el.style.fontSize;
    el.style.fontSize = ""; // 先恢复成 CSS 里写的字号，再量
    const next = fitFontSize({
      fontSize: parseFloat(getComputedStyle(el).fontSize) || 16,
      boxWidth: el.clientWidth,
      contentWidth: inner.offsetWidth,
    });
    const value = next === null ? "" : `${next}px`;
    el.style.fontSize = value;
    // 字号变了，页面高度也可能跟着变：请其他特效在下一帧重新测量。
    if (value !== before) requestLayout();
  }, deps);
  return ref;
}

// ---------- 实时时钟 Hook ----------
// 每秒更新一次当前时间，给顶栏用。
export function useClock(): Date | null {
  // 初值为 null：构建时渲染没有「当前时间」，等浏览器挂载后再设，
  // 避免两边渲染出不同的时间导致 hydration 不匹配。
  // 补充「hydration（水合）」概念：Next 会先把组件渲成 HTML 发给浏览器（首屏快），
  //   随后浏览器再让 React「接管」这段已有 HTML、给它装上交互逻辑——这一步就叫水合。
  //   它要求两边首次渲染的结果完全一致，所以时间、随机数、localStorage 这类
  //   「只有浏览器才知道」的值，都要等到 useEffect 里再读。
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ---------- 快捷键提示文字 ----------
// 呼出终端的快捷键：Mac 上显示 ⌘K，其他系统显示 Ctrl K。
// 同样遵守水合规则：先用固定默认值渲染，挂载后再按真实系统修正。
export function useShortcutLabel(): string {
  const [label, setLabel] = useState("Ctrl K");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setLabel("⌘K");
  }, []);
  return label;
}

// ---------- 滚动到某个区块 ----------
export function scrollToSection(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  const state = getFrameState();
  const top = id === "hero" ? 0 : el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: state.reduced ? "auto" : "smooth" });
  // 键盘用户跳转后把焦点也带过去，接着按 Tab 才会从新位置继续。
  if (state.keyboard) el.focus({ preventScroll: true });
}

// =====================================================================
// 以下三个是旧版（终端风格）留下的积木，现在只有休眠中的博客组件
// components/blog/LatestPosts.tsx 还在引用。保留它们是为了不动博客代码。
// =====================================================================

export function useInView(ref: RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
}

export function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      className={`fade-up ${visible ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function SectionHead({ num, title, meta }: { num: string; title: string; meta?: ReactNode }) {
  return (
    <div className="section-head">
      <span className="num">[ {num} ]</span>
      <h2>
        <span className="prompt-char">$</span>
        {title}
      </h2>
      {meta && <span className="meta">{meta}</span>}
    </div>
  );
}
