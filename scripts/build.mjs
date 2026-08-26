#!/usr/bin/env node
// Static site build. Zero dependencies. Reads content, writes dist.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { page } from "../src/templates/layout.mjs";
import * as P from "../src/templates/pages.mjs";
import { CALCULATORS, calcIndex, calcPage } from "../src/templates/calculators.mjs";
import playbooks from "../content/playbooks.mjs";
import * as STATIC from "../content/static.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const read = (p, fb) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, p), "utf8")); } catch { return fb; }
};

const site = read("content/site.json");
const market = read("content/market.json", { asOf: null, quotes: [] });
const status = read("content/status.json", { runs: [] });

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
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const written = [];
function emit(spec) {
  const html = page({ site, market, ...spec });
  const out = spec.path === "/404.html" ? "404.html" : path.join(spec.path.replace(/^\/|\/$/g, ""), "index.html");
  const full = path.join(dist, out);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
  if (spec.path !== "/404.html") written.push(spec.path);
}

/* ---------- pages ---------- */
emit(P.home({ site, market, brief: briefs[0], playbooks, calculators: calcMeta }));
emit(P.briefIndex({ site, briefs }));
briefs.forEach((b, i) => emit(P.briefPage({ site, brief: b, prev: briefs[i + 1], next: briefs[i - 1] })));
emit(P.playbookIndex({ site, playbooks }));
playbooks.forEach((pb) => {
  const related = playbooks
    .filter((o) => o.slug !== pb.slug)
    .sort((a, b) => (a.category === pb.category ? -1 : 1) - (b.category === pb.category ? -1 : 1) || a.tier - b.tier)
    .slice(0, 4);
  emit(P.playbookPage({ site, pb, calcName: calcName[pb.calculator], related }));
});
emit(calcIndex({ site }));
CALCULATORS.forEach((calc) => emit(calcPage({ site, calc })));
emit(P.dataPage({ site, market, status }));
emit(P.staticPage({ site, title: `About. ${site.name}`, description: "Who writes Investments Playbook, what is on it, and what it deliberately is not.", path: "/about/", eyebrow: "About", heading: "The number in the advertisement, and the number that reaches your account.", bodyMd: STATIC.about }));
emit(P.staticPage({ site, title: `Editorial and disclosure standards. ${site.name}`, description: "How figures are sourced, how the daily brief is produced, how corrections are handled, and every commercial relationship declared.", path: "/disclosure/", eyebrow: "Editorial standards", heading: "How this is produced, and every conflict declared.", bodyMd: STATIC.disclosure }));
emit(P.staticPage({ site, title: `Privacy. ${site.name}`, description: "What this site collects, where it goes, and what the calculators never send anywhere.", path: "/privacy/", eyebrow: "Privacy", heading: "What is collected, and what never leaves your browser.", bodyMd: STATIC.privacy }));
emit(P.notFound({ site }));

/* ---------- assets ---------- */
fs.copyFileSync(path.join(root, "src/styles.css"), path.join(dist, "styles.css"));

const app = [
  fs.readFileSync(path.join(root, "src/app/calc.js"), "utf8"),
  fs.readFileSync(path.join(root, "src/app/app.js"), "utf8"),
]
  .join("\n")
  .replace("__ML_ACCOUNT__", site.mailerlite.account)
  .replace("__ML_BRIEF__", site.mailerlite.briefFormId)
  .replace("__ML_LEAD__", site.mailerlite.leadFormId);
fs.writeFileSync(path.join(dist, "app.js"), app);

fs.writeFileSync(
  path.join(dist, "favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0A1628"/><text x="32" y="45" font-family="Georgia,serif" font-size="38" fill="#C9A961" text-anchor="middle">IP</text></svg>`
);

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
console.log(`  ${playbooks.length} playbooks, ${CALCULATORS.length} calculators, ${briefs.length} briefs, ${(market.quotes || []).length} live quotes.`);
