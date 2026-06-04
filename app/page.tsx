// "use client"：声明本文件是「客户端组件」。
// 这个页面用到了 useState/useEffect、点击事件、localStorage、window.print 等浏览器能力，
// 必须运行在浏览器里，所以不能用默认的服务器组件，得在顶部写这一行。
// （服务器组件 vs 客户端组件的区别详见 components/effects.tsx 顶部的说明。）
"use client";

// 导入两个 Hook：useState 管理会变化的数据，useEffect 处理渲染后的副作用。
import { useEffect, useState } from "react";
// 下面这一批是页面要用到的各个「区块组件」。
// @/ 是项目配置的路径别名，等价于「从项目根目录开始找」，省得写一长串 ../../。
import { BootSequence } from "@/components/BootSequence"; // 开机动画
import { TopBar } from "@/components/TopBar";       // 顶部栏（切语言/主题、打印）
import { Hero } from "@/components/Hero";            // 首屏大标题
import { About } from "@/components/About";          // 关于我
import { Skills } from "@/components/Skills";         // 技能
import { Experience } from "@/components/Experience"; // 工作经历
import { Projects } from "@/components/Projects";     // 项目
import { Education } from "@/components/Education";    // 教育
import { Contact } from "@/components/Contact";       // 联系方式
import { SideRail } from "@/components/SideRail";      // 侧边导航条
// 从设置面板模块里一次性导入多个具名导出：面板本体、分组、单选、开关、配色、以及管理设置的自定义 Hook。
import {
  TweaksPanel,
  TweakSection,
  TweakRadio,
  TweakToggle,
  TweakColor,
  useTweaks,
} from "@/components/TweaksPanel";
// 只导入类型 Lang（语言类型，应该是 "zh" | "en" 之类的联合类型），编译后会被擦除。
import type { Lang } from "@/lib/types";

// 每种风格对应的一组可选 accent 配色。
// 这是一个普通常量对象（写在组件外面，整个模块只创建一次，不随渲染重复创建）。
// 类型 Record<string, string[]> 表示：键是字符串，值是「字符串数组」（即一组颜色）。
const accentByVariant: Record<string, string[]> = {
  terminal: ["#5ad8ff", "#a78bfa", "#4ade80", "#ff4dcb"],
  ide: ["#7aa2f7", "#bb9af7", "#7dcfff", "#e0af68"],
  paper: ["#b85c2e", "#2c5a7e", "#6b8e4e", "#9a7b1f"],
};

