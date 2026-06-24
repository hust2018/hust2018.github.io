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
import { TopBar } from "@/components/TopBar";       // 顶部栏（切语言、打印）
import { Hero } from "@/components/Hero";            // 首屏大标题
import { About } from "@/components/About";          // 关于我
import { Skills } from "@/components/Skills";         // 技能
import { Experience } from "@/components/Experience"; // 工作经历
import { Terminal } from "@/components/Terminal";     // 交互式终端（替代原项目区）
import { Highlights } from "@/components/Highlights"; // 亮点 / 活动
import { Education } from "@/components/Education";    // 教育
import { Contact } from "@/components/Contact";       // 联系方式
import { SideRail } from "@/components/SideRail";      // 侧边导航条
// 只导入类型 Lang（语言类型，应该是 "zh" | "en" 之类的联合类型），编译后会被擦除。
import type { Lang } from "@/lib/types";

// 这是页面的主组件。文件放在 app/page.tsx 是 Next.js 的「约定」：
// app 目录下名为 page 的文件就代表一个页面，这里对应网站根路由「/」。
// export default 表示这是本文件默认导出的组件，Next 会自动把它当作该路由的页面来渲染。
export default function App() {
  // 语言：初始用默认值 "zh"（与服务器渲染一致），挂载后再从 localStorage 读偏好。
  // 关键点：这里故意用固定默认值而不是直接读 localStorage——
  // 因为服务器端没有 localStorage，若浏览器一上来就用 localStorage 的值，
  // 会导致服务器渲染结果和浏览器首次渲染结果不一致（hydration 不匹配）。
  // 正确做法是：先用和服务器一致的默认值渲染，等水合完成后（下面的 useEffect 里）再读偏好覆盖。
  // （主题固定为深色 dark，不再提供深/浅切换；data-theme="dark" 由 app/layout.tsx 静态写死。）
  const [lang, setLang] = useState<Lang>("zh");
  // 开机动画：本次会话首次进入才播放。booted 表示「是否已经过了开机动画」。
  const [booted, setBooted] = useState(false);

  // 挂载后读取用户上次的偏好，避免 SSR/首屏 hydration 不一致。
  // 空依赖数组 []，所以这段只在组件首次挂载（已经到浏览器）后执行一次。
  useEffect(() => {
    // localStorage：浏览器提供的「持久化键值存储」，数据会一直留着（除非主动清除），
    // 关掉浏览器再打开也还在。这里读出上次保存的语言。
    const savedLang = localStorage.getItem("resume-lang");
    if (savedLang === "zh" || savedLang === "en") setLang(savedLang);
    // sessionStorage：和 localStorage 类似，但只在「当前会话（标签页）」有效，关掉标签页就清空。
    // 用它记录本次会话是否已经播放过开机动画，避免在站内切换/刷新时反复播放。
    if (sessionStorage.getItem("resume-booted") === "1") setBooted(true);
  }, []);

  // 语言变化时写回 localStorage。
  // 依赖数组里放了 lang，所以每当 lang 变化，这个 effect 就重跑一次，把新值存起来。
  useEffect(() => {
    localStorage.setItem("resume-lang", lang);
  }, [lang]);

  // 把当前语言同步到 <html lang> 上（对无障碍/SEO 友好）。
  // 主题、风格、强调色等都固定为默认值，已由 app/layout.tsx 的静态属性
  // （data-theme="dark" 等）和 globals.css 的 :root 提供，这里不再动态切换。
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    // 依赖数组：lang 变化时，重新同步到 <html>。
  }, [lang]);

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
      {/* 顶部栏。把语言的「当前值」和「修改函数」传下去，
          子组件就能读取并通过 setter 反过来修改父组件的状态（这叫状态提升 + 受控）。 */}
      <TopBar
        lang={lang}
        setLang={setLang}
        // onPrint：点击打印按钮时调用。window.print() 是浏览器 API，会弹出系统打印对话框。
        onPrint={() => window.print()}
      />
      <div className="app">
        {/* 装饰用的扫描光带特效 */}
        <div className="scan-sweep"></div>
        {/* 把当前语言 lang 作为 prop 传给每个区块，让它们显示中文或英文内容。
            Hero 还额外需要知道开机动画是否结束（booted）以决定何时开始打字等。 */}
        <Hero lang={lang} booted={booted} />
        <About lang={lang} />
        <Skills lang={lang} />
        <Experience lang={lang} />
        <Terminal lang={lang} />
        <Highlights lang={lang} />
        <Education lang={lang} />
        <Contact lang={lang} />
      </div>
      <SideRail lang={lang} />
    </>
  );
}
