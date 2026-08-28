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
const site = JSON.parse(fs.readFileSync(path.join(root, "content", "site.json"), "utf8"));
const briefDir = path.join(root, "content", "briefs");
const briefFiles = fs.existsSync(briefDir) ? fs.readdirSync(briefDir).filter((f) => f.endsWith(".json")) : [];
const { cadence } = await import("../src/lib.mjs");
const cad = cadence(briefFiles.map((f) => JSON.parse(fs.readFileSync(path.join(briefDir, f), "utf8"))));

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
    headings: [...html.matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1])),
    pageDate: (html.match(/<time datetime="(\d{4}-\d{2}-\d{2})"/i) || [])[1] || "",
    feedLink: /<link rel="alternate" type="application\/atom\+xml"[^>]*href="\/feed\.xml"/i.test(html),
    unlocks: [...html.matchAll(/data-unlock="([^"]+)"/gi)].map((m) => m[1]),
    skipHref: (html.match(/<a class="skip" href="#([^"]+)"/i) || [])[1] || "",
    mainId: (html.match(/<main[^>]*\bid="([^"]+)"/i) || [])[1] || "",
    ogImage: (html.match(/<meta property="og:image" content="([^"]*)"/i) || [])[1] || "",
    twImage: (html.match(/<meta name="twitter:image" content="([^"]*)"/i) || [])[1] || "",
    jsonld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => {
      try { return JSON.parse(m[1])["@type"]; } catch { return "INVALID"; }
    }),
    jsonldRaw: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => {
      try { return JSON.parse(m[1]); } catch { return null; }
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

// A screen reader announces the outline, not the type size. A heading that
// skips a level (h1 straight to h3) reads as a missing section, so every jump
// is a real navigation defect even though the page looks right. This runs over
// every page including 404, which is not indexable but is still read aloud.
for (const p of pages.values()) {
  let prev = null;
  for (const h of p.headings) {
    if (prev !== null && h > prev + 1) {
      note("error", "heading jump", `${p.url} goes h${prev} -> h${h}`);
      break;
    }
    prev = h;
  }
}

// A link card is the one part of this site nobody sees until it is broken, and
// it is broken silently: LinkedIn, X, WhatsApp and Slack render a blank box and
// report nothing. Every page declares summary_large_image, so every page owes
// an image that is absolute (relative og:image URLs are not resolved by every
// scraper) and actually present in the build.
for (const p of pages.values()) {
  for (const [kind, v] of [["og:image", p.ogImage], ["twitter:image", p.twImage]]) {
    if (!v) { note("error", "no " + kind, p.url); continue; }
    if (!v.startsWith("https://")) note("error", kind + " not absolute", `${v} on ${p.url}`);
    else if (v.startsWith(site.origin)) {
      const f = path.join(dist, v.slice(site.origin.length).replace(/^\//, ""));
      if (!fs.existsSync(f)) note("error", kind + " missing from build", `${v} on ${p.url}`);
    }
  }
}

// A date in structured data has to be ISO 8601. Anything else is discarded by
// the consumer without complaint, so a page ships looking annotated and is not.
// This shipped for weeks as "27 August 2026" on every framework page.
const ISO = /^\d{4}-\d{2}-\d{2}(T|$)/;
for (const p of pages.values()) {
  for (const node of p.jsonldRaw) {
    if (!node) continue;
    for (const field of ["datePublished", "dateModified"]) {
      const v = node[field];
      if (v !== undefined && !ISO.test(String(v))) {
        note("error", `${field} not ISO 8601`, `"${v}" on ${p.url}`);
      }
    }
  }
}

// A leaf page under a known section owes a breadcrumb trail, and that trail's
// last item has to be the page itself. The failure this guards is a new
// section shipping without a label: the trail then silently disappears from
// every page under it rather than showing a wrong one.
const CRUMBED = ["playbooks", "calculators", "glossary", "brief", "start", "communities"];
for (const p of indexable) {
  const seg = p.url.split("/").filter(Boolean);
  const leaf = seg.length === 2 && CRUMBED.includes(seg[0]);
  const bc = p.jsonldRaw.find((n) => n && n["@type"] === "BreadcrumbList");
  if (leaf && !bc) { note("error", "no breadcrumb", p.url); continue; }
  if (!bc) continue;
  const last = bc.itemListElement[bc.itemListElement.length - 1];
  if (last.item !== site.origin + p.url) {
    note("error", "breadcrumb does not end at the page", `${last.item} on ${p.url}`);
  }
}

// Sitemap lastmod. Google drops lastmod across a whole site once it stops
// believing it, so the failure to guard against is a date the build cannot
// justify -- which is what stamping the build date on all 124 URLs was.
// Where a page states its own date in a <time datetime>, the sitemap has to
// agree with it; nothing may be dated in the future; and a sitemap where
// every single URL carries one identical date is the old bug returning.
{
  const raw = fs.existsSync(path.join(dist, "sitemap.xml"))
    ? fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8")
    : "";
  const entries = [...raw.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]*)<\/lastmod>)?<\/url>/g)]
    .map((m) => ({ url: m[1].slice(site.origin.length) || "/", lastmod: m[2] || "" }));
  const dated = entries.filter((e) => e.lastmod);
  const nowISO = new Date().toISOString().slice(0, 10);

  for (const e of dated) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.lastmod)) note("error", "lastmod not a date", `${e.lastmod} on ${e.url}`);
    else if (e.lastmod > nowISO) note("error", "lastmod in the future", `${e.lastmod} on ${e.url}`);
    const p = pages.get(e.url);
    if (p && p.pageDate && p.pageDate !== e.lastmod) {
      note("error", "lastmod disagrees with the page", `sitemap ${e.lastmod}, page ${p.pageDate}, ${e.url}`);
    }
  }
  if (entries.length > 10 && dated.length === entries.length && new Set(dated.map((e) => e.lastmod)).size === 1) {
    note("error", "every url shares one lastmod", `${entries.length} urls all dated ${dated[0].lastmod}`);
  }
}

