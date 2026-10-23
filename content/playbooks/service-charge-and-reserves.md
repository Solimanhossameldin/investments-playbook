---
{
  "order": 18,
  "slug": "service-charge-and-reserves",
  "title": "Dubai service charges and the reserve fund",
  "category": "property",
  "tier": 2,
  "calculator": "net-rental-yield",
  "reviewed": "16 October 2026",
  "summary": "Dubai's approved service charge is a public lookup rather than a market average: the Land Department's Service Charge Index listed 5,591 projects, with budget years from 2015 to 2026, when checked on 16 October 2026, and Law No. (6) of 2019 forbids collecting any charge RERA has not approved.",
  "question": "How much is the service charge on a Dubai apartment, and who approves it?",
  "formula": "Your annual charge\n  = the area recorded in the Real Property Register\n    x the rate RERA approved for that project, that year\n\nWhat a dirham a foot costs, on the illustrative one bedroom\n  900 sq ft x AED 1 = AED 900 a year\n  = 0.86% of the gross rent\n  = 0.056 points of net yield\n\nThe break-even levy\n  A building charging `gap` dirhams a foot less than a comparable\n  one, held for `n` years, with the saving earning `r`:\n\n    break-even levy per sq ft = gap x ((1 + r)^n - 1) / r\n\n  At r = 0 that is simply gap x n. The unit area appears on both\n  sides of the comparison and divides out, so the answer is a rate,\n  not an amount, and it is the same rate for every apartment.",
  "failureModes": [
    "Comparing charges across building types. A serviced tower and a walk-up are not comparable per square foot and never were, and the break-even arithmetic below is only meaningful inside a comparable set.",
    "Treating a low charge as a red flag without asking how long you intend to hold. Over five years the cushion is thin. Over twenty it is very large, and the warning is simply wrong.",
    "Using the brochure area rather than the deed area. Article 25(b) calculates your share based on the area of his Unit as recorded in the Real Property Register, and the two are not always the same.",
    "Paying an increase nobody approved. Article 27(a) forbids a management entity to collect any amount whatsoever without first obtaining the relevant approval of RERA, and the approved figure for a named project and year is a public lookup.",
    "Assuming a fully funded reserve is a sunk cost. You are buying a share of a separate bank account, and it is the only thing standing between you and Article 30(f).",
    "Forgetting that the charge is payable whether or not the unit is let, which is why it belongs in the fixed cost line of a [break-even occupancy](/playbooks/break-even-occupancy/) calculation.",
    "Leaving arrears to the closing table. Article 32(a) gives the management entity a lien and says a Unit may not be disposed of unless these charges are paid, so an unpaid balance is not a negotiating position, it is a stopped [sale](/playbooks/selling-well/).",
    "Reading the published reserve line as a balance. The Service Charge Index publishes the contribution approved for a budget year, which is a flow; the cushion that stands between an owner and Article 30(f) is the accumulated balance, which is a stock. A building in its fifteenth year at a thin rate can hold more than one in its first year at a generous one, which is why the checks below still ask the manager for the balance and not only for the budget.",
    "Treating thirty buildings as a sample of Dubai. The spread quoted here is what the 2026 approved budgets of the thirty buildings this site has read actually say. A building outside that set can sit anywhere, including outside the range, and the reserve share of a single project says nothing about its area."
  ],
  "whenToUse": "Before making an offer on any apartment, and again every year, because the budget is approved annually and almost no owner reads it. Also whenever two buildings are being compared on the headline rate alone: the same free lookup splits that rate into a general fund and a reserve, and across the buildings published here the split varies far more than the rate does.",
  "sources": [
    {
      "name": "Law No. (6) of 2019 Concerning Ownership of Jointly Owned Real Property in the Emirate of Dubai, Articles 25, 27, 30, 32 and 34",
      "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2019/Law%20No.%20(6)%20of%202019%20Concerning%20Ownership%20of%20Jointly%20Owned%20Real%20Property%20in%20the%20Emirate%20of%20Dubai.html"
    },
    {
      "name": "Dubai Land Department, Service Charge Index, e-service description",
      "url": "https://dubailand.gov.ae/en/eservices/service-charge-index-overview/"
    },
    {
      "name": "Dubai Land Department, Service Charge Index lookup, project menu and budget years as offered on 16 October 2026",
      "url": "https://dubailand.gov.ae/en/eservices/service-charge-index-overview/service-charge-index/"
    },
    {
      "name": "Dubai Land Department, Mollak, the service charge system for jointly owned property",
      "url": "https://mollak.dubailand.gov.ae/publicpages/about-us.html"
    }
  ]
}
---

