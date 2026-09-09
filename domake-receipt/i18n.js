export const locale =
  typeof document !== "undefined" &&
  document.documentElement.lang.startsWith("zh")
    ? "zh"
    : "en";
const translations = {
  归属房屋: "Property",
  "例如：Oak Street 自住房": "e.g. Oak Street home",
  服务项目: "Work summary",
  "做了什么维修、保养或更换？": "What was repaired, maintained or replaced?",
  实际服务日期: "Service date",
  服务商: "Service provider",
  未提供: "Not provided",
  服务地址: "Service address",
  "施工或服务发生的地址，非商家地址":
    "Where the work took place, not the provider's address",
  房屋系统: "Home system",
  具体部位: "Area of the home",
  "例如：厨房、二楼浴室": "e.g. kitchen, upstairs bathroom",
  单据总金额: "Document total",
  未知请留空: "Leave blank if unknown",
  币种: "Currency",
  "例如 USD、CNY": "e.g. USD, AED, SAR",
  单据类型: "Document type",
  付款状态: "Payment status",
  "施工 / 服务状态": "Work status",
  开票日期: "Issue date",
  单据编号: "Document number",
  服务商电话: "Provider phone",
  商家地址: "Provider address",
  "设备品牌 / 型号": "Equipment brand / model",
  设备序列号: "Serial number",
  保修说明: "Warranty terms",
  许可编号: "Permit number",
  我的备注: "My notes",
  "未知留空；不会自动替换为开票日期。":
    "Leave blank if unknown. The issue date is kept separately.",
  "由你确认归属，示例名称可直接改成自己的房屋。":
    "Confirm which property this belongs to. You can edit the sample name.",
  "已确认 · 可编辑": "Confirmed · editable",
  待核对: "Needs review",
  "费用明细（可选，金额按原单据填写）":
    "Line items (optional; use amounts shown on the document)",
  "＋ 添加明细": "＋ Add line item",
  查看字段原文证据: "View source evidence",
  " · 第 ": " · page ",
  " 页": "",
  "手动录入不包含 AI 原文证据。":
    "Manually entered records have no AI source evidence.",
  "示例演示：以下信息来自预设的虚构单据，未调用 AI。请体验修改与确认。":
    "Sample demonstration: these details are preset for a fictional document. No AI was called. Try editing and confirming them.",
  "当前未接入 AI：此文件没有自动识别结果。请根据左侧原件填写，空白项保持未知。":
    "AI extraction is not connected yet. Fill in the details from the original document. Leave anything unknown blank.",
  "删除明细 ": "Remove line item ",
  "明细 ": "Line item ",
  " 描述": " description",
  " 金额": " amount",
  项目说明: "Description",
  " 项核心信息未提供，将保留为未知。":
    " core fields are missing and will remain unknown.",
  "核心信息已填写。": "Core information is complete.",
  "虚构示例记录 · 保存后仍会保留示例标识。":
    "Fictional sample record. It will remain labelled as a sample after saving.",
  虚构示例: "Fictional sample",
  本地文件: "Local file",
  "PDF 原件预览": "Original PDF preview",
  "无法预览？打开原始 PDF ↗": "Cannot preview? Open the original PDF ↗",
  上传的票据原件: "Original uploaded document",
  "图片无法解码，请更换文件。当前可手动填写。":
    "This image cannot be opened. Try another file, or fill in the details manually.",
  "此记录没有可用原件。可以继续查看或修改字段。":
    "The original file is unavailable. You can still view and edit the record.",
  等待添加: "No document yet",
  尚未识别: "Not extracted",
  "更换会清除尚未保存的修改。已保存的记录仍会保留。继续？":
    "Discard unsaved changes? Previously saved records will remain available.",
  "正在保存或检查文件，请稍候。": "Saving or checking a file. Please wait.",
  示例流程演示: "Sample demonstration",
  "示例字段已整理，请核对后确认。":
    "The sample is ready. Review the details before confirming.",
  "已取消示例流程，可以重新选择。":
    "Sample demonstration canceled. You can choose another document.",
  检查文件中: "Checking file",
  "本地存储暂不可用，可继续填写并导出备份。":
    "Browser storage is unavailable. You can still fill in the form and export a backup.",
  "这份文件已存在，已打开原记录，避免重复保存。":
    "This file already exists. Its saved record has been opened to avoid a duplicate.",
  "文件已在本地打开。真实 AI 尚未连接，请手动填写。":
    "The file is open locally. AI extraction is not connected; please enter the details manually.",
  "文件读取失败，请重试。": "The file could not be read. Please try again.",
  "每次请添加一份单据；同一份多页 PDF 可以整体添加。":
    "Add one document at a time. A multipage PDF for the same document is supported.",
  服务日期: "Service date",
  总金额: "Total",
  施工状态: "Work status",
  "未知 / 未提供": "Unknown / not provided",
  "已确认并保存在当前浏览器。可查看、修改或导出。":
    "Confirmed and saved in this browser. You can view, edit or export the record.",
  "草稿已保存在当前浏览器，可稍后继续。":
    "Draft saved in this browser. You can continue later.",
  "保存失败，请重试。": "Save failed. Please try again.",
  导出当前草稿备份: "Export this draft as a backup",
  "请先勾选确认，或返回修改。":
    "Confirm that you have reviewed the details, or go back to edit.",
  服务日期未知: "Service date unknown",
  "开票 ": "Issued ",
  已确认: "Confirmed",
  草稿: "Draft",
  待填写服务项目: "Work summary needed",
  尚未选择房屋: "Property not selected",
  服务商未知: "Provider unknown",
  "有 ": " ",
  " 项核心信息待补全": " core fields need attention",
  核心信息完整: "Core information complete",
  预估费用: "Estimated cost",
  "查看 / 修改": "View / edit",
  "导出 JSON": "Export JSON",
  原始单据: "Original document",
  删除: "Delete",
  "房屋的下一段历史，从第一张票据开始。":
    "Your home's next chapter starts with a document.",
  "你确认的记录和未完成草稿会显示在这里。":
    "Confirmed records and unfinished drafts will appear here.",
  添加第一份单据: "Add your first document",
  "无法读取此记录，请刷新后重试。":
    "This record could not be opened. Refresh and try again.",
  "原始单据为虚构的页面示例。":
    "The original document is a fictional on-screen sample.",
  "原始文件不可用。结构化记录仍可导出。":
    "The original file is unavailable. You can still export the structured record.",
  "记录和对应原件已从此浏览器删除。":
    "The record and its original file have been deleted from this browser.",
  "水暖 / Plumbing": "Plumbing",
  "电气 / Electrical": "Electrical",
  "空调暖通 / HVAC": "HVAC",
  "屋顶 / Roofing": "Roofing",
  "园艺 / Landscaping": "Landscaping",
  "家电 / Appliance": "Appliance",
  "翻修 / Renovation": "Renovation",
  "清洁 / Cleaning": "Cleaning",
  一般维护: "General maintenance",
  其他: "Other",
  未知: "Unknown",
  收据: "Receipt",
  "账单 / 发票": "Invoice",
  报价单: "Estimate",
  保修文件: "Warranty document",
  已付款: "Paid",
  未付款: "Unpaid",
  部分付款: "Partially paid",
  已完成: "Completed",
  计划中: "Planned",
  "日期格式或日期无效。": "Enter a valid calendar date.",
  "总金额必须是有效的非负数；未知请留空。":
    "The total must be a valid non-negative number. Leave it blank if unknown.",
  "币种请用三个大写字母，例如 USD、CNY、EUR。":
    "Use a three-letter uppercase currency code, such as USD, AED or SAR.",
  "存在不支持的分类值。": "One of the selected categories is unsupported.",
  "明细金额必须是非负数；未知请留空。":
    "Line-item amounts must be non-negative. Leave unknown amounts blank.",
  "报价不代表实际支出或施工完成。":
    "An estimate is not proof of payment or completed work.",
  "报价单不能作为已完工凭证，请修改状态或单据类型。":
    "An estimate cannot prove completed work. Review the work status or document type.",
  "报价单不能证明付款状态，请保留未知。":
    "An estimate cannot prove payment. Keep payment status unknown.",
  "服务日期未知；不会用开票日期或上传日期代替。":
    "The service date is unknown. It will not be replaced with the issue or upload date.",
  "币种未知，金额不会默认视为美元。":
    "Currency is unknown. The amount will not default to US dollars.",
  "未提供服务地址；归属房屋由你确认。":
    "No service address was provided. Confirm which property this belongs to.",
  "请填写归属房屋，例如「Oak Street 自住房」。":
    "Enter the property, for example “Oak Street home”.",
  "请填写服务项目摘要。": "Enter a brief description of the work.",
  金额未知: "Amount unknown",
  " · 币种未知": " · currency unknown",
  "不支持此文件格式。请转为 PDF、JPG、PNG 或 WebP；HEIC 请先转换。":
    "Unsupported format. Use PDF, JPG, PNG or WebP. Convert HEIC files first.",
  "文件为空，请重新选择。": "The file is empty. Choose another file.",
  "文件超过 15 MB，请压缩或拆分后重试。":
    "The file exceeds 15 MB. Compress or split it and try again.",
  "文件内容与格式不符或文件已损坏，请重新导出。":
    "The file content does not match its format, or it is damaged. Export it again.",
  "浏览器存储不可用。请允许本地存储，或先导出 JSON 备份。":
    "Browser storage is unavailable. Enable local storage, or export a JSON backup.",
  "请关闭其他原型标签页后重试。": "Close other prototype tabs and try again.",
  "保存失败，浏览器空间可能不足。内容仍在表单中，请导出 JSON 备份后重试。":
    "Save failed. Browser storage may be full. Your edits remain in the form; export a JSON backup and try again.",
  "删除失败，请重试。": "Delete failed. Please try again.",
};
const entries = Object.entries(translations).sort(
  (a, b) => b[0].length - a[0].length,
);
// Translate UI copy only. Template interpolations (user data) are never translated.
export function toEnglish(value) {
  if (typeof value !== "string") return value;
  let result = value;
  for (const [source, target] of entries)
    result = result.split(source).join(target);
  return result;
}
export function t(value) {
  return locale === "zh" ? value : toEnglish(value);
}
export function html(strings, ...values) {
  return strings
    .map((literal, i) => t(literal) + (i < values.length ? values[i] : ""))
    .join("");
}
