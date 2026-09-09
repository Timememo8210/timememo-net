[English](project-history.en.md) · [中文](project-history.md)

# Domic Home Passport 历史恢复

核对日期：2026-09-09。只读检查 Sky Portal 本地 Git checkout、公开页面和既有测试成果；未修改旧站点，未复制凭证。

## 核心结论

当前统一名称由用户确认为 **Domic Home Passport**。这是既有房屋护照项目的票据整理模块。以下历史材料和 Git 提交中的 Domic / Home Passport 名称按原始记录保留。

合作方明确为 **Daniel Zhu（瑜杰）**。产品不是通用报销 OCR：原定位是持续积累某一房产的维修、升级、设备和保修历史，最终用于维护与出售/出租交接。ProLynk 是服务撮合端；Domic 是业主房产档案端。

## 已确认的历史事实

### 2026-05-07：ProLynk × Domic 战略

Sky Portal 的 ProLynk 页面记录：

- Domic 是“数字化房产护照”。结构化档案来源包括 ProLynk 自动导入和业主手动上传。
- 需要区分设备型号、安装日期、维保周期；解析纸质单据和设备铭牌，提取品牌和保修信息。
- 房屋健康分、维护路线图和升级推荐是远期构想；可生成用于出售/出租的房屋履历报告。
- 当时拟定技术栈为 Next.js 前端、Supabase 数据库、Cloudflare R2 原件及图片存储。文档 Hash 用于文件完整性校验；这不是独立证明施工真实性的手段。
- 商业构想为 Domic 免费或 Freemium，配合 ProLynk 服务撮合。

### 2026-05-20：Domic 最小上线范围

旧记录计划“最迟 7 月初出可用版本”，但这里只能确认计划，不能确认实际已上线。核心三功能：

1. 接收 ProLynk 自动传输的文件，形成按时间纵向滚动的维护时间线。
2. 接收转发邮件及手动上传的 PDF 收据。
3. AI 识别内容并归档；先内部测试，再迭代。

2026-06-03 笔记还提出 Domic / ProLynk 统一账号、ProLynk 快捷登录及 Google 登录。市场顺序当时为 2026 爱尔兰，之后英国，再考虑美国。因此新 schema 不宜默认 USD；应保留明确货币，支持爱尔兰 Eircode、英国和美国地址。

### 2026-06-15：模型及集成方向

旧会议摘要选 Gemini 2.5 Flash 进行图片识别，Whisper 处理语音。另有 ProLynk API / MCP、开发与生产环境分离等方向。以上是旧计划，不是本轮验证过的现行生产配置。

### 2026-06-22：真实模型调用留下测试记录

Daniel Codex 工作台、Live Lab 和 JSON 结果均存在：

- 模型：`gemini-2.5-flash`。
- 13 份公开 PDF 样本最后均生成可读结果；12 份直接读 PDF，1 份 Highland Roofing 因 repeated 503 high demand 改用 `pdftotext` 文本层加 Gemini 抽取。
- 分类与预期相符 12/13。S12 保温样本应为 Insulation，被识别为 Renovation。
- 只有 S01、S12、S13 三份含较完整填充值；多数为 blank invoice template。不能把 13/13 可读结果解释为 100% 真实票据准确率。
- 老测试将多个空白金额输出为 0，空白模板有时生成“房产价值说明”；此行为应在本轮移除，缺失值用 null，空白模板不应成为已完成施工历史。
- S12 的 subtotal 为 3800、total 为 2500，notes 说明存在优惠。说明不能简单要求 subtotal + tax = total 而忽略折扣。

## 现存实现与缺口

### `projects/home-passport-receipts.html`

这是一个独立静态 HTML 原型，包含上传、确认编辑、再次预览提交、成功提示、历史记录和删除。

- 单文件上传；`accept="image/*,.pdf"`，并带移动相机 `capture="environment"`。
- 浏览器将文件转为 base64，直接调用 Gemini 2.5 Flash；提取 JSON 后由用户编辑。
- 确认保存实际只写浏览器 `localStorage` 的 `hp_receipts`。**并未写入 Domic / Home Passport 后端或共享数据库**，虽然旧 UI 文案写“收据已保存到 Home Passport”。
- 没有文件原件保留、房产关联 ID、真正上传进度、取消、超时/重试状态、格式和大小验证、重复检测、云端持久化、权限及合作伙伴 API 对接。
- 旧版采用浏览器直接调用模型。正式集成应迁移到服务端，统一管理鉴权、配额与数据处理。
- 原有日期是单个 `date`，没有服务日期/开票日期区分；地址仅在 `vendor.address`，没有独立物业服务地址。
- `normalizeData` 会把缺失金额变为 0、缺失币种变为 USD，并把未知文档默认为 receipt。
- 返回编辑会清空客户备注；手工清空字段的语义不完整；金额明细格式化后再 parseFloat 的逻辑有问题。重构不宜直接延续旧状态管理。

