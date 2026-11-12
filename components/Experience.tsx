"use client";

// 「工作经历」。它有两种排版：
//
//   · 默认（手机、矮屏、减少动态效果）：每段经历从上到下排列，要点全部展开。
//   · 屏幕够宽够高时：切换成「视口固定 + 横向滚动」——整块区域吸在屏幕上，
//     继续往下滚，各段经历像胶片一样从右往左滑过。为了保证每一屏都放得下，
//     这时每段只露前三条要点、每条最多几行；完整内容点「查看全部」从右侧滑出。
//
// 横向滚动的原理：给外层（.xp-pin）一个很高的高度，里面的 .xp-sticky 用
// position: sticky 吸在屏幕顶部。于是这段很高的距离里，画面看起来不动；
// 我们把「在这段距离里滚了多少」换成轨道的横向位移（见 lib/fx.ts 的 pinnedOffset）。

import { useRef, useState } from "react";
import type { FocusEvent } from "react";
import { RESUME, STRINGS } from "@/lib/data";
import {
  clamp,
  formatDate,
  needsFullView,
  pad2,
  pinnedOffset,
  splitBullet,
  splitCompany,
  startYear,
} from "@/lib/fx";
import { pickLang } from "@/lib/i18n";
import { getFrameState, requestLayout } from "@/lib/ticker";
import type { ExperienceItem, Lang } from "@/lib/types";
import {
  Chips,
  FormattedBold,
  Icon,
  SectionHeader,
  stagger,
  useFitText,
  useFrame,
  useLayout,
} from "./effects";
import { Modal } from "./Modal";

// 启用横向模式的条件：够宽，也够高。
const PIN_QUERY = "(min-width: 1024px) and (min-height: 640px)";

type RoleGeo = { el: HTMLElement; left: number; ghost: HTMLElement | null };

