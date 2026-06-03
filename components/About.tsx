"use client";

import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { FadeUp, FormattedBold, SectionHead } from "./effects";
import type { Lang } from "@/lib/types";

export function About({ lang }: { lang: Lang }) {
  const paras = RESUME.about[lang];
  return (
    <section className="section about" id="about">
      <SectionHead num="01" title={pickLang(STRINGS.about, lang)} meta="// cat about.md" />
      <FadeUp>
        {paras.map((p, i) => (
          <p key={i}>
            <FormattedBold text={p} />
          </p>
        ))}
      </FadeUp>
    </section>
  );
}
