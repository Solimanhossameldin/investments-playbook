/* The bank's valuation, and the cash it can ask for at the last minute.

   Article 3 of the Central Bank's mortgage regulation caps the loan at a
   percentage of "the value of the property". Resolution 30 of 2013 charges the
   Land Department's registration fee on "the value of the sale contract".
   Those are two different numbers for the same flat, and nothing requires them
   to agree.

   Every page on this site, until now, quietly assumed they did. So does every
   competing page, and so does every mortgage calculator: the loan is computed
   as the band times the price. When the bank's valuer comes in below the agreed
   price the loan is computed on the lower figure, the fee is still computed on
   the higher one, and the difference is cash the buyer finds in the week of
   transfer or loses the purchase.

   This module models that. Three results follow from it and none of them is
   on a competing page.

   The extra cash a shortfall needs is the band times the shortfall, so the
   buyer with the best loan to value band is the one most exposed to a
   down-valuation, not the least. An off-plan buyer at the 50% cap carries half
   the exposure of a first-home buyer at 80%.

   The fee stack does not move. It is indexed to the contract, so a buyer pays
   the full 4% on a price the bank has declined to lend against.

   And the income tests get easier, never harder, because the loan has shrunk.
   A down-valuation can only ever fail a buyer on cash, which is why it is
   survivable with planning and fatal without it.

   What happens if the buyer walks is deliberately absent. The deposit, and
   whether it is forfeit, is a term of the sale contract. No instrument sets
   it, no cap constrains it and no register publishes it, so it is named as
   absent rather than guessed at. */

import * as aq from "./acquisition.mjs";
import * as mg from "./mortgage.mjs";

export const INSTRUMENTS = {
  cbuaeMortgage: {
    name: "Central Bank of the UAE, Regulations Regarding Mortgage Loans (Circular No. 31/2013), Article 3, Important Ratios",
    url: "https://rulebook.centralbank.ae/en/rulebook/article-3-important-ratios",
  },
  feesResolution: {
    name: "Executive Council Resolution No. (30) of 2013 Approving Fees of the Land Department, Article 3 and Schedule",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/ECR%2030%20of%202013.html",
  },
};

/* The two denominators, in the instruments' own words. The page is required to
   carry both, because the whole argument is that they are different. */
export const STATUTORY = [
  { key: "onValue", claim: "maximum 80% of the value of the property", instrument: "cbuaeMortgage" },
  { key: "offPlanOnValue", claim: "the maximum LTV for mortgages on property being purchased off plans is 50% regardless of purpose, value, or category of purchaser", instrument: "cbuaeMortgage" },
  { key: "onContract", claim: "4% of the value of the sale contract", instrument: "feesResolution" },
];

/* The shortfalls tabulated, as a percentage of the agreed price. */
export const SHORTFALLS = [0, 2.5, 5, 7.5, 10];

/* The three bands worth comparing, by the exposure each one carries. */
export const BANDS = [
  { key: "expatFirst", label: "Expatriate, first home below AED 5 million", rate: 0.8 },
  { key: "expatSecond", label: "Expatriate, second or subsequent", rate: 0.6 },
  { key: "offPlan", label: "Anyone, bought off plan", rate: 0.5 },
];

/* One purchase, at one agreed price, with the valuation a given percentage
   below it. Everything the bank decides is computed on the valuation and
   everything the Land Department decides is computed on the price. */
export function close({ price = aq.EXAMPLE.price, shortfallPct = 0, rate = 0.8 } = {}) {
  if (!(shortfallPct >= 0 && shortfallPct < 100))
    throw new Error("valuation: the shortfall must be a percentage at or above zero and below a hundred");
  if (!(rate > 0 && rate <= 1))
    throw new Error("valuation: the loan to value band must be a fraction above zero and at most one");

  const valuation = Math.round(price * (1 - shortfallPct / 100));
  const shortfall = price - valuation;
  /* The cap is on the value, so the lower of the two figures is what the loan
     is computed from. At a zero shortfall this is the price and the model
     reduces to the one every calculator already uses. */
  const base = Math.min(price, valuation);
  const loan = Math.round(base * rate);

  const deposit = price - loan;
  const buying = aq.acquisition({ ...aq.EXAMPLE, price }).total;
  const borrowing = aq.mortgageCosts({ ...aq.EXAMPLE, price, ltv: loan / price }).total;
  const total = deposit + buying + borrowing;

  return {
    price, valuation, shortfall, rate, loan, deposit,
    buying, borrowing, total,
    /* What the headline band turns into once it is measured against the price
       the buyer is actually paying. */
    effectiveLtv: Number(((loan / price) * 100).toFixed(2)),
    cashPct: Number(((total / price) * 100).toFixed(2)),
  };
}

