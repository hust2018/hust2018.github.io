"use client";

// 交互式终端：一个可以敲命令的假 shell，命令的输出直接从 RESUME 数据里读，
// 所以简历内容改了，这里自动跟着变。
//
// 旧版里它是页面上的一个固定区块；现在改成随时可以呼出的「命令面板」：
// 点导航栏的终端按钮，或按 ⌘K / Ctrl K（也可以按 ` 键）打开。

import { Fragment, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { RESUME, STRINGS } from "@/lib/data";
import { formatDate } from "@/lib/fx";
import { pickLang } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { FormattedBold, Icon } from "./effects";
import { Modal } from "./Modal";

// 支持的命令。zh / en 是 help 列表里显示的说明。
const COMMANDS: { name: string; zh: string; en: string }[] = [
  { name: "whoami", zh: "我是谁", en: "who am I" },
  { name: "skills", zh: "技能栈", en: "tech stack" },
  { name: "exp", zh: "工作经历", en: "work history" },
  { name: "about", zh: "关于我", en: "about me" },
  { name: "contact", zh: "联系方式", en: "contact info" },
  { name: "lang", zh: "切换中 / 英文", en: "switch 中文 / English" },
  { name: "pdf", zh: "下载 PDF 简历", en: "download the PDF résumé" },
  { name: "clear", zh: "清屏", en: "clear the screen" },
  { name: "help", zh: "显示这份命令列表", en: "show this list" },
  { name: "exit", zh: "关闭终端", en: "close the shell" },
];
// 输入框下方的快捷按钮：触屏设备上不用打字也能玩。
const QUICK = ["help", "whoami", "skills", "exp", "about", "contact", "lang", "clear"];

// 一条记录：要么是开头那句提示（note），要么是用户敲过的一条命令（cmd）。
// 只存「敲了什么」，不存输出——输出在渲染时按当前语言现算，所以切换语言后历史输出也会跟着变。
type Entry = { type: "note" } | { type: "cmd"; raw: string };

const firstWord = (raw: string) => raw.trim().toLowerCase().split(/\s+/)[0];

function Prompt() {
  return (
    <span className="term-pmt">
      <span className="term-you">guest@portfolio</span>:~$
    </span>
  );
}

// 根据命令生成输出。返回 ReactNode：可能是字符串，也可能是一段 JSX。
function outputFor(raw: string, lang: Lang): ReactNode {
  const cmd = firstWord(raw);
  switch (cmd) {
    case "help":
    case "ls":
      return (
        <div className="term-grid">
          {COMMANDS.map((c) => (
            // Fragment 不产生真实标签；这里用它把「命令名 + 说明」两个格子打包成一组，并提供 key。
            <Fragment key={c.name}>
              <span className="term-cmd">{c.name}</span>
              <span>{pickLang({ zh: c.zh, en: c.en }, lang)}</span>
            </Fragment>
          ))}
        </div>
      );
    case "whoami": {
      const h = RESUME.hero;
      return `${pickLang(h.name, lang)} · ${pickLang(h.role, lang)} · ${h.yearsExp}y · ${pickLang(h.location, lang)}`;
    }
    case "skills":
      return RESUME.skills.map((group, i) => (
        <div key={i}>
          <span className="term-k">{pickLang(group.cat, lang)}</span>:{" "}
          {group.items.map((item) => pickLang(item, lang)).join(" · ")}
        </div>
      ));
    case "exp":
    case "experience":
      return RESUME.experience.map((item, i) => (
        <div key={i}>
          <span className="term-k">{formatDate(item.date, lang, pickLang(STRINGS.present, lang))}</span>{" "}
          {pickLang(item.role, lang)} @ {pickLang(item.company, lang)}
        </div>
      ));
    case "about":
      return RESUME.about[lang].map((line, i) => (
        <div key={i}>
          <FormattedBold text={line} />
        </div>
      ));
    case "contact":
      return (
        <div className="term-grid">
          <span className="term-k">email</span>
          <span>{RESUME.contact.email}</span>
        </div>
      );
    case "lang":
      return lang === "zh"
        ? "当前语言：中文（再输入一次 lang 切到英文）"
        : "Language: English (run lang again for 中文)";
    case "pdf":
      return lang === "zh" ? "已开始下载 resume.pdf" : "Downloading resume.pdf";
    default:
      return (
        <span className="term-err">
          {pickLang(
            {
              zh: `command not found: ${cmd}（输入 help 看看有哪些命令）`,
              en: `command not found: ${cmd} — type "help" to see commands`,
            },
            lang,
          )}
        </span>
      );
  }
}

// 用代码触发一次下载：临时造一个带 download 属性的链接并「点」它。
function downloadPdf() {
  const link = document.createElement("a");
  link.href = "/resume.pdf";
  link.download = "李姜磊-简历.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function Terminal({
  lang,
  open,
  onClose,
  onToggleLang,
}: {
  lang: Lang;
  open: boolean;
  onClose: () => void;
  onToggleLang: () => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([{ type: "note" }, { type: "cmd", raw: "whoami" }]);
  const [input, setInput] = useState("");
  // 命令历史 + 当前翻到第几条（null 表示没在翻历史），用来实现「按上下键翻历史」。
  const [history, setHistory] = useState<string[]>([]);
  const [historyPos, setHistoryPos] = useState<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 有新输出、或面板刚打开时，把输出区滚到最底部。
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [entries, open]);

  // 打开后把光标放进输入框。等一帧，是为了等弹窗真正显示出来再聚焦。
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const exec = (raw: string) => {
    const cmd = firstWord(raw);
    setHistory((prev) => [...prev, raw]);
    setHistoryPos(null);
    if (cmd === "clear") {
      setEntries([]);
      return;
    }
    if (cmd === "exit") {
      onClose();
      return;
    }
    // 展开运算符 ...prev 复制出一个新数组再追加：React 靠「引用变了」来发现状态更新，不能直接 push。
    setEntries((prev) => [...prev, { type: "cmd", raw }]);
    if (cmd === "lang") onToggleLang();
    if (cmd === "pdf") downloadPdf();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const raw = input.trim();
      setInput("");
      if (raw) exec(raw); // 空输入直接忽略
    } else if (event.key === "ArrowUp") {
      event.preventDefault(); // 阻止光标跳到行首，改成「翻上一条历史」
      if (history.length === 0) return;
      const pos = historyPos === null ? history.length - 1 : Math.max(0, historyPos - 1);
      setHistoryPos(pos);
      setInput(history[pos]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyPos === null) return;
      const pos = historyPos + 1;
      if (pos >= history.length) {
        setHistoryPos(null);
        setInput("");
      } else {
        setHistoryPos(pos);
        setInput(history[pos]);
      }
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="term" labelledBy="term-ttl">
      <div className="term-win">
        <div className="term-bar">
          <span className="term-ttl" id="term-ttl">
            resume.sh — bash
          </span>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={pickLang(STRINGS.close, lang)}>
            <Icon name="close" />
          </button>
        </div>

        {/* role="log"：读屏软件会把新增的输出念出来；tabIndex=0 让键盘用户能聚焦到这里上下滚动。 */}
        <div className="term-body" ref={bodyRef} role="log" aria-live="polite" tabIndex={0}>
          {entries.map((entry, i) =>
            entry.type === "note" ? (
              <div key={i} className="term-note">
                {pickLang(STRINGS.termNote, lang)}
              </div>
            ) : (
              <div key={i} className="term-entry">
                <div className="term-cmdline">
                  <Prompt /> {entry.raw}
                </div>
                <div className="term-out">{outputFor(entry.raw, lang)}</div>
              </div>
            ),
          )}
        </div>

        <div className="term-row">
          <label className="term-pmt" htmlFor="term-in">
            <span className="term-you">guest@portfolio</span>:~$
          </label>
          {/* 受控输入框：显示的值永远等于 state 里的 input，用户每敲一个字都通过 onChange 写回 state。 */}
          <input
            className="term-input"
            id="term-in"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setHistoryPos(null); // 一旦手动改字，就退出「翻历史」状态
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label={pickLang(STRINGS.termInputLabel, lang)}
            placeholder={pickLang(STRINGS.termPlaceholder, lang)}
          />
        </div>

        <div className="term-hints">
          {QUICK.map((name) => (
            <button
              type="button"
              className="term-chip"
              key={name}
              onClick={() => {
                exec(name);
                inputRef.current?.focus();
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
