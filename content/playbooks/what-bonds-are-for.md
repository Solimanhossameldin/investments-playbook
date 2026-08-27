---
{
  "order": 37,
  "slug": "what-bonds-are-for",
  "title": "What bonds are for",
  "category": "portfolio",
  "tier": 1,
  "calculator": "safe-withdrawal-rate",
  "reviewed": "26 August 2026",
  "summary": "Bonds are held to provide a predictable payment stream and to behave differently from equities when equities fall, not to produce high returns, which means the right question about a bond holding is what job it does in the portfolio rather than what yield it shows.",
  "formula": "The two risks\n  credit risk   will the borrower pay?\n                government (developed) ~ none\n                investment grade       ~ some\n                high yield             ~ a lot, that is the yield\n\n  rate risk     price falls when rates rise\n                approximate loss = duration x rate change\n                duration 8, rates +1%  ->  about -8%\n\nMatch the duration to the job\n  money needed in 2-3 years    short duration government\n  equity crash diversifier     longer duration government\n  income today                 credit, but count it as\n                               equity-like risk\n\nWhat bonds are not for\n  beating equities over long horizons\n  being a cash substitute, if duration is long\n  yield chasing, which just buys credit risk",
  "failureModes": [
    "The negative correlation with equities is a historical tendency, not a law, and it fails exactly in the inflation shocks where diversification is most needed.",
    "Reaching for yield in bonds means taking credit risk, which correlates with equities, so it quietly removes the diversification the allocation was for.",
    "Bond funds do not mature, so they never return a known amount on a known date. An individual bond does, and for a dated liability that difference matters.",
    "Currency exposure in a foreign bond fund can exceed the interest rate exposure, which makes an unhedged foreign bond holding a currency position first and a bond position second.",
    "In jurisdictions with tax on income, the after tax yield on a bond can be far below the headline, which changes the comparison against equities entirely.",
    "Very low or negative real yields make the conventional case for bonds much weaker, and there have been long periods where holding them cost purchasing power."
  ],
  "whenToUse": "Before buying any bond or bond fund, to name the job it is doing. Also when a portfolio described as balanced has lost money in a year when it was expected to protect.",
  "sources": [
    {
      "name": "Federal Reserve Bank of St. Louis, Treasury constant maturity yields",
      "url": "https://fred.stlouisfed.org/series/DGS10"
    },
    {
      "name": "Federal Reserve Bank of St. Louis, 10 year real yield",
      "url": "https://fred.stlouisfed.org/series/DFII10"
    },
    {
      "name": "Bank for International Settlements, debt securities statistics",
      "url": "https://www.bis.org/statistics/secstats.htm"
    }
  ]
}
---

Bonds confuse people because they are sold as the safe part and then lose money. Both halves of that sentence are true, and the resolution is understanding which risk they remove and which they add.

## The two risks

**Credit risk** is the borrower not paying. A developed market government bond has very little of it. A high yield corporate bond has a great deal, which is what the yield is compensating for.

**Interest rate risk** is the price falling when rates rise, and it is measured by [duration](/glossary/duration/). A bond with a duration of eight loses roughly eight percent of its price when rates rise a percentage point. That is arithmetic, not sentiment.

A portfolio described as safe because it holds bonds is safe from the first risk and exposed to the second, and the second is what produces the double digit annual losses that surprise people.

## What the job actually is

**A different behaviour.** In a growth shock, high quality government bonds have historically risen while equities fell. That is the diversification the allocation is buying, and it is why [correlation](/glossary/correlation/) matters more here than yield.

**A known payment.** For money needed on a date, a bond maturing near that date removes uncertainty in a way no equity can. This is the [allocation by horizon](/playbooks/asset-allocation-by-horizon/) argument made concrete.

**Dry powder.** A holding that has not fallen is what funds a [rebalance](/playbooks/rebalancing-bands/) into equities after they have.

None of those is about return. Bonds should be expected to return less than equities over long periods, and if they did not, nobody would hold equities.

## Matching duration to purpose

This is the part usually skipped. Short duration for money needed soon, longer duration for a distant liability or for genuine equity diversification.

Holding a long duration bond fund as a cash substitute is a rates bet wearing a cardigan. Holding short duration bonds as a hedge against an equity crash provides less protection than expected, because it is precisely the long end that rallies when growth disappoints.

## Where the correlation assumption fails

The diversification argument rests on bonds and equities moving apart, and they do not always. In an inflation shock both fall together, because rising rates hurt bond prices and compress equity valuations at the same time. That is the case the [all-weather](/playbooks/all-weather/) framework exists to address, and it is why inflation linked bonds and real assets sit alongside conventional bonds rather than being replaced by them.

## The practical version

Decide the job first. Money needed in three years is short duration government bonds. Diversification against an equity fall is longer duration high quality government bonds. Yield enhancement is credit risk, which is equity risk wearing a different label, and it should be counted in the equity allocation rather than the bond one.
