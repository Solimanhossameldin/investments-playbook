---
{
  "order": 8,
  "slug": "safe-withdrawal-rate",
  "title": "Safe withdrawal rate",
  "category": "portfolio",
  "tier": 1,
  "calculator": "safe-withdrawal-rate",
  "reviewed": "26 August 2026",
  "summary": "The safe withdrawal rate is the share of a portfolio you can spend in the first year of retirement, increasing with inflation thereafter, without running out of money, and current credible estimates range from about 3.9 percent to about 4.7 percent depending on the assumptions.",
  "formula": "Portfolio needed\n  = (Annual spending - other income) / withdrawal rate\n\n  At 3.9%   multiply the gap by 25.6\n  At 4.0%   multiply the gap by 25.0\n  At 4.7%   multiply the gap by 21.3\n\nYears to reach the target\n  Solve for n in\n    have x (1 + r)^n + save x (((1 + r)^n - 1) / r) = target\n  where r is the expected REAL return, after inflation.\n\nAll three rates assume spending rises with\ninflation each year, so the return assumption\nmust be real or you will double count.",
  "failureModes": [
    "It was derived from US market history, which is the best documented and among the most successful equity markets of the twentieth century. Applying a US-derived rate globally embeds survivorship bias.",
    "It assumes a fixed inflation adjusted withdrawal regardless of what markets do, which no real retiree does. Guardrail approaches support higher starting rates precisely because they allow the plan to respond.",
    "It ignores tax, which for a globally mobile investor can be the difference between the conservative and the optimistic case.",
    "Thirty years is the standard horizon. Retiring at fifty means forty or more, and the safe rate falls as the horizon lengthens.",
    "It says nothing about the shape of spending. Most retirees spend more in the first decade and less in the third, which the flat inflation adjusted assumption gets wrong in both directions."
  ],
  "whenToUse": "To size the target and to sanity check whether a plan is roughly right. Not to run an actual drawdown, which needs a regulated adviser, a tax position and a guardrail policy.",
  "sources": [
    {
      "name": "Morningstar, what is a safe retirement withdrawal rate, 2026",
      "url": "https://www.morningstar.com/retirement/whats-safe-retirement-withdrawal-rate-2026"
    },
    {
      "name": "Advisor Perspectives, Bill Bengen raises the 4% rule to 4.7%",
      "url": "https://www.advisorperspectives.com/articles/2025/08/29/bill-bengen-boosts-the-4-rule-to-4-7"
    },
    {
      "name": "Boldin, sequence of returns risk",
      "url": "https://www.boldin.com/retirement/what-is-sequence-of-returns-risk/"
    }
  ]
}
---

Bill Bengen's 1994 work asked a simple question: what is the highest percentage of a portfolio you could have withdrawn in year one, increased annually with inflation, and never run out over thirty years, using the worst starting year in US history? The answer was about four percent, and it became the most quoted number in retirement planning.

It has since been revised in both directions, by serious people, and the honest position is that there is no single number.

| Estimate | Source | Reasoning |
|---|---|---|
| 4.7% | Bengen, 2025 revision | A broader asset mix, including small cap and international, improved the historical worst case |
| 4.0% | Bengen, original 1994 | US stocks and bonds, thirty year horizon, worst historical start |
| 3.9% | Morningstar, 2026 | Forward looking, starting from current valuations and current bond yields |

The spread is not academic disagreement for its own sake. It reflects a real question: should the number come from history, or from where prices are today. Morningstar's lower figure exists because they start from present conditions, and with the cyclically adjusted price to earnings ratio around 42 against a long run mean near 17, the forward looking case for caution is not unreasonable.

## What the rate is actually protecting you from

Not low average returns. Sequence of returns risk.

A bad decade at the start of drawdown does far more damage than the identical decade at the end, because you are selling units while they are cheap and those units never come back to participate in the recovery. Two retirees with identical thirty year average returns can have completely different outcomes based purely on the order in which those returns arrived. The withdrawal rate is a crude insurance premium against being the unlucky one.

## How to actually use it

Use it to size the target, not to run the drawdown. Multiply the gap between your spending and your other income by twenty five and you have the classic four percent number. Multiply by twenty five point six and you have the conservative case. Multiply by twenty one point three and you have the optimistic one. The distance between those three is your honest uncertainty, and it is worth seeing.

Then, in retirement, do not actually withdraw a fixed inflation adjusted amount forever regardless of what happens. Nobody does. Guardrail approaches, which cut spending modestly after a bad year and raise it after a good one, support meaningfully higher starting rates because they let the plan respond. That flexibility is worth more than any decimal place in the starting number.
