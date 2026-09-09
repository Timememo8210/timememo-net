import { readFile, writeFile, access, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
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
for (const name of ["app.js", "core.js", "storage.js", "samples.js"])
  execFileSync(process.execPath, ["--check", resolve(root, name)]);
for (const name of ["index.html", "project/index.html"]) {
  const html = await readFile(resolve(root, name), "utf8");
  if (!html.includes('lang="zh-CN"') || !html.includes("viewport"))
    throw Error("Missing responsive document metadata");
  for (const [, url] of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
    if (/^(https?:|data:|blob:)/.test(url) || url.endsWith(".zip")) continue;
    await access(resolve(dirname(resolve(root, name)), url));
  }
}
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (
      ["node_modules", ".git"].includes(entry.name) ||
      entry.name.endsWith(".zip")
    )
      continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else files.push(path);
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
