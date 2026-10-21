/* Mortgage capacity in Dubai, and the three caps the regulation actually sets.

   Every page on this query says the same thing: there are two tests, a loan
   to value cap and a debt burden ratio, and your capacity is the lower. The
   better ones print the percentages. None of them reads Article 3.

   Article 3 of the Central Bank's mortgage regulations sets seven things,
   and three of them cap the size of the loan, not two. Alongside the loan to
   value bands and the fifty per cent debt burden ratio there is a maximum
   financing amount expressed as a multiple of annual income: seven years for
   an expatriate, eight for a national. It is quoted on the better competing
   pages and operative on almost none of them, and the arithmetic below says
   exactly when.

   Two findings fall out of computing rather than listing.

   The income multiple is almost never the binding cap. The same article
   requires the payment to be stress tested at two to four percentage points
   above the contract rate, and above a stressed rate this module solves for,
   the debt burden ratio caps the loan below the income multiple. Below that
   rate the multiple binds. The regulation's own stress test is what decides
   which of its own caps applies, and the crossover is a number.

   And the deposit is not the deposit. The loan to value cap is a percentage
   of the property's value; the registration, agency, trustee and mortgage
   fees sit on top of it and cannot be borrowed. On the same illustrative
   flat the net rental yield page uses, the advertised twenty per cent is
   nearly twenty-seven per cent in cash. */

import * as aq from "./acquisition.mjs";

export const INSTRUMENTS = {
  cbuaeMortgage: {
    name: "Central Bank of the UAE, Regulations Regarding Mortgage Loans (Circular No. 31/2013), Article 3, Important Ratios, consolidated version of 8 April 2020",
    url: "https://rulebook.centralbank.ae/en/rulebook/article-3-important-ratios",
  },
  cbuaeDisclosure: {
    name: "Central Bank of the UAE, Regulations Regarding Mortgage Loans (Circular No. 31/2013), Article 4, Disclosure and Transparency",
    url: "https://rulebook.centralbank.ae/en/rulebook/article-4-disclosure-and-transparency",
  },
};

/* Claims the page has to carry word for word, each with the instrument that
   sets it. The wording is the regulation's own, not a paraphrase of it. */
export const STATUTORY = [
  { key: "dbr", claim: "50 percent of gross salary and any regular income from a defined and specific source at any time", instrument: "cbuaeMortgage" },
  { key: "ltvExpatFirst", claim: "maximum 80% of the value of the property", instrument: "cbuaeMortgage" },
  { key: "ltvExpatSecond", claim: "60% of the value of the property, regardless of value", instrument: "cbuaeMortgage" },
  { key: "ltvOffPlan", claim: "the maximum LTV for mortgages on property being purchased off plans is 50% regardless of purpose, value, or category of purchaser", instrument: "cbuaeMortgage" },
  { key: "term", claim: "The maximum tenor of the mortgage loan is 25 years", instrument: "cbuaeMortgage" },
  { key: "incomeMultiple", claim: "Expatriates: up to 7 years annual income", instrument: "cbuaeMortgage" },
  { key: "stress", claim: "stress test the loan at (2 to 4) percentage points above the current rate of interest on the loan", instrument: "cbuaeMortgage" },
  { key: "rentalDeduction", claim: "make a deduction of at least two months' rental income from the DBR calculation", instrument: "cbuaeMortgage" },
  { key: "eosb", claim: "The use of 'End of Service Benefit' is not allowed", instrument: "cbuaeMortgage" },
  { key: "retirement", claim: "serviced at a DBR of 50 percent of the borrower's post retirement income", instrument: "cbuaeMortgage" },
  { key: "lifetimeCost", claim: "Borrowers should be provided with information setting out the total cost of the loan during its lifetime", instrument: "cbuaeDisclosure" },
];

/* Article 3, as rates rather than as prose. The loan to value bands are
   reproduced as the article drafts them, including the asymmetry at exactly
   AED 5 million, which is not a transcription error: the nationals' bands
   read "less or equal to" and the expatriates' bands read "less than". */
