/* The Dubai property instruments this site relies on, in one place.

   Five pages cite the law that sets their figures rather than a blog about
   it. This register lists every instrument those pages cite, what it sets,
   and which page applies it, so a reader who searches for the decree rather
   than the arithmetic lands somewhere that links to both.

   Nothing here is typed. The instrument names and URLs come from the
   modules that hold the statutory figures, and every "sets" line is one of
   the claims those modules already require their page to carry word for
   word. The register cannot list a figure the site does not already stand
   behind, and it cannot go stale on its own: amend a module and this page
   and its playbook change together. */

import * as aq from "./acquisition.mjs";
import * as rc from "./rentcap.mjs";
import * as hh from "./holidayhome.mjs";
import * as dp from "./disposal.mjs";
import * as jp from "./jointproperty.mjs";
import * as op from "./offplan.mjs";
import * as mg from "./mortgage.mjs";

/* Each entry names a module and an instrument key inside it. `what` is the
   one-sentence description of the instrument's job; the fee and percentage
   lines beneath it are drawn from the module's STATUTORY list, not written
   here. `applied` is the playbook that carries those lines. */
const ENTRIES = [
  {
    mod: aq, key: "ecr30", year: 2013, area: "Buying and selling",
    what: "Sets every fee the Land Department charges to register a sale, a mortgage or a title, and says who is liable for the sale fee when the contract is silent.",
    applied: "net-rental-yield",
  },
  {
    mod: aq, key: "dldSale", year: null, area: "Buying and selling",
    what: "The Land Department's own service page for registering a sale, which is where the trustee office fee, the title deed fee and the map fee are published.",
    applied: "net-rental-yield",
  },
  {
    mod: aq, key: "dldMortgage", year: null, area: "Buying and selling",
    what: "The service page for registering a mortgage, with the trustee fee for that separate transaction.",
    applied: "net-rental-yield",
  },
  {
    mod: aq, key: "vat", year: 2017, area: "Buying and selling",
    what: "Federal law setting the standard rate of value added tax, which applies to agency commission and to the trustee's fee but not to the Land Department's own registration fee.",
    applied: "net-rental-yield",
  },
  {
    mod: dp, key: "cbuaeCaps", year: 2019, area: "Buying and selling",
    what: "Caps, to the dirham, what a bank may charge a home loan customer for settling early, for a liability or clearance letter and for its own no objection certificate.",
    applied: "selling-well",
  },
  {
    mod: dp, key: "dldMortgagedSale", year: null, area: "Buying and selling",
    what: "The service page for selling a property that still carries a mortgage, with the release procedure fee, the registrar fee and the case in which the registrar fee is waived.",
    applied: "selling-well",
  },
  {
    mod: dp, key: "dldRelease", year: null, area: "Buying and selling",
    what: "The service page for discharging a mortgage on its own, rather than as part of a sale.",
    applied: "selling-well",
  },
  {
    mod: mg, key: "cbuaeMortgage", year: 2013, area: "Borrowing",
    what: "Sets every cap on the size of a mortgage: the loan to value bands by nationality, price and whether the property is off plan, the debt burden ratio the payment must fit inside, the maximum financing amount as a multiple of annual income, the twenty-five year term, the stress test the payment is qualified at, and what may and may not be counted as income.",
    applied: "mortgage-capacity",
  },
  {
    mod: mg, key: "cbuaeDisclosure", year: 2013, area: "Borrowing",
    what: "Requires the lender to give the borrower the lifetime cost of the loan and a separate schedule of fees and charges, and points the cap on early repayment charges back at the consumer lending regulation.",
    applied: "mortgage-capacity",
  },
  {
    mod: jp, key: "law6", year: 2019, area: "Owning in a building",
    what: "The jointly owned property law. Sets the area a service charge is levied on, the RERA approval and audit without which nothing may be collected, the bank account the money sits in, the closed list of what it may be spent on, the separate account holding the reserve, the levy when that reserve falls short, and the lien that stops a sale while charges are unpaid.",
    applied: "service-charge-and-reserves",
  },
  {
    mod: jp, key: "scIndex", year: null, area: "Owning in a building",
    what: "The Land Department e-service that lets anyone look up the service charge RERA approved for a named project, use and year, which is the figure Article 27 makes the only collectable one.",
    applied: "service-charge-and-reserves",
  },
  {
    mod: jp, key: "mollak", year: null, area: "Owning in a building",
    what: "The system through which service charges are invoiced, collected and monitored, and which publishes the registers of approved management companies and approved auditors a buyer can check a building against.",
    applied: "service-charge-and-reserves",
  },
  {
    mod: rc, key: "decree43", year: 2013, area: "Renting",
    what: "Sets the maximum rent increase a landlord may impose on renewal, in bands measured against the official rent index.",
    applied: "rent-increase-caps",
  },
  {
    mod: rc, key: "tenancyLaw", year: 2008, area: "Renting",
    what: "The tenancy law, with the notice a landlord must give to change a term on renewal and the notice and method required to evict for sale or own use.",
    applied: "rent-increase-caps",
  },
  {
    mod: rc, key: "smartIndex", year: 2025, area: "Renting",
    what: "The announcement that replaced the area-average rent index with one rated per building, which narrowed the comparable set without changing the decree's bands.",
    applied: "rent-increase-caps",
  },
  {
    mod: hh, key: "feesAndFines", year: 2014, area: "Holiday homes",
    what: "Sets the holiday home permit fee, the inspection fee and the fines for operating without a licence, for charging guests for utilities and for letting less than a whole unit.",
    applied: "short-let-vs-long-let",
  },
  {
    mod: hh, key: "tourismDirham", year: 2014, area: "Holiday homes",
    what: "Sets the tourism dirham charged per occupied room per night, by classification, and when it must be remitted.",
    applied: "short-let-vs-long-let",
  },
  {
    mod: hh, key: "bylaw", year: 2020, area: "Holiday homes",
    what: "The bylaw under which holiday homes are licensed and classified, with the operating conditions a permit carries.",
    applied: "short-let-vs-long-let",
  },
  {
    mod: op, key: "law19", year: 2020, area: "Buying off-plan",
    what: "Replaces Article 11 of the 2008 law, and sets the ceiling on what a developer may keep when an off-plan buyer stops paying, as a percentage of the unit's contract price banded by how far the building has got.",
    applied: "off-plan-irr",
  },
  {
    mod: op, key: "law13", year: 2008, area: "Buying off-plan",
    what: "Creates the Interim Real Property Register and makes an unregistered disposition of an off-plan unit void rather than merely irregular.",
    applied: "off-plan-irr",
  },
  {
    mod: op, key: "escrow", year: 2007, area: "Buying off-plan",
    what: "Requires off-plan purchasers' payments into a project escrow account, and holds back five percent of it for a year after units are registered.",
    applied: "off-plan-irr",
  },
  {
    mod: op, key: "dldInitialSale", year: null, area: "Buying off-plan",
    what: "The Land Department's service page for registering an initial off-plan sale, which prints the 4% registration fee as two halves and files the Oqood charge as a developer cost.",
    applied: "off-plan-irr",
  },
];

export function register() {
  return ENTRIES.map((e) => {
    const inst = e.mod.INSTRUMENTS[e.key];
    if (!inst) throw new Error(`law register: no instrument "${e.key}" in its module`);
    const sets = e.mod.STATUTORY.filter((s) => s.instrument === e.key).map((s) => s.claim);
    return { ...e, name: inst.name, url: inst.url, sets };
  });
}

/* The playbooks that cite instruments. Kept here so the page and the suite
   agree on what "every instrument the site cites" means. */
export const APPLIED = ["net-rental-yield", "off-plan-irr", "mortgage-capacity", "selling-well", "service-charge-and-reserves", "rent-increase-caps", "short-let-vs-long-let"];

export const AREAS = ["Buying and selling", "Buying off-plan", "Borrowing", "Owning in a building", "Renting", "Holiday homes"];
