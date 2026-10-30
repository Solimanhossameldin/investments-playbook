/* Dubai against London, for the owner the comparison is usually made for:
   somebody who lives in Dubai and is deciding where to put the next flat.

   Every page ranking on this query does one of two things. It prints gross
   yields side by side, Dubai at seven and London at four, and stops, which
   compares two numbers neither owner will ever receive. Or it runs a worked
   example with the stamp duty wrong: the most thorough of them still
   charges the 3% additional property surcharge that was replaced by 5% in
   October 2024, and none of them adds the 2% non-resident surcharge, which
   is the one that applies to the reader in Dubai. Not one names the April
   2027 property income rates, which are already legislated policy.

   The arithmetic here takes the London flat at the Office for National
   Statistics' own London averages rather than a brokerage's "typical"
   yield, and gives it exactly the same running cost ratio as the Dubai
   unit on the net rental yield page. That is a deliberate choice: it
   removes every difference that is a matter of opinion, so what is left
   is only what the two governments set. The London side is flattered by
   it, and the page says so.

   The finding is in the last function. Cross where the owner lives with
   where the flat is, and Dubai's lead is 1.91 points of net yield for an
   owner who lives in Dubai and 0.75 for a UK higher rate taxpayer. Most of
   the headline gap belongs to the owner's residence, not to the building,
   and the function computes both leads rather than asserting either. */

import * as aq from "./acquisition.mjs";
import * as ht from "./hometax.mjs";

export const INSTRUMENTS = {
  sdlt: {
    name: "HM Revenue and Customs, Stamp Duty Land Tax: residential property rates",
    url: "https://www.gov.uk/stamp-duty-land-tax/residential-property-rates",
  },
  nrl: {
    name: "HM Revenue and Customs, Tax on your UK income if you live abroad: rent",
    url: "https://www.gov.uk/tax-uk-income-live-abroad/rent",
  },
  cgt: {
    name: "HM Revenue and Customs, Capital Gains Tax: what you pay it on, rates and allowances",
    url: "https://www.gov.uk/capital-gains-tax/rates",
  },
  nrcgt: {
    name: "HM Revenue and Customs, Tell HMRC about Capital Gains Tax on UK property or land if you're not a UK resident",
    url: "https://www.gov.uk/guidance/capital-gains-tax-for-non-residents-uk-residential-property",
  },
  rates2027: {
    name: "HM Treasury and HM Revenue and Customs, Change to tax rates for property, savings and dividend income: technical note, 26 November 2025",
    url: "https://www.gov.uk/government/publications/changes-to-tax-rates-for-property-savings-and-dividend-income/change-to-tax-rates-for-property-savings-and-dividend-income-technical-note",
  },
};

/* Claims the page carries word for word, in the instrument's own wording. */
export const STATUTORY = [
  { key: "additional", claim: "if buying a new residential property means you'll own more than one", instrument: "sdlt" },
  { key: "nonResident", claim: "You'll usually pay a 2% surcharge if you're buying a residential property in England or Northern Ireland", instrument: "sdlt" },
  { key: "dayCount", claim: "at least 183 days (6 months) during the 12 months before your purchase", instrument: "sdlt" },
  { key: "nrlDeduct", claim: "deduct basic rate tax from your rent (after allowing for any expenses they've paid)", instrument: "nrl" },
  { key: "nrlReturn", claim: "You need to declare your rental income in a Self Assessment tax return unless HMRC tells you not to", instrument: "nrl" },
  { key: "cgtAllowance", claim: "For the 2026 to 2027 tax year the allowance is £3,000", instrument: "cgt" },
  { key: "nrReport", claim: "have no tax to pay on the disposal", instrument: "nrcgt" },
  { key: "nr60", claim: "60 days of selling the property", instrument: "nrcgt" },
  { key: "rates2027", claim: "22% at the property basic rate, 42% at the property higher rate, and 47% at the property additional rate for 2027 to 2028", instrument: "rates2027" },
];