export const CAPS = {
  dbr: 0.50,                       // Article 3.1, via Regulation No. 29/2011
  stressLowPoints: 2,              // Article 3.1
  stressHighPoints: 4,             // Article 3.1
  rentalDeductionMonths: 2,        // Article 3.1, investment properties
  maxTermYears: 25,                // Article 3.3
  incomeYears: { expatriate: 7, national: 8 },   // Article 3.4
  bandPrice: 5000000,              // Article 3.2
  ltv: {
    national:   { firstAtOrBelowBand: 0.85, firstAboveBand: 0.75, subsequent: 0.65 },
    expatriate: { firstBelowBand: 0.80, firstAboveBand: 0.70, subsequent: 0.60 },
    offPlan: 0.50,                 // Article 3.2.C, all categories
  },
};

/* The loan to value ceiling for a completed property. Off-plan is handled
   separately because Article 3.2.C overrides every other band. */
export function ltvCapRate({ status = "expatriate", first = true, price = aq.EXAMPLE.price, offPlan = false } = {}) {
  if (offPlan) return CAPS.ltv.offPlan;
  const b = CAPS.ltv[status];
  if (!b) throw new Error(`mortgage: no loan to value band for "${status}"`);
  if (!first) return b.subsequent;
  if (status === "national") return price <= CAPS.bandPrice ? b.firstAtOrBelowBand : b.firstAboveBand;
  return price < CAPS.bandPrice ? b.firstBelowBand : b.firstAboveBand;
}

/* The present value of one dirham a month for n months at a monthly rate.
   Written out rather than taken from the calculator, so that the module and
   the calculator agreeing is evidence rather than a restatement. */
export function annuityFactor(annualRatePct, years = CAPS.maxTermYears) {
  const r = annualRatePct / 100 / 12;
  const n = Math.round(years * 12);
  if (r === 0) return n;
  return (1 - Math.pow(1 + r, -n)) / r;
}

export function loanFromPayment(payment, annualRatePct, years = CAPS.maxTermYears) {
  return payment * annuityFactor(annualRatePct, years);
}

export function paymentFromLoan(loan, annualRatePct, years = CAPS.maxTermYears) {
  return loan / annuityFactor(annualRatePct, years);
}

/* The three caps Article 3 puts on the size of the loan, side by side, and
   the one that actually decides. `stressedRatePct` is the rate the payment
   is qualified at, which the article requires to be two to four points above
   the rate on the loan. */
export function caps({
  price = aq.EXAMPLE.price,
  monthlyIncome,
  otherMonthlyDebt = 0,
  stressedRatePct,
  years = CAPS.maxTermYears,
  status = "expatriate",
  first = true,
  offPlan = false,
} = {}) {
  const rate = ltvCapRate({ status, first, price, offPlan });
  const byValue = Math.round(price * rate);
  const roomForPayment = Math.max(0, monthlyIncome * CAPS.dbr - otherMonthlyDebt);
  const byIncomeFlow = Math.round(loanFromPayment(roomForPayment, stressedRatePct, years));
  const byIncomeStock = Math.round(monthlyIncome * 12 * CAPS.incomeYears[status]);
  const loan = Math.min(byValue, byIncomeFlow, byIncomeStock);
  const names = [["the loan to value cap", byValue], ["the debt burden ratio", byIncomeFlow], ["the income multiple", byIncomeStock]];
  const binding = names.find(([, v]) => v === loan)[0];
  return { ltvRate: rate, byValue, byIncomeFlow, byIncomeStock, loan, binding, roomForPayment };
}

/* The monthly income at which each of the two income caps first reaches a
   given loan. The debt burden ratio answer moves with the stressed rate; the
   income multiple answer does not move at all. */
export function incomeNeededFor(loan, stressedRatePct, years = CAPS.maxTermYears, status = "expatriate") {
  const byFlow = paymentFromLoan(loan, stressedRatePct, years) / CAPS.dbr;
  const byStock = loan / CAPS.incomeYears[status] / 12;
  return { byFlow: Math.round(byFlow), byStock: Math.round(byStock), binding: Math.max(byFlow, byStock) };
}

