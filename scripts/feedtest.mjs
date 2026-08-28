#!/usr/bin/env node
/* The feed is the one thing on this site no human ever looks at. A reader
   subscribes once in an app and never opens the XML, so a malformed feed does
   not produce a complaint, it produces silence. These checks are the only
   pair of eyes it gets.

   The check that earns its keep is the escaping one. Brief copy is written by
   a person and by a model, and the first ampersand or angle bracket that
   reaches an unescaped element makes the whole document unparseable for every
   subscriber at once. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { feed, cdata } from "../src/templates/feed.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));

const dir = path.join(root, "content/briefs");
const briefs = fs.existsSync(dir)
  ? fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  : [];

let pass = 0, fail = 0;
const ok = (name, cond, got) => {
  if (cond) pass++;
  else { fail++; console.log(`  FAIL  ${name}${got === undefined ? "" : `\n        ${got}`}`); }
};

const xml = feed({ site, briefs });

/* ---------- shape ---------- */

ok("declares itself as xml", xml.startsWith('<?xml version="1.0" encoding="utf-8"?>'));
ok("is an atom feed", /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">/.test(xml));
ok("names itself in a self link", xml.includes(`href="${site.origin}/feed.xml"`));
ok("points at the html the feed mirrors", xml.includes(`href="${site.origin}/brief/"`));
ok("carries the rights line", /Not personal investment advice/.test(xml));

const entries = xml.split("<entry>").slice(1).map((c) => c.split("</entry>")[0]);
ok("one entry per issue", entries.length === briefs.length, `${entries.length} entries, ${briefs.length} issues`);

const RFC3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
const feedUpdated = (xml.match(/<updated>([^<]*)<\/updated>/) || [])[1];
ok("the feed's own updated stamp is rfc 3339", RFC3339.test(feedUpdated || ""), feedUpdated);

const ids = [];
for (const [i, e] of entries.entries()) {
  const b = briefs[i];
  const id = `entry ${i + 1}`;
  for (const tag of ["title", "id", "published", "updated", "summary", "content"]) {
    ok(`${id}: has a ${tag}`, new RegExp(`<${tag}[ >]`).test(e));
  }
  const eid = (e.match(/<id>([^<]*)<\/id>/) || [])[1];
  ids.push(eid);
  ok(`${id}: id is the issue's own url`, eid === `${site.origin}/brief/${b.slug}/`, eid);
  ok(`${id}: links to the issue`, e.includes(`href="${site.origin}/brief/${b.slug}/"`));
  for (const tag of ["published", "updated"]) {
    const v = (e.match(new RegExp(`<${tag}>([^<]*)</${tag}>`)) || [])[1];
    ok(`${id}: ${tag} is rfc 3339`, RFC3339.test(v || ""), v);
  }
  // Every beat the page shows, the feed shows. A feed that carries only a
  // teaser is an advertisement for the site rather than a way to read it.
  for (const it of b.items || []) {
    ok(`${id}: carries "${String(it.heading).slice(0, 28)}"`, e.includes(escapeForCompare(it.heading)));
  }
  if (b.correction) ok(`${id}: carries the correction`, /Correction\./.test(e));
}

ok("entry ids are unique", new Set(ids).size === ids.length);

/* ---------- escaping, the one that matters ---------- */

function escapeForCompare(s) {
  return String(s)
    .replace(/—/g, ",").replace(/\s·\s/g, ", ").replace(/–/g, " to ")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Outside CDATA every & must open a real entity, and no bare < may appear in
// text. Inside CDATA the rule is only that the section is not closed early.
const outside = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");
const badAmp = [...outside.matchAll(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g)];
ok("no unescaped ampersand outside cdata", badAmp.length === 0, badAmp.slice(0, 3).map((m) => outside.slice(m.index - 30, m.index + 30)).join(" | "));

const cdatas = [...xml.matchAll(/<!\[CDATA\[([\s\S]*?)\]\]>/g)].map((m) => m[1]);
ok("every cdata section is closed", (xml.match(/<!\[CDATA\[/g) || []).length === cdatas.length);
ok("no cdata contains its own terminator", cdatas.every((c) => !c.includes("]]>")));

// Tag balance, which is as close to well-formedness as a zero-dependency test
// gets. Self-closing and declaration tags are excluded.
const tags = [...xml.matchAll(/<(\/?)([a-zA-Z][\w:-]*)[^>]*?(\/?)>/g)]
  .filter((m) => !m[0].startsWith("<?"));
const stack = [];
let balanced = true, offender = "";
for (const m of tags) {
  if (m[3] === "/") continue;
  if (m[1] === "/") {
    if (stack.pop() !== m[2]) { balanced = false; offender = m[0]; break; }
  } else stack.push(m[2]);
}
ok("every tag is closed in order", balanced && stack.length === 0, offender || stack.join(" > "));

/* ---------- the cdata guard, tested where it can actually fire ---------- */

// esc() runs over everything entryBody emits, so a "]]>" never reaches cdata()
// by that route and breaking the guard changes nothing in the built feed. That
// is exactly why it is tested here instead: an untested guard is one nobody
// finds out about until a caller stops escaping.
ok("cdata wraps plain text", cdata("hello") === "<![CDATA[hello]]>");
ok("cdata splits a terminator so the section survives",
  cdata("a ]]> b") === "<![CDATA[a ]]]]><![CDATA[> b]]>");
ok("a split terminator leaves the section balanced",
  (cdata("a ]]> b").match(/<!\[CDATA\[/g) || []).length ===
  (cdata("a ]]> b").match(/\]\]>/g) || []).length - 0 - 1 + 1);
ok("text after a terminator is not lost", cdata("a ]]> b").includes(" b"));

/* ---------- an empty feed is still a feed ---------- */

const empty = feed({ site, briefs: [] });
ok("an empty feed is still valid", empty.includes("<feed") && empty.includes("</feed>") && !empty.includes("<entry>"));
const emptyUpdated = (empty.match(/<updated>([^<]*)<\/updated>/) || [])[1];
ok("an empty feed still carries a real instant", RFC3339.test(emptyUpdated || ""), emptyUpdated);

/* ---------- copy rules apply here too ---------- */

ok("no em dash reaches the feed", !xml.includes("—"));
ok("no middot separator reaches the feed", !/\s·\s/.test(xml));

console.log(fail ? `\n${fail} FAILED, ${pass} passed.` : `\nfeed: ${pass} checks passed across ${entries.length} issue(s).`);
process.exit(fail ? 1 : 0);
