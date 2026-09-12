import test from "node:test";
import assert from "node:assert/strict";
import Ajv from "ajv/dist/2020.js";
import { AI_EXTRACTION_SCHEMA, AI_EXTRACTION_PROMPT, normalizeAIExtraction, parseAIResponse } from "../ai-contract.js";
import { blankRecord, inspect } from "../core.js";

function proposal() {
  const { property, document, service, provider, amount, items, details, notes } = blankRecord();
  delete property.id; delete property.uid;
  return { status: "partial", relevance: "home_service", property, document, service, provider, amount, items, details, notes, evidence: [] };
}
function put(p, field, value, quote = String(value), page = 1) {
  const keys = field.split(".");
  const last = keys.pop();
  keys.reduce((part, key) => part[key], p)[last] = value;
  p.evidence.push({ field, quote, page });
  return p;
}
function complete() {
  const p = proposal(); p.status = "readable";
  for (const [field, value, quote] of [
    ["document.type", "invoice", "INVOICE"],
    ["document.issue_date", "2026-09-12", "Invoice date: 2026-09-12"],
    ["service.date", "2026-09-10", "Work completed on 2026-09-10"],
    ["service.summary", "Replace leaking kitchen mixer tap", "Work: Replace leaking kitchen mixer tap"],
    ["property.service_address", "22 Fictional Orchard Close, Exampleford, ZZ1 2BB", "Service address: 22 Fictional Orchard Close, Exampleford, ZZ1 2BB"],
    ["provider.organization_name", "Test Plumbing Ltd", "Company: Test Plumbing Ltd"],
    ["provider.person_name", "Toby Wren", "Attending worker: Toby Wren"],
    ["provider.address", "10 Company Square, Exampleford, ZZ3 4DD", "Company address: 10 Company Square, Exampleford, ZZ3 4DD"],
    ["amount.total", 264, "Total GBP 264.00"],
    ["amount.currency", "GBP", "Total GBP 264.00"],
  ]) put(p, field, value, quote);
  return p;
}

test("strict extraction schema accepts the intended shape and excludes application identities", () => {
  const validate = new Ajv({ strict: true }).compile(AI_EXTRACTION_SCHEMA);
  assert.equal(validate(proposal()), true, JSON.stringify(validate.errors));
  assert.equal(validate(complete()), true, JSON.stringify(validate.errors));
  for (const extra of [{ account: { id: "other-user" } }, { id: "overwrite-id" }, { source: {} }, { review: { status: "confirmed" } }]) {
    assert.equal(validate({ ...proposal(), ...extra }), false);
  }
  const bad = proposal(); bad.property.uid = "foreign-house";
  assert.equal(validate(bad), false);
});

test("a complete evidence-backed proposal separates worker/company and service/office addresses", () => {
  const r = normalizeAIExtraction(complete(), { model: "google/gemini-3.1-flash-lite", requestId: "request-test" });
  assert.equal(r.extraction.status, "review");
  assert.equal(r.extraction.model, "google/gemini-3.1-flash-lite");
  assert.equal(r.provider.name, "Test Plumbing Ltd");
  assert.equal(r.provider.person_name, "Toby Wren");
  assert.notEqual(r.provider.address, r.property.service_address);
  assert.equal(r.service.date, "2026-09-10");
  assert.equal(r.document.issue_date, "2026-09-12");
  assert.equal(r.review.status, "draft");
  assert.equal(r.source.mode, "cloud_ai");
  assert.deepEqual(inspect(r).errors, []);
});

test("unreadable/unrelated payloads cannot smuggle apparently usable extracted fields", () => {
  for (const [status, expected] of [["unreadable", "no_text"], ["unrelated", "unrelated"]]) {
    const r = normalizeAIExtraction({ ...complete(), status });
    assert.equal(r.extraction.status, expected);
    assert.equal(r.amount.total, null);
    assert.equal(r.provider.name, null);
    assert.deepEqual(r.evidence, []);
    assert.equal(r.review.status, "draft");
  }
  const r = normalizeAIExtraction({ ...complete(), relevance: "unrelated_service" });
  assert.equal(r.extraction.status, "unrelated");
  assert.equal(r.amount.total, null);
});

