/* Selling a Dubai property that has a tenant in it.

   Every page on this question answers a different one. The brokerage blogs
   say yes you may sell, here are the grounds; the newspaper legal columns
   answer one reader's letter in four hundred words. None of them prices the
   choice, which is the only part a seller actually has to decide: take a
   discount and sell the unit tenanted today, or serve the twelve month
   notice the law requires and sell it vacant in a year.

   Both sides of that trade are computable, and this module computes them on
   the same illustrative one bedroom the net yield page uses, out of the same
   module, so the two pages cannot drift.

   The seller's side is the discount he can afford to give before selling now
   is worse than waiting. The buyer's side is the discount he needs before
   taking a tenant is worse than buying the unit next door empty. The
   interesting result is that both move almost exactly together as the
   sitting rent falls further below the index, so the bargaining range barely
   responds to the tenancy at all, and what decides whether a tenanted sale
   clears is the seller's own cost of money.

   The law is Law No. (26) of 2007 as amended by Law No. (33) of 2008.
   Article 25(2)(d) is the sale ground, Article 25(2)(c) the own use ground,
   Article 26 the bar on re-letting after an own use eviction, Article 28 the
   survival of the tenancy through a transfer of ownership and Article 31 the
   rent that keeps running while a claim is heard.

   Deliberately not in src/lawregister.mjs. The register files one instrument
   under one page, and the tenancy law already has a home there under
   rent-increase-caps, which is where a reader looking for the notice periods
   should land. The claims below are checked word for word against this page
   by a block of its own in scripts/playbooktest.mjs instead. */

import * as aq from "./acquisition.mjs";

export const INSTRUMENTS = {
  tenancy2008: {
    name: "Law No. (33) of 2008 amending Law No. (26) of 2007, Articles 2, 25 and 26",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2009/Law%20No.%20(33)%20of%202008%20Amending%20Law%20No.%20(26)%20of%202007.pdf",
  },
  tenancy2007: {
    name: "Law No. (26) of 2007 Regulating the Relationship between Landlords and Tenants in the Emirate of Dubai, Articles 28 and 31",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2007/Law%20No.%20(26)%20of%202007.html",
  },
  rdcFees: {
    name: "Rental Disputes Centre, published fees for registering a claim",
    url: "https://rdc.gov.ae/en/frequently-asked-questions/",
  },
};

/* Quoted from the official English of the two instruments. The 2008 law
   supersedes Articles 2, 25 and 26 of the 2007 law, so those four claims are
   filed against the amendment and not against the original; Articles 28 and
   31 were not superseded and are filed against the 2007 text. */
export const STATUTORY = [
  { key: "saleGround", claim: "the leased Real Property owner wishes to sell it", instrument: "tenancy2008" },
  { key: "ownUseGround", claim: "wishes to retake possession of the Real Property for his own use or for use by any of his first-degree relatives", instrument: "tenancy2008" },
  { key: "ownUseProof", claim: "provided that the owner proves that he does not own any alternative Real Property that is suitable for this purpose", instrument: "tenancy2008" },
  { key: "noticePeriod", claim: "at least twelve (12) months before the date of eviction", instrument: "tenancy2008" },
  { key: "service", claim: "the notice must be served through a Notary Public or by registered mail", instrument: "tenancy2008" },
  { key: "reletBar", claim: "may not rent the Real Property to a third party before the lapse of at least two (2) years in case of residential Real Property, or three (3) years in case of non-residential Real Property", instrument: "tenancy2008" },
  { key: "reletRemedy", claim: "the Tenant may request the Tribunal to award him fair compensation", instrument: "tenancy2008" },
  { key: "transferee", claim: "This includes any person to whom the ownership of the Real Property is transferred during the term of lease", instrument: "tenancy2008" },
  { key: "transfer", claim: "Transferring the ownership of Real Property to a new owner does not affect the Tenant's right to continue to occupy the Real Property by virtue of the Lease Contract entered into with the previous owner, provided that such Lease Contract has a fixed term", instrument: "tenancy2007" },
  { key: "rentDuringClaim", claim: "Filing a claim to evict the Tenant does not exempt the Tenant from paying the Rent for the whole period during which the claim is considered, and until an award is rendered and executed", instrument: "tenancy2007" },
  { key: "feeRate", claim: "3.5% of Annual Rent or Lease Value if it is more or less than a year", instrument: "rdcFees" },
  { key: "feeBounds", claim: "Fee not less than (AED 500) and not more than (AED 20,000)", instrument: "rdcFees" },
];

