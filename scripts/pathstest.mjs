#!/usr/bin/env node
// Tests for the starting paths.
//
// A path page is entirely made of references: forty framework slugs, seven
// calculator slugs, forty-seven glossary slugs and six intent strings, none
// of which it owns. That makes it the easiest page on the site to break by
// renaming something somewhere else, and the hardest to notice. Every check
// below exists to turn one of those silent breakages into a failed build.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { INTENTS } from "../src/lib.mjs";
import { pathIndex, pathPage, pathBand, playbookHref } from "../src/templates/paths.mjs";
import { CALCULATORS } from "../src/templates/calculators.mjs";
import { leadForm } from "../src/templates/layout.mjs";
import paths from "../content/paths.mjs";
import playbooks from "../content/playbooks.mjs";
import glossary from "../content/glossary.mjs";

let n = 0;
const t = (name, fn) => { fn(); n++; };

const site = {
  name: "Test",
  origin: "https://example.com",
  disclaimer: "Nothing here is advice.",
};
const calcMeta = CALCULATORS.map((c) => ({ slug: c.slug, name: c.name, category: c.category, blurb: c.blurb }));

const pbSlugs = new Set(playbooks.map((p) => p.slug));
const calcSlugs = new Set(calcMeta.map((c) => c.slug));
const termSlugs = new Set(glossary.map((g) => g.slug));

/* ---------- every reference resolves ---------- */
t("every framework a path names exists", () => {
  for (const p of paths) {
    for (const s of p.order) {
      assert.ok(pbSlugs.has(s), `${p.slug} points at a framework that does not exist: ${s}`);
    }
  }
});

t("every calculator a path names exists", () => {
  for (const p of paths) {
    for (const s of p.calculators) {
      assert.ok(calcSlugs.has(s), `${p.slug} points at a calculator that does not exist: ${s}`);
    }
  }
});

t("every glossary term a path names exists", () => {
  for (const p of paths) {
    for (const s of p.terms) {
      assert.ok(termSlugs.has(s), `${p.slug} points at a glossary term that does not exist: ${s}`);
    }
  }
});

t("no path repeats an item within itself", () => {
  for (const p of paths) {
    for (const [field, list] of [["order", p.order], ["calculators", p.calculators], ["terms", p.terms]]) {
      assert.equal(new Set(list).size, list.length, `${p.slug} repeats an entry in ${field}`);
    }
  }
});

/* ---------- the intent mapping, both directions ----------
   This is the pair of checks that matters most. An intent that is not on the
   form produces a subscriber matching no MailerLite segment, who therefore
   receives the delivery email and then nothing at all, silently and for ever.
   The failure has no symptom on the site. */
t("every path's intent is an option the form actually offers", () => {
  const offered = new Set(INTENTS);
  for (const p of paths) {
    assert.ok(offered.has(p.intent), `${p.slug} claims an intent the form does not offer: ${p.intent}`);
  }
});

t("every intent the form offers has a path leading to it", () => {
  const claimed = new Set(paths.map((p) => p.intent));
  for (const i of INTENTS) {
    assert.ok(claimed.has(i), `no path routes a reader to the intent: ${i}`);
  }
});

t("no two paths claim the same intent", () => {
  const seen = new Set();
  for (const p of paths) {
    assert.ok(!seen.has(p.intent), `two paths claim the same intent: ${p.intent}`);
    seen.add(p.intent);
  }
});

t("the intent in the link is the exact string the form's option carries", () => {
  const form = leadForm(site);
  for (const p of paths) {
    const href = playbookHref(p);
    const sent = decodeURIComponent(new URL(href, "https://example.com").searchParams.get("intent"));
    assert.equal(sent, p.intent, `${p.slug} sends a different intent than it declares`);
    assert.ok(
      form.includes(`<option value="${sent}">`),
      `${p.slug} sends an intent with no matching option element: ${sent}`
    );
  }
});

t("the query string precedes the fragment, or the browser never sees it", () => {
  for (const p of paths) {
    const href = playbookHref(p);
    assert.ok(href.indexOf("?") < href.indexOf("#"), `${p.slug} puts the query inside the fragment: ${href}`);
    assert.ok(new URL(href, "https://example.com").searchParams.has("intent"), `${p.slug} has no readable intent`);
  }
});

/* ---------- shape ---------- */
t("slugs are unique and url safe", () => {
  const seen = new Set();
  for (const p of paths) {
    assert.match(p.slug, /^[a-z0-9-]+$/, `${p.slug} is not a safe slug`);
    assert.ok(!seen.has(p.slug), `duplicate path slug: ${p.slug}`);
    seen.add(p.slug);
  }
});

t("no path is thin", () => {
  for (const p of paths) {
    assert.ok(p.order.length >= 5, `${p.slug} has too few frameworks to be worth a page`);
    assert.ok(p.calculators.length >= 1, `${p.slug} offers no calculator`);
    assert.ok(p.terms.length >= 4, `${p.slug} defines too few terms`);
  }
});

t("every path carries its own prose", () => {
  const seen = { lede: new Set(), blurb: new Set(), close: new Set() };
  for (const p of paths) {
    for (const f of ["label", "title", "blurb", "lede", "close"]) {
      assert.ok(typeof p[f] === "string" && p[f].trim().length > 0, `${p.slug} is missing ${f}`);
    }
    for (const f of ["lede", "blurb", "close"]) {
      assert.ok(!seen[f].has(p[f]), `${p.slug} reuses another path's ${f}`);
      seen[f].add(p[f]);
    }
  }
});

/* ---------- the prose rule the rest of the site follows ----------
   Numbers on this site are computed at build time, never written into copy,
   because a number typed into a sentence is wrong the week after it is
   typed. The path pages quote counts, so the counts must come from the
   arrays. */
