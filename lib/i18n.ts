// i18n 是 internationalization（国际化）的缩写：i + 中间 18 个字母 + n。
// 这个文件提供「按当前语言取文本」的工具函数，是中英文切换的核心小帮手。

// 概念：`import` 把别的模块导出的东西引进来。这里从 "./types" 引入两个类型。
// `import type { ... }`：加 type 表示「只引入类型」——类型只在编译期做检查，
// 编译成 JS 后会被完全擦除，不会产生任何运行时代码。
// "./types" 是相对路径，指向同目录下的 types.ts（扩展名可省略）。
import type { Lang, MaybeLocalized } from "./types";

// 根据当前语言，从「可能是双语对象、也可能是纯字符串」的值里取出要显示的文本。
// 例：pickLang({ zh: "关于", en: "About" }, "zh") => "关于"
//     pickLang("TypeScript", "zh")              => "TypeScript"
//
// 参数 val 的类型是 `MaybeLocalized | null | undefined`：再用联合类型扩了两种空值，
// 表示传进来的也可能是 null 或 undefined（没值的情况），函数要能稳妥处理。
// 末尾的 `: string` 是「返回值类型」，承诺这个函数一定返回字符串。
export function pickLang(val: MaybeLocalized | null | undefined, lang: Lang): string {
  // 没值就返回空字符串，避免后面的代码在 null/undefined 上出错。
  // `== null` 用的是宽松相等，能一次性同时命中 null 和 undefined 两种情况。
  if (val == null) return "";
  // `typeof val === "string"` 判断它是不是纯字符串。
  // 这一步过后，TypeScript 会「收窄」类型，知道下面的 val 只可能是 Localized 对象了
  //（这叫类型收窄 / type narrowing）。纯字符串无需翻译，原样返回。
  if (typeof val === "string") return val;
  // 走到这里 val 一定是双语对象。`val[lang]` 用变量当键来取值：
  // lang 是 "zh" 就取 val.zh，是 "en" 就取 val.en。
  // `||` 是「短路或」：左边为空（空字符串/undefined 等假值）时退回到右边，
  // 形成一条兜底链——优先当前语言，没有就退英文、再退中文，最后退空字符串，保证不返回空值。
  return val[lang] || val.en || val.zh || "";
}
