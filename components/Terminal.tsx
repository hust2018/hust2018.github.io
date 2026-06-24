// "use client"：交互式终端要用 useState/useEffect/useRef、键盘事件、聚焦 DOM 等，
// 这些都是浏览器里才有的能力，所以这个文件必须声明为「客户端组件」
//（服务器组件 vs 客户端组件的区别，详见 effects.tsx 顶部的说明）。
"use client";

// Fragment：见下面 HelpList 里的说明（列表里要带 key，又不想多套标签时用它）。
import { Fragment, useEffect, useRef, useState } from "react";
// 只导入类型 ReactNode：表示「任何能被 React 渲染的东西」，用来标注命令的输出。
import type { ReactNode } from "react";
// RESUME：整份简历数据；STRINGS：界面固定文案（区块标题等）。都在 lib/data.ts。
// 关键点：终端里所有内容都从 RESUME 取，不另存一份——所以你改 lib/data.ts 填真实信息，
// 终端各命令的输出会自动跟着变，永远和简历正文保持一致。
import { RESUME, STRINGS } from "@/lib/data";
// pickLang(值, lang)：按当前语言从双语对象 { zh, en } 里取出对应文本。
import { pickLang } from "@/lib/i18n";
// 复用同目录 effects 里现成的三个小组件：
//   SectionHead   区块标题栏（和其它区块统一样式）
//   FadeUp        滚动到视口时淡入
//   FormattedBold 把文本里的 **加粗** 渲染成高亮 span
import { FadeUp, SectionHead, FormattedBold } from "./effects";
import type { Lang } from "@/lib/types";

// ── 命令清单 ──────────────────────────────────────────────────────────────────
// 把「有哪些命令、各自一句话说明」抽成一份数据。help 命令直接照着它渲染，
// 以后想加 / 改命令，主要改这一处（数据驱动，避免说明散落在代码各处）。
const COMMANDS: { name: string; zh: string; en: string }[] = [
  { name: "whoami", zh: "我是谁", en: "who am I" },
  { name: "skills", zh: "技能栈", en: "tech stack" },
  { name: "exp", zh: "工作经历", en: "work history" },
  { name: "about", zh: "关于我", en: "about me" },
  { name: "contact", zh: "联系方式", en: "contact info" },
  { name: "clear", zh: "清屏", en: "clear the screen" },
  { name: "help", zh: "显示这份命令列表", en: "show this list" },
];

// 终端提示符 "guest@portfolio:~$"。命令行和输入行都要用到，抽成小组件复用，避免重复。
function Prompt() {
  return (
    <span className="term-pmt">
      <span className="term-you">guest@portfolio</span>:~$
    </span>
  );
}

// help 命令的输出：把 COMMANDS 渲染成「命令 + 说明」两列（用 CSS grid 对齐）。
function HelpList({ lang }: { lang: Lang }) {
  return (
    <div className="term-grid">
      {COMMANDS.map((c) => (
        // map 出来的列表每项都要带唯一 key；而简写的 <> 不能加 key，所以用完整的 <Fragment key=...>。
        <Fragment key={c.name}>
          <span className="term-cmd">{c.name}</span>
          <span>{pickLang({ zh: c.zh, en: c.en }, lang)}</span>
        </Fragment>
      ))}
    </div>
  );
}