/* The extra cash a shortfall asks for, against the same purchase with the
   valuation at the price. */
export function extra({ price = aq.EXAMPLE.price, shortfallPct = 0, rate = 0.8 } = {}) {
  const at = close({ price, shortfallPct, rate });
  const none = close({ price, shortfallPct: 0, rate });
  const amount = at.total - none.total;
  const noi = aq.operating().net;
  return {
    amount,
    shortfall: at.shortfall,
    /* The band times the shortfall, less the little the smaller loan saves on
       its own registration. Returned so the page can say which way it leans. */
    shareOfShortfall: at.shortfall ? Number(((amount / at.shortfall) * 100).toFixed(1)) : 0,
    ofPrice: Number(((amount / price) * 100).toFixed(2)),
    years: Number((amount / noi).toFixed(2)),
    registrationFee: aq.acquisition({ ...aq.EXAMPLE, price }).lines.find(([k]) => /Land Department/i.test(k))?.[1] ?? null,
  };
}

export function table(price = aq.EXAMPLE.price, rate = 0.8) {
  return SHORTFALLS.map((s) => {
    const c = close({ price, shortfallPct: s, rate });
    const e = extra({ price, shortfallPct: s, rate });
    return { shortfallPct: s, valuation: c.valuation, loan: c.loan, effectiveLtv: c.effectiveLtv, total: c.total, extra: e.amount };
  });
}

/* The same shortfall, across the three bands. The point of this one is the
   ordering: exposure rises with the band, so the best-financed buyer has the
   most cash at risk. */
export function byBand(shortfallPct = 5, price = aq.EXAMPLE.price) {
  return BANDS.map((b) => {
    const e = extra({ price, shortfallPct, rate: b.rate });
    const c = close({ price, shortfallPct, rate: b.rate });
    return { ...b, extra: e.amount, ofPrice: e.ofPrice, effectiveLtv: c.effectiveLtv, total: c.total };
  });
}

/* The shortfall at which the extra cash equals the registration fee, which is
   the comparison the page is built on. Solved rather than read off the table,
   so the sentence cannot drift from the schedule. */
export function matchesRegistrationFee(price = aq.EXAMPLE.price, rate = 0.8) {
  const fee = extra({ price, shortfallPct: 1, rate }).registrationFee;
  if (!fee) throw new Error("valuation: the acquisition stack no longer names a Land Department line to compare against");
  /* extra cash is linear in the shortfall, so one evaluation sets the slope. */
  const at1 = extra({ price, shortfallPct: 1, rate }).amount;
  const pct = Number(((fee / at1)).toFixed(2));
  return { fee, pct, atPct: pct };
}

/* A down-valuation shrinks the loan, so neither income test can bind harder
   than it did. Computed, because the page asserts it. */
export function incomeUnchanged({ price = aq.EXAMPLE.price, rate = 0.8, shortfallPct = 5, stressedRatePct = 6 } = {}) {
  const full = close({ price, shortfallPct: 0, rate });
  const cut = close({ price, shortfallPct, rate });
  /* Rounded to the dirham here rather than in the prose, so the page and the
     module quote the same monthly figure. */
  const round = (n) => ({ ...n, binding: Math.round(n.binding) });
  const needFull = round(mg.incomeNeededFor(full.loan, stressedRatePct));
  const needCut = round(mg.incomeNeededFor(cut.loan, stressedRatePct));
  return {
    full: full.loan, cut: cut.loan,
    incomeFull: needFull, incomeCut: needCut,
    /* `binding` is the larger of the two income tests, which is the one the
       applicant actually has to clear. */
    easier: needCut.binding < needFull.binding,
    savedMonthly: Math.round(needFull.binding - needCut.binding),
  };
}

export const money = aq.money;
