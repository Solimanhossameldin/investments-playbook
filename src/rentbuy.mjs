/* Rent versus buy in Dubai, as a break-even hold period rather than a verdict.

   Every page on this query ends at the same two sentences: renting is better
   under three years, buying is better after three to five. The range is
   asserted on all of them and computed on none, and the pages that show their
   working get there by assuming capital growth — one of them at "20-30%
   annually" — which is to say the answer is the assumption.

   This module computes the hold period instead, and computes it first at zero
   growth in everything: the price flat, the rent index flat, the running costs
   flat. That is not a forecast. It is the only version of the question that
   does not depend on the number nobody can know, and it is the number a reader
   should have before being shown a growth rate.

   Two things on the renting side are missing from every competing page and
   both are published. The tenant's own entry stack — the lease commission, the
   Land Department's tenancy registration, the utility connection — is treated
   as nil by pages that say a renter "pays no transaction fees". And the rent a
   sitting tenant actually pays is not the index: it is the Decree 43 ladder,
   which this site has already computed, and which lags the index permanently.
   The cap that protects a tenant is also the thing that makes buying take
   longer to beat renting, and that is arithmetic, so it is computed here.

   The fee figures are the Land Department's and the utility's own service
   pages. The conventions — what a letting agent charges, what a landlord holds
   as a deposit — are marked as conventions, because no instrument sets them
   and a page that implied otherwise would be doing what this one objects to. */

import {
  EXAMPLE as BUY, FEES, acquisition, mortgageCosts, money,
} from "./acquisition.mjs";
import { sellerStack } from "./disposal.mjs";
import { schedule } from "./rentcap.mjs";

export const INSTRUMENTS = {
  ejari: {
    name: "Dubai Land Department, Register / Renew Tenancy Contract, service fees",
    url: "https://dubailand.gov.ae/en/eservices/register-renew-ejari-contract/",
  },
  dewaMoveIn: {
    name: "Dubai Electricity and Water Authority, Activation of Electricity/Water (Move-in), service fees",
    url: "https://www.dewa.gov.ae/en/about-us/service-guide/consumer-services/move-in",
  },
};

/* The claims the page must carry word for word. Each is a phrase from the
   service page itself, chosen so that the quote survives being read out of
   context: the amounts are held as numbers below and written in the site's
   own currency formatting, because the utility's page prints its figures
   without spelling the currency out and a verbatim quote of that would read
   as a typesetting error rather than as a fee. */
export const STATUTORY = [
  { key: "ejariRegistration", claim: "AED 100 for registering a tenancy contract", instrument: "ejari" },
  { key: "ejariKnowledge", claim: "AED 10 knowledge fee", instrument: "ejari" },
  { key: "ejariInnovation", claim: "AED 10 innovation fee", instrument: "ejari" },
  { key: "ownerDeposit", claim: "Security deposit for property owners will be refunded upon sale of the premise only", instrument: "dewaMoveIn" },
  { key: "connection", claim: "for connecting electricity and water (small meters)", instrument: "dewaMoveIn" },
];

/* The Land Department's tenancy registration, by channel. The service partner
   is a partner rather than the Department, so its fee carries VAT where the
   registration, knowledge and innovation lines do not — the same split the
   acquisition module applies to the sale trustee. */
export const EJARI = {
  registration: 100,
  knowledge: 10,
  innovation: 10,
  partnerApp: 55,
  partnerCentre: 95,
  publishedApp: 177.75,
  publishedCentre: 220,
};

export function ejariFee({ centre = false } = {}) {
  const partner = centre ? EJARI.partnerCentre : EJARI.partnerApp;
  const total = EJARI.registration + EJARI.knowledge + EJARI.innovation + partner * (1 + FEES.vatRate);
  return Number(total.toFixed(2));
}

/* The utility's move-in lines. The deposit is refundable and is therefore not
   a cost; what it costs is the return it does not earn while it is held, and
   that is counted below on both sides. */
export const DEWA = {
  depositFlat: 2000,
  depositVilla: 4000,
  connectSmall: 125,
  connectLarge: 300,
  registration: 10,
  knowledge: 10,
  innovation: 10,
  publishedActivation: 155,
};

export function dewaActivation({ large = false } = {}) {
  return (large ? DEWA.connectLarge : DEWA.connectSmall)
    + DEWA.registration + DEWA.knowledge + DEWA.innovation;
}

/* Conventions. No instrument sets either of these, and the page says so.
   They are here rather than in the prose so the sensitivity tables can move
   them and so the page cannot quote one figure and compute another. */
export const CONVENTION = {
  leaseAgencyRate: 0.05,      // of annual rent, charged in the first year
  depositRate: 0.05,          // of annual rent, unfurnished, refundable
  furnishedDepositRate: 0.10,
};

/* The same apartment as every other page on this site, considered by someone
   who would otherwise rent it: the illustrative one bedroom at AED 1,500,000,
   900 sq ft, letting at AED 105,000. The rates below are the reader's own
   inputs and the page prints a sensitivity table for each of the three that
   move the answer. */
