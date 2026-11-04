/* Moving a Dubai property to a spouse, a parent or a child, priced from the
   instruments rather than from the headline rate.

   Every page on this query prints the same number and stops: the Land
   Department charges 0.125% to register a gift instead of the 4% it charges
   to register a sale. The figure is right. Read as a rate it is wrong for
   most of the Dubai apartment market, and three things fall out of reading
   the Schedule and the service page instead of the sentence.

   The 0.125% has a floor under it. Row 5 of the Schedule to Executive
   Council Resolution No. (30) of 2013 adds "provided that the Fee is not
   less than AED 2,000.00", and this module derives the valuation at which
   the percentage finally overtakes that floor. Below it the charge is a flat
   AED 2,000 whose share of the value rises as the property gets cheaper, so
   the famous rate is a ceiling on what the gift fee ever costs rather than
   the price of the transaction.

   The trustee threshold is not the one the sale pages use. The Land
   Department's gift service page splits the service partner fee at a
   valuation of AED 2,000,000, where its sale service page splits the same
   fee at AED 500,000. Between those two figures a gift pays half what a sale
   pays for the identical office visit, and the step at AED 2,000,000 is
   large enough to make the total cost of a gift rise, as a share of value,
   from AED 1,600,000 to AED 2,000,000. A published schedule of flat amounts
   does not produce a flat percentage, which is the same finding the cost of
   buying page makes on the way in.

   And the whole stack is knowable before anyone is asked for a valuation,
   because every line of it except the valuation itself is published. The
   valuation fee is not, so it is named and excluded, and every total here is
   a floor. */

import * as aq from "./acquisition.mjs";

export const INSTRUMENTS = {
  dldGift: {
    name: "Dubai Land Department, Property gift registration, service fees and service terms",
    url: "https://dubailand.gov.ae/en/eservices/property-gift-registration/",
  },
};

/* The instrument's own words, carried word for word on the page by the
   statutory loop in the suite. The eligibility sentence is here because the
   list of who qualifies is the one thing a reader cannot derive, and because
   every competing page paraphrases it into something wider than it says. */
export const STATUTORY = [
  {
    key: "eligibility",
    claim: "first-degree relatives; mother, father, spouse, or children or to companies",
    instrument: "dldGift",
  },
  {
    key: "withoutCompensation",
    claim: "without compensation, provided that the property is not restricted or granted land",
    instrument: "dldGift",
  },
  {
    key: "valuationFirst",
    claim: "A property evaluation request must be submitted at one of the Real Estate Trustee Centers before applying for registration",
    instrument: "dldGift",
  },
];

/* Executive Council Resolution No. (30) of 2013, Schedule, the three rows
   this page turns on, quoted so the page cannot drift from them. Kept out of
   INSTRUMENTS deliberately: the net rental yield page already registers that
   resolution in the law register, and the register is keyed on the
   instrument, so one instrument belongs to one page in it. */
export const SCHEDULE_ROWS = {
  gift: "0.125% of the value of the Real Property given as a gift, provided that the Fee is not less than AED 2,000.00",
  sale: "4% of the value of the sale contract",
  will: "0.125% of the value of the Real Property, which is the subject matter of the will",
  giftLand: "AED 500.00",
};

/* Article 3(5): on a gift the fee is the recipient's, which is the opposite
   default from the sale fee in Article 3(1) and is stated by no competing
   page on this query. */
export const LIABILITY = {
  gift: "paid by the Person to whom the rights are transferred",
  sale: "shared equally by the seller and purchaser",
};

export const FEES = {
  giftRate: 0.00125,        // ECR 30 of 2013, Schedule, row 5
  giftMinimum: 2000,        // ECR 30 of 2013, Schedule, row 5, and the DLD gift service page
  trusteeThreshold: 2000000, // DLD gift service page, its own threshold and not the sale one
  trusteeHigh: 4000,        // at or above the threshold, before VAT
  trusteeLow: 2000,         // below the threshold, before VAT
};

/* The valuation the Land Department charges the 0.125% on. The gift service
   page requires a valuation before the application and publishes no price
   for it, so nothing here estimates one: it is named on the page as the one
   line with no published figure, and every total below is a floor. */
export const UNPRICED = ["the Real Estate Trustee Centre valuation the service terms require before the application"];

/* The valuation at which the percentage finally overtakes the dirham floor.
   Derived from the two figures rather than typed, so the page and the
   Schedule cannot disagree about the only threshold the page prints. */
export const floorBindsBelow = FEES.giftMinimum / FEES.giftRate;

export const floorBinds = (value) => value < floorBindsBelow;

