#!/usr/bin/env node
// Fallback tests. Simulates the two sources that refuse requests from some
// datacentre ranges (home.treasury.gov and stooq.com) and checks that the
// FRED CSV and the stooq.pl mirror recover every figure, and that a recovered
// fallback is logged as a note rather than a degraded run.
// Run with: node scripts/fallbacktest.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
process.chdir(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."));
const FRED = `observation_date,DGS2,DGS10,DGS30
2026-08-21,4.19,4.60,5.13
2026-08-22,.,.,.
2026-08-25,4.17,4.64,5.17
`;
const STOOQ = `Symbol,Date,Time,Open,High,Low,Close,Volume
SPY.US,2026-08-25,21:00:00,681.20,684.55,679.90,683.41,54120000
CL.F,2026-08-25,21:00:00,64.10,64.90,63.85,64.55,412000`;
const FX = {result:"success",time_last_update_utc:"Tue, 25 Aug 2026 00:02:31 +0000",rates:{AED:3.6725,EUR:0.857,GBP:0.733,JPY:159.24,CHF:0.803,INR:87.4}};
const KR = {error:[],result:{XXBTZUSD:{c:["79071.4","0"],o:"78509.5"},XETHZUSD:{c:["2463.84","0"],o:"2442.55"}}};
const GOLD = {price:4636.2,updatedAt:"2026-08-26T07:16:12Z"};
global.fetch = async (u) => {
  u = String(u);
  if (u.includes("home.treasury.gov")) return new Response("blocked", {status:403});
  if (u.includes("fredgraph.csv")) return new Response(FRED, {status:200});
  if (u.includes("stooq.com")) return new Response("blocked", {status:403});
  if (u.includes("stooq.pl")) return new Response(STOOQ, {status:200});
  if (u.includes("er-api")) return new Response(JSON.stringify(FX), {status:200});
  if (u.includes("kraken")) return new Response(JSON.stringify(KR), {status:200});
  if (u.includes("gold-api")) return new Response(JSON.stringify(GOLD), {status:200});
  throw new Error("no stub "+u);
};
const backup = {
  m: fs.readFileSync("content/market.json", "utf8"),
  s: fs.readFileSync("content/status.json", "utf8"),
};
await import("./fetch-market-data.mjs");
const m = JSON.parse(fs.readFileSync("content/market.json","utf8"));
const by = Object.fromEntries(m.quotes.map(q=>[q.symbol,q]));
let f=0; const ck=(n,c,g)=>{ console.log((c?"  pass  ":"  FAIL  ")+n+(c?"":"  got: "+JSON.stringify(g))); if(!c)f++; };
console.log("\nFallback checks");
ck("10Y recovered via FRED", by["us-10y"]?.value === 4.64, by["us-10y"]?.value);
ck("FRED skips the blank row for the change", by["us-10y"]?.changeAbs === 0.04, by["us-10y"]?.changeAbs);
ck("30Y recovered", by["us-30y"]?.value === 5.17, by["us-30y"]?.value);
ck("rates credited to FRED", (by["us-10y"]?.source||"").includes("FRED"), by["us-10y"]?.source);
ck("SPY recovered via the stooq.pl mirror", by["spy"]?.value === 683.41, by["spy"]?.value);
ck("rates not stale", by["us-10y"] && !by["us-10y"].stale, by["us-10y"]?.stale);
const s = JSON.parse(fs.readFileSync("content/status.json","utf8"));
console.log("  status:", s.runs[0].status, "|", s.runs[0].detail.slice(0,120));
ck("run recorded ok", s.runs[0].status === "ok", s.runs[0].status);
fs.writeFileSync("content/market.json", backup.m);
fs.writeFileSync("content/status.json", backup.s);
console.log(f ? `\n${f} check(s) failed.\n` : "\nAll fallback checks passed.\n");
process.exit(f?1:0);
