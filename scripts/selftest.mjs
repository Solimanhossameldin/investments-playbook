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
// Two different failures, and naming the wrong one is worse than saying
// nothing. The brief went out by email every weekday for weeks while this
// archive held one issue, and 52 pages said publication was paused. That was
// false. site.brief.byEmail separates "is it published" from "is the archive
// current", and both branches are checked here, in both directions.
const stale = [issue("2026-01-02")];
const stopped = briefIndex({ site: siteStub, briefs: stale }).body;
const lagging = briefIndex({ site: { ...siteStub, brief: { byEmail: true } }, briefs: stale }).body;

check("a stale archive with no email going out admits publication has stopped",
  /not currently publishing to schedule/i.test(stopped), "no notice on a months-old archive");
check("that admission names the date rather than being vague",
  /02\.01\.26/.test(stopped), "notice does not name the last issue");

check("a stale archive while the email still goes out blames the archive",
  /archive here is behind/i.test(lagging), "no archive notice");
check("and does not claim publication has stopped",
  !/not currently publishing to schedule/i.test(lagging),
  "the site told readers the brief had stopped while it was still arriving in their inbox");
check("the lagging notice names the date too",
  /02\.01\.26/.test(lagging), "notice does not name the last archived issue");
check("and tells a reader how to get the issues on time",
  /Subscrib/i.test(lagging), "the notice states a problem and no remedy");

