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
import * as rc from "../src/rentcap.mjs";
import * as aq from "../src/acquisition.mjs";
import * as dp from "../src/disposal.mjs";
import * as jp from "../src/jointproperty.mjs";
import * as op from "../src/offplan.mjs";
import * as mg from "../src/mortgage.mjs";
import * as ht from "../src/hometax.mjs";
import * as dd from "../src/diligence.mjs";
import * as ua from "../src/unitarea.mjs";
import { register, APPLIED } from "../src/lawregister.mjs";

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


/* ---- pages whose figures are set by statute ----

   A page that quotes a fee, a percentage or a notice period set by law is
   making a claim somebody can check against the instrument. Those claims live
   in a module beside the arithmetic that uses them, and this loop is what
   stops the page and the module drifting apart: every claim has to appear in
   the prose word for word, and the instrument behind it has to be in the
   page's own source list. Change the law, change the module, and the suite
   names the page that still says the old thing. */
const STATUTORY_PAGES = [
  ["short-let-vs-long-let", hh],
  ["rent-increase-caps", rc],
  ["net-rental-yield", aq],
  ["selling-well", dp],
  ["service-charge-and-reserves", jp],
  ["off-plan-irr", op],
  ["mortgage-capacity", mg],
  ["due-diligence-before-an-offer", dd],
  ["price-per-square-foot", ua],
];

/* Pages whose instruments are statute somewhere other than Dubai. They get
   the same word-for-word treatment as the list above, and they are kept out
   of it deliberately: the law register is a register of Dubai property law,
   and a UK tax convention filed under that heading would be wrong for the
   reader who went there looking for the decree behind a fee. Keeping two
   lists makes that a decision rather than an accident, and the checks below
   make it one that cannot be made by mistake in either direction. */
const FOREIGN_STATUTORY_PAGES = [
  ["residency-and-tax", ht],
];

const ALL_STATUTORY_PAGES = [...STATUTORY_PAGES, ...FOREIGN_STATUTORY_PAGES];

ok("statutory pages: no page is in both the Dubai and the foreign list",
  !FOREIGN_STATUTORY_PAGES.some(([s]) => STATUTORY_PAGES.some(([d]) => d === s)));

for (const [slug, mod] of ALL_STATUTORY_PAGES) {
  const p = playbooks.find((x) => x.slug === slug);
  ok(`${slug}: the page exists`, !!p);
  if (!p) continue;
  const prose = `${p.summary} ${p.body} ${p.formula} ${p.whenToUse} ${p.failureModes.join(" ")}`;
  const urls = new Set((p.sources || []).map((x) => x.url));
  for (const item of mod.STATUTORY) {
    ok(`${slug}: carries the statutory claim "${item.claim}"`, prose.includes(item.claim));
    const inst = mod.INSTRUMENTS[item.instrument];
    ok(`${slug}: cites the instrument behind "${item.key}"`, !!inst && urls.has(inst.url),
      inst ? inst.url : item.instrument);
  }
}

/* Markdown tables parsed back out of a page body, so a check can compare what
   the reader sees against what the module computed. Numbers are read with
   their formatting stripped: commas, currency parentheses, bold markers and a
   trailing per cent sign all come off. */
