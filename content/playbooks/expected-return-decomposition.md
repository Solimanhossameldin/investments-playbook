---
{
  "order": 59,
  "slug": "expected-return-decomposition",
  "title": "Where a return actually comes from",
  "category": "valuation",
  "tier": 2,
  "reviewed": "28 August 2026",
  "summary": "Any expected return breaks into three parts, income, growth in that income, and a change in what the market pays for it, and the third part is the one nobody can forecast and almost every projection quietly assumes.",
  "formula": "Equities, the Grinold Kroner shape\n  Expected return\n    = dividend yield\n      - change in shares outstanding\n      + nominal earnings growth\n      + change in the P/E\n\n  Income, growth, repricing.\n\nProperty, the same three terms\n  Expected return\n    = cap rate\n      + growth in net operating income\n      - change in the cap rate\n\n  Income, growth, repricing again.\n\nWhat each term is\n  Income      knowable today\n  Growth      arguable, with evidence\n  Repricing   a guess, always\n\nA worked equity example\n  Dividend yield          1.5%\n  Net buybacks           +0.5%\n  Nominal earnings growth 5.0%\n  Repricing               0.0%\n  ----------------------------\n  Expected nominal        7.0%\n  Less inflation          2.5%\n  Expected real           4.5%\n\nThe test to apply to any pitch\n  Which of the three terms is\n  carrying the number, and is it\n  the one nobody can forecast?",
  "failureModes": [
    "Putting a positive number in the repricing term and calling it growth. A projection that assumes the market will pay a higher multiple in ten years than it pays today is a forecast about other people's future willingness to pay, not about the asset, and it should be labelled as the assumption it is rather than folded into a single headline figure.",
    "Forecasting earnings growth from the last decade. Earnings growth over any ten year window is heavily influenced by where that window started in the cycle, and extrapolating a period that began in a recession or ended in a boom builds the cycle into a number meant to describe a generation.",
    "Ignoring share count on the equity side. A market where companies are net buyers of their own shares delivers more per share than the aggregate earnings growth suggests, and one where they are net issuers delivers less, and the difference has run to a percentage point a year in both directions in different decades.",
    "Confusing rent growth with growth in net operating income on the property side. Rent can rise while net income falls, because the service charge, insurance and maintenance are growing too, and only the net figure belongs in this decomposition.",
    "Applying the decomposition to a leveraged position without saying so. Debt multiplies whatever these three terms produce, in both directions, and a levered return quoted next to an unlevered one is a comparison between leverage and no leverage rather than between two assets."
  ],
  "whenToUse": "Whenever a number is presented as an expected return, from a fund factsheet, a developer's brochure or your own spreadsheet. Take the number apart into the three terms before comparing it with anything, because two numbers built from different terms are not comparable at all.",
  "sources": [
    {
      "name": "CFA Institute, capital market expectations, forecasting asset class returns",
      "url": "https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/capital-market-expectations-part-ii"
    },
    {
      "name": "Vanguard Capital Markets Model, ten year return forecasts",
      "url": "https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html"
    },
    {
      "name": "Aswath Damodaran, valuation data and teaching materials",
      "url": "https://pages.stern.nyu.edu/~adamodar/"
    },
    {
      "name": "FRED, 10-year Treasury constant maturity (DGS10)",
      "url": "https://fred.stlouisfed.org/series/DGS10"
    }
  ]
}
---

Ask where a return comes from and most answers describe the asset. The useful answer describes the arithmetic, and the arithmetic is the same for a share, an index fund and an apartment.

Three terms. What the asset pays you now. How fast that payment grows. And what happens to the price the market puts on each unit of that payment.

Income, growth, repricing. Everything else is detail.

## The equity version

The standard formulation decomposes an expected equity return into the dividend yield less the change in shares outstanding, plus nominal earnings growth, plus the change in the price to earnings ratio.

The first two terms are income and growth. The third is repricing, and it is where the trouble lives.

Income is knowable today. You can look up the yield. Growth is arguable, and there is a century of evidence to argue with. Repricing is a guess about what multiple strangers will be willing to pay a decade from now, and no amount of analysis converts it into anything else.

## The property version, which is the same equation

The same decomposition applied to real estate gives the expected return as the cap rate, plus growth in net operating income, minus the change in the cap rate.

Read those next to each other. The [cap rate](/playbooks/cap-rate/) is the income term. Growth in net operating income is the growth term, and note that it is **net** income rather than rent, which is why the service charge belongs in the calculation and not in a footnote. The change in the cap rate is repricing, with the sign flipped because a rising cap rate means a falling price.

This is worth sitting with. A Dubai apartment and a global index fund are usually discussed as though they were different kinds of thing. They are the same three terms with different labels, and once the terms are separated the comparison in [property versus index funds](/playbooks/property-vs-index-funds/) becomes a comparison rather than an argument.

## What this catches

A number quoted as an expected return can be built from any mix of the three, and the mix is what decides whether it is credible.

A projection that produces twelve percent from a five percent net yield and seven percent of annual price growth is a projection resting almost entirely on repricing, presented as though it rested on the building. A projection that produces seven percent from a four point two percent [net yield](/playbooks/net-rental-yield/) and modest rent growth, with nothing in the repricing term, is a much smaller claim and a much more defensible one.

Both are called an expected return. They are not the same kind of statement.

The discipline is to ask, of any number: **which of the three terms is carrying this, and is it the one nobody can forecast?**

## The honest limits

This is an identity looking backwards and a forecast looking forwards, and the difference matters. Decomposing a realised return is arithmetic, and it will always add up. Decomposing an expected return means putting a number in each box, and two of the three boxes are opinions.

The repricing term is the worst of them. Over a decade it is often the largest single contributor to what actually happened, and it is the one term with no defensible forecast. The most honest treatment is to set it to zero, state that you have done so, and note that the outcome will differ from the projection mostly because of the term you refused to guess at.

That refusal is also the connection to [CAPE](/playbooks/cape/). A starting valuation is the level from which repricing happens, and a high one makes a positive repricing term harder to justify without saying so out loud.

## Where the number ends up

Once a return is decomposed, it feeds the decisions that depend on it. What a plan can withdraw, which is [safe withdrawal rate](/playbooks/safe-withdrawal-rate/). Whether a purchase clears its hurdle, which is [discounted cash flow](/playbooks/discounted-cash-flow/). Whether the fees being charged are a reasonable share of what is expected, which is [fee drag](/playbooks/fee-drag/) and which looks very different against a seven percent expectation than against a twelve percent one.

And in real terms, always, because a nominal expectation and a real one differ by an amount that compounds. [Inflation and real returns](/playbooks/inflation-and-real-returns/) is the conversion, and it belongs at the end of this calculation rather than nowhere.
