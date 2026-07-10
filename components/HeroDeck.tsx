// "use client"：这个组件会调用 usePointerTilt，里面使用浏览器的指针事件和 CSS 变量，
// 因此必须在客户端运行。甲板里展示的文字仍然是静态的，不会额外请求任何接口。
"use client";

import { ImageSlot } from "./ImageSlot";
import { usePointerTilt } from "./effects";
import type { Lang } from "../lib/types";

// HeroDeck 是首屏右侧的「立体终端甲板」。它只负责视觉场景和头像，
// 姓名、职位、简介等真正的简历信息仍由 Hero 左栏负责，避免装饰层抢走语义主次。
export function HeroDeck({ lang }: { lang: Lang }) {
  // 返回的 ref 会把指针位置写成 --tilt-x / --tilt-y 两个 CSS 变量。
  // 最大 6° 足够看出 3D 深度，同时不会让头像和终端面板大幅晃动。
  const deckRef = usePointerTilt<HTMLDivElement>(6);

  // 头像替代文字必须说明「照片里是谁」，并跟随中英文切换。
  const portraitAlt = lang === "zh" ? "李姜磊的头像" : "Portrait of Jianglei Li";

  return (
    <div className="hero-deck-col">
      {/* ref 只挂在甲板本身，指针移动不会触发外层 Hero 或整页重新渲染。 */}
      <div className="hero-deck" ref={deckRef}>
        {/* 网格、系统状态、遥测条和激光线只是营造空间感。
            aria-hidden 告诉读屏软件跳过它们，避免用户听到一串无意义的装饰状态。 */}
        <div className="deck-grid" aria-hidden="true" />
        <div className="deck-panel deck-panel-system" aria-hidden="true">
          <span>AGENT STATUS</span>
          <strong>ONLINE</strong>
          <small>04 ACTIVE NODES</small>
        </div>
        <div className="deck-panel deck-panel-telemetry" aria-hidden="true">
          <span>SYSTEM READY</span>
          <div className="deck-bars">
            <i />
            <i />
            <i />
          </div>
          <small>LATENCY 32MS</small>
        </div>

        {/* 身份面板是真实内容，所以不能 aria-hidden。ImageSlot 负责图片失败时显示占位。 */}
        <div className="deck-panel deck-panel-id">
          <ImageSlot
            src="/ljl-new.png"
            placeholder={lang === "zh" ? "把头像放到 public/" : "drop photo in public/"}
            alt={portraitAlt}
          />
          <div className="hero-photo-label">ID_0001</div>
        </div>

        <div className="deck-laser" aria-hidden="true" />
        <div className="deck-node deck-node-a" aria-hidden="true" />
        <div className="deck-node deck-node-b" aria-hidden="true" />
      </div>

      {/* 标语仍放在甲板外：内部面板会做 3D 变换和裁剪，放里面可能被遮住。 */}
      <p className="hero-motto">
        <span className="hero-motto-arrow">▸</span>
        尽管提需求，我来想办法实现
        <span className="cursor" />
      </p>
    </div>
  );
}
