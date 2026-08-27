#!/usr/bin/env node
// Offline tests for the data pipeline. Stubs fetch with real recorded payload
// shapes and checks the parsers produce the rows the site expects, including
// the mixed-frequency FRED columns and the never-blank-a-tile behaviour.
// Run with: node scripts/selftest.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Daily series. Note the blank row: FRED writes "." on non-trading days,
// and CPI is monthly so it only prints on the first of the month.
// FRED is asked for one series at a time, so each stub is a single column.
// The blank rows are real: FRED writes "." on days a series does not publish.
const FRED = {
  DGS2: "observation_date,DGS2\n2026-08-24,4.22\n2026-08-25,4.24\n",
  DGS10: "observation_date,DGS10\n2026-08-20,4.66\n2026-08-21,.\n2026-08-24,4.67\n2026-08-25,4.70\n",
  DGS30: "observation_date,DGS30\n2026-08-24,5.20\n2026-08-25,5.23\n",
  DFII10: "observation_date,DFII10\n2026-08-24,2.12\n2026-08-25,2.15\n",
  T10YIE: "observation_date,T10YIE\n2026-08-24,2.55\n2026-08-25,2.55\n",
  MORTGAGE30US: "observation_date,MORTGAGE30US\n2026-08-14,6.71\n2026-08-21,6.67\n",
  DCOILWTICO: "observation_date,DCOILWTICO\n2026-08-21,64.10\n2026-08-25,64.55\n",
  DTWEXBGS: "observation_date,DTWEXBGS\n2026-08-21,121.44\n2026-08-25,121.80\n",
  CPIAUCSL: "observation_date,CPIAUCSL\n2026-05-01,320.9\n2026-06-01,321.400\n",
};
const FX = { result: "success", time_last_update_utc: "Tue, 25 Aug 2026 00:02:31 +0000", base_code: "USD",
  rates: { USD: 1, AED: 3.6725, EUR: 0.85749, GBP: 0.73358, JPY: 159.24, CHF: 0.80269, INR: 87.41 } };
const GOLD = { currency: "USD", name: "Gold", price: 4636.200195, symbol: "XAU", updatedAt: "2026-08-26T07:16:12Z" };
const SILVER = { currency: "USD", name: "Silver", price: 68.232002, symbol: "XAG", updatedAt: "2026-08-25T12:54:27Z" };
const KRAKEN = { error: [], result: {
  XXBTZUSD: { c: ["79071.40000", "0.00089818"], o: "78509.50000" },
  XETHZUSD: { c: ["2463.84000", "0.87838750"], o: "2442.55000" },
} };

global.fetch = async (url) => {
  const u = String(url);
  if (u.includes("fredgraph.csv")) {
    const id = new URL(u).searchParams.get("id");
    if (!FRED[id]) throw new Error(`no FRED stub for ${id}`);
    return new Response(FRED[id], { status: 200 });
  }
  if (u.includes("open.er-api.com")) return new Response(JSON.stringify(FX), { status: 200 });
  if (u.includes("gold-api.com/price/XAU")) return new Response(JSON.stringify(GOLD), { status: 200 });
  if (u.includes("gold-api.com/price/XAG")) return new Response(JSON.stringify(SILVER), { status: 200 });
  if (u.includes("api.kraken.com")) return new Response(JSON.stringify(KRAKEN), { status: 200 });
  throw new Error(`no stub for ${u}`);
};

const marketPath = path.join(root, "content/market.json");
const statusPath = path.join(root, "content/status.json");
const backup = { m: fs.readFileSync(marketPath, "utf8"), s: fs.readFileSync(statusPath, "utf8") };

// Start from an empty table so the counts below are deterministic.
fs.writeFileSync(marketPath, JSON.stringify({ asOf: null, quotes: [] }));
await import("./fetch-market-data.mjs");

const market = JSON.parse(fs.readFileSync(marketPath, "utf8"));
const by = Object.fromEntries(market.quotes.map((q) => [q.symbol, q]));

