/* Transaction cost drag, and the hold period it implies.

   Every page on this question says the same two things: that buying and
   selling costs "around seven to ten per cent" in Dubai, and that the cost
   is therefore amortised away by holding for the long term. The first is a
   range standing in for an arithmetic nobody ran. The second is true of the
   annualised figure and is quietly assumed to be true of the decision, which
   is a different claim and, on the official index, not one the record
   supports.

   So this module does two things.

   It takes the round trip from the instruments rather than from a range.
   Entry, mortgage registration and exit are already computed line by line in
   acquisition.mjs and disposal.mjs, each line traced to the resolution,
   Central Bank appendix or Land Department service page that sets it. Here
   they are only added up and divided, so the figure on the page cannot drift
   from the schedules behind it.

   Then it asks what the published record actually did. Dividing a fixed cost
   by a longer holding period obviously lowers the annual figure; that is
   arithmetic and it is not in dispute. The question a buyer has is whether
   holding longer made it more likely that the sale cleared the round trip,
   and that is answerable against the Dubai Land Department's own residential
   sale index rather than by assertion. Every entry month in the published
   series is run forward by each hold length and scored against the rise the
   break-even needs.

   The answer is not the reassuring one, which is the reason to publish it.
   It is also a single market's single cycle measured in overlapping windows,
   so the caveats are carried in the returned object rather than left to the
   prose to remember. */

import { EXAMPLE as BUY, acquisition, mortgageCosts, operating, money } from "./acquisition.mjs";
import { SELLER, sellerStack, roundTrip, breakEven } from "./disposal.mjs";

export const INSTRUMENTS = {
  dldIndex: {
    name: "Dubai Land Department, Residential Properties Sale Index (Data Dubai)",
    url: "https://data.dubai/en/l/468732",
  },
  feesResolution: {
    name: "Executive Council Resolution No. (30) of 2013 Approving Fees of the Land Department",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/ECR%2030%20of%202013.html",
  },
  cbuaeCaps: {
    name: "Central Bank of the UAE, Amendments to Appendix 2 of the Regulations Regarding Bank Loans & Other Services Offered to Individual Customers (Regulation No. 29/2011), in force 8 October 2019",
    url: "https://rulebook.centralbank.ae/en/entiresection/4406",
  },
};

/* The hold lengths the page tabulates. Ten years is the outside limit the
   published series can score at all, and the table says so rather than
   running off the end of the data. */
export const HOLDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/* The round trip, in and out at the same price, with a mortgage on both
   sides. Nothing is typed here: each component is the total of a schedule
   computed elsewhere. */
export function trip(s = SELLER) {
  return roundTrip(s);
}

/* Buying for cash is a smaller round trip, and the difference is exactly the
   cost of registering and releasing the debt. Worth separating, because a
   cash buyer reading a mortgaged figure is over-stating their own exit. */
export function cashTrip(s = SELLER) {
  const buy = acquisition({ ...BUY, price: s.price }).total;
  const sell = sellerStack({ ...s, outstanding: 0 });
  /* With no mortgage there is no early settlement, no release and no bank
     letters, so the exit is the commission alone. */
  const exit = sell.agency;
  const total = buy + exit;
  const noi = operating().net;
  return {
    buy, exit, total,
    rate: Number(((total / s.price) * 100).toFixed(2)),
    years: Number((total / noi).toFixed(2)),
    noi,
  };
}

/* Annualised drag is the round trip divided by the years it is spread over.
   This is the part of the conventional argument that is simply true. */
export function drag(years, s = SELLER) {
  if (!(years > 0)) throw new Error("holdperiod: drag needs a positive number of years");
  return Number((trip(s).rate / years).toFixed(2));
}

export function dragTable(s = SELLER) {
  return HOLDS.map((y) => [y, drag(y, s)]);
}

const monthOf = (iso) => +iso.slice(0, 4) * 12 + +iso.slice(5, 7);

/* Every entry month in the published series, run forward by one hold length
   and scored against the rise the break-even needs. Overlapping windows, so
   `independent` is returned alongside `n` and the page is required to quote
   both. */
export function outcomes(pi, key = "all", s = SELLER) {
  const series = pi?.byKey?.[key];
  if (!series?.points?.length)
    throw new Error(`holdperiod: the price index analysis carries no ${key} points`);
  const need = 1 + breakEven(s).rise / 100;
  const points = series.points;
  const value = new Map(points.map((p) => [monthOf(p[0]), p[1]]));

  const rows = [];
  for (const years of HOLDS) {
    const n = years * 12;
    let total = 0, covered = 0, worst = Infinity, worstAt = null, best = -Infinity;
    for (const [iso, start] of points) {
      const end = value.get(monthOf(iso) + n);
      if (end === undefined) continue;
      total++;
      const ratio = end / start;
      if (ratio >= need) covered++;
      if (ratio < worst) { worst = ratio; worstAt = iso; }
      if (ratio > best) best = ratio;
    }
    /* A hold length the series cannot score at all must not reach the page as
       a zero that reads like a finding. */
    if (!total)
      throw new Error(`holdperiod: the published series is too short to score a ${years} year hold`);
    rows.push({
      years, n: total,
      covered,
      share: Math.round((covered / total) * 100),
      worst: Number(((worst - 1) * 100).toFixed(1)),
      worstAt,
      best: Number(((best - 1) * 100).toFixed(1)),
      independent: Number((total / (years * 12)).toFixed(1)),
    });
  }
  return { key, label: series.label, need: Number(((need - 1) * 100).toFixed(2)), rows, months: pi.months, from: pi.first, to: pi.last };
}

/* The flat stretch is the finding: between these two hold lengths the share
   of holds that cleared the round trip did not improve. Derived, so a revised
   series moves the claim instead of leaving it in print. */
export function plateau(o) {
  const mid = o.rows.filter((r) => r.years >= 3 && r.years <= 8);
  const shares = mid.map((r) => r.share);
  return {
    from: mid[0].years,
    to: mid.at(-1).years,
    low: Math.min(...shares),
    high: Math.max(...shares),
    spread: Math.max(...shares) - Math.min(...shares),
    oneYear: o.rows.find((r) => r.years === 1).share,
    ten: o.rows.find((r) => r.years === 10).share,
    deepest: mid.reduce((m, r) => (r.worst < m.worst ? r : m), mid[0]),
  };
}

/* How long the market spent below its own peak. A hold period is only a plan
   if it is longer than the time you might have to wait, and this is the one
   measured instance the published series contains. */
export function slide(pi) {
  if (!pi?.peak || !pi?.trough || !pi?.recovered)
    throw new Error("holdperiod: the price index analysis carries no peak, trough and recovery");
  return {
    peak: pi.peak,
    trough: pi.trough,
    toTrough: monthOf(pi.trough.date) - monthOf(pi.peak.date),
    toRecover: pi.recovered.months,
    fall: Number(((pi.trough.value / pi.peak.value - 1) * 100).toFixed(1)),
  };
}

export { money, breakEven };
