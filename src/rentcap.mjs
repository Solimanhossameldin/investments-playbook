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
};

export const STATUTORY = [
  { key: "tiers", claim: "no increase at all up to a maximum of twenty percent", instrument: "decree43" },
  { key: "indexIsTheReference", claim: "the Rent Index of the Emirate of Dubai approved by the Real Estate Regulatory Agency", instrument: "decree43" },
  { key: "renewalNotice", claim: "no less than ninety days before the date on which the lease contract expires", instrument: "tenancyLaw" },
  { key: "evictionNotice", claim: "at least twelve months before the date of eviction", instrument: "tenancyLaw" },
  { key: "service", claim: "served through a Notary Public or by registered mail", instrument: "tenancyLaw" },
  { key: "smartIndex", claim: "launched on 2 January 2025", instrument: "smartIndex" },
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
