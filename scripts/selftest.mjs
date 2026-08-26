#!/usr/bin/env node
// Offline self test. Stubs fetch with real recorded payloads from each provider
// and checks the parsers produce the rows the site expects.
// Run with: node scripts/selftest.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const TREASURY_XML = `<?xml version="1.0"?><feed xmlns:d="x"><entry><content><m:properties>
<d:NEW_DATE>2026-08-24T00:00:00</d:NEW_DATE><d:BC_2YEAR>4.20</d:BC_2YEAR><d:BC_10YEAR>4.61</d:BC_10YEAR><d:BC_30YEAR>5.14</d:BC_30YEAR>
</m:properties></content></entry><entry><content><m:properties>
<d:NEW_DATE>2026-08-25T00:00:00</d:NEW_DATE><d:BC_2YEAR>4.17</d:BC_2YEAR><d:BC_10YEAR>4.64</d:BC_10YEAR><d:BC_30YEAR>5.17</d:BC_30YEAR>
</m:properties></content></entry></feed>`;

const FX = { result: "success", time_last_update_utc: "Tue, 25 Aug 2026 00:02:31 +0000", base_code: "USD",
  rates: { USD: 1, AED: 3.6725, EUR: 0.85749, GBP: 0.73358, JPY: 159.24, CHF: 0.80269, INR: 87.41 } };

const GOLD = { currency: "USD", name: "Gold", price: 4636.200195, symbol: "XAU", updatedAt: "2026-08-26T07:16:12Z" };
const SILVER = { currency: "USD", name: "Silver", price: 68.232002, symbol: "XAG", updatedAt: "2026-08-25T12:54:27Z" };

const KRAKEN = { error: [], result: {
  XXBTZUSD: { c: ["79071.40000", "0.00089818"], o: "78509.50000", h: ["79221.6", "80924.7"], l: ["78307.3", "77850.0"] },
  XETHZUSD: { c: ["2463.84000", "0.87838750"], o: "2442.55000", h: ["2469.41", "2514.20"], l: ["2436.34", "2415.31"] },
} };

const STOOQ = `Symbol,Date,Time,Open,High,Low,Close,Volume
SPY.US,2026-08-25,21:00:00,681.20,684.55,679.90,683.41,54120000
QQQ.US,2026-08-25,21:00:00,592.10,595.80,590.44,594.92,31200000
IWM.US,2026-08-25,21:00:00,238.44,240.10,237.88,239.55,22100000
EWU.US,2026-08-25,21:00:00,41.02,41.30,40.95,41.18,2100000
EWG.US,2026-08-25,21:00:00,42.77,43.05,42.60,42.91,1800000
EEM.US,2026-08-25,21:00:00,58.31,58.70,58.10,58.62,29400000
VNQ.US,2026-08-25,21:00:00,92.40,92.95,92.10,92.66,4100000
VNQI.US,2026-08-25,21:00:00,46.12,46.40,46.00,46.30,600000
CL.F,2026-08-25,21:00:00,64.10,64.90,63.85,64.55,412000`;

const routes = [
  [/home\.treasury\.gov/, () => new Response(TREASURY_XML, { status: 200 })],
  [/open\.er-api\.com/, () => new Response(JSON.stringify(FX), { status: 200, headers: { "content-type": "application/json" } })],
  [/gold-api\.com\/price\/XAU/, () => new Response(JSON.stringify(GOLD), { status: 200, headers: { "content-type": "application/json" } })],
  [/gold-api\.com\/price\/XAG/, () => new Response(JSON.stringify(SILVER), { status: 200, headers: { "content-type": "application/json" } })],
  [/api\.kraken\.com/, () => new Response(JSON.stringify(KRAKEN), { status: 200, headers: { "content-type": "application/json" } })],
  [/stooq\.com/, () => new Response(STOOQ, { status: 200 })],
];

global.fetch = async (url) => {
  const u = String(url);
  for (const [re, fn] of routes) if (re.test(u)) return fn();
  throw new Error(`no stub for ${u}`);
};

const marketPath = path.join(root, "content/market.json");
const statusPath = path.join(root, "content/status.json");
const backup = { m: fs.readFileSync(marketPath, "utf8"), s: fs.readFileSync(statusPath, "utf8") };

await import("./fetch-market-data.mjs");

const market = JSON.parse(fs.readFileSync(marketPath, "utf8"));
const by = Object.fromEntries(market.quotes.map((q) => [q.symbol, q]));

let fails = 0;
function check(name, cond, got) {
  if (cond) console.log(`  pass  ${name}`);
  else { console.log(`  FAIL  ${name}  got: ${JSON.stringify(got)}`); fails++; }
}

console.log("\nParser checks");
check("22 quotes parsed", market.quotes.length === 22, market.quotes.length);
check("10Y takes the LAST entry, not the first", by["us-10y"]?.value === 4.64, by["us-10y"]?.value);
check("10Y change computed from the prior entry", by["us-10y"]?.changeAbs === 0.03, by["us-10y"]?.changeAbs);
check("AED present and pegged", by["usd-aed"]?.value === 3.6725, by["usd-aed"]?.value);
check("gold rounded to 2dp", by["xau"]?.value === 4636.2, by["xau"]?.value);
check("BTC parsed from the RESPONSE key XXBTZUSD", by["btc-usd"]?.value === 79071.4, by["btc-usd"]?.value);
check("BTC change from today's open", by["btc-usd"]?.changePct === 0.72, by["btc-usd"]?.changePct);
check("ETH parsed from XETHZUSD", by["eth-usd"]?.value === 2463.84, by["eth-usd"]?.value);
check("SPY uses close, not open", by["spy"]?.value === 683.41, by["spy"]?.value);
check("no index levels published", !market.quotes.some((q) => /S&P|FTSE|DAX|Dow Jones/i.test(q.label)), market.quotes.map((q) => q.label));
check("VNQ filed under property", by["vnq"]?.category === "property", by["vnq"]?.category);
check("WTI filed under commodity", by["wti"]?.category === "commodity", by["wti"]?.category);
check("every row names a source", market.quotes.every((q) => q.source && q.sourceUrl), null);
check("every row has an as-of", market.quotes.every((q) => q.asOf), null);
check("nothing stale on a clean run", market.quotes.every((q) => !q.stale), null);

const status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
check("run logged ok", status.runs[0]?.status === "ok", status.runs[0]);

/* stale merge: run again with everything failing */
console.log("\nFailure handling");
global.fetch = async () => { throw new Error("simulated outage"); };
const mod = `${new URL("./fetch-market-data.mjs", import.meta.url).href}?v=2`;
await import(mod);
const after = JSON.parse(fs.readFileSync(marketPath, "utf8"));
check("previous values survive a total outage", after.quotes.length === 22, after.quotes.length);
check("survivors flagged stale", after.quotes.every((q) => q.stale), null);
check("outage logged as failed", JSON.parse(fs.readFileSync(statusPath, "utf8")).runs[0]?.status === "failed", null);

/* restore */
fs.writeFileSync(marketPath, backup.m);
fs.writeFileSync(statusPath, backup.s);

console.log(fails ? `\n${fails} check(s) failed.\n` : "\nAll checks passed.\n");
process.exit(fails ? 1 : 0);
