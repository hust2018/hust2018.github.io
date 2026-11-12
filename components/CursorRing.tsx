"use client";

// 跟随光环：一个带惯性、跟着鼠标走的圆环。系统光标照常显示，光环只是多出来的一层装饰。
// 鼠标移到链接、按钮上时，光环会放大并填实，提示「这里可以点」。
// 只在鼠标设备上出现；触屏设备和要求减少动态效果的用户看不到它。

import { useRef } from "react";
import { useFrame } from "./effects";

const HOT_SELECTOR = "a,button,input,[data-tilt],.sk-item";

export function CursorRing() {
  const ref = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLElement>(null);
  const motion = useRef({ x: 0, y: 0, scale: 1, started: false, hot: false, off: false });

  useFrame((s) => {
    const el = ref.current;
    const ring = ringRef.current;
    if (!el || !ring || s.reduced || !s.fine) return;
    const m = motion.current;
    if (!m.started) {
      if (!s.pointerOn) return; // 鼠标第一次移动之后才出现，避免一开始停在左上角
      m.started = true;
      m.x = s.pointerX;
      m.y = s.pointerY;
      el.classList.add("on");
    }
    // 每帧只走「到鼠标的距离」的 20%：离得远时走得快，快到了就慢下来，于是有了惯性的感觉。
    if (s.pointerOn) {
      m.x += (s.pointerX - m.x) * 0.2;
      m.y += (s.pointerY - m.y) * 0.2;
    }
    const hot = s.pointerOn && !!s.pointerTarget?.closest(HOT_SELECTOR);
    m.scale += ((hot ? 1.6 : 1) - m.scale) * 0.2;
    ring.style.transform = `translate3d(${m.x.toFixed(1)}px,${m.y.toFixed(1)}px,0) scale(${m.scale.toFixed(3)})`;
    // class 只在状态变化时才改，避免每帧都去动 DOM。
    if (hot !== m.hot) {
      m.hot = hot;
      el.classList.toggle("is-hot", hot);
    }
    if (!s.pointerOn !== m.off) {
      m.off = !s.pointerOn;
      el.classList.toggle("is-off", m.off);
    }
  });

  return (
    <div className="cursor" ref={ref} aria-hidden="true">
      <i className="cursor-ring" ref={ringRef} />
    </div>
  );
}