/* The London inputs, each taken from the release that actually prints it.

   The rent is the Office for National Statistics' Price Index of Private
   Rents average for London. The price is not, and the split is deliberate:
   the ONS bulletin gives London's annual change and its distance from the
   peak, but it never prints the level, so the level comes from the UK
   House Price Index summary that does print it, published by HM Land
   Registry on the same day from the same joint series.

   The figure this block carried until 30 October 2026 was wrong, and the
   error is worth recording rather than quietly overwriting. It read
   569,000 and dated it July 2026. That is the July 2025 peak. London's
   actual July 2026 average was 550,037, and its August 2026 average is the
   554,430 below. The mistake inflated the price by 3.4%, and with it the
   stamp duty, while deflating the gross yield, which is exactly the class
   of error this page exists to correct in other people's work. Both
   figures now come from a document that states them as levels.

   The two series are averages of different stocks of homes, the rented one
   and the sold one, and they carry different reference months. The page
   says both things. They remain the only London yield inputs this site is
   willing to quote, because nobody chose them in order to sell anything. */
export const ONS = {
  name: "Office for National Statistics, Private rent and house prices, UK: October 2026, released 21 October 2026, retrieved 30 October 2026",
  url: "https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/privaterentandhousepricesuk/october2026",
  monthlyRent: 2338,
  rentMonth: "September 2026",
  rentChange: 3.5,
  /* The bulletin's own London price commentary. The level is not here
     because the bulletin does not state one; these are the distances it
     states, and HPI.price below is the level they describe. */
  priceChange: -2.2,
  priceChangeMonth: "August 2026",
  peak: 569000,
  peakMonth: "July 2025",
  belowPeak: 15000,
  /* The line that matters most to a buyer of a flat, which is what this
     comparison buys: the London average is being pulled down by the half
     of it that the reader is actually shopping in. */
  flatsChange: -5.0,
};

/* The price level, from the release that prints it. Same joint series as
   the bulletin above, same publication day, different document. */
export const HPI = {
  name: "HM Land Registry, UK House Price Index summary: August 2026, released 21 October 2026, retrieved 30 October 2026",
  url: "https://www.gov.uk/government/statistics/uk-house-price-index-for-august-2026/uk-house-price-index-summary-august-2026",
  price: 554430,
  priceMonth: "August 2026",
};

/* Stamp Duty Land Tax, England, residential. `to` is the top of each band;
   surcharges are percentage points added to every band, including the one
   that is otherwise zero, which is why they bite hardest at the bottom. */
export const SDLT = {
  bands: [
    { to: 125000, rate: 0 },
    { to: 250000, rate: 0.02 },
    { to: 925000, rate: 0.05 },
    { to: 1500000, rate: 0.10 },
    { to: Infinity, rate: 0.12 },
  ],
  additional: 0.05,
  nonResident: 0.02,
};

export function sdlt(price, { additional = true, nonResident = true } = {}) {
  const add = (additional ? SDLT.additional : 0) + (nonResident ? SDLT.nonResident : 0);
  const lines = [];
  let from = 0;
  for (const b of SDLT.bands) {
    if (price <= from) break;
    const slice = Math.min(price, b.to) - from;
    const rate = Number((b.rate + add).toFixed(4));
    lines.push({ from, to: Math.min(price, b.to), slice, rate, tax: Math.round(slice * rate) });
    from = b.to;
  }
  const total = lines.reduce((a, l) => a + l.tax, 0);
  return { lines, total, rate: Number(((total / price) * 100).toFixed(2)) };
}

/* UK income tax on the rental profit. The basic rate is the Non-resident
   Landlord Scheme's withholding rate and the rate a Dubai resident with no
   other UK income pays on a profit this size; from 2027 to 2028 it is the
   property basic rate. The personal allowance is a separate row because
   eligibility for non-residents depends on citizenship and treaty, and the
   page cannot know which reader it has. */
