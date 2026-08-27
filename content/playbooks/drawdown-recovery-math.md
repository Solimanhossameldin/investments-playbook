---
{
  "order": 10,
  "slug": "drawdown-recovery-math",
  "title": "Drawdown recovery math",
  "category": "risk",
  "tier": 2,
  "reviewed": "26 August 2026",
  "summary": "Losses and gains are not symmetric: a fall of fifty percent requires a gain of one hundred percent to get back to where you started, and the required recovery accelerates sharply as the loss deepens.",
  "formula": "Gain required to recover a loss\n  = L / (1 - L)\n  where L is the loss as a decimal\n\n  30% loss  ->  0.30 / 0.70  =  42.9%\n  50% loss  ->  0.50 / 0.50  =  100%\n  70% loss  ->  0.70 / 0.30  =  233%\n\nYears to recover at an annual return r\n  = ln(1 / (1 - L)) / ln(1 + r)\n\n  A 50% loss at 8% a year takes about 9 years.\n  A 70% loss at 8% a year takes about 15.6 years.\n\nWith leverage\n  Equity is wiped out when the asset falls by\n  the deposit percentage. A 25% deposit is gone\n  on a 25% fall in the asset.",
  "failureModes": [
    "It measures nominal recovery. Recovering your starting number after five years of inflation is not recovering your purchasing power.",
    "It assumes you hold. Most of the damage from large drawdowns is done by selling near the bottom, which converts a temporary fall into a permanent loss.",
    "It says nothing about probability. A wide range of assets can fall thirty percent, far fewer can fall eighty, and the table treats both as arithmetic rather than as risks to be weighted.",
    "Used carelessly it argues for holding cash, which has its own guaranteed real loss to inflation. Avoiding drawdowns entirely has a cost too, it is just quieter.",
    "For someone contributing regularly, a drawdown early in the accumulation phase is genuinely good news, because subsequent contributions buy more units. The table is most relevant at and after the peak of the balance."
  ],
  "whenToUse": "Before adding leverage, before concentrating a position, and any time an asset has risen so far that the potential fall has become large. Read it as a constraint on position size rather than as a market view.",
  "sources": [
    {
      "name": "Morningstar, Mind the Gap 2025",
      "url": "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf"
    }
  ]
}
---

This is the most important piece of arithmetic in risk management and it takes one line to state.

If you lose x percent, the gain required to get back to level is x divided by one minus x. That is not intuitive, and the gap between intuition and reality is where a great deal of money goes.

| Fall | Gain required to recover |
|---|---|
| 10% | 11% |
| 20% | 25% |
| 30% | 43% |
| 40% | 67% |
| 50% | 100% |
| 60% | 150% |
| 70% | 233% |
| 80% | 400% |
| 90% | 900% |

Notice where it turns. Up to about twenty percent, losses and recoveries are roughly in the same neighbourhood, and time fixes them. Past fifty percent, the required recovery becomes something you can no longer wait for at any reasonable rate of return: a hundred percent gain at eight percent a year takes nine years, and a four hundred percent gain takes twenty one.

## What follows from this

**Avoiding large losses matters more than capturing large gains.** Not because the gains are unwelcome but because the arithmetic is asymmetric and time is finite. A strategy that captures eighty percent of the upside and avoids the worst of the downside will usually beat one that captures everything in both directions, and it will do so with a fraction of the anxiety.

**Leverage is where this bites.** A property bought with a twenty five percent deposit loses its entire equity on a twenty five percent price fall. The asset is down a quarter, your money is down all of it, and the recovery required on your capital is infinite because there is no capital left. This is the mechanism by which leveraged property investors are wiped out in markets that only fell moderately.

**Concentration is the other place.** A single stock or a single building can fall eighty percent. A global equity index has never done so. The recovery table is an argument for diversification that does not require any view about which assets will do well.

## The uncomfortable corollary

It also explains why the fear of missing out is more expensive than it looks. Chasing the asset that has already risen most is a way of buying the position with the largest potential drawdown, at the moment the drawdown is most likely. The recovery table is what turns that from a saying into a number.