export const CASE = {
  price: BUY.price,
  sqft: BUY.sqft,
  rent: BUY.rent,
  serviceChargePerSqft: BUY.serviceChargePerSqft,
  maintenanceRate: BUY.maintenanceRate,
  insurance: BUY.insurance,
  ltv: BUY.ltv,
  agencyRate: BUY.agencyRate,
  mortgageRate: 0.045,
  termYears: 25,
  opportunityRate: 0.05,
  indexGrowth: 0,
  costGrowth: 0,
  capitalGrowth: 0,
  years: 25,
};

/* The loan, year by year. Interest is the unrecoverable half of the payment
   and principal is a transfer into equity, so they have to be separated
   rather than netted, and the balance matters because the exit stack is
   priced off it. Built month by month because an annual approximation of a
   monthly amortisation is a different number, and this page's whole argument
   is that the numbers are checkable. */
export function amortise(c = CASE) {
  const loan = Math.round(c.price * c.ltv);
  const r = c.mortgageRate / 12;
  const n = c.termYears * 12;
  const payment = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n));
  let balance = loan;
  const rows = [];
  for (let y = 1; y <= c.years; y++) {
    const opening = balance;
    let interest = 0;
    for (let m = 0; m < 12; m++) {
      const i = balance * r;
      interest += i;
      balance -= payment - i;
    }
    if (balance < 0) balance = 0;
    rows.push({
      year: y,
      opening: Math.round(opening),
      interest: Math.round(interest),
      principal: Math.round(opening - balance),
      balance: Math.round(balance),
    });
  }
  return { loan, payment: Math.round(payment), rows };
}

/* The rent a sitting tenant is permitted to be charged, renewal by renewal,
   taken from the rent cap module rather than modelled again here. The tenant
   signs at the index, so the first year's gap is nil and the ladder is
   whatever the decree allows from there. */
export function rentLadder(c = CASE) {
  return schedule({ rent: c.rent, index: c.rent, growth: c.indexGrowth * 100, years: c.years });
}

/* What a year of renting costs, unrecoverably. The deposits are refundable,
   so only the return they do not earn is counted. */
export function rentingYear(y, c = CASE, { atIndex = false } = {}) {
  const row = rentLadder(c)[y - 1];
  const rent = atIndex ? Math.round(row.index) : row.rent;
  const agency = y === 1 ? Math.round(c.rent * CONVENTION.leaseAgencyRate * (1 + FEES.vatRate)) : 0;
  const connection = y === 1 ? dewaActivation() : 0;
  const deposits = Math.round(rent * CONVENTION.depositRate) + DEWA.depositFlat;
  const held = Math.round(deposits * c.opportunityRate);
  const lines = [
    ["Rent, as the decree permits it", rent],
    ["Lease commission, with VAT, first year only", agency],
    ["Tenancy contract registration", ejariFee()],
    ["Utility connection, first year only", connection],
    ["Return forgone on the deposits held", held],
  ].filter(([, v]) => v > 0);
  return { year: y, rent, index: Math.round(row.index), deposits, lines, total: lines.reduce((a, [, v]) => a + v, 0) };
}

/* What a year of owning costs, unrecoverably: interest but not principal,
   the running costs an owner-occupier cannot avoid, and the return the
   capital tied up in the walls does not earn. No management fee and no
   vacancy allowance, because nobody is letting it. */
export function owningYear(y, c = CASE) {
  const am = amortise(c);
  const row = am.rows[y - 1];
  const inflator = Math.pow(1 + c.costGrowth, y - 1);
  const serviceCharge = Math.round(c.sqft * c.serviceChargePerSqft * inflator);
  const maintenance = Math.round(c.rent * c.maintenanceRate * inflator);
  const insurance = Math.round(c.insurance * inflator);
  const equity = c.price - row.opening;
  const lines = [
    ["Interest on the loan", row.interest],
    ["Service charge", serviceCharge],
    ["Maintenance reserve", maintenance],
    ["Insurance and fixed costs", insurance],
    ["Return forgone on the capital in the walls", Math.round(equity * c.opportunityRate)],
    ["Return forgone on the utility deposit", Math.round(DEWA.depositFlat * c.opportunityRate)],
  ];
  return {
    year: y, equity, principal: row.principal, balance: row.balance,
    lines, total: lines.reduce((a, [, v]) => a + v, 0),
  };
}

/* Everything paid to get in, both transactions. */
export function entryStack(c = CASE) {
  const i = { ...BUY, price: c.price, ltv: c.ltv, agencyRate: c.agencyRate };
  const a = acquisition(i).total;
  const m = mortgageCosts(i).total;
  return { acquisition: a, mortgage: m, total: a + m, rate: Number(((a + m) / c.price * 100).toFixed(2)) };
}

