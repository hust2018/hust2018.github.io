// "use client" 是 Next.js（App Router）的指令：声明这个文件是「客户端组件」。
// 因为这里用到了 useState/useEffect、localStorage、浏览器事件（鼠标拖动）等
// 只能在浏览器里运行的东西，必须标成客户端组件，否则会在服务器端报错。
"use client";

// 从 react 引入几个「Hook」。Hook 是 React 提供的特殊函数，名字都以 use 开头，
// 只能在组件函数或自定义 Hook 内部调用，用来给函数组件加上「状态」「副作用」等能力。
import { useCallback, useEffect, useRef, useState } from "react";
// 只引入类型（type）：ReactNode 表示「任何能被 React 渲染的东西」，
// 比如文字、数字、JSX 元素、它们的数组等。import type 不会打包进运行时代码。
import type { ReactNode } from "react";

// ── useTweaks ────────────────────────────────────────────────────────────────
// 管理一组「风格设置」并持久化到浏览器的 localStorage。
// 泛型 <T> 让它能记住传入对象的具体形状，setTweak 的 key 会被限制为 T 的字段名。
//
// 这是一个「自定义 Hook」：它本质上是个普通函数，但因为名字以 use 开头，
// 内部又调用了 useState/useEffect/useCallback 这些内置 Hook，所以归类为 Hook。
// 自定义 Hook 的意义是「把一段可复用的状态逻辑抽出来」，组件调用它即可拿到结果，
// 而不必把这堆 localStorage 读写逻辑重复写在每个组件里。
//
// 关于泛型 <T extends Record<string, unknown>>：
// - 泛型就像「类型的参数」。这里的 T 不是固定类型，而是「调用时传进来的那个对象的类型」。
// - extends Record<string, unknown> 是约束，意思是「T 必须是一个对象」（键是字符串、值任意）。
// - 好处：你传入 { density: "compact", dark: true } 时，T 就被「记住」成这个具体形状，
//   于是后面的 setTweak 能知道有哪些合法字段、每个字段该是什么类型。
export function useTweaks<T extends Record<string, unknown>>(
  defaults: T
): [T, <K extends keyof T>(key: K, val: T[K]) => void] {
  // useState 给组件/Hook 一个「会被记住的状态值」。它返回一个数组：
  // [当前值, 修改它的函数]。每次调用修改函数，React 会用新值重新渲染界面。
  // 这里初始值就是传进来的 defaults（默认设置）。
  const [values, setValues] = useState<T>(defaults);

  // 挂载后从 localStorage 读取上次保存的设置，合并到默认值上。
  // 放在 useEffect 里（而非初始值）是为了让服务器端和首次渲染都用 defaults，
  // 避免「服务器渲染结果」和「浏览器渲染结果」不一致的 hydration 警告。
  //
  // useEffect 用来处理「副作用」——即渲染之外、与外部世界打交道的事情
  // （读写 localStorage、订阅事件、请求网络等）。它的回调会在「组件渲染到页面之后」才执行。
  // 第二个参数 [] 是「依赖数组」：空数组表示这段逻辑只在组件首次挂载时跑一次。
  //
  // 为什么不把 localStorage 直接当成 useState 的初始值？
  // Next.js 会先在服务器上把页面渲染成 HTML（那里没有 localStorage），
  // 再到浏览器里「水合（hydration）」接管这份 HTML。如果初始值在两边不一样，
  // React 会警告「服务器和客户端渲染结果不一致」。所以两边都先用 defaults 保证一致，
  // 等到了浏览器、组件挂载后，再用 useEffect 去读 localStorage 把真正的设置补上。
  useEffect(() => {
    try {
      // 取出之前用同一个 key 存进去的字符串（没有则为 null）。
      const raw = localStorage.getItem("resume-tweaks");
      // setValues 传入一个函数 (prev) => ...，prev 是「当前最新的值」。
      // 这里用对象展开 { ...prev, ...解析出来的对象 } 做合并：
      // 先铺开默认值，再用存档里的值覆盖，这样新增的默认字段也不会丢。
      if (raw) setValues((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      /* localStorage 不可用时静默忽略 */
    }
  }, []);

  // setTweak：修改其中「某一个字段」并立刻存回 localStorage。
  // useCallback 把这个函数「缓存」起来：依赖数组为 [] 表示每次渲染都返回同一个函数引用，
  // 不会每次重新创建，这样把它传给子组件时能减少不必要的重渲染。
  //
  // 这里又用到泛型 <K extends keyof T>：
  // - keyof T 表示「T 这个对象所有键名组成的类型」（比如 "density" | "dark" | ...）。
  // - 所以 key 只能填合法的字段名，写错名字 TypeScript 会报错。
  // - 而 val 的类型是 T[K]，意思是「key 对应字段的类型」：
  //   传 "dark" 时 val 必须是 boolean，传 "density" 时必须是对应的类型，类型自动匹配，防止填错。
  const setTweak = useCallback(<K extends keyof T>(key: K, val: T[K]) => {
    setValues((prev) => {
      // 基于最新的 prev 复制一份，并只改动 [key] 这个字段。
      // [key] 是「计算属性名」语法：用变量的值作为键名。
      const next = { ...prev, [key]: val };
      try {
        // 把整份设置序列化成字符串存进 localStorage，下次打开页面还能读回来。
        localStorage.setItem("resume-tweaks", JSON.stringify(next));
      } catch {
        /* ignore */
      }
      // 返回 next 作为新的状态值，触发界面用新设置重新渲染。
      return next;
    });
  }, []);

  // 自定义 Hook 把结果「返回」给调用它的组件用。这里返回一个数组（元组）：
  // [当前所有设置, 修改单个设置的函数]，用法和 useState 很像，组件这样接：
  //   const [tweaks, setTweak] = useTweaks({ ... })
  return [values, setTweak];
}

// 面板自身的样式（一段 CSS 字符串，通过 <style> 注入）。保留原型的视觉。
//
// 这里整段就是普通的 CSS，只是写成了 JS 里的「模板字符串」（用反引号 ` 包起来）。
// 后面在 JSX 里会写 <style>{TWEAKS_STYLE}</style>，把这段文本作为内联样式塞进页面，
// 浏览器读到后就会应用这些 .twk-xxx 类名的样式。
// 之所以用这种方式而不是单独的 .css 文件，是为了让这个组件「自带样式、开箱即用」，
// 把外观和逻辑放在同一个文件里，复制走也不会漏样式。
// 下面每条规则对应一个界面元素（fab=右下角圆按钮、panel=面板、seg=分段选择器…），
// 具体的属性（颜色、圆角、阴影、模糊等）作为初学者不必逐条记，知道它是「样式」即可。
const TWEAKS_STYLE = `
  .twk-fab{position:fixed;right:16px;bottom:16px;z-index:2147483646;
    appearance:none;border:.5px solid rgba(255,255,255,.18);
    background:rgba(20,22,30,.7);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);
    color:#e8eaf0;width:40px;height:40px;border-radius:12px;cursor:pointer;
    font-size:18px;line-height:1;box-shadow:0 8px 24px rgba(0,0,0,.35)}
  .twk-fab:hover{background:rgba(30,33,44,.85)}
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.82);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,-apple-system,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none}
  .twk-hd b{font-size:12px;font-weight:600;letter-spacing:.01em}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:13px;line-height:1}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:2px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;overflow-x:hidden;min-height:0}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;align-items:baseline;color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-val{color:rgba(41,38,27,.5);font-variant-numeric:tabular-nums}
  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:10px 0 0}
  .twk-sect:first-child{padding-top:0}
  .twk-field{appearance:none;box-sizing:border-box;width:100%;min-width:0;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s cubic-bezier(.3,.7,.4,1),width .15s}
  .twk-seg.dragging .twk-seg-thumb{transition:none}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:pointer;padding:4px 6px;line-height:1.2;overflow-wrap:anywhere}
  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:pointer;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}
  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;min-width:0;height:34px;padding:0;border:0;
    border-radius:6px;overflow:hidden;cursor:pointer;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12),0 1px 2px rgba(0,0,0,.06);transition:transform .12s,box-shadow .12s}
  .twk-chip:hover{transform:translateY(-1px)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 1.5px rgba(0,0,0,.85),0 2px 6px rgba(0,0,0,.15)}
  .twk-chip svg{position:absolute;top:6px;left:6px;width:13px;height:13px;
    filter:drop-shadow(0 1px 1px rgba(0,0,0,.3))}
`;

// ── 面板外壳 ──────────────────────────────────────────────────────────────────
// 右下角 ⚙ 按钮：点开/收起设置面板。面板可拖动。
//
// 函数参数用了「解构 + 默认值」的写法：从传进来的 props 对象里取出 title 和 children。
// title = "Tweaks" 表示没传 title 时默认用 "Tweaks"。
// children 是个特殊 prop：表示「写在这个组件标签内部的内容」，
// 即 <TweaksPanel> 这里的东西 </TweaksPanel> 会作为 children 传进来，
// 下面用 {children} 把它渲染到面板主体里——这样具体放哪些控件由调用方决定。
export function TweaksPanel({
  title = "Tweaks",
  children,
}: {
  // 后面这个 { ... } 是 props 的「类型标注」：? 表示该字段可选。
  title?: string;
  children: ReactNode;
}) {
  // open：面板是展开还是收起。false=收起（只显示 ⚙ 按钮）。点按钮时 setOpen 改变它。
  const [open, setOpen] = useState(false);
  // useRef 创建一个「盒子」对象，它的 .current 属性可以存任意值且在多次渲染间保持不变，
  // 而且改它「不会」触发重新渲染。这里用来直接拿到面板那个 DOM 元素（HTMLDivElement）。
  // 下面 JSX 里写 ref={dragRef}，React 就会把真实 DOM 节点塞进 dragRef.current。
  const dragRef = useRef<HTMLDivElement>(null);
  // 记录面板当前距离右、下边缘的偏移量（拖动后的位置），初始都是 16 像素。
  // 用 ref 而不是 state，是因为拖动时频繁更新，不希望每动一下就重渲染整个组件。
  const offsetRef = useRef({ x: 16, y: 16 });

  // 按住标题栏拖动面板。
  // 这是经典的「拖拽」实现套路：按下时记录起点，然后在整个 window 上临时监听鼠标移动，
  // 松手时再把监听移除。监听挂到 window 而不是元素上，是为了即使鼠标移出面板也能继续跟手。
  const onDragStart = (e: React.MouseEvent) => {
    const panel = dragRef.current;
    if (!panel) return; // DOM 还没准备好就直接返回，避免后面访问 null 出错
    // getBoundingClientRect 拿到元素当前在屏幕上的位置和尺寸。
    const r = panel.getBoundingClientRect();
    // 记录鼠标按下时的起始坐标（start x / start y）。
    const sx = e.clientX;
    const sy = e.clientY;
    // 面板用 right/bottom 定位，这里换算出它此刻离右、下边缘的距离作为起点。
    const startRight = window.innerWidth - r.right;
    const startBottom = window.innerHeight - r.bottom;
    // move：鼠标移动时执行。用「起始距离 - 鼠标位移」得到新的 right/bottom，
    // 即鼠标往右移面板就该离右边更近。Math.max(8, ...) 保证不会被拖出屏幕（至少留 8px）。
    const move = (ev: MouseEvent) => {
      const x = Math.max(8, startRight - (ev.clientX - sx));
      const y = Math.max(8, startBottom - (ev.clientY - sy));
      offsetRef.current = { x, y };
      // 直接改 DOM 的 style 来移动面板，比走 React state 更新更跟手、更省。
      panel.style.right = x + "px";
      panel.style.bottom = y + "px";
    };
    // up：松开鼠标时执行，把上面临时挂的两个监听都移除，避免一直监听造成泄漏/误触。
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  // 下面是 JSX：用类似 HTML 的语法描述界面。注意在 JSX 内部写注释要用 {/* ... */}。
  return (
    // <>...</> 是「Fragment」，一个不产生额外 DOM 节点的空壳，
    // 用来一次返回多个相邻元素（这里是 <style> 和按钮/面板）。
    <>
      {/* 把上面那段 CSS 字符串作为内联样式注入页面 */}
      <style>{TWEAKS_STYLE}</style>
      {/* 三元表达式做条件渲染：没展开就显示 ⚙ 按钮，展开了就显示整个面板 */}
      {!open ? (
        // 点击 ⚙ 按钮，setOpen(true) 把状态改成展开。aria-label 是给读屏软件用的无障碍说明。
        <button className="twk-fab" aria-label="Open tweaks" onClick={() => setOpen(true)}>
          ⚙
        </button>
      ) : (
        <div
          ref={dragRef}
          className="twk-panel"
          // 用记录的偏移量设置面板初始位置（style 接受一个对象）。
          style={{ right: offsetRef.current.x, bottom: offsetRef.current.y }}
        >
          {/* 标题栏：onMouseDown 触发拖动（CSS 里给它设了 cursor:move） */}
          <div className="twk-hd" onMouseDown={onDragStart}>
            <b>{title}</b>
            <button
              className="twk-x"
              aria-label="Close tweaks"
              // 关闭按钮也在标题栏里。这里 stopPropagation() 阻止鼠标按下事件「冒泡」到外层标题栏，
              // 否则点关闭按钮会被当成「开始拖动面板」，造成误触。
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
          </div>
          {/* 面板主体：把调用方塞进来的 children（各种控件）渲染在这里 */}
          <div className="twk-body">{children}</div>
        </div>
      )}
    </>
  );
}

// ── 各种控件 ──────────────────────────────────────────────────────────────────

// TweakSection：一个「分组小标题」+ 它下面的内容。
// 用来把面板里的设置分门别类，比如「排版」「配色」各放一段。
// 它本身不带状态，只是把 label 显示成小标题，再把 children 原样渲染出来。
export function TweakSection({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <>
      <div className="twk-sect">{label}</div>
      {children}
    </>
  );
}

// TweakRow：一行设置的通用外壳——左边是标签 label，右边可选地显示当前值 value，
// 下面再放真正的控件（通过 children 传入）。其他控件大多复用它来保持排版一致。
// 注意它没有 export，因为只在这个文件内部给别的控件用。
function TweakRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="twk-row">
      <div className="twk-lbl">
        <span>{label}</span>
        {/* value != null && <...> 是「短路渲染」：只有 value 有值时才显示右侧的当前值，
            否则 false 不会渲染出任何东西 */}
        {value != null && <span className="twk-val">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// 分段选择器里每个选项的形状：value 是真正存的值，label 是显示给用户看的文字。
type RadioOption = { value: string; label: string };

// 分段选择器（像 iOS 的 segmented control），可点可拖。
//
// 这是个「受控组件」：它自己不保存当前选中的值，而是
// - 通过 value 这个 prop 接收「现在选的是哪个」（由父组件持有）；
// - 当用户操作时，调用 onChange 这个回调函数，把新值「通知」父组件，
//   父组件再去更新状态、把新的 value 传回来，界面才更新。
// 这种「值由外面给、变化往外面报」的模式让父组件成为唯一的数据来源，便于统一管理。
export function TweakRadio({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: RadioOption[];
  // onChange 的类型是「一个接收字符串、不返回值的函数」。父组件传进来，子组件来调用它。
  onChange: (v: string) => void;
}) {
  // 指向整条选择器轨道的 DOM，拖动时要靠它的位置/宽度算鼠标落在第几段。
  const trackRef = useRef<HTMLDivElement>(null);
  // dragging：是否正在拖动。用 state 因为它要影响 className（拖动时去掉滑块过渡动画）。
  const [dragging, setDragging] = useState(false);
  // valueRef：用一个 ref 存「最新的 value」。
  // 为什么需要它？下面 onPointerDown 里会创建 move/up 这些事件函数，它们会通过「闭包」
  // 记住创建那一刻的变量。如果直接用 value，拖动过程中读到的会是「按下时那个旧 value」，
  // 不会随父组件更新而变。把最新值同步写进 valueRef.current，事件函数读 valueRef.current
  // 就总能拿到最新值——这是「用 ref 绕过闭包旧值」的常见技巧。
  const valueRef = useRef(value);
  // 每次渲染都把最新的 value 写进 ref。这一行在组件函数体里执行，所以总是最新的。
  valueRef.current = value;

  // 当前选中项在 options 里的下标。findIndex 找不到会返回 -1，用 Math.max(0, ...) 兜底成 0。
  const idx = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  // 选项总数，用于均分轨道宽度。
  const n = options.length;

  // segAt：给一个鼠标横坐标 clientX，算出它落在第几段，返回那一段对应的 value。
  // 几何思路（点到即可）：拿到轨道的左边界和总宽，减去内边距得到可用宽 inner，
  // 用「鼠标到轨道左侧的距离 / 每段宽度」向下取整得到段号 i，再夹在 [0, n-1] 范围内。
  const segAt = (clientX: number): string => {
    const track = trackRef.current;
    if (!track) return valueRef.current; // 没拿到 DOM 就返回当前值，不做改动
    const r = track.getBoundingClientRect();
    const inner = r.width - 4; // 减去左右各 2px 的内边距
    const i = Math.floor(((clientX - r.left - 2) / inner) * n);
    return options[Math.max(0, Math.min(n - 1, i))].value;
  };

  // 在轨道上按下指针时触发。onPointerDown 兼容鼠标/触屏/触控笔（比只用鼠标事件更通用）。
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    // 按下的位置就先选中那一段（只有和当前不同才通知父组件，避免多余更新）。
    const v0 = segAt(e.clientX);
    if (v0 !== valueRef.current) onChange(v0);
    // 拖动过程中：指针每移动一下就算当前段，变了就通知父组件——实现「拖着滑过去选」。
    // 这里读 valueRef.current 而非 value，正是为了拿到父组件刚更新的最新值（见上面解释）。
    const move = (ev: PointerEvent) => {
      const v = segAt(ev.clientX);
      if (v !== valueRef.current) onChange(v);
    };
    // 松开指针：结束拖动状态，并移除临时监听。
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // 同样把监听挂到 window 上，保证指针移出轨道也能继续跟手，直到松开。
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <TweakRow label={label}>
      <div
        ref={trackRef}
        role="radiogroup"
        onPointerDown={onPointerDown}
        // 拖动时加上 dragging 类，CSS 里会让滑块「立即跟手」而不是带过渡动画。
        className={dragging ? "twk-seg dragging" : "twk-seg"}
      >
        {/* 这个滑块是高亮当前选项的小白块。用 CSS calc 按下标 idx 和总数 n 算出它的 left 和 width，
            从而精确地停在第 idx 段上、宽度正好是 1/n */}
        <div
          className="twk-seg-thumb"
          style={{
            left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
            width: `calc((100% - 4px) / ${n})`,
          }}
        />
        {/* options.map(...) 把每个选项渲染成一个按钮。React 要求列表里每项有唯一的 key，
            方便它高效地比对更新，这里用 o.value 作为 key */}
        {options.map((o) => (
          <button key={o.value} type="button" role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  );
}

// TweakToggle：开关（像 iOS 的那种圆头开关）。也是受控组件：
// value 是当前开/关（boolean），点击时调用 onChange(!value) 把「取反后的值」报给父组件。
export function TweakToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="twk-row twk-row-h">
      <div className="twk-lbl">
        <span>{label}</span>
      </div>
      <button
        type="button"
        className="twk-toggle"
        // data-on 是自定义的「data 属性」，CSS 里用 [data-on="1"] 选中它来切换开/关的外观。
        data-on={value ? "1" : "0"}
        // role/aria-checked 是无障碍属性，告诉读屏软件「这是一个开关，当前状态如何」。
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
      >
        {/* <i /> 是开关里那个会左右滑动的小圆点，纯靠 CSS 画出来 */}
        <i />
      </button>
    </div>
  );
}

// 判断颜色深浅，决定对勾用深色还是白色。
// 思路：把 "#aabbcc" 这样的十六进制颜色拆成红(r)、绿(g)、蓝(b) 三个 0~255 的分量，
// 用一个加权公式算出「感知亮度」（人眼对绿色最敏感、蓝色最弱，所以权重不同），
// 亮度高于阈值就认为是「浅色」，返回 true。浅色背景上对勾画深色，深色背景上画白色，才看得清。
function isLight(hex: string): boolean {
  const h = hex.replace("#", ""); // 去掉开头的 #
  // 兼容简写：3 位（如 "abc"）的每个字符翻倍变成 6 位（"aabbcc"）；否则补足到 6 位。
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, "0");
  const n = parseInt(x.slice(0, 6), 16); // 把 6 位十六进制解析成一个整数
  if (Number.isNaN(n)) return true; // 解析失败（颜色不合法）就当成浅色处理
  // 用位运算从这个整数里取出 r、g、b 三个字节（& 255 取低 8 位）。
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  // 加权亮度公式（经典的 299/587/114 权重），超过阈值即判为浅色。
  return r * 299 + g * 587 + b * 114 > 148000;
}

// 配色选择：一排色块，点选当前 accent 颜色。
// options 是一组颜色字符串（如 ["#ff0000", "#00aa55", ...]），value 是当前选中的那个。
// 同样是受控组件：点哪个色块就 onChange 把那个颜色报给父组件。
export function TweakColor({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <TweakRow label={label}>
      <div className="twk-chips" role="radiogroup">
        {/* 这里 map 的回调用了花括号 { } 形式，因为内部要先算一个变量再 return */}
        {options.map((c) => {
          // on：这个色块是不是当前选中的。转小写比较，避免大小写写法不同导致匹配不上。
          const on = c.toLowerCase() === value.toLowerCase();
          return (
            <button
              key={c}
              type="button"
              className="twk-chip"
              role="radio"
              aria-checked={on}
              data-on={on ? "1" : "0"}
              aria-label={c}
              title={c}
              // 把按钮背景直接设成这个颜色，这样色块本身就展示了它代表的颜色。
              style={{ background: c }}
              onClick={() => onChange(c)}
            >
              {/* 只有选中的色块才画对勾。这段 <svg> 是矢量图形画出来的一个勾。
                  其中 stroke 用 isLight(c) 判断背景深浅：浅底用深色勾、深底用白勾，保证看得清。 */}
              {on && (
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path
                    d="M3 7.2 5.8 10 11 4.2"
                    fill="none"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    stroke={isLight(c) ? "rgba(0,0,0,.78)" : "#fff"}
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </TweakRow>
  );
}
