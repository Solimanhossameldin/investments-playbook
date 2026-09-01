#!/usr/bin/env node
// Static site build. Zero dependencies. Reads content, writes dist.

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { page } from "../src/templates/layout.mjs";
import * as P from "../src/templates/pages.mjs";
import { CALCULATORS, calcIndex, calcPage } from "../src/templates/calculators.mjs";
import { wirePage, wireStrip } from "../src/templates/wire.mjs";
import { glossaryIndex, glossaryTerm } from "../src/templates/glossary.mjs";
import { communityIndex, communityPage } from "../src/templates/communities.mjs";
import { chartbookPage } from "../src/templates/chartbook.mjs";
import { recordPage } from "../src/templates/record.mjs";
import { pathIndex, pathPage, pathBand } from "../src/templates/paths.mjs";
import { contactPage, whatsappUrl } from "../src/templates/contact.mjs";
import { feed } from "../src/templates/feed.mjs";
import { buildChartbookPdf, pdfPageCount } from "./make-chartbook-pdf.mjs";
import { buildCryptoChecklistPdf, checklistPageCount, checklistQuestionCount } from "./make-crypto-checklist-pdf.mjs";
import { buildFirstPropertyPdf } from "./make-first-property-pdf.mjs";
import calls from "../content/calls.mjs";
import glossary from "../content/glossary.mjs";
import { playbookDoc } from "../src/templates/document.mjs";
import playbooks from "../content/playbooks.mjs";
import paths from "../content/paths.mjs";
import * as STATIC from "../content/static.mjs";
import { pickRelated } from "../src/related.mjs";
import { isoDate } from "../src/lib.mjs";
import { cryptoBand } from "../src/templates/crypto.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const read = (p, fb) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); } catch { return fb; }
};

const site = read("content/site.json");
const market = read("content/market.json", { asOf: null, quotes: [] });
const status = read("content/status.json", { runs: [] });
const wire = read("content/wire.json", { fetchedAt: null, items: [], sourcesOk: 0, sourcesTotal: 0 });
const callResults = read("content/call-results.json", { resolvedAt: null, results: {}, errors: {} });
const chartbook = read("content/chartbook.json", { asOf: null, windowYears: 12, series: {}, errors: {} });
const communities = read("content/communities.json", { source: "none", communities: [], skipped: [], totalSales: 0, minSales: 30, windowDays: 365 });

const briefs = fs.existsSync(path.join(root, "content/briefs"))
  ? fs
      .readdirSync(path.join(root, "content/briefs"))
      .filter((f) => f.endsWith(".json"))
      .map((f) => read(`content/briefs/${f}`))
      .filter(Boolean)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  : [];

const calcMeta = CALCULATORS.map((c) => ({ slug: c.slug, name: c.name, category: c.category, blurb: c.blurb }));
const calcName = Object.fromEntries(CALCULATORS.map((c) => [c.slug, c.name]));

/* ---------- writing ---------- */
// A clean slate is preferable, but some environments mount this tree without
// delete permission. Overwriting in place is still a correct build, so a
// failed wipe is a warning rather than the end of the run.
try {
  fs.rmSync(dist, { recursive: true, force: true });
} catch {
  console.warn("Could not clear dist, overwriting in place.");
}
fs.mkdirSync(dist, { recursive: true });

/* ---------- assets, composed first so their hash can version the URLs ----------
   GitHub Pages serves /styles.css and /app.js with a cache lifetime, so a
   returning visitor can keep an old copy after a deploy. Stamping the URL with
   a hash of the contents means a changed file is a changed URL. */
const cssText = fs.readFileSync(path.join(root, "src/styles.css"), "utf8");
const appText = [
  fs.readFileSync(path.join(root, "src/app/calc.js"), "utf8"),
  fs.readFileSync(path.join(root, "src/app/motion.js"), "utf8"),
  fs.readFileSync(path.join(root, "src/app/live.js"), "utf8"),
  fs.readFileSync(path.join(root, "src/app/app.js"), "utf8"),
]
  .join("\n")
  .replace("__ML_ACCOUNT__", site.mailerlite.account)
  .replace("__ML_BRIEF__", site.mailerlite.briefFormId)
  .replace("__ML_LEAD__", site.mailerlite.leadFormId)
  /* The number lives in configuration and is rendered by code, here as
     everywhere else. A test fails if it is ever typed into a template. */
  .replace("__ML_WHATSAPP__", whatsappUrl(site) || "");

const hash = (t) => crypto.createHash("sha1").update(t).digest("hex").slice(0, 8);
const assets = { css: hash(cssText), js: hash(appText) };

