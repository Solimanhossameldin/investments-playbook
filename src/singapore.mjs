/* Dubai against Singapore, for the owner the comparison is usually made for:
   somebody who lives in Dubai, is not a Singapore citizen, and is deciding
   where the next flat goes.

   The pages ranking on this query all lead with the 60% additional buyer's
   stamp duty and then stop doing arithmetic. The most thorough of them
   prints a net yield for each city, but it still gives the seller's stamp
   duty as a three-year charge of up to 12%, which stopped being true on
   4 July 2025, and none of them runs the two annual lines a foreign owner
   in Singapore pays every year the flat is let: property tax on the annual
   value at the non-owner-occupied rates, and income tax on the rent at the
   non-resident rate.

   The method is the London page's. The same money goes into each city,
   converted at published rates, and the Singapore flat is given exactly
   the Dubai unit's gross yield and exactly its running cost ratio. That
   removes every difference that is a matter of opinion, so what is left is
   what the two governments set. It flatters Singapore twice over, on yield
   and on the entry costs left out, and the page says so.

   The finding is the solve at the bottom: the gross yield a Singapore flat
   would need, after the stamp duty and the two annual taxes, to leave a
   foreign owner with what the Dubai flat leaves at 7%. It is solved, not
   rounded into existence, and the check is the residual. */

import * as aq from "./acquisition.mjs";

export const INSTRUMENTS = {
  absd: {
    name: "Monetary Authority of Singapore, Measures for a sustainable property market, 26 April 2023",
    url: "https://www.mas.gov.sg/news/media-releases/2023/measures-for-a-sustainable-property-market",
  },
  bsd: {
    name: "Inland Revenue Authority of Singapore, Budget 2023: overview of tax changes (buyer's stamp duty)",
    url: "https://www.iras.gov.sg/docs/default-source/budget-2023/budget-2023---overview-of-tax-changes12806ded-99dd-46c4-a371-8dd63f059ed7.pdf?sfvrsn=a07681c8_5",
  },
  ssd: {
    name: "Ministry of Finance, Singapore, Extension of the holding period of seller's stamp duty and higher SSD rates for residential properties, 3 July 2025",
    url: "https://www.mof.gov.sg/news-publications/press-releases/extension-of-the-holding-period-of-seller-s-stamp-duty-(ssd)-and-higher-ssd-rates-for-residential-properties",
  },
  basis: {
    name: "Ministry of Finance, Singapore, Stamp duty",
    url: "https://www.mof.gov.sg/policies/taxes/stamp-duty/",
  },
  fta: {
    name: "Ministry of Finance, Singapore, Tax concessions given to foreign nationals or entities through free trade agreements, 16 September 2013",
    url: "https://www.mof.gov.sg/news-resources/newsroom/tax-concessions-given-to-foreign-nationals-or-entities-through-free-trade-agreements/",
  },
  ptax: {
    name: "Inland Revenue Authority of Singapore, Budget 2022: overview of tax changes (property tax and non-resident rates)",
    url: "https://www.iras.gov.sg/docs/default-source/budget-2022/budget-2022---overview-of-tax-changes69937d71-ba59-4b39-b1e5-7e85b2504e1c.pdf?sfvrsn=8339ba5a_5",
  },
  av: {
    name: "Inland Revenue Authority of Singapore, How does IRAS determine the Annual Value (AV) of my residential property?",
    url: "https://ask.gov.sg/iras/questions/clq62nu5f000ao2f4bm0pntdz",
  },
  deemed: {
    name: "Inland Revenue Authority of Singapore, e-Tax Guide: Simplification of claim of rental expenses for individuals, third edition, 30 January 2026",
    url: "https://www.iras.gov.sg/media/docs/default-source/e-tax/e-tax-guide_iit_simplification_of_claim_of_rental_expenses_for_individuals.pdf",
  },
};

