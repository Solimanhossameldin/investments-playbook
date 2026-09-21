---
{
  "order": 13,
  "slug": "off-plan-vs-ready",
  "title": "Off-plan vs ready property in Dubai",
  "category": "property",
  "tier": 1,
  "calculator": "off-plan-irr",
  "reviewed": "21 September 2026",
  "summary": "On the same Dubai apartment priced as cash flows, a payment plan's time value roughly pays for the rent an off-plan buyer gives up, so what decides off-plan against ready is not the discount but whether the unit is worth as much as a ready one on handover day, where five percent less moves the answer further than a two year delay.",
  "formula": "Same unit, bought two ways. At handover both buyers\nown an identical apartment, so from then on the market\ndoes the same thing to both and drops out.\n\nReady, in today's money\n  price + acquisition stack\n  - net rent, monthly, until the off-plan handover\n\nOff-plan, in today's money\n  present value of the plan's instalments\n  + registration fee at contract\n\nSet them equal. Off-plan cost is linear in its price,\nso the break-even price is exact:\n\n  p* = (ready cost - flat fees) / (plan factor + 4%)\n  break-even discount = 1 - p* / ready price\n\nWhat moves it, on the illustrative unit\n  a 24 month delay, plan A      +2.84 points\n  a 5% handover value haircut   +4.46 points\n\nThe haircut is the larger number. Price the building\nyou will be handed, not the plan you are sold.",
  "failureModes": [
    "The whole method rests on one assumption, that the off-plan unit is worth what a comparable ready unit is worth on the day it is delivered. The third table exists because that assumption is the one most likely to be wrong.",
    "The haircut table measures the shortfall against today's ready price, which is a flat market to handover. In a rising market each point of haircut is worth more dirhams than the table shows, and in a falling one fewer.",
    "Both purchases are modelled in cash. A mortgage on the ready unit, or the difficulty of financing an off-plan unit before handover, changes what each actually costs you and what you can actually afford.",
    "The ready purchase carries a 2% agency commission and the off-plan purchase carries none, on the assumption that one is bought through a broker and the other direct from the developer. Where that is not true the comparison moves, and the page shows by how much.",
    "The discount rate is yours, not the page's. It should be what your money would otherwise earn at similar risk, and the second table shows how much the answer depends on it.",
    "Off-plan service charges are estimates until the owners association is running, and the first real invoice is frequently higher than the projection used to sell the unit. The ready unit's running costs are the ones on the net yield page, and an off-plan unit's will be different from those, in a direction nobody can tell you in advance.",
    "It does not model the Article 11 branch, where the buyer stops paying. That is on the off-plan page, and it is the reason a plan you cannot finish is worth less than it looks.",
    "This is general information and not financial or legal advice."
  ],
  "whenToUse": "Before choosing between a sales office and a resale listing for the same kind of unit, and specifically before accepting a comparison made in headline prices or a discount that has been quoted to you rather than calculated.",
  "sources": [
    {
      "name": "Law No. (8) of 2007 Concerning Escrow Accounts for Real Estate Development in the Emirate of Dubai, Articles 7 and 14",
      "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2007/Law%20No.%20(8)%20of%202007.html"
    },
    {
      "name": "Dubai Land Department, Request to Register the Initial Sale, service fees",
      "url": "https://dubailand.gov.ae/en/eservices/request-to-register-the-initial-sale/"
    },
    {
      "name": "Executive Council Resolution No. (30) of 2013, fees of the Dubai Land Department",
      "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/ECR%2030%20of%202013.html"
    }
  ]
}
---

Both are sold on the same sentence: get in at today's price. Almost every page on this question then lists advantages in two columns and concludes that it depends. It does depend, and on something specific enough to calculate.

## The comparison, set up so it can be solved

Take the same apartment and buy it two ways. The unit is the one on the [net rental yield](/playbooks/net-rental-yield/) page: AED 1,500,000 ready, AED 69,127 a year of net operating income. The payment plans are the two on the [off-plan](/playbooks/off-plan-irr/) page, with a 30 month build, discounted at 6% a year.

**Ready.** You pay the price and the full acquisition stack today, AED 96,220 of fees, registration and agency commission. You collect net rent every month until the off-plan building would have been delivered. Over 30 months that rent is worth AED 160,430 in today's money, so the ready purchase costs you AED 1,435,790 net.

**Off-plan.** You pay the plan, instalment by instalment, plus the Land Department registration fee at contract. You collect nothing until handover.

Here is the step that makes it solvable. On handover day both buyers own an identical apartment. Whatever the market does after that, it does to both of them equally, so it drops out, and the only thing left to compare is what each paid, in today's money, to get there. Set the two equal and solve for the off-plan price.

## The answer, which is not the one on the brochure

| Plan | Breaks even at | Against the ready price |
|---|---|---|
| A, front-loaded: 20% down, 60% during the build, 20% at handover | AED 1,480,360 | 1.31% below |
| B, post-handover: 10% down, 30% during the build, 20% at handover, 40% over four years | AED 1,596,947 | 6.46% above |

