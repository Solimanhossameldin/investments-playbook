---
{
  "order": 46,
  "slug": "position-sizing",
  "title": "Position sizing",
  "category": "risk",
  "tier": 1,
  "calculator": "net-rental-yield",
  "reviewed": "28 August 2026",
  "summary": "Position sizing decides how much of a portfolio a single holding may occupy, and it is chosen by asking what happens if that holding goes to zero rather than by how confident anyone feels about it.",
  "formula": "The sizing question, asked correctly\n  If this position went to zero,\n  what would the portfolio be down,\n  and would that change how I behave?\n\n  Portfolio impact = Position weight x Loss on the position\n\nSizing from a tolerable loss\n  Maximum weight = Tolerable portfolio loss / Plausible loss on the holding\n\n  Tolerable loss 5%, plausible loss on a single equity 60%\n    Maximum weight = 5 / 60 = 8.3%\n\n  Tolerable loss 5%, plausible loss on a broad index fund 40%\n    Maximum weight = 5 / 40 = 12.5%\n\nThe correlation adjustment people skip\n  Positions that fall together are one position.\n  Size the GROUP, not each holding.\n\nProperty, where the leverage sits\n  Equity loss = Price fall / Deposit share\n  A 20% fall at 75% loan to value\n    = 20 / 25 = 80% of the equity gone",
  "failureModes": [
    "Sizing by conviction rather than consequence. Confidence is not a measurable quantity and it is highest exactly when a position has already run, which is when it deserves the most scrutiny rather than the least.",
    "Treating correlated holdings as separate positions. Four apartments in one tower, or five technology funds, are one bet wearing several names, and the sizing rule has to apply to the group.",
    "Ignoring what leverage does to the denominator. A property bought with a quarter down turns a modest price fall into most of the equity, so the position is far larger in risk terms than its purchase price suggests.",
    "Forgetting the position you did not choose. Employer equity, a pension in one market, and a home in the city you work in are all positions, and they are usually the largest and most correlated ones a person holds.",
    "Sizing once and never again. A holding that doubles has doubled its weight, and a rule that is never rechecked quietly stops being a rule at all."
  ],
  "whenToUse": "Before adding any holding, and once a year on everything already held, including the positions that were never a decision. The right moment to set a limit is while nothing is going wrong.",
  "sources": [
    {
      "name": "Bogleheads wiki",
      "url": "https://www.bogleheads.org/wiki/Main_Page"
    },
    {
      "name": "Aswath Damodaran, valuation data and teaching materials",
      "url": "https://pages.stern.nyu.edu/~adamodar/"
    },
    {
      "name": "Morningstar, Mind the Gap",
      "url": "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf"
    }
  ]
}
---

Most people size positions by how much they like them. That is the whole problem, stated in a sentence.

Liking is not a quantity. It cannot be checked, it cannot be compared between two holdings, and it peaks at the worst possible moment: after something has already gone up a great deal, which is when it represents the most risk and inspires the most confidence.

The sizing question is not how good is this. It is: **if this went to zero, what would the portfolio be down, and would that change how I behave?**

## Working backwards from a tolerable loss

The arithmetic is simple enough to do in your head, which is the point of it.

Decide what portfolio-level loss you could absorb from one holding failing without it changing your decisions. Estimate what that holding could plausibly lose. Divide the first by the second and you have the maximum weight.

Five percent of the portfolio, against a single company that could plausibly fall sixty percent, gives about eight percent. The same five percent against a broad index fund that might fall forty gives twelve and a half. **The riskier the holding, the smaller the position**, which everyone agrees with in principle and very few portfolios reflect.

Note what the calculation does not contain: any view about whether the holding is good. That is deliberate. Sizing and selection are separate decisions, and merging them is how a portfolio ends up concentrated in whatever its owner was most recently persuaded by.

## Things that fall together are one position

This is the error that does the real damage, because it survives a portfolio that looks diversified.

Four apartments in the same tower is not four positions. Five technology funds is one position. A local bank, a local developer and a local index are one bet on one economy. The sizing rule applies to **the group that moves together**, not to the line items, and [what diversification does](/playbooks/what-diversification-does/) is the framework for working out which things those are.

The version of this that catches nearly everyone: your employer, your pension, and the city you own a home in are frequently the same bet. If the local economy turns, the job, the property and the portfolio move at once. That is a single enormous position that was never sized because it was never experienced as a decision.

## What leverage does to the number

In property the sizing question has a denominator most people use wrongly.

A property bought with twenty five percent down does not lose twenty percent of your money when the price falls twenty percent. It loses eighty percent of your equity. The position, measured in risk rather than purchase price, is four times larger than it looks.

That is not an argument against borrowing. It is an argument for sizing the position on the equity at risk rather than the asset value, and for checking [break-even occupancy](/playbooks/break-even-occupancy/) alongside it, because a leveraged position that also has to be let in order to stand still carries two risks that arrive together.

## The rule decays unless it is rechecked

A holding that doubles has doubled its weight. Nobody rebalances into a limit they set three years ago and never looked at again, which is how a sensible eight percent position becomes an unsensible twenty two percent one without a single decision being taken.

[Rebalancing bands](/playbooks/rebalancing-bands/) is the mechanism for that, and [concentration limits](/playbooks/concentration-limits/) is the same idea applied at the level of a whole category rather than a single holding.

The discipline is unglamorous: write the limits down while nothing is happening, and check them on a date rather than on a feeling. A rule you only consult when worried is a rule that arrives too late to help.
