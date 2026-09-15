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

import { EXAMPLE, money } from "./acquisition.mjs";

export const INSTRUMENTS = {
  law19: {
    name: "Law No. (19) of 2020 Amending Law No. (13) of 2008 Regulating the Interim Real Property Register in the Emirate of Dubai, Article 11",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2020/Law%20No.%20(19)%20of%202020%20Amending%20Law%20No.%20(13)%20of%202008%20Regulating%20the%20Interim%20Real%20Property%20Register%20in%20the%20Emirate%20of%20Dubai.html",
  },
  law13: {
    name: "Law No. (13) of 2008 Regulating the Interim Real Property Register in the Emirate of Dubai, Article 3",
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

export { money };
