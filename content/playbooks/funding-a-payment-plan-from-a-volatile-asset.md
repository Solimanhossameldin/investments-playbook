---
{
  "order": 50,
  "slug": "funding-a-payment-plan-from-a-volatile-asset",
  "title": "Funding a payment plan from a volatile asset",
  "category": "risk",
  "tier": 1,
  "calculator": "off-plan-irr",
  "reviewed": "28 August 2026",
  "summary": "An off-plan payment plan is a fixed schedule of dirham obligations, and funding one from an asset that can halve converts a purchase into a sequence of forced sales at whatever price happens to prevail on each instalment date.",
  "formula": "The mismatch, stated plainly\n  Obligation   fixed in AED, dated\n  Funding      variable, undated\n\n  A plan does not reschedule itself\n  because the funding asset fell.\n\nCoverage ratio\n  Coverage = Liquid reserve held in AED\n             / Remaining instalments in AED\n\n  Coverage 1.0  every instalment funded\n                regardless of price\n  Coverage 0.5  half the plan exposed\n                to the market\n  Coverage 0.0  every instalment is a\n                forced sale\n\nSurvivable fall\n  Coins needed now\n    = Remaining instalments / Price\n  Coins needed after a fall of d\n    = Remaining instalments / (Price x (1-d))\n\n  A 50% fall doubles the coins required.\n  A 75% fall quadruples them.\n\nWorked: 1,200,000 AED remaining,\nheld in an asset at 400,000 AED a coin\n  At today's price      3.0 coins\n  After a 30% fall      4.3 coins\n  After a 50% fall      6.0 coins\n  After a 75% fall     12.0 coins\n\n  The plan asked for 3 and the market\n  decided the question was 12.",
  "failureModes": [
    "Sizing the funding on today's price. Three coins covers the plan at today's price and covers a third of it after a seventy five percent fall, and a drawdown of that size is not a tail event in this asset class, it is a thing that has happened repeatedly. A plan funded at exactly today's price is a plan with no margin at all.",
    "Selling into the fall, which is the mechanism that does the damage. The instalment dates are fixed and indifferent, so a decline forces disposals at the worst prices rather than allowing the holder to wait, and the same money that would have recovered had it been left alone is realised permanently instead.",
    "Treating handover as the finish line. A completion date is when the obligations stop, not when the risk does. A buyer who arrives at handover having liquidated the reserve owns an illiquid asset and holds nothing to meet a service charge, a void period, or a fit out.",
    "Assuming the developer will be flexible. Some are, on some plans, in some markets, and none of that is a plan. The contractual position is a schedule with consequences attached to missing it, and flexibility that has not been agreed in writing is a hope rather than a term.",
    "Counting an unrealised gain as the reserve. Money that is still in the volatile asset is not a reserve, it is the exposure. A reserve is the part that has already been converted and sits in dirhams, which is the only form in which an instalment can actually be paid."
  ],
  "whenToUse": "Before signing any payment plan funded from a volatile holding, and again at each instalment date, because the coverage ratio changes with the price even when nothing has been decided.",
  "sources": [
    {
      "name": "Dubai Land Department",
      "url": "https://dubailand.gov.ae/en/"
    },
    {
      "name": "Dubai Land Department, eServices",
      "url": "https://dubailand.gov.ae/en/eservices/"
    },
    {
      "name": "Boldin, sequence of returns risk",
      "url": "https://www.boldin.com/retirement/what-is-sequence-of-returns-risk/"
    },
    {
      "name": "Morningstar, Mind the Gap",
      "url": "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf"
    }
  ]
}
---

An off-plan payment plan is one of the most rigid financial obligations a private buyer takes on. Fixed amounts, fixed dates, in dirhams, with consequences for missing them.

A volatile asset is the opposite of that in every respect. Its value is undated and unfixed, and the one thing that is certain about it is that it will be worth something different on each of the dates the plan cares about.

Putting one behind the other is not automatically a mistake. It is a specific, nameable risk that most people take without noticing they have taken it, because at the moment of signing the funding looks ample.

## Why the price on the day you sign is the wrong number

Three coins covers a one point two million dirham plan at four hundred thousand a coin. That is the calculation almost everyone does, and it is correct on the day it is done.

After a thirty percent fall the plan needs four point three. After fifty percent, six. After seventy five percent, twelve. The obligation did not change. The number of coins required to meet it quadrupled.

The reason this deserves a framework rather than a footnote is that a seventy five percent drawdown is not an exotic scenario in this asset class. It is a thing that has happened more than once, to the largest assets in it, within the lifetime of a typical three year payment plan. **Sizing the funding at today's price is sizing it at the most favourable price you will ever see it at.**

## The forced sale is the actual damage

The falls are not what hurts. Holders sit through falls all the time and recover.

What hurts is the interaction between a fall and a date. An instalment is due on the fifteenth. The asset is down sixty percent. The plan does not care, and neither does the fact that it will probably recover, because the money is needed on the fifteenth rather than eventually.

So the disposal happens at the bottom, and it happens repeatedly, on a schedule set at a time when nobody was thinking about this. The loss becomes permanent for exactly the portion that was sold, and the portion that was sold is the portion the market chose. That is the same shape as [sequence of returns](/playbooks/sequence-of-returns/) risk in retirement: the arithmetic of an average return is irrelevant once withdrawals are fixed and dated, because the order of the returns starts to determine the outcome.

A holder with the same asset and no payment plan waits. A holder with the same asset and a payment plan sells. Identical portfolios, opposite outcomes, and the only difference is a schedule.

## Coverage, and the honest version of it

The single most useful number here is the coverage ratio: how much of the remaining plan is already sitting in dirhams.

At coverage of one, every instalment is funded no matter what the market does, and the volatile holding becomes what it should be, an asset you choose when to sell. At coverage of zero, every instalment is a forced sale and the purchase is a leveraged bet on the funding asset that nobody described that way.

The trap in this calculation is counting the wrong thing as the reserve. Money still in the volatile asset is not a reserve. It is the exposure. **A reserve is the part that has already been converted**, which is exactly the argument in [cash and short bonds](/playbooks/cash-and-short-bonds/): money with a date attached belongs in an instrument that will have the same value on that date.

There is a real cost to holding coverage. Converting early forfeits the upside on that portion, and if the asset triples you will have paid for the certainty. That is what certainty costs. The question is not whether it is expensive but whether the alternative is survivable, and the alternative is a forced sale at a price the market picks.

## Handover is not the end of it

One more thing that catches people. The plan finishing is not the risk finishing.

A buyer who arrives at handover having liquidated everything to get there now owns an illiquid asset with ongoing costs and nothing behind it. Service charges arrive. A first tenant takes time to find, and [break-even occupancy](/playbooks/break-even-occupancy/) has something to say about what a void does. A fit out is not optional in most units.

The reserve that matters is the one that still exists on the day the last instalment clears, and it should have been sized for handover rather than for the final payment. Deciding what proportion of a portfolio should have been exposed to this in the first place is [position sizing](/playbooks/position-sizing/), and the answer is very often smaller than the one that was reached by asking how much the plan needed.
