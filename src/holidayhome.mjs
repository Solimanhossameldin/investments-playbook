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
