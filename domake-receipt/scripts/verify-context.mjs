// Standalone read-only verification of the live site modules. No site files are changed.
// Run: node scripts/verify-context.mjs
// OCR transport is a deterministic module-boundary fake; app/extraction/core/storage are real.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire, registerHooks } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";

const site = fileURLToPath(new URL("../", import.meta.url));
const req = createRequire(pathToFileURL(site + "package.json"));
const dependency = (name) => import(pathToFileURL(req.resolve(name)).href);
await dependency("fake-indexeddb/auto");
const { JSDOM } = await dependency("jsdom");
const { default: Ajv } = await dependency("ajv/dist/2020.js");
const { default: addFormats } = await dependency("ajv-formats");
const dom = new JSDOM(await readFile(site + "index.html", "utf8"), {
  url: "https://example.test/domake-receipt/",
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.confirm = () => true;
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
  if (this.id === "discard-dialog")
    queueMicrotask(() => document.getElementById("discard-replace").click());
};
dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };
const $ = (selector) => document.querySelector(selector);
const input = (id, value) => {
  const element = document.getElementById(id);
  assert.ok(element, "Missing form control " + id);
  element.value = value;
  element.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
};
const select = (id, value) => {
  document.getElementById(id).value = value;
  document.getElementById(id).dispatchEvent(new dom.window.Event("change", { bubbles: true }));
};
const core = await import(pathToFileURL(site + "core.js").href);
const storage = await import(pathToFileURL(site + "storage.js").href);
const context = await import(pathToFileURL(site + "workspace-context.js").href);
const { extractText } = await import(pathToFileURL(site + "extraction.js").href);
const ajv = new Ajv({ strict: false });
addFormats(ajv);
const validate = ajv.compile(JSON.parse(await readFile(site + "docs/receipt.schema.json", "utf8")));
const assertSchema = (record) => assert.ok(validate(record), JSON.stringify(validate.errors));
const results = [];
async function check(name, fn) {
  try { await fn(); results.push({ name, status: "PASS" }); }
  catch (error) { results.push({ name, status: "FAIL", error: error.message }); }
  console.log(results.at(-1).status + " " + name + (results.at(-1).error ? "\n  " + results.at(-1).error : ""));
}
const dated = (record, id) => Object.assign(record, {
  id, created_at: "2026-09-10T12:00:00.000Z", updated_at: "2026-09-10T12:01:00.000Z",
});
function linked(id, userId, propertyUid) {
  const record = context.applyContext(core.blankRecord(), context.contextFor(userId, propertyUid));
  record.service.summary = "Repair kitchen faucet";
  return dated(record, id);
}

await check("schema 1.2 normalizes legacy account and property UID to null without inventing identity", () => {
  const legacy = core.blankRecord();
  legacy.schema_version = "1.0";
  delete legacy.account;
  delete legacy.property.uid;
  delete legacy.extraction;
  delete legacy.service.change_type;
  legacy.provider = { name: "Legacy Contractor", phone: null, address: null };
  const before = structuredClone(legacy);
  const normalized = core.normalizeRecord(legacy);
  assert.equal(core.SCHEMA_VERSION, "1.2");
  assert.equal(normalized.schema_version, "1.2");
  assert.equal(normalized.account, null);
  assert.equal(normalized.property.uid, null);
  assert.equal(normalized.provider.name, "Legacy Contractor");
  assert.equal(normalized.provider.organization_name, null);
  assert.equal(normalized.provider.person_name, null);
  assert.deepEqual(legacy, before);
  assertSchema(normalized);
});

await check("confirmed record re-edit retains account, UID, source, evidence, creation time, ID and exact original bytes", async () => {
  const originalBytes = Uint8Array.from([37, 80, 68, 70, 45, 49, 46, 55, 10, 0, 255, 13, 10, 194, 169]);
  const original = new Blob([originalBytes], { type: "application/pdf" });
  const record = linked("direct-preserve", "demo-james", "demo-bristol-14");
  record.source = { name: "preserve.pdf", mime_type: "application/pdf", sha256: "a".repeat(64), mode: "manual" };
  record.evidence = [{ field: "service.summary", page: 1, quote: "Repair kitchen faucet" }];
  record.notes = "Keep this exact note.";
  record.extraction = { engine: "fixture", status: "review", text: "raw receipt", locale: "en-GB" };
  await storage.save(core.transition(record, "confirmed"), original);
  const loaded = (await storage.all()).find((item) => item.id === record.id);
  loaded.service.summary = "Repair kitchen faucet and replace seal";
  loaded.updated_at = "2026-09-10T13:00:00.000Z";
  const updated = core.transition(loaded, "confirmed");
  await storage.save(updated, null);
  const saved = (await storage.all()).find((item) => item.id === record.id);
  assert.equal((await storage.all()).length, 1);
  for (const key of ["account", "source", "evidence", "extraction", "created_at", "id", "notes"])
    assert.deepEqual(saved[key], record[key], key + " must survive editing");
  assert.equal(saved.property.uid, "demo-bristol-14");
  assert.equal(saved.review.status, "confirmed");
  assert.equal(saved.service.summary, "Repair kitchen faucet and replace seal");
  assert.deepEqual(new Uint8Array(await (await storage.file(record.id)).arrayBuffer()), originalBytes);
  assertSchema(core.exportRecordData(saved));
});