const today = new Date().toISOString().slice(0, 10);
for (const [label, st] of [["by email", { byEmail: true }], ["not by email", undefined]]) {
  const fresh = briefIndex({ site: { ...siteStub, brief: st }, briefs: [issue(today)] }).body;
  check(`a current archive carries no notice, ${label}`,
    !/not currently publishing|archive here is behind/i.test(fresh), "notice shown while up to date");
}

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
// The auto-minimum grid bug, third appearance. .doc had it, .calc had it
// latently until a calculator arrived with longer strings, and a bare 1fr is
// minmax(auto, 1fr) every time. Assert the shape rather than the symptom.
check(
  "no grid column can refuse to shrink below its content",
  !/\.lead, \.calc, \.grid--3, \.ftr__cols \{ grid-template-columns: 1fr; \}/.test(css),
  "a bare 1fr is minmax(auto, 1fr) and will push the page sideways"
);
check(
  "the calculator grid uses an explicit zero minimum",
  /\.calc \{ display: grid; grid-template-columns: minmax\(0, 1fr\) minmax\(0, 1fr\)/.test(css),
  "the result panel is the widest thing on the page and needs to be shrinkable"
);
// A result row is a label and a value, and the hero value is 32px mono. On a
// 300px phone that does not fit on one line and must be allowed a second.
check(
  "a result row can wrap",
  /\.res \{ display: flex; flex-wrap: wrap;/.test(css),
  "without this a long verdict pushes the whole page sideways"
);

// Adding a signup form to 122 pages put conversion furniture into every
// printed page. .btn was already hidden in print, so what remained was an
// orphaned text input with no button, on paper, forever.
check(
  "the capture block does not print",
  /@media print \{[\s\S]{0,400}?\.cap[\s\S]{0,80}?display: none/.test(css),
  "a form that cannot be filled in with a pen should not be on the page"
);
check(
  "the live band stops being black when printed",
  /@media print[\s\S]*?\.cx-live \{[^}]*background: #fff/.test(css),
  "an ink-heavy panel printed as-is burns a cartridge"
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

/* ---------- the channel that brought them ----------
   Asserting the source contains the right characters proves nothing about
   what it does. The block is lifted out of app.js and executed against stub
   globals, so these are the shipped lines running rather than a copy that can
   drift away from them. */
const appSrc = fs.readFileSync(path.join(root, "src/app/app.js"), "utf8");
const chanBlock = appSrc.match(/\/\* -+ the channel that brought them[\s\S]*?\n  \}\)\(\);/);
check("the channel block is still in app.js under its own heading", !!chanBlock, null);

function storedChannel(search, already) {
  const store = already === undefined ? {} : { ip_channel: already };
  const localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
  };
  new Function("location", "localStorage", "URLSearchParams", chanBlock[0])(
    { search }, localStorage, URLSearchParams
  );
  return store.ip_channel;
}

check("no campaign tag stores nothing at all",
  storedChannel("") === undefined && storedChannel("?page=2") === undefined,
  JSON.stringify([storedChannel(""), storedChannel("?page=2")]));

check("utm_source is captured",
  storedChannel("?utm_source=linkedin") === "linkedin", storedChannel("?utm_source=linkedin"));

check("ref wins over utm_source, because a referral is the more specific claim",
  storedChannel("?utm_source=linkedin&ref=soliman") === "soliman",
  storedChannel("?utm_source=linkedin&ref=soliman"));

check("medium and campaign are kept alongside the source",
  storedChannel("?utm_source=linkedin&utm_medium=post&utm_campaign=launch") === "linkedin / post / launch",
  storedChannel("?utm_source=linkedin&utm_medium=post&utm_campaign=launch"));

// First touch is the whole point. Without it the channel is whatever the
// reader happened to have in the address bar on the day they subscribed,
// which for anyone who read more than one page is nothing.
check("first touch wins, a later visit does not overwrite it",
  storedChannel("?utm_source=twitter", "linkedin") === "linkedin",
  storedChannel("?utm_source=twitter", "linkedin"));

// A crafted link must not be able to write arbitrary text into a lead record.
check("a hostile value is reduced to a safe one",
  storedChannel('?utm_source=' + encodeURIComponent('<script>alert(1)</script>')) === "script-alert-1-script",
  storedChannel('?utm_source=' + encodeURIComponent('<script>alert(1)</script>')));

check("an overlong value is cut to forty characters",
  storedChannel("?utm_source=" + "a".repeat(200)) === "a".repeat(40),
  String(storedChannel("?utm_source=" + "a".repeat(200)) || "").length);

check("a value that cleans away to nothing stores nothing",
  storedChannel("?utm_source=" + encodeURIComponent("!!!")) === undefined,
  storedChannel("?utm_source=" + encodeURIComponent("!!!")));

// The capture is worthless if the forms do not read it back.
check("both forms send the stored channel with the lead source",
  (appSrc.match(/channel\(\) \? " \/ " \+ channel\(\) : ""/g) || []).length === 2,
  (appSrc.match(/channel\(\) \? " \/ " \+ channel\(\) : ""/g) || []).length);

/* ---------- the arithmetic block keeps its alignment ----------
   `overflow-x: auto` sat on .formula for months and could never fire, because
   the same rule set `white-space: pre-wrap` and wrapped content never exceeds
   its box. Every aligned column, rule line and indent in 67 frameworks was
   being rewrapped at 320px into something that no longer lined up. Measured
   at 320px before the fix: scrollWidth equalled clientWidth on every page,
   and the block was nearly twice as tall as it needed to be. */
check("the arithmetic block does not wrap, so its alignment survives",
  /\.formula \{[^}]*white-space: pre;/.test(css),
  (css.match(/\.formula \{[^}]*white-space: [a-z-]+/) || [])[0]);

check("and it scrolls instead, which is what makes not wrapping safe",
  /\.formula \{[^}]*overflow-x: auto/.test(css), null);

// A region that scrolls sideways is unreachable by keyboard unless it can be
// focused, which would make the arithmetic readable only with a pointer.
const pagesSrc = fs.readFileSync(path.join(root, "src/templates/pages.mjs"), "utf8");
const docSrc = fs.readFileSync(path.join(root, "src/templates/document.mjs"), "utf8");
check("both emitters make the scrolling block focusable and labelled",
  /class="formula" tabindex="0" role="region" aria-label=/.test(pagesSrc) &&
  /class="formula" tabindex="0" role="region" aria-label=/.test(docSrc),
  null);

/* ---------- colours that have to be readable ----------
   Measured on the rendered pages, not inferred from the stylesheet, and three
   things failed. The worst by a distance: `.article a` sets link colour and
   outranks a single class, so `.btn--solid` lost its own white and the primary
   call to action on 137 pages rendered its dark red on its red background at a
   contrast ratio of 1.42. Near enough invisible, and it had been shipping.

   The other two were the brand red on dark ground: the ticker's Sources link
   at 3.45 and the footer's required attribution link at 2.85.

   These guard the tokens and the specificity, which is where both bugs lived. */
{
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const ratio = (a, b) => { const x = lum(hex(a)), y = lum(hex(b));
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  // Scan the palette once with a literal regex. Building one from a string
  // needed four levels of backslash escaping and silently matched nothing,
  // which read as the token being missing rather than the regex being wrong.
  const TOKENS = {};
  for (const m of css.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) TOKENS[m[1]] = m[2].toLowerCase();
  const token = (name) => TOKENS[name];

  const PAPER = token("paper"), INK = token("ink"), ONDARK = token("gold-on-dark"), GOLD = token("gold");
  check("the palette still defines a red for dark surfaces", !!ONDARK, ONDARK);
  check("that red is readable on the ticker and the footer",
    ONDARK && ratio(ONDARK, INK) >= 4.5 && ratio(ONDARK, "#000000") >= 4.5,
    ONDARK && [ratio(ONDARK, INK).toFixed(2), ratio(ONDARK, "#000000").toFixed(2)]);
  check("the brand red is still readable on paper, where it is used for links",
    ratio(GOLD, PAPER) >= 4.5, ratio(GOLD, PAPER).toFixed(2));
  check("body text on paper is comfortably readable",
    ratio(token("ink"), PAPER) >= 7, ratio(token("ink"), PAPER).toFixed(2));
  check("muted text on paper still clears the threshold",
    ratio(token("muted"), PAPER) >= 4.5, ratio(token("muted"), PAPER).toFixed(2));

  // The specificity half. `.btn--solid` alone loses to `.article a`.
  check("the solid button's colour outranks the article link rule",
    /a\.btn--solid[^{]*\{[^}]*color:\s*#ffffff/.test(css) ||
    /\.btn--solid,\s*a\.btn--solid[^{]*\{[^}]*color:\s*#ffffff/.test(css),
    (css.match(/[^\n]*a\.btn--solid[^\n]*/) || [])[0]);

  // Everything else that sits on an ink band. Each of these was measured
  // failing on a rendered page: 2.43, 3.36, 3.45 and 4.04 respectively.
  check("text on the ink bands uses colours chosen for a dark surface",
    /\.band--ink \.q__split \{ color: var\(--gold-on-dark\)/.test(css) &&
    /\.band--ink \.form-note \{ color: var\(--muted-dark\)/.test(css) &&
    /\.band--ink \.stat__v, \.band--ink \.lead__stat b \{ color: var\(--gold-on-dark\)/.test(css) &&
    /\.cx-live \.cx-cap a \{ color: var\(--gold-on-dark\)/.test(css),
    null);

  // The market data table reuses the ticker's classes on a white background,
  // where the ticker's colours come to 2.74, 3.87 and 3.36.
  check("the data table's up, down and flat are the versions that work on white",
    /\.tbl \.up \{ color: var\(--pos\)/.test(css) &&
    /\.tbl \.dn \{ color: var\(--neg\)/.test(css) &&
    /\.tbl \.flat \{ color: var\(--muted\)/.test(css),
    null);
  check("and those three are readable on white",
    ratio(token("pos"), "#ffffff") >= 4.5 && ratio(token("neg"), "#ffffff") >= 4.5 &&
    ratio(token("muted"), "#ffffff") >= 4.5,
    [ratio(token("pos"), "#ffffff").toFixed(2), ratio(token("neg"), "#ffffff").toFixed(2), ratio(token("muted"), "#ffffff").toFixed(2)]);
  check("muted text on ink uses the lighter grey",
    ratio(token("muted-dark"), token("ink")) >= 4.5,
    ratio(token("muted-dark"), token("ink")).toFixed(2));

  // The ticker and footer links must not fall back to the paper reds.
  check("links on dark ground use the dark-surface red",
    /\.ticker__meta a \{ color: var\(--gold-on-dark\)/.test(css) &&
    /\.ftr__legal a \{ color: var\(--gold-on-dark\)/.test(css) &&
    /\.ftr h2, \.ftr h3, \.ftr h4 \{[^}]*color: var\(--gold-on-dark\)/.test(css),
    null);
}

/* ---------- what the signup form may claim ----------
   The reader is told they are on the list one second after handing over an
   address. That sentence used to be unfalsifiable: nothing checked the status,
   and the no-cors fallback resolves opaquely by specification, so the failure
   branch could not be reached however badly the post had failed. These lift
   the shipped lines and run them against stub responses, so they test the code
   that ships rather than a copy of it that can drift. */
{
  const block = appSrc.match(
    /\/\* -+ the submit, and what it may honestly claim[\s\S]*?\n  function confirmLine\(res\) \{[\s\S]*?\n  \}/
  );
  check("the submit block is still in app.js under its own heading", !!block, null);

  const load = (fetchImpl) =>
    new Function(
      "fetch", "FormData", "ML",
      block[0] + "\nreturn { mlPost: mlPost, confirmLine: confirmLine };"
    )(fetchImpl, FormData, { account: "1", whatsapp: "https://wa.me/971507795060" });

  const settle = async (fetchImpl) => {
    try { return { ok: true, value: await load(fetchImpl).mlPost("f", { email: "a@b.c" }) }; }
    catch (e) { return { ok: false, error: String(e.message || e) }; }
  };

  const readable = (status) => async () => ({ ok: status >= 200 && status < 300, status });
  const blocked = () => { throw new TypeError("Failed to fetch"); };

  const good = await settle(readable(200));
  check("a status we were allowed to read, and that was fine, is a verified signup",
    good.ok && good.value.verified === true, JSON.stringify(good));

  const bad = await settle(readable(500));
  check("a status we could read and that was bad rejects, so the failure branch is reachable",
    bad.ok === false && /500/.test(bad.error), JSON.stringify(bad));

  let calls = 0;
  const opaque = await settle((url, opts) => {
    calls++;
    if (!opts || opts.mode !== "no-cors") return Promise.reject(new TypeError("CORS"));
    return Promise.resolve({ type: "opaque", ok: false, status: 0 });
  });
  check("a blocked post still retries opaquely, so the data arrives",
    calls === 2, `fetch called ${calls} time(s)`);
  check("an opaque response is never reported as a verified signup",
    opaque.ok && opaque.value.verified === false, JSON.stringify(opaque));

  const dead = await settle(() => Promise.reject(new TypeError("offline")));
  check("both attempts failing rejects rather than claiming success",
    dead.ok === false, JSON.stringify(dead));

  const { confirmLine } = load(readable(200));
  check("only a verified signup is told they are on the list",
    confirmLine({ verified: true }).includes("You are on the list") &&
    !confirmLine({ verified: false }).includes("on the list"),
    confirmLine({ verified: false }));
  check("an unconfirmable signup is given a human to reach",
    /wa\.me\/971507795060/.test(confirmLine({ verified: false })),
    confirmLine({ verified: false }));
  check("the number is read from configuration, never typed into the runtime",
    !/971507795060/.test(appSrc) && /__ML_WHATSAPP__/.test(appSrc), null);
}

/* ---------- the form people actually have to fill in ----------
   Two bugs shipped here at once and both were only visible in a screenshot:
   an input with no type attribute, which no selector in the stylesheet
   matches, and a flex label whose links each became their own column. Neither
   is a thing anyone would think to assert, which is exactly why they lasted. */
{
  const { leadForm } = await import(`${new URL("../src/templates/layout.mjs", import.meta.url).href}`);
  const form = leadForm({ name: "T", origin: "https://e.com" });

  /* Every input states a type, and every type it states is one the stylesheet
     actually styles. This is the check the country field would have failed. */
  const inputs = form.match(/<input\b[^>]*>/g) || [];
  check("the form has inputs to check at all", inputs.length >= 4, inputs.length);
  const untyped = inputs.filter((i) => !/\stype=/.test(i));
  check("every input in the lead form states its type",
    untyped.length === 0, untyped.join(" | "));

  const styled = new Set(
    (css.match(/input\[type="([a-z]+)"\]/g) || []).map((m) => m.match(/"([a-z]+)"/)[1])
  );
  const unstyled = [...new Set(inputs.map((i) => (i.match(/type="([a-z]+)"/) || [])[1]))]
    .filter((t) => t && t !== "checkbox" && !styled.has(t));
  check("every input type the form uses is one the stylesheet styles",
    unstyled.length === 0, unstyled.join(", "));

  /* A flex row with loose text and links in it lays the links out as columns.
     The text has to be one element, so the box and the text are the only two
     children the flex container ever sees. */
  const checks = form.match(/<label class="check">[\s\S]*?<\/label>/g) || [];
  check("there is at least one consent box", checks.length >= 1, checks.length);
  check("no link sits loose inside a flex label, where it becomes its own column",
    checks.every((c) => !/<a\b/.test(c) || /<span>[\s\S]*<a\b/.test(c)),
    checks.find((c) => /<a\b/.test(c) && !/<span>[\s\S]*<a\b/.test(c)));
  check("every consent box wraps its text in a single span",
    checks.every((c) => (c.match(/<span>/g) || []).length === 1), null);

  /* Friction is a number, so it gets a number. Eight required interactions
     stood between a reader and a free PDF; this fails if that creeps back. */
  const required = (form.match(/\brequired\b/g) || []).length;
  check("the form asks for at most four required things",
    required <= 4, `${required} required`);
  check("the email opt-in is still an explicit, unticked box",
    /<input type="checkbox" required>/.test(form) && !/checked/.test(form), null);

  /* The optional fields must still be sent, or making them optional would
     quietly drop data the CRM depends on. */
  for (const n of ["name", "email", "dial", "phone", "country", "intent"])
    check(`the form still carries a ${n} field`, form.includes(`name="${n}"`), null);
}

console.log(fails ? `\n${fails} check(s) failed.\n` : "\nAll checks passed.\n");
process.exit(fails ? 1 : 0);