/* The stressed rate at which the debt burden ratio and the income multiple
   cap the same loan. Above it the ratio binds, below it the multiple does.
   Both caps are proportional to income, so the crossover depends on the term
   and the multiple alone and not on the income or the price: it is the rate
   at which the annuity factor equals twelve times the multiple divided by
   the ratio. Solved rather than rearranged, because the annuity factor
   cannot be inverted in closed form. */
export function crossoverRatePct(years = CAPS.maxTermYears, status = "expatriate") {
  const target = (CAPS.incomeYears[status] * 12) / CAPS.dbr;   // the annuity factor that equates them
  let lo = 0.0001, hi = 40;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    if (annuityFactor(mid, years) > target) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/* The rates the minimum-income table is computed at. Chosen to straddle the
   crossover so the table shows the swap rather than asserting it. */
export const STRESSED_RATES = [5, 6, 7, 8, 9];

export function incomeTable(price = aq.EXAMPLE.price, opts = {}) {
  const rate = ltvCapRate({ price, ...opts });
  const loan = Math.round(price * rate);
  return STRESSED_RATES.map((r) => {
    const n = incomeNeededFor(loan, r, opts.years || CAPS.maxTermYears, opts.status || "expatriate");
    return {
      ratePct: r,
      payment: Math.round(paymentFromLoan(loan, r, opts.years || CAPS.maxTermYears)),
      byFlow: n.byFlow,
      byStock: n.byStock,
      binds: n.byFlow >= n.byStock ? "the debt burden ratio" : "the income multiple",
    };
  });
}

/* What the buyer has to have in the bank on the day, against what the
   advertisement calls the deposit. The acquisition stack is the net rental
   yield page's, unchanged, plus the second registration the mortgage itself
   needs. Neither can be borrowed: the cap is a percentage of the value of
   the property, and the fees are not the property. */
export function cashToClose({ price = aq.EXAMPLE.price, offPlan = false, status = "expatriate", first = true } = {}) {
  const rate = ltvCapRate({ status, first, price, offPlan });
  const loan = Math.round(price * rate);
  const deposit = price - loan;
  const buying = aq.acquisition({ ...aq.EXAMPLE, price });
  const borrowing = aq.mortgageCosts({ ...aq.EXAMPLE, price, ltv: rate });
  const total = deposit + buying.total + borrowing.total;
  return {
    ltvRate: rate,
    loan,
    deposit,
    buying: buying.total,
    borrowing: borrowing.total,
    total,
    advertisedPct: Math.round((1 - rate) * 10000) / 100,
    actualPct: Math.round((total / price) * 10000) / 100,
    gapPoints: Math.round(((total - (price - Math.round(price * rate))) / price) * 10000) / 100,
  };
}

/* Article 3.1 requires at least two months' rental income to be deducted
   before an investment property's rent is credited in the ratio. The share
   that survives is a property of the year, not of the rent. */
export function countableRent(rent = aq.EXAMPLE.rent) {
  const months = 12 - CAPS.rentalDeductionMonths;
  return { months, share: months / 12, amount: Math.round((rent * months) / 12), deducted: Math.round((rent * CAPS.rentalDeductionMonths) / 12) };
}

export const money = (n) => Number(Math.round(n)).toLocaleString("en-US");
export const pctText = (n) => `${Number(n).toFixed(2)}%`;

/* ---- the break-even mortgage rate ----

   Every page on cash-versus-mortgage states the same rule: borrow when the
   rental yield beats the mortgage rate. The rule is the right shape and
   every published version of it uses the wrong yield, because the two sides
   of the comparison do not have the same denominator.

   The cash buyer's money is the price plus the whole acquisition stack. The
   borrower's money is the deposit plus that same stack plus the mortgage's
   own registration, trustee and title deed. Those fees cannot be borrowed --
   the loan to value cap is a percentage of the value of the property, and a
   fee is not the property -- so they sit in the borrower's denominator and
   in nobody's loan. Setting the two returns equal and solving gives a
   threshold rate, and the algebra collapses to one line:

     break-even rate = net yield on total cash outlay
                       x (1 - mortgage fees / loan)

   Two things fall out of that form.

   The threshold is BELOW every yield a reader is offered. Gross yield
   overstates it by the running costs; net yield on the price alone still
   overstates it by the acquisition stack; and even net yield on total outlay
   overstates it, by the mortgage's own fees. Between the threshold and the
   nearest published yield there is a band of mortgage rates where the
   standard advice says borrow and the arithmetic says borrowing lowers the
   return on the buyer's own money.

   And the threshold barely moves with the size of the loan. The first factor
   does not contain the loan at all; the second contains it only through the
   fixed part of the mortgage fee schedule, spread over a larger balance. A
   buyer who borrows more does not get a more forgiving break-even rate, which
   is the opposite of how leverage is usually described. */

export const LEVERAGE_RATES = [3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0];

/* The return on the buyer's own money, both ways, at one interest rate.
   Interest only: a repayment instalment also returns capital, which is
   saving and not cost, and netting it against income would overstate the
   drag. The page says so in as many words. */
export function leverage(ratePct, i = aq.EXAMPLE) {
  const o = aq.operating(i);
  const a = aq.acquisition(i);
  const m = aq.mortgageCosts(i);
  const cashIn = i.price + a.total;
  const equityIn = i.price - m.loan + a.total + m.total;
  const interest = (ratePct / 100) * m.loan;
  const pct = (n) => Number((n * 100).toFixed(2));
  return {
    ratePct,
    loan: m.loan,
    cashIn,
    equityIn,
    interest: Math.round(interest),
    afterInterest: Math.round(o.net - interest),
    cashReturn: pct(o.net / cashIn),
    leveredReturn: pct((o.net - interest) / equityIn),
    leverageHelps: (o.net - interest) / equityIn > o.net / cashIn,
  };
}

/* The rate at which the two returns are equal, the yields a reader might
   wrongly compare against it, and the band between. */
export function breakEvenRate(i = aq.EXAMPLE) {
  const o = aq.operating(i);
  const a = aq.acquisition(i);
  const m = aq.mortgageCosts(i);
  const y = aq.yields(i);
  const cashIn = i.price + a.total;
  const equityIn = i.price - m.loan + a.total + m.total;
  const cashReturn = o.net / cashIn;
  const rate = (o.net - cashReturn * equityIn) / m.loan;
  const pct = (n) => Number((n * 100).toFixed(2));
  /* The same number by the closed form. The two agreeing is the check that
     the derivation in the comment above is the one the grid is built on. */
  const closed = cashReturn * (1 - m.total / m.loan);
  return {
    ratePct: pct(rate),
    closedFormPct: pct(closed),
    /* The interest and the income after it AT THE EXACT threshold, not at
       the threshold rounded to two places. At a printed 4.30% the return
       comes out a point of a basis point above the cash return, so a table
       row that prints the rounded rate beside unrounded money has to take
       its money from here or the row will not reconcile. */
    interestAtRate: Math.round(rate * m.loan),
    afterInterestAtRate: Math.round(o.net - rate * m.loan),
    cashReturnPct: pct(cashReturn),
    grossPct: y.gross,
    onPricePct: y.onPrice,
    netPct: y.net,
    /* How far each published yield overstates the threshold, in points. */
    overstatedByGross: Number((y.gross - pct(rate)).toFixed(2)),
    overstatedByOnPrice: Number((y.onPrice - pct(rate)).toFixed(2)),
    overstatedByNet: Number((y.net - pct(rate)).toFixed(2)),
    /* The rate at which the rent stops covering the interest at all. Past
       this the shortfall is funded from salary, whatever the asset does. */
    coverLostPct: pct(o.net / m.loan),
    loan: m.loan,
    equityIn,
    cashIn,
    mortgageFees: m.total,
    noi: o.net,
  };
}

/* The threshold against the size of the loan, which is the claim that it
   hardly moves. Reported for the loan to value bands a completed purchase
   can actually use. */
export const LEVERAGE_LTVS = [0.50, 0.60, 0.70, 0.75, 0.80];

export function breakEvenByLtv(i = aq.EXAMPLE) {
  return LEVERAGE_LTVS.map((ltv) => {
    const b = breakEvenRate({ ...i, ltv });
    return { ltv: Math.round(ltv * 100), loan: b.loan, equityIn: b.equityIn, ratePct: b.ratePct };
  });
}
