---
{
  "order": 2,
  "slug": "off-plan-irr",
  "title": "Off-plan payment plans and their real cost",
  "category": "property",
  "tier": 1,
  "calculator": "off-plan-irr",
  "reviewed": "26 August 2026",
  "summary": "Two off-plan payment plans quoted at the same headline price are not the same price, because money paid later costs less in present value, and the gap between a front loaded plan and a post handover plan is commonly five to fifteen percent of the headline figure.",
  "formula": "Monthly discount rate\n  m = (1 + annual discount rate) ^ (1/12) - 1\n\nPresent value of a plan\n  = down payment\n  + sum over k of (construction instalment / (1 + m)^k)\n  + handover payment / (1 + m)^months\n  + sum over j of (post-handover instalment / (1 + m)^(months + j))\n\nEffective discount to headline\n  = 1 - (present value / headline price)\n\nThe cheaper plan is the one with the lower\npresent value, not the lower headline price.",
  "failureModes": [
    "It assumes both plans are available on the same unit at the same headline price. They usually are not. Price the plans as actually offered or the comparison is fictional.",
    "It cannot price handover risk, which is the dominant risk in off-plan. A cheaper present value on a project that completes two years late is not cheaper.",
    "It ignores the costs that begin at handover: service charges from day one, the leasing lag before first rent, and any snagging and fit out.",
    "It assumes you can and will invest the money you have not yet paid. If it sits in a current account earning nothing, the real discount rate is close to zero and the whole advantage evaporates.",
    "It says nothing about whether the price itself is right. A brilliantly structured payment plan on an overpriced unit is still an overpriced unit."
  ],
  "whenToUse": "Whenever a developer offers you a choice of payment plans, and whenever you are comparing two projects with different schedules. Run it before you discuss price, because the structure is often worth more than the discount you were going to ask for.",
  "sources": [
    {
      "name": "Off-plan payment plans in Dubai, comparing them in today's money",
      "url": "https://www.dubaiproperty.news/market-updates/off-plan-payment-plans-in-dubai-why-smart-investors-should-compare-them-in-todays-money"
    },
    {
      "name": "Dubai Land Department, escrow and project registration",
      "url": "https://dubailand.gov.ae/en/"
    }
  ]
}
---

A developer offers you a unit at one and a half million dirhams. Plan A is twenty percent down, sixty percent during construction, twenty percent at handover in thirty months. Plan B is ten percent down, thirty percent during construction, twenty percent at handover, and forty percent spread over four years after you get the keys. Take the construction instalments as monthly across the thirty months in both plans, and the post handover forty percent as monthly across the forty eight that follow, so that the figures below can be reproduced rather than taken on trust.

Both say one and a half million. Neither costs one and a half million, and they do not cost the same.

## Why later is cheaper

Money you have not paid yet is money you still own, and money you still own is earning. If your realistic alternative return is six percent, a dirham due in four years costs you about seventy nine fils today. Discount every instalment back to the present and you get what each plan actually costs in today's money.

On the two plans above, at a six percent discount rate:

| | Plan A | Plan B |
|---|---|---|
| Headline price | 1,500,000 | 1,500,000 |
| Cost in today's money | 1,395,000 | 1,289,000 |
| Effective discount to headline | 7.0% | 14.1% |

Plan B is roughly one hundred and six thousand dirhams cheaper, on the same unit, at the same advertised price. That is seven percent of the purchase, which is more than most people negotiate off a price and considerably more than the agency commission they argue about.

## The catch, and it is a real one

Developers know this arithmetic better than buyers do. That is precisely why the extended plan often carries a higher headline price, or is only available on units that are harder to sell, or on floors nobody wants. **Compare plans at their actual quoted prices, not at a single price.** Once you do, the advantage frequently shrinks, and sometimes reverses.

The discount rate matters as much as the schedule. Use what your money would genuinely earn if you did not hand it over, which for most people is a cash or bond rate, not a hoped for equity return. A high discount rate flatters back loaded plans. Be conservative or you will talk yourself into the wrong plan with your own optimism.

## What this calculation deliberately does not cover

Handover risk. That is the actual risk in off plan, and no discount rate captures it. It is also the whole of the case for [buying ready instead](/playbooks/off-plan-vs-ready/), which deserves to be priced rather than waved at. A plan that looks cheaper in present value is worthless if the tower completes two years late or the developer restructures. Escrow account protections in Dubai are real and materially better than they were before 2008, but they protect the project's funds, not your timeline and not your opportunity cost.

Nor does it include the costs that arrive with the keys: service charges that start at handover whether or not you have a tenant, the leasing lag before the first rent, and the possibility that the market price at handover is below what you contracted to pay.
