// 语言只有两种取值：中文或英文。用联合类型 "zh" | "en" 限定，
// 写成别的字符串 TypeScript 会报错。
export type Lang = "zh" | "en";

// 一段「双语文本」：同时有中文和英文。
export type Localized = { zh: string; en: string };

// 有些字段可能是纯字符串（无需翻译，如 "TypeScript"），
// 也可能是双语对象。用联合类型表示「两者皆可」。
export type MaybeLocalized = string | Localized;

// 双语的「多段文字」：中英文各是一个字符串数组（每段一条）。
export type LocalizedList = { zh: string[]; en: string[] };

export interface Meta {
  handle: string;
  user: string;
  host: string;
  cwd: string;
}

export interface Hero {
  name: Localized;
  role: Localized;
  tagline: Localized;
  location: Localized;
  status: Localized;
  yearsExp: string;
}

export interface SkillGroup {
  cat: Localized;
  items: MaybeLocalized[];
}

export interface ExperienceItem {
  role: Localized;
  company: Localized;
  date: string;
  bullets: LocalizedList;
  stack: string[];
}

export interface Project {
  name: string;
  year: string;
  desc: Localized;
  stack: string[];
  stars: string;
  lang: string;
}

export interface EducationItem {
  date: string;
  school: Localized;
  degree: Localized;
  extra: Localized;
}

export interface Contact {
  email: string;
  github: string;
  linkedin: string;
  blog: string;
  phone: string;
}

// 整份简历的总类型：把上面各块组合起来。
export interface Resume {
  meta: Meta;
  hero: Hero;
  about: LocalizedList;
  skills: SkillGroup[];
  experience: ExperienceItem[];
  projects: Project[];
  education: EducationItem[];
  contact: Contact;
}
