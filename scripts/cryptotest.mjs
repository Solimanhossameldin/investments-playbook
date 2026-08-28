#!/usr/bin/env node
/* The live crypto band.

   Two checks here matter more than the rest. The first is that the square
   footage line stays absent until there is enough registry data to justify
   it: that line is the most quotable thing on the page and therefore the most
   tempting to fake, and the whole reason this site is worth reading is that
   it does not. The second is that the caption names both sources and a time,
   because a figure without those is not publishable here and the caption is
   generated rather than written, so nothing but a test is watching it. */

import assert from "node:assert/strict";
import { cryptoBand, cryptoFigures, cryptoCaption, marketPerSqft, MIN_SALES_FOR_PSF } from "../src/templates/crypto.mjs";

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`  pass  ${name}`); };

const market = {
  asOf: "2026-08-27T08:31:14.812Z",
  quotes: [
    { symbol: "btc-usd", label: "Bitcoin", category: "crypto", value: 80000, unit: "USD", source: "Kraken", asOf: "2026-08-27T08:31:14.555Z", stale: false },
    { symbol: "eth-usd", label: "Ethereum", category: "crypto", value: 2500, unit: "USD", source: "Kraken", asOf: "2026-08-27T08:31:14.555Z", stale: false },
    { symbol: "usd-aed", label: "USD / AED", category: "fx", value: 3.6725, source: "ExchangeRate-API", asOf: "2026-08-27T08:00:00.000Z", stale: false },
  ],
};

const noData = { totalSales: 0, communities: [] };
const withData = {
  totalSales: 412,
  from: "2026-01-02",
  to: "2026-08-20",
  communities: [
    { name: "A", medianPerSqft: 1200 },
    { name: "B", medianPerSqft: 1600 },
    { name: "C", medianPerSqft: 2000 },
  ],
};

/* ---------------- the arithmetic ---------------- */

t("dirhams are the dollar price times the live rate, not a typed number", () => {
  const f = cryptoFigures(market, noData);
  assert.equal(f.btcAed, 80000 * 3.6725);
  assert.equal(f.ethAed, 2500 * 3.6725);
  assert.equal(f.rate, 3.6725);
});

t("the conversion cost is the stated spread on the dirham figure", () => {
  const f = cryptoFigures(market, noData);
  assert.equal(f.spreadPct, 2.5);
  assert.equal(+f.spreadCost.toFixed(6), +(80000 * 3.6725 * 0.025).toFixed(6));
});

t("no bitcoin quote means no band at all, rather than a band with a hole in it", () => {
  const m = { quotes: market.quotes.filter((q) => q.symbol !== "btc-usd") };
  assert.equal(cryptoFigures(m, noData), null);
  assert.equal(cryptoBand(m, noData), "");
});

t("no dirham rate means no band, because the whole point is the conversion", () => {
  const m = { quotes: market.quotes.filter((q) => q.symbol !== "usd-aed") };
  assert.equal(cryptoBand(m, noData), "");
});

t("a missing ether quote drops its row and keeps the rest", () => {
  const m = { quotes: market.quotes.filter((q) => q.symbol !== "eth-usd") };
  const html = cryptoBand(m, noData);
  assert.ok(html.includes("Bitcoin"), "bitcoin should survive");
  assert.ok(!html.includes("Ether<"), "ether row should be gone");
});

/* ---------------- the line that must not be invented ---------------- */

t("no square footage line while there is no registry data", () => {
  assert.equal(marketPerSqft(noData), null);
  const html = cryptoBand(market, noData);
  assert.ok(!/square feet/i.test(html), "a square footage claim appeared with no sales behind it");
});

t("no square footage line below the sales threshold", () => {
  const thin = { ...withData, totalSales: MIN_SALES_FOR_PSF - 1 };
  assert.equal(marketPerSqft(thin), null);
  assert.ok(!/square feet/i.test(cryptoBand(market, thin)));
});

t("the line appears once there is enough data, and says what it rests on", () => {
  const psf = marketPerSqft(withData);
  assert.equal(psf.value, 1600, "the median of the community medians");
  const html = cryptoBand(market, withData);
  assert.ok(/square feet/i.test(html), "the line should render");
  // 80000 * 3.6725 / 1600 = 183.6 -> 184
  assert.ok(html.includes("184"), "the arithmetic should be the one a reader can check");
  assert.ok(html.includes("3 communities"), "it should say how many communities it rests on");
  assert.ok(html.includes("412"), "it should say how many sales it rests on");
});

t("the median is the median, not the mean, so one expensive community cannot drag it", () => {
  const skewed = { ...withData, communities: [
    { medianPerSqft: 1000 }, { medianPerSqft: 1100 }, { medianPerSqft: 1200 }, { medianPerSqft: 40000 },
  ] };
  const psf = marketPerSqft(skewed);
  assert.equal(psf.value, 1150, "a mean would have been over 10,000");
});

t("a community with no median per square foot is skipped rather than counted as zero", () => {
  const holes = { ...withData, communities: [
    { medianPerSqft: 1200 }, { medianPerSqft: null }, { medianPerSqft: 0 }, { medianPerSqft: 1600 },
  ] };
  assert.equal(marketPerSqft(holes).communities, 2);
});

/* ---------------- the caption ---------------- */

t("the caption names both sources", () => {
  const cap = cryptoCaption(cryptoFigures(market, noData));
  assert.match(cap, /Kraken/);
  assert.match(cap, /ExchangeRate-API/);
});

t("the caption carries a reading time in Gulf time", () => {
  const cap = cryptoCaption(cryptoFigures(market, noData));
  assert.match(cap, /\d{2}:\d{2} GST/);
  assert.match(cap, /August 2026/);
});

t("the caption says the dirham figure is a conversion, not a quote", () => {
  const cap = cryptoCaption(cryptoFigures(market, noData));
  assert.match(cap, /not themselves quoted prices/);
});

t("the caption carries the rate it converted at, so the reader can redo it", () => {
  assert.ok(cryptoCaption(cryptoFigures(market, noData)).includes("3.6725"));
});

/* ---------------- staleness is disclosed, not hidden ---------------- */

t("a stale quote marks the whole band and says so", () => {
  const m = { quotes: market.quotes.map((q) => (q.symbol === "btc-usd" ? { ...q, stale: true } : q)) };
  const html = cryptoBand(m, noData);
  assert.ok(html.includes("cx-live--stale"), "the band should carry the stale class");
  assert.match(html, /last good figure/, "the band should say a row is not current");
});

t("nothing is marked live, because none of these rows refresh in the browser", () => {
  const html = cryptoBand(market, noData);
  assert.ok(!/data-live/.test(html), "a derived figure must not wear the live indicator");
});

console.log(`\ncrypto: ${n} checks passed.`);