// 这是页面的主组件。文件放在 app/page.tsx 是 Next.js 的「约定」：
// app 目录下名为 page 的文件就代表一个页面，这里对应网站根路由「/」。
// export default 表示这是本文件默认导出的组件，Next 会自动把它当作该路由的页面来渲染。
export default function App() {
  // 风格类设置（持久化到 localStorage）。
  // useTweaks 是自定义 Hook：传入一组默认设置，返回 [当前设置对象 t, 修改某项的函数 setTweak]。
  // 内部会把这些设置存到 localStorage，从而刷新页面后还记得用户的选择。
  const [t, setTweak] = useTweaks({
    variant: "terminal",   // 整体风格
    accent: "#5ad8ff",     // 主题强调色
    scanSweep: true,       // 扫描光带特效
    crtScanlines: false,   // CRT 扫描线特效
    blinkCursor: true,     // 光标闪烁
  });

  // 语言、主题：初始用默认值（与服务器渲染一致），挂载后再从 localStorage 读。
  // 关键点：这里故意用固定默认值 "zh"/"dark" 而不是直接读 localStorage——
  // 因为服务器端没有 localStorage，若浏览器一上来就用 localStorage 的值，
  // 会导致服务器渲染结果和浏览器首次渲染结果不一致（hydration 不匹配）。
  // 正确做法是：先用和服务器一致的默认值渲染，等水合完成后（下面的 useEffect 里）再读偏好覆盖。
  // useState<Lang> 的 <Lang> 是给状态指定 TypeScript 类型。
  const [lang, setLang] = useState<Lang>("zh");
  const [theme, setTheme] = useState("dark");
  // 开机动画：本次会话首次进入才播放。booted 表示「是否已经过了开机动画」。
  const [booted, setBooted] = useState(false);

  // 挂载后读取用户上次的偏好，避免 SSR/首屏 hydration 不一致。
  // 空依赖数组 []，所以这段只在组件首次挂载（已经到浏览器）后执行一次。
  useEffect(() => {
    // localStorage：浏览器提供的「持久化键值存储」，数据会一直留着（除非主动清除），
    // 关掉浏览器再打开也还在。这里读出上次保存的语言。
    const savedLang = localStorage.getItem("resume-lang");
    if (savedLang === "zh" || savedLang === "en") setLang(savedLang);
    const savedTheme = localStorage.getItem("resume-theme");
    if (savedTheme) setTheme(savedTheme);
    // sessionStorage：和 localStorage 类似，但只在「当前会话（标签页）」有效，关掉标签页就清空。
    // 用它记录本次会话是否已经播放过开机动画，避免在站内切换/刷新时反复播放。
    if (sessionStorage.getItem("resume-booted") === "1") setBooted(true);
  }, []);

  // 语言/主题变化时写回 localStorage。
  // 依赖数组里放了 lang，所以每当 lang 变化，这个 effect 就重跑一次，把新值存起来。
  useEffect(() => {
    localStorage.setItem("resume-lang", lang);
  }, [lang]);
  useEffect(() => {
    localStorage.setItem("resume-theme", theme);
  }, [theme]);

  // 把风格/主题/配色应用到 <html> 上（CSS 靠这些属性和变量切换外观）。
  useEffect(() => {
    // document.documentElement 就是页面最外层的 <html> 元素。
    const html = document.documentElement;
    // setAttribute 给 <html> 设置 data-* 属性；globals.css 里用这些属性选择器来切换整套配色/特效。
    html.setAttribute("data-variant", t.variant);
    html.setAttribute("data-theme", theme);
    html.setAttribute("data-blink", t.blinkCursor ? "on" : "off");
    html.setAttribute("data-crt", t.crtScanlines ? "on" : "off");
    // setProperty 设置 CSS 自定义属性（变量）。--accent 是强调色，CSS 各处通过 var(--accent) 引用它。
    html.style.setProperty("--accent", t.accent);
    // 颜色后面拼 "33" 是把它变成半透明版本（十六进制颜色加上 alpha 透明度，33 约等于 20% 不透明）。
    html.style.setProperty("--accent-soft", t.accent + "33");
    // 同步 <html lang>，对无障碍/SEO 友好。
    html.lang = lang === "zh" ? "zh-CN" : "en";
    // 依赖数组列出所有用到的值：其中任意一项变化，就重新把外观应用到 <html>。
  }, [t.variant, theme, t.blinkCursor, t.crtScanlines, t.accent, lang]);

  return (
    // <>...</> 是 Fragment：组件必须返回单一根节点，用它把多个顶层元素打包又不额外生成标签。
    <>
      {/* 条件渲染：只有还没开机（!booted 为真）时才渲染开机动画组件。
          注意 JSX 里的注释必须用 {/* ... *​/} 这种花括号包裹的形式，不能用 // 。 */}
      {!booted && (
        <BootSequence
          lang={lang}
          // onDone 是传给子组件的「回调函数」prop：动画播完后子组件会调用它。
          // 这里用箭头函数定义：标记已开机，并把状态存进 sessionStorage 防止本会话重复播放。
          onDone={() => {
            setBooted(true);
            sessionStorage.setItem("resume-booted", "1");
          }}
        />
      )}
      {/* 顶部栏。把语言/主题的「当前值」和「修改函数」一起传下去，
          子组件就能读取并通过这些 setter 反过来修改父组件的状态（这叫状态提升 + 受控）。 */}
      <TopBar
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        // onPrint：点击打印按钮时调用。window.print() 是浏览器 API，会弹出系统打印对话框。
        onPrint={() => window.print()}
      />
      <div className="app">
        {/* 开启扫描光带特效时才渲染这个装饰用的空 div */}
        {t.scanSweep && <div className="scan-sweep"></div>}
        {/* 把当前语言 lang 作为 prop 传给每个区块，让它们显示中文或英文内容。
            Hero 还额外需要知道开机动画是否结束（booted）以决定何时开始打字等。 */}
        <Hero lang={lang} booted={booted} />
        <About lang={lang} />
        <Skills lang={lang} />
        <Experience lang={lang} />
        <Projects lang={lang} />
        <Education lang={lang} />
        <Contact lang={lang} />
      </div>
      <SideRail lang={lang} />

      {/* 右下角的设置面板。下面这些子组件都是「受控组件」：
          它们自己不存状态，而是通过 value 显示当前值、通过 onChange 把新值回传给这里去改状态。 */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Style variant">
          <TweakRadio
            label="Theme"
            value={t.variant}
            // options 是一个对象数组，作为单选项列表传入（每项含 value 和显示用的 label）。
            options={[
              { value: "terminal", label: "Terminal" },
              { value: "ide", label: "IDE Dark" },
              { value: "paper", label: "Paper" },
            ]}
            // 选中某风格时：先更新 variant，再把强调色重置为该风格配色数组的第 0 个（默认色）。
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
            // 可选颜色 = 当前风格对应的那组配色；用 || 兜底：万一查不到就退回 terminal 那组。
            options={accentByVariant[t.variant] || accentByVariant.terminal}
            onChange={(v) => setTweak("accent", v)}
          />
        </TweakSection>
        <TweakSection label="Details">
          {/* 三个开关，分别控制三种特效；value 给出当前开/关，onChange 把新值写回设置。 */}
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
