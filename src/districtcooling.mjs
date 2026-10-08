/* Dubai district cooling, and the chiller bill no listing carries.

   Every page found on this query on 8 October 2026 is a brokerage blog with
   the same shape: a range of dirhams per refrigeration ton, a sentence that
   "the RSB regulates district cooling", and a rule of thumb about whether
   chiller-free is worth it. The strongest of them does cite Executive
   Council Resolution No. (6) of 2021 and prints Empower's published rates,
   which is more than the rest manage, and then contradicts its own table
   two sections later. One of them cites an Executive Council Resolution
   that could not be found in any official source, which is the reason this
   module quotes instruments rather than articles about them.

   There are three instruments and they are specific. ECR 6 of 2021 says the
   tariff is calculated on cooling capacity and that nothing unapproved may
   be collected. RD10 defines the capacity charge, caps the consumption
   tariff to the fils, forbids allocating capacity by installed equipment,
   and refuses to approve any tariff that escalates the capacity charge at
   all. RD06 governs the bill: monthly, in two languages, and with no
   consumption charge whatsoever while a faulty sub-meter goes unrepaired.

   The arithmetic nobody does follows from RD10's own definition. The
   capacity charge is the capacity tariff times contracted capacity, applied
   monthly, and consumption appears nowhere in it. So the chiller bill has a
   floor that does not fall when the flat empties, and a chiller-free rent
   premium has to clear that floor before it buys the tenant a single
   refrigeration-ton-hour of cooling. This module computes where that floor
   sits and what a premium above it actually purchases, in hours a day at
   full contracted capacity, which is a number a landlord can check against
   their own meter history.

   Contracted capacity is a building-by-building figure and this module does
   not pretend to know it. It is an input, banded across the range a one
   bedroom plausibly carries, and every figure below is per refrigeration
   ton until a band is chosen. */

import { EXAMPLE, yields } from "./acquisition.mjs";

export const INSTRUMENTS = {
  coolingResolution: {
    name: "Executive Council Resolution No. (6) of 2021 Regulating the Provision of District Cooling Services in the Emirate of Dubai, Articles 1, 11, 12 and 15",
    url: "https://rsbdubai.gov.ae/media/r13n2juj/ecr-6-of-2021-district-cooling_english-pdf-29032021.pdf",
  },
  rd10: {
    name: "Regulatory and Supervisory Bureau, RD10 Regulation on the Approval of District Cooling Tariffs, Charges and Fees, Issue 1.4 of 6 February 2026, Sections 1, 2, 6 and 7",
    url: "https://rsbdubai.gov.ae/media/baufmpnp/rd10-tariffs-v14.pdf",
  },
  rd06: {
    name: "Regulatory and Supervisory Bureau, RD06 Metering and Billing, Sections 7, 8 and 9",
    url: "https://www.rsbdubai.gov.ae/media/0ena3rxj/rd06-metering-and-billing-v11.pdf",
  },
};

/* The instruments' own words, grammar left exactly as published. Each has to
   appear in the page or the suite names the page that dropped it. */
