/* The area a price per square foot is divided by, and the law that decides
   which area that is.

   Every competing page on this query prints the same formula — price over
   area — and then a table of district averages. None of them says which
   area. That is the whole difficulty. A Dubai unit has an area in the
   brochure, an area on the floor plan and an area on the Property Register,
   and the last of those is the only one with an instrument behind it.

   Article 13 of the Implementing Bylaw of Law No. (13) of 2008, issued by
   Executive Council Resolution No. (6) of 2010, does two things nobody
   prices. It adopts the net area for registration. And it makes a shortfall
   of up to five percent cost the developer nothing, which puts a one-sided
   error band on the denominator of every off-plan price per foot.

   The figures live here so the page cannot state one thing and compute
   another. */

export const INSTRUMENTS = {
  ecr6: {
    name: "Executive Council Resolution No. (6) of 2010 Approving the Implementing Bylaw of Law No. (13) of 2008, Article 13",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2010/Executive%20Council%20Resolution%20No.%20(6)%20of%202010%20Approving%20the%20Implementing%20Bylaw%20of%20Law%20No.%20(13)%20of%202008.html",
  },
};

/* Article 13, in the order the Resolution writes it. Each claim is quoted
   word for word, and the suite makes the page carry it that way. */
export const STATUTORY = [
  { key: "netAreaRegistered", claim: "the net area of a Real Property Unit will be adopted for the purposes of registration on the Real Property Register", instrument: "ecr6" },
  { key: "excessIsFree", claim: "any area in excess of the net area of the sold Real Property Unit will not be taken into account, and the Developer may not claim any payment for that excess area", instrument: "ecr6" },
  { key: "fivePercent", claim: "The Developer must compensate the purchaser if the actual area of the Real Property Unit is less than its net area by more than five percent (5%)", instrument: "ecr6" },
  { key: "basisOfCalculation", claim: "the net area of a Real Property Unit, as set forth in its sale agreement and plan, will be adopted as the basis for calculation", instrument: "ecr6" },
];

/* Article 13(3) compensates a shortfall only where it exceeds this. A
   shortfall at or below it is lawful and free. */
export const TOLERANCE_PCT = 5;

/* The shortfalls the page tabulates. 5 is the boundary and is in the list
   deliberately: it is the largest shortfall that costs the developer
   nothing, and it is the only row of the table a buyer can do nothing
   about. */
export const SHORTFALLS = [1, 2, 3, 5, 7, 10];

/* The area-basis gaps the page tabulates: how much larger a quoted area is
   than the registered net area. These are arithmetic, not a claim about any
   market: the identity below holds whatever the real spread turns out to be,
   and the site does not have a dataset that would let it say. */
export const BASIS_GAPS = [0, 5, 10, 15, 20];

export const ppsf = (price, sqft) => price / sqft;

/* A shortfall of s percent leaves (100 - s) percent of the area, so the
   price per foot actually paid rises by s / (100 - s). The uplift is larger
   than the shortfall, always, and that is the asymmetry the page is about. */
export function upliftFromShortfall(shortfallPct) {
  return (shortfallPct / (100 - shortfallPct)) * 100;
}

/* A quoted area g percent larger than the registered area divides the same
   price by a bigger number, so the quoted rate is understated by
   g / (100 + g). Same identity, other direction. */
export function understatementFromBasisGap(gapPct) {
  return (gapPct / (100 + gapPct)) * 100;
}

export function compensable(shortfallPct) {
  return shortfallPct > TOLERANCE_PCT;
}

export function shortfallRow(shortfallPct, { price, sqft }) {
  const delivered = sqft * (1 - shortfallPct / 100);
  return {
    shortfallPct,
    delivered,
    quoted: ppsf(price, sqft),
    realised: ppsf(price, delivered),
    upliftPct: upliftFromShortfall(shortfallPct),
    missingValue: price * (shortfallPct / 100),
    compensable: compensable(shortfallPct),
  };
}

export function shortfallTable(i, list = SHORTFALLS) {
  return list.map((s) => shortfallRow(s, i));
}

export function basisRow(gapPct, { price, sqft, serviceChargePerSqft }) {
  const quotedArea = sqft * (1 + gapPct / 100);
  return {
    gapPct,
    quotedArea,
    ppsfRead: ppsf(price, quotedArea),
    scRead: (serviceChargePerSqft * sqft) / quotedArea,
    understatedPct: understatementFromBasisGap(gapPct),
  };
}

export function basisTable(i, list = BASIS_GAPS) {
  return list.map((g) => basisRow(g, i));
}

/* The largest shortfall that carries no compensation, priced. */
export function freeShortfall(i) {
  return shortfallRow(TOLERANCE_PCT, i);
}

/* That amount as a share of some other cost — used on the page to set it
   against the transaction stack the site already itemises. */
export function shareOf(amount, total) {
  return (amount / total) * 100;
}

export const money = (n) => Number(Math.round(n)).toLocaleString("en-US");
export const money2 = (n) => Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pc2 = (n) => `${Number(n).toFixed(2)}%`;
/* Two decimals, but a whole number reads as one. 125.00% is a typo-looking
   way to write 125%, and the page should read like prose. */
export const pc2trim = (n) => `${Number(n).toFixed(2).replace(/\.00$/, "")}%`;
