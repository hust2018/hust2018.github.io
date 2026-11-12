// 所有简历内容都在这里。改简历主要就改这个文件。
// `: Resume` 表示这个对象必须符合 Resume 类型，漏写/写错字段会立刻报错。
//
// 这个文件和 types.ts 的关系：types.ts 定义「形状」（每个字段该是什么类型），
// 这里填「内容」（具体的名字、经历、文案）。把数据和它的结构定义分开放，
// 是很常见的组织方式——以后想改简历内容，基本只动这一个文件。
import type { Resume, Localized, SectionDef } from "./types";

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
    status: { zh: "刚入职 Open Design", en: "Just joined Open Design" },
    yearsExp: "4",
    // 头像下方的座右铭（原来写死在组件里，现在收进数据）。
    motto: "尽管提需求，我来想办法实现",
    // 首屏「醒目发光徽章」：图标 + 双语文字（这里放游戏成就）。
    badges: [
      { icon: "⚫", label: { zh: "围棋 · 业余四段", en: "Go · Amateur 4-dan" } },
      { icon: "🎮", label: { zh: "英雄联盟 · 前钻石", en: "LoL · ex-Diamond" } },
      { icon: "🃏", label: { zh: "炉石传说 · 月榜", en: "Hearthstone · Leaderboard" } },
      { icon: "👾", label: { zh: "星际争霸 · 手残玩家", en: "StarCraft · low APM" } },
      { icon: "🐉", label: { zh: "原神 · 半途而废", en: "Genshin · quit halfway" } },
      { icon: "👑", label: { zh: "皇室战争 · 普通玩家", en: "Clash Royale · casual" } },
    ],
  },
  // about：「关于我」的几段话。每段里的 **加粗** 会被 FormattedBold 渲染成高亮。
  about: {
    zh: [
      "我是 **李姜磊**，**AI Agent 开发工程师**（前 **字节跳动** 安全研发），**华中科技大学** 网络空间安全硕士。",
      "在 **字节跳动** 安全与风控做了约 **3 年** 网络安全研发——NTA 入侵检测、DDoS 防护、WAF、容器微隔离 HFW，多个系统从 0 到 1 落地，全球多机房部署历经多次大版本升级 **0 事故**。",
      "如今我专注 **AI Agent** 方向：曾在 **TapNow** 研发多模型生成平台与 Agent 基础设施，覆盖 **Python / Go** 服务、分布式任务恢复、流式协议与计费一致性，并从 0 到 1 探索多智能体协作平台。**2026 年 11 月**，我加入了 **Open Design**。",
    ],
    en: [
      "I'm **Jianglei Li**, an **AI agent engineer** (formerly **ByteDance** security R&D) with a master's in Cyberspace Security from **HUST**.",
      "Spent ~**3 years** on network-security R&D at **ByteDance** — NTA intrusion detection, DDoS protection, WAF, and container micro-segmentation (HFW) — shipping multiple 0-to-1 systems and running global multi-data-center rollouts through repeated major upgrades with **zero incidents**.",
      "Now I'm focused on **AI agents**: At **TapNow**, I built multi-model generation services and agent infrastructure across **Python / Go**, distributed task recovery, streaming protocols, and billing consistency, and explored multi-agent collaboration from scratch. In **November 2026**, I joined **Open Design**.",
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
      items: ["Git", "Docker", "Linux", "Kubernetes", "GCP Cloud Run", "Pub/Sub", "OpenTelemetry"],
    },
  ],
  // experience：工作经历数组。bullets 是 { zh: [...], en: [...] }，每段下有多条要点。
  // 要点里的 **加粗** 会被 Experience 组件用 FormattedBold 高亮（突出关键指标）。
  // 要点如果以「**小标题**：」开头，页面会把它拆成「标题一行 + 正文一段」。
  // era 是时期标记（agent / security），页面用它切换强调色。
  experience: [
    {
      // 2026.11 入职。要点先留空，有内容后再补；
      // bullets 为空数组时，页面只显示公司、时间和职位。
      era: "agent",
      role: { zh: "AI Agent 开发工程师", en: "AI Agent Engineer" },
      company: { zh: "Open Design", en: "Open Design" },
      date: "2026.11 — Present",
      bullets: { zh: [], en: [] },
      stack: [],
    },
    {
      era: "agent",
      role: { zh: "AI Agent 开发工程师", en: "AI Agent Engineer" },
      company: { zh: "tapnow", en: "tapnow" },
      date: "2026.5 — 2026.10",
      bullets: {
        zh: [
          "**核心模型服务与架构重构**：端到端负责多模态模型平台，打通 SDK、供应商适配、路由、任务编排与计费，统一支撑画布和 Agent；主导 Go 架构重构，拆分网关、同步／异步执行与调度服务，通过配置化治理、所有权心跳和终态保护，提升模型扩展与长任务可靠性。",
          "**AI Agent 多模型与运行基础设施**：负责统一 Agent Runtime 下的多模型接入，适配工具调用、思考参数、多模态输入与流式协议；完善 Worker／Proxy 的取消传播、媒体审核恢复和成本统计，修复动态提示词与请求透传导致的 **Prompt Cache 失效**问题，恢复多轮 Agent 会话的缓存复用。",
          "**多 Agent 自主协作平台（Loop）**：将分散运行于本地与云端的 Agent 纳入统一平台，通过角色分工、任务编排、消息通信与会话接续，让 Agent 团队协同推进原本需要多人配合的复杂任务；支持结果交接、审查返工与持续跟进，减少人工拆单、跨 Agent 传话和逐轮推动，将人的精力集中于目标与关键决策，应用于模型接入、线上故障排查、自动 Bug 修复、代码审查与质量测试。",
        ],
        en: [
          "**Core model platform and architecture refactor**: Owned end-to-end delivery across SDKs, provider adapters, routing, task orchestration, and billing for Canvas and Agent workloads. Led the Go refactor into gateway, sync/async execution, and scheduling services, with configuration-driven governance, ownership heartbeats, and final-state protection for extensibility and long-running task reliability.",
          "**AI Agent multi-model and runtime infrastructure**: Integrated models into a unified Agent Runtime, adapting tool calls, reasoning parameters, multimodal inputs, and streaming protocols. Improved Worker/Proxy cancellation propagation, media-policy recovery, and cost accounting; fixed **Prompt Cache failures** caused by dynamic prompts and request forwarding, restoring cache reuse across multi-turn Agent conversations.",
          "**Autonomous multi-agent collaboration platform (Loop)**: Unified agents running locally and in the cloud through role assignment, task orchestration, messaging, and session continuity, enabling agent teams to advance complex tasks that previously required multiple people. Supported handoffs, review-and-rework cycles, and ongoing follow-up, reducing manual task breakdown, message relaying, and turn-by-turn supervision so people could focus on goals and key decisions. Applied to model onboarding, production-incident investigation, automated bug fixing, code review, and quality testing.",
        ],
      },
      stack: ["Go", "Python", "AI Agent", "Redis", "PostgreSQL", "GCP", "Pub/Sub", "SSE"],
    },
    {
      era: "agent",
      role: { zh: "AI 技术深造与独立项目开发", en: "AI Studies & Independent Project Development" },
      company: { zh: "个人学习与实践", en: "Independent Learning & Practice" },
      date: "2025.07 — 2026.05",
      bullets: {
        zh: [
          "**技术学习与方向转型**：从安全研发转向 AI Agent，系统学习 LLM 应用开发与多智能体协作；结合 OpenClaw、Claude 相关开源代码研读，深入理解 Agent 推理链路、工具调用与上下文管理，并应用于项目实践。",
          "**loomu AI 创作助手**：作为独立实践项目，从 0 到 1 开发 FastAPI 后端、接入 Stripe 计费，基于 AgentScope 构建面向社交媒体创作的多智能体内容生成流程，积累从后端服务到 Agent 应用的完整开发经验。",
        ],
        en: [
          "**Technical learning and career transition**: Transitioned from security R&D to AI agents through systematic study of LLM application development and multi-agent collaboration. Studied OpenClaw and Claude-related open-source code to understand agent reasoning, tool calls, and context management, applying the findings in project work.",
          "**loomu AI creation assistant**: Developed an independent practice project from scratch, building a FastAPI backend, integrating Stripe billing, and implementing an AgentScope-based multi-agent content-generation workflow for social-media creation. Gained end-to-end development experience spanning backend services and agent applications.",
        ],
      },
      stack: ["Python", "FastAPI", "AgentScope", "LLM", "MCP", "Stripe"],
    },
    {
      era: "security",
      role: { zh: "安全研发工程师", en: "Security R&D Engineer" },
      company: { zh: "字节跳动 · 安全与风控", en: "ByteDance · Security & Risk Control" },
      date: "2022.6 — 2025.7",
      bullets: {
        zh: [
          "研发容器微隔离 **HFW v3**：控制面迁移 Hertz 架构，**规则响应提升 400%**，支持热更新，稳定性大幅增强。",
          "海外 HFW 覆盖率从 **74.45% 提升至 91.96%**，显著抬升网络安全水位。",
          "参与网络隔离统一平台方案设计与落地：支持优先级 1~N 排列调整、工单查询过滤、配置文件动态获取等。",
          "海外 **DDoS** 防护全面升级至 v2.8.1，补齐 IPv6 防护；搭建覆盖检测 / 清洗 / 数据库的完整 DDoS 测试环境，支撑后续防护迭代。",
          "集团网络安全研发（**NTA + DDoS + WAF**）：DDoS 黑洞信息同步，实现秒级封禁、分钟级解封；WAF 黑名单多策略组配置，提升防护灵活性。",
          "**WebP 0day** 漏洞应急：48 小时内开发自动检测工具，在网络侧精准识别利用堆溢出的 WebP 格式图片。",
          "NTA 协议风险识别（Telnet / FTP / MySQL / SMB）：精准识别用户名 / 口令 / SQL 操作 / 文件读写，上线后发现 **20+ 起高危风险**，防止办公网支付数据泄漏、测试网弱密码等安全事件；研发 NTA for AWS 云版本。",
          "安全规则自动化检测工具（0→1）：**规则检测效率提升 70%+、人工成本降低 90%+**，测试覆盖 3521 条规则；负责国内三大核心机房 + 7 个汇聚机房及新加坡 / 马来西亚 / 美东部署，多次大版本升级 **0 事故**。",
        ],
        en: [
          "Built container micro-segmentation **HFW v3**: migrated the control plane to the Hertz framework for **400% faster rule response**, hot updates, and greatly improved stability.",
          "Raised overseas HFW coverage from **74.45% to 91.96%**, materially lifting the security baseline.",
          "Co-designed and shipped the unified network-isolation platform: priority 1..N ordering, ticket query/filtering, dynamic config fetching, and more.",
          "Comprehensively upgraded overseas **DDoS** protection to v2.8.1 with IPv6 coverage; built a full DDoS test environment (detection / scrubbing / database) to support ongoing iteration.",
          "Group-wide network security R&D (**NTA + DDoS + WAF**): blackhole-sync for second-level bans and minute-level unbans; multi-policy WAF blacklist configuration for flexible protection.",
          "**WebP 0day** emergency response: built an automated detection tool within 48 hours that precisely flags WebP images exploiting the heap overflow at the network layer.",
          "NTA protocol risk detection (Telnet / FTP / MySQL / SMB): accurate detection of credentials / SQL ops / file I/O, surfacing **20+ high-risk findings** post-launch and preventing incidents such as office-network payment-data leakage and test-network weak passwords; built the NTA-for-AWS cloud edition.",
          "Automated security-rule detection tool (0→1): **70%+ faster rule checks, 90%+ less manual effort**, covering 3,521 rules; owned deployment across 3 core + 7 aggregation data centers plus Singapore / Malaysia / US-East, through major upgrades with **zero incidents**.",
        ],
      },
      stack: ["Go", "Hertz", "NTA", "DDoS", "WAF", "IPv6", "AWS"],
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
  // contact：联系方式（公开邮箱和可折叠的微信二维码）。
  contact: {
    email: "1158471109@qq.com",
    wechatQr: "/wechat-qr.jpg",
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
  wechat: { zh: "wechat", en: "wechat" },
  showWechat: { zh: "展开二维码", en: "Show QR code" },
  hideWechat: { zh: "收起二维码", en: "Hide QR code" },
  wechatHint: { zh: "使用微信扫码添加好友", en: "Scan with WeChat to add me" },
  wechatQrAlt: { zh: "李姜磊的微信二维码", en: "Jianglei Li’s WeChat QR code" },
  viewQr: { zh: "查看原图", en: "View full-size image" },
  download: { zh: "下载 PDF", en: "Download PDF" },
  print: { zh: "打印", en: "Print" },
  expandAll: { zh: "展开全部", en: "Expand all" },
  collapseAll: { zh: "收起", en: "Collapse" },
  yearsExp: { zh: "年经验", en: "yrs exp" },
  basedIn: { zh: "坐标", en: "Based in" },
  available: { zh: "状态", en: "Status" },
  whoami: { zh: "whoami", en: "whoami" },

  // ---- 以下是「信号」新版界面用到的固定文案 ----
  skip: { zh: "跳到正文", en: "Skip to content" },
  introLine: { zh: "正在解码身份", en: "Decoding identity" },
  introSkip: { zh: "跳过", en: "Skip" },
  navLabel: { zh: "分区导航", en: "Section navigation" },
  langSwitch: { zh: "切换语言", en: "Switch language" },
  heroCta: { zh: "看经历", en: "See experience" },
  termHint: { zh: "呼出终端", en: "open the shell" },
  offDuty: { zh: "下班之后", en: "Off duty" },
  experienceYears: { zh: "经验", en: "Experience" },
  portraitAlt: { zh: "李姜磊的头像", en: "Portrait of Jianglei Li" },
  xpHint: { zh: "继续向下滚动，横向翻阅", en: "Keep scrolling to move sideways" },
  xpMore: { zh: "查看全部 {n} 条", en: "View all {n}" }, // {n} 会被替换成要点条数
  xpFull: { zh: "查看完整内容", en: "View full details" },
  xpMoreAria: { zh: "查看这段经历的全部要点", en: "View every bullet for this role" },
  eraAgent: { zh: "AGENT 时期", en: "AGENT ERA" },
  eraSecurity: { zh: "安全时期", en: "SECURITY ERA" },
  present: { zh: "至今", en: "Present" },
  contactBig: { zh: "来聊聊", en: "Let's talk" },
  email: { zh: "邮箱", en: "Email" },
  copy: { zh: "复制邮箱", en: "Copy email" },
  copied: { zh: "已复制到剪贴板", en: "Copied to clipboard" },
  copyFail: { zh: "复制失败，请手动选中邮箱", en: "Copy failed — please select the address manually" },
  close: { zh: "关闭", en: "Close" },
  backTop: { zh: "回到顶部", en: "Back to top" },
  termNote: {
    zh: "resume.sh · 交互式终端 — 输入 help 查看可用命令",
    en: 'resume.sh · interactive shell — type "help" for commands',
  },
  termPlaceholder: { zh: "输入命令，回车执行…", en: "type a command, hit enter…" },
  termInputLabel: { zh: "终端输入", en: "Terminal input" },
};

// 页面分区表：顺序就是页面从上到下的顺序，也是右侧导轨和区块编号（01、02…）的来源。
// ghost 是区块背后那行横向滑动的装饰大字（固定英文）；label 是导轨上的短标签。
export const SECTIONS: SectionDef[] = [
  { id: "about", ghost: "ABOUT", label: { zh: "关于", en: "About" } },
  { id: "experience", ghost: "EXPERIENCE", label: { zh: "经历", en: "Exp" } },
  { id: "skills", ghost: "STACK", label: { zh: "技能", en: "Skills" } },
  { id: "highlights", ghost: "HIGHLIGHTS", label: { zh: "亮点", en: "More" } },
  { id: "education", ghost: "EDUCATION", label: { zh: "教育", en: "Edu" } },
  { id: "contact", ghost: "CONTACT", label: { zh: "联系", en: "Contact" } },
];
