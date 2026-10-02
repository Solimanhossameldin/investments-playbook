/* Selling a Dubai property, and the cost stack on the way out.

   Every page on this query prints the same list: agency 2%, NOC "AED 500 to
   5,000", "mortgage release AED 1,290", "early settlement 1% capped at AED
   10,000". Not one of them says where any of those numbers comes from, and
   the strongest of them runs a worked example with a total and cites
   nothing at all.

   Read the instruments and the list stops being a list. The seller's costs
   fall into three tiers by who sets them, and the tiers behave completely
   differently.

   The bank's charges are capped, to the dirham, by the Central Bank. The
   Amendment to Appendix 2 of Regulation No. 29/2011 is a table of maximum
   permissible charges, and the home loan block caps early settlement, the
   liability letter, the clearance letter and the bank's own NOC. A bank
   quoting more than these is quoting above a cap, and the cap on early
   settlement is the lower of one per cent and AED 10,000, which means it
   stops growing at an outstanding balance this module computes rather than
   asserts.

   The Land Department's charges are set by its service pages, and the page
   for registering the sale of a mortgaged property carries two lines that
   appear on no competing page: the AED 315 registrar fee, and the sentence
   that waives it when the buyer registers a mortgage the same day.

   And the developer's NOC fee is set by nobody. No instrument fixes it, no
   cap constrains it, and no register publishes it. It is therefore absent
   from the arithmetic here, and the page says it is absent and why. It is
   the only line in the seller's stack with no ceiling, which is the reason
   to ask for it in writing before setting an asking price rather than after
   agreeing one. */

import { EXAMPLE as BUY, acquisition, mortgageCosts, operating, FEES, money } from "./acquisition.mjs";

export const INSTRUMENTS = {
  cbuaeCaps: {
    name: "Central Bank of the UAE, Amendments to Appendix 2 of the Regulations Regarding Bank Loans & Other Services Offered to Individual Customers (Regulation No. 29/2011), in force 8 October 2019",
    url: "https://rulebook.centralbank.ae/en/entiresection/4406",
  },
  dldMortgagedSale: {
    name: "Dubai Land Department, Registering the Sale of a Mortgaged Property, service fees",
    url: "https://dubailand.gov.ae/en/eservices/registering-the-sale-of-a-mortgaged-property/",
  },
  dldRelease: {
    name: "Dubai Land Department, Mortgage release application, service fees",
    url: "https://dubailand.gov.ae/en/eservices/request-for-mortgage-termination/",
  },
};

/* The instruments' own words. Each of these has to appear in the page or the
   suite names the page that dropped it. */
export const STATUTORY = [
  { key: "earlySettlement", claim: "Max 1% of outstanding balance or 10,000, whichever is less", instrument: "cbuaeCaps" },
  { key: "maximumPermissible", claim: "The fee caps set out in this Amendment represent the maximum permissible charges", instrument: "cbuaeCaps" },
  { key: "vatExclusive", claim: "All fees set out in this Amendment are exclusive of UAE VAT charges", instrument: "cbuaeCaps" },
  { key: "releaseProcedure", claim: "AED 1,290 fee for the mortgage release procedure", instrument: "dldMortgagedSale" },
  { key: "registrarRelease", claim: "AED 315 fee for the registrar to release the mortgage", instrument: "dldMortgagedSale" },
  { key: "sameDayExemption", claim: "registrar's fees will be exempted in the event that a mortgage is registered on the same day", instrument: "dldMortgagedSale" },
  { key: "mortgageRemoval", claim: "AED 1,000 fee for the mortgage removal", instrument: "dldRelease" },
  { key: "releasePartner", claim: "AED 300 service fee + value added tax on service partners fee", instrument: "dldRelease" },
];

/* Appendix 2, Home Loans block, as amounts. Every one of these is a maximum,
   not a price, and the Amendment says they are exclusive of VAT. */
export const CAPS = {
  earlySettlementRate: 0.01,
  earlySettlementCap: 10000,
  liabilityLetter: 85,          // row 36
  bankNoc: 150,                 // row 40
  clearanceLetter: 95,          // row 42
  otherLetters: 90,             // row 43
  latePayment: 700,             // row 34
};

/* The Land Department's exit lines, from its own service pages. */
export const DLD_EXIT = {
  releaseProcedure: 1290,       // registering the sale of a mortgaged property
  registrarRelease: 315,        // waived if a mortgage is registered the same day
  removalStandalone: 1000,      // mortgage release application, on its own
  removalPartner: 300,          // service partner fee on that application, before VAT
};

