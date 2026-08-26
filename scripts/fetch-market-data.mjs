#!/usr/bin/env node
// Daily market data pull. Zero dependencies, Node 18+ global fetch.
// Writes content/market.json and appends to content/status.json.
// Never blanks a tile: on failure the previous value is kept and flagged stale.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MARKET = path.join(root, "content/market.json");
const STATUS = path.join(root, "content/status.json");

const UA = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36 InvestmentsPlaybook/1.0 (+https://investmentsplaybook.com)",
  "Accept": "*/*",
  "Accept-Language": "en",
};
const TIMEOUT = 12000;

async function get(url, as = "json") {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(TIMEOUT) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return as === "json" ? r.json() : r.text();
}

const rows = [];
const errors = {};
const nowIso = () => new Date().toISOString();

/* ---------------------------------------------------------------
   FRED, the Federal Reserve Bank of St. Louis, is the backbone here.
   Keyless, reachable from CI, and the series we use are produced by
   the US Treasury, the Fed, the BLS and the EIA, so there is no index
   licence to worry about. Deliberately NOT used: Case-Shiller and VIX,
   which are S&P and Cboe intellectual property.
----------------------------------------------------------------*/
async function fredOne(def, windowDays) {
  const from = new Date(Date.now() - windowDays * 86400000).toISOString().slice(0, 10);
  const csv = await get(
    `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${def.id}&cosd=${from}`,
    "text"
  );
  // One series per request. Asking for several at once makes FRED align them
  // to the lowest common frequency and rename the columns, which is why this
  // is deliberately not batched.
  const pts = [];
  for (const line of csv.trim().split("\n").slice(1)) {
    const [date, raw] = line.split(",");
    const v = parseFloat(raw);
    if (Number.isFinite(v)) pts.push([date, v]);
  }
  if (!pts.length) throw new Error(`${def.id}: no observations`);

  const [date, value] = pts.at(-1);
  const prev = pts.length > 1 ? pts.at(-2)[1] : null;
  rows.push({
    symbol: def.symbol,
    label: def.label,
    category: def.category,
    value: +value.toFixed(def.dp ?? 2),
    changeAbs: prev === null ? null : +(value - prev).toFixed(3),
    changePct: prev ? +(((value - prev) / prev) * 100).toFixed(2) : null,
    unit: def.unit,
    source: def.source,
    sourceUrl: `https://fred.stlouisfed.org/series/${def.id}`,
    asOf: new Date(`${date}T00:00:00Z`).toISOString(),
    order: def.order,
    stale: false,
  });
}

async function fredSeries(defs, windowDays = 400) {
  const results = await Promise.all(
    defs.map((d) => fredOne(d, windowDays).then(() => null).catch((e) => `${d.id} ${e.message}`))
  );
  const failed = results.filter(Boolean);
  if (failed.length === defs.length) throw new Error(failed.join("; "));
  if (failed.length) errors[`fred-${defs[0].id}`] = failed.join("; ");
}

/* 1. RATES AND THE REAL COST OF MONEY. */
const RATE_SERIES = [
  { id: "DGS2", symbol: "us-2y", label: "US 2Y Treasury", category: "rate", unit: "%", order: 1, source: "U.S. Treasury via FRED" },
  { id: "DGS10", symbol: "us-10y", label: "US 10Y Treasury", category: "rate", unit: "%", order: 2, source: "U.S. Treasury via FRED" },
  { id: "DGS30", symbol: "us-30y", label: "US 30Y Treasury", category: "rate", unit: "%", order: 3, source: "U.S. Treasury via FRED" },
  { id: "DFII10", symbol: "us-10y-real", label: "US 10Y Real Yield", category: "rate", unit: "%", order: 4, source: "U.S. Treasury via FRED" },
  { id: "T10YIE", symbol: "breakeven-10y", label: "10Y Breakeven Inflation", category: "rate", unit: "%", order: 5, source: "Federal Reserve Bank of St. Louis" },
  { id: "MORTGAGE30US", symbol: "us-30y-mortgage", label: "US 30Y Mortgage Rate", category: "rate", unit: "%", order: 6, source: "Freddie Mac via FRED" },
];

/* 5. MACRO AND COMMODITIES, the property-relevant series. */
const MACRO_SERIES = [
  { id: "DCOILWTICO", symbol: "wti", label: "Crude Oil WTI", category: "commodity", unit: "USD", order: 32, source: "U.S. Energy Information Administration via FRED" },
  { id: "DTWEXBGS", symbol: "dxy-broad", label: "US Dollar, Broad Index", category: "fx", unit: "index", order: 46, source: "Federal Reserve Board via FRED" },
  { id: "CPIAUCSL", symbol: "us-cpi", label: "US CPI, All Items", category: "rate", unit: "index", order: 7, source: "U.S. Bureau of Labor Statistics via FRED" },
];

const rates = () => fredSeries(RATE_SERIES, 120);
const macro = () => fredSeries(MACRO_SERIES, 500);


/* 2. FX INCLUDING AED. One call, 160 currencies.
   Attribution to exchangerate-api.com is required by their terms and is in the footer. */
