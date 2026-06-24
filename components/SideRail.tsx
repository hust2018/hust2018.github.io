// 客户端组件：用到 useState/useEffect 和浏览器的 IntersectionObserver。
"use client";

import { useEffect, useState } from "react";
import { pickLang } from "@/lib/i18n";
// Localized 是「双语对象」类型，即 { zh: string; en: string }。
import type { Lang, Localized } from "@/lib/types";

// 右侧导航条：高亮「当前滚动到的区块」，点击跳转。
export function SideRail({ lang }: { lang: Lang }) {
  // 导航项清单：id 要和各区块 <section> 的 id 对应（用于跳转和滚动监听），
  // label 是这一项的双语显示文字。
  const sections: { id: string; label: Localized }[] = [
    { id: "about", label: { zh: "关于", en: "About" } },
    { id: "skills", label: { zh: "技能", en: "Skills" } },
    { id: "experience", label: { zh: "经历", en: "Exp" } },
    { id: "shell", label: { zh: "终端", en: "Shell" } },
    { id: "highlights", label: { zh: "亮点", en: "More" } },
    { id: "education", label: { zh: "教育", en: "Edu" } },
    { id: "contact", label: { zh: "联系", en: "Contact" } },
  ];
  // active：当前高亮的区块 id。它一变，对应导航项就会加上 "active" 类高亮。
  const [active, setActive] = useState("about");
  // useEffect 的回调里建立「滚动监听」。依赖数组是 []，所以这段只在组件首次挂载时跑一次。
  useEffect(() => {
    // IntersectionObserver 是浏览器内置 API：监听元素是否进入了视口（可视区域）。
    // 比起手动监听 scroll 事件再算位置，它更省性能。
    const obs = new IntersectionObserver(
      // 每当被监听元素的可见状态变化，就回调，entries 是发生变化的那些元素。
      (entries) => {
        entries.forEach((e) => {
          // isIntersecting 为真表示这个区块此刻在视口里，就把它设为当前高亮项。
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      // rootMargin 缩小了「判定可见」的范围（上收 40%、下收 50%），
      // 相当于只有当区块进入屏幕中间一带时才算「当前区块」，高亮更准。
      { rootMargin: "-40% 0px -50% 0px" }
    );
    // 找到每个区块对应的真实 DOM 元素，逐个交给观察者去监听。
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    // useEffect 返回的函数是「清理函数」：组件卸载时调用，断开观察、释放资源，防内存泄漏。
    return () => obs.disconnect();
    // 只在挂载时建立一次观察，sections 是常量，无需进依赖。
    // 下面这行注释让 ESLint 不要因为依赖数组里没写 sections 而报警告。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    // aria-label 给这块导航起个名字，方便读屏软件识别。
    <nav className="rail" aria-label="Section navigation">
      {/* 遍历导航项渲染成锚点链接。i 是下标，用来生成 01/02… 的序号 */}
      {sections.map((s, i) => (
        // href="#id" 是页内锚点，点击会跳到对应 id 的区块。
        // className：当前项的 id 等于 active 时加上 "active" 类，从而高亮。
        <a key={s.id} href={`#${s.id}`} className={active === s.id ? "active" : ""}>
          <span className="bar"></span>
          <span className="lbl">
            {/* String(i+1).padStart(2,"0") 把 0,1,2… 变成 "01","02"… 两位序号 */}
            {String(i + 1).padStart(2, "0")} · {pickLang(s.label, lang)}
          </span>
        </a>
      ))}
    </nav>
  );
}
