// 客户端组件。
"use client";

import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { FadeUp, SectionHead } from "./effects";
import type { Lang } from "@/lib/types";

// 「教育」区块：和 Projects 结构几乎一样的纯展示组件。
export function Education({ lang }: { lang: Lang }) {
  // 取出教育经历数组。
  const items = RESUME.education;
  return (
    <section className="section" id="education">
      {/* 这个区块没有右侧 meta，所以只传 num 和 title 两个 prop */}
      <SectionHead num="05" title={pickLang(STRINGS.education, lang)} />
      <FadeUp>
        <div className="edu-list">
          {/* 遍历每条教育经历渲染一行 */}
          {items.map((e, i) => (
            <div key={i} className="edu">
              {/* date 是纯字符串，school/degree/extra 是双语对象，需要 pickLang */}
              <div className="date">{e.date}</div>
              <div>
                <div className="school">{pickLang(e.school, lang)}</div>
                <div className="degree">{pickLang(e.degree, lang)}</div>
              </div>
              <div className="extra">{pickLang(e.extra, lang)}</div>
            </div>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}
