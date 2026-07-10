// "use client" 是 Next.js 的指令：写在文件最顶部，表示这是「客户端组件」。
// 客户端组件会在浏览器里运行，因此才能使用浏览器交互（比如 onError）和 React 的 Hook（比如下面的 useState）。
// 不写这行的话，Next.js 默认把组件当成「服务端组件」，那样就不能用 useState 等 Hook。
"use client";

// 从 react 库里导入 useState。
// useState 是一个 Hook（钩子函数），用来在函数组件里「记住」一个会变化的值（叫 state / 状态）。
// 状态变化时，React 会自动重新渲染组件，让界面跟着更新。
import { useState } from "react";

// 头像位：传了 src 就显示图片，没有（或图片加载失败）就显示占位文字。
// 想放头像：把图片放到 public/avatar.jpg，然后在 Hero 里传 src="/avatar.jpg"。
// （Next.js 里 public/ 下的文件，访问路径就是去掉 public 的根路径。）
//
// 下面是一个「函数组件」：本质就是一个返回 JSX（界面描述）的普通函数，函数名首字母大写。
// 括号里的 { src, placeholder } 是「解构」写法：父组件调用时会传进来一个 props 对象（属性集合），
// 这里直接把对象里的 src、placeholder、alt 三个属性取出来当变量用，省得每次写 props.src。
// 冒号后面的对象是 TypeScript 类型标注，说明这些属性各是什么类型：
//   - src?: string  —— 问号表示「可选」，可以不传；传的话必须是字符串。
//   - placeholder: string —— 没有问号，表示「必传」的字符串。
//   - alt: string —— 图片的替代文字，必须由调用方按当前语言提供，不能写死成泛泛的 avatar。
export function ImageSlot({
  src,
  placeholder,
  alt,
}: {
  src?: string;
  placeholder: string;
  alt: string;
}) {
  // 声明一个状态 error，初始值是 false（表示「图片暂时没加载失败」）。
  // useState 返回一个数组，这里用解构同时拿到两样东西：
  //   - error：当前的值；
  //   - setError：用来修改这个值的函数。调用 setError(...) 会更新 error 并触发重新渲染。
  const [error, setError] = useState(false);
  // 条件渲染：如果没有传 src（!src），或者图片加载出错了（error 为 true），
  // 就直接返回占位的 div，里面显示 placeholder 文字。{placeholder} 里的花括号表示在 JSX 中嵌入 JS 表达式的值。
  if (!src || error) {
    return <div className="image-slot-empty">{placeholder}</div>;
  }
  // 下面这行 // eslint-disable-next-line ... 是给代码检查工具 ESLint 看的注释：
  // 关闭它对下一行「应该用 Next.js 的 <Image> 而不是普通 <img>」的警告。这里我们故意用普通 <img>。
  // eslint-disable-next-line @next/next/no-img-element
  return (
    // 有 src 且没出错时，渲染真正的图片。
    //   - src={src}：把传进来的图片地址赋给 img 的 src 属性。
    //   - alt={alt}：使用父组件传来的本地化替代文字，告诉读屏软件照片里是谁。
    //   - onError={() => setError(true)}：图片加载失败时，浏览器会触发 onError 事件，
    //     这里就调用 setError(true) 把状态改成「出错」，于是组件重新渲染、走到上面的占位分支。
    <img className="image-slot-img" src={src} alt={alt} onError={() => setError(true)} />
  );
}
