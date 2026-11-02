/* Buying off-plan in Dubai, and the branch every payment-plan page leaves out.

   There are two literatures on off-plan and they never meet.

   One prices the plan. It discounts the instalments, shows that a
   post-handover schedule costs less in today's money than a front-loaded
   one, and stops. Everything it says is true on the branch where the buyer
   pays to the end.

   The other answers "what if I cannot pay". The better pages on that query
   get the headline right — the retention ceiling is a percentage of the
   unit's price, not of what you have handed over — and the best of them
   runs a worked example. What none of them does is put a number on the
   thing a buyer is actually choosing when he picks a plan, because that
   requires both halves at once.

   Article 11 of Law No. (13) of 2008, in the form Law No. (19) of 2020
   gave it, is what makes the second half computable. The developer's
   remedy is banded by how far the building has got, and each band is
   expressed as a ceiling on "the value of the Real Property Unit
   stipulated in the Off-plan Sale agreement". Three consequences follow
   from that one drafting choice, and this module computes all three:

   1. Exposure is fixed at signing. The ceiling is set by the price. It
      does not grow as you pay. Above it, every further dirham is
      refundable — so "I should pay less in case it goes wrong" is exactly
      backwards.

   2. Below the ceiling there is no refund at all. A 20% down payment on a
      project under 60% complete sits entirely inside a 25% ceiling. The
      standard Dubai deposit is inside the standard Dubai forfeiture.

   3. The refund falls as the building rises. Crossing 60% completion moves
      the ceiling from 25% to 40% of the price. Nothing the buyer does, and
      nothing he is told about on the day. On the illustrative unit that is
      AED 225,000 off what he would have got back.

   The 30% band that circulates widely — "up to thirty percent of the
   amounts paid, where work has not commenced" — is the 2017 text. It was
   the only band ever measured against payments and the 2020 replacement
   does not contain it. Paragraph (b) of the new Article 11 requires a full
   refund instead, on the conditions it states.

   The unit is the one on the net rental yield page, so the two chain. */

import { EXAMPLE, FEES, money } from "./acquisition.mjs";

export const INSTRUMENTS = {
  law19: {
    name: "Law No. (19) of 2020 Amending Law No. (13) of 2008 Regulating the Interim Real Property Register in the Emirate of Dubai, Article 11",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2020/Law%20No.%20(19)%20of%202020%20Amending%20Law%20No.%20(13)%20of%202008%20Regulating%20the%20Interim%20Real%20Property%20Register%20in%20the%20Emirate%20of%20Dubai.html",
  },
  law13: {
    name: "Law No. (13) of 2008 Regulating the Interim Real Property Register in the Emirate of Dubai, Articles 3, 6 and 7",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2008/Law%20No.%20(13)%20of%202008.html",
  },
  escrow: {
    name: "Law No. (8) of 2007 Concerning Escrow Accounts for Real Estate Development in the Emirate of Dubai, Articles 7 and 14",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2007/Law%20No.%20(8)%20of%202007.html",
  },
  dldInitialSale: {
    name: "Dubai Land Department, Request to Register the Initial Sale, service fees",
    url: "https://dubailand.gov.ae/en/eservices/request-to-register-the-initial-sale/",
  },
};

/* Every claim the page must carry word for word, in the instrument's own
   words. The suite fails the build if the page drops one or cites something
   other than the instrument that sets it. */
