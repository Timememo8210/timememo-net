# 本地 OCR 测试：实际识别出了什么

2026 年 9 月 9 日，我们用本机 Node 版本的 Tesseract.js，对三张虚构票据图片做了测试。引擎与英语数据和原型采用的版本一致，识别后的原始文字及 confidence 直接交给项目中的解析器。**这次只测试了引擎与解析，没有测试浏览器上传、没有截取浏览器画面，也没有测试真实手机拍照流程。**

| 测试图片 | 实际结构化结果 | 审核状态 |
|---|---|---|
| 清晰英国票据 | 公司：Cedar Home Services；技师：James Turner；服务日期：2026-09-01；开票日期：2026-09-02；金额：GBP 240.00。 | 可以进入人工核对。水暖分类仍为未知，可选的保修及费用明细没有提取。 |
| 倾斜的英国票据图片 | 识别出单据编号 `CHS-UK-260901-09` 和收据类型；公司、技师、日期、服务摘要、地址与金额均保留未知。 | 部分识别，需要人工补充或换更清晰的图片。 |
| 模糊的 AED 票据图片 | 识别出收据类型；公司、技师、日期、地址与金额均保留未知。解析器修复后拒绝了带明显 OCR 乱码的服务摘要。 | 部分识别；服务摘要、房屋系统分类与变更类型也保留未知。 |

倾斜图片的原始 OCR 出现了日期与邮编误读，解析器没有把这些错误文字当作已确认事实填入字段。模糊图片起初把 `Replace kitchen faucet <==... SS` 填入服务摘要。小幅修复后，解析器拒绝整个受污染字段，同时保留原始文字供核对，不猜测清洗后的内容。

我们使用已保存的同一份 OCR 文字和 confidence 复核修复，没有重新运行 OCR。清晰票据的重要字段保持不变，倾斜票据仍保留相同未知值；模糊票据的服务摘要改为 `null`，分类与变更类型改为 `unknown`。原始 OCR 与修复前的输出均已保留。

最初三次 Node 引擎及解析合计耗时约为 0.48、0.79、0.52 秒。这是这台 Mac 的本地测量，不包含浏览器上传、手机性能、网络传输、人工核对或保存，也不是产品速度承诺。三张虚构样本不足以代表真实票据的整体准确率。


## 证据文件

- [run-configuration.json](run-configuration.json)
- [results-summary.json](results-summary.json)
- [recheck-results.json](recheck-results.json)
- 10-clear-uk-receipt: [OCR](10-clear-uk-receipt.ocr.txt) · [Before](10-clear-uk-receipt.parsed.json) · [After](10-clear-uk-receipt.rechecked.parsed.json)
- 09-handheld-uk: [OCR](09-handheld-uk.ocr.txt) · [Before](09-handheld-uk.parsed.json) · [After](09-handheld-uk.rechecked.parsed.json)
- 08-handheld-partial: [OCR](08-handheld-partial.ocr.txt) · [Before](08-handheld-partial.parsed.json) · [After](08-handheld-partial.rechecked.parsed.json)