// 一段经历的要点列表。reveal 为 true 时每条带滚动出现的效果（详情侧栏里不需要）。
function BulletList({ bullets, reveal }: { bullets: string[]; reveal: boolean }) {
  return (
    <ol className="xp-bullets">
      {bullets.map((bullet, i) => {
        // 以「**小标题**：」开头的要点，拆成标题一行 + 正文一段。
        const { title, body } = splitBullet(bullet);
        return (
          <li key={i} data-reveal={reveal ? "" : undefined} style={reveal ? stagger(Math.min(i, 6)) : undefined}>
            <span className="xp-n" aria-hidden="true">
              {pad2(i + 1)}
            </span>
            <div className="xp-b">
              {title && <p className="xp-bt">{title}</p>}
              <p>
                <FormattedBold text={body} />
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// 公司名用很大的字，而且不换行；太长时自动缩小字号（比如 "Open Design"、"ByteDance"）。
// watch 变化（语言切换、排版切换）时重新测量。
function CompanyName({ name, watch }: { name: string; watch: string }) {
  const ref = useFitText<HTMLHeadingElement>([name, watch]);
  return (
    <h3 className="xp-company" ref={ref}>
      <span data-fit-in>{name}</span>
    </h3>
  );
}

function eraLabel(item: ExperienceItem, lang: Lang): string {
  return pickLang(item.era === "security" ? STRINGS.eraSecurity : STRINGS.eraAgent, lang);
}

export function Experience({ lang }: { lang: Lang }) {
  const items = RESUME.experience;
  const [pinned, setPinned] = useState(false); // 是否处于横向模式
  // 详情侧栏：open 控制开关，index 记住显示哪一段——关闭动画期间内容还要留在那里，所以分成两个状态。
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetIndex, setSheetIndex] = useState(0);

  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const idxRef = useRef<HTMLElement>(null);
  const geo = useRef<{ top: number; maxX: number; idx: number; roles: RoleGeo[] }>({
    top: 0,
    maxX: 0,
    idx: -1,
    roles: [],
  });

  useLayout(() => {
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!pin || !track) return;
    const want = !getFrameState().reduced && window.matchMedia(PIN_QUERY).matches;
    // 模式要变：先改 state 让 class 生效；pinned 在依赖数组里，变了之后这个回调会再跑一次。
    if (want !== pinned) {
      setPinned(want);
      return;
    }
    track.style.transform = "";
    if (!want) {
      if (pin.style.height) {
        pin.style.height = "";
        requestLayout(); // 页面高度变了，请其他特效重新测量
      }
      geo.current = { top: 0, maxX: 0, idx: -1, roles: [] };
      return;
    }
    // 横向一共能移多远 = 轨道总宽 - 屏幕宽。外层高度 = 一屏 + 这段距离（竖向滚 1px = 横向移 1px）。
    const maxX = Math.max(0, track.offsetWidth - window.innerWidth);
    const height = `${window.innerHeight + maxX}px`;
    if (pin.style.height !== height) {
      pin.style.height = height;
      requestLayout();
    }
    geo.current = {
      top: pin.getBoundingClientRect().top + window.scrollY,
      maxX,
      idx: -1,
      roles: Array.from(track.querySelectorAll<HTMLElement>(".xp-role")).map((el) => ({
        el,
        left: el.offsetLeft,
        ghost: el.querySelector<HTMLElement>(".xp-ghost"),
      })),
    };
  }, [lang, pinned]);

  useFrame((s) => {
    const track = trackRef.current;
    if (!pinned || !track) return;
    const g = geo.current;
    const { progress, x } = pinnedOffset({ scrollY: s.sy, top: g.top, maxX: g.maxX });
    track.style.transform = `translate3d(${(-x).toFixed(1)}px,0,0)`;
    if (barRef.current) barRef.current.style.transform = `scaleX(${progress.toFixed(4)})`;

    let idx = 0;
    g.roles.forEach((role, i) => {
      // rel：这块面板的左边缘在屏幕上的位置，以「屏宽」为单位（0 = 贴左，1 = 贴右）。
      const rel = (role.left - x) / s.vw;
      if (rel < 0.55) idx = i;
      // 背后的年份大字移动得比面板慢一点，形成前后层次（视差）。
      if (role.ghost && rel > -1.2 && rel < 1.2) {
        role.ghost.style.transform = `translate3d(${(rel * 160).toFixed(1)}px,0,0)`;
      }
    });
    // 左下角的「01 / 04」只在序号变化时才更新。
    if (idx !== g.idx) {
      g.idx = idx;
      if (idxRef.current) idxRef.current.textContent = pad2(idx + 1);
    }
  });

  // 键盘用户按 Tab 走到屏幕外的面板时，浏览器没法自己把它「滚」进来（它是靠 transform 移动的），
  // 所以这里手动把页面滚到那块面板对应的位置。只对键盘操作生效，鼠标点击不会触发。
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    const state = getFrameState();
    if (!pinned || !state.keyboard) return;
    const panel = event.target.closest(".xp-role");
    const role = geo.current.roles.find((r) => r.el === panel);
    if (!role) return;
    const x = clamp(role.left - state.vw * 0.08, 0, geo.current.maxX);
    window.scrollTo(0, Math.round(geo.current.top + x));
  };

  const years = items.map((item) => startYear(item.date)).filter((y) => y > 0);
  const ongoing = items.some((item) => item.date.includes("Present"));
  const lastYear = Math.max(...items.map((item) => parseInt(item.date.split("—")[1] ?? "", 10) || 0));
  const range = `${Math.min(...years)} — ${ongoing ? pickLang(STRINGS.present, lang) : lastYear}`;
  const sheetItem = items[sheetIndex] ?? items[0];
  const sheetBullets = sheetItem.bullets[lang];

  return (
    <section
      className={pinned ? "sec xp is-pinned" : "sec xp"}
      id="experience"
      aria-labelledby="experience-title"
      tabIndex={-1}
    >
      <div className="xp-pin" ref={pinRef}>
        <div className="xp-sticky">
          <div className="xp-track" ref={trackRef} onFocus={onFocus}>
            <div className="xp-panel xp-title">
              <SectionHeader id="experience" title={pickLang(STRINGS.experience, lang)} />
              <p className="xp-range nowrap">{range}</p>
              <p className="lbl xp-hint">
                <span>{pickLang(STRINGS.xpHint, lang)}</span>
                <Icon name="arrowRight" />
              </p>
            </div>

            {items.map((item, i) => {
              const bullets = item.bullets[lang];
              const company = splitCompany(pickLang(item.company, lang));
              const moreLabel =
                bullets.length > 3
                  ? pickLang(STRINGS.xpMore, lang).replace("{n}", String(bullets.length))
                  : pickLang(STRINGS.xpFull, lang);
              return (
                // 没有要点的经历（比如刚入职的那段）用紧凑版：只显示公司、时间和职位。
                <article
                  key={i}
                  className={bullets.length ? "xp-panel xp-role" : "xp-panel xp-role xp-role--brief"}
                  data-era={item.era ?? "agent"}
                >
                  <span className="xp-ghost" aria-hidden="true">
                    {startYear(item.date)}
                  </span>
                  <div className="xp-meta" data-reveal>
                    <p className="lbl xp-era">{eraLabel(item, lang)}</p>
                    <p className="xp-date nowrap">{formatDate(item.date, lang, pickLang(STRINGS.present, lang))}</p>
                    <CompanyName name={company.name} watch={`${lang}-${pinned}`} />
                    {company.dept && <p className="xp-dept">{company.dept}</p>}
                    <p className="xp-rolename">{pickLang(item.role, lang)}</p>
                    <Chips items={item.stack} />
                  </div>
                  {bullets.length > 0 && (
                    <div className="xp-body">
                      <BulletList bullets={bullets} reveal />
                      {needsFullView(bullets, lang) && (
                        <button
                          type="button"
                          className="btn btn-ghost xp-more"
                          aria-haspopup="dialog"
                          aria-label={`${pickLang(STRINGS.xpMoreAria, lang)} · ${company.name}`}
                          onClick={() => {
                            setSheetIndex(i);
                            setSheetOpen(true);
                          }}
                        >
                          {moreLabel}
                          <Icon name="arrowUpRight" />
                        </button>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {/* 横向模式下左下角的进度：当前第几段 / 共几段 + 进度条。纯装饰，读屏跳过。 */}
          <p className="xp-hud" aria-hidden="true">
            <b ref={idxRef} />
            <span>/ {pad2(items.length)}</span>
            <span className="xp-hud-bar">
              <i ref={barRef} />
            </span>
          </p>
        </div>
      </div>

      {/* 详情侧栏：完整的要点和技术栈。 */}
      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        className="sheet"
        labelledBy="sheet-title"
        closeMs={240}
        era={sheetItem.era ?? "agent"}
      >
        {/* key 换了，这层会被重新创建——于是每次打开不同的经历，滚动位置都从顶部开始。 */}
        <div className="sheet-in" key={sheetIndex}>
          <header className="sheet-head">
            <div className="stat">
              <p className="lbl">
                {eraLabel(sheetItem, lang)} · {formatDate(sheetItem.date, lang, pickLang(STRINGS.present, lang))}
              </p>
              <h2 className="sheet-title" id="sheet-title">
                {pickLang(sheetItem.company, lang)}
              </h2>
              <p className="sheet-role">{pickLang(sheetItem.role, lang)}</p>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSheetOpen(false)}
              aria-label={pickLang(STRINGS.close, lang)}
            >
              <Icon name="close" />
            </button>
          </header>
          <div className="sheet-content">
            <BulletList bullets={sheetBullets} reveal={false} />
            <Chips items={sheetItem.stack} />
          </div>
        </div>
      </Modal>
    </section>
  );
}
