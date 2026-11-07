/* A developer's current launch list, and the one fee question it settles.

   This is a dated market page, not a framework. The framework it applies is
   already on the site five times over: Article 3 of Executive Council
   Resolution No. (30) of 2013 makes the 4% registration fee "shared equally
   by the seller and purchaser" in the absence of an agreement to the
   contrary, and the Dubai convention that the buyer carries the whole 4% is a
   term of the sale contract rather than a rule of law.

   On a resale that argument is between two private parties. On an initial
   sale from a developer the seller is the developer, so the half the Article
   gives away by default is the developer's half, and a launch price list is
   therefore a list of amounts somebody is being asked to pay on the
   developer's behalf. That is worth one page, dated, with the arithmetic done
   per project and the figure named so a buyer can ask about it by name.

   Nothing here is a price Nakheel published. Every figure is the launch price
   the cited listing states on the day it was read, and a launch price is the
   lowest unit in a release, so it is a floor on the project rather than the
   price of a unit anybody would choose. The split is computed from the
   acquisition module's own transfer rate rather than typed, so this page and
   the fee pages cannot disagree about the only percentage either prints. */

import { FEES, money } from "./acquisition.mjs";

/* The Article's default, as a share of the price, each side. Derived from the
   registration rate the rest of the site already uses: change the rate in one
   place and every figure on this page moves with it. */
export const ownShare = FEES.transferRate / 2;

const isNum = (n) => typeof n === "number" && Number.isFinite(n) && n > 0;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

function recordProblems(l, i) {
  const at = `launch ${i + 1}${l && l.name ? ` (${l.name})` : ""}`;
  const p = [];
  if (!l || typeof l !== "object") return [`${at}: not an object`];
  if (!l.name || typeof l.name !== "string") p.push(`${at}: needs a name`);
  if (!isNum(l.priceAed)) p.push(`${at}: needs a positive priceAed`);
  if (l.delivery !== undefined && typeof l.delivery !== "string") p.push(`${at}: delivery must be a string`);
  if (l.location !== undefined && typeof l.location !== "string") p.push(`${at}: location must be a string`);
  return p;
}

/* Throws on anything unpublishable. A dataset with no source or no retrieval
   date is refused outright: the whole claim of the page is that every figure
   carries the day it was read, and an undated table of a developer's prices
   is the thing every competing page already publishes. */
export function validate(data) {
  if (!data || typeof data !== "object") throw new Error("launches: expected an object");
  const problems = [];
  if (!data.developer) problems.push("needs a developer");
  if (!data.source) problems.push("needs a source");
  if (!/^https:\/\//.test(data.sourceUrl || "")) problems.push("needs an https sourceUrl");
  if (!ISO.test(data.retrievedAt || "")) problems.push("needs retrievedAt as YYYY-MM-DD");
  if (!Array.isArray(data.launches) || !data.launches.length) problems.push("needs at least one launch");
  else problems.push(...data.launches.flatMap(recordProblems));
  if (problems.length) throw new Error("launches refused:\n  " + problems.join("\n  "));

  const rows = [...data.launches]
    .sort((a, b) => a.priceAed - b.priceAed)
    .map((l) => ({
      ...l,
      soldOut: !!l.soldOut,
      share: Math.round(l.priceAed * ownShare),
      wholeFee: Math.round(l.priceAed * FEES.transferRate),
    }));

  const live = rows.filter((r) => !r.soldOut);
  const prices = live.map((r) => r.priceAed);

  return {
    developer: data.developer,
    source: data.source,
    sourceUrl: data.sourceUrl,
    retrievedAt: data.retrievedAt,
    note: data.note || "",
    rows,
    count: rows.length,
    liveCount: live.length,
    soldOutCount: rows.length - live.length,
    low: prices[0],
    high: prices[prices.length - 1],
    shareLow: Math.round(prices[0] * ownShare),
    shareHigh: Math.round(prices[prices.length - 1] * ownShare),
    locations: [...new Set(rows.map((r) => r.location).filter(Boolean))].sort(),
  };
}

export { money, FEES };
