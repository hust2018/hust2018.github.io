// 客户端组件（用到了 FadeUp 内部的浏览器 API，所以这一系列展示组件都标 use client）。
"use client";

import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { FadeUp, SectionHead } from "./effects";
import type { Lang } from "@/lib/types";

// 「项目」区块：把简历里的项目列表渲染成一张张卡片。
// 这是个纯展示组件，没有自己的状态，只根据传入的 lang 决定显示哪种语言。
export function Projects({ lang }: { lang: Lang }) {
  // 取出项目数组。
  const items = RESUME.projects;
  return (
    <section className="section" id="projects">
      {/* meta 这里直接传字符串（也是合法的 ReactNode），显示成标题旁的注释样文字 */}
      <SectionHead num="04" title={pickLang(STRINGS.projects, lang)} meta="// tree ~/projects" />
      <FadeUp>
        <div className="projects">
          {/* 遍历项目数组，每个项目渲染一张卡片。key 用下标 i 区分各项 */}
          {items.map((p, i) => (
            <div key={i} className="project">
              <div className="project-head">
                {/* p.name / p.year 不分语言，直接显示 */}
                <span className="project-name">{p.name}</span>
                <span className="project-year">{p.year}</span>
              </div>
              {/* 描述是双语的，用 pickLang 按当前语言取 */}
              <div className="project-desc">{pickLang(p.desc, lang)}</div>
              <div className="project-stack">
                {/* 再嵌一层 .map 渲染该项目的技术标签。
                    外层用了 i 当 key，这里内层换用 j，避免和外层混淆 */}
                {p.stack.map((t, j) => (
                  <span key={j} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <div className="project-meta">
                {/* 星标数与主要语言，模仿 GitHub 仓库卡片的底部信息 */}
                <span>
                  ★ <b>{p.stars}</b>
                </span>
                <span>● {p.lang}</span>
              </div>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}
