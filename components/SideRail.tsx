"use client";

// 右侧分区导轨（桌面端）：一列短横线，每条对应一个区块。
// 当前所在的区块那条会变长变亮；鼠标移上去会显示「编号 + 名称」。

import { useEffect, useState } from "react";
import { SECTIONS, STRINGS } from "@/lib/data";
import { pad2 } from "@/lib/fx";
import { pickLang } from "@/lib/i18n";
import { scramble } from "@/lib/scramble";
import type { Lang } from "@/lib/types";
import { Decode, scrollToSection } from "./effects";

export function SideRail({ lang }: { lang: Lang }) {
  // 当前高亮的区块 id；在首屏时为空字符串（哪条都不亮）。
  const [active, setActive] = useState("");

  useEffect(() => {
    // rootMargin "-40% 0px -50% 0px"：把判定区域收窄成视口中间偏上的一条窄带。
    // 哪个区块穿过这条窄带，就认为「现在正在看它」。
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id === "hero" ? "" : entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -50% 0px" },
    );
    for (const id of ["hero", ...SECTIONS.map((s) => s.id)]) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="rail" aria-label={pickLang(STRINGS.navLabel, lang)}>
      <ol>
        {SECTIONS.map((section, i) => {
          const on = active === section.id;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className={on ? "is-active" : undefined}
                // aria-current 告诉读屏软件「这是当前位置」
                aria-current={on ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection(section.id);
                }}
                // 鼠标移上来时，把标签文字「解码」一下
                onPointerEnter={(event) =>
                  scramble(event.currentTarget.querySelector<HTMLElement>(".dec-v"), 320)
                }
              >
                <span className="rail-lbl">
                  <Decode text={`${pad2(i + 1)} ${pickLang(section.label, lang)}`} />
                </span>
                <span className="rail-tick" aria-hidden="true" />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
