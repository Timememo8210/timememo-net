// Retain the existing database name so a branding/language update preserves local records.
const NAME = "domake-receipt-prototype-v1";
let dbPromise;
export function db() {
  if (!dbPromise)
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore("records", { keyPath: "id" });
        req.result.createObjectStore("files");
      };
      req.onsuccess = () => {
        req.result.onversionchange = () => req.result.close();
        resolve(req.result);
      };
      req.onerror = () =>
        reject(Error("浏览器存储不可用。请允许本地存储，或先导出 JSON 备份。"));
      req.onblocked = () => reject(Error("请关闭其他原型标签页后重试。"));
    });
  return dbPromise;
}
export async function all() {
  const database = await db();
  return new Promise((resolve, reject) => {
    const req = database.transaction("records").objectStore("records").getAll();
    req.onsuccess = () =>
      resolve(
        req.result.sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
      );
    req.onerror = () => reject(req.error);
  });
}
export async function save(record, file) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(["records", "files"], "readwrite");
    tx.objectStore("records").put(record);
    if (file) tx.objectStore("files").put(file, record.id);
    tx.oncomplete = () => resolve(record);
    tx.onerror = tx.onabort = () =>
      reject(
        Error(
          "保存失败，浏览器空间可能不足。内容仍在表单中，请导出 JSON 备份后重试。",
        ),
      );
  });
}
export async function remove(id) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(["records", "files"], "readwrite");
    tx.objectStore("records").delete(id);
    tx.objectStore("files").delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(Error("删除失败，请重试。"));
  });
}
export async function file(id) {
  const database = await db();
  return new Promise((resolve, reject) => {
    const req = database.transaction("files").objectStore("files").get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
