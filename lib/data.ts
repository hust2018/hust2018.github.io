// 所有简历内容都在这里。改简历主要就改这个文件。
// `: Resume` 表示这个对象必须符合 Resume 类型，漏写/写错字段会立刻报错。
//
// 这个文件和 types.ts 的关系：types.ts 定义「形状」（每个字段该是什么类型），
// 这里填「内容」（具体的名字、经历、文案）。把数据和它的结构定义分开放，
// 是很常见的组织方式——以后想改简历内容，基本只动这一个文件。
import type { Resume, Localized } from "./types";

// 概念：`const` 声明一个常量；变量名全大写 RESUME 是约定，表示「固定的配置数据」。
// `: Resume` 是类型标注：约束这个对象必须严格符合 Resume 接口——漏字段/类型不对会立刻标红。
export const RESUME: Resume = {
  // meta：终端提示符里那串 user@host:cwd 的文本（纯装饰，固定英文）。
  meta: {
    handle: "jianglei.li · resume",
    user: "jianglei.li",
    host: "hust2018",
    cwd: "~/resume",
  },
  // hero：顶部主视觉。每个 { zh, en } 就是一段双语文本。
  hero: {
    name: { zh: "李姜磊", en: "Jianglei Li" },
    role: { zh: "AI Agent 开发工程师 · 前安全研发", en: "AI Agent Engineer · ex-Security R&D" },
    tagline: {
      zh: "专注 AI Agent 与多智能体系统，把它们从 0 到 1 做成生产级产品。带着字节安全研发打下的高并发、分布式底子，痴迷把复杂系统做简单。",
      en: "Focused on AI agents and multi-agent systems — taking them from zero to production, grounded in the high-concurrency, distributed-systems foundation built during security R&D at ByteDance. Obsessed with making complex systems simple.",
    },
    location: { zh: "深圳，中国", en: "Shenzhen, China" },
    status: { zh: "在职 · 暂不看机会", en: "Currently employed" },
    yearsExp: "4",
  },
  // about：「关于我」的几段话。每段里的 **加粗** 会被 FormattedBold 渲染成高亮。
  about: {
    zh: [
      "我是 **李姜磊**，**AI Agent 开发工程师**（前 **字节跳动** 安全研发），**华中科技大学** 网络空间安全硕士。",
      "在 **字节跳动** 安全与风控做了约 **3 年** 网络安全研发——NTA 入侵检测、DDoS 防护、WAF、容器微隔离 HFW，多个系统从 0 到 1 落地，全球多机房部署历经多次大版本升级 **0 事故**。",
      "如今我专注 **AI Agent** 方向：以 Agent 开发加入 **tapnow**，目前负责模型生成相关的服务支持，并希望在多智能体方向持续深耕。Always day 1。",
    ],
    en: [
      "I'm **Jianglei Li**, an **AI agent engineer** (formerly **ByteDance** security R&D) with a master's in Cyberspace Security from **HUST**.",
      "Spent ~**3 years** on network-security R&D at **ByteDance** — NTA intrusion detection, DDoS protection, WAF, and container micro-segmentation (HFW) — shipping multiple 0-to-1 systems and running global multi-data-center rollouts through repeated major upgrades with **zero incidents**.",
      "Now I'm focused on **AI agents**: I joined **tapnow** as an agent developer and currently work on service support for model generation, while going deeper into multi-agent systems. Always day 1.",
    ],
  },
  // skills：技能分类数组。items 里纯字符串（如 "Python"）和双语对象（如 {zh,en}）可混放——
  // 这是 types.ts 里 MaybeLocalized 联合类型允许的。
  skills: [
    {
      cat: { zh: "AI / Agent", en: "AI / Agent" },
      items: ["AgentScope", "LangGraph", "MCP", "LLM", { zh: "多智能体", en: "Multi-Agent" }, "Prompt", "SSE"],
    },
    {
      cat: { zh: "语言", en: "Languages" },
      items: ["Python", "Go", "Bash", "SQL"],
    },
    {
      cat: { zh: "后端 / 基础设施", en: "Backend / Infra" },
      items: ["FastAPI", "Redis", "PostgreSQL", "RabbitMQ", "S3", "Stripe", "Hertz"],
    },
    {
      cat: { zh: "安全", en: "Security" },
      items: [
        { zh: "入侵检测 (NTA)", en: "IDS (NTA)" },
        { zh: "DDoS 防护", en: "DDoS" },
        "WAF",
        { zh: "容器微隔离", en: "Micro-segmentation" },
        { zh: "漏洞应急", en: "Vuln Response" },
      ],
    },
    {
      cat: { zh: "工具", en: "Tooling" },
      items: ["Git", "Docker", "Linux", "Kubernetes"],
    },
  ],
  // experience：工作经历数组。bullets 是 { zh: [...], en: [...] }，每段下有多条要点。
  // 要点里的 **加粗** 会被 Experience 组件用 FormattedBold 高亮（突出关键指标）。
  experience: [
    {
      role: { zh: "AI Agent 开发工程师", en: "AI Agent Engineer" },
      company: { zh: "tapnow", en: "tapnow" },
      date: "2026.5 — Present",
      bullets: {
        zh: [
          "以 **AI Agent 开发** 方向加入，参与 Agent 相关研发。",
          "目前主要负责 **模型生成（model generation）服务** 的工程支持与稳定性保障。",
        ],
        en: [
          "Joined as an **AI agent developer**, working on agent-related development.",
          "Currently focused on engineering support and reliability for **model-generation services**.",
        ],
      },
      stack: ["AI Agent", "LLM", "Python"],
    },
    {
      role: { zh: "技术负责人", en: "Tech Lead" },
      company: { zh: "loomu · AI 创作助手", en: "loomu · AI creation assistant" },
      date: "2025.11 — 2026.4",
      bullets: {
        zh: [
          "作为技术负责人，从 0 到 1 搭建 AI 创作助手的后端与 SaaS 计费系统（FastAPI + Stripe）。",
          "基于 AgentScope 设计多智能体内容生成系统，服务社交媒体内容创作。",
        ],
        en: [
          "As tech lead, built the AI creation assistant's backend and SaaS billing from scratch (FastAPI + Stripe).",
          "Designed a multi-agent content-generation system on AgentScope for social-media content.",
        ],
      },
      stack: ["Python", "FastAPI", "AgentScope"],
    },
    {
      role: { zh: "安全研发工程师", en: "Security R&D Engineer" },
      company: { zh: "字节跳动 · 安全与风控", en: "ByteDance · Security & Risk Control" },
      date: "2023.10 — 2025.7",
      bullets: {
        zh: [
          "研发容器微隔离 **HFW v3**：控制面迁移 Hertz 架构，**规则响应提升 400%**，支持热更新，稳定性大幅增强。",
          "海外 HFW 覆盖率从 **74.45% 提升至 91.96%**，显著抬升网络安全水位。",
          "参与网络隔离统一平台方案设计与落地：支持优先级 1~N 排列调整、工单查询过滤、配置文件动态获取等。",
          "海外 **DDoS** 防护全面升级至 v2.8.1，补齐 IPv6 防护；搭建覆盖检测 / 清洗 / 数据库的完整 DDoS 测试环境，支撑后续防护迭代。",
        ],
        en: [
          "Built container micro-segmentation **HFW v3**: migrated the control plane to the Hertz framework for **400% faster rule response**, hot updates, and greatly improved stability.",
          "Raised overseas HFW coverage from **74.45% to 91.96%**, materially lifting the security baseline.",
          "Co-designed and shipped the unified network-isolation platform: priority 1..N ordering, ticket query/filtering, dynamic config fetching, and more.",
          "Comprehensively upgraded overseas **DDoS** protection to v2.8.1 with IPv6 coverage; built a full DDoS test environment (detection / scrubbing / database) to support ongoing iteration.",
        ],
      },
      stack: ["Go", "Hertz", "DDoS", "IPv6"],
    },
    {
      role: { zh: "安全研发工程师", en: "Security R&D Engineer" },
      company: { zh: "字节跳动 · 安全与风控", en: "ByteDance · Security & Risk Control" },
      date: "2022.6 — 2023.10",
      bullets: {
        zh: [
          "集团网络安全研发（**NTA + DDoS + WAF**）：DDoS 黑洞信息同步，实现秒级封禁、分钟级解封；WAF 黑名单多策略组配置，提升防护灵活性。",
          "**WebP 0day** 漏洞应急：48 小时内开发自动检测工具，在网络侧精准识别利用堆溢出的 WebP 格式图片。",
          "NTA 协议风险识别（Telnet / FTP / MySQL / SMB）：精准识别用户名 / 口令 / SQL 操作 / 文件读写，上线后发现 **20+ 起高危风险**，防止办公网支付数据泄漏、测试网弱密码等安全事件；研发 NTA for AWS 云版本。",
          "安全规则自动化检测工具（0→1）：**规则检测效率提升 70%+、人工成本降低 90%+**，测试覆盖 3521 条规则；负责国内三大核心机房 + 7 个汇聚机房及新加坡 / 马来西亚 / 美东部署，多次大版本升级 **0 事故**。",
        ],
        en: [
          "Group-wide network security R&D (**NTA + DDoS + WAF**): blackhole-sync for second-level bans and minute-level unbans; multi-policy WAF blacklist configuration for flexible protection.",
          "**WebP 0day** emergency response: built an automated detection tool within 48 hours that precisely flags WebP images exploiting the heap overflow at the network layer.",
          "NTA protocol risk detection (Telnet / FTP / MySQL / SMB): accurate detection of credentials / SQL ops / file I/O, surfacing **20+ high-risk findings** post-launch and preventing incidents such as office-network payment-data leakage and test-network weak passwords; built the NTA-for-AWS cloud edition.",
          "Automated security-rule detection tool (0→1): **70%+ faster rule checks, 90%+ less manual effort**, covering 3,521 rules; owned deployment across 3 core + 7 aggregation data centers plus Singapore / Malaysia / US-East, through major upgrades with **zero incidents**.",
        ],
      },
      stack: ["NTA", "DDoS", "WAF", "AWS"],
    },
  ],
  // highlights：「亮点 / 活动」——黑客马拉松、开源研读等（对应 PDF 的「活动经历」）。
  highlights: [
    {
      date: "2025.8 — 2025.9",
      title: { zh: "GOSIM Hangzhou 2025 · Code Alert 黑客马拉松", en: "GOSIM Hangzhou 2025 · Code Alert Hackathon" },
      badge: { zh: "第五名", en: "5th place" },
      desc: {
        zh: "探索 AI 智能体与实时战略游戏的融合，打造「AI 战役指挥官」——用多智能体辅助玩家进行 RTS 对战。",
        en: "Fused AI agents with real-time strategy gaming to build an “AI battle commander” — multi-agents assisting players in RTS matches.",
      },
      link: "https://github.com/AI-for-anyone/RedAlert",
      stack: ["Python", "LangGraph", "Prompt", "MCP", "Async/Concurrency", "Multithreading"],
    },
    {
      date: "2026.1 — 2026.4",
      title: { zh: "开源代码研读", en: "Open-source deep dive" },
      desc: {
        zh: "系统研读 OpenClaw、Claude 相关开源代码，深入理解 LLM Agent 推理链路、工具调用机制与上下文管理实现，并应用于多智能体架构设计。",
        en: "Studied OpenClaw and Claude-related open-source code in depth — LLM agent reasoning chains, tool-calling, and context management — applying the findings to multi-agent architecture design.",
      },
      stack: ["LLM", "Agent", "MCP"],
    },
  ],
  // education：教育经历数组（最近的放最前）。extra 字段可选，这里没填就省略。
  education: [
    {
      date: "2019.9 — 2022.6",
      school: { zh: "华中科技大学", en: "Huazhong Univ. of Science & Technology" },
      degree: { zh: "网络空间安全 · 硕士", en: "M.Eng., Cyberspace Security" },
    },
    {
      date: "2015.9 — 2019.6",
      school: { zh: "华中科技大学", en: "Huazhong Univ. of Science & Technology" },
      degree: { zh: "信息安全 · 学士", en: "B.Eng., Information Security" },
    },
  ],
  // contact：联系方式（只公开邮箱；手机号不放到公开网站上）。
  contact: {
    email: "1596420919@qq.com",
  },
};

// 界面上的固定文案（区块标题、按钮文字等）的双语对照。
// `Record<string, Localized>` 表示「键是字符串、每个值都是双语对象」的字典。
export const STRINGS: Record<string, Localized> = {
  about: { zh: "关于", en: "About" },
  skills: { zh: "技能栈", en: "Skills" },
  experience: { zh: "工作经历", en: "Experience" },
  shell: { zh: "终端", en: "Shell" },
  highlights: { zh: "亮点", en: "Highlights" },
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
