#!/usr/bin/env node
/* Structural audit of the built site.
 
   The point of this is the distinction between a link in the header or
   footer and a link in the body of a page. Site furniture links every
   page to the same eight destinations and tells a search engine nothing
   about which pages are related to which. Only editorial links do that,
   so every count below ignores the chrome.
 
   Run with --strict to make findings fail the process. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const STRICT = process.argv.includes("--strict");

if (!fs.existsSync(dist)) {
  console.error("No dist. Run the build first.");
  process.exit(1);
}

/* ---------- collect ---------- */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

const urlOf = (file) => {
  const rel = path.relative(dist, file).replace(/\\/g, "/");
  if (rel === "404.html") return "/404.html";
  return "/" + rel.replace(/index\.html$/, "");
};

const pages = new Map();
for (const file of walk(dist)) {
  const html = fs.readFileSync(file, "utf8");
  const url = urlOf(file);
  const pick = (re) => (html.match(re) || [])[1] || "";
  // Chrome is everything inside the masthead and the footer. What is left
  // is the part an editor wrote.
  const body = html
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "");

  const links = (part) =>
    [...part.matchAll(/<a\b[^>]*href="([^"]+)"/gi)]
      .map((m) => m[1])
      .filter((h) => h.startsWith("/") && !h.startsWith("//"))
      .map((h) => h.split("#")[0].split("?")[0])
      .filter(Boolean);

  pages.set(url, {
    url,
    file,
    title: pick(/<title>([\s\S]*?)<\/title>/i),
    description: pick(/<meta name="description" content="([^"]*)"/i),
    canonical: pick(/<link rel="canonical" href="([^"]*)"/i),
    noindex: /name="robots" content="noindex/.test(html),
    h1s: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, "").trim()),
    jsonld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => {
      try { return JSON.parse(m[1])["@type"]; } catch { return "INVALID"; }
    }),
    bodyLinks: [...new Set(links(body))],
    allLinks: [...new Set(links(html))],
    words: body.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length,
  });
}

const indexable = [...pages.values()].filter((p) => !p.noindex && p.url !== "/404.html");
const exists = (u) => pages.has(u) || fs.existsSync(path.join(dist, u.replace(/^\//, "")));

/* ---------- measure ---------- */
const inbound = new Map([...pages.keys()].map((u) => [u, new Set()]));
const broken = [];
for (const p of pages.values()) {
  for (const href of p.allLinks) {
    if (!exists(href)) broken.push({ from: p.url, href });
  }
  for (const href of p.bodyLinks) {
    if (href !== p.url && inbound.has(href)) inbound.get(href).add(p.url);
  }
}

const findings = [];
const note = (level, kind, detail) => findings.push({ level, kind, detail });

for (const b of broken) note("error", "broken link", `${b.from} -> ${b.href}`);

for (const p of indexable) {
  const n = inbound.get(p.url).size;
  if (n === 0) note("error", "orphan", `${p.url} has no editorial links pointing at it`);
  else if (n === 1) note("warn", "thin inbound", `${p.url} is linked from only ${[...inbound.get(p.url)][0]}`);

  if (!p.title) note("error", "no title", p.url);
  else if (p.title.length > 65) note("warn", "long title", `${p.title.length} chars: ${p.url}`);
  if (!p.description) note("error", "no description", p.url);
  else if (p.description.length > 160) note("warn", "long description", `${p.description.length} chars: ${p.url}`);
  else if (p.description.length < 70) note("warn", "short description", `${p.description.length} chars: ${p.url}`);
  if (!p.canonical) note("error", "no canonical", p.url);
  if (p.h1s.length === 0) note("error", "no h1", p.url);
  if (p.h1s.length > 1) note("warn", "multiple h1", `${p.h1s.length} on ${p.url}`);
  if (p.jsonld.includes("INVALID")) note("error", "broken json-ld", p.url);
  if (p.words < 120) note("warn", "thin page", `${p.words} words: ${p.url}`);
}

const dupe = (field) => {
  const seen = new Map();
  for (const p of indexable) {
    const v = p[field];
    if (!v) continue;
    if (!seen.has(v)) seen.set(v, []);
    seen.get(v).push(p.url);
  }
  for (const [v, urls] of seen) {
    if (urls.length > 1) note("error", `duplicate ${field}`, `${urls.length} pages share "${v.slice(0, 60)}": ${urls.slice(0, 4).join(", ")}`);
  }
};
dupe("title");
dupe("description");

// The sitemap should list every indexable page and nothing else.
const sitemap = fs.existsSync(path.join(dist, "sitemap.xml"))
  ? [...fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)]
      // Strip the origin. Matching the first slash instead catches the one
      // in "https://", which made every URL look wrong.
      .map((m) => m[1].replace(/^https?:\/\/[^/]+/, ""))
  : [];
const inMap = new Set(sitemap);
for (const p of indexable) if (!inMap.has(p.url)) note("error", "missing from sitemap", p.url);
for (const u of inMap) if (!pages.has(u)) note("error", "sitemap lists a page that is not built", u);
for (const p of pages.values()) if (p.noindex && inMap.has(p.url)) note("error", "noindex page in sitemap", p.url);

/* ---------- report ---------- */
const errors = findings.filter((f) => f.level === "error");
const warns = findings.filter((f) => f.level === "warn");

const by = (list) => {
  const m = new Map();
  for (const f of list) { if (!m.has(f.kind)) m.set(f.kind, []); m.get(f.kind).push(f.detail); }
  return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
};

console.log(`\n${pages.size} pages built, ${indexable.length} indexable.\n`);

const ranked = indexable
  .map((p) => ({ url: p.url, n: inbound.get(p.url).size }))
  .sort((a, b) => b.n - a.n);
console.log("Editorial inbound links, most linked:");
for (const r of ranked.slice(0, 6)) console.log(`  ${String(r.n).padStart(3)}  ${r.url}`);
const zero = ranked.filter((r) => r.n === 0).length;
const one = ranked.filter((r) => r.n === 1).length;
console.log(`  ${zero} pages with none, ${one} with exactly one.\n`);

for (const [label, list] of [["ERRORS", errors], ["WARNINGS", warns]]) {
  if (!list.length) continue;
  console.log(`${label} (${list.length})`);
  for (const [kind, details] of by(list)) {
    console.log(`  ${kind} x${details.length}`);
    for (const d of details.slice(0, 6)) console.log(`      ${d}`);
    if (details.length > 6) console.log(`      ...and ${details.length - 6} more`);
  }
  console.log("");
}

if (!errors.length && !warns.length) console.log("Nothing to report.\n");

export { pages, inbound, findings };

if (STRICT && errors.length) {
  console.error(`${errors.length} structural errors.`);
  process.exit(1);
}
