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

const UA = { "User-Agent": "InvestmentsPlaybook/1.0 (+https://investmentsplaybook.com)" };
const TIMEOUT = 12000;

async function get(url, as = "json") {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(TIMEOUT) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return as === "json" ? r.json() : r.text();
}

const rows = [];
const errors = {};
const nowIso = () => new Date().toISOString();

/* 1. US TREASURY YIELD CURVE. Public domain. One call returns the month. */
async function treasury() {
  const now = new Date();
  let stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  let xml = await get(
    `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve&field_tdr_date_value_month=${stamp}`,
    "text"
  );
  let entries = xml.split("<entry>").slice(1);
  if (!entries.length) {
    // Early in a month the current file can be empty. Fall back to the previous month.
    const p = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    stamp = `${p.getUTCFullYear()}${String(p.getUTCMonth() + 1).padStart(2, "0")}`;
    xml = await get(
      `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/pages/xml?data=daily_treasury_yield_curve&field_tdr_date_value_month=${stamp}`,
      "text"
    );
    entries = xml.split("<entry>").slice(1);
  }
  if (!entries.length) throw new Error("no entries");

  const last = entries.at(-1);
  const prev = entries.length > 1 ? entries.at(-2) : null;
  const pick = (blob, tag) => {
    if (!blob) return null;
    const m = blob.match(new RegExp(`<d:${tag}[^>]*>([^<]*)</d:${tag}>`));
    return m ? parseFloat(m[1]) : null;
  };
  const dateM = last.match(/<d:NEW_DATE[^>]*>([^<]*)</);
  const asOf = dateM ? new Date(dateM[1]).toISOString() : nowIso();

  for (const [tag, label, symbol, order] of [
    ["BC_2YEAR", "US 2Y Treasury", "us-2y", 21],
    ["BC_10YEAR", "US 10Y Treasury", "us-10y", 20],
    ["BC_30YEAR", "US 30Y Treasury", "us-30y", 22],
  ]) {
    const v = pick(last, tag);
    if (v === null || Number.isNaN(v)) continue;
    const p = pick(prev, tag);
    rows.push({
      symbol, label, category: "rate", value: v, unit: "%",
      changeAbs: p === null ? null : +(v - p).toFixed(3),
      changePct: p ? +(((v - p) / p) * 100).toFixed(2) : null,
      source: "U.S. Department of the Treasury",
      sourceUrl: "https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve",
      asOf, order, stale: false,
    });
  }
}

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
  for (const [sym, label, order] of [["XAU", "Gold", 30], ["XAG", "Silver", 31]]) {
    try {
      const d = await get(`https://api.gold-api.com/price/${sym}`);
      if (typeof d.price !== "number") continue;
      rows.push({
        symbol: sym.toLowerCase(), label, category: "commodity",
        value: +d.price.toFixed(2), changePct: null, changeAbs: null, unit: "USD/oz",
        source: "gold-api.com", sourceUrl: "https://api.gold-api.com",
        asOf: d.updatedAt || nowIso(), order, stale: false,
      });
    } catch (e) { errors[`metal-${sym}`] = String(e.message || e); }
  }
}

/* 4. CRYPTO. One call for both. Parse by RESPONSE key, not request string. */
async function crypto() {
  const d = await get("https://api.kraken.com/0/public/Ticker?pair=XBTUSD,ETHUSD");
  if (d.error?.length) throw new Error(d.error.join(","));
  const map = { XXBTZUSD: ["btc-usd", "Bitcoin", 50], XETHZUSD: ["eth-usd", "Ethereum", 51] };
  for (const [key, t] of Object.entries(d.result || {})) {
    const meta = map[key];
    if (!meta) continue;
    const last = parseFloat(t.c[0]);
    const open = parseFloat(t.o);
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

/* 5. EQUITY ETF PROXIES, REITs AND OIL. One multi-symbol Stooq call.
   Deliberately ETF prices, never proprietary index levels: republishing
   S&P 500 or FTSE index levels requires a licence we do not hold. */
async function stooq() {
  const defs = {
    "SPY.US": ["spy", "US Large Cap (SPY)", "equity", 1],
    "QQQ.US": ["qqq", "US Tech (QQQ)", "equity", 2],
    "IWM.US": ["iwm", "US Small Cap (IWM)", "equity", 3],
    "EWU.US": ["ewu", "UK Equity (EWU)", "equity", 4],
    "EWG.US": ["ewg", "Germany Equity (EWG)", "equity", 5],
    "EEM.US": ["eem", "Emerging Markets (EEM)", "equity", 6],
    "VNQ.US": ["vnq", "US REITs (VNQ)", "property", 60],
    "VNQI.US": ["vnqi", "Global ex-US REITs (VNQI)", "property", 61],
    "CL.F": ["wti", "Crude Oil WTI", "commodity", 32],
  };
  const syms = Object.keys(defs).map((s) => s.toLowerCase()).join(",");
  const csv = await get(`https://stooq.com/q/l/?s=${syms}&f=sd2t2ohlcv&h&e=csv`, "text");
  const lines = csv.trim().split("\n").slice(1);
  let got = 0;
  for (const line of lines) {
    const p = line.split(",");
    if (p.length < 8) continue;
    const meta = defs[p[0].toUpperCase()];
    if (!meta) continue;
    const open = parseFloat(p[3]);
    const close = parseFloat(p[6]);
    if (!Number.isFinite(close) || close <= 0) continue;
    got++;
    rows.push({
      symbol: meta[0], label: meta[1], category: meta[2], value: +close.toFixed(2),
      changeAbs: Number.isFinite(open) ? +(close - open).toFixed(2) : null,
      changePct: Number.isFinite(open) && open ? +(((close - open) / open) * 100).toFixed(2) : null,
      unit: "USD", source: "Stooq", sourceUrl: "https://stooq.com",
      asOf: p[1] ? new Date(`${p[1]}T${p[2] || "00:00:00"}Z`).toISOString() : nowIso(),
      order: meta[3], stale: false,
    });
  }
  if (!got) throw new Error("no usable rows");
}

/* ---------------- run ---------------- */
const tasks = [["treasury", treasury], ["fx", fx], ["metals", metals], ["crypto", crypto], ["stooq", stooq]];
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
for (const q of rows) bySymbol.set(q.symbol, q);

const merged = [...bySymbol.values()].sort(
  (a, b) => (a.order ?? 99) - (b.order ?? 99)
);

fs.writeFileSync(MARKET, JSON.stringify({ asOf: nowIso(), quotes: merged }, null, 1));

const errCount = Object.keys(errors).length;
const status = rows.length === 0 ? "failed" : errCount ? "partial" : "ok";
let s = { runs: [] };
try { s = JSON.parse(fs.readFileSync(STATUS, "utf8")); } catch {}
s.runs.unshift({
  job: "fetch-market-data",
  status,
  detail: `${rows.length} figures refreshed${errCount ? `, ${errCount} source(s) failed: ${Object.keys(errors).join(", ")}` : ""}`,
  ranAt: nowIso(),
});
s.runs = s.runs.slice(0, 40);
fs.writeFileSync(STATUS, JSON.stringify(s, null, 1));

console.log(`fetch-market-data: ${status}. ${rows.length} fresh, ${merged.length} total.`);
if (errCount) console.log("  errors:", JSON.stringify(errors));
if (rows.length === 0) process.exitCode = 1;
