---
{
  "order": 26,
  "slug": "asset-allocation-by-horizon",
  "title": "Allocation by horizon",
  "category": "portfolio",
  "tier": 1,
  "calculator": "safe-withdrawal-rate",
  "reviewed": "26 August 2026",
  "summary": "Allocation by horizon assigns each pot of money an asset mix based on when it will be spent rather than on the owner's appetite for risk, because a deposit needed in eighteen months and a retirement fund needed in twenty five years are different problems that a single risk profile cannot answer.",
  "formula": "Bucket by date, then allocate.\n\n  Under 2 years      cash, short deposits\n                     0% equity, no exceptions\n\n  2 to 5 years       short and medium bonds\n                     0-30% equity depending on how firm\n                     the date is\n\n  5 to 15 years      balanced\n                     40-70% equity\n\n  15 years plus      predominantly equity\n                     70-100%\n\n  Property           funded only from the 15 year bucket\n\nThen check\n  Does the sum of the short buckets cover everything\n  I know I must pay in the next 24 months?\n  If not, the allocation is wrong regardless of what\n  the risk questionnaire said.",
  "failureModes": [
    "Horizons move. Redundancy, illness or a change of country can turn a fifteen year bucket into a two year one overnight, which is the argument for holding the short bucket larger than feels necessary.",
    "The bands are conventions rather than science. The principle, that time until spending drives the mix, is robust; the exact percentages are not.",
    "It says nothing about currency. A long bucket allocated correctly but denominated in the wrong currency is still mismatched, which the peg framework covers.",
    "Illiquid assets cannot be re-bucketed later, so the horizon judgement has to be made before purchase rather than reviewed afterwards.",
    "A single very large expense inside a long horizon can dominate it. Model the specific liability rather than assuming the average.",
    "It can encourage over-engineering. Three buckets that exist are worth more than seven that are conceptually neater and never maintained."
  ],
  "whenToUse": "Before choosing any allocation, and again whenever a date changes. It is also the fastest way to diagnose a portfolio that feels wrong without knowing why.",
  "sources": [
    {
      "name": "Morningstar, Mind the Gap 2025",
      "url": "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf"
    },
    {
      "name": "Federal Reserve Bank of St. Louis, real yields and inflation series",
      "url": "https://fred.stlouisfed.org/series/DFII10"
    }
  ]
}
---

The standard approach asks how much risk you can tolerate and produces one allocation for everything you own. That question has the wrong subject. Risk tolerance is a feeling. The date the money is needed is a fact.

## The frame

Split what you own by when it will be spent, and allocate each bucket to that horizon.

**Under two years.** School fees, a deposit, a planned relocation. Cash and short dated instruments. No equities, whatever the outlook, because the recovery time from a bad year exceeds the horizon.

**Two to five years.** Short and medium duration bonds, some equity if the date is soft. A [drawdown](/glossary/drawdown/) here is survivable but not comfortable.

**Five to fifteen years.** A balanced mix. Long enough that equity volatility is a feature rather than a threat, short enough that a bad final year still matters.

**Fifteen years and beyond.** Predominantly equity. Over that span the risk of holding equities is lower than the risk of not holding them, because inflation compounds against cash relentlessly and quietly.

## Why this beats a single risk profile

It removes the two failure modes that actually destroy outcomes.

The first is having money you need next year invested in something that can fall forty percent. No risk questionnaire prevents this, because the questionnaire asks how you feel rather than when you need it.

The second is having a thirty year horizon invested in cash because a questionnaire once described you as cautious. That is not caution, it is a guaranteed real loss, and it is the more common error among conservative savers.

## Where property fits

Property is a fifteen year plus asset by construction. The [transaction cost drag](/playbooks/transaction-cost-drag/) alone requires years to absorb, and it cannot be sold in part or in a hurry.

Which means property should be funded from the long bucket, and buying it should never drain the short one. A purchase that consumes the emergency reserve has moved money from the two year bucket into the fifteen year one, and the [emergency liquidity](/playbooks/emergency-liquidity/) framework explains why that ends badly.

## The part people skip

Write down the actual dates. Not "retirement", a year. Not "the children's education", the year the first one starts. Most people discover when they do this that their horizons are shorter and more clustered than they assumed, and that changes the allocation before any market view does.
