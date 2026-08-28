---
{
  "order": 54,
  "slug": "liquidity-risk",
  "title": "Liquidity risk",
  "category": "risk",
  "tier": 2,
  "reviewed": "28 August 2026",
  "summary": "Liquidity risk is the gap between what an asset is worth and what it can be sold for today, and it is the only risk that decides whether a portfolio survives a bad month rather than merely how much it falls.",
  "formula": "The two questions people merge\n  Solvency   is this worth what I think?\n  Liquidity  can I turn it into money\n             this week, at that price?\n\n  A portfolio can be right about the\n  first and ruined by the second.\n\nThe honest ladder, best to worst\n  Same day     bank deposit, T-bill,\n               money market fund\n  Days         broad index ETF\n  Weeks        single equity in size,\n               corporate bond\n  Months       property, private fund,\n               anything with a notice\n               period\n  Never, when  a market with one buyer\n  it matters   and no bid on a bad day\n\nThe discount, which is the real cost\n  Forced sale price\n    = Fair value x (1 - Haircut)\n\n  Haircut rises with size, falls with\n  the number of willing buyers, and is\n  worst precisely when most holders\n  want out at once.\n\nWhat to hold against a dated need\n  Money needed within a year belongs\n  in something that will still be worth\n  the same on the day it is needed.\n  That is not a view about returns.\n  It is arithmetic about dates.",
  "failureModes": [
    "Measuring liquidity on a normal day. Almost everything is liquid when nobody wants to sell. The number that matters is what a holding can be sold for on the day a lot of holders want out at once, and that is the only day the answer counts.",
    "Confusing transferability with liquidity. A holding can be legally and technically transferable and still have no buyer at a price anybody would accept. Transferability is a property of the record; liquidity is a property of the market, and no amount of the first creates the second.",
    "Assuming size does not change the price. A quantity small enough to sell without moving the market is a different asset from the same holding ten times larger. The quoted price applies to the quoted size, and a portfolio built on screen prices has not been tested at its own scale.",
    "Holding a dated obligation in an undated asset. Money needed on a fixed date, a payment plan instalment, a school fee, a tax bill, has to be in something that will still be worth the same on that date. Anything else converts a market fall into a forced sale.",
    "Treating illiquidity as purely a defect. It is also what stops people selling at the bottom, and the returns some illiquid assets show are partly a premium for accepting that constraint. The mistake is not owning illiquid assets, it is owning them with money that has a date attached."
  ],
  "whenToUse": "Before buying anything that cannot be sold in a day, and once a year against every dated obligation in the next two. The question is not what the portfolio is worth but what part of it could be turned into money in a week without a discount.",
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
      "name": "Bank for International Settlements, statistics",
      "url": "https://www.bis.org/statistics/"
    },
    {
      "name": "US Securities and Exchange Commission, investor bulletin on fees and expenses",
      "url": "https://www.sec.gov/investor/alerts/ib_fees_expenses.pdf"
    }
  ]
}
---

Most risk frameworks are about how much an asset might fall. This one is about something narrower and more dangerous: whether you can get out at all, at a price you would recognise, on the day you need to.

The two get merged constantly, and they are not the same question. A holding can be worth exactly what you think it is worth and still be impossible to convert into money this month. Portfolios are rarely destroyed by being wrong about value. They are destroyed by being right about value and needing the money anyway.

## The ladder, honestly drawn

Write down every holding and put a time next to it: how long would it take to turn this into spendable money without accepting a discount?

For a bank deposit or a Treasury bill, same day. For a broad index fund, days. For a single equity in real size, or a corporate bond, weeks. For a property, months, and only if a buyer appears. For anything with a notice period or a lock-up, whatever the document says, which is usually longer than remembered.

That ladder is uncomfortable to write down, which is the point of writing it down. Most people discover that a much larger share of their net worth sits in the bottom two rows than they would have guessed, and that the top row exists mostly as an accident rather than a decision.

## Liquidity is measured on the worst day, not the average one

Here is the part that makes this a framework rather than a definition.

Almost everything is liquid when nobody wants to sell. A market with a buyer is a market. The measurement that matters is what a holding fetches on the day a lot of holders want out at once, because that is the only day the answer has consequences.

And those days have a property that is easy to miss: **liquidity disappears from several holdings at the same time**, because the conditions that make one hard to sell tend to be the conditions that make the others hard to sell too. This is the same failure as [what diversification does](/playbooks/what-diversification-does/): a correlation computed across calm periods says very little about behaviour under stress, and the whole reason for holding several things is that they will not all fail together.

Size compounds it. A quantity small enough to sell without moving the price is a different asset from the same holding ten times larger. The screen price applies to the screen quantity.

## Transferable is not liquid

Worth stating separately because a great deal of financial marketing depends on the confusion.

A holding can be transferable, tokenised, listed, fractional, tradeable at three in the morning, and still have nobody willing to buy it at a price you would accept. Transferability is a property of the record. Liquidity is a property of the market. Improving the record does not create a buyer, and the pitch that an illiquid asset has been made liquid by a better ledger is a pitch about the wrong half of the problem. [Tokenised property](/playbooks/tokenised-property/) is the current version of this.

## The rule that actually follows from all of it

Money with a date attached belongs in something that will still be worth the same on that date.

That is not a forecast and it is not conservatism. It is arithmetic about dates. A tax bill in March, a school fee in September, an instalment on a payment plan, all of these are obligations that do not care what the market is doing on the day they fall due. Holding them in something volatile converts an ordinary market fall into a forced sale, which is exactly the mechanism in [sequence of returns](/playbooks/sequence-of-returns/) and, in its most expensive Gulf form, in [funding a payment plan from a volatile asset](/playbooks/funding-a-payment-plan-from-a-volatile-asset/). [Cash and short bonds](/playbooks/cash-and-short-bonds/) is where that money goes, and [emergency liquidity](/playbooks/emergency-liquidity/) is the undated version of the same reasoning.

## Illiquidity is not simply a fault

The framework would be dishonest if it stopped there.

Being unable to sell easily is also what stops people selling badly, and the gap between what investments return and what investors receive, which [the behaviour gap](/playbooks/the-behaviour-gap/) puts numbers on, is smaller for assets you cannot trade on a whim. Part of what some illiquid assets pay is a premium for accepting the constraint.

So the conclusion is not to avoid illiquid holdings. It is to make sure that none of the money behind them has a date on it, and to know, before you need to know, which part of the portfolio could become money in a week. That number is usually smaller than expected, and finding it out on a calm afternoon costs nothing.
