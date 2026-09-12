import test from "node:test";
import assert from "node:assert/strict";
import { createAIClient } from "../ai-client.js";

const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });
const fixture = new File(["%PDF-1.4\n%%EOF"], "fictional-repair.pdf", { type: "application/pdf" });
const memory = () => {
  const data = new Map();
  return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
};
test("health probe sends no credentials; unlock is required before uploading", async () => {
  const calls = [];
  const client = createAIClient({ endpoint: "https://ai.example.test/", fetchImpl: async (...args) => { calls.push(args); return response({ configured: true }); } });
  await client.health();
  assert.equal(calls[0][0], "https://ai.example.test/api/health");
  assert.deepEqual(calls[0][1].headers, {});
  await assert.rejects(client.extract(fixture), { code: "access_required" });
  assert.equal(calls.length, 1);
});
test("pilot code persists only in supplied session storage; upload uses multipart and no model override", async () => {
  const store = memory(), calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return response(url.endsWith("session") ? { configured: true } : { extraction: { status: "partial" }, model: "google/test-model" });
  };
  const client = createAIClient({ endpoint: "https://ai.example.test", sessionStore: store, fetchImpl });
  await client.unlock(" test-pilot-code ");
  const result = await client.extract(fixture, { locale: "en-GB" });
  assert.equal(client.hasAccess, true);
  assert.equal(result.model, "google/test-model");
  assert.equal(calls[0].options.method, "POST");
  assert.deepEqual(calls[1].options.headers, { Authorization: "Bearer test-pilot-code" });
  assert.equal(calls[1].options.body.get("file").name, fixture.name);
  assert.equal(calls[1].options.body.get("locale"), "en-GB");
  assert.equal(calls[1].options.body.has("model"), false);
  assert.equal(calls[1].options.credentials, "omit");
  const restored = createAIClient({ endpoint: "https://ai.example.test", sessionStore: store, fetchImpl });
  assert.equal(restored.hasAccess, true);
  restored.clearAccess();
  assert.equal(createAIClient({ endpoint: "https://ai.example.test", sessionStore: store, fetchImpl }).hasAccess, false);
});
test("rejected access code and API keys are never persisted", async () => {
  let requests = 0;
  const client = createAIClient({ endpoint: "https://ai.example.test", sessionStore: memory(), fetchImpl: async () => { requests++; return response({ error: { code: "unauthorized" } }, 401); } });
  await assert.rejects(client.unlock("sk-or-v1-fictional"), { code: "api_key_not_allowed" });
  assert.equal(requests, 0);
  await assert.rejects(client.unlock("wrong-code"), { code: "unauthorized" });
  assert.equal(client.hasAccess, false);
});
test("missing endpoint never makes a network call", async () => {
  const client = createAIClient({ endpoint: "", fetchImpl: () => { throw Error("must not send"); } });
  await assert.rejects(client.health(), { code: "not_configured" });
});
for (const [status, code] of [[402, "insufficient_credits"], [429, "rate_limited"], [502, "invalid_response"], [503, "not_configured"], [504, "timeout"], [413, "file_too_large"]]) {
  test(`server error ${status}/${code} remains an error and never becomes empty extraction`, async () => {
    const client = createAIClient({ endpoint: "https://ai.example.test", fetchImpl: async url => url.endsWith("session") ? response({ configured: true }) : response({ error: { code } }, status) });
    await client.unlock("pilot-test");
    await assert.rejects(client.extract(fixture), { code, status });
  });
}
test("non-JSON and missing extraction are rejected", async () => {
  for (const invalid of [null, { model: "test" }, { extraction: {}, model: "" }, "NOT JSON"]) {
    const client = createAIClient({ endpoint: "https://ai.example.test", fetchImpl: async url => url.endsWith("session") ? response({ configured: true }) : invalid === "NOT JSON" ? new Response(invalid) : response(invalid) });
    await client.unlock("pilot-test");
    await assert.rejects(client.extract(fixture), { code: "malformed_output" });
  }
});
test("timeout aborts the request; user cancellation stays distinguishable", async () => {
  const neverFinish = async (url, { signal }) => {
    if (url.endsWith("session")) return response({ configured: true });
    return new Promise((resolve, reject) => signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true }));
  };
  const client = createAIClient({ endpoint: "https://ai.example.test", timeoutMs: 10, fetchImpl: neverFinish });
  await client.unlock("pilot-test");
  await assert.rejects(client.extract(fixture), { code: "timeout" });
  const controller = new AbortController();
  const pending = client.extract(fixture, { signal: controller.signal });
  controller.abort();
  await assert.rejects(pending, { code: "cancelled" });
});

