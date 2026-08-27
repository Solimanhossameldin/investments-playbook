/* The entry file format. Pure string handling, no filesystem, because
   this same code has to run inside the admin Worker where there is no
   filesystem to read. src/content/entry.mjs adds the loading on top. */

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