export const STATUTORY = [
  { key: "capacityCharge", claim: "the multiple of Capacity Tariff and Contracted Capacity normally applied on a monthly basis", instrument: "rd10" },
  { key: "capacityTariff", claim: "the unit charge normally quoted in dirhams per year for each refrigeration-ton of cooling capacity", instrument: "rd10" },
  { key: "onlyAuthorised", claim: "Only the tariffs, charges and fees expressly identified and authorised in this RD shall be permitted", instrument: "rd10" },
  { key: "installedEquipment", claim: "assigning Contracted Capacity to Units based on installed equipment capacity rather than appropriate allocation", instrument: "rd10" },
  { key: "noPenaltyToUnits", claim: "Inefficient Building Penalties may not be applied in the bills charged to Units under any circumstances", instrument: "rd10" },
  { key: "noEscalation", claim: "Tariff arrangements that include indexation or escalation of Capacity Charges will not be approved", instrument: "rd10" },
  { key: "lateCap", claim: "the total accumulated Late Payment Fees at any time shall not exceed one hundred percent (100 %)", instrument: "rd10" },
  { key: "faultyMeter", claim: "may not include Consumption Charges, estimated or otherwise, in any bill until the Sub-Meter is repaired or replaced", instrument: "rd06" },
  { key: "monthly", claim: "must be issued monthly", instrument: "rd06" },
  { key: "depositReturn", claim: "which must be returned within 5 working days of concluding the service", instrument: "rd06" },
  { key: "commonArea", claim: "must be billed directly to the District Cooling Service Provider's Customer", instrument: "rd06" },
  { key: "tolerance", claim: "If the Master Meter is found to perform within a 3% tolerance, the Customer shall bear the expense of the test", instrument: "rd06" },
  { key: "customer", claim: "The beneficiary of a District Cooling Service with whom the relevant service contract is concluded", instrument: "coolingResolution" },
  { key: "onCapacity", claim: "The tariff for District Cooling Services provided to Customers will be calculated on the basis of Cooling Capacity", instrument: "coolingResolution" },
  { key: "noUnapproved", claim: "No Permit Holder may collect from a Customer any charges or tariffs for the services it provides", instrument: "coolingResolution" },
  { key: "fineCap", claim: "A fine must not exceed two hundred thousand dirhams (AED 200,000.00)", instrument: "coolingResolution" },
];

/* RD10 Section 7, the rows that cap a figure rather than deferring it to a
   per-system schedule. The capacity tariff is deliberately absent: Section 7
   sets no cap on it and approves it per system in Schedule 3, which is why
   the published provider tariff below is a published figure and not a cap. */
export const CAPS = {
  consumptionWithCapacity: 0.643,
  consumptionSingleBuilding: 0.80,
  fuelSurcharge: 0.075,
  depositMonths: 8,
  activation: 200,
  reconnection: 500,
  latePayment: 100,
  lateAccumulation: 1,
  billingServices: 30,
  excessDemandMultiple: 1.2,
};

export const VAT_RATE = 0.05;

/* Empower's own charges page, which is the only place a Dubai provider
   publishes the two rates that decide the bill. A published figure, with a
   retrieval date, not an instrument: it is what one provider charges, and
   the cap above is what any provider may. */
export const PUBLISHED = {
  provider: "Empower",
  capacityPerRtYear: 750,
  consumptionPerRth: 0.568,
  meterPerMonth: 30,
  meterPerQuarter: 50,
  voluntaryDisconnection: 150,
  source: {
    name: "Empower, Charges Explanation, demand charge AED 750 per refrigeration ton per annum and consumption charge AED 0.568 per refrigeration ton per hour, retrieved 8 October 2026",
    url: "https://www.empower.ae/customer-care/charges-explanation/",
  },
};

/* The provider's own wording. The fourth of these is the answer to the
   question the regulations do not address at all, and it is the reason the
   standing cost below is a standing cost. */
export const PUBLISHED_CLAIMS = [
  "at the rate of AED 750 per Refrigeration Ton (RT) per annum, billed monthly in advance",
  "at a rate of AED 0.568 fils per RT per hour",
  "This is charged quarterly at the rate of AED 50 for 3 Months or AED 30 per month",
  "Demand Charges and Meter Maintenance Fee will be continued to be charged irrespective of the property is disconnected",
];

/* ---- the cap has no room above the published rate ----

   An identity, not a coincidence worth asserting: RD10 caps the consumption
   tariff at a figure "inclusive of Fuel Surcharge" and caps the fuel
   surcharge separately. Subtract the published base rate from the cap and
   what is left is the fuel surcharge cap exactly, which says the cap was set
   at the base rate plus a full surcharge and leaves nothing else. Computed
   so that a change to either figure shows up here rather than in print. */
export function capHeadroom() {
  return Number((CAPS.consumptionWithCapacity - PUBLISHED.consumptionPerRth).toFixed(3));
}

export function capIsBasePlusSurcharge() {
  return Math.abs(capHeadroom() - CAPS.fuelSurcharge) < 1e-9;
}

/* ---- the floor ----

   RD10 defines the capacity charge as the capacity tariff times contracted
   capacity, applied monthly. Consumption is not in it, and neither is
   occupancy. Meter maintenance is a monthly fee on the same meter. So this
   is what a unit accrues in a year in which it is never cooled at all. */
