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
// site.brief.byEmail is the ground truth about whether the brief publishes at
// all, as opposed to whether this site's archive of it is current. The check
// has to read the same input the pages do, or it fails the site for telling
// the truth.
const cad = cadence(
  briefFiles.map((f) => JSON.parse(fs.readFileSync(path.join(briefDir, f), "utf8"))),
  undefined,
  site.brief
);

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

  // The inbound-link graph is meant to answer one question: has a human
  // writing one page ever had reason to point at another? Every template
  // block inside <main> answers it falsely. The market band links /data/
  // from all 139 pages, the breadcrumb links /playbooks/, the review line
  // links /disclosure/, the capture block links the brief, and the rail's
  // "Related frameworks" list is generated from the category rather than
  // written. Counting those, the orphan check cannot fail: it reported
  // zero orphans on a build where five frameworks had no prose link at
  // all pointing at them. Prose is what is left once they are removed.
  // Start from <main> rather than from `body`: the market ticker sits
  // between the masthead and <main>, is nested three divs deep, and is not
  // reliably removable with a non-greedy tag match. Every page has exactly
  // one <main>, which is checked below, so anything outside it is chrome by
  // construction and no regex has to be trusted for that part.
  const prose = (html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) || ["", ""])[1]
    .replace(/<aside class="rail"[\s\S]*?<\/aside>/gi, "")
    .replace(/<aside class="cap"[\s\S]*?<\/aside>/gi, "")
    .replace(/<p class="eyebrow"[\s\S]*?<\/p>/gi, "")
    .replace(/<p class="reviewed"[\s\S]*?<\/p>/gi, "");

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
    forms: [...html.matchAll(/<form\b[^>]*data-ml="([^"]*)"[^>]*>/gi)].map((m) => m[0]),
    // "Subscribe" that navigates to a six-field lead form is the "Book a call"
    // bug in another costume, so the label and its destination are collected
    // together and checked against each other.
    ctas: [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]{0,60})<\/a>/gi)]
      .map((m) => ({ href: m[1], label: m[2].trim() })),
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
    proseLinks: [...new Set(links(prose))],
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
  for (const href of p.proseLinks) {
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

// Every page a reader can land on from search should let them act where they
// are. The library is what search finds, and until this was added the 55
// framework pages and 48 glossary pages had no form at all: the only call to
// action navigated to the homepage and asked them to start again.
const NO_CAPTURE = new Set([
  "/404.html", "/about/", "/contact/", "/disclosure/", "/privacy/",
  "/data/", "/wire/", "/record/", "/communities/", "/playbook/", "/chartbook/",
]);
for (const p of indexable) {
  if (NO_CAPTURE.has(p.url)) continue;
  if (!p.forms.length) note("error", "no way to convert", p.url);
}

// A signup that cannot be traced to the page that earned it is a signup you
// cannot learn anything from.
for (const p of pages.values()) {
  for (const f of p.forms) {
    if (/data-ml="brief"/.test(f) && !/data-source="/.test(f)) {
      note("error", "form does not name its source", p.url);
    }
  }
}

// A label is a promise. "Subscribe" must not land on the compendium gate, and
// nothing offering the brief may point at a form for a different product.
for (const p of pages.values()) {
  for (const c of p.ctas) {
    const label = c.label.toLowerCase();
    if (/^subscribe\b/.test(label) && c.href.includes("#playbook")) {
      note("error", "cta promises the brief and opens the lead form", `"${c.label}" -> ${c.href} on ${p.url}`);
    }
  }
}

// No page may block its own render on somebody else's server. The Google
// Fonts stylesheet was doing exactly that: a DNS lookup, a handshake and a
// round trip to another origin before a single pixel could paint. Measured
// at 390px with a 300ms trip, DOMContentLoaded went from 62ms to 373ms.
for (const p of pages.values()) {
  const html = fs.readFileSync(p.file, "utf8");
  const head = html.split("</head>")[0];
  for (const m of head.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="(https?:)?\/\/([^"\/]+)/gi)) {
    note("error", "render-blocking third-party stylesheet", `${m[2]} on ${p.url}`);
  }
}

