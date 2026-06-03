"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/types";

// 首次进入时的「开机」动画：逐行打印伪终端启动日志，结束后淡出。
export function BootSequence({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  const linesZh = [
    "[ BOOT ] 初始化内核 ...........",
    "[  OK  ] 挂载 /dev/resume",
    "[  OK  ] 加载用户配置 ~/.profile",
    "[ SCAN ] 检索工作经历 .... 3 条记录",
    "[ SCAN ] 检索项目仓库 .... 24 个",
    "[  OK  ] 建立安全连接 [tls 1.3]",
    "[ DONE ] 系统就绪. 欢迎.",
  ];
  const linesEn = [
    "[ BOOT ] init kernel ...........",
    "[  OK  ] mount /dev/resume",
    "[  OK  ] load profile ~/.profile",
    "[ SCAN ] indexing experience .... 3 records",
    "[ SCAN ] indexing repos ......... 24 found",
    "[  OK  ] secure channel [tls 1.3]",
    "[ DONE ] system ready. welcome.",
  ];
  const lines = lang === "zh" ? linesZh : linesEn;
  const [shown, setShown] = useState(0);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (shown < lines.length) {
      const id = setTimeout(
        () => setShown(shown + 1),
        shown === 0 ? 180 : 90 + Math.random() * 90
      );
      return () => clearTimeout(id);
    }
    const id1 = setTimeout(() => setClosing(true), 360);
    const id2 = setTimeout(onDone, 760);
    return () => {
      clearTimeout(id1);
      clearTimeout(id2);
    };
  }, [shown, lines.length, onDone]);

  return (
    <div className={`boot ${closing ? "boot-closing" : ""}`}>
      <div className="boot-inner">
        <div className="boot-bar">
          <span
            className="boot-bar-fill"
            style={{ width: `${(shown / lines.length) * 100}%` }}
          ></span>
        </div>
        {lines.slice(0, shown).map((l, i) => {
          const ok = l.includes("OK") || l.includes("DONE");
          const scan = l.includes("SCAN");
          return (
            <div key={i} className="boot-line">
              <span className={ok ? "boot-ok" : scan ? "boot-scan" : "boot-tag"}>
                {l.slice(0, l.indexOf("]") + 1)}
              </span>
              {l.slice(l.indexOf("]") + 1)}
            </div>
          );
        })}
        {shown >= lines.length && <span className="cursor"></span>}
      </div>
    </div>
  );
}
