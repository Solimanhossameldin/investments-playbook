#!/usr/bin/env node
// Score every matured call that named a public series and a threshold.
// Zero dependencies, Node 18+ global fetch.
//
// The point of this script is that it is not a person. A call with a
// `test` is resolved by fetching the data and applying the comparison,
// and the verdict it writes cannot be argued with or quietly revised —
// rerunning it on the same data produces the same answer.
//
// Writes content/call-results.json. Never deletes a result: once a call
// has been scored, the verdict stands.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { score, describeTest } from "./lib/record.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "content/call-results.json");
const TIMEOUT = 20000;

const UA = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 InvestmentsPlaybook/1.0 (+https://investmentsplaybook.com)",
  Accept: "*/*",
};

async function fred(series, from, to) {
  const r = await fetch(
    `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${series}&cosd=${from}&coed=${to}`,
    { headers: UA, signal: AbortSignal.timeout(TIMEOUT) }
  );
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const pts = [];
  for (const line of (await r.text()).trim().split("\n").slice(1)) {
    const [date, raw] = line.split(",");
    const v = parseFloat(raw);
    if (Number.isFinite(v) && /^\d{4}-\d{2}-\d{2}$/.test(date)) pts.push([date, v]);
  }
  return pts;
}

const calls = (await import("../content/calls.mjs")).default;

let prev = { resolvedAt: null, results: {}, errors: {} };
try { prev = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch {}

const results = { ...(prev.results || {}) };
const errors = {};
const today = new Date().toISOString().slice(0, 10);
let scored = 0;

for (const c of calls) {
  // Already scored: leave it exactly as it is. A verdict is not revisable.
  if (results[c.id]) continue;
  if (!c.test) continue;              // hand-scored, not this script's job
  if (c.horizon > today) continue;    // not due yet

  try {
    const pts = await fred(c.test.series, c.made, c.horizon);
    if (!pts.length) throw new Error("no observations in the window");

    // The observation on or before the horizon. A series that publishes
    // weekly will not have a print on 31 December, and taking the next
    // one would score the call on data that did not exist on the day.
    const at = pts.at(-1);
    const first = pts[0][1];
    const verdict = score(c.test, at[1], first);

    results[c.id] = {
      verdict,
      date: at[0],
      actual: at[1],
      startedAt: c.test.op === "rose" || c.test.op === "fell" ? first : null,
      test: describeTest(c.test),
      series: c.test.series,
      sourceUrl: `https://fred.stlouisfed.org/series/${c.test.series}`,
      resolvedAt: new Date().toISOString(),
    };
    scored++;
    console.log(`${verdict.toUpperCase().padEnd(5)} ${c.id}  ${describeTest(c.test)} -> ${at[1]} on ${at[0]}`);
  } catch (e) {
    errors[c.id] = String(e.message || e);
    console.warn(`ERROR ${c.id}: ${errors[c.id]}`);
  }
}

fs.writeFileSync(
  OUT,
  JSON.stringify({ resolvedAt: new Date().toISOString(), results, errors }, null, 1)
);

const due = calls.filter((c) => c.test && c.horizon <= today && !results[c.id]).length;
console.log(
  `Register: ${calls.length} calls, ${Object.keys(results).length} scored (${scored} new)` +
    (due ? `, ${due} due but unresolved` : "")
);
