"use client";

import { useEffect, useState } from "react";
import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { FadeUp, SectionHead } from "./effects";
import type { ExperienceItem, Lang } from "@/lib/types";

// 单条经历：点标题可展开/收起。defaultOpen 由父组件的「展开全部/收起」控制。
function ExpItem({
  item,
  lang,
  defaultOpen,
}: {
  item: ExperienceItem;
  lang: Lang;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  // 父组件切换「全部展开/收起」时，同步每条的展开状态。
  useEffect(() => setOpen(defaultOpen), [defaultOpen]);
  const bullets = item.bullets[lang];
  return (
    <div className={`exp ${open ? "open" : ""}`}>
      <button className="exp-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="exp-caret">▶</span>
        <span className="exp-title">
          <span className="role">{pickLang(item.role, lang)}</span>
          <span className="at">@</span>
          <span className="company">{pickLang(item.company, lang)}</span>
        </span>
        <span className="exp-date">{item.date}</span>
      </button>
      <div className="exp-body">
        <div className="exp-inner">
          <ul>
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          {item.stack && (
            <div className="stack">
              {item.stack.map((s, i) => (
                <span key={i} className="chip">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Experience({ lang }: { lang: Lang }) {
  const items = RESUME.experience;
  const [allOpen, setAllOpen] = useState(true);
  return (
    <section className="section" id="experience">
      <SectionHead
        num="03"
        title={pickLang(STRINGS.experience, lang)}
        meta={
          <button
            className="icon-btn"
            style={{ padding: "2px 8px", fontSize: 10 }}
            onClick={() => setAllOpen(!allOpen)}
          >
            {allOpen
              ? pickLang(STRINGS.collapseAll, lang)
              : pickLang(STRINGS.expandAll, lang)}
          </button>
        }
      />
      <FadeUp>
        <div className="exp-list">
          {items.map((it, i) => (
            <ExpItem key={i} item={it} lang={lang} defaultOpen={allOpen} />
          ))}
        </div>
      </FadeUp>
    </section>
  );
}