/* The illustrative seller is the buyer of the net yield page, some years on:
   the same one bedroom at the same price, with part of the same loan still
   outstanding. Keeping the property identical is what lets the two pages be
   added together into a round trip. */
export const SELLER = {
  price: BUY.price,
  outstanding: 900000,
  agencyRate: BUY.agencyRate,
};

/* The cap is the lower of a rate and a flat ceiling, so above some balance
   the fee stops responding to the balance at all. */
export function earlySettlement(outstanding) {
  return Math.round(Math.min(outstanding * CAPS.earlySettlementRate, CAPS.earlySettlementCap));
}

/* Whether the ceiling, rather than the rate, is what sets the fee. Asked of
   the unrounded one per cent, because a balance of AED 999,950 rounds to the
   cap without having reached it, and a page that said the cap binds there
   would be wrong about the only thing this function is for. */
export function capped(outstanding) {
  return outstanding * CAPS.earlySettlementRate >= CAPS.earlySettlementCap;
}

/* The balance at which the ceiling starts binding. Searched in whole
   thousands against the same function the table prints, then walked back a
   dirham at a time, rather than dividing the cap by the rate and trusting
   that the rounding agrees. */
export function capBindsAt() {
  let b = 0;
  while (b < 100000000 && !capped(b)) b += 1000;
  while (b > 0 && capped(b - 1)) b -= 1;
  return b;
}

/* What the seller pays, on the Dubai convention that the buyer carries the
   whole registration fee and the trustee. The developer's NOC is not here
   because no instrument sets it; the page says so rather than inventing a
   figure for it. */
export function sellerStack(s = SELLER) {
  const agency = Math.round(s.price * s.agencyRate * (1 + FEES.vatRate));
  const lines = [
    ["Agency commission, with VAT", agency],
    ["Early settlement of the mortgage", earlySettlement(s.outstanding)],
    ["Mortgage release procedure", DLD_EXIT.releaseProcedure],
    ["Registrar, to release the mortgage", DLD_EXIT.registrarRelease],
    ["Bank liability letter", CAPS.liabilityLetter],
    ["Bank clearance letter", CAPS.clearanceLetter],
  ];
  const total = lines.reduce((a, [, v]) => a + v, 0);
  return {
    lines, total, agency,
    rate: Number(((total / s.price) * 100).toFixed(2)),
    commissionShare: Number(((agency / total) * 100).toFixed(1)),
  };
}

/* The number the seller does not normally pay. Article 3 of Executive
   Council Resolution No. (30) of 2013 splits the registration fee equally
   in the absence of an agreement to the contrary; the Dubai contract almost
   always contains that agreement. Taken from the acquisition module rather
   than retyped, so the two pages cannot disagree about it. */
export function contingent(s = SELLER) {
  const share = acquisition({ ...BUY, price: s.price }).sellerShare;
  const stack = sellerStack(s);
  return {
    share,
    ofStack: Number((share / stack.total).toFixed(3)),
    ofAgency: Number((share / stack.agency).toFixed(3)),
    withShare: stack.total + share,
  };
}

/* Entry and exit added together, with the mortgage on both sides, because a
   mortgaged buyer becomes a mortgaged seller. The net yield page's round
   trip is the cash version of this and is deliberately smaller. */
export function roundTrip(s = SELLER) {
  const buy = acquisition({ ...BUY, price: s.price }).total;
  const debt = mortgageCosts({ ...BUY, price: s.price }).total;
  const sell = sellerStack(s).total;
  const total = buy + debt + sell;
  const noi = operating().net;
  return {
    buy, debt, sell, total,
    rate: Number(((total / s.price) * 100).toFixed(2)),
    years: Number((total / noi).toFixed(2)),
    noi,
  };
}

/* The seller's stack against the balance still outstanding, which is the
   input the seller knows and the listing never carries. The last two rows
   are the point: the fee stops moving. */
export const BALANCES = [250000, 500000, 750000, 1000000, 1125000];

export function atBalance(outstanding, s = SELLER) {
  return sellerStack({ ...s, outstanding });
}

/* The same stack across sale prices, at a constant loan-to-value, because
   the two halves of it move in opposite directions. The commission is a
   percentage and grows with the price; the bank's block is capped in
   dirhams and does not. The seller of an expensive property pays a smaller
   share of it away, and almost all of what is left is negotiable. */
export const PRICES = [750000, 1000000, 1500000, 2500000, 5000000];
export const SENSITIVITY_LTV = 0.6;

