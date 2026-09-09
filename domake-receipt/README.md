# Domake Receipt / Domic Home Passport

第一轮可操作原型与伙伴交接，2026-09-09。

- 原型：https://timememo.net/domake-receipt/
- 项目说明：https://timememo.net/domake-receipt/project/
- 数据契约：[docs/receipt.schema.json](docs/receipt.schema.json)
- 交接：[docs/implementation-plan.md](docs/implementation-plan.md)

用户已选择本轮不接真实识别。真实文件只在浏览器预览与人工填写；识别演示使用3份虚构单据。确认后的记录和原件存 IndexedDB，仅在此浏览器可用。没有云端数据库、用户登录、模型密钥或后台调用。

## 本地使用

要求 Node.js 22+（开发验证）与任意静态 Web 服务器。

```sh
npm ci
npm test
npm run build
python3 -m http.server 8080
```

打开 `http://localhost:8080/`。需通过 localhost / HTTPS 访问，不能直接 file:// 双击模块脚本。运行网页不需要 node_modules。测试依赖仅用于开发；没有外部运行时脚本。字体失败会使用系统字体。

## 快速验收

1. 点「厨房水管维修」示例，检查服务日期和开票日期分开。
2. 修改金额，检查并勾选确认，保存到房屋记录。
3. 刷新后查看、修改、导出 JSON，再删除；原件是明确标记的虚构页面示例。
4. 选择自己的图片/PDF，看到原件和空表单，不能出现虚构自动识别结果。
5. 填房屋和服务摘要，其他空白留 null；草稿允许未填核心项。
6. 再次选择相同实际文件，打开已有记录；超限、不支持、空文件拒绝。
7. 「空调年度保养」服务日期、地址缺失；「屋顶报价」不能标已完工或已付款。

自动化验证是非浏览器 DOM/业务/存储测试；没有做截图、真实手机相机或真实模型精度/速度测试。更多限制和下一轮方案见项目说明。

## 源码与共享

这是现有 `Timememo8210/timememo-net` 的独立子目录，可单独复制到新仓库，不依赖该站其他页面。源码包不含 node_modules、凭证或用户上传文件。公开仓库可查看/下载；协同写代码须仓库所有者添加协作者，不能把只读可见当成编辑授权。

第三方研究资源记录在 docs/reference-research.md，本轮未复制这些仓库的实现；测试依赖许可随各 npm 包保留。正式 AI 接入前按 docs/extraction-prompt.md 与当前官方 SDK/API 文档重新核对并实测。
