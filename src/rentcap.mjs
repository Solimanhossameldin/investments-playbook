/* Dubai rent increase caps, and what they do over more than one renewal.

   Every page on this query prints the same five-row table with no citation,
   and then a single one-year worked example. The table is the easy part. The
   part nobody publishes is what happens on the second renewal, and the third,
   because the tier is recalculated each year against a gap that your own
   increase has just narrowed.

   The tiers are Article 1 of Decree No. (43) of 2013. The notice periods are
   Law No. (26) of 2007 as amended by Law No. (33) of 2008. The figures live
   here so the page cannot state one thing and compute another. */

export const INSTRUMENTS = {
  decree43: {
    name: "Decree No. (43) of 2013, Articles 1 and 3",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/Decree%20No.%20(43)%20of%202013%20Determining%20Rent%20Increase%20for%20Real%20Property.pdf",
  },
  tenancyLaw: {
    name: "Law No. (33) of 2008 amending Law No. (26) of 2007, Articles 14 and 25",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2009/Law%20No.%20(33)%20of%202008%20Amending%20Law%20No.%20(26)%20of%202007.pdf",
  },
  smartIndex: {
    name: "Dubai Media Office, Dubai Land Department launches the Smart Rental Index 2025",
    url: "https://mediaoffice.ae/en/news/2025/january/02-01/smart-rental",
  },
  decree26: {
    name: "Decree No. (26) of 2013 concerning the Rent Disputes Settlement Centre, Articles 10, 17 and 23",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/Decree%2026%20of%202013.html",
  },
  rdcFees: {
    name: "Rental Disputes Centre, published fees for registering a claim",
    url: "https://rdc.gov.ae/en/frequently-asked-questions/",
  },
};

export const STATUTORY = [
  { key: "tiers", claim: "no increase at all up to a maximum of twenty percent", instrument: "decree43" },
  { key: "indexIsTheReference", claim: "the Rent Index of the Emirate of Dubai approved by the Real Estate Regulatory Agency", instrument: "decree43" },
  { key: "renewalNotice", claim: "no less than ninety days before the date on which the lease contract expires", instrument: "tenancyLaw" },
  { key: "evictionNotice", claim: "at least twelve months before the date of eviction", instrument: "tenancyLaw" },
  { key: "service", claim: "served through a Notary Public or by registered mail", instrument: "tenancyLaw" },
  { key: "smartIndex", claim: "launched on 2 January 2025", instrument: "smartIndex" },
  { key: "feeAuthority", claim: "as determined pursuant to a resolution of the Chairman of the Executive Council", instrument: "decree26" },
  { key: "settlementRefund", claim: "One-half of the fee will be refunded if amicable settlement is reached", instrument: "decree26" },
  { key: "mediationWindow", claim: "within a period not exceeding fifteen (15) days from the date of appearance of the parties", instrument: "decree26" },
  { key: "appealFloor", claim: "which will be final and not subject to any form of appeal", instrument: "decree26" },
  { key: "feeRate", claim: "3.5% of Annual Rent or Lease Value if it is more or less than a year", instrument: "rdcFees" },
  { key: "feeBounds", claim: "Fee not less than (AED 500) and not more than (AED 20,000)", instrument: "rdcFees" },
];

/* Article 1, in the order the decree writes it. `upTo` is the gap, expressed
   as a percentage below the index average, at or under which this band
   applies. The decree is written in whole percentages and says nothing about
   a gap of 10.4%, so the bands are read as continuous and the Land
   Department's own calculator is the authority on a boundary. */
export const TIERS = [
  { upTo: 10, increase: 0, wording: "up to ten percent (10%) less than the average rental value" },
  { upTo: 20, increase: 5, wording: "eleven percent (11%) to twenty percent (20%) less" },
  { upTo: 30, increase: 10, wording: "twenty-one percent (21%) to thirty percent (30%) less" },
  { upTo: 40, increase: 15, wording: "thirty-one percent (31%) to forty percent (40%) less" },
  { upTo: Infinity, increase: 20, wording: "more than forty percent (40%) less" },
];

export const NOTICE = { renewalDays: 90, evictionMonths: 12 };

export function gapPercent(rent, index) {
  return ((index - rent) / index) * 100;
}

export function permittedIncrease(rent, index) {
  const gap = gapPercent(rent, index);
  if (gap <= 0) return 0;
  return TIERS.find((t) => gap <= t.upTo).increase;
}

/* One renewal at a time, because that is how the decree works. Rents are
   rounded to the dirham the way a contract would be, and the next year's gap
   is measured from the rounded figure, so the schedule below is the one a
   landlord could actually serve. */
export function schedule({ rent, index, growth = 0, years = 12 }) {
  const rows = [];
  let r = rent;
  let idx = index;
  for (let y = 1; y <= years; y++) {
    const gap = gapPercent(r, idx);
    const inc = permittedIncrease(r, idx);
    rows.push({ year: y, index: Math.round(idx), rent: r, gap, increase: inc });
    r = Math.round(r * (1 + inc / 100));
    idx = idx * (1 + growth / 100);
  }
  return rows;
}

/* The first year on which no increase is permitted, given the year before it
   was. Under a flat index this is where the rent stops for good. */
export function stallsAt(rows) {
  for (let i = 1; i < rows.length; i++) if (rows[i].increase === 0) return rows[i];
  return null;
}

