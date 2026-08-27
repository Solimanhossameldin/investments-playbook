/* Loading entries off disk. The format itself lives in format.mjs so
   the admin Worker can use it too. */

import fs from "node:fs";
import path from "node:path";
import { parseEntry, serialiseEntry } from "./format.mjs";

export { parseEntry, serialiseEntry };

/* Reads a directory of entries and returns them in `order`, which is
   carried in the frontmatter so the published order never depends on
   how the filesystem happens to sort filenames. */
export function loadEntries(dir, { bodyKey = "body", slugKey = "slug" } = {}) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  const out = [];
  for (const file of files) {
    const { meta, body } = parseEntry(fs.readFileSync(path.join(dir, file), "utf8"), file);
    const slug = meta[slugKey] || file.replace(/\.md$/, "");
    const entry = { ...meta, [slugKey]: slug, [bodyKey]: body };
    delete entry.order;
    out.push({ order: typeof meta.order === "number" ? meta.order : 9999, entry });
  }
  out.sort((a, b) => a.order - b.order);
  return out.map((o) => o.entry);
}