export const STATUTORY = [
  { key: "ceilingIsThePrice", claim: "the value of the Real Property Unit stipulated in the Off-plan Sale agreement", instrument: "law19" },
  { key: "notice", claim: "thirty (30) days' notice", instrument: "law19" },
  { key: "resaleWindow", claim: "within sixty (60) days from the date of resale", instrument: "law19" },
  { key: "notCommenced", claim: "the Developer must refund all payments made by the purchasers", instrument: "law19" },
  { key: "publicOrder", claim: "are considered part of public order", instrument: "law19" },
  { key: "voidUnlessEntered", claim: "will be void unless entered in that Register", instrument: "law13" },
  { key: "disposalRight", claim: "may be disposed of by way of sale, mortgage, or any other legal disposition", instrument: "law13" },
  { key: "noDeveloperFee", claim: "No Master Developer or Sub-developer may charge any fees on the sale, resale, or on any other legal disposition", instrument: "law13" },
  { key: "adminCostsOnly", claim: "except those administrative costs which are approved by the Department", instrument: "law13" },
  { key: "escrowScope", claim: "the payments made by off-plan purchasers, or by the financers of the project are deposited in an account opened with the Escrow Agent", instrument: "escrow" },
  { key: "escrowRetention", claim: "retain five percent (5%) of the total value of each Escrow Account", instrument: "escrow" },
  { key: "escrowRelease", claim: "released to the Developer one (1) year from the registration of Units", instrument: "escrow" },
  { key: "sellerShare", claim: "The seller: 2% of the sale value", instrument: "dldInitialSale" },
  { key: "purchaserShare", claim: "The purchaser: 2% of the sale value", instrument: "dldInitialSale" },
];

/* Article 11(a)(4), in the order the law writes the bands. */
export const BANDS = [
  {
    floor: 80, retain: 0.40,
    wording: "over eighty percent (80%) complete",
    alsoMay: [
      "retain all amounts paid by the purchaser, and claim the balance of the value of the agreement from the purchaser",
      "request the DLD to sell the Real Property Unit by public auction",
    ],
  },
  { floor: 60, retain: 0.40, wording: "at least sixty percent (60%) and up to eighty percent (80%) complete", alsoMay: [] },
  { floor: 0, retain: 0.25, wording: "work has commenced and completion is under sixty percent (60%)", alsoMay: [] },
];

export const REFUND = { withinYears: 1, orDaysFromResale: 60 };
export const NOTICE_DAYS = 30;

export const INITIAL_SALE = {
  sellerRate: 0.02,
  purchaserRate: 0.02,
  knowledge: 10,
  innovation: 10,
  oqoodDeveloperSelfRegistration: 1000,
};

export function bandFor(completionPercent) {
  return BANDS.find((b) => completionPercent >= b.floor);
}

export function onTermination(price, paid, completionPercent) {
  const band = bandFor(completionPercent);
  const ceiling = price * band.retain;
  const retained = Math.min(paid, ceiling);
  const refund = Math.max(0, paid - ceiling);
  return {
    band,
    ceiling,
    retained,
    refund,
    shareOfPaidLost: paid > 0 ? retained / paid : 0,
  };
}

export function refundStartsAt(price, completionPercent) {
  return price * bandFor(completionPercent).retain;
}

export function bandStep(price, paid, fromPercent, toPercent) {
  const before = onTermination(price, paid, fromPercent);
  const after = onTermination(price, paid, toPercent);
  return {
    before: before.refund,
    after: after.refund,
    drop: before.refund - after.refund,
    maxDrop: Math.round(price * (after.band.retain - before.band.retain) * 100) / 100,
  };
}

export function refundGrid(price, paidPoints, completionPercent) {
  return paidPoints.map((paid) => {
    const t = onTermination(price, paid, completionPercent);
    return { paid, retained: t.retained, refund: t.refund, shareOfPaidLost: t.shareOfPaidLost };
  });
}

export function initialRegistration(price) {
  const purchaser = price * INITIAL_SALE.purchaserRate + INITIAL_SALE.knowledge + INITIAL_SALE.innovation;
  return {
    seller: price * INITIAL_SALE.sellerRate,
    purchaser,
    combined: price * (INITIAL_SALE.sellerRate + INITIAL_SALE.purchaserRate) + INITIAL_SALE.knowledge + INITIAL_SALE.innovation,
  };
}