The service charge is the largest running cost on a Dubai apartment, the one input a listing never carries, and the only one a buyer can verify for free before making an offer. Almost nobody does.

Every guide to this subject prints a table of dirhams per square foot by community and stops there. None of them names the law. That is a shame, because the law is unusually specific about the things a buyer actually needs to know, and six of them are checkable in an afternoon.

## The approved figure is a free lookup, and it is per project

There is no such thing as the service charge for Dubai, or even for Dubai Marina. There is an approved rate for a named project, a stated usage and a budget year, and under Article 27(a) anything else is not collectable. The Land Department publishes those approved rates in its [Service Charge Index](https://dubailand.gov.ae/en/eservices/service-charge-index-overview/service-charge-index/), a service that exists, in its own description, so that anyone can "inquire about the approved service fees for Joint ownership properties from the Real Estate Regulatory Agency".

It is free, it opens without an account, and the project route never asks for a title deed. Checked on 16 October 2026, its project menu offered 5,874 entries covering 5,591 distinct projects, every one labelled with its community, and its Budget Year menu ran from 2015 to 2026. The lookup takes three fields and no more: the project, the usage and the year. [The approved figures for 31 named buildings](/service-charges/), read through it on that date, are published here with the source and the date on every row.

Three things about that menu are worth knowing before you use it, because they are where this lookup goes quietly wrong rather than where it fails.

**One tower can be several entries.** Burj Khalifa appears five times: the building itself, The Residences, Armani Residences, At the Top, and the broadcasting floors. Each is a separate budget. Choosing the wrong one returns a real approved figure for something that is not your unit.

**One project can appear under two community names.** 29 Boulevard is listed under both Burj Khalifa District and Downtown Dubai, and both entries carry the same project identifier, so both return the same budget. A name that looks duplicated is not evidence of two schemes.

**The usages and the years are per project, and this is where it bites.** Cayan Tower in Dubai Marina offered residential, retail and stores as its usages, and 2020 to 2026 as its years. The charge is approved per usage, so the retail rate in your own building is not your rate. More importantly, the year list is not a formality: 31 of the buildings queried on 16 October 2026 returned a 2026 residential figure and 15 offered no 2026 budget at all. All five Jumeirah Beach Residence towers checked stopped at 2017 or 2018, and 1 Lake Plaza in Jumeirah Lakes Towers stopped at 2012. Every published area table gives JBR a current figure anyway. A building with no approved budget for the year you are buying in has not had one approved, and that is a question for the management entity rather than a number to be averaged.

What the index will not give you is an average for a community, and that is the right behaviour rather than a gap. A per-project approval has no average a buyer can act on: two towers a street apart can sit at opposite ends of their area's range, and that range is what the published area tables are averaging. Your own building's figure is three dropdowns away, and the spread inside one area is wider than the gap between areas: on 16 October 2026 Marina Promenade in Dubai Marina was approved at AED 13.74 a foot and Cayan Tower, in the same marina, at AED 23.74.

If you already own the unit, the same service has a second route that starts from the title deed, taking the certificate number, the certificate year, the property type and the budget year, and it answers for your unit rather than for the project. A third route starts from a map.

## What the law sets

Service charges in Dubai are governed by [Law No. (6) of 2019](https://dlp.dubai.gov.ae/Legislation%20Reference/2019/Law%20No.%20(6)%20of%202019%20Concerning%20Ownership%20of%20Jointly%20Owned%20Real%20Property%20in%20the%20Emirate%20of%20Dubai.html), and the quotations below are its own official English.

**Your share is your floor area, and the deed decides what that is.** Article 25(a) calculates each owner's share "based on ratio of the area of the Owner's Unit to the total area of the Jointly Owned Real Property", using a method approved by the Director General. Article 25(b) then removes the ambiguity: the share is calculated "based on the area of his Unit as recorded in the Real Property Register". Not the brochure, not the marketing floor plan.

**The developer pays for the units nobody has bought.** The same article: "A Developer will pay his share of the annual Service Charges in respect of unsold Units", and for sold units where the sale contract makes them liable. An owner in a half-empty new tower is not quietly carrying the empty half.

**Nothing can be charged without approval.** Article 27(a) is a prohibition, not a guideline. A management entity "must not charge Owners, or collect from them, any amounts whatsoever" for managing, operating, maintaining or repairing the common parts, "or for any other reason, without first obtaining the relevant approval of RERA."

**And the approval requires an audit first.** Article 27(b): RERA may not approve or ratify the budget "unless it is approved by a certified audit firm recognised by RERA for this purpose." Article 27(c) allows for the gap between years: where necessary, "RERA may approve a temporary Service Charges budget" until the audited one is ratified. A provisional charge is a real thing with a rule behind it, which is worth knowing before assuming your building is doing something irregular.

**The money goes into a bank account, quickly.** Article 30(a) requires a dedicated service charge account with a bank licensed in the Emirate and recognised by RERA, and Article 30(b) requires collections to be deposited "within seven (7) working days from the date of collection". Article 30(c) puts those balances beyond the reach of the management company's own creditors. The Land Department's [Mollak](https://mollak.dubailand.gov.ae/publicpages/about-us.html) system monitors this, in its own description by "relying on the financial accounts operating according to the mechanism of the escrow account".

## Where the money is allowed to go

Article 30(e) is a closed list. The funds in the service charge account "may not be disposed of, and may only be used for the following purposes", and then names ten: cleaning; security and safety; operating, maintaining, repairing and improving the common parts; insurance premiums; audit fees; the management company's fee as determined by RERA; the developer's approved administrative expenses on major projects; the cash reserve; RERA's own inspection and oversight fees; and anything else set out in the master community declaration and approved by RERA.

This is more useful than it looks. When you read a budget, you are not reading a list of things the manager decided to do. You are reading a list that has to map onto those ten headings. A line that does not obviously belong to one of them is a question worth asking, and the annual general meeting is where to ask it.

## The reserve is a different bank account

Item eight on that list is the one that matters most to a buyer, and it is worth reading slowly. The service charge may fund

> "creating a cash reserve to cover emergency expenses, or to replace equipment and devices in Common Parts, which must be deposited in an account separate from the Service Charges account and may not be disposed of for any purposes, other than in critical emergencies, without first obtaining the approval of RERA".

Three things follow. The reserve is not a line in a spreadsheet, it is a second bank account. It is ring-fenced by law from the operating money, so a manager cannot quietly spend next decade's chiller on this year's landscaping. And it cannot be released for anything short of a critical emergency without RERA signing it off.

Then Article 30(f) names the thing every buyer has heard rumours about and nobody can find a rule for. Where the reserve "is not sufficient to cover emergency expenses", the Land Department may, with RERA's prior approval, "request Owners to cover these expenses."

That is the special levy. It is not a market practice, a developer's habit or a horror story. It is Article 30(f), and the reserve balance is the only thing standing between an owner and it.

## So how much is a low charge really worth?

Everyone writing about this says the same sensible thing: a building with a low charge and no reserve is deferring a bill, not saving you money. Nobody says by how much, which makes the warning impossible to act on.

It has a closed form, and it is simpler than it looks.

Take two genuinely comparable buildings, one charging `gap` dirhams a foot a year less than the other. Hold for `n` years. The saving is an area times a rate. A levy is also an area times a rate. So the area divides out, and what falls out is the levy rate at which the cheaper building's buyer is exactly back where they started:

**break-even levy per sq ft = gap × ((1 + r)^n − 1) / r**

That bracket is the future value of an ordinary annuity, and at a return of zero it collapses to `gap × n`. A four-dirham advantage held for ten years breaks even against a levy of AED 40 a foot, and that is true for a studio and for a penthouse.

At a 5% return on the money saved:

| Years held | Gap of AED 2 a foot | Gap of AED 4 a foot | Gap of AED 6 a foot |
|---|---|---|---|
| 5 | 11.05 | 22.10 | 33.15 |
| 10 | 25.16 | 50.31 | 75.47 |
| 15 | 43.16 | 86.31 | 129.47 |
| 20 | 66.13 | 132.26 | 198.40 |

Every figure in dirhams per square foot, computed from the formula above and from nothing else.

Read the table and the conventional warning stops being a rule and becomes a hold-period question. At five years, a four-dirham advantage buys a cushion of AED 22.10 a foot, which is a little over one year's charge in a mid-range tower. That is thin, and the warning is right. At twenty years the same advantage carries AED 132.26 a foot, which is several times the annual charge and larger than most capital assessments an apartment will ever see. Over a long hold the cheaper building wins comfortably, and the advice to avoid it is simply wrong.

The honest caveat is the one that makes the arithmetic worth trusting: this compares two buildings that are otherwise the same. A tower with district cooling, a pool, a gym and a concierge should cost more per foot than a walk-up, and it is not deferring anything by doing so. The comparison only means something inside a set of buildings a tenant would treat as substitutes.

## The reserve rate is published too, and the headline rate does not predict it

The formula above prices the deferred bill and then hands the reader the one input it cannot supply: which of two buildings is actually reserving. Every page on this subject fills that hole the same way, by telling the buyer to ask the management company for the reserve fund balance. That is right, and it needs a cooperative seller and a week.

For the first cut it is also unnecessary, because the Service Charge Index does not publish one figure per project. It publishes the approved budget in two parts, a general fund and a reserve, and the second part is the building's reserving policy for that budget year, proposed by the manager, approved by a RERA-recognised audit firm under Article 27(b), and ratified by RERA. It is free, it is per project, and no competing page mentions that it is there.

**Of the 31 buildings this site reproduces, 30 publish the split, and the reserve's share of the approved charge runs from 2.2% at Abbey Crescent 1 in Motor City to 25.2% at Cayan Tower in Dubai Marina, on the 2026 budgets read from the Dubai Land Department's Service Charge Index on 16 October 2026. The median is 8.7%.** An 11.5-fold range, in the line that pays for the roof.

The headline rate barely locates a building inside that range. Across the thirty, the correlation between the total charge and the reserve's share of it is 0.41, an r² of 0.17: the figure every buyer compares accounts for about a sixth of the variation in the figure that decides whether Article 30(f) ever arrives.

The clearest case in the table is a pair three fils apart. Goldcrest Views in DMCC Master Community is approved at AED 16.79 a foot and Harbour Views in Dubai Creek Harbour at AED 16.82, the dearer of the two by three fils a square foot a year. One puts AED 2.85 a foot into the separate account where the other puts AED 1.28. Run both forward through the annuity in the table above and ten years of contributions come to AED 35.85 a foot in one and AED 16.10 in the other. That gap, AED 19.75 a foot, is most of the cushion a two-dirham advantage in the headline rate buys over the same ten years, AED 25.16, and unlike the two dirhams it is invisible in the number the two buildings get compared on.

At the ends of the range it stops being a nuance. Ten years of Abbey Crescent 1's approved reserve accumulates AED 3.77 a foot. Ten years of Cayan Tower's accumulates AED 75.34. On the 900 square foot flat this site uses throughout, that is AED 270 a year going into the reserve account in the first building and AED 5,391 in the second.

Which of those is correct is not a question arithmetic answers, and a thin reserve is not automatically a failure: a low-rise with little plant to replace needs less in the account than a tower with its own chillers, lifts to the fiftieth floor and a pool, and [the chiller charge](/playbooks/district-cooling-and-chiller-charges/) is itself the largest replacement liability in the second kind of building. What the split does is turn Article 30(f) from a rumour into a comparison anyone can make for free, on the same lookup that gives the headline rate, before making an offer. [The full table is published here](/service-charges/), one row per building, each carrying the day it was read.

## What a dirham a foot costs you

On the illustrative one bedroom used throughout this site, 900 sq ft at AED 1,500,000 with AED 105,000 of rent, one dirham per square foot per year is AED 900. That is **0.86% of the gross rent** and **0.056 points of net yield** on the full cash outlay.

At the illustrative rate of AED 18 a foot, the charge is AED 16,200, or **15.4% of the gross rent**, before management, maintenance, insurance or vacancy. It is the single largest deduction between the gross yield and the net one, and the [net rental yield](/playbooks/net-rental-yield/) page carries the full sensitivity table and the rate at which this property drops below 4% net. The [calculator](/calculators/net-rental-yield/) takes the rate as an input, which is the point: it is the number most worth getting right.

It is not, however, the whole of the fixed cost. In a building served by a district cooling plant the capacity charge is levied on contracted capacity rather than on consumption, which makes it a second standing cost on the same unit, measured in the same dirhams per square foot and sitting outside this budget entirely. [District cooling and chiller charges](/playbooks/district-cooling-and-chiller-charges/) traces it to the resolution that sets it, and the common-area cooling that may not be billed to a unit lands back here, in the budget RERA has to approve.

## What to check before you make an offer

Four of these are free public lookups, and together they take about an hour.

**The approved rate for the project and year**, through the Service Charge Index lookup described above, taking care over which of a tower's entries is yours. The same screen splits that rate into the general fund and the reserve, so the building's reserving policy comes free with its price. If the figure you are quoted is not the approved figure, Article 27(a) is the article to cite.

**Whether the management company is on RERA's list.** Mollak publishes the register. A manager who is not on it cannot lawfully be collecting.

**Whether the auditor is on RERA's list.** Article 27(b) requires the budget to be approved by a recognised audit firm before RERA can ratify it, and Mollak publishes that register too. This is the check nobody makes, and it is the one that tests whether the approval process actually happened.

**The area on the title deed**, because that, and not the brochure, is what your share is calculated on.

Then ask the seller or the manager for three documents that exist by law and are therefore reasonable to request. The **approved annual budget**, which shows the line items against those ten permitted headings. The **reserve fund balance**, which is the balance of a specific separate account and can be stated as such; the lookup above gives the contribution approved for this year, not what has accumulated, and only the balance answers the Article 30(f) question. And the **history of levies**, because a building that has invoked Article 30(f) before has told you something about how the first two are being run. Article 34(b) also requires the manager to supply RERA, "every six (6) months, with a periodic report" on the management and maintenance of the property, so a manager who claims nothing is written down is describing a compliance failure rather than a filing system.

## The part that bites on the way out

Article 32(a) gives the management entity a lien on every unit for unpaid charges, and then says plainly: "A Unit may not be disposed of unless these charges are paid to the Management Entity."

Arrears do not travel with the seller as a debt to be argued about later. They stop the transfer. Under Article 32(b) an owner who does not pay within thirty days of a RERA-approved written notice faces a claim enforceable by the execution judge at the Rental Disputes Settlement Centre; under Article 32(c) that judge may order the unit "sold by public auction to collect these charges"; and under Article 32(d) the defaulting owner pays the court fees and the advocates' fees on top.

For a buyer this is a due diligence item with a clean answer: get written confirmation from the management entity that the unit is clear before the transfer, not after. For a seller it belongs on the checklist alongside the mortgage release and the developer's no objection certificate in [selling well](/playbooks/selling-well/), because it can hold up a completion just as effectively.

Every instrument cited on this page is listed, with what it sets in its own words and a link to its official text, on the [Dubai property law register](/dubai-property-law/).