/* Row 5, with its floor applied. Below the derived valuation this returns
   the flat minimum, which is the whole point. */
export function giftFee(value) {
  return Math.max(Math.round(value * FEES.giftRate), FEES.giftMinimum);
}

/* The trustee office is a service partner and not the Land Department, so
   its fee carries VAT where the registration fee does not. Same shape as the
   acquisition module's trustee fee, and deliberately a separate function:
   the threshold is different and a page that shared the sale one would be
   quietly wrong by AED 2,100 across most of the market. */
export function trusteeFee(value) {
  const base = value >= FEES.trusteeThreshold ? FEES.trusteeHigh : FEES.trusteeLow;
  return Math.round(base * (1 + aq.FEES.vatRate));
}

/* The flat lines, identical on both routes, taken from the acquisition
   module so the gift page and the cost of buying page cannot print
   different numbers for the same four fees. */
export function flatLines() {
  const lines = [
    ["Title deed certificate", aq.FEES.titleDeed],
    ["Map, apartments and villas", aq.FEES.mapApartment],
    ["Knowledge fee", aq.FEES.knowledge],
    ["Innovation fee", aq.FEES.innovation],
  ];
  return { lines, total: lines.reduce((a, [, v]) => a + v, 0) };
}

/* The whole cost of registering the gift, line by line. */
export function giftStack(value = aq.EXAMPLE.price) {
  const flat = flatLines();
  const lines = [
    ["Registering a gift, 0.125% of the valuation", giftFee(value)],
    ...flat.lines,
    ["Land Department service partner, with VAT", trusteeFee(value)],
  ];
  const total = lines.reduce((a, [, v]) => a + v, 0);
  return {
    lines,
    total,
    fee: giftFee(value),
    floorBinds: floorBinds(value),
    ratePct: Number(((total / value) * 100).toFixed(3)),
  };
}

/* The same property registered as a sale instead. The agency commission is
   deliberately absent: a transfer inside a family needs no agent, and
   including one would flatter the gift route with a cost the sale route does
   not have to carry either. Both totals are therefore fees only, which is
   what makes them comparable. */
export function saleStack(value = aq.EXAMPLE.price) {
  const flat = flatLines();
  const lines = [
    ["Registering a sale contract, 4% of the contract value", Math.round(value * aq.FEES.transferRate)],
    ...flat.lines,
    ["Land Department service partner, with VAT", aq.trusteeFee(value)],
  ];
  const total = lines.reduce((a, [, v]) => a + v, 0);
  return { lines, total, ratePct: Number(((total / value) * 100).toFixed(3)) };
}

export function comparison(value = aq.EXAMPLE.price) {
  const gift = giftStack(value);
  const sale = saleStack(value);
  return {
    value, gift, sale,
    gap: sale.total - gift.total,
    gapPct: Number((((sale.total - gift.total) / value) * 100).toFixed(3)),
    giftSharePct: Number(((gift.total / sale.total) * 100).toFixed(1)),
  };
}

/* The valuations the tables are computed at. They straddle both thresholds
   on purpose, so the tables show the floor binding and the trustee step
   happening rather than asserting that either does. */
export const VALUES = [500000, 800000, 1000000, 1500000, 1600000, 2000000, 3000000, 5000000];

export function feeShareTable() {
  return VALUES.map((value) => ({
    value,
    fee: giftFee(value),
    sharePct: Number(((giftFee(value) / value) * 100).toFixed(3)),
    floorBinds: floorBinds(value),
  }));
}

export function comparisonTable() {
  return VALUES.map((value) => comparison(value));
}

/* The band inside which every line of the stack is flat, so the entire cost
   of a gift is one number regardless of what the property is worth. Derived
   from the two thresholds rather than asserted: the upper end is wherever the
   floor stops binding, and the total is the stack computed anywhere below it. */
export function flatBand() {
  const upTo = floorBindsBelow;
  return { upTo, total: giftStack(upTo - 1).total };
}

/* The step at the trustee threshold, in dirhams, for one dirham of
   valuation. The service partner fee doubles at AED 2,000,000 and nothing
   else changes, which is the only discontinuity in either stack. */
export function trusteeStep() {
  const below = giftStack(FEES.trusteeThreshold - 1);
  const at = giftStack(FEES.trusteeThreshold);
  return {
    threshold: FEES.trusteeThreshold,
    below: below.total,
    at: at.total,
    step: at.total - below.total,
    belowRatePct: below.ratePct,
    atRatePct: at.ratePct,
  };
}

export const money = (n) => Number(Math.round(n)).toLocaleString("en-US");
export const pctText = (n) => `${Number(n).toFixed(3)}%`;
