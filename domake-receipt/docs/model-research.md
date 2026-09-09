# Domake Receipt：票据提取模型与成本决策

核对日期：2026-09-09。范围是照片／PDF → 房屋历史记录所需结构化数据；价格为美元 API 标价，未含税。本轮只核对官方文档，没有调用收费模型，没有做真实票据准确率或延迟测试。文中的选择、配额、门槛和路由是工程建议，不能当作已验证结论。

## 建议先这样做

原型／试点先保留可替换的模型适配层，以 **Gemini 2.5 Flash-Lite 为最低成本基线**，同时用 **Gemini 3.1 Flash-Lite 和 3.5 Flash-Lite 做同样样本的候选对比**。第一批不要根据模型自报的“95% 信心”自动入库；生成草稿后，用户确认或修改再保存。复杂、模糊、金额不一致的单据最多升级重试一次，再交给用户补充。

理由是该任务的产品价值来自“正确归到某套房屋、保留原始凭证、形成可检索历史”，未必需要昂贵推理。最低价模型是否够用，必须由房屋服务类票据实测决定。建议优先比较每张最终确认记录的成本、人工改动率与端到端等待时间，而不只比较每百万 token 标价。

## 名称、能力和生命周期

| 模型 / 实际 API ID | 当前文档状态 | 图片、PDF、JSON 与建议角色 |
|---|---|---|
| Gemini 2.5 Flash-Lite / `gemini-2.5-flash-lite` | Stable；未宣布关停 | 原生图片/PDF；结构化输出；最低成本基线。 |
| Gemini 2.5 Flash / `gemini-2.5-flash` | Stable；未宣布关停 | 多模态、结构化输出；2.5 系列对照或升级候选。 |
| Gemini 3 Flash / `gemini-3-flash-preview` | **Preview**；未宣布关停 | 图片/PDF、结构化输出；用户口中的“3.0 Flash”应使用这个准确 ID，不假设存在 `gemini-3.0-flash`。 |
| Gemini 3.1 Flash-Lite / `gemini-3.1-flash-lite` | Stable；当前表列最早关停日 2027-05-07 | 图片/PDF、结构化输出；较便宜的新一代候选。 |
| Gemini 3.5 Flash-Lite / `gemini-3.5-flash-lite` | Stable；未宣布关停 | 图片/PDF、结构化输出；当前文档定位包含文档解析，纳入质量对照。 |