export function planPresentValue(price, plan, annualRatePercent, months) {
  const m = Math.pow(1 + annualRatePercent / 100, 1 / 12) - 1;
  const M = Math.max(1, Math.round(months));
  let t = (price * plan.down) / 100;
  if (plan.build > 0) {
    const per = (price * plan.build) / 100 / M;
    for (let k = 1; k <= M; k++) t += per / Math.pow(1 + m, k);
  }
  t += (price * plan.hand) / 100 / Math.pow(1 + m, M);
  const pm = Math.max(0, Math.round(plan.postMonths || 0));
  if (plan.post > 0 && pm > 0) {
    const pp = (price * plan.post) / 100 / pm;
    for (let j = 1; j <= pm; j++) t += pp / Math.pow(1 + m, M + j);
  }
  return t;
}

export function effectiveDiscount(price, pv) {
  return 1 - pv / price;
}

export const EXAMPLE_PLAN = {
  price: EXAMPLE.price,
  months: 30,
  discountRate: 6,
  a: { down: 20, build: 60, hand: 20, post: 0, postMonths: 0 },
  b: { down: 10, build: 30, hand: 20, post: 40, postMonths: 48 },
};

export function paidByMonth(price, plan, k, months) {
  const M = Math.max(1, Math.round(months));
  const capped = Math.min(Math.max(k, 0), M);
  return (price * plan.down) / 100 + ((price * plan.build) / 100) * (capped / M);
}

/* ---- selling the contract instead of the flat ----

   The buyer who cannot continue has a second exit the payment-plan pages
   never price, and the termination pages never mention: he can sell the
   contract. Article 6 says units entered in the Interim Property Register
   "may be disposed of by way of sale, mortgage, or any other legal
   disposition". That is a statutory right attaching to the registration,
   not a concession the developer grants, and it is the reason Article 11 is
   the branch of last resort rather than the only branch.

   What it costs is the part no page computes. The agency commission on an
   assignment is charged on the value the unit transfers at, not on the cash
   that changes hands, and the seller has typically paid a fifth of that
   value. So the premium he needs just to come out level is a figure set by
   the whole price while the capital it is measured against is a fraction of
   it -- which makes the break-even premium small as a share of the price and
   large as a share of his own money, and twice as large at 10% paid as at
   20%. Nothing about the market decides that. The share paid does.

   Solved rather than ratioed, for the same reason the selling page solves
   its break-even: the commission is charged on the price including the
   premium, so the premium has to cover the commission on itself.

   The developer's administrative cost is deliberately absent from these
   figures, and Article 7 is the reason it can be named rather than guessed.
   It bars any developer fee on a resale except costs the Land Department has
   approved, so the line is bounded by an instrument even though no register
   publishes the bound. Every premium below is therefore a floor. */

export const ASSIGNMENT_SHARES = [0.10, 0.20, 0.40, 0.60];

/* The rate the exit commission is actually charged at: the agency rate the
   rest of the site uses, grossed up for VAT, both taken from the acquisition
   module so the entry and exit pages cannot disagree. */
export function assignmentExitRate() {
  return EXAMPLE.agencyRate * (1 + FEES.vatRate);
}

export function assignment(price = EXAMPLE.price, share = 0.20) {
  const rate = assignmentExitRate();
  const premium = Math.round((price * rate) / (1 - rate));
  const paid = Math.round(price * share);
  return {
    price, share, paid, rate, premium,
    transfer: price + premium,
    commission: Math.round((price + premium) * rate),
    ofPrice: Number(((premium / price) * 100).toFixed(2)),
    ofCapital: Number(((premium / paid) * 100).toFixed(2)),
  };
}

export function assignmentGrid(price = EXAMPLE.price, shares = ASSIGNMENT_SHARES) {
  return shares.map((x) => assignment(price, x));
}

export { money };

