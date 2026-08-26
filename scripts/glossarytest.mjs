#!/usr/bin/env node
/* The glossary's value is entirely in the first sentence of each entry being
   liftable on its own. That is a format promise, and a format promise that is
   not tested is a format promise that decays on the twentieth entry. */

import glossary from "../content/glossary.mjs";
import playbooks from "../content/playbooks.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, got) => {
  if (cond) pass++;
  else { fail++; console.log(`  FAIL  ${name}${got === undefined ? "" : `\n        ${got}`}`); }
};

const slugs = new Set();
const pbSlugs = new Set(playbooks.map((p) => p.slug));
const termSlugs = new Set(glossary.map((t) => t.slug));

for (const t of glossary) {
  const id = t.slug || t.term;

  ok(`${id}: has a term, slug, definition, body and trap`,
    !!(t.term && t.slug && t.definition && t.body && t.trap));

  ok(`${id}: slug is unique`, !slugs.has(t.slug), t.slug);
  slugs.add(t.slug);

  ok(`${id}: slug is url safe`, /^[a-z0-9-]+$/.test(t.slug), t.slug);

  /* ---- the definition is the product ---- */
  const d = t.definition.trim();

  ok(`${id}: definition ends in a full stop`, d.endsWith("."), d.slice(-40));

  // One sentence. A full stop followed by a space and a capital starts another.
  const sentenceBreaks = (d.slice(0, -1).match(/[.!?]\s+[A-Z]/g) || []).length;
  ok(`${id}: definition is a single sentence`, sentenceBreaks === 0, d);

  ok(`${id}: definition is long enough to be useful`, d.length >= 80, `${d.length} chars`);
  ok(`${id}: definition is short enough to be lifted`, d.length <= 340, `${d.length} chars`);

  // It has to stand alone, so it cannot open by referring to something else.
  ok(`${id}: definition does not open with a pronoun`,
    !/^(It|This|These|They|Those|Such)\b/.test(d), d.slice(0, 40));

  /* ---- house style ---- */
  for (const [label, re] of [["em dash", /—/], ["en dash as separator", /\s–\s/], ["middot", /·/]]) {
    ok(`${id}: no ${label} anywhere in the entry`,
      !re.test(t.definition + t.body + t.trap));
  }

  /* ---- the trap earns the page ---- */
  ok(`${id}: trap is a real sentence`, t.trap.trim().length >= 40 && t.trap.trim().endsWith("."), t.trap);

  /* ---- links resolve ---- */
  for (const r of t.related || []) {
    ok(`${id}: related term "${r}" exists`, termSlugs.has(r));
    ok(`${id}: does not relate to itself`, r !== t.slug);
  }
  if (t.playbook) ok(`${id}: playbook "${t.playbook}" exists`, pbSlugs.has(t.playbook));

  ok(`${id}: category is known`,
    ["property", "markets", "tax", "behaviour"].includes(t.category), t.category);
}

/* ---- the set as a whole ---- */
ok("every term is reachable from at least one other term or is linked from a playbook",
  glossary.every((t) =>
    glossary.some((o) => o.slug !== t.slug && (o.related || []).includes(t.slug)) || !!t.playbook
  ),
  glossary
    .filter((t) => !glossary.some((o) => o.slug !== t.slug && (o.related || []).includes(t.slug)) && !t.playbook)
    .map((t) => t.slug)
    .join(", ")
);

console.log(`\n${fail === 0 ? `All ${pass} glossary checks passed across ${glossary.length} entries.` : `${fail} FAILED, ${pass} passed.`}`);
process.exit(fail === 0 ? 0 : 1);