/* Claims the page carries word for word, in the instrument's own wording. */
export const STATUTORY = [
  { key: "absdEffective", claim: "The revised rates will take effect from 27 April 2023", instrument: "absd" },
  { key: "bsdEffective", claim: "all properties acquired on or after 15 February 2023", instrument: "bsd" },
  { key: "ssdEffective", claim: "on and after 4 July 2025, 12.00am", instrument: "ssd" },
  { key: "basis", claim: "Stamp duty is computed based on the consideration or market value of the relevant asset, whichever is higher", instrument: "basis" },
  { key: "fta", claim: "Nationals of the United States of America, and the Nationals and Permanent Residents of Switzerland, Norway, Liechtenstein and Iceland", instrument: "fta" },
  { key: "ptax", claim: "The final property tax rates of up to 36% will take effect for property tax payable from 1 January 2024", instrument: "ptax" },
  { key: "nrRate", claim: "will correspondingly be raised from 22% to 24%", instrument: "ptax" },
  { key: "av", claim: "the estimated gross annual rent of the property if it were to be rented out, excluding furniture, furnishings and maintenance fees", instrument: "av" },
  { key: "deemed", claim: "The amount of deemed expenses allowable in respect of a residential property is 15% of the gross rental income", instrument: "deemed" },
];

/* The two exchange rates. The dirham's is fixed; the Singapore dollar's is
   the Federal Reserve's noon buying rate for the last day in the release,
   which is a published number nobody chose to make either city look better. */
export const FX = {
  aedPerUsd: 3.6725,
  aedSource: { name: "Central Bank of the UAE, exchange rates, June 2026 (US Dollar 3.6725)", url: "https://centralbank.ae/media/dlcdkjd2/fx_jun26_en.pdf" },
  sgdPerUsd: 1.2671,
  sgdDate: "11 September 2026",
  sgdSource: { name: "Board of Governors of the Federal Reserve System, H.10 foreign exchange rates, released 14 September 2026, retrieved 22 September 2026", url: "https://www.federalreserve.gov/releases/h10/20260914/" },
};

export const toSgd = (aed) => Math.round((aed / FX.aedPerUsd) * FX.sgdPerUsd);

/* Buyer's stamp duty, residential, on and after 15 February 2023. */
export const BSD = [
  { to: 180000, rate: 0.01 },
  { to: 360000, rate: 0.02 },
  { to: 1000000, rate: 0.03 },
  { to: 1500000, rate: 0.04 },
  { to: 3000000, rate: 0.05 },
  { to: Infinity, rate: 0.06 },
];

/* Additional buyer's stamp duty on and after 27 April 2023, any property. */
export const ABSD = { foreigner: 0.60, entity: 0.65, fta: 0 };

/* Seller's stamp duty on and after 4 July 2025, by holding period in years. */
export const SSD = [
  { upTo: 1, rate: 0.16 },
  { upTo: 2, rate: 0.12 },
  { upTo: 3, rate: 0.08 },
  { upTo: 4, rate: 0.04 },
];

/* Property tax, non-owner-occupied residential, from 1 January 2024. */
export const PTAX = [
  { to: 30000, rate: 0.12 },
  { to: 45000, rate: 0.20 },
  { to: 60000, rate: 0.28 },
  { to: Infinity, rate: 0.36 },
];

export const NR_RATE = 0.24;
export const DEEMED = 0.15;

function banded(amount, bands) {
  const lines = [];
  let from = 0;
  for (const b of bands) {
    if (amount <= from) break;
    const slice = Math.min(amount, b.to) - from;
    lines.push({ from, slice, rate: b.rate, tax: Math.round(slice * b.rate) });
    from = b.to;
  }
  return { lines, total: lines.reduce((a, l) => a + l.tax, 0) };
}

const pct = (n) => Number((n * 100).toFixed(2));

export const bsd = (price) => banded(price, BSD);
export const propertyTax = (av) => banded(av, PTAX);

/* The Dubai unit's ratios, taken from the net yield page's module. */
export const grossRatio = () => aq.EXAMPLE.rent / aq.EXAMPLE.price;
export const costRatio = () => aq.operating().net / aq.EXAMPLE.rent;
export const collectedRatio = () => aq.operating().collected / aq.EXAMPLE.rent;

/* One Singapore flat bought with `aed` dirhams by a buyer paying `absd`,
   let at `gross`. The annual value is the rent: the flat is let
   unfurnished, and the service charge is already outside the rent, which
   is the IRAS definition. Income tax is charged on whichever of the two
   deductions leaves less tax: every running cost and the property tax, or
   the deemed 15% of rent collected. The first is the more generous reading
   and it wins at every yield on this page; the function computes both
   rather than assuming it. */