export const CAPACITY_BAND = [4, 5, 6, 7];
export const ASSUMED_RT = 5;

export function standing({ rt = ASSUMED_RT, t = PUBLISHED } = {}) {
  const capacity = rt * t.capacityPerRtYear;
  const meter = t.meterPerMonth * 12;
  const net = capacity + meter;
  const vat = Number((net * VAT_RATE).toFixed(2));
  return { rt, capacity, meter, net, vat, total: Number((net + vat).toFixed(2)) };
}

export function standingTable(t = PUBLISHED) {
  return CAPACITY_BAND.map((rt) => standing({ rt, t }));
}

/* A void priced. The standing cost does not fall when the tenancy ends, so
   this is simply the annual figure prorated, and it is computed here so the
   page cannot print a month that disagrees with the year above it. */
export function voidCost(months, rt = ASSUMED_RT, t = PUBLISHED) {
  return Number(((standing({ rt, t }).total / 12) * months).toFixed(2));
}

/* ---- what a chiller-free premium actually buys ----

   A chiller-free letting moves the whole bill to the landlord, so the rent
   premium is the landlord's entire compensation for a cost with a fixed part
   they cannot avoid and a variable part they cannot control. Rent is outside
   the scope of VAT on residential property; the chiller bill is not, so the
   premium is compared against the VAT-inclusive cost.

   Solve the premium for consumption rather than guessing consumption: given
   a premium, the break-even is the consumption at which the landlord is
   exactly whole. Expressed in refrigeration-ton-hours, then as hours a day
   at full contracted capacity and as a load factor, because those two are
   dimensionless and a landlord can check them against a past bill. */
export const PREMIUMS = [4000, 6000, 8000, 10000, 12000];

export function breakEven({ premium, rt = ASSUMED_RT, t = PUBLISHED } = {}) {
  const s = standing({ rt, t });
  const headroom = Number((premium - s.total).toFixed(2));
  const perRth = Number((t.consumptionPerRth * (1 + VAT_RATE)).toFixed(4));
  if (headroom <= 0) {
    return { premium, rt, standing: s.total, headroom, perRth, rth: null, hoursPerDay: null, loadFactor: null };
  }
  const rth = Math.round(headroom / perRth);
  return {
    premium, rt, standing: s.total, headroom, perRth, rth,
    hoursPerDay: Number((rth / (rt * 365)).toFixed(2)),
    loadFactor: Number(((rth / (rt * 8760)) * 100).toFixed(1)),
  };
}

export function premiumTable(rt = ASSUMED_RT, t = PUBLISHED) {
  return PREMIUMS.map((premium) => breakEven({ premium, rt, t }));
}

/* The premium below which a chiller-free listing is simply a discount the
   landlord has not noticed giving: it does not cover the standing charge, so
   it buys no cooling at all. */
export function minimumPremium(rt = ASSUMED_RT, t = PUBLISHED) {
  return standing({ rt, t }).total;
}

/* ---- the standing charge in the units the reader is already holding ----

   Dirhams a year, a share of the gross rent, points of net yield on the full
   cash outlay, and dirhams per square foot so it can be set beside the
   service charge, which is the only other cost on the page measured that
   way. Imported from the acquisition module rather than retyped, so the
   illustrative unit cannot drift between pages. */
export function cost(rt = ASSUMED_RT, i = EXAMPLE) {
  const s = standing({ rt });
  return {
    total: s.total,
    ofRent: Number(((s.total / i.rent) * 100).toFixed(2)),
    netPoints: Number(((s.total / yields(i).outlay) * 100).toFixed(3)),
    perSqft: Number((s.total / i.sqft).toFixed(2)),
    serviceChargePerSqft: i.serviceChargePerSqft,
  };
}

/* Months of capacity charge a provider may hold as a deposit, in dirhams, at
   a given contracted capacity. RD10 caps it at eight months' equivalent. */
export function depositCap(rt = ASSUMED_RT, t = PUBLISHED) {
  return Number(((rt * t.capacityPerRtYear / 12) * CAPS.depositMonths).toFixed(2));
}

export const money = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
export const money2 = (n) =>
  Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
