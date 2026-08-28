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
import { contactPage } from "../src/templates/contact.mjs";
import { buildChartbookPdf, pdfPageCount } from "./make-chartbook-pdf.mjs";
import calls from "../content/calls.mjs";
import glossary from "../content/glossary.mjs";
import { playbookDoc } from "../src/templates/document.mjs";
import playbooks from "../content/playbooks.mjs";
import paths from "../content/paths.mjs";
import * as STATIC from "../content/static.mjs";
import { pickRelated } from "../src/related.mjs";

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
  .replace("__ML_LEAD__", site.mailerlite.leadFormId);

const hash = (t) => crypto.createHash("sha1").update(t).digest("hex").slice(0, 8);
const assets = { css: hash(cssText), js: hash(appText) };

// The chartbook PDF is built before the page that links to it, so the page
// can state its real length and size rather than carrying a typed guess.
const pdf = buildChartbookPdf(chartbook);
const pdfMeta = pdf ? { pages: pdfPageCount(chartbook), kb: Math.round(pdf.length / 1024) } : {};

const written = [];
function emit(spec) {
  const html = page({ site, market, assets, ...spec });
  const out = spec.path === "/404.html" ? "404.html" : path.join(spec.path.replace(/^\/|\/$/g, ""), "index.html");
  const full = path.join(dist, out);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  if (spec.path !== "/404.html" && !spec.noindex) written.push(spec.path);
}

/* ---------- pages ---------- */
emit(P.home({ site, market, brief: briefs[0], playbooks, calculators: calcMeta, wireHtml: wireStrip({ wire }), pathsHtml: pathBand({ paths }) }));
emit(wirePage({ site, wire }));

const playbookTitles = Object.fromEntries(playbooks.map((p) => [p.slug, p.title]));
emit(glossaryIndex({ site, terms: glossary }));
glossary.forEach((term) => emit(glossaryTerm({ site, term, terms: glossary, playbookTitles })));

// A community page exists only where the data supports one. The generator
// withholds the rest, so there is nothing here to guard against.
emit(communityIndex({ site, data: communities }));
(communities.communities || []).forEach((c) => emit(communityPage({ site, c, data: communities })));
emit(P.briefIndex({ site, briefs }));
briefs.forEach((b, i) => emit(P.briefPage({ site, brief: b, prev: briefs[i + 1], next: briefs[i - 1] })));
emit(pathIndex({ site, paths, playbooks, calculators: calcMeta }));
paths.forEach((p) => emit(pathPage({ site, p, paths, playbooks, calculators: calcMeta, glossary })));
emit(P.playbookIndex({ site, playbooks }));
// Related frameworks are levelled so no page is left with nothing pointing
// at it. See src/related.mjs for why the obvious sort does not do that.
const { chosen: relatedBySlug } = pickRelated(playbooks);
playbooks.forEach((pb) => {
  emit(P.playbookPage({ site, pb, calcName: calcName[pb.calculator], related: relatedBySlug.get(pb.slug) }));
});
emit(calcIndex({ site }));
const counts = { frameworks: playbooks.length, calculators: CALCULATORS.length };
CALCULATORS.forEach((calc) => emit(calcPage({ site, calc, counts })));
emit(playbookDoc({ site, playbooks, calculators: calcMeta }));
emit(chartbookPage({ site, data: chartbook, pdf: pdfMeta }));
emit(recordPage({ site, calls, results: callResults.results || {}, briefs }));
emit(P.dataPage({ site, market, status }));
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

if (pdf) fs.writeFileSync(path.join(dist, "chartbook.pdf"), pdf);
fs.writeFileSync(path.join(dist, "CNAME"), `${site.domain}\n`);
fs.writeFileSync(path.join(dist, ".nojekyll"), "");
fs.writeFileSync(
  path.join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${site.origin}/sitemap.xml\n`
);

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${written
    .map((u) => `  <url><loc>${site.origin}${u}</loc><lastmod>${today}</lastmod></url>`)
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
