// "use client"：声明本文件是「客户端组件」。
// 这个组件用到了 useState/useEffect、点击事件、localStorage、sessionStorage 等浏览器能力，
// 必须运行在浏览器里，所以不能用默认的服务器组件，得在顶部写这一行。
// （服务器组件 vs 客户端组件的区别详见 components/effects.tsx 顶部的说明。）
//
// 为什么把简历主体从 app/page.tsx 搬到这里？
//   app/page.tsx 现在改成了「服务器组件」，好在「构建期」读取最新文章列表（读文件系统只能在服务器侧做）。
//   但简历主体需要 localStorage / 状态等浏览器能力，必须是客户端组件——两者职责冲突。
//   解决办法：服务器组件 app/page.tsx 负责取数据，把简历主体（本组件）当作子组件渲染，
//   并通过 prop 把构建期才拿得到的「最新文章」传进来。这就是「服务器拿数据、客户端管交互」的经典分工。
"use client";

// 导入两个 Hook：useState 管理会变化的数据，useEffect 处理渲染后的副作用。
import { useEffect, useState } from "react";
// 下面这一批是页面要用到的各个「区块组件」。
// @/ 是项目配置的路径别名，等价于「从项目根目录开始找」，省得写一长串 ../../。
import { BootSequence } from "@/components/BootSequence"; // 开机动画
import { TopBar } from "@/components/TopBar";       // 顶部栏（切语言、博客、下载 PDF）
import { Hero } from "@/components/Hero";            // 首屏大标题
import { About } from "@/components/About";          // 关于我
import { Skills } from "@/components/Skills";         // 技能
import { Experience } from "@/components/Experience"; // 工作经历
import { Terminal } from "@/components/Terminal";     // 交互式终端（替代原项目区）
import { Highlights } from "@/components/Highlights"; // 亮点 / 活动
import { Education } from "@/components/Education";    // 教育
import { Contact } from "@/components/Contact";       // 联系方式
import { SideRail } from "@/components/SideRail";      // 侧边导航条
import { LatestPosts } from "@/components/blog/LatestPosts"; // 首页底部「最新文章」区块
// 只导入类型 Lang（语言类型 "zh" | "en"）和 PostMeta（文章元信息），编译后会被擦除。
import type { Lang } from "@/lib/types";
import type { PostMeta } from "@/lib/posts";

// 简历主体组件。它接收一个 prop：latest = 最新若干篇文章（由服务器组件在构建期算好传入）。
// 注意这里不再是 default export，而是「具名导出」：app/page.tsx 会按名字 { ResumeApp } 来引入它。
export function ResumeApp({ latest }: { latest: PostMeta[] }) {
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
      <TopBar lang={lang} setLang={setLang} />
      <div className="app">
        {/* 装饰用的扫描光带特效 */}
        <div className="scan-sweep"></div>
        {/* 把当前语言 lang 作为 prop 传给每个区块，让它们显示中文或英文内容。
            Hero 还额外需要知道开机动画是否结束（booted）以决定何时开始打字等。 */}
        <Hero lang={lang} booted={booted} />
        <About lang={lang} />
        <Terminal lang={lang} />
        <Skills lang={lang} />
        <Experience lang={lang} />
        <Highlights lang={lang} />
        <Education lang={lang} />
        <Contact lang={lang} />
        {/* 最新文章区块：放在 Contact 之后、侧边栏之前。数据是构建期注入的 latest（可能为空）。
            它不依赖界面语言，所以不用传 lang——为空时组件内部会自动什么都不渲染。 */}
        <LatestPosts posts={latest} />
      </div>
      <SideRail lang={lang} />
    </>
  );
}
