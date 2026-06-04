// "use client" 表示这是客户端组件（在浏览器里运行，能用交互和 Hook）。详见 ImageSlot.tsx 的说明。
"use client";

// 从 react 导入 Fragment。Fragment（片段）是一个「不会生成真实 HTML 标签」的包裹组件。
// 当你需要一次返回多个相邻元素、又不想多套一层无意义的 <div> 时，就用它把它们包起来。
// 它的简写形式是 <>...</>，但简写不能加 key，所以这里在列表里要带 key，就用完整的 <Fragment key={...}>。
import { Fragment } from "react";
// RESUME（简历数据）和 STRINGS（界面固定文案），都来自 lib/data.ts。
import { RESUME, STRINGS } from "@/lib/data";
// pickLang(值, lang)：按当前语言 lang 从双语对象里取出对应文本的小工具。
import { pickLang } from "@/lib/i18n";
// FadeUp（淡入上浮效果）、SectionHead（区块标题栏），来自同目录的 effects。
import { FadeUp, SectionHead } from "./effects";
// 只导入类型 Lang（语言类型，如 "zh" | "en"），仅用于类型检查。
import type { Lang } from "@/lib/types";

// Skills 组件：渲染「技能」区块。props 里解构出当前语言 lang。
export function Skills({ lang }: { lang: Lang }) {
  // 从简历数据里取出技能列表。它是一个数组，每一项形如 { cat: 分类名, items: [技能1, 技能2, ...] }。
  const skills = RESUME.skills;
  return (
    // 区块容器，className 配合全局 CSS 控制样式，id="skills" 用作锚点方便跳转。
    <section className="section" id="skills">
      {/* 标题栏：编号 02，标题取当前语言的「技能」文案，右侧小注释 // ls ~/skills */}
      <SectionHead num="02" title={pickLang(STRINGS.skills, lang)} meta="// ls ~/skills" />
      <FadeUp>
        <div className="skills-grid">
          {/* 外层 .map：遍历每个技能分类 s（下标 i），为每个分类渲染「分类名 + 该分类下的技能标签组」。 */}
          {skills.map((s, i) => (
            // 用 Fragment 把「分类名」和「标签组」两个相邻元素打包返回，又不额外多套一层标签。key 是列表项必需的唯一标识。
            <Fragment key={i}>
              {/* 分类名：pickLang 取当前语言的分类标题。 */}
              <div className="skill-cat">{pickLang(s.cat, lang)}</div>
              <div className="skill-chips">
                {/* 内层 .map：遍历当前分类下的每个技能 it（下标 j），各渲染成一个小标签（chip）。 */}
                {/* 这是「嵌套循环」：外层遍历分类，内层遍历该分类里的具体技能。 */}
                {s.items.map((it, j) => (
                  // 每个标签也要有 key，这里用内层下标 j。
                  <span key={j} className="chip">
                    {pickLang(it, lang)}
                  </span>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </FadeUp>
    </section>
  );
}
