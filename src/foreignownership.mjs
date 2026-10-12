/* Who may own Dubai property, and where, and what a term-limited interest in
   it is actually worth.

   Every page on this query answers it with a list of community names. The
   lists run to thirty or forty entries, they name places the designating
   instrument does not mention, they carry no source, and they are undated,
   which for a list that can only change by a decision of the Ruler is the
   defect that matters most.

   The instrument is Regulation No. (3) of 2006. It does not designate
   communities. It designates numbered land plots inside twenty-three named
   areas, "as shown by the maps issued by the Department", and it contains no
   article permitting its own amendment: Law No. (7) of 2006 reserves the
   designation to the Ruler, so the register rather than any list is the only
   current answer to whether one specific unit can be foreign-owned.

   The second half of this module is arithmetic rather than law. Article 3
   grants three different interests in the same breath — freehold without
   time restriction, usufruct, and leasehold "for up to ninety-nine (99)
   years" — and Article 4 grants one plot the term-limited interests only.
   A term-limited interest in an income-producing asset is worth less than a
   perpetual one by an amount that is computable and that nobody computes.
   The ratio is the n-year annuity against the perpetuity at the same rate,
   which is 1 - (1 + r)^-n, and the discount it implies grows every year the
   term runs down.

   That is a valuation argument from first principles, not an observed market
   discount. The Dubai market does not visibly price leasehold this way and
   this module does not claim it does; what it claims is that the arithmetic
   exists and that a buyer should run it. The page says so in those terms. */

import { EXAMPLE, yields, money } from "./acquisition.mjs";

export const INSTRUMENTS = {
  reg3: {
    name: "Regulation No. (3) of 2006 Determining Areas for Ownership by Non-UAE Nationals of Real Property in the Emirate of Dubai, Articles 3, 4 and 5",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2006/Regulation%20No.%20(3)%20of%202006.html",
  },
};

/* The claims the page must carry word for word, each a phrase from the
   regulation itself. The plot-level grant and the maps clause are the two
   that every competing page contradicts by implication, so they are the two
   the suite will not let this page lose. */
export const STATUTORY = [
  { key: "plotLevelGrant", claim: "with respect to the land plot(s) indicated opposite each of the following areas", instrument: "reg3" },
  { key: "mapsGovern", claim: "as shown by the maps issued by the Department", instrument: "reg3" },
  { key: "freeholdWithoutTime", claim: "freehold ownership rights over Real Property without time restriction", instrument: "reg3" },
  { key: "termLimit", claim: "leasehold rights for up to ninety-nine (99) years", instrument: "reg3" },
  { key: "nadAlShebaCarveOut", claim: "in plot no. (224) of the Nad al-Sheba area", instrument: "reg3" },
  { key: "commencement", claim: "will come into force on the day on which it is published", instrument: "reg3" },
];

/* Article 3, transcribed. The plot numbers are the regulation's own, in the
   regulation's own order, and they are held here rather than typed into the
   page so that the page's table cannot drift away from them. */
export const DESIGNATED = [
  ["Umm Hurair 2", ["013"]],
  ["Al Barsha South 2", ["002"]],
  ["Al Barsha South 3", ["002"]],
  ["Emirates Hills 1", ["004", "814"]],
  ["Emirates Hills 2", ["001", "049"]],
  ["Emirates Hills 3", ["001"]],
  ["Jebel Ali", ["051", "074", "081", "082", "083", "084", "142", "143", "391"]],
  ["Al Jaddaf", ["003", "007", "008"]],
  ["The World Islands", ["001"]],
  ["Ras al Khor", ["165"]],
  ["Al Rowyah", ["063", "065"]],
  ["Sheikh Zayed Road", ["118", "147"]],
  ["Sofouh 1", ["069"]],
  ["Sofouh 2", ["005"]],
  ["Al-Qouz 3", ["005", "006"]],
  ["Al-Qouz Industrial Area 2", ["010", "030"]],
  ["Al-Qouz Industrial Area 3", ["028"]],
  ["Mirdif", ["143", "144"]],
  ["Dubai Marina", ["007", "014", "015", "033"]],
  ["Palm Jebel Ali", ["001"]],
  ["Palm Jumairah", ["001"]],
  ["Nad al-Sheba", ["209", "215", "222"]],
  ["Warsan 1", ["002"]],
];

/* Article 4's separate, lesser grant: the term-limited interests only, over
   one plot, with no freehold. It is the regulation's own proof that the three
   interests in Article 3 are not interchangeable. */
export const USUFRUCT_ONLY = ["Nad al-Sheba", "224"];

export const MAX_TERM = 99;
export const GRANT_YEAR = 2006;

export const areaCount = () => DESIGNATED.length;
export const plotCount = () => DESIGNATED.reduce((n, [, p]) => n + p.length, 0);

/* The capitalisation rate the discount is taken at: the illustrative unit's
   net income over its price alone, which is the yield a valuer would
   capitalise. Using the net-of-acquisition-cost yield instead would discount
   the leasehold at a rate the freehold comparison does not share. */
export function capRate(i = EXAMPLE) {
  return yields(i).onPrice;
}

/* A term of n years against a perpetuity at the same rate. Returns the
   fraction of freehold value the term-limited interest is worth. */
export function termFraction(n, rate) {
  const r = rate / 100;
  return 1 - Math.pow(1 + r, -n);
}

export function termValue(n, i = EXAMPLE) {
  const rate = capRate(i);
  const fraction = termFraction(n, rate);
  const value = Math.round(i.price * fraction);
  return {
    years: n,
    fraction,
    pct: fraction * 100,
    value,
    discount: i.price - value,
  };
}

export const TERMS = [99, 90, 79, 50, 30, 20, 10];

export function ladder(i = EXAMPLE) {
  return TERMS.map((n) => termValue(n, i));
}

/* The term left on a lease granted when the regulation came into force, read
   at a given year. A 99-year term granted in 2006 is not a 99-year term now,
   and the discount the arithmetic implies has been growing the whole time. */
export function remainingTerm(asOfYear) {
  return GRANT_YEAR + MAX_TERM - asOfYear;
}

export { money };
