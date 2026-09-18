/* What a Dubai flat yields after the tax charged by the country the owner
   lives in, which is the half of the question every page on it leaves out.

   Two literatures, again, and again they never meet. The Dubai brokerage
   pages print the fee schedule and say "0% income tax, 0% capital gains
   tax", and stop there. The London accountancy pages say a UK resident is
   taxable on worldwide income and that a treaty exists, and print no number
   at all. Nobody runs the rent through both.

   The join is where the finding is, and it is in the treaty's own drafting.
   Article 6 lets the state the building sits in tax the rent. Article 21
   then relieves the UK resident by crediting "United Arab Emirates tax
   payable". The United Arab Emirates levies no personal income tax on
   residential rent, so nothing is payable, so the credit is nil and the UK
   charge stands in full. The relief article is live, correctly drafted, and
   worth nothing. The absence of a Dubai tax is not merely useless to a UK
   resident; it is the precise reason the treaty cannot help him.

   What that costs, on the same illustrative one bedroom the net rental
   yield page prices: a higher rate taxpayer's net yield falls from 4.33%
   to 2.60%. That is 1.73 percentage points a year, against the 0.28 points
   the entire transaction stack takes once. The line nobody prints is six
   times the size of the line everybody negotiates, and it recurs.

   The arithmetic here is deliberately rate-based, so it needs no exchange
   rate and cannot go stale on one. Which band applies depends on the
   owner's sterling income, and that is the reader's fact, not this page's. */

import * as aq from "./acquisition.mjs";

export const INSTRUMENTS = {
  ukUaeDtc: {
    name: "Convention between the United Kingdom and the United Arab Emirates for the avoidance of double taxation, signed 12 April 2016, in force",
    url: "https://www.gov.uk/government/publications/united-arab-emirates-tax-treaties/2016-uk-uae-double-taxation-convention",
  },
  ukRates: {
    name: "HM Government, Income Tax rates and Personal Allowances, tax year 6 April 2026 to 5 April 2027",
    url: "https://www.gov.uk/income-tax-rates",
  },
  financeCosts: {
    name: "HM Revenue and Customs, Tax relief for residential landlords: how it's worked out",
    url: "https://www.gov.uk/guidance/changes-to-tax-relief-for-residential-landlords-how-its-worked-out-including-case-studies",
  },
  figRegime: {
    name: "HM Revenue and Customs, Check if you can claim the 4-year foreign income and gains regime",
    url: "https://www.gov.uk/guidance/check-if-you-can-claim-the-4-year-foreign-income-and-gains-regime",
  },
};

/* Claims the page carries word for word, in the instrument's own wording.
   The two that do the work are the Article 6 permission and the Article 21
   credit: read together they are the whole argument, and neither appears on
   any competing page. */
export const STATUTORY = [
  { key: "art6", claim: "situated in the other Contracting State may be taxed in that other State", instrument: "ukUaeDtc" },
  { key: "art21", claim: "shall be allowed as a credit against any United Kingdom tax computed by reference to the same profits, income or chargeable gains", instrument: "ukUaeDtc" },
  { key: "art2", claim: "in the case of the United Arab Emirates: (i) the income tax; (ii) the corporate tax", instrument: "ukUaeDtc" },
  { key: "reducer", claim: "The reduction is the basic rate value (currently 20%) of the lower of", instrument: "financeCosts" },
  { key: "figYears", claim: "still within your first 4 years as a UK tax resident following at least a 10-year period as a non-UK tax resident", instrument: "figRegime" },
  { key: "figProperty", claim: "profits of an overseas property business", instrument: "figRegime" },
];

/* The 2026 to 2027 bands, as the rates page prints them. `floor` is the
   first pound taxed at that rate. The personal allowance is carried because
   claiming the four year regime forfeits it, which is the trade the last
   section of the page prices. */
export const UK = {
  personalAllowance: 12570,
  basicRateValue: 0.20,
  bands: [
    { key: "basic",      name: "Basic rate",      rate: 0.20, floor: 12571,  ceiling: 50270 },
    { key: "higher",     name: "Higher rate",     rate: 0.40, floor: 50271,  ceiling: 125140 },
    { key: "additional", name: "Additional rate", rate: 0.45, floor: 125141, ceiling: null },
  ],
};

export const band = (key) => UK.bands.find((b) => b.key === key);

/* The rent as a top slice on an owner who already has UK income in the band.
   That is the ordinary case and the only one a page can model without
   knowing the reader's other income, which is why the page says so. */
export function ukTaxOn(profit, key) {
  const b = band(key);
  if (!b) throw new Error(`no such band: ${key}`);
  return Math.round(profit * b.rate);
}

/* The same yields the net rental yield page computes, charged at a band.
   `noi` is that page's net operating income and `outlay` its price plus
   acquisition stack, so the two pages cannot drift apart: both come from
   acquisition.mjs rather than from a figure typed here. */
export function afterTax(key, i = aq.EXAMPLE) {
  const y = aq.yields(i);
  const tax = ukTaxOn(y.noi, key);
  const kept = y.noi - tax;
  const pct = (n) => Number((n * 100).toFixed(2));
  return {
    band: band(key),
    noi: y.noi,
    tax,
    kept,
    onPrice: pct(kept / i.price),
    net: pct(kept / y.outlay),
    /* Points of net yield the charge takes, against the untaxed 4.33%. */
    cost: Number((y.net - pct(kept / y.outlay)).toFixed(2)),
  };
}

export function grid(i = aq.EXAMPLE) {
  return UK.bands.map((b) => afterTax(b.key, i));
}

/* The comparison the page is built on. The transaction stack is a one off
   and the tax is annual, so the ratio is stated as what it is rather than
   as a like for like: it is the recurrence that makes it the larger number,
   and saying so is the difference between an argument and a slogan. */
export function againstTransactionStack(key = "higher", i = aq.EXAMPLE) {
  const d = aq.drag(i);
  const t = afterTax(key, i);
  return {
    taxPoints: t.cost,
    transactionPoints: d.transaction,
    runningPoints: d.running,
    ratio: Number((t.cost / d.transaction).toFixed(1)),
  };
}

/* Interest on a loan against a residential letting is not deducted from the
   profit; relief arrives instead as a reduction of the tax bill at the basic
   rate value. For anyone above the basic rate that is a real cost, and it
   is the gap between his own rate and the basic rate, applied to the
   interest. Below the basic rate it is nil, which is why the function
   returns a floor of zero rather than a negative saving. */
export function financeCostGap(interest, key) {
  const b = band(key);
  if (!b) throw new Error(`no such band: ${key}`);
  const gap = Math.max(0, b.rate - UK.basicRateValue);
  return { gap: Number(gap.toFixed(2)), cost: Math.round(interest * gap) };
}

export const money = aq.money;
export const pctText = aq.pctText;