// ── 命令 → 输出 ──────────────────────────────────────────────────────────────
// 给定用户输入的一行命令 raw，算出它的「输出内容」（一段可渲染的 JSX 或文本）。
// 注意：输出是「按当前 lang 实时计算」的——终端历史里只存命令字符串，渲染时才翻译。
// 这样用户切换中 / 英时，历史里所有命令的输出都会自动跟着换语言。
function outputFor(raw: string, lang: Lang): ReactNode {
  // 取第一个单词当命令名：去掉首尾空格、转小写、按空白切分后取第 0 段。
  // （这样 "skills" 和将来可能的 "skills --all" 都能识别成 skills。）
  const cmd = raw.trim().toLowerCase().split(/\s+/)[0];
  switch (cmd) {
    // help 和 ls 都显示命令列表（ls 只是顺手给个符合终端直觉的别名）。
    case "help":
    case "ls":
      return <HelpList lang={lang} />;
    case "whoami": {
      const h = RESUME.hero;
      // 一行展示：姓名 · 职位 · 年限 · 坐标。
      return `${pickLang(h.name, lang)} · ${pickLang(h.role, lang)} · ${h.yearsExp}y · ${pickLang(h.location, lang)}`;
    }
    case "skills":
      // 每个技能分类渲染成一行：「分类名: 技能 · 技能 · …」。
      return RESUME.skills.map((g, i) => (
        <div key={i}>
          <span className="term-k">{pickLang(g.cat, lang)}</span>:{" "}
          {g.items.map((it) => pickLang(it, lang)).join(" · ")}
        </div>
      ));
    case "exp":
    case "experience":
      // 每段经历一行：「时间  角色 @ 公司」。
      return RESUME.experience.map((x, i) => (
        <div key={i}>
          <span className="term-k">{x.date}</span> {pickLang(x.role, lang)} @ {pickLang(x.company, lang)}
        </div>
      ));
    case "about":
      // about 是 { zh: string[], en: string[] }，按语言取出那一组数组，每句一行。
      // 文案里有 **加粗** 标记，交给 FormattedBold 渲染成高亮。
      return RESUME.about[lang].map((line, i) => (
        <div key={i}>
          <FormattedBold text={line} />
        </div>
      ));
    case "contact": {
      const c = RESUME.contact;
      // 整理成 [字段名, 值] 的数组，用 grid 两列对齐渲染。
      const rows: [string, string][] = [
        ["email", c.email],
      ];
      return (
        <div className="term-grid">
          {rows.map(([k, v]) => (
            <Fragment key={k}>
              <span className="term-k">{k}</span>
              <span>{v}</span>
            </Fragment>
          ))}
        </div>
      );
    }
    default:
      // 不认识的命令：给出友好提示（双语）。
      return (
        <span className="term-err">
          {pickLang(
            {
              zh: `command not found: ${cmd}（输入 help 看看有哪些命令）`,
              en: `command not found: ${cmd} — type "help" to see commands`,
            },
            lang
          )}
        </span>
      );
  }
}

// 终端历史里的一条记录：要么是「执行过的命令」（只存原始字符串，输出实时算），
// 要么是「一条提示 / 横幅」（双语文本，比如开场白）。用联合类型区分这两种。
type Entry =
  | { type: "cmd"; raw: string }
  | { type: "note"; zh: string; en: string };

