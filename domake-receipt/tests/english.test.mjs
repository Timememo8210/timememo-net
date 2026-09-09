import "fake-indexeddb/auto";
import { JSDOM } from "jsdom";
import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";
import * as storage from "../storage.js";
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const dom = new JSDOM(html, { url: "https://example.test/domake-receipt/" });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.confirm = () => true;
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.open = true;
  if (this.id === "discard-dialog")
    queueMicrotask(() =>
      document
        .getElementById(
          globalThis.confirm() ? "discard-replace" : "discard-keep",
        )
        .click(),
    );
};
dom.window.HTMLDialogElement.prototype.close = function () {
  this.open = false;
};
const $ = (s) => document.querySelector(s);
function input(id, value) {
  const el = document.getElementById(id);
  el.value = value;
  el.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
}
await import("../app.js");
function assertEnglishUI() {
  const clone = document.body.cloneNode(true);
  clone.querySelectorAll(".language-switch,script").forEach((n) => n.remove());
  assert.deepEqual(
    clone.textContent.match(/[^\n]{0,20}\p{Script=Han}[^\n]{0,20}/gu) || [],
    [],
  );
  for (const el of document.querySelectorAll("input,textarea,select"))
    for (const a of ["placeholder", "aria-label"])
      assert.doesNotMatch(el.getAttribute(a) || "", /\p{Script=Han}/u);
}
test("English is default, Domic branding and Chinese switch are present", () => {
  assert.equal(document.documentElement.lang, "en");
  assert.match(document.title, /Domic Home Passport/);
  assert.equal(
    $('.language-switch a[lang="zh-CN"]').getAttribute("href"),
    "zh.html",
  );
  assertEnglishUI();
});
test("dynamic sample review, evidence, confirmation and history are English", async () => {
  $("[data-sample=plumbing]").click();
  await new Promise((r) => setTimeout(r, 1200));
  assert.match($("#review-notice").textContent, /No AI was called/);
  assert.match(
    document.getElementById("service.summary").value,
    /Replace the kitchen/,
  );
  assertEnglishUI();
  input("service.date", "");
  assert.match($("#missing-note").textContent, /service date is unknown/);
  $("#receipt-form").dispatchEvent(
    new dom.window.Event("submit", { cancelable: true }),
  );
  assert.equal($("#confirm-dialog").open, true);
  assertEnglishUI();
  $("#confirm-check").checked = true;
  $("#confirm-check").dispatchEvent(new dom.window.Event("change"));
  await $("#confirm-save").onclick();
  await new Promise((r) => setTimeout(r, 10));
  assert.equal($("#history-view").hidden, false);
  assertEnglishUI();
});
test("validation and file errors are English; existing authored data is preserved", async () => {
  $("#tab-work").click();
  await $("#replace-file").onclick();
  await $("#file-input").onchange({
    target: { files: [new File(["x"], "photo.heic", { type: "image/heic" })] },
  });
  assert.match($("#message").textContent, /Unsupported format/);
  assertEnglishUI();
  const file = new File(["%PDF-1.4\n%%EOF"], "invoice.pdf", {
    type: "application/pdf",
  });
  await $("#file-input").onchange({ target: { files: [file] } });
  assert.match($("#review-notice").textContent, /not connected/);
  input("property.id", "我的房屋");
  input("service.summary", "服务项目 原文保留");
  await $("#save-draft").onclick();
  const r = (await storage.all()).find((r) => r.source.mode === "manual");
  assert.equal(r.property.id, "我的房屋");
  assert.equal(r.service.summary, "服务项目 原文保留");
  assert.match($("#history-list").textContent, /服务项目 原文保留/);
});
