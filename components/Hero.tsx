"use client";

import { RESUME } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { GlitchText, Typewriter } from "./effects";
import { ImageSlot } from "./ImageSlot";
import type { Lang, MaybeLocalized } from "@/lib/types";

export function Hero({ lang, booted }: { lang: Lang; booted: boolean }) {
  const { hero, meta } = RESUME;
  const stats: { v: string; plus: boolean; k: MaybeLocalized }[] = [
    { v: hero.yearsExp, plus: true, k: { zh: "年经验", en: "yrs exp" } },
    { v: "24", plus: true, k: { zh: "项目", en: "projects" } },
    { v: "5.6k", plus: false, k: { zh: "GitHub ★", en: "GitHub ★" } },
    { v: "12", plus: false, k: { zh: "开源贡献", en: "OSS contrib" } },
  ];
  return (
    <section className="hero">
      <div className="hero-lines">
        <div className="hero-prompt">
          <span className="prompt">
            {meta.user}@{meta.host}
          </span>
          <span style={{ color: "var(--fg-mute)" }}>:</span>
          <span className="prompt-path">{meta.cwd}</span>
          <span style={{ color: "var(--fg-mute)" }}>$ </span>
          <span>cat about.md --format=human</span>
        </div>
        <h1 className="hero-name">
          <GlitchText text={pickLang(hero.name, lang)} />
        </h1>
        <div className="hero-role">
          <span className="arrow">▸</span>
          <Typewriter text={pickLang(hero.role, lang)} start={booted} />
          <span className="cursor"></span>
        </div>
        <p className="hero-tagline">{pickLang(hero.tagline, lang)}</p>
        <div className="hero-meta">
          <span>
            <span style={{ color: "var(--fg-mute)" }}>◉ </span>
            <b>{pickLang(hero.location, lang)}</b>
          </span>
          <span className="dotsep">│</span>
          <span className="status">
            <span className="live-dot"></span>
            {pickLang(hero.status, lang)}
          </span>
        </div>
        <div className="hero-stats">
          {stats.map((s, i) => (
            <div key={i} className="stat">
              <div className="v">
                {s.v}
                {s.plus && <span className="plus">+</span>}
              </div>
              <div className="k">{pickLang(s.k, lang)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-photo">
        <ImageSlot placeholder={lang === "zh" ? "把头像放到 public/avatar.jpg" : "drop photo in public/"} />
        <div className="hero-photo-label">ID_0001</div>
      </div>
    </section>
  );
}