// ── 主组件 ────────────────────────────────────────────────────────────────────
// 「交互式终端」区块：访客可以真的输入命令、回车执行，像在用一个迷你 shell。
export function Terminal({ lang }: { lang: Lang }) {
  // entries：终端「回滚区」的内容。初始放一条开场白 + 预先跑一条 whoami，
  // 这样一进来就有实质内容（也保证打印 PDF 时这一区不是空白的）。
  // 为什么用固定初始值而不是随机/读取存储？因为服务器端和浏览器首屏渲染必须一致，
  // 否则会触发 React 的 hydration（水合）不匹配警告（详见 page.tsx 里的说明）。
  const [entries, setEntries] = useState<Entry[]>([
    {
      type: "note",
      zh: "resume.sh · 交互式终端 — 输入 help 查看可用命令",
      en: 'resume.sh · interactive shell — type "help" for commands',
    },
    { type: "cmd", raw: "whoami" },
  ]);
  // input：输入框里当前的文字（受控组件——值由 state 管，变化通过 onChange 回传）。
  const [input, setInput] = useState("");
  // cmdHist：用户输入过的命令历史，供 ↑ / ↓ 翻阅（和真实终端一样）。
  const [cmdHist, setCmdHist] = useState<string[]>([]);
  // histPos：当前翻阅到历史里的第几条；null 表示「没在翻、正常输入中」。
  const [histPos, setHistPos] = useState<number | null>(null);

  // 两个 DOM 引用：回滚区（用于自动滚到底）和输入框（用于点窗口时聚焦）。
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 每当 entries 变化后，把回滚区滚动到最底部，让最新输出始终可见。
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  // 执行一条命令：先记进历史；clear 特殊处理（清空回滚区），其余追加到 entries。
  const exec = (raw: string) => {
    const cmd = raw.trim().toLowerCase().split(/\s+/)[0];
    setCmdHist((prev) => [...prev, raw]); // 存进命令历史，供上下键翻阅
    setHistPos(null); // 执行后退出「翻阅历史」状态
    if (cmd === "clear") {
      setEntries([]); // 清屏
      return;
    }
    // 用 (prev) => [...prev, 新项] 这种「基于上一份状态」的写法追加，最稳妥。
    setEntries((prev) => [...prev, { type: "cmd", raw }]);
  };

  // 键盘事件：回车执行；上 / 下方向键翻命令历史。
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const raw = input.trim();
      if (raw) exec(raw); // 空输入直接忽略，只清空输入框
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); // 阻止光标默认跳到行首，改成「翻上一条历史」
      if (cmdHist.length === 0) return;
      // 没在翻 → 从最后一条开始；正在翻 → 再往前一条（用 Math.max 防止越界到负数）。
      const pos = histPos === null ? cmdHist.length - 1 : Math.max(0, histPos - 1);
      setHistPos(pos);
      setInput(cmdHist[pos]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histPos === null) return; // 没在翻历史就不处理
      const pos = histPos + 1;
      if (pos >= cmdHist.length) {
        // 已经翻过最后一条 → 回到「空输入」状态
        setHistPos(null);
        setInput("");
      } else {
        setHistPos(pos);
        setInput(cmdHist[pos]);
      }
    }
  };

  return (
    <section className="section" id="shell">
      {/* 区块标题：编号沿用原「项目」区的 04；meta 提示这是个可运行的脚本 */}
      <SectionHead num="02" title={pickLang(STRINGS.shell, lang)} meta="// ./resume.sh" />
      <FadeUp>
        {/* 点终端窗口任意处都让输入框获得焦点，体验更接近真终端 */}
        <div className="terminal" onClick={() => inputRef.current?.focus()}>
          {/* 顶部仿 macOS 窗口的标题栏：三个圆点 + 标题 */}
          <div className="term-bar">
            <span className="term-dot"></span>
            <span className="term-dot"></span>
            <span className="term-dot"></span>
            <span className="term-ttl">resume.sh — bash</span>
          </div>
          {/* 回滚区：遍历 entries，把历史命令和它们的输出渲染出来 */}
          <div className="term-body" ref={bodyRef}>
            {entries.map((entry, i) =>
              entry.type === "note" ? (
                // 提示 / 横幅行
                <div key={i} className="term-note">
                  {pickLang({ zh: entry.zh, en: entry.en }, lang)}
                </div>
              ) : (
                // 命令行（提示符 + 用户输入的原文） + 它的输出
                <div key={i} className="term-entry">
                  <div className="term-cmdline">
                    <Prompt /> {entry.raw}
                  </div>
                  <div className="term-out">{outputFor(entry.raw, lang)}</div>
                </div>
              )
            )}
          </div>
          {/* 输入行：提示符 + 真实输入框。打印 PDF 时这一行会被 CSS 隐藏。 */}
          <div className="term-inputrow">
            <Prompt />
            <input
              ref={inputRef}
              className="term-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setHistPos(null); // 一旦手动改字，就退出「翻历史」状态
              }}
              onKeyDown={onKeyDown}
              // 下面几个属性：关闭自动完成 / 拼写检查 / 首字母大写，让它更像命令行。
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="terminal input"
              placeholder={lang === "zh" ? "输入命令，回车执行…" : "type a command, hit enter…"}
            />
          </div>
        </div>
      </FadeUp>
    </section>
  );
}
