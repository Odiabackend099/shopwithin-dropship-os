import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const dir = path.resolve("n8n/workflows");
const files = (await readdir(dir)).filter((file) => file.endsWith(".json"));

if (files.length !== 11) {
  throw new Error(`Expected 11 n8n workflow exports, found ${files.length}`);
}

for (const file of files) {
  const raw = await readFile(path.join(dir, file), "utf8");
  const workflow = JSON.parse(raw);
  if (!workflow.name || !Array.isArray(workflow.nodes)) {
    throw new Error(`${file} is not a valid n8n workflow export`);
  }
  const serialized = JSON.stringify(workflow);
  for (const forbidden of ["sk-", "shpat_", "FLWSECK", "AKIA", "xoxb-"]) {
    if (serialized.includes(forbidden)) {
      throw new Error(`${file} appears to contain a secret token`);
    }
  }
}

console.log(`Validated ${files.length} n8n workflow exports`);