// The chartbook PDF is built before the page that links to it, so the page
// can state its real length and size rather than carrying a typed guess.
const pdf = buildChartbookPdf(chartbook);
const pdfMeta = pdf ? { pages: pdfPageCount(chartbook), kb: Math.round(pdf.length / 1024) } : {};

// Sitemap lastmod. Google discards lastmod across a whole site once it finds
// it unreliable, so a page gets a date only where the build can point at the
// thing that dates it: a framework's reviewed date, a brief's publication
// date, or DAILY for the handful of pages that genuinely carry new figures on
// every run. Everything else ships no lastmod at all, which is what the spec
// is for. Stamping the build date on all 124 URLs, which is what this did
// until now, told Google every page changed twice a day and taught it to stop
// believing the field.
const DAILY = new Date().toISOString().slice(0, 10);
const latest = (dates) => dates.filter(Boolean).sort().pop() || "";

const written = [];
function emit(spec, lastmod = "") {
  const html = page({ site, market, assets, ...spec });
  const out = spec.path === "/404.html" ? "404.html" : path.join(spec.path.replace(/^\/|\/$/g, ""), "index.html");
  const full = path.join(dist, out);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  if (spec.path !== "/404.html" && !spec.noindex) written.push({ path: spec.path, lastmod });
}

// The library index and the compendium both change when any framework does.
const libraryReviewed = latest(playbooks.map((pb) => isoDate(pb.reviewed)));

// The live crypto figures, built once and handed to the pages that earn them.
// Only the crypto path and the frameworks that are actually about crypto: a
// live price band on a page about bond duration would be decoration.
const CRYPTO_PAGES = new Set([
  "settling-a-property-purchase-from-crypto",
  "proving-the-source-of-crypto-funds",
  "funding-a-payment-plan-from-a-volatile-asset",
  "crypto-concentration-and-property",
  "tokenised-property",
  "the-year-you-sell",
]);
const cryptoLive = cryptoBand(market, communities);
const cryptoLiveCompact = cryptoBand(market, communities, { compact: true });

/* ---------- pages ---------- */
emit(P.home({ site, market, brief: briefs[0], briefs, playbooks, calculators: calcMeta, wireHtml: wireStrip({ wire }), pathsHtml: pathBand({ paths }) }), DAILY);
emit(wirePage({ site, wire }), DAILY);

const playbookTitles = Object.fromEntries(playbooks.map((p) => [p.slug, p.title]));
emit(glossaryIndex({ site, terms: glossary }));
glossary.forEach((term) => emit(glossaryTerm({ site, term, terms: glossary, playbookTitles })));

// A community page exists only where the data supports one. The generator
// withholds the rest, so there is nothing here to guard against.
emit(communityIndex({ site, data: communities }), (communities.generatedAt || "").slice(0, 10));
(communities.communities || []).forEach((c) => emit(communityPage({ site, c, data: communities }), (communities.generatedAt || "").slice(0, 10)));
emit(P.briefIndex({ site, briefs }), latest(briefs.map((b) => b.date)));
briefs.forEach((b, i) => emit(P.briefPage({ site, brief: b, prev: briefs[i + 1], next: briefs[i - 1], briefs, playbooks }), b.date));
emit(pathIndex({ site, paths, playbooks, calculators: calcMeta }));
paths.forEach((p) => emit(pathPage({ site, p, paths, playbooks, calculators: calcMeta, glossary, liveBand: p.slug === "crypto-to-property" ? cryptoLive : "" })));
emit(P.playbookIndex({ site, playbooks }), libraryReviewed);
// Related frameworks are levelled so no page is left with nothing pointing
// at it. See src/related.mjs for why the obvious sort does not do that.
const { chosen: relatedBySlug } = pickRelated(playbooks);
playbooks.forEach((pb) => {
  emit(P.playbookPage({ site, pb, calcName: calcName[pb.calculator], related: relatedBySlug.get(pb.slug), briefs, liveBand: CRYPTO_PAGES.has(pb.slug) ? cryptoLiveCompact : "" }), isoDate(pb.reviewed));
});
emit(calcIndex({ site }));
const counts = { frameworks: playbooks.length, calculators: CALCULATORS.length };
CALCULATORS.forEach((calc) => emit(calcPage({ site, calc, counts })));
emit(playbookDoc({ site, playbooks, calculators: calcMeta, briefs }), libraryReviewed);
emit(chartbookPage({ site, data: chartbook, pdf: pdfMeta }), (chartbook.asOf || "").slice(0, 10));
emit(recordPage({ site, calls, results: callResults.results || {}, briefs }));
emit(P.dataPage({ site, market, status }), DAILY);
emit(P.staticPage({ site, title: `About. ${site.name}`, description: "Who writes Investments Playbook, what is on it, and what it deliberately is not.", path: "/about/", eyebrow: "About", heading: "The number in the advertisement, and the number that reaches your account.", bodyMd: STATIC.about }));
emit(P.staticPage({ site, title: `Editorial and disclosure standards. ${site.name}`, description: "How figures are sourced, how the daily brief is produced, how corrections are handled, and every commercial relationship declared.", path: "/disclosure/", eyebrow: "Editorial standards", heading: "How this is produced, and every conflict declared.", bodyMd: STATIC.disclosure }));
emit(P.staticPage({ site, title: `Privacy. ${site.name}`, description: "What this site collects, where it goes, and what the calculators never send anywhere.", path: "/privacy/", eyebrow: "Privacy", heading: "What is collected, and what never leaves your browser.", bodyMd: STATIC.privacy }));
emit(contactPage({ site }));
emit(P.notFound({ site }));

