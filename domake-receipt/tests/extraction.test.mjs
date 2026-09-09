import test from "node:test";
import assert from "node:assert/strict";
import { extractText } from "../extraction.js";
import { startOCR } from "../ocr.js";
import {
  normalizeRecord,
  blankRecord,
  transition,
  exportRecordData,
} from "../core.js";
import { readFile } from "node:fs/promises";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
const base = `SERVICE RECEIPT\nCompany: Cedar Home Services\nTechnician: Omar Hassan\nCustomer: Lina Patel\nService date: 2026-09-01\nIssue date: 2026-09-02\nService address: Villa 18, Example Lane, Dubai\nWork: Replace kitchen faucet\nTotal: AED 420.00\nPayment status: Paid\nStatus: Completed`;
test("company, actual worker and work changes are separate evidence-backed fields", () => {
  const r = extractText(base, 96);
  assert.equal(r.extraction.status, "review");
  assert.equal(r.provider.organization_name, "Cedar Home Services");
  assert.equal(r.provider.person_name, "Omar Hassan");
  assert.equal(r.service.change_type, "replacement");
  assert.equal(r.service.date, "2026-09-01");
  assert.equal(r.document.issue_date, "2026-09-02");
  assert.equal(r.review.status, "draft");
  assert.equal(r.id, undefined);
  assert.ok(
    r.evidence
      .find((e) => e.field === "provider.person_name")
      .quote.includes("Technician"),
  );
});
test("customer, preparer and signatures cannot supply a missing worker", () => {
  const r = extractText(
    base.replace(
      "Technician: Omar Hassan",
      "Prepared by: Ahmed Khalid\nSigned by: Noor Ali",
    ),
    90,
  );
  assert.equal(r.provider.person_name, null);
});
test("contractor organisation is not treated as an individual; ambiguous contractor remains display name", () => {
  const r = extractText(
    "RECEIPT\nContractor: Cedar Plumbing LLC\nWork: Repair kitchen faucet",
    90,
  );
  assert.equal(r.provider.organization_name, "Cedar Plumbing LLC");
  assert.equal(r.provider.person_name, null);
  const ambiguous = extractText(
    "RECEIPT\nContractor: Bright Spark\nWork: Repair kitchen faucet",
    90,
  );
  assert.equal(ambiguous.provider.name, "Bright Spark");
  assert.equal(ambiguous.provider.person_name, null);
});
test("independent worker and wrapped labels retain evidence without inventing a company", () => {
  const r = extractText(
    "Independent property repair\nRECEIPT # SA-02\nContractor: Samir Ali\nWork:\nRepair bedroom door lock\nService address:\nVilla 7, Palm Court, Dubai",
    95,
  );
  assert.equal(r.provider.person_name, "Samir Ali");
  assert.equal(r.provider.organization_name, null);
  assert.equal(r.property.service_address, "Villa 7, Palm Court, Dubai");
  assert.equal(r.document.number, "SA-02");
});
test("partial output retains facts, never fills date, amount, currency or person", () => {
  const r = extractText(
    "RECEIPT\nCompany: Blue Palm Electrical\nCustomer: Farah Rahman\nWork: Repair living room light switch\nService address: Apt 24, Dubai",
    91,
  );
  assert.equal(r.extraction.status, "partial");
  assert.equal(r.service.date, null);
  assert.equal(r.amount.total, null);
  assert.equal(r.amount.currency, null);
  assert.equal(r.provider.person_name, null);
});
test("no-text/low confidence and unrelated service have different outcomes, neither confirms", () => {
  assert.equal(extractText("", 0).extraction.status, "no_text");
  const noise = extractText(base, 20);
  assert.equal(noise.extraction.status, "no_text");
  assert.equal(noise.provider.name, null);
  const restaurant = extractText(
    "RESTAURANT RECEIPT\nRestaurant: Example Cafe\nTotal: AED 124.00",
    94,
  );
  assert.equal(restaurant.extraction.status, "unrelated");
  assert.equal(restaurant.extraction.readability, "readable");
  assert.equal(
    extractText("INVOICE\nConsulting: Example work\nTotal: AED 90.00", 94)
      .extraction.status,
    "uncertain",
  );
});
test("balance due, ambiguous dates, dollar signs and quotes cannot invent financial facts", () => {
  const r = extractText(
    base
      .replace("Total: AED 420.00", "Amount due: AED 20.00")
      .replace("2026-09-01", "01/09/2026"),
    90,
  );
  assert.equal(r.amount.total, null);
  assert.equal(r.service.date, null);
  assert.equal(
    extractText(base.replace("Total: AED 420.00", "Total: USD 420.00 AED"), 90)
      .amount.total,
    null,
  );
  assert.equal(
    extractText(
      base.replace("Technician: Omar Hassan", "Technician: Not stated"),
      90,
    ).provider.person_name,
    null,
  );
  const total = extractText(
    base + "\nGrand total: AED 440.00\nAmount due: AED 10.00",
    90,
  );
  assert.equal(total.amount.total, 440);
  const quote = extractText(base.replace("SERVICE RECEIPT", "ESTIMATE"), 90);
  assert.equal(quote.amount.payment_status, "unknown");
  assert.equal(quote.service.completion_status, "planned");
});
test("schema 1.1 export and migration preserve old provider display name without guessing its identity", async () => {
  const old = blankRecord();
  old.schema_version = "1.0";
  old.provider = { name: "Legacy Name", phone: null, address: null };
  delete old.service.change_type;
  delete old.extraction;
  const migrated = normalizeRecord(old);
  assert.equal(migrated.provider.name, "Legacy Name");
  assert.equal(migrated.provider.organization_name, null);
  assert.equal(migrated.provider.person_name, null);
  const ajv = new Ajv({ strict: false });
  addFormats(ajv);
  const validate = ajv.compile(
    JSON.parse(
      await readFile(new URL("../docs/receipt.schema.json", import.meta.url)),
    ),
  );
  const r = extractText(base, 90);
  r.property.id = "QA Villa";
  assert.ok(
    validate(exportRecordData(transition(r, "confirmed"))),
    JSON.stringify(validate.errors),
  );
  assert.ok(validate(migrated));
});
test("reader rejects a corrupt decodable-header image without returning a successful empty result", async () => {
  globalThis.createImageBitmap = async () => {
    throw Error("decode_failed");
  };
  await assert.rejects(startOCR(new Blob(["broken"])).promise, /decode_failed/);
});
test("reader deadline and cancellation reject pending work (controlled unit faults)", async () => {
  globalThis.createImageBitmap = () => new Promise(() => {});
  await assert.rejects(
    startOCR(new Blob(["pending"]), () => {}, 10).promise,
    /timeout/,
  );
  const work = startOCR(new Blob(["pending"]));
  work.cancel();
  await assert.rejects(work.promise, /canceled/);
  delete globalThis.createImageBitmap;
});
