/* Moving a Dubai mortgage to another bank, priced from the instruments.

   Every page on this query is a broker's enquiry form with a paragraph above
   it, and all of them stop at the same sentence: the early settlement fee is
   one per cent of the outstanding balance, or AED 10,000, whichever is less.
   That sentence is true and it is less than half of the cost.

   Three things fall out of reading the schedules rather than listing one fee.

   The fee everyone writes about is capped in dirhams, so above a balance this
   module derives it stops being a percentage at all. At the ceiling the
   charge is flat, and the larger the loan the smaller a share of it the
   charge takes. The fee borrowers fear most is regressive.

   The cost nobody writes about is the registration. Executive Council
   Resolution No. (30) of 2013 prices "Transferring a mortgage" at the same
   0.25% of the debt as registering one, so there is no cheap transfer route
   through the Land Department: the old mortgage is discharged and a mortgage
   is registered, each at its own published fee, with a trustee on top. On the
   illustrative loan that side is 45% of the bill, and no page on this query
   mentions it at all.

   And the advice follows from the arithmetic rather than the other way round.
   Against the whole switching stack, half a point of rate takes over five
   years to repay on a twenty-five year term. The gap that pays for itself
   inside a year is nearer three points than one, and this module solves for
   it rather than asserting it. */

import * as aq from "./acquisition.mjs";
import * as dp from "./disposal.mjs";
import * as mg from "./mortgage.mjs";

export const INSTRUMENTS = {
  cbuaeTransfer: {
    name: "Central Bank of the UAE, Regulations Regarding Bank Loans & Other Services Offered to Individual Customers, Article 20(2), as added by the amendment of page (14), Circular No. 2705/2012",
    url: "https://rulebook.centralbank.ae/en/rulebook/amendment-page-14-regulations-regarding-bank-loans-other-services-offered-individual",
  },
};

/* The instrument's own words. This is the clause that makes the ceiling a
   borrower's right rather than a concession, and no competing page cites it. */
export const STATUTORY = [
  { key: "transferRight", claim: "Any borrower may transfer his loan / finance from any bank or finance company operating in the UAE", instrument: "cbuaeTransfer" },
  { key: "transferFeeCap", claim: "against paying of an early payment fee not exceeding 1% of the outstanding balance of the loan", instrument: "cbuaeTransfer" },
];

/* Executive Council Resolution No. (30) of 2013, Schedule, the two mortgage
   rows this page turns on. Quoted so the page cannot drift from them, and
   kept out of INSTRUMENTS because the net rental yield page already registers
   that resolution: the law register is keyed on the instrument, and one
   instrument belongs to one page in it. */
export const SCHEDULE_ROWS = {
  transferring: "0.25% of the mortgage (debt) value",
  discharging: "AED 1,000.00",
};

/* The illustrative borrower is the buyer of the net rental yield page at the
   loan the mortgage capacity page qualifies them for: the same one bedroom at
   AED 1,500,000 on the 75% the mortgage calculator defaults to. Keeping the
   property and the loan identical is what lets this page be added to the
   others instead of read beside them. */
export const BORROWER = {
  balance: Math.round(aq.EXAMPLE.price * aq.EXAMPLE.ltv),
  years: mg.CAPS.maxTermYears,
};

/* The balance at which the dirham ceiling overtakes the percentage. Taken
   from the disposal module rather than recomputed, so the two pages cannot
   disagree about the only threshold either of them prints. */
export const capBindsAt = dp.capBindsAt;

/* What the bank may charge to let the loan go. Appendix 2 is a table of
   ceilings and says so, and it says it is exclusive of VAT, so the VAT line
   is shown separately rather than folded in. */
export function bankLines(balance = BORROWER.balance) {
  const lines = [
    ["Early settlement fee, capped", dp.earlySettlement(balance)],
    ["Issuance of liability letter", dp.CAPS.liabilityLetter],
    ["Clearance letter", dp.CAPS.clearanceLetter],
    ["Issuance of NOC", dp.CAPS.bankNoc],
  ];
  const subtotal = lines.reduce((a, [, v]) => a + v, 0);
  const vat = Math.round(subtotal * aq.FEES.vatRate);
  return { lines, subtotal, vat, total: subtotal + vat };
}

/* Discharging the mortgage that exists. The standalone release application,
   not the mortgaged-sale procedure: nothing is being sold, so the AED 1,290
   procedure fee and the same-day registrar exemption on the selling well
   page do not apply here. */
export function dischargeLines() {
  const lines = [
    ["Discharging a mortgage", dp.DLD_EXIT.removalStandalone],
    ["Title deed certificate", aq.FEES.titleDeed],
    ["Knowledge fee", aq.FEES.knowledge],
    ["Innovation fee", aq.FEES.innovation],
    ["Land Department service partner, with VAT", Math.round(dp.DLD_EXIT.removalPartner * (1 + aq.FEES.vatRate))],
  ];
  return { lines, total: lines.reduce((a, [, v]) => a + v, 0) };
}

