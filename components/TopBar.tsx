// "use client" 是 Next.js 的指令：标明这个文件是「客户端组件」。
// Next.js 默认会在服务器上渲染组件（更快、利于 SEO），但用到浏览器能力
// （useState/useEffect、事件、计时器、localStorage 等）的组件必须加这行，
// 让它能在浏览器里运行。本项目里这些交互组件都带有 "use client"。
"use client";

// 从项目的数据文件里导入：RESUME = 简历内容，STRINGS = 界面固定文案（双语）。
// @ 是路径别名，指向项目根目录（在 tsconfig 里配置），所以 @/lib/data 就是 /lib/data.ts。
import { RESUME, STRINGS } from "@/lib/data";
// pickLang(双语对象, lang)：按当前语言从 { zh, en } 里取出对应那条文本。
import { pickLang } from "@/lib/i18n";
// urlFor：把站内路径变成「绝对 + 结尾带斜杠」的规范 URL；博客链接走它，和全站 URL 形态保持一致。
import { urlFor } from "@/lib/site";
// useClock 是本项目自定义的 Hook（在 effects.tsx 里），返回每秒更新的当前时间。
import { useClock } from "./effects";
// 只导入类型用 `import type`，编译成 JS 时这行会被完全擦除，不影响运行。
// Lang 是 "zh" | "en" 这种联合类型，限定 lang 只能是这两个值之一。
import type { Lang } from "@/lib/types";

// TopBar 是一个「函数组件」：一个返回 JSX（界面）的普通函数。
// 大括号里的 { lang, setLang, onPrint } 是「解构 props」：父组件传进来的参数。
// 这里体现了 React 的父子通信：
//   - lang 是父组件持有的「状态」，作为只读数据传下来给子组件显示；
//   - setLang 是父组件传下来的「回调函数」，子组件点击按钮时
//     调用它，就能反过来通知父组件「我要切换语言了」。
// （主题固定为深色，不再提供深/浅切换；PDF 改为下载预生成的 /resume.pdf，所以也没有打印回调。）
export function TopBar({
  lang,
  setLang,
}: {
  // 下面是对每个 prop 的类型说明（: 后面是类型）。
  lang: Lang; // 当前语言
  setLang: (l: Lang) => void; // 切换语言的回调：接收一个 Lang，无返回值(void)
}) {
  // 从 RESUME 里解构出 meta（站点元信息：用户名、主机名、当前路径等）。
  const { meta } = RESUME;
  // 调用自定义 Hook 拿到当前时间；它内部用 useEffect + setInterval 每秒刷新一次，
  // 时间变化会触发本组件重新渲染，于是顶栏时钟就会跳动。
  const now = useClock();
  // useClock 初值为 null（服务器端没时间），挂载前先显示占位，避免 hydration 不一致。
  // now 可能是 null（见上面注释），所以这里用「三元表达式 条件 ? A : B」做判断：
  // 有时间就格式化成 时:分:秒，没有就先显示占位 "--:--:--"。
  // toLocaleTimeString 是浏览器内置 Date 方法，"en-GB" + hour12:false 得到 24 小时制。
  const time = now ? now.toLocaleTimeString("en-GB", { hour12: false }) : "--:--:--";
  // return 里的就是 JSX：长得像 HTML，但其实是 JS 表达式，最终渲染成界面。
  // 注意属性用 className 而不是 class（class 是 JS 关键字）。
  return (
    <header className="topbar">
      <div className="topbar-inner">
        {/* 左上角三个圆点，模仿终端窗口的红黄绿按钮，纯装饰 */}
        <div className="dots">
          <span className="dot live"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        <div className="topbar-title">
          {/* JSX 里用 {} 包住 JS 表达式，把变量值插进界面。{" "} 是手动加一个空格 */}
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
            {/* {time} 每秒变一次，所以这里的时钟会持续跳动 */}
            <span className="label">TIME:</span> <span className="val accent">{time}</span>
          </span>
        </div>
        {/* 右侧操作区：博客入口、切语言、下载 PDF */}
        <div className="topbar-actions">
          {/* 博客入口。href 用 urlFor("/blog") 得到带结尾斜杠的绝对地址（与 trailingSlash:true 一致）。
              label 按当前界面语言切换：中文显示「文章」，英文显示「BLOG」。
              复用既有的 icon-btn 样式，和下面的语言切换 / 下载按钮长得一致。 */}
          <a className="icon-btn" href={urlFor("/blog")} title="Blog">
            {lang === "zh" ? "文章" : "BLOG"}
          </a>
          {/* onClick 绑定点击事件。这里传一个箭头函数 () => ...，点击时才执行。
              点击时调用父组件传下来的 setLang，把语言切到「另一个」：
              当前是 zh 就传 en，否则传 zh。父组件收到后更新状态，整个页面随之换语言。 */}
          <button
            className="icon-btn"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            title="Toggle language"
          >
            {/* style 用对象写法（双大括号：外层是 JSX 插值，内层是 JS 对象）。
                根据当前语言让 ZH/EN 一个高亮(1)一个变淡(0.4)，提示当前选中项。 */}
            <span style={{ opacity: lang === "zh" ? 1 : 0.4 }}>ZH</span>
            <span style={{ color: "var(--fg-mute)" }}>/</span>
            <span style={{ opacity: lang === "en" ? 1 : 0.4 }}>EN</span>
          </button>
          {/* 下载 PDF：链到 /resume.pdf——这是 scripts/build-pdf.mjs 从简历数据生成的「干净文档版」PDF，
              和网站的终端风完全分开。download 属性让浏览器直接下载并指定保存文件名。 */}
          <a className="icon-btn" href="/resume.pdf" download="李姜磊-简历.pdf" title="Download résumé PDF">
            ⤓ {pickLang(STRINGS.download, lang)}
          </a>
        </div>
      </div>
    </header>
  );
}
