"use client";

import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { useClock } from "./effects";
import type { Lang } from "@/lib/types";

export function TopBar({
  lang,
  setLang,
  theme,
  setTheme,
  onPrint,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: string;
  setTheme: (t: string) => void;
  onPrint: () => void;
}) {
  const { meta } = RESUME;
  const now = useClock();
  // useClock 初值为 null（服务器端没时间），挂载前先显示占位，避免 hydration 不一致。
  const time = now ? now.toLocaleTimeString("en-GB", { hour12: false }) : "--:--:--";
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="dots">
          <span className="dot live"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div className="topbar-title">
          <span>
            <span className="label">SESSION:</span>{" "}
            <span className="val">
              {meta.user}@{meta.host}
            </span>
          </span>
          <span className="sep">│</span>
          <span>
            <span className="label">PATH:</span> <span className="val">{meta.cwd}</span>
          </span>
          <span className="sep">│</span>
          <span>
            <span className="label">TIME:</span> <span className="val accent">{time}</span>
          </span>
        </div>
        <div className="topbar-actions">
          <button
            className="icon-btn"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            title="Toggle language"
          >
            <span style={{ opacity: lang === "zh" ? 1 : 0.4 }}>ZH</span>
            <span style={{ color: "var(--fg-mute)" }}>/</span>
            <span style={{ opacity: lang === "en" ? 1 : 0.4 }}>EN</span>
          </button>
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Toggle theme"
          >
            {theme === "dark" ? "◐ DARK" : "◑ LIGHT"}
          </button>
          <button className="icon-btn" onClick={onPrint} title="Print / PDF">
            ⎙ {pickLang(STRINGS.print, lang)}
          </button>
        </div>
      </div>
    </header>
  );
}
