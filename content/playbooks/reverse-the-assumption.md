---
{
  "order": 39,
  "slug": "reverse-the-assumption",
  "title": "Reverse the assumption",
  "category": "valuation",
  "tier": 1,
  "calculator": "off-plan-irr",
  "reviewed": "26 August 2026",
  "summary": "Reversing the assumption means taking the price being asked, holding your required return fixed, and solving for the growth rate the price implies, which converts a forecast you were asked to accept into a claim about the future that can be checked against history.",
  "formula": "Forwards, the usual way\n  assume growth rate  ->  compute value\n                          -> compare to price\n  (the assumption is the weakest link and\n   nobody argues about it)\n\nBackwards, this way\n  take the price\n  hold your required return fixed\n  solve for the growth rate implied\n\n  Then check the implied rate against the record.\n\nWorked shape, off-plan\n  Price and payment plan are given.\n  Required return, say 10%.\n  Solve for the appreciation rate at which the\n  IRR of the plan equals 10%.\n\n  Suppose it comes out at 11% a year for 5 years.\n  The question is now factual:\n    has this community delivered 11% for 5\n    consecutive years, and under what conditions?\n\nThe sentence\n  Not \"do you think this will work\"\n  but \"what would have to be true for this to work,\n  and how often has that been true\"",
  "failureModes": [
    "The implied rate is only as good as the other inputs. Change the required return or the exit costs and the implied growth rate moves with them.",
    "Historical rates are evidence, not a limit. Markets do sometimes deliver rates they have never delivered before, and dismissing a purchase purely because the implied rate is unprecedented is its own error.",
    "It works cleanly for a single dominant assumption and less cleanly where several uncertain inputs interact, in which case a scenario range is more honest than one implied number.",
    "It can be gamed by choosing a low required return, which makes almost any price look justifiable. Set the hurdle before running the exercise.",
    "For assets with no transaction history, and new communities frequently have none, there is nothing to check the implied rate against.",
    "It says nothing about liquidity or timing. An implied rate that is achievable over ten years does not help someone who needs to exit in three."
  ],
  "whenToUse": "Whenever a projected return is presented rather than calculated by you. It is the fastest way to convert a sales conversation into a factual one.",
  "sources": [
    {
      "name": "Aswath Damodaran, NYU Stern, valuation resources",
      "url": "https://pages.stern.nyu.edu/~adamodar/"
    },
    {
      "name": "Dubai Land Department, real estate transaction data",
      "url": "https://dubailand.gov.ae/en/open-data/real-estate-data/"
    },
    {
      "name": "Dubai Pulse, DLD transactions open dataset",
      "url": "https://www.dubaipulse.gov.ae/data/dld-transactions/dld_transactions-open"
    }
  ]
}
---

Most investment cases are built forwards. Assume a growth rate, apply it, arrive at a number that justifies the decision. The assumption is the weakest part of the model and it is the part nobody argues about, because it arrived first and quietly.

Run it backwards instead.

## The method

Take the price. Hold your required return fixed at what you actually need. Solve for the growth rate that makes the two meet.

Then ask one question: has this asset, in this market, ever actually done that, and for how long?

It is the same arithmetic as a [discounted cash flow](/playbooks/discounted-cash-flow/). What changes is which number is the output. Instead of supplying an assumption and receiving a valuation, you supply the valuation the market is charging and receive the assumption embedded in it.

## Why this is harder to argue with

A forecast is a matter of opinion and opinions are hard to falsify. An implied growth rate is a specific claim, and specific claims can be checked against the record.

If a payment plan needs eleven percent annual appreciation for five years to produce the return you were promised, that is now the discussion. Not whether the developer is credible or the location is improving, but whether eleven percent for five consecutive years is something this market has delivered, how often, and what conditions it required.

Frequently the answer is that it has, occasionally, in a particular period, and the person selling is implicitly assuming it repeats. That may be true. It is at least now visible.

## Where it applies

**An off-plan payment plan** implies an appreciation rate. Solve for it, then compare against the actual transaction record for that community.

**A rental purchase** implies a rent growth path if the yield alone does not meet your hurdle. In Dubai that path is constrained by [rent increase caps](/playbooks/rent-increase-caps/), which is a legal ceiling on the assumption.

**A share price** implies an earnings growth rate.

**A retirement plan** implies a withdrawal rate and a return, and the [safe withdrawal rate](/playbooks/safe-withdrawal-rate/) framework is the same exercise done in reverse for a different question.

## The honest use of it

This does not tell you the price is wrong. Markets price in things a spreadsheet cannot, and an implied rate that looks demanding is sometimes exactly right.

This is the seller's number being interrogated. Your own estimate needs the same treatment from the other side, which is what a [margin of safety](/playbooks/margin-of-safety/) is for.

What it does is move the assumption from something you were handed to something you have to defend. That single change kills a large share of bad purchases, and the ones it does not kill you enter with your eyes open, which is the most any framework can offer.

## The sentence to use

When someone presents a return, the useful question is not do you think this will work. It is what would have to be true for this to work, and how often has that been true.
