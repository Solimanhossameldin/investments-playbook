#!/usr/bin/env node
/* llms.txt.

   The file exists so an assistant can learn the library's shape in one
   request. That only helps if it is complete and true, and both fail
   silently: a forgotten page is invisible, and a description that has drifted
   from the page it points at is worse than no description, because it will be
   quoted. So the checks here are that every built playbook appears, that
   nothing appears that was not built, and that every line's description is
   byte-for-byte the summary of the page it links to. */

import { llmsTxt } from "../src/llms.mjs";
import playbooks from "../content/playbooks.mjs";
import { readFileSync } from "node:fs";

const site = JSON.parse(readFileSync(new URL("../content/site.json", import.meta.url), "utf8"));
const origin = site.origin.replace(/\/$/, "");

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  pass  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? `\n        ${detail}` : ""}`); }
};

const written = playbooks.map((p) => ({ path: `/playbooks/${p.slug}/` }));
const txt = llmsTxt({ site, playbooks, written });

/* ---- shape ---- */
ok("llms.txt opens with the site name as an h1", txt.startsWith(`# ${site.name}\n`), txt.slice(0, 40));
ok("llms.txt carries the one-line blockquote the convention asks for",
  txt.includes(`> ${site.description}`));
ok("llms.txt points at the machine readable routes",
  ["playbooks.json", "sitemap.xml", "feed.xml"].every((f) => txt.includes(`${origin}/${f}`)));

/* ---- completeness ---- */
const links = [...txt.matchAll(/^- \[([^\]]+)\]\((\S+)\): (.+)$/gm)]
  .map(([, title, url, desc]) => ({ title, url, desc }));
const pageLinks = links.filter((l) => l.url.includes("/playbooks/"));

ok("llms.txt lists every built playbook",
  playbooks.every((p) => pageLinks.some((l) => l.url === `${origin}/playbooks/${p.slug}/`)),
  `missing: ${playbooks.filter((p) => !pageLinks.some((l) => l.url === `${origin}/playbooks/${p.slug}/`)).map((p) => p.slug).join(", ")}`);

ok("llms.txt lists each playbook exactly once",
  new Set(pageLinks.map((l) => l.url)).size === pageLinks.length,
  `${pageLinks.length} links, ${new Set(pageLinks.map((l) => l.url)).size} distinct`);

/* ---- truthfulness: the description is the page's own tested summary ---- */
const bySlug = new Map(playbooks.map((p) => [p.slug, p]));
for (const l of pageLinks) {
  const slug = l.url.replace(`${origin}/playbooks/`, "").replace(/\/$/, "");
  const p = bySlug.get(slug);
  if (!p) { ok(`llms.txt link ${slug} points at a real playbook`, false, l.url); continue; }
  ok(`llms.txt describes ${slug} with that page's own summary`, l.desc === p.summary,
    `file: ${l.desc.slice(0, 70)}\n        page: ${p.summary.slice(0, 70)}`);
  ok(`llms.txt titles ${slug} as the page titles itself`, l.title === p.title,
    `file: ${l.title} / page: ${p.title}`);
}

/* ---- a page that did not ship may not appear ---- */
{
  const dropped = playbooks[0];
  const partial = llmsTxt({ site, playbooks, written: written.filter((w) => w.path !== `/playbooks/${dropped.slug}/`) });
  ok("a playbook that was not built is left out rather than linked to a 404",
    !partial.includes(`/playbooks/${dropped.slug}/`), dropped.slug);
  ok("leaving one out does not disturb the rest",
    [...partial.matchAll(/^- \[/gm)].length === links.length - 1);
}

/* ---- a new category may not silently drop its pages ---- */
{
  const invented = playbooks.map((p, i) => (i === 0 ? { ...p, category: "newly-invented" } : p));
  const t = llmsTxt({ site, playbooks: invented, written });
  ok("a page in an unrecognised category still appears, under Other",
    t.includes("## Other") && t.includes(`/playbooks/${playbooks[0].slug}/`),
    "an unknown category dropped its page out of the file");
}

console.log(`\nllms: ${pass} checks passed${fail ? `, ${fail} FAILED` : ""}.`);
process.exit(fail ? 1 : 0);
