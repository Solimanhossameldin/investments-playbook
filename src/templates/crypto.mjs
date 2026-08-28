/* The live figures on the crypto pages.

   Everything here is derived at build time from quotes the pipeline already
   fetches. Nothing new is called and nothing is typed: Bitcoin and Ether come
   from Kraken, the dirham rate from ExchangeRate-API, and the caption names
   both of them and the time they were read, because the rule on this site is
   that every figure carries its own source and timestamp.

   Derived rather than fetched, which matters for one specific reason: the
   live indicator on this site is only ever shown on rows the browser
   actually refreshes. A dirham figure computed from two quotes is not one of
   those, so it is labelled as a conversion of the numbers above it rather
   than dressed up as a live price.

   The square-footage line is the one that will make this page worth linking
   to, and it is the one that cannot be written yet. It needs a Dubai median
   price per square foot, which arrives only when a DLD export lands in
   content/dld/. Until then the block simply does not render. It is not
   stubbed, not estimated, and not filled with a figure from a blog: a
   community page on this site needs thirty sales before it will say
   anything, and this holds itself to the same rule. */

import { esc, fmt, gst, longDate } from "../lib.mjs";

const bySymbol = (market) =>
  new Map(((market && market.quotes) || []).map((q) => [q.symbol, q]));

/* The site's own threshold, reused. A market-wide median drawn from a handful
   of sales is not a median, it is an anecdote. */
export const MIN_SALES_FOR_PSF = 30;

/* One number, from the communities aggregate, or nothing at all. The median of
   the community medians rather than a mean: a single very expensive community
   should not drag the figure a reader is about to divide by. */
export function marketPerSqft(communities) {
  const list = ((communities && communities.communities) || [])
    .map((c) => c.medianPerSqft)
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);
  const sales = (communities && communities.totalSales) || 0;
  if (!list.length || sales < MIN_SALES_FOR_PSF) return null;
  const mid = Math.floor(list.length / 2);
  const value = list.length % 2 ? list[mid] : Math.round((list[mid - 1] + list[mid]) / 2);
  return { value, communities: list.length, sales, from: communities.from || "", to: communities.to || "" };
}

/* The conversion arithmetic the settling framework describes, run on today's
   price. The spread is not a fetched number and is not presented as one: it is
   a worked example at a stated rate, which is why the label says "at 2.5%"
   rather than implying anybody quoted it. */
const SPREAD = 0.025;

export function cryptoFigures(market, communities) {
  const q = bySymbol(market);
  const btc = q.get("btc-usd");
  const eth = q.get("eth-usd");
  const aed = q.get("usd-aed");
  if (!btc || !aed) return null;

  const rate = aed.value;
  const btcAed = btc.value * rate;
  const psf = marketPerSqft(communities);

  return {
    btc, eth, aed, rate,
    btcAed,
    ethAed: eth ? eth.value * rate : null,
    spreadCost: btcAed * SPREAD,
    spreadPct: SPREAD * 100,
    // Only when the registry data is actually here.
    sqft: psf ? { perSqft: psf.value, feet: btcAed / psf.value, ...psf } : null,
    stale: !!(btc.stale || aed.stale),
    asOf: btc.asOf || aed.asOf || "",
  };
}

const aedFmt = (v) => fmt(Math.round(v), 0);

/* The caption. Generated, never written: it names both sources, the reading
   time in Gulf time, and says plainly that the dirham figure is a conversion
   rather than a quote. */
export function cryptoCaption(f) {
  const when = f.asOf ? `${gst(f.asOf)} GST on ${longDate(f.asOf.slice(0, 10))}` : "an unknown time";
  return `Bitcoin and Ether from Kraken, read at ${when}. Dirham figures are converted at the ExchangeRate-API rate of ${fmt(f.rate, 4)} and are not themselves quoted prices.`;
}

function row(label, usd, aed, note = "") {
  return `<tr>
    <th scope="row">${esc(label)}</th>
    <td class="num">${usd}</td>
    <td class="num">${aed}</td>
    <td class="cx-note">${esc(note)}</td>
  </tr>`;
}

export function cryptoBand(market, communities, { compact = false } = {}) {
  const f = cryptoFigures(market, communities);
  if (!f) return "";

  const rows = [
    row("Bitcoin", `$${fmt(f.btc.value, 2)}`, `${aedFmt(f.btcAed)}`, "one coin"),
    f.eth ? row("Ether", `$${fmt(f.eth.value, 2)}`, `${aedFmt(f.ethAed)}`, "one coin") : "",
    row(
      `Conversion at ${fmt(f.spreadPct, 1)}%`,
      "",
      `${aedFmt(f.spreadCost)}`,
      "what a spread that size costs on one bitcoin"
    ),
  ].join("");

  const sqftLine = f.sqft
    ? `<p class="cx-lede">One bitcoin converts to about <b>${fmt(Math.round(f.sqft.feet), 0)} square feet</b> of Dubai property, at a median of ${aedFmt(f.sqft.perSqft)} AED per square foot across ${f.sqft.communities} communities and ${fmt(f.sqft.sales, 0)} recorded sales.</p>`
    : "";

  return `<section class="cx-live${f.stale ? " cx-live--stale" : ""}" aria-label="Crypto priced in dirhams">
  <h2>What a coin is worth in the currency you would buy in</h2>
  ${sqftLine}
  <div class="table-scroll"><table class="tbl">
    <thead><tr><th>Asset</th><th class="num">USD</th><th class="num">AED</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>
  <p class="cx-cap">${esc(cryptoCaption(f))}${
    f.stale ? " One or more of these rows is a last good figure rather than a current one." : ""
  }${
    compact ? "" : ` Every row is drawn from the same table published on the <a href="/data/">market data page</a>.`
  }</p>
</section>`;
}