let fails = 0;
function check(name, cond, got) {
  if (cond) console.log(`  pass  ${name}`);
  else { console.log(`  FAIL  ${name}  got: ${JSON.stringify(got)}`); fails++; }
}

console.log("\nParser checks");
check("19 quotes parsed", market.quotes.length === 19, market.quotes.length);
check("10Y takes the LAST published value", by["us-10y"]?.value === 4.7, by["us-10y"]?.value);
check("10Y change skips the blank row", by["us-10y"]?.changeAbs === 0.03, by["us-10y"]?.changeAbs);
check("weekly and daily series do not contaminate each other", by["us-30y-mortgage"]?.changeAbs === -0.04, by["us-30y-mortgage"]?.changeAbs);
check("real yield parsed", by["us-10y-real"]?.value === 2.15, by["us-10y-real"]?.value);
check("breakeven parsed", by["breakeven-10y"]?.value === 2.55, by["breakeven-10y"]?.value);
check("weekly mortgage rate found in its own column", by["us-30y-mortgage"]?.value === 6.67, by["us-30y-mortgage"]?.value);
check("monthly CPI found despite blank daily rows", by["us-cpi"]?.value === 321.4, by["us-cpi"]?.value);
check("WTI parsed from the macro call", by["wti"]?.value === 64.55, by["wti"]?.value);
check("broad dollar index parsed", by["dxy-broad"]?.value === 121.8, by["dxy-broad"]?.value);
check("AED present and pegged", by["usd-aed"]?.value === 3.6725, by["usd-aed"]?.value);
check("gold rounded to 2dp", by["xau"]?.value === 4636.2, by["xau"]?.value);
check("BTC parsed from the RESPONSE key XXBTZUSD", by["btc-usd"]?.value === 79071.4, by["btc-usd"]?.value);
check("BTC change from today's open", by["btc-usd"]?.changePct === 0.72, by["btc-usd"]?.changePct);
check("ETH parsed from XETHZUSD", by["eth-usd"]?.value === 2463.84, by["eth-usd"]?.value);
check("no proprietary index levels published",
  !market.quotes.some((q) => /S&P|FTSE|DAX|Dow Jones|Case.?Shiller|VIX/i.test(q.label)),
  market.quotes.map((q) => q.label));
check("every row names a source", market.quotes.every((q) => q.source && q.sourceUrl), null);
check("every row has an as-of", market.quotes.every((q) => q.asOf), null);
check("nothing stale on a clean run", market.quotes.every((q) => !q.stale), null);

const status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
check("run logged ok", status.runs[0]?.status === "ok", status.runs[0]);

/* A total outage must keep the last good values rather than blank the site. */
console.log("\nFailure handling");
global.fetch = async () => { throw new Error("simulated outage"); };
await import(`${new URL("./fetch-market-data.mjs", import.meta.url).href}?v=2`);
const after = JSON.parse(fs.readFileSync(marketPath, "utf8"));
check("previous values survive a total outage", after.quotes.length === 19, after.quotes.length);
check("survivors flagged stale", after.quotes.every((q) => q.stale), null);
check("outage logged as failed", JSON.parse(fs.readFileSync(statusPath, "utf8")).runs[0]?.status === "failed", null);

/* One source down must not take the rest with it. */
console.log("\nPartial failure");
global.fetch = async (url) => {
  const u = String(url);
  if (u.includes("gold-api.com")) throw new Error("provider down");
  if (u.includes("fredgraph.csv")) {
    const id = new URL(u).searchParams.get("id");
    return new Response(FRED[id] ?? "", { status: 200 });
  }
  if (u.includes("open.er-api.com")) return new Response(JSON.stringify(FX), { status: 200 });
  if (u.includes("api.kraken.com")) return new Response(JSON.stringify(KRAKEN), { status: 200 });
  throw new Error("no stub");
};
await import(`${new URL("./fetch-market-data.mjs", import.meta.url).href}?v=3`);
const partial = JSON.parse(fs.readFileSync(marketPath, "utf8"));
const pBy = Object.fromEntries(partial.quotes.map((q) => [q.symbol, q]));
check("rates still refreshed when metals fail", pBy["us-10y"] && !pBy["us-10y"].stale, pBy["us-10y"]?.stale);
check("gold kept as last good, flagged stale", pBy["xau"]?.stale === true, pBy["xau"]?.stale);
check("logged as partial", JSON.parse(fs.readFileSync(statusPath, "utf8")).runs[0]?.status === "partial", null);

