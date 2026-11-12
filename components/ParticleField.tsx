"use client";

// 背景粒子场：铺满整个视口、固定在内容后面的一张 <canvas>。
// 真正的绘制逻辑在 lib/particles.ts（不依赖 React）；这个组件只负责三件事：
//   1. 挂载后创建引擎，卸载时清理；
//   2. 每帧调用引擎的 frame()，窗口变化时调用 resize()；
//   3. 把「拼成文字 / 松开」两个动作通过 handle 交给开场动画（Intro）使用。

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { clamp, lerp } from "@/lib/fx";
import { createParticleEngine } from "@/lib/particles";
import type { ParticleEngine, TextLine } from "@/lib/particles";
import { useFrame, useLayout } from "./effects";

// 开场动画能对粒子场做的两件事。
export type FieldHandle = {
  formText(lines: TextLine[]): boolean;
  release(): void;
};

export function ParticleField({
  front,
  handle,
}: {
  front: boolean; // 开场期间为 true：画布盖在开场遮罩之上
  handle: RefObject<FieldHandle | null>; // 父组件创建的 ref，这里负责把它填上
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ParticleEngine | null>(null);
  const contactTop = useRef(0);

  // 空依赖数组：只在挂载时创建一次引擎。
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const created = createParticleEngine(canvas);
    engine.current = created;
    handle.current = created
      ? { formText: (lines) => created.formText(lines), release: () => created.release() }
      : null;
    return () => {
      engine.current = null;
      handle.current = null;
    };
  }, [handle]);

  useLayout(() => {
    engine.current?.resize();
    const contact = document.getElementById("contact");
    contactTop.current = contact ? contact.getBoundingClientRect().top + window.scrollY : 0;
  }, []);

  useFrame((s) => {
    const current = engine.current;
    if (!current) return;
    // 亮度随滚动变化：首屏最亮，正文区压暗保证文字好读，滚到联系区再亮起来。
    let gain = lerp(1, 0.42, clamp(s.sy / (s.vh * 0.8), 0, 1));
    if (contactTop.current) {
      gain = lerp(gain, 0.95, clamp((s.sy + s.vh - contactTop.current) / s.vh, 0, 1));
    }
    current.setGain(gain);
    current.frame(s);
  });

  // aria-hidden：纯装饰，读屏软件直接跳过。
  return <canvas className={front ? "field is-front" : "field"} ref={canvasRef} aria-hidden="true" />;
}
