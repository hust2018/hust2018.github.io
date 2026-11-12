"use client";

// 首屏：超大的名字、职位、一句话简介、头像，以及底部一条「下班之后」的徽章带。
//
// live 表示开场动画是否已经结束：结束后职位那行会播放一次「解码」动画。
// 其余元素的出场（淡入、上移）完全由 globals.css 根据外层的 .is-live 控制，这里不用管。

import { useRef } from "react";
import { RESUME, STRINGS } from "@/lib/data";
import { clamp } from "@/lib/fx";
import { pickLang } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import {
  Decode,
  Icon,
  scrollToSection,
  stagger,
  useFitText,
  useFrame,
  useLayout,
  useMagnetic,
  usePointerTilt,
  useShortcutLabel,
} from "./effects";
import { Marquee } from "./Marquee";

export function Hero({ lang, live }: { lang: Lang; live: boolean }) {
  const { hero, meta } = RESUME;
  // 名字下面那行小字显示「另一种语言」的名字：中文界面显示英文名，反之亦然。
  const other: Lang = lang === "zh" ? "en" : "zh";
  const shortcut = useShortcutLabel();

  const heroRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nameRef = useFitText<HTMLHeadingElement>([lang]); // 名字太宽时自动缩小字号
  const tiltRef = usePointerTilt<HTMLDivElement>(5); // 头像随鼠标轻微倾斜
  const ctaRef = useMagnetic<HTMLAnchorElement>();
  const box = useRef({ height: 1, last: -1 });

  useLayout(() => {
    box.current.height = Math.max(1, heroRef.current?.offsetHeight ?? 1);
    box.current.last = -1;
  }, [lang]);

  // 往下滚时，首屏内容整体上移一点并淡出，和后面的内容拉开层次。
  useFrame((s) => {
    const wrap = wrapRef.current;
    if (!wrap || s.reduced) return;
    const progress = clamp(s.sy / box.current.height, 0, 1);
    if (Math.abs(progress - box.current.last) < 0.0005) return; // 没变化就不写 DOM
    box.current.last = progress;
    wrap.style.transform = `translate3d(0,${(progress * -72).toFixed(1)}px,0)`;
    wrap.style.opacity = clamp(1 - progress * 1.15, 0, 1).toFixed(3);
  });

  const badges = (hero.badges ?? []).map((badge) => (
    <>
      <span className="badge-ico" aria-hidden="true">
        {badge.icon}
      </span>
      {pickLang(badge.label, lang)}
    </>
  ));

  return (
    <section className="hero" id="hero" aria-labelledby="hero-name" tabIndex={-1} ref={heroRef}>
      <div className="wrap hero-wrap" ref={wrapRef}>
        <div className="hero-grid">
          <div className="hero-main">
            {/* data-hrev：首屏专用的出场标记；--i 决定出场的先后顺序（见 stagger）。 */}
            <p className="eyebrow" data-hrev style={stagger(0)}>
              <span className="eyebrow-dim">
                {meta.user}@{meta.host}:{meta.cwd} $
              </span>{" "}
              whoami
            </p>
            {/* .line 是遮罩，.line-in 是里面真正的文字：出场时文字从遮罩下方滑上来。
                data-fit-in 标出「要量宽度的那一层」，供 useFitText 使用。 */}
            <h1 className="hero-name" id="hero-name" ref={nameRef}>
              <span className="line">
                <span className="line-in" data-fit-in>
                  {pickLang(hero.name, lang)}
                </span>
              </span>
            </h1>
            <p className="hero-alt" data-hrev style={stagger(2)} lang={other === "zh" ? "zh-CN" : "en"}>
              {pickLang(hero.name, other)}
            </p>
            <p className="hero-role" data-hrev style={stagger(3)}>
              <Decode text={pickLang(hero.role, lang)} play={live} />
              <i className="caret" aria-hidden="true" />
            </p>
            <p className="hero-tagline" data-hrev style={stagger(4)}>
              {pickLang(hero.tagline, lang)}
            </p>
          </div>

          <figure className="hero-portrait" data-hrev style={stagger(3)}>
            <div className="portrait-tilt" data-tilt ref={tiltRef}>
              <div className="portrait-frame">
                {/* width / height 写的是图片的真实像素尺寸：浏览器据此提前留好位置，图片加载时页面不会跳。 */}
                <img
                  className="media"
                  src="/portrait.jpg"
                  width={900}
                  height={1200}
                  alt={pickLang(STRINGS.portraitAlt, lang)}
                  decoding="async"
                />
                <span className="portrait-cover" aria-hidden="true" />
              </div>
            </div>
            <figcaption className="portrait-cap">
              <span className="lbl portrait-id">ID_0001</span>
              {hero.motto && (
                <span className="portrait-motto" lang="zh-CN">
                  {hero.motto}
                </span>
              )}
            </figcaption>
          </figure>

          <div className="hero-foot">
            {/* <dl> 是「名称—值」列表的语义标签：dt 是名称，dd 是值。 */}
            <dl className="hero-facts" data-hrev style={stagger(5)}>
              <div className="stat">
                <dt className="lbl">{pickLang(STRINGS.basedIn, lang)}</dt>
                <dd>{pickLang(hero.location, lang)}</dd>
              </div>
              <div className="stat">
                <dt className="lbl">{pickLang(STRINGS.available, lang)}</dt>
                <dd>
                  <span className="live" aria-hidden="true" />
                  {pickLang(hero.status, lang)}
                </dd>
              </div>
              <div className="stat">
                <dt className="lbl">{pickLang(STRINGS.experienceYears, lang)}</dt>
                <dd className="nowrap">
                  {hero.yearsExp} {pickLang(STRINGS.yearsExp, lang)}
                </dd>
              </div>
            </dl>
            <div className="hero-cta" data-hrev style={stagger(6)}>
              <a
                className="btn btn-ghost"
                href="#experience"
                ref={ctaRef}
                onClick={(event) => {
                  event.preventDefault();
                  scrollToSection("experience");
                }}
              >
                {pickLang(STRINGS.heroCta, lang)}
                <Icon name="arrowDown" />
              </a>
              <p className="hero-hint">
                <kbd>{shortcut}</kbd>
                <span>{pickLang(STRINGS.termHint, lang)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-badges" data-hrev style={stagger(7)}>
        <p className="lbl hero-badges-lbl">{pickLang(STRINGS.offDuty, lang)}</p>
        <Marquee items={badges} speed={30} dir={-1} itemClassName="badge" watch={lang} />
      </div>
    </section>
  );
}
