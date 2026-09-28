/* Dubai holiday home statutory costs, and the arithmetic of the short let
   against the annual tenancy.

   Every competing page on this question quotes permit fees and tourism
   charges with no source at all, and several of them quote figures that
   contradict each other. The figures below come from the instruments that
   set them, published on the Dubai Legislation portal, and each one carries
   the instrument that is its authority.

   The module exists so the numbers live in one place. The playbook prose
   has to carry these exact claims and these computed totals or the suite
   fails, which is what stops a page and its own arithmetic drifting apart
   the first time somebody edits one line of a table. */

export const INSTRUMENTS = {
  tourismDirham: {
    name: "Executive Council Resolution No. (2) of 2014, Schedule 1",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2014/Executive%20Council%20Resolution%20No.%20(2)%20of%202014.pdf",
  },
  feesAndFines: {
    name: "Executive Council Resolution No. (49) of 2014, Schedules 1 and 2",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2014/Executive%20Council%20Resolution%20No.%20(49)%20of%202014.html",
  },
  bylaw: {
    name: "Administrative Resolution No. (1) of 2020, the bylaw implementing Decree No. (41) of 2013",
    url: "https://dlp.dubai.gov.ae/en/Pages/HTMLViewer.aspx?file=UmVzb2x1dGlvbiBOby4gKDEpIG9mIDIwMjA%3D&year=2020",
  },
};

/* `claim` is the exact wording the playbook has to carry. It is not a
   label for a number, it is the sentence fragment a reader would quote,
   which is the thing that has to stay true. */
export const STATUTORY = [
  { key: "permit", claim: "AED 300 per bedroom", instrument: "feesAndFines" },
  { key: "permitCap", claim: "capped at AED 1,200 a year", instrument: "feesAndFines" },
  { key: "inspection", claim: "AED 300 per unit", instrument: "feesAndFines" },
  { key: "tourismStandard", claim: "AED 10 per occupied room per night", instrument: "tourismDirham" },
  { key: "tourismDeluxe", claim: "AED 15 per occupied room per night", instrument: "tourismDirham" },
  { key: "remittance", claim: "before the sixteenth day of the month following collection", instrument: "tourismDirham" },
  { key: "utilitiesFine", claim: "AED 2,000 fine for charging a guest for electricity or water", instrument: "feesAndFines" },
  { key: "unlicensedFine", claim: "AED 5,000 fine for operating without a licence", instrument: "feesAndFines" },
  { key: "wholeUnits", claim: "AED 500 fine for letting rooms or beds rather than the whole unit", instrument: "feesAndFines" },
];

export const TOURISM_DIRHAM = { standard: 10, deluxe: 15 };
export const PERMIT_PER_BEDROOM = 300;
export const PERMIT_CAP = 1200;

/* The worked example. Illustrative unit, stated assumptions, real statute.
   Nothing here is a market observation and the page says so. */
export const EXAMPLE = {
  longLet: {
    rent: 105000,
    serviceCharge: 14000,
    managementRate: 0.05,
    maintenance: 3000,
    vacancyRate: 0.04,
  },
  shortLet: {
    bedrooms: 1,
    classification: "standard",
    nightlyRate: 750,
    occupancy: 0.70,
    operatorRate: 0.20,
    cleaningPerStay: 150,
    averageStayNights: 3,
    utilities: 18000,
    serviceCharge: 14000,
    maintenance: 8000,
    furnishing: 75000,
    refurbishmentYears: 5,
  },
};

export function longLetNet(i = EXAMPLE.longLet) {
  const management = Math.round(i.rent * i.managementRate);
  const vacancy = Math.round(i.rent * i.vacancyRate);
  const lines = [
    ["Service charge", i.serviceCharge],
    ["Letting and management", management],
    ["Maintenance reserve", i.maintenance],
    ["Vacancy allowance", vacancy],
  ];
  const deductions = lines.reduce((a, [, v]) => a + v, 0);
  return { gross: i.rent, lines, deductions, net: i.rent - deductions };
}

export function shortLetNet(i = EXAMPLE.shortLet) {
  const nights = Math.floor(365 * i.occupancy);
  const gross = i.nightlyRate * nights;
  const stays = Math.round(nights / i.averageStayNights);
  const dirhamRate = TOURISM_DIRHAM[i.classification];
  const permit = Math.min(PERMIT_PER_BEDROOM * i.bedrooms, PERMIT_CAP);
  const furnishingPerYear = Math.round(i.furnishing / i.refurbishmentYears);
  const lines = [
    ["Operator and platform", Math.round(gross * i.operatorRate)],
    ["Cleaning", stays * i.cleaningPerStay],
    ["Utilities, cooling, internet, consumables", i.utilities],
    ["Tourism dirham", dirhamRate * nights],
    ["Holiday home permit", permit],
    ["Service charge", i.serviceCharge],
    ["Maintenance and replacement", i.maintenance],
    ["Furnishing, amortised", furnishingPerYear],
  ];
  const deductions = lines.reduce((a, [, v]) => a + v, 0);
  return { nights, stays, gross, lines, deductions, net: gross - deductions, permit, furnishingPerYear, dirhamRate };
}

