"use client";

// 顶部导航：左边是标识，右边依次是时钟、语言切换、终端入口、下载 PDF。
// 页面最上方那条细细的滚动进度条也在这里。
//
// 这是一个「受控」的展示组件：自己不保存语言等状态，
// 当前值和修改方法都由父组件（ResumeApp）通过 props 传进来（这叫「状态提升」）。

import { useRef } from "react";
import { RESUME, STRINGS } from "@/lib/data";
import { clamp } from "@/lib/fx";
import { pickLang } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import {
  Icon,
  scrollToSection,
  useClock,
  useFrame,
  useLayout,
  useMagnetic,
  useShortcutLabel,
} from "./effects";

export function TopBar({
  lang,
  onToggleLang,
  onOpenTerminal,
}: {
  lang: Lang;
  onToggleLang: () => void;
  onOpenTerminal: () => void;
}) {
  const now = useClock();
  // 固定显示深圳所在的时区（Asia/Shanghai），不管访客自己在哪个时区。
  // now 在挂载前是 null，这时显示占位符，保证和构建时渲染的 HTML 一致。
  const time = now
    ? now.toLocaleTimeString("en-GB", { hour12: false, timeZone: "Asia/Shanghai" })
    : "--:--:--";
  const shortcut = useShortcutLabel();
  const navRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const pdfRef = useMagnetic<HTMLAnchorElement>();
  const scroll = useRef({ max: 1, stuck: false });

  useLayout(() => {
    // 页面总共能滚多远 = 文档高度 - 视口高度
    scroll.current.max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }, []);

  useFrame((s) => {
    if (barRef.current) {
      barRef.current.style.transform = `scaleX(${clamp(s.y / scroll.current.max, 0, 1).toFixed(4)})`;
    }
    // 离开页面顶部后，给导航加上半透明底色，避免文字和后面的内容混在一起。
    const stuck = s.y > 24;
    if (stuck !== scroll.current.stuck) {
      scroll.current.stuck = stuck;
      navRef.current?.classList.toggle("is-stuck", stuck);
    }
  });

  const download = pickLang(STRINGS.download, lang);
  const shell = pickLang(STRINGS.shell, lang);

  return (
    <>
      <div className="progress" aria-hidden="true">
        <i ref={barRef} />
      </div>
      <header className="nav" ref={navRef}>
        <a
          className="brand"
          href="#hero"
          aria-label={pickLang(RESUME.hero.name, lang)}
          onClick={(event) => {
            event.preventDefault(); // 不让浏览器瞬间跳转，改成平滑滚动
            scrollToSection("hero");
          }}
        >
          <span className="brand-mark" aria-hidden="true">
            LJL
          </span>
          <span className="brand-txt" aria-hidden="true">
            {RESUME.meta.user}
          </span>
        </a>

        <div className="nav-actions">
          <p className="nav-clock" aria-hidden="true">
            SZX <b className="nowrap">{time}</b>
          </p>

          {/* 语言切换：当前语言用「加粗 + 下划线」标出，不只靠颜色区分。 */}
          <button
            type="button"
            className="nav-btn"
            onClick={onToggleLang}
            aria-label={`${pickLang(STRINGS.langSwitch, lang)} → ${lang === "zh" ? "English" : "中文"}`}
          >
            <span className={lang === "zh" ? "lang-opt is-on" : "lang-opt"}>ZH</span>
            <span className="lang-sep" aria-hidden="true">
              /
            </span>
            <span className={lang === "en" ? "lang-opt is-on" : "lang-opt"}>EN</span>
          </button>

          {/* 手机上只显示图标，所以用 aria-label 给按钮一个读得出来的名字。 */}
          <button
            type="button"
            className="nav-btn"
            onClick={onOpenTerminal}
            aria-haspopup="dialog"
            aria-label={shell}
          >
            <Icon name="terminal" />
            <span className="nav-btn-txt">{shell}</span>
            <kbd className="nav-kbd">{shortcut}</kbd>
          </button>

          {/* 下载的是 pnpm pdf 预先生成的一份干净的浅色文档（见 scripts/build-pdf.mjs），
              download 属性让浏览器直接下载并指定保存的文件名。 */}
          <a
            className="btn btn-solid"
            ref={pdfRef}
            href="/resume.pdf"
            download="李姜磊-简历.pdf"
            aria-label={download}
          >
            <Icon name="download" />
            <span className="btn-txt-long">{download}</span>
            <span className="btn-txt-short" aria-hidden="true">
              PDF
            </span>
          </a>
        </div>
      </header>
    </>
  );
}
