import { users, properties, contextFor, applyContext } from "./workspace-context.js";
import { extractText } from "./extraction.js";
import { startOCR } from "./ocr.js";
import { AI_ENDPOINT, AI_TIMEOUT_MS, AI_MAX_FILE_BYTES } from "./ai-config.js";
import { createAIClient, AIError } from "./ai-client.js";
import { normalizeAIExtraction } from "./ai-contract.js";
import { t, html, locale } from "./i18n.js";
import {
  blankRecord,
  changes as rawchanges,
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
const L = (en, zh) => (locale === "zh" ? zh : en);
const changes =
  locale === "zh"
    ? {
        repair: "维修",
        replacement: "更换",
        installation: "安装",
        improvement: "改造",
        maintenance: "保养",
        inspection: "检查",
        unknown: "未知",
      }
    : rawchanges;
let activeOCR = null;
let activeAI = null;
let intakeLocale = "en-GB";
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
// The test context is chosen explicitly; it is never read from receipt text.
function selectedContext() {
  return contextFor($("#demo-user")?.value, $("#demo-property")?.value);
}
function carryDocument(target, previous, mode = previous.source.mode) {
  target.source = { ...previous.source, mode };
  target.account = structuredClone(previous.account);
  target.property.id = previous.property.id;
  target.property.uid = previous.property.uid;
  for (const key of ["id", "created_at", "updated_at"])
    if (previous[key] !== undefined) target[key] = previous[key];
  return target;
}
const contextHost = document.createElement("div");
contextHost.className = "context-bar";
contextHost.innerHTML = `<div><strong>${L("Local prototype workspace", "本地原型工作区")}</strong><small>${L("Choose a test identity and property. This is not sign-in; records stay in this browser.", "选择测试身份和房屋；这不是账号登录，资料保留在此浏览器。")}</small></div><label>${L("Uploading as", "上传身份")}<select id="demo-user">${users.map(u => `<option value="${u.id}">${escape(u.display_name)}${u.is_demo ? " · Demo" : ""}</option>`).join("")}</select></label><label>${L("Link new document to", "新单据归属房屋")}<select id="demo-property"><option value="">${L("Choose in the review form", "在核对表中填写")}</option>${properties.map(p=>`<option value="${p.uid}">${escape(p.name)} · ${escape(p.owner)}</option>`).join("")}</select></label><label>${L("Receipt format", "单据日期／币种格式")}<select id="receipt-locale"><option value="en-GB">UK · DD/MM/YYYY · £</option><option value="">ISO dates · explicit currency</option></select></label><a href="${L("admin/", "admin/zh.html")}">${L("Management console", "管理控制台")} ↗</a>`;
$(".mode-note").after(contextHost);
let sessionStore;
try { sessionStore = window.sessionStorage; } catch { /* Some browser privacy modes disable storage. */ }
const aiClient = createAIClient({ endpoint: AI_ENDPOINT, timeoutMs: AI_TIMEOUT_MS, sessionStore });
const readerHost = document.createElement("section");
readerHost.className = "reader-settings";
readerHost.setAttribute("aria-label", L("Document reading settings", "单据读取设置"));
readerHost.innerHTML = `<div class="reader-heading"><label for="reading-mode">${L("Read this document with", "单据读取方式")}</label><select id="reading-mode"><option value="cloud" ${AI_ENDPOINT ? "selected" : "disabled"}>${L("AI · images and PDFs", "AI · 图片与 PDF")}</option><option value="local" ${AI_ENDPOINT ? "" : "selected"}>${L("Local OCR · English images", "本地文字识别 · 英文图片")}</option><option value="manual">${L("Manual entry", "手工填写")}</option></select><span id="ai-connection" class="tag" role="status"></span></div><p id="reader-privacy" class="doc-meta"></p><form id="ai-access-form" ${AI_ENDPOINT ? "" : "hidden"}><label for="ai-access-code">${L("Pilot access code", "试用访问码")}</label><div class="ai-access-controls"><input id="ai-access-code" type="password" autocomplete="off" maxlength="256" placeholder="${L("Enter your pilot code", "输入试用访问码")}" /><button class="button secondary" id="ai-unlock" type="submit">${L("Enable AI reading", "启用 AI 识别")}</button><button class="text-link" id="ai-lock" type="button" ${aiClient.hasAccess ? "" : "hidden"}>${L("Forget access code", "清除访问码")}</button></div><small>${L("Use the pilot code provided by the site owner. It is kept only for this browser tab. Do not enter an OpenRouter API key.", "请使用网站负责人提供的试用访问码；只在当前标签页会话中保留，请勿输入 OpenRouter API 密钥。")}</small><p id="ai-access-message" role="status"></p></form>`;
contextHost.after(readerHost);
function updateReaderNotice() {
  const cloud = $("#reading-mode").value === "cloud";
  $("#receipt-locale").disabled = cloud;
  $("#reader-privacy").textContent = cloud
    ? L("AI reading sends the selected image or PDF to our service and its cloud AI provider. Review every extracted field before saving. Files and confirmed records are still saved only in this browser. AI limit: 6 MB per document.", "AI 识别会将所选图片或 PDF 发送至本站服务及云端 AI 提供商。保存前请核对每个字段；原件和已确认记录仍只保存在此浏览器。AI 每份单据最大 6 MB。")
    : L("Local OCR reads English images in this browser. PDF and manual entry stay available without cloud AI. Saved records remain in this browser; export a backup.", "本地文字识别在浏览器中读取英文图片；PDF 和手工填写无需云端 AI。记录保存在此浏览器，请导出备份。");
  $("#ai-access-form").hidden = !AI_ENDPOINT || !cloud;
}
$("#reading-mode").onchange = () => {
  updateReaderNotice();
  if (current) message(L("This choice is used for the next upload or Retry reading. Current fields are unchanged.", "此选择用于下一次上传或重试读取，当前字段未改动。"));
};
$("#ai-connection").textContent = AI_ENDPOINT ? L("Checking AI service…", "正在检查 AI 服务…") : L("AI service not connected", "尚未接入 AI 服务");
if (AI_ENDPOINT) {
  $(".mode-note div").textContent = L("AI pilot · Read an image or PDF, review the details, then confirm. Reading uses a cloud service; records are saved in this browser. The management console is still a local prototype.", "AI 试用版 · 读取图片或 PDF、核对字段，再确认保存。识别使用云端服务，记录保存在此浏览器；管理控制台仍为本地原型。");
  aiClient.health().then(data => {
    $("#ai-connection").textContent = data.configured
      ? L("AI service available", "AI 服务可用")
      : L("AI service not configured", "AI 服务尚未配置");
  }).catch(() => { $("#ai-connection").textContent = L("AI service unavailable", "AI 服务暂不可用"); });
}
updateReaderNotice();
$("#ai-access-form").onsubmit = async event => {
  event.preventDefault();
  $("#ai-unlock").disabled = true;
  $("#ai-access-message").textContent = L("Checking access…", "正在验证访问权限…");
  try {
    await aiClient.unlock($("#ai-access-code").value);
    $("#ai-access-code").value = "";
    $("#ai-lock").hidden = false;
    $("#ai-access-message").textContent = L("AI reading is enabled for this tab. Choose a file, or Retry reading for the open document.", "当前标签页已启用 AI。请选择文件，或对已打开的单据点击重试读取。");
  } catch (error) {
    $("#ai-access-message").textContent = aiErrorCopy(error)[1];
  } finally { $("#ai-unlock").disabled = false; }
};
$("#ai-lock").onclick = () => {
  aiClient.clearAccess();
  $("#ai-access-code").value = "";
  $("#ai-lock").hidden = true;
  $("#ai-access-message").textContent = L("Access code forgotten. Saved records are unchanged.", "访问码已清除，已保存的记录未改动。");
};
for (const id of ["demo-user", "demo-property"]) $("#"+id).onchange = () => {
  if (current) message(L("This choice applies to the next document. Current record details are unchanged.", "此选择用于下一张单据，当前记录信息未改动。"));
};
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
  [
    "provider.name",
    L("Provider display name", "服务商显示名称"),
    "text",
    t("未提供"),
  ],
  [
    "provider.organization_name",
    L("Service company", "服务公司"),
    "text",
    L("Only if stated on the document", "单据有写明才填写"),
  ],
  [
    "provider.person_name",
    L("Person who performed the work", "实际施工人员姓名"),
    "text",
    L("Not the customer or invoice preparer", "不是客户、付款人或制单人"),
  ],
  [
    "service.change_type",
    L("Type of work / change", "房屋工作／变更类型"),
    "select",
    changes,
  ],
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
  $("#form-fields").innerHTML = `<div class="field full"><label for="review-property">${L("Link to a property", "关联到房屋")}</label><select id="review-property"><option value="">${L("Unlinked / enter property below", "尚未关联／在下方填写房屋")}</option>${properties.map(p=>`<option value="${p.uid}" ${current.property.uid === p.uid ? "selected" : ""}>${escape(p.name)} · ${escape(p.owner)}</option>`).join("")}</select></div>` + fields(primaryFields);
  $("#review-property").onchange = () => {
    collect(); const p = properties.find(p => p.uid === $("#review-property").value);
    current.property.uid = p?.uid || null;
    if (p) current.property.id = p.name;
    for (const key of ["property.uid", "property.id"]) if (!current.review.edited_fields.includes(key)) current.review.edited_fields.push(key);
    renderForm();
  };
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
    : `<p class="doc-meta">${L("No supporting source quotes are available for this record.", "此记录没有可用的原文证据片段。")}</p>`;
  $("#add-item").onclick = () => {
    collect();
    current.items.push({ description: null, amount: null });
    renderItems();
  };
  renderItems();
  $("#review-notice").className =
    "notice" + (current.source.mode === "demo" ? " green" : "");
  $("#review-notice").textContent =
    current.source.mode === "cloud_ai"
      ? L(
          `AI reading${current.extraction?.model ? " · " + current.extraction.model : ""}. Check the original: the AI can miss or misread details. Nothing is saved until you choose to save.`,
          `AI 识别${current.extraction?.model ? " · " + current.extraction.model : ""}。AI 可能遗漏或读错，请核对原件；只有你主动保存才会录入。`,
        )
      : current.source.mode === "local_ocr"
      ? L(
          "Experimental local OCR. Check every value against the original. Company and worker are separate; missing names stay unknown.",
          "实验性本地文字识别。请逐项核对原件；公司与施工人员分别记录，缺失姓名保持未知。",
        )
      : current.source.mode === "demo"
        ? t(
            "示例演示：以下信息来自预设的虚构单据，未调用 AI。请体验修改与确认。",
          )
        : AI_ENDPOINT ? L("Manual entry: this file has no automatic extraction results. Use the original document and leave unknown values blank.", "手工录入：此文件没有自动识别结果，请对照原件填写，未知值留空。") : t(
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
    if (el.dataset.path === "property.id" && value !== current.property.id) {
      current.property.uid = null;
      if ($("#review-property")) $("#review-property").value = "";
      if (!current.review.edited_fields.includes("property.uid")) current.review.edited_fields.push("property.uid");
    }
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
  $("#reread-original").hidden = !currentFile || current.source.mode === "demo";
  $("#source-badge").textContent =
    current.source.mode === "demo" ? t("虚构示例") : current.source.mode === "cloud_ai" ? L("AI · original file", "AI · 原始文件") : t("本地文件");
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
      const note = document.createElement("p");
      note.className = "muted";
      note.textContent = L("PDF preview depends on your browser. If the panel is blank, open the original file.", "PDF 预览取决于浏览器；若面板为空白，请打开原始文件。");
      $("#source-preview").prepend(note, link);
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
  clearTimeout(message.timeout);
  $("#message").hidden = true;
  $("#message").textContent = "";
  generation++;
  activeOCR?.cancel();
  activeOCR = null;
  activeAI?.abort();
  activeAI = null;
  $("#ocr-outcome").hidden = true;
  $("#extraction-dialog").close();
  $("#confirm-dialog").close();
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
  if (!isDirty()) return true;
  return new Promise((resolve) => {
    const dialog = $("#discard-dialog");
    const finish = (answer) => {
      dialog.close();
      resolve(answer);
    };
    $("#discard-keep").onclick = () => finish(false);
    $("#discard-replace").onclick = () => finish(true);
    dialog.oncancel = (event) => {
      event.preventDefault();
      finish(false);
    };
    dialog.showModal();
  });
}
$("#replace-file").onclick = async () => {
  if (busy) {
    message(t("正在保存或检查文件，请稍候。"));
    return;
  }
  if (!isDirty() || (await canReplace())) reset();
};
$$("[data-sample]").forEach(
  (b) =>
    (b.onclick = () => {
      if (busy) return;
      reset();
      current = applyContext(sampleRecord(b.dataset.sample, locale), selectedContext());
      baseline = null;
      renderSource();
      $("#empty-result").hidden = true;
      $("#processing").hidden = false;
      $("#result-badge").textContent = t("示例流程演示");
      $("#processing h3").textContent = L(
        "Demonstrating extraction",
        "演示示例流程",
      );
      $("#processing p").textContent = L(
        "Read sample → organize fields → review",
        "读取示例 → 整理字段 → 核对",
      );
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
  message(
    L(
      "Canceled. Nothing was saved; choose a document to try again.",
      "已取消，未保存任何记录，可以重新选择。",
    ),
  );
};
async function handleFile(file) {
  if (!file || busy) return;
  const validation = validateFile(file);
  if (validation) {
    message(validation, true);
    return;
  }
  if (isDirty() && !(await canReplace())) return;
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
      const openedGeneration = generation + 1;
      const opened = await loadRecord(duplicate.id, { internal: true });
      if (generation === openedGeneration) busy = false;
      if (opened) message(t("这份文件已存在，已打开原记录，避免重复保存。"));
      return;
    }
    current = applyContext(blankRecord(), selectedContext());
    currentFile = file;
    intakeLocale = $("#receipt-locale").value || null;
    current.source = {
      name: file.name,
      mime_type: file.type,
      sha256: hash,
      mode: "manual",
    };
    await readCurrentFile(token);
  } catch (err) {
    if (token !== generation) return;
    reset();
    message(err.message || t("文件读取失败，请重试。"), true);
  } finally {
    if (token === generation) busy = false;
  }
}
const outcomes = {
  review: [
    "Details found — please review",
    "已找到信息，请核对",
    "Nothing has been saved. Review the company, actual worker, work performed, date, address and amount.",
    "尚未保存。请核对公司、实际施工者、工作内容、日期、地址和金额。",
  ],
  partial: [
    "Some details need your help",
    "部分信息需要补充",
    "We kept the readable details. Missing values remain blank; correct or add information before confirming.",
    "已保留可读信息。缺失项保持空白，请修改或补充后确认。",
  ],
  no_text: [
    "No usable receipt text found",
    "未找到可用的票据信息",
    "This may be a photo, an unreadable document or an unsupported language. Retake the whole document in good light, choose another file, or enter details manually.",
    "可能是普通照片、无法阅读的单据或不支持的语言。请在光线充足时重拍完整单据、更换文件，或手工填写。",
  ],
  unrelated: [
    "This appears to be an unrelated service",
    "这似乎不是房屋服务单据",
    "Readable text points to a different kind of service. Check the original and choose a home-service document. Nothing was saved.",
    "可读文字显示这是其他类型服务。请核对原件并选择房屋服务单据，尚未保存。",
  ],
  uncertain: [
    "Is this a home-service document?",
    "这是房屋服务单据吗？",
    "Some text was read, but its relevance is uncertain. If this belongs to your property history, review and complete the details manually.",
    "读到了部分文字，但不能确定是否与房屋有关。如果属于房屋历史，请核对并手工补充。",
  ],
  failed: [
    "Could not read this image",
    "无法读取这张图片",
    "The image may be damaged, too large to process, or the reader could not load. Retry or choose another file; nothing was saved.",
    "图片可能损坏、尺寸过大，或识别工具无法加载。请重试或更换文件，尚未保存。",
  ],
  timeout: [
    "Reading took too long",
    "读取超时",
    "The 45-second limit was reached. Retry with a smaller, clearer image or enter details manually. Nothing was saved.",
    "已超过 45 秒。请使用更小、更清楚的图片重试，或手工填写，尚未保存。",
  ],
};
function aiErrorCopy(error) {
  const code = error?.code || "malformed_output";
  const copies = {
    access_required: [L("Pilot access code required", "需要试用访问码"), L("Enter your pilot access code in the reading settings above, then choose Retry reading. Nothing was sent to the AI or saved.", "请在上方读取设置中输入试用访问码，然后点击重试读取。尚未发送至 AI 或保存。")],
    invalid_access: [L("Access code was not accepted", "访问码未通过验证"), L("Check the pilot access code above, enable AI reading, then retry. Nothing was saved.", "请在上方核对试用访问码，启用 AI 后重试；尚未保存。")],
    api_key_not_allowed: [L("Use a pilot access code", "请使用试用访问码"), L("An OpenRouter API key must be configured on the server. Enter the separate pilot access code here.", "OpenRouter API 密钥应配置在服务器，请在此输入独立的试用访问码。")],
    not_configured: [L("AI service is not ready", "AI 服务尚未就绪"), L("The site owner needs to finish the AI service setup. You can choose Local OCR or enter details manually. Nothing was saved.", "网站负责人需要完成 AI 服务配置。你可以选择本地文字识别或手工填写；尚未保存。")],
    insufficient_credits: [L("AI reading is temporarily unavailable", "AI 识别暂不可用"), L("The AI account has insufficient credits. Contact the site owner, or enter details manually. Nothing was saved.", "AI 账户额度不足，请联系网站负责人或手工填写；尚未保存。")],
    rate_limited: [L("Too many reading requests", "识别请求过多"), L("Please wait briefly, then retry. Your file is still here and nothing was saved.", "请稍候再重试，文件仍保留在页面中，尚未保存。")],
    timeout: [L("AI reading took too long", "AI 识别超时"), L("The service did not finish in time. Retry with a smaller document or enter details manually. Nothing was saved.", "AI 服务未能及时完成，请使用更小的文件重试或手工填写；尚未保存。")],
    malformed_output: [L("AI returned an unusable result", "AI 返回的结果无法使用"), L("The response could not be safely arranged into the review form. Retry or enter details manually. No extracted values were accepted or saved.", "返回内容无法整理为可核对的字段，请重试或手工填写。没有接受或保存任何识别字段。")],
    file_too_large: [L("This document exceeds the AI limit", "此单据超过 AI 大小限制"), L("AI reading accepts files up to 6 MB. Choose a smaller file, select Local OCR for an image, or enter details manually. Nothing was saved.", "AI 识别支持最大 6 MB 的文件。请换用更小文件、对图片选择本地文字识别，或手工填写；尚未保存。")],
    network_error: [L("Could not reach the AI service", "无法连接 AI 服务"), L("Check your connection and retry. You can also enter details manually. Nothing was saved.", "请检查网络后重试，也可以手工填写；尚未保存。")],
    upstream_failure: [L("AI reading could not finish", "AI 识别未能完成"), L("The cloud service could not complete this request. Retry or enter details manually. Nothing was saved.", "云端服务未能完成此请求，请重试或手工填写；尚未保存。")],
  };
  const aliases = { unauthorized: "invalid_access", invalid_code: "invalid_access", forbidden: "invalid_access", service_auth_failed: "not_configured", model_unavailable: "not_configured", service_not_configured: "not_configured", provider_credits: "insufficient_credits", insufficient_quota: "insufficient_credits", throttled: "rate_limited", upstream_error: "upstream_failure", upstream_failed: "upstream_failure", invalid_response: "malformed_output", invalid_output: "malformed_output", model_output_invalid: "malformed_output" };
  return copies[code] || copies[aliases[code]] || copies.upstream_failure;
}
function showAIError(error) {
  const copy = aiErrorCopy(error);
  $("#processing").hidden = true;
  $("#empty-result").hidden = true;
  $("#receipt-form").hidden = true;
  $("#ocr-outcome").hidden = false;
  $("#ocr-outcome").dataset.status = "ai_error";
  $("#outcome-title").textContent = copy[0];
  $("#outcome-description").textContent = copy[1];
  $("#result-badge").textContent = L("AI reading needs attention", "AI 识别需要处理");
  $("#outcome-manual").hidden = false;
  $("#outcome-manual").textContent = L("Enter details manually", "手工填写");
  $("#ocr-raw").textContent = L("No extraction result was accepted.", "未接受任何识别结果。");
  if (["invalid_access", "unauthorized", "invalid_code", "forbidden"].includes(error.code)) {
    aiClient.clearAccess();
    $("#ai-lock").hidden = true;
  }
}
async function readCurrentFile(token) {
  const lastReader = $("#reading-mode").value;
  current.source.mode = "manual";
  renderSource();
  if (lastReader === "cloud") return recognizeAI(token);
  if (lastReader === "local" && currentFile.type !== "application/pdf") return recognizeFile(token);
  renderForm();
  message(lastReader === "local" ? L("Local OCR supports images. For this PDF, enter details manually or choose AI reading and Retry reading.", "本地文字识别支持图片。此 PDF 请手工填写，或选择 AI 识别后重试读取。") : L("Manual entry selected. Review the original and fill in what is known.", "已选择手工填写，请对照原件填写已知信息。"));
  if (currentFile.type === "application/pdf") {
    $("#ocr-outcome").hidden = false;
    $("#outcome-title").textContent = L("PDF ready for review", "PDF 已可核对");
    $("#outcome-description").textContent = AI_ENDPOINT ? L("To read this PDF with AI, select AI reading above and choose Retry reading.", "如需 AI 读取此 PDF，请在上方选择 AI 识别，再点击重试读取。") : L("AI reading is not connected. Enter the details from the original PDF.", "尚未接入 AI 识别，请对照原始 PDF 填写。");
    $("#outcome-manual").hidden = true;
    $("#ocr-raw").textContent = L("No automatic extraction was requested.", "未请求自动识别。");
  }
  busy = false;
}
async function recognizeAI(token) {
  $("#ocr-outcome").hidden = true;
  $("#receipt-form").hidden = true;
  $("#empty-result").hidden = true;
  $("#processing").hidden = false;
  $("#processing h3").textContent = L("Reading this document with AI", "正在使用 AI 读取单据");
  $("#processing p").textContent = L("Sending the document to the cloud reader, then arranging fields for your review. Nothing is saved yet.", "正在将单据发送至云端识别，并整理字段供你核对；尚未保存。");
  activeAI = new AbortController();
  try {
    if (currentFile.size > AI_MAX_FILE_BYTES) throw new AIError("file_too_large");
    const data = await aiClient.extract(currentFile, { locale: intakeLocale, signal: activeAI.signal });
    if (token !== generation) return;
    let next;
    try { next = normalizeAIExtraction(data.extraction, { model: data.model, engine: "openrouter", requestId: data.request_id, usage: data.usage }); }
    catch { throw new AIError("malformed_output"); }
    carryDocument(next, current, "cloud_ai");
    next.extraction.locale = "en-GB";
    current = next;
    renderSource();
    showOutcome(current.extraction.status);
  } catch (error) {
    if (token !== generation || error.code === "cancelled") return;
    showAIError(error);
  } finally {
    if (token === generation) { activeAI = null; busy = false; }
  }
}
function showOutcome(status) {
  const copy = outcomes[status] || outcomes.failed;
  $("#processing").hidden = true;
  $("#empty-result").hidden = true;
  $("#ocr-outcome").hidden = false;
  $("#ocr-outcome").dataset.status = status;
  $("#outcome-title").textContent = L(copy[0], copy[1]);
  $("#outcome-description").textContent = L(copy[2], copy[3]);
  $("#result-badge").textContent = L(copy[0], copy[1]);
  $("#ocr-raw").textContent =
    current.extraction?.text || L("No readable text.", "没有可读文字。");
  $("#ocr-outcome details summary").textContent = current.source.mode === "cloud_ai"
    ? L("View AI supporting quotes", "查看 AI 提供的原文证据片段")
    : L("View text read from this image", "查看图片识别文字");
  $("#outcome-manual").textContent =
    status === "uncertain"
      ? L("This is for my home — review details", "属于我的房屋，核对信息")
      : L("Enter details manually", "手工填写");
  if (["review", "partial"].includes(status)) {
    renderForm();
    summary();
    $("#extraction-title").textContent = L(copy[0], copy[1]);
    $("#extraction-description").textContent = L(copy[2], copy[3]);
    $("#extraction-summary").innerHTML = $("#confirmation-summary").innerHTML;
    $("#extraction-dialog").showModal();
    $("#outcome-manual").hidden = true;
  } else {
    $("#receipt-form").hidden = true;
    $("#outcome-manual").hidden = false;
  }
}
async function recognizeFile(token) {
  $("#ocr-outcome").hidden = true;
  $("#receipt-form").hidden = true;
  $("#empty-result").hidden = true;
  $("#processing").hidden = false;
  $("#processing h3").textContent = L(
    "Reading this image locally",
    "正在本地读取图片",
  );
  $("#processing p").textContent = L(
    "Loading the English reader… First use may take longer.",
    "正在加载英文识别工具，首次使用可能较慢…",
  );
  activeOCR = startOCR(currentFile, (event) => {
    if (token !== generation) return;
    if (event.status === "recognizing text")
      $("#processing p").textContent =
        L("Reading text", "读取文字") +
        " · " +
        Math.round(event.progress * 100) +
        "%";
  });
  try {
    const data = await activeOCR.promise;
    if (token !== generation) return;
    const previous = current;
    current = extractText(data.text, data.confidence, { locale: current.extraction?.locale ?? intakeLocale });
    carryDocument(current, previous, "local_ocr");
    renderSource();
    showOutcome(current.extraction.status);
  } catch (error) {
    if (token !== generation) return;
    showOutcome(error.message === "timeout" ? "timeout" : "failed");
  } finally {
    if (token === generation) {
      activeOCR = null;
      busy = false;
    }
  }
}
$("#outcome-manual").onclick = () => {
  if (busy || !current) return;
  const result = current.extraction;
  if (result?.status === "unrelated" || result?.status === "no_text") {
    const previous = current;
    current = blankRecord();
    carryDocument(current, previous);
    current.extraction = result;
  }
  if (!["review", "partial", "uncertain"].includes(result?.status)) current.source.mode = "manual";
  renderForm();
  $("#ocr-outcome").hidden = true;
  $("#review-notice").textContent = L(
    "Manual entry after review. Only record work that belongs to this home; unknown values stay blank.",
    "核对后手工填写。仅记录与本房屋有关的工作，未知值留空。",
  );
};
async function rereadCurrent() {
  if (busy || !currentFile) return;
  if (isDirty() && !(await canReplace())) return;
  const previous = current;
  current = carryDocument(blankRecord(), previous);
  busy = true;
  await readCurrentFile(++generation);
}
$("#outcome-retry").onclick = rereadCurrent;
$("#reread-original").onclick = rereadCurrent;
$("#outcome-change").onclick = async () => {
  if (busy) return;
  if (!isDirty() || (await canReplace())) reset();
};
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
    [L("Reading method", "读取方式"), current.source.mode === "cloud_ai" ? L("Cloud AI", "云端 AI") : current.source.mode === "local_ocr" ? L("Local OCR", "本地文字识别") : current.source.mode === "demo" ? L("Fictional sample", "虚构示例") : L("Manual entry", "手工填写")],
    ...(current.source.mode === "cloud_ai" && current.extraction?.model ? [[L("AI model", "AI 模型"), current.extraction.model]] : []),
    [L("Uploaded by", "上传人"), current.account?.display_name || L("Not recorded", "未记录")],
    [t("归属房屋"), current.property.id],
    [t("服务项目"), current.service.summary],
    [t("服务日期"), current.service.date],
    ...(!current.provider.organization_name && !current.provider.person_name
      ? [[t("服务商"), current.provider.name]]
      : []),
    [L("Service company", "服务公司"), current.provider.organization_name],
    [L("Worker", "施工人员"), current.provider.person_name],
    [L("Type of change", "变更类型"), changes[current.service.change_type]],
    [t("服务地址"), current.property.service_address],
    [t("房屋系统"), categories[current.service.category]],
    [t("总金额"), money(current.amount.total, current.amount.currency)],
    [t("单据类型"), types[current.document.type]],
    [t("付款状态"), payments[current.amount.payment_status]],
    [t("施工状态"), completions[current.service.completion_status]],
    [t("开票日期"), current.document.issue_date],
    [t("单据编号"), current.document.number],
    ...extras.filter(([p]) => !["document.issue_date", "document.number"].includes(p) && get(current, p)).map(([p,l]) => [l,get(current,p)]),
    ...current.items.map((i,n)=>[L("Line item ", "明细 ")+(n+1), (i.description || "")+" · "+money(i.amount,current.amount.currency)]),
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
  const locked = $$(
    "#receipt-form input,#receipt-form textarea,#receipt-form select,#receipt-form button,#ocr-outcome button,#replace-file,#reread-original,[data-close='confirm-dialog']",
  );
  const previousDisabled = locked.map((el) => el.disabled);
  locked.forEach((el) => (el.disabled = true));
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
    locked.forEach((el, i) => (el.disabled = previousDisabled[i]));
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
  return persist("confirmed");
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
  if (isDirty() && !(await canReplace())) return false;
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
    $("#ocr-outcome").hidden = true;
    switchView("work");
    renderSource();
    renderForm();
    $("#receipt-form").scrollIntoView({ behavior: "smooth", block: "start" });
    return true;
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
      schema_version: "1.2",
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
  const editId = new URL(window.location.href).searchParams.get("record");
  if (editId) await loadRecord(editId);
} catch (e) {
  message(e.message, true);
}
window.addEventListener("beforeunload", (e) => {
  if (isDirty()) {
    e.preventDefault();
    e.returnValue = "";
  }
});

$$("[data-ocr-fixture]").forEach(
  (button) =>
    (button.onclick = async () => {
      if (busy) return;
      try {
        const response = await fetch(
          new URL(
            button.dataset.fixtureUrl || ("./test-assets/" + button.dataset.ocrFixture),
            import.meta.url,
          ),
        );
        if (!response.ok) throw Error("fixture_unavailable");
        const blob = await response.blob();
        await handleFile(
          new File([blob], button.dataset.ocrFixture, { type: button.dataset.ocrFixture.endsWith(".pdf") ? "application/pdf" : "image/png" }),
        );
      } catch {
        message(
          L(
            "Could not load the test image. Please retry.",
            "测试图片加载失败，请重试。",
          ),
          true,
        );
      }
    }),
);
