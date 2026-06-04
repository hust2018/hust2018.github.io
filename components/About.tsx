// "use client" 表示这是客户端组件（在浏览器里运行，能用交互和 Hook）。详见 ImageSlot.tsx 的说明。
"use client";

// 从 lib/data.ts 导入简历内容。@ 是这个项目配置的路径别名，代表项目根目录，所以 @/lib/data 就是 根目录/lib/data。
//   - RESUME：整份简历的数据（姓名、关于、技能等都在里面）。
//   - STRINGS：界面上用到的固定文案（比如各区块的标题）。
import { RESUME, STRINGS } from "@/lib/data";
// pickLang(值, lang) 是本项目的小工具：很多内容都存成「双语对象」如 { zh: "中文", en: "English" }，
// pickLang 会根据当前语言 lang 从中取出对应那一份文本。
import { pickLang } from "@/lib/i18n";
// 从同目录的 effects 文件导入几个用于视觉效果/排版的组件：
//   - FadeUp：让内容滚动到视野时「淡入上浮」出现。
//   - FormattedBold：把文本里特定标记的部分渲染成加粗。
//   - SectionHead：区块标题栏（带编号、标题、注释样式的小标）。
import { FadeUp, FormattedBold, SectionHead } from "./effects";
// 只导入类型 Lang（语言类型，一般是 "zh" | "en"）。import type 表示「只在类型检查时用，编译后不留下代码」。
import type { Lang } from "@/lib/types";

// About 组件：渲染「关于」区块。props 解构出 lang（当前语言），类型是 Lang。
export function About({ lang }: { lang: Lang }) {
  // RESUME.about 是按语言存的段落数据；用 [lang] 取出当前语言对应的那一组段落（是个字符串数组）。
  const paras = RESUME.about[lang];
  return (
    // <section> 是一个语义化的区块容器。className 指定 CSS 类名，配合 lib 里的全局 CSS 来控制外观。
    // id="about" 给区块一个锚点，方便导航栏点击跳转到这里。
    <section className="section about" id="about">
      {/* 区块标题栏：num 是编号，title 用 pickLang 取当前语言的「关于」标题，meta 是右侧的小注释文字 */}
      <SectionHead num="01" title={pickLang(STRINGS.about, lang)} meta="// cat about.md" />
      <FadeUp>
        {/* 用 .map 遍历段落数组，把每个段落 p 渲染成一个 <p> 标签，形成一列段落。 */}
        {/* .map 会对数组每一项执行括号里的函数并收集返回的 JSX。p 是当前段落内容，i 是它的下标（0、1、2…）。 */}
        {paras.map((p, i) => (
          // key 是 React 渲染列表时要求的唯一标识，帮 React 高效地区分/更新每一项；这里用下标 i 作为 key。
          <p key={i}>
            {/* FormattedBold 接收文本 p，把其中的标记片段显示成加粗后再渲染出来。 */}
            <FormattedBold text={p} />
          </p>
        ))}
      </FadeUp>
    </section>
  );
}