旧最小提取字段：`date`；`vendor {name, phone, address}`；`total`；`category`；`items [{description, amount}]`；`confidence`；`currency`；`documentType`；`subtotal`；`tax`；`paymentMethod`。用户备注与 `savedAt` 在提交时添加。

### 6 月测试已试过更适合房产的扩展字段

单条原始结果的 `extracted` 有：

- `property {address, unit, city, region, postalCode, country}`
- `vendor {name, address, phone, email, licenseNumber}`
- `service {projectName, workType, areaOfHome, workPerformed, materials[], laborSummary, warranty, permitNumber, followUpRecommendation, resaleValueNote, valueSignal}`
- `items [{description, quantity, unitPrice, total, kind}]`
- `documentType, date, subtotal, tax, total, currency, category, notes, confidenceScore`

`resaleValueNote` 和 `followUpRecommendation` 在旧结果里混合了模型推断，不宜放在“票据事实”层。保修、设备、区域、工作内容、物业地址这些字段确有领域价值，可做可选扩展，并且缺失时为空。

## 旧界面风格

- Git 提交 `46712b70cf26ee79e0bbc98dd71e65a87a7b1c4c`（2026-06-20）明确写着 “Redesign receipt scanner to match Domic design system”。
- 旧扫描页 CSS：Inter 字体；亮蓝主按钮 `#007BFF`；浅灰蓝背景 `#F8FAFC`；白色圆角卡片，12px 左右圆角；深灰文字 `#1E293B`；轻边线与阴影；512px 手机宽度优先；底部抽屉详情。
- 已目视查看旧 `prolynk-screenshots/01-ho-dashboard.png`：一致的亮蓝导航/主按钮、浅灰背景、白卡片、柔绿服务图标、宽松留白。
- 独立 Domic 网站当前界面尚未找到，不能把 ProLynk 截图说成 Domic 实际线上截图。

## 来源与可分享链接

1. 原型：[Receipt Scanner / Home Passport](https://timememo8210.github.io/sky-portal/projects/home-passport-receipts.html)
2. 项目与合作历史：[ProLynk 项目记录](https://timememo8210.github.io/sky-portal/prolynk.html)
3. 旧三步示意：[HP Demo Flow](https://timememo8210.github.io/sky-portal/projects/hp-demo-flow.html)
4. 已用网络请求确认 HTTP 200：[Daniel Codex 工作台](https://timememo8210.github.io/sky-portal/projects/danielproject__codex.html)
5. 可读测试表：[Gemini Live Lab](https://timememo8210.github.io/sky-portal/projects/danielproject__codex_live.html)
6. 完整测试数据：[2026-06-22 JSON](https://timememo8210.github.io/sky-portal/projects/danielproject__codex_assets/2026-06-22/gemini_live_results.json)
7. 既有市场报告（旧报告，不视为今天核实的市场结论）：[ProLynk 竞品分析](https://timememo8210.github.io/sky-portal/research/prolynk-market-analysis.html)
8. 公开仓库：[Timememo8210/sky-portal](https://github.com/Timememo8210/sky-portal)
9. 工程站旧链接：[lynksync.ie](https://lynksync.ie)；当前网络请求返回 HTTP 403，未能核实线上内容。会议中还出现 `lynkthink.ie`，未确认它与前述域名的区别，不能擅自归为同一站。


已核对 Git 提交：

- `6871259`，2026-05-03：增加 Receipt Scanner。
- `da4eea3`，2026-05-03：三步确认流程。
- `8ab0c9f`，2026-05-12：ProLynk × Domic 战略与 Daniel 会议记录。
- `7318b27`，2026-06-16：增加 5/12—6/15 会议摘要。
- `46712b7`，2026-06-20：对齐 Domic 设计体系。
- `361dbfb`，2026-06-22：增加 Daniel OCR 工作台与测试成果。

## 尚未找到 / 尚未验证

- 独立 Domic Home Passport 正式域名及当前产品界面。
- Daniel 当前可用的后端 API 契约、数据库表、统一账号实现和生产部署。
- 6 月工作台提及的完整 Next.js 原项目源码及 `.env.local`；不能把静态展示页当作完整产品仓库。
- 可访问公开 GitHub 用户仓库列表只匹配到 sky-portal，没有独立 receipt/domake/domic/prolynk 名称的公开仓库；这不证明不存在私有仓库。
- 最近 50 个 Codex / ChatGPT 任务摘要没有历史相关任务（当前重构任务除外）；不宣称已穷尽所有归档。

建议与 Daniel 下一轮讨论：确认生产域名；现有登录/物业模型和记录写入接口；一期以单文件多页票据还是批量票据为准；默认市场与币种；是否需要服务日期必填；实际月量和延迟预算。即使这些尚待确认，本轮原型仍可先用固定导出 schema 和明确本地演示存储完成上传→抽取→核对→保存→查阅闭环。