async function fx() {
  const d = await get("https://open.er-api.com/v6/latest/USD");
  if (d.result !== "success") throw new Error("bad result");
  const asOf = d.time_last_update_utc ? new Date(d.time_last_update_utc).toISOString() : nowIso();
  for (const [code, label, order] of [
    ["EUR", "USD / EUR", 40], ["GBP", "USD / GBP", 41], ["JPY", "USD / JPY", 42],
    ["AED", "USD / AED", 43], ["CHF", "USD / CHF", 44], ["INR", "USD / INR", 45],
  ]) {
    const v = d.rates?.[code];
    if (typeof v !== "number") continue;
    rows.push({
      symbol: `usd-${code.toLowerCase()}`, label, category: "fx",
      value: +v.toFixed(4), changePct: null, changeAbs: null, unit: "",
      source: "ExchangeRate-API", sourceUrl: "https://www.exchangerate-api.com",
      asOf, order, stale: false,
    });
  }
}

/* 3. GOLD AND SILVER. */
async function metals() {
  let got = 0;
  for (const [sym, label, order] of [["XAU", "Gold", 30], ["XAG", "Silver", 31]]) {
    const d = await get(`https://api.gold-api.com/price/${sym}`);
    if (typeof d.price !== "number") continue;
    got++;
    rows.push({
      symbol: sym.toLowerCase(), label, category: "commodity",
      value: +d.price.toFixed(2), changePct: null, changeAbs: null, unit: "USD/oz",
      source: "gold-api.com", sourceUrl: "https://api.gold-api.com",
      asOf: d.updatedAt || nowIso(), order, stale: false,
    });
  }
  if (!got) throw new Error("no metal prices");
}

/* 4. CRYPTO. One call for both. Parse by RESPONSE key, not request string. */
async function crypto() {
  const d = await get("https://api.kraken.com/0/public/Ticker?pair=XBTUSD,ETHUSD");
  if (d.error?.length) throw new Error(d.error.join(","));
  const map = { XXBTZUSD: ["btc-usd", "Bitcoin", 50], XETHZUSD: ["eth-usd", "Ethereum", 51] };
  for (const [key, tick] of Object.entries(d.result || {})) {
    const meta = map[key];
    if (!meta) continue;
    const last = parseFloat(tick.c[0]);
    const open = parseFloat(tick.o);
    rows.push({
      symbol: meta[0], label: meta[1], category: "crypto",
      value: +last.toFixed(2),
      changeAbs: +(last - open).toFixed(2),
      changePct: open ? +(((last - open) / open) * 100).toFixed(2) : null,
      unit: "USD", source: "Kraken", sourceUrl: "https://www.kraken.com",
      asOf: nowIso(), order: meta[2], stale: false,
    });
  }
}

/* ---------------- run ---------------- */
const tasks = [
  ["rates", rates],
  ["macro", macro],
  ["fx", fx],
  ["metals", metals],
  ["crypto", crypto],
];
await Promise.all(
  tasks.map(async ([name, fn]) => {
    try { await fn(); } catch (e) { errors[name] = String(e.message || e); }
  })
);

let prev = { asOf: null, quotes: [] };
try { prev = JSON.parse(fs.readFileSync(MARKET, "utf8")); } catch {}

// Merge: fresh rows win, previous rows survive as stale.
const bySymbol = new Map();
for (const q of prev.quotes || []) bySymbol.set(q.symbol, { ...q, stale: true });
for (const q of rows) bySymbol.set(q.symbol, { ...q, fetched_at: nowIso() });

// A row that has not refreshed in a fortnight is either a dead provider or a
// series we retired. Either way it stops being a figure worth publishing, so
// it is dropped rather than left on the page wearing a stale badge forever.
const RETIRE_AFTER_DAYS = 14;
const cutoff = Date.now() - RETIRE_AFTER_DAYS * 86400000;
const merged = [...bySymbol.values()]
  .filter((q) => !q.stale || new Date(q.fetched_at || q.asOf || 0).getTime() > cutoff)
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

fs.writeFileSync(MARKET, JSON.stringify({ asOf: nowIso(), quotes: merged }, null, 1));

// A "-primary" entry means a source refused but its fallback covered it.
// That is a note, not a degraded day.
const notes = Object.entries(errors);
const realFailures = notes.filter(([k]) => !k.endsWith("-primary"));
const errCount = notes.length;
const status = rows.length === 0 ? "failed" : realFailures.length ? "partial" : "ok";
let s = { runs: [] };
try { s = JSON.parse(fs.readFileSync(STATUS, "utf8")); } catch {}
s.runs.unshift({
  job: "fetch-market-data",
  status,
  detail: `${rows.length} figures refreshed${errCount ? `. Notes: ${notes.map(([k, v]) => `${k} ${v}`).join("; ").slice(0, 300)}` : ""}`,
  ranAt: nowIso(),
});
s.runs = s.runs.slice(0, 40);
fs.writeFileSync(STATUS, JSON.stringify(s, null, 1));

console.log(`fetch-market-data: ${status}. ${rows.length} fresh, ${merged.length} total.`);
if (errCount) console.log("  errors:", JSON.stringify(errors));
if (rows.length === 0) process.exitCode = 1;
