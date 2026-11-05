/* What it costs to sell the asset that funds a Dubai purchase, and to come
   home too soon afterwards.

   Two literatures again, and again they do not meet. The Dubai pages say the
   UAE charges nothing on a gain and stop. The UK accountancy pages explain
   the temporary non-residence rule, correctly, and print no number at all:
   they tell a reader the charge exists and leave him to guess whether it is
   worth arranging his life around. Nobody prices the decision.

   The decision is a date. A gain realised while non-resident is clawed back
   if the absence ends soon enough, and "soon enough" is written down: the
   temporary period of non-residence is 5 years or less. So the whole charge
   is the price of returning in year five rather than year six, and that
   price is computable from the gain alone.

   Two findings come out of doing it rather than describing it.

   The first is the size. At the 2026 to 2027 rates the charge is 24% of the
   gain less the annual exempt amount, so on a 400,000 pound gain it is
   95,280 pounds, and the effective rate on the whole gain never leaves the
   narrow band between 23% and 24% at any gain worth planning around. A
   reader who wanted to know whether this is a rounding error or a house
   deposit now knows, and no competing page tells him.

   The second is that the basic rate band cannot rescue him. Gains inside the
   basic rate band are charged at 18% rather than 24%, which sounds like a
   lever until it is multiplied out: the band is 37,700 and the gap is six
   points, so the most the band can ever be worth on a capital gain is 2,262
   pounds. On the 400,000 gain above that is 0.57 points of effective rate.
   It is the one variable a reader cannot pin down without knowing his own
   income in the year of return, and it is too small to change the answer,
   which is a more useful thing to be told than "it depends".

   The rule is deliberately rate-based and sterling-denominated. It is a UK
   charge, the site holds no sterling exchange rate it would stand behind,
   and converting it to dirhams would add an error term to a figure that is
   exact. */

export const INSTRUMENTS = {
  fa2013: {
    name: "Finance Act 2013, Schedule 45, Part 4, paragraphs 110 to 119, inserting sections 10A and 10AA of the Taxation of Chargeable Gains Act 1992",
    url: "https://www.legislation.gov.uk/ukpga/2013/29/schedule/45/part/4",
  },
  cgtRates: {
    name: "HM Government, Capital Gains Tax rates, tax year 6 April 2026 to 5 April 2027",
    url: "https://www.gov.uk/capital-gains-tax/rates",
  },
  cgtAllowances: {
    name: "HM Revenue and Customs, Capital Gains Tax rates and allowances, annual exempt amount for 2026 to 2027",
    url: "https://www.gov.uk/guidance/capital-gains-tax-rates-and-allowances",
  },
  nonResidentLand: {
    name: "HM Revenue and Customs, Tell HMRC about Capital Gains Tax on UK property or land if you are not a UK resident",
    url: "https://www.gov.uk/guidance/capital-gains-tax-for-non-residents-uk-residential-property",
  },
};

/* Claims the page carries word for word, in the instrument's own wording.

   The four that do the work are 110(1)(c), 110(1)(d), the charging words of
   section 10A(2) and the carve-out at 10AA(1)(a). Read together they are the
   whole rule: who it can reach, for how long, in which year the bill lands,
   and the one class of asset it cannot touch. The entry test is the claim
   most often got wrong in print, because it is not residence but sole UK
   residence, and a reader who checks the looser version against the statute
   will not find it. */
export const STATUTORY = [
  { key: "soleUkResidence", claim: "the individual has sole UK residence for a residence period", instrument: "fa2013" },
  { key: "fourOfSeven", claim: "at least 4 out of the 7 tax years immediately preceding the year of departure", instrument: "fa2013" },
  { key: "fiveYears", claim: "the temporary period of non-residence is 5 years or less", instrument: "fa2013" },
  { key: "chargeYear", claim: "accruing to the taxpayer in the period of return", instrument: "fa2013" },
  { key: "periodOfReturn", claim: "the first residence period after period A for which the individual has sole UK residence", instrument: "fa2013" },
  { key: "yearOfDeparture", claim: "is the tax year consisting of or including period A", instrument: "fa2013" },
  { key: "acquiredWhileAway", claim: "the asset was acquired by the taxpayer in the temporary period of non-residence", instrument: "fa2013" },
  { key: "treatyNonResident", claim: "resident in a country outside the UK for the purposes of double taxation arrangements", instrument: "fa2013" },
  { key: "assessmentWindow", claim: "before the end of the second anniversary of the 31 January next following the year of return", instrument: "fa2013" },
  { key: "higherRate", claim: "pay 24% on your gains from 6 April 2026", instrument: "cgtRates" },
  { key: "basicBand", claim: "the basic rate band for the 2026 to 2027 tax year", instrument: "cgtRates" },
  { key: "landReporting", claim: "must report disposals of UK property or land even if you", instrument: "nonResidentLand" },
  { key: "landDeadline", claim: "60 days of selling the property if the completion date was on or after 27 October 2021", instrument: "nonResidentLand" },
];

/* The 2026 to 2027 figures, as the rates and allowances pages print them,
   and the two integers out of paragraph 110. */
export const UK = {
  annualExemptAmount: 3000,
  higherRate: 0.24,
  basicRate: 0.18,
  basicRateBand: 37700,
  taxYear: "2026 to 2027",
};

export const RULE = {
  /* Paragraph 110(1)(d). The period that keeps a person inside the charge. */
  temporaryYears: 5,
  /* Paragraph 110(1)(c), and it is sole UK residence, not residence. */
  soleUkYears: 4,
  ofPrecedingYears: 7,
};

/* The charge on a gain treated as accruing in the period of return, at the
   higher rate, with the annual exempt amount applied once and nothing else
   using it. The caveat is the reader's and the page says so: a reader with
   other gains in the same year has already spent the allowance. */
export function chargeOn(gain, { rate = UK.higherRate, aea = UK.annualExemptAmount } = {}) {
  const taxable = Math.max(0, gain - aea);
  const tax = Math.round(taxable * rate);
  return {
    gain,
    taxable,
    tax,
    /* On the whole gain, not on the taxable slice. The allowance is what
       makes these two differ, and the gap closes as the gain grows, which
       is the only thing the allowance does at this scale. */
    effective: Number(((tax / gain) * 100).toFixed(2)),
  };
}

export function grid(gains = [100000, 250000, 400000, 500000, 1000000, 2000000]) {
  return gains.map((g) => chargeOn(g));
}

/* The most the basic rate band can ever be worth on a capital gain: the band
   times the gap between the two rates. Derived rather than typed, because
   the whole point of the figure is that a reader can check it. */
export function bandValue() {
  const gap = Number((UK.higherRate - UK.basicRate).toFixed(2));
  return {
    band: UK.basicRateBand,
    gap,
    gapPoints: Number((gap * 100).toFixed(0)),
    value: Math.round(UK.basicRateBand * gap),
  };
}

/* What the band is worth as points of effective rate on a given gain, which
   is the form that answers "could this change my decision". */
export function bandValueOn(gain) {
  const v = bandValue().value;
  return { value: v, points: Number(((v / gain) * 100).toFixed(2)) };
}

/* Section 10AA(5): the year of departure stays assessable until the second
   anniversary of the 31 January next following the year of return. A reader
   wants the date, not the formula, so this returns the date for a year of
   return given as the calendar year in which that tax year ends. */
export function assessmentDeadline(yearOfReturnEnds) {
  return { filingJanuary: yearOfReturnEnds + 1, deadline: `31 January ${yearOfReturnEnds + 3}` };
}

export const money = (n) =>
  Number(n).toLocaleString("en-GB", { maximumFractionDigits: 0 });
