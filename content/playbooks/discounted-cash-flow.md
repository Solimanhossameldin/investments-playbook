---
{
  "order": 24,
  "slug": "discounted-cash-flow",
  "title": "Discounted cash flow",
  "category": "valuation",
  "tier": 1,
  "calculator": "off-plan-irr",
  "reviewed": "26 August 2026",
  "summary": "Discounted cash flow values an asset by converting every future payment it produces into what that payment is worth today, using a discount rate that reflects what the money could otherwise earn, which makes it the only honest way to compare investments whose cash arrives at different times.",
  "formula": "Present value of one future amount\n  PV = FV / (1 + r)^n\n\n  r = discount rate per period\n  n = number of periods\n\nNet present value of a series\n  NPV = sum of  CF(t) / (1 + r)^t   for every t\n\n  Positive NPV  ->  beats your hurdle rate\n  Negative NPV  ->  does not\n\nInternal rate of return\n  the value of r at which NPV = 0\n\nDiscount factors, for intuition\n  r = 5%    1 year 0.952   3 years 0.864   5 years 0.784\n  r = 8%    1 year 0.926   3 years 0.794   5 years 0.681\n  r = 12%   1 year 0.893   3 years 0.712   5 years 0.567\n\nAlways run it three times\n  pessimistic / expected / optimistic\n  and decide on the range",
  "failureModes": [
    "The discount rate is chosen by the person who wants a particular answer more often than anyone admits. Pick it first, write it down, and do not revise it because the output displeased you.",
    "Terminal value, the assumed sale price at the end, frequently dominates the result. If most of the value sits in a number you guessed about year ten, the model is a forecast wearing a spreadsheet.",
    "It assumes cash flows arrive as scheduled. Delay is the norm in construction and the model should be run with the delay case as standard rather than as an afterthought.",
    "IRR misbehaves when cash flows change sign more than once, producing multiple mathematically valid answers. Where that happens, use NPV instead.",
    "Comparing IRRs across very different time periods ranks them wrongly. A high IRR over eight months and a lower one over ten years are not directly comparable.",
    "Precision in the output implies confidence the inputs do not support. Two significant figures is usually more honest than four."
  ],
  "whenToUse": "Whenever money moves at more than one point in time, which covers payment plans, rent versus buy, refinancing decisions and any comparison between an income asset and a growth one.",
  "sources": [
    {
      "name": "Aswath Damodaran, NYU Stern, valuation resources",
      "url": "https://pages.stern.nyu.edu/~adamodar/"
    },
    {
      "name": "Dubai Land Department, real estate transaction data",
      "url": "https://dubailand.gov.ae/en/open-data/real-estate-data/"
    }
  ]
}
---

Every argument about payment plans, off-plan pricing and rent versus buy is an argument about timing. Discounted cash flow is the tool that settles them, and it rests on one idea.

## The idea

A dirham you receive in three years is worth less than a dirham today, because today's dirham can be earning in the meantime. How much less depends on what it could earn, which is the discount rate.

At a five percent discount rate, a dirham in three years is worth about 86 fils today. At ten percent, about 75 fils. The further out the payment and the higher the rate, the less it is worth now.

## Why it matters here

An off-plan [payment plan](/glossary/payment-plan/) is a series of dated payments. Two plans with the same headline total are not the same price, and the difference is exactly what discounting reveals. A post handover plan defers money into a period where you could be earning rent, so it is worth real value against a front loaded one.

The same machinery answers [rent versus buy](/playbooks/rent-vs-buy/): both are streams of payments over time, and comparing them any other way produces the wrong answer.

## Choosing the discount rate

This is where the judgement sits and where most analyses quietly cheat.

The rate should reflect what the money would otherwise earn at comparable risk. For a cash buyer that might be the [real yield](/glossary/real-yield/) plus a risk premium. For a leveraged buyer the mortgage rate is a reasonable floor, because money not spent on the property could repay debt, which is where [the order of debt repayment](/playbooks/order-of-debt-repayment/) starts. For anyone whose real alternative is a global equity fund, the honest floor is what that fund is likely to return from today's prices rather than what it returned from the last decade's, which is the one job [CAPE](/playbooks/cape/) is actually suited to.

A rate that is too low makes distant payments look nearly as valuable as immediate ones, which flatters long payment plans. A rate that is too high does the opposite. The discipline is to pick the rate before running the numbers, not after seeing which answer you preferred.

## Net present value and IRR

Two outputs come from the same set of cash flows.

**Net present value** discounts every flow at your chosen rate and sums them. Positive means the investment beats that rate. Negative means it does not.

**[Internal rate of return](/glossary/internal-rate-of-return/)** finds the rate at which net present value equals zero. It is the rate the investment itself earns, and it can be compared against your alternatives directly.

NPV answers is this worth doing at my hurdle. IRR answers what does this actually earn. Both come from the same table, and the table is the work.

## The honest warning

A discounted cash flow model is an opinion dressed as arithmetic. The arithmetic is exact and the inputs are guesses: future rent, future service charges, the exit price, the discount rate. Changing the exit price assumption by ten percent can change the answer completely.

That is not an argument against the method. It is an argument for running the model three times, at pessimistic, expected and optimistic assumptions, and making the decision on the range rather than on the single number that came out first. And then for buying at a discount to that range rather than at it, which is [margin of safety](/playbooks/margin-of-safety/) and which has a cost of its own worth understanding.
