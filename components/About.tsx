"use client";

// 「关于」：三段大字，随着滚动逐字（英文逐词）点亮。
//
// 做法：把每段话拆成一个个 <span class="w">，默认是暗的；
// 每帧根据滚动位置算出「这段该亮多少个」，给前面那些 span 加上 .on。
// 拆词和计数都是纯函数，在 lib/fx.ts 里（splitWords / litCount），有单元测试。

import { useRef } from "react";
import { RESUME, STRINGS } from "@/lib/data";
import { litCount, splitWords } from "@/lib/fx";
import { pickLang } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { Ghost, SectionHeader, useFrame, useLayout } from "./effects";

type WordSet = { words: HTMLElement[]; top: number; height: number; lit: number };

export function About({ lang }: { lang: Lang }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const sets = useRef<WordSet[]>([]);
  const paragraphs = RESUME.about[lang];

  // 量出每段话的位置，并把「已点亮数量」清零（下一帧会按当前滚动位置重新点亮）。
  useLayout(() => {
    const body = bodyRef.current;
    if (!body) return;
    sets.current = Array.from(body.querySelectorAll<HTMLElement>("[data-words]")).map((p) => {
      const rect = p.getBoundingClientRect();
      const words = Array.from(p.querySelectorAll<HTMLElement>(".w"));
      words.forEach((w) => w.classList.remove("on"));
      return { words, top: rect.top + window.scrollY, height: Math.max(1, rect.height), lit: 0 };
    });
  }, [lang]);

  useFrame((s) => {
    if (s.reduced) return; // 减少动态效果时，CSS 会让所有文字直接是亮的
    for (const set of sets.current) {
      const target = litCount({
        scrollY: s.y,
        viewportH: s.vh,
        top: set.top,
        height: set.height,
        total: set.words.length,
      });
      if (target === set.lit) continue;
      // 只改「这一帧新亮起 / 新熄灭」的那几个词，而不是每帧把所有词都设一遍。
      if (target > set.lit) for (let i = set.lit; i < target; i++) set.words[i].classList.add("on");
      else for (let i = target; i < set.lit; i++) set.words[i].classList.remove("on");
      set.lit = target;
    }
  });

  return (
    <section className="sec" id="about" aria-labelledby="about-title" tabIndex={-1}>
      <div className="wrap about-grid">
        <SectionHeader id="about" title={pickLang(STRINGS.about, lang)} />
        <div className="about-body" ref={bodyRef}>
          {paragraphs.map((paragraph, i) => (
            // key 里带上语言：切换语言时整段重新创建，不会残留上一种语言点亮到一半的状态。
            <p className="about-p" data-words key={`${lang}-${i}`}>
              {splitWords(paragraph, lang).map((token, j) =>
                token.space ? (
                  " "
                ) : (
                  <span key={j} className={token.bold ? "w hl" : "w"}>
                    {token.text}
                  </span>
                ),
              )}
            </p>
          ))}
        </div>
      </div>
      <Ghost id="about" />
    </section>
  );
}