/* What has to be true for the short let to merely draw level with the
   annual tenancy. Costs split three ways: a share of gross, an amount per
   night, and a fixed annual block that does not care how busy you are. */
export function shape(i = EXAMPLE.shortLet) {
  const s = shortLetNet(i);
  const perNight = TOURISM_DIRHAM[i.classification] + i.cleaningPerStay / i.averageStayNights;
  const fixed = i.utilities + s.permit + i.serviceCharge + i.maintenance + s.furnishingPerYear;
  return { perNight, fixed, grossShare: i.operatorRate, nights: s.nights };
}

/* The first whole dirham of nightly rate at which the short let clears the
   annual tenancy. Solved by search for the same reason as the night count:
   a closed form rounds, and a rounded answer that is twenty six dirhams
   short of clearing is not a break even. */
export function breakEvenNightlyRate(target, i = EXAMPLE.shortLet) {
  for (let r = 1; r <= 100000; r++) if (shortLetNet({ ...i, nightlyRate: r }).net >= target) return r;
  return null;
}

/* Solved by search against the same line items the table prints, rather than
   against a tidier linear model, so the answer is the night on which the
   published arithmetic actually crosses over and not an approximation of it. */
export function breakEvenNights(target, i = EXAMPLE.shortLet) {
  for (let n = 1; n <= 365; n++) if (netAtNights(n, i) >= target) return n;
  return null;
}

export function netAtNights(nights, i = EXAMPLE.shortLet) {
  return shortLetNet({ ...i, occupancy: nights / 365 }).net;
}

export function netAtOccupancy(occupancy, i = EXAMPLE.shortLet) {
  return shortLetNet({ ...i, occupancy }).net;
}

export const money = (n) => Number(n).toLocaleString("en-US");

/* ---- break-even occupancy, and the benchmark almost every page gets wrong ----

   Break-even occupancy is normally computed against zero: the share of the
   year at which income stops being less than cost. For a holiday home that
   is the wrong benchmark, because the alternative to an empty short let is
   not an empty flat. It is the annual tenancy the owner gave up in order to
   run one, which pays a known net with no nights to sell. So there are two
   break-evens here, and the distance between them is the whole argument:
   the first says when the unit stops losing money, and the second says when
   the work was worth doing.

   The shape of the costs is what makes the gap large. One block is a share
   of gross, one block is per night, and one block is fixed, and only the
   third is recovered by occupancy. The per-night block matters structurally
   rather than in size: the tourism dirham is a statutory charge that falls
   on occupied nights, so it reduces what each night contributes instead of
   raising what the year has to recover. A page that files it with the
   permit as an annual cost of compliance has put it on the wrong side of
   the division.

   Everything below is solved by search against the same line items the
   page prints, for the reason the night count already is: the module
   rounds stays and nights, so a closed form agrees with the table only
   approximately, and an answer that is a dirham short of clearing is not
   a break even. */

/* What one more night sold adds, after the operator's share of it and the
   per-night charges on it. It is the number the fixed block is recovered at,
   and the reason a nightly rate below a floor can never clear at any
   occupancy: 365 nights of too small a contribution is still too small. */
export function contributionPerNight(i = EXAMPLE.shortLet) {
  return Math.round(i.nightlyRate * (1 - i.operatorRate) - shape(i).perNight);
}

export function breakEvenOccupancy(target, i = EXAMPLE.shortLet) {
  const n = breakEvenNights(target, i);
  return n === null ? null : n / 365;
}

/* The frontier: at a given nightly rate, the nights that clear the target.
   null where no occupancy in the year does, which is a real answer and the
   one an operator's forecast is least likely to volunteer. */
export function breakEvenNightsAtRate(target, rate, i = EXAMPLE.shortLet) {
  return breakEvenNights(target, { ...i, nightlyRate: rate });
}

/* The lowest whole dirham of nightly rate at which a full year clears the
   target at all. Below it the question of occupancy does not arise. */
export function lowestViableRate(target, i = EXAMPLE.shortLet) {
  for (let r = 1; r <= 100000; r++) {
    if (breakEvenNightsAtRate(target, r, i) !== null) return r;
  }
  return null;
}

/* The statutory share of the fixed annual block. Published because the
   instinct it corrects is the common one: the permit is the cost people
   expect to be the obstacle, and it is the smallest line in the block. */
export function statutoryFixed(i = EXAMPLE.shortLet) {
  return Math.min(PERMIT_PER_BEDROOM * i.bedrooms, PERMIT_CAP);
}

