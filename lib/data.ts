// 所有简历内容都在这里。改简历主要就改这个文件。
// `: Resume` 表示这个对象必须符合 Resume 类型，漏写/写错字段会立刻报错。
//
// 这个文件和 types.ts 的关系：types.ts 定义「形状」（每个字段该是什么类型），
// 这里填「内容」（具体的名字、经历、文案）。把数据和它的结构定义分开放，
// 是很常见的组织方式——以后想改简历内容，基本只动这一个文件。
//
// 从 "./types" 引入两个类型：Resume 给下面的 RESUME 用，Localized 给最下面的 STRINGS 用。
// 同样是 `import type`，纯类型引入，不会出现在编译后的 JS 里。
import type { Resume, Localized } from "./types";

// 概念：`const` 声明一个常量（声明后不可重新赋值）。
// 变量名用全大写 RESUME 是一种约定俗成的写法，表示「这是一份固定不变的配置数据」。
// `: Resume` 是类型标注：约束这个对象必须严格符合 Resume 接口——
// 这样写数据时若漏了某个字段、或把双语对象写成了纯字符串，编辑器会马上标红，
// 这正是用 TypeScript 写数据的最大好处：错误在编码时就被拦住，而不是等到页面跑崩。
export const RESUME: Resume = {
  meta: {
    handle: "jianglei.li resume",
    user: "jianglei.li",
    host: "tamaredge.ai",
    cwd: "~/resume",
  },
  // hero：顶部主视觉。每个像 { zh: ..., en: ... } 的对象就是一个 Localized 双语文本。
  hero: {
    name: { zh: "李姜磊", en: "Jianglei Li" },
    role: { zh: "AI Agent开发工程师", en: "Senior Software Engineer" },
    tagline: {
      zh: "构建高性能的Agent工具与系统。专注高性能架构、分布式服务与Agent前沿技术。开源爱好者，热爱AI与挑战。",
      en: "Building high-performance agent tools and systems.Building high-performance agent tools and systems. Focused on high-performance architecture, developer experience, and distributed services. Open-source enthusiast, passionate about AI and challenges.",
    },
    location: { zh: "深圳，中国", en: "Shenzhen, China" },
    status: { zh: "（暂不考虑机会）为梦想窒息", en: "Open to opportunities" },
    yearsExp: "4",
  },
  about: {
    zh: [
      "我是一名 **Agent开发工程师**，过去 **4 年** 我都在写代码、读代码、删代码。",
      "我相信好的工程师是 **工具的工匠**：让复杂的系统变得简单，让简单的事情自动化。",
      "工作之外我会折腾 Linux、机械键盘和 Neovim 配置，也会写一些没什么用的小工具自娱自乐。",
    ],
    en: [
      "I'm a **software engineer**. For the past **4 years** I've been writing code, reading code, and deleting code.",
      "I believe great engineers are **craftspeople of tools**: making complex systems simple and simple things automated.",
      "Outside work I tinker with Linux, mechanical keyboards, and Neovim configs — and build small useless tools for fun.",
    ],
  },
  // skills：用 [ ] 包起来是一个「数组」，里面每个 { } 是一组技能（对应 SkillGroup）。
  // 注意 items 里 "TypeScript" 这种纯字符串和 { zh, en } 双语对象是混着放的——
  // 这正是 types.ts 里 MaybeLocalized 这个联合类型允许的。
  skills: [
    {
      cat: { zh: "语言", en: "Languages" },
      items: ["Go", "Python", "C", "Bash"],
    },
    {
      cat: { zh: "前端", en: "Frontend" },
      items: ["React", "Vue", "Svelte", "WebGL", "Vite", "Webpack"],
    },
    {
      cat: { zh: "后端 / 基础设施", en: "Backend / Infra" },
      items: ["Node.js", "PostgreSQL", "Redis", "gRPC", "Kafka", "Kubernetes", "AWS"],
    },
    {
      cat: { zh: "工具", en: "Tooling" },
      items: ["tmux", "Git", "Docker", "Bazel", "Nix"],
    },
    {
      cat: { zh: "兴趣方向", en: "Interests" },
      items: [
        { zh: "编译器", en: "Compilers" },
        { zh: "分布式系统", en: "Distributed Systems" },
        { zh: "开发者工具", en: "Developer Tooling" },
        "WebAssembly",
      ],
    },
  ],
  // experience：工作经历数组，每项对应一个 ExperienceItem。
  // bullets 是 LocalizedList——zh 和 en 各是一个字符串数组，所以下面用 [ ] 装多条要点。
  experience: [
    {
      role: { zh: "高级软件工程师", en: "Senior Software Engineer" },
      company: { zh: "某科技公司", en: "TechCo" },
      date: "2023 — Present",
      bullets: {
        zh: [
          "主导前端基础架构升级，将构建时间从 4 分钟降至 35 秒，开发体验显著改善。",
          "设计并实现内部组件库，被 12 个产品线复用，月活组件覆盖超 200 个。",
          "推动单元测试覆盖率从 38% 提升至 81%，线上 P0 事故同比下降 60%。",
          "Mentor 4 名工程师，组织内部技术分享 / Brown bag 12 场。",
        ],
        en: [
          "Led a frontend infra overhaul; reduced build time from 4 min to 35 s.",
          "Designed an internal component library reused across 12 product lines.",
          "Lifted unit test coverage from 38% to 81%; P0 incidents down 60% YoY.",
          "Mentored 4 engineers and ran 12 internal brown-bag sessions.",
        ],
      },
      stack: ["TypeScript", "React", "Vite", "Go", "K8s"],
    },
    {
      role: { zh: "全栈工程师", en: "Full-stack Engineer" },
      company: { zh: "某创业公司", en: "Startup Inc." },
      date: "2020 — 2023",
      bullets: {
        zh: [
          "作为第 4 号员工搭建产品 0 到 1，支撑 50 万 MAU。",
          "构建实时协作引擎（CRDT），写入延迟 <80ms（P95）。",
          "搭建 CI/CD 与监控体系，部署频率从每周 1 次到每天 12 次。",
        ],
        en: [
          "Employee #4; built the product from 0 to 1 to 500k MAU.",
          "Built a CRDT-based realtime collaboration engine; <80ms p95 latency.",
          "Set up CI/CD and observability; deploys went from 1/wk to 12/day.",
        ],
      },
      stack: ["Node.js", "PostgreSQL", "Redis", "WebSocket", "AWS"],
    },
    {
      role: { zh: "软件工程师", en: "Software Engineer" },
      company: { zh: "某大厂", en: "BigCorp" },
      date: "2017 — 2020",
      bullets: {
        zh: [
          "负责广告投放平台前端，年营收影响 $80M+。",
          "实现 A/B 测试框架，被 6 个业务团队采用。",
          "贡献开源项目若干，累计 GitHub star 2k+。",
        ],
        en: [
          "Owned the ads-platform frontend; ~$80M annual revenue impact.",
          "Built an A/B testing framework adopted by 6 product teams.",
          "Open-source contributions; 2k+ cumulative GitHub stars.",
        ],
      },
      stack: ["Vue", "Python", "Django"],
    },
  ],
  // education：教育经历数组，每项对应一个 EducationItem。
  education: [
    {
      date: "2015 — 2019",
      school: { zh: "华中科技大学", en: "University of Somewhere" },
      degree: { zh: "信息安全 学士", en: "B.S. Computer Science" },
      // extra: { zh: "GPA 3.8 / 4.0 · ACM 校队", en: "GPA 3.8 / 4.0 · ACM team" },
    },
    {
      date: "2015 — 2019",
      school: { zh: "华中科技大学", en: "University of Somewhere" },
      degree: { zh: "网络安全 硕士", en: "B.S. Computer Science" },
      // extra: { zh: "GPA 3.8 / 4.0 · ACM 校队", en: "GPA 3.8 / 4.0 · ACM team" },
    },
  ],
  // contact：联系方式，对应 Contact，字段都是固定文本。
  contact: {
    email: "you@example.com",
    linkedin: "linkedin.com/in/your-handle",
    phone: "+86 138 0000 0000",
  },
};

