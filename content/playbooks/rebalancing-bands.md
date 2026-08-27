---
{
  "order": 27,
  "slug": "rebalancing-bands",
  "title": "Rebalancing bands",
  "category": "portfolio",
  "tier": 2,
  "calculator": "safe-withdrawal-rate",
  "reviewed": "26 August 2026",
  "summary": "A rebalancing band is a rule that triggers a trade only when a holding drifts beyond a set distance from its target weight, which keeps a portfolio close to its intended allocation while trading far less often than a calendar schedule would.",
  "formula": "The 5/25 rule\n\n  Trigger a rebalance when a holding is\n    5 percentage points from target, absolute\n    or\n    25 percent from target, relative\n  whichever is the smaller move.\n\nWorked\n  Target 60%   absolute band  55% to 65%\n               relative band  45% to 75%\n               -> absolute binds, act at 55 or 65\n\n  Target 10%   absolute band   5% to 15%\n               relative band  7.5% to 12.5%\n               -> relative binds, act at 7.5 or 12.5\n\n  Target 4%    relative band   3% to 5%\n\nCheapest first\n  1. direct new contributions to the underweight\n  2. direct income and dividends to the underweight\n  3. only then sell the overweight",
  "failureModes": [
    "It does not reliably raise returns and any framework that sells it that way is overclaiming. Its job is holding the risk profile you chose.",
    "In a long trend, rebalancing repeatedly sells the winner and will underperform doing nothing, sometimes for years. The discipline has to survive that.",
    "Bands on very small holdings generate noise. Below a couple of percent of the portfolio, a position is usually not worth the maintenance.",
    "Illiquid assets cannot be banded at all. Property sits outside the mechanism and has to be handled by controlling what you add.",
    "Rebalancing across accounts and jurisdictions can have tax consequences that outweigh the benefit, which changes the calculation for anyone not in a zero tax jurisdiction.",
    "It assumes the target allocation was right. Rebalancing precisely to a badly chosen allocation is discipline pointed at the wrong object."
  ],
  "whenToUse": "Set the bands the day the allocation is set, not later. Check quarterly, act rarely, and never rebalance because of a market view.",
  "sources": [
    {
      "name": "A Wealth of Common Sense, Larry Swedroe's 5/25 rebalancing rule",
      "url": "https://awealthofcommonsense.com/2014/03/larry-swedroe-525-rebalancing-rule/"
    },
    {
      "name": "Morningstar, Mind the Gap 2025",
      "url": "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf"
    }
  ]
}
---

Left alone, a portfolio becomes whatever performed best. That is not a strategy, it is drift, and by the time it is obvious the concentration is already large.

## Two ways to rebalance

**By calendar.** Check on a fixed date, annually or quarterly, and restore the targets. Simple, and it trades whether or not anything has moved.

**By band.** Set a tolerance around each target and act only when a holding crosses it. A common formulation is the five and twenty five rule: act when a holding is five percentage points from its target in absolute terms, or twenty five percent away in relative terms, whichever is smaller.

For a sixty percent target, the absolute band triggers at fifty five or sixty five. For a four percent target, five points would be meaningless, so the relative band triggers at three or five percent. The rule adapts to position size, which is why it works across a whole portfolio rather than only the large holdings.

## Why bands usually win

They trade less. Fewer trades means lower costs and, in taxable jurisdictions, fewer realised gains. For an investor in the UAE the tax argument is weaker, but the cost and the behavioural argument remain.

They also act when it matters. A calendar rebalance in a quiet year does nothing useful. A band triggers precisely when something has moved a long way, which is when the portfolio has genuinely changed shape.

## What rebalancing is actually for

Not returns. The evidence that rebalancing improves returns is thin and depends heavily on the period examined. It controls risk.

An unrebalanced portfolio does not stay where you put it. A sixty forty portfolio left through a long equity bull market becomes eighty twenty, which is a different portfolio with a different [drawdown](/playbooks/drawdown-recovery-math/) profile, adopted by nobody.

The discomfort is the point. Rebalancing means selling what has done well and buying what has not, which is the opposite of what the [behaviour gap](/playbooks/the-behaviour-gap/) says investors actually do. That is precisely why it should be a rule rather than a judgement.

## Making it work

Write the bands down with the allocation. Check quarterly, act only when a band is breached. Where new money is going in, direct it at the underweight holding first, because that rebalances without selling anything.

And distinguish drift from a decision. If the allocation itself no longer suits your horizon, change the target deliberately. Do not let the market change it for you and then justify it afterwards.