export function atPrice(price, s = SELLER) {
  return sellerStack({ ...s, price, outstanding: Math.round(price * SENSITIVITY_LTV) });
}

/* The price the seller has to achieve to come out level.

   Every page on this query stops at the cost of the round trip, and a reader
   told the round trip costs 9.72% of the price will reasonably assume a 9.72%
   rise covers it. It does not, and the reason is worth a sentence rather than
   a footnote: the agency commission and its VAT are charged on the price the
   property sells for, not the price it was bought for, so a higher exit price
   carries a higher exit cost, and the rise has to cover that too.

   The required price is therefore the solution of

     S - agencyRate * (1 + VAT) * S - fixed = price + entry

   and not a ratio of costs to price. It is solved, not searched, and the gap
   against the naive ratio is returned so the page can print the difference
   instead of leaving the reader to assume it away.

   The second figure is the same solve with the statutory half added to the
   rate, because in the minority of sales where the buyer reopens Article 3
   the seller pays 2% of the price it sells for. Both rates are taken from the
   acquisition module rather than retyped, so the entry and exit pages cannot
   disagree about either. */
export function breakEven(s = SELLER) {
  const stack = sellerStack(s);
  const buy = acquisition({ ...BUY, price: s.price });
  const entry = buy.total + mortgageCosts({ ...BUY, price: s.price }).total;
  const fixed = stack.total - stack.agency;
  const exitRate = s.agencyRate * (1 + FEES.vatRate);
  const statutoryRate = buy.sellerShare / s.price;
  const sunk = s.price + entry + fixed;
  const solve = (rate) => Math.round(sunk / (1 - rate));
  const rise = (p) => Number(((p / s.price - 1) * 100).toFixed(2));
  const price = solve(exitRate);
  const withShare = solve(exitRate + statutoryRate);
  const trip = roundTrip(s);
  return {
    entry, fixed, sunk, exitRate, statutoryRate,
    price, withShare,
    rise: rise(price),
    riseWithShare: rise(withShare),
    tripRate: trip.rate,
    gap: Number((rise(price) - trip.rate).toFixed(2)),
    extraCommission: Math.round((price - s.price) * exitRate),
    spread: withShare - price,
  };
}

/* How long the required rise has actually taken, in the one Dubai series this
   site publishes.

   Observed, not modelled. This finds the first month the index genuinely stood
   that far above a starting month and counts the gap in months. No compound
   rate is fitted, nothing is extrapolated past the end of the series, and the
   analysed index is passed in rather than read from disk so this stays a pure
   function of the points.

   The pair of answers is the reason the function exists. Measured from the
   trough the required rise arrives almost at once. Measured from the pre-slide
   peak it arrives well after the index has regained that peak, because
   regaining the purchase price is not the same event as breaking even on the
   sale -- the round trip still has to be paid out of the difference. The gap
   between those two month counts is the cost of the round trip expressed as
   time, and it appears on no competing page. */
export function breakEvenAgainstIndex(pi, s = SELLER) {
  const be = breakEven(s);
  const points = pi?.byKey?.all?.points;
  if (!points?.length)
    throw new Error("disposal: the price index analysis carries no all-residential points");
  if (!pi.recovered)
    throw new Error("disposal: the price index no longer reports a recovery, so there is no peak to measure from");
  const ratio = be.price / s.price;
  const month = (iso) => +iso.slice(0, 4) * 12 + +iso.slice(5, 7);
  const after = (fromDate, baseValue) => {
    const hit = points.find((p) => p[0] > fromDate && p[1] >= baseValue * ratio);
    return hit ? { date: hit[0], value: hit[1], months: month(hit[0]) - month(fromDate) } : null;
  };
  const fromTrough = after(pi.trough.date, pi.trough.value);
  const fromPeak = after(pi.peak.date, pi.peak.value);
  /* If a revised series stops clearing the break-even rise from either end,
     the honest outcome is a failed build and a rewrite, not a page that
     quietly prints a null. */
  if (!fromTrough || !fromPeak)
    throw new Error(
      "disposal: the index no longer clears the break-even rise from both the peak and the trough. The page's timing comparison must be rewritten, not rebuilt."
    );
  return {
    ratio, fromTrough, fromPeak,
    peak: pi.peak, trough: pi.trough,
    recoveredMonths: pi.recovered.months,
    extra: fromPeak.months - pi.recovered.months,
    ends: pi.last,
  };
}

export { money };