/* Registering the mortgage that replaces it. Row 12 of the Schedule prices
   transferring a mortgage at the same rate as row 10 prices registering one,
   which is why this side cannot be avoided by asking for a transfer. */
export function registrationLines(balance = BORROWER.balance) {
  const lines = [
    ["Transferring a mortgage, 0.25% of the debt", Math.round(balance * aq.FEES.mortgageRate)],
    ["Registration trustee, with VAT", Math.round(aq.FEES.mortgageTrustee * (1 + aq.FEES.vatRate))],
    ["Title deed certificate", aq.FEES.titleDeed],
    ["Knowledge and innovation fees", aq.FEES.knowledge + aq.FEES.innovation],
  ];
  return { lines, total: lines.reduce((a, [, v]) => a + v, 0) };
}

/* The whole switching cost, as a ceiling on the lines that have one. The
   arrangement fee and the bank's valuation fee are deliberately absent:
   Appendix 2 publishes no cap on either, this site holds no dataset for
   them, and a page that guessed at them would be doing the thing this page
   exists to argue against. The total is therefore a floor on what switching
   costs, assembled entirely from published figures. */
export function switchingCost(balance = BORROWER.balance) {
  const bank = bankLines(balance);
  const discharge = dischargeLines();
  const registration = registrationLines(balance);
  const total = bank.total + discharge.total + registration.total;
  return {
    bank, discharge, registration, total,
    ratePct: Number(((total / balance) * 100).toFixed(2)),
    bankSharePct: Number(((bank.total / total) * 100).toFixed(1)),
    landSharePct: Number((((discharge.total + registration.total) / total) * 100).toFixed(1)),
  };
}

/* The balances the fee-share table is computed at, straddling the ceiling so
   the table shows it binding rather than asserting that it does. */
export const BALANCES = [500000, 800000, 1000000, 1125000, 2000000, 3000000, 5000000];

export function feeShareTable() {
  return BALANCES.map((balance) => {
    const fee = dp.earlySettlement(balance);
    return {
      balance,
      fee,
      sharePct: Number(((fee / balance) * 100).toFixed(2)),
      capped: dp.capped(balance),
    };
  });
}

/* The monthly saving from the rate alone. The term is held at the same
   number of years on both sides, because a refinance that also resets the
   term mixes a cheaper rate with a longer amortisation and the reader cannot
   tell which produced the smaller payment. The annuity comes from the
   mortgage module, so the two pages agreeing is evidence rather than a
   restatement. */
export function monthlySaving({ balance = BORROWER.balance, fromRatePct, toRatePct, years = BORROWER.years } = {}) {
  return mg.paymentFromLoan(balance, fromRatePct, years) - mg.paymentFromLoan(balance, toRatePct, years);
}

export function breakEvenMonths({ balance = BORROWER.balance, fromRatePct, toRatePct, years = BORROWER.years } = {}) {
  const saving = monthlySaving({ balance, fromRatePct, toRatePct, years });
  if (saving <= 0) return Infinity;
  return switchingCost(balance).total / saving;
}

/* The rate gap that recovers the switching cost inside a given number of
   months. Solved by bisection on the gap, in the same style as the mortgage
   module's crossover rate and for the same reason: the annuity factor cannot
   be inverted in closed form, and a figure this page's argument rests on
   should be derived rather than typed. */
export function gapForBreakEvenMonths(months, fromRatePct, { balance = BORROWER.balance, years = BORROWER.years } = {}) {
  let lo = 0, hi = fromRatePct;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    const m = breakEvenMonths({ balance, fromRatePct, toRatePct: fromRatePct - mid, years });
    if (m > months) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

/* The rate moves the break-even table is computed at. The first is the half
   point every broker page recommends switching for. */
export const RATE_MOVES = [[5, 4.5], [5, 4], [4.5, 4], [5.5, 4], [4.25, 4]];

export function breakEvenTable(balance = BORROWER.balance, years = BORROWER.years) {
  return RATE_MOVES.map(([fromRatePct, toRatePct]) => ({
    fromRatePct,
    toRatePct,
    saving: Math.round(monthlySaving({ balance, fromRatePct, toRatePct, years })),
    months: Number(breakEvenMonths({ balance, fromRatePct, toRatePct, years }).toFixed(1)),
  }));
}

/* The rates the gap table is computed from, and the horizons a borrower
   actually thinks in: one year, two, and five. */
export const GAP_FROM_RATES = [4.5, 5, 5.5, 6];
export const GAP_HORIZONS = [12, 24, 60];

export function gapTable(balance = BORROWER.balance, years = BORROWER.years) {
  return GAP_FROM_RATES.map((fromRatePct) => ({
    fromRatePct,
    gaps: GAP_HORIZONS.map((months) => Number(gapForBreakEvenMonths(months, fromRatePct, { balance, years }).toFixed(2))),
  }));
}

export const money = (n) => Number(Math.round(n)).toLocaleString("en-US");
export const pctText = (n) => `${Number(n).toFixed(2)}%`;
