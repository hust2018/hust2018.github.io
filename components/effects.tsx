"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";

// ---------- 故障风文字 ----------
// 视觉特效靠 CSS 实现，这里只把文字同时塞进 data-text 属性供 CSS 用。
export function GlitchText({ text }: { text: string }) {
  return (
    <span className="glitch" data-text={text}>
      {text}
    </span>
  );
}

// ---------- 打字机效果 ----------
// 一个字一个字地把 text 显示出来。start 为 false 时不开始（等开机动画结束）。
export function Typewriter({
  text,
  speed = 55,
  start = true,
}: {
  text: string;
  speed?: number;
  start?: boolean;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    setN(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, start, speed]);
  return <span>{text.slice(0, n)}</span>;
}

// ---------- 把 **xxx** 渲染成高亮 ----------
// 简易 markdown：文本里的 **加粗** 转成带高亮样式的 <span>。
export function FormattedBold({ text }: { text: string }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <span key={i} className="highlight">
            {p.slice(2, -2)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// ---------- 「元素是否进入视口」的自定义 Hook ----------
// 用浏览器的 IntersectionObserver 监听某个元素是否滚动进了可视区域，
// 配合 FadeUp 实现「滚到哪里、哪里淡入」。
export function useInView(ref: RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const checkNow = () => {
      const el = ref.current;
      if (!el) return false;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (r.top < vh && r.bottom > 0) {
        setInView(true);
        return true;
      }
      return false;
    };
    if (checkNow()) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0 }
    );
    obs.observe(ref.current);
    const raf = requestAnimationFrame(checkNow);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref]);
  return inView;
}

// ---------- 滚动淡入容器 ----------
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

// ---------- 实时时钟 Hook ----------
// 每秒更新一次当前时间，给顶栏的 TIME 用。
export function useClock(): Date | null {
  // 初值为 null：服务器端渲染时没有「当前时间」，等浏览器挂载后再设，
  // 避免服务器和浏览器渲染出不同的时间导致 hydration 警告。
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ---------- 区块标题 ----------
export function SectionHead({
  num,
  title,
  meta,
}: {
  num: string;
  title: string;
  meta?: ReactNode;
}) {
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
