/* Net rental yield in Dubai, and the fee schedule that sets its denominator.

   Every competing page on this query does the same two things. It writes the
   gross formula, and then it lists "DLD 4%, agency 2%" as round numbers with
   no source. The strongest of them publishes yields by community and cites
   nothing at all. Not one names the instrument behind a single fee, and not
   one says who the instrument makes liable for it.

   Two things fall out of reading the instrument rather than the leaflet.

   The 4% is not a buyer's fee. Article 3 of Executive Council Resolution
   No. (30) of 2013 makes it a joint liability, split equally, in the absence
   of an agreement to the contrary, and the Land Department's own service
   page prints it as 2% seller and 2% buyer. The market convention that the
   buyer carries all of it is a term of the sale contract, not a rule of law,
   and on a mid-market apartment it is the largest negotiable number in the
   whole stack.

   And the transaction stack is not where the yield goes. It is a one-off on
   the denominator; the running costs come out of the numerator every year.
   The arithmetic below puts a number on that ratio, and it is not close. */

export const INSTRUMENTS = {
  ecr30: {
    name: "Executive Council Resolution No. (30) of 2013 Approving Fees of the Land Department, Article 3 and Schedule",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/ECR%2030%20of%202013.html",
  },
  dldSale: {
    name: "Dubai Land Department, Property Sale Registration, service fees",
    url: "https://dubailand.gov.ae/en/eservices/property-sale-registration/",
  },
  dldMortgage: {
    name: "Dubai Land Department, Mortgage registration application, service fees",
    url: "https://dubailand.gov.ae/en/eservices/request-for-mortgage-registration/",
  },
  vat: {
    name: "Federal Decree-Law No. (8) of 2017 on Value Added Tax, Article 3",
    url: "https://tax.gov.ae/DataFolder/Files/Pdf/VAT-Decree-Law-No-8-of-2017.pdf",
  },
};

/* Claims the page has to carry word for word, each with the instrument that
   sets it. The wording is the instrument's own, not a paraphrase of it. */
export const STATUTORY = [
  { key: "transferFee", claim: "4% of the value of the sale contract", instrument: "ecr30" },
  { key: "whoPays", claim: "shared equally by the seller and purchaser", instrument: "ecr30" },
  { key: "mortgageFee", claim: "0.25% of the mortgage (debt) value", instrument: "ecr30" },
  { key: "dldSplit", claim: "2% of the sale value", instrument: "dldSale" },
  { key: "trusteeHigh", claim: "AED 4,000 + VAT If the sale value is AED 500,000 or more", instrument: "dldSale" },
  { key: "trusteeLow", claim: "AED 2,000 + VAT If the sale value is less than AED 500,000", instrument: "dldSale" },
  { key: "titleDeed", claim: "AED 250 Title Deed Certificate Issuance Fee", instrument: "dldSale" },
  { key: "mortgageTrustee", claim: "AED 4,000 service fee", instrument: "dldMortgage" },
];

/* The fee schedule, as amounts rather than as prose. Percentages are of the
   sale contract value; the flat fees are the Land Department's own service
   page, which is the only place several of them are published at all. */
export const FEES = {
  transferRate: 0.04,          // ECR 30 of 2013, Schedule, registering a sale contract
  mortgageRate: 0.0025,        // ECR 30 of 2013, Schedule, registering a mortgage
  vatRate: 0.05,               // Federal Decree-Law 8 of 2017, Article 3
  titleDeed: 250,              // DLD service page
  mapApartment: 250,           // DLD service page, "Villas and Apartments"
  knowledge: 10,               // DLD service page
  innovation: 10,              // DLD service page
  trusteeThreshold: 500000,    // DLD service page
  trusteeHigh: 4000,           // at or above the threshold, before VAT
  trusteeLow: 2000,            // below the threshold, before VAT
  mortgageTrustee: 4000,       // DLD mortgage service page, before VAT
};

/* The trustee office is a service partner, not the Land Department, so its
   fee carries VAT where the registration fee does not. */
export function trusteeFee(price) {
  const base = price >= FEES.trusteeThreshold ? FEES.trusteeHigh : FEES.trusteeLow;
  return Math.round(base * (1 + FEES.vatRate));
}

/* An illustrative one bedroom. The fees are statutory; the rent, the size
   and the service charge rate are an illustration and are labelled as one on
   the page, because Dubai publishes no per-building service charge series
   this site is willing to quote. */
export const EXAMPLE = {
  price: 1500000,
  sqft: 900,
  rent: 105000,
  serviceChargePerSqft: 18,
  managementRate: 0.05,
  vacancyWeeks: 4,
  maintenanceRate: 0.05,
  insurance: 1500,
  agencyRate: 0.02,
  ltv: 0.75,
};

/* Everything the buyer pays on top of the price, on the market convention
   that the buyer carries the whole registration fee. `dldOwnShare` is the
   same stack with the fee split the way Article 3 splits it when the
   contract is silent. */
