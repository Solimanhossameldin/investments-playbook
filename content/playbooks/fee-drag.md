---
{
  "order": 20,
  "slug": "fee-drag",
  "title": "Fee drag",
  "category": "portfolio",
  "tier": 1,
  "calculator": "safe-withdrawal-rate",
  "reviewed": "5 November 2026",
  "summary": "Fee drag is the compounding cost of every percentage charged against a portfolio each year, and because it is deducted from the base that would otherwise have compounded, a one percent annual fee costs far more than one percent of the final result.",
  "formula": "Value after n years\n  = Contribution x (1 + r - f)^n\n\n  where r is the gross return and f is the total annual fee.\n\nWorked, 30 years at 7% gross\n  no fee     (1.07)^30  = 7.61x\n  1% fee     (1.06)^30  = 5.74x\n  2% fee     (1.05)^30  = 4.32x\n  3% fee     (1.04)^30  = 3.24x\n\n  One percent costs about 25% of the result.\n  Three percent costs about 57% of it.\n\nTotal cost of ownership\n  fund expense ratio\n  + platform or custody\n  + advice or management\n  + product or wrapper charges\n  = the number that belongs in the formula",
  "failureModes": [
    "It assumes a constant gross return, which nothing delivers. The direction of the conclusion is robust to that, but the precise multiples are illustrative rather than predictive.",
    "It says nothing about what the fee buys. A fee that prevents one catastrophic behavioural error over a lifetime may be the cheapest thing in the portfolio.",
    "Tracking difference, not the expense ratio, is what a fund actually cost you. A cheaper fund with a worse tracking difference is not cheaper.",
    "Exit costs are not annual and do not fit this arithmetic, but early exit penalties on wrapped products can exceed several years of fees and belong in any decision to move.",
    "Comparing fees across jurisdictions without comparing tax treatment is comparing the smaller number and ignoring the larger one.",
    "The lowest fee portfolio you will not stick with is worse than a slightly costlier one you will."
  ],
  "whenToUse": "Before signing anything with a multi-year commitment, and once against everything you currently hold, adding every layer into a single number. Most people have never seen that single number.",
  "sources": [
    {
      "name": "Morningstar, Mind the Gap 2025",
      "url": "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf"
    },
    {
      "name": "US Securities and Exchange Commission, investor bulletin on fees",
      "url": "https://www.sec.gov/investor/alerts/ib_fees_expenses.pdf"
    }
  ]
}
---

A fee is quoted as an annual percentage, which makes it sound like a small annual event. It is not. It is a permanent reduction in the base that everything afterwards compounds on.

## The arithmetic that surprises people

A portfolio compounding at seven percent for thirty years multiplies by **7.61**. The same portfolio compounding at six percent, because a one percent fee was deducted, multiplies by **5.74**.

The fee was one percent a year. It took **24.5%** of the final result, which is **24.5 times** the number in the brochure.

That ratio is the whole argument and it is worth seeing across the range, because it does not grow the way people expect:

| Annual fee | Multiple after thirty years | Share of the result it takes |
|---|---|---|
| 0% | 7.61 | 0.0% |
| 1% | 5.74 | 24.5% |
| 2% | 4.32 | 43.2% |
| 3% | 3.24 | 57.4% |

Three percent a year does not cost three times what one percent costs. It costs **57.4%** against **24.5%**, a little over twice, because each additional point is levied on a base the earlier points have already shrunk. The fee schedule is linear and the damage is not.

Extend the horizon and the same single fee takes more, because the money it removed would itself have been compounding for whatever is left. The page used to say the gap widens; this is by how much:

| Holding period | What a 1% annual fee takes |
|---|---|
| 10 years | 9.0% |
| 20 years | 17.1% |
| 30 years | 24.5% |
| 40 years | 31.3% |

A fee is therefore priced in years, not in percent. The same one percent is a nine percent haircut to somebody with a decade left and a **31.3%** haircut to a thirty year old. This is the same asymmetry as [drawdown recovery](/playbooks/drawdown-recovery-math/), running slowly instead of suddenly.

## Where the layers hide

Most investors know one of their fees. There are usually three or four.

**The fund's own charge**, the expense ratio, deducted inside the fund so it never appears on a statement.

**The platform or custody fee**, charged by whoever holds the account.

**The advice or management fee**, if someone is managing it, which in the offshore expatriate market is frequently the largest layer and the least clearly disclosed.

**Product charges**, on insurance-wrapped savings plans and portfolio bonds: establishment charges, allocation rates, early exit penalties, and structures where the first eighteen to twenty four months of contributions effectively pay for the sale of the plan.

Add them and a portfolio can carry three percent a year against a benchmark that a plain global index fund delivers for a small fraction of one percent. Over a working life that difference is not a detail, it is the majority of the outcome.

## The trade that is worth making

None of this argues that all fees are bad. It argues that a fee has to buy something, and the thing it buys has to be worth more than the compounding it costs.

Genuine tax and structure advice for a globally mobile investor can be worth multiples of what it costs, because [fund domicile](/playbooks/fund-domicile/) alone can outweigh decades of expense ratio optimisation. Someone stopping you from selling everything in a crash may earn their fee several times in one week.

A percentage of assets each year for holding index funds and rebalancing occasionally is a different proposition, and it should be priced accordingly.

## The question to ask

Not what is the fee, but what is the total, and what does it buy. Add every layer, express it as one number, and then ask what that number would have compounded to over your remaining horizon. That is the real price, and it is the only version of the question that produces a decision.
