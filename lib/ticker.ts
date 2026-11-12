// 全站共用的「每帧时钟」。
//
// 页面上有很多跟着滚动/鼠标走的特效（粒子、跑马灯、横向时间线、逐词点亮…）。
// 如果每个特效都自己开一个 requestAnimationFrame 循环、自己监听 scroll，
// 既浪费性能，又容易出现「这个特效看到的滚动位置和那个不一样」的问题。
// 所以这里只开一个循环，每帧把滚动位置、鼠标位置算好，再分发给所有订阅者。
//
// 概念：requestAnimationFrame(fn) 让浏览器在「下一次重绘之前」调用 fn，
// 一秒大约 60 次，页面在后台时会自动暂停。它是做动画的标准时钟。
//
// 这个文件不依赖 React：组件通过 components/effects.tsx 里的 useFrame / useLayout 来订阅。
// 注意它是「模块级单例」——所有组件导入的是同一份状态。

export interface FrameState {
  now: number; // 当前时间戳（毫秒）
  dt: number; // 距离上一帧的毫秒数
  y: number; // 真实的滚动位置
  sy: number; // 平滑后的滚动位置：装饰性位移用它，会有一点「跟手的惯性」
  vel: number; // 平滑后的滚动速度（像素 / 帧）
  vw: number; // 视口宽
  vh: number; // 视口高
  pointerX: number;
  pointerY: number;
  pointerOn: boolean; // 鼠标是否在页面里
  pointerTarget: Element | null; // 鼠标当前指着的元素
  keyboard: boolean; // 最近一次输入是否来自键盘 Tab（用来判断要不要跟随焦点）
  reduced: boolean; // 用户是否要求「减少动态效果」
  fine: boolean; // 是否是鼠标这类精确指针设备
}

type FrameFn = (state: FrameState) => void;
type LayoutFn = () => void;

const state: FrameState = {
  now: 0,
  dt: 16.7,
  y: 0,
  sy: 0,
  vel: 0,
  vw: 0,
  vh: 0,
  pointerX: -9999,
  pointerY: -9999,
  pointerOn: false,
  pointerTarget: null,
  keyboard: false,
  reduced: false,
  fine: false,
};

// Set 是「不重复的集合」，用来存订阅者：add 订阅，delete 退订。
const frameSubs = new Set<FrameFn>();
const layoutSubs = new Set<LayoutFn>();

let started = false;
let lastT = 0;
let prevY = 0;
let docHeight = 0;
let tick = 0;
let layoutQueued = false;
let resizeTimer = 0;

// 通知所有订阅者「尺寸变了，请重新量一遍」。
function emitLayout() {
  layoutQueued = false;
  state.vw = window.innerWidth;
  state.vh = window.innerHeight;
  state.fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  // 先复制成数组再遍历：订阅者在回调里退订/新订阅时，不会影响这一轮遍历。
  for (const fn of Array.from(layoutSubs)) {
    try {
      fn();
    } catch (error) {
      console.warn("[layout]", error);
    }
  }
  docHeight = document.documentElement.scrollHeight;
}

function loop(now: number) {
  state.dt = lastT ? Math.min(64, now - lastT) : 16.7;
  lastT = now;
  state.now = now;

  const y = window.scrollY || 0;
  const dy = y - prevY;
  prevY = y;
  state.y = y;
  // 速度和位置都做一点平滑：每帧只走「目标与当前值之差」的一部分。
  state.vel += (dy - state.vel) * 0.25;
  if (Math.abs(state.vel) < 0.01) state.vel = 0;
  state.sy = state.reduced || Math.abs(y - state.sy) < 0.2 ? y : state.sy + (y - state.sy) * 0.16;

  // 兜底：文档高度悄悄变了（字体换入、图片加载、二维码展开），就重新量一次。
  if (++tick % 45 === 0 && Math.abs(document.documentElement.scrollHeight - docHeight) > 2) {
    layoutQueued = true;
  }
  if (layoutQueued) emitLayout();

  for (const fn of Array.from(frameSubs)) {
    try {
      fn(state);
    } catch (error) {
      // 某个特效出错时只停掉它自己，其余特效照常运行。
      frameSubs.delete(fn);
      console.warn("[frame]", error);
    }
  }
  requestAnimationFrame(loop);
}

function start() {
  // typeof window === "undefined" 说明代码正在构建时（Node）运行，没有浏览器环境，直接跳过。
  if (started || typeof window === "undefined") return;
  started = true;

  state.vw = window.innerWidth;
  state.vh = window.innerHeight;
  state.y = state.sy = prevY = window.scrollY || 0;
  state.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  state.fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  docHeight = document.documentElement.scrollHeight;

  // passive: true 告诉浏览器「这个监听器不会阻止默认行为」，滚动和触摸会更顺。
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      state.pointerX = event.clientX;
      state.pointerY = event.clientY;
      state.pointerOn = true;
      state.pointerTarget = event.target instanceof Element ? event.target : null;
    },
    { passive: true },
  );
  document.documentElement.addEventListener("mouseleave", () => {
    state.pointerOn = false;
  });
  window.addEventListener("blur", () => {
    state.pointerOn = false;
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Tab") state.keyboard = true;
  });
  window.addEventListener("pointerdown", () => {
    state.keyboard = false;
  });
  // 拖动窗口大小时 resize 会连续触发很多次；等停下 160ms 后再统一重新量。
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(requestLayout, 160);
  });
  window.addEventListener("load", requestLayout);
  // 网络字体加载完成后，文字宽度会变，也要重新量。
  document.fonts?.ready.then(requestLayout).catch(() => {});

  requestAnimationFrame(loop);
}

// 订阅每一帧。返回一个「退订函数」——这正好是 useEffect 清理函数想要的形状。
export function onFrame(fn: FrameFn): () => void {
  start();
  frameSubs.add(fn);
  return () => {
    frameSubs.delete(fn);
  };
}

// 订阅「需要重新测量」的时刻（窗口变化、字体就绪、文档高度变化）。
export function onLayout(fn: LayoutFn): () => void {
  start();
  layoutSubs.add(fn);
  return () => {
    layoutSubs.delete(fn);
  };
}

// 请求在下一帧统一重新测量。多次调用只会触发一次。
export function requestLayout(): void {
  layoutQueued = true;
}

// 读取当前这一帧的状态（比如想知道用户是否要求减少动态效果）。
export function getFrameState(): FrameState {
  start();
  return state;
}

// 用代码瞬间改了滚动位置之后调用：让平滑值直接跟上，避免装饰位移「追」一段距离。
export function syncScroll(): void {
  if (typeof window === "undefined") return;
  state.y = state.sy = prevY = window.scrollY || 0;
  state.vel = 0;
}
