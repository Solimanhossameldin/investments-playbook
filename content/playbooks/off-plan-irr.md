---
{
  "order": 2,
  "slug": "off-plan-irr",
  "title": "Off-plan payment plans in Dubai",
  "category": "property",
  "tier": 1,
  "calculator": "off-plan-irr",
  "reviewed": "14 September 2026",
  "summary": "Two off-plan payment plans quoted at the same headline price are not the same price, because money paid later costs less in present value, and the gap between a front loaded plan and a post handover plan is commonly five to fifteen percent of the headline figure, while the same plan also fixes, by statute, what a default costs you.",
  "formula": "Monthly discount rate\n  m = (1 + annual discount rate) ^ (1/12) - 1\n\nPresent value of a plan\n  = down payment\n  + sum over k of (construction instalment / (1 + m)^k)\n  + handover payment / (1 + m)^months\n  + sum over j of (post-handover instalment / (1 + m)^(months + j))\n\nEffective discount to headline\n  = 1 - (present value / headline price)\n\nWhat a default costs, Article 11\n  ceiling  = retention band x contract price of the unit\n  retained = the lesser of amounts paid and the ceiling\n  refund   = amounts paid - ceiling, or nothing if that is negative\n\nThe ceiling is a fraction of the price. It is not\na fraction of what you have paid, and it does not\ngrow as you pay.",
  "failureModes": [
    "It assumes both plans are available on the same unit at the same headline price. They usually are not. Price the plans as actually offered or the comparison is fictional.",
    "It cannot price handover risk, which is the dominant risk in off-plan. A cheaper present value on a project that completes two years late is not cheaper.",
    "It ignores the costs that begin at handover: service charges from day one, the leasing lag before first rent, and any snagging and fit out.",
    "It assumes you can and will invest the money you have not yet paid. If it sits in a current account earning nothing, the real discount rate is close to zero and the whole advantage evaporates.",
    "It says nothing about whether the price itself is right. A brilliantly structured payment plan on an overpriced unit is still an overpriced unit.",
    "The default arithmetic below is the statutory ceiling, not a prediction. Article 11 says how much a developer may keep, not how much he will ask for, and the rules and procedures stipulated in this Article are considered part of public order, so a contract term that goes further does not rescue him."
  ],
  "whenToUse": "Whenever a developer offers you a choice of payment plans, and whenever you are comparing two projects with different schedules. Run it before you discuss price, because the structure is often worth more than the discount you were going to ask for, and because the plan you sign also fixes what the deal costs you if your circumstances change.",
  "sources": [
    {
      "name": "Law No. (19) of 2020 amending Law No. (13) of 2008, Article 11",
      "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2020/Law%20No.%20(19)%20of%202020%20Amending%20Law%20No.%20(13)%20of%202008%20Regulating%20the%20Interim%20Real%20Property%20Register%20in%20the%20Emirate%20of%20Dubai.html"
    },
    {
      "name": "Law No. (13) of 2008 Regulating the Interim Real Property Register, Article 3",
      "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2008/Law%20No.%20(13)%20of%202008.html"
    },
    {
      "name": "Law No. (8) of 2007 Concerning Escrow Accounts for Real Estate Development, Articles 7 and 14",
      "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2007/Law%20No.%20(8)%20of%202007.html"
    },
    {
      "name": "Dubai Land Department, Request to Register the Initial Sale, service fees",
      "url": "https://dubailand.gov.ae/en/eservices/request-to-register-the-initial-sale/"
    }
  ]
}
---

A developer offers you a unit at one and a half million dirhams. Plan A is twenty percent down, sixty percent during construction, twenty percent at handover in thirty months. Plan B is ten percent down, thirty percent during construction, twenty percent at handover, and forty percent spread over four years after you get the keys. Take the construction instalments as monthly across the thirty months in both plans, and the post handover forty percent as monthly across the forty eight that follow, so that the figures below can be reproduced rather than taken on trust.

Both say one and a half million. Neither costs one and a half million, and they do not cost the same.

## Why later is cheaper

Money you have not paid yet is money you still own, and money you still own is earning. If your realistic alternative return is six percent, a dirham due in four years costs you about seventy nine fils today. Discount every instalment back to the present and you get what each plan actually costs in today's money.

On the two plans above, at a six percent discount rate:

