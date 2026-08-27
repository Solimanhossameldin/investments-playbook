#!/usr/bin/env node
// Tests for the call register.
//
// Most of these exist to make a rule enforceable rather than merely
// stated. A page that says "we never delete a call that went badly" and
// has nothing stopping it is a page making a promise it cannot keep.

import assert from "node:assert/strict";
import { score, describeTest, classify, scoreboard, daysUntil } from "./lib/record.mjs";
import { recordPage } from "../src/templates/record.mjs";
import calls from "../content/calls.mjs";

let n = 0;
const t = (name, fn) => { fn(); n++; };
const site = { name: "Test", origin: "https://example.com", disclaimer: "Not advice." };

const DAY = 86400000;
const iso = (offsetDays) => new Date(Date.now() + offsetDays * DAY).toISOString().slice(0, 10);

const call = (over = {}) => ({
  id: "c1", made: iso(-30), horizon: iso(30),
  claim: "A thing will happen.", because: "A reason.", stakes: "A consequence.",
  where: "/brief/x/", ...over,
});

/* ---------- scoring ---------- */
t("above and below", () => {
  assert.equal(score({ op: "above", value: 2 }, 2.5), "right");
  assert.equal(score({ op: "above", value: 2 }, 1.5), "wrong");
  assert.equal(score({ op: "below", value: 2 }, 1.5), "right");
  assert.equal(score({ op: "below", value: 2 }, 2.5), "wrong");
});

t("the boundary is not a win", () => {
  // Exactly at the threshold is not "above" it. A call that claims a rate
  // stays above 2 and finds it at exactly 2 did not come true.
  assert.equal(score({ op: "above", value: 2 }, 2), "wrong");
  assert.equal(score({ op: "below", value: 2 }, 2), "wrong");
});

t("between is inclusive at both ends", () => {
  assert.equal(score({ op: "between", value: [1, 3] }, 1), "right");
  assert.equal(score({ op: "between", value: [1, 3] }, 3), "right");
  assert.equal(score({ op: "between", value: [1, 3] }, 3.01), "wrong");
});

t("rose and fell compare against the starting value", () => {
  assert.equal(score({ op: "rose" }, 5, 4), "right");
  assert.equal(score({ op: "rose" }, 3, 4), "wrong");
  assert.equal(score({ op: "fell" }, 3, 4), "right");
});

t("an unscoreable call throws rather than guessing a verdict", () => {
  assert.throws(() => score({ op: "above", value: 1 }, NaN));
  assert.throws(() => score({ op: "above", value: 1 }, undefined));
  assert.throws(() => score({ op: "vibes", value: 1 }, 2));
  assert.throws(() => score({ op: "rose" }, 5));           // no starting value
  assert.throws(() => score({ op: "between", value: 3 }, 2)); // not a pair
});

t("the test reads as a sentence a reader can check", () => {
  assert.equal(describeTest({ series: "DFII10", op: "above", value: 1.5, unit: "%" }), "DFII10 above 1.5%");
  assert.match(describeTest({ series: "DGS10", op: "rose" }), /higher than on the day/);
  assert.equal(describeTest(null), null);
});

/* ---------- classification: the rules that matter ---------- */
t("a matured call with no verdict is overdue, not hidden", () => {
  const { open, overdue, resolved } = classify([call({ horizon: iso(-1) })], {});
  assert.equal(overdue.length, 1);
  assert.equal(open.length + resolved.length, 0);
});

t("every call lands in exactly one bucket, and none are lost", () => {
  const cs = [
    call({ id: "a", horizon: iso(10) }),
    call({ id: "b", horizon: iso(-10) }),
    call({ id: "c", horizon: iso(-10) }),
    call({ id: "d", horizon: iso(-5), resolution: { date: iso(-5), verdict: "wrong", actual: "It did not." } }),
  ];
  const r = classify(cs, { c: { verdict: "right", date: iso(-10), actual: 2 } });
  assert.equal(r.open.length + r.overdue.length + r.resolved.length, cs.length);
  const ids = [...r.open, ...r.overdue, ...r.resolved].map((x) => x.id).sort();
  assert.deepEqual(ids, ["a", "b", "c", "d"]);
});

