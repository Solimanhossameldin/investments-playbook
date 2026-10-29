/* What UAE corporate tax costs a Dubai landlord, and what it costs the
   company somebody is selling him.

   The question arrives as a pitch. A structuring firm, or the broker who
   introduced one, proposes holding the flat through a company, and the
   reason given is tax. It is worth answering with arithmetic, because the
   arithmetic says something neither side of the usual argument says.

   The two literatures again. The brokerage pages say the UAE charges no tax
   on rental income, full stop, which is wrong for a company and right for an
   individual by a route they never name. The structuring pages say a company
   brings nine percent corporate tax, which is true of the rate and almost
   never true of the bill. Neither prints the threshold, and the threshold is
   the whole finding.

   Three instruments do the work and they stack in one direction.

   Cabinet Decision No. 49 of 2023 takes the individual out of the charge
   altogether. Article 2 subjects a natural person's business to corporate
   tax only above AED 1,000,000 of turnover, and then Clause 2 says that
   notwithstanding that threshold, Real Estate Investment income is not a
   business activity subject to corporate tax at all, "regardless of the
   amount of Turnover derived from such activities". Article 1 defines Real
   Estate Investment as letting that "is not conducted, or does not require
   to be conducted through a Licence from a Licensing Authority". So the
   individual on ordinary tenancy contracts is outside the charge, at any
   size, and Article 2 Clause 3 says he need not even register.

   The company is inside the charge, and this is where the pitch and the
   counter-pitch both go wrong. Federal Decree-Law No. 47 of 2022 Article 3
   charges 0% up to an amount set by Cabinet and 9% above it, and Cabinet
   Decision No. 116 of 2022 sets that amount at AED 375,000 of taxable
   income. The illustrative one bedroom this site prices throughout yields
   AED 69,127 of net operating income. Nine percent of nothing is nothing:
   the company owes no corporate tax on that flat, or on five of them.

   So the honest answer is not "a company creates a tax liability". It is
   that for a small portfolio the company's corporate tax bill is zero on
   both sides of the comparison, the decision is about compliance cost and
   not tax at all, and the tax only begins at a scale most readers of the
   pitch are nowhere near. And at the top end it is still small: the most
   9% above a 375,000 band can ever take is 9% of net operating income,
   which on this unit's economics is 0.39 percentage points of net yield.

   The fourth instrument is the one the pitch never mentions and the only
   one that imposes a cost regardless of scale. Cabinet Decision No. 35 of
   2025, which repealed and replaced Cabinet Decision No. 56 of 2023 for tax
   periods from 1 January 2025, gives a foreign company a UAE nexus the
   moment it derives income from UAE immovable property, and Article 4 then
   requires it to register for corporate tax. An offshore holding company
   over a Dubai flat is not outside the UAE net. It is inside it, with a
   filing obligation, and usually with no tax to pay.

   Everything below is rate and threshold arithmetic on figures the
   acquisition module already computes, so it needs no exchange rate and
   nothing here goes stale on one. What a company costs to run, formation,
   licensing, audit and filing, is deliberately not priced: no authority
   publishes a schedule for it, it is quoted per provider, and a number
   typed here would be the kind of unsourced figure this site exists to
   argue against. It is named as the decision variable instead. */

import * as aq from "./acquisition.mjs";

export const INSTRUMENTS = {
  ctLaw: {
    name: "Federal Decree-Law No. 47 of 2022 on the Taxation of Corporations and Businesses, Articles 3, 11 and 12",
    url: "https://mof.gov.ae/wp-content/uploads/2022/12/Federal-Decree-Law-No.-47-of-2022-EN.pdf",
  },
  threshold: {
    name: "Cabinet Decision No. 116 of 2022 on the Determination of Annual Income Subject to Corporate Tax, Articles 2 and 3",
    url: "https://mof.gov.ae/wp-content/uploads/2023/04/Cabinet-Decision-No-116-of-2022-on-the-annual-Taxable-Income-subject-to-Corporate-Tax.pdf",
  },
  naturalPersons: {
    name: "Cabinet Decision No. 49 of 2023 on Specifying the Categories of Businesses or Business Activities Conducted by a Resident or Non-Resident Natural Person that are Subject to Corporate Tax, issued 8 May 2023",
    url: "https://mof.gov.ae/wp-content/uploads/2023/05/Cabinet-Decision-No.-49-of-2023.pdf",
  },
  nexus: {
    name: "Cabinet Decision No. 35 of 2025 on Determination of a Non-Resident Person's Nexus in the State, issued 27 March 2025",
    url: "https://mof.gov.ae/wp-content/uploads/2025/04/Cabinet-Decision-No.-35-of-2025-on-Determination-of-a-Non-Resident-Persons-Nexus-in-the-State1.pdf",
  },
};

/* Claims the page carries word for word, in the instrument's own wording.

   The four that do the work are the Article 2 Clause 2 carve out, the
   licence test inside the definition it relies on, the 375,000 threshold,
   and the nexus limb. Read together they are the whole argument: the
   individual is out at any size, the company is in but usually at 0%, and
   the offshore company is in and has to register. */