/* Everything paid to get out, in the year of the exit. It is not a constant:
   the agency commission is charged on the price the property sells for, and
   the early settlement fee is a percentage of the balance still outstanding,
   so a longer hold is a cheaper exit. */
export function exitStack(y, c = CASE) {
  const balance = amortise(c).rows[y - 1].balance;
  const salePrice = Math.round(c.price * Math.pow(1 + c.capitalGrowth, y));
  const s = sellerStack({ price: salePrice, outstanding: balance, agencyRate: c.agencyRate });
  return { ...s, salePrice, balance, gain: salePrice - c.price };
}

/* The comparison, cumulated to an exit in year N. Owning carries its one-off
   stacks and gives back whatever the price has done; renting carries nothing
   one-off after the first year. Both sides are unrecoverable cost, which is
   the only basis on which the two are comparable at all. */
export function cumulative(c = CASE, { atIndex = false } = {}) {
  const rows = [];
  let own = 0;
  let rent = 0;
  const entry = entryStack(c).total;
  for (let y = 1; y <= c.years; y++) {
    own += owningYear(y, c).total;
    rent += rentingYear(y, c, { atIndex }).total;
    const exit = exitStack(y, c);
    const owningTotal = entry + own + exit.total - exit.gain;
    rows.push({
      year: y,
      owningRunning: own,
      rentingRunning: rent,
      exit: exit.total,
      gain: exit.gain,
      owning: owningTotal,
      renting: rent,
      advantage: rent - owningTotal,
    });
  }
  return rows;
}

/* The first year at which owning has cost less than renting and stays that
   way. Searched rather than solved, and required to hold for every later
   year the term covers, because a crossing that reverses is not a break-even
   and this page would otherwise print the year of a crossing it has not
   checked. Null when it never crosses inside the term. */
export function breakEven(c = CASE, opts = {}) {
  const rows = cumulative(c, opts);
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].advantage >= 0 && rows.slice(i).every((r) => r.advantage >= 0)) {
      return { year: rows[i].year, row: rows[i], rows };
    }
  }
  const crossed = rows.find((r) => r.advantage >= 0);
  return { year: null, crossed: crossed ? crossed.year : null, rows };
}

/* The capital growth rate at which the break-even lands on or inside a given
   year. Searched in basis points from zero upward, because the exit stack and
   the ladder both move with the inputs and a closed form here would be a
   different model than the one the page prints. */
export function requiredGrowth(targetYear, c = CASE, { max = 0.5 } = {}) {
  for (let bp = 0; bp <= Math.round(max * 10000); bp++) {
    const g = bp / 10000;
    const be = breakEven({ ...c, capitalGrowth: g });
    if (be.year !== null && be.year <= targetYear) return g;
  }
  return null;
}

export const GROWTHS = [-0.03, -0.02, -0.01, 0, 0.01, 0.02, 0.03, 0.05];
export const RATES = [0.035, 0.04, 0.045, 0.05, 0.055, 0.065];
export const OPPORTUNITY = [0.02, 0.03, 0.04, 0.05, 0.06, 0.07];
export const INDEX_GROWTHS = [0, 0.02, 0.03, 0.05];
export const TARGET_YEARS = [3, 5];

export function atGrowth(g, c = CASE) { return breakEven({ ...c, capitalGrowth: g }); }
export function atRate(r, c = CASE) { return breakEven({ ...c, mortgageRate: r }); }
export function atOpportunity(o, c = CASE) { return breakEven({ ...c, opportunityRate: o }); }

/* What the cap is worth to the comparison. The same tenancy priced two ways:
   the rent the decree permits, and the rent the index would have charged.
   The difference is the number no competing page carries, and it moves the
   break-even in the buyer's favour when it is left out. */
export function capEffect(indexGrowth, c = CASE) {
  const k = { ...c, indexGrowth };
  const capped = breakEven(k);
  const atIndex = breakEven(k, { atIndex: true });
  const rows = cumulative(k);
  const last = rows[rows.length - 1];
  const ladder = rentLadder(k);
  const final = ladder[ladder.length - 1];
  return {
    indexGrowth,
    cappedYear: capped.year,
    indexYear: atIndex.year,
    yearsAdded: capped.year !== null && atIndex.year !== null ? capped.year - atIndex.year : null,
    finalGap: Number(final.gap.toFixed(1)),
    finalRent: final.rent,
    finalIndex: Math.round(final.index),
    worth: last.rentingRunning,
  };
}

/* A leg of the published price index as a compound annual rate. The legs are
   quoted on this site as whole-period percentages, and the question this page
   asks of them is a yearly one, so the conversion happens here against the
   same analysis the dataset page prints rather than being worked out in
   prose. */
export function legAnnualised(leg) {
  const months = (new Date(`${leg.to}T00:00:00Z`) - new Date(`${leg.from}T00:00:00Z`)) / 86400000 / 30.436875;
  const years = months / 12;
  return Number(((Math.pow(1 + leg.all / 100, 1 / years) - 1) * 100).toFixed(2));
}

export { money };