On the front-loaded plan the off-plan unit needs to be only 1.31% cheaper than the ready one to be level. On the post-handover plan it can cost 6.46% **more** than the ready unit and still be level, because so much of the price is paid years later.

That is the opposite of the usual warning, which multiplies net yield by the years to handover and calls the result the discount the plan has to cover. On this unit that arithmetic gives 10.82%. It is wrong because it treats the off-plan buyer as if he paid the whole price on day one. He does not, and the money he has not yet paid is earning something the whole time the ready buyer's rent is.

Part of the gap is the broker. The ready purchase here carries a 2% agency commission, with VAT, and a purchase direct from a developer usually carries none. With no commission on the ready side, plan A breaks even at 3.47% below instead of 1.31%.

## What the discount rate does

The 6% is an assumption, and the answer is sensitive to it, because the rate is what makes a dirham paid later cheaper than one paid now.

| Your money would otherwise earn | Plan A breaks even at | Against the ready price | Plan B breaks even at | Against the ready price |
|---|---|---|---|---|
| 3% a year | AED 1,424,962 | 5.00% below | AED 1,482,392 | 1.17% below |
| 6% a year | AED 1,480,360 | 1.31% below | AED 1,596,947 | 6.46% above |
| 9% a year | AED 1,534,805 | 2.32% above | AED 1,711,866 | 14.12% above |

Use the rate your money would otherwise earn. If the cash would sit on deposit, the lower rows are yours and plan A needs 5.00% off the ready price. If it would otherwise be invested at a higher return, the plan is worth more to you and the break-even moves the other way.

## What a delay does, which is less than you would think

| Handover | Plan A breaks even at | Against the ready price | Plan B breaks even at | Against the ready price |
|---|---|---|---|---|
| On time | AED 1,480,360 | 1.31% below | AED 1,596,947 | 6.46% above |
| 12 months late | AED 1,458,737 | 2.75% below | AED 1,594,559 | 6.30% above |
| 24 months late | AED 1,437,712 | 4.15% below | AED 1,592,408 | 6.16% above |

A two year delay moves the front-loaded plan by 2.84 points, to 4.15% below. It costs the off-plan buyer two more years of rent he does not collect, but it also pushes his handover instalment two years later, and the second partly pays for the first. On the post-handover plan the answer barely moves.

A delay is still serious. It is serious because of what it usually signals about the building and the developer, and because of the cash you need to hold ready for a payment whose date has become uncertain. It is not serious mainly because of the rent.

## What handover value does, which is the whole question

Everything above assumes the off-plan unit is worth what a comparable ready unit is worth on the day it is delivered. That is the assumption most likely to be wrong, and this is what it costs when it is.

| Off-plan unit worth less than ready at handover by | Plan A breaks even at | Against the ready price | Plan B breaks even at | Against the ready price |
|---|---|---|---|---|
| 0% | AED 1,480,360 | 1.31% below | AED 1,596,947 | 6.46% above |
| 5% | AED 1,413,514 | 5.77% below | AED 1,524,836 | 1.66% above |
| 10% | AED 1,346,667 | 10.22% below | AED 1,452,725 | 3.15% below |

**A five percent shortfall at handover moves plan A by 4.46 points, more than a two year delay does.** At ten percent the off-plan unit has to be 10.22% below the ready price, and even the post-handover plan needs 3.15% off.

Why an off-plan unit is sometimes worth less on delivery is not mysterious. Units hand over in batches, so on handover day several hundred near-identical apartments reach the sale and rental markets in the same tower in the same month. The finish may differ from the brochure. The service charge is an estimate until the owners association has run for a year. And the delivered area can be up to five percent below the contracted area with no compensation owed, which is on the [price per square foot](/playbooks/price-per-square-foot/) page and is, on its own, a haircut of exactly the kind this table prices. Dubai values also move a long way in both directions over the life of a build, as the [Dubai price index](/dubai-price-index/) shows.

So the useful question at a sales office is not how big the discount is. It is how confident you are that this unit, in this building, will be worth what a ready equivalent is worth on the day you receive it, and whether the discount covers the size of the haircut you think is plausible.

## What protects your money, and what does not

Every Dubai project has its own escrow account under Law No. (8) of 2007, and purchasers' payments go into it. That protects your money from being spent on another project or taken by the developer's other creditors. It does not protect you from delay, from a building delivered to a different finish, or from a unit worth less than you paid. The escrow provisions and what happens if you stop paying are set out, in the law's own words, on the [off-plan](/playbooks/off-plan-irr/) page.

## The honest summary

On price alone, off-plan is closer to ready than its critics say, and a long post-handover plan can justify paying more than the ready price. What the plan cannot do is protect you against the value of the thing you are handed. Buy off-plan when you have a view on the building, the developer and the handover market that you would stake the haircut table on, and when you can fund the plan if the timeline slips. Buy ready when you would rather see what you are buying and start the income now.

Every instrument cited here is listed, with what it sets in its own words and a link to the official text, on the [Dubai property law register](/dubai-property-law/).