await check("explicit same-property UID unites homeowner and Pro uploads", () => {
  const owner = linked("owner-receipt", "demo-alice", "demo-bristol-14");
  const pro = linked("pro-receipt", "demo-james", "demo-bristol-14");
  assert.notEqual(owner.account.id, pro.account.id);
  assert.equal(context.propertyKey(owner), context.propertyKey(pro));
  assertSchema(owner); assertSchema(pro);
});

await check("different property UIDs with identical names and addresses never auto-merge", () => {
  const a = linked("different-a", "demo-alice", "demo-bristol-14");
  const b = linked("different-b", "demo-alice", "demo-bath-22");
  a.property.id = b.property.id = "Home";
  a.property.service_address = b.property.service_address = "Shared address";
  assert.notEqual(context.propertyKey(a), context.propertyKey(b));
  a.property.uid = b.property.uid = null;
  assert.notEqual(context.propertyKey(a), context.propertyKey(b));
});

await check("applying explicit context never overwrites service-address evidence or global identity catalog", () => {
  const originalUser = structuredClone(context.users[1]);
  const record = core.blankRecord();
  record.property.service_address = "Address stated in original receipt";
  context.applyContext(record, context.contextFor("demo-alice", "demo-bristol-14"));
  assert.equal(record.property.service_address, "Address stated in original receipt");
  record.account.display_name = "Edited snapshot";
  assert.deepEqual(context.users[1], originalUser);
});

await check("CSV cells quote commas/newlines/quotes and neutralize leading formula markers", () => {
  for (const value of ["=1+1", "+SUM(A1:A2)", "@SUM(1)", "-2+3", " \t=HYPERLINK(\"https://example.test\")", "\r\n+1", "\uFEFF=1"])
    assert.ok(context.csvCell(value).startsWith('"\''), JSON.stringify(value));
  assert.equal(context.csvCell('a,"b"\nc'), '"a,""b""\nc"');
  assert.equal(context.csvCell(null), '""');
  assert.equal(context.csvCell(0), '"0"');
  assert.equal(context.csvCell("Normal text"), '"Normal text"');
});

// The real app consumes predictable reader responses to exercise its asynchronous reset paths.
globalThis.__contextOCRQueue = [];
const ocrUrl = pathToFileURL(site + "ocr.js").href;
const hook = registerHooks({
  load(url, hookContext, nextLoad) {
    if (url === ocrUrl) return {
      format: "module", shortCircuit: true,
      source: `export function startOCR() {
        const value = globalThis.__contextOCRQueue.shift();
        if (value === undefined) throw new Error("OCR fixture queue is empty");
        return { promise: value instanceof Error ? Promise.reject(value) : Promise.resolve(value), cancel() {} };
      }`,
    };
    return nextLoad(url, hookContext);
  },
});
await import(pathToFileURL(site + "app.js").href);
const receiptText = `SERVICE RECEIPT\nCompany: Cedar Home Services\nTechnician: Omar Hassan\nCustomer: Lina Patel\nService date: 2026-09-01\nIssue date: 2026-09-02\nService address: 14 Example Mews, Bristol, BS1 2AB\nWork: Replace kitchen faucet\nTotal: GBP 420.00\nPayment status: Paid\nStatus: Completed`;
const goodOCR = () => ({ text: receiptText, confidence: 96 });
const png = (name) => new File([Uint8Array.from([137,80,78,71,13,10,26,10]), name], name, { type: "image/png" });
async function newDocument(user, property) {
  $("#tab-work").click();
  await $("#replace-file").onclick();
  select("demo-user", user); select("demo-property", property);
}
async function upload(file, ocrResult) {
  if (ocrResult !== undefined) globalThis.__contextOCRQueue.push(ocrResult);
  $("#local-ocr-enabled").checked = true;
  await $("#file-input").onchange({ target: { files: [file] } });
}
async function confirmCurrent() {
  $("#receipt-form").dispatchEvent(new dom.window.Event("submit", { cancelable: true }));
  assert.equal($("#confirm-dialog").open, true, "Confirmation must open");
  $("#confirm-check").checked = true;
  $("#confirm-check").dispatchEvent(new dom.window.Event("change"));
  await $("#confirm-save").onclick();
}
const savedByName = async (name) => {
  const result = (await storage.all()).find((record) => record.source.name === name);
  assert.ok(result, "Saved record missing: " + name);
  assertSchema(result);
  return result;
};
function assertIdentity(record, user, uid) {
  assert.equal(record.account.id, user);
  assert.equal(record.property.uid, uid);
}