| Measure | Plan A | Plan B |
|---|---|---|
| Headline price | 1,500,000 | 1,500,000 |
| Cost in today's money | 1,394,818 | 1,288,608 |
| Effective discount to headline | 7.0% | 14.1% |

Plan B is roughly one hundred and six thousand dirhams cheaper, on the same unit, at the same advertised price. That is seven percent of the purchase, which is more than most people negotiate off a price and considerably more than the agency commission they argue about. The [off-plan payment plan calculator](/calculators/off-plan-irr/) runs the same arithmetic on your own figures.

## The catch, and it is a real one

Developers know this arithmetic better than buyers do. That is precisely why the extended plan often carries a higher headline price, or is only available on units that are harder to sell, or on floors nobody wants. **Compare plans at their actual quoted prices, not at a single price.** Once you do, the advantage frequently shrinks, and sometimes reverses.

The discount rate matters as much as the schedule. Use what your money would genuinely earn if you did not hand it over, which for most people is a cash or bond rate, not a hoped for equity return. A high discount rate flatters back loaded plans. Be conservative or you will talk yourself into the wrong plan with your own optimism.

## The other half of the plan, which nobody prices

Everything above is true on the branch where you pay to the end. The plan also decides what happens on the branch where you cannot, and that branch is not a matter of negotiation. It is Article 11 of Law No. (13) of 2008, in the form [Law No. (19) of 2020](https://dlp.dubai.gov.ae/Legislation%20Reference/2020/Law%20No.%20(19)%20of%202020%20Amending%20Law%20No.%20(13)%20of%202008%20Regulating%20the%20Interim%20Real%20Property%20Register%20in%20the%20Emirate%20of%20Dubai.html) gave it.

The route runs through the Land Department rather than a court. The developer notifies the DLD; the DLD verifies the breach, serves a thirty (30) days' notice on the purchaser, and attempts to mediate an amicable settlement. If the notice expires without compliance, the DLD issues an official document recording the percentage of the project that has been completed. That percentage, and nothing else, decides what the developer may keep.

| Completion of the project | The developer may retain up to | Of what |
|---|---|---|
| Over 80% | 40% | The contract price of the unit |
| 60% to 80% | 40% | The contract price of the unit |
| Work commenced, under 60% | 25% | The contract price of the unit |

Read the third column twice, because it is the whole of the difference between this page and the brochure. Each band is written as a ceiling on **the value of the Real Property Unit stipulated in the Off-plan Sale agreement**. The ceiling is a fraction of the price of the flat. It is not a fraction of the money you have handed over.

Above 80% complete the developer has two further options instead of terminating: he may retain all amounts paid by the purchaser and claim the balance of the price from him, or ask the DLD to sell the unit at public auction. Neither resolves to a number without a sale, so neither is priced here.

### Three things follow, and all three are counterintuitive

Take the same illustrative one bedroom this site uses throughout, at AED 1,500,000, and a project under 60% complete. The ceiling is 25% of 1,500,000, which is **AED 375,000**.

| Paid so far | Developer may retain | Refunded to you | Share of your money lost |
|---|---|---|---|
| 300,000 | 300,000 | 0 | 100.0% |
| 480,000 | 375,000 | 105,000 | 78.1% |
| 600,000 | 375,000 | 225,000 | 62.5% |
| 840,000 | 375,000 | 465,000 | 44.6% |
| 1,200,000 | 375,000 | 825,000 | 31.3% |

**One: the standard deposit sits entirely inside the standard forfeiture.** Twenty percent of the price is AED 300,000. The ceiling is AED 375,000. A buyer who pays the deposit and then stops gets nothing back, and has still not reached the ceiling. On a 20% down payment there is no band of the plan, none at all, in which a refund exists.

**Two: paying more does not increase what you can lose.** The ceiling is fixed at signing by the price you agreed. Once your payments pass it, every further dirham is refundable. The dirham figure the developer may keep is the same at 480,000 paid and at 1,200,000 paid; only the proportion falls. The instinct to pay slowly to limit the downside is backwards. The downside was fixed the day you signed.

**Three: the refund falls as the building rises.** Crossing 60% completion moves the ceiling from 25% to 40%, which on this unit is a move from AED 375,000 to AED 600,000. Hold everything the buyer has done constant at AED 840,000 paid, eighteen months into the plan, and the amount he would be refunded falls from **AED 465,000 to AED 240,000** the day the project's completion percentage ticks past sixty. He did nothing. Nobody tells him. On this unit the drop reaches **AED 225,000** and stops there, because that is the full fifteen point step applied to the price.

That third figure is the one to ask about before you sign, because it is the only one that moves on somebody else's timetable, and it is the reason a buyer whose circumstances are wobbling is better off acting early than waiting to see.

### The band that no longer exists

A fourth band circulates widely: *up to thirty percent of the amounts paid, where work has not commenced*. It appears on several of the pages that currently rank for this question. It is the 2017 text, it was the only band ever measured against payments rather than the price, and the 2020 replacement does not contain it. What the new Article 11 says instead is that where the developer has not commenced work for any reason beyond his control, without negligence or omission on his part, or where the project is cancelled by a final reasoned decision of RERA, **the Developer must refund all payments made by the purchasers**. Not seventy percent of them. All of them.

If a developer, a broker or a page quotes you the 30% band, that is a reliable signal that nobody involved has opened the instrument since 2020.

### When the money comes back

Whatever is above the ceiling must be refunded within one year from the termination of the agreement, or **within sixty (60) days from the date of resale** of the unit, whichever is earlier. And the rules and procedures stipulated in this Article are considered part of public order, which in practice means a contract clause that keeps more, or keeps it longer, does not save the developer. It also means the arithmetic above is a floor on your position, not a hopeful reading of it.

## What escrow does, and what it does not

Escrow is the protection buyers are told about and the one most often misdescribed. Under [Law No. (8) of 2007](https://dlp.dubai.gov.ae/Legislation%20Reference/2007/Law%20No.%20(8)%20of%202007.html), an escrow account is opened by written agreement between the developer and the escrow agent whereby the payments made by off-plan purchasers, or by the financers of the project are deposited in an account opened with the Escrow Agent in the name of the project. The agent must retain five percent (5%) of the total value of each Escrow Account once the developer obtains the completion certificate, and that retention is released to the Developer one (1) year from the registration of Units in the name of purchasers.

Read plainly, that is a mechanism for keeping the project's money inside the project and holding back a slice against defects for a year after title passes. It is real and it is materially better than what existed before 2008. It is not a guarantee that the tower completes, not a guarantee of the date, and not a guarantee of the value at handover. Escrow protects the money from being spent on something else. It does not protect your timeline, and Article 11 is what governs your money if you are the one who cannot continue.

## Registering the initial sale

An off-plan purchase is registered in the Interim Real Property Register, and this is not paperwork. Article 3 of Law No. (13) of 2008 says that any sale or other legal disposition that transfers or restricts ownership **will be void unless entered in that Register**.

The Land Department's own page for the [initial sale registration](https://dubailand.gov.ae/en/eservices/request-to-register-the-initial-sale/) prints the 4% as two halves: **The seller: 2% of the sale value** and **The purchaser: 2% of the sale value**, plus AED 10 knowledge and AED 10 innovation fees. On an initial sale the seller is the developer. On this unit that is AED 30,000 on each side.

That matters more off-plan than it does on a resale. On the resale market the other half belongs to an individual who will simply refuse, which is why [the buyer normally carries all 4%](/playbooks/net-rental-yield/). Off-plan, the counterparty is a developer with a sales target, running a launch, in a market where the fee is routinely absorbed as an incentive. It is a 30,000 dirham question and it is asked at the point of sale or not at all.

The AED 1,000 Oqood charge, which brokers frequently quote to buyers, appears on that same page under self-registration fees for developers, for provisional sale. It is filed as a developer's cost, not a buyer's.

## What this deliberately does not cover

Handover risk. That is the actual risk in off plan, and no discount rate captures it. It is also the whole of the case for [buying ready instead](/playbooks/off-plan-vs-ready/), which deserves to be priced rather than waved at. A plan that looks cheaper in present value is worthless if the tower completes two years late or the developer restructures.

Nor does it include the costs that arrive with the keys: [service charges](/playbooks/service-charge-and-reserves/) that start at handover whether or not you have a tenant, the leasing lag before the first rent, and the possibility that the market price at handover is below what you contracted to pay. The [Dubai price index](/dubai-price-index/) is the honest record of how often that last one has happened.

Every instrument cited here is listed, with what it sets and a link to the official text, in the [Dubai property law register](/dubai-property-law/).