/* ---------- assets ---------- */
fs.writeFileSync(path.join(dist, "styles.css"), cssText);
fs.writeFileSync(path.join(dist, "app.js"), appText);

fs.writeFileSync(
  path.join(dist, "favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#000000"/><rect x="0" y="56" width="64" height="8" fill="#DC0000"/><text x="32" y="44" font-family="Georgia,serif" font-size="36" fill="#FFFFFF" text-anchor="middle">IP</text></svg>`
);

// The link preview card. Declared absolutely in every page's head, so a
// missing file is four platforms rendering a blank card and nobody noticing.
// seoaudit fails if it is not here.
fs.copyFileSync(path.join(root, "content", "og.png"), path.join(dist, "og.png"));
fs.copyFileSync(path.join(root, "content", "icon-512.png"), path.join(dist, "icon-512.png"));

// The typefaces, served from this origin. Copied rather than listed one by
// one so adding a weight is a matter of dropping the file in and adding the
// @font-face rule, with nothing to forget here.
fs.mkdirSync(path.join(dist, "fonts"), { recursive: true });
for (const f of fs.readdirSync(path.join(root, "content", "fonts"))) {
  fs.copyFileSync(path.join(root, "content", "fonts", f), path.join(dist, "fonts", f));
}

if (pdf) fs.writeFileSync(path.join(dist, "chartbook.pdf"), pdf);

// The crypto path's form promises this document in exchange for an email
// address, so the build produces it rather than trusting somebody to upload
// one. seoaudit fails if it is not here.
fs.writeFileSync(path.join(dist, "crypto-to-property-checklist.pdf"), buildCryptoChecklistPdf(site));
fs.writeFileSync(path.join(dist, "first-property-checklist.pdf"), buildFirstPropertyPdf(site));
fs.writeFileSync(path.join(dist, "feed.xml"), feed({ site, briefs }));
fs.writeFileSync(path.join(dist, "CNAME"), `${site.domain}\n`);
fs.writeFileSync(path.join(dist, ".nojekyll"), "");
fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`
);

// IndexNow's proof of control: a file at the root whose contents are the key.
// Nothing can be submitted until this is deployed, which is the point - it
// means a submission cannot run ahead of the pages it is submitting.
if (site.indexnow) fs.writeFileSync(path.join(dist, `${site.indexnow}.txt`), site.indexnow);

fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${written
    .map(({ path: u, lastmod }) => `  <url><loc>${site.origin}${u}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`)
    .join("\n")}\n</urlset>\n`);

// Machine readable feed of the library, for anyone who wants to cite it.
fs.writeFileSync(
  path.join(dist, "playbooks.json"),
  JSON.stringify(
    playbooks.map((p) => ({ slug: p.slug, title: p.title, category: p.category, summary: p.summary, url: `${site.origin}/playbooks/${p.slug}/` })),
    null,
    2
  )
);

console.log(`Built ${written.length} pages into dist.`);
console.log(`  ${calls.length} calls on record, ${briefs.filter((b) => b.correction).length} corrections.`);
console.log(`  chartbook.pdf ${pdf ? (pdf.length / 1024).toFixed(0) + 'KB' : 'not built, no data'}.`);
console.log(`  ${Object.keys(chartbook.series || {}).length} chartbook series, ${(communities.communities || []).length} community pages.`);
console.log(`  ${paths.length} starting paths.`);
console.log(`  ${playbooks.length} playbooks, ${CALCULATORS.length} calculators, ${briefs.length} briefs, ${(market.quotes || []).length} live quotes.`);
