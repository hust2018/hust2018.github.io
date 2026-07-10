---
title: 每日商业与科技简报 · 2026-07-09
description: 2026 年 7 月 9 日商业与科技要闻：SpaceX、OpenAI、Anthropic 三家待上市公司合计价值恐超过去 25 年美国全部 VC 背景退出总和（近 4 万亿美元），AI 训练数据创业公司 Mercor 洽谈 200 亿美元估值并收购 Deeptune，纽约时报指控 OpenAI 在版权诉讼中隐匿证据，Block 就 Cash App 欺诈保护问题与 46 州达成 4500 万美元和解；科技侧 OpenAI 全面上线 GPT-5.6（Sol/Terra/Luna）三档模型并获美国政府审查放行，Meta 自研 AI 芯片 Iris 定于 9 月投产，开源本地大模型工具 Ollama 完成 6500 万美元 B 轮融资、月活开发者近 900 万。
date: 2026-07-09
lang: zh
tags: [ai, agent, tech, business]
---

- **日期**：2026 年 7 月 9 日（星期四）
- **覆盖窗口**：约 2026-07-08 至 2026-07-09，优先近 24 小时
- **信息源**：V2EX、linux.do、TechCrunch、OpenAI News、GitHub Blog、Microsoft Dev Blogs、arXiv（cs.AI/cs.SE/cs.CR/stat.ML）、FTC Press Releases

> 说明：直接抓取各站 RSS 本次第 8 次被沙箱网络白名单拦截（与 07-02 至 07-08 七期简报相同）——mcp web_fetch 对 techcrunch.com 返回"not on the network allowlist (cowork-egress-blocked)"，bash curl 对 v2ex.com、linux.do、openai.com、github.blog、export.arxiv.org、www.ftc.gov 均因目标域名不在出站白名单而连接失败（exit 56 / 000）。未做任何绕过尝试，全部改用 WebSearch 定向检索合成，单条时间戳为近似值。已用关键词逐一比对 2026-07-02 至 07-08 七期历史简报去重（含 Ollama、Iris、Mercor、Gradium、Lyzr、Deeptune、Cash App、SivaClaw、GPT-5.6 GA、GitHub Copilot App 等本期新增关键词，逐一核实均为零匹配，确认不重复）；GitHub Models 退役／Code Quality GA／Gemini 弃用／Kimi K2.7 接入 Copilot、FTC Deere 和解、Anthropic 470 亿营收、Blue Origin 融资、AssuranceAmerica 数据泄露等此前已报道内容本期不再重复呈现。来源可信度较弱、单一信源或传闻性质者标注"⚠️"。文末列出本次抓取缺口。

---

## 一、商业简报（Business）

