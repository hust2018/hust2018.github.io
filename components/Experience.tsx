// 客户端组件：因为用到了 useState/useEffect（只能在浏览器跑的 React Hook）。
"use client";

// 从 React 导入两个最常用的 Hook：
//   useState —— 给组件一个「局部状态」（会变的数据），变了就自动重新渲染；
//   useEffect —— 处理「副作用」（渲染之外的事，比如订阅、定时器、同步外部状态）。
import { useEffect, useState } from "react";
import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
// FadeUp（滚动淡入容器）、FormattedBold（把 **加粗** 渲染成高亮）、SectionHead（区块标题），均来自 effects.tsx。
import { FadeUp, FormattedBold, SectionHead } from "./effects";
// ExperienceItem 是「一条工作经历」的类型，Lang 是语言类型。
import type { ExperienceItem, Lang } from "@/lib/types";

// 单条经历：点标题可展开/收起。defaultOpen 由父组件的「展开全部/收起」控制。
// 这是一个只在本文件内部用的小组件（没 export），专门渲染列表里的一行。
function ExpItem({
  item, // 这一条经历的数据
  lang, // 当前语言
  defaultOpen, // 初始/被父组件统一控制的展开状态
}: {
  item: ExperienceItem;
  lang: Lang;
  defaultOpen: boolean;
}) {
  // useState 返回一个数组：[当前值, 改这个值的函数]，这里用解构同时取出。
  // open 记录「这一条当前是否展开」，是本组件自己的局部状态。
  // 用 defaultOpen 作为初始值。调用 setOpen(...) 会改变 open 并触发重新渲染。
  const [open, setOpen] = useState(defaultOpen);
  // 父组件切换「全部展开/收起」时，同步每条的展开状态。
  // useEffect(回调, [依赖数组])：当依赖数组里的值变化时执行回调。
  // 这里依赖 [defaultOpen]，所以父组件改变 defaultOpen 时，就把本条的 open 跟着改。
  useEffect(() => setOpen(defaultOpen), [defaultOpen]);
  // item.bullets 是 { zh: [...], en: [...] }，用 [lang] 取当前语言那一组要点。
  const bullets = item.bullets[lang];
  return (
    // 模板字符串拼 className：展开时额外加上 "open" 类（交给 CSS 控制展开样式/动画）。
    <div className={`exp ${open ? "open" : ""}`}>
      {/* 整个标题行是个按钮，点一下就把 open 取反（!open = 相反值）。
          aria-expanded 是无障碍属性，告诉读屏软件「这个区域当前是展开还是收起」。 */}
      <button className="exp-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="exp-caret">▶</span>
        <span className="exp-title">
          <span className="role">{pickLang(item.role, lang)}</span>
          <span className="at">@</span>
          <span className="company">{pickLang(item.company, lang)}</span>
        </span>
        <span className="exp-date">{item.date}</span>
      </button>
      <div className="exp-body">
        <div className="exp-inner">
          <ul>
            {/* 用 .map 把「要点数组」转成一组 <li> 列表项。
                React 渲染列表时要求每项有唯一的 key，方便它高效更新；
                这里没有更合适的唯一值，就用下标 i（数组不会重排，所以可接受）。 */}
            {bullets.map((b, i) => (
              <li key={i}>
                {/* 用 FormattedBold 渲染，让要点里的 **关键指标** 高亮显示 */}
                <FormattedBold text={b} />
              </li>
            ))}
          </ul>
          {/* 条件渲染：item.stack && (...) 表示「有 stack 才渲染后面这块」。
              如果 stack 是 undefined，&& 的结果是假值，什么都不显示。 */}
          {item.stack && (
            <div className="stack">
              {/* 把技术栈数组渲染成一个个小标签 chip */}
              {item.stack.map((s, i) => (
                <span key={i} className="chip">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 这才是对外导出的「工作经历」区块组件，由页面调用并传入 lang。
export function Experience({ lang }: { lang: Lang }) {
  // 从简历数据里取出所有经历条目。
  const items = RESUME.experience;
  // allOpen：控制「全部展开还是全部收起」的状态，初始 true（全部展开）。
  // 它会通过 defaultOpen 传给每一条 ExpItem，实现父控制子。
  const [allOpen, setAllOpen] = useState(true);
  return (
    // <section> 加 id="experience"，让右侧导航条 SideRail 能定位并跳转到这里。
    <section className="section" id="experience">
      {/* 复用的区块标题组件：num 是编号，title 是标题文字，
          meta 这个 prop 接收的是一段 JSX（按钮），会显示在标题旁边。 */}
      {/* meta 传入的这个按钮点一下就把 allOpen 取反，让所有经历同时展开或收起 */}
      <SectionHead
        num="04"
        title={pickLang(STRINGS.experience, lang)}
        meta={
          <button
            className="icon-btn"
            style={{ padding: "2px 8px", fontSize: 10 }}
            onClick={() => setAllOpen(!allOpen)}
          >
            {/* 按钮文字也随状态变化：展开时显示「收起」，收起时显示「展开全部」 */}
            {allOpen
              ? pickLang(STRINGS.collapseAll, lang)
              : pickLang(STRINGS.expandAll, lang)}
          </button>
        }
      />
      {/* 用 FadeUp 包裹列表：滚动进视口时整块淡入出现 */}
      <FadeUp>
        <div className="exp-list">
          {/* 遍历每条经历渲染一个 ExpItem。把 allOpen 作为 defaultOpen 传下去，
              所以点上面那个按钮时，每一条都会同步展开/收起。 */}
          {items.map((it, i) => (
            <ExpItem key={i} item={it} lang={lang} defaultOpen={allOpen} />
          ))}
        </div>
      </FadeUp>
    </section>
  );
}
