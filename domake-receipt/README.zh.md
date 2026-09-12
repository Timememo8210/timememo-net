Current cloud workspace: https://timememo.net/domake-receipt/cloud/ . The cloud management console stores originals and property histories on the server. This README below describes the earlier browser-only pilot. The new server implementation is downloadable at docs/cloud-ai-service-source.zip, including its API contract and database schema.

[English](README.md) · [中文](README.zh.md)

# Domic Home Passport

第一轮可操作原型与伙伴交接，2026-09-09。正式名称 Domic Home Passport；网页默认英文，可切换中文。

- 原型：https://timememo.net/domake-receipt/
- 项目说明：https://timememo.net/domake-receipt/project/
- 数据契约：[docs/receipt.schema.json](docs/receipt.schema.json)
- 交接：[docs/implementation-plan.md](docs/implementation-plan.md)

当前公开版本使用实验性浏览器英文图片 OCR、保守字段整理、失败恢复与真实图片测试入口。PDF 已支持云端 AI 识别，也可以预览及手工填写；3 份预设示例保留明确演示标识。确认后的记录和原件存 IndexedDB，仅在此浏览器可用，没有共享云端数据库或客户登录。

**2026-09-12 更新：** 已通过 OpenRouter 接通真实云端 AI，默认 `google/gemini-3.1-flash-lite`。API Key 仅在服务端保存，网页使用独立试用访问码。图片和 PDF 进入统一的人工核对与确认流程。前端 85 项、接口 12 项受控检查通过；真实模型对比及云端请求见[本轮 AI 报告](ai-pilot/zh.html)。此前截图报告仍对应旧 OCR／手工流程。记录和原件仍只存当前浏览器，尚无共享客户云数据库。

## 本地使用

要求 Node.js 22+（开发验证）与任意静态 Web 服务器。

```sh
npm ci
npm test
npm run build
python3 -m http.server 8080
```

打开 `http://localhost:8080/`。需通过 localhost / HTTPS 访问，不能直接 file:// 双击模块脚本。运行网页不需要 node_modules。Tesseract.js 及英文字库由本站托管，不调用外部 OCR 服务。字体失败会使用系统字体。

## 快速验收

1. 点「厨房水管维修」示例，检查服务日期和开票日期分开。
2. 修改金额，检查并勾选确认，保存到房屋记录。
3. 刷新后查看、修改、导出 JSON，再删除；原件是明确标记的虚构页面示例。
4. 选择英文图片或六张测试图，读取真实 OCR 并核对；PDF 仍显示手工空表单。
5. 填房屋和服务摘要，其他空白留 null；草稿允许未填核心项。
6. 再次选择相同实际文件，打开已有记录；超限、不支持、空文件拒绝。
7. 「空调年度保养」服务日期、地址缺失；「屋顶报价」不能标已完工或已付款。

自动化验证覆盖规则、DOM、存储与受控故障；已做真实浏览器图片实验、截图与手机宽度检查，见实测报告。真实 Gemini 小批量调用已完成；实体手机相机与阿拉伯文准确率尚未测试。

## 源码与共享

这是现有 `Timememo8210/timememo-net` 的独立子目录，可单独复制到新仓库，不依赖该站其他页面。源码包不含 node_modules、凭证或用户上传文件。公开仓库可查看/下载；协同写代码须仓库所有者添加协作者，不能把只读可见当成编辑授权。

第三方研究资源记录在 docs/reference-research.md，本轮未复制这些仓库的实现；测试依赖许可随各 npm 包保留。正式 AI 接入前按 docs/extraction-prompt.md 与当前官方 SDK/API 文档重新核对并实测。

## Pro 与房主

Schema 1.1 分别保存服务公司、实际施工者、房屋变更类型。旧 1.0 记录保持显示名称，不猜测组织或个人身份。见[核对与失败恢复](docs/intake-flow.zh.md)、[字段规则](docs/output-format.md)与[实测报告](docs/test-results.zh.md)。第三方 OCR 运行文件与合成测试图片包含在源码包中。

## 英国受众更新

主要面向英国英文客户；软件默认英文，说明提供中文。下一轮优先验证英国服务单据、£ 金额和英国日期。新样本见[下载与核对指南](walkthrough/zh.html)。旧 AED 样本保留为历史实验，不能视为英国格式已经验收。

## 新样本包与解析复核

八份虚构 PDF／图片及中文 PDF 说明已放在[双语核对页](walkthrough/zh.html)。三张新图片通过 Node OCR 和真实解析器读取，见[实测证据](walkthrough/engine-tests/report.zh.md)。已拒绝模糊图中受符号乱码污染的服务描述，并保留 OCR 原文。35 项自动化检查通过。以上为 9 月 9 日历史记录。9 月 10 日浏览器已恢复，可查看下方新一轮真实截图。

## 9 月 10 日：10 份新票据与管理端

[逐步真实截图及实测报告](round2/zh.html) · [管理控制台](admin/zh.html) · [10 份 PDF/PNG 样本](round2/domic-10-uk-receipts.zip)

Schema 1.2 增加上传身份和明确的房屋 UID。管理端包含总表、用户、房屋历史、原件及修改后重新确认。仅显示此浏览器资料，虚构示例组合单独展示。9 份房屋相关单据经人工核对并保存；餐厅单据未自动录入。另对全部 10 张 PNG 做了独立识别：5 部分识别、4 需人工判断、1 不相关，0 全字段成功。PDF 仍为手工。浏览器 CSV 下载未得到已落盘证据；报告提供从实际 CSV 预览读出的总表，180 个单元格全部匹配。

额外 11 项关联／存储检查可用 `node scripts/verify-context.mjs` 重跑。PDF 预览和浏览器下载兼容性限制已在报告中注明。
