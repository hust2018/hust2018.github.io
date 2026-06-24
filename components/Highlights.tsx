// 客户端组件（用到 FadeUp 内部的浏览器 API，这一系列展示组件都标 use client）。
"use client";

import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { FadeUp, SectionHead } from "./effects";
import type { Lang } from "@/lib/types";

// 「亮点 / 活动」区块：把 RESUME.highlights 里的活动经历（黑客马拉松、开源研读等）
// 渲染成一行行。纯展示组件，没有自己的状态，只根据传入的 lang 决定显示哪种语言。
export function Highlights({ lang }: { lang: Lang }) {
  const items = RESUME.highlights;
  return (
    <section className="section" id="highlights">
      {/* 编号 05；meta 用 git log 的口吻呼应终端风格 */}
      <SectionHead num="05" title={pickLang(STRINGS.highlights, lang)} meta="// git log --oneline" />
      <FadeUp>
        <div className="hl-list">
          {/* 遍历每条亮点，渲染成「左侧时间 + 右侧内容」一行 */}
          {items.map((h, i) => (
            <div key={i} className="hl">
              {/* 时间是纯字符串，直接显示 */}
              <div className="hl-date">{h.date}</div>
              <div className="hl-main">
                <div className="hl-head">
                  {/* 标题是双语的，用 pickLang 取当前语言 */}
                  <span className="hl-title">{pickLang(h.title, lang)}</span>
                  {/* 徽章可选：有 badge 才渲染（如「第五名 / 5th place」） */}
                  {h.badge && <span className="hl-badge">{pickLang(h.badge, lang)}</span>}
                </div>
                <div className="hl-desc">{pickLang(h.desc, lang)}</div>
                {/* 只有存在技术标签或外链时，才渲染底部这一行 */}
                {(h.stack || h.link) && (
                  <div className="hl-foot">
                    {/* 技术标签：stack 是固定英文 token，直接显示成小标签 */}
                    {h.stack &&
                      h.stack.map((s, j) => (
                        <span key={j} className="tag">
                          {s}
                        </span>
                      ))}
                    {/* 外链可选：新标签页打开；rel 是安全惯例。链接文字去掉 https:// 前缀更简洁。 */}
                    {h.link && (
                      <a className="hl-link" href={h.link} target="_blank" rel="noopener noreferrer">
                        ↗ {h.link.replace(/^https?:\/\//, "")}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}
