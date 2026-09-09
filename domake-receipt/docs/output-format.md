# Domake Receipt：固定输出格式 v1

更新时间：2026-09-09。与原型 `core.js`、`samples.js` 和导出保持一致。机器可读权威格式见 [receipt.schema.json](receipt.schema.json)。研究报告中的扩展结构是未来候选，不是另一个 v1。

## 核心信息

| 表单内容 | JSON 路径 | 规则 |
|---|---|---|
| 归属房屋 | `property.id` | 本轮是用户填写的房屋名称/标识；生产必须改为用户有权访问的真实物业 UUID，不由模型猜测 |
| 服务日期 | `service.date` | 实际服务日期，YYYY-MM-DD；未知为 null，不用开票日期替代 |
| 服务内容 | `service.summary` | 一句话描述做了什么或计划做什么；确认保存前用户必须填写 |
| 房屋系统与部位 | `service.category`, `service.location` | HVAC / 管道 / 屋顶等与具体房间；分类 unknown，部位 null |
| 服务商 | `provider.name` | 原文商家/服务商名称，不从经验编造 |
| 服务地址 | `property.service_address` | 施工地址；和 `provider.address` 商家地址分开 |
| 总金额与币种 | `amount.total`, `amount.currency` | 数值或 null；币种为原文可确认的 ISO 三字母码，不默认 USD |
| 单据类型 | `document.type` | receipt / invoice / estimate / warranty / other / unknown |
| 付款、施工状态 | `amount.payment_status`, `service.completion_status` | 互相独立；付款不代表完工，报价不代表支出 |

扩展区：`document.issue_date` 开票日期、`document.number` 单号、`provider.phone/address`、`items[]` 描述与金额、`details.asset_model/asset_serial/warranty/permit_number`、`notes`。资料有就填，没有保持空。

## 缺失、零与错误

- 缺失标量为 JSON `null`，UI 显示空白或「未知」；不写空字符串、N/A 或 0。原文明确零金额可以存 `0`。枚举没有信息时使用 `unknown`。
- 空明细是 `[]`，不是金额为零的证明。模型提取失败是任务错误，不能返回一条空记录冒充成功。
- 本轮 UI 不识别缺失原因，只统一标未知。下一轮增加 `not_present / unreadable / ambiguous / not_applicable` 字段元数据。
- 日期仅保存本地日历日期，不转换时区；只知道月份、日期歧义或服务日期区间无法表达时先留 null、原文保留在 notes/evidence。日期区间字段是下一轮扩展。
- 币种、金额都可缺失。`$` 不能单独证明 USD；用户需核对。原型只支持非负单据总额，退款/负数请保留原件与备注，专门退款格式下一轮加。
- 原型 JSON 金额为 number；伙伴写数据库时转换为 DECIMAL 或按币种精度处理的定点金额，避免浮点累加。原型不汇总不同币种，不累计报价，也不做预算/税务判断。
- 已确认记录允许信息不完整，`review.missing_fields` 保留待补全项。必须有用户确认的归属房屋和服务摘要。

## 应用负责与模型负责

模型以后只输出文档可见事实及证据，不得创建物业 ID、确认状态、保存日期或「房产增值」推断。应用补充 `schema_version`、`id`、`source`、`review` 与时间戳。

`source.mode` 本轮只有 `demo` 和 `manual`。真实 AI 下一轮接入时需升级此枚举并增加 model/prompt 版本元数据，不能伪装 manual 为 AI。`source.sha256` 用于当前浏览器同一文件去重，不能证明单据真实或施工发生。

`review.status` 为 draft / confirmed。`evidence[]` 保存字段路径、页码和原文；本轮只有合成示例有证据。`review.edited_fields` 标出被修改的字段路径，不是完整审计日志。生产另存原始模型结果及版本化的人审修订，不覆盖原始证据。

本轮一份文件按一个逻辑文档、一个房屋活动整理。多张发票合在一个 PDF 请先拆分；同一发票多个服务可以先写一个总摘要。生产模型应识别多单据并转入拆分，不静默忽略页面。之后可将多个活动关联到一个 document_id，文档金额只存一次。

## 三个可下载实例

- [完整收据](../samples/plumbing.json)：服务日期和开票日期不同，已付款。
- [缺失日期/地址的发票](../samples/hvac.json)：没有信息保持 null，付款/完工状态不猜测。
- [屋顶报价](../samples/roof.json)：planned，付款 unknown，报价总额不等于实际支出。

示例中的姓名、地址、金额全部虚构。样本输出是待确认草稿，不代表模型评测结果。
