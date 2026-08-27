#!/usr/bin/env node
/* One-off: split the two content modules into one file per entry.
   Safe to run twice; it overwrites the same files from the same source. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serialiseEntry } from "../src/content/entry.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function split(module, dir, bodyKey, slugKey) {
  const items = (await import(module)).default;
  const out = path.join(root, dir);
  fs.mkdirSync(out, { recursive: true });
  items.forEach((item, i) => {
    const { [bodyKey]: body, ...meta } = item;
    // Order is carried explicitly so the published sequence never
    // depends on how a filesystem happens to sort filenames.
    fs.writeFileSync(path.join(out, `${item[slugKey]}.md`), serialiseEntry({ order: i, ...meta }, body));
  });
  console.log(`${items.length} -> ${dir}`);
  return items.length;
}

await split("../content/playbooks.mjs", "content/playbooks", "body", "slug");
await split("../content/glossary.mjs", "content/glossary", "body", "slug");
