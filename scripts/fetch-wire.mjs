#!/usr/bin/env node
/* The wire. Pulls primary source feeds, normalises them, writes content/wire.json.
   Zero dependencies, including the XML parsing, which is deliberate: a feed
   reader that needs a parser library needs the library to keep working too. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import SOURCES from "../content/wire-sources.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KEEP = 140;               // items retained in the file
const MAX_AGE_DAYS = 21;        // anything older is dropped whatever the count
const TIMEOUT = 12000;

const UA =
  "Mozilla/5.0 (compatible; InvestmentsPlaybookWire/1.0; +https://investmentsplaybook.com/wire/)";

async function get(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const r = await fetch(url, {
      signal: ctl.signal,
      headers: { "User-Agent": UA, Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" },
      redirect: "follow",
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

/* ---------- the smallest XML reader that can read a feed ---------- */
export const strip = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&(?:apos|#39);/g, "'")
    .replace(/\s+/g, " ")
    .trim();

export function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? strip(m[1]) : "";
}

export function link(block) {
  // RSS puts the URL in the element, Atom puts it in an href attribute.
  const rss = block.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
  if (rss && rss[1] && strip(rss[1]).startsWith("http")) return strip(rss[1]);
  const atom =
    block.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i) ||
    block.match(/<link[^>]*href=["']([^"']+)["']/i);
  if (atom) return strip(atom[1]);
  const guid = block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
  if (guid && strip(guid[1]).startsWith("http")) return strip(guid[1]);
  return "";
}

export function when(block) {
  for (const t of ["pubDate", "published", "updated", "dc:date", "date"]) {
    const v = tag(block, t);
    if (v) {
      const d = new Date(v);
      if (!isNaN(d)) return d.toISOString();
    }
  }
  return null;
}

export function parse(xml) {
  const blocks = xml.match(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi) || [];
  return blocks
    .map((b) => ({ title: tag(b, "title"), url: link(b), published: when(b) }))
    .filter((x) => x.title && x.url);
}

/* ---------- run ----------
   Guarded so the parsers above can be imported and tested without a network,
   which matters here because a parser is the part that breaks silently. */
const isMain = !!process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
const items = [];
const errors = {};
let ok = 0;

const results = await Promise.all(
  SOURCES.map(async (s) => {
    try {
      const xml = await get(s.url);
      const parsed = parse(xml);
      if (!parsed.length) throw new Error("no items parsed");
      parsed.slice(0, 25).forEach((p) => {
        items.push({
          title: p.title.slice(0, 260),
          url: p.url,
          published: p.published,
          source: s.name,
          sourceLabel: s.label,
          category: s.category,
          feed: s.id,
        });
      });
      return true;
    } catch (e) {
      errors[s.id] = String(e.message || e).slice(0, 120);
      return false;
    }
  })
);
ok = results.filter(Boolean).length;

/* An item with no date is not droppable, it is just unsortable, so it inherits
   the moment we first saw it rather than being silently promoted to newest. */
const seenPath = path.join(root, "content/wire.json");
let previous = { items: [] };
try {
  previous = JSON.parse(fs.readFileSync(seenPath, "utf8"));
} catch {}
const firstSeen = new Map((previous.items || []).map((i) => [i.url, i.published]));

const now = Date.now();
const cutoff = now - MAX_AGE_DAYS * 86400000;
const byUrl = new Map();

for (const it of items) {
  if (!it.published) it.published = firstSeen.get(it.url) || new Date(now).toISOString();
  const t = new Date(it.published).getTime();
  if (!isFinite(t) || t < cutoff) continue;
  if (t > now + 3600000) it.published = new Date(now).toISOString(); // no future dating
  if (!byUrl.has(it.url)) byUrl.set(it.url, it);
}

// Anything already published stays until it ages out, so the page does not
// empty itself the moment a feed has a bad afternoon.
for (const it of previous.items || []) {
  const t = new Date(it.published).getTime();
  if (isFinite(t) && t >= cutoff && !byUrl.has(it.url)) byUrl.set(it.url, it);
}

const merged = [...byUrl.values()]
  .sort((a, b) => new Date(b.published) - new Date(a.published))
  .slice(0, KEEP);

// A retired source has a URL verified dead, not a feed having a bad morning.
// Counting them in the denominator reports five permanent 404s as though they
// were today's failures, which makes a working pipeline look broken and hides
// the real problem: five institutions stopped publishing RSS.
const retired = SOURCES.filter((s) => s.retired);
const live = SOURCES.filter((s) => !s.retired);

const out = {
  fetchedAt: new Date(now).toISOString(),
  sourcesTotal: live.length,
  sourcesOk: ok,
  retired: retired.map((s) => ({ name: s.name, note: s.retired })),
  items: merged,
};
fs.writeFileSync(seenPath, JSON.stringify(out, null, 1) + "\n");

/* ---------- status, published like everything else ---------- */
const statusPath = path.join(root, "content/status.json");
let status = { runs: [] };
try {
  status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
} catch {}
const notes = Object.entries(errors);
status.runs = [
  {
    job: "fetch-wire",
    result: ok === 0 ? "failed" : notes.length ? "partial" : "ok",
    detail:
      `${merged.length} items from ${ok} of ${SOURCES.length} feeds` +
      (notes.length ? `. Down: ${notes.map(([k, v]) => `${k} (${v})`).join("; ")}` : ""),
    at: new Date(now).toISOString(),
  },
  ...(status.runs || []),
].slice(0, 40);
fs.writeFileSync(statusPath, JSON.stringify(status, null, 1) + "\n");

console.log(`Wire: ${merged.length} items, ${ok}/${SOURCES.length} feeds ok.`);
if (notes.length) console.log("  down:", notes.map(([k, v]) => `${k}=${v}`).join(", "));
}
