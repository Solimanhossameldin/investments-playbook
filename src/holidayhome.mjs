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
