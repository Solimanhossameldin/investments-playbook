/* One entry, one file.
 
   The frameworks and the glossary used to live inside two large
   JavaScript modules. That is fine for a build and hopeless for an
   editor: there is no way to open "net rental yield" on its own, and a
   stray quote anywhere in the file takes the whole library down.
 
   Each entry is now its own file: a JSON block between two rules,
   then the body as ordinary markdown.
 
       ---
       { "title": "Net rental yield", "category": "property" }
       ---
 
       The body, in markdown.
 
   JSON rather than YAML on purpose. These entries carry arrays of
   sources and failure modes, and YAML has half a dozen ways to write a
   list, several of which do something surprising to a string that
   happens to start with a colon or a dash. JSON has one way. */

import fs from "node:fs";
import path from "node:path";

const RULE = /^---[ \t]*$/;

export function parseEntry(text, name = "entry") {
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  if (!RULE.test(lines[0] || "")) throw new Error(`${name}: must begin with a --- rule`);

  let close = -1;
  for (let i = 1; i < lines.length; i++) {
    if (RULE.test(lines[i])) { close = i; break; }
  }
  if (close === -1) throw new Error(`${name}: the frontmatter is never closed`);

  const raw = lines.slice(1, close).join("\n");
  let meta;
  try {
    meta = JSON.parse(raw);
  } catch (e) {
    throw new Error(`${name}: the frontmatter is not valid JSON. ${e.message}`);
  }
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    throw new Error(`${name}: the frontmatter must be a JSON object`);
  }

  // A single blank line after the closing rule is formatting, not content.
  let start = close + 1;
  if (lines[start] === "") start++;
  const body = lines.slice(start).join("\n").replace(/\s+$/, "");

  return { meta, body };
}

export function serialiseEntry(meta, body) {
  return `---\n${JSON.stringify(meta, null, 2)}\n---\n\n${String(body).replace(/\s+$/, "")}\n`;
}

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