export const STATUTORY = [
  { key: "rate0", claim: "0% (zero percent) on the portion of the Taxable Income not exceeding the amount specified in a decision issued by the Cabinet", instrument: "ctLaw" },
  { key: "rate9", claim: "9% (nine percent) on Taxable Income that exceeds the amount specified in a decision issued by the Cabinet", instrument: "ctLaw" },
  { key: "nexusLimb", claim: "Has a nexus in the State as specified in a decision issued by the Cabinet at the suggestion of the Minister", instrument: "ctLaw" },
  { key: "band", claim: "the portion of Taxable Income of the Taxable Person not exceeding (375,000) three hundred seventy-five thousand dirhams shall be subject to Corporate Tax at the rate of (0%) zero percent", instrument: "threshold" },
  { key: "above", claim: "the Taxable Income of a Taxable Person that exceeds the amount of (375,000) three hundred seventy-five thousand dirhams shall be subject to Corporate Tax at (9%) nine percent", instrument: "threshold" },
  { key: "npThreshold", claim: "shall be subject to Corporate Tax only where the total Turnover derived from such Businesses or Business Activities exceeds AED 1,000,000", instrument: "naturalPersons" },
  { key: "npCarveOut", claim: "shall not be considered as Businesses or Business Activities conducted by a resident or non-resident natural person subject to Corporate Tax, regardless of the amount of Turnover derived from such activities", instrument: "naturalPersons" },
  { key: "npLicence", claim: "the sale, leasing, sub-leasing, and renting of land or real estate property in the State that is not conducted, or does not require to be conducted through a Licence from a Licensing Authority", instrument: "naturalPersons" },
  { key: "npNoRegister", claim: "shall not be required to register for Corporate Tax", instrument: "naturalPersons" },
  { key: "nexusProperty", claim: "It derives income from any Immovable Property in the State, and this shall include income derived from the right in rem, sale, disposal, assignment of rights therein, direct use, letting, including subletting and any other form of exploitation of Immovable Property", instrument: "nexus" },
  { key: "nexusRegister", claim: "shall be required to register for Corporate Tax with the Authority in accordance with Article (51) of the Corporate Tax Law", instrument: "nexus" },
  { key: "nexusRepeal", claim: "shall be repealed but it shall continue to apply to Tax Periods that commenced before 1 January 2025", instrument: "nexus" },
];

/* The statutory constants. Every figure below is derived from these three
   and from the acquisition module's unit, so there is nothing to retype. */
export const RATE = 0.09;
export const BAND = 375000;
export const NP_TURNOVER = 1000000;

const pct = (n) => Number((n * 100).toFixed(2));

/* Corporate tax on a given taxable income, which is the whole charge in one
   line: nothing up to the band, nine percent of the excess above it. */
export function tax(taxableIncome) {
  const above = Math.max(0, taxableIncome - BAND);
  return {
    taxableIncome,
    above,
    tax: Math.round(above * RATE),
    effective: pct(Math.round(above * RATE) / taxableIncome),
  };
}

/* The unit this site prices everywhere, and what one of it earns. The
   company is given the same net operating income as the individual, which
   flatters the company: its own running costs would reduce taxable income,
   but they are a cash cost first and a deduction second. */
export function unit(i = aq.EXAMPLE) {
  const o = aq.operating(i);
  const y = aq.yields(i);
  return { price: i.price, rent: i.rent, noi: o.net, outlay: y.outlay, net: y.net, onPrice: y.onPrice };
}

/* How many of that unit it takes to reach the band, which is the figure the
   pitch and the counter-pitch both leave out. */
export function bandScale(i = aq.EXAMPLE) {
  const u = unit(i);
  const exact = BAND / u.noi;
  const units = Math.ceil(exact);
  return {
    units,
    exact: Number(exact.toFixed(2)),
    price: Math.round(exact * u.price),
    atUnits: Math.round(units * u.price),
    noiAtUnits: units * u.noi,
  };
}

export const SCALE_UNITS = [1, 3, 6, 10, 20, 50];

/* What 9% above a 375,000 band actually costs, by portfolio size, in the
   three units a reader cares about: dirhams, share of the income it is
   charged on, and percentage points of net yield. */
export function scale(units = SCALE_UNITS, i = aq.EXAMPLE) {
  const u = unit(i);
  return units.map((n) => {
    const noi = n * u.noi;
    const t = tax(noi);
    return {
      units: n,
      price: n * u.price,
      noi,
      above: t.above,
      tax: t.tax,
      shareOfNoi: pct(t.tax / noi),
      netAfter: pct((noi - t.tax) / (n * u.outlay)),
      yieldCost: Number((u.net - pct((noi - t.tax) / (n * u.outlay))).toFixed(2)),
    };
  });
}

/* The ceiling. As the portfolio grows the band stops mattering and the
   charge converges on nine percent of net operating income, so this is the
   most corporate tax can ever cost this unit's economics however large the
   company gets. It is the number that decides whether any of this is worth
   restructuring for. */
export function ceiling(i = aq.EXAMPLE) {
  const u = unit(i);
  const netAfter = pct((u.noi * (1 - RATE)) / u.outlay);
  return {
    shareOfNoi: pct(RATE),
    net: u.net,
    netAfter,
    points: Number((u.net - netAfter).toFixed(2)),
  };
}
