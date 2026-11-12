"use client";

// 跑马灯：一行内容首尾相接、不停地横向滚动。
// 技能栈的每一行、首屏的「下班之后」徽章带都用它。
//
// 原理：把同一组内容连着渲染好几份，整条轨道往一个方向平移；
// 平移满「一组内容的宽度」就瞬间回到起点。因为后面紧跟着一模一样的另一组，
// 回到起点的那一下肉眼看不出来，于是看起来是无限滚动。
// 位置怎么算见 lib/fx.ts 的 advanceMarquee / marqueeShift（有单元测试）。

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { advanceMarquee, marqueeShift, scrollBoost } from "@/lib/fx";
import { getFrameState } from "@/lib/ticker";
import { useFrame, useLayout } from "./effects";

export function Marquee({
  items,
  speed = 40,
  dir = -1,
  itemClassName = "",
  watch = "",
}: {
  items: ReactNode[]; // 一组内容，每项渲染成一个 <li>
  speed?: number; // 像素 / 秒
  dir?: 1 | -1; // -1 向左，1 向右
  itemClassName?: string;
  watch?: string; // 内容宽度可能变化的信号（比如当前语言）：它变了就重新测量
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  // 需要渲染几份内容。先渲染 1 份（构建时也是 1 份），挂载后量出宽度再补够。
  const [copies, setCopies] = useState(1);
  // 每帧都在变的数值放 ref：改它不会触发重新渲染。
  const motion = useRef({ copyWidth: 0, x: 0, ease: 1, paused: false, visible: true });

  useLayout(() => {
    const track = trackRef.current;
    // 减少动态效果时不滚动：保持 1 份内容，由 CSS 排成自动换行的静态列表。
    if (!track || getFrameState().reduced) return;
    // 一组内容的宽度 = 前 items.length 个 <li> 的宽度之和。
    let width = 0;
    for (let i = 0; i < items.length && i < track.children.length; i++) {
      width += track.children[i].getBoundingClientRect().width;
    }
    if (!width) return;
    motion.current.copyWidth = width;
    // 至少要铺满 1.5 个屏宽，再多一份用来接续。
    setCopies(Math.ceil((window.innerWidth * 1.5) / width) + 1);
  }, [items.length, watch]);

  // 滚出屏幕的跑马灯不用更新，省一点性能。
  useEffect(() => {
    const host = hostRef.current;
    if (!host || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      motion.current.visible = entry.isIntersecting;
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useFrame((s) => {
    const track = trackRef.current;
    const m = motion.current;
    if (!track || s.reduced || !m.visible || m.copyWidth <= 0) return;
    // 悬停时 ease 慢慢降到 0（缓缓停下），移开后再慢慢回到 1。
    m.ease += ((m.paused ? 0 : 1) - m.ease) * 0.1;
    m.x = advanceMarquee({
      x: m.x,
      speed,
      dtMs: s.dt,
      boost: scrollBoost(s.vel), // 页面滚得越快，跑马灯跑得越快
      ease: m.ease,
      copyWidth: m.copyWidth,
    });
    track.style.transform = `translate3d(${marqueeShift(m.x, m.copyWidth, dir).toFixed(2)}px,0,0)`;
  });

  return (
    <div
      className="mq"
      ref={hostRef}
      onPointerEnter={() => {
        motion.current.paused = true;
      }}
      onPointerLeave={() => {
        motion.current.paused = false;
      }}
    >
      <ul className="mq-track" ref={trackRef}>
        {/* 第 1 份是真正的内容；后面几份只是视觉上的重复，用 aria-hidden 让读屏软件跳过。 */}
        {Array.from({ length: copies }, (_, copy) =>
          items.map((item, i) => (
            <li
              key={`${copy}-${i}`}
              className={itemClassName || undefined}
              aria-hidden={copy > 0 ? true : undefined}
            >
              {item}
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
