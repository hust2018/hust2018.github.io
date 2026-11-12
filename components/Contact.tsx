"use client";

// 「联系」：一行会跟着鼠标起伏的大字、邮箱（可一键复制）、可展开的微信二维码。

import { useEffect, useRef, useState } from "react";
import { RESUME, STRINGS } from "@/lib/data";
import { pickLang } from "@/lib/i18n";
import { requestLayout } from "@/lib/ticker";
import type { Lang } from "@/lib/types";
import { Ghost, Icon, SectionHeader, useFitText, useFrame, useLayout, useMagnetic } from "./effects";

type LetterGeo = {
  top: number;
  height: number;
  letters: HTMLElement[];
  centers: number[]; // 每个字母中心的横坐标
  widths: number[];
  scale: number[]; // 每个字母当前的「强度」：1 = 静止，越大浮得越高
};

// 动态大字：鼠标靠近哪个字，哪个字就向上浮起并轻轻摆动；没有鼠标时缓缓起伏。
function KineticTitle({ text }: { text: string }) {
  const ref = useFitText<HTMLParagraphElement>([text]);
  const geo = useRef<LetterGeo>({ top: 0, height: 1, letters: [], centers: [], widths: [], scale: [] });

  useLayout(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const letters = Array.from(el.querySelectorAll<HTMLElement>(".kin-l"));
    const rects = letters.map((letter) => letter.getBoundingClientRect());
    geo.current = {
      top: rect.top + window.scrollY,
      height: Math.max(1, rect.height),
      letters,
      centers: rects.map((r) => r.left + r.width / 2),
      widths: rects.map((r) => r.width),
      scale: letters.map((_, i) => geo.current.scale[i] ?? 1),
    };
  }, [text]);

  useFrame((s) => {
    const g = geo.current;
    if (s.reduced || !g.letters.length) return;
    const top = g.top - s.y; // 这行字在屏幕上的位置
    if (top > s.vh || top + g.height < 0) return; // 不在屏幕里就不用算
    const near = s.pointerOn && s.pointerY > top - 140 && s.pointerY < top + g.height + 140;
    g.letters.forEach((letter, i) => {
      let target: number;
      if (near) {
        // 离鼠标越近强度越大；平方一下，让「近处明显、远处几乎不动」。
        const radius = Math.max(160, g.widths[i] * 2.2);
        const closeness = Math.max(0, 1 - Math.abs(s.pointerX - g.centers[i]) / radius);
        target = 1 + 0.42 * closeness * closeness;
      } else {
        target = 1 + 0.05 * (Math.sin(s.now / 520 + i * 0.7) + 1);
      }
      g.scale[i] += (target - g.scale[i]) * 0.16;
      // 书法字不适合被拉长变形，所以这里不做缩放，而是「上浮 + 轻微摆动」：
      // 强度越大浮得越高；相邻的字往相反方向偏一点，像被风吹动。
      const lift = (g.scale[i] - 1) * 70;
      const tilt = (i % 2 ? 1 : -1) * (g.scale[i] - 1) * 14;
      letter.style.transform = `translate3d(0,${(-lift).toFixed(1)}px,0) rotate(${tilt.toFixed(2)}deg)`;
    });
  });

  return (
    <p className="kin" ref={ref}>
      {/* 读屏软件读这一份完整的文字；下面逐个字母的那份只是视觉效果。 */}
      <span className="sr-only">{text}</span>
      <span className="kin-in" data-fit-in aria-hidden="true">
        {Array.from(text).map((char, i) =>
          char === " " ? (
            <span key={i} className="kin-sp" />
          ) : (
            <span key={i} className="kin-l">
              {char}
            </span>
          ),
        )}
      </span>
    </p>
  );
}

