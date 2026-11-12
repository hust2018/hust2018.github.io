"use client";

// 「教育」：每段一行——时间、学校、学位。

import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { Ghost, SectionHeader, stagger } from "./effects";

export function Education({ lang }: { lang: Lang }) {
  return (
    <section className="sec" id="education" aria-labelledby="education-title" tabIndex={-1}>
      <div className="wrap">
        <SectionHeader id="education" title={pickLang(STRINGS.education, lang)} />
        <ul className="edu-list">
          {RESUME.education.map((item, i) => (
            <li className="edu-row" data-reveal style={stagger(i)} key={i}>
              {/* 外层 <li> 负责滚动出现，里层 .edu-in 负责悬停时右移一点：两个位移不打架。 */}
              <div className="edu-in">
                <p className="edu-date nowrap">{item.date}</p>
                <h3 className="edu-school">{pickLang(item.school, lang)}</h3>
                <p className="edu-degree">
                  {pickLang(item.degree, lang)}
                  {/* extra 是可选字段；没填时 && 的结果是假值，什么都不渲染。 */}
                  {item.extra && ` · ${pickLang(item.extra, lang)}`}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Ghost id="education" />
    </section>
  );
}
