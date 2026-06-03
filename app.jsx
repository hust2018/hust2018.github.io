/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakColor */
const { useState, useEffect } = React;

function App() {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "variant": "terminal",
    "accent": "#5ad8ff",
    "scanSweep": true,
    "crtScanlines": false,
    "blinkCursor": true
  }/*EDITMODE-END*/;

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLang] = useState(() => localStorage.getItem("resume-lang") || "zh");
  const [theme, setTheme] = useState(() => localStorage.getItem("resume-theme") || "dark");
  // Boot sequence — only on first load of a session
  const [booted, setBooted] = useState(() => sessionStorage.getItem("resume-booted") === "1");

  // Persist lang / theme
  useEffect(() => { localStorage.setItem("resume-lang", lang); }, [lang]);
  useEffect(() => { localStorage.setItem("resume-theme", theme); }, [theme]);

  // Apply variant / theme / blink to html
  useEffect(() => {
    document.documentElement.setAttribute("data-variant", t.variant);
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-blink", t.blinkCursor ? "on" : "off");
    document.documentElement.setAttribute("data-crt", t.crtScanlines ? "on" : "off");
    document.documentElement.style.setProperty("--accent", t.accent);
    // Recompute --accent-soft so hover backgrounds match the picked accent
    document.documentElement.style.setProperty("--accent-soft", t.accent + "33");
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [t.variant, theme, t.blinkCursor, t.crtScanlines, t.accent, lang]);

  // Accent palette swatches per variant
  const accentByVariant = {
    terminal: ["#5ad8ff", "#a78bfa", "#4ade80", "#ff4dcb"],
    ide:      ["#7aa2f7", "#bb9af7", "#7dcfff", "#e0af68"],
    paper:    ["#b85c2e", "#2c5a7e", "#6b8e4e", "#9a7b1f"],
  };

  return (
    <>
      {!booted && (
        <window.BootSequence
          lang={lang}
          onDone={() => { setBooted(true); sessionStorage.setItem("resume-booted", "1"); }}
        />
      )}
      <window.TopBar
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onPrint={() => window.print()}
      />
      <div className="app">
        {t.scanSweep && <div className="scan-sweep"></div>}
        <window.Hero lang={lang} booted={booted} />
        <window.About lang={lang} />
        <window.Skills lang={lang} />
        <window.Experience lang={lang} />
        <window.Projects lang={lang} />
        <window.Education lang={lang} />
        <window.Contact lang={lang} />
      </div>
      <window.SideRail lang={lang} />

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

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
