"use client";

import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { FadeUp, SectionHead } from "./effects";
import type { Lang } from "@/lib/types";

export function Education({ lang }: { lang: Lang }) {
  const items = RESUME.education;
  return (
    <section className="section" id="education">
      <SectionHead num="05" title={pickLang(STRINGS.education, lang)} />
      <FadeUp>
        <div className="edu-list">
          {items.map((e, i) => (
            <div key={i} className="edu">
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