/* What the sitting tenancy costs against the same unit let at the index from
   day one. Counted over the years the schedule covers, plus the shortfall
   that is still running when it stops closing. */
export function shortfall(rows) {
  const perYear = rows.map((r) => Math.round(r.index - r.rent));
  return { perYear, total: perYear.reduce((a, b) => a + b, 0), ongoing: perYear[perYear.length - 1] };
}

export const money = (n) => Number(Math.round(n)).toLocaleString("en-US");
export const pc1 = (n) => `${n.toFixed(1)}%`;

/* ---- what it costs to refuse an increase that is over the cap ----

   The page above tells a reader that the permitted figure is not a
   negotiating position. That is true and it is not enough, because the
   remedy has a price and no page on this query names it.

   Decree No. (26) of 2013 does not set the price. Article 23 says the Centre
   charges fees "as determined pursuant to a resolution of the Chairman of the
   Executive Council", and the operative schedule is the one the Centre
   publishes. These are its figures. The thing that matters about them is the
   base: the registration fee is a percentage of the annual rent, not of the
   amount in dispute, so a small over-charge can cost more to refuse than to
   pay. */
export const DISPUTE = {
  ratePct: 3.5,
  min: 500,
  max: 20000,
  processService: 100,
  knowledge: 10,
  innovation: 10,
  settlementRefund: 0.5,
  mediationDays: 15,
  appealDays: 15,
  appealFloor: 100000,
};

/* Each line as the Centre states it, so the page cannot round one of them
   into a different fee. */
export const DISPUTE_LINES = [
  ["Registering the claim", "3.5% of Annual Rent or Lease Value if it is more or less than a year"],
  ["The floor and the ceiling on that fee", "Fee not less than (AED 500) and not more than (AED 20,000)"],
  ["Process service", "Process Service: AED 100"],
  ["Knowledge fee", "AED 10 Knowledge fee"],
  ["Innovation fee", "AED 10 Innovation fee"],
  ["If conciliation settles it", "half of the court fee paid for basic claims is refunded"],
];

export function registrationFee(annualRent) {
  const raw = (DISPUTE.ratePct / 100) * annualRent;
  return Math.round(Math.min(Math.max(raw, DISPUTE.min), DISPUTE.max));
}

export const disputeFixed = () => DISPUTE.processService + DISPUTE.knowledge + DISPUTE.innovation;

export function filingCost(annualRent, { settled = false } = {}) {
  const reg = registrationFee(annualRent);
  return Math.round((settled ? reg * DISPUTE.settlementRefund : reg) + disputeFixed());
}

/* The smallest over-charge worth refusing, counted over `years` of it. As a
   rate it is the registration percentage plus the fixed lines spread over the
   rent, which is why it barely moves with the size of the tenancy. */
export function breakEvenExcess(annualRent, { years = 1, settled = false } = {}) {
  const cost = filingCost(annualRent, { settled });
  return { cost, perYear: cost / years, pctOfRent: (cost / years / annualRent) * 100 };
}

/* Paying an increase that was never permitted does not cost the excess every
   year afterwards. The tier is recalculated against the gap, so the higher
   rent reaches the band where no increase is permitted sooner, and from that
   year on the tenant who overpaid pays less than the one who did not. Both
   paths are run from the same renewal under the same index. */
export function overCap({ rent, index, growth = 0, years = 12, demandedPct }) {
  const lawfulPct = permittedIncrease(rent, index);
  const lawfulRent = Math.round(rent * (1 + lawfulPct / 100));
  const demandedRent = Math.round(rent * (1 + demandedPct / 100));
  const idx1 = index * (1 + growth / 100);
  const lawful = schedule({ rent: lawfulRent, index: idx1, growth, years });
  const unlawful = schedule({ rent: demandedRent, index: idx1, growth, years });
  let running = 0;
  const rows = lawful.map((l, i) => {
    const excess = unlawful[i].rent - l.rent;
    running += excess;
    return { year: i + 1, lawful: l.rent, unlawful: unlawful[i].rent, excess, cumulative: running };
  });
  const peak = rows.reduce((a, b) => (b.cumulative > a.cumulative ? b : a), rows[0]);
  const settles = rows.find((r) => r.excess < 0) || null;
  return { lawfulPct, demandedPct, lawfulRent, demandedRent, rows, peak, settles };
}

/* The year the clawback has taken the whole of the overpayment back, found by
   running the ladder far enough out rather than by solving it, because the
   rounding each year is part of the answer. */
export function clawedBackBy(args) {
  const long = overCap({ ...args, years: 60 });
  const row = long.rows.find((r) => r.cumulative <= 0);
  return row ? row.year : null;
}

/* The percentage is only a percentage between these two rents. Below the
   first the floor is charged, above the second the ceiling, so for a very
   small or a very large tenancy the fee is flat and the break-even moves. */
export const feeFloorBelow = () => Math.ceil(DISPUTE.min / (DISPUTE.ratePct / 100));
export const feeCeilingAbove = () => Math.ceil(DISPUTE.max / (DISPUTE.ratePct / 100));

/* The fee against a spread of tenancy sizes, which is the table that shows
   the base is the rent and not the dispute. */
export function feeLadder(rents) {
  return rents.map((rent) => ({
    rent,
    registration: registrationFee(rent),
    contested: filingCost(rent),
    settled: filingCost(rent, { settled: true }),
    pctOfRent: (filingCost(rent) / rent) * 100,
  }));
}
