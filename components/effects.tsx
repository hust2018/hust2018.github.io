// "use client" 指令：告诉 Next.js「这个文件是客户端组件」。
// 背景知识：Next.js 默认把组件当成「服务器组件」——只在服务器上跑、生成好 HTML 再发给浏览器，
//   不能用浏览器才有的东西（useState、useEffect、点击事件、window/document 等）。
// 一旦组件需要这些「交互能力」或浏览器 API，就必须在文件最顶部写 "use client"，
//   它会让这些组件额外打包发到浏览器里运行（即「客户端组件」）。
// 本文件里的特效都依赖 useState/useEffect/IntersectionObserver 等，所以必须声明为客户端组件。
"use client";

// 从 react 里导入几个常用的「Hook」。Hook 是 React 提供的特殊函数，名字都以 use 开头，
// 只能在组件函数（或自定义 Hook）内部调用，用来给函数组件「加上记忆和副作用能力」：
//   - useState：让组件拥有「状态」（会变化、变化后自动重新渲染的数据）。
//   - useEffect：在组件渲染后执行「副作用」（定时器、订阅、操作 DOM 等与渲染本身无关的事）。
//   - useRef：拿到一个「引用容器」，常用来引用某个真实 DOM 元素，或存一个不触发重渲染的值。
import { useCallback, useEffect, useRef, useState } from "react";
// 这里只导入「类型」（import type 只在编译期用，打包后会被删掉，不产生运行时代码）：
//   - ReactNode：能被 React 渲染的任意内容的类型（字符串、数字、JSX、它们的数组等），常用于 children。
//   - RefObject：useRef 返回值的类型。
import type { ReactNode, RefObject } from "react";
// 3D 甲板的角度计算保持为纯函数；这个文件只负责把浏览器事件接到它上面。
import { calculateTilt } from "../lib/tilt";

// ---------- 故障风文字 ----------
// 视觉特效靠 CSS 实现，这里只把文字同时塞进 data-text 属性供 CSS 用。
//
// 这是一个「函数组件」：本质就是一个返回 JSX 的普通函数，函数名首字母大写（React 约定，
// 用来和普通 HTML 标签区分）。括号里 { text } 是「解构 props」——
// props 是父组件传进来的参数对象，这里直接把其中的 text 字段取出来用。
// 冒号后面的 { text: string } 是 TypeScript 类型注解：说明 props 必须有一个 string 类型的 text。
export function GlitchText({ text }: { text: string }) {
  // return 后面这一段尖括号写法就是 JSX：长得像 HTML，实际是 JavaScript 的语法糖，
  // 最终会被编译成创建界面元素的函数调用。
  return (
    // className 对应 HTML 的 class 属性（JSX 里因为 class 是 JS 关键字，所以改叫 className）。
    // data-text={text} 把文字也放进自定义的 data-* 属性，CSS 的故障特效会读取它来做重影。
    // 属性值用 {} 包起来表示「这里嵌入一个 JS 表达式」，而不是普通字符串。
    <span className="glitch" data-text={text}>
      {/* {text} 表示把变量 text 的值渲染到这里——在 JSX 中，{} 内可以放任意 JS 表达式 */}
      {text}
    </span>
  );
}

