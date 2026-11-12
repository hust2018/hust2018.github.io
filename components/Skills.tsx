"use client";

// 「技能栈」：每个分类一行跑马灯，相邻两行方向相反、速度略有不同。
// 页面滚得越快它们跑得越快；鼠标悬停在某一行上，那一行会缓缓停下，方便看清。

import { RESUME, STRINGS } from "@/lib/data";
import { pad2 } from "@/lib/fx";
import { pickLang } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { Ghost, SectionHeader } from "./effects";
import { Marquee } from "./Marquee";

export function Skills({ lang }: { lang: Lang }) {
  return (
    <section className="sec" id="skills" aria-labelledby="skills-title" tabIndex={-1}>
      <div className="wrap">
        <SectionHeader id="skills" title={pickLang(STRINGS.skills, lang)} />
      </div>
      <div className="sk-rows">
        {RESUME.skills.map((group, i) => (
          <div className="sk-row" data-reveal key={i}>
            <p className="lbl sk-label">
              <span>{pickLang(group.cat, lang)}</span>
              <span className="sk-count">{pad2(group.items.length)}</span>
            </p>
            <Marquee
              // items 里纯字符串（如 "Python"）和双语对象可以混放，pickLang 两种都能处理。
              items={group.items.map((item) => pickLang(item, lang))}
              speed={54 + (i % 3) * 14}
              dir={i % 2 ? 1 : -1}
              itemClassName="sk-item"
              watch={lang}
            />
          </div>
        ))}
      </div>
      <Ghost id="skills" />
    </section>
  );
}