fs.writeFileSync(marketPath, backup.m);
fs.writeFileSync(statusPath, backup.s);

/* ---------- the cadence the site advertises ----------
   "Every weekday at 7am GST" appears in seven places including the meta
   description. It is a promise, and the site checks it against the issues
   that actually exist rather than repeating it regardless. Two missed
   weekdays is the threshold: one is a late morning, two is a pattern. */
const { briefStatus, weekdaysBetween } = await import(`${new URL("../src/lib.mjs", import.meta.url).href}`);
const { briefIndex } = await import(`${new URL("../src/templates/pages.mjs", import.meta.url).href}`);

const siteStub = { name: "T", origin: "https://e.com", disclaimer: "Not advice.",
  mailerlite: { account: "1", briefFormId: "1", leadFormId: "1" } };
const issue = (date) => ({ date, slug: date, title: "T", subtitle: "S", emoji: "", readMinutes: 3, items: [] });

check("the Gulf weekend does not count against the cadence",
  weekdaysBetween("2026-08-27", "2026-08-30") === 1, weekdaysBetween("2026-08-27", "2026-08-30"));
check("one missed weekday is not called a broken promise",
  briefStatus([issue("2026-08-26")], "2026-08-27").behind === false, null);
check("two missed weekdays is",
  briefStatus([issue("2026-08-25")], "2026-08-27").behind === true, null);
check("no issues at all counts as behind",
  briefStatus([], "2026-08-27").behind === true, null);

// The page must carry the admission when it is behind, and must not when it
// is not. A promise that is only checked in one direction is not checked.
const lateBody = briefIndex({ site: siteStub, briefs: [issue("2026-01-02")] }).body;
check("a stale brief index admits the cadence is not being met",
  /not currently publishing to schedule/i.test(lateBody), "no notice on a months-old archive");
check("the admission names the last issue rather than being vague",
  /last issue was published/i.test(lateBody), "notice does not name the last issue");

const freshBody = briefIndex({ site: siteStub, briefs: [issue(new Date().toISOString().slice(0, 10))] }).body;
check("a current brief index carries no such notice",
  !/not currently publishing to schedule/i.test(freshBody), "notice shown while publishing on time");

/* ---------- layout tripwires ----------
   These assert on the stylesheet source rather than on a rendered page,
   which is weaker than measuring, and they are here anyway because this
   exact class of bug has now shipped twice. Both were invisible on a
   desktop and broke every page on a phone: a wordmark breakpoint set from
   a single measured width, and a grid column that silently refused to
   shrink. Layout is verified by measuring across a range of widths in a
   real browser; these lines exist so that a later edit cannot quietly undo
   the fix between one measurement and the next. */
const css = fs.readFileSync(path.join(root, "src/styles.css"), "utf8");

check(
  "the mobile article column can shrink below its content",
  /@media \(max-width: 980px\) \{ \.doc \{ grid-template-columns: minmax\(0, 1fr\)/.test(css),
  "a bare 1fr is minmax(auto, 1fr); wide tables then widen the page instead of scrolling"
);
check(
  "a table wrapper cannot be wider than what contains it",
  /\.table-scroll \{[^}]*max-width: 100%/.test(css),
  "without this the overflow-x never engages"
);
check(
  "the wordmark breakpoint covers every phone width it fails at",
  /@media \(max-width: 374px\) \{\s*\.mark \{/.test(css),
  "measured: it overflows up to 374px, so a lower cap leaves 360 and 365 broken"
);

console.log(fails ? `\n${fails} check(s) failed.\n` : "\nAll checks passed.\n");
process.exit(fails ? 1 : 0);
