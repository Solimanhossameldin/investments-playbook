#!/usr/bin/env node
// The chartbook. Long-run history for the handful of series that actually
// explain the cost of money. Zero dependencies, Node 18+ global fetch.
//
// Writes content/chartbook.json. Same discipline as the daily pull: one FRED
// series per request, last good data survives a failure, every series carries
// its own source and its own date range.
//
// Deliberately absent, same as everywhere else on this site: Case-Shiller,
// VIX, and every proprietary equity index. The series below are produced by
// the U.S. Treasury, the Federal Reserve Board, the BLS, the EIA and Freddie
// Mac, all of which are public domain under 17 U.S.C. 105.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(root, "content/chartbook.json");

const WINDOW_YEARS = 12;
const MAX_POINTS = 240;
const TIMEOUT = 20000;

const UA = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 InvestmentsPlaybook/1.0 (+https://investmentsplaybook.com)",
  Accept: "*/*",
};

const nowIso = () => new Date().toISOString();
const errors = {};

async function fredCsv(id, from) {
  const r = await fetch(
    `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=${from}`,
    { headers: UA, signal: AbortSignal.timeout(TIMEOUT) }
  );
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const csv = await r.text();
  const pts = [];
  for (const line of csv.trim().split("\n").slice(1)) {
    const [date, raw] = line.split(",");
    const v = parseFloat(raw);
    // FRED writes "." for a missing observation. Skipping is correct; a zero
    // would draw a cliff that never happened.
    if (Number.isFinite(v) && /^\d{4}-\d{2}-\d{2}$/.test(date)) pts.push([date, v]);
  }
  if (!pts.length) throw new Error(`${id}: no observations`);
  return pts;
}

/* Bucket the series and keep the extremes of each bucket, in date order.
   An even stride would be simpler and would quietly delete every spike,
   which on a chart of interest rates is the only part anybody cares about. */
export function downsample(pts, maxPoints = MAX_POINTS) {
  if (pts.length <= maxPoints) return pts;
  const buckets = Math.max(2, Math.floor(maxPoints / 2));
  const size = pts.length / buckets;
  const out = [];
  for (let b = 0; b < buckets; b++) {
    const slice = pts.slice(Math.floor(b * size), Math.floor((b + 1) * size));
    if (!slice.length) continue;
    let lo = slice[0], hi = slice[0];
    for (const p of slice) {
      if (p[1] < lo[1]) lo = p;
      if (p[1] > hi[1]) hi = p;
    }
    const pair = lo[0] <= hi[0] ? [lo, hi] : [hi, lo];
    for (const p of pair) if (!out.length || out.at(-1)[0] !== p[0]) out.push(p);
  }
  if (out.at(-1)[0] !== pts.at(-1)[0]) out.push(pts.at(-1));
  return out;
}

/* Year-over-year percentage change on a monthly index. */
export function yoy(pts, periods = 12) {
  const out = [];
  for (let i = periods; i < pts.length; i++) {
    const base = pts[i - periods][1];
    if (!base) continue;
    out.push([pts[i][0], +(((pts[i][1] - base) / base) * 100).toFixed(2)]);
  }
  return out;
}

/* Difference two series on the dates they share. A date present in one and
   absent in the other is dropped rather than carried forward, because a
   carried-forward spread is a number nobody observed. */
export function spread(a, b) {
  const map = new Map(b);
  const out = [];
  for (const [date, v] of a) {
    const other = map.get(date);
    if (typeof other === "number") out.push([date, +(v - other).toFixed(2)]);
  }
  return out;
}

function summarise(pts, dp) {
  const round = (n) => +Number(n).toFixed(dp);
  let lo = pts[0], hi = pts[0];
  for (const p of pts) {
    if (p[1] < lo[1]) lo = p;
    if (p[1] > hi[1]) hi = p;
  }
  const lastDate = new Date(pts.at(-1)[0] + "T00:00:00Z");
  const target = new Date(lastDate);
  target.setUTCFullYear(target.getUTCFullYear() - 1);
  let yearAgo = null;
  for (const p of pts) {
    if (new Date(p[0] + "T00:00:00Z") <= target) yearAgo = p;
    else break;
  }
  return {
    latest: { date: pts.at(-1)[0], value: round(pts.at(-1)[1]) },
    yearAgo: yearAgo ? { date: yearAgo[0], value: round(yearAgo[1]) } : null,
    min: { date: lo[0], value: round(lo[1]) },
    max: { date: hi[0], value: round(hi[1]) },
    first: pts[0][0],
    last: pts.at(-1)[0],
  };
}

const FRED = (id) => `https://fred.stlouisfed.org/series/${id}`;

/* The seven charts. Order is the order they appear on the page, which runs
   from the number that moves everything to the numbers it moves. */
