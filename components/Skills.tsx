"use client";

import { Fragment } from "react";
import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { FadeUp, SectionHead } from "./effects";
import type { Lang } from "@/lib/types";

export function Skills({ lang }: { lang: Lang }) {
  const skills = RESUME.skills;
  return (
    <section className="section" id="skills">
      <SectionHead num="02" title={pickLang(STRINGS.skills, lang)} meta="// ls ~/skills" />
      <FadeUp>
        <div className="skills-grid">
          {skills.map((s, i) => (
            <Fragment key={i}>
              <div className="skill-cat">{pickLang(s.cat, lang)}</div>
              <div className="skill-chips">
                {s.items.map((it, j) => (
                  <span key={j} className="chip">
                    {pickLang(it, lang)}
                  </span>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}
