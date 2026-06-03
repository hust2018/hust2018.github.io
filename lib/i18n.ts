import type { Lang, MaybeLocalized } from "./types";

// 根据当前语言，从「可能是双语对象、也可能是纯字符串」的值里取出要显示的文本。
// 例：pickLang({ zh: "关于", en: "About" }, "zh") => "关于"
//     pickLang("TypeScript", "zh")              => "TypeScript"
export function pickLang(val: MaybeLocalized | null | undefined, lang: Lang): string {
  if (val == null) return "";
  if (typeof val === "string") return val;
  return val[lang] || val.en || val.zh || "";
}
