---
title: 每日商业与科技简报 · 2026-07-13
description: 2026 年 7 月 13 日商业与科技要闻：苹果诉 OpenAI 商业机密案持续发酵，马斯克与奥特曼周末在 X 上公开互撕升级为"互指对方诈骗投资人"；OpenAI 部署公司收购 Northslope 加码企业AI落地服务；FTC 对 Edwards Lifesciences 开出史上最高 HSR 未申报罚单；中国 AI Token 基础设施公司趋境科技半年融资超10亿元。科技侧我国首颗软件定义+三维近存计算 AI 芯片在沪亮相（14nm 制程实现 520 万亿次/秒算力），SpaceX Starship 经 FAA 结案后获准复飞，GitHub 上线全新 PR 仪表盘并公布 Code Quality 定价，linux.do 社区围绕 GPT-5.6 Sol/Terra/Luna 三档模型选型持续讨论。
date: 2026-07-13
lang: zh
tags: [ai, agent, tech, business]
---

- **日期**：2026 年 7 月 13 日（星期一）
- **覆盖窗口**：约 2026-07-11 至 2026-07-13，优先近 24 小时
- **信息源**：V2EX、linux.do、TechCrunch、OpenAI News、GitHub Blog、Microsoft Dev Blogs、arXiv（cs.AI/cs.SE/cs.CR/stat.ML）、FTC Press Releases

> 说明：直接抓取各站 RSS 本次第 12 次被沙箱网络白名单拦截（与 07-02 至 07-12 十一期简报相同）——mcp web_fetch 对 techcrunch.com、v2ex.com、linux.do、openai.com、github.blog、devblogs.microsoft.com、export.arxiv.org、www.ftc.gov 均返回"not on the network allowlist (cowork-egress-blocked)"／"URL not in provenance set"。未做任何绕过尝试，全部改用 WebSearch 定向检索合成，单条时间戳为近似值。已用关键词逐一比对 2026-07-10 至 07-12 三期历史简报（并抽查 07-02 至 07-09）去重：SK海力士IPO本体、苹果诉OpenAI诉状细节、GPT-5.6/GPT-Live首发、OpenAI Partner Network、Together AI融资、Rivian融资/Waymo拥堵事件、智平方融资、Sierra/Glean ARR数据、GitHub CodeQL 2.26.0/Copilot模型阵容/Visual Studio 2026 GA、FTC Deere/Handy/Hopper/Publishing.com/"美国制造"警告信/AI准确性政策声明、MiniMax零薪酬、Ollama融资、Norm/Lyzr、马斯克力挺Anthropic、腾讯混元Hy3、GPT-5.6 Sol数学猜想证明、Fable5出口管制延期、V2EX大模型客户端挤压Agent应用讨论等本期不再重复呈现，仅保留增量信息（SK海力士今日正式转常规交易属自然延续，仅简要带过不单列条目）。来源可信度较弱、单一信源或传闻性质者标注"⚠️"。文末列出本次抓取缺口。

---

## 一、商业简报（Business）

