"use client";
// 唯一的客户端渲染件：把页面里 <pre class="mermaid"> 的源码渲染成图。
// 关键：动态 import 放在 useEffect 里——useEffect 只在浏览器跑，所以不会有 "window is not defined"，
// 也就不需要 next/dynamic 的 ssr:false（它在服务器组件里本来也不允许）。
import { useEffect, useRef } from "react";

export function Mermaid() {
  const ran = useRef(false); // React 19 严格模式开发期会双调用 effect，用它防重复/防噪音
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({ startOnLoad: false, theme: "dark" });
      await mermaid.run({ querySelector: ".mermaid" });
    })();
  }, []);
  return null;
}