test("controlled AI browser flow: access error, malformed response, partial review, edit/confirm/save and same-record correction", async () => {
  await import("fake-indexeddb/auto");
  const { JSDOM } = await import("jsdom");
  const { readFile } = await import("node:fs/promises");
  const page = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const dom = new JSDOM(page, { url: "https://example.test/domake-receipt/" });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  dom.window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
    if (this.id === "discard-dialog") queueMicrotask(() => document.querySelector("#discard-replace").click());
  };
  dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };
  const $ = selector => document.querySelector(selector);
  const input = (path, value) => {
    const el = document.getElementById(path);
    el.value = value;
    el.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  };
  const storage = await import("../storage.js");
  const { blankRecord } = await import("../core.js");
  const { property, document: invoice, service, provider, amount, items, details, notes } = blankRecord();
  delete property.id; delete property.uid;
  const proposal = { status: "partial", relevance: "home_service", property, document: invoice, service, provider, amount, items, details, notes, evidence: [] };
  proposal.service.summary = "Repair a fictional kitchen tap";
  proposal.evidence.push({ field: "service.summary", quote: "Repair a fictional kitchen tap", page: 1 });
  let extractionResult = response({ error: { code: "invalid_response" } }, 502);
  const originalFetch = globalThis.fetch;
  let extractionCalls = 0;
  globalThis.fetch = async url => {
    if (url.endsWith("health") || url.endsWith("session")) return response({ configured: true, default_model: "google/test-model" });
    extractionCalls++;
    return extractionResult.clone();
  };
  try {
    // Only configuration is replaced for this controlled transport test; the production
    // client, app, normalizer and storage implementation all run unchanged.
    let source = await readFile(new URL("../app.js", import.meta.url), "utf8");
    source = source.replace(/import \{ AI_ENDPOINT, AI_TIMEOUT_MS, AI_MAX_FILE_BYTES \} from "\.\/ai-config\.js(?:\?[^"\s]*)?";/, 'const AI_ENDPOINT = "https://ai.example.test"; const AI_TIMEOUT_MS = 45000; const AI_MAX_FILE_BYTES = 6 * 1024 * 1024;');
    source = source.replace(/from "\.\/([^\"]+)"/g, (_, path) => `from ${JSON.stringify(new URL("../" + path, import.meta.url).href)}`);
    await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
    assert.equal($("#reading-mode").value, "cloud");
    assert.match($("#reader-privacy").textContent, /cloud AI provider/);
    $("#demo-property").selectedIndex = 1;
    const selectedProperty = $("#demo-property").value;
    const selectedUser = $("#demo-user").value;
    await $("#file-input").onchange({ target: { files: [fixture] } });
    assert.match($("#outcome-title").textContent, /access code required/);
    assert.equal(extractionCalls, 0);
    assert.equal((await storage.all()).length, 0);
    input("ai-access-code", "pilot-test");
    await $("#ai-access-form").onsubmit({ preventDefault() {} });
    assert.equal($("#ai-access-code").value, "");
    await $("#outcome-retry").onclick();
    assert.match($("#outcome-title").textContent, /unusable result/);
    assert.equal($("#receipt-form").hidden, true);
    assert.equal((await storage.all()).length, 0);
    extractionResult = response({ extraction: proposal, model: "google/test-model", request_id: "controlled-request" });
    await $("#outcome-retry").onclick();
    assert.equal($("#extraction-dialog").open, true);
    assert.match($("#extraction-title").textContent, /Some details/);
    assert.equal($("#confirm-dialog").open, false);
    assert.equal((await storage.all()).length, 0);
    $("[data-close='extraction-dialog']").click();
    assert.equal(document.getElementById("service.date").value, "");
    assert.equal(document.getElementById("amount.total").value, "");
    input("amount.total", "185");
    input("amount.currency", "GBP");
    $("#receipt-form").dispatchEvent(new dom.window.Event("submit", { cancelable: true }));
    assert.equal($("#confirm-dialog").open, true);
    assert.equal($("#confirm-save").disabled, true);
    $("#confirm-check").checked = true;
    $("#confirm-check").dispatchEvent(new dom.window.Event("change"));
    await $("#confirm-save").onclick();
    let saved = await storage.all();
    assert.equal(saved.length, 1);
    assert.equal(saved[0].source.mode, "cloud_ai");
    assert.equal(saved[0].source.name, fixture.name);
    assert.match(saved[0].source.sha256, /^[a-f0-9]{64}$/);
    assert.equal(saved[0].property.uid, selectedProperty);
    assert.equal(saved[0].account.id, selectedUser);
    assert.equal(saved[0].extraction.model, "google/test-model");
    assert.doesNotMatch(JSON.stringify(saved), /pilot-test/);
    assert.equal(saved[0].service.date, null);
    const savedId = saved[0].id;
    await $("[data-open]").onclick();
    input("amount.total", "190");
    $("#receipt-form").dispatchEvent(new dom.window.Event("submit", { cancelable: true }));
    assert.equal($("#confirm-save").disabled, true);
    $("#confirm-check").checked = true;
    $("#confirm-check").dispatchEvent(new dom.window.Event("change"));
    await $("#confirm-save").onclick();
    saved = await storage.all();
    assert.equal(saved.length, 1);
    assert.equal(saved[0].id, savedId);
    assert.equal(saved[0].amount.total, 190);
    assert.equal(await (await storage.file(savedId)).text(), await fixture.text());
    await $("[data-open]").onclick();
    await $("#reread-original").onclick();
    assert.equal($("#extraction-dialog").open, true);
    assert.equal((await storage.all())[0].amount.total, 190, "re-reading never overwrites the saved record automatically");
    $("[data-close='extraction-dialog']").click();
    assert.equal(document.getElementById("amount.total").value, "");
    input("amount.total", "200");
    input("amount.currency", "GBP");
    $("#receipt-form").dispatchEvent(new dom.window.Event("submit", { cancelable: true }));
    assert.equal($("#confirm-save").disabled, true);
    $("#confirm-check").checked = true;
    $("#confirm-check").dispatchEvent(new dom.window.Event("change"));
    await $("#confirm-save").onclick();
    saved = await storage.all();
    assert.equal(saved.length, 1);
    assert.equal(saved[0].id, savedId, "AI re-reading updates the same record after confirmation");
    assert.equal(saved[0].amount.total, 200);
    assert.equal(await (await storage.file(savedId)).text(), await fixture.text());
    await storage.remove(savedId);
  } finally {
    if ($("#replace-file")?.onclick) await $("#replace-file").onclick();
    globalThis.fetch = originalFetch;
    dom.window.close();
  }
});