// The feed is only useful if a reader's app can find it, which it does by
// reading the alternate link out of whatever page they happen to be on. A feed
// that exists and is announced nowhere is a file nobody will ever request.
if (!fs.existsSync(path.join(dist, "feed.xml"))) note("error", "no feed", "/feed.xml is not in the build");
for (const p of indexable) {
  if (!p.feedLink) note("error", "feed not announced", p.url);
}

// Thirteen links sit in front of the content on every page. Without a skip
// link a keyboard user tabs all of them, on every page, forever. The link is
// only worth anything if its target exists, so both halves are checked: a
// working link pointing at an id nobody renders is the same as no link.
for (const p of pages.values()) {
  if (!p.skipHref) note("error", "no skip link", p.url);
  else if (p.skipHref !== p.mainId) {
    note("error", "skip link points nowhere", `#${p.skipHref} but main is "${p.mainId || "unset"}" on ${p.url}`);
  }
}

// The cadence the site advertises has to match the cadence it is keeping. Not
// on one page: on all of them. "Book a call" pointed at an email form for
// weeks because it was checked for resolving rather than for being true, and
// this is the same claim shape - "every weekday at 7am GST" appeared on 52
// pages while one issue existed and publication was stopped.
{
  const stale = cad.live ? "paused at the moment" : "every weekday at 7am GST";
  for (const p of pages.values()) {
    const html = fs.readFileSync(p.file, "utf8");
    // The /brief/ notice explains the situation in full and is allowed to name
    // the advertised cadence while saying it is not being met.
    const body = html.replace(/<div class="callout"[\s\S]*?<\/div>/g, "");
    if (body.includes(stale)) {
      note("error", "cadence claim does not match the cadence", `"${stale}" on ${p.url}`);
    }
  }
}

// A file a page promises in exchange for an email has to exist. The broken
// link check does not reach this one, because the promise is carried in a
// data attribute and the anchor is only created after a reader has already
// handed over their address. That is the worst possible moment to find out,
// so it is checked here instead.
for (const p of pages.values()) {
  for (const u of p.unlocks) {
    if (!fs.existsSync(path.join(dist, u.replace(/^\//, "")))) {
      note("error", "promised file missing from build", `${u} on ${p.url}`);
    }
  }
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
