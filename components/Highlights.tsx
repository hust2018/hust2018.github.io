"use client";

// 「亮点」：黑客马拉松等活动经历。每条是一张卡片，
// 鼠标移上去会轻微 3D 倾斜，并有一团光斑跟着鼠标走。

import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import type { Highlight, Lang } from "@/lib/types";
import { Chips, Ghost, Icon, SectionHeader, stagger, usePointerTilt } from "./effects";

// 单独拆成一个组件，是因为 Hook 不能写在循环里：
// 每张卡片都需要自己的 usePointerTilt，所以让「每张卡片是一个组件」，各自调用一次。
function HighlightCard({ item, lang }: { item: Highlight; lang: Lang }) {
  const ref = usePointerTilt<HTMLElement>(4);
  return (
    <article className="hl-card" data-tilt ref={ref}>
      <i className="spot" aria-hidden="true" />
      <div className="hl-top">
        <p className="hl-date nowrap">{item.date}</p>
        {item.badge && <p className="tag">{pickLang(item.badge, lang)}</p>}
      </div>
      <h3 className="hl-title">{pickLang(item.title, lang)}</h3>
      <p className="hl-desc">{pickLang(item.desc, lang)}</p>
      <Chips items={item.stack ?? []} />
      {item.link && (
        // target="_blank" 新标签页打开；rel="noopener noreferrer" 是安全惯例，
        // 防止新页面通过 window.opener 操纵原页面。
        <a className="hl-link" href={item.link} target="_blank" rel="noopener noreferrer">
          <span className="truncate">{item.link.replace(/^https?:\/\//, "")}</span>
          <Icon name="arrowUpRight" />
        </a>
      )}
    </article>
  );
}

export function Highlights({ lang }: { lang: Lang }) {
  return (
    <section className="sec" id="highlights" aria-labelledby="highlights-title" tabIndex={-1}>
      <div className="wrap">
        <SectionHeader id="highlights" title={pickLang(STRINGS.highlights, lang)} />
        <div className="hl-grid">
          {RESUME.highlights.map((item, i) => (
            // 外层负责「滚动出现」，里层卡片负责「鼠标倾斜」：两种位移分开在两个元素上，互不覆盖。
            <div className="hl-cell" data-reveal style={stagger(i)} key={i}>
              <HighlightCard item={item} lang={lang} />
            </div>
          ))}
        </div>
      </div>
      <Ghost id="highlights" />
    </section>
  );
}
