---
{
  "order": 7,
  "slug": "lump-sum-vs-dca",
  "title": "Lump sum versus cost averaging",
  "category": "portfolio",
  "tier": 1,
  "calculator": "lump-sum-vs-dca",
  "reviewed": "26 August 2026",
  "summary": "Vanguard's research across US, UK and Australian markets found that investing a lump sum immediately beat spreading it in over twelve months in roughly two thirds of the historical periods tested, because markets rise more often than they fall.",
  "formula": "Lump sum, value at the horizon\n  = Amount x (1 + r)^T\n\nCost averaging over N months\n  = sum over k = 0 to N-1 of\n      (Amount / N) x (1 + c)^(k/12) x (1 + r)^(T - k/12)\n\n  where r is the expected return once invested,\n  c is the return on the cash still waiting,\n  and T is the total horizon in years.\n\nAverage time uninvested\n  = (N - 1) / 2 months\n\nVanguard result\n  Investing immediately produced a higher ending\n  value in roughly two thirds of rolling historical\n  periods across US, UK and Australian markets.",
  "failureModes": [
    "Two thirds is not certainty. In the other third the market fell during the averaging window and cost averaging won, sometimes by a lot.",
    "It is an expected value argument, and expected value is a poor guide when a single bad outcome would change your life. Size matters: the calculation is different for a sum that is most of your net worth.",
    "It assumes you follow through. Cost averaging that stops when the market falls is market timing, and it usually produces the worst outcome of the three.",
    "It ignores tax and transaction costs, which in some jurisdictions make many small purchases meaningfully more expensive than one large one.",
    "The historical win rate comes from markets that rose over the period studied. It is evidence, not a law."
  ],
  "whenToUse": "Whenever you are holding cash you intend to invest and are hesitating. Run the number, then decide honestly whether your hesitation is about timing or about the allocation.",
  "sources": [
    {
      "name": "Vanguard, cost averaging: invest now or temporarily hold your cash",
      "url": "https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf"
    }
  ]
}
---

You have received a bonus, sold a property, or inherited money. Do you invest it all now, or feed it in over the next year?

Vanguard answered this with rolling historical windows across three markets. Investing immediately produced a higher ending value than twelve month cost averaging in roughly two thirds of the periods tested. The result held across the US, the UK and Australia, and across different portfolio mixes.

The reason is unglamorous. Markets spend most of their time going up. Money held in cash while you wait to feel comfortable is money not earning the return you are investing for in the first place. Averaging in over twelve months means, on average, about half your money spends about six months uninvested.

## The other third is not nothing

In roughly a third of periods, cost averaging won, because the market fell while the money was being fed in and the later tranches bought more units. Those are exactly the periods that people remember, and exactly the ones that make investing immediately feel reckless.

So the honest framing is not that cost averaging is a mistake. It is that cost averaging is a worse expected outcome purchased in exchange for a better worst case, and for a much higher probability that you actually go through with it. That second part is worth more than the arithmetic admits. A perfect plan you abandon in month three is worse than an imperfect plan you follow.

## Two clarifications that matter

**Investing your salary is not cost averaging.** If money arrives monthly and you invest it monthly, you are investing immediately with the money you have. The question only exists when you are holding a lump you could deploy today.

**If the deployment schedule feels frightening, the allocation is wrong.** The fear that makes you want to spread a purchase over a year is usually not a fear about timing, it is a fear about the asset mix. Someone genuinely comfortable with a portfolio would not be afraid to own it on Tuesday. If you would not hold that allocation today, the answer is a different allocation, not a slower path to the same one.

## A practical middle

If you know the arithmetic and still cannot bring yourself to invest it all at once, compress the window. Three months rather than twelve captures most of the psychological benefit and gives up much less of the expected return. And write the schedule down before you start, because the failure mode of cost averaging is stopping halfway when the market falls, which converts it into market timing with extra steps.
