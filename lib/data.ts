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
    status: { zh: "在职 · 寻找 AI Agent / 后端机会", en: "Open to AI Agent / Backend roles" },
    yearsExp: "4",
    // 首屏「醒目发光徽章」：图标 + 双语文字（这里放游戏成就）。
    badges: [
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
      "如今我专注 **AI Agent** 方向：在 **TapNow** 研发多模型生成平台与 Agent 基础设施，覆盖 **Python / Go** 服务、分布式任务恢复、流式协议与计费一致性，并从 0 到 1 探索多智能体协作平台。",
    ],
    en: [
      "I'm **Jianglei Li**, an **AI agent engineer** (formerly **ByteDance** security R&D) with a master's in Cyberspace Security from **HUST**.",
      "Spent ~**3 years** on network-security R&D at **ByteDance** — NTA intrusion detection, DDoS protection, WAF, and container micro-segmentation (HFW) — shipping multiple 0-to-1 systems and running global multi-data-center rollouts through repeated major upgrades with **zero incidents**.",
      "Now I'm focused on **AI agents**: At **TapNow**, I build multi-model generation services and agent infrastructure across **Python / Go**, distributed task recovery, streaming protocols, and billing consistency, while developing a multi-agent collaboration platform from scratch.",
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
  experience: [
    {
      role: { zh: "AI Agent 开发工程师", en: "AI Agent Engineer" },
      company: { zh: "tapnow", en: "tapnow" },
      date: "2026.5 — Present",
      bullets: {
        zh: [
          "研发 **多模型生成平台**，打通 SDK、模型网关、业务编排与计费链路，覆盖文本、图像、视频、语音及 3D；实现多供应商协议适配、渠道加权降级与参数校验，支撑画布和 Agent 共用模型能力。",
          "设计并实现 **长任务恢复机制**：基于 Redis 所有权锁与心跳、终态 fencing 和数据库 CAS 更新，配合独立 Scheduler 扫描、回收并重投孤儿任务，处理容器退出、锁失效与任务重复执行风险。",
          "完善 **Agent Worker / Proxy** 的流式与会话链路：修复首 token 前超时、客户端断连后上游继续执行、媒体审核拒绝导致会话反复失败等问题；统一错误分类与取消传播，并修复请求透传导致的 Prompt Cache 不命中。",
          "推进 **Go 模型服务重构**，拆分 Gateway / Sync / Async / Scheduler 与共享 Core；实现数据库驱动的模型目录、渠道级模型绑定和配置导入，补齐 Anthropic 协议桥接、实时语音识别及多模态适配。",
          "治理 **估价、预占与实扣一致性**，修复视频按秒计费、输入时长遗漏、Agent 累计成本透传等问题；结合 Cloud Run 日志、PostgreSQL / MySQL 和调用链定位故障，推动跨服务修复与测试验收。",
          "从 0 到 1 研发 **Loop 多智能体协作平台（本地阶段）**：基于 Go、Pi、PostgreSQL 与 Redis 构建项目、Agent、Manager 任务、Inbox 和 loopctl，支持会话接续、任务隔离与权限配置；以模型接入流程探索开发、QA 与 Review 的协作闭环。"
        ],
        en: [
          "Engineered a **multi-model generation platform** spanning SDKs, gateways, orchestration, and billing for text, images, video, speech, and 3D; built provider adapters, weighted fallback routing, and input validation for Canvas and agent workloads.",
          "Designed **long-running task recovery** using Redis ownership locks and heartbeats, terminal-state fencing, and database CAS updates, with an independent scheduler to reclaim and requeue orphaned tasks after container exits or ownership loss.",
          "Improved **Agent Worker / Proxy** streaming and session reliability: addressed timeouts before the first token, upstream work continuing after disconnects, and repeated media-policy failures; implemented cancellation propagation and corrected request forwarding that prevented prompt-cache hits.",
          "Advanced the **Go model-service architecture** across Gateway, Sync, Async, Scheduler, and shared Core; implemented database-backed model catalogs, channel-level model bindings, and configuration imports, plus Anthropic protocol bridging and real-time speech recognition.",
          "Aligned **estimation, reservation, and settlement** across services, fixing video-duration accounting and cumulative agent-cost forwarding; diagnosed incidents through Cloud Run logs, PostgreSQL / MySQL, and request traces, and drove fixes and validation.",
          "Built **Loop, a multi-agent collaboration platform, from scratch through its local stage** using Go, Pi, PostgreSQL, and Redis: projects, agents, Manager tasks, Inbox, and loopctl, with session continuity, isolated task execution, and configurable permissions; explored model-onboarding workflows spanning development, QA, and review."
        ],
      },
      stack: ["Go", "Python", "AI Agent", "Redis", "PostgreSQL", "GCP", "Pub/Sub", "SSE"],
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
    email: "1158471109@qq.com",
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
