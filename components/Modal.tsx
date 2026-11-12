"use client";

// 弹窗的通用外壳：终端命令面板和经历详情侧栏都用它。
//
// 概念：<dialog> 是浏览器原生的弹窗元素。调用它的 showModal() 之后，浏览器会自动：
//   · 把它放到最顶层、盖住页面其他内容；
//   · 把键盘焦点「关」在弹窗里（按 Tab 不会跑到背后的页面上）；
//   · 支持按 Esc 关闭。
// 这些如果自己用 <div> 实现，要写很多容易出错的代码，所以直接用原生的。
//
// 这个组件做三件事：
//   1. 把 React 的 open 属性翻译成 showModal() / close() 调用；
//   2. 关闭时先播一小段离场动画，再真正关闭；
//   3. 关闭后把焦点还给「打开它的那个按钮」——键盘用户不会因此迷路。

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  className,
  labelledBy,
  closeMs = 180,
  era,
  children,
}: {
  open: boolean;
  onClose: () => void; // 用户想关闭时调用（按 Esc、点遮罩）；由父组件把 open 改成 false
  className: string;
  labelledBy: string; // 弹窗标题元素的 id，读屏软件用它念出弹窗的名字
  closeMs?: number; // 离场动画的时长，要和 globals.css 里的动画一致
  era?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open) {
      setClosing(false);
      if (!dialog.open) {
        // 记住此刻拥有焦点的元素（通常就是被点击的那个按钮），关闭后把焦点还给它。
        trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        dialog.showModal();
      }
      return;
    }
    if (!dialog.open) return;

    const finish = () => {
      setClosing(false);
      dialog.close();
      const el = trigger.current;
      // 那个按钮可能已经不在页面上了（比如列表被重新渲染），所以先确认一下。
      if (el && document.contains(el)) el.focus();
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    setClosing(true);
    const id = window.setTimeout(finish, closeMs);
    return () => window.clearTimeout(id);
  }, [open, closeMs]);

  return (
    <dialog
      ref={ref}
      className={closing ? `${className} closing` : className}
      aria-labelledby={labelledBy}
      data-era={era}
      // cancel 事件 = 用户按了 Esc。阻止浏览器立刻关闭，改走我们带动画的关闭流程。
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // 点击事件的目标就是 <dialog> 本身，说明点在了内容之外的遮罩上。
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
