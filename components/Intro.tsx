"use client";

// 开场动画：粒子从四面八方汇聚，拼出名字；约 1.5 秒后炸开成背景，首屏内容随之出现。
// 它替代了旧版的「开机日志」（BootSequence）。
//
// 规则：
//   · 每个标签页会话只播一次（sessionStorage 记录）；
//   · 点击任意位置、或按 Esc / 回车 / 空格可以随时跳过；
//   · 用户要求减少动态效果、或页面打开时不在顶部，就直接不播。
//
// 这个组件一开始就渲染成一块不透明的遮罩，盖住整个页面——这样首屏内容不会在开场前闪一下。
// 父组件（ResumeApp）通过两个回调得知进度：
//   onReveal(played)  该让首屏内容出现了（played 表示开场是否真的播放过）
//   onGone()          遮罩已经淡出完毕，可以把本组件卸载了

import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { STRINGS } from "@/lib/data";
import { clamp } from "@/lib/fx";
import { pickLang } from "@/lib/i18n";
import type { TextLine } from "@/lib/particles";
import type { Lang } from "@/lib/types";
import type { FieldHandle } from "./ParticleField";

const SESSION_KEY = "resume-booted"; // 和旧版开机动画用同一个键
const DURATION = 1500;

// 等网络字体就位（最多等 ms 毫秒）。字体没到就用系统字体去采样，名字的形状会对不上。
function fontsReady(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    const done = () => {
      window.clearTimeout(timer);
      resolve();
    };
    if (!document.fonts?.load) {
      done();
      return;
    }
    // 这里的字体名和字重要和 globals.css 里 .hero-name 实际用的一致：
    // 中文名字是马善政毛笔楷书（只有 400 这一个字重），英文名字是 Bodoni Moda 的 700 斜体。
    Promise.all([
      document.fonts.load('400 64px "Ma Shan Zheng"', "李姜磊"),
      document.fonts.load('italic 700 64px "Bodoni Moda"', "Jianglei Li"),
      document.fonts.ready,
    ]).then(done, done);
  });
}

// 量出首屏名字每一行在屏幕上的位置和字体，交给粒子场去「照着画」。
function measureNameLines(): TextLine[] {
  const heading = document.querySelector<HTMLElement>(".hero-name");
  if (!heading) return [];
  const style = getComputedStyle(heading);
  const fontSize = parseFloat(style.fontSize) || 100;
  const font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
  const probe = document.createElement("canvas").getContext("2d");

  return Array.from(heading.querySelectorAll<HTMLElement>(".line")).map((line) => {
    let text = line.textContent ?? "";
    if (style.textTransform === "uppercase") text = text.toUpperCase();
    const rect = line.getBoundingClientRect();
    const lineStyle = getComputedStyle(line);
    // 遮罩（.line）四周有留白，文字真正开始的位置要把这些留白扣掉。
    const padTop = parseFloat(lineStyle.paddingTop) || 0;
    const padBottom = parseFloat(lineStyle.paddingBottom) || 0;
    const padLeft = parseFloat(lineStyle.paddingLeft) || 0;
    // 字体的「上伸 / 下伸」高度：用来把文字基线摆到和页面上一样的位置。
    let ascent = fontSize * 0.88;
    let descent = fontSize * 0.12;
    if (probe) {
      probe.font = font;
      const metrics = probe.measureText(text);
      if (metrics.fontBoundingBoxAscent) {
        ascent = metrics.fontBoundingBoxAscent;
        descent = metrics.fontBoundingBoxDescent || 0;
      }
    }
    const boxTop = rect.top + padTop;
    const boxHeight = rect.height - padTop - padBottom;
    return {
      text,
      x: rect.left + padLeft,
      y: boxTop + (boxHeight - (ascent + descent)) / 2 + ascent,
      font,
      letterSpacing: style.letterSpacing === "normal" ? "0px" : style.letterSpacing,
    };
  });
}

export function Intro({
  lang,
  field,
  onReveal,
  onGone,
}: {
  lang: Lang;
  field: RefObject<FieldHandle | null>;
  onReveal: (played: boolean) => void;
  onGone: () => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const skipRef = useRef<() => void>(() => {});
  // 回调存进 ref：下面那个只跑一次的 effect 里，调用到的总是父组件最新传进来的函数。
  const callbacks = useRef({ onReveal, onGone });
  useEffect(() => {
    callbacks.current = { onReveal, onGone };
  });

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // 某些隐私模式下读 sessionStorage 会抛错：当作没看过即可。
    }
    // 不播的几种情况：直接让内容出现，并请父组件卸载自己。
    if (reduced || seen || window.scrollY > 40 || !field.current) {
      callbacks.current.onReveal(false);
      callbacks.current.onGone();
      return;
    }

    let done = false;
    let cancelled = false;
    let raf = 0;
    const timers: number[] = [];
    const startedAt = performance.now();
    document.body.style.overflow = "hidden"; // 开场期间锁住滚动

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // 写不进去也没关系，最多下次再播一遍。
      }
      field.current?.release();
      document.body.style.overflow = "";
      setLeaving(true);
      callbacks.current.onReveal(true);
      timers.push(window.setTimeout(() => callbacks.current.onGone(), 260));
    };
    skipRef.current = finish;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    // 兜底：无论发生什么，5 秒后一定结束，内容一定可见。
    timers.push(window.setTimeout(finish, 5200));

    // 进度数字和进度条每帧直接写 DOM，不走 setState（一秒 60 次的重新渲染没有必要）。
    const tick = (now: number) => {
      if (done) return;
      const progress = clamp((now - startedAt) / DURATION, 0, 1);
      if (countRef.current) countRef.current.textContent = String(Math.round(progress * 100)).padStart(3, "0");
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(3)})`;
      if (progress < 1) raf = requestAnimationFrame(tick);
      else timers.push(window.setTimeout(finish, 200));
    };
    raf = requestAnimationFrame(tick);

    fontsReady(1000).then(() => {
      // 再等两帧：让「名字字号自适应」先完成，量到的位置才是最终位置。
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (done || cancelled) return;
          field.current?.formText(measureNameLines());
        }),
      );
    });

    // 清理函数：组件卸载时把计时器、监听器、滚动锁都撤掉。
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [field]);

  return (
    <div className={leaving ? "intro out" : "intro"} onClick={() => skipRef.current()}>
      <div className="intro-hud">
        <p className="intro-line">
          {pickLang(STRINGS.introLine, lang)}{" "}
          <span className="intro-count nowrap" ref={countRef}>
            000
          </span>
        </p>
        <button type="button" className="intro-skip">
          <span>{pickLang(STRINGS.introSkip, lang)}</span>
          <kbd>Esc</kbd>
        </button>
      </div>
      <div className="intro-bar" aria-hidden="true">
        <i ref={barRef} />
      </div>
    </div>
  );
}
