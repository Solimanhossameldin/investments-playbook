// The framework library. One object per page.
// summary: one extractable sentence, written for AI answer engines.
// body: markdown. formula: monospace block. failureModes: the honest list.

const R = "26 August 2026";

export default [
  /* ==================== PROPERTY ==================== */
  {
    slug: "net-rental-yield",
    title: "Net rental yield",
    category: "property",
    tier: 1,
    calculator: "net-rental-yield",
    reviewed: R,
    summary:
      "Net rental yield is annual rent minus every running cost, divided by the purchase price plus every acquisition cost, and it is typically two to three percentage points lower than the gross yield a listing advertises.",
    body: `Gross yield is a marketing number. It divides annual rent by the purchase price and stops, which means it silently assumes two things that are never true: that you paid only the price, and that the rent arrives without deductions.

Neither holds. In Dubai you pay a four percent Dubai Land Department transfer fee, plus an administrative charge, plus a two percent agency commission with five percent VAT on top of that commission, plus a trustee office fee of around four thousand dirhams. If you borrow, add a mortgage registration fee of 0.25 percent of the loan. Before a tenant has viewed the property you are roughly six to seven percent of the purchase price down, and none of that is recoverable on exit.

Then the rent gets eaten. The service charge is the big one and it is the cost most buyers under-model, because it is quoted per square foot per year and never appears in the listing. A nine hundred square foot apartment at eighteen dirhams a foot is sixteen thousand two hundred dirhams a year, gone. Add management at five to eight percent of collected rent if you are not there to handle it yourself, a maintenance reserve, insurance, and a vacancy allowance for the weeks between tenants and the cheque that arrives late.

## What the gap actually looks like

Take a one bedroom at one and a half million dirhams renting for one hundred and five thousand.

- Gross yield: 105,000 divided by 1,500,000, which is **7.0 percent**. This is the number in the advertisement.
- Service charge at eighteen dirhams on nine hundred square feet: 16,200.
- Management at five percent of collected rent, a four week vacancy allowance, a five percent maintenance reserve and fifteen hundred of insurance: roughly 22,000 more.
- Net operating income: about **66,800**.
- Acquisition costs: 4 percent of 1,500,000 is 60,000, agency at 2 percent plus VAT is 31,500, trustee and admin about 4,600. Total **96,100**.
- Net yield: 66,800 divided by 1,596,100, which is **4.2 percent**.

Seven percent became four point two. Nothing dishonest happened. The advertised number simply answered a different question from the one you were asking.

## Why this is the first page on this site

Because every other property decision is downstream of it. Whether to buy at all, whether to borrow, whether one building beats another, whether to sell: all of them are comparisons between net yields, and a comparison between gross yields is a comparison between two pieces of marketing.

It is also the number that turns "Dubai yields beat London" from a slogan into a testable claim. Dubai's gross yields genuinely are higher. Dubai's service charges are also genuinely higher, and in some waterfront and serviced towers they are high enough to close most of the gap. You cannot know which until you run it.`,
    formula: `Net operating income
  = Annual rent
  - Service charge (size in sq ft x rate per sq ft)
  - Management fee (share of collected rent)
  - Maintenance reserve
  - Insurance and fixed costs
  - Vacancy allowance

Total outlay
  = Purchase price
  + Transfer fee (4% in Dubai)
  + Agency commission x (1 + VAT)
  + Trustee, admin and mortgage registration

Net yield = Net operating income / Total outlay

Break-even occupancy
  = (Fixed costs + debt service) / (Annual rent x (1 - management rate))`,
    failureModes: [
      "It says nothing about capital growth. A four percent net yield in a market rising six percent a year and a four percent net yield in a market falling six percent a year are not the same investment.",
      "Service charges are not fixed. Owners associations raise them, and a tower with an ageing chiller or a disputed developer handover can see a step change that removes a full percentage point of net yield overnight.",
      "The rent input is the achieved rent, not the asking rent. Using the asking rent quietly rebuilds the same optimism the gross yield had.",
      "It is an annual snapshot. It does not handle a rent free period, a fit out cost, or the eighteen months of below market rent that the RERA rental index can lock you into after a tenant is in place.",
      "On a leveraged purchase the net yield on total outlay and the cash on cash return diverge sharply. Look at both or you will misjudge how much risk the debt is carrying.",
    ],
    whenToUse:
      "Before any offer on an income producing property, and on every property already in your portfolio at least once a year. If you have never calculated it on something you already own, that is the first calculation to run.",
    sources: [
      { name: "Dubai Land Department, fees and charges", url: "https://dubailand.gov.ae/en/" },
      { name: "RERA rental index and rent increase tiers", url: "https://dubailand.gov.ae/en/eservices/rental-index/" },
      { name: "Dubai rental ROI by area and property type, 2026", url: "https://realestateclubdubai.com/blog/market-analysis/good-rental-roi-dubai-2026-yields-by-property-type-area" },
    ],
  },

  {
    slug: "rent-vs-buy",
    title: "Rent versus buy",
    category: "property",
    tier: 1,
    calculator: "rent-vs-buy",
    reviewed: R,
    summary:
      "The only fair rent versus buy comparison is unrecoverable cost against unrecoverable cost: the rent you pay against the interest, service charges, opportunity cost and amortised transaction costs of owning, which together usually come to about five percent of the property value each year.",
    body: `"Rent is money down the drain" is the most expensive sentence in personal finance, because the sentence that answers it is not "so buy" but "so is most of a mortgage payment".

A mortgage payment splits into two parts. The principal repayment is a transfer from your bank account to your own equity. You still have that money, it just lives in a wall now. The interest is gone. So is the service charge, so is maintenance, so is the property tax where one exists, and so is the return your deposit would have earned had it stayed invested. Those are the unrecoverable costs of owning, and they are what you compare against rent.

## The five percent rule

Ben Felix's formulation, which has become the standard shorthand, adds three components:

- **Maintenance**, about one percent of property value a year.
- **Property tax**, about one percent in a typical developed market.
- **Cost of capital**, about three percent, being the spread between what your money earns in the market and what it earns in a house.

Total: about five percent of the property value a year. If annual rent for an equivalent home is below five percent of the price of buying it, renting is cheaper on cash flow. Above it, owning is.

## Recalibrating for the Gulf

The rule was written for markets with annual property tax. The UAE does not have one, which sounds like it removes a full percentage point. It largely does not, because the service charge does that work instead.

Run it on a one and a half million dirham apartment:

| Component | Annual cost | As a share of value |
|---|---|---|
| Property tax | 0 | 0.00% |
| Service charge and maintenance | 20,000 | 1.33% |
| Interest on 75% debt at 4.5% | 50,625 | 3.38% |
| Opportunity cost on 25% deposit at 6% | 22,500 | 1.50% |
| Total unrecoverable | 93,125 | **6.21%** |

Six point two percent, not five. The zero property tax is more than absorbed by service charges that run well above the one percent maintenance assumption, and by a cost of capital that is high while rates are where they are. If the same apartment rents for ninety thousand a year, renting is marginally cheaper on cash flow, and the case for buying has to be made on capital growth, on the Golden Visa, or on wanting to own the place you live in. All three are legitimate. None of them is a cash flow argument, and it is worth being honest about which argument you are making.

## The part everyone skips

The round trip transaction cost. Buying and selling in Dubai costs roughly eight to ten percent of the value once you count the transfer fee, both commissions, and the exit. That cost does not care how long you stay. Spread over two years it is four to five percent a year and it dominates everything else on this page. Spread over ten it is under one percent and it barely registers.

That is why the break even hold period is the real output of this calculation. Not "should I buy", but "how long do I have to stay for buying to have been worth it". If the honest answer to how long you will stay is shorter than that number, the decision is made.`,
    formula: `Annual unrecoverable cost of owning
  = Interest on the debt
  + Opportunity cost on the deposit
  + Service charge and maintenance
  + Property tax (zero in the UAE)

Annual unrecoverable cost of renting
  = Annual rent

Round-trip transaction cost
  = Purchase costs + Sale costs
  (roughly 8% to 10% of value in Dubai)

Break-even hold period
  = the number of years at which
    cumulative owning cost, net of expected
    capital growth, falls below cumulative rent`,
    failureModes: [
      "It is exquisitely sensitive to the capital growth assumption, which is the one input nobody can know. Move that slider and watch the answer flip. Any buying case that only works at an optimistic growth rate is a bet.",
      "It compares a home you would rent with a home you would buy, and people rarely buy what they would rent. If the purchase is a bigger, better property, part of the extra cost is consumption, not investment, and should be named as such.",
      "It ignores rent control. In Dubai the RERA index caps increases on a sitting tenant, which makes renting cheaper over a long tenancy than a naive rent growth assumption suggests.",
      "It ignores the value of optionality. The ability to leave a city in thirty days is worth real money to an expatriate on a two year contract, and it does not appear anywhere in the arithmetic.",
      "It ignores residency. In the UAE a two million dirham purchase can carry a Golden Visa. That has a value which is personal, sometimes large, and impossible to put in this table.",
    ],
    whenToUse:
      "Before your first purchase in any market, and again whenever your expected time in a city changes. Run the break even hold period first and check it against how long you honestly expect to stay.",
    sources: [
      { name: "PWL Capital, rent or own your home, the 5% rule", url: "https://pwlcapital.com/rent-or-own-your-home-5-rule/" },
      { name: "Dubai rental index 2026, how RERA calculates rent increases", url: "https://realestateclubdubai.com/blog/legal/dubai-rental-index-2026-how-rera-calculates-your-rent-increase" },
      { name: "Dubai fees and charges guide", url: "https://realestateclubdubai.com/guides/fees-and-charges" },
    ],
  },

  {
    slug: "off-plan-irr",
    title: "Off-plan payment plans and their real cost",
    category: "property",
    tier: 1,
    calculator: "off-plan-irr",
    reviewed: R,
    summary:
      "Two off-plan payment plans quoted at the same headline price are not the same price, because money paid later costs less in present value, and the gap between a front loaded plan and a post handover plan is commonly eight to fifteen percent of the headline figure.",
    body: `A developer offers you a unit at one and a half million dirhams. Plan A is twenty percent down, sixty percent during construction, twenty percent at handover in thirty months. Plan B is ten percent down, thirty percent during construction, twenty percent at handover, and forty percent spread over four years after you get the keys.

Both say one and a half million. Neither costs one and a half million, and they do not cost the same.

## Why later is cheaper

Money you have not paid yet is money you still own, and money you still own is earning. If your realistic alternative return is six percent, a dirham due in four years costs you about seventy nine fils today. Discount every instalment back to the present and you get what each plan actually costs in today's money.

On the two plans above, at a six percent discount rate:

| | Plan A | Plan B |
|---|---|---|
| Headline price | 1,500,000 | 1,500,000 |
| Cost in today's money | 1,395,000 | 1,268,000 |
| Effective discount to headline | 7.0% | 15.5% |

Plan B is roughly one hundred and twenty seven thousand dirhams cheaper, on the same unit, at the same advertised price. That is eight and a half percent of the purchase, which is more than most people negotiate off a price and considerably more than the agency commission they argue about.

## The catch, and it is a real one

Developers know this arithmetic better than buyers do. That is precisely why the extended plan often carries a higher headline price, or is only available on units that are harder to sell, or on floors nobody wants. **Compare plans at their actual quoted prices, not at a single price.** Once you do, the advantage frequently shrinks, and sometimes reverses.

The discount rate matters as much as the schedule. Use what your money would genuinely earn if you did not hand it over, which for most people is a cash or bond rate, not a hoped for equity return. A high discount rate flatters back loaded plans. Be conservative or you will talk yourself into the wrong plan with your own optimism.

## What this calculation deliberately does not cover

Handover risk. That is the actual risk in off plan, and no discount rate captures it. A plan that looks cheaper in present value is worthless if the tower completes two years late or the developer restructures. Escrow account protections in Dubai are real and materially better than they were before 2008, but they protect the project's funds, not your timeline and not your opportunity cost.

Nor does it include the costs that arrive with the keys: service charges that start at handover whether or not you have a tenant, the leasing lag before the first rent, and the possibility that the market price at handover is below what you contracted to pay.`,
    formula: `Monthly discount rate
  m = (1 + annual discount rate) ^ (1/12) - 1

Present value of a plan
  = down payment
  + sum over k of (construction instalment / (1 + m)^k)
  + handover payment / (1 + m)^months
  + sum over j of (post-handover instalment / (1 + m)^(months + j))

Effective discount to headline
  = 1 - (present value / headline price)

The cheaper plan is the one with the lower
present value, not the lower headline price.`,
    failureModes: [
      "It assumes both plans are available on the same unit at the same headline price. They usually are not. Price the plans as actually offered or the comparison is fictional.",
      "It cannot price handover risk, which is the dominant risk in off-plan. A cheaper present value on a project that completes two years late is not cheaper.",
      "It ignores the costs that begin at handover: service charges from day one, the leasing lag before first rent, and any snagging and fit out.",
      "It assumes you can and will invest the money you have not yet paid. If it sits in a current account earning nothing, the real discount rate is close to zero and the whole advantage evaporates.",
      "It says nothing about whether the price itself is right. A brilliantly structured payment plan on an overpriced unit is still an overpriced unit.",
    ],
    whenToUse:
      "Whenever a developer offers you a choice of payment plans, and whenever you are comparing two projects with different schedules. Run it before you discuss price, because the structure is often worth more than the discount you were going to ask for.",
    sources: [
      { name: "Off-plan payment plans in Dubai, comparing them in today's money", url: "https://www.dubaiproperty.news/market-updates/off-plan-payment-plans-in-dubai-why-smart-investors-should-compare-them-in-todays-money" },
      { name: "Dubai Land Department, escrow and project registration", url: "https://dubailand.gov.ae/en/" },
    ],
  },

  {
    slug: "cash-on-cash",
    title: "Cash on cash return",
    category: "property",
    tier: 2,
    calculator: "net-rental-yield",
    reviewed: R,
    summary:
      "Cash on cash return is the annual cash left after every running cost and every mortgage payment, divided by the cash you actually put in, and it is the only property return figure that answers what your own money earned.",
    body: `Net yield tells you what the asset earns. Cash on cash tells you what you earn, which is a different question the moment you borrow.

Put one and a half million of your own money into a property producing sixty seven thousand of net operating income and you have made 4.2 percent on your outlay. Put down four hundred and seventy five thousand, borrow the rest at 4.5 percent over twenty five years, and the picture changes completely: the debt costs about seventy five thousand a year in payments, the net operating income is still sixty seven thousand, and your cash flow is now negative.

That is not automatically bad. Part of that mortgage payment is principal, which is your own equity accumulating. But it is a very different investment from the unleveraged one, with a very different risk profile, and gross yield will not tell you which one you are holding.

## The rule leverage obeys

Leverage multiplies the gap between the asset's return and the cost of the debt, in both directions.

- If net yield on total outlay is **above** the mortgage rate, borrowing raises your cash on cash return.
- If it is **below**, borrowing lowers it, and the deal only works on capital growth.

In Dubai in 2026, with net yields on many mid market apartments landing between four and five and a half percent and mortgage rates around four to five percent, a great many purchases sit almost exactly on that line. Which side of it a specific deal falls on is decided by the service charge, which is why the service charge deserves more attention than it usually gets.

## The number that matters more than the return

Break even occupancy. Take the costs that do not vary with whether a tenant is in place, service charge, insurance, maintenance reserve, and the mortgage, and divide by the rent net of management. That is the share of the year the property must be let simply to stand still.

At sixty percent, the deal can absorb a bad tenant and a slow re-letting season. At ninety two percent, one vacant quarter turns a profitable asset into a monthly bill you fund from salary. Two properties with identical cash on cash returns can have wildly different break even occupancy, and that difference is the actual risk you are taking.`,
    formula: `Annual debt service
  = Loan x r / (1 - (1 + r)^-n) x 12
  where r is the monthly rate and n the number of months

Cash invested
  = Deposit + all acquisition costs

Cash on cash return
  = (Net operating income - annual debt service) / Cash invested

Break-even occupancy
  = (Fixed costs + debt service) / (Rent x (1 - management rate))`,
    failureModes: [
      "It counts the whole mortgage payment as a cost, including the principal portion, which is actually equity accumulating. It therefore understates the total return, deliberately, because it is measuring cash flow rather than wealth.",
      "It is a year one number. It does not follow the loan as the interest share falls, nor rent as it grows, nor service charges as they rise.",
      "It ignores capital growth entirely, which in a growth market is most of the return and in a falling market is most of the loss.",
      "A high cash on cash return produced by high leverage is not skill, it is risk. The same leverage that lifts it turns a modest price fall into a wiped out deposit.",
      "It assumes the mortgage rate holds. On a variable rate product in a rising rate environment, this year's positive cash flow can be next year's negative.",
    ],
    whenToUse:
      "On any leveraged purchase, alongside the net yield rather than instead of it. Check break even occupancy before you check the return.",
    sources: [
      { name: "UAE mortgage rules and LTV limits 2026", url: "https://www.grovy.ae/uae-mortgage-rules-ltv-limits-2026/" },
      { name: "Dubai rental ROI by area and property type, 2026", url: "https://realestateclubdubai.com/blog/market-analysis/good-rental-roi-dubai-2026-yields-by-property-type-area" },
    ],
  },

  {
    slug: "transaction-cost-drag",
    title: "Transaction cost drag and the minimum hold",
    category: "property",
    tier: 2,
    reviewed: R,
    summary:
      "The round trip cost of buying and selling property is roughly eight to ten percent of value in Dubai, and because that cost is fixed regardless of how long you hold, it sets a minimum hold period below which a purchase cannot pay for itself.",
    body: `Property has a toll booth at both ends. In Dubai the entry costs about six to seven percent of the price and the exit about two to three percent, so the round trip is somewhere between eight and ten percent depending on whether you use an agent on both sides and whether there is a mortgage to discharge.

That cost does not scale with your holding period. It is the same whether you keep the asset for eighteen months or eighteen years. Which means the only variable you control is what you divide it by.

| Hold period | Round-trip cost of 9%, annualised |
|---|---|
| 1 year | 9.00% |
| 2 years | 4.50% |
| 3 years | 3.00% |
| 5 years | 1.80% |
| 7 years | 1.29% |
| 10 years | 0.90% |

Set that against a net rental yield of four and a half percent. At a two year hold, transaction costs consume the entire yield and then some. At seven years they take under a third of one year's income. Nothing about the property changed. Only the denominator did.

## What this means in practice

It means the phrase "flipping" describes a strategy that has to overcome a nine percent handicap before it earns anything, which is why it works in rising markets and destroys people in flat ones. It means a purchase you are not confident holding for at least four to five years is a purchase that needs capital growth to rescue it. And it means the single highest leverage decision in property is not which unit you buy but how long you commit to holding it.

## The 2026 context

This matters more than usual right now. Dubai residential prices were roughly flat year on year in June 2026, around ten percent off their peak, after several years of exceptional growth. In a market rising fifteen percent a year, transaction costs are noise. In a flat one, they are the whole story: a nine percent round trip on a flat market held for two years is a nine percent loss before you count the service charges.

The honest read of a flat market is not that property is bad. It is that the minimum hold period got longer, and anyone whose plan required a two year exit now needs a five year one.`,
    formula: `Round-trip cost in Dubai, approximate

  Buying
    Transfer fee                       4.00% of price
    Agency commission plus 5% VAT      2.10% of price
    Trustee and admin                  ~AED 4,600
    Mortgage registration              0.25% of the loan

  Selling
    Agency commission plus VAT         2.10% of price
    Developer NOC                      AED 500 to 5,000
    Mortgage discharge, if any         ~AED 1,600

  Round trip                           ~8% to 10%

Annualised drag = round-trip cost / years held

Minimum viable hold
  = the year at which annualised drag falls
    below a level your net yield can absorb`,
    failureModes: [
      "It treats the round trip as certain. In a strong market a seller may pay no commission, and in a weak one they may pay a discount far larger than any of these fees.",
      "It ignores the cost of the time itself. Property that takes six months to sell has a holding cost during those six months that does not appear in any fee schedule.",
      "It is Dubai specific in its numbers. Stamp duty in the UK, notary and registration costs in much of Europe, and US closing costs and agent fees all produce different figures, some considerably higher.",
      "Amortising a fixed cost over a longer hold does not make the cost smaller, only the annual figure. It is a legitimate way to look at it and a poor way to justify holding an asset you should sell.",
    ],
    whenToUse:
      "Before every purchase, as a sanity check on your intended hold period. Also before every sale, to see what the exit actually costs relative to the reason you are selling.",
    sources: [
      { name: "Dubai fees and charges guide", url: "https://realestateclubdubai.com/guides/fees-and-charges" },
      { name: "Dubai 2026 market data", url: "https://www.consultycs.com/is-the-dubai-property-market-about-to-crash-the-2026-data/" },
    ],
  },

  /* ==================== PORTFOLIO ==================== */
  {
    slug: "three-fund-portfolio",
    title: "The three fund portfolio, and why it breaks for expatriates",
    category: "portfolio",
    tier: 2,
    reviewed: R,
    summary:
      "The three fund portfolio holds a total domestic equity fund, a total international equity fund and a total domestic bond fund at market weights, and its weakest assumption is the word domestic, which has no meaning for an investor with no home bond market.",
    body: `The Bogleheads three fund portfolio is the most defensible default in investing. Own the whole domestic stock market, the whole international stock market, and the whole domestic bond market. Weight by market capitalisation inside each. Never add a fourth fund. Rebalance on a rule rather than a view.

It works because it removes every decision that reliably destroys returns: stock selection, market timing, manager selection, and the constant tinkering that follows from having options. The total cost should sit under fifteen basis points a year, which over thirty years is worth more than almost any active decision you were likely to make.

## Where it stops working

The portfolio was designed by and for American investors, and it has "domestic" baked into two of its three legs. For a Gulf based expatriate, both break.

**There is no domestic bond market.** The dirham is pegged to the dollar, so US Treasuries are the closest thing to a home government bond you have, but calling them domestic is a stretch and treating them as risk free depends on the peg holding.

**"Domestic equity" is undefined.** An Egyptian passport holder living in Dubai investing for a retirement that might happen in Portugal has no domestic. The honest answer is to drop the distinction entirely and hold one global equity fund at world market weight, currently about sixty two percent United States and thirty eight percent everything else.

**Domicile matters more than allocation.** This is the part almost nobody gets right. The American three fund portfolio names US domiciled funds. For a non-US person those funds carry thirty percent dividend withholding and US estate tax exposure above sixty thousand dollars. The same three funds, in Irish domiciled UCITS form, generally carry fifteen percent withholding and no US estate tax exposure. Same index, same cost, different jurisdiction, materially different outcome. That is covered in its own [playbook](/playbooks/fund-domicile/) and it deserves the separate page.

## The expatriate version

- One global equity fund, Irish domiciled, at world market weight.
- One short to intermediate government bond fund, in the currency of the liability you are actually funding.
- Cash or short Treasury bills, in the currency you spend.

Three funds, same discipline, none of them called domestic. The bond allocation is the one that needs thought: the right question is not your age, it is which currency you will spend the money in, and whether you know yet.`,
    formula: `Classic version
  Domestic equity        (home market, total market)
  International equity   (ex-home, total market)
  Domestic bonds         (home government and credit)

  Bond share is often approximated as your age,
  or age minus ten to twenty.
  Cost test: weighted expense ratio under 0.15% a year.

Expatriate version
  Global equity at world market weight
    (~62% United States, ~38% rest of world in 2026)
  Government bonds in the currency of your liability
  Cash or Treasury bills in the currency you spend

  Choose fund domicile before you choose allocation.`,
    failureModes: [
      "Domestic is undefined for anyone living outside the country of their passport, and defaulting to the US version quietly imposes a large home bias that has been a lucky bet rather than a principled one.",
      "The US domiciled version creates a 30 percent dividend withholding and a US estate tax exposure above sixty thousand dollars for a non-US person. This is the single most expensive mistake in the whole framework.",
      "It says nothing about the currency of your future liabilities. A portfolio that is perfect in dollars can be badly wrong for someone who will retire in euros.",
      "Market cap weighting means you own more of whatever has risen most. That is a feature in most decades and a concentration risk at extremes, and 2026 is a period where a small number of very large companies dominate the global index.",
      "It has no answer for illiquid assets. If most of your net worth is a property, a three fund portfolio describes only the minority of your balance sheet.",
    ],
    whenToUse:
      "As the default structure for liquid investments, unless you can articulate specifically why your situation needs something else. The burden of proof sits with the more complicated option.",
    sources: [
      { name: "Bogleheads wiki, non-resident alien investors and Ireland domiciled ETFs", url: "https://www.bogleheads.org/wiki/Nonresident_alien_investors_and_Ireland_domiciled_ETFs" },
      { name: "Bogleheads wiki, getting started for non-US investors", url: "https://www.bogleheads.org/wiki/Main_Page" },
    ],
  },

  {
    slug: "all-weather",
    title: "All Weather and the four boxes",
    category: "portfolio",
    tier: 2,
    reviewed: R,
    summary:
      "All Weather is Ray Dalio's framework holding that every economic environment is a combination of growth and inflation either rising or falling, and that a portfolio should hold assets that win in each of the four resulting boxes rather than betting on which one arrives.",
    body: `Bridgewater's insight was not a portfolio, it was a way of describing the world with two variables instead of a forecast.

Economic surprises, the ones that actually move asset prices, resolve into growth coming in above or below expectations, and inflation coming in above or below expectations. Two variables, two directions, four boxes. Every asset class has a box where it does well and a box where it suffers, and those relationships are structural rather than historical accidents.

| | Growth rising | Growth falling |
|---|---|---|
| **Inflation rising** | Commodities, emerging market debt, real assets | Inflation linked bonds, commodities, gold |
| **Inflation falling** | Equities, corporate credit | Government bonds, long duration |

The conclusion follows directly. If you cannot reliably predict which box the next five years lands in, and the evidence that anyone can is thin, then hold something that wins in each, sized so that each box contributes a similar amount of risk rather than a similar amount of money.

That last clause is what makes it different from ordinary diversification. A sixty forty portfolio looks balanced in money and is not balanced in risk: equities are roughly three times as volatile as bonds, so a sixty forty portfolio takes about ninety percent of its risk from equities. It is a growth bet wearing a diversified costume.

## What it is not

It is not a magic portfolio and it has had genuinely bad periods. 2022 was one of them: growth fell and inflation rose at the same time, the box that punishes both the equity leg and the long duration bond leg, and risk parity strategies broke alongside everything else. Anyone who told you All Weather protects against all weather was selling something.

## Why it earns its place on this site

Because the framework is more valuable than the portfolio. Most investors have never once asked which of the four boxes their holdings need in order to work. Run the test on your own balance sheet and the answer is usually uncomfortable: property, equities and business income all want the same box, growth rising and inflation contained. That is not a portfolio, it is one bet expressed three ways.

This is the same idea as [the Playbook Matrix](/), from a different angle. Both exist to make you notice a concentration you did not know you had.`,
    formula: `The four boxes

                  Growth rising      Growth falling
  Inflation
    rising        Commodities        Inflation-linked bonds
                  EM debt            Gold
                  Real assets        Commodities

  Inflation
    falling       Equities           Government bonds
                  Corporate credit   Long duration

The test to run on your own holdings:
  For each asset you own, name the box it needs.
  Count how many land in the same box.
  That count is your real concentration.

Risk contribution, not money weight
  A 60/40 portfolio takes roughly 90% of its
  risk from the equity leg, because equities are
  about three times as volatile as bonds.`,
    failureModes: [
      "Balancing risk usually means leveraging the bond leg to make its risk contribution meaningful, which introduces financing costs and a dependence on borrowing markets staying open.",
      "It failed in 2022, when rising inflation and falling growth arrived together and hit both the equity and long duration legs at once. The framework describes that box, but holding it did not protect you inside it.",
      "It is built on the correlation structure of a forty year disinflation. If that regime does not repeat, the diversification it assumes may not show up.",
      "Retail versions sold as All Weather are usually a fixed allocation with no leverage and no risk balancing, which is a different product wearing the name.",
      "It gives no guidance on illiquid assets, which for most property owners is the majority of the balance sheet.",
    ],
    whenToUse:
      "As a diagnostic rather than a portfolio. Once a year, name the box each of your holdings needs and count how many share one. Act on the count, not on the label.",
    sources: [
      { name: "Bridgewater Associates, The All Weather Story", url: "https://www.bridgewater.com/research-and-insights/the-all-weather-story" },
      { name: "PortfoliosLab, All Weather portfolio performance", url: "https://portfolioslab.com/portfolio/ray-dalio-all-weather" },
      { name: "Markov Processes, risk parity and the weather", url: "https://www.markovprocesses.com/blog/risk-parity-not-performing-blame-the-weather/" },
    ],
  },

  {
    slug: "lump-sum-vs-dca",
    title: "Lump sum versus cost averaging",
    category: "portfolio",
    tier: 1,
    calculator: "lump-sum-vs-dca",
    reviewed: R,
    summary:
      "Vanguard's research across US, UK and Australian markets found that investing a lump sum immediately beat spreading it in over twelve months in roughly two thirds of the historical periods tested, because markets rise more often than they fall.",
    body: `You have received a bonus, sold a property, or inherited money. Do you invest it all now, or feed it in over the next year?

Vanguard answered this with rolling historical windows across three markets. Investing immediately produced a higher ending value than twelve month cost averaging in roughly two thirds of the periods tested. The result held across the US, the UK and Australia, and across different portfolio mixes.

The reason is unglamorous. Markets spend most of their time going up. Money held in cash while you wait to feel comfortable is money not earning the return you are investing for in the first place. Averaging in over twelve months means, on average, about half your money spends about six months uninvested.

## The other third is not nothing

In roughly a third of periods, cost averaging won, because the market fell while the money was being fed in and the later tranches bought more units. Those are exactly the periods that people remember, and exactly the ones that make investing immediately feel reckless.

So the honest framing is not that cost averaging is a mistake. It is that cost averaging is a worse expected outcome purchased in exchange for a better worst case, and for a much higher probability that you actually go through with it. That second part is worth more than the arithmetic admits. A perfect plan you abandon in month three is worse than an imperfect plan you follow.

## Two clarifications that matter

**Investing your salary is not cost averaging.** If money arrives monthly and you invest it monthly, you are investing immediately with the money you have. The question only exists when you are holding a lump you could deploy today.

**If the deployment schedule feels frightening, the allocation is wrong.** The fear that makes you want to spread a purchase over a year is usually not a fear about timing, it is a fear about the asset mix. Someone genuinely comfortable with a portfolio would not be afraid to own it on Tuesday. If you would not hold that allocation today, the answer is a different allocation, not a slower path to the same one.

## A practical middle

If you know the arithmetic and still cannot bring yourself to invest it all at once, compress the window. Three months rather than twelve captures most of the psychological benefit and gives up much less of the expected return. And write the schedule down before you start, because the failure mode of cost averaging is stopping halfway when the market falls, which converts it into market timing with extra steps.`,
    formula: `Lump sum, value at the horizon
  = Amount x (1 + r)^T

Cost averaging over N months
  = sum over k = 0 to N-1 of
      (Amount / N) x (1 + c)^(k/12) x (1 + r)^(T - k/12)

  where r is the expected return once invested,
  c is the return on the cash still waiting,
  and T is the total horizon in years.

Average time uninvested
  = (N - 1) / 2 months

Vanguard result
  Investing immediately produced a higher ending
  value in roughly two thirds of rolling historical
  periods across US, UK and Australian markets.`,
    failureModes: [
      "Two thirds is not certainty. In the other third the market fell during the averaging window and cost averaging won, sometimes by a lot.",
      "It is an expected value argument, and expected value is a poor guide when a single bad outcome would change your life. Size matters: the calculation is different for a sum that is most of your net worth.",
      "It assumes you follow through. Cost averaging that stops when the market falls is market timing, and it usually produces the worst outcome of the three.",
      "It ignores tax and transaction costs, which in some jurisdictions make many small purchases meaningfully more expensive than one large one.",
      "The historical win rate comes from markets that rose over the period studied. It is evidence, not a law.",
    ],
    whenToUse:
      "Whenever you are holding cash you intend to invest and are hesitating. Run the number, then decide honestly whether your hesitation is about timing or about the allocation.",
    sources: [
      { name: "Vanguard, cost averaging: invest now or temporarily hold your cash", url: "https://corporate.vanguard.com/content/dam/corp/research/pdf/cost_averaging_invest_now_or_temporarily_hold_your_cash.pdf" },
    ],
  },

  {
    slug: "safe-withdrawal-rate",
    title: "Safe withdrawal rate",
    category: "portfolio",
    tier: 1,
    calculator: "safe-withdrawal-rate",
    reviewed: R,
    summary:
      "The safe withdrawal rate is the share of a portfolio you can spend in the first year of retirement, increasing with inflation thereafter, without running out of money, and current credible estimates range from about 3.9 percent to about 4.7 percent depending on the assumptions.",
    body: `Bill Bengen's 1994 work asked a simple question: what is the highest percentage of a portfolio you could have withdrawn in year one, increased annually with inflation, and never run out over thirty years, using the worst starting year in US history? The answer was about four percent, and it became the most quoted number in retirement planning.

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

Then, in retirement, do not actually withdraw a fixed inflation adjusted amount forever regardless of what happens. Nobody does. Guardrail approaches, which cut spending modestly after a bad year and raise it after a good one, support meaningfully higher starting rates because they let the plan respond. That flexibility is worth more than any decimal place in the starting number.`,
    formula: `Portfolio needed
  = (Annual spending - other income) / withdrawal rate

  At 3.9%   multiply the gap by 25.6
  At 4.0%   multiply the gap by 25.0
  At 4.7%   multiply the gap by 21.3

Years to reach the target
  Solve for n in
    have x (1 + r)^n + save x (((1 + r)^n - 1) / r) = target
  where r is the expected REAL return, after inflation.

All three rates assume spending rises with
inflation each year, so the return assumption
must be real or you will double count.`,
    failureModes: [
      "It was derived from US market history, which is the best documented and among the most successful equity markets of the twentieth century. Applying a US-derived rate globally embeds survivorship bias.",
      "It assumes a fixed inflation adjusted withdrawal regardless of what markets do, which no real retiree does. Guardrail approaches support higher starting rates precisely because they allow the plan to respond.",
      "It ignores tax, which for a globally mobile investor can be the difference between the conservative and the optimistic case.",
      "Thirty years is the standard horizon. Retiring at fifty means forty or more, and the safe rate falls as the horizon lengthens.",
      "It says nothing about the shape of spending. Most retirees spend more in the first decade and less in the third, which the flat inflation adjusted assumption gets wrong in both directions.",
    ],
    whenToUse:
      "To size the target and to sanity check whether a plan is roughly right. Not to run an actual drawdown, which needs a regulated adviser, a tax position and a guardrail policy.",
    sources: [
      { name: "Morningstar, what is a safe retirement withdrawal rate, 2026", url: "https://www.morningstar.com/retirement/whats-safe-retirement-withdrawal-rate-2026" },
      { name: "Advisor Perspectives, Bill Bengen raises the 4% rule to 4.7%", url: "https://www.advisorperspectives.com/articles/2025/08/29/bill-bengen-boosts-the-4-rule-to-4-7" },
      { name: "Boldin, sequence of returns risk", url: "https://www.boldin.com/retirement/what-is-sequence-of-returns-risk/" },
    ],
  },

  /* ==================== TAX, RISK, BEHAVIOUR ==================== */
  {
    slug: "fund-domicile",
    title: "Fund domicile, and the sixty thousand dollar trap",
    category: "tax",
    tier: 1,
    calculator: "estate-tax-exposure",
    reviewed: R,
    summary:
      "For an investor who is not a US person, holding US domiciled funds exposes everything above sixty thousand dollars to US estate tax at rates rising to forty percent, while the identical index held through an Irish domiciled UCITS fund generally carries no such exposure and half the dividend withholding.",
    body: `This is the highest value page on this site, because it is the one where the arithmetic is largest and the awareness is lowest.

If you are not a US citizen and not US domiciled, and you hold shares in US companies or shares in US domiciled funds, those are US situs assets. On death they fall inside the US estate tax system. The exempt amount is not the roughly fourteen million dollars a US person gets. It is **sixty thousand dollars**. Above that, rates climb through the schedule to forty percent.

A UAE resident holding four hundred thousand dollars of a US domiciled S&P 500 fund has, on current rules and with no applicable treaty, an estate tax exposure in the region of one hundred thousand dollars. It is a liability most people holding that position have never heard of, and it is the sort of thing families discover at the worst possible moment.

## The fix is a different ticker for the same index

An Irish domiciled UCITS fund holding the same US companies is an Irish situs asset. It generally sits outside US estate tax however much US stock it holds inside it.

It also usually halves your dividend drag. A Gulf resident holding a US domiciled fund suffers thirty percent US withholding on dividends, because the UAE has no relevant US tax treaty. Ireland does have one. An Irish domiciled UCITS typically suffers fifteen percent at fund level and nothing at investor level.

| | US domiciled fund | Irish domiciled UCITS |
|---|---|---|
| Tracks | S&P 500 | S&P 500 |
| Dividend withholding for a Gulf resident | 30% | 15% at fund level |
| US estate tax exposure above $60,000 | Yes | Generally no |
| Example ticker | VOO | CSPX |

Same index. Same underlying companies. Similar ongoing charge. Two different legal products in two different jurisdictions with two materially different outcomes.

## The arithmetic of the dividend half

On five hundred thousand dollars at a one and a half percent dividend yield, the annual dividend is seven thousand five hundred. Thirty percent withholding takes two thousand two hundred and fifty. Fifteen percent takes one thousand one hundred and twenty five. The difference is a little over eleven hundred dollars a year, and compounded over twenty years at a market return it is worth considerably more than the headline saving.

Neither number is dramatic on its own. Together, and set against an estate exposure that can run into six figures, this is the largest single structural decision most expatriate investors will make, and it is made by choosing a ticker.

> This is where you pay for advice.
> Treaty positions, joint ownership, trusts, your citizenship and your domicile all change the answer materially, and the rules change. This page exists to show you that a question exists, not to answer it for your circumstances. Take advice from a cross-border tax professional before acting.`,
    formula: `US estate tax for a non-US person, simplified

  Exempt amount                  USD 60,000
  Unified credit                 USD 13,000
  Rate schedule                  18% rising to 40%

  Tentative tax computed on the full US-situs value,
  then reduced by the 13,000 credit.

Dividend drag comparison

  US domiciled fund, Gulf resident
    Annual cost = value x dividend yield x 30%

  Irish domiciled UCITS
    Annual cost = value x dividend yield x 15%
      (suffered inside the fund, nothing at investor level)

  Annual saving = value x dividend yield x 15%

Check the domicile in the fund factsheet.
The index name tells you nothing about it.`,
    failureModes: [
      "Treaty positions change everything and vary by country. An investor resident in a country with a US estate tax treaty may have a far larger exemption. The UAE does not have one.",
      "The sixty thousand dollar threshold and the rate schedule are set by US law and can change. So can Ireland's treaty position.",
      "Irish UCITS funds are not universally better. Some brokers offer poor access to them, spreads can be wider, and a few US products have no clean UCITS equivalent.",
      "Selling US domiciled holdings to switch may crystallise a taxable gain depending on your residence, which can cost more than the exposure you are removing.",
      "This page is an indicator, not advice. Your citizenship, your domicile, joint ownership and any trust structures all change the answer, and none of them are inputs here.",
    ],
    whenToUse:
      "Before you buy your first fund, and immediately if you already hold US domiciled funds and are not a US person. This is the one framework on the site where the correct next step is to call a professional rather than to run a calculator.",
    sources: [
      { name: "Bogleheads wiki, non-resident alien investors and Ireland domiciled ETFs", url: "https://www.bogleheads.org/wiki/Nonresident_alien_investors_and_Ireland_domiciled_ETFs" },
      { name: "State Street, considerations for non-US investors, US ETFs versus Irish UCITS", url: "https://www.ssga.com/us/en/institutional/insights/considerations-for-non-us-investors-us-etfs-vs-irish-ucits" },
      { name: "KPMG, US estate tax implications for non-US residents", url: "https://kpmg.com/ch/en/insights/taxes/us-citizien-estate-tax-implications-non-us-residents.html" },
    ],
  },

  {
    slug: "drawdown-recovery-math",
    title: "Drawdown recovery math",
    category: "risk",
    tier: 2,
    reviewed: R,
    summary:
      "Losses and gains are not symmetric: a fall of fifty percent requires a gain of one hundred percent to get back to where you started, and the required recovery accelerates sharply as the loss deepens.",
    body: `This is the most important piece of arithmetic in risk management and it takes one line to state.

If you lose x percent, the gain required to get back to level is x divided by one minus x. That is not intuitive, and the gap between intuition and reality is where a great deal of money goes.

| Fall | Gain required to recover |
|---|---|
| 10% | 11% |
| 20% | 25% |
| 30% | 43% |
| 40% | 67% |
| 50% | 100% |
| 60% | 150% |
| 70% | 233% |
| 80% | 400% |
| 90% | 900% |

Notice where it turns. Up to about twenty percent, losses and recoveries are roughly in the same neighbourhood, and time fixes them. Past fifty percent, the required recovery becomes something you can no longer wait for at any reasonable rate of return: a hundred percent gain at eight percent a year takes nine years, and a four hundred percent gain takes twenty one.

## What follows from this

**Avoiding large losses matters more than capturing large gains.** Not because the gains are unwelcome but because the arithmetic is asymmetric and time is finite. A strategy that captures eighty percent of the upside and avoids the worst of the downside will usually beat one that captures everything in both directions, and it will do so with a fraction of the anxiety.

**Leverage is where this bites.** A property bought with a twenty five percent deposit loses its entire equity on a twenty five percent price fall. The asset is down a quarter, your money is down all of it, and the recovery required on your capital is infinite because there is no capital left. This is the mechanism by which leveraged property investors are wiped out in markets that only fell moderately.

**Concentration is the other place.** A single stock or a single building can fall eighty percent. A global equity index has never done so. The recovery table is an argument for diversification that does not require any view about which assets will do well.

## The uncomfortable corollary

It also explains why the fear of missing out is more expensive than it looks. Chasing the asset that has already risen most is a way of buying the position with the largest potential drawdown, at the moment the drawdown is most likely. The recovery table is what turns that from a saying into a number.`,
    formula: `Gain required to recover a loss
  = L / (1 - L)
  where L is the loss as a decimal

  30% loss  ->  0.30 / 0.70  =  42.9%
  50% loss  ->  0.50 / 0.50  =  100%
  70% loss  ->  0.70 / 0.30  =  233%

Years to recover at an annual return r
  = ln(1 / (1 - L)) / ln(1 + r)

  A 50% loss at 8% a year takes about 9 years.
  A 70% loss at 8% a year takes about 15.6 years.

With leverage
  Equity is wiped out when the asset falls by
  the deposit percentage. A 25% deposit is gone
  on a 25% fall in the asset.`,
    failureModes: [
      "It measures nominal recovery. Recovering your starting number after five years of inflation is not recovering your purchasing power.",
      "It assumes you hold. Most of the damage from large drawdowns is done by selling near the bottom, which converts a temporary fall into a permanent loss.",
      "It says nothing about probability. A wide range of assets can fall thirty percent, far fewer can fall eighty, and the table treats both as arithmetic rather than as risks to be weighted.",
      "Used carelessly it argues for holding cash, which has its own guaranteed real loss to inflation. Avoiding drawdowns entirely has a cost too, it is just quieter.",
      "For someone contributing regularly, a drawdown early in the accumulation phase is genuinely good news, because subsequent contributions buy more units. The table is most relevant at and after the peak of the balance.",
    ],
    whenToUse:
      "Before adding leverage, before concentrating a position, and any time an asset has risen so far that the potential fall has become large. Read it as a constraint on position size rather than as a market view.",
    sources: [
      { name: "Morningstar, Mind the Gap 2025", url: "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf" },
    ],
  },

  {
    slug: "the-behaviour-gap",
    title: "The behaviour gap",
    category: "behavioural",
    tier: 2,
    reviewed: R,
    summary:
      "The behaviour gap is the difference between the return a fund reported and the return its average investor actually earned, and it exists because money tends to arrive after good performance and leave after bad.",
    body: `Funds report time weighted returns, which assume you bought at the start and held to the end. Investors experience dollar weighted returns, which account for when money actually went in and came out. The two differ, and the difference is almost always in the same direction.

Morningstar has measured this annually for years in its Mind the Gap study, and finds a persistent shortfall of roughly one percentage point a year between fund returns and investor returns. DALBAR's Quantitative Analysis of Investor Behavior has reported much larger gaps, though its methodology has been contested for decades and its numbers should be treated with more caution than they usually receive.

The mechanism is not mysterious. Money flows into funds after a strong run and out after a weak one. Buying after strength and selling after weakness is, mechanically, buying high and selling low, executed slowly enough that it does not feel like a decision.

## The honest complication

A 2026 Financial Analysts Journal paper argued that much of the measured gap is a statistical artefact rather than evidence of investor error, because the calculation is sensitive to how flows and periods are treated. That finding deserves to be on this page, because a framework that only cites the evidence supporting it is not a framework, it is a sales pitch.

The defensible position after both sets of evidence is narrower and still useful: **the gap is smaller than the scary numbers suggest, it is real, and it is close to entirely avoidable.** Which is the part that matters, because the fix costs nothing.

## The antidotes, in order of effect

1. **Write an investment policy statement before you need one.** One page. What you own, in what proportions, why, when you will rebalance, and what would have to be true for you to change it. Written in calm, read in panic. Nothing else on this list works without it.
2. **Automate contributions.** A decision made once cannot be unmade weekly.
3. **Rebalance on a rule, not a feeling.** Bands rather than dates: act when an allocation drifts by more than a fifth of its target weight. This forces selling what has risen and buying what has fallen, which is the opposite of the behaviour gap by construction.
4. **Reduce the frequency you look.** Checking a volatile portfolio daily guarantees you will see more losses than gains, because the ratio of down days to up days is far worse than the ratio of down years to up years. This is myopic loss aversion and the cure is a calendar.
5. **Write down the reason for every trade before you place it.** Most bad trades do not survive being written down.

## Why this is on a site about arithmetic

Because it is the only framework here where the answer is not a number. You can have every calculation on this site correct and still lose the return to a decision made on a Tuesday afternoon in a falling market. The arithmetic is necessary. It has never been sufficient.`,
    formula: `Time-weighted return
  What the fund reports. Assumes you bought at
  the start and held to the end.

Dollar-weighted return
  What you earned. Weights each period by how
  much money you actually had invested in it.

Behaviour gap
  = Time-weighted return - Dollar-weighted return

  Morningstar Mind the Gap finds roughly
  one percentage point a year, persistently.

Rebalancing band, the 5/25 rule
  Act when an allocation drifts by
  5 percentage points in absolute terms,
  or 25 percent of its own target weight,
  whichever is smaller.`,
    failureModes: [
      "The size of the gap is contested. A 2026 Financial Analysts Journal paper argues much of the measured shortfall is a statistical artefact of how flows are treated rather than proof of investor error.",
      "DALBAR's much larger figures have been criticised for decades on methodology and should not be quoted as settled fact.",
      "Some of the gap is not a mistake at all. People buy when they have money and sell when they need it, and life events are not behavioural errors.",
      "The antidotes assume the underlying allocation is sound. Rigidly holding a bad portfolio through a decade is discipline applied to the wrong object.",
      "Rebalancing has costs, in transactions and sometimes in tax, that the framework tends to gloss over.",
    ],
    whenToUse:
      "Now, before you need it. The investment policy statement is only useful if it was written while you were calm, which by definition is not the moment you will want to write it.",
    sources: [
      { name: "Morningstar, Mind the Gap 2025", url: "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf" },
      { name: "Financial Analysts Journal, bad timing does not cost investors fund returns", url: "https://rpc.cfainstitute.org/research/financial-analysts-journal/2026/bad-timing-does-not-cost-investors-funds-returns" },
      { name: "A Wealth of Common Sense, Larry Swedroe's 5/25 rebalancing rule", url: "https://awealthofcommonsense.com/2014/03/larry-swedroe-525-rebalancing-rule/" },
    ],
  },
];
