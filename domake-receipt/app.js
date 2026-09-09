import { t, html, locale } from "./i18n.js";
import {
  blankRecord,
  exportRecordData,
  categories as rawcategories,
  types as rawtypes,
  payments as rawpayments,
  completions as rawcompletions,
  nullable,
  get,
  set,
  inspect,
  money as rawmoney,
  validateFile,
  fileHash,
  possibleDuplicate,
  transition,
} from "./core.js";
import * as storage from "./storage.js";
import { samples, sampleRecord } from "./samples.js";
const categories = translateOptions(rawcategories);
const types = translateOptions(rawtypes);
const payments = translateOptions(rawpayments);
const completions = translateOptions(rawcompletions);
const money = (...args) => t(rawmoney(...args));
function translateOptions(values) {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, t(value)]),
  );
}
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (x) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        x
      ],
  );
let current = null,
  currentFile = null,
  records = [],
  objectUrl = null,
  timer = null,
  generation = 0,
  deleting = null,
  busy = false,
  baseline = null;
function snapshot(r) {
  return JSON.stringify(r);
}
function isDirty() {
  return current && snapshot(current) !== baseline;
}
const primaryFields = [
  [
    "property.id",
    t("归属房屋"),
    "text",
    t("例如：Oak Street 自住房"),
    "full",
    true,
  ],
  [
    "service.summary",
    t("服务项目"),
    "textarea",
    t("做了什么维修、保养或更换？"),
    "full",
    true,
  ],
  ["service.date", t("实际服务日期"), "date", "", "", false],
  ["provider.name", t("服务商"), "text", t("未提供"), "", ""],
  [
    "property.service_address",
    t("服务地址"),
    "text",
    t("施工或服务发生的地址，非商家地址"),
    "full",
  ],
  ["service.category", t("房屋系统"), "select", categories],
  ["service.location", t("具体部位"), "text", t("例如：厨房、二楼浴室")],
  ["amount.total", t("单据总金额"), "number", t("未知请留空")],
  ["amount.currency", t("币种"), "text", t("例如 USD、CNY")],
  ["document.type", t("单据类型"), "select", types],
  ["amount.payment_status", t("付款状态"), "select", payments],
  ["service.completion_status", t("施工 / 服务状态"), "select", completions],
];
const extras = [
  ["document.issue_date", t("开票日期"), "date"],
  ["document.number", t("单据编号"), "text"],
  ["provider.phone", t("服务商电话"), "text"],
  ["provider.address", t("商家地址"), "text"],
  ["details.asset_model", t("设备品牌 / 型号"), "text"],
  ["details.asset_serial", t("设备序列号"), "text"],
  ["details.warranty", t("保修说明"), "textarea", "", "full"],
  ["details.permit_number", t("许可编号"), "text"],
  ["notes", t("我的备注"), "textarea", "", "full"],
];
function message(text, error = false) {
  $("#message").hidden = false;
  $("#message").textContent = t(text);
  $("#message").classList.toggle("error", error);
  clearTimeout(message.timeout);
  message.timeout = setTimeout(
    () => ($("#message").hidden = true),
    error ? 16000 : 9000,
  );
}
function switchView(view) {
  $("#work-view").hidden = view !== "work";
  $("#history-view").hidden = view !== "history";
  for (const name of ["work", "history"])
    $("#tab-" + name).setAttribute("aria-selected", String(name === view));
  if (view === "history") renderHistory();
}
$("#tab-work").onclick = () => switchView("work");
$("#tab-history").onclick = () => switchView("history");
$$("[role=tab]").forEach(
  (tab) =>
    (tab.onkeydown = (e) => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
        e.preventDefault();
        const view =
          e.key === "Home"
            ? "work"
            : e.key === "End"
              ? "history"
              : tab.id === "tab-work"
                ? "history"
                : "work";
        switchView(view);
        $("#tab-" + view).focus();
      }
    }),
);
function fields(defs) {
  return (
    '<div class="fields-grid">' +
    defs
      .map(
        ([path, label, type, placeholder = "", cls = "", required = false]) => {
          const val = get(current, path);
          let control;
          if (type === "select")
            control = `<select id="${path}" data-path="${path}">${Object.entries(
              placeholder,
            )
              .map(
                ([k, v]) =>
                  `<option value="${k}" ${val === k ? "selected" : ""}>${v}</option>`,
              )
              .join("")}</select>`;
          else if (type === "textarea")
            control = `<textarea id="${path}" data-path="${path}" placeholder="${escape(placeholder)}" ${required ? "required" : ""} maxlength="4000">${escape(val)}</textarea>`;
          else
            control = `<input id="${path}" data-path="${path}" type="${type}" value="${escape(val)}" placeholder="${escape(placeholder)}" ${type === "number" ? 'step="0.01" min="0" inputmode="decimal"' : ""} ${type === "text" && path !== "amount.currency" ? 'maxlength="500"' : ""} ${path === "amount.currency" ? 'maxlength="3"' : ""} ${required ? "required" : ""}>`;
          return `<div class="field ${cls}"><label for="${path}">${label}${required ? ' <span class="required">*</span>' : ""}</label>${control}${path === "service.date" ? t("<small>未知留空；不会自动替换为开票日期。</small>") : ""}${path === "property.id" ? t("<small>由你确认归属，示例名称可直接改成自己的房屋。</small>") : ""}</div>`;
        },
      )
      .join("") +
    "</div>"
  );
}
function renderForm() {
  $("#empty-result").hidden = true;
  $("#processing").hidden = true;
  $("#receipt-form").hidden = false;
  $("#result-badge").textContent =
    current.review.status === "confirmed" ? t("已确认 · 可编辑") : t("待核对");
  $("#result-badge").className = "tag amber";
  $("#step-upload").className = "done";
  $("#step-review").className = "current";
  $("#step-save").className = "";
  $("#form-fields").innerHTML = fields(primaryFields);
  $("#extra-fields").innerHTML =
    fields(extras) +
    t(
      '<div class="line-items"><div class="section-caption">费用明细（可选，金额按原单据填写）</div><div id="items"></div><button type="button" class="text-link" id="add-item">＋ 添加明细</button></div><details><summary>查看字段原文证据</summary><div id="evidence"></div></details>',
    );
  $("#evidence").innerHTML = current.evidence.length
    ? current.evidence
        .map(
          (e) =>
            html`<p class="doc-meta">
              <strong>${escape(e.field)}</strong> · 第 ${escape(e.page)} 页<br />“${escape(
                e.quote,
              )}”
            </p>`,
        )
        .join("")
    : t('<p class="doc-meta">手动录入不包含 AI 原文证据。</p>');
  $("#add-item").onclick = () => {
    collect();
    current.items.push({ description: null, amount: null });
    renderItems();
  };
  renderItems();
  $("#review-notice").className =
    "notice" + (current.source.mode === "demo" ? " green" : "");
  $("#review-notice").textContent =
    current.source.mode === "demo"
      ? t("示例演示：以下信息来自预设的虚构单据，未调用 AI。请体验修改与确认。")
      : t(
          "当前未接入 AI：此文件没有自动识别结果。请根据左侧原件填写，空白项保持未知。",
        );
  updateCheck();
}
function renderItems() {
  $("#items").innerHTML = current.items
    .map(
      (i, n) =>
        html`<div class="line-item">
          <input
            aria-label="明细 ${n + 1} 描述"
            data-item="${n}"
            data-key="description"
            value="${escape(i.description)}"
            placeholder="项目说明"
            maxlength="1000"
          /><input
            aria-label="明细 ${n + 1} 金额"
            data-item="${n}"
            data-key="amount"
            type="number"
            step="0.01"
            min="0"
            value="${escape(i.amount)}"
            placeholder="未知"
          /><button
            type="button"
            class="icon-button"
            data-remove-item="${n}"
            aria-label="删除明细 ${n + 1}"
          >
            ×
          </button>
        </div>`,
    )
    .join("");
  $$("[data-remove-item]").forEach(
    (b) =>
      (b.onclick = () => {
        collect();
        current.items.splice(+b.dataset.removeItem, 1);
        renderItems();
        updateCheck();
      }),
  );
}
function collect() {
  if (!current) return;
  $$("[data-path]").forEach((el) => {
    let value = nullable(el.value);
    if (el.dataset.path === "amount.total" && value !== null)
      value = Number(value);
    if (el.dataset.path === "amount.currency" && value !== null)
      value = value.toUpperCase();
    if (
      get(current, el.dataset.path) !== value &&
      !current.review.edited_fields.includes(el.dataset.path)
    )
      current.review.edited_fields.push(el.dataset.path);
    set(current, el.dataset.path, value);
  });
  $$("[data-item]").forEach((el) => {
    current.items[+el.dataset.item][el.dataset.key] =
      el.dataset.key === "amount"
        ? el.value === ""
          ? null
          : Number(el.value)
        : nullable(el.value);
  });
}
function updateCheck() {
  const info = inspect(current);
  $("#missing-note").textContent =
    `${info.missing.length ? info.missing.length + t(" 项核心信息未提供，将保留为未知。") : t("核心信息已填写。")} ${t(info.warnings.join(" "))}`;
}
$("#receipt-form").addEventListener("input", () => {
  collect();
  updateCheck();
});
$("#receipt-form").addEventListener("change", () => {
  collect();
  updateCheck();
});
function clearPreview() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
  $("#source-preview").replaceChildren();
}
function renderSource() {
  clearPreview();
  $("#upload-view").hidden = true;
  $("#document-view").hidden = false;
  $("#filename").textContent = current.source.name;
  $("#source-badge").textContent =
    current.source.mode === "demo" ? t("虚构示例") : t("本地文件");
  $("#source-badge").className =
    "tag" + (current.source.mode === "demo" ? " amber" : "");
  if (current.source.mode === "demo") {
    const s = samples[current.source.sample_id];
    $("#source-preview").innerHTML =
      `<article class="paper"><div class="paper-top"><div><h3>${escape(s.provider)}</h3><small>Fictional document for product review</small></div><span class="demo-stamp">SAMPLE</span></div><p><strong>${escape(s.type.toUpperCase())} #${escape(s.number)}</strong></p><p>Issue date: ${escape(s.issue)}</p>${s.date ? `<p>Service date: ${escape(s.date)}</p>` : ""}${s.address ? `<p>Service at:<br>${escape(s.address)}</p>` : ""}<table><thead><tr><th>Description</th><th>USD</th></tr></thead><tbody>${s.items.map((i) => `<tr><td>${escape(i.description)}</td><td>${i.amount.toFixed(2)}</td></tr>`).join("")}</tbody></table><div class="paper-total">${s.type === "estimate" ? "Estimated total" : s.payment === "paid" ? "Total paid" : "Amount due"}<br>${escape(money(s.total, s.currency))}</div>${s.payment === "paid" ? '<p style="text-align:right;color:#086b63">PAID IN FULL</p>' : ""}${s.type === "estimate" ? "<p><strong>ESTIMATE — not a receipt</strong><br>Work has not started.</p>" : ""}${s.warranty ? `<p class="paper-foot">${escape(s.warranty)}</p>` : ""}<p class="paper-foot">DEMONSTRATION ONLY · Names, addresses and amounts are fictional.</p></article>`;
  } else if (currentFile) {
    objectUrl = URL.createObjectURL(currentFile);
    if (currentFile.type === "application/pdf") {
      const iframe = document.createElement("iframe");
      iframe.src = objectUrl;
      iframe.title = t("PDF 原件预览");
      $("#source-preview").append(iframe);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = t("无法预览？打开原始 PDF ↗");
      link.className = "text-link";
      $("#source-preview").append(link);
    } else {
      const img = document.createElement("img");
      img.src = objectUrl;
      img.alt = t("上传的票据原件");
      img.onerror = () =>
        message(t("图片无法解码，请更换文件。当前可手动填写。"), true);
      $("#source-preview").append(img);
    }
  } else
    $("#source-preview").textContent = t(
      "此记录没有可用原件。可以继续查看或修改字段。",
    );
}
function reset() {
  generation++;
  clearTimeout(timer);
  current = null;
  currentFile = null;
  baseline = null;
  clearPreview();
  $("#upload-view").hidden = false;
  $("#document-view").hidden = true;
  $("#receipt-form").hidden = true;
  $("#processing").hidden = true;
  $("#empty-result").hidden = false;
  $("#source-badge").textContent = t("等待添加");
  $("#source-badge").className = "tag";
  $("#result-badge").textContent = t("尚未识别");
  $("#result-badge").className = "tag";
  $("#step-upload").className = "current";
  $("#step-review").className = "";
  $("#step-save").className = "";
  $("#file-input").value = "";
  $("#camera-input").value = "";
  busy = false;
}
function canReplace() {
  return (
    !isDirty() ||
    confirm(t("更换会清除尚未保存的修改。已保存的记录仍会保留。继续？"))
  );
}
$("#replace-file").onclick = () => {
  if (busy) {
    message(t("正在保存或检查文件，请稍候。"));
    return;
  }
  if (canReplace()) reset();
};
$$("[data-sample]").forEach(
  (b) =>
    (b.onclick = () => {
      if (busy) return;
      reset();
      current = sampleRecord(b.dataset.sample, locale);
      baseline = null;
      renderSource();
      $("#empty-result").hidden = true;
      $("#processing").hidden = false;
      $("#result-badge").textContent = t("示例流程演示");
      const token = ++generation;
      timer = setTimeout(() => {
        if (token !== generation) return;
        renderForm();
        message(t("示例字段已整理，请核对后确认。"));
      }, 1100);
    }),
);
$("#cancel-process").onclick = () => {
  reset();
  message(t("已取消示例流程，可以重新选择。"));
};
async function handleFile(file) {
  if (!file || busy) return;
  const validation = validateFile(file);
  if (validation) {
    message(validation, true);
    return;
  }
  if (!canReplace()) return;
  reset();
  busy = true;
  const token = ++generation;
  $("#result-badge").textContent = t("检查文件中");
  try {
    const hash = await fileHash(file);
    if (token !== generation) return;
    let duplicate;
    try {
      records = await storage.all();
      duplicate = records.find((r) =>
        possibleDuplicate({ source: { sha256: hash } }, r),
      );
    } catch {
      message(t("本地存储暂不可用，可继续填写并导出备份。"), true);
    }
    if (token !== generation) return;
    if (duplicate) {
      await loadRecord(duplicate.id, { internal: true });
      message(t("这份文件已存在，已打开原记录，避免重复保存。"));
      return;
    }
    current = blankRecord();
    currentFile = file;
    current.source = {
      name: file.name,
      mime_type: file.type,
      sha256: hash,
      mode: "manual",
    };
    renderSource();
    renderForm();
    message(t("文件已在本地打开。真实 AI 尚未连接，请手动填写。"));
  } catch (err) {
    reset();
    message(err.message || t("文件读取失败，请重试。"), true);
  } finally {
    busy = false;
  }
}
$("#file-input").onchange = (e) => handleFile(e.target.files[0]);
$("#camera-input").onchange = (e) => handleFile(e.target.files[0]);
const zone = $("#drop-zone");
for (const event of ["dragover", "dragenter"])
  zone.addEventListener(event, (e) => {
    e.preventDefault();
    zone.classList.add("dragover");
  });
