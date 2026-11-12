// "use client"：声明本文件是「客户端组件」。
// 这个组件用到了 useState/useEffect、键盘事件、localStorage 等浏览器能力，必须运行在浏览器里。
// （服务器组件 vs 客户端组件的区别详见 components/effects.tsx 顶部的说明。）
"use client";

// 简历首页的「总装」组件：它拥有整页的状态，并把各个区块按顺序拼起来。
//
// 状态都集中在这里，区块组件只负责展示：
//   lang        当前语言（"zh" | "en"）
//   live        开场是否结束——结束后首屏内容才出场
//   introGone   开场遮罩是否已经撤掉
//   fromIntro   这次是否真的播放过开场（决定名字是「原地显现」还是「滑入」）
//   termOpen    终端面板是否打开
//   wipe        语言切换时那块擦除幕布的状态
//
// 数据往下流（props），事件往上传（回调）——这是 React 最常见的组织方式。

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SECTIONS, STRINGS } from "@/lib/data";
import { clamp } from "@/lib/fx";
import { pickLang } from "@/lib/i18n";
import { getFrameState, requestLayout, syncScroll } from "@/lib/ticker";
import type { Lang } from "@/lib/types";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { CursorRing } from "@/components/CursorRing";
import { Education } from "@/components/Education";
import { Experience } from "@/components/Experience";
import { Hero } from "@/components/Hero";
import { Highlights } from "@/components/Highlights";
import { Intro } from "@/components/Intro";
import { ParticleField } from "@/components/ParticleField";
import type { FieldHandle } from "@/components/ParticleField";
import { SideRail } from "@/components/SideRail";
import { Skills } from "@/components/Skills";
import { Terminal } from "@/components/Terminal";
import { TopBar } from "@/components/TopBar";
import { Icon, scrollToSection, useReveal } from "@/components/effects";

type Anchor = { id: string | null; ratio: number };

