"use client";

import { useEffect, useState } from "react";
import { BootSequence } from "@/components/BootSequence";
import { TopBar } from "@/components/TopBar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Education } from "@/components/Education";
import { Contact } from "@/components/Contact";
import { SideRail } from "@/components/SideRail";
import {
  TweaksPanel,
  TweakSection,
  TweakRadio,
  TweakToggle,
  TweakColor,
  useTweaks,
} from "@/components/TweaksPanel";
import type { Lang } from "@/lib/types";

// 每种风格对应的一组可选 accent 配色。
const accentByVariant: Record<string, string[]> = {
  terminal: ["#5ad8ff", "#a78bfa", "#4ade80", "#ff4dcb"],
  ide: ["#7aa2f7", "#bb9af7", "#7dcfff", "#e0af68"],
  paper: ["#b85c2e", "#2c5a7e", "#6b8e4e", "#9a7b1f"],
};

export default function App() {
  // 风格类设置（持久化到 localStorage）。
  const [t, setTweak] = useTweaks({
    variant: "terminal",
    accent: "#5ad8ff",
    scanSweep: true,
    crtScanlines: false,
    blinkCursor: true,
  });

  // 语言、主题：初始用默认值（与服务器渲染一致），挂载后再从 localStorage 读。
  const [lang, setLang] = useState<Lang>("zh");
  const [theme, setTheme] = useState("dark");
  // 开机动画：本次会话首次进入才播放。
  const [booted, setBooted] = useState(false);

  // 挂载后读取用户上次的偏好，避免 SSR/首屏 hydration 不一致。
  useEffect(() => {
    const savedLang = localStorage.getItem("resume-lang");
    if (savedLang === "zh" || savedLang === "en") setLang(savedLang);
    const savedTheme = localStorage.getItem("resume-theme");
    if (savedTheme) setTheme(savedTheme);
    if (sessionStorage.getItem("resume-booted") === "1") setBooted(true);
  }, []);

  // 语言/主题变化时写回 localStorage。
  useEffect(() => {
    localStorage.setItem("resume-lang", lang);
  }, [lang]);
  useEffect(() => {
    localStorage.setItem("resume-theme", theme);
  }, [theme]);

  // 把风格/主题/配色应用到 <html> 上（CSS 靠这些属性和变量切换外观）。
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-variant", t.variant);
    html.setAttribute("data-theme", theme);
    html.setAttribute("data-blink", t.blinkCursor ? "on" : "off");
    html.setAttribute("data-crt", t.crtScanlines ? "on" : "off");
    html.style.setProperty("--accent", t.accent);
    html.style.setProperty("--accent-soft", t.accent + "33");
    html.lang = lang === "zh" ? "zh-CN" : "en";
  }, [t.variant, theme, t.blinkCursor, t.crtScanlines, t.accent, lang]);

  return (
    <>
      {!booted && (
        <BootSequence
          lang={lang}
          onDone={() => {
            setBooted(true);
            sessionStorage.setItem("resume-booted", "1");
          }}
        />
      )}
      <TopBar
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onPrint={() => window.print()}
      />
      <div className="app">
        {t.scanSweep && <div className="scan-sweep"></div>}
        <Hero lang={lang} booted={booted} />
        <About lang={lang} />
        <Skills lang={lang} />
        <Experience lang={lang} />
        <Projects lang={lang} />
        <Education lang={lang} />
        <Contact lang={lang} />
      </div>
      <SideRail lang={lang} />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Style variant">
          <TweakRadio
            label="Theme"
            value={t.variant}
            options={[
              { value: "terminal", label: "Terminal" },
              { value: "ide", label: "IDE Dark" },
              { value: "paper", label: "Paper" },
            ]}
            onChange={(v) => {
              setTweak("variant", v);
              setTweak("accent", accentByVariant[v][0]);
            }}
          />
        </TweakSection>
        <TweakSection label="Accent">
          <TweakColor
            label="Color"
            value={t.accent}
            options={accentByVariant[t.variant] || accentByVariant.terminal}
            onChange={(v) => setTweak("accent", v)}
          />
        </TweakSection>
        <TweakSection label="Details">
          <TweakToggle
            label="Scanline sweep"
            value={t.scanSweep}
            onChange={(v) => setTweak("scanSweep", v)}
          />
          <TweakToggle
            label="Blinking cursor"
            value={t.blinkCursor}
            onChange={(v) => setTweak("blinkCursor", v)}
          />
          <TweakToggle
            label="CRT scanlines (terminal+dark)"
            value={t.crtScanlines}
            onChange={(v) => setTweak("crtScanlines", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}