// ---------- 打字机效果 ----------
// 一个字一个字地把 text 显示出来。start 为 false 时不开始（等开机动画结束）。
//
// 这个组件的 props 有三个，其中 speed 和 start 在解构时写了「= 默认值」，
// 表示父组件不传时就用这个默认值（speed 默认 55 毫秒一个字，start 默认 true 立即开始）。
// 类型里 speed?: number 的问号表示「这个属性是可选的」，可传可不传。
export function Typewriter({
  text,
  speed = 55,
  start = true,
}: {
  text: string;
  speed?: number;
  start?: boolean;
}) {
  // useState(0) 创建一个状态 n，初始值是 0；它表示「当前已经显示到第几个字」。
  // 返回值是一个数组：[当前值, 修改它的函数]。这里用解构拿到 n 和 setN。
  // 关键概念：必须通过 setN(...) 来改 n，不能直接 n = 5；只有调用 setN，React 才知道
  // 状态变了，从而「重新渲染」组件（重新执行这个函数、刷新界面）。
  const [n, setN] = useState(0);
  // useEffect(回调, 依赖数组)：组件渲染完成后执行回调里的「副作用」。
  // 这里的副作用是开一个定时器，按节奏推进 n。
  useEffect(() => {
    // 若 start 为 false（还没轮到开始打字），直接 return 退出，什么都不做。
    if (!start) return;
    // 每次（重新）开始打字前，把已显示字数清零，从头打。
    setN(0);
    // i 是本次 effect 内部用的普通变量（不需要触发重渲染，所以不用 state）。
    let i = 0;
    // setInterval：浏览器 API，每隔 speed 毫秒重复执行一次回调，返回一个「定时器 id」。
    const id = setInterval(() => {
      i += 1;
      setN(i); // 把已显示字数 +1 并写回状态，触发界面更新，于是又多显示一个字。
      // 打到最后一个字时，用 clearInterval 停掉定时器，避免它一直空转。
      if (i >= text.length) clearInterval(id);
    }, speed);
    // useEffect 回调可以 return 一个「清理函数」。它会在「组件卸载」或「依赖变化、effect 即将重跑」前被调用。
    // 这里清理掉定时器，防止旧定时器残留导致重复打字或内存泄漏。
    return () => clearInterval(id);
    // 依赖数组 [text, start, speed]：只要其中任一值变化，effect 就会先清理、再重新执行。
    // 这样换了文字、或 start 从 false 变 true 时，打字机会重新开始。
  }, [text, start, speed]);
  // 渲染：用 slice(0, n) 取 text 的前 n 个字符显示出来，n 不断增大就形成「逐字出现」的效果。
  return <span>{text.slice(0, n)}</span>;
}

