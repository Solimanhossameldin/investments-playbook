---
{
  "order": 45,
  "slug": "cash-and-short-bonds",
  "title": "Where cash should actually sit",
  "category": "portfolio",
  "tier": 1,
  "calculator": "safe-withdrawal-rate",
  "reviewed": "28 August 2026",
  "summary": "Cash held for a known purpose belongs in an instrument that matches when the money is needed, which for most horizons means a short dated government bill or a fund of them rather than a current account, because the gap between the two is a real return given away for nothing.",
  "formula": "The question that picks the instrument\n  When, exactly, is this money needed?\n\n  Within days           current account\n  Weeks to months       money market or short bill fund\n  Six months to 2 yrs   short dated government bills, held to maturity\n  Beyond two years      this is not cash, decide an allocation\n\nWhat idle cash costs, in real terms\n  Real return = (1 + nominal) / (1 + inflation) - 1\n  A current account at 0.5% with inflation at 3%\n    = (1.005 / 1.03) - 1 = -2.4% a year\n\nThe gap, compounded, on an emergency fund\n  Shortfall = Balance x (bill yield - account yield) x years\n  On 200,000 over three years at a 3 point gap\n    = 18,000 given away for no additional risk taken",
  "failureModes": [
    "Reaching for yield turns cash into something that is not cash. An instrument that can fall in value on the day you need it has failed at the only job cash has, whatever its yield looked like beforehand.",
    "A government bill is only free of credit risk in its own currency, and it is never free of inflation risk. Holding a year of spending in bills through a high inflation year still loses purchasing power, just less of it.",
    "Money market funds are not deposits and are not insured as deposits. They are extremely safe and they are not identical to a bank balance, and the difference matters exactly once, in a crisis.",
    "Currency is the risk people forget. Cash held for a dirham liability belongs in dirhams or dollars given the peg, and cash held for a future expense in another currency is exposed to a move nobody is being paid to take.",
    "Tax and access can reverse the ranking. An instrument with a better yield that locks the money past the date it is needed, or that is taxed in a way the alternative is not, is the worse instrument regardless of the headline rate."
  ],
  "whenToUse": "On every balance sitting still with a purpose attached: the emergency fund, a deposit being saved, the reserve behind a property, or the first years of spending in drawdown. Not on money that has no date, which is an allocation question rather than a cash one.",
  "sources": [
    {
      "name": "FRED, 2-year Treasury constant maturity",
      "url": "https://fred.stlouisfed.org/series/DGS10"
    },
    {
      "name": "Bogleheads wiki",
      "url": "https://www.bogleheads.org/wiki/Main_Page"
    },
    {
      "name": "SEC, investor bulletin on fees and expenses",
      "url": "https://www.sec.gov/investor/alerts/ib_fees_expenses.pdf"
    }
  ]
}
---

Cash is the part of a portfolio people think least about and lose the most certain money on. Not dramatically, and not visibly, which is precisely why it persists.

The mistake is treating cash as one thing. It is at least four, separated by a single question: **when, exactly, is this money needed?**

## The question that picks the instrument

Money needed within days belongs in a current account, earning nothing, and that is correct. Convenience is what you are buying and it is worth the yield you give up.

Money needed in weeks or months belongs in something that pays close to the policy rate and can be sold any day without a loss. Money needed inside two years belongs in short dated government bills held to maturity, where the return is known at purchase and the only way to lose is to sell early.

Money with no date attached is not cash at all. It is an allocation decision wearing a cash label, and it should be answered by [allocation by horizon](/playbooks/asset-allocation-by-horizon/) rather than left to drift.

## What the drift actually costs

The reason this is worth an afternoon is that the gap between a current account and a short government bill is not a rounding error, and it is available without taking additional risk of any kind.

Two hundred thousand sitting in an account paying almost nothing, while bills of the same currency and a six month maturity pay several points more, gives away tens of thousands over a few years. Nobody was compensated for that. It was not a risk premium foregone. It was a form left unfilled.

And the real return is worse than the nominal one suggests. An account paying half a percent while inflation runs at three is losing over two percent a year in purchasing power, which is set out in [inflation and real returns](/playbooks/inflation-and-real-returns/). The balance on the statement does not move, which is exactly what makes the loss invisible and why it goes uncorrected for years.

## Where it goes wrong in the other direction

The failure mode of people who have read the above is reaching for yield until the cash stops being cash.

An instrument that can be worth less on the day you need it has failed at the only job cash has. That is the whole test. A bond fund with a longer maturity pays more and can fall; a corporate credit fund pays more again and can fall further exactly when everything else is falling, which is when the emergency fund gets used. The yield was never the point.

This is the same asymmetry [what bonds are for](/playbooks/what-bonds-are-for/) describes: the reason to hold the safe thing is not its return, it is having something that has not fallen, to spend from while the other things recover. It is also why [emergency liquidity](/playbooks/emergency-liquidity/) treats the size of the reserve and the safety of the reserve as one decision rather than two.

## The currency question, which is the Gulf-specific one

Cash carries whatever currency risk its holder's future spending does not match.

A dirham liability funded from dirhams carries none, and the peg to the dollar means dollar cash behaves the same way for as long as the peg holds, which [currency risk and the dirham peg](/playbooks/currency-risk-and-the-peg/) treats properly. Cash held for school fees in sterling, or a retirement expected in euros, is a different matter: that balance is exposed to a move nobody is paying you to take.

The rule is unglamorous and it is the whole of it. **Hold cash in the currency of the thing it will eventually buy.** Where that is unknown, hold it in the currency you live in, and accept that this is a choice rather than a default.

## What to do with it

Sort every idle balance by the date it is needed, put each one in the instrument that matches that date, and check the yield against the policy rate once a year. That is it. There is no cleverness available here and none required.

It is the least interesting improvement available to most portfolios and frequently among the largest, because it is certain. Every other decision in this library is a judgement about an uncertain future. This one is arithmetic on money that is already yours.