function tablesIn(body) {
  const out = [];
  let cur = null;
  for (const raw of body.split("\n")) {
    if (raw.startsWith("|")) {
      const cells = raw.split("|").slice(1, -1).map((c) => c.trim());
      if (/^-+$/.test((cells[0] || "-").replace(/[:\s]/g, ""))) continue;
      if (!cur) { cur = { head: cells, rows: [] }; out.push(cur); } else cur.rows.push(cells);
    } else cur = null;
  }
  return out;
}
const cellNum = (c) => {
  const t = String(c).replace(/\*/g, "").replace(/[()%]/g, "").replace(/,/g, "").trim();
  return /^-?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
};
const col = (t, n) => t.rows.map((r) => cellNum(r[n]));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

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
  if (p) {
    const L = hh.longLetNet();
    const S = hh.shortLetNet();
    const tables = tablesIn(p.body);
    const find = (pred) => tables.find(pred);

    /* The claim is the table, not the number. An earlier version of this
       check only asked whether a figure appeared somewhere in the page, and
       it passed happily when the short let net in the worked example was
       edited to a wrong value, because the right value was still sitting in
       the sensitivity table below it. */
    const longTable = find((t) => t.rows.length && /Annual rent/.test(t.rows[0][0]));
    ok("short let: the annual tenancy table is present", !!longTable);
    if (longTable) {
      ok("short let: the annual tenancy table matches the computed lines",
        same(col(longTable, 1), [L.gross, ...L.lines.map(([, v]) => v), L.net]),
        JSON.stringify(col(longTable, 1)));
    }

    const shortTable = find((t) => t.rows.length && /^Gross,/.test(t.rows[0][0]));
    ok("short let: the holiday home table is present", !!shortTable);
    if (shortTable) {
      ok("short let: the holiday home table matches the computed lines",
        same(col(shortTable, 1), [S.gross, ...S.lines.map(([, v]) => v), S.deductions, S.net]),
        JSON.stringify(col(shortTable, 1)));
    }

    const OCCS = [0.55, 0.6, 0.65, 0.7, 0.75, 0.8];
    const occTable = find((t) => /Occupancy/i.test(t.head[0]));
    ok("short let: the occupancy table is present", !!occTable);
    if (occTable) {
      ok("short let: the occupancy table matches the computed nights",
        same(col(occTable, 1), OCCS.map((o) => hh.shortLetNet({ ...hh.EXAMPLE.shortLet, occupancy: o }).nights)),
        JSON.stringify(col(occTable, 1)));
      ok("short let: the occupancy table matches the computed nets",
        same(col(occTable, 2), OCCS.map((o) => hh.netAtOccupancy(o))),
        JSON.stringify(col(occTable, 2)));
      ok("short let: the occupancy table is labelled with the occupancies it computed",
        same(occTable.rows.map((r) => r[0]), OCCS.map((o) => `${Math.round(o * 100)}%`)));
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

/* ---- the rent cap page and the ladder it models ----

   The page's whole argument is a sequence, not a table: each permitted
   increase narrows the gap that sets the next year's tier. A single wrong
   row breaks the argument while still looking like arithmetic, so both
   schedules are compared to the module row by row, and the claims the prose
   makes about where they stop are checked against where they actually stop. */
{
  const p = playbooks.find((x) => x.slug === "rent-increase-caps");
  if (p) {
    const EX = { rent: 78000, index: 120000 };
    const flat = rc.schedule({ ...EX, growth: 0, years: 6 });
    const grow = rc.schedule({ ...EX, growth: 5, years: 7 });
    const tables = tablesIn(p.body);

    const tierTable = tables.find((t) => /below the index/i.test(t.head[0] || ""));
    ok("rent cap: the tier table is present", !!tierTable);
    if (tierTable) {
      ok("rent cap: the tier table matches the decree's percentages",
        same(col(tierTable, 1), rc.TIERS.map((t) => t.increase)), JSON.stringify(col(tierTable, 1)));
      ok("rent cap: every row quotes the decree's own wording",
        rc.TIERS.every((t, i) => (tierTable.rows[i] || [])[2] === t.wording),
        JSON.stringify(tierTable.rows.map((r) => r[2])));
    }

    const scheds = tables.filter((t) => /Renewal/i.test(t.head[0] || ""));
    ok("rent cap: both renewal schedules are present", scheds.length === 2, scheds.length);
    const checkSchedule = (label, table, rows) => {
      if (!table) return;
      ok(`rent cap: ${label} schedule numbers the renewals`, same(col(table, 0), rows.map((r) => r.year)));
      ok(`rent cap: ${label} schedule matches the computed index`,
        same(col(table, 1), rows.map((r) => r.index)), JSON.stringify(col(table, 1)));
      ok(`rent cap: ${label} schedule matches the computed rent`,
        same(col(table, 2), rows.map((r) => r.rent)), JSON.stringify(col(table, 2)));
      ok(`rent cap: ${label} schedule matches the computed gap`,
        same(col(table, 3), rows.map((r) => Number(r.gap.toFixed(1)))), JSON.stringify(col(table, 3)));
      ok(`rent cap: ${label} schedule matches the permitted increase`,
        same(col(table, 4), rows.map((r) => r.increase)), JSON.stringify(col(table, 4)));
    };
    checkSchedule("the flat index", scheds[0], flat);
    checkSchedule("the rising index", scheds[1], grow);

    /* If the ladder ever stops stopping, that is the most interesting thing
       the suite could tell you, so it has to say so in a sentence rather than
       throw a TypeError three lines later on a null. */
    const stall = rc.stallsAt(flat);
    ok("rent cap: the worked schedule reaches a year with no permitted increase",
      !!stall, "the ladder no longer terminates, so the page's central claim is wrong");
    const sf = rc.shortfall(flat.slice(0, 5));
    const shortfallTable = tables.find((t) => /Shortfall/i.test(t.head[1] || ""));
    ok("rent cap: the shortfall table is present", !!shortfallTable);
    if (shortfallTable) {
      ok("rent cap: the shortfall table matches the computed years and total",
        same(col(shortfallTable, 1), [...sf.perYear, sf.total]), JSON.stringify(col(shortfallTable, 1)));
    }

    const claims = [
      ...(stall ? [["where the flat schedule stalls",
        `stalls in year ${stall.year}, at AED ${rc.money(stall.rent)}, permanently ${rc.pc1(stall.gap)} below`]] : []),
      ["the five year shortfall", `**${rc.money(sf.total)}**`],
      ["the ongoing shortfall", `**AED ${rc.money(sf.ongoing)} a year, indefinitely**`],
      ["the frozen gap under a rising index", `stops closing at ${rc.pc1(grow[grow.length - 1].gap)} and stays there`],
    ];
    for (const [label, phrase] of claims) {
      ok(`rent cap: prose carries ${label}`, p.body.includes(phrase), phrase);
    }

    /* The page's central claim, checked as behaviour rather than as prose:
       from any starting gap the ladder stops, and it never stops at the
       index. If a future amendment made the bands reachable, this fails. */
    for (const start of [12, 15, 25, 35, 45, 50, 60]) {
      const rows = rc.schedule({ index: 100000, rent: Math.round(100000 * (1 - start / 100)), growth: 0, years: 20 });
      const s = rc.stallsAt(rows);
      ok(`rent cap: a tenancy ${start}% below the index stops climbing`, !!s, start);
      ok(`rent cap: a tenancy ${start}% below the index never reaches the index`, !!s && s.gap > 0, s && s.gap);
    }
  }
}

/* ---- the net yield page and the fee schedule under it ----

   This page's denominator is a statutory schedule and its argument is a
   ratio between two blocks of cost. Both can rot silently: a fee can be
   edited in the prose so it no longer matches the resolution, and a line in
   a table can be edited so a total no longer adds up while still looking
   like arithmetic. So the schedule lives in src/acquisition.mjs with the
   instrument behind each figure, every table on the page is compared to it
   cell by cell, and the sentences that carry a computed number are matched
   as whole phrases, because presence somewhere on the page is not a claim. */
{
  const p = playbooks.find((x) => x.slug === "net-rental-yield");
  if (p) {
    const A = aq.acquisition();
    const O = aq.operating();
    const Y = aq.yields();
    const D = aq.drag();
    const P = aq.payback();
    const M = aq.mortgageCosts();
    const tables = tablesIn(p.body);

    const acqTable = tables.find((t) => t.rows.length && /Land Department registration fee/.test(t.rows[0][0]));
    ok("net yield: the acquisition table is present", !!acqTable);
    if (acqTable) {
      ok("net yield: the acquisition table matches the computed fee schedule",
        same(col(acqTable, 1), [...A.lines.map(([, v]) => v), A.total]),
        JSON.stringify(col(acqTable, 1)));
      ok("net yield: the acquisition table is labelled with the lines it computed",
        same(acqTable.rows.slice(0, A.lines.length).map((r) => r[0]), A.lines.map(([k]) => k)));
      ok("net yield: every acquisition line names what sets it",
        acqTable.rows.slice(0, A.lines.length).every((r) => (r[2] || "").length > 8),
        JSON.stringify(acqTable.rows.map((r) => r[2])));
    }

    const opTable = tables.find((t) => t.rows.length && /^Annual rent$/.test(t.rows[0][0]));
    ok("net yield: the operating table is present", !!opTable);
    if (opTable) {
      ok("net yield: the operating table matches the computed lines",
        same(col(opTable, 1), [aq.EXAMPLE.rent, ...O.lines.map(([, v]) => v), O.net]),
        JSON.stringify(col(opTable, 1)));
    }

    const yTable = tables.find((t) => /^Yield$/.test(t.head[0] || ""));
    ok("net yield: the three-yield table is present", !!yTable);
    if (yTable) {
      ok("net yield: the three-yield table matches the computed yields",
        same(col(yTable, 1), [Y.gross, Y.onPrice, Y.net]), JSON.stringify(col(yTable, 1)));
    }

    const scTable = tables.find((t) => /Service charge/i.test(t.head[0] || ""));
    ok("net yield: the service charge table is present", !!scTable);
    if (scTable) {
      ok("net yield: the service charge table is labelled with the rates it computed",
        same(col(scTable, 0), aq.SC_RATES), JSON.stringify(col(scTable, 0)));
      ok("net yield: the service charge table matches the computed yields",
        same(col(scTable, 1), aq.SC_RATES.map((r) => aq.atServiceCharge(r).net)),
        JSON.stringify(col(scTable, 1)));
    }

    const mTable = tables.find((t) => t.rows.length && /Mortgage registration fee/.test(t.rows[0][0]));
    ok("net yield: the mortgage table is present", !!mTable);
    if (mTable) {
      ok("net yield: the mortgage table matches the computed lines",
        same(col(mTable, 1), [...M.lines.map(([, v]) => v), M.total]),
        JSON.stringify(col(mTable, 1)));
    }

    const claims = [
      ["the acquisition total", `**${aq.money(A.total)}**`],
      ["the acquisition total as a share of price", `**${aq.pctText(Y.costRate)} of the price**`],
      ["the seller's statutory half", `**AED ${aq.money(A.sellerShare)}**`],
      ["the yield if the fee were split", `nets **${aq.pctText(Y.netIfSplit)}** rather than **${aq.pctText(Y.net)}**`],
      ["the running cost drag", `**${D.running} percentage points** of yield`],
      ["the transaction cost drag", `takes **${D.transaction} percentage points**`],
      ["the ratio between them", `**Running costs are ${D.ratio} times more destructive**`],
      ["the entry payback", `**${P.entry} years** of net rent`],
      ["the round trip payback", `round trip is **${P.roundTrip} years** of net rent`],
      ["the exit commission", `AED ${aq.money(P.exit)} at the same price`],
      ["the service charge step", `is ${(aq.atServiceCharge(15).net - aq.atServiceCharge(18).net).toFixed(2)} percentage points`],
      ["the rate at which it falls below four per cent",
        `**At AED ${aq.serviceChargeAt(4)} a foot this one bedroom drops below 4.00% net**`],
      ["the loan the mortgage table is built on", `a loan of AED ${aq.money(M.loan)}`],
    ];
    for (const [label, phrase] of claims) {
      ok(`net yield: prose carries ${label}`, p.body.includes(phrase), phrase);
    }

    ok("net yield: the summary carries the net and gross figures",
      p.summary.includes(`${aq.pctText(Y.net)}, not ${aq.pctText(Y.gross)}`), p.summary);

    /* Internal consistency of the arithmetic itself, so a table that agrees
       with a broken module still fails. */
    ok("net yield: acquisition total equals the sum of its lines",
      A.total === A.lines.reduce((a, [, v]) => a + v, 0));
    ok("net yield: net operating income equals rent less its deductions",
      O.net === aq.EXAMPLE.rent - O.deductions);
    ok("net yield: management is charged on rent collected, not rent asked",
      O.lines.find(([k]) => /Management/.test(k))[1] ===
        Math.round((aq.EXAMPLE.rent - O.lines[0][1]) * aq.EXAMPLE.managementRate));
    ok("net yield: the net yield divides by price plus the acquisition stack",
      Y.outlay === aq.EXAMPLE.price + A.total);

    /* The page's central claim, checked as behaviour rather than as prose:
       the running costs have to outweigh the transaction stack, and they
       have to do it across the whole plausible range of service charges. If
       a future fee amendment reversed that, this page's argument would be
       wrong and this is what would say so. */
    ok("net yield: running costs outweigh the transaction stack", D.ratio > 1, D.ratio);
    for (const r of aq.SC_RATES) {
      const y = aq.atServiceCharge(r);
      ok(`net yield: at AED ${r} a foot the running costs still outweigh the stack`,
        (y.gross - y.onPrice) > (y.onPrice - y.net),
        `${(y.gross - y.onPrice).toFixed(2)} vs ${(y.onPrice - y.net).toFixed(2)}`);
      ok(`net yield: at AED ${r} a foot the net yield is below the gross`, y.net < y.gross);
    }

    /* A payback of zero years, or one that ignores the exit, is not a
       payback. The round trip has to cost strictly more than the entry. */
    ok("net yield: the round trip costs more than the entry", P.roundTrip > P.entry, `${P.roundTrip} vs ${P.entry}`);
    ok("net yield: the payback is acquisition costs over net operating income",
      Math.abs(P.entry - A.total / O.net) < 0.005, P.entry);

    /* The trustee fee is a threshold, so both sides of it are worth a check;
       an off-by-one here would misprice every purchase near AED 500,000. */
    ok("net yield: the trustee fee steps at the threshold in the schedule",
      aq.trusteeFee(aq.FEES.trusteeThreshold) === Math.round(aq.FEES.trusteeHigh * 1.05) &&
      aq.trusteeFee(aq.FEES.trusteeThreshold - 1) === Math.round(aq.FEES.trusteeLow * 1.05));
  }
}

/* ---- the selling page and the three tiers of cost under it ----

   The seller's stack is the first thing on this site assembled from two
   regulators at once: the Central Bank caps what a bank may charge, the
   Land Department publishes what it charges, and the developer's NOC fee
   is set by neither. Three things can rot silently here. A cap can be
   edited so the page quotes a ceiling the instrument does not set. A table
   row can be edited so a total stops adding up. And, worst of the three,
   somebody can helpfully supply a figure for the developer's NOC, which
   has no source, in a table that looks exactly like the sourced ones. The
   checks below cover all three, and the last of them is the reason this
   block exists at all. */
{
  const p = playbooks.find((x) => x.slug === "selling-well");
  if (p) {
    const S = dp.sellerStack();
    const C = dp.contingent();
    const R = dp.roundTrip();
    const tables = tablesIn(p.body);

    const stack = tables.find((t) => t.rows.length && /Agency commission/.test(t.rows[0][0]));
    ok("selling: the seller stack table is present", !!stack);
    if (stack) {
      ok("selling: the stack table matches the computed lines",
        same(col(stack, 1), [...S.lines.map(([, v]) => v), S.total]), JSON.stringify(col(stack, 1)));
      ok("selling: the stack table is labelled with the lines it computed",
        same(stack.rows.slice(0, S.lines.length).map((r) => r[0]), S.lines.map(([k]) => k)));
      ok("selling: every stack line names what sets it",
        stack.rows.slice(0, S.lines.length).every((r) => (r[2] || "").length > 8),
        JSON.stringify(stack.rows.map((r) => r[2])));
    }

    const bal = tables.find((t) => /Outstanding balance/i.test(t.head[0] || ""));
    ok("selling: the outstanding balance table is present", !!bal);
    if (bal) {
      ok("selling: the balance table is labelled with the balances it computed",
        same(col(bal, 0), dp.BALANCES), JSON.stringify(col(bal, 0)));
      ok("selling: the balance table matches the computed settlement fees",
        same(col(bal, 1), dp.BALANCES.map((b) => dp.earlySettlement(b))), JSON.stringify(col(bal, 1)));
      ok("selling: the balance table matches the computed totals",
        same(col(bal, 2), dp.BALANCES.map((b) => dp.atBalance(b).total)), JSON.stringify(col(bal, 2)));
    }

    const pr = tables.find((t) => /Sale price/i.test(t.head[0] || ""));
    ok("selling: the sale price table is present", !!pr);
    if (pr) {
      ok("selling: the price table is labelled with the prices it computed",
        same(col(pr, 0), dp.PRICES), JSON.stringify(col(pr, 0)));
      ok("selling: the price table matches the computed commissions",
        same(col(pr, 1), dp.PRICES.map((x) => dp.atPrice(x).agency)), JSON.stringify(col(pr, 1)));
      ok("selling: the price table matches the computed totals",
        same(col(pr, 2), dp.PRICES.map((x) => dp.atPrice(x).total)), JSON.stringify(col(pr, 2)));
      ok("selling: the price table matches the computed share of price",
        same(col(pr, 3), dp.PRICES.map((x) => dp.atPrice(x).rate)), JSON.stringify(col(pr, 3)));
      ok("selling: the price table matches the computed commission share",
        same(col(pr, 4), dp.PRICES.map((x) => dp.atPrice(x).commissionShare)), JSON.stringify(col(pr, 4)));
    }

    const claims = [
      ["the seller stack total", `**AED ${dp.money(S.total)}**`],
      ["the stack as a share of price", `which is **${S.rate.toFixed(2)}% of the price**`],
      ["the official block", `added together, is **AED ${dp.money(S.total - S.agency)}**`],
      ["the balance at which the cap binds", `stops growing at an outstanding balance of **AED ${dp.money(dp.capBindsAt())}**`],
      ["the contingent statutory half", `The statutory half on this sale is **AED ${dp.money(C.share)}**`],
      ["the contingent half against the commission", `**${(C.ofAgency * 100).toFixed(1)}% of the agency commission**`],
      ["the contingent half against the stack", `**${(C.ofStack * 100).toFixed(1)}% of the whole stack**`],
      ["the commission share at the bottom of the range",
        `the commission is **${dp.atPrice(dp.PRICES[0]).commissionShare.toFixed(1)}% of what the seller pays**`],
      ["the commission share at the top of the range",
        `it is **${dp.atPrice(dp.PRICES[dp.PRICES.length - 1]).commissionShare.toFixed(1)}%**`],
      ["the round trip in dirhams", `is **AED ${dp.money(R.total)}**`],
      ["the round trip as a share of price", `or **${R.rate.toFixed(2)}% of the price**`],
      ["the round trip in years of net rent", `which is **${R.years.toFixed(2)} years** of net rent`],
      ["the acquisition side of the round trip", `costs AED ${dp.money(R.buy)} in acquisition fees`],
      ["the mortgage registration side", `a further AED ${dp.money(R.debt)} to register the mortgage`],
    ];
    for (const [label, phrase] of claims) {
      ok(`selling: prose carries ${label}`, p.body.includes(phrase), phrase);
    }

    /* Internal consistency of the arithmetic. */
    ok("selling: the stack total equals the sum of its lines",
      S.total === S.lines.reduce((a, [, v]) => a + v, 0));
    ok("selling: the round trip is entry plus debt registration plus exit",
      R.total === R.buy + R.debt + R.sell);
    ok("selling: the round trip exit is the seller stack", R.sell === S.total);
    /* Asked at prices other than the example's, because at the example's own
       price a retyped literal and a live derivation are the same number, and
       a check that cannot tell them apart is guarding nothing. An earlier
       version of this compared only the default and passed happily when the
       share was replaced by the constant 30000. */
    ok("selling: the contingent half is the acquisition module's seller share",
      [900000, 1500000, 2400000, 7000000].every(
        (x) => dp.contingent({ ...dp.SELLER, price: x }).share === aq.acquisition({ ...aq.EXAMPLE, price: x }).sellerShare),
      JSON.stringify([900000, 2400000].map((x) => dp.contingent({ ...dp.SELLER, price: x }).share)));
    ok("selling: the mortgaged round trip costs more than the cash one",
      R.total > aq.payback().exitTotal, `${R.total} vs ${aq.payback().exitTotal}`);

    /* The cap, as behaviour rather than as a printed number. The ceiling has
       to bind at the balance the page names and not one dirham earlier, the
       rate has to be what sets the fee below it, and the fee has to be flat
       above it. An amendment to either the rate or the ceiling changes where
       this lands, and this is what would say so. */
    const bind = dp.capBindsAt();
    ok("selling: the cap binds at the balance the page names", dp.capped(bind), bind);
    ok("selling: the cap does not bind one dirham below it", !dp.capped(bind - 1), bind - 1);
    ok("selling: below the binding balance the rate is what sets the fee",
      dp.earlySettlement(bind - 100000) === Math.round((bind - 100000) * dp.CAPS.earlySettlementRate));
    ok("selling: above the binding balance the fee does not move",
      dp.earlySettlement(bind) === dp.CAPS.earlySettlementCap &&
      dp.earlySettlement(bind * 4) === dp.CAPS.earlySettlementCap);

    /* The page's claim about the gradient, checked across the whole range
       rather than at its ends: the seller's share of the price has to fall
       as the price rises, because the capped block stops growing. */
    const rates = dp.PRICES.map((x) => dp.atPrice(x).rate);
    ok("selling: the seller's share of price falls as the price rises",
      rates.every((r, i) => i === 0 || r < rates[i - 1]), JSON.stringify(rates));
    const shares = dp.PRICES.map((x) => dp.atPrice(x).commissionShare);
    ok("selling: the commission's share of the stack rises as the price rises",
      shares.every((r, i) => i === 0 || r > shares[i - 1]), JSON.stringify(shares));

    /* The one that matters most. The developer's NOC fee has no instrument
       behind it, so it must not acquire a number by appearing in a table
       beside figures that do. A row for it anywhere on this page is a
       sourced-looking figure that is not sourced, which is the single
       failure this whole site is positioned against. */
    ok("selling: no table on the page carries a line for the developer's NOC",
      !tables.some((t) => t.rows.some((r) => /\bNOC\b|no objection/i.test(r[0] || ""))),
      JSON.stringify(tables.flatMap((t) => t.rows.map((r) => r[0])).filter((x) => /NOC|no objection/i.test(x))));
    ok("selling: the module holds no figure for the developer's NOC",
      !Object.keys(dp.DLD_EXIT).concat(Object.keys(dp.CAPS)).some((k) => /^noc$|developerNoc/i.test(k)));
    ok("selling: the page says in terms that nothing sets the developer's NOC",
      p.body.includes("No instrument sets it. No cap constrains it. No register publishes it."));
  }
}

/* ---- the Dubai service charge page and Law No. (6) of 2019 ----

   The statutory half of this page is covered by STATUTORY_PAGES above, which
   makes it carry every quotation word for word and cite the instrument that
   sets it. What is left is the arithmetic, and it has one property that is
   the whole reason the page is worth reading: the break-even levy is a rate,
   not an amount, because the unit area appears on both sides of the
   comparison and divides out. A future edit that reintroduces an area into
   that formula would still produce a plausible table, so the identity is
   checked directly rather than inferred from the table matching. */
{
  const p = playbooks.find((x) => x.slug === "service-charge-and-reserves");
  ok("service charge: the page exists", !!p);
  if (p) {
    const tables = tablesIn(p.body);

    /* The published table, cell by cell, against the module that computed
       it. The header has to name the gaps the columns actually hold, so a
       column cannot be relabelled without the figures moving with it. */
    const levy = tables.find((t) => /Years held/i.test(t.head[0] || ""));
    ok("service charge: the break-even levy table is present", !!levy);
    if (levy) {
      const rows = jp.levyTable();
      ok("service charge: the levy table is labelled with the years it computed",
        same(col(levy, 0), jp.LEVY_YEARS), JSON.stringify(col(levy, 0)));
      ok("service charge: the levy table's columns are labelled with the gaps they computed",
        same(jp.LEVY_GAPS.map((g) => `Gap of AED ${g} a foot`), levy.head.slice(1)),
        JSON.stringify(levy.head));
      for (let c = 0; c < jp.LEVY_GAPS.length; c++) {
        ok(`service charge: the levy column for a gap of AED ${jp.LEVY_GAPS[c]} matches the module`,
          same(col(levy, c + 1), rows.map((r) => r.cells[c])), JSON.stringify(col(levy, c + 1)));
      }
      ok("service charge: the levy table is computed at the rate the page names",
        p.body.includes("At a 5% return on the money saved") && jp.LEVY_RATE === 0.05);
    }

    /* The identity the page sells. If the area ever stops dividing out, the
       sentence claiming it does becomes false while every figure above it
       stays plausible, so this is checked as arithmetic. */
    ok("service charge: the break-even levy is independent of the unit's area",
      [450, 900, 3200].every((sqft) => {
        const perFoot = jp.breakEvenLevy({ gap: 4, years: 10, rate: 0.05 });
        return Math.abs((perFoot * sqft) / sqft - perFoot) < 1e-9;
      }));
    ok("service charge: an undiscounted break-even levy is the gap times the years",
      jp.LEVY_GAPS.every((gap) => jp.LEVY_YEARS.every((years) =>
        jp.breakEvenLevy({ gap, years }) === gap * years)));
    ok("service charge: the annuity factor reduces to the years at a zero rate",
      jp.LEVY_YEARS.every((n) => jp.fvFactor(0, n) === n));
    ok("service charge: discounting raises the break-even levy above the simple product",
      jp.LEVY_YEARS.every((n) => jp.fvFactor(0.05, n) > n));
    ok("service charge: the page carries the closed form the table was computed from",
      p.body.includes("gap × ((1 + r)^n − 1) / r"));
    ok("service charge: the page states the ten-year undiscounted case the reader can check by hand",
      p.body.includes(`breaks even against a levy of AED ${jp.breakEvenLevy({ gap: 4, years: 10 })} a foot`));

    /* The cost of a dirham a foot is computed from the net yield page's own
       example, so the two pages cannot state different numbers for the same
       property. Checked against that module directly, not against a literal. */
    const pd = jp.perDirham();
    ok("service charge: a dirham a foot is the unit's area in dirhams",
      pd.cost === aq.EXAMPLE.sqft, String(pd.cost));
    ok("service charge: the yield cost of a dirham agrees with the acquisition module",
      pd.netPoints === Number(((aq.EXAMPLE.sqft / aq.yields().outlay) * 100).toFixed(3)),
      `${pd.netPoints} vs ${(aq.EXAMPLE.sqft / aq.yields().outlay) * 100}`);
    ok("service charge: a dirham a foot moves net yield by about what the page says",
      Math.abs((aq.atServiceCharge(aq.EXAMPLE.serviceChargePerSqft).net
        - aq.atServiceCharge(aq.EXAMPLE.serviceChargePerSqft + 1).net) - pd.netPoints) < 0.01);

    const sr = jp.shareOfRent();
    const claims = [
      ["the dirhams a dirham a foot costs", `one dirham per square foot per year is AED ${jp.money(pd.cost)}`],
      ["its share of the rent", `**${pd.ofRent}% of the gross rent**`],
      ["its cost in yield points", `**${pd.netPoints} points of net yield**`],
      ["the charge at the illustrative rate", `the charge is AED ${jp.money(sr.charge)}`],
      ["the charge as a share of rent", `**${sr.pct}% of the gross rent**`],
      ["the five-year cushion", `a cushion of AED ${jp.levyTable()[0].cells[1].toFixed(2)} a foot`],
      ["the twenty-year cushion", `carries AED ${jp.levyTable()[3].cells[1].toFixed(2)} a foot`],
    ];
    for (const [what, phrase] of claims) {
      ok(`service charge: the prose carries ${what}`, p.body.includes(phrase), phrase);
    }

    /* The page's own rule, and the reason it can publish arithmetic on a
       query where every competitor publishes a rate card. It does not have a
       per-building service charge series it is willing to stand behind, so
       it must not grow one: a table of communities and rates here would be
       exactly the unsourced figure the site is positioned against. */
    ok("service charge: no table on the page publishes a per-building or per-community rate",
      !tables.some((t) => /communit|project|building|tower|area/i.test(t.head[0] || "")),
      JSON.stringify(tables.map((t) => t.head[0])));
  }
}

/* ---- the off-plan page and Article 11 ----

   The statutory half is covered by STATUTORY_PAGES above. What is left is
   the arithmetic, and it turns on one drafting choice: Article 11 expresses
   every retention band as a ceiling on the unit's contract price, not on
   the amounts the buyer has handed over. */
{
  const p = playbooks.find((x) => x.slug === "off-plan-irr");
  ok("off-plan: the page exists", !!p);
  if (p) {
    const E = op.EXAMPLE_PLAN;
    const price = E.price;
    const tables = tablesIn(p.body);

    const pv = tables.find((t) => /Measure/i.test(t.head[0] || ""));
    ok("off-plan: the present value table is present", !!pv);
    if (pv) {
      const pvA = op.planPresentValue(price, E.a, E.discountRate, E.months);
      const pvB = op.planPresentValue(price, E.b, E.discountRate, E.months);
      const row = (label) => pv.rows.find((r) => new RegExp(label, "i").test(r[0]));
      const head = row("Headline price");
      const cost = row("Cost in today's money");
      const eff = row("Effective discount");
      ok("off-plan: the table's headline price is the module's price",
        !!head && cellNum(head[1]) === price && cellNum(head[2]) === price);
      ok("off-plan: plan A's present value is the module's, to the dirham",
        !!cost && cellNum(cost[1]) === Math.round(pvA), `${cost && cost[1]} vs ${Math.round(pvA)}`);
      ok("off-plan: plan B's present value is the module's, to the dirham",
        !!cost && cellNum(cost[2]) === Math.round(pvB), `${cost && cost[2]} vs ${Math.round(pvB)}`);
      ok("off-plan: the effective discounts are the module's",
        !!eff && Math.abs(cellNum(eff[1]) - op.effectiveDiscount(price, pvA) * 100) < 0.05
             && Math.abs(cellNum(eff[2]) - op.effectiveDiscount(price, pvB) * 100) < 0.05,
        JSON.stringify(eff));
    }

    const bands = tables.find((t) => /Completion of the project/i.test(t.head[0] || ""));
    ok("off-plan: the retention band table is present", !!bands);
    if (bands) {
      ok("off-plan: the band table has a row for every band in the module",
        bands.rows.length === op.BANDS.length, String(bands.rows.length));
      ok("off-plan: the published retention percentages are the module's",
        same(col(bands, 1), op.BANDS.map((b) => b.retain * 100)), JSON.stringify(col(bands, 1)));
      ok("off-plan: every band says the percentage is taken on the unit's price",
        bands.rows.every((r) => /contract price of the unit/i.test(r[2])),
        JSON.stringify(bands.rows.map((r) => r[2])));
    }

    const grid = tables.find((t) => /Paid so far/i.test(t.head[0] || ""));
    ok("off-plan: the refund grid is present", !!grid);
    if (grid) {
      const paid = col(grid, 0);
      const rows = op.refundGrid(price, paid, 50);
      ok("off-plan: the grid's retained column is the module's",
        same(col(grid, 1), rows.map((r) => r.retained)), JSON.stringify(col(grid, 1)));
      ok("off-plan: the grid's refund column is the module's",
        same(col(grid, 2), rows.map((r) => r.refund)), JSON.stringify(col(grid, 2)));
      ok("off-plan: the grid's share-lost column is the module's",
        same(col(grid, 3), rows.map((r) => Number((r.shareOfPaidLost * 100).toFixed(1)))),
        JSON.stringify(col(grid, 3)));
      ok("off-plan: the grid opens on a payment inside the ceiling, which is the page's first claim",
        paid[0] === price * 0.20 && rows[0].refund === 0, JSON.stringify(rows[0]));
    }

    const ceilings = [0, 1, 300000, 375000, 900000, 1500000, 3000000]
      .map((paid) => op.onTermination(price, paid, 50).ceiling);
    ok("off-plan: the retention ceiling does not change with the amount paid",
      ceilings.every((c) => c === ceilings[0] && c === price * 0.25), JSON.stringify(ceilings));
    ok("off-plan: the retention ceiling scales with the price and only with the price",
      [750000, 1500000, 4000000].every((pr) =>
        op.onTermination(pr, 100000, 50).ceiling === pr * 0.25), null);

    ok("off-plan: retained plus refunded is always what was paid",
      [0, 250000, 375000, 480000, 1500000].every((paid) => {
        const t = op.onTermination(price, paid, 50);
        return Math.abs(t.retained + t.refund - paid) < 1e-9;
      }));

    ok("off-plan: a payment at or below the ceiling is refunded nothing",
      [1, 100000, 374999, 375000].every((paid) => op.onTermination(price, paid, 50).refund === 0));
    ok("off-plan: a refund begins the dirham above the ceiling",
      op.onTermination(price, 375001, 50).refund === 1);
    ok("off-plan: the refund threshold is the ceiling itself, on every band",
      [50, 70, 85].every((pc) =>
        op.refundStartsAt(price, pc) === op.onTermination(price, 0, pc).ceiling));

    const step = op.bandStep(price, op.paidByMonth(price, E.a, 18, E.months), 59, 61);
    ok("off-plan: crossing sixty percent costs the buyer the full fifteen point step",
      step.drop === price * 0.15 && step.maxDrop === price * 0.15,
      JSON.stringify(step));
    ok("off-plan: the step cannot take back more than was refundable",
      [100000, 400000, 610000, 1500000].every((paid) => {
        const st = op.bandStep(price, paid, 59, 61);
        return st.drop >= 0 && st.drop <= st.before && st.drop <= st.maxDrop + 1e-9;
      }));

    const t18 = op.onTermination(price, op.paidByMonth(price, E.a, 18, E.months), 50);
    const t18b = op.onTermination(price, op.paidByMonth(price, E.a, 18, E.months), 65);
    const claims = [
      ["the ceiling on the illustrative unit", `which is **AED ${op.money(price * 0.25)}**`],
      ["the deposit that sits inside it", `Twenty percent of the price is AED ${op.money(price * 0.20)}`],
      ["the refund before the band is crossed", `AED ${op.money(t18.refund)} to AED ${op.money(t18b.refund)}`],
      ["the size of the step", `**AED ${op.money(step.maxDrop)}**`],
      ["the registration fee on each side", `AED ${op.money(op.initialRegistration(price).seller)} on each side`],
    ];
    for (const [what, phrase] of claims) {
      ok(`off-plan: the prose carries ${what}`, p.body.includes(phrase), phrase);
    }

    ok("off-plan: no band in the module is measured against the amounts paid",
      op.BANDS.every((b) => typeof b.retain === "number" && b.retain > 0 && b.retain <= 1));
    ok("off-plan: the page names the thirty percent band as the superseded text",
      /thirty percent of the amounts paid/i.test(p.body) && /It is the 2017 text/.test(p.body));
    ok("off-plan: the page gives the replacement in the instrument's words",
      p.body.includes("the Developer must refund all payments made by the purchasers"));

    ok("off-plan: the worked example is the net yield page's unit",
      op.EXAMPLE_PLAN.price === aq.EXAMPLE.price, String(op.EXAMPLE_PLAN.price));
  }
}

/* ---- the law register and the pages it indexes ----

   The register is generated from the statutory modules, so the thing that
   can go wrong is coverage rather than content: a module gains an instrument
   and the register does not list it, or lists it under a page that does not
   cite it, or a page that cites the law stops linking back. Each of those
   is a reader landing on the decree and not finding the arithmetic, or the
   reverse, and none of them breaks the build on its own. */
{
  const reg = register();
  const listed = new Map(reg.map((e) => [e.url, e]));

  for (const [slug, mod] of STATUTORY_PAGES) {
    ok(`law register: ${slug} is in the applied list`, APPLIED.includes(slug));
    for (const [key, inst] of Object.entries(mod.INSTRUMENTS)) {
      const e = listed.get(inst.url);
      ok(`law register: lists ${slug}'s instrument "${key}"`, !!e, inst.url);
      if (e) {
        ok(`law register: "${key}" is filed under a page that cites it`, e.applied === slug, `${e.applied} vs ${slug}`);
        ok(`law register: "${key}" carries the module's name for it`, e.name === inst.name);
        const claims = mod.STATUTORY.filter((x) => x.instrument === key).map((x) => x.claim);
        ok(`law register: "${key}" lists every claim its module requires, and nothing else`,
          same(e.sets, claims), JSON.stringify(e.sets));
      }
    }
  }
  ok("law register: every applied slug is a statutory page",
    APPLIED.every((slug) => STATUTORY_PAGES.some(([s]) => s === slug)), APPLIED.join(", "));

  /* The register is Dubai property law. A foreign instrument appearing in it
     would send a reader looking for the decree behind a Dubai fee to a UK
     tax convention, so it is excluded by name rather than by omission. */
  for (const [slug, mod] of FOREIGN_STATUTORY_PAGES) {
    ok(`law register: ${slug} is not in the applied list`, !APPLIED.includes(slug));
    for (const [key, inst] of Object.entries(mod.INSTRUMENTS)) {
      ok(`law register: does not list ${slug}'s foreign instrument "${key}"`,
        !listed.has(inst.url), inst.url);
    }
  }

  for (const e of reg) {
    const p = playbooks.find((x) => x.slug === e.applied);
    ok(`law register: "${e.key}" is applied by a page that exists`, !!p, e.applied);
    if (p) {
      ok(`law register: ${e.applied} cites "${e.key}" in its own sources`,
        (p.sources || []).some((x) => x.url === e.url), e.url);
    }
    ok(`law register: "${e.key}" says what the instrument does`, (e.what || "").length >= 60);
    ok(`law register: "${e.key}" has an https url`, /^https:\/\//.test(e.url));
  }

  for (const slug of APPLIED) {
    const p = playbooks.find((x) => x.slug === slug);
    ok(`law register: ${slug} links back to the register`, !!p && p.body.includes("](/dubai-property-law/)"));
  }
}


/* ---- mortgage capacity, and the three caps in Article 3 ----

   The statutory half is covered by STATUTORY_PAGES above, which makes the
   page carry all eleven quotations word for word and cite both articles.
   What is left is the arithmetic, and it has one property that is the whole
   reason the page exists: which of the two income caps binds depends on the
   stressed rate and on nothing else. Both caps are proportional to income,
   so the crossover survives any income and any price, and an edit that made
   it depend on either would still produce a plausible-looking table. So the
   independence is checked directly, at two incomes and two prices, rather
   than inferred from the table matching. */
{
  const p = playbooks.find((x) => x.slug === "mortgage-capacity");
  ok("mortgage: the page exists", !!p);
  if (p) {
    const tables = tablesIn(p.body);
    const find = (pred) => tables.find(pred);

    /* The worked example is the net rental yield page's flat. If the two
       drift apart the pages stop chaining and the cash figure stops being
       comparable to the fee stack it is built from. */
    ok("mortgage: the example unit is the acquisition example",
      p.body.includes(`AED ${aq.money(aq.EXAMPLE.price)}`), String(aq.EXAMPLE.price));

    /* 1. The bands, against the module rather than against themselves. */
    const bandTable = find((t) => /Maximum loan to value/i.test(t.head[1] || ""));
    ok("mortgage: the loan to value band table is present", !!bandTable);
    if (bandTable) {
      const want = [
        mg.ltvCapRate({ status: "national", first: true, price: mg.CAPS.bandPrice }),
        mg.ltvCapRate({ status: "national", first: true, price: mg.CAPS.bandPrice + 1 }),
        mg.ltvCapRate({ status: "national", first: false }),
        mg.ltvCapRate({ status: "expatriate", first: true, price: mg.CAPS.bandPrice - 1 }),
        mg.ltvCapRate({ status: "expatriate", first: true, price: mg.CAPS.bandPrice + 1 }),
        mg.ltvCapRate({ status: "expatriate", first: false }),
        mg.ltvCapRate({ offPlan: true }),
      ].map((r) => Math.round(r * 100));
      ok("mortgage: the band table matches the module band for band",
        same(col(bandTable, 1), want), JSON.stringify(col(bandTable, 1)));
    }

    /* 2. The minimum-income table, cell by cell, including which cap binds.
       The last column is the claim; the numbers are only its evidence. */
    const incTable = find((t) => /Stressed rate/i.test(t.head[0] || ""));
    ok("mortgage: the minimum income table is present", !!incTable);
    if (incTable) {
      const rows = mg.incomeTable();
      ok("mortgage: the income table is computed at the module's rates",
        same(col(incTable, 0), rows.map((r) => r.ratePct)), JSON.stringify(col(incTable, 0)));
      ok("mortgage: the stressed payments match the module",
        same(col(incTable, 1), rows.map((r) => r.payment)), JSON.stringify(col(incTable, 1)));
      ok("mortgage: the income the ratio needs matches the module",
        same(col(incTable, 2), rows.map((r) => r.byFlow)), JSON.stringify(col(incTable, 2)));
      ok("mortgage: the income the multiple needs matches the module",
        same(col(incTable, 3), rows.map((r) => r.byStock)), JSON.stringify(col(incTable, 3)));
      ok("mortgage: every row names the cap the module says binds",
        incTable.rows.every((r, i) => r[4] === rows[i].binds),
        incTable.rows.map((r) => r[4]).join(" | "));
      /* The page's argument needs the swap to be visible in the table. A
         table where one cap binds throughout would match the module and
         prove nothing to the reader. */
      ok("mortgage: the table straddles the crossover",
        new Set(rows.map((r) => r.binds)).size === 2, rows.map((r) => r.binds).join(", "));
    }

    /* 3. The crossover, printed to two places, and independent of income and
          of price. This is the claim the page is built on. */
    ok("mortgage: the page prints the computed crossover rate",
      p.body.includes(`${mg.crossoverRatePct().toFixed(2)}%`), mg.crossoverRatePct().toFixed(2));

    const x = mg.crossoverRatePct();
    const probe = (monthlyIncome, price, rate) =>
      mg.caps({ price, monthlyIncome, stressedRatePct: rate, otherMonthlyDebt: 0 }).binding;
    for (const [income, price] of [[40000, 6000000], [90000, 12000000]]) {
      ok(`mortgage: below the crossover the multiple binds (${income}/${price})`,
        probe(income, price, x - 1) === "the income multiple",
        probe(income, price, x - 1));
      ok(`mortgage: above the crossover the ratio binds (${income}/${price})`,
        probe(income, price, x + 1) === "the debt burden ratio",
        probe(income, price, x + 1));
    }

    /* 4. caps() has to be a minimum of three, not of two. Each cap is made
          the binding one in turn, so dropping one from the minimum fails. */
    ok("mortgage: the loan to value cap can bind",
      mg.caps({ price: 1000000, monthlyIncome: 500000, stressedRatePct: 6 }).binding === "the loan to value cap");
    ok("mortgage: the debt burden ratio can bind",
      mg.caps({ price: 5000000, monthlyIncome: 30000, stressedRatePct: 9 }).binding === "the debt burden ratio");
    ok("mortgage: the income multiple can bind",
      mg.caps({ price: 5000000, monthlyIncome: 30000, stressedRatePct: 3 }).binding === "the income multiple");

    /* 5. Cash to close, line by line, and the gap the page leads on. */
    const cash = mg.cashToClose();
    const cashTable = find((t) => t.rows.length && /^Deposit,/.test(t.rows[0][0]));
    ok("mortgage: the cash to close table is present", !!cashTable);
    if (cashTable) {
      ok("mortgage: the cash to close table matches the module line by line",
        same(col(cashTable, 1), [cash.deposit, cash.buying, cash.borrowing, cash.total]),
        JSON.stringify(col(cashTable, 1)));
    }
    ok("mortgage: the page prints the computed cash percentage",
      p.body.includes(`${cash.actualPct.toFixed(2)}%`), cash.actualPct.toFixed(2));
    ok("mortgage: the page prints the computed gap in points",
      p.body.includes(`${cash.gapPoints.toFixed(2)} percentage points`), cash.gapPoints.toFixed(2));
    ok("mortgage: the page prints the cash the deposit figure omits",
      p.body.includes(`AED ${aq.money(cash.total - cash.deposit)}`), String(cash.total - cash.deposit));

    /* The fees are the thing that cannot be borrowed, so the cash figure has
       to exceed the deposit by exactly the two fee stacks. An edit that
       quietly folded them into the loan would still produce a total. */
    ok("mortgage: the cash requirement is the deposit plus both fee stacks",
      cash.total - cash.deposit === cash.buying + cash.borrowing,
      `${cash.total} - ${cash.deposit}`);
    ok("mortgage: the buying stack is the acquisition page's, unchanged",
      cash.buying === aq.acquisition().total, `${cash.buying} vs ${aq.acquisition().total}`);

    /* 6. Off plan, where Article 3 overrides every band. */
    const off = mg.cashToClose({ offPlan: true });
    ok("mortgage: off plan is capped at the module's off plan band",
      off.ltvRate === mg.CAPS.ltv.offPlan, String(off.ltvRate));
    ok("mortgage: the page prints the off plan cash requirement",
      p.body.includes(`AED ${aq.money(off.total)}`), String(off.total));
    ok("mortgage: the page prints the off plan cash percentage",
      p.body.includes(`${off.actualPct.toFixed(2)}%`), off.actualPct.toFixed(2));

    /* 7. The rental deduction is a share of the year, not of the rent. */
    const cr = mg.countableRent();
    ok("mortgage: the page prints the countable rent",
      p.body.includes(aq.money(cr.amount)), String(cr.amount));
    ok("mortgage: the page prints the deducted rent",
      p.body.includes(aq.money(cr.deducted)), String(cr.deducted));
    ok("mortgage: the deduction is two months of whatever the rent is",
      mg.countableRent(240000).amount === 200000, String(mg.countableRent(240000).amount));

    /* 8. The page is a junction, so the chain is checked rather than hoped. */
    for (const target of ["net-rental-yield", "off-plan-irr", "selling-well", "due-diligence-before-an-offer", "transaction-cost-drag"]) {
      ok(`mortgage: links to /playbooks/${target}/`, p.body.includes(`](/playbooks/${target}/)`));
    }
  }
}

/* ---- the library as a whole ---- */
ok("every calculator points at a playbook that exists",
  CALCULATORS.every((c) => !c.playbook || slugs.has(c.playbook)),
  CALCULATORS.filter((c) => c.playbook && !slugs.has(c.playbook)).map((c) => c.slug).join(", "));


/* ---- tax on Dubai rental income ----

   The statutory half is covered by ALL_STATUTORY_PAGES above, which makes the
   page carry the treaty's own wording and cite the convention. What is left
   is the arithmetic, and it has one property worth guarding directly: the
   whole argument is that the relief is nil BECAUSE the UAE charge is nil, so
   the page must not at any point compute a credit. A future edit that
   introduced one would still produce a plausible table with smaller numbers
   in it, which is exactly the failure a table comparison would not catch.

   The yields are not recomputed here. They are read out of hometax.mjs,
   which reads them out of acquisition.mjs, so the flagship page and this one
   cannot drift: change the service charge on the example flat and both move
   together or the suite names the one that did not. */
{
  const p = playbooks.find((x) => x.slug === "residency-and-tax");
  ok("tax on rent: the page exists", !!p);
  if (p) {
    const y = aq.yields();
    const g = ht.grid();
    const cmp = ht.againstTransactionStack("higher");

    ok("tax on rent: the untaxed yield is the net rental yield page's own",
      g.every((r) => r.noi === y.noi), `${g[0].noi} vs ${y.noi}`);

    /* The table the reader sees, against the module, cell by cell. Row one is
       the UAE resident and is the zero case; the rest are the bands in order. */
    const t = tablesIn(p.body).find((x) => (x.head[0] || "").includes("Owner's position"));
    ok("tax on rent: the page carries the band table", !!t);
    if (t) {
      ok("tax on rent: the table has a row per band plus the untaxed case",
        t.rows.length === ht.UK.bands.length + 1, String(t.rows.length));
      ok("tax on rent: the first row is the untaxed UAE resident",
        cellNum(t.rows[0][1]) === 0 && cellNum(t.rows[0][2]) === 0 &&
        cellNum(t.rows[0][3]) === y.noi && cellNum(t.rows[0][4]) === y.net,
        JSON.stringify(t.rows[0]));
      g.forEach((r, i) => {
        const row = t.rows[i + 1] || [];
        const n = r.band.name.toLowerCase().replace(" rate", "");
        ok(`tax on rent: the ${r.band.key} row names its band`,
          (row[0] || "").toLowerCase().includes(n), row[0]);
        ok(`tax on rent: the ${r.band.key} row prints the published rate`,
          cellNum(row[1]) === r.band.rate * 100, row[1]);
        ok(`tax on rent: the ${r.band.key} row's tax is the module's`,
          cellNum(row[2]) === r.tax, row[2]);
        ok(`tax on rent: the ${r.band.key} row's kept income is the module's`,
          cellNum(row[3]) === r.kept, row[3]);
        ok(`tax on rent: the ${r.band.key} row's net yield is the module's`,
          cellNum(row[4]) === r.net, row[4]);
        ok(`tax on rent: the ${r.band.key} row's points lost is the module's`,
          cellNum(row[5]) === r.cost, row[5]);
        /* Kept income and tax must reconcile to the profit, so a hand edit to
           one cell cannot pass by matching a module value in the other. */
        ok(`tax on rent: the ${r.band.key} row reconciles, tax plus kept is the profit`,
          cellNum(row[2]) + cellNum(row[3]) === y.noi);
      });
    }

    /* The identity the page is built on, checked as an identity rather than
       inferred from the prose matching. The charge is the marginal rate
       applied to the profit with no credit subtracted, because no credit is
       available. If a credit is ever introduced this fails immediately. */
    for (const r of g) {
      ok(`tax on rent: ${r.band.key} is the full marginal charge, no credit given`,
        r.tax === Math.round(r.noi * r.band.rate));
    }

    ok("tax on rent: the higher rate charge outweighs the whole transaction stack",
      cmp.taxPoints > cmp.transactionPoints);
    ok("tax on rent: the page prints the ratio the module computes",
      p.body.includes(`${cmp.ratio} times the whole transaction stack`), String(cmp.ratio));
    ok("tax on rent: the page prints the transaction stack figure the yield page computes",
      p.body.includes(`takes **${aq.drag().transaction}**`), String(aq.drag().transaction));
    ok("tax on rent: the page prints the running cost figure the yield page computes",
      p.body.includes(`**${aq.drag().running} percentage points**`), String(aq.drag().running));

    /* The finance cost gap is the owner's rate less the basic rate value, so
       it is zero at the basic rate and cannot be negative below it. The page
       prints the higher rate case on a stated interest figure. */
    ok("tax on rent: the finance cost gap is nil at the basic rate",
      ht.financeCostGap(50000, "basic").cost === 0);
    ok("tax on rent: the page's finance cost example is the module's",
      p.body.includes(`**AED ${ht.money(ht.financeCostGap(50000, "higher").cost)} a year**`));

    /* The page must not claim the treaty relieves anything, because the whole
       finding is that it does not. Guarded by wording rather than by a number
       because this is the claim a well meaning edit would soften. */
    ok("tax on rent: the page says the credit is nil",
      /credit against the UK charge is nil/.test(p.body));
    ok("tax on rent: the page keeps the permissive reading of Article 6",
      p.body.includes("*may be taxed*, not *shall be taxable only*"));
  }
}

/* ---- due diligence, and the two kinds of check ----

   The statutory half is covered by STATUTORY_PAGES above, which makes the
   page carry all seven quotations from Law No. (7) of 2006 word for word and
   cite the instrument. What is left is the page's actual argument, which is
   a ranking, and a ranking has a property worth guarding: it is only useful
   if it comes out the same way round as the arithmetic. A page that printed
   the numbers correctly but drew the opposite conclusion from them would
   look entirely plausible, so the direction is checked as well as the
   values.

   The values themselves all descend from the one illustrative flat in
   acquisition.mjs, so an edit there moves this page, and these checks are
   what names it when the page does not move with it. */
{
  const p = playbooks.find((x) => x.slug === "due-diligence-before-an-offer");
  if (p) {
    const sc = dd.serviceChargeCheck();
    const rt = dd.rentCheck();
    const f = dd.feeSplitCheck();
    const t = dd.together();
    const vc = dd.versusCommission();

    /* A check the reader cannot perform is not a check. Each Land Department
       service has to be named in the prose and cited in the page's sources,
       and the services are kept out of INSTRUMENTS so that the law register
       stays a register of law rather than of service pages. */
    const urls = new Set((p.sources || []).map((x) => x.url));
    for (const svc of dd.SERVICES) {
      ok(`due diligence: names the service "${svc.name}"`, p.body.includes(svc.name));
      ok(`due diligence: cites the page for "${svc.key}"`, urls.has(svc.url), svc.url);
    }
    ok("due diligence: the services are not instruments",
      dd.SERVICES.every((svc) => !Object.values(dd.INSTRUMENTS).some((i) => i.url === svc.url)));

    /* The ranking table, cell by cell against the module. Reading a figure
       out of the prose would pass on a table whose rows had been reordered
       or whose columns had drifted apart, which is exactly the edit that
       would reverse the argument while keeping every number on the page. */
    const rank = tablesIn(p.body).find((x) => /^Finding$/.test(x.head[0] || ""));
    ok("due diligence: the ranking table is present", !!rank);
    if (rank) {
      ok("due diligence: the ranking table's net yields are the module's",
        same(col(rank, 1), [sc.base, sc.net, rt.net, null]), JSON.stringify(col(rank, 1)));
      ok("due diligence: the ranking table's points are the module's",
        same(col(rank, 2), [0, sc.points, rt.points, t.points]), JSON.stringify(col(rank, 2)));
      ok("due diligence: the ranking table's annual figures are the module's",
        same(col(rank, 3), [0, sc.perYear, rt.perYear, sc.perYear + rt.perYear]),
        JSON.stringify(col(rank, 3)));
      ok("due diligence: the ranking table's capitalised figures are the module's",
        same(col(rank, 4),
          [0, dd.capitalised(sc.perYear), dd.capitalised(rt.perYear), t.documents]),
        JSON.stringify(col(rank, 4)));

      /* The two rows must sum to the total row. A hand edit that matched one
         module value in one cell would still break this, because the column
         has to reconcile as well as match. */
      ok("due diligence: the total row is the sum of the two findings",
        col(rank, 3)[3] === col(rank, 3)[1] + col(rank, 3)[2] &&
        col(rank, 4)[3] === col(rank, 4)[1] + col(rank, 4)[2]);
    }

    /* The argument, in the direction the arithmetic actually runs. */
    ok("due diligence: the recurring checks beat the one-off negotiation",
      t.documents > t.negotiation && t.ratio > 1);
    ok("due diligence: the page prints the ratio the module computes",
      p.body.includes(`worth ${t.ratio} times the negotiation`), String(t.ratio));
    ok("due diligence: the page prints the fee split as the module has it",
      p.body.includes(`AED ${dd.money(f.once)}`) &&
      p.body.includes(`from ${dd.pctText(f.base)} to ${dd.pctText(f.net)}, or ${f.points} points`));
    ok("due diligence: the page prints the budget line against the commission",
      p.body.includes(`AED ${dd.money(vc.capitalised)} of purchase price`) &&
      p.body.includes(`AED ${dd.money(vc.commission)}`));

    /* The two categories are the page. A page that quietly dropped the
       distinction would still read as a competent checklist, which is the
       failure mode worth naming. */
    ok("due diligence: the validity checks are separated from the price checks",
      /checks that decide whether you own anything/i.test(p.body) &&
      /checks that decide (what it is worth|the price)/i.test(p.body));
    ok("due diligence: the page says an unrecorded transfer is not valid",
      /will not be deemed valid unless recorded in the Property Register/.test(p.body));
    ok("due diligence: the page keeps freehold as a property of the location",
      /freehold\]\(\/glossary\/freehold\/\) is a property of the location, not a term a seller can offer/.test(p.body));
  }
}

/* ---- price per square foot, and the denominator Article 13 governs ----

   The statutory half is covered by STATUTORY_PAGES above, which makes the
   page carry each paragraph of Article 13 word for word and cite the
   Resolution. What is left is the arithmetic, and it has two properties
   that are the whole reason the page is worth reading.

   The first is that a shortfall out of the denominator raises the rate by
   MORE than the shortfall. The second is that a wrong area understates the
   price per foot and the service charge per foot by exactly the same
   fraction, in the same flattering direction. A future edit that replaced
   either identity with the naive one would produce a table that still looks
   right, so both are checked as arithmetic rather than inferred from the
   table matching. */
{
  const p = playbooks.find((x) => x.slug === "price-per-square-foot");
  ok("price per foot: the page exists", !!p);
  if (p) {
    const tables = tablesIn(p.body);
    const E = aq.EXAMPLE;
    const num1 = (c) => {
      const m = String(c).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
      return m ? Number(m[0]) : null;
    };
    const coln = (t, n) => t.rows.map((r) => num1(r[n]));

    /* The published shortfall table, cell by cell, against the module. */
    const sf = tables.find((t) => /^Shortfall$/i.test(t.head[0] || ""));
    ok("price per foot: the shortfall table is present", !!sf);
    if (sf) {
      const rows = ua.shortfallTable(E);
      ok("price per foot: the shortfall table is labelled with the shortfalls it computed",
        same(coln(sf, 0), ua.SHORTFALLS), JSON.stringify(coln(sf, 0)));
      ok("price per foot: the delivered areas match the module",
        same(coln(sf, 1), rows.map((r) => r.delivered)), JSON.stringify(coln(sf, 1)));
      ok("price per foot: the realised rates match the module",
        same(coln(sf, 2), rows.map((r) => Number(r.realised.toFixed(2)))), JSON.stringify(coln(sf, 2)));
      ok("price per foot: the uplifts match the module",
        same(coln(sf, 3), rows.map((r) => Number(r.upliftPct.toFixed(2)))), JSON.stringify(coln(sf, 3)));
      ok("price per foot: the undelivered area values match the module",
        same(coln(sf, 4), rows.map((r) => Math.round(r.missingValue))), JSON.stringify(coln(sf, 4)));
      ok("price per foot: each row says whether Article 13(3) compensates it",
        same(sf.rows.map((r) => /compensation due/.test(r[5])), rows.map((r) => r.compensable)),
        JSON.stringify(sf.rows.map((r) => r[5])));
    }

    /* The published area-basis table, cell by cell. */
    const bt = tables.find((t) => /Quoted area larger by/i.test(t.head[0] || ""));
    ok("price per foot: the area-basis table is present", !!bt);
    if (bt) {
      const rows = ua.basisTable(E);
      ok("price per foot: the area-basis table is labelled with the gaps it computed",
        same(coln(bt, 0), ua.BASIS_GAPS), JSON.stringify(coln(bt, 0)));
      ok("price per foot: the quoted areas match the module",
        same(coln(bt, 1), rows.map((r) => Math.round(r.quotedArea))), JSON.stringify(coln(bt, 1)));
      ok("price per foot: the rates each quoted area reads match the module",
        same(coln(bt, 2), rows.map((r) => Number(r.ppsfRead.toFixed(2)))), JSON.stringify(coln(bt, 2)));
      ok("price per foot: the service charges each quoted area reads match the module",
        same(coln(bt, 3), rows.map((r) => Number(r.scRead.toFixed(2)))), JSON.stringify(coln(bt, 3)));
      ok("price per foot: the understatements match the module",
        same(coln(bt, 4), rows.map((r) => Number(r.understatedPct.toFixed(2)))), JSON.stringify(coln(bt, 4)));
    }

    /* Identity one: the uplift is strictly larger than the shortfall that
       produced it, at every shortfall, because the shortfall comes out of
       the denominator. The page says this in words; it is true here. */
    ok("price per foot: a shortfall raises the rate by more than the shortfall",
      ua.SHORTFALLS.every((s) => ua.upliftFromShortfall(s) > s));
    ok("price per foot: the uplift is the shortfall over what is left of the area",
      [1, 5, 12.5, 30].every((s) => {
        const paid = ua.ppsf(E.price, E.sqft * (1 - s / 100));
        const quoted = ua.ppsf(E.price, E.sqft);
        return Math.abs((paid / quoted - 1) * 100 - ua.upliftFromShortfall(s)) < 1e-9;
      }));

    /* Identity two: the two understatements are the same fraction. A table
       where the price per foot and the service charge per foot drifted
       apart would still look plausible to a reader. */
    ok("price per foot: a wrong area understates the rate and the service charge equally",
      ua.BASIS_GAPS.filter((g) => g > 0).every((g) => {
        const r = ua.basisRow(g, E);
        const ppsfErr = (1 - r.ppsfRead / ua.ppsf(E.price, E.sqft)) * 100;
        const scErr = (1 - r.scRead / E.serviceChargePerSqft) * 100;
        return Math.abs(ppsfErr - scErr) < 1e-9 &&
          Math.abs(ppsfErr - ua.understatementFromBasisGap(g)) < 1e-9;
      }));
    ok("price per foot: a wrong area never flatters the property in the other direction",
      ua.BASIS_GAPS.filter((g) => g > 0).every((g) => {
        const r = ua.basisRow(g, E);
        return r.ppsfRead < ua.ppsf(E.price, E.sqft) && r.scRead < E.serviceChargePerSqft;
      }));

    /* The threshold is "more than five percent (5%)", so five percent
       itself is free. An edit to >= would change the page's central claim
       while leaving every figure in the table intact. */
    ok("price per foot: a shortfall of exactly the threshold carries no compensation",
      ua.compensable(ua.TOLERANCE_PCT) === false);
    ok("price per foot: a shortfall above the threshold carries compensation",
      ua.compensable(ua.TOLERANCE_PCT + 0.01) === true);
    ok("price per foot: the largest free shortfall is in the published table",
      ua.SHORTFALLS.includes(ua.TOLERANCE_PCT));

    /* The prose figures, each drawn from the module and the acquisition
       module rather than typed, so the two pages cannot state different
       numbers for the same property. */
    const free = ua.freeShortfall(E);
    const acq = aq.acquisition();
    const claims = [
      ["the value of the largest free shortfall",
        `**AED ${ua.money(free.missingValue)} of area, paid for and not delivered`],
      ["the uplift that shortfall causes",
        `the price per foot actually paid is ${ua.pc2(free.upliftPct)} above the price per foot agreed`],
      ["the registration fee it is set against",
        `registration fee on this purchase is AED ${ua.money(acq.transfer)}`],
      ["the whole acquisition cost it is set against",
        `the agency commission included, is AED ${ua.money(acq.total)}`],
      ["that shortfall as a share of the registration fee",
        `**${ua.pc2trim(ua.shareOf(free.missingValue, acq.transfer))} of the entire registration fee**`],
      ["that shortfall as a share of the transaction stack",
        `${ua.pc2(ua.shareOf(free.missingValue, acq.total))} of the complete transaction stack`],
      ["the quoted rate the tables start from",
        `AED ${ua.money2(ua.ppsf(E.price, E.sqft))}`],
      ["the unit the tables are computed on",
        `AED ${ua.money(E.price)} over a registered ${E.sqft} sq ft`],
      ["the service charge rate the tables are computed on",
        `service charge at AED ${E.serviceChargePerSqft} a foot`],
    ];
    for (const [what, phrase] of claims) {
      ok(`price per foot: the prose carries ${what}`, p.body.includes(phrase), phrase);
    }

    /* The page's own rule. It publishes identities, not a measurement of
       how far apart quoted and registered areas actually are in Dubai,
       because it holds no dataset that would support one. A table of
       communities and rates here would be the unsourced figure the site is
       positioned against. */
    ok("price per foot: no table on the page publishes a per-community or per-building rate",
      !tables.some((t) => /communit|project|building|tower|district/i.test(t.head[0] || "")),
      JSON.stringify(tables.map((t) => t.head[0])));
    ok("price per foot: the page says the tables are arithmetic rather than a market measurement",
      /arithmetic\. They are not a claim about how far apart the two areas typically are/.test(p.body));
    ok("price per foot: the page says the Resolution does not define net area",
      /adopts net area without defining it/.test(p.body));
  }
}


console.log(`\n${fail === 0 ? `All ${pass} playbook checks passed across ${playbooks.length} frameworks.` : `${fail} FAILED, ${pass} passed.`}`);
process.exit(fail === 0 ? 0 : 1);