// ---------- 把 **xxx** 渲染成高亮 ----------
// 简易 markdown：文本里的 **加粗** 转成带高亮样式的 <span>。
export function FormattedBold({ text }: { text: string }) {
  // split(正则) 把字符串切成数组。这里的正则用「捕获分组 (...)」括起了 **...** 这种片段，
  // 当分隔符带括号时，split 会把分隔符本身也保留在结果数组里。
  // 含义：\*\* 匹配两个星号，[^*]+ 匹配中间一段「非星号」的字符，末尾再两个 \*\*；g 表示全局匹配。
  // 于是 "我会**React**和**Vue**" 会被切成 ["我会","**React**","和","**Vue**",""] 这样，
  // 加粗片段和普通文字片段交替出现。String(text) 是保险起见把入参转成字符串。
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    // <>...</> 叫 Fragment（片段），是一个「空壳容器」：组件必须返回单个根节点，
    // 但我们又不想多包一层真实的 <div>，于是用 Fragment 把多个子元素打包返回，
    // 它本身不会在页面上生成任何标签。
    <>
      {/* 用数组的 .map 把每个片段映射成一个 JSX 元素，从而渲染出一个元素列表。
          回调的第一个参数 p 是片段内容，第二个参数 i 是它在数组中的下标。 */}
      {parts.map((p, i) =>
        // 这里用「三元表达式 条件 ? A : B」做条件渲染：是 **...** 包裹的就渲染成高亮 span，否则普通 span。
        p.startsWith("**") && p.endsWith("**") ? (
          // key 是 React 渲染列表时必须给每个元素的「身份证」，帮助 React 高效地识别、
          // 复用和更新列表项。这里用下标 i 作为 key（数据顺序固定时可以这样用）。
          <span key={i} className="highlight">
            {/* slice(2, -2) 去掉首尾各两个星号，只保留中间真正要显示的文字 */}
            {p.slice(2, -2)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// ---------- 「元素是否进入视口」的自定义 Hook ----------
// 用浏览器的 IntersectionObserver 监听某个元素是否滚动进了可视区域，
// 配合 FadeUp 实现「滚到哪里、哪里淡入」。
//
// 这是一个「自定义 Hook」：本质是个普通函数，但名字以 use 开头、内部又用了别的 Hook（useState/useEffect）。
// 作用是把一段「带状态的逻辑」抽出来复用。它不返回 JSX，而是返回一个值（这里返回布尔值）。
// 参数 ref 是外部传进来的「DOM 引用」（指向要监听的那个元素）；返回 boolean 表示该元素是否已进入视口。
export function useInView(ref: RefObject<HTMLElement | null>): boolean {
  // 状态 inView：该元素是否已经出现在屏幕里。初始 false，进入视口后置为 true。
  const [inView, setInView] = useState(false);
  useEffect(() => {
    // ref.current 是 ref 真正指向的 DOM 元素。组件首次渲染时 DOM 可能还没就绪，
    // 这时 current 为 null，直接 return 不做事（等下次有值再说）。
    if (!ref.current) return;
    // checkNow：立刻手动判断一次元素当前是否已经在视口内（应对「一进页面就已经可见」的情况）。
    const checkNow = () => {
      const el = ref.current;
      if (!el) return false;
      // getBoundingClientRect() 返回元素相对「浏览器可视窗口」的位置和尺寸（top/bottom 等）。
      const r = el.getBoundingClientRect();
      // window.innerHeight 是可视窗口的高度；后面的 || 是兜底写法，个别环境下用文档元素的高度。
      const vh = window.innerHeight || document.documentElement.clientHeight;
      // 元素顶端在窗口下边界之上（top < vh）且底端在窗口上边界之下（bottom > 0），即与视口有交叠 = 可见。
      if (r.top < vh && r.bottom > 0) {
        setInView(true);
        return true;
      }
      return false;
    };
    // 如果一开始就已经可见，置位完成后直接 return，不必再装监听器。
    if (checkNow()) return;
    // IntersectionObserver：浏览器 API，专门「高效地」监听元素是否进入/离开视口，
    // 比自己监听 scroll 事件再反复计算位置更省性能。new 出来时传入一个回调。
    const obs = new IntersectionObserver(
      // 回调参数是「被观察元素的状态列表」，这里用解构 [entry] 取第一个（我们只观察一个元素）。
      ([entry]) => {
        // isIntersecting 为 true 表示元素已经和视口交叠（进入屏幕）。
        if (entry.isIntersecting) {
          setInView(true);
          // 已经淡入过就不用再监听了，disconnect() 停止观察、释放资源。
          obs.disconnect();
        }
      },
      // 配置项：threshold: 0 表示「只要露出一点点（交叠比例超过 0）」就触发回调。
      { threshold: 0 }
    );
    // 开始观察目标元素。
    obs.observe(ref.current);
    // requestAnimationFrame：让浏览器在「下一帧绘制前」执行一次 checkNow，
    // 作为再补一次的即时检查（返回一个 id，便于后面取消）。
    const raf = requestAnimationFrame(checkNow);
    // 清理函数：组件卸载或依赖变化时，断开观察器并取消那次 rAF，避免泄漏。
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
    // 依赖数组写 [ref]：ref 变化时重新建立观察。
  }, [ref]);
  // 把「是否已进入视口」这个结果返回给调用方使用。
  return inView;
}

// ---------- 指针驱动的 3D 倾斜 ----------
// 返回一个 ref，调用方把它挂到需要产生视差的 DOM 元素上即可。
// 高频的 pointermove 不写 React state，而是经 requestAnimationFrame 合并后直接更新 CSS 变量：
// 这样只重绘甲板自身，不会让整份简历跟着每一帧重新渲染。
export function usePointerTilt<T extends HTMLElement>(maxAngle = 6): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  // 把尚未执行的动画帧 id 存进 ref；改它不会触发组件重渲染。
  const frameRef = useRef<number | null>(null);

  // useCallback 保证函数引用稳定，避免下面的 effect 因每次渲染拿到新函数而反复拆装监听器。
  const writeTilt = useCallback((rotateX: number, rotateY: number) => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty("--tilt-x", `${rotateX}deg`);
    element.style.setProperty("--tilt-y", `${rotateY}deg`);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // 只有带精确指针的桌面设备才启用鼠标跟随；触屏交给 CSS 的慢速漂浮。
    // 用户系统若要求减少动态效果，这里也完全不注册高频事件。
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    const onMove = (event: PointerEvent) => {
      // 同一绘制帧内只保留最后一次指针位置，避免高刷新率鼠标堆积大量 DOM 写入。
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        const result = calculateTilt({
          pointerX: event.clientX,
          pointerY: event.clientY,
          bounds: element.getBoundingClientRect(),
          maxAngle,
        });
        writeTilt(result.rotateX, result.rotateY);
        frameRef.current = null;
      });
    };

    const onLeave = () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      writeTilt(0, 0);
    };

    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [maxAngle, writeTilt]);

  return ref;
}

// ---------- 滚动淡入容器 ----------
// 把任意内容包进来，滚动到它时就自动淡入。
// children 是个特殊 prop：写在 <FadeUp>这里的内容</FadeUp> 之间的东西会作为 children 传进来。
export function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  // useRef<HTMLDivElement>(null)：创建一个引用容器，初始 null。
  // 下面把它通过 ref={ref} 绑到 <div> 上后，ref.current 就会指向那个真实的 div DOM 元素。
  const ref = useRef<HTMLDivElement>(null);
  // 复用上面写的自定义 Hook，得到「这个 div 是否已进入视口」。
  const visible = useInView(ref);
  return (
    <div
      ref={ref}
      // 模板字符串（反引号）拼 class：基础类 fade-up；可见时追加 in 类（CSS 据此做淡入）；
      // 再拼上外部传入的 className。${...} 里嵌入 JS 表达式，visible ? "in" : "" 是条件拼接。
      className={`fade-up ${visible ? "in" : ""} ${className}`}
      // style 接收一个 JS 对象（注意是双层花括号：外层是 JSX 的{}，内层是对象字面量{}）。
      // transitionDelay 设置 CSS 过渡延迟，让多个元素能错开先后淡入。
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* 把包裹的内容原样渲染出来 */}
      {children}
    </div>
  );
}