t("a machine verdict wins over a hand-written one", () => {
  // Otherwise a call could be scored by the data and then overridden by
  // typing a nicer answer into the register.
  const c = call({ resolution: { date: iso(-1), verdict: "right", actual: "we say so" } });
  const { resolved } = classify([c], { c1: { verdict: "wrong", date: iso(-1), actual: 1.2 } });
  assert.equal(resolved[0].res.verdict, "wrong");
  assert.equal(resolved[0].res.scoredBy, "machine");
});

t("a hand-scored call is labelled as hand-scored", () => {
  const c = call({ horizon: iso(-1), resolution: { date: iso(-1), verdict: "right", actual: "It happened." } });
  const { resolved } = classify([c], {});
  assert.equal(resolved[0].res.scoredBy, "hand");
});

/* ---------- the scoreboard ---------- */
t("the scoreboard counts rather than trusts", () => {
  const res = classify(
    [call({ id: "a", horizon: iso(-1) }), call({ id: "b", horizon: iso(-1) }), call({ id: "c", horizon: iso(-1) })],
    {
      a: { verdict: "right", date: iso(-1), actual: 1 },
      b: { verdict: "wrong", date: iso(-1), actual: 1 },
      c: { verdict: "void", date: iso(-1), actual: 1 },
    }
  ).resolved;
  const s = scoreboard(res);
  assert.equal(s.right, 1); assert.equal(s.wrong, 1); assert.equal(s.void, 1);
  assert.equal(s.scored, 2, "a void call is not scored against the hit rate");
  assert.equal(s.total, 3);
});

t("no hit rate below the minimum sample", () => {
  const mk = (i) => call({ id: "x" + i, horizon: iso(-1) });
  const res9 = classify(Array.from({ length: 9 }, (_, i) => mk(i)),
    Object.fromEntries(Array.from({ length: 9 }, (_, i) => ["x" + i, { verdict: "right", date: iso(-1), actual: 1 }]))).resolved;
  assert.equal(scoreboard(res9).rate, null, "a rate on nine calls must not be published");

  const res10 = classify(Array.from({ length: 10 }, (_, i) => mk(i)),
    Object.fromEntries(Array.from({ length: 10 }, (_, i) => ["x" + i, { verdict: "right", date: iso(-1), actual: 1 }]))).resolved;
  assert.equal(scoreboard(res10).rate, 100);
});

t("void calls do not inflate the hit rate", () => {
  const cs = Array.from({ length: 12 }, (_, i) => call({ id: "y" + i, horizon: iso(-1) }));
  const r = Object.fromEntries(cs.map((c, i) => [c.id, { verdict: i < 6 ? "right" : i < 10 ? "wrong" : "void", date: iso(-1), actual: 1 }]));
  const s = scoreboard(classify(cs, r).resolved);
  assert.equal(s.scored, 10);
  assert.equal(s.rate, 60, "10 scored, 6 right");
});

t("daysUntil is the number of days, rounded up", () => {
  assert.equal(daysUntil(iso(7)), 7);
  assert.ok(daysUntil(iso(-3)) < 0);
});

/* ---------- the register itself ---------- */
t("every call has the fields a reader needs to judge it", () => {
  for (const c of calls) {
    for (const f of ["id", "made", "horizon", "claim", "because"]) {
      assert.ok(c[f], `call ${c.id || "?"} is missing ${f}`);
    }
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(c.made), `${c.id}: bad made date`);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(c.horizon), `${c.id}: bad horizon`);
    assert.ok(c.horizon > c.made, `${c.id}: resolves before it was made`);
    assert.ok(c.claim.length > 20, `${c.id}: a claim this short is not falsifiable`);
  }
});

t("call ids are unique and never reused", () => {
  const ids = calls.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate call id");
});

t("a hand-written resolution carries an actual, and partly/void carry a reason", () => {
  for (const c of calls) {
    const r = c.resolution;
    if (!r) continue;
    assert.ok(["right", "wrong", "partly", "void"].includes(r.verdict), `${c.id}: bad verdict`);
    assert.ok(r.actual, `${c.id}: a verdict with no account of what happened`);
    if (r.verdict === "partly" || r.verdict === "void")
      assert.ok(r.note, `${c.id}: "${r.verdict}" needs a reason`);
  }
});