/* ---- observed market data, and the denominator nobody states ----

   Everything above is an illustrative unit. The three firms that sell Dubai
   short-let data publish an emirate-wide average nightly rate and an
   emirate-wide average occupancy, and those two numbers are what an owner is
   actually quoted. They are published here so the frontier above can be run
   at an observed rate instead of an assumed one.

   Two cautions are structural rather than incidental, and the page states
   both. The cost stack these rates are run through belongs to the
   illustrative one bedroom, not to the average listing in the dataset. And
   the word "occupancy" does not mean the same thing in all three: AirDNA
   defines it as the share of *available* nights booked, which is not the
   share of the year, and a break-even measured against a twelve-month
   tenancy is measured against the year. Where a source publishes an annual
   revenue and a nightly rate, dividing the first by the second over 365
   recovers the calendar occupancy its own figures imply, which is the only
   basis on which the two can be compared. */

/* The conversion. The dirham is not floated against the dollar, so this is a
   published band rather than a market quote: the Central Bank's own
   intervention rates are USD/AED 3.672 buying and 3.673 selling, and the
   midpoint is used. A market rate would be spurious precision on a peg. */
export const AED_PER_USD = 3.6725;
export const PEG_SOURCE = {
  name: "Central Bank of the UAE, Domestic Market Operations, automatic intervention rates USD/AED 3.672 buying and 3.673 selling, retrieved 28 September 2026",
  url: "https://centralbank.ae/en/our-operations/monetary-policy-and-domestic-markets/domestic-market-operations/",
};

export const OBSERVED = [
  {
    key: "airdna",
    publisher: "AirDNA",
    period: "twelve months to August 2026",
    listings: 18879,
    adrUsd: 179,
    occupancy: 0.69,
    basis: "share of available nights booked",
    revenueUsd: 37400,
    source: {
      name: "AirDNA, Dubai short-term rental overview, trailing twelve months to August 2026, page updated 22 September 2026, retrieved 28 September 2026",
      url: "https://www.airdna.co/vacation-rental-data/app/ae/default/dubai/overview",
    },
  },
  {
    key: "airroi",
    publisher: "AirROI",
    period: "August 2025 to July 2026",
    listings: 20018,
    adrUsd: 286,
    occupancy: 0.399,
    basis: "not stated",
    revenueUsd: 20441,
    revparUsd: 112,
    source: {
      name: "AirROI, Dubai Airbnb market report, 2026 dataset covering August 2025 to July 2026, page updated 12 September 2026, retrieved 28 September 2026",
      url: "https://www.airroi.com/airbnb-data/united-arab-emirates/dubai/dubai",
    },
  },
  {
    key: "airbtics",
    publisher: "Airbtics",
    period: "February 2025 to January 2026",
    listings: 22719,
    adrAed: 638,
    occupancy: 0.73,
    basis: "not stated",
    revenueAed: 172000,
    revenueIsMedian: true,
    source: {
      name: "Airbtics, Dubai Airbnb data, revenue for February 2025 to January 2026 and rate and occupancy as at January 2026, data dated 12 March 2026, retrieved 28 September 2026",
      url: "https://airbtics.com/annual-airbnb-revenue-in-dubai-united-arab-emirates/",
    },
  },
];

/* The two observed facts that decide whether the comparison is fair at all.
   The share of listings that are one bedroom says whether the illustrative
   unit is the typical one, and the average length of stay drives the cleaning
   cost, which the worked example assumes rather than observes. Both come from
   AirROI, which is the only one of the three that publishes them. */
export const OBSERVED_MIX = {
  oneBedroomShare: 0.511,
  oneAndTwoBedroomShare: 0.771,
  averageStayNights: 7.7,
  source: OBSERVED.find((o) => o.key === "airroi").source,
};

export const observedAdrAed = (o) => o.adrAed ?? Math.round(o.adrUsd * AED_PER_USD);
export const observedRevenueAed = (o) => o.revenueAed ?? Math.round(o.revenueUsd * AED_PER_USD);

/* The calendar occupancy a source's own two published figures imply. Annual
   revenue divided by a full year at the published nightly rate: an identity,
   not an estimate. Where it disagrees with the published occupancy, the
   published occupancy is on some other denominator. */
export function impliedCalendarOccupancy(o) {
  return observedRevenueAed(o) / (observedAdrAed(o) * 365);
}

/* One observed pair run through the same model the frontier uses, at a given
   average length of stay. Returns what the published occupancy earns on the
   illustrative unit and how that lands against the tenancy it replaced. */
export function observedRun(o, stayNights = EXAMPLE.shortLet.averageStayNights) {
  const i = { ...EXAMPLE.shortLet, nightlyRate: observedAdrAed(o), averageStayNights: stayNights };
  const tenancy = longLetNet().net;
  const nights = Math.floor(365 * o.occupancy);
  const net = netAtNights(nights, i);
  const nightsToBeat = breakEvenNights(tenancy, i);
  return {
    adr: observedAdrAed(o),
    nights,
    net,
    tenancy,
    versusTenancy: net - tenancy,
    nightsToCover: breakEvenNights(0, i),
    nightsToBeat,
    occupancyToBeat: nightsToBeat === null ? null : nightsToBeat / 365,
    contribution: contributionPerNight(i),
  };
}
