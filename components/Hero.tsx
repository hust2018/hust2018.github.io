// "use client" 表示这是客户端组件（在浏览器里运行，能用交互和 Hook）。详见 ImageSlot.tsx 的说明。
"use client";

// RESUME：整份简历数据，来自 lib/data.ts。
import { RESUME } from "@/lib/data";
// pickLang(值, lang)：按当前语言从双语对象 { zh, en } 里取出对应文本的小工具。
import { pickLang } from "@/lib/i18n";
// 同目录 effects 里的两个动画文字组件：
//   - GlitchText：把文字渲染成带「故障/抖动」特效。
//   - Typewriter：把文字以「打字机」逐字出现的方式显示。
import { GlitchText, Typewriter } from "./effects";
// 头像位组件（有图显示图，无图显示占位文字）。
import { ImageSlot } from "./ImageSlot";
// 只导入类型 Lang（语言类型，如 "zh" | "en"），仅用于类型检查。
import type { Lang } from "@/lib/types";

// Hero 组件：渲染首屏。props 解构出两个属性：
//   - lang：当前语言，类型 Lang。
//   - booted：布尔值，表示页面「开机动画」是否已播完；用来控制打字机什么时候开始打字。
export function Hero({ lang, booted }: { lang: Lang; booted: boolean }) {
  // 从 RESUME 里同时解构出 hero（首屏相关数据）和 meta（命令行提示符里用到的用户名/主机名等）。
  const { hero, meta } = RESUME;
  return (
    // 首屏外层容器，className 配合全局 CSS 控制布局/样式。
    <section className="hero">
      <div className="hero-lines">
        {/* 这一块模仿命令行的提示符那一行，例如：user@host:~/path$ cat about.md --format=human */}
        <div className="hero-prompt">
          <span className="prompt">
            {/* 花括号里嵌入变量的值并拼接；中间的 @ 是普通文字，直接写在 JSX 里。 */}
            {meta.user}@{meta.host}
          </span>
          {/* style={{ ... }}：JSX 里写行内样式。外层花括号表示「嵌入 JS」，内层花括号是一个 JS 对象（样式键值对）。 */}
          {/* var(--fg-mute) 是引用全局 CSS 里定义的颜色变量。 */}
          <span style={{ color: "var(--fg-mute)" }}>:</span>
          <span className="prompt-path">{meta.cwd}</span>
          <span style={{ color: "var(--fg-mute)" }}>$ </span>
          <span>cat about.md --format=human</span>
        </div>
        {/* 姓名：<h1> 是页面主标题。用 GlitchText 渲染，文字内容由 pickLang 取当前语言的姓名。 */}
        <h1 className="hero-name">
          <GlitchText text={pickLang(hero.name, lang)} />
        </h1>
        <div className="hero-role">
          <span className="arrow">▸</span>
          {/* 打字机效果显示角色/职位。start={booted}：等开机动画播完（booted 为 true）才开始打字。 */}
          <Typewriter text={pickLang(hero.role, lang)} start={booted} />
          <span className="cursor"></span>
        </div>
        {/* 标语（一句话简介）。 */}
        <p className="hero-tagline">{pickLang(hero.tagline, lang)}</p>
        <div className="hero-meta">
          <span>
            <span style={{ color: "var(--fg-mute)" }}>◉ </span>
            {/* <b> 把所在地文字加粗显示。 */}
            <b>{pickLang(hero.location, lang)}</b>
          </span>
          <span className="dotsep">│</span>
          <span className="status">
            <span className="live-dot"></span>
            {pickLang(hero.status, lang)}
          </span>
        </div>
      </div>
      <div className="hero-photo">
        {/* 头像位。placeholder 是没有图片时显示的占位文字，这里用三元表达式按语言给不同提示： */}
        {/* 条件 ? 真时的值 : 假时的值 —— lang 是 "zh" 就给中文提示，否则给英文提示。 */}
        <ImageSlot src="/ljl.jpg" placeholder={lang === "zh" ? "把头像放到 public/avatar.jpg" : "drop photo in public/"} />
        <div className="hero-photo-label">ID_0001</div>
      </div>
    </section>
  );
}
