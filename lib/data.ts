// 所有简历内容都在这里。改简历主要就改这个文件。
// `: Resume` 表示这个对象必须符合 Resume 类型，漏写/写错字段会立刻报错。
import type { Resume, Localized } from "./types";

export const RESUME: Resume = {
  meta: {
    handle: "your-handle",
    user: "you",
    host: "portfolio",
    cwd: "~/resume",
  },
  hero: {
    name: { zh: "你的名字", en: "Your Name" },
    role: { zh: "高级软件工程师", en: "Senior Software Engineer" },
    tagline: {
      zh: "构建高性能的工具与系统。专注前端架构、开发者体验与分布式服务。开源爱好者，热爱键盘与编辑器配置。",
      en: "Building performant tools and systems. Focused on frontend architecture, developer experience, and distributed services. Open-source enthusiast, keyboard-and-config nerd.",
    },
    location: { zh: "上海，中国", en: "Shanghai, China" },
    status: { zh: "开放新机会", en: "Open to opportunities" },
    yearsExp: "8",
  },
  about: {
    zh: [
      "我是一名 **软件工程师**，过去 **8 年** 我都在写代码、读代码、删代码。",
      "我相信好的工程师是 **工具的工匠**：让复杂的系统变得简单，让简单的事情自动化。",
      "工作之外我会折腾 Linux、机械键盘和 Neovim 配置，也会写一些没什么用的小工具自娱自乐。",
    ],
    en: [
      "I'm a **software engineer**. For the past **8 years** I've been writing code, reading code, and deleting code.",
      "I believe great engineers are **craftspeople of tools**: making complex systems simple and simple things automated.",
      "Outside work I tinker with Linux, mechanical keyboards, and Neovim configs — and build small useless tools for fun.",
    ],
  },
  skills: [
    {
      cat: { zh: "语言", en: "Languages" },
      items: ["TypeScript", "Go", "Python", "Rust", "Lua", "Bash"],
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
      items: ["Neovim", "tmux", "Git", "Docker", "Bazel", "Nix"],
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
  projects: [
    {
      name: "term-lib",
      year: "2025",
      desc: {
        zh: "一个零依赖的终端 UI 库，支持复杂布局与动画。",
        en: "Zero-dependency terminal UI library with layouts and animations.",
      },
      stack: ["Rust", "TUI"],
      stars: "3.2k",
      lang: "Rust",
    },
    {
      name: "dotfiles",
      year: "ongoing",
      desc: {
        zh: "我的 Neovim、tmux、zsh 配置，包含自定义 Lua 插件。",
        en: "My Neovim, tmux, and zsh configs — with custom Lua plugins.",
      },
      stack: ["Lua", "Bash"],
      stars: "480",
      lang: "Lua",
    },
    {
      name: "tinywasm",
      year: "2024",
      desc: {
        zh: "用 TypeScript 实现的 WebAssembly 解释器，纯学习项目。",
        en: "A WebAssembly interpreter written in TypeScript. Pure learning exercise.",
      },
      stack: ["TypeScript", "WASM"],
      stars: "1.1k",
      lang: "TS",
    },
    {
      name: "k8s-debug-cli",
      year: "2023",
      desc: {
        zh: "Kubernetes 故障排查命令行工具，整合 kubectl + 常用诊断。",
        en: "Kubernetes troubleshooting CLI; bundles kubectl with common diagnostics.",
      },
      stack: ["Go", "K8s"],
      stars: "820",
      lang: "Go",
    },
  ],
  education: [
    {
      date: "2013 — 2017",
      school: { zh: "某某大学", en: "University of Somewhere" },
      degree: { zh: "计算机科学 学士", en: "B.S. Computer Science" },
      extra: { zh: "GPA 3.8 / 4.0 · ACM 校队", en: "GPA 3.8 / 4.0 · ACM team" },
    },
  ],
  contact: {
    email: "you@example.com",
    github: "github.com/your-handle",
    linkedin: "linkedin.com/in/your-handle",
    blog: "your-blog.dev",
    phone: "+86 138 0000 0000",
  },
};

// 界面上的固定文案（区块标题、按钮文字等）的双语对照。
export const STRINGS: Record<string, Localized> = {
  about: { zh: "关于", en: "About" },
  skills: { zh: "技能栈", en: "Skills" },
  experience: { zh: "工作经历", en: "Experience" },
  projects: { zh: "项目", en: "Projects" },
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