### 1. AI IPO 超级周期：SpaceX、OpenAI、Anthropic 合计价值恐超过去 25 年美国全部创投退出总和
- **核心摘要**：据 NVCA-Pitchbook 风险投资监测报告，SpaceX 已以 1.77 万亿美元估值完成上市，OpenAI 与 Anthropic 也在推进冲向万亿美元级别的 IPO，三家公司合计价值预计将超过 4 万亿美元——超过 2000 年以来美国全部风险投资背景公司退出（IPO＋并购）价值总和；作为对比，2019 年 Uber 840 亿美元 IPO 曾被视为大手笔，但不到三者合计规模的 5%。
- **为什么重要**：这一对比量化了本轮 AI／太空基础设施资本周期的历史级规模，也说明"独角兽长期留在一级市场、上市时点集中爆发"的趋势正推升单次 IPO 的绝对体量。
- **商业信号**：企业融资高度资本密集化（尤其是模型训练与太空发射的重资产属性）正把原本分散在 20 余年的价值创造压缩进几笔超级 IPO 中，一级市场对超大额、长周期硬科技项目的容忍度持续走高。
- **来源与时间**：[TechCrunch](https://techcrunch.com/2026/07/09/anthropic-openai-and-spacex-are-bigger-than-the-last-25-years-of-tech-exits/) · 2026-07-09

### 2. AI 训练数据创业公司 Mercor 洽谈 200 亿美元估值融资，同时收购 Deeptune 构建 Agent 训练环境
- **核心摘要**：为 AI 实验室提供人类训练数据与评估服务的 Mercor 正洽谈新一轮融资，估值达 200 亿美元（较去年 10 月 100 亿美元估值的 3.5 亿美元 C 轮大幅跃升，⚠️ 谈判仍处早期阶段，尚未最终敲定）；创始人称公司年化营收已突破 20 亿美元，较四个月前翻倍。同日，Mercor 宣布收购 a16z 投资的 Deeptune——一家为 AI Agent 构建"练习环境"（模拟操作 Excel、Salesforce、Slack 等真实软件）的公司，值得注意的是 Mercor 创始人此前曾以个人身份投资过 Deeptune 的 4300 万美元 A 轮。
- **为什么重要**：Mercor 营收翻倍速度与估值跳升幅度，是 AI 训练数据／评估这一"卖水人"环节景气度的直接量化证据；收购 Deeptune 则显示训练数据公司正主动向"Agent 强化学习环境"上游整合。
- **商业信号**：AI 基础设施投资正从"算力＋模型"进一步细分出"训练数据／模拟环境"这一独立且高增长的子赛道，创始人反向投资标的后又将其收购的操作也侧面反映该细分市场目前竞购与整合节奏之快。
- **来源与时间**：[TechCrunch – 融资](https://techcrunch.com/2026/07/09/mercor-is-in-talks-for-a-20b-valuation/)、[SiliconANGLE – 收购 Deeptune](https://siliconangle.com/2026/07/09/mercor-buys-deeptune-build-training-environments-ai-agents/)、[Fortune](https://fortune.com/2026/07/09/ai-unicorn-mercor-acquires-deeptune-brendan-foody-investor-a16z-openai-anthropic/) · 2026-07-09

### 3. 纽约时报指控 OpenAI 在 ChatGPT 版权诉讼中隐匿证据，要求法院制裁
- **核心摘要**：在与 OpenAI 长达两年的版权诉讼中，纽约时报与《纽约每日新闻》联合提交动议，指控 OpenAI 蓄意隐藏可证明 ChatGPT 训练／输出是否复现受版权保护新闻内容的内部工具与数据集；诉状称 OpenAI 此前提交的样本因大量涂黑而"不可用"，且在原告起诉后仍违反法院保全令删除了数十亿条 ChatGPT 输出记录，并在被要求提供的样本中替换了数百万条日志。4 月一次法院指令的取证中，OpenAI 数据隐私工程师 Vinnie Monaco 据称披露公司已建立一个约 7800 万条经脱敏处理的 ChatGPT 对话数据库，用于内部评估侵权规模。OpenAI 回应称纽约时报的诉求正在"变弱"、遂转向以侵犯用户隐私为由提出"站不住脚的指控"。
- **为什么重要**：这是 AI 版权诉讼中首次出现"原告指控被告销毁证据＋违反法院保全令"级别的重大程序性指控，若坐实，制裁后果（举证责任倒置、不利推定等）可能显著改变本案乃至同类诉讼的走向。
- **商业信号**：大模型公司在训练数据合规与证据保全上的内控水平正被提到与其营收规模不匹配的严格标准前接受检验，媒体与内容方对 AI 公司的诉讼策略正从"要求赔偿"转向"要求追责与制裁"，法律风险敞口有进一步扩大迹象。
- **来源与时间**：[TechCrunch](https://techcrunch.com/2026/07/09/new-york-times-says-openai-hid-evidence-in-chatgpt-copyright-trial/)、[半岛电视台](https://www.aljazeera.com/economy/2026/7/9/nyt-led-group-asks-court-to-sanction-openai-in-us-copyright-dispute) · 2026-07-09

### 4. Block 就 Cash App 欺诈保护不力与 46 州达成 4500 万美元和解
- **核心摘要**：多州总检察长指控 Cash App 虚假宣传其具备"银行级"防护与高级欺诈检测能力，实际却允许用户无需社会安全号码或出生日期即可开户、且不限制单人可开设账户数量，为诈骗分子提供可乘之机；同时 Cash App 长期缺乏官方客服电话，导致大量被锁定账户的用户转向诈骗分子冒充的"客服热线"上当受骗。和解要求 Block 改进欺诈防范与客服体系，包括每日至少提供 13.5 小时人工电话客服、18 小时在线聊天支持。该案是继消费者金融保护局此前对 Block 处以 1.75 亿美元罚款及赔偿之后的又一起监管行动。
- **为什么重要**：这是今年规模较大的消费金融类多州联合和解案之一，凸显移动支付类产品在快速扩张用户规模的同时，反欺诈与客服基础设施建设明显滞后。
- **商业信号**：随着监管机构对"金融科技类应用是否达到银行级消费者保护标准"的审查趋严，纯软件出身的支付公司未来可能被迫承担更接近传统银行的合规成本，这对其轻资产扩张模式构成结构性压力。
- **来源与时间**：[TechCrunch](https://techcrunch.com/2026/07/09/block-reaches-45m-settlement-with-46-states-over-cash-app-fraud-probe/) · 2026-07-09

### 5. 美国政府审查放行 GPT-5.6 更广泛发布，创下 AI 模型接受政府"过审"先例
- **核心摘要**：据报道，特朗普政府在美国商务部旗下"AI 标准与创新中心"（CAISI）对 GPT-5.6 进行额外测试、并与 OpenAI 举行多轮会议后，批准该模型面向更广泛用户群体发布；OpenAI 于 7 月 9 日起在 ChatGPT、Codex 与 API 全面上线 GPT-5.6 系列（Sol/Terra/Luna），全球范围推送将在随后 24 小时内完成。
- **为什么重要**：这是美国联邦行政部门首次被曝出对某一具体商用大模型的公开发布节奏施加实质性审查与延后影响，标志着前沿模型发布正从"企业自主决定"部分让渡为"政府审查后放行"的新模式。
- **商业信号**：若该审查模式常态化，将为大模型厂商的发布节奏引入新的不确定性变量，也可能成为其他国家或地区在 AI 治理立法中援引的先例；企业客户在采购前沿模型时或需将"政府审查周期"纳入产品路线图风险评估。
- **来源与时间**：[Nextgov/FCW](https://www.nextgov.com/artificial-intelligence/2026/07/openais-advanced-gpt-56-models-be-available-public/414651/)、[Engadget](https://www.engadget.com/2210308/openai-rolls-out-gpt5-6-july-9/) · 2026-07-09 ⚠️ 政府审查具体流程与依据的一手文件未能定位，内容据多家科技媒体转述交叉确认

**其他值得关注（商业）**：企业 AI Agent 创业公司 Lyzr 让自己开发的 AI Agent「SivaClaw」主导本轮约 1 亿美元、估值约 5 亿美元 B 轮融资的对外沟通——该 Agent 独立应答超过 130 位投资人的提问、撰写投资备忘录，甚至追踪投资人在融资材料每一页的停留时长，创始人无需亲赴硅谷路演即吸引约 4 亿美元意向认购（⚠️ 该轮次公司自称"进行中"而非已完成，尚无领投方公开确认）（[Bloomberg](https://www.bloomberg.com/news/articles/2026-07-09/a-startup-that-builds-ai-agents-used-one-to-raise-100-million)、[TechCrunch](https://techcrunch.com/2026/07/09/an-ai-agent-startup-just-let-its-agent-run-its-100-million-fundraise/) · 2026-07-09）；巴黎语音 AI 创业公司 Gradium（脱胎于 Kyutai 实验室）在英伟达等新投资人加入后，将种子轮规模从 7000 万美元扩大至超 1 亿美元，用于开设湾区办公室并争夺当地人才，其超低延迟语音模型已拿下雷诺等大客户（[TechCrunch](https://techcrunch.com/2026/07/09/paris-based-ai-voice-startup-gradium-raises-100m-seed-backed-by-nvidia/) · 2026-07-09）；Infosys 联合创始人 Nandan Nilekani 卸任印度创投机构 Fundamentum 普通合伙人一职，该机构同时宣布启动规模约 2 亿美元的第三期基金（[TechCrunch](https://techcrunch.com/2026/07/09/nandan-nilekani-leaves-gp-role-at-his-vc-firm-as-it-launches-third-200m-fund/) · 2026-07-09）。

---

## 二、科技简报（Technology）

### 1. OpenAI 全面上线 GPT-5.6：Sol/Terra/Luna 三档定价公开，Prompt Caching 规则同步调整
- **核心摘要**：继此前多期简报报道的 GPT-5.6 Sol 预览及 Terra/Luna 分档消息后，OpenAI 于 7 月 9 日在 ChatGPT、Codex 与 API 端全面开放 GPT-5.6 系列：旗舰 Sol 定价为每百万 token 输入 5 美元／输出 30 美元，均衡型 Terra 为 2.5 美元／15 美元（性能接近 GPT-5.5 但成本减半），轻量型 Luna 为 1 美元／6 美元；新版本同时引入更可预测的 Prompt Caching 机制，支持显式缓存断点与 30 分钟最低缓存生命周期，缓存写入按未缓存输入价格的 1.25 倍计费，缓存读取仍享 90% 折扣。
- **为什么重要**：这是 GPT-5.6 系列从"预览／分档预告"到"全量 GA＋公开定价"的关键节点，标志着该系列正式进入生产可用阶段，企业客户可据此重新核算迁移成本。
- **技术信号**："代际数字＋能力档位"（如 5.6-Sol／Terra／Luna）的命名体系延续了此前"分层解耦"的产品化趋势；Prompt Caching 计费规则变化则表明模型厂商正在推理成本结构上做更精细化的价格分层管理，是判断企业级 API 采购成本走势的重要先行指标。
- **来源与时间**：[OpenAI 帮助中心](https://help.openai.com/en/articles/20001325-a-preview-of-gpt-56-sol-terra-and-luna)、[Simon Willison 技术解读](https://simonwillison.net/2026/Jul/9/gpt-5-6/)、[MarkTechPost](https://www.marktechpost.com/2026/07/09/openai-releases-gpt-5-6-a-three-tier-model-family-with-programmatic-tool-calling/) · 2026-07-09

### 2. Meta 自研 AI 芯片"Iris"定于 9 月投产，目标明年将算力提升至 14 吉瓦
- **核心摘要**：Meta 计划于 9 月开始生产其自研 AI 芯片"Iris"（Meta Training and Inference Accelerator／MTIA 系列第四代），意在缓解英伟达、AMD GPU 采购面临的空前元器件短缺压力；该芯片由 Meta 与博通共同设计、交由台积电代工，配套采用三星内存、Sandisk 存储与住友电工光纤设备；六周芯片测试未发现重大问题；Meta 预计今年在 AI 基础设施上的支出最高将达 1450 亿美元，目标是将整体算力提升至 14 吉瓦。Iris 被定位为对英伟达／AMD GPU 采购的"补充"而非替代。
- **为什么重要**：这是 Meta 自研芯片项目从设计走向实际投产的关键时间节点，也是继 OpenAI、Google、Anthropic（据传与三星洽谈）之后又一家头部 AI 公司公开明确自研芯片量产时间表的案例。
- **技术信号**：头部 AI 公司正在把"降低对英伟达单一供应商依赖"从战略表态落实为具体投产日期与供应链清单（三星、台积电、住友电工等），芯片自研与第三方采购"并行而非替代"的模式可能成为大厂算力扩张的标准路径。
- **来源与时间**：[TechCrunch](https://techcrunch.com/2026/07/09/metas-new-ai-chips-will-begin-production-in-september/)、[CNBC](https://www.cnbc.com/2026/07/09/meta-to-put-ai-chip-into-production-in-september-report.html) · 2026-07-09

### 3. 开源本地大模型工具 Ollama 完成 6500 万美元 B 轮融资，14 人团队支撑近 900 万月活开发者
- **核心摘要**：Ollama 完成由 Theory Ventures 领投的 6500 万美元 B 轮融资，Benchmark、8VC、Y Combinator、Pace Capital 等参投，公司累计融资达 8800 万美元；官方披露月活开发者已达约 890 万，覆盖 85% 财富 500 强企业，拥有超过 6.7 万个社区共建的模型／工具集成，与几乎所有主要模型实验室及硬件厂商建立合作；值得注意的是，支撑这一体量的团队仅有 14 名员工，创始团队此前曾参与打造 Docker Desktop（Docker 收购其此前创业项目 Kitematic 后加入）。
- **为什么重要**：作为本地运行开源大模型的事实标准工具，Ollama 的开发者规模与增长速度是衡量"开源模型本地化部署"这一需求真实体量的重要一手指标。
- **技术信号**：极小团队规模（14 人）支撑近 900 万月活开发者的效率比，反映开发者工具类产品在 AI 时代的杠杆效应正被进一步放大；企业级采用比例（85% 财富 500 强）也说明"本地/私有化部署开源模型"已从个人爱好者场景扩展为主流企业 IT 基础设施选项之一。
- **来源与时间**：[TechCrunch](https://techcrunch.com/2026/07/09/popular-open-source-ai-developer-tool-ollama-raises-65m-grows-to-nearly-9m-users/)、[SiliconANGLE](https://siliconangle.com/2026/07/09/open-source-ai-developer-tool-ollama-raises-65m-grow-platform/) · 2026-07-09

**其他值得关注（科技）**：GitHub Copilot 独立客户端应用已面向所有 Copilot 订阅计划开放，支持 macOS／Windows／Linux 三大平台；GitHub Copilot CLI 现可在 GitHub Actions 中运行且无需再配置个人访问令牌（PAT），进一步降低了 CI/CD 场景下接入 Copilot 自动化任务的门槛（[GitHub Changelog – Copilot App](https://github.blog/changelog/2026-07-07-github-copilot-app-available-to-all/) · 2026-07-07）。arXiv 方向本期检索到多篇聚焦"大模型安全综述与检测"的论文（如整理提示注入攻击、模型编辑后门等主题的综述型工作），但未能定位到明确指向近 24 小时内新发布、且带精确 arXiv 编号的一手论文，为避免引用过时或编号错配的内容，本期正文不纳入 arXiv 具体条目，仅在文末说明该缺口。

---

## 开发者社区高价值小信号（V2EX / linux.do）

> 反映真实用户需求、痛点、采用趋势与创业机会的"小信号"。时间为帖子近似活跃期。

- **linux.do：GPT-5.6 分级／分批开放策略引发用户明显不满情绪**：随着 GPT-5.6 全量上线，linux.do 前沿快讯与开发调优板块密集出现"终于用上 5.6 了""实测 5.6 能用了""plus 也用上 5.6 啦，先试试水"等晒图帖，同时也有"为什么我用不上 5.6 我要闹了""ChatGPT Work 中仅 Enterprise 和 Pro 可以使用 5.6 ultra"等抱怨帖，反映 Free/Go／Plus／Pro／Business／Enterprise 各档位分批解锁 Sol/Terra/Luna 与 Ultra 推理档的策略在社区中造成明显的"体验分层焦虑"。**信号**：模型厂商按订阅档位分批放量新模型虽有助于平滑算力压力、区分付费梯度，但也直接催生了免费/低价档用户的强烈"错失感"，是订阅制 AI 产品在重大版本发布节点上普遍面临的舆情管理难题，值得同类厂商在发布策略设计时提前预案。来源：[linux.do – 5.6真要来了吗](https://linux.do/t/topic/2543216)、[linux.do – 为什么我用不上5.6我要闹了](https://linux.do/t/topic/2556463) · 2026-07-09 前后
- **V2EX："AI 冲击就业市场"讨论持续升温，出现具体一手案例而非泛泛而谈**：近期帖子从此前"是否会被 AI 取代"的抽象讨论，转向更具体的个人经历——如"今天是在现在公司的最后一天，聊聊 AI 时代的个人感受"、面试候选人被观察到"社保断缴"（暗示已长期处于失业/待业状态）、以及"为什么 V 站这么多人认为裁员是经济下行而非 AI 工具真实提升了开发效率"等争论帖。**信号**：与此前几期简报报道的"企业裁员＋AI 效率提升"宏观叙事相印证，个体开发者层面的证据正从"猜测/焦虑"阶段过渡到"可观察的具体案例"阶段，是判断 AI 对白领就业市场实际冲击程度的重要基层信号来源，建议后续简报持续跟踪该话题的情绪与案例密度变化。来源：[V2EX – 最后一天](https://www.v2ex.com/t/1226286)、[V2EX – 裁员是因为AI还是经济下行](https://www.v2ex.com/t/1197585) · 2026-07 近期

---

## 三、本次抓取缺口与不确定性说明

- **RSS 直抓连续第 8 天被拦截**：本次已用 mcp web_fetch（对 techcrunch.com 返回"not on the network allowlist (cowork-egress-blocked)"）与 bash curl（对 v2ex.com、linux.do、openai.com、github.blog、export.arxiv.org、www.ftc.gov 均连接失败，exit code 56／000）双重方式确认拦截，与 07-02 至 07-08 七期简报完全一致，已按规定未做任何绕过尝试，全部改用 WebSearch 定向检索合成，时间戳为近似值。
- **跨日去重方法**：已用关键词逐一比对 2026-07-02 至 07-08 七期历史简报全文（含本期新增关键词 Ollama、Iris、Mercor、Gradium、Lyzr、Deeptune、Cash App、SivaClaw 等），确认均为零匹配，本期正文条目均为新增内容；GPT-5.6 仅呈现"全量 GA＋定价公开"这一相对此前七期预览报道的增量信息。
- **美国政府审查 GPT-5.6 发布节奏的具体流程缺乏一手文件**：相关内容主要引自 Nextgov/FCW、Engadget 等媒体转述，未能定位到白宫或商务部官方声明原文，已标注⚠️，建议后续简报持续跟踪是否有官方文件披露审查标准与依据。
- **Lyzr 融资尚未最终敲定**：1 亿美元、5 亿美元估值均为公司自称的"进行中"数字，尚无领投方或第三方机构公开确认，已标注⚠️。
- **arXiv cs.AI/cs.SE/cs.CR/stat.ML 本期未纳入具体论文级引用**：检索候选论文多为大模型安全综述类工作，但未能确认其为近 24 小时内新发布、且缺乏可核实的具体 arXiv 编号（检索结果多指向历史存量论文或仅命中分类列表页），为避免重复此前多期简报出现过的编号错配问题，本期主动略去具体论文引用，仅在此说明存在该缺口。
- **FTC 本期未发现 07-09 新增一手公告**：检索到的 FTC 近期新闻（Hopper 和解、Publishing.com 和解、"Made in USA"警告信、Deere 和解等）均已见于 07-02 至 07-08 历史简报，本期未见新发布内容，故本期简报正文不含独立 FTC 条目。
- **建议**：如需稳定获取逐条 RSS 原文与精确时间戳，可在 设置 → Capabilities 中将 v2ex.com、linux.do、techcrunch.com、openai.com、github.blog、devblogs.microsoft.com、export.arxiv.org、ftc.gov 等域名加入网络白名单，以替代当前的 WebSearch 定向检索合成方案。
