import { toEnglish } from "./i18n.js";
export const SCHEMA_VERSION = "1.0";
export const categories = {
  plumbing: "水暖 / Plumbing",
  electrical: "电气 / Electrical",
  hvac: "空调暖通 / HVAC",
  roofing: "屋顶 / Roofing",
  landscaping: "园艺 / Landscaping",
  appliance: "家电 / Appliance",
  renovation: "翻修 / Renovation",
  cleaning: "清洁 / Cleaning",
  general: "一般维护",
  other: "其他",
  unknown: "未知",
};
export const types = {
  receipt: "收据",
  invoice: "账单 / 发票",
  estimate: "报价单",
  warranty: "保修文件",
  other: "其他",
  unknown: "未知",
};
export const payments = {
  paid: "已付款",
  unpaid: "未付款",
  partial: "部分付款",
  unknown: "未知",
};
export const completions = {
  completed: "已完成",
  planned: "计划中",
  unknown: "未知",
};
export const nullable = (s) =>
  s === null || s === undefined || String(s).trim() === ""
    ? null
    : String(s).trim();
export function blankRecord() {
  return {
    schema_version: SCHEMA_VERSION,
    property: { id: null, service_address: null },
    document: { type: "unknown", number: null, issue_date: null },
    service: {
      date: null,
      category: "unknown",
      summary: null,
      location: null,
      completion_status: "unknown",
    },
    provider: { name: null, phone: null, address: null },
    amount: { total: null, currency: null, payment_status: "unknown" },
    items: [],
    details: {
      asset_model: null,
      asset_serial: null,
      warranty: null,
      permit_number: null,
    },
    notes: null,
    source: { name: null, mime_type: null, sha256: null, mode: "manual" },
    evidence: [],
    review: {
      status: "draft",
      missing_fields: [],
      warnings: [],
      edited_fields: [],
    },
  };
}
export const get = (o, p) => p.split(".").reduce((a, k) => a?.[k], o);
export function set(o, p, v) {
  const keys = p.split("."),
    last = keys.pop();
  let x = o;
  keys.forEach((k) => (x = x[k]));
  x[last] = v;
}
export function validDate(s) {
  if (s === null || s === "") return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !isNaN(d) && d.toISOString().slice(0, 10) === s;
}
export function inspect(r, { confirm = false } = {}) {
  const errors = [],
    warnings = [],
    missing = [];
  for (const p of [
    "service.date",
    "service.summary",
    "provider.name",
    "property.service_address",
    "amount.total",
    "amount.currency",
  ])
    if (get(r, p) === null || get(r, p) === "") missing.push(p);
  for (const p of ["service.date", "document.issue_date"])
    if (!validDate(get(r, p))) errors.push("日期格式或日期无效。");
  if (
    r.amount.total !== null &&
    (!Number.isFinite(r.amount.total) || r.amount.total < 0)
  )
    errors.push("总金额必须是有效的非负数；未知请留空。");
  if (r.amount.currency !== null && !/^[A-Z]{3}$/.test(r.amount.currency))
    errors.push("币种请用三个大写字母，例如 USD、CNY、EUR。");
  for (const [key, values] of [
    ["service.category", categories],
    ["document.type", types],
    ["amount.payment_status", payments],
    ["service.completion_status", completions],
  ])
    if (!(get(r, key) in values)) errors.push("存在不支持的分类值。");
  if (
    r.items.some(
      (i) => i.amount !== null && (!Number.isFinite(i.amount) || i.amount < 0),
    )
  )
    errors.push("明细金额必须是非负数；未知请留空。");
  if (r.document.type === "estimate") {
    warnings.push("报价不代表实际支出或施工完成。");
    if (r.service.completion_status === "completed")
      errors.push("报价单不能作为已完工凭证，请修改状态或单据类型。");
    if (r.amount.payment_status !== "unknown")
      errors.push("报价单不能证明付款状态，请保留未知。");
  }
  if (!r.service.date)
    warnings.push("服务日期未知；不会用开票日期或上传日期代替。");
  if (!r.amount.currency && r.amount.total !== null)
    warnings.push("币种未知，金额不会默认视为美元。");
  if (!r.property.service_address)
    warnings.push("未提供服务地址；归属房屋由你确认。");
  if (confirm && !r.property.id)
    errors.push("请填写归属房屋，例如「Oak Street 自住房」。");
  if (confirm && !r.service.summary) errors.push("请填写服务项目摘要。");
  return { errors: [...new Set(errors)], warnings, missing };
}
export function money(value, currency) {
  if (value === null || value === undefined) return "金额未知";
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${amount}` : `${amount} · 币种未知`;
}
export function validateFile(file) {
  const formats = {
    "application/pdf": "PDF",
    "image/jpeg": "JPG",
    "image/png": "PNG",
    "image/webp": "WebP",
  };
  if (!formats[file.type])
    return "不支持此文件格式。请转为 PDF、JPG、PNG 或 WebP；HEIC 请先转换。";
  if (file.size === 0) return "文件为空，请重新选择。";
  if (file.size > 15 * 1024 * 1024)
    return "文件超过 15 MB，请压缩或拆分后重试。";
  return null;
}
export async function fileHash(file) {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let valid = false;
  if (file.type === "application/pdf")
    valid = new TextDecoder().decode(bytes.slice(0, 1024)).includes("%PDF-");
  else if (file.type === "image/jpeg")
    valid = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  else if (file.type === "image/png")
    valid = [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n);
  else if (file.type === "image/webp")
    valid =
      new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
      new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  if (!valid) throw Error("文件内容与格式不符或文件已损坏，请重新导出。");
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(hash)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export function possibleDuplicate(a, b) {
  return a.source?.sha256 && a.source.sha256 === b.source?.sha256;
}
export function transition(r, status) {
  const c = structuredClone(r),
    check = inspect(c, { confirm: status === "confirmed" });
  if (check.errors.length) throw Error(check.errors.join(" "));
  c.review = {
    ...c.review,
    status,
    missing_fields: check.missing,
    warnings: check.warnings.map(toEnglish),
  };
  return c;
}

// Canonicalize application-generated warnings without translating authored data.
export function exportRecordData(data) {
  const result = structuredClone(data);
  const records = Array.isArray(result.records) ? result.records : [result];
  for (const record of records)
    if (Array.isArray(record.review?.warnings))
      record.review.warnings = record.review.warnings.map(toEnglish);
  return result;
}