export function Contact({ lang }: { lang: Lang }) {
  const { contact, hero } = RESUME;
  // 复制邮箱的结果："" 表示还没操作过。
  const [copyState, setCopyState] = useState<"" | "ok" | "fail">("");
  const [qrOpen, setQrOpen] = useState(false);
  const mailRef = useRef<HTMLAnchorElement>(null);
  const copyRef = useMagnetic<HTMLButtonElement>();
  const timer = useRef(0);

  // 组件卸载时清掉计时器，避免对已经不存在的组件 setState。
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copyEmail = async () => {
    window.clearTimeout(timer.current);
    try {
      // navigator.clipboard 只在安全环境（https / localhost）下可用。
      await navigator.clipboard.writeText(contact.email);
      setCopyState("ok");
      timer.current = window.setTimeout(() => setCopyState(""), 2600);
    } catch {
      // 复制失败时退一步：帮用户把邮箱选中，按 Ctrl/⌘ + C 就能复制。
      setCopyState("fail");
      const mail = mailRef.current;
      const selection = window.getSelection();
      if (mail && selection) {
        const range = document.createRange();
        range.selectNodeContents(mail);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const toggleQr = () => {
    setQrOpen((open) => !open);
    requestLayout(); // 展开 / 收起会改变页面高度，请其他特效重新测量
  };

  return (
    <section className="sec contact" id="contact" aria-labelledby="contact-title" tabIndex={-1}>
      <div className="wrap">
        <SectionHeader id="contact" title={pickLang(STRINGS.contact, lang)} />
        <KineticTitle text={pickLang(STRINGS.contactBig, lang)} />

        <div className="contact-grid" data-reveal>
          <div className="stat contact-mail-block">
            <p className="lbl">{pickLang(STRINGS.email, lang)}</p>
            <p>
              <a className="contact-mail" href={`mailto:${contact.email}`} ref={mailRef}>
                {contact.email}
              </a>
            </p>
          </div>
          <div className="contact-actions">
            <button type="button" className="btn btn-ghost" ref={copyRef} onClick={copyEmail}>
              <Icon name={copyState === "ok" ? "check" : "copy"} />
              <span>{pickLang(STRINGS.copy, lang)}</span>
            </button>
            {/* role="status" + aria-live：这里的文字一变，读屏软件会主动念出来。 */}
            <p className="copy-status" role="status" aria-live="polite" data-state={copyState || undefined}>
              {copyState === "ok" && pickLang(STRINGS.copied, lang)}
              {copyState === "fail" && pickLang(STRINGS.copyFail, lang)}
            </p>
          </div>
        </div>

        {/* 微信二维码：数据里没配置 wechatQr 时，这一整块都不渲染。 */}
        {contact.wechatQr && (
          <div className="contact-wechat" data-reveal>
            <div className="stat">
              <p className="lbl">{pickLang(STRINGS.wechat, lang)}</p>
              <p>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={toggleQr}
                  // aria-expanded / aria-controls：告诉读屏软件这个按钮控制着哪块内容、现在是开是合。
                  aria-expanded={qrOpen}
                  aria-controls="wechat-qr"
                >
                  {pickLang(qrOpen ? STRINGS.hideWechat : STRINGS.showWechat, lang)}
                </button>
              </p>
            </div>
            <figure className="wechat-qr" id="wechat-qr" hidden={!qrOpen}>
              <img
                className="media"
                src={contact.wechatQr}
                width={587}
                height={605}
                alt={pickLang(STRINGS.wechatQrAlt, lang)}
                loading="lazy"
                decoding="async"
              />
              <figcaption className="wechat-hint">
                {pickLang(STRINGS.wechatHint, lang)} ·{" "}
                <a href={contact.wechatQr} target="_blank" rel="noopener noreferrer">
                  {pickLang(STRINGS.viewQr, lang)}
                </a>
              </figcaption>
            </figure>
          </div>
        )}

        <dl className="contact-facts" data-reveal>
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
        </dl>

        {/* &quot; 是 HTML 实体，表示英文双引号（在 JSX 里直接写 " 容易和属性引号混淆）。 */}
        <p className="signoff">
          <span className="signoff-pmt">$</span> echo &quot;thanks for reading&quot;
          <i className="caret" aria-hidden="true" />
        </p>
      </div>
      <Ghost id="contact" />
    </section>
  );
}