/* ---- the premium the deferral can bear, and the rate it implies ----

   The present-value section above is true and incomplete in a way the page
   admits in prose and then does not compute: it prices both plans at one
   price. Developers do not. The extended plan carries a higher headline, and
   every page on this query -- including, until now, this one -- says
   "compare them at their quoted prices" without saying what quoted gap
   turns the advantage into a loss.

   It is one number and it is exact. Present value is linear in price, so a
   plan quoted q percent higher has a present value (1 + q) times its value
   at the same price. Setting the two equal:

     PV_A(price) = (1 + q*) x PV_B(price)
     q*          = PV_A / PV_B - 1

   No search, no iteration. q* is the whole of the deferral's worth,
   expressed in the only unit a buyer is quoted in.

   Inverted, it is the figure that answers the question people actually ask.
   A post-handover plan is vendor finance: the developer holds forty per cent
   of the price for four years and charges for it in the headline. The rate
   he is charging is the discount rate at which a premium of q exactly
   cancels the deferral -- which is q* read backwards. That has no closed
   form, because the discount rate sits inside the exponents, so it is
   solved. Bisection rather than Newton: the function is monotone in the
   rate over any range a buyer would use, the bracket is known, and fifty
   bisections on a bracket of two hundred points is a rate good to fourteen
   decimal places. Speed is not the constraint here; being obviously right
   is.

   The two functions are exact inverses, and the suite asserts it both ways.
   That identity is the check that matters: either one drifting away from the
   other would leave the page printing two tables that quietly disagree
   about the same relation, which is worse than printing one. */

export const PREMIUM_RATES = [3, 4, 5, 6, 7, 8, 9, 10];
export const QUOTED_PREMIUMS = [2, 4, 6, 8, 10, 12];

/* The quoted premium, in per cent of the headline price, at which the
   post-handover plan stops being cheaper than the front-loaded one. */
export function premiumBreakEven(price, a, b, annualRatePercent, months) {
  const pvA = planPresentValue(price, a, annualRatePercent, months);
  const pvB = planPresentValue(price, b, annualRatePercent, months);
  return (pvA / pvB - 1) * 100;
}

export function premiumGrid(price = EXAMPLE_PLAN.price, rates = PREMIUM_RATES, plan = EXAMPLE_PLAN) {
  return rates.map((ratePct) => {
    const pvA = planPresentValue(price, plan.a, ratePct, plan.months);
    const pvB = planPresentValue(price, plan.b, ratePct, plan.months);
    const premiumPct = (pvA / pvB - 1) * 100;
    return {
      ratePct,
      pvA: Math.round(pvA),
      pvB: Math.round(pvB),
      premiumPct: Number(premiumPct.toFixed(2)),
      premiumAed: Math.round((premiumPct / 100) * price),
    };
  });
}

/* The annual rate at which a plan quoted `premiumPercent` higher costs
   exactly the same as the front-loaded plan. Below this rate the premium is
   more than the deferral is worth; above it, less. It is the rate the
   developer is charging on the money he lets you keep. */
export function impliedFinanceRate(price, a, b, premiumPercent, months, bracket = 200) {
  const gap = (r) =>
    planPresentValue(price, a, r, months) -
    (1 + premiumPercent / 100) * planPresentValue(price, b, r, months);
  if (premiumPercent <= 0) return 0;
  let lo = 0, hi = bracket;
  if (gap(hi) < 0) return NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (gap(mid) > 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

export function impliedRateGrid(price = EXAMPLE_PLAN.price, premiums = QUOTED_PREMIUMS, plan = EXAMPLE_PLAN) {
  return premiums.map((premiumPct) => ({
    premiumPct,
    premiumAed: Math.round((premiumPct / 100) * price),
    ratePct: Number(impliedFinanceRate(price, plan.a, plan.b, premiumPct, plan.months).toFixed(2)),
  }));
}

/* The rate the refinancing page's illustrative loan carries. Named here, and
   named as illustrative on the page, because the comparison a buyer needs is
   against borrowing rather than against nothing -- and because this site
   holds no dataset of mortgage rates and will not assert a market one. */
export const BORROWING_REFERENCE_RATE = 5.0;
