/* The golden visa against the Portugal D7, for the reader who is actually
   choosing between them: somebody who already owns, or is about to buy, a
   Dubai apartment, and wants to know what residency it buys and where.

   Every page ranking on this comparison is written by a firm that sells one
   of the two. The two most confident are titled "why Dubai wins" and "why
   investors choose Portugal", which is the tell: the conclusion is in the
   headline and the arithmetic is decoration. The better of them do print the
   Land Department's published visa fees and attribute them, so the fee table
   below is not this page's contribution and is not presented as one.

   What none of them does is the only sum that matters. The two routes are
   not two prices for the same thing: one is a test on an asset and one is a
   test on an income. So the comparable quantity is the capital each test
   needs, and that is computable, because the income threshold is set by
   instrument and the income a Dubai apartment produces is already modelled
   in `acquisition.mjs`. The answer is the solve at the bottom: the asset
   test needs AED 2,000,000 that may not be sold for ten years, and the
   income test clears on a smaller property that stays sellable.

   The two sides are given the same apartment at the same price per foot and
   the same rent per foot, which is the method the London and Singapore pages
   use, so nothing in the comparison is a matter of opinion.

   One asymmetry runs the other way and the page says so: Portuguese
   residence makes the rent taxable in Portugal and the credit for UAE tax
   is nil, because the UAE charges none. */

import * as aq from "./acquisition.mjs";

export const INSTRUMENTS = {
  gdrfa: {
    name: "General Directorate of Residency and Foreigners Affairs, Dubai, issuing a golden residence permit (investors)",
    url: "https://www.gdrfad.gov.ae/en/services/8ea80da4-f43e-11eb-0320-0050569629e8",
  },
  dldVisa: {
    name: "Dubai Land Department, Golden Visa application, Investor",
    url: "https://dubailand.gov.ae/en/eservices/request-for-golden-visa-investor/",
  },
  moet: {
    name: "UAE Ministry of Economy and Tourism, conditions for granting a Golden Visa to an investor in real estate",
    url: "https://www.moet.gov.ae/en/-/what-are-the-conditions-for-granting-a-golden-visa-to-an-investor-in-real-estate-",
  },
  uaePortal: {
    name: "The United Arab Emirates Government portal, golden visa",
    url: "https://u.ae/en/information-and-services/visa-and-emirates-id/residence-visas/golden-visa",
  },
  lei56: {
    name: "Lei n.º 56/2023, de 6 de outubro, Mais Habitacao, Artigo 1.º n.º 2, Artigos 43.º, 44.º e 55.º",
    url: "https://diariodarepublica.pt/dr/detalhe/lei/56-2023-222477692",
  },
  portaria: {
    name: "Portaria n.º 1563/2007, de 11 de dezembro, Artigo 2.º, meios de subsistencia",
    url: "https://vistos.mne.gov.pt/images/schengen/portaria1563_2007_meios_de_subsist.pdf",
  },
  rmmg: {
    name: "Direcao-Geral do Emprego e das Relacoes de Trabalho, retribuicao minima mensal garantida para 2026, set by Decreto-Lei n.º 139/2025 of 29 December 2025",
    url: "https://www.dgert.gov.pt/retribuicao-minima-mensal-garantida-para-2026",
  },
  cirs: {
    name: "Autoridade Tributaria e Aduaneira, rendimentos obtidos no estrangeiro, Codigo do IRS Artigos 15.º and 81.º",
    url: "https://info.portaldasfinancas.gov.pt/pt/apoio_contribuinte/questoes_frequentes/Pages/faqs-00653.aspx",
  },
  ecb: {
    name: "European Central Bank, euro foreign exchange reference rates, 2 October 2026",
    url: "https://www.ecb.europa.eu/stats/exchange/eurofxref/shared/pdf/2026/10/20261002.pdf",
  },
  cbuae: {
    name: "Central Bank of the United Arab Emirates, exchange rates, June 2026, US Dollar 3.6725",
    url: "https://centralbank.ae/media/dlcdkjd2/fx_jun26_en.pdf",
  },
};

