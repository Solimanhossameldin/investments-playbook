---
{
  "order": 43,
  "slug": "sequence-of-returns",
  "title": "Sequence of returns risk",
  "category": "risk",
  "tier": 1,
  "calculator": "safe-withdrawal-rate",
  "reviewed": "5 November 2026",
  "summary": "Sequence of returns risk is the fact that the order in which returns arrive changes the outcome as soon as money is being paid in or taken out, and on one illustrative thirty year sequence run against its own reverse the order is worth 2.88 points of withdrawal rate.",
  "formula": "With no cash flows, order is irrelevant\n  Final = Start x (1+r1) x (1+r2) x ... x (1+rn)\n  Multiplication commutes, so any shuffle gives the same answer\n\nWith withdrawals, order decides everything\n  Balance(t) = (Balance(t-1) - Withdrawal(t)) x (1 + r(t))\n  A withdrawal taken during a fall sells units that are\n  then not present for the recovery\n\nThe asymmetry underneath it\n  Recovery needed after a fall of d\n    = 1 / (1 - d) - 1\n  20% fall needs 25%\n  33% fall needs 50%\n  50% fall needs 100%\n\nThe rough shape of the exposure\n  The first five to ten years of withdrawals carry\n  most of the risk, because that is when the balance\n  is largest and a permanent loss of units costs most\n\nComputed, on one sequence against its own reverse\n  Same returns, same mean 7.60%, same geometric 6.84%\n\n  No withdrawals, either order     7,272,400\n  4% withdrawals, bad decade last  3,790,522\n  4% withdrawals, bad decade first 1,951,713\n\n  Highest rate that survives 30 years\n    bad decade last    8.35%\n    bad decade first   5.47%\n    the order is worth 2.88 points",
  "failureModes": [
    "It reverses sign depending on which phase you are in. Early falls are damaging to someone drawing down and genuinely helpful to someone still buying, so the same event is a risk to one investor and an opportunity to the other.",
    "Average returns hide it completely. Any set of annual returns has exactly one average and a very large number of orderings, and the average is identical across all of them while the outcomes are not.",
    "It cannot be diversified away by owning more equities. Holding a higher expected return raises the average but widens the spread of possible sequences, which is the opposite of what a drawdown portfolio needs.",
    "A fixed withdrawal in money terms makes it materially worse than a flexible one, because it forces the largest proportional sales at exactly the moment prices are lowest.",
    "It is not the same thing as volatility, and treating them as synonyms leads people to the wrong remedy. Volatility is the size of the moves, sequence risk is the interaction between those moves and a cash flow.",
    "Reading the thirty year sequence on this page as a market record. It is declared illustrative and no historical claim is made with it, because the demonstration is an identity rather than an observation: the comparison is one sequence against its own reverse, so the returns, the mean and the geometric mean are the same on both sides by construction and the order is the only thing left that can explain the gap."
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

Now take five percent out at the end of each year and shuffle the same returns again. The ending balances are no longer identical. They are not even close. The gap is large and it is computed below rather than asserted: on the sequence this page uses, the same returns in the opposite order leave one retiree with **1,951,713** and the other with **3,790,522**, from the same average, over the same period.

That difference is sequence of returns risk, and it is the single most underappreciated risk in retirement planning, because the statistic almost everyone uses to plan, the long run average return, is precisely the statistic that is blind to it.

## Why a withdrawal during a fall is permanent

The mechanism is worth being concrete about, because the intuition people usually reach for is wrong.

A portfolio that falls thirty percent and then recovers has lost nothing, provided nothing was sold. The units are still there. But a withdrawal taken while the price is down does not sell a percentage, it sells **units**, and the units sold at the bottom are not present for the recovery. The portfolio does not simply recover more slowly. It recovers to a permanently lower level, because there is permanently less of it.

This is why the same fall is a different event depending on what you are doing at the time. Someone still contributing is buying units cheaply during that fall and will be better off for it. Someone drawing is selling units cheaply and will be worse off for ever. Identical market, opposite consequences, decided entirely by the direction of the cash flow.

## What the order is actually worth

The claim above is checkable, so here it is checked. One thirty year sequence, declared illustrative, is compared against **its own reverse**. That construction is the whole point: both sides hold the same returns, so the arithmetic mean is 7.60% on both, the geometric mean is 6.84% on both, there are eight down years out of thirty on both, and the worst year is -22% on both. Nothing differs except the order.

Start with the control. With nothing withdrawn, both orders end on **7,272,400** per million of opening balance. Not approximately: the two products differ by about four billionths, one unit in the last place of a floating point number, which is the computer's rounding and not the finance. Multiplication commutes, so order cannot matter, and the chart draws that as a single bar.

Now take 4% of the opening balance out each year.

| Same returns, per 1,000,000 of opening balance | After thirty years |
|---|---|
| No withdrawals, either order | 7,272,400 |
| 4% withdrawals, bad decade last | 3,790,522 |
| 4% withdrawals, bad decade first | 1,951,713 |

The retiree who met the bad decade first keeps **51.5%** of what the other keeps. The shortfall is **1,838,808**, and not one percentage point of return explains it.

### The figure worth carrying away

Ending balances depend on the opening balance, which makes them hard to apply to your own situation. The rate does not. So the more useful question is: what is the highest withdrawal rate that still survives thirty years?

| | Highest rate that survives thirty years |
|---|---|
| Bad decade last | 8.35% |
| Bad decade first | 5.47% |

**The order of the returns is worth 2.88 percentage points of withdrawal rate.** That is solved by bisection on the rate rather than read off a table, and it is the number to hold on to, because it is the one that transfers: it says what sequence risk costs without knowing anything about the size of your portfolio.

Set it beside the thing it should be compared against. The entire debate about the safe withdrawal rate, four per cent against four and a half or five, covers about a point. The order the returns happen to arrive in is worth nearly three. It is the larger variable and it is the one nobody can choose.

## The asymmetry that makes it worse

Falls and recoveries are not the same size, and the gap widens fast.

A twenty percent fall needs a twenty five percent gain to get back. A thirty three percent fall needs fifty. A fifty percent fall needs one hundred. This is arithmetic rather than a market observation, and it is set out in full in [drawdown recovery math](/playbooks/drawdown-recovery-math/).

Combine the two effects and the picture is clear. A bad sequence early in drawdown means selling units into a fall, into an asset that then needs a disproportionately large gain to recover, with fewer units left to enjoy it. The three compound.

## Why the first decade carries the risk

The exposure is not spread evenly across a retirement. It is concentrated at the start, for a simple reason: that is when the balance is largest, so a given percentage fall destroys the largest absolute number of units, and there is the longest remaining period over which their absence compounds.

A poor decade at the end of a thirty year drawdown is survivable, because the portfolio has already done most of its work. The same decade at the beginning is not, and the same sequence rotated so the bad run sits in a different decade says how much it is worth:

| Where the worst run sits | After thirty years |
|---|---|
| Years 1 to 10 | 1,951,713 |
| Years 11 to 20 | 2,986,231 |
| Years 21 to 30 | 3,451,784 |

Monotone, which is the claim: every decade the bad run moves later is worth money, and the first move is worth the most. This is why the last few years before drawing and the first few years after are treated as one continuous window of elevated risk, and why decisions taken during it matter more than decisions taken at any other point. What the allocation should do across that window is contested, and [glide paths](/playbooks/glide-paths/) sets out both sides of the argument.

## What actually reduces it

Four things, none of them free, in rough order of how much they buy.

**Flexibility in the withdrawal.** A rule that reduces spending after a bad year, even modestly, does more than any asset allocation change, because it directly removes the forced sale at the bottom. This is why guardrail approaches outperform fixed real withdrawals in almost every study, and why [the safe withdrawal rate](/playbooks/safe-withdrawal-rate/) framework treats the withdrawal rule as a variable rather than a constant.

**Holding something that is not correlated to sell instead.** The point of [what bonds are for](/playbooks/what-bonds-are-for/) is not their return. It is having an asset that has not fallen, to fund withdrawals from while the one that has fallen recovers.

**Cash for the near term.** Enough to cover a period of spending without touching the portfolio at all. This overlaps with [emergency liquidity](/playbooks/emergency-liquidity/) and buys the same thing: the ability not to sell.

**Not needing the money on a fixed date.** The most valuable and least available option. Every year of flexibility about when drawdown begins is a year of sequence risk removed.

What does not help is raising the expected return. A higher returning portfolio has a higher average and a wider spread of sequences, and it is the spread that does the damage here. That is the trade the phrase risk adjusted was invented to describe, and drawdown is the phase of life where it stops being an abstraction.
