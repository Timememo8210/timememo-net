import test from "node:test";
import assert from "node:assert/strict";
import {
  blankRecord,
  nullable,
  inspect,
  money,
  validDate,
  validateFile,
  fileHash,
  transition,
  possibleDuplicate,
} from "../core.js";
import { sampleRecord } from "../samples.js";
test("unknown values are null, distinct from explicit zero", () => {
  const r = blankRecord();
  assert.equal(r.amount.total, null);
  assert.equal(r.amount.currency, null);
  assert.equal(nullable("   "), null);
  r.amount.total = 0;
  assert.equal(transition(r, "draft").amount.total, 0);
  assert.equal(money(null, "USD"), "金额未知");
  assert.match(money(0, null), /币种未知/);
});
test("missing service date is never copied from issue date", () => {
  const r = sampleRecord("hvac");
  assert.equal(r.service.date, null);
  assert.ok(r.document.issue_date);
  const saved = transition(r, "confirmed");
  assert.equal(saved.service.date, null);
  assert.ok(saved.review.missing_fields.includes("service.date"));
  assert.equal(saved.amount.payment_status, "unknown");
});
test("confirmation requires property and summary; draft can be incomplete", () => {
  const r = blankRecord();
  assert.equal(transition(r, "draft").review.status, "draft");
  assert.throws(() => transition(r, "confirmed"));
  r.property.id = "自住房";
  r.service.summary = "维修资料";
  assert.equal(transition(r, "confirmed").review.status, "confirmed");
});
test("quote cannot imply paid/completed and invoice does not imply unpaid", () => {
  const r = sampleRecord("roof");
  assert.equal(inspect(r).errors.length, 0);
  r.service.completion_status = "completed";
  assert.throws(() => transition(r, "confirmed"));
  r.service.completion_status = "planned";
  r.amount.payment_status = "paid";
  assert.throws(() => transition(r, "confirmed"));
  assert.equal(sampleRecord("hvac").amount.payment_status, "unknown");
});
test("dates reject impossible calendar dates and ambiguous formats", () => {
  for (const s of ["2026-02-29", "2026-13-01", "03/04/2026", "2026-2-1"])
    assert.equal(validDate(s), false);
  for (const s of ["2024-02-29", "2026-09-09", null])
    assert.equal(validDate(s), true);
});
test("currency stays explicit and negative/NaN amounts fail", () => {
  const r = sampleRecord("plumbing");
  r.amount.currency = null;
  assert.match(money(r.amount.total, r.amount.currency), /币种未知/);
  r.amount.total = NaN;
  assert.ok(inspect(r).errors.length);
  r.amount.total = -20;
  assert.ok(inspect(r).errors.length);
  r.amount.total = 20;
  r.amount.currency = "usd";
  assert.ok(inspect(r).errors.length);
});
test("line item zero is retained and invalid negative amount rejected", () => {
  const r = sampleRecord("plumbing");
  r.items[0].amount = 0;
  assert.equal(transition(r, "confirmed").items[0].amount, 0);
  r.items[0].amount = -2;
  assert.throws(() => transition(r, "confirmed"));
});
test("empty, oversize and unsupported files are rejected", () => {
  assert.ok(validateFile({ type: "image/heic", size: 20 }));
  assert.ok(validateFile({ type: "application/pdf", size: 0 }));
  assert.ok(validateFile({ type: "application/pdf", size: 16 * 1024 * 1024 }));
  assert.equal(validateFile({ type: "image/png", size: 100 }), null);
});
test("file signature validation and SHA-256 exact duplicate detection", async () => {
  const a = new File(["%PDF-1.4\nDemo"], "a.pdf", { type: "application/pdf" }),
    b = new File(["%PDF-1.4\nDemo"], "b.pdf", { type: "application/pdf" });
  assert.equal(await fileHash(a), await fileHash(b));
  const sha = await fileHash(a);
  assert.ok(
    possibleDuplicate({ source: { sha256: sha } }, { source: { sha256: sha } }),
  );
  await assert.rejects(() =>
    fileHash(new File(["text"], "fake.pdf", { type: "application/pdf" })),
  );
  assert.ok(
    !possibleDuplicate(
      { source: { sha256: null } },
      { source: { sha256: null } },
    ),
  );
});
test("confirmation creates a new record value without mutating extraction", () => {
  const r = sampleRecord("plumbing");
  const next = transition(r, "confirmed");
  assert.equal(r.review.status, "draft");
  assert.equal(next.review.status, "confirmed");
});

test("exports use English system warnings while preserving user-authored text", async () => {
  const { exportRecordData } = await import("../core.js");
  const r = sampleRecord("hvac", "zh");
  r.notes = "服务日期未知；这是用户自己写的原文";
  r.review.warnings = ["服务日期未知；不会用开票日期或上传日期代替。"];
  const out = exportRecordData({ records: [r] });
  assert.doesNotMatch(
    out.records[0].review.warnings.join(" "),
    /\p{Script=Han}/u,
  );
  assert.equal(out.records[0].notes, r.notes);
  assert.equal(out.records[0].service.summary, r.service.summary);
  assert.match(r.review.warnings[0], /服务日期/);
  assert.doesNotMatch(
    transition(r, "draft").review.warnings.join(" "),
    /\p{Script=Han}/u,
  );
});