/* The dirham is pegged to the dollar, so the only live rate in the chain is
   the euro one, and it is taken from the central bank that publishes the
   euro's own reference rate rather than from a broker's screen. */
export const FX = {
  aedPerUsd: 3.6725,
  usdPerEur: 1.1225,
  eurDate: "2 October 2026",
};

export const aedPerEur = () => FX.aedPerUsd * FX.usdPerEur;
export const toAed = (eur) => Math.round(eur * aedPerEur());
export const toEur = (aed) => Math.round(aed / aedPerEur());

/* The UAE side. Threshold, duration and the three conditions that decide
   whether a particular buyer qualifies. */
export const UAE = {
  threshold: 2000000,
  years: 10,
  federalAltYears: 5,
};

/* The Land Department publishes the visa's price itemised, which is unusual
   and worth repeating exactly. These are the applicant's own lines. */
export const DLD_FEES = [
  ["Medical examination", 700],
  ["Emirates ID, ten years", 1153],
  ["Confirmation of residency permit", 2856.75],
  ["Land Department fees", 4020],
  ["Administrative fees", 1155],
];

export const DEPENDANT_FEE = 5774.5;
export const FILE_OPENING_FEE = 318.75;

export const visaFees = () => {
  const total = DLD_FEES.reduce((a, [, v]) => a + v, 0);
  return { lines: DLD_FEES, total: Number(total.toFixed(2)) };
};

/* The Portuguese side. The threshold is not a number somebody published as a
   visa requirement; it is the minimum wage run through the subsistence
   portaria, so it moves every January and the arithmetic has to be done
   rather than quoted. */
export const RMMG_2026 = 920;

export const SUBSISTENCE = { firstAdult: 1.0, furtherAdult: 0.5, child: 0.3 };

export const HOUSEHOLDS = [
  ["One applicant", SUBSISTENCE.firstAdult],
  ["Applicant and spouse", SUBSISTENCE.firstAdult + SUBSISTENCE.furtherAdult],
  ["Applicant, spouse and one child", SUBSISTENCE.firstAdult + SUBSISTENCE.furtherAdult + SUBSISTENCE.child],
];

export function d7Threshold(multiple, rmmg = RMMG_2026) {
  const month = Number((rmmg * multiple).toFixed(2));
  const year = Number((month * 12).toFixed(2));
  return { month, year, aed: toAed(year) };
}

export const d7Table = (rmmg = RMMG_2026) =>
  HOUSEHOLDS.map(([label, m]) => ({ label, multiple: m, ...d7Threshold(m, rmmg) }));

/* The same apartment, scaled. Price per foot and rent per foot are the
   illustrative unit's, so a larger or smaller property is the same building,
   not a different bet. Everything else `acquisition.mjs` already holds. */
export const perSqft = () => aq.EXAMPLE.price / aq.EXAMPLE.sqft;
export const rentPerSqft = () => aq.EXAMPLE.rent / aq.EXAMPLE.sqft;

export function unitOfArea(sqft) {
  return {
    ...aq.EXAMPLE,
    sqft,
    price: Math.round(sqft * perSqft()),
    rent: Math.round(sqft * rentPerSqft()),
  };
}

export const unitOfPrice = (price) => unitOfArea(price / perSqft());

/* The asset test, costed. The threshold is a price, so the cash actually
   required is the price plus the entry stack the net yield page already
   itemises, plus the visa's own published fees. The unrecoverable part is
   everything except the price. */
export function assetRoute() {
  const unit = unitOfPrice(UAE.threshold);
  const acq = aq.acquisition(unit);
  const fees = visaFees().total;
  const costs = Number((acq.total + fees).toFixed(2));
  return {
    unit,
    acquisition: acq.total,
    fees,
    costs,
    cash: Number((UAE.threshold + costs).toFixed(2)),
    perYear: Number((costs / UAE.years).toFixed(2)),
    noi: aq.operating(unit).net,
    net: aq.yields(unit).net,
  };
}