t("no path writes a count into its own prose", () => {
  for (const p of paths) {
    for (const f of ["blurb", "lede", "close"]) {
      assert.ok(
        !/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(frameworks?|calculators?|terms?|pages?|ideas?|steps?)\b/i.test(p[f]),
        `${p.slug} types a count into ${f} instead of rendering it`
      );
    }
  }
});

/* ---------- rendering ---------- */
const rendered = paths.map((p) =>
  pathPage({ site, p, paths, playbooks, calculators: calcMeta, glossary })
);
const index = pathIndex({ site, paths, playbooks, calculators: calcMeta });

t("nothing renders as a broken value", () => {
  for (const r of [...rendered, index]) {
    assert.ok(!/NaN|undefined|null|Invalid Date/.test(r.body), `${r.path} rendered a broken value`);
  }
});

t("each page links every framework it lists, in the order it declares", () => {
  rendered.forEach((r, i) => {
    const p = paths[i];
    const found = [...r.body.matchAll(/href="\/playbooks\/([a-z0-9-]+)\//g)].map((m) => m[1]);
    assert.deepEqual(found.slice(0, p.order.length), p.order, `${p.slug} renders its frameworks out of order`);
  });
});

t("the counts on the page are the real counts", () => {
  assert.ok(index.body.includes(`${playbooks.length} frameworks`), "the index advertises a framework count it did not count");
  assert.ok(index.body.includes(`${CALCULATORS.length} calculators`), "the index advertises a calculator count it did not count");
  rendered.forEach((r, i) => {
    assert.ok(
      r.body.includes(`${paths[i].order.length} frameworks`),
      `${paths[i].slug} advertises a step count it did not count`
    );
  });
});

t("every path page offers a way to the other five", () => {
  rendered.forEach((r, i) => {
    for (const other of paths) {
      if (other.slug === paths[i].slug) continue;
      assert.ok(r.body.includes(`/start/${other.slug}/`), `${paths[i].slug} does not link to ${other.slug}`);
    }
    assert.ok(!r.body.includes(`href="/start/${paths[i].slug}/"`), `${paths[i].slug} links to itself`);
  });
});

t("the index links every path and the band links every path", () => {
  const band = pathBand({ paths });
  for (const p of paths) {
    assert.ok(index.body.includes(`/start/${p.slug}/`), `the index does not link ${p.slug}`);
    assert.ok(band.includes(`/start/${p.slug}/`), `the homepage band does not link ${p.slug}`);
  }
});

t("titles and descriptions stay inside the search limits", () => {
  for (const r of [...rendered, index]) {
    assert.ok(r.title.length <= 60, `${r.path} has a title of ${r.title.length} characters`);
    assert.ok(r.description.length <= 155, `${r.path} has a description of ${r.description.length} characters`);
    assert.ok(r.description.length > 40, `${r.path} has a description too short to be useful`);
  }
});

t("paths are on their own routes and do not collide with anything", () => {
  const taken = new Set([
    ...playbooks.map((p) => `/playbooks/${p.slug}/`),
    ...glossary.map((g) => `/glossary/${g.slug}/`),
    ...CALCULATORS.map((c) => `/calculators/${c.slug}/`),
  ]);
  const seen = new Set();
  for (const r of [...rendered, index]) {
    assert.ok(!taken.has(r.path), `${r.path} collides with an existing page`);
    assert.ok(!seen.has(r.path), `two paths emit ${r.path}`);
    seen.add(r.path);
  }
});

t("every page carries the disclaimer", () => {
  for (const r of [...rendered, index]) {
    assert.ok(r.body.includes(site.disclaimer), `${r.path} drops the risk disclaimer`);
  }
});

t("the index says plainly that a path is not a recommendation", () => {
  assert.ok(/recommendation/i.test(index.body), "the index does not use the word recommendation");
  assert.ok(/not advice/i.test(index.body), "the index does not say plainly that a path is not advice");
});

/* ---------- the client that reads the intent back ----------
   Asserting that the source contains the right characters proves nothing
   about what it does. The block is lifted out of app.js and run against a
   stub select, so these are the shipped lines executing, not a copy of them
   that can drift. */
const runtimeSrc = readFileSync(new URL("../src/app/app.js", import.meta.url), "utf8");
const block = runtimeSrc.match(/\/\* -+ intent carried in from a path page[\s\S]*?\n  \}\)\(\);/);
assert.ok(block, "the intent block is no longer in app.js under its own heading");

function runtimeSelects(search) {
  const select = {
    name: "intent",
    selectedIndex: 0,
    options: ["", ...INTENTS].map((value) => ({ value })),
  };
  const location = { search };
  const document = {
    querySelectorAll(sel) {
      return sel.includes("[name=intent]") ? [select] : [];
    },
  };
  new Function("location", "document", "URLSearchParams", block[0])(location, document, URLSearchParams);
  return select.options[select.selectedIndex].value;
}

t("an intent arriving from a path page is selected on the form", () => {
  for (const p of paths) {
    const search = new URL(playbookHref(p), "https://example.com").search;
    assert.equal(runtimeSelects(search), p.intent, `${p.slug} did not preselect its own intent`);
  }
});

t("a value the form does not offer is ignored rather than written through", () => {
  for (const bad of ["?intent=Buy%20me%20a%20boat", "?intent=", "?intent=<script>", "?other=1", ""]) {
    assert.equal(runtimeSelects(bad), "", `a crafted query string set the intent: ${bad}`);
  }
});


console.log(
  `paths: ${n} checks passed across ${paths.length} paths, ${paths.reduce((a, p) => a + p.order.length, 0)} referenced frameworks.`
);