test("readable but incomplete records stay partial; uncertain relevance stays uncertain", () => {
  const p = proposal(); p.status = "readable";
  put(p, "document.issue_date", "2026-09-12");
  put(p, "service.summary", "Inspect boiler");
  const r = normalizeAIExtraction(p);
  assert.equal(r.extraction.status, "partial");
  assert.equal(r.service.date, null);
  assert.equal(r.amount.total, null);
  assert.equal(r.amount.currency, null);
  assert.equal(r.provider.person_name, null);
  assert.equal(normalizeAIExtraction({ ...complete(), relevance: "unknown" }).extraction.status, "uncertain");
  assert.equal(normalizeAIExtraction({ ...complete(), relevance: "invented" }).extraction.status, "uncertain");
});

test("invalid dates, numbers, currencies and enums are blanked without coercion", () => {
  const p = complete();
  p.service.date = "2026-02-30";
  p.document.issue_date = "12/09/2026";
  p.amount.total = "264.00";
  p.amount.currency = "$";
  put(p, "service.category", "__proto__");
  put(p, "service.change_type", "demolition");
  const r = normalizeAIExtraction(p);
  assert.equal(r.service.date, null);
  assert.equal(r.document.issue_date, null);
  assert.equal(r.amount.total, null);
  assert.equal(r.amount.currency, null);
  assert.equal(r.service.category, "unknown");
  assert.equal(r.service.change_type, "unknown");
  assert.equal(r.extraction.status, "partial");
  assert.deepEqual(inspect(r).errors, []);
  for (const invalid of [-1, Infinity, NaN, {}, [], true, Number.MAX_SAFE_INTEGER + 1]) {
    const bad = complete(); bad.amount.total = invalid;
    assert.equal(normalizeAIExtraction(bad).amount.total, null);
  }
});

test("unsupported facts and invalid evidence are not silently proposed", () => {
  const p = complete();
  p.evidence = p.evidence.filter((e) => e.field !== "provider.person_name");
  const amountQuote = p.evidence.find((e) => e.field === "amount.total"); amountQuote.page = 0;
  const addressQuote = p.evidence.find((e) => e.field === "property.service_address"); addressQuote.quote = "  ";
  const r = normalizeAIExtraction(p);
  assert.equal(r.provider.person_name, null);
  assert.equal(r.amount.total, null);
  assert.equal(r.property.service_address, null);
  assert.ok(r.review.warnings.some((s) => s.includes("supporting text")));
  assert.ok(r.evidence.every((e) => e.page >= 1 && e.quote.trim()));
});

test("an estimate cannot claim completed work, payment or an actual service date", () => {
  const p = complete();
  put(p, "document.type", "estimate", "ESTIMATE");
  put(p, "amount.payment_status", "paid", "PAID");
  put(p, "service.completion_status", "completed", "Completed");
  const r = normalizeAIExtraction(p);
  assert.equal(r.document.type, "estimate");
  assert.equal(r.amount.total, 264);
  assert.equal(r.service.date, null);
  assert.equal(r.amount.payment_status, "unknown");
  assert.equal(r.service.completion_status, "unknown");
  assert.ok(!r.evidence.some((e) => ["service.date", "amount.payment_status", "service.completion_status"].includes(e.field)));
  assert.deepEqual(inspect(r).errors, []);
});

test("line items preserve evidence page and remap indexes after unsupported items are removed", () => {
  const p = proposal();
  p.items = [{ description: "unsupported", amount: 999 }, { description: "Mixer tap", amount: 264 }, { description: null, amount: -4 }];
  p.evidence.push({ field: "items.1.description", page: 2, quote: "Mixer tap GBP 264" }, { field: "items.1.amount", page: 2, quote: "Mixer tap GBP 264" });
  const r = normalizeAIExtraction(p);
  assert.deepEqual(r.items, [{ description: "Mixer tap", amount: 264 }]);
  assert.deepEqual(r.evidence.map((e) => e.field), ["items.0.description", "items.0.amount"]);
  assert.ok(r.evidence.every((e) => e.page === 2));
});

