// 这个文件只定义「类型」，不包含任何会真正运行的逻辑。
// 它像一份「数据形状的说明书」：规定简历数据每个字段该是什么样子，
// 这样写 data.ts 时一旦写错（漏字段、类型不对），编辑器和编译器会立刻提醒。
//
// 概念：`type` 关键字给某种数据形状起一个名字（类型别名）。
// 起好名字后，别处就能用这个名字代替一长串具体写法，复用又清晰。
//
// 概念：`export`（导出）是 ES 模块机制的一部分。每个 .ts/.js 文件都是一个独立「模块」，
// 文件内部的东西默认外人看不到；加上 export 才能被别的文件用 `import` 引入。
// 下面每个类型前都有 export，所以 data.ts、i18n.ts 才能 import 它们。

// 语言只有两种取值：中文或英文。用联合类型 "zh" | "en" 限定，
// 写成别的字符串 TypeScript 会报错。
//
// 概念：联合类型用竖线 `|` 连接，表示「值只能是其中之一」。
// 这里两个成员都是「字面量类型」——即值必须正好等于 "zh" 或 "en" 这两个具体字符串。
export type Lang = "zh" | "en";

// 一段「双语文本」：同时有中文和英文。
//
// 概念：`{ zh: string; en: string }` 是「对象类型」，描述一个对象要有哪些字段、
// 每个字段是什么类型。这里要求对象必须同时有 zh 和 en 两个字段，且都是字符串。
export type Localized = { zh: string; en: string };

// 有些字段可能是纯字符串（无需翻译，如 "TypeScript"），
// 也可能是双语对象。用联合类型表示「两者皆可」。
// 这里联合的是两个「类型」（string 或 Localized），而不是具体字面量值。
export type MaybeLocalized = string | Localized;

// 双语的「多段文字」：中英文各是一个字符串数组（每段一条）。
// 概念：`string[]` 表示「由字符串组成的数组」，[] 就代表数组。
export type LocalizedList = { zh: string[]; en: string[] };

// 概念：`interface`（接口）和上面的 `type` 都能描述对象的形状，作用很接近。
// 习惯上：描述「对象/数据结构」常用 interface，给联合类型等起别名常用 type。
// 这里每个 interface 对应简历里的一个区块。
//
// Meta：终端风格里模拟的命令行环境信息（用户名、主机名、当前目录等），
// 都是固定英文文本，所以用普通 string 而非 Localized。
export interface Meta {
  handle: string;
  user: string;
  host: string;
  cwd: string;
}

// Hero：页面顶部的「主视觉」区块——名字、职位、一句话简介等。
// 大多字段是 Localized（要双语展示），yearsExp 是数字字符串故用 string。
export interface Hero {
  name: Localized;
  role: Localized;
  tagline: Localized;
  location: Localized;
  status: Localized;
  yearsExp: string;
}

// SkillGroup：一组技能，比如「语言」「前端」。
// items 是 MaybeLocalized[]：数组里每一项可以是纯字符串（如 "React"），
// 也可以是双语对象（如 { zh: "编译器", en: "Compilers" }），混着放也没问题。
export interface SkillGroup {
  cat: Localized;
  items: MaybeLocalized[];
}

// ExperienceItem：一段工作经历。
// bullets 用 LocalizedList，因为每段经历下有多条要点，中英文各是一个数组。
// stack 是 string[]：技术栈标签都是固定英文，不需要翻译。
export interface ExperienceItem {
  role: Localized;
  company: Localized;
  date: string;
  bullets: LocalizedList;
  stack: string[];
}

// EducationItem：一段教育经历。
// extra 后面加了 `?`，表示「这个字段可有可无」（如 GPA、社团等补充信息）。
// 不写时 data.ts 里可以直接省略；渲染时 pickLang 收到 undefined 会安全地返回空串。
export interface EducationItem {
  date: string;
  school: Localized;
  degree: Localized;
  extra?: Localized;
}

// Contact：联系方式，全是固定文本，所以字段都是 string。
export interface Contact {
  email: string;
}

// Highlight：一条「亮点 / 活动」经历（黑客马拉松、开源研读等）。
// badge/link/stack 后面带 `?`，表示可选——不同活动按需填，不填就不显示。
export interface Highlight {
  date: string; // 时间范围，纯文本（如 "2025.8 — 2025.9"）
  title: Localized; // 标题（双语）
  desc: Localized; // 一句话描述（双语）
  badge?: Localized; // 可选小徽章，如「第五名 / 5th place」
  link?: string; // 可选外链（如开源仓库地址）
  stack?: string[]; // 可选技术标签（固定英文 token，不翻译）
}

// 整份简历的总类型：把上面各块组合起来。
// 这是「类型嵌套」——大类型由小类型拼成。data.ts 里的 RESUME 对象
// 标注成 `: Resume` 后，就必须严格按这里的结构来写。
export interface Resume {
  meta: Meta;
  hero: Hero;
  about: LocalizedList;
  skills: SkillGroup[];
  experience: ExperienceItem[];
  highlights: Highlight[];
  education: EducationItem[];
  contact: Contact;
}
