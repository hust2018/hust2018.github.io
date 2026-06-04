// 客户端组件：用到 useState/useEffect 和定时器。
"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/types";

// 首次进入时的「开机」动画：逐行打印伪终端启动日志，结束后淡出。
// props：lang 决定显示中文还是英文日志；
//        onDone 是父组件传下来的回调，动画放完后调用它通知父组件「可以收起开机画面了」。
export function BootSequence({ lang, onDone }: { lang: Lang; onDone: () => void }) {
  // 中文版要逐行显示的启动日志（纯文本，纯装饰）。
  const linesZh = [
    "[ BOOT ] 初始化内核 ...........",
    "[  OK  ] 挂载 /dev/resume",
    "[  OK  ] 加载用户配置 ~/.profile",
    "[ SCAN ] 检索工作经历 .... 3 条记录",
    "[ SCAN ] 检索项目仓库 .... 24 个",
    "[  OK  ] 建立安全连接 [tls 1.3]",
    "[ DONE ] 系统就绪. 欢迎.",
  ];
  // 英文版日志。
  const linesEn = [
    "[ BOOT ] init kernel ...........",
    "[  OK  ] mount /dev/resume",
    "[  OK  ] load profile ~/.profile",
    "[ SCAN ] indexing experience .... 3 records",
    "[ SCAN ] indexing repos ......... 24 found",
    "[  OK  ] secure channel [tls 1.3]",
    "[ DONE ] system ready. welcome.",
  ];
  // 按当前语言选用哪一组日志。
  const lines = lang === "zh" ? linesZh : linesEn;
  // shown：当前已经显示了多少行（从 0 开始，逐渐加到 lines.length）。
  const [shown, setShown] = useState(0);
  // closing：是否进入「淡出收尾」阶段，用来给最外层加动画类。
  const [closing, setClosing] = useState(false);

  // 这个 useEffect 是动画的「心跳」：每次 shown 变化都重新跑一遍，从而一行一行往下推进。
  useEffect(() => {
    // 还没显示完所有行：
    if (shown < lines.length) {
      // setTimeout(回调, 毫秒) 是浏览器计时器：等一会儿再执行回调。
      // 这里隔一小段时间后把 shown 加 1，于是下一行出现，形成逐行打印的效果。
      // 第一行等久一点(180ms)，之后每行随机 90~180ms，让节奏更像真实打字。
      const id = setTimeout(
        () => setShown(shown + 1),
        shown === 0 ? 180 : 90 + Math.random() * 90
      );
      // 清理函数：本次 effect 结束/重跑前取消上一个定时器，避免重复触发。
      return () => clearTimeout(id);
    }
    // 所有行都显示完了：先等 360ms 进入淡出，再等到 760ms 调 onDone 通知父组件结束。
    const id1 = setTimeout(() => setClosing(true), 360);
    const id2 = setTimeout(onDone, 760);
    // 同样要清理这两个定时器。
    return () => {
      clearTimeout(id1);
      clearTimeout(id2);
    };
    // 依赖里有 shown：每显示一行就重跑，驱动动画前进；lines.length / onDone 变了也重跑。
  }, [shown, lines.length, onDone]);

  return (
    // 到收尾阶段时加上 "boot-closing" 类，交给 CSS 播放淡出动画。
    <div className={`boot ${closing ? "boot-closing" : ""}`}>
      <div className="boot-inner">
        {/* 顶部进度条：宽度 = 已显示行数 / 总行数 * 100%，随 shown 增长而变长 */}
        <div className="boot-bar">
          <span
            className="boot-bar-fill"
            style={{ width: `${(shown / lines.length) * 100}%` }}
          ></span>
        </div>
        {/* lines.slice(0, shown) 取「前 shown 行」，所以随着 shown 增加，行会逐条出现。
            再 .map 把这些行渲染出来。 */}
        {lines.slice(0, shown).map((l, i) => {
          // 根据这行文字里的关键字，决定标签部分用什么颜色样式。
          const ok = l.includes("OK") || l.includes("DONE");
          const scan = l.includes("SCAN");
          return (
            <div key={i} className="boot-line">
              {/* 把方括号标签 [ OK ] 单独上色：成功绿、扫描另一色、其余默认 */}
              <span className={ok ? "boot-ok" : scan ? "boot-scan" : "boot-tag"}>
                {/* 截取从开头到第一个 ] 为止，即 "[ OK ]" 这部分 */}
                {l.slice(0, l.indexOf("]") + 1)}
              </span>
              {/* ] 之后的剩余文字，正常显示 */}
              {l.slice(l.indexOf("]") + 1)}
            </div>
          );
        })}
        {/* 全部行打印完后，显示一个闪烁光标，提示「就绪」。&& 是条件渲染 */}
        {shown >= lines.length && <span className="cursor"></span>}
      </div>
    </div>
  );
}
