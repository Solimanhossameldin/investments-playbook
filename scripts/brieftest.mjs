#!/usr/bin/env node
/* The brief's one link per item.

   Two clicks from fifty-eight opens is what a newsletter with no destination
   looks like. Every item now offers the framework behind its own number, and
   the checks that matter here are the ones that stop that link being wrong,
   because a dead or mismatched link in a daily email is worse than no link:
   it is sent to everybody at once, and it is the only thing they were asked
   to click.

   The mapping is tag to slug. The model drafting the brief emits free-text
   tags and never a URL, so it cannot invent a destination. This file makes
   sure the destinations it is given all exist. */

import assert from "node:assert/strict";
import MAP from "../content/brief-frameworks.mjs";
import playbooks from "../content/playbooks.mjs";
import { itemFramework } from "../src/templates/pages.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slugs = new Set(playbooks.map((p) => p.slug));

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`  pass  ${name}`); };

/* ---------------- the map cannot point at nothing ---------------- */

t("every framework the map points at exists", () => {
  const dead = Object.entries(MAP).filter(([, slug]) => !slugs.has(slug));
  assert.equal(dead.length, 0,
    `these tags point at frameworks that do not exist: ${dead.map(([k, v]) => `${k} -> ${v}`).join(", ")}`);
});

t("tags are lowercase, so a capitalised tag still matches", () => {
  const bad = Object.keys(MAP).filter((k) => k !== k.toLowerCase());
  assert.equal(bad.length, 0, `uppercase keys will never match: ${bad.join(", ")}`);
});

/* ---------------- resolution ---------------- */

t("a known tag resolves to its framework", () => {
  assert.equal(itemFramework({ tags: ["rates"] }, slugs), MAP.rates);
});

t("matching is case and whitespace insensitive, because a model wrote the tag", () => {
  assert.equal(itemFramework({ tags: ["  Rates "] }, slugs), MAP.rates);
});

t("the first tag that maps wins, later ones are ignored", () => {
  assert.equal(itemFramework({ tags: ["rates", "gold"] }, slugs), MAP.rates);
});

t("an unmapped tag is skipped rather than guessed at", () => {
  assert.equal(itemFramework({ tags: ["nonsense-tag"] }, slugs), "");
});

t("an unmapped tag before a mapped one does not block it", () => {
  assert.equal(itemFramework({ tags: ["nonsense-tag", "gold"] }, slugs), MAP.gold);
});

t("no tags at all produces no link", () => {
  assert.equal(itemFramework({}, slugs), "");
  assert.equal(itemFramework({ tags: [] }, slugs), "");
});

// The failure that would actually ship: somebody renames a framework, the map
// still points at the old slug, and every brief links to a 404.
t("a mapping to a framework that has been renamed renders nothing, not a dead link", () => {
  const shrunk = new Set([...slugs].filter((s) => s !== MAP.rates));
  assert.equal(itemFramework({ tags: ["rates"] }, shrunk), "");
});

/* ---------------- the drafting prompt knows the vocabulary ----------------
   Weaker than running the generator, which needs a model key, so this reads
   the source. It exists because the failure is silent and slow: the model
   invents tags nobody mapped, coverage decays one issue at a time, and the
   only symptom is items quietly losing their link. */

const gen = fs.readFileSync(path.join(root, "scripts/generate-brief.mjs"), "utf8");

t("the generator imports the tag vocabulary", () => {
  assert.match(gen, /import BRIEF_FRAMEWORKS from "\.\.\/content\/brief-frameworks\.mjs"/);
});

t("and interpolates it into the prompt rather than describing it", () => {
  assert.match(gen, /\$\{Object\.keys\(BRIEF_FRAMEWORKS\)\.join/,
    "the prompt must carry the actual list, or the model is guessing at tags");
});

t("the interpolation sits inside a template literal", () => {
  const i = gen.indexOf("Object.keys(BRIEF_FRAMEWORKS).join");
  const backticks = (gen.slice(0, i).match(/`/g) || []).length;
  assert.equal(backticks % 2, 1,
    "an odd count means the expression is inside a template literal and will interpolate");
});

/* ---------------- coverage on the real issues ---------------- */

const dir = path.join(root, "content/briefs");
const briefs = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
  : [];

let items = 0, linked = 0;
const unmapped = new Set();
for (const b of briefs) {
  for (const it of b.items || []) {
    items++;
    if (itemFramework(it, slugs)) linked++;
    else for (const tag of it.tags || []) unmapped.add(String(tag).toLowerCase().trim());
  }
}

t("every published item gets a link", () => {
  assert.equal(linked, items,
    `${items - linked} of ${items} items have no framework. Unmapped tags: ${[...unmapped].join(", ") || "none"}`);
});

console.log(
  `\nbrief: ${n} checks passed. ${linked} of ${items} published items linked, ${Object.keys(MAP).length} tags mapped.`
);
