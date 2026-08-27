---
{
  "order": 28,
  "slug": "inflation-and-real-returns",
  "title": "Inflation and real returns",
  "category": "cross-asset",
  "tier": 1,
  "calculator": "safe-withdrawal-rate",
  "reviewed": "26 August 2026",
  "summary": "A real return is what is left after inflation, and because inflation compounds silently against every asset at once, a portfolio that looks like it is growing in currency terms can be losing purchasing power for years without a single statement showing a loss.",
  "formula": "Real return\n  exact       (1 + nominal) / (1 + inflation) - 1\n  approximate  nominal - inflation\n\n  5% nominal, 3% inflation  ->  1.94% real\n  3% nominal, 3% inflation  ->  0% real\n  2% nominal, 4% inflation  ->  -1.92% real\n\nCompounding the difference over 30 years\n  5.0% nominal   x 4.32\n  1.9% real      x 1.76\n  Same portfolio. Different question.\n\nThe market's own numbers\n  real yield         = return after inflation on an\n                       inflation protected government bond\n  breakeven          = nominal yield - real yield\n                     = the inflation the market expects\n\n  Anything you own instead of that bond has to beat\n  the real yield, after costs, to earn its place.",
  "failureModes": [
    "Headline inflation is not your inflation. School fees, rent and healthcare have run well above general indices for long stretches, and those are the categories that dominate an expatriate family's spending.",
    "It assumes a single inflation rate applies to you, when your spending is split across countries and currencies with different rates.",
    "Inflation protected bonds carry duration risk. They protect purchasing power at maturity, not the price along the way.",
    "The property inflation hedge is weaker than usually claimed, because rent adjustment is lagged, capped by regulation in some markets, and costs inflate alongside income.",
    "Comparing a real return against a nominal target, or the reverse, produces an error the size of the inflation rate, and it happens constantly in retirement planning.",
    "Past inflation is a poor guide to future inflation, which is why the market's breakeven rate is more useful than a historical average."
  ],
  "whenToUse": "Every time a return, a target or a projection is stated. The first question about any number in a financial plan should be whether it is nominal or real, and most of the time nobody has asked.",
  "sources": [
    {
      "name": "Federal Reserve Bank of St. Louis, 10 year real yield",
      "url": "https://fred.stlouisfed.org/series/DFII10"
    },
    {
      "name": "Federal Reserve Bank of St. Louis, 10 year breakeven inflation",
      "url": "https://fred.stlouisfed.org/series/T10YIE"
    },
    {
      "name": "U.S. Bureau of Labor Statistics, Consumer Price Index",
      "url": "https://www.bls.gov/cpi/"
    }
  ]
}
---

Every return quoted anywhere is a nominal return unless it says otherwise. Nominal returns are what the statement shows. Real returns are what you can buy.

## The arithmetic

Real return is roughly the nominal return minus inflation. Precisely, it is (1 + nominal) divided by (1 + inflation), minus one, which matters at higher rates.

Five percent nominal with three percent inflation is about 1.9 percent real. Three percent nominal with three percent inflation is zero. Two percent in a deposit account with four percent inflation is a two percent annual loss, and it will appear on every statement as a gain.

## Why this is the most important number nobody uses

Over a working life the difference compounds enormously. Thirty years at five percent nominal multiplies by 4.3. Thirty years at 1.9 percent real multiplies by 1.76. Both describe the same portfolio. Only the second describes what it will buy.

Cash is the clearest case. Cash has never lost nominal value and has lost purchasing power in most decades. A saver who avoids all volatility has not avoided risk, they have chosen a certain slow loss over an uncertain outcome with a positive expectation. That is a choice, but it should be a conscious one.

## Reading it in the market

The market prices this daily and publishes the answer. The [real yield](/glossary/real-yield/) on an inflation protected government bond is the observable real return on the safest asset available. [Breakeven inflation](/glossary/breakeven-inflation/), the gap between the nominal and real yields at the same maturity, is what the market expects inflation to be.

Those two numbers give you a hurdle. If the ten year real yield is 2.38 percent, that is what a government will pay you, after inflation, for taking no credit risk. Any asset you own instead of that has to beat it, after its own costs, or it is not earning its place.

## What actually protects purchasing power

**Inflation linked bonds** do it by construction, which is why their yield is the definition of a real return.

**Property** does it imperfectly. Rents tend to follow inflation over long periods, though in Dubai the [rent increase caps](/playbooks/rent-increase-caps/) put a legal ceiling on how fast that adjustment happens. Service charges, meanwhile, inflate without a cap.

**Equities** do it well over long horizons and badly over short ones, because companies can raise prices but margins compress before they do.

**Cash** does not, ever, except briefly when rates exceed inflation.

## The practical instruction

Quote every long term plan in real terms. A retirement number, a school fee projection, a target portfolio value: state it in today's money and inflate the contributions, or state it in future money and be honest that the figure is inflated. Mixing the two is how plans that look adequate turn out not to be.