// ---------- 实时时钟 Hook ----------
// 每秒更新一次当前时间，给顶栏的 TIME 用。
export function useClock(): Date | null {
  // 初值为 null：服务器端渲染时没有「当前时间」，等浏览器挂载后再设，
  // 避免服务器和浏览器渲染出不同的时间导致 hydration 警告。
  // 补充「hydration（水合）」概念：Next 会先在服务器把组件渲成 HTML 字符串发给浏览器（首屏快），
  //   随后浏览器再让 React「接管」这段已有 HTML、给它装上交互逻辑——这一步就叫水合。
  //   要求服务器渲染的结果和浏览器首次渲染的结果必须一致，否则会报 hydration 不匹配警告。
  //   时间每时每刻都不同，若一开始就用 new Date()，服务器和浏览器算出的时间会不一样，
  //   所以这里先给 null，等到了浏览器（useEffect 里）才填真实时间。
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // useEffect 只在浏览器里执行（不会在服务器跑），所以在这里取真实当前时间是安全的。
    setNow(new Date());
    // 每隔 1000 毫秒（1 秒）刷新一次时间，让时钟走起来。
    const id = setInterval(() => setNow(new Date()), 1000);
    // 清理定时器，组件卸载时停掉，避免它在后台一直跑。
    return () => clearInterval(id);
    // 空依赖数组 []：表示这个 effect 只在组件「首次挂载」时执行一次，之后不再重复。
  }, []);
  return now;
}

// ---------- 区块标题 ----------
// 各个区块（关于/技能/经历…）顶部那行统一样式的标题。
// num 是编号，title 是标题文字，meta 是可选的附加信息（类型 ReactNode，可放文字或 JSX）。
export function SectionHead({
  num,
  title,
  meta,
}: {
  num: string;
  title: string;
  meta?: ReactNode;
}) {
  return (
    <div className="section-head">
      {/* [ 01 ] 这种编号；{num} 把编号变量插进方括号中间，注意保留了前后空格 */}
      <span className="num">[ {num} ]</span>
      <h2>
        {/* 模拟终端提示符的 $ 符号 */}
        <span className="prompt-char">$</span>
        {title}
      </h2>
      {/* 条件渲染的另一种写法：meta && <...>。
          当 meta 有值（真）时渲染后面的 span；为空（假）时整体结果是假值，React 不渲染任何东西。
          这是「只在有内容时才显示」的常用简写。 */}
      {meta && <span className="meta">{meta}</span>}
    </div>
  );
}