/* Article 25(2) gives twelve months, so every period on this page is twelve
   months unless a notice has already been running. */
export const NOTICE_MONTHS = 12;

/* The re-letting bar in Article 26, by use. Residential is the case this
   page works. */
export const RELET_BAR_YEARS = { residential: 2, nonResidential: 3 };

/* The cost of selling, as a share of the price: the agency commission and
   the VAT on it, on the same market convention the selling page uses, where
   the buyer carries the whole registration fee. The developer's no objection
   certificate is absent here for the reason it is absent there, which is
   that no instrument sets it; it falls due on either path and cancels. */
export const SALE_COST_RATE = aq.EXAMPLE.agencyRate * (1 + aq.FEES.vatRate);

/* The discount rate, as a percentage a year, matching the off-plan against
   ready page so a reader can carry one assumption across both. */
export const RATE = 6;

/* The gaps and the rates the published tables run. */
export const GAPS = [0, 10, 20, 25, 30, 40];
export const RATES = [3, 4, 5, 6, 7, 8, 9];
export const BASE_GAP = 25;
export const NOTICE_MONTHS_LEFT = [12, 9, 6, 3, 0];

/* Present value of n monthly payments of one, at an annual rate compounded
   monthly. */
export function annuity(n, ratePct) {
  const m = ratePct / 100 / 12;
  if (n <= 0) return 0;
  return (1 - Math.pow(1 + m, -n)) / m;
}

export const sittingRent = (gapPct) => Math.round(aq.EXAMPLE.rent * (1 - gapPct / 100));

/* Net operating income on a unit that is occupied for the whole year, which
   is the sitting tenant's case: the contract is running, so the net yield
   page's vacancy allowance does not apply. Read out of acquisition.mjs at
   full occupancy so the cost lines are the flagship page's own. */
export function noiOccupied(rent) {
  return aq.netAtLetOccupancy(1, 0, { ...aq.EXAMPLE, rent });
}

/* The two break-even discounts, as a share of the vacant price.

   seller: sell tenanted today at a discount, against serving notice,
   collecting the sitting rent for twelve months and selling vacant. Sale
   costs scale with the price, so they appear on both sides.

   buyer: buy this unit tenanted, against the identical unit vacant next
   door let at the index. The buyer is a Landlord under Article 2 the day he
   takes title, so his loss is bounded by his own twelve month notice rather
   than by the rent cap ladder: twelve months of the income the tenancy
   gives up, and no more. */
export function decision(gapPct = BASE_GAP, ratePct = RATE, monthsLeft = NOTICE_MONTHS) {
  const price = aq.EXAMPLE.price;
  const netOfCosts = price * (1 - SALE_COST_RATE);
  const rent = sittingRent(gapPct);
  const noi = noiOccupied(rent);

  const pvRent = (noi / 12) * annuity(NOTICE_MONTHS, ratePct);
  const pvSale = netOfCosts / (1 + ratePct / 100);
  const sellerRate = 1 - (pvRent + pvSale) / netOfCosts;

  const shortfallYear = noiOccupied(aq.EXAMPLE.rent) - noi;
  const pvShortfall = (shortfallYear / 12) * annuity(monthsLeft, ratePct);
  const buyerRate = pvShortfall / price;

  return {
    rent, noi, pvRent, pvSale, shortfallYear, pvShortfall,
    sellerPct: sellerRate * 100,
    sellerAED: Math.round(sellerRate * price),
    buyerPct: buyerRate * 100,
    buyerAED: Math.round(pvShortfall),
    rangePts: (sellerRate - buyerRate) * 100,
    rangeAED: Math.round(sellerRate * price - pvShortfall),
    clears: sellerRate > buyerRate,
  };
}