t("a machine test names a real comparison", () => {
  for (const c of calls) {
    if (!c.test) continue;
    assert.ok(c.test.series, `${c.id}: test has no series`);
    assert.ok(["above", "below", "between", "rose", "fell"].includes(c.test.op), `${c.id}: bad op`);
    assert.doesNotThrow(() => describeTest(c.test));
    for (const banned of ["SPX", "SP500", "CSUSHPINSA", "VIXCLS"])
      assert.notEqual(c.test.series, banned, `${c.id}: ${banned} is not ours to republish`);
  }
});

/* ---------- the page ---------- */
const briefs = [
  { date: "2026-08-26", slug: "2026-08-26-x", correction: "An earlier version quoted the curve wrongly." },
  { date: "2026-08-25", slug: "2026-08-25-y" },
];
const page = recordPage({ site, calls: [], results: {}, briefs });

t("an empty register says so instead of showing nothing", () => {
  assert.ok(page.body.includes("No calls yet"));
  assert.equal(page.path, "/record/");
});

t("no hit rate appears on an empty register", () => {
  assert.ok(page.body.includes("No hit rate is shown"));
  assert.ok(!/\d+(\.\d+)?% of \d+ scored/.test(page.body));
});

t("corrections are read off the briefs, not typed here", () => {
  assert.ok(page.body.includes("An earlier version quoted the curve wrongly."));
  assert.ok(page.body.includes("1</b><span>corrections issued"));
  const none = recordPage({ site, calls: [], results: {}, briefs: [{ date: "2026-01-01", slug: "z" }] });
  assert.ok(none.body.includes("None issued"));
});

t("an overdue call is named on the page, not hidden", () => {
  const c = call({ id: "late", horizon: iso(-40), claim: "This one matured and nobody scored it yet." });
  const p = recordPage({ site, calls: [c], results: {}, briefs });
  assert.ok(p.body.includes("Overdue"));
  assert.ok(p.body.includes("This one matured and nobody scored it yet."));
  assert.ok(p.body.includes("cannot be withdrawn"));
  assert.ok(p.body.includes("1</b><span>overdue"));
});

t("a wrong call is rendered as fully as a right one", () => {
  const cs = [
    call({ id: "w", horizon: iso(-2), claim: "This claim turned out to be wrong entirely." }),
    call({ id: "r", horizon: iso(-2), claim: "This claim turned out to be right entirely." }),
  ];
  const p = recordPage({ site, calls: cs, results: {
    w: { verdict: "wrong", date: iso(-2), actual: 1.2, series: "DFII10", sourceUrl: "https://example.com", test: "DFII10 above 2%" },
    r: { verdict: "right", date: iso(-2), actual: 2.4, series: "DFII10", sourceUrl: "https://example.com", test: "DFII10 above 2%" },
  }, briefs });
  assert.ok(p.body.includes("This claim turned out to be wrong entirely."));
  assert.ok(p.body.includes(">Wrong<"));
  assert.ok(p.body.includes("1</b><span>wrong"));
});

t("the page tells the reader which verdicts a person decided", () => {
  const c = call({ id: "h", horizon: iso(-2), resolution: { date: iso(-2), verdict: "right", actual: "It happened as described." } });
  const p = recordPage({ site, calls: [c], results: {}, briefs });
  assert.ok(p.body.includes("Scored by hand"));
  assert.ok(p.body.includes("their own work"));
});

t("the page never prints NaN, undefined or a broken date", () => {
  const c = call({ id: "u", horizon: iso(-2), stakes: undefined, where: undefined,
    resolution: { date: iso(-2), verdict: "void", actual: "The series was discontinued.", note: "No successor series exists." } });
  const p = recordPage({ site, calls: [c], results: {}, briefs });
  assert.ok(!/NaN|undefined|Invalid Date/.test(p.body), "the page rendered a broken value");
});

t("the method is stated on the page, not just in the code", () => {
  for (const phrase of ["never removed", "overdue", "scored by hand", "public data series"]) {
    assert.ok(page.body.toLowerCase().includes(phrase.toLowerCase()), `the page does not explain: ${phrase}`);
  }
});

console.log(`record: ${n} checks passed across ${calls.length} calls.`);
