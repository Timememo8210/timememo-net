import "fake-indexeddb/auto";
import { JSDOM } from "jsdom";
import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import * as storage from "../storage.js";
const html = await readFile(new URL("../zh.html", import.meta.url), "utf8");
const dom = new JSDOM(html, { url: "https://example.test/domake-receipt/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.confirm = () => true;
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
};
dom.window.HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
const $ = (s) => document.querySelector(s);
const input = (id, value) => {
  const el = document.getElementById(id);
  el.value = value;
  el.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
};
const sample = async (name) => {
  $(`[data-sample=${name}]`).click();
  await new Promise((r) => setTimeout(r, 1200));
};
await import("../app.js");
test("sample → edit → confirm → persist → reopen → clear unknown → update same record", async () => {
  await sample("plumbing");
  assert.match($("#review-notice").textContent, /未调用 AI/);
  input("amount.total", "0");
  $("#receipt-form").dispatchEvent(
    new dom.window.Event("submit", { cancelable: true }),
  );
  assert.equal($("#confirm-dialog").open, true);
  assert.equal($("#confirm-save").disabled, true);
  $("#confirm-check").checked = true;
  $("#confirm-check").dispatchEvent(new dom.window.Event("change"));
  await $("#confirm-save").onclick();
  let all = await storage.all();
  assert.equal(all.length, 1);
  assert.equal(all[0].amount.total, 0);
  assert.equal(all[0].review.status, "confirmed");
  assert.equal($("#history-view").hidden, false);
  await $("[data-open]").onclick();
  input("service.date", "");
  input("provider.name", "");
  await $("#save-draft").onclick();
  all = await storage.all();
  assert.equal(all.length, 1);
  assert.equal(all[0].service.date, null);
  assert.equal(all[0].provider.name, null);
  assert.equal(all[0].review.status, "draft");
  assert.equal(all[0].confirmed_at, null);
});
test("actual PDF produces empty manual fields and retains original; duplicate reopens same record", async () => {
  $("#tab-work").click();
  $("#replace-file").click();
  const file = new File(
    ["%PDF-1.4\n% Synthetic test\n%%EOF"],
    "synthetic.pdf",
    { type: "application/pdf" },
  );
  await $("#file-input").onchange({ target: { files: [file] } });
  assert.match($("#review-notice").textContent, /没有自动识别结果/);
  assert.equal(document.getElementById("amount.total").value, "");
  assert.equal(document.getElementById("provider.name").value, "");
  input("property.id", "测试房屋");
  input("service.summary", "手工记录");
  await $("#save-draft").onclick();
  let all = await storage.all();
  const manual = all.find((r) => r.source.mode === "manual");
  assert.ok(manual);
  assert.equal(manual.amount.total, null);
  assert.equal(await (await storage.file(manual.id)).text(), await file.text());
  $("#tab-work").click();
  $("#replace-file").click();
  await $("#file-input").onchange({ target: { files: [file] } });
  assert.match($("#message").textContent, /已存在/);
  assert.equal((await storage.all()).length, 2);
  assert.equal(document.getElementById("property.id").value, "测试房屋");
});
test("quote verification prevents impossible paid and completed assertions", async () => {
  $("#replace-file").click();
  await sample("roof");
  input("service.completion_status", "completed");
  $("#receipt-form").dispatchEvent(
    new dom.window.Event("submit", { cancelable: true }),
  );
  assert.equal($("#confirm-dialog").open, false);
  assert.match($("#message").textContent, /已完工/);
  input("service.completion_status", "planned");
  await $("#save-draft").onclick();
  assert.equal(
    (await storage.all()).find((r) => r.document.type === "estimate").service
      .completion_status,
    "planned",
  );
});
test("unsaved edits are protected even while history tab is open", async () => {
  $("#tab-work").click();
  input("service.summary", "unsaved edit");
  $("#tab-history").click();
  const event = new dom.window.Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  globalThis.confirm = () => false;
  await $("[data-open]").onclick();
  assert.equal(
    document.getElementById("service.summary").value,
    "unsaved edit",
  );
  globalThis.confirm = () => true;
});
test("save pending blocks changing files and opening another record", async () => {
  $("#tab-work").click();
  const summary = document.getElementById("service.summary").value;
  const promise = $("#save-draft").onclick();
  $("#replace-file").click();
  assert.match($("#message").textContent, /请稍候/);
  assert.equal(document.getElementById("service.summary").value, summary);
  await $("[data-open]").onclick();
  assert.equal(document.getElementById("service.summary").value, summary);
  await promise;
  assert.equal($("#history-view").hidden, false);
});
test("cancel and file errors leave recoverable upload screen", async () => {
  $("#tab-work").click();
  $("#replace-file").click();
  $("[data-sample=hvac]").click();
  $("#cancel-process").click();
  assert.equal($("#upload-view").hidden, false);
  await new Promise((r) => setTimeout(r, 1200));
  assert.equal($("#receipt-form").hidden, true);
  await $("#file-input").onchange({
    target: { files: [new File(["x"], "bad.heic", { type: "image/heic" })] },
  });
  assert.match($("#message").textContent, /不支持/);
  assert.equal($("#upload-view").hidden, false);
});
test("failed save preserves edits, reports no success and offers JSON backup", async () => {
  $("#tab-history").click();
  await $("[data-open]").onclick();
  input("service.summary", "must survive failed save");
  const database = await storage.db();
  const originalTransaction = database.transaction;
  database.transaction = function (...args) {
    const tx = originalTransaction.apply(this, args);
    if (args[1] === "readwrite") queueMicrotask(() => tx.abort());
    return tx;
  };
  try {
    await $("#save-draft").onclick();
    assert.equal(
      document.getElementById("service.summary").value,
      "must survive failed save",
    );
    assert.match($("#message").textContent, /保存失败/);
    assert.ok($("#emergency-export"));
    assert.equal(
      (await storage.all()).some(
        (r) => r.service.summary === "must survive failed save",
      ),
      false,
    );
  } finally {
    database.transaction = originalTransaction;
  }
});
test("explicit confirmation deletes the record", async () => {
  $("#tab-history").click();
  const n = (await storage.all()).length;
  $("[data-delete]").click();
  assert.equal($("#delete-dialog").open, true);
  assert.equal((await storage.all()).length, n);
  await $("#confirm-delete").onclick();
  assert.equal((await storage.all()).length, n - 1);
  assert.equal($("#delete-dialog").open, false);
});