export const UKTAX = {
  basic2026: 0.20,
  basic2027: 0.22,
  higher2026: 0.40,
  higher2027: 0.42,
  personalAllowance: 12570,
  cgtLow: 0.18,
  cgtHigh: 0.24,
  cgtAllowance: 3000,
};

const pct = (n) => Number((n * 100).toFixed(2));

/* The Dubai unit's running costs as a share of its rent, applied to the
   London rent. Same ratio, so the only differences left are statutory. */
export const costRatio = () => aq.operating().net / aq.EXAMPLE.rent;

export function london({ rate = UKTAX.basic2026, allowance = false, nonResident = true } = {}) {
  const rent = ONS.monthlyRent * 12;
  const noi = Math.round(rent * costRatio());
  const stamp = sdlt(HPI.price, { additional: true, nonResident });
  const outlay = HPI.price + stamp.total;
  const taxable = Math.max(0, noi - (allowance ? UKTAX.personalAllowance : 0));
  const tax = Math.round(taxable * rate);
  const kept = noi - tax;
  return {
    price: HPI.price, rent, noi, stamp: stamp.total, stampRate: stamp.rate, outlay, tax, kept,
    gross: pct(rent / HPI.price),
    onPrice: pct(noi / HPI.price),
    preTax: pct(noi / outlay),
    net: pct(kept / outlay),
    entryYears: Number((stamp.total / kept).toFixed(2)),
  };
}

/* The tax rows the page prints for the Dubai resident owning the London
   flat, in order: this year, this year with the allowance, from April 2027,
   from April 2027 with the allowance. */
export function taxRows() {
  return [
    { label: "2026 to 2027, basic rate, no personal allowance", ...london({ rate: UKTAX.basic2026 }) },
    { label: "2026 to 2027, basic rate, with personal allowance", ...london({ rate: UKTAX.basic2026, allowance: true }) },
    { label: "2027 to 2028, property basic rate, no personal allowance", ...london({ rate: UKTAX.basic2027 }) },
    { label: "2027 to 2028, property basic rate, with personal allowance", ...london({ rate: UKTAX.basic2027, allowance: true }) },
  ];
}

export function dubai() {
  const y = aq.yields();
  const a = aq.acquisition();
  return {
    price: aq.EXAMPLE.price, rent: aq.EXAMPLE.rent, noi: y.noi, stamp: a.transfer, entry: a.total,
    stampRate: pct(a.transfer / aq.EXAMPLE.price), entryRate: y.costRate,
    gross: y.gross, onPrice: y.onPrice, net: y.net, entryYears: aq.payback().entry,
  };
}

/* UK capital gains tax on a gain, after the annual exempt amount. The
   stamp duty is part of the acquisition cost, so it comes off the gain
   before the rate is applied; the function takes the gain already net of
   it and says so in its name. */
export function cgtOnNetGain(gain, rate) {
  return Math.round(Math.max(0, gain - UKTAX.cgtAllowance) * rate);
}

/* The four owners: where you live, crossed with where the flat is, at this
   year's rates and with no personal allowance. The UK resident is a higher
   rate taxpayer, whose allowance is spent on his salary; his London flat
   pays the additional property surcharge but not the non-resident one, and
   his Dubai flat is the residency page's number, computed there. */
export function matrix() {
  const d = dubai();
  const lNr = london({ rate: UKTAX.basic2026 });
  const lUk = london({ rate: UKTAX.higher2026, nonResident: false });
  const dUk = ht.afterTax("higher");
  return {
    dubaiResDubai: d.net,
    dubaiResLondon: lNr.net,
    ukResDubai: dUk.net,
    ukResLondon: lUk.net,
    gapIfDubaiRes: Number((d.net - lNr.net).toFixed(2)),
    gapIfUkRes: Number((dUk.net - lUk.net).toFixed(2)),
    ukStamp: lUk.stamp,
  };
}

export const money = aq.money;
export const pctText = aq.pctText;