for (const event of ["dragleave", "drop"])
  zone.addEventListener(event, (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
  });
zone.addEventListener("drop", (e) => {
  if (e.dataTransfer.files.length !== 1) {
    message(t("每次请添加一份单据；同一份多页 PDF 可以整体添加。"), true);
    return;
  }
  handleFile(e.dataTransfer.files[0]);
});
function summary() {
  const values = [
    [t("归属房屋"), current.property.id],
    [t("服务项目"), current.service.summary],
    [t("服务日期"), current.service.date],
    [t("服务商"), current.provider.name],
    [t("服务地址"), current.property.service_address],
    [t("房屋系统"), categories[current.service.category]],
    [t("总金额"), money(current.amount.total, current.amount.currency)],
    [t("单据类型"), types[current.document.type]],
    [t("付款状态"), payments[current.amount.payment_status]],
    [t("施工状态"), completions[current.service.completion_status]],
  ];
  $("#confirmation-summary").innerHTML =
    (current.source.mode === "demo"
      ? t('<div class="notice">虚构示例记录 · 保存后仍会保留示例标识。</div>')
      : "") +
    values
      .map(
        ([k, v]) =>
          `<div class="summary-row"><span>${k}</span><strong>${escape(v ?? t("未知 / 未提供"))}</strong></div>`,
      )
      .join("");
}
$("#receipt-form").onsubmit = (e) => {
  e.preventDefault();
  collect();
  const check = inspect(current, { confirm: true });
  if (check.errors.length) {
    message(check.errors.join(" "), true);
    return;
  }
  summary();
  $("#confirm-check").checked = false;
  $("#confirm-save").disabled = true;
  $("#confirm-dialog").showModal();
};
$$("[data-close]").forEach(
  (b) => (b.onclick = () => $("#" + b.dataset.close).close()),
);
async function persist(status) {
  if (busy || !current) return;
  collect();
  let candidate;
  try {
    candidate = transition(current, status);
  } catch (e) {
    message(e.message, true);
    return;
  }
  busy = true;
  $("#confirm-save").disabled = true;
  $("#save-draft").disabled = true;
  try {
    const now = new Date().toISOString();
    candidate.id = current.id || crypto.randomUUID();
    candidate.created_at = current.created_at || now;
    candidate.updated_at = now;
    candidate.confirmed_at = status === "confirmed" ? now : null;
    const savedFile = currentFile;
    await storage.save(candidate, savedFile);
    current = candidate;
    baseline = snapshot(current);
    records = [candidate, ...records.filter((r) => r.id !== candidate.id)];
    $("#confirm-dialog").close();
    $("#step-save").className = "current";
    switchView("history");
    message(
      status === "confirmed"
        ? t("已确认并保存在当前浏览器。可查看、修改或导出。")
        : t("草稿已保存在当前浏览器，可稍后继续。"),
    );
  } catch (err) {
    $("#confirm-dialog").close();
    message(err.message || t("保存失败，请重试。"), true);
    showBackup();
  } finally {
    busy = false;
    $("#confirm-save").disabled = !$("#confirm-check").checked;
    $("#save-draft").disabled = false;
  }
}
function showBackup() {
  if ($("#emergency-export")) return;
  const b = document.createElement("button");
  b.type = "button";
  b.id = "emergency-export";
  b.className = "button secondary";
  b.textContent = t("导出当前草稿备份");
  b.onclick = () => {
    collect();
    download(current, "domic-home-passport-unsaved-draft.json");
  };
  $(".review-actions").append(b);
}
$("#confirm-check").onchange = () => {
  $("#confirm-save").disabled = !$("#confirm-check").checked;
};
$("#save-draft").onclick = () => persist("draft");
$("#confirm-save").onclick = () => {
  if (!$("#confirm-check").checked) {
    message(t("请先勾选确认，或返回修改。"), true);
    return;
  }
  persist("confirmed");
};
function renderHistory() {
  $("#record-count").textContent = records.length;
  $("#export-all").disabled = !records.length;
  $("#history-list").innerHTML = records.length
    ? records
        .map(
          (r) =>
            html`<article class="record-card">
              <div class="record-date">
                ${escape(r.service.date || t("服务日期未知"))}<br /><small
                  >${r.document.issue_date
                    ? t("开票 ") + escape(r.document.issue_date)
                    : ""}</small
                >
              </div>
              <div class="record-main">
                <span
                  class="tag ${r.review.status === "confirmed"
                    ? "green"
                    : "amber"}"
                  >${r.review.status === "confirmed"
                    ? t("已确认")
                    : t("草稿")}</span
                >
                <span class="tag">${escape(types[r.document.type])}</span> ${r
                  .source.mode === "demo"
                  ? t('<span class="tag amber">虚构示例</span>')
                  : ""}
                <h3>${escape(r.service.summary || t("待填写服务项目"))}</h3>
                <p>
                  ${escape(r.property.id || t("尚未选择房屋"))} ·
                  ${escape(r.provider.name || t("服务商未知"))}
                </p>
                <p>
                  ${r.review.missing_fields.length
                    ? t("有 ") +
                      r.review.missing_fields.length +
                      t(" 项核心信息待补全")
                    : t("核心信息完整")}
                  · ${escape(completions[r.service.completion_status])}
                </p>
                <div class="record-actions">
                  <button class="text-link" data-open="${r.id}">
                    查看 / 修改</button
                  ><button class="text-link" data-export="${r.id}">
                    导出 JSON</button
                  ><button class="text-link" data-original="${r.id}">
                    原始单据</button
                  ><button class="text-link delete" data-delete="${r.id}">
                    删除
                  </button>
                </div>
              </div>
              <div class="record-money">
                ${escape(money(r.amount.total, r.amount.currency))}<br /><span
                  class="tag"
                  >${r.document.type === "estimate"
                    ? t("预估费用")
                    : escape(payments[r.amount.payment_status])}</span
                >
              </div>
            </article>`,
        )
        .join("")
    : t(
        '<div class="history-empty"><h3>房屋的下一段历史，从第一张票据开始。</h3><p>你确认的记录和未完成草稿会显示在这里。</p><button class="button primary" id="back-upload">添加第一份单据</button></div>',
      );
  if ($("#back-upload")) $("#back-upload").onclick = () => switchView("work");
  $$("[data-open]").forEach(
    (b) => (b.onclick = () => loadRecord(b.dataset.open)),
  );
  $$("[data-export]").forEach(
    (b) =>
      (b.onclick = () =>
        download(
          records.find((r) => r.id === b.dataset.export),
          "domic-home-passport-record.json",
        )),
  );
  $$("[data-original]").forEach(
    (b) => (b.onclick = () => original(b.dataset.original)),
  );
  $$("[data-delete]").forEach(
    (b) =>
      (b.onclick = () => {
        deleting = b.dataset.delete;
        $("#delete-dialog").showModal();
      }),
  );
}
async function loadRecord(id, { internal = false } = {}) {
  if (busy && !internal) {
    message(t("正在保存或检查文件，请稍候。"));
    return;
  }
  if (isDirty() && !canReplace()) return;
  const token = ++generation;
  clearTimeout(timer);
  try {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    const loadedFile = await storage.file(id);
    if (token !== generation) return;
    current = structuredClone(record);
    currentFile = loadedFile;
    baseline = snapshot(current);
    switchView("work");
    renderSource();
    renderForm();
    $("#receipt-form").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (e) {
    if (token === generation)
      message(t("无法读取此记录，请刷新后重试。"), true);
  }
}
function download(data, name) {
  const blob = new Blob([JSON.stringify(exportRecordData(data), null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, name);
}
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
async function original(id) {
  const r = records.find((r) => r.id === id);
  try {
    if (r.source.mode === "demo") {
      await loadRecord(id);
      message(t("原始单据为虚构的页面示例。"));
      return;
    }
    const blob = await storage.file(id);
    if (!blob) throw Error();
    downloadBlob(blob, r.source.name || "receipt");
  } catch {
    message(t("原始文件不可用。结构化记录仍可导出。"), true);
  }
}
$("#export-all").onclick = () =>
  download(
    {
      schema_version: "1.0",
      exported_at: new Date().toISOString(),
      storage_scope: "this_browser",
      records,
    },
    "domic-home-passport-records.json",
  );
$("#confirm-delete").onclick = async () => {
  if (busy || !deleting) return;
  busy = true;
  $("#confirm-delete").disabled = true;
  try {
    await storage.remove(deleting);
    if (current?.id === deleting) reset();
    records = records.filter((r) => r.id !== deleting);
    renderHistory();
    $("#delete-dialog").close();
    message(t("记录和对应原件已从此浏览器删除。"));
  } catch (e) {
    message(e.message, true);
  } finally {
    busy = false;
    $("#confirm-delete").disabled = false;
  }
};
try {
  records = await storage.all();
  renderHistory();
} catch (e) {
  message(e.message, true);
}
window.addEventListener("beforeunload", (e) => {
  if (isDirty()) {
    e.preventDefault();
    e.returnValue = "";
  }
});
