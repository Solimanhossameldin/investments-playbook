#!/usr/bin/env node
/* The Dataset nodes.

   These pages exist to be cited, which is exactly why what they assert about
   themselves has to be narrower than it is tempting to make it. The failure
   this file guards has already happened twice on this site: a machine-readable
   CC-BY on a Dataset whose rows are other people's published figures. It was
   caught and removed on the price index; it sat on the service charge
   template for weeks afterwards, unseen because that page does not build
   while the dataset is empty. An audit over built HTML cannot see a page that
   was never built, so these checks call the templates directly with synthetic
   rows.

   The rule: the compilation is the site's to give away and the figures are
   not, so a Dataset may carry attribution and provenance but not a licence. */

import { serviceChargePage } from "../src/templates/service-charges.mjs";
import { chartbookPage, US_GOV_WORK } from "../src/templates/chartbook.mjs";
import { readFileSync } from "node:fs";

const site = JSON.parse(readFileSync(new URL("../content/site.json", import.meta.url), "utf8"));

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  pass  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? `\n        ${detail}` : ""}`); }
};

/* Synthetic rows, so the page can be rendered while the real dataset is
   empty. The shape is whatever src/servicecharges.mjs requires. */
const rows = [
  { project: "Tower A", area: "Dubai Marina", psf: 18.5, period: "2026", source: "Dubai Pulse", sourceUrl: "https://example.org/a", retrievedAt: "2026-10-01" },
  { project: "Tower B", area: "Downtown", psf: 24, period: "2026", source: "Mollak", sourceUrl: "https://example.org/b", retrievedAt: "2026-10-02" },
  { project: "Tower C", area: "Dubai Marina", psf: 12, period: "2025", source: "Dubai Pulse", sourceUrl: "https://example.org/a", retrievedAt: "2026-09-30" },
];
const index = {
  rows, count: rows.length,
  median: 18.5, low: 12, high: 24,
  areas: ["Dubai Marina", "Downtown"],
  sources: ["Dubai Pulse", "Mollak"],
  retrievedFrom: "2026-09-30", retrievedTo: "2026-10-02",
};

const page = serviceChargePage({ site, index });
const datasets = (page.jsonld || []).filter((n) => n && n["@type"] === "Dataset");

ok("the service charge page emits a Dataset node", datasets.length === 1, `got ${datasets.length}`);

for (const d of datasets) {
  /* The whole point of this file. */
  ok(`Dataset "${d.name}" asserts no licence over figures it does not own`,
    d.license === undefined && d.licence === undefined,
    `license: ${JSON.stringify(d.license ?? d.licence)}`);

  ok(`Dataset "${d.name}" says where the figures came from instead`,
    Array.isArray(d.isBasedOn) ? d.isBasedOn.length > 0 : typeof d.isBasedOn === "string" && d.isBasedOn.length > 0,
    `isBasedOn: ${JSON.stringify(d.isBasedOn)}`);

  ok(`Dataset "${d.name}" bases itself on every distinct row source, and no more`,
    JSON.stringify([...(Array.isArray(d.isBasedOn) ? d.isBasedOn : [d.isBasedOn])].sort()) ===
      JSON.stringify([...new Set(rows.map((r) => r.sourceUrl))].sort()),
    `isBasedOn: ${JSON.stringify(d.isBasedOn)}`);

  ok(`Dataset "${d.name}" still says it is free to read`, d.isAccessibleForFree === true);
  ok(`Dataset "${d.name}" names a creator`, Boolean(d.creator && d.creator.name));

  const v = d.variableMeasured;
  const vs = Array.isArray(v) ? v : [v];
  ok(`Dataset "${d.name}" measures something, with a unit`,
    vs.length > 0 && vs.every((x) => x && x["@type"] === "PropertyValue" && x.name),
    JSON.stringify(vs).slice(0, 120));
  const sc = vs.find((x) => x && /service charge/i.test(x.name || ""));
  if (sc) {
    ok("the measured range is the range of the rows, not a rounded claim",
      sc.minValue === Math.min(...rows.map((r) => r.psf)) &&
      sc.maxValue === Math.max(...rows.map((r) => r.psf)),
      `${sc.minValue}-${sc.maxValue} vs ${Math.min(...rows.map((r) => r.psf))}-${Math.max(...rows.map((r) => r.psf))}`);
  }
}

/* The page's words have to carry the qualification the markup gave up. A
   licence removed from the JSON-LD and left implied in the prose is the same
   claim in a quieter voice. */
ok("the page tells a reader the figures belong to the bodies that published them",
  /each figure belongs to the body that approved and published it/i.test(page.body),
  "the compilation-versus-figures distinction is not stated on the page");

ok("the page still invites citation of the compilation",
  /free to quote/i.test(page.body));

/* ---- the chartbook ----

   Same rule, and a second one on top of it. This page invites the reader to
   republish, so the sentence that does the inviting is a legal claim and has
   to be true of every series it covers. It was not: six of the seven are
   federal statistical products, and the thirty-year mortgage rate is Freddie
   Mac's while the breakeven series is a Federal Reserve Bank's. Neither is a
   work of the United States government. */
{
  const chartbook = JSON.parse(readFileSync(new URL("../content/chartbook.json", import.meta.url), "utf8"));
  const series = Object.values(chartbook.series || {});
  ok("the chartbook dataset has series to check", series.length > 0, `${series.length}`);

  /* Forces the decision rather than letting a new series inherit a
     convenient answer. */
  /* The two that are not, pinned by name.

     The classification is a claim about who those bodies are, and no code can
     check that. What it can do is refuse to let the claim be reversed
     quietly: flipping Freddie Mac to true removes a true warning from a page
     that invites republication, and on its own that change failed nothing --
     it simply stopped the warning being tested. Anyone who thinks the law
     reads otherwise has to come and change this check and say why, which is
     where that argument belongs. */
  const NOT_GOV = {
    "Freddie Mac via FRED":
      "the Federal Home Loan Mortgage Corporation is a shareholder-owned enterprise in FHFA conservatorship, not a federal agency; the Primary Mortgage Market Survey carries its own terms",
    "Federal Reserve Bank of St. Louis":
      "a regional Reserve Bank is a federally chartered corporation rather than an agency of the United States, and FRED asserts terms over its own derived series",
  };
  for (const [source, why] of Object.entries(NOT_GOV)) {
    ok(`${source} is not treated as a work of the United States government`,
      US_GOV_WORK[source] === false, why);
  }

  const unclassified = series.filter((x) => US_GOV_WORK[x.source] === undefined);
  ok("every chartbook series' publisher is classified as a government work or not",
    unclassified.length === 0,
    `unclassified: ${unclassified.map((x) => `${x.key} (${x.source})`).join(", ")}`);

  const page = chartbookPage({ site, data: chartbook, pdf: {} });
  const ds = (page.jsonld || []).filter((n) => n && n["@type"] === "Dataset");
  ok("the chartbook emits a Dataset node", ds.length === 1, `got ${ds.length}`);

  for (const d of ds) {
    ok("the chartbook Dataset asserts no blanket licence",
      d.license === undefined && d.licence === undefined,
      `license: ${JSON.stringify(d.license ?? d.licence)}`);
    ok("the chartbook Dataset credits the compilation to this site, not to its distributor",
      d.creator && d.creator.name === site.name, JSON.stringify(d.creator));
    ok("the chartbook Dataset is based on every series URL, and no more",
      JSON.stringify([...(d.isBasedOn || [])].sort()) ===
        JSON.stringify([...new Set(series.map((x) => x.sourceUrl))].sort()),
      JSON.stringify(d.isBasedOn));
  }

  /* The prose claim. If any series is not a government work, the page may not
     tell the reader that everything on it is. */
  const restricted = series.filter((x) => US_GOV_WORK[x.source] !== true);
  const blanket = /Everything here is drawn from series produced by agencies of the United States government/i.test(page.body);
  ok("the page makes the blanket §105 claim only when it is true of every series",
    restricted.length === 0 ? blanket : !blanket,
    restricted.length
      ? `${restricted.length} restricted series, yet the page claims all are government works`
      : "every series is a government work, yet the page does not say so");

  for (const r of restricted) {
    ok(`the page names ${r.key} as its publisher's, not the government's`,
      page.body.includes(r.source.replace(/ via FRED$/, "")) && page.body.includes(r.label),
      `expected "${r.source.replace(/ via FRED$/, "")}" and "${r.label}" in the reuse note`);
  }
  if (restricted.length) {
    ok("the page tells the reader whose terms to check instead",
      /publisher's own terms apply/i.test(page.body));
    ok("the page does not lowercase an acronym in a series label",
      !/\bus \d+-year/.test(page.body), "found \"us 30-year\" style label");
  }
}

console.log(`\ndataset: ${pass} checks passed${fail ? `, ${fail} FAILED` : ""}.`);
process.exit(fail ? 1 : 0);