export function acquisition(i = EXAMPLE) {
  const transfer = Math.round(i.price * FEES.transferRate);
  const agency = Math.round(i.price * i.agencyRate * (1 + FEES.vatRate));
  const lines = [
    ["Land Department registration fee", transfer],
    ["Agency commission, with VAT", agency],
    ["Registration trustee, with VAT", trusteeFee(i.price)],
    ["Title deed certificate", FEES.titleDeed],
    ["Map, apartments and villas", FEES.mapApartment],
    ["Knowledge fee", FEES.knowledge],
    ["Innovation fee", FEES.innovation],
  ];
  const total = lines.reduce((a, [, v]) => a + v, 0);
  return { lines, total, transfer, agency, sellerShare: Math.round(transfer / 2) };
}

/* Registering the mortgage is a second transaction with its own fee, its own
   title deed and its own trustee. */
export function mortgageCosts(i = EXAMPLE) {
  const loan = Math.round(i.price * i.ltv);
  const registration = Math.round(loan * FEES.mortgageRate);
  const lines = [
    ["Mortgage registration fee", registration],
    ["Registration trustee, with VAT", Math.round(FEES.mortgageTrustee * (1 + FEES.vatRate))],
    ["Title deed certificate", FEES.titleDeed],
    ["Knowledge and innovation fees", FEES.knowledge + FEES.innovation],
  ];
  return { loan, lines, total: lines.reduce((a, [, v]) => a + v, 0) };
}

/* Net operating income. Vacancy comes off first because management is a
   share of rent actually collected, not of rent hoped for. */
export function operating(i = EXAMPLE) {
  const vacancy = Math.round((i.rent * i.vacancyWeeks) / 52);
  const collected = i.rent - vacancy;
  const serviceCharge = i.sqft * i.serviceChargePerSqft;
  const management = Math.round(collected * i.managementRate);
  const maintenance = Math.round(i.rent * i.maintenanceRate);
  const lines = [
    ["Vacancy allowance", vacancy],
    ["Service charge", serviceCharge],
    ["Management, on rent collected", management],
    ["Maintenance reserve", maintenance],
    ["Insurance and fixed costs", i.insurance],
  ];
  const deductions = lines.reduce((a, [, v]) => a + v, 0);
  return { lines, deductions, collected, net: i.rent - deductions };
}

const pct = (n) => Number((n * 100).toFixed(2));

/* The three yields, in the order the reader meets them. `onPrice` is the one
   nobody names: net income over the price alone, which is what the yield
   would be if the transaction were free. The gap between it and gross is
   what the running costs take; the gap between it and net is what the
   transaction stack takes. */
export function yields(i = EXAMPLE) {
  const o = operating(i);
  const a = acquisition(i);
  const outlay = i.price + a.total;
  return {
    gross: pct(i.rent / i.price),
    onPrice: pct(o.net / i.price),
    net: pct(o.net / outlay),
    netIfSplit: pct(o.net / (i.price + a.total - a.sellerShare)),
    outlay,
    noi: o.net,
    costRate: pct(a.total / i.price),
  };
}

/* How much of the yield each block of cost accounts for, in percentage
   points, and the ratio between them. This is the page's whole argument and
   it is arithmetic, so it is computed rather than asserted. */
export function drag(i = EXAMPLE) {
  const y = yields(i);
  const running = Number((y.gross - y.onPrice).toFixed(2));
  const transaction = Number((y.onPrice - y.net).toFixed(2));
  return { running, transaction, ratio: Number((running / transaction).toFixed(1)) };
}

/* Years of net rent consumed by the costs of getting in, and of getting in
   and back out again at the same price. The exit carries the agency
   commission and, on the same convention, no share of the registration fee.
   A developer NOC fee also falls due on exit; it is set by the developer,
   published nowhere centrally, and therefore not in this arithmetic. */
export function payback(i = EXAMPLE) {
  const o = operating(i);
  const a = acquisition(i);
  const exit = Math.round(i.price * i.agencyRate * (1 + FEES.vatRate));
  const round = (n) => Number((n / o.net).toFixed(2));
  return { entry: round(a.total), exit, roundTrip: round(a.total + exit), exitTotal: a.total + exit };
}

/* Net yield against the service charge rate, which is the input the listing
   never carries and the one the answer is most sensitive to. */
export const SC_RATES = [12, 15, 18, 21, 24, 27, 30];

export function atServiceCharge(rate, i = EXAMPLE) {
  return yields({ ...i, serviceChargePerSqft: rate });
}

/* The service charge rate at which this property's net yield falls below a
   target, searched in whole dirhams against the same line items the tables
   print rather than solved in closed form. */
export function serviceChargeAt(target, i = EXAMPLE) {
  for (let r = 1; r <= 500; r++) if (atServiceCharge(r, i).net < target) return r;
  return null;
}

export const money = (n) => Number(n).toLocaleString("en-US");

/* Percentages are printed to two places everywhere they appear, so the same
   string is in the table and in the sentence above it. */
export const pctText = (n) => `${Number(n).toFixed(2)}%`;