test("unknown placeholders stay null and provider display name follows supported identity", () => {
  const p = proposal();
  put(p, "provider.person_name", "Elliot Vale", "Worker: Elliot Vale");
  put(p, "provider.organization_name", "Not provided");
  put(p, "provider.name", "Wrong Customer Name");
  const r = normalizeAIExtraction(p);
  assert.equal(r.provider.organization_name, null);
  assert.equal(r.provider.name, "Elliot Vale");
  assert.equal(r.evidence.find((e) => e.field === "provider.name").quote, "Worker: Elliot Vale");
});

test("model-supplied identity, source, confirmation and prototype keys never reach the record", () => {
  const payload = JSON.parse(JSON.stringify(complete()));
  Object.assign(payload, JSON.parse('{"id":"overwrite-id","account":{"id":"victim"},"review":{"status":"confirmed"},"created_at":"fake","source":{"sha256":"fake","mode":"demo"},"extraction":{"engine":"fake","model":"fake"},"__proto__":{"polluted":true}}'));
  payload.property.id = "victim house"; payload.property.uid = "victim-uid";
  payload.evidence.push({ field: "__proto__.polluted", page: 1, quote: "true" }, { field: "review.status", page: 1, quote: "confirmed" });
  const r = normalizeAIExtraction(payload, { model: "trusted-model" });
  assert.equal(r.id, undefined);
  assert.equal(r.account, null);
  assert.equal(r.property.id, null);
  assert.equal(r.property.uid, null);
  assert.equal(r.created_at, undefined);
  assert.equal(r.source.sha256, null);
  assert.equal(r.source.mode, "cloud_ai");
  assert.equal(r.review.status, "draft");
  assert.equal(r.extraction.model, "trusted-model");
  assert.equal({}.polluted, undefined);
});

test("normalization ignores inherited fields and does not mutate model response", () => {
  const p = complete();
  p.provider = Object.create({ organization_name: "Inherited company", person_name: "Inherited worker" });
  const r = normalizeAIExtraction(p);
  assert.equal(r.provider.name, null);
  const ordinary = complete(); const snapshot = structuredClone(ordinary);
  normalizeAIExtraction(ordinary);
  assert.deepEqual(ordinary, snapshot);
});

test("JSON/transport failures throw rather than being classified as unreadable images", () => {
  for (const value of ["", "truncated {", "[]", "null", '{"status":"success"}', 'prefix {"status":"unreadable"}', "x".repeat(128001)]) assert.throws(() => parseAIResponse(value), TypeError);
  assert.equal(parseAIResponse(JSON.stringify(complete())).extraction.status, "review");
  assert.equal(parseAIResponse("```json\n" + JSON.stringify(complete()) + "\n```").extraction.status, "review");
});

test("usage metadata is caller-owned, bounded and contains no arbitrary objects or secrets", () => {
  const r = normalizeAIExtraction(complete(), { usage: { prompt_tokens: 1500, completion_tokens: 500, total_tokens: 2000, reasoning_tokens: 120, cost: 0.001, key: "secret", reasoning: {}, invalid: Infinity } });
  assert.deepEqual(r.extraction.usage, { prompt_tokens: 1500, completion_tokens: 500, total_tokens: 2000, reasoning_tokens: 120, cost: 0.001 });
  assert.equal(normalizeAIExtraction(complete(), { usage: { prompt_tokens: -1, completion_tokens: "500", cost: NaN } }).extraction.usage, null);
  for (const invalid of [-1, 1.5, "120", Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(normalizeAIExtraction(complete(), { usage: { reasoning_tokens: invalid } }).extraction.usage, null);
  }
  assert.deepEqual(normalizeAIExtraction(complete(), { usage: { reasoning_tokens: 0 } }).extraction.usage, { reasoning_tokens: 0 });
});

test("prompt explicitly forbids document instructions and key domain substitutions", () => {
  for (const instruction of ["untrusted document content", "ACTUAL service date", "actual attending worker", "not the provider's office", "bare $", "EVERY non-null factual field", "never a confirmed record"]) assert.ok(AI_EXTRACTION_PROMPT.includes(instruction), instruction);
});
