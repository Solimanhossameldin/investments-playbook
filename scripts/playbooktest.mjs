#!/usr/bin/env node
/* The library is the asset, so its shape is worth enforcing. The check that
   earns its keep here is the internal link one: a body that links to
   /playbooks/something-that-does-not-exist/ builds cleanly, deploys cleanly,
   and 404s for a reader. Nothing else catches that. */

import playbooks from "../content/playbooks.mjs";
import glossary from "../content/glossary.mjs";
import { CALCULATORS } from "../src/templates/calculators.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, got) => {
  if (cond) pass++;
  else { fail++; console.log(`  FAIL  ${name}${got === undefined ? "" : `\n        ${got}`}`); }
};

const slugs = new Set(playbooks.map((p) => p.slug));
const calcSlugs = new Set(CALCULATORS.map((c) => c.slug));
const termSlugs = new Set(glossary.map((t) => t.slug));
const CATS = ["portfolio", "property", "risk", "valuation", "cross-asset", "behavioural", "tax"];

const seen = new Set();

for (const p of playbooks) {
  const id = p.slug || p.title;

  ok(`${id}: has every required field`,
    !!(p.slug && p.title && p.category && p.tier && p.summary && p.body && p.formula &&
       p.failureModes && p.whenToUse && p.sources && p.reviewed));

  ok(`${id}: slug is unique`, !seen.has(p.slug), p.slug);
  seen.add(p.slug);
  ok(`${id}: slug is url safe`, /^[a-z0-9-]+$/.test(p.slug), p.slug);
  ok(`${id}: category is known`, CATS.includes(p.category), p.category);
  ok(`${id}: tier is 1 or 2`, [1, 2].includes(p.tier), p.tier);

  /* ---- the summary is what an answer engine lifts ---- */
  const sm = p.summary.trim();
  ok(`${id}: summary ends in a full stop`, sm.endsWith("."), sm.slice(-40));
  ok(`${id}: summary is a single sentence`,
    (sm.slice(0, -1).match(/[.!?]\s+[A-Z]/g) || []).length === 0, sm);
  ok(`${id}: summary is long enough`, sm.length >= 100, `${sm.length} chars`);
  ok(`${id}: summary is short enough to be lifted`, sm.length <= 400, `${sm.length} chars`);
  ok(`${id}: summary does not open with a pronoun`,
    !/^(It|This|These|They|Those|Such)\b/.test(sm), sm.slice(0, 40));

  /* ---- the honest list is not optional ---- */
  ok(`${id}: has at least three failure modes`, p.failureModes.length >= 3, p.failureModes.length);
  ok(`${id}: every failure mode is a real sentence`,
    p.failureModes.every((f) => f.trim().length >= 40 && f.trim().endsWith(".")));

  /* ---- sources ---- */
  ok(`${id}: has at least one source`, p.sources.length >= 1);
  ok(`${id}: every source has a name and an https url`,
    p.sources.every((x) => x.name && /^https:\/\//.test(x.url)),
    JSON.stringify(p.sources.filter((x) => !x.name || !/^https:\/\//.test(x.url))));

  /* ---- links inside the prose have to resolve ---- */
  const prose = `${p.body} ${p.formula} ${p.whenToUse} ${p.failureModes.join(" ")}`;
  for (const m of prose.matchAll(/\/playbooks\/([a-z0-9-]+)\//g)) {
    ok(`${id}: links to an existing playbook "${m[1]}"`, slugs.has(m[1]));
    ok(`${id}: does not link to itself`, m[1] !== p.slug);
  }
  for (const m of prose.matchAll(/\/glossary\/([a-z0-9-]+)\//g)) {
    ok(`${id}: links to an existing glossary term "${m[1]}"`, termSlugs.has(m[1]));
  }

  if (p.calculator) ok(`${id}: calculator "${p.calculator}" exists`, calcSlugs.has(p.calculator));

  /* ---- house style ---- */
  ok(`${id}: no em dash anywhere`, !/—/.test(prose + p.summary));
  ok(`${id}: no middot`, !/·/.test(prose + p.summary));
}

/* ---- the library as a whole ---- */
ok("every calculator points at a playbook that exists",
  CALCULATORS.every((c) => !c.playbook || slugs.has(c.playbook)),
  CALCULATORS.filter((c) => c.playbook && !slugs.has(c.playbook)).map((c) => c.slug).join(", "));

console.log(`\n${fail === 0 ? `All ${pass} playbook checks passed across ${playbooks.length} frameworks.` : `${fail} FAILED, ${pass} passed.`}`);
process.exit(fail === 0 ? 0 : 1);
