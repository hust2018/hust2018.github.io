"use client";

import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { FadeUp, SectionHead } from "./effects";
import type { Lang } from "@/lib/types";

export function Projects({ lang }: { lang: Lang }) {
  const items = RESUME.projects;
  return (
    <section className="section" id="projects">
      <SectionHead num="04" title={pickLang(STRINGS.projects, lang)} meta="// tree ~/projects" />
      <FadeUp>
        <div className="projects">
          {items.map((p, i) => (
            <div key={i} className="project">
              <div className="project-head">
                <span className="project-name">{p.name}</span>
                <span className="project-year">{p.year}</span>
              </div>
              <div className="project-desc">{pickLang(p.desc, lang)}</div>
              <div className="project-stack">
                {p.stack.map((t, j) => (
                  <span key={j} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <div className="project-meta">
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