export const byGap = (ratePct = RATE) => GAPS.map((g) => ({ gap: g, ...decision(g, ratePct) }));
export const byRate = (gapPct = BASE_GAP) => RATES.map((r) => ({ rate: r, ...decision(gapPct, r) }));

/* What a notice already served is worth to a buyer, which is the shortfall
   the months already run have taken off his side. */
export function noticeLadder(gapPct = BASE_GAP, ratePct = RATE) {
  const full = decision(gapPct, ratePct, NOTICE_MONTHS);
  return NOTICE_MONTHS_LEFT.map((monthsLeft) => {
    const d = decision(gapPct, ratePct, monthsLeft);
    return {
      monthsLeft,
      monthsRun: NOTICE_MONTHS - monthsLeft,
      buyerAED: d.buyerAED,
      buyerPct: d.buyerPct,
      worthAED: full.buyerAED - d.buyerAED,
    };
  });
}

/* The unexpired lease term matters, and it is the one input a brochure never
   mentions. Article 25(2) allows eviction "Upon expiry of the Lease Contract",
   so the earliest a buyer can have the unit empty is the later of the twelve
   month notice and the end of the contract he inherited. A tenancy with two
   years left costs him two years of the shortfall, not one. */
export const LEASE_TERMS = [6, 12, 18, 24, 36];

export const exposureMonths = (unexpiredMonths) => Math.max(NOTICE_MONTHS, unexpiredMonths);

export function byLeaseTerm(gapPct = BASE_GAP, ratePct = RATE) {
  const seller = decision(gapPct, ratePct);
  return LEASE_TERMS.map((unexpired) => {
    const months = exposureMonths(unexpired);
    const d = decision(gapPct, ratePct, months);
    return {
      unexpired, months,
      buyerAED: d.buyerAED,
      buyerPct: d.buyerPct,
      sellerAED: seller.sellerAED,
      sellerPct: seller.sellerPct,
      rangeAED: seller.sellerAED - d.buyerAED,
      clears: seller.sellerPct > d.buyerPct,
    };
  });
}

/* The rate at which the bargaining range opens, by bisection. Below it there
   is no price at which both sides prefer the tenanted deal. */
export function crossoverRate(gapPct = BASE_GAP) {
  let lo = 0.5, hi = 25;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (decision(gapPct, mid).rangePts > 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

/* The unit's own net operating yield on what a sale actually nets, which is
   the figure the crossover rate lands on. */
export function netOperatingYield() {
  return (noiOccupied(aq.EXAMPLE.rent) / (aq.EXAMPLE.price * (1 - SALE_COST_RATE))) * 100;
}

/* Article 26. Evicting on the own use ground costs the owner the letting he
   is then barred from, which the sale ground does not. */
export function reletBar(use = "residential", ratePct = RATE) {
  const years = RELET_BAR_YEARS[use];
  const noi = noiOccupied(aq.EXAMPLE.rent);
  return {
    years,
    nominal: noi * years,
    presentValue: (noi / 12) * annuity(years * 12, ratePct),
  };
}

/* The Centre's own schedule, on the rent in dispute. Same arithmetic as the
   rent cap page, run on the sitting rent rather than on a demanded one. */
export const RDC = { rate: 0.035, floor: 500, ceiling: 20000, fixed: 100 + 10 + 10 };

export function rdcFiling(annualRent) {
  const fee = Math.min(RDC.ceiling, Math.max(RDC.floor, annualRent * RDC.rate));
  const allIn = fee + RDC.fixed;
  return { fee, allIn, shareOfPrice: (allIn / aq.EXAMPLE.price) * 100 };
}

export const money = (n) => Number(Math.round(n)).toLocaleString("en-US");
export const pct2 = (n) => `${Number(n).toFixed(2)}%`;
export const pts2 = (n) => `${Number(n).toFixed(2)}`;
