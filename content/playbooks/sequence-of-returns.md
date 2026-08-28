---
{
  "order": 43,
  "slug": "sequence-of-returns",
  "title": "Sequence of returns risk",
  "category": "risk",
  "tier": 1,
  "calculator": "safe-withdrawal-rate",
  "reviewed": "27 August 2026",
  "summary": "Sequence of returns risk is the fact that the order in which returns arrive changes the outcome as soon as money is being paid in or taken out, so two portfolios with identical average returns can leave one retiree comfortable and the other out of money.",
  "formula": "With no cash flows, order is irrelevant\n  Final = Start x (1+r1) x (1+r2) x ... x (1+rn)\n  Multiplication commutes, so any shuffle gives the same answer\n\nWith withdrawals, order decides everything\n  Balance(t) = (Balance(t-1) - Withdrawal(t)) x (1 + r(t))\n  A withdrawal taken during a fall sells units that are\n  then not present for the recovery\n\nThe asymmetry underneath it\n  Recovery needed after a fall of d\n    = 1 / (1 - d) - 1\n  20% fall needs 25%\n  33% fall needs 50%\n  50% fall needs 100%\n\nThe rough shape of the exposure\n  The first five to ten years of withdrawals carry\n  most of the risk, because that is when the balance\n  is largest and a permanent loss of units costs most",
  "failureModes": [
    "It reverses sign depending on which phase you are in. Early falls are damaging to someone drawing down and genuinely helpful to someone still buying, so the same event is a risk to one investor and an opportunity to the other.",
    "Average returns hide it completely. Any set of annual returns has exactly one average and a very large number of orderings, and the average is identical across all of them while the outcomes are not.",
    "It cannot be diversified away by owning more equities. Holding a higher expected return raises the average but widens the spread of possible sequences, which is the opposite of what a drawdown portfolio needs.",
    "A fixed withdrawal in money terms makes it materially worse than a flexible one, because it forces the largest proportional sales at exactly the moment prices are lowest.",
    "It is not the same thing as volatility, and treating them as synonyms leads people to the wrong remedy. Volatility is the size of the moves, sequence risk is the interaction between those moves and a cash flow."
  ],
  "whenToUse": "In the last decade before drawing on a portfolio, and in the first decade of drawing on it. Those two windows carry most of the exposure, and the decisions that reduce it have to be made before the sequence is known.",
  "sources": [
    {
      "name": "What is sequence of returns risk",
      "url": "https://www.boldin.com/retirement/what-is-sequence-of-returns-risk/"
    },
    {
      "name": "Morningstar, what is a safe retirement withdrawal rate",
      "url": "https://www.morningstar.com/retirement/whats-safe-retirement-withdrawal-rate-2026"
    },
    {
      "name": "Bill Bengen revisits the four percent rule",
      "url": "https://www.advisorperspectives.com/articles/2025/08/29/bill-bengen-boosts-the-4-rule-to-4-7"
    }
  ]
}
---

Take a set of annual returns, any set. Shuffle them into a different order. If nothing is being added to or taken out of the portfolio, the ending balance is identical, every time, because multiplication does not care what order it happens in.

Now take five percent out at the end of each year and shuffle the same returns again. The ending balances are no longer identical. They are not even close. One ordering can leave a portfolio intact after thirty years and another can exhaust it in eighteen, from the same returns, with the same average, over the same period.

That difference is sequence of returns risk, and it is the single most underappreciated risk in retirement planning, because the statistic almost everyone uses to plan, the long run average return, is precisely the statistic that is blind to it.

## Why a withdrawal during a fall is permanent

The mechanism is worth being concrete about, because the intuition people usually reach for is wrong.

A portfolio that falls thirty percent and then recovers has lost nothing, provided nothing was sold. The units are still there. But a withdrawal taken while the price is down does not sell a percentage, it sells **units**, and the units sold at the bottom are not present for the recovery. The portfolio does not simply recover more slowly. It recovers to a permanently lower level, because there is permanently less of it.

This is why the same fall is a different event depending on what you are doing at the time. Someone still contributing is buying units cheaply during that fall and will be better off for it. Someone drawing is selling units cheaply and will be worse off for ever. Identical market, opposite consequences, decided entirely by the direction of the cash flow.

## The asymmetry that makes it worse

Falls and recoveries are not the same size, and the gap widens fast.

A twenty percent fall needs a twenty five percent gain to get back. A thirty three percent fall needs fifty. A fifty percent fall needs one hundred. This is arithmetic rather than a market observation, and it is set out in full in [drawdown recovery math](/playbooks/drawdown-recovery-math/).

Combine the two effects and the picture is clear. A bad sequence early in drawdown means selling units into a fall, into an asset that then needs a disproportionately large gain to recover, with fewer units left to enjoy it. The three compound.

## Why the first decade carries the risk

The exposure is not spread evenly across a retirement. It is concentrated at the start, for a simple reason: that is when the balance is largest, so a given percentage fall destroys the largest absolute number of units, and there is the longest remaining period over which their absence compounds.

A poor decade at the end of a thirty year drawdown is survivable, because the portfolio has already done most of its work. The same decade at the beginning is not. This is why the last few years before drawing and the first few years after are treated as one continuous window of elevated risk, and why decisions taken during it matter more than decisions taken at any other point. What the allocation should do across that window is contested, and [glide paths](/playbooks/glide-paths/) sets out both sides of the argument.

## What actually reduces it

Four things, none of them free, in rough order of how much they buy.

**Flexibility in the withdrawal.** A rule that reduces spending after a bad year, even modestly, does more than any asset allocation change, because it directly removes the forced sale at the bottom. This is why guardrail approaches outperform fixed real withdrawals in almost every study, and why [the safe withdrawal rate](/playbooks/safe-withdrawal-rate/) framework treats the withdrawal rule as a variable rather than a constant.

**Holding something that is not correlated to sell instead.** The point of [what bonds are for](/playbooks/what-bonds-are-for/) is not their return. It is having an asset that has not fallen, to fund withdrawals from while the one that has fallen recovers.

**Cash for the near term.** Enough to cover a period of spending without touching the portfolio at all. This overlaps with [emergency liquidity](/playbooks/emergency-liquidity/) and buys the same thing: the ability not to sell.

**Not needing the money on a fixed date.** The most valuable and least available option. Every year of flexibility about when drawdown begins is a year of sequence risk removed.

What does not help is raising the expected return. A higher returning portfolio has a higher average and a wider spread of sequences, and it is the spread that does the damage here. That is the trade the phrase risk adjusted was invented to describe, and drawdown is the phase of life where it stops being an abstraction.