const CHARTS = [
  {
    key: "real-yield",
    ids: ["DFII10"],
    label: "US 10-year real yield",
    unit: "%",
    dp: 2,
    zero: true,
    source: "U.S. Treasury via FRED",
    sourceUrl: FRED("DFII10"),
  },
  {
    key: "mortgage",
    ids: ["MORTGAGE30US"],
    label: "US 30-year fixed mortgage rate",
    unit: "%",
    dp: 2,
    source: "Freddie Mac via FRED",
    sourceUrl: FRED("MORTGAGE30US"),
  },
  {
    key: "curve",
    ids: ["DGS10", "DGS2"],
    derive: "spread",
    label: "US yield curve, 10-year minus 2-year",
    unit: "pp",
    dp: 2,
    zero: true,
    source: "U.S. Treasury via FRED",
    sourceUrl: FRED("T10Y2Y"),
  },
  {
    key: "breakeven",
    ids: ["T10YIE"],
    label: "10-year breakeven inflation",
    unit: "%",
    dp: 2,
    source: "Federal Reserve Bank of St. Louis",
    sourceUrl: FRED("T10YIE"),
  },
  {
    key: "cpi",
    ids: ["CPIAUCSL"],
    derive: "yoy",
    label: "US CPI, year over year",
    unit: "%",
    dp: 2,
    zero: true,
    source: "U.S. Bureau of Labor Statistics via FRED",
    sourceUrl: FRED("CPIAUCSL"),
  },
  {
    key: "dollar",
    ids: ["DTWEXBGS"],
    label: "US dollar, broad trade-weighted index",
    unit: "index",
    dp: 1,
    source: "Federal Reserve Board via FRED",
    sourceUrl: FRED("DTWEXBGS"),
  },
  {
    key: "oil",
    ids: ["DCOILWTICO"],
    label: "Crude oil, WTI spot",
    unit: "USD",
    dp: 2,
    source: "U.S. Energy Information Administration via FRED",
    sourceUrl: FRED("DCOILWTICO"),
  },
];

const MAX_AGE_DAYS = 7;

/* Twelve years of history does not change materially between Tuesday and
   Wednesday, and rewriting the file on every run would put a large diff into
   the repository twice a day for nothing. So the fetch is weekly, and the page
   publishes the date it actually last refreshed rather than the build date. */
function isFresh() {
  try {
    const d = JSON.parse(fs.readFileSync(OUT, "utf8"));
    if (!d.asOf || !Object.keys(d.series || {}).length) return false;
    return Date.now() - Date.parse(d.asOf) < MAX_AGE_DAYS * 86400000;
  } catch { return false; }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (isFresh() && !process.argv.includes("--force")) {
    console.log(`Chartbook is under ${MAX_AGE_DAYS} days old. Skipping. Use --force to refetch.`);
    process.exit(0);
  }
  const from = new Date();
  // CPI needs an extra year of history behind the window to compute the first
  // year-over-year reading, so the fetch reaches back further than it draws.
  from.setUTCFullYear(from.getUTCFullYear() - (WINDOW_YEARS + 2));
  const cosd = from.toISOString().slice(0, 10);
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - WINDOW_YEARS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const series = {};
  for (const c of CHARTS) {
    try {
      const raw = [];
      // One series per request. Batching makes FRED align mixed frequencies
      // and rename the columns, which silently breaks the parser.
      for (const id of c.ids) raw.push(await fredCsv(id, cosd));
      let pts =
        c.derive === "spread" ? spread(raw[0], raw[1]) : c.derive === "yoy" ? yoy(raw[0]) : raw[0];
      pts = pts.filter(([d]) => d >= cutoffStr);
      if (!pts.length) throw new Error("empty after window filter");
      series[c.key] = {
        key: c.key,
        label: c.label,
        unit: c.unit,
        dp: c.dp,
        zero: !!c.zero,
        source: c.source,
        sourceUrl: c.sourceUrl,
        ...summarise(pts, c.dp),
        points: downsample(pts),
        fetchedAt: nowIso(),
      };
    } catch (e) {
      errors[c.key] = String(e.message || e);
    }
  }

  // Keep what worked last time rather than blanking a chart. A chart that
  // silently disappears is worse than one that says how old it is.
  let prev = { series: {} };
  try { prev = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch {}
  for (const [k, v] of Object.entries(prev.series || {})) {
    if (!series[k]) series[k] = { ...v, stale: true };
  }

  const ordered = {};
  for (const c of CHARTS) if (series[c.key]) ordered[c.key] = series[c.key];

  fs.writeFileSync(
    OUT,
    JSON.stringify(
      { asOf: nowIso(), windowYears: WINDOW_YEARS, series: ordered, errors },
      null,
      1
    )
  );

  const n = Object.keys(ordered).length;
  console.log(`Chartbook: ${n}/${CHARTS.length} series, ${WINDOW_YEARS}y window.`);
  if (Object.keys(errors).length) console.warn("Failed:", errors);
  if (!n) process.exit(1);
}

export { CHARTS, WINDOW_YEARS, MAX_AGE_DAYS, summarise };