能力分别来自官方模型页：[2.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-lite)、[2.5 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash)、[3 Flash Preview](https://ai.google.dev/gemini-api/docs/models/gemini-3-flash-preview)、[3.1 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite)、[3.5 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite)。关停信息来自 [Gemini 生命周期表](https://ai.google.dev/gemini-api/docs/deprecations)。这些模型均列约 1M 输入上下文及 65,536 输出上限，但本项目无需接近上限。

配置应记录确切 `model_id`、提示词版本和 schema 版本。不要使用无版本的“latest”作为不可追踪的生产依赖；部署前核对目标项目实际可用模型及生命周期。

## 统一假设下的价格和 10,000 张成本

为便于横向比较，假设每张单页票据平均 **2,500 个计费输入 token（含图片/PDF与提示词）+ 600 个计费输出 token**；所有请求一次成功，无缓存、工具、搜索、重试及额外思考 token。图片大小、PDF页数和输出详细程度会改变实际用量。这是预算场景，**不是“每张票据固定耗用这些 token”**。

| 模型 | 输入 / 百万 token | 输出 / 百万 token | 10,000 张实时标准调用 | 同用量 Batch 理论值 |
|---|---:|---:|---:|---:|
| 2.5 Flash-Lite | $0.10 | $0.40 | **$4.90** | $2.45 |
| 2.5 Flash | $0.30 | $2.50 | $22.50 | $11.25 |
| 3 Flash Preview | $0.50 | $3.00 | $30.50 | $15.25 |
| 3.1 Flash-Lite | $0.25 | $1.50 | $15.25 | $7.63 |
| 3.5 Flash-Lite | $0.30 | $2.50 | $22.50 | $11.25 |

价格表来源：[Google Gemini API 定价](https://ai.google.dev/gemini-api/docs/pricing)。计算式为 `10,000 × (2,500 × 输入单价 + 600 × 输出单价) / 1,000,000`，Batch 四舍五入到美分。思考 token 也按输出计费。

推导例：全量先跑 2.5 Flash-Lite，其中 10% 再完整跑一次 3 Flash Preview，在相同用量假设下为 **$4.90 + $3.05 = $7.95 / 万张**。若首轮就用 3.1 Flash-Lite，加同样 10% 升级则为 **$18.30 / 万张**。这 10% 是演算假设，并非已测出的失败率。

如果平均每张另消耗 1,200 个思考 token，万张额外成本分别为 $4.80、$30.00、$36.00、$18.00、$30.00。不要只统计返回的 JSON 字数。实际账单应用响应 usage 与账单复核。

**在线上传后立刻确认，使用标准调用。** Batch 面向离线导入历史存档和评测，官方目标周转时间为 24 小时、价格约标准调用一半，不能把 Batch 的价格当作即时体验成本。[Batch API](https://ai.google.dev/gemini-api/docs/batch-api)

除模型费，还需预算：对象存储、数据库、图片转换、网络与后端运行、人工支持。长 PDF 按实际页数和 token 重新计算，不能按一个文件等同一张单据。免费产品可先设每账户月度额度、单文件页数上限和全站预算，提供用尽后的明确提示。

## 输入、结构化输出与速度

- Gemini 支持 PNG、JPEG、WEBP、HEIC、HEIF；图片 token 和分辨率有关。Gemini 3 的 `media_resolution` 会影响小字识别、耗时和 token。建议先校正方向、适度裁边，保留清晰数字，不为了省极少输入费把收据压到看不清。[图片文档](https://ai.google.dev/gemini-api/docs/image-understanding)
- PDF 官方上限为 50 MB / 1,000 页，并受上下文限制。Gemini 3 支持 PDF 内嵌文本与视觉处理，文档说明内嵌提取文本不另收 token 费。产品第一版可主动收紧为 15 MB / 10 页并解释，这是产品范围，不是厂商上限。[PDF 文档](https://ai.google.dev/gemini-api/docs/document-processing)
- 使用明确 JSON Schema，核心键全部输出，未知值为 `null`，例如 `{"type":["string","null"]}`；不要填 `"N/A"`、猜日期、把缺失金额写成 0。JSON 模式只限制格式，仍需做值校验；Google 也提醒语义错误及复杂 schema 限制。[结构化输出](https://ai.google.dev/gemini-api/docs/structured-output)
- 2.5 Flash-Lite 默认不启用 thinking；3 Flash Preview 默认高 thinking，可选 minimal。应在所用 API 与 SDK 中显式配置合适的思考级别／预算，并测量实际总输出量。[Thinking 文档](https://ai.google.dev/gemini-api/docs/thinking)
- 不宣称“2秒识别”或哪个模型最快：官方定位不能代替本任务测速。记录上传耗时、提取耗时、p50/p95、超时率与完整确认耗时。建议内部试点目标可设清晰单页 p50 < 5s、p95 < 15s，明确标为目标而非承诺。

## 免费功能应使用付费 API 的数据处理条件

住宅地址、业主姓名、服务商联系方式和财务信息可能出现在凭证中。面向真实用户的免费产品，建议使用已关联有效结算账户的 API 项目。按 Google 条款，非付费服务的输入／输出可能被用于改进产品且可能人工审阅，条款要求不要提交敏感、机密或个人信息；付费 API 不将这些内容用于改进产品，但仍有有限期安全日志，因此不能宣传为零保留。EEA、英国和瑞士存在条款例外，应按运营地区核对。[Gemini 数据使用条款](https://ai.google.dev/gemini-api/terms)

模型请求只做凭证提取，无需搜索或外部工具。服务器持有密钥，前端不保存 API Key；原始附件放私有存储，通过短时授权访问。面向用户写清发送到哪家处理、保存多久、如何删除。公开原型使用合成样例。以上是本项目设计建议。

速率限制按 **project** 而非单个 API Key 计算，免费／付费额度随项目、模型及账户状态变化；上线时查 AI Studio 的实际额度，不复制网上某个“每日免费 1,000 次”数字。[速率限制](https://ai.google.dev/gemini-api/docs/rate-limits)

## 值得保留的非 Gemini 对照

| 方案 | 官方能力 / 费用 | 本项目定位 |
|---|---|---|
| Mistral OCR 4.1 | 当前稳定 OCR，模型 ID `mistral-ocr-4-1`；$4 / 千页 OCR、$5 / 千页 annotated；1万单页分别约 $40 / $50 | 如果需要正文、版面证据、框选校对，一起测其 document annotation；暂不额外搭完整 OCR 管线。 |
| Amazon Textract AnalyzeExpense | 专门抽取发票和 receipt，提供 summary fields、line items 等；Oregon 首百万页示例 $0.01 / 页，即万单页约 $100 | 已有 AWS 平台或希望成熟费用字段体系时作参照；仍需映射成 Domake 房屋历史字段。 |

来源：[Mistral OCR 4.1](https://docs.mistral.ai/models/ocr-4-1)、[Mistral 自定义 JSON annotation](https://docs.mistral.ai/studio/document-processing/annotations)、[AWS 收据和发票分析](https://docs.aws.amazon.com/textract/latest/dg/analyzing-document-expense.html)、[AWS 定价](https://aws.amazon.com/textract/pricing/)。两者未做任务实测；AWS 价格具地区和用量条件，Mistral 字段语义与保留条件在选入生产前另做验证。

## 一周内能作出的决策

1. 用获准样本建立 80–120 张的人工标准答案集：清晰照片、斜拍、折痕、小字、手写、中文/英文、PDF、多页账单、invoice/estimate/paid receipt，并包含收据上没有服务地址或服务日期的例子。公开项目只放合成或充分脱敏样例。
2. 固定一份提示词与 schema 跑 2.5 Flash-Lite、3.1 Flash-Lite、3.5 Flash-Lite；2.5 Flash 与 3 Flash Preview 可作为复杂样本对照。对成本低但频繁让人返工的模型降级。
3. 分别核对 provider、真实服务日期与票据日期、service address 与商家地址、currency、total、payment status、工作摘要、房屋系统分类；专门统计“缺失却被编造”的次数。
4. 使用规则标出需要核对的字段，例如税费与合计矛盾、金额解析错误、日期歧义、地址不一致、缺少关键字段。低质量图片先让用户重拍；不要无限重复推理。
5. 输出每模型的人工改动率、字段准确率、缺失值处理正确率、升级率、p50/p95与每确认记录成本，再确定默认模型。确认前统一为草稿；确认按钮才触发入库。

待与伙伴讨论：服务地区/主要语言、免费额度、真实月量、附件保留期、第一版是否只支持一份文件一张单据、低清晰度如何引导重拍、是否需要逐字段原文证据。这些决定比先锁定“最新模型”更直接影响最终成本和体验。
