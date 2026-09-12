import { readFile, writeFile, access, readdir } from "node:fs/promises";
import { dirname, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import Ajv from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { sampleRecord, samples } from "../samples.js";
import { transition } from "../core.js";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ajv = new Ajv({ strict: false });
addFormats(ajv);
const schema = JSON.parse(
  await readFile(resolve(root, "docs/receipt.schema.json")),
);
const validate = ajv.compile(schema);
for (const name of Object.keys(samples)) {
  const r = transition(sampleRecord(name), "draft");
  if (!validate(r)) throw Error(JSON.stringify(validate.errors));
  await writeFile(
    resolve(root, "samples", name + ".json"),
    JSON.stringify(r, null, 2) + "\n",
  );
}
for (const name of [
  "app.js",
  "core.js",
  "storage.js",
  "samples.js",
  "i18n.js",
  "ocr.js",
  "extraction.js",
  "ai-client.js",
  "ai-config.js",
  "ai-contract.js",
  "workspace-context.js",
  "admin/admin.js",
])
  execFileSync(process.execPath, ["--check", resolve(root, name)]);
for (const name of [
  "index.html",
  "zh.html",
  "project/index.html",
  "project/zh.html",
  "walkthrough/index.html",
  "walkthrough/zh.html",
  "admin/index.html",
  "admin/zh.html",
  "round2/index.html",
  "round2/zh.html",
  "interaction-guide/index.html",
  "interaction-guide/zh.html",
]) {
  const html = await readFile(resolve(root, name), "utf8");
  if (!/lang="(?:zh-CN|en)"/.test(html) || !html.includes("viewport"))
    throw Error("Missing responsive document metadata");
  for (const [, url] of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    if (/^(https?:|data:|blob:)/.test(url)) continue;
    const localPath = url.split(/[?#]/)[0];
    if (!localPath || localPath.endsWith(".zip")) continue;
    await access(resolve(dirname(resolve(root, name)), localPath));
  }
}
for (const r of JSON.parse(await readFile(resolve(root,"admin/examples.json"))).records) {
  if (!validate(r)) throw Error(JSON.stringify(validate.errors));
}
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (
      ["node_modules", ".git", "vendor", "test-assets"].includes(entry.name) ||
      entry.name.endsWith(".zip")
    )
      continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (!/\.(png|jpe?g|webp|pdf)$/i.test(extname(path))) files.push(path);
  }
}
await walk(root);
for (const path of files) {
  const body = await readFile(path, "utf8");
  if (/AIza[\w-]{25,}|sk-[\w-]{25,}|ghp_[\w]{25,}/.test(body))
    throw Error("Credential pattern found in project output");
}
console.log(
  `Build verified: ${files.length} project files; 3 schema-valid samples; local page references resolved.`,
);