// 具名导出：app/page.tsx 会按名字 { ResumeApp } 来引入它。
export function ResumeApp() {
  // 语言：初始用固定默认值 "zh"（和构建时渲染的 HTML 一致），挂载后再从 localStorage 读偏好。
  // 关键点：构建时没有 localStorage，如果浏览器一上来就用它的值，
  // 两边首次渲染的结果会不一致（hydration 不匹配）。所以先用默认值渲染，再在 useEffect 里覆盖。
  const [lang, setLang] = useState<Lang>("zh");
  const [live, setLive] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const [fromIntro, setFromIntro] = useState(false);
  const [termOpen, setTermOpen] = useState(false);
  const [wipe, setWipe] = useState<"" | "cover" | "leave">("");

  const rootRef = useRef<HTMLDivElement>(null);
  const field = useRef<FieldHandle | null>(null); // 粒子场交出来的「遥控器」，给开场动画用
  const switching = useRef(false);
  const anchor = useRef<Anchor | null>(null);

  // 给 <html> 加上 fx（启用出场动画）或 rm（减少动态效果）。
  // 用 useLayoutEffect 而不是 useEffect：它在浏览器绘制之前执行，
  // 这样「先把内容藏好、再播放出场动画」不会闪一下。
  // 之所以不直接把 class 写进 HTML，是为了在没有 JavaScript 时内容依然全部可见。
  useLayoutEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const name = reduced || !("IntersectionObserver" in window) ? "rm" : "fx";
    root.classList.add(name);
    return () => root.classList.remove(name);
  }, []);

  // 挂载后读取上次保存的语言偏好。
  useEffect(() => {
    try {
      const saved = localStorage.getItem("resume-lang");
      if (saved === "zh" || saved === "en") setLang(saved);
    } catch {
      // 隐私模式下 localStorage 可能不可用：用默认语言即可。
    }
  }, []);

  // 语言变化时：写回 localStorage，并同步到 <html lang>（对读屏软件和 SEO 友好，CSS 也靠它选中文字体）。
  useEffect(() => {
    try {
      localStorage.setItem("resume-lang", lang);
    } catch {
      // 存不进去不影响使用。
    }
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  // 切换语言后恢复阅读位置。
  // 中英文长度不同，同一个滚动距离对应的内容会变；所以切换前记下「在哪个区块、看到它的百分之几」，
  // 切换后按同样的比例滚回去。父组件的 effect 在所有子组件的 effect 之后执行，
  // 这时各区块已经按新语言排好版了。
  useEffect(() => {
    const saved = anchor.current;
    if (!saved) return;
    anchor.current = null;
    if (saved.id) {
      const el = document.getElementById(saved.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        window.scrollTo(0, Math.round(rect.top + window.scrollY + saved.ratio * rect.height));
      }
    }
    syncScroll();
    requestLayout();
  }, [lang]);

  // 滚动出现的效果：语言切换后会有新元素，所以把 lang 放进依赖里重新扫描一遍。
  useReveal(rootRef, [lang, live]);

  // 记下当前的阅读位置，然后切换语言。
  const applyLang = (next: Lang) => {
    let current: HTMLElement | null = null;
    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el && el.getBoundingClientRect().top <= 1) current = el;
    }
    if (current) {
      const rect = current.getBoundingClientRect();
      anchor.current = { id: current.id, ratio: clamp(-rect.top / Math.max(1, rect.height), 0, 1) };
    } else {
      anchor.current = { id: null, ratio: 0 };
    }
    setLang(next);
  };

  // 带「擦除转场」的语言切换：幕布从下盖上来 → 换内容 → 幕布向上离开。
  const toggleLang = () => {
    const next: Lang = lang === "zh" ? "en" : "zh";
    if (switching.current) return; // 转场还没结束时忽略重复点击
    if (!live || getFrameState().reduced) {
      applyLang(next);
      return;
    }
    switching.current = true;
    setWipe("cover");
    window.setTimeout(() => {
      applyLang(next);
      // 等两帧，让新内容先渲染出来，再让幕布离开。
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          setWipe("leave");
          window.setTimeout(() => {
            setWipe("");
            switching.current = false;
          }, 380);
        }),
      );
    }, 290);
  };

  // 全局快捷键：⌘K / Ctrl K，或者 ` 键，开关终端面板。
  useEffect(() => {
    if (!live) return; // 开场期间不响应
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      const typing = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        setTermOpen((open) => !open);
      } else if (key === "`" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setTermOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    // 清理函数：依赖变化或组件卸载时移除监听，避免重复注册。
    return () => window.removeEventListener("keydown", onKey);
  }, [live]);

  // 外层的 class 决定首屏的出场方式，globals.css 里有对应的选择器。
  const className = ["site", live ? "is-live" : "", fromIntro ? "from-intro" : ""].filter(Boolean).join(" ");

  return (
    <div className={className} ref={rootRef}>
      {/* 「跳到正文」：平时看不见，键盘用户按第一下 Tab 时出现，回车就能跳过导航。 */}
      <a className="skip-link" href="#main">
        {pickLang(STRINGS.skip, lang)}
      </a>

      <ParticleField front={!introGone} handle={field} />

      {/* 条件渲染：开场遮罩撤掉之后，这个组件就从页面上移除。 */}
      {!introGone && (
        <Intro
          lang={lang}
          field={field}
          onReveal={(played) => {
            setFromIntro(played);
            setLive(true);
          }}
          onGone={() => setIntroGone(true)}
        />
      )}

      <div className={wipe ? `wipe ${wipe}` : "wipe"} aria-hidden="true" />
      <CursorRing />

      <TopBar lang={lang} onToggleLang={toggleLang} onOpenTerminal={() => setTermOpen(true)} />
      <SideRail lang={lang} />

      <main id="main" tabIndex={-1}>
        <Hero lang={lang} live={live} />
        <About lang={lang} />
        <Experience lang={lang} />
        <Skills lang={lang} />
        <Highlights lang={lang} />
        <Education lang={lang} />
        <Contact lang={lang} />
      </main>

      <footer className="footer">
        <div className="wrap footer-in">
          <p>© 李姜磊 · Jianglei Li</p>
          <p>www.lijianglei.com</p>
          <a
            className="footer-top"
            href="#hero"
            onClick={(event) => {
              event.preventDefault();
              scrollToSection("hero");
            }}
          >
            <span>{pickLang(STRINGS.backTop, lang)}</span>
            <Icon name="arrowUp" />
          </a>
        </div>
      </footer>

      {/* 终端里的 lang 命令直接切换语言，不走擦除转场（面板本身盖在页面上）。 */}
      <Terminal
        lang={lang}
        open={termOpen}
        onClose={() => setTermOpen(false)}
        onToggleLang={() => applyLang(lang === "zh" ? "en" : "zh")}
      />
    </div>
  );
}
