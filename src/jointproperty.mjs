/* The Dubai service charge, and the reserve fund the law keeps in a separate
   bank account.

   Every page found on this query on 10 September 2026 does the same thing:
   a table of dirhams per square foot by community, no source, no retrieval
   date, no year the rates belong to, and then the sentence "service charges
   are regulated by the Dubai Land Department" with nothing after it. The
   strongest of them lists thirteen communities and cites no instrument at
   all.

   There is an instrument, and it is unusually specific. Law No. (6) of 2019
   sets who pays, on what area, on whose approval, into which bank account,
   what the money may be spent on, where the reserve is held, what happens
   when the reserve runs short, and what happens to an owner who does not
   pay. Six of those nine are things a buyer can check before making an
   offer, and none of them appear on a competing page.

   The arithmetic here is the one question the "a low charge is a deferred
   bill" warning never answers: deferred by how much. The answer has a closed
   form, and the unit area cancels out of it, which is why it can be printed
   once for every apartment in Dubai. */

import { EXAMPLE, yields } from "./acquisition.mjs";

export const INSTRUMENTS = {
  law6: {
    name: "Law No. (6) of 2019 Concerning Ownership of Jointly Owned Real Property in the Emirate of Dubai, Articles 25, 27, 30, 32 and 34",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2019/Law%20No.%20(6)%20of%202019%20Concerning%20Ownership%20of%20Jointly%20Owned%20Real%20Property%20in%20the%20Emirate%20of%20Dubai.html",
  },
  scIndex: {
    name: "Dubai Land Department, Service Charge Index, e-service description",
    url: "https://dubailand.gov.ae/en/eservices/service-charge-index-overview/",
  },
  mollak: {
    name: "Dubai Land Department, Mollak, the service charge system for jointly owned property",
    url: "https://mollak.dubailand.gov.ae/publicpages/about-us.html",
  },
};

/* Claims the page carries in the instrument's own words. The grammar of the
   official English is left exactly as published; it is the signature of a
   quotation rather than a paraphrase of one. */
export const STATUTORY = [
  { key: "apportionment", claim: "based on ratio of the area of the Owner's Unit to the total area", instrument: "law6" },
  { key: "deedArea", claim: "based on the area of his Unit as recorded in the Real Property Register", instrument: "law6" },
  { key: "unsoldUnits", claim: "A Developer will pay his share of the annual Service Charges in respect of unsold Units", instrument: "law6" },
  { key: "reraApproval", claim: "without first obtaining the relevant approval of RERA", instrument: "law6" },
  { key: "auditedBudget", claim: "unless it is approved by a certified audit firm recognised by RERA", instrument: "law6" },
  { key: "temporaryBudget", claim: "RERA may approve a temporary Service Charges budget", instrument: "law6" },
  { key: "sevenDays", claim: "within seven (7) working days from the date of collection", instrument: "law6" },
  { key: "closedList", claim: "may not be disposed of, and may only be used for the following purposes", instrument: "law6" },
  { key: "separateAccount", claim: "must be deposited in an account separate from the Service Charges account", instrument: "law6" },
  { key: "reserveLocked", claim: "other than in critical emergencies, without first obtaining the approval of RERA", instrument: "law6" },
  { key: "theLevy", claim: "request Owners to cover these expenses", instrument: "law6" },
  { key: "lien", claim: "A Unit may not be disposed of unless these charges are paid", instrument: "law6" },
  { key: "auction", claim: "sold by public auction to collect these charges", instrument: "law6" },
  { key: "sixMonths", claim: "every six (6) months, with a periodic report", instrument: "law6" },
  { key: "lookup", claim: "inquire about the approved service fees for Joint ownership properties", instrument: "scIndex" },
  { key: "escrow", claim: "operating according to the mechanism of the escrow account", instrument: "mollak" },
];

/* ---- the deferred bill, priced ----

   Two comparable buildings, one charging `gap` dirhams a foot a year less
   than the other. The cheaper one's advantage accumulates; a levy under
   Article 30(f) lands as a one-off charge on the same square feet. Both
   sides of that comparison are the unit's area times a rate, so the area
   divides out and the answer is a rate: the levy per square foot at which
   the buyer of the cheaper building is exactly back where they started.

   Undiscounted it is the gap times the years. Money in hand earns something,
   so the honest version compounds each year's saving forward at `rate`,
   which is the future value of an ordinary annuity and reduces to the years
   when the rate is zero. */
export const LEVY_YEARS = [5, 10, 15, 20];
export const LEVY_GAPS = [2, 4, 6];
export const LEVY_RATE = 0.05;

export function fvFactor(rate, years) {
  if (!rate) return years;
  return (Math.pow(1 + rate, years) - 1) / rate;
}

export function breakEvenLevy({ gap, years, rate = 0 }) {
  return gap * fvFactor(rate, years);
}

export function levyTable(rate = LEVY_RATE) {
  return LEVY_YEARS.map((years) => ({
    years,
    cells: LEVY_GAPS.map((gap) => Number(breakEvenLevy({ gap, years, rate }).toFixed(2))),
  }));
}

/* ---- what a dirham a foot is worth ----

   The service charge is the only line in the running costs that a listing
   never carries and a buyer can verify before the offer. These are its price
   in the three units the reader is already holding: dirhams a year, a share
   of the rent, and points of net yield on the same illustrative one bedroom
   the net rental yield page computes. Imported rather than retyped, so the
   two pages cannot drift apart. */
export function perDirham(i = EXAMPLE) {
  const cost = i.sqft;
  return {
    cost,
    ofRent: Number(((cost / i.rent) * 100).toFixed(2)),
    netPoints: Number(((cost / yields(i).outlay) * 100).toFixed(3)),
  };
}

export function shareOfRent(i = EXAMPLE) {
  const charge = i.sqft * i.serviceChargePerSqft;
  return { charge, pct: Number(((charge / i.rent) * 100).toFixed(1)) };
}

export const money = (n) => Number(Math.round(n)).toLocaleString("en-US");