/* The income test, solved. Find the smallest whole square foot of the same
   apartment whose net operating income, computed by the module the rest of
   the site is checked against, reaches the household's annual threshold.
   Stepped rather than inverted on purpose: the module rounds four of its
   deduction lines, so an algebraic inverse would disagree with it by a few
   dirhams and the page would be quoting a figure the site cannot reproduce. */
export function incomeRoute(multiple = HOUSEHOLDS[1][1], rmmg = RMMG_2026) {
  const target = d7Threshold(multiple, rmmg).aed;
  let lo = 1;
  let hi = 20000;
  if (aq.operating(unitOfArea(hi)).net < target) return null;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (aq.operating(unitOfArea(mid)).net >= target) hi = mid;
    else lo = mid + 1;
  }
  const unit = unitOfArea(lo);
  const noi = aq.operating(unit).net;
  return {
    target,
    sqft: unit.sqft,
    unit,
    price: unit.price,
    noi,
    surplus: noi - target,
    acquisition: aq.acquisition(unit).total,
  };
}

/* The comparison, in the only unit that makes the two tests commensurable:
   capital. */
export function capitalGap(multiple = HOUSEHOLDS[1][1], rmmg = RMMG_2026) {
  const asset = assetRoute();
  const income = incomeRoute(multiple, rmmg);
  return {
    asset: UAE.threshold,
    income: income.price,
    gap: UAE.threshold - income.price,
    ratio: Number((income.price / UAE.threshold).toFixed(3)),
  };
}

/* What the illustrative one bedroom, unchanged, covers of each threshold. */
export function coverage(rmmg = RMMG_2026) {
  const noi = aq.operating().net;
  return d7Table(rmmg).map((r) => ({
    ...r,
    noi,
    noiEur: toEur(noi),
    noiEurMonth: Math.round(toEur(noi) / 12),
    covers: Number(((noi / r.aed) * 100).toFixed(1)),
    clears: noi >= r.aed,
  }));
}

/* Claims the page must carry word for word, each tied to the instrument that
   sets it. The Portuguese quotations are in Portuguese because that is the
   language the instrument is written in, and a translated quotation is a
   paraphrase wearing quotation marks. */
export const STATUTORY = [
  {
    key: "threshold",
    instrument: "dldVisa",
    claim: "equal to or more than 2 million AED at the time of purchase",
  },
  {
    key: "lock",
    instrument: "gdrfa",
    claim: "Property may not be disposed of nor the financial deposit refunded throughout the 10-year residency period",
  },
  {
    key: "lien",
    instrument: "gdrfa",
    claim: "It is required to place a lien on the property to ensure the continuity of ownership throughout the validity of the Golden Residency",
  },
  {
    key: "mortgageOk",
    instrument: "gdrfa",
    claim: "Mortgaged property is acceptable, and includes all types of properties",
  },
  {
    key: "mortgagePaid",
    instrument: "dldVisa",
    claim: "a bank letter indicating 2 million AED paid amount",
  },
  {
    key: "jointShare",
    instrument: "gdrfa",
    claim: "the value of the share must not be less than AED 2 million",
  },
  {
    key: "wholly",
    instrument: "moet",
    claim: "must be wholly owned by the investor",
  },
  {
    key: "revocation",
    instrument: "lei56",
    claim: "revogacao das autorizacoes de residencia para atividade de investimento imobiliario",
  },
  {
    key: "subsistence",
    instrument: "portaria",
    claim: "Segundo ou mais adultos 50",
  },
  {
    key: "rmmg",
    instrument: "rmmg",
    claim: "Decreto-Lei n.º 139/2025",
  },
  {
    key: "worldwide",
    instrument: "cirs",
    claim: "Artigo 15.º",
  },
];
