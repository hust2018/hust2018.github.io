# 李姜磊　Jianglei Li
<div class="subtitle">AI Agent 开发工程师 · 前安全研发</div>
<div class="meta">深圳，中国　·　1158471109@qq.com　·　<a href="https://www.lijianglei.com/">www.lijianglei.com</a></div>
<div class="tagline">专注 AI Agent 与多智能体系统，把它们从 0 到 1 做成生产级产品。带着字节安全研发打下的高并发、分布式底子，痴迷把复杂系统做简单。</div>

## 关于
我是 **李姜磊**，**AI Agent 开发工程师**（前 **字节跳动** 安全研发），**华中科技大学** 网络空间安全硕士。
在 **字节跳动** 安全与风控做了约 **3 年** 网络安全研发——NTA 入侵检测、DDoS 防护、WAF、容器微隔离 HFW，多个系统从 0 到 1 落地，全球多机房部署历经多次大版本升级 **0 事故**。
如今我专注 **AI Agent** 方向：曾在 **TapNow** 研发多模型生成平台与 Agent 基础设施，覆盖 **Python / Go** 服务、分布式任务恢复、流式协议与计费一致性，并从 0 到 1 探索多智能体协作平台。**2026 年 11 月**，我加入了 **Open Design**。

## 技能
- **AI / Agent**　AgentScope · LangGraph · MCP · LLM · 多智能体 · Prompt · SSE
- **语言**　Python · Go · Bash · SQL
- **后端 / 基础设施**　FastAPI · Redis · PostgreSQL · RabbitMQ · S3 · Stripe · Hertz
- **安全**　入侵检测 (NTA) · DDoS 防护 · WAF · 容器微隔离 · 漏洞应急
- **工具**　Git · Docker · Linux · Kubernetes · GCP Cloud Run · Pub/Sub · OpenTelemetry

## 工作经历
### AI Agent 开发工程师 · Open Design <span class="date">2026.11 — 至今</span>

### AI Agent 开发工程师 · tapnow <span class="date">2026.5 — 2026.10</span>
- **核心模型服务与架构重构**：端到端负责多模态模型平台，打通 SDK、供应商适配、路由、任务编排与计费，统一支撑画布和 Agent；主导 Go 架构重构，拆分网关、同步／异步执行与调度服务，通过配置化治理、所有权心跳和终态保护，提升模型扩展与长任务可靠性。
- **AI Agent 多模型与运行基础设施**：负责统一 Agent Runtime 下的多模型接入，适配工具调用、思考参数、多模态输入与流式协议；完善 Worker／Proxy 的取消传播、媒体审核恢复和成本统计，修复动态提示词与请求透传导致的 **Prompt Cache 失效**问题，恢复多轮 Agent 会话的缓存复用。
- **多 Agent 自主协作平台（Loop）**：将分散运行于本地与云端的 Agent 纳入统一平台，通过角色分工、任务编排、消息通信与会话接续，让 Agent 团队协同推进原本需要多人配合的复杂任务；支持结果交接、审查返工与持续跟进，减少人工拆单、跨 Agent 传话和逐轮推动，将人的精力集中于目标与关键决策，应用于模型接入、线上故障排查、自动 Bug 修复、代码审查与质量测试。

### AI 技术深造与独立项目开发 · 个人学习与实践 <span class="date">2025.07 — 2026.05</span>
- **技术学习与方向转型**：从安全研发转向 AI Agent，系统学习 LLM 应用开发与多智能体协作；结合 OpenClaw、Claude 相关开源代码研读，深入理解 Agent 推理链路、工具调用与上下文管理，并应用于项目实践。
- **loomu AI 创作助手**：作为独立实践项目，从 0 到 1 开发 FastAPI 后端、接入 Stripe 计费，基于 AgentScope 构建面向社交媒体创作的多智能体内容生成流程，积累从后端服务到 Agent 应用的完整开发经验。

### 安全研发工程师 · 字节跳动 · 安全与风控 <span class="date">2022.6 — 2025.7</span>
- 研发容器微隔离 **HFW v3**：控制面迁移 Hertz 架构，**规则响应提升 400%**，支持热更新，稳定性大幅增强。
- 海外 HFW 覆盖率从 **74.45% 提升至 91.96%**，显著抬升网络安全水位。
- 参与网络隔离统一平台方案设计与落地：支持优先级 1~N 排列调整、工单查询过滤、配置文件动态获取等。
- 海外 **DDoS** 防护全面升级至 v2.8.1，补齐 IPv6 防护；搭建覆盖检测 / 清洗 / 数据库的完整 DDoS 测试环境，支撑后续防护迭代。
- 集团网络安全研发（**NTA + DDoS + WAF**）：DDoS 黑洞信息同步，实现秒级封禁、分钟级解封；WAF 黑名单多策略组配置，提升防护灵活性。
- **WebP 0day** 漏洞应急：48 小时内开发自动检测工具，在网络侧精准识别利用堆溢出的 WebP 格式图片。
- NTA 协议风险识别（Telnet / FTP / MySQL / SMB）：精准识别用户名 / 口令 / SQL 操作 / 文件读写，上线后发现 **20+ 起高危风险**，防止办公网支付数据泄漏、测试网弱密码等安全事件；研发 NTA for AWS 云版本。
- 安全规则自动化检测工具（0→1）：**规则检测效率提升 70%+、人工成本降低 90%+**，测试覆盖 3521 条规则；负责国内三大核心机房 + 7 个汇聚机房及新加坡 / 马来西亚 / 美东部署，多次大版本升级 **0 事故**。

## 亮点
### GOSIM Hangzhou 2025 · Code Alert 黑客马拉松（第五名） <span class="date">2025.8 — 2025.9</span>
探索 AI 智能体与实时战略游戏的融合，打造「AI 战役指挥官」——用多智能体辅助玩家进行 RTS 对战。　[github.com/AI-for-anyone/RedAlert](https://github.com/AI-for-anyone/RedAlert)

## 教育
### 华中科技大学 <span class="date">2019.9 — 2022.6</span>
网络空间安全 · 硕士

### 华中科技大学 <span class="date">2015.9 — 2019.6</span>
信息安全 · 学士