await check("real DOM OCR replacement and confirmed re-edit preserve original upload identity, property UID and bytes", async () => {
  assert.equal(extractText(receiptText, 96, { locale: "en-GB" }).extraction.status, "review");
  await newDocument("demo-james", "demo-bristol-14");
  const file = png("dom-ocr-preserve.png");
  await upload(file, goodOCR());
  assert.equal($("#ocr-outcome").dataset.status, "review");
  assert.equal($("#review-property").value, "demo-bristol-14");
  await confirmCurrent();
  const first = await savedByName(file.name);
  assertIdentity(first, "demo-james", "demo-bristol-14");
  assert.equal(first.source.mode, "local_ocr");
  const identitySnapshot = structuredClone(first.account);
  await $(`[data-open="${first.id}"]`).onclick();
  select("demo-user", "demo-ben"); select("demo-property", "demo-york-8");
  input("service.summary", "Replace kitchen faucet and inspect connection");
  await confirmCurrent();
  const edited = await savedByName(file.name);
  assertIdentity(edited, "demo-james", "demo-bristol-14");
  assert.deepEqual(edited.account, identitySnapshot);
  assert.equal(edited.id, first.id);
  assert.equal(edited.created_at, first.created_at);
  assert.deepEqual(edited.extraction, first.extraction);
  assert.deepEqual(edited.evidence, first.evidence);
  assert.deepEqual(new Uint8Array(await (await storage.file(edited.id)).arrayBuffer()), new Uint8Array(await file.arrayBuffer()));
});

await check("real DOM manual PDF intake preserves selected identity and UID through confirm/save", async () => {
  await newDocument("demo-alice", "demo-bath-22");
  const file = new File(["%PDF-1.7\n% local fixture, exact bytes\n%%EOF"], "dom-manual.pdf", { type: "application/pdf" });
  await upload(file);
  input("service.summary", "Manual roof inspection");
  await confirmCurrent();
  const saved = await savedByName(file.name);
  assertIdentity(saved, "demo-alice", "demo-bath-22");
  assert.equal(saved.source.mode, "manual");
  assert.equal(await (await storage.file(saved.id)).text(), await file.text());
});

await check("real DOM no-text OCR to manual reset preserves selected identity and UID", async () => {
  await newDocument("demo-ben", "demo-york-8");
  const file = png("dom-no-text.png");
  await upload(file, { text: "", confidence: 0 });
  assert.equal($("#ocr-outcome").dataset.status, "no_text");
  $("#outcome-manual").click();
  input("service.summary", "User entered repair details after unreadable photo");
  await confirmCurrent();
  const saved = await savedByName(file.name);
  assertIdentity(saved, "demo-ben", "demo-york-8");
  assert.equal(saved.extraction.status, "no_text");
  assert.equal(saved.source.mode, "manual");
});

await check("real DOM OCR failure -> retry uses original upload identity and linked home despite changed new-upload selectors", async () => {
  await newDocument("demo-james", "demo-bristol-14");
  const file = png("dom-retry.png");
  await upload(file, new Error("engine_failed"));
  assert.equal($("#ocr-outcome").dataset.status, "failed");
  select("demo-user", "demo-ben"); select("demo-property", "demo-york-8");
  globalThis.__contextOCRQueue.push(goodOCR());
  await $("#outcome-retry").onclick();
  assert.equal($("#ocr-outcome").dataset.status, "review");
  await confirmCurrent();
  const saved = await savedByName(file.name);
  assertIdentity(saved, "demo-james", "demo-bristol-14");
  assert.deepEqual(new Uint8Array(await (await storage.file(saved.id)).arrayBuffer()), new Uint8Array(await file.arrayBuffer()));
});

await check("manual property rename clears both stored UID and the visible property selector", async () => {
  const record = await savedByName("dom-retry.png");
  await $(`[data-open="${record.id}"]`).onclick();
  assert.equal($("#review-property").value, "demo-bristol-14");
  input("property.id", "A genuinely different house");
  const displayedSelection = $("#review-property").value;
  await $("#save-draft").onclick();
  const saved = await savedByName("dom-retry.png");
  assert.equal(saved.property.uid, null);
  assert.equal(displayedSelection, "", "UI must stop claiming the previous house is linked when UID has been cleared");
  assert.ok(saved.review.edited_fields.includes("property.uid"), "Link change must be in edited_fields");
});

hook.deregister();
dom.window.close();
const failed = results.filter((result) => result.status === "FAIL");
console.log(JSON.stringify({ checked: results.length, passed: results.length - failed.length, failed: failed.length, results }, null, 2));
process.exit(failed.length ? 1 : 0);
