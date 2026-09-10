# Round 2：十张新图的独立 OCR 基线实测

2026-09-10，读取 `round2-assets/manifest.json` 中全部十张 PNG，逐张启动新的 Tesseract 7.0.0 英文 worker，使用站点相同的本地语言数据与字节一致的 LSTM core，直接调用本轮加载的真实 `extraction.js`。没有向 OCR 或解析器输入标准答案，没有更改网站，没有浏览器上传、手机拍摄或图像预处理。

**10/10 图片实际完成 OCR，0 引擎失败；解析结果为 5 partial、5 uncertain、0 review。当前基线不能通过十图实际识别验收。** 素材是新生成的虚构收据/单据，不是真实商户交易，也不是手机实拍。

- OCR confidence：87–94。逐图 OCR 加解析耗时 230–446 毫秒，十图合计约 3.13 秒；这不是浏览器端用户等待时间。
- 显式调用：`extractText(data.text, data.confidence, { locale: manifest.locale })`；manifest.locale 为 `en-GB`，全部十条记录均保留该值，断言全部通过。
- UK 设置确实被调用，但实际 OCR 标签没有进入能成功提取日期/金额的分支，因此本轮不能证明 UK 日期/金额已经识别成功。
- 解析器在整轮运行期间未变化：SHA-256 `7c71334c18b585582f59d710e7eb719a820344b676c1afde694e8bdcd70d595f`。副本保存在 `extraction.baseline.js`；原始 OCR 和 baseline parsed 不应被后续修复覆盖。

| 图片 | confidence | 基线状态 | 关键观察 |
|---|---:|---|---|
| 01 水管公司和技师 | 93 | partial | OCR读出TOTAL PAID、Toby Wren和ISO日期；多列合并与标签别名使主字段全空。 |
| 02 独立木工 | 91 | uncertain | 仅PAID IN FULL识别为已付；`Work carried out by`在混合列内，worker空。 |
| 03 电工缺项 | 93 | uncertain | 日期/金额/worker正确留空；已有工作内容也未提取，home分类未确认。 |
| 04 屋顶报价 | 93 | partial | 正确识别estimate和planned，付款保持unknown；报价总额与范围未提取。 |
| 05 锅炉保养 | 88 | partial | 仅提取地址街道首行，丢失地区/邮编；Engineer、TOTAL PAID、Date标签未提取。 |
| 06 窗户VAT发票 | 94 | partial | `INVOICE TOTAL (including VAT)`未支持；总额、deposit、balance没有互相误替，但都未提。 |
| 07 粉刷未付款 | 89 | partial | OCR有噪声；仅明确Amount due，无独立Total；当前付款状态仍unknown。 |
| 08 园艺三方姓名 | 94 | uncertain | worker/customer/preparer三列文本已读出但未结构化；金额OCR为`E75 00`。 |
| 09 家电长描述 | 94 | uncertain | 地址与描述均未提取；总额OCR为`£1 80 00`，不能猜回180。 |
| 10 无关餐厅 | 87 | uncertain | 没误判home，但也未明确unrelated：OCR含Restaurant而没有receipt/invoice词。 |

九张家居素材的八个主字段共72项原始标准答案比对：61项有值却未提取，10项正确留空，1项非空但不完整（05地址）。完整非空匹配为0。公司、worker、服务日期、摘要、总额、币种在十张图中全部为空。该比对是覆盖缺口，不能把保守留空计成识别成功，也不能要求为消除缺口而猜值。字段比对、枚举映射及未支持字段都在 `comparison-summary.json` 和各图 `.comparison.json` 中明确记录。

没有出现客户、制单人、服务员或拟派施工人被填为实际worker；没有错误非空服务日期、币种、总额；所有记录仍为draft。这个安全结果伴随几乎完全缺失的识别，不能作为准确率高的证据。报价未被标为已完成或已付款。餐厅明确拒绝检查未通过。

## 最小下一步及不可跨越的边界

1. 可以精确支持完整的 `TOTAL PAID £…`、`INVOICE TOTAL (including VAT) £…`，保持严格数字校验；不接收08的`E75 00`或09的`£1 80 00`。
2. 可扩充明确的 `Attending technician`、`Attending repair technician`、`Engineer`、`Installer`、`Work carried out by`，但需要处理字段在行中/多列布局的事实，不能用全页找姓名替代字段绑定。08尤其不能靠姓名顺序猜worker。
3. 对已绑定的服务地址读取确定的续行；05应包含后续地区和邮编，邮编OCR损坏则保留不确定性；09需要避免只取首行。当前服务摘要续行前缀白名单也无法处理这些无标签段落。
4. 餐厅无`receipt`字样仍应能根据明确餐厅/用餐/食物付款内容判无关，同时避免把餐厅水暖维修误删。
5. 标准答案有需要人工语义判断的项：05的`Date`没有单独区分issue/service日期，不应为满足gt同时填两者；07只有Amount due，不应拿它补total；04报价£1,440只可保留为estimate金额，不能当已付支出。02/09的文字日期也是新增能力，不能通过地区设置自动启用任意日期猜测。
6. 高OCR平均confidence不代表每个字段可靠。图片05的EMBERWICK清楚可见，但OCR完全漏掉品牌首行；03/07/09等也有标题缺失或噪声，纯解析器不能从标准答案补回。

完整配置、每图输入hash、原始文本hash、confidence、计时、OCR JSON、原始证据与基线结构化结果已经保存；`artifact-hashes.json` 提供产物校验。后续可基于同一原始OCR做明确标注的parser-only复测，或另外再跑OCR；两者不得混称。
