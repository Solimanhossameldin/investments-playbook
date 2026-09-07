#!/usr/bin/env node
/* The library is the asset, so its shape is worth enforcing. The check that
   earns its keep here is the internal link one: a body that links to
   /playbooks/something-that-does-not-exist/ builds cleanly, deploys cleanly,
   and 404s for a reader. Nothing else catches that. */

import playbooks from "../content/playbooks.mjs";
import glossary from "../content/glossary.mjs";
import { CALCULATORS } from "../src/templates/calculators.mjs";
import { isoDate, longDate } from "../src/lib.mjs";
import * as hh from "../src/holidayhome.mjs";

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

  // reviewed is printed as written and also ships as schema.org dateModified,
  // where it has to be ISO. Round-tripping catches both a format the parser
  // rejects and a date that does not exist: "31 September 2026" would
  // otherwise pass a parse and silently become 1 October.
  ok(`${id}: reviewed date parses and round-trips`,
    !!isoDate(p.reviewed) && longDate(isoDate(p.reviewed)) === p.reviewed, p.reviewed);

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


/* ---- the Dubai short let page and the statute behind it ----

   The page publishes permit fees, tourism dirham rates and fines, and a
   worked example built on them. Two things can rot silently: a figure can
   be edited in the prose so it no longer matches the instrument that sets
   it, and a line in the worked example can be edited so the total no longer
   adds up. Both look fine in a browser. So the statutory claims live in
   src/holidayhome.mjs with their instrument, the example is computed there,
   and the page has to carry both verbatim or this fails. */
{
  const p = playbooks.find((x) => x.slug === "short-let-vs-long-let");
  ok("short-let-vs-long-let: the page exists", !!p);

  if (p) {
    const prose = `${p.body} ${p.formula} ${p.whenToUse} ${p.failureModes.join(" ")}`;
    const urls = new Set((p.sources || []).map((s) => s.url));

    for (const item of hh.STATUTORY) {
      ok(`short let: carries the statutory claim "${item.claim}"`, prose.includes(item.claim));
      const inst = hh.INSTRUMENTS[item.instrument];
      ok(`short let: cites the instrument behind "${item.key}"`, !!inst && urls.has(inst.url),
        inst ? inst.url : item.instrument);
    }

    const L = hh.longLetNet();
    const S = hh.shortLetNet();

    /* The claim is the table, not the number. An earlier version of this
       check only asked whether a figure appeared somewhere in the page, and
       it passed happily when the short let net in the worked example was
       edited to a wrong value, because the right value was still sitting in
       the sensitivity table below it. So the tables are parsed and compared
       row by row against the computed line items. */
    const tables = [];
    {
      let cur = null;
      for (const raw of p.body.split("\n")) {
        if (raw.startsWith("|")) {
          const cells = raw.split("|").slice(1, -1).map((c) => c.trim());
          if (/^-+$/.test(cells[0].replace(/[:\s]/g, "") || "-")) continue;
          if (!cur) { cur = { head: cells, rows: [] }; tables.push(cur); } else cur.rows.push(cells);
        } else if (raw.trim()) cur = null;
      }
    }
    const num = (c) => {
      const t = String(c).replace(/\*/g, "").replace(/[()]/g, "").replace(/,/g, "").trim();
      return /^-?\d+$/.test(t) ? Number(t) : null;
    };
    const column = (t, n) => t.rows.map((r) => num(r[n]));
    const find = (pred) => tables.find(pred);

    const longTable = find((t) => t.rows.length && /Annual rent/.test(t.rows[0][0]));
    ok("short let: the annual tenancy table is present", !!longTable);
    if (longTable) {
      ok("short let: the annual tenancy table matches the computed lines",
        JSON.stringify(column(longTable, 1)) ===
        JSON.stringify([L.gross, ...L.lines.map(([, v]) => v), L.net]),
        JSON.stringify(column(longTable, 1)));
    }

    const shortTable = find((t) => t.rows.length && /^Gross,/.test(t.rows[0][0]));
    ok("short let: the holiday home table is present", !!shortTable);
    if (shortTable) {
      ok("short let: the holiday home table matches the computed lines",
        JSON.stringify(column(shortTable, 1)) ===
        JSON.stringify([S.gross, ...S.lines.map(([, v]) => v), S.deductions, S.net]),
        JSON.stringify(column(shortTable, 1)));
    }

    const OCCS = [0.55, 0.6, 0.65, 0.7, 0.75, 0.8];
    const occTable = find((t) => /Occupancy/i.test(t.head[0]));
    ok("short let: the occupancy table is present", !!occTable);
    if (occTable) {
      ok("short let: the occupancy table matches the computed nights",
        JSON.stringify(column(occTable, 1)) ===
        JSON.stringify(OCCS.map((o) => hh.shortLetNet({ ...hh.EXAMPLE.shortLet, occupancy: o }).nights)),
        JSON.stringify(column(occTable, 1)));
      ok("short let: the occupancy table matches the computed nets",
        JSON.stringify(column(occTable, 2)) ===
        JSON.stringify(OCCS.map((o) => hh.netAtOccupancy(o))),
        JSON.stringify(column(occTable, 2)));
      ok("short let: the occupancy table is labelled with the occupancies it computed",
        JSON.stringify(occTable.rows.map((r) => r[0])) ===
        JSON.stringify(OCCS.map((o) => `${Math.round(o * 100)}%`)));
    }

    /* The sentences that carry a computed figure. Each phrase is unique in
       the page, so a wrong figure in prose cannot be rescued by the right
       figure appearing in a table somewhere else. */
    const be = hh.breakEvenNights(L.net);
    const rate = hh.breakEvenNightlyRate(L.net);
    const sh = hh.shape();
    const claims = [
      ["the gross gap", `**AED ${hh.money(S.gross - L.gross)}** more than the annual tenancy`],
      ["the net gap", `netted **AED ${hh.money(S.net - L.net)}** more`],
      ["the break-even night count", `${be} nights, which is ${((be / 365) * 100).toFixed(1)}% occupancy`],
      ["the break-even nightly rate", `AED ${rate} a night, held all year`],
      ["the operator share", `**${Math.round(sh.grossShare * 100)}% of gross** goes to the operator`],
      ["the per night block", `**AED ${sh.perNight} a night** goes on tourism dirham and cleaning`],
      ["the fixed annual block", `**AED ${hh.money(sh.fixed)} a year** is fixed`],
      ["the nights sold", `${S.nights} nights sold`],
      ["the turnover count", `so ${S.stays} turnovers`],
      ["the long let net, restated below the table", `annual tenancy nets ${hh.money(L.net)}`],
    ];
    for (const [label, phrase] of claims) {
      ok(`short let: prose carries ${label}`, p.body.includes(phrase), phrase);
    }

    /* The totals are computed, so this only fails if the module itself
       stops adding up, which is the one thing the prose check cannot see. */
    ok("short let: deductions equal the sum of their lines",
      S.deductions === S.lines.reduce((a, [, v]) => a + v, 0));
    ok("short let: net equals gross less deductions", S.net === S.gross - S.deductions);
    ok("long let: net equals rent less deductions", L.net === L.gross - L.deductions);

    /* A break even that does not break even is worse than none. */
    ok("short let: the break-even night is the first night that clears the long let",
      hh.netAtNights(be) >= L.net && hh.netAtNights(be - 1) < L.net);
    ok("short let: the break-even rate is the first whole dirham that clears the long let",
      hh.shortLetNet({ ...hh.EXAMPLE.shortLet, nightlyRate: rate }).net >= L.net &&
      hh.shortLetNet({ ...hh.EXAMPLE.shortLet, nightlyRate: rate - 1 }).net < L.net);
  }
}

/* ---- the library as a whole ---- */
ok("every calculator points at a playbook that exists",
  CALCULATORS.every((c) => !c.playbook || slugs.has(c.playbook)),
  CALCULATORS.filter((c) => c.playbook && !slugs.has(c.playbook)).map((c) => c.slug).join(", "));

console.log(`\n${fail === 0 ? `All ${pass} playbook checks passed across ${playbooks.length} frameworks.` : `${fail} FAILED, ${pass} passed.`}`);
process.exit(fail === 0 ? 0 : 1);