// 界面上的固定文案（区块标题、按钮文字等）的双语对照。
//
// 概念：`Record<string, Localized>` 是 TypeScript 内置的「工具类型」。
// 它的尖括号 < > 里是「泛型参数」——给类型传参，像给函数传参数一样。
// Record<K, V> 表示「一个对象，键(key)是 K 类型、值(value)是 V 类型」。
// 这里 K=string、V=Localized，即：一个键是字符串、每个值都是双语对象的字典。
// 这样既能随意增删条目（不像 interface 要固定字段），又保证每个值都是合法的双语对象。
// 用法上：界面组件拿到一个 key（如 "about"），就能查到对应的 { zh, en } 去显示。
export const STRINGS: Record<string, Localized> = {
  about: { zh: "关于", en: "About" },
  skills: { zh: "技能栈", en: "Skills" },
  experience: { zh: "工作经历", en: "Experience" },
  shell: { zh: "终端", en: "Shell" },
  education: { zh: "教育", en: "Education" },
  contact: { zh: "联系方式", en: "Contact" },
  download: { zh: "下载 PDF", en: "Download PDF" },
  print: { zh: "打印", en: "Print" },
  expandAll: { zh: "展开全部", en: "Expand all" },
  collapseAll: { zh: "收起", en: "Collapse" },
  yearsExp: { zh: "年经验", en: "yrs exp" },
  basedIn: { zh: "坐标", en: "Based in" },
  available: { zh: "状态", en: "Status" },
  whoami: { zh: "whoami", en: "whoami" },
};
