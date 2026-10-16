# 李姜磊　Jianglei Li
<div class="subtitle">AI Agent 开发工程师 · 前安全研发</div>
<div class="meta">深圳，中国　·　1158471109@qq.com</div>
<div class="tagline">专注 AI Agent 与多智能体系统，把它们从 0 到 1 做成生产级产品。带着字节安全研发打下的高并发、分布式底子，痴迷把复杂系统做简单。</div>

## 关于
我是 **李姜磊**，**AI Agent 开发工程师**（前 **字节跳动** 安全研发），**华中科技大学** 网络空间安全硕士。
在 **字节跳动** 安全与风控做了约 **3 年** 网络安全研发——NTA 入侵检测、DDoS 防护、WAF、容器微隔离 HFW，多个系统从 0 到 1 落地，全球多机房部署历经多次大版本升级 **0 事故**。
如今我专注 **AI Agent** 方向：在 **TapNow** 研发多模型生成平台与 Agent 基础设施，覆盖 **Python / Go** 服务、分布式任务恢复、流式协议与计费一致性，并从 0 到 1 探索多智能体协作平台。

## 技能
- **AI / Agent**　AgentScope · LangGraph · MCP · LLM · 多智能体 · Prompt · SSE
- **语言**　Python · Go · Bash · SQL
- **后端 / 基础设施**　FastAPI · Redis · PostgreSQL · RabbitMQ · S3 · Stripe · Hertz
- **安全**　入侵检测 (NTA) · DDoS 防护 · WAF · 容器微隔离 · 漏洞应急
- **工具**　Git · Docker · Linux · Kubernetes · GCP Cloud Run · Pub/Sub · OpenTelemetry

## 工作经历
### AI Agent 开发工程师 · tapnow <span class="date">2026.5 — 至今</span>
- 研发 **多模型生成平台**，打通 SDK、模型网关、业务编排与计费链路，覆盖文本、图像、视频、语音及 3D；实现多供应商协议适配、渠道加权降级与参数校验，支撑画布和 Agent 共用模型能力。
- 设计并实现 **长任务恢复机制**：基于 Redis 所有权锁与心跳、终态 fencing 和数据库 CAS 更新，配合独立 Scheduler 扫描、回收并重投孤儿任务，处理容器退出、锁失效与任务重复执行风险。
- 完善 **Agent Worker / Proxy** 的流式与会话链路：修复首 token 前超时、客户端断连后上游继续执行、媒体审核拒绝导致会话反复失败等问题；统一错误分类与取消传播，并修复请求透传导致的 Prompt Cache 不命中。
- 推进 **Go 模型服务重构**，拆分 Gateway / Sync / Async / Scheduler 与共享 Core；实现数据库驱动的模型目录、渠道级模型绑定和配置导入，补齐 Anthropic 协议桥接、实时语音识别及多模态适配。
- 治理 **估价、预占与实扣一致性**，修复视频按秒计费、输入时长遗漏、Agent 累计成本透传等问题；结合 Cloud Run 日志、PostgreSQL / MySQL 和调用链定位故障，推动跨服务修复与测试验收。
- 从 0 到 1 研发 **Loop 多智能体协作平台（本地阶段）**：基于 Go、Pi、PostgreSQL 与 Redis 构建项目、Agent、Manager 任务、Inbox 和 loopctl，支持会话接续、任务隔离与权限配置；以模型接入流程探索开发、QA 与 Review 的协作闭环。

### 技术负责人 · loomu · AI 创作助手 <span class="date">2025.11 — 2026.4</span>
- 作为技术负责人，从 0 到 1 搭建 AI 创作助手的后端与 SaaS 计费系统（FastAPI + Stripe）。
- 基于 AgentScope 设计多智能体内容生成系统，服务社交媒体内容创作。

### 安全研发工程师 · 字节跳动 · 安全与风控 <span class="date">2023.10 — 2025.7</span>
- 研发容器微隔离 **HFW v3**：控制面迁移 Hertz 架构，**规则响应提升 400%**，支持热更新，稳定性大幅增强。
- 海外 HFW 覆盖率从 **74.45% 提升至 91.96%**，显著抬升网络安全水位。
- 参与网络隔离统一平台方案设计与落地：支持优先级 1~N 排列调整、工单查询过滤、配置文件动态获取等。
- 海外 **DDoS** 防护全面升级至 v2.8.1，补齐 IPv6 防护；搭建覆盖检测 / 清洗 / 数据库的完整 DDoS 测试环境，支撑后续防护迭代。

### 安全研发工程师 · 字节跳动 · 安全与风控 <span class="date">2022.6 — 2023.10</span>
- 集团网络安全研发（**NTA + DDoS + WAF**）：DDoS 黑洞信息同步，实现秒级封禁、分钟级解封；WAF 黑名单多策略组配置，提升防护灵活性。
- **WebP 0day** 漏洞应急：48 小时内开发自动检测工具，在网络侧精准识别利用堆溢出的 WebP 格式图片。
- NTA 协议风险识别（Telnet / FTP / MySQL / SMB）：精准识别用户名 / 口令 / SQL 操作 / 文件读写，上线后发现 **20+ 起高危风险**，防止办公网支付数据泄漏、测试网弱密码等安全事件；研发 NTA for AWS 云版本。
- 安全规则自动化检测工具（0→1）：**规则检测效率提升 70%+、人工成本降低 90%+**，测试覆盖 3521 条规则；负责国内三大核心机房 + 7 个汇聚机房及新加坡 / 马来西亚 / 美东部署，多次大版本升级 **0 事故**。

## 亮点
### GOSIM Hangzhou 2025 · Code Alert 黑客马拉松（第五名） <span class="date">2025.8 — 2025.9</span>
探索 AI 智能体与实时战略游戏的融合，打造「AI 战役指挥官」——用多智能体辅助玩家进行 RTS 对战。　[github.com/AI-for-anyone/RedAlert](https://github.com/AI-for-anyone/RedAlert)

### 开源代码研读 <span class="date">2026.1 — 2026.4</span>
系统研读 OpenClaw、Claude 相关开源代码，深入理解 LLM Agent 推理链路、工具调用机制与上下文管理实现，并应用于多智能体架构设计。

## 教育
### 华中科技大学 <span class="date">2019.9 — 2022.6</span>
网络空间安全 · 硕士

### 华中科技大学 <span class="date">2015.9 — 2019.6</span>
信息安全 · 学士