### 1. 苹果诉 OpenAI 案持续发酵，马斯克与奥特曼周末在 X 上公开互撕升级
- **核心摘要**：苹果 7 月 10-11 日对 OpenAI 提起的商业机密诉讼持续引发连锁反应——周末（7 月 11-12 日）马斯克在 X 上就诉讼多次发帖批评 OpenAI 招聘手段，并重提此前对奥特曼"诈骗投资人"的指控；奥特曼随即回击，提及 GPT-5.6 Sol 发布时间点与马斯克旗下 Grok 4.5 发布节奏的对比，称马斯克"对自己很执着"。双方互指对方以误导性说法欺骗投资人，冲突已从诉讼本身外溢为公开人身攻击。OpenAI 官方回应称对其他公司的商业机密"没有兴趣"，拒绝诉状中的核心指控。
- **为什么重要**：诉讼本身此前已有报道，但马斯克与奥特曼的公开对撕是新进展——反映 AI 巨头创始人之间的私人恩怨正与商业诉讼、人才争夺、产品发布节奏深度纠缠，可能影响双方公司的公关策略与融资/IPO 窗口期舆论环境。
- **商业信号**：AI 行业头部创始人之间的公开冲突正成为影响企业声誉与投资人信心的独立变量；企业高管言论风险管理、诉讼时机与产品发布节奏的协调将更受关注。
- **来源与时间**：[CNBC](https://www.cnbc.com/2026/07/12/elon-musk-and-sam-altman-spar-.html)、[Fortune](https://fortune.com/2026/07/13/elon-musk-sam-altman-feud-scam-accusations-spacex-openai-ipos-grok-gpt-apple-lawsuit/) · 2026-07-12/07-13

### 2. OpenAI 部署公司收购 Northslope，加码"企业AI落地服务"赛道
- **核心摘要**：OpenAI 旗下、由 OpenAI 控股的独立实体 OpenAI Deployment Company 宣布收购应用型 AI 服务公司 Northslope，这是该部署公司继收购 Tomoro 之后的第二笔收购。Northslope 由前 Palantir 团队创立，主营模式为派驻"前沿部署工程师"（Forward Deployed Engineer）驻场客户企业，将 AI 系统嵌入其实际业务流程。该部署公司此前已获得 40 亿美元资金用于此类并购。
- **为什么重要**：随着前沿模型能力日趋接近、单纯"拼模型"难以形成差异化，OpenAI 正把竞争重心延伸到此前由咨询公司（埃森哲等）和 Palantir 式驻场服务占据的"企业AI落地实施"环节。
- **商业信号**：模型公司与传统IT咨询/系统集成商的业务边界正在模糊，具备"驻场交付+行业数据对接"能力的中小型AI服务公司可能成为大厂并购标的；纯模型层的护城河正让位于"交付能力"护城河。
- **来源与时间**：[Axios](https://www.axios.com/2026/07/08/openai-deployment-company-northslope-acquisition) · 2026-07-08

### 3. FTC 对 Edwards Lifesciences 开出史上最高"未依法申报并购"罚单，共计1200万美元
- **核心摘要**：FTC 宣布 Edwards Lifesciences 因 2024 年 7 月收购医疗器械公司 JC Medical 时未按《哈特-斯科特-罗迪诺法》（HSR）完成强制申报，且收购完成次日即着手收购 JC Medical 唯一竞品公司 JenaValve（若成功将使 Edwards 垄断美国仅有的两家 TAVR-AR 在研器械公司），与卖方 Genesis MedTech 合计被处以 1200 万美元罚款（Edwards 1000万、Genesis 200万），为史上因未完成 HSR 申报开出的最高罚单。JenaValve 收购此前已因 FTC 反垄断诉讼被法院禁令阻止，Edwards 已放弃该交易。
- **为什么重要**：延续此前多期简报关注的 FTC 强监管趋势，本次是并购程序合规（而非消费者保护/AI政策）领域的重罚案例，且金额创下同类案件纪录，释放明确威慑信号。
- **商业信号**：医疗器械等强监管行业的并购方需更严格审视HSR申报义务与时间窗口，"先斩后奏"式并购的合规风险与罚款成本正显著上升。
- **来源与时间**：[FTC](https://www.ftc.gov/news-events/news/press-releases/2026/07/ftc-secures-12-million-penalties-pre-merger-reporting-act-violations) · 2026-07-13

### 4. 中国 AI 基础设施信号：趋境科技（Approaching.AI）半年内融资超10亿元
- **核心摘要**：主营"AI Token 生产服务"（面向大模型训练/推理的异构算力效率优化平台 ATaaS）的趋境科技完成新一轮A轮融资，由河南投资集团汇融基金领投，震智资本、尚势资本、星联资本等老股东追加投资，半年内累计融资超10亿元人民币。公司披露自今年春节以来单机 AI Token 生产效率提升超3倍，高质量 AI Token 总产能增长超30倍，部分头部万亿参数模型已实现单日稳定产出超1万亿 Token。
- **为什么重要**：与此前简报报道的算力基建（SK海力士、Together AI）和模型层融资不同，本轮反映资本正流向"异构算力效率优化/Token生产"这一更细分的中间层，是国产算力自主可控叙事下的新赛道信号。
- **商业信号**：面向大模型训练推理的"算力效率优化"服务正成为独立可投资赛道，尤其在国产算力/异构硬件场景下有明确付费需求；半年内多轮融资节奏也反映该细分领域竞争已趋白热化。
- **来源与时间**：[新浪财经](https://finance.sina.com.cn/tech/shenji/2026-07-13/doc-inihrxce8978022.shtml)、[量子位](https://www.qbitai.com/2026/07/448820.html) · 2026-07-13

---

## 二、科技简报（Technology）

### 1. 我国首颗"软件定义+三维近存计算"AI芯片在沪亮相，14nm制程实现520万亿次/秒算力
- **核心摘要**：7 月 13 日，采用软件定义与三维近存计算技术路线的国产 AI 芯片在上海正式发布，在 14 纳米制程工艺上实现每秒 520 万亿次浮点运算算力。技术核心是通过软件定义芯片技术动态调配硬件资源、以三维垂直堆叠将计算单元与存储单元紧密集成，访存带宽达每秒 6.4TB，从架构层面缓解"存储墙"瓶颈，不依赖先进制程即可提升算力。同步发布全栈软件工具链（兼容主流深度学习框架）及从单卡、AI服务器到液冷超节点、大规模智算集群的完整产品体系。⚠️ 检索到的多篇报道均未点明具体研发企业/芯片型号名称，可能是发布方通稿未强调品牌，或为多方联合项目。
- **为什么重要**：在先进制程受限的背景下，"架构创新替代制程升级"是国产AI芯片寻求算力突围的关键路径之一，与此前简报报道的 Fable5 因出口管制多次暂停访问等信号共同指向：地缘政治压力正在加速国产AI硬件自主可控的技术路线探索。
- **技术信号**：三维近存计算、软件定义硬件资源调配等架构级创新正成为国产芯片厂商应对制程封锁的核心策略，配套软件工具链的完整度（兼容主流框架、覆盖从单卡到集群）将是决定实际商业化落地速度的关键变量。
- **来源与时间**：[IT之家](https://www.ithome.com/0/976/197.htm)、[证券时报](https://www.stcn.com/article/detail/4015581.html) · 2026-07-13

### 2. SpaceX Starship 经 FAA 结案获准复飞，五月助推器故障原因公布
- **核心摘要**：FAA 于 7 月 13 日结束对 5 月 Starship V3 首飞助推器（Booster）失控事故的调查，认定主因是发动机启动阶段热效应影响推进系统部件及发动机报警系统设置错误；SpaceX 此前披露具体诱因为"飞船发动机启动时序的细微差异"导致助推器向错误方向偏转 90 度。SpaceX 已修改发动机启动时序并改进助推器复燃可靠性，最早本周四（7月16日）执行下一次试飞（Flight 13/V3 第二飞），届时将首次搭载第三代星链卫星。
- **为什么重要**：这是继此前简报报道的"中国可回收火箭追赶 SpaceX"之后，商业航天领域的又一关键节点——监管结案速度（约7周）直接决定 SpaceX 试飞节奏与星链星座迭代进度，也是市场关注的 SpaceX/Starlink 相关IPO叙事的重要变量。
- **技术信号**：可复用火箭的故障排查到复飞周期正在成为衡量商业航天公司工程迭代能力的关键指标；星链三代卫星搭载首飞也标志着星链星座下一代硬件即将进入实际部署阶段。
- **来源与时间**：[TechCrunch](https://techcrunch.com/2026/07/13/spacex-cleared-to-fly-starship-again-after-booster-failure-in-may/)、[CNBC](https://www.cnbc.com/2026/07/13/us-agency-closes-starship-review-ahead-of-spacexs-next-test-flight.html) · 2026-07-13

### 3. GitHub 上线全新 PR 仪表盘，Code Quality 定价公布（7月20日转正式收费）
- **核心摘要**：GitHub 于 7 月 9 日宣布全新 Pull Requests 仪表盘（github.com/pulls）正式可用，作为跟踪、排序、处理待办 PR 的统一入口；7 月 2 日 Issue Fields 功能对所有 Free/Team/Enterprise 及数据驻留版 GitHub Enterprise Cloud 组织开放正式版，支持跨组织统一追踪优先级、工时、日期等自定义字段。此外此前公开预览的 GitHub Code Quality 将于 7 月 20 日转为正式收费产品，定价为每活跃提交者每月10美元（启用相关仓库），另按用量计费AI能力部分；Copilot Billing Preview 应用将于 8 月 3 日退役。
- **为什么重要**：延续此前简报报道的 GitHub 平台密集迭代（CodeQL提示注入检测、Copilot模型阵容、可用性故障）叙事，本次是研发协作工具链本身（PR管理、Issue追踪）与AI代码质量产品商业化（明确定价）的组合更新，反映 GitHub 正把更多AI能力从免费预览推向付费产品线。
- **技术信号**：AI驱动的代码质量分析正从"免费增值试用"过渡到"按活跃提交者+用量"的清晰付费模型，为其他厂商的AI开发工具定价策略提供参照；PR/Issue管理工具的持续打磨反映大厂仍在争夺"开发者日常工作台"这一高粘性入口。
- **来源与时间**：[GitHub Changelog - PR仪表盘](https://github.blog/changelog/2026-07-09-new-pull-requests-dashboard-is-now-generally-available/)、[GitHub Changelog - Code Quality定价](https://github.blog/changelog/2026-06-16-github-code-quality-generally-available-july-20-2026/) · 2026-07-09/07-20（后者为预告，非当日事件）

### 4. arXiv 信号（覆盖仍不完整，仅供参考）
- **核心摘要**：本次关键词检索未能可靠复现 cs.AI/cs.SE/cs.CR/stat.ML 近 24 小时新提交队列，仅零星命中如"Beyond Fixed Representations: The Vocabulary and Verifier Gaps in Open-Ended AI"（开放式AI任务的词表与验证器缺口）、"Scoped Verification for Reliable Long-Horizon Agentic Context Evolution under Distribution Shift"（分布偏移下长程Agent上下文演化的可靠验证）等标题，均未能核实确切提交日期与摘要细节，不构成可信的当日增量呈现，故本期不单列具体论文条目，仅作为缺口记录。
- **为什么重要**：连续多期该信源缺口未能有效弥补，建议后续为 export.arxiv.org 开放网络白名单以获取稳定的 RSS 时间线。
- **技术信号**：无法评估。
- **来源与时间**：[arXiv cs.AI](https://arxiv.org/list/cs.AI/recent) · 检索时间 2026-07-13，无法确认具体论文提交日期

---

## 开发者社区高价值小信号（V2EX / linux.do）

> 反映真实用户需求、痛点、采用趋势与创业机会的"小信号"。时间为帖子近似活跃期。

- **linux.do：GPT-5.6 三档模型（Sol/Terra/Luna）选型与定价讨论持续升温**：linux.do"前沿快讯"与"搞七捻三"板块近期多帖围绕 GPT-5.6 Sol（旗舰，API $5/$30 每百万token输入/输出）、Terra（性价比主力，$2.50/$15）、Luna（轻量高频，$1/$6）三档定位与实际体验展开讨论，包括"三者区别""ChatGPT Work 中仅企业版与Pro版可用5.6 Ultra"等具体使用限制吐槽。**信号**：与此前简报报道的"多模型自动路由"（GitHub Copilot）趋势呼应，厂商密集推出分层定价模型后，普通开发者/重度用户面临"到底该订哪一档、企业版功能限制"的选型困惑，面向个人开发者的"模型选型/性价比对比"类工具/攻略仍有内容与产品空间。来源：[linux.do](https://linux.do/t/topic/2556210)、[linux.do](https://linux.do/t/topic/2555244) · 2026-07 上旬持续讨论
- **V2EX：从"拼车"到"自己发车"，Claude Code 订阅共享出现供给端新玩法**：V2EX 近期出现"打算自己发车 Claude Team"这类帖子，与以往单纯"找人拼车"不同，部分重度用户开始主动组织团队计划账号并对外分摊席位（标准席位约200元/月、Premium约1010元/月），角色从"拼车乘客"转向"发车车主"。**信号**：与此前多期简报报道的"订阅成本敏感/拼车"主题一脉相承，但本次反映用户群体内部正在自发形成更成熟的"轻量代理/分销"角色分工，面向个人开发者的合规订阅分摊/团队席位管理工具仍是持续存在的轻量创业机会。来源：[V2EX](https://www.v2ex.com/t/1227040) · 2026-07 上旬

---

## 三、本次抓取缺口与不确定性说明

- **arXiv（cs.AI/cs.SE/cs.CR/stat.ML）本期仍未能获取近 24 小时新增论文列表**：检索命中标题均无法核实确切提交日期与摘要，本期不做具体论文条目呈现，仅记录缺口，与此前多期简报情况相同。
- **国产AI芯片报道未能定位到具体研发企业/芯片型号名称**，多篇中文媒体报道均未点明，已在条目中标注该不确定性。
- **GitHub Code Quality 7月20日转正式定价**为预告性事件，非当日发生，已在来源时间中注明区分。
- **跨日去重**：已完整比对 2026-07-10 至 07-12 三期历史简报，并抽查 2026-07-02 至 07-09 早期简报关键词，本期正文条目均为增量内容；如需完整历史脉络，请参阅同目录下 `daily-brief-2026-07-02.md` 至 `daily-brief-2026-07-12.md`。
- **V2EX/linux.do 部分条目的精确发帖时间**未逐条核实是否严格落在近 24 小时内，均标注为"近期/持续性讨论"而非单一时间点。
- **马斯克与奥特曼互撕的具体帖子内容**基于多家科技媒体转述综合，未直接核对 X 平台原始帖子的完整用词与时间戳。
- 本次仍未能直连抓取原始 RSS，若需更高时效性与准确性，建议为相关域名开放沙箱网络白名单后重跑。