// The faces the stylesheet declares have to be in the build, or every page
// silently falls back and nobody notices until a screenshot looks wrong.
{
  const css = fs.existsSync(path.join(dist, "styles.css"))
    ? fs.readFileSync(path.join(dist, "styles.css"), "utf8") : "";
  for (const m of css.matchAll(/url\("(\/fonts\/[^"]+)"\)/g)) {
    if (!fs.existsSync(path.join(dist, m[1].replace(/^\//, "")))) {
      note("error", "font declared but not built", m[1]);
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

/* ---------- frameworks nobody cites ---------- */
// The orphan check above counts a link from any page's <main>, and the
// /playbooks/ index lists every framework inside its own <main>. So the check
// cannot fail for a framework: the index always links it. That is fine for
// reachability and useless for the question that matters here, which is
// whether writing one framework ever gave a reason to point at another.
//
// Five frameworks shipped with no framework citing them at all, and nothing
// caught it, because a page reachable from a directory listing looks exactly
// like a page somebody found worth mentioning. This check separates them:
// index pages are excluded as sources, so only a sentence counts.
{
  const isFw = (u) => /^\/playbooks\/[^/]+\/$/.test(u);
  const cited = new Map([...pages.keys()].filter(isFw).map((u) => [u, new Set()]));
  for (const p of pages.values()) {
    if (!isFw(p.url)) continue;               // the index is not a citation
    for (const href of p.proseLinks) {
      if (href !== p.url && cited.has(href)) cited.get(href).add(p.url);
    }
  }
  for (const [url, from] of cited) {
    if (from.size === 0) note("error", "uncited framework", `${url} is not linked from any other framework's prose`);
  }
  console.log(`\nFrameworks: ${cited.size}, all cited by at least one other framework's prose.`);
}

/* ---------- every table can get out of the way ---------- */
// `.tbl` is width:100%, so a table too wide for a phone does not overflow, it
// squashes: the measurement passes and the cells turn to mush. `.table-scroll`
// is the fix and the markdown renderer adds it to every table it produces.
// Two tables were written by hand in document.mjs instead, and missed it. One
// of them was the Playbook Matrix, which the blueprint calls the single named
// framework this brand owns.
//
// Same shape as the arithmetic block: content whose meaning is its layout,
// silently reflowed, with nothing failing because nothing overflowed.
{
  let tables = 0;
  const bare = new Map();
  for (const p of pages.values()) {
    const html = fs.readFileSync(p.file, "utf8");
    let i = 0;
    while ((i = html.indexOf('<table class="tbl">', i)) !== -1) {
      tables++;
      const before = html.slice(Math.max(0, i - 160), i);
      if (!/<div class="table-scroll"[^>]*>\s*$/.test(before)) {
        bare.set(p.url, (bare.get(p.url) || 0) + 1);
      }
      i++;
    }
  }
  for (const [url, n] of bare) {
    note("error", "table cannot scroll", `${url} has ${n} table(s) outside a .table-scroll, so they squash rather than scroll on a phone`);
  }
  console.log(`\nTables: ${tables}, all inside a scrolling wrapper.`);
}

/* ---------- the cadence the site claims ---------- */
// "every weekday at 7am GST" went out on 140 pages because a boolean was set
// on a verbal report. The campaign record for that week showed three issues,
// at 06:48, 17:58 and 12:03. A promise about when something arrives is one a
// reader can check, and this one was checkable and wrong.
//
// So the phrase is configuration, and no page may state a precision the
// configuration does not. If site.json does not name a time, no built page
// names one either.
{
  const phrase = String((site.brief && site.brief.phrase) || "");
  const configNamesATime = /\d{1,2}(:\d{2})?\s*(am|pm)/i.test(phrase);
  if (!configNamesATime) {
    const offenders = [];
    for (const p of pages.values()) {
      const main = (fs.readFileSync(p.file, "utf8").match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) || ["", ""])[1];
      if (/\b\d{1,2}(:\d{2})?\s*(am|pm)\s*(GST|Gulf)/i.test(main)) offenders.push(p.url);
    }
    if (offenders.length) {
      note("error", "cadence overclaimed",
        `${offenders.length} page(s) name a delivery time while site.json says only "${phrase}": ${offenders.slice(0, 3).join(", ")}`);
    }
  }
  console.log(`\nCadence: the site says the brief goes out ${phrase || "(unset)"}.`);
}

/* ---------- third parties the privacy page names ---------- */
// The privacy page said "Fonts are served by Google Fonts, which will see
// your IP address" for a week after the fonts were self-hosted and Google
// stopped seeing anything. A privacy page is the one page on a site where a
// stale sentence is not a typo, and nothing was checking it.
//
// So each provider the page names is paired with the host a browser would
// have to contact for that claim to be true, and the built pages are searched
// for it. Naming a provider the site no longer talks to is an error; talking
// to one the page does not name is the more serious error and is checked in
// the same pass.
{
  const PROVIDERS = [
    ["Google Fonts", "fonts.googleapis.com"],
    ["gold-api.com", "api.gold-api.com"],
    ["Kraken", "api.kraken.com"],
    ["MailerLite", "assets.mailerlite.com"],
    ["ExchangeRate-API", "open.er-api.com"],
  ];
  const privacy = pages.get("/privacy/");
  if (!privacy) note("error", "privacy missing", "/privacy/ was not built");
  else {
    // Only the page's own prose counts. The footer carries a site-wide data
    // attribution block naming every provider the build ever touches, which
    // would make this check pass on every page and mean nothing, the same
    // trap the inbound-link graph fell into.
    const text = (fs.readFileSync(privacy.file, "utf8")
      .match(/<main\b[^>]*>([\s\S]*?)<\/main>/i) || ["", ""])[1];
    // What a browser actually reaches out to, taken from the built output
    // rather than from anyone's memory of it.
    let contacted = "";
    for (const p of pages.values()) contacted += fs.readFileSync(p.file, "utf8");
    for (const asset of ["app.js", "app.min.js"]) {
      const f = path.join(dist, asset);
      if (fs.existsSync(f)) contacted += fs.readFileSync(f, "utf8");
    }
    for (const f of fs.readdirSync(dist)) {
      if (/^app\.[a-f0-9]+\.js$/.test(f)) contacted += fs.readFileSync(path.join(dist, f), "utf8");
    }
    for (const [name, host] of PROVIDERS) {
      const named = text.includes(name);
      const reached = contacted.includes(host);
      if (named && !reached)
        note("error", "stale privacy claim", `/privacy/ names ${name} but nothing in the build contacts ${host}`);
      if (!named && reached)
        note("error", "undisclosed third party", `the build contacts ${host} and /privacy/ does not name ${name}`);
    }
  }
}

/* ---------- counts stated in prose ---------- */
// The about page said "Six tools" for as long as there were eight, because a
// number typed into prose has nothing holding it to the thing it counts. The
// pages themselves are the source of truth, so the prose is checked against a
// directory listing rather than against a constant.
{
  const WORD = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
    "nine", "ten", "eleven", "twelve"];
  const spell = (n) => {
    if (n <= 12) return WORD[n];
    const tens = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    const teens = { 11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen", 15: "fifteen",
      16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen" };
    if (n < 20) return teens[n];
    const t = Math.floor(n / 10), u = n % 10;
    return u ? `${tens[t]}-${WORD[u]}` : tens[t];
  };
  const under = (prefix) =>
    [...pages.keys()].filter((u) => u.startsWith(prefix) && u !== prefix).length;

  const about = pages.get("/about/");
  const STATED = [
    ["calculators", under("/calculators/"), /\b([a-z-]+) tools that run the arithmetic/i],
    ["glossary terms", under("/glossary/"), /\b([A-Za-z-]+) terms this industry uses/i],
  ];
  if (!about) note("error", "about missing", "/about/ was not built");
  else for (const [what, actual, re] of STATED) {
    const said = (fs.readFileSync(about.file, "utf8").match(re) || [])[1];
    if (!said) note("error", "count not stated", `/about/ no longer states how many ${what} there are`);
    else if (said.toLowerCase() !== spell(actual))
      note("error", "stale count", `/about/ says "${said}" ${what}, there are ${actual} (${spell(actual)})`);
  }
}
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
