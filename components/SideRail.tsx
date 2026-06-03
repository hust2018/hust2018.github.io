"use client";

import { useEffect, useState } from "react";
import { pickLang } from "@/lib/i18n";
import type { Lang, Localized } from "@/lib/types";

// 右侧导航条：高亮「当前滚动到的区块」，点击跳转。
export function SideRail({ lang }: { lang: Lang }) {
  const sections: { id: string; label: Localized }[] = [
    { id: "about", label: { zh: "关于", en: "About" } },
    { id: "skills", label: { zh: "技能", en: "Skills" } },
    { id: "experience", label: { zh: "经历", en: "Exp" } },
    { id: "projects", label: { zh: "项目", en: "Projects" } },
    { id: "education", label: { zh: "教育", en: "Edu" } },
    { id: "contact", label: { zh: "联系", en: "Contact" } },
  ];
  const [active, setActive] = useState("about");
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // 只在挂载时建立一次观察，sections 是常量，无需进依赖。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <nav className="rail" aria-label="Section navigation">
      {sections.map((s, i) => (
        <a key={s.id} href={`#${s.id}`} className={active === s.id ? "active" : ""}>
          <span className="bar"></span>
          <span className="lbl">
            {String(i + 1).padStart(2, "0")} · {pickLang(s.label, lang)}
          </span>
        </a>
      ))}
    </nav>
  );
}
