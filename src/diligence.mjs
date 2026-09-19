/* Due diligence before an offer, split by what each check can actually
   decide.

   Every competing page on this query is a list. The best of them, written by
   law firms, name the Land Department services a buyer should use and stop
   there; the brokerage ones do not even do that. Not one of them cites an
   article, and not one of them prices a single check. So the reader gets
   eleven bullets of equal weight and no way to tell which of them matters.

   They are not of equal weight, and Dubai's own land law says so in terms.
   A small number of checks decide whether the buyer ends up owning anything:
   Article 9 of Law No. (7) of 2006 makes an unrecorded transaction invalid,
   and Article 7 makes the register itself conclusive against everyone. Those
   checks are binary, they are free, and failing one costs the whole outlay.
   Everything else on the list decides what the thing is worth, and those
   checks can be ranked, because each of them is worth a measurable number of
   points of net yield.

   The ranking is the finding, and it is the reverse of where buyers spend
   their attention. Reading the approved service charge budget, which almost
   nobody does, is worth several times what haggling over the registration
   fee is worth, and it is worth it every year rather than once.

   The unit is the one on the net rental yield page, so the two chain and
   cannot drift. */

import { EXAMPLE, yields, atServiceCharge, money, pctText } from "./acquisition.mjs";

export const INSTRUMENTS = {
  law7: {
    name: "Law No. (7) of 2006 Concerning Land Registration in the Emirate of Dubai, Articles 4, 7 and 9",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2006/Law%20No.%20(7)%20of%202006.html",
  },
};

/* The Land Department's own verification services, which are the way a buyer
   actually performs the checks above. These are services rather than
   instruments, so they are kept out of INSTRUMENTS and out of the law
   register, which is a register of law. The suite still makes the page name
   each one and cite its official page, because a check the reader cannot
   perform is not a check. */
export const SERVICES = [
  {
    key: "titleDeed",
    name: "Verify Title Deed",
    url: "https://dubailand.gov.ae/en/eservices/title-deed-verification-overview/",
    checks: "that the register says what the seller says it says",
  },
  {
    key: "projectStatus",
    name: "Project Status Enquiry",
    url: "https://dubailand.gov.ae/en/eservices/real-estate-project-status-landing/",
    checks: "that an off-plan project is registered and how far it has actually got",
  },
  {
    key: "licences",
    name: "Verify License and Permits",
    url: "https://dubailand.gov.ae/en/eservices/validate-real-estate-licenses-and-permits/",
    checks: "that the broker and the developer hold the licences they claim",
  },
  {
    key: "serviceChargeIndex",
    name: "Service Charge Index",
    url: "https://dubailand.gov.ae/en/eservices/service-charge-index-overview/",
    checks: "the approved charge for the building, rather than the one the listing implied",
  },
];

/* Every claim the page has to carry word for word, in the instrument's own
   words. Article 4 is here because the first question about any Dubai
   property is whether the buyer is allowed to own it at all, and the answer
   is a matter of where the plot is rather than what the contract says. */
export const STATUTORY = [
  { key: "restricted", claim: "The right to own Real Property in the Emirate will be restricted to UAE nationals, nationals of the Gulf Cooperation Council member states", instrument: "law7" },
  { key: "designated", claim: "in certain areas determined by the Ruler", instrument: "law7" },
  { key: "freehold", claim: "Freehold ownership of Real Property without time restrictions", instrument: "law7" },
  { key: "leasehold", claim: "a period not exceeding ninety-nine (99) years", instrument: "law7" },
  { key: "conclusive", claim: "absolute evidentiary value against all parties", instrument: "law7" },
  { key: "impugn", claim: "may not be impugned unless it is proven to be the result of fraud or forgery", instrument: "law7" },
  { key: "unrecorded", claim: "will not be deemed valid unless recorded in the Property Register", instrument: "law7" },
];

/* The two findings a price check can produce, as the page states them. The
   service charge case is the approved budget coming in above the number the
   listing implied; the rent case is the Ejari comparables coming in below
   the asking rent. Both are deliberately modest: a six dirham gap on the
   charge and a five per cent haircut on the rent are ordinary findings, not
   disasters, and the point is what an ordinary finding is worth. */
export const FINDINGS = {
  serviceChargeFound: 24,        // AED per sq ft in the approved budget
  rentHaircut: 0.05,             // Ejari comparables against the asking rent
};

const pt = (n) => Number(n.toFixed(2));

/* What a check is worth, in points of net yield and in dirhams a year,
   measured as the difference between believing the listing and verifying
   the document. Everything is computed off the same EXAMPLE the net rental
   yield page uses, so a change to that unit moves this page too. */
export function checkValue({ serviceChargePerSqft, rent } = {}) {
  const base = yields(EXAMPLE);
  const found = yields({
    ...EXAMPLE,
    ...(serviceChargePerSqft === undefined ? {} : { serviceChargePerSqft }),
    ...(rent === undefined ? {} : { rent }),
  });
  return {
    net: found.net,
    points: pt(base.net - found.net),
    perYear: base.noi - found.noi,
    base: base.net,
  };
}

export function serviceChargeCheck() {
  return checkValue({ serviceChargePerSqft: FINDINGS.serviceChargeFound });
}

export function rentCheck() {
  return checkValue({ rent: Math.round(EXAMPLE.rent * (1 - FINDINGS.rentHaircut)) });
}

/* The registration fee split is the one negotiation every buyer has, and it
   is a one-off on the denominator rather than a recurring charge on the
   numerator. `netIfSplit` is already the net yield with the seller carrying
   the half Article 3 assigns him, so the gain in points comes straight out
   of the yield module. */
export function feeSplitCheck() {
  const y = yields(EXAMPLE);
  const a = Math.round(EXAMPLE.price * 0.04 / 2);
  return { points: pt(y.netIfSplit - y.net), once: a, net: y.netIfSplit, base: y.net };
}

/* A recurring saving is worth more than a one-off of the same size, and the
   multiple is the whole argument of the page. Capitalising the annual
   number at the property's own net yield is the plainest way to put the two
   on one scale: it is the amount of price that buys the same income. */
export function capitalised(perYear, ratePercent = yields(EXAMPLE).net) {
  return Math.round(perYear / (ratePercent / 100));
}

/* The agency commission, with VAT, as the yardstick. It is the number every
   buyer knows and the one every buyer argues about, so it is the right thing
   to measure an unread budget against. */
export function commission(i = EXAMPLE) {
  return Math.round(i.price * i.agencyRate * 1.05);
}

/* How many times the commission a single verified line of the service charge
   budget is worth, once the annual saving is put on the same scale as the
   one-off. */
export function versusCommission() {
  const sc = serviceChargeCheck();
  const cap = capitalised(sc.perYear);
  return { capitalised: cap, commission: commission(), multiple: Number((cap / commission()).toFixed(1)) };
}

/* The two document checks against the one negotiation, on one scale. This
   is the page's whole argument, so it is arithmetic rather than assertion. */
export function together() {
  const sc = capitalised(serviceChargeCheck().perYear);
  const rt = capitalised(rentCheck().perYear);
  const f = feeSplitCheck();
  return {
    documents: sc + rt,
    negotiation: f.once,
    ratio: Number(((sc + rt) / f.once).toFixed(1)),
    points: Number((serviceChargeCheck().points + rentCheck().points).toFixed(2)),
  };
}

export { money, pctText, atServiceCharge };
