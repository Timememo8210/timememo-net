import "fake-indexeddb/auto";
import test from "node:test";
import assert from "node:assert/strict";
import * as storage from "../storage.js";
import { sampleRecord } from "../samples.js";
test("record and original persist, same ID updates, deletion removes both", async () => {
  const r = {
    ...sampleRecord("plumbing"),
    id: "test-1",
    updated_at: new Date().toISOString(),
  };
  const original = new Blob(["original-document"], { type: "application/pdf" });
  await storage.save(r, original);
  assert.equal((await storage.all()).length, 1);
  assert.equal(await (await storage.file(r.id)).text(), "original-document");
  r.amount.total = 300;
  await storage.save(r, null);
  assert.equal((await storage.all()).length, 1);
  assert.equal((await storage.all())[0].amount.total, 300);
  assert.equal(await (await storage.file(r.id)).text(), "original-document");
  await storage.remove(r.id);
  assert.equal((await storage.all()).length, 0);
  assert.equal(await storage.file(r.id), undefined);
});
test("failed IndexedDB transaction cannot leave partial record", async () => {
  const database = await storage.db();
  const tx = database.transaction(["records", "files"], "readwrite");
  tx.objectStore("records").put({
    id: "aborted",
    updated_at: new Date().toISOString(),
  });
  tx.abort();
  await new Promise((resolve) => {
    tx.onabort = resolve;
  });
  assert.equal(
    (await storage.all()).some((r) => r.id === "aborted"),
    false,
  );
});