export function singapore({ aed = aq.EXAMPLE.price, absd = ABSD.foreigner, gross = grossRatio(), rate = NR_RATE } = {}) {
  const price = toSgd(aed);
  const rent = Math.round(price * gross);
  const collected = Math.round(rent * collectedRatio());
  const noiBeforeTax = Math.round(rent * costRatio());
  const ptax = propertyTax(rent).total;
  const noi = noiBeforeTax - ptax;
  const taxActual = Math.round(Math.max(0, noi) * rate);
  const taxDeemed = Math.round(collected * (1 - DEEMED) * rate);
  const tax = Math.min(taxActual, taxDeemed);
  const kept = noi - tax;
  const b = bsd(price).total;
  const a = Math.round(price * absd);
  const stamp = b + a;
  const outlay = price + stamp;
  return {
    price, rent, collected, noiBeforeTax, ptax, noi, taxActual, taxDeemed, tax, kept,
    bsd: b, absd: a, stamp, outlay,
    gross: pct(rent / price),
    ptaxShare: pct(ptax / rent),
    onPrice: pct(noi / price),
    stampRate: pct(stamp / price),
    net: pct(kept / outlay),
    entryYears: Number((stamp / kept).toFixed(2)),
    usedActual: taxActual <= taxDeemed,
  };
}

export function dubai() {
  const y = aq.yields();
  const a = aq.acquisition();
  return {
    price: aq.EXAMPLE.price, rent: aq.EXAMPLE.rent, noi: y.noi, stamp: a.transfer, entry: a.total,
    stampRate: pct(a.transfer / aq.EXAMPLE.price),
    gross: y.gross, onPrice: y.onPrice, net: y.net, entryYears: aq.payback().entry,
    exact: y.noi / y.outlay,
  };
}

/* The Singapore gross yield at which the foreign owner keeps exactly what
   the Dubai owner keeps. Net yield rises with gross yield at every point
   (each band of property tax takes less than a whole dirham of the next
   one), so bisection finds the one crossing. Solved on unrounded figures;
   the residual is what the suite checks. */
export function breakEvenGross(absd = ABSD.foreigner, aed = aq.EXAMPLE.price) {
  const target = dubai().exact;
  const netAt = (g) => {
    const s = singapore({ aed, absd, gross: g });
    return s.kept / s.outlay;
  };
  let lo = 0.001, hi = 0.5;
  for (let k = 0; k < 200; k++) {
    const mid = (lo + hi) / 2;
    if (netAt(mid) < target) lo = mid; else hi = mid;
  }
  const g = (lo + hi) / 2;
  return { gross: pct(g), residual: netAt(g) - target };
}

/* The three buyers the page names, at the Dubai unit's money. */
export function buyers(aed = aq.EXAMPLE.price) {
  return [
    { label: "Foreigner", ...singapore({ aed, absd: ABSD.foreigner }) },
    { label: "Entity or trustee", ...singapore({ aed, absd: ABSD.entity }) },
    { label: "US national, or EFTA national or PR, first home", ...singapore({ aed, absd: ABSD.fta }) },
  ];
}

/* The same comparison at larger budgets, because both of Singapore's
   progressive scales bite harder as the flat gets bigger and Dubai's
   registration fee does not. */
export const BUDGETS = [1, 2, 4].map((m) => m * aq.EXAMPLE.price);

export function atBudgets() {
  return BUDGETS.map((aed) => {
    const s = singapore({ aed });
    return { aed, sgd: s.price, stampRate: s.stampRate, ptaxShare: s.ptaxShare, net: s.net, breakEven: breakEvenGross(ABSD.foreigner, aed).gross };
  });
}

/* Seller's stamp duty on the Singapore flat sold at its purchase price in
   each year of the holding period, against nothing on the Dubai side:
   Dubai charges no transfer tax to a seller who follows the market
   convention, and the site's selling page covers what he does pay. */
export function ssdRows(aed = aq.EXAMPLE.price) {
  const price = toSgd(aed);
  return SSD.map((r) => ({ upTo: r.upTo, rate: pct(r.rate), duty: Math.round(price * r.rate) }));
}

export const money = aq.money;
export const pctText = aq.pctText;

/* Dubai's lead over each Singapore buyer, in points of net yield. Computed
   from the two rounded yields the page prints, so the page's subtraction
   and this one cannot disagree. */
export function leads() {
  const d = dubai().net;
  return buyers().map((b) => ({ label: b.label, lead: Number((d - b.net).toFixed(2)) }));
}
