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
  /* ==================== COMPARISONS ==================== */
  {
    slug: "dubai-vs-london",
    title: "Dubai versus London",
    category: "property",
    tier: 1,
    calculator: "net-rental-yield",
    reviewed: R,
    summary:
      "A Dubai resident buying a London rental pays roughly ten percent of the purchase price in stamp duty alone once the additional property and non resident surcharges are added, then pays UK income tax on the rent and UK capital gains tax on the exit, none of which exists in Dubai, which is why a lower headline yield in Dubai often survives contact with reality better than a higher one in London.",

    body: `The comparison is almost always made on gross yield, and gross yield is the one number where London can look competitive. Outer London boroughs advertise six and seven percent. Dubai advertises six to eight. On that basis a buyer concludes the two markets are similar and picks on sentiment.

They are not similar. They differ at three separate points, and each one takes a bite the headline never mentions: what you pay to get in, what the tax authority takes each year, and what it takes when you leave.

## Getting in

In Dubai the entry cost is roughly six to seven percent of the price. Four percent to the Dubai Land Department, two percent agency commission with five percent VAT on the commission, a trustee office fee of around four thousand dirhams, and an administrative charge. There is no purchase tax beyond the transfer fee.

In England the entry cost is stamp duty, and for the buyer this site is written for it is not the headline rate. A UK resident buying their only home pays the standard bands. A Dubai based investor buying a rental pays those bands **plus five percentage points** for owning another property **plus two percentage points** for not having been in the UK for 183 days. Both surcharges apply to every band, including the band that would otherwise be zero.

On a six hundred thousand pound flat that works out as follows.

- The first 125,000 at seven percent: 8,750
- The next 125,000 at nine percent: 11,250
- The remaining 350,000 at twelve percent: 42,000

Sixty two thousand pounds, which is **10.3 percent of the purchase price in tax alone**, before conveyancing and survey. Dubai's entire round trip in costs a buyer less than London's stamp duty on its own.

## Holding it

This is the part that is usually left out entirely. Rental income from a UK property is UK taxable income wherever the landlord lives. Under the Non-resident Landlord Scheme the agent or the tenant deducts basic rate tax at source unless HMRC approves you to receive rent gross and file a return instead. Either way the tax is due.

Dubai levies no personal income tax on rental income.

Take the six hundred thousand pound flat at six percent gross, so thirty six thousand a year, and strip it the way the [net rental yield](/playbooks/net-rental-yield/) framework does. Service charge on a leasehold flat, management at ten percent plus VAT, a month of void, a maintenance reserve. Call it twenty four thousand of taxable profit. Basic rate tax takes roughly five thousand of that.

Against a total outlay near six hundred and sixty five thousand, the flat nets under three percent. The Dubai worked example in the net yield framework, on a market advertising a seven percent gross, lands at 4.3 percent net and pays no tax on it.

## Leaving

A non resident selling UK residential property pays UK capital gains tax on the gain, at eighteen or twenty four percent depending on where the gain sits against the income tax bands, with an annual exempt amount of three thousand pounds. There is also a sixty day reporting deadline, and missing it is its own penalty.

Dubai charges no capital gains tax. The exit cost is the agency commission and the transfer, which the [transaction cost drag](/playbooks/transaction-cost-drag/) framework covers.

## So what is London actually for

Three things, and they are real.

**Currency.** The dirham is pegged to the dollar. A portfolio denominated entirely in dollars is a bet, even if it does not feel like one. Sterling assets are a hedge against that, and for someone whose children may study or settle in the UK they are a liability match rather than a speculation.

**Institutional depth.** Title, planning, dispute resolution and a rental market with centuries of case law behind it. Dubai's framework is good and improving fast, but it is decades old rather than centuries.

**Debt.** UK mortgage markets for non residents are narrower than for residents but they exist, and long fixed rate money in a low yielding market behaves differently from short money in a high yielding one.

None of those three is a yield argument. That is the point. If the case for London is diversification, say so and size it as diversification. If the case is income, the arithmetic above is the case against.`,
    formula: `Dubai, entry
  Transfer fee                4.00% of price
  Agency commission           2.00% + 5% VAT on the commission
  Trustee and admin           roughly AED 4,500
  Purchase tax                none
  Annual tax on rent          none
  Capital gains tax on exit   none

England, entry, non resident buying an additional property
  SDLT band rate            + 5 pp additional property
                            + 2 pp non resident
  applied to every band, including the nil rate band

  Worked, GBP 600,000
    125,000 x 7%   =  8,750
    125,000 x 9%   = 11,250
    350,000 x 12%  = 42,000
    Total SDLT     = 62,000   (10.3% of price)

  Annual tax on rent          income tax on the net profit,
                              deducted at source under the NRL scheme
                              unless HMRC approves gross payment
  Capital gains tax on exit   18% or 24% on the gain,
                              GBP 3,000 annual exempt amount,
                              reportable within 60 days`,
    failureModes: [
      "It compares two tax positions, not two buildings. A buyer who is or becomes UK tax resident faces a completely different calculation, and one who is already UK resident may find the surcharges do not both apply.",
      "Personal allowance eligibility for non residents is not universal. British citizens generally keep it, others depend on the treaty. Assuming it applies can flatter the London number by a few thousand pounds a year.",
      "Mortgage interest relief for individual UK landlords is a basic rate credit rather than a deduction, which changes the arithmetic sharply for a leveraged buyer and is not modelled above.",
      "Corporate ownership changes everything in both directions, including stamp duty at the fifteen percent flat rate in some cases, and is a question for a tax adviser rather than a framework page.",
      "The yields quoted are indicative market averages from secondary sources. Your building is not an average.",
      "It says nothing about capital growth, which is the argument most London buyers are actually making. The costs above are certain; the growth is not.",
    ],
    whenToUse:
      "Before treating a London gross yield and a Dubai gross yield as comparable numbers, which they are not. Also before assuming that a portfolio held entirely in a dollar pegged currency is diversified.",
    sources: [
      { name: "HMRC, Stamp Duty Land Tax residential rates", url: "https://www.gov.uk/stamp-duty-land-tax/residential-property-rates" },
      { name: "HMRC, Capital Gains Tax rates and allowances", url: "https://www.gov.uk/capital-gains-tax/rates" },
      { name: "HMRC, tax on UK rental income if you live abroad", url: "https://www.gov.uk/tax-uk-income-live-abroad/rent" },
      { name: "Dubai Land Department, fees and charges", url: "https://dubailand.gov.ae/en/" },
      { name: "London rental yields by borough, 2026, indicative", url: "https://investropa.com/blogs/news/london-rental-yields" },
    ],
  },

  {
    slug: "off-plan-vs-ready",
    title: "Off-plan versus ready",
    category: "property",
    tier: 1,
    calculator: "off-plan-irr",
    reviewed: R,
    summary:
      "A ready property starts paying rent immediately while an off-plan unit pays nothing until handover, so an off-plan purchase has to make up several years of foregone net yield out of its price advantage and its appreciation before it is even level, which is why the two can only be compared as cash flows and never as headline prices.",

    body: `Both are sold on the same sentence: get in at today's price. The difference is what happens in the years between paying and owning, and that gap is where the entire comparison lives.

## What each one actually is

**Ready** is a building that exists. You can stand in it, read last year's service charge invoices, meet the owners association, see whether the chiller is original, and let it to a tenant the month you complete. You pay the whole price now and you own an income stream now.

**Off-plan** is a contract to buy a building that does not exist yet, paid for in instalments against construction milestones, registered with the Land Department through Oqood rather than as a title deed. It produces no income at all until handover.

## Why money later is worth less, and why that is not the whole story

The genuine advantage of a payment plan is that a dirham paid in three years costs less than a dirham paid today. That is real and it is the argument the [off-plan IRR](/playbooks/off-plan-irr/) framework exists to quantify. Two plans at the same headline price are not the same price, and a post handover plan can be worth eight to fifteen percent of the headline figure against a front loaded one.

But the same clock runs the other way. A ready unit at a 4.3 percent net yield produces income in every one of those years. An off-plan unit produces none. Over a three year build that is roughly thirteen percent of value in foregone net rent, which the payment plan discount has to cover before the off-plan purchase is even level.

Resist the temptation to net those two numbers off in your head. They arrive at different times and in different sizes, which is exactly the situation percentages handle badly. Lay both out as dated cash flows and compare the internal rates of return. That is not a formality, it is the only way the answer comes out right.

## What protects your money, and what does not

Dubai's Law No. 8 of 2007 is better than most jurisdictions and worth understanding precisely.

Every project has its own escrow account. Purchaser payments and any project finance must go into it. The account is dedicated to that project's construction, and payments in it cannot be attached by the developer's other creditors, which is the provision that matters if a developer gets into trouble elsewhere. After the completion certificate the escrow agent retains five percent of the account value and releases it to the developer one year after the units are registered to buyers.

Note what that protects and what it does not. It protects your money from being spent on a different project or seized by an unrelated creditor. It does not guarantee the building is delivered on time, delivered to the specification in the brochure, or worth what you agreed to pay when it finally arrives.

## The risk nobody prices

Off-plan units hand over in batches. On handover day, several hundred near identical apartments become available for sale and for rent in the same tower in the same month, and every one of the investors who bought for the flip is trying the same exit at once.

That is a structural feature of the product, not bad luck, and it is the single most common reason an off-plan purchase that looked good on paper disappoints. The ready market has no equivalent.

## The honest summary

Off-plan suits a buyer with a long horizon, no need for income in the meantime, tolerance for delay, and a genuine price or plan advantage they have actually calculated rather than been told about. Ready suits a buyer who wants the income to start, wants to inspect what they are buying, and would rather pay a premium for certainty than be paid for uncertainty.

Neither is the smart choice in general. The one that is wrong for you is the one you cannot fund if the timeline slips by two years.`,
    formula: `Compare as cash flows, never as prices.

Ready
  t0    - (price + acquisition costs)
  t1..n + net rent each year
  tn    + sale proceeds - exit costs

Off-plan
  t0    - deposit
  t1..k - each instalment on its due date
  tk    - handover payment, registration, fit out
  tk+1..n + net rent, but only from handover
  tn    + sale proceeds - exit costs

Then compare the internal rates of return, not the totals.

The gap the off-plan discount has to cover
  foregone net yield  =  net yield x years to handover
  at 4.3% over 3 years  =  ~12.9% of value
  before any allowance for delay`,
    failureModes: [
      "It assumes handover happens on schedule. Build a delay case at plus twelve and plus twenty four months and see whether the answer survives it, because a delayed handover pushes every rent receipt back while the payments already made stay where they are.",
      "The escrow law protects the money from misuse, not the buyer from a bad purchase. Reading it as a guarantee of delivery or of value is the most common misunderstanding in the market.",
      "Comparing a discounted off-plan price against today's ready price ignores that the ready unit will also have moved by handover. The comparison has to be against the ready market at handover, which nobody knows.",
      "Off-plan service charges are estimates until the owners association is running. The first real invoice is frequently higher than the projection used to sell the unit.",
      "The handover glut is not modelled by any standard IRR. If your exit assumes selling within a year of handover, that assumption deserves its own stress test.",
      "Mortgage availability differs. Financing a ready unit is straightforward, financing an off-plan purchase before handover often is not, which changes what you can actually afford.",
    ],
    whenToUse:
      "Before signing a payment plan, and specifically before accepting any comparison made in headline prices. Also whenever a plan is presented as a discount without the discount having been calculated.",
    sources: [
      { name: "Dubai Law No. 8 of 2007, escrow accounts for real estate development", url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2007/Law%20No.%20(8)%20of%202007.html" },
      { name: "Dubai Land Department, Oqood and off-plan registration", url: "https://dubailand.gov.ae/en/" },
      { name: "Dubai Land Department, fees and charges", url: "https://dubailand.gov.ae/en/eservices/" },
    ],
  },

  {
    slug: "property-vs-index-funds",
    title: "Property versus index funds",
    category: "cross-asset",
    tier: 1,
    calculator: "net-rental-yield",
    reviewed: R,
    summary:
      "Property and index funds are not competing return numbers, they are competing structures: property offers cheap leverage and a contractual income at the cost of eight to ten percent round trip friction, total illiquidity and single tenant concentration, while a fund offers instant diversification and near zero costs with no safe way to borrow against it.",

    body: `The argument is usually had as though one asset returns more than the other, and it is settled by whoever has the better recent anecdote. That framing is wrong, because the two are not different bets on the same thing. They are different machines, and the differences that matter are structural.

## The five that actually decide it

**Leverage.** This is the real difference and everything else is secondary. A bank will lend against a flat at four to one, secured on the asset, for twenty five years, at a rate anchored to the long bond. Nobody will do that against a fund portfolio on terms a sane person would accept. Leverage multiplies whatever the asset does, in both directions, and it is the reason property has made more people wealthy than funds have. It is also the reason it has ruined more of them.

**Friction.** The round trip cost of buying and selling property in Dubai is roughly eight to ten percent of value once the transfer fee, both commissions with VAT, and the trustee and NOC charges are counted. A global index fund costs a fraction of one percent to buy and a few basis points a year to hold. Over a two year hold that friction is four to five percent a year, which consumes an entire net yield. Over ten years it is under one percent a year. The [transaction cost drag](/playbooks/transaction-cost-drag/) framework is the whole of this argument.

**Liquidity.** A fund can be sold on a Tuesday and settles that week. A property takes months, cannot be sold in part, and is least sellable exactly when you most need the money, because the reason you need it is usually the reason nobody is buying.

**Concentration.** One property is one building, in one city, in one currency, let to one tenant, exposed to one owners association and one chiller. A global fund is thousands of companies across dozens of economies. Investors who would never put their entire liquid net worth into a single stock routinely put several times their net worth, borrowed, into a single apartment, and do not experience it as concentration.

**Effort.** Property is a job. Tenants, agents, service charge disputes, maintenance, renewals, the occasional vacancy. Some of that can be paid away at five to eight percent of collected rent, which the yield calculation should already reflect. The rest is your evenings. A fund asks nothing of you, which is a genuine return in a currency that does not appear in any spreadsheet.

## The honest comparison

If you want to compare them properly, you cannot compare a levered property's return on equity against an unlevered fund's total return. That comparison is between leverage and no leverage, and leverage wins on the way up every time.

Compare like with like. Either strip the debt out of the property and look at the unlevered yield plus growth against the fund, or accept that you are choosing leverage, and stress test it: what a two year vacancy does, what a refinancing at a rate three points higher does, what a fifteen percent price fall does to equity that was twenty five percent of the purchase price. The [drawdown recovery](/playbooks/drawdown-recovery-math/) arithmetic applies to a leveraged property far more brutally than to a fund.

## Where the tax tail matters

For a globally mobile investor the fund side has a trap the property side does not: a US domiciled ETF exposes a non resident holder to US estate tax on the US situs assets above a small threshold. Irish domiciled funds tracking the same index generally do not. This is the [fund domicile](/playbooks/fund-domicile/) question, and it is worth more to most people than the expense ratio they spent an afternoon comparing.

Property held in the UAE by a UAE resident has no income tax, no capital gains tax and no estate tax, but succession is governed by rules that a will and a structure need to address deliberately.

## The framing that actually helps

Ask what each holding needs in order to work, and count how many of your holdings need the same thing. That is the [four boxes](/playbooks/all-weather/) question. Property is growth and income, illiquid, levered, local. A global equity fund is growth, liquid, unlevered, diversified. They are genuinely different boxes, which is the strongest argument for owning both and the weakest argument for arguing about which is better.`,
    formula: `The comparison people make
  levered property return on equity   vs   unlevered fund return
  which is a comparison of leverage, not of assets.

The comparison worth making
  Property, unlevered
    net yield (after every running cost)
    + expected capital growth
    - annualised round trip friction over YOUR hold period
        = 8-10% of value / years held

  Fund
    expected total return
    - expense ratio
    - dealing costs, a few basis points

  Then, separately, decide whether you want leverage,
  and stress it:
    vacancy of 24 months
    refinancing 3 points higher
    a 15% price fall against 25% equity
        -> 60% of your equity, before costs`,
    failureModes: [
      "Expected returns are assumptions, not data. Any version of this comparison that leans on a projected growth rate is only as good as that rate, which is why the friction and leverage terms, which are knowable, deserve more weight than the growth term, which is not.",
      "It ignores the primary residence, which is not an investment in the same sense and should not be counted in this comparison at all.",
      "Property returns quoted by the industry are frequently gross and frequently exclude the round trip. Fund returns are quoted net of fees and after everything. The two are not being reported on the same basis.",
      "A REIT is neither of these things and behaves like equity in the short run and property in the long run, which frustrates people expecting one or the other.",
      "The tax position dominates for some investors and is irrelevant for others. A framework page cannot know which you are.",
      "Leverage is available to some buyers and not others. If you cannot get a mortgage, the strongest argument for property does not apply to you.",
    ],
    whenToUse:
      "When the choice is being framed as which one returns more, which is the wrong question. Also before adding a second property to a portfolio that already holds one, where the concentration argument is at its strongest.",
    sources: [
      { name: "Dubai Land Department, fees and charges", url: "https://dubailand.gov.ae/en/" },
      { name: "IRS, estate tax for nonresidents not citizens of the United States", url: "https://www.irs.gov/businesses/small-businesses-self-employed/some-nonresidents-with-us-assets-must-file-estate-tax-returns" },
      { name: "Bank for International Settlements, property price statistics", url: "https://www.bis.org/statistics/pp.htm" },
    ],
  },
  /* ==================== BATCH TWO ==================== */
  {
    slug: "mortgage-vs-cash",
    title: "Mortgage versus cash",
    category: "property",
    tier: 1,
    calculator: "net-rental-yield",
    reviewed: R,
    summary:
      "Borrowing to buy a property raises the return on your own money whenever the net yield exceeds the mortgage rate and lowers it whenever it does not, so the decision is not about affordability, it is about whether the spread between those two numbers is wide enough to pay you for the risk.",
    body: `Most buyers frame this as can I afford to pay cash. That is the wrong question, because paying cash is always affordable if you have the cash. The right question is what each dirham of borrowing earns you, and what it costs you when the assumptions fail.

## The arithmetic in one line

If the property's net yield is above the mortgage rate, leverage lifts the return on your own money. If it is below, leverage lowers it. That is the whole mechanism, and everything else is a refinement of it.

Take a unit at one and a half million dirhams with a 4.3 percent net yield, so about sixty five thousand of net operating income.

**Cash.** You put in roughly 1.6 million including acquisition costs and receive 65,000. Your money earns 4.1 percent.

**Seventy five percent mortgage at 4.0 percent.** You borrow 1,125,000 and put in about 471,000 of your own. Interest costs 45,000, leaving 20,000. Your money earns 4.2 percent, and you control an asset four times the size.

**The same mortgage at 6.0 percent.** Interest costs 67,500 against 65,000 of income. The property no longer covers its own debt. You now fund it out of salary, and the return on your own money is negative before any price movement.

Two percentage points on the rate turns the same building from a modest income asset into a monthly bill. That sensitivity is the point.

## What the rules allow

The UAE Central Bank caps how far you can take this. For an expatriate buying a first completed property under five million dirhams the ceiling is generally seventy five percent, dropping to sixty five percent above five million and sixty percent on a second property. Off-plan is capped at fifty percent for everyone. Total debt service is separately limited to half of gross monthly income, and the binding constraint is whichever of the two bites first.

Note that the deposit is not the whole of the cash you need. Acquisition costs are another six to seven percent of price and cannot be borrowed.

## What leverage does that yield tables never show

It multiplies price movements against your equity, not against the price. At seventy five percent loan to value a fifteen percent fall in value removes sixty percent of your equity before selling costs. The building lost fifteen percent. You lost sixty.

It also converts a flexible asset into a fixed obligation. A cash buyer facing a long vacancy has a disappointing year. A leveraged buyer facing the same vacancy has a payment due on the first of the month regardless.

## How to actually decide

Write down three numbers. Your net yield, calculated properly rather than from the listing. The all-in mortgage rate including arrangement and valuation fees. The spread between them.

If the spread is under a point, leverage is being paid for by hope rather than by income, and the case rests entirely on capital growth. That may still be a defensible position, but it should be stated out loud rather than smuggled in through a yield table.

Then stress it. Refinance at three points higher. Twelve months empty. Both at once. If any of those cannot be funded from income you already have, the loan is larger than the position.`,
    formula: `Return on your own money, cash
  = Net operating income / (price + acquisition costs)

Return on your own money, leveraged
  = (Net operating income - annual interest)
    / (deposit + acquisition costs)

The rule
  net yield > mortgage rate   ->  leverage lifts the return
  net yield < mortgage rate   ->  leverage lowers it, and the
                                  gap is funded from salary

Equity at risk
  equity wiped out by a price fall of (1 - LTV)
  at 75% LTV, a 15% fall removes 60% of equity

UAE caps, expatriate, indicative
  first property, completed, under AED 5m   75%
  first property, completed, over AED 5m    65%
  second and subsequent, completed          60%
  off-plan, anyone                          50%
  total debt service                        <= 50% of gross income`,
    failureModes: [
      "It compares an interest cost against a yield, but a repayment mortgage also returns capital, which is saving rather than cost. Comparing a full repayment instalment against net income overstates the drag and makes leverage look worse than it is.",
      "Rates are not fixed forever. A three or five year fixed period ending into a higher rate environment is the most common way a comfortable position becomes an uncomfortable one, and it is entirely foreseeable.",
      "The yield used is almost always the gross one. Run the comparison on net yield or it is meaningless.",
      "It assumes the loan is available at the size you modelled. The debt burden ratio frequently binds before the loan to value cap does, particularly for buyers with existing obligations.",
      "Currency matters if income and debt are in different currencies. Dirham debt against dirham rent is matched. Dirham debt against income earned elsewhere is a currency position you did not intend to take.",
      "Leverage is not a strategy on its own. It amplifies whatever the asset does, and it has no opinion about whether the asset was a good idea.",
    ],
    whenToUse:
      "Before deciding how much to borrow, which is a different question from whether you qualify. Also at every refinancing, because the spread that justified the loan is recalculated at the new rate and may no longer justify it.",
    sources: [
      { name: "Central Bank of the UAE, regulations for mortgage loans", url: "https://www.centralbank.ae/en/" },
      { name: "UAE mortgage LTV caps and debt burden ratio, indicative summary", url: "https://bank-uae.com/uae-mortgage-regulations/" },
      { name: "Dubai Land Department, fees and charges", url: "https://dubailand.gov.ae/en/" },
    ],
  },

  {
    slug: "short-let-vs-long-let",
    title: "Short let versus long let",
    category: "property",
    tier: 1,
    calculator: "net-rental-yield",
    reviewed: R,
    summary:
      "A short let can gross fifty to a hundred percent more than an annual tenancy on the same unit and still net less, because the higher revenue arrives with occupancy risk, platform commission, cleaning, furnishing, utilities, licensing and roughly the workload of a small hospitality business.",
    body: `The comparison is nearly always made on nightly rate multiplied by three hundred and sixty five, against the annual rent. That calculation has never been true for any property anywhere.

## What actually differs

**Occupancy.** An annual tenancy is occupied one hundred percent of the term by definition. A short let is occupied at whatever the market gives you, and the honest planning figure in most Dubai buildings is somewhere in the sixties to seventies across a full year, with a strong season and a soft one. Revenue is nightly rate times nights actually sold, and the second term is the one nobody models.

**Who pays for what.** On an annual tenancy the tenant pays their own utilities, their own internet, and furnishes the place themselves. On a short let all of that is yours, plus cleaning between every stay, plus consumables, plus replacing what guests break.

**Commission.** Platform fees and management take a meaningful share of gross. Full service short let operators in Dubai typically take a fifth to a quarter of revenue, against five to eight percent for annual letting management.

**Capital.** Furnishing a one bedroom to a standard that photographs well is a real number that has to be earned back before the strategy has made anything, and it depreciates.

**Regulation.** Holiday homes require a permit from the Department of Economy and Tourism, with an annual fee, tourism dirham charges per night, and rules on which buildings allow it. Some owners associations do not.

## The shape of the answer

A unit letting annually for one hundred and five thousand might gross one hundred and sixty thousand as a short let. That looks decisive until the deductions run.

Take twenty percent to management and platform, so 32,000. Utilities, internet and consumables, perhaps 18,000. Cleaning across a hundred and eighty stays, another 20,000 or more. Permit and tourism fees. Furnishing amortised across three years. What began as a fifty five thousand advantage is frequently under fifteen, and sometimes under nothing.

That does not mean short let loses. In the right building, in the right location, run well, it wins clearly. It means the comparison has to be run net, on realistic occupancy, with the furnishing capital counted.

## The part that is not financial

An annual tenancy is one signature and four cheques. A short let is a business: pricing, calendar, reviews, guest messages at midnight, a cleaner who did not show up. Paying an operator to absorb that is exactly what the twenty percent buys, which is why the comparison after paying an operator is the honest one for most owners.`,
    formula: `Long let, annual
  Net = rent
      - service charge
      - management (5-8% of rent)
      - maintenance reserve
      - vacancy allowance
      - insurance and fixed costs

Short let, annual
  Gross = nightly rate x nights actually sold
        (occupancy, not 365)

  Net   = gross
        - platform and management (typically 18-25% of gross)
        - cleaning x number of stays
        - utilities, cooling, internet, consumables
        - permit, tourism fees, licensing
        - service charge
        - maintenance and replacement, which runs higher
        - furnishing capital / years before refurbishment

Compare the two Net figures. Never the two Gross figures.`,
    failureModes: [
      "Occupancy is the assumption that decides the answer and it is the one most often taken from a best month rather than a full year. Model the soft season honestly or do not model at all.",
      "Furnishing is capital, not a cost of the first year. Spreading it over a realistic refurbishment cycle is what makes year one comparable to year five.",
      "Building rules and owners association rules can prohibit short letting entirely, and finding out after furnishing is an expensive way to learn it.",
      "Wear is higher and the reserve should be too. A unit turning over a hundred and eighty times a year does not age like one turning over once.",
      "It ignores the exit. A furnished short let unit is sold to a narrower pool of buyers than an empty apartment, and the furniture rarely returns what it cost.",
      "Regulatory treatment can change. A strategy whose margin depends on a current permit regime carries a risk that an annual tenancy does not.",
    ],
    whenToUse:
      "Before furnishing anything. Also before believing a projected short let yield produced by a company that earns a percentage of the gross rather than the net.",
    sources: [
      { name: "Dubai Department of Economy and Tourism, holiday homes", url: "https://www.dubaideted.gov.ae/en" },
      { name: "Dubai Land Department, Ejari and tenancy registration", url: "https://dubailand.gov.ae/en/eservices/" },
      { name: "Dubai Land Department, fees and charges", url: "https://dubailand.gov.ae/en/" },
    ],
  },

  {
    slug: "break-even-occupancy",
    title: "Break-even occupancy",
    category: "property",
    tier: 2,
    calculator: "net-rental-yield",
    reviewed: R,
    summary:
      "Break-even occupancy is the share of the year a property must be let for its income to cover every running cost and every mortgage payment, and it converts a yield into the single question that actually keeps owners awake: how empty can this get before I am funding it.",
    body: `Yield tells you what a property earns when everything goes right. Break-even occupancy tells you how much has to go wrong before it costs you money. The second is the more useful number and almost nobody calculates it.

## What it is

Take the annual fixed costs that do not stop when the tenant leaves: service charge, insurance, the mortgage, standing utility and administrative charges. Divide by the rent the property earns when fully let, after the costs that do scale with occupancy. The answer is the fraction of the year you must be occupied to break even.

A property with a break-even occupancy of forty percent is robust. One at eighty five percent is a coin flip with a mortgage attached.

## Why it is the number that matters

Vacancy is the risk that actually happens. Prices fall occasionally, tenants leave routinely. A unit that needs to be let eleven months in twelve to stand still has no room for a slow re-letting, a rent renegotiation, or a tenant who stops paying while an eviction runs its course.

It also exposes the real cost of leverage more honestly than a yield does. Adding a mortgage raises fixed costs, which raises break-even occupancy, which shortens the vacancy you can survive. Two owners with the same property and the same rent can have completely different exposures to the same empty month.

## Reading the answer

**Under fifty percent.** The property carries itself through a bad year. Typically an unleveraged unit with a modest service charge.

**Fifty to seventy percent.** Normal for a sensibly leveraged rental. A month or two of vacancy is absorbed by the margin.

**Seventy to eighty five percent.** Thin. A single difficult re-letting or a service charge increase moves you to funding it from elsewhere.

**Above eighty five percent.** The property is not an income asset. It is a leveraged bet on price with a rental subsidy attached, and it should be described that way when deciding whether to keep it.

## The version for a portfolio

Run it across everything you own together rather than unit by unit. Fixed costs from every property against total rent. That number tells you what a market-wide soft patch does to you, which is the case where several units go quiet at once rather than one.`,
    formula: `Break-even occupancy
  =        Fixed annual costs
    ------------------------------------
     Annual rent at full occupancy
     - costs that scale with occupancy

  Fixed costs
    service charge
    insurance and standing charges
    mortgage payments
    any cost you pay whether or not a tenant is present

  Scaling costs
    management fee (a share of collected rent)
    utilities where the owner pays them
    consumables

Worked
  Rent at full occupancy      105,000
  Management at 5%             -5,250
  Effective rent               99,750

  Service charge               16,200
  Insurance and standing        1,500
  Mortgage                     45,000
  Fixed costs                  62,700

  Break-even occupancy = 62,700 / 99,750 = 62.9%
  which is about 4.5 empty months before it costs you money`,
    failureModes: [
      "It assumes the rent stays where it is. A re-letting at a lower rent raises break-even occupancy even if the unit is never empty, which is the quieter version of the same risk.",
      "It treats a repayment mortgage instalment as pure cost, when part of it is capital repaid to yourself. Using interest only makes the ratio more flattering and arguably more honest, but pick one and be consistent.",
      "Service charges rise. A ratio calculated on this year's charge is a snapshot, and a special levy for a chiller replacement can move it several points in one letter.",
      "It says nothing about capital value. A property with excellent break-even occupancy in a falling market is still losing money, just not in cash.",
      "Portfolio level netting can hide a single bad asset. Run it both ways.",
      "It does not model the eviction timeline. A non-paying tenant is worse than an empty unit, because you have the costs and no ability to re-let until the process completes.",
    ],
    whenToUse:
      "Before borrowing, and once a year on everything you already own. It is also the right number to quote when someone asks whether a property is risky, because it answers with a month count rather than an adjective.",
    sources: [
      { name: "Dubai Land Department, RERA rental index", url: "https://dubailand.gov.ae/en/eservices/rental-index/" },
      { name: "Dubai Land Department, fees and charges", url: "https://dubailand.gov.ae/en/" },
    ],
  },

  {
    slug: "service-charge-and-reserves",
    title: "The service charge and the reserve fund",
    category: "property",
    tier: 2,
    calculator: "net-rental-yield",
    reviewed: R,
    summary:
      "A service charge pays for this year's running of a building while the reserve fund pays for the replacement of things that fail once a decade, and a building with a low charge and no reserve is not cheap to own, it is deferring a bill that will arrive as a special levy.",
    body: `Buyers compare service charges the way they compare rents: lower is better. That reasoning is exactly backwards often enough to be dangerous.

## The two halves

The **operating budget** is this year: cleaning, security, insurance, lift maintenance, chiller running costs, the managing agent's fee, landscaping, utilities for common areas. It is broadly predictable and it recurs.

The **reserve fund** is the sinking fund for capital items: lift replacement, chiller overhaul, facade works, waterproofing, fire systems. These fail on a fifteen to twenty five year cycle and cost an order of magnitude more than any annual item.

A responsible association collects for both. A charge that looks unusually low for the building type is often a charge that collects for the first and not the second.

## Why that matters to a buyer

If the reserve is underfunded when a chiller fails, the money has to come from somewhere, and there is only one somewhere: the owners, through a special levy. Levies are assessed on your unit's share and they are not optional.

The buyer who chose the building with the lower charge does not save money. They defer it, and they take on the risk that they will still own the unit on the day the bill arrives.

## What to actually read before buying

Ask the managing agent or the seller for three documents, all of which exist.

**The approved annual budget.** It shows what the charge covers, line by line, and what the association expects next year rather than what it charged last year.

**The reserve fund balance and the reserve study.** The balance alone means nothing without knowing what it is supposed to cover and when. A building ten years old with a negligible reserve is telling you something.

**The last two years of accounts, and any special levies raised.** A history of levies is the most reliable predictor of future levies, because it usually indicates a structural underfunding rather than bad luck.

## Reading the number itself

In Dubai the charge is quoted in dirhams per square foot per year and levied on the area on the title deed. Compare like with like: a tower with a pool, gym, concierge and district cooling infrastructure will and should cost more per foot than a low rise walk-up, and the comparison is only meaningful within a building type.

Note that this is the deduction that turns a seven percent gross yield into a four percent net one on a typical apartment. It is the single most consequential number in the [net rental yield](/playbooks/net-rental-yield/) calculation and the one least often verified before an offer.`,
    formula: `Annual service charge
  = area on the title deed (sq ft)
    x rate per sq ft per year

Where the rate should be going
  operating budget      recurring, predictable
  + reserve contribution  for items that fail once a decade
  = a charge that does not need a levy later

Warning signs
  charge well below comparable buildings of the same type
  reserve balance small relative to building age
  a history of special levies
  managing agent unable to produce an approved budget

The effect on yield
  A 900 sq ft unit at AED 18 / sq ft = AED 16,200 a year
  On rent of AED 105,000 that is 15.4% of gross rent,
  before management, maintenance, insurance or vacancy.`,
    failureModes: [
      "Comparing charges across building types. A serviced tower and a walk-up are not comparable per square foot and never were.",
      "Assuming the quoted rate is stable. It is set annually by the association and it moves, usually upward.",
      "Using the brochure area rather than the title deed area. The charge is levied on the deed area and the two are not always the same.",
      "Treating a fully funded reserve as a cost rather than an asset. You are buying a share of it, and it reduces the probability of a levy landing on you.",
      "Ignoring who controls the association. In buildings where the developer retains effective control, the budget may reflect their priorities rather than the owners'.",
      "Forgetting that the charge is payable whether or not the unit is let, which is why it belongs in the fixed cost line of a [break-even occupancy](/playbooks/break-even-occupancy/) calculation.",
    ],
    whenToUse:
      "Before making an offer on any apartment, and annually on anything you own, because the budget is published annually and almost no owner reads it.",
    sources: [
      { name: "Dubai Land Department, owners associations and jointly owned property", url: "https://dubailand.gov.ae/en/" },
      { name: "Dubai Land Department, service charge index", url: "https://dubailand.gov.ae/en/eservices/" },
    ],
  },

  {
    slug: "currency-risk-and-the-peg",
    title: "Currency risk and the dirham peg",
    category: "cross-asset",
    tier: 1,
    calculator: "safe-withdrawal-rate",
    reviewed: R,
    summary:
      "The dirham has been pegged to the US dollar at 3.6725 for decades, which means a Gulf resident holding dirham property, dirham salary and dollar denominated funds is not diversified across three currencies but concentrated in one, and the exposure only becomes visible when the money is eventually spent somewhere else.",
    body: `Currency is the risk that expatriate investors carry by default and almost never size, because it does not feel like a position. It feels like the ground.

## The peg, and what it actually does

The UAE dirham has been fixed against the US dollar at 3.6725 for many years. It is a hard peg, backed by reserves and by policy, and it has held through several cycles.

What it does for you is remove volatility between your dirham assets and the dollar. What it does not do is remove exposure. It converts your dirham holdings into dollar holdings with a fixed conversion rate. That is a simplification of your currency position, not a diversification of it.

## Where this bites

Consider a typical Gulf-based professional. Salary in dirhams. An apartment in Dubai, valued and let in dirhams. Savings in a global equity fund priced in dollars. Retirement expected in the UK, or India, or somewhere the currency is neither dirham nor dollar.

That person believes they hold three things. They hold one currency and a plan to spend a different one. If the dollar weakens materially against their eventual spending currency over the decades between now and then, everything they own falls in purchasing power at once, and no line in their portfolio will show a loss.

## The correct frame

Currency risk is a matching problem, not an investment problem. The question is not which currency will be strong. It is which currency you will spend, and how much of your assets are denominated in it.

If you intend to retire in the UK, sterling assets are not a speculation, they are a liability match. If your children will study in the United States, dollar assets are the match. If you will stay in the Gulf permanently, the peg is doing exactly what you want and there is very little to do.

The mistake is not holding the wrong currency. It is never having asked the question and discovering the answer at sixty.

## Sizing it without over-engineering

Three practical steps, in order.

**Name the spending currency.** For most people it is not one currency but a weighting: some here, some there, some undecided. Write down the weighting rather than a single answer.

**Look at what you actually hold.** Dirham property and a dollar pegged salary are one exposure. A global equity fund is more diversified than it looks in underlying assets but it is still priced in whatever currency you bought it in, and for the long run the underlying assets matter more than the pricing currency.

**Close the largest gap first, gradually.** This is a decades-long mismatch and it does not need to be fixed this quarter. It needs to stop widening.

## The tail risk nobody wants to discuss

A peg is a policy choice, not a law of nature. Pegs have held for decades and pegs have broken. The probability is low and the consequence would be large, which is the definition of a risk worth holding a modest hedge against rather than a risk worth betting on. Anyone who tells you it cannot happen is describing a preference, not an analysis.`,
    formula: `What you think you hold
  AED salary        currency 1
  AED property      currency 2
  USD funds         currency 3

What you actually hold
  AED and USD are the same exposure while the peg holds
  -> one currency, at 3.6725

The matching question
  Spending currency weighting, by decade
    next 10 years   AED   x%
    retirement      GBP / INR / other   y%
    education       USD   z%

  Asset denomination weighting
    compare the two lists

  The gap is the position you are carrying by default.

Peg reference
  AED per USD, fixed at 3.6725`,
    failureModes: [
      "It treats currency as a return question. Over long horizons currency is closer to a zero sum wash between developed economies, and the reason to hold a currency is that you will spend it, not that you expect it to rise.",
      "Hedged share classes solve a different problem. They remove short term volatility at a cost, and for a multi-decade horizon the cost frequently exceeds the benefit.",
      "It ignores that a global equity fund's underlying earnings are already spread across currencies regardless of the fund's own pricing currency, which makes the exposure smaller than it looks.",
      "Property cannot be rebalanced. Currency mismatch in an illiquid asset is a decision taken once, at purchase, and expensive to reverse.",
      "The peg has held for a long time, which is evidence but not a guarantee, and treating a long record as certainty is the same error made about every stable regime before it was not.",
      "Local mortgage debt in dirhams against a dirham asset is matched and should not be counted as an exposure. Debt in a currency you do not earn is the dangerous version.",
    ],
    whenToUse:
      "Once, properly, when you have both a portfolio and a rough idea where you will end up. Then at any point that answer changes, which for most expatriates is more often than they expect.",
    sources: [
      { name: "Central Bank of the UAE", url: "https://www.centralbank.ae/en/" },
      { name: "Bank for International Settlements, effective exchange rate statistics", url: "https://www.bis.org/statistics/eer.htm" },
      { name: "International Monetary Fund, exchange rate arrangements", url: "https://www.imf.org/en/Publications/Annual-Report-on-Exchange-Arrangements-and-Exchange-Restrictions" },
    ],
  },

  {
    slug: "fee-drag",
    title: "Fee drag",
    category: "portfolio",
    tier: 1,
    calculator: "safe-withdrawal-rate",
    reviewed: R,
    summary:
      "Fee drag is the compounding cost of every percentage charged against a portfolio each year, and because it is deducted from the base that would otherwise have compounded, a one percent annual fee costs far more than one percent of the final result.",
    body: `A fee is quoted as an annual percentage, which makes it sound like a small annual event. It is not. It is a permanent reduction in the base that everything afterwards compounds on.

## The arithmetic that surprises people

A portfolio compounding at seven percent for thirty years multiplies by roughly 7.6. The same portfolio compounding at six percent, because a one percent fee was deducted, multiplies by roughly 5.7.

The fee was one percent a year. It took about a quarter of the final result.

Extend to forty years and the gap widens again, because the missing money would itself have been compounding for the whole period. This is the same asymmetry as [drawdown recovery](/playbooks/drawdown-recovery-math/), running slowly instead of suddenly.

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

Not what is the fee, but what is the total, and what does it buy. Add every layer, express it as one number, and then ask what that number would have compounded to over your remaining horizon. That is the real price, and it is the only version of the question that produces a decision.`,
    formula: `Value after n years
  = Contribution x (1 + r - f)^n

  where r is the gross return and f is the total annual fee.

Worked, 30 years at 7% gross
  no fee     (1.07)^30  = 7.61x
  1% fee     (1.06)^30  = 5.74x
  2% fee     (1.05)^30  = 4.32x
  3% fee     (1.04)^30  = 3.24x

  One percent costs about 25% of the result.
  Three percent costs about 57% of it.

Total cost of ownership
  fund expense ratio
  + platform or custody
  + advice or management
  + product or wrapper charges
  = the number that belongs in the formula`,
    failureModes: [
      "It assumes a constant gross return, which nothing delivers. The direction of the conclusion is robust to that, but the precise multiples are illustrative rather than predictive.",
      "It says nothing about what the fee buys. A fee that prevents one catastrophic behavioural error over a lifetime may be the cheapest thing in the portfolio.",
      "Tracking difference, not the expense ratio, is what a fund actually cost you. A cheaper fund with a worse tracking difference is not cheaper.",
      "Exit costs are not annual and do not fit this arithmetic, but early exit penalties on wrapped products can exceed several years of fees and belong in any decision to move.",
      "Comparing fees across jurisdictions without comparing tax treatment is comparing the smaller number and ignoring the larger one.",
      "The lowest fee portfolio you will not stick with is worse than a slightly costlier one you will.",
    ],
    whenToUse:
      "Before signing anything with a multi-year commitment, and once against everything you currently hold, adding every layer into a single number. Most people have never seen that single number.",
    sources: [
      { name: "Morningstar, Mind the Gap 2025", url: "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf" },
      { name: "US Securities and Exchange Commission, investor bulletin on fees", url: "https://www.sec.gov/investor/alerts/ib_fees_expenses.pdf" },
    ],
  },

  {
    slug: "emergency-liquidity",
    title: "Emergency liquidity",
    category: "risk",
    tier: 1,
    calculator: "safe-withdrawal-rate",
    reviewed: R,
    summary:
      "Emergency liquidity is cash held deliberately so that a job loss, a vacancy or a levy never forces the sale of an illiquid asset at the wrong moment, and for a property owner in an expatriate market it needs to be larger than the standard advice because the two risks arrive together.",
    body: `The usual rule is three to six months of expenses. That rule was written for a salaried employee in their own country with a pension, unemployment insurance and no mortgage on an investment property. Almost nothing about it survives contact with an expatriate property owner's situation.

## Why the standard number is too small here

**Visa linkage.** In much of the Gulf, residency is tied to employment. Losing a job does not only stop income, it starts a clock on the right to remain, which can turn a slow orderly job search into a fast disorderly one.

**No safety net.** There is generally no unemployment benefit to bridge the gap.

**Correlated risks.** A regional downturn produces redundancies and soft rental demand at the same time. The month your salary stops is disproportionately likely to be a month your tenant leaves.

**Illiquid assets that demand cash.** A property is the one asset that can require money from you while producing none. Service charges, mortgage payments and the occasional special levy do not pause for a vacancy.

**Exit costs on the asset you would sell.** Selling property to raise cash costs eight to ten percent of value and takes months, which is precisely why you do not want to be doing it under pressure.

## What to actually hold

Think in three layers rather than one number.

**Layer one, immediate.** Three to six months of household expenses in instant access cash, in the currency you spend. This is for the boiler, the flight, the deposit.

**Layer two, property reserve.** Twelve months of every fixed cost on every property you own: service charges, mortgage payments, insurance. This is what makes a long vacancy a nuisance rather than a crisis, and it is what the [break-even occupancy](/playbooks/break-even-occupancy/) figure tells you the size of.

**Layer three, transition.** For anyone whose residency depends on employment, enough to relocate a household and land somewhere else. That is a larger number than people expect and it is the one nobody holds.

## The objection, answered

Holding cash feels expensive when markets are rising, and the argument against it is always that it earns less than the alternatives. That is true and it is not the point. Emergency liquidity is not an investment, it is what stops your investments being sold at the worst possible time. Its return is measured in the losses it prevents rather than the yield it earns.

The counter-question is the useful one: what would you sell if you needed money in a hurry, and what would that sale cost you against selling calmly? If the answer is a property in a soft market, the cash is cheap.

## Where to keep it

In the currency you actually spend, accessible without penalty, and not in the same institution as your mortgage if that institution has any right of set-off. Money market funds and short term deposits are fine. Anything with a lock-up, a notice period or a market price is not emergency liquidity, whatever it is called.`,
    formula: `Layer 1, immediate
  = 3 to 6 months of household expenses
    instant access, spending currency

Layer 2, property reserve
  = 12 x monthly fixed costs across all properties
      service charges
    + mortgage payments
    + insurance and standing charges

Layer 3, transition (where residency is tied to employment)
  = relocation cost + 3 to 6 months of living costs
    in the destination currency

Sanity check against the alternative
  cost of raising the same cash by selling a property
    = 8-10% of value in round trip costs
    + months of delay
    + whatever discount a forced sale attracts`,
    failureModes: [
      "It is dead money in a rising market and it will feel wrong for years at a time. That is the cost of the option, and the option is only valuable in the years it feels unnecessary.",
      "Holding it in the wrong currency reintroduces the risk it was meant to remove. Emergency cash should match emergency spending.",
      "An undrawn credit facility is not the same thing. Facilities are withdrawn precisely when conditions deteriorate, which is when you would need it.",
      "Too large a reserve has a real cost over decades and can meaningfully reduce the final result. This is a floor, not a target to exceed.",
      "It cannot be held inside a product with exit penalties or a notice period, however good the rate looks.",
      "It does not replace insurance. Health, income protection and life cover address different failures and a cash pile is an inefficient substitute for any of them.",
    ],
    whenToUse:
      "Before the next property, not after it. The reserve should be funded from the same pot as the deposit and treated as part of the cost of the purchase rather than as a separate ambition.",
    sources: [
      { name: "Central Bank of the UAE, consumer protection", url: "https://www.centralbank.ae/en/" },
      { name: "Dubai Land Department, fees and charges", url: "https://dubailand.gov.ae/en/" },
    ],
  },

  {
    slug: "concentration-limits",
    title: "Concentration limits",
    category: "risk",
    tier: 2,
    calculator: "safe-withdrawal-rate",
    reviewed: R,
    summary:
      "A concentration limit is a rule set in advance about how much of your net worth any single asset, building, tenant, employer or currency may represent, and its purpose is to make the decision while you are calm rather than while you are being persuaded.",
    body: `Nobody sets out to be concentrated. Concentration is what happens when a series of individually reasonable decisions accumulate in the same direction.

## How it happens

An investor buys an apartment in a building they know. It goes well. They buy a second in the same development, because they now understand the building, the agent and the service charge. The third comes from the same developer because the relationship exists.

Every step was defensible. The result is a portfolio exposed to one developer, one owners association, one micro-market and one chiller plant.

Add that their salary comes from a company in the same city and their savings sit in a currency pegged to the same dollar, and the entire balance sheet needs one set of conditions to hold.

## The exposures worth limiting

**Single asset.** What share of net worth is in one property. For most people the honest answer, including the home, is uncomfortably high.

**Single building or development.** Two units in one tower share a service charge regime, a reserve fund, a handover glut and a reputation.

**Single tenant.** Especially for anyone letting to one corporate tenant, where a lease ending and a vacancy are the same event.

**Single employer.** Salary, and in the Gulf frequently residency, and sometimes shares or a bonus scheme. One employer can be three exposures.

**Single currency.** Covered in [currency risk and the peg](/playbooks/currency-risk-and-the-peg/), and worth counting here as a line rather than assuming it is handled elsewhere.

**Single counterparty.** One bank, one broker, one platform.

## Setting a limit that survives

The limit has to be written down before the opportunity appears, because the whole point is that the good opportunity is exactly when you will want to breach it.

Pick numbers you can live with rather than numbers that sound rigorous. Something like: no single property above a stated share of net worth, no more than two units in any one building, no more than a stated share of liquid assets with one institution. The precise figures matter far less than having them at all.

Then write down what you will do when a limit binds, because it will. The useful answer is rarely sell something. It is more often stop adding, and let the rest of the balance sheet grow into the gap.

## The awkward truth

Most wealth is built through concentration and most wealth is lost the same way. A concentration limit does not maximise expected outcomes, and someone who never set one will always be able to point at somebody who did better without one.

It is insurance against the version of events where the concentrated bet does not work, chosen deliberately, priced in foregone upside. That is a trade worth making consciously, and a trade almost nobody makes by accident.`,
    formula: `Write these down before you need them.

  Single property          <= x% of net worth
  Single building          <= n units
  Single tenant            <= x% of total rent
  Single employer          salary + equity + residency
                           counted as one exposure
  Single currency          <= x% of assets, matched to
                           expected spending
  Single institution       <= x% of liquid assets

When a limit binds
  first response   stop adding
  second response  grow the rest into the gap
  last response    sell, because selling illiquid assets
                   costs 8-10% and takes months

The test
  If one bad event happened, what share of the balance
  sheet does it touch? That is the real limit, whatever
  the spreadsheet says.`,
    failureModes: [
      "Limits set as percentages of net worth move as net worth moves, which means a falling market can breach a limit without any decision being taken. Decide in advance whether the limit is checked on the way down as well as up.",
      "It reduces expected return. Concentration is how most large fortunes were made, and a limit is a deliberate trade of upside for survivability.",
      "The primary residence distorts every ratio and there is no consensus on whether to include it. Pick a treatment and stay with it rather than switching to whichever answer is more comfortable.",
      "Illiquid assets cannot be trimmed to a limit. For property the only enforceable version is a limit on what you add, which means the limit has to exist before the purchase.",
      "Counting exposures separately hides the correlation between them. Salary, residency and local property are one exposure wearing three coats.",
      "A limit you will breach for a good enough opportunity is not a limit. It is a preference, and it will not be there on the day it is needed.",
    ],
    whenToUse:
      "Before the second property in the same building, which is where most concentration begins. Also as a standing annual review, because concentration accumulates without any single decision creating it.",
    sources: [
      { name: "Bank for International Settlements, property price statistics", url: "https://www.bis.org/statistics/pp.htm" },
      { name: "Dubai Land Department, transaction data", url: "https://dubailand.gov.ae/en/open-data/real-estate-data/" },
    ],
  },
  /* ==================== BATCH THREE ==================== */
  {
    slug: "price-per-square-foot",
    title: "Price per square foot",
    category: "valuation",
    tier: 1,
    calculator: "net-rental-yield",
    reviewed: R,
    summary:
      "Price per square foot is the purchase price divided by the area on the title deed, and it is the only way to compare two different properties honestly, provided the comparison is made against genuine recent transactions in the same building rather than against asking prices across a district.",
    body: `Every property is unique, which is the argument used to avoid comparison and the reason comparison matters. Price per square foot is how it is done.

## The calculation, and the number that goes in it

Purchase price divided by area. The area is the one on the [title deed](/glossary/title-deed/), not the one in the brochure, and the two are not always the same. Brochure areas sometimes include balconies, terraces or a share of common space in ways the deed does not.

Use the deed. It is the area the service charge is levied on, so consistency there also keeps the [net yield](/playbooks/net-rental-yield/) honest.

## What to compare against

The hierarchy runs from most useful to least, and most buyers work it backwards.

**Recent transactions in the same building.** The gold standard. Same service charge, same association, same view corridors, same everything except floor and layout. Dubai publishes transaction data, so this is checkable rather than a matter of opinion.

**Recent transactions in comparable buildings in the same community.** Good, with adjustments for age, amenity and finish.

**Asking prices in the same building.** Weak. An asking price is a hypothesis, and in a soft market the gap between asking and achieved widens exactly when you most need the number to be right.

**District averages in a portal or a market report.** Nearly useless for a specific unit. A district average blends studios and penthouses, towers and villas, new and fifteen years old.

## The adjustments that actually matter

Floor level, within reason. View, which can be worth a great deal and can be lost when the plot opposite is developed. Layout efficiency, because two units of identical area can have very different usable space. Age and condition. Whether the sale was at arm's length, since a transfer between related parties tells you nothing about market value.

Also adjust for what is included. A furnished unit and an empty one at the same price per foot are not the same deal, and the furniture is worth far less to you than it cost the seller.

## Where it stops being useful

Price per square foot values the box. It does not value the income. Two units at the same price per foot with different service charges and different achievable rents have different [net yields](/playbooks/net-rental-yield/), and the yield is what you are buying if you are buying a rental.

Run both. Price per foot tells you whether you are paying a fair price for the asset. Net yield tells you whether the asset is worth owning.`,
    formula: `Price per square foot
  = purchase price / area on the title deed

Comparison hierarchy, best first
  1. achieved prices, same building, last 6-12 months
  2. achieved prices, comparable buildings, same community
  3. asking prices, same building        (weak)
  4. district averages in a market report (near useless)

Adjustments
  + higher floor, better view, efficient layout
  + recent renovation
  - age, poor layout, obstructed view
  - furnished (worth less to you than it cost the seller)
  x  ignore non arm's length transfers entirely

Then, separately
  net yield = what the income is worth
  price per foot = what the box is worth
  Both, every time.`,
    failureModes: [
      "Brochure area and title deed area can differ, and using the larger one makes an expensive property look reasonable while also understating the service charge per foot.",
      "Asking prices are not transactions. In a soft market the gap between asking and achieved is widest precisely when the number matters most.",
      "District averages blend property types that have nothing to do with each other, which is why they are quoted in marketing and rarely in valuations.",
      "It ignores income entirely. A fairly priced box with a poor yield is still a poor rental investment.",
      "Off-plan prices per foot include an expectation about the future, so comparing them against completed units compares two different things.",
      "One transaction is not a market. Three or four comparable sales are the minimum before the number means anything.",
    ],
    whenToUse:
      "Before every offer, and again before every listing when selling. It is also the fastest way to sanity check a price presented as a special opportunity.",
    sources: [
      { name: "Dubai Land Department, real estate transaction data", url: "https://dubailand.gov.ae/en/open-data/real-estate-data/" },
      { name: "Dubai Pulse, DLD transactions open dataset", url: "https://www.dubaipulse.gov.ae/data/dld-transactions/dld_transactions-open" },
      { name: "Dubai Land Department, eServices", url: "https://dubailand.gov.ae/en/eservices/" },
    ],
  },

  {
    slug: "discounted-cash-flow",
    title: "Discounted cash flow",
    category: "valuation",
    tier: 1,
    calculator: "off-plan-irr",
    reviewed: R,
    summary:
      "Discounted cash flow values an asset by converting every future payment it produces into what that payment is worth today, using a discount rate that reflects what the money could otherwise earn, which makes it the only honest way to compare investments whose cash arrives at different times.",
    body: `Every argument about payment plans, off-plan pricing and rent versus buy is an argument about timing. Discounted cash flow is the tool that settles them, and it rests on one idea.

## The idea

A dirham you receive in three years is worth less than a dirham today, because today's dirham can be earning in the meantime. How much less depends on what it could earn, which is the discount rate.

At a five percent discount rate, a dirham in three years is worth about 86 fils today. At ten percent, about 75 fils. The further out the payment and the higher the rate, the less it is worth now.

## Why it matters here

An off-plan [payment plan](/glossary/payment-plan/) is a series of dated payments. Two plans with the same headline total are not the same price, and the difference is exactly what discounting reveals. A post handover plan defers money into a period where you could be earning rent, so it is worth real value against a front loaded one.

The same machinery answers [rent versus buy](/playbooks/rent-vs-buy/): both are streams of payments over time, and comparing them any other way produces the wrong answer.

## Choosing the discount rate

This is where the judgement sits and where most analyses quietly cheat.

The rate should reflect what the money would otherwise earn at comparable risk. For a cash buyer that might be the [real yield](/glossary/real-yield/) plus a risk premium. For a leveraged buyer the mortgage rate is a reasonable floor, because money not spent on the property could repay debt.

A rate that is too low makes distant payments look nearly as valuable as immediate ones, which flatters long payment plans. A rate that is too high does the opposite. The discipline is to pick the rate before running the numbers, not after seeing which answer you preferred.

## Net present value and IRR

Two outputs come from the same set of cash flows.

**Net present value** discounts every flow at your chosen rate and sums them. Positive means the investment beats that rate. Negative means it does not.

**[Internal rate of return](/glossary/internal-rate-of-return/)** finds the rate at which net present value equals zero. It is the rate the investment itself earns, and it can be compared against your alternatives directly.

NPV answers is this worth doing at my hurdle. IRR answers what does this actually earn. Both come from the same table, and the table is the work.

## The honest warning

A discounted cash flow model is an opinion dressed as arithmetic. The arithmetic is exact and the inputs are guesses: future rent, future service charges, the exit price, the discount rate. Changing the exit price assumption by ten percent can change the answer completely.

That is not an argument against the method. It is an argument for running the model three times, at pessimistic, expected and optimistic assumptions, and making the decision on the range rather than on the single number that came out first.`,
    formula: `Present value of one future amount
  PV = FV / (1 + r)^n

  r = discount rate per period
  n = number of periods

Net present value of a series
  NPV = sum of  CF(t) / (1 + r)^t   for every t

  Positive NPV  ->  beats your hurdle rate
  Negative NPV  ->  does not

Internal rate of return
  the value of r at which NPV = 0

Discount factors, for intuition
  r = 5%    1 year 0.952   3 years 0.864   5 years 0.784
  r = 8%    1 year 0.926   3 years 0.794   5 years 0.681
  r = 12%   1 year 0.893   3 years 0.712   5 years 0.567

Always run it three times
  pessimistic / expected / optimistic
  and decide on the range`,
    failureModes: [
      "The discount rate is chosen by the person who wants a particular answer more often than anyone admits. Pick it first, write it down, and do not revise it because the output displeased you.",
      "Terminal value, the assumed sale price at the end, frequently dominates the result. If most of the value sits in a number you guessed about year ten, the model is a forecast wearing a spreadsheet.",
      "It assumes cash flows arrive as scheduled. Delay is the norm in construction and the model should be run with the delay case as standard rather than as an afterthought.",
      "IRR misbehaves when cash flows change sign more than once, producing multiple mathematically valid answers. Where that happens, use NPV instead.",
      "Comparing IRRs across very different time periods ranks them wrongly. A high IRR over eight months and a lower one over ten years are not directly comparable.",
      "Precision in the output implies confidence the inputs do not support. Two significant figures is usually more honest than four.",
    ],
    whenToUse:
      "Whenever money moves at more than one point in time, which covers payment plans, rent versus buy, refinancing decisions and any comparison between an income asset and a growth one.",
    sources: [
      { name: "Aswath Damodaran, NYU Stern, valuation resources", url: "https://pages.stern.nyu.edu/~adamodar/" },
      { name: "Dubai Land Department, real estate transaction data", url: "https://dubailand.gov.ae/en/open-data/real-estate-data/" },
    ],
  },

  {
    slug: "rent-increase-caps",
    title: "Rent increase caps and the rental index",
    category: "property",
    tier: 1,
    calculator: "net-rental-yield",
    reviewed: R,
    summary:
      "Dubai caps how much a landlord may raise rent on renewal according to how far the current rent sits below the RERA rental index, rising in steps from no increase at all up to a maximum of twenty percent, which means a landlord's yield improvement is limited by law rather than by negotiation.",
    body: `This is the rule that decides whether an underlet property can be repriced, and it is misunderstood by landlords and tenants in roughly equal measure.

## How the cap works

Under Decree No. 43 of 2013, the permitted increase depends on how far the existing rent sits below the average market rent for comparable units, as determined by the RERA rental index.

- Within ten percent of the index: **no increase permitted**
- Eleven to twenty percent below: **up to five percent**
- Twenty one to thirty percent below: **up to ten percent**
- Thirty one to forty percent below: **up to fifteen percent**
- More than forty percent below: **up to twenty percent**

The index is the authority, not the landlord's opinion of market rent and not the agent's. The Land Department publishes a calculator that returns the permitted figure for a specific unit.

## What this means if you are buying

A property let well below market is not the bargain it appears. You cannot simply reprice it to market on renewal. If the sitting rent is thirty five percent below the index you may raise it fifteen percent, which still leaves it below market, and you repeat the exercise the following year.

That has three consequences for the arithmetic. The yield you can achieve in year one is the passing rent, not the market rent. The path to market rent takes years, not one renewal. And the [break-even occupancy](/playbooks/break-even-occupancy/) calculation should use the rent you are legally able to charge, not the one in the sales pitch.

Buying a vacant unit avoids the problem entirely, which is part of why vacant possession commands a premium.

## Notice, which is where landlords lose

A rent increase requires ninety days written notice before the tenancy expires unless the contract specifies otherwise. Miss it and the tenancy renews on the existing terms.

Separately, ending a tenancy for reasons other than tenant breach, including sale or personal use, requires twelve months notice served through notary or registered mail. A message on a phone is not service.

These are the provisions that most often decide disputes, and they are procedural rather than substantive: a landlord with a perfectly good case loses it by serving notice incorrectly.

## The tenant's side of the same rule

The cap is symmetrical in usefulness. A tenant facing an increase can check the index themselves and decline anything above the permitted figure. The Rental Dispute Centre exists for the disagreement that follows.`,
    formula: `Permitted increase on renewal, Decree 43 of 2013

  Current rent vs RERA index average
    within 10% of index        no increase
    11% to 20% below           up to  5%
    21% to 30% below           up to 10%
    31% to 40% below           up to 15%
    more than 40% below        up to 20%

Notice
  rent increase        90 days written notice before expiry
  ending a tenancy     12 months notice, notary or
                       registered mail, for reasons other
                       than tenant breach

The buyer's arithmetic
  Year 1 yield uses the passing rent, not market rent.
  Closing a 35% gap at 15% a year takes several renewals.
  Vacant possession removes the constraint, and is priced
  accordingly.`,
    failureModes: [
      "The index moves. A gap calculated against last year's index is not the gap that applies at the next renewal, and the calculator should be run fresh each time.",
      "The tiers apply to the permitted maximum, not to an automatic entitlement. A landlord may still agree less, and in a soft market frequently should.",
      "Notice served incorrectly defeats an otherwise valid increase. Procedure decides more disputes here than substance does.",
      "It applies to renewal of an existing tenancy. A new tenancy with a new tenant is a different transaction, which is why vacant possession is worth paying for.",
      "Rules and tiers are set by decree and can be amended, so a framework page is a starting point rather than a current legal position.",
      "This is general information and not legal advice. A live dispute belongs with the Rental Dispute Centre or a lawyer, not with a calculator.",
    ],
    whenToUse:
      "Before buying any tenanted property, because the achievable rent is a legal question before it is a market one. Also every year before serving or receiving a renewal notice.",
    sources: [
      { name: "Dubai Land Department, RERA rental index and calculator", url: "https://dubailand.gov.ae/en/eservices/rental-index/" },
      { name: "Dubai Land Department, Rental Dispute Settlement Centre", url: "https://dubailand.gov.ae/en/" },
      { name: "Decree 43 of 2013, rent increase tiers, summary", url: "https://roi.altamimirealestate.com/blog/rera-rent-increase-calculator-dubai" },
    ],
  },

  {
    slug: "asset-allocation-by-horizon",
    title: "Allocation by horizon",
    category: "portfolio",
    tier: 1,
    calculator: "safe-withdrawal-rate",
    reviewed: R,
    summary:
      "Allocation by horizon assigns each pot of money an asset mix based on when it will be spent rather than on the owner's appetite for risk, because a deposit needed in eighteen months and a retirement fund needed in twenty five years are different problems that a single risk profile cannot answer.",
    body: `The standard approach asks how much risk you can tolerate and produces one allocation for everything you own. That question has the wrong subject. Risk tolerance is a feeling. The date the money is needed is a fact.

## The frame

Split what you own by when it will be spent, and allocate each bucket to that horizon.

**Under two years.** School fees, a deposit, a planned relocation. Cash and short dated instruments. No equities, whatever the outlook, because the recovery time from a bad year exceeds the horizon.

**Two to five years.** Short and medium duration bonds, some equity if the date is soft. A [drawdown](/glossary/drawdown/) here is survivable but not comfortable.

**Five to fifteen years.** A balanced mix. Long enough that equity volatility is a feature rather than a threat, short enough that a bad final year still matters.

**Fifteen years and beyond.** Predominantly equity. Over that span the risk of holding equities is lower than the risk of not holding them, because inflation compounds against cash relentlessly and quietly.

## Why this beats a single risk profile

It removes the two failure modes that actually destroy outcomes.

The first is having money you need next year invested in something that can fall forty percent. No risk questionnaire prevents this, because the questionnaire asks how you feel rather than when you need it.

The second is having a thirty year horizon invested in cash because a questionnaire once described you as cautious. That is not caution, it is a guaranteed real loss, and it is the more common error among conservative savers.

## Where property fits

Property is a fifteen year plus asset by construction. The [transaction cost drag](/playbooks/transaction-cost-drag/) alone requires years to absorb, and it cannot be sold in part or in a hurry.

Which means property should be funded from the long bucket, and buying it should never drain the short one. A purchase that consumes the emergency reserve has moved money from the two year bucket into the fifteen year one, and the [emergency liquidity](/playbooks/emergency-liquidity/) framework explains why that ends badly.

## The part people skip

Write down the actual dates. Not "retirement", a year. Not "the children's education", the year the first one starts. Most people discover when they do this that their horizons are shorter and more clustered than they assumed, and that changes the allocation before any market view does.`,
    formula: `Bucket by date, then allocate.

  Under 2 years      cash, short deposits
                     0% equity, no exceptions

  2 to 5 years       short and medium bonds
                     0-30% equity depending on how firm
                     the date is

  5 to 15 years      balanced
                     40-70% equity

  15 years plus      predominantly equity
                     70-100%

  Property           funded only from the 15 year bucket

Then check
  Does the sum of the short buckets cover everything
  I know I must pay in the next 24 months?
  If not, the allocation is wrong regardless of what
  the risk questionnaire said.`,
    failureModes: [
      "Horizons move. Redundancy, illness or a change of country can turn a fifteen year bucket into a two year one overnight, which is the argument for holding the short bucket larger than feels necessary.",
      "The bands are conventions rather than science. The principle, that time until spending drives the mix, is robust; the exact percentages are not.",
      "It says nothing about currency. A long bucket allocated correctly but denominated in the wrong currency is still mismatched, which the peg framework covers.",
      "Illiquid assets cannot be re-bucketed later, so the horizon judgement has to be made before purchase rather than reviewed afterwards.",
      "A single very large expense inside a long horizon can dominate it. Model the specific liability rather than assuming the average.",
      "It can encourage over-engineering. Three buckets that exist are worth more than seven that are conceptually neater and never maintained.",
    ],
    whenToUse:
      "Before choosing any allocation, and again whenever a date changes. It is also the fastest way to diagnose a portfolio that feels wrong without knowing why.",
    sources: [
      { name: "Morningstar, Mind the Gap 2025", url: "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf" },
      { name: "Federal Reserve Bank of St. Louis, real yields and inflation series", url: "https://fred.stlouisfed.org/series/DFII10" },
    ],
  },

  {
    slug: "rebalancing-bands",
    title: "Rebalancing bands",
    category: "portfolio",
    tier: 2,
    calculator: "safe-withdrawal-rate",
    reviewed: R,
    summary:
      "A rebalancing band is a rule that triggers a trade only when a holding drifts beyond a set distance from its target weight, which keeps a portfolio close to its intended allocation while trading far less often than a calendar schedule would.",
    body: `Left alone, a portfolio becomes whatever performed best. That is not a strategy, it is drift, and by the time it is obvious the concentration is already large.

## Two ways to rebalance

**By calendar.** Check on a fixed date, annually or quarterly, and restore the targets. Simple, and it trades whether or not anything has moved.

**By band.** Set a tolerance around each target and act only when a holding crosses it. A common formulation is the five and twenty five rule: act when a holding is five percentage points from its target in absolute terms, or twenty five percent away in relative terms, whichever is smaller.

For a sixty percent target, the absolute band triggers at fifty five or sixty five. For a four percent target, five points would be meaningless, so the relative band triggers at three or five percent. The rule adapts to position size, which is why it works across a whole portfolio rather than only the large holdings.

## Why bands usually win

They trade less. Fewer trades means lower costs and, in taxable jurisdictions, fewer realised gains. For an investor in the UAE the tax argument is weaker, but the cost and the behavioural argument remain.

They also act when it matters. A calendar rebalance in a quiet year does nothing useful. A band triggers precisely when something has moved a long way, which is when the portfolio has genuinely changed shape.

## What rebalancing is actually for

Not returns. The evidence that rebalancing improves returns is thin and depends heavily on the period examined. It controls risk.

An unrebalanced portfolio does not stay where you put it. A sixty forty portfolio left through a long equity bull market becomes eighty twenty, which is a different portfolio with a different [drawdown](/playbooks/drawdown-recovery-math/) profile, adopted by nobody.

The discomfort is the point. Rebalancing means selling what has done well and buying what has not, which is the opposite of what the [behaviour gap](/playbooks/the-behaviour-gap/) says investors actually do. That is precisely why it should be a rule rather than a judgement.

## Making it work

Write the bands down with the allocation. Check quarterly, act only when a band is breached. Where new money is going in, direct it at the underweight holding first, because that rebalances without selling anything.

And distinguish drift from a decision. If the allocation itself no longer suits your horizon, change the target deliberately. Do not let the market change it for you and then justify it afterwards.`,
    formula: `The 5/25 rule

  Trigger a rebalance when a holding is
    5 percentage points from target, absolute
    or
    25 percent from target, relative
  whichever is the smaller move.

Worked
  Target 60%   absolute band  55% to 65%
               relative band  45% to 75%
               -> absolute binds, act at 55 or 65

  Target 10%   absolute band   5% to 15%
               relative band  7.5% to 12.5%
               -> relative binds, act at 7.5 or 12.5

  Target 4%    relative band   3% to 5%

Cheapest first
  1. direct new contributions to the underweight
  2. direct income and dividends to the underweight
  3. only then sell the overweight`,
    failureModes: [
      "It does not reliably raise returns and any framework that sells it that way is overclaiming. Its job is holding the risk profile you chose.",
      "In a long trend, rebalancing repeatedly sells the winner and will underperform doing nothing, sometimes for years. The discipline has to survive that.",
      "Bands on very small holdings generate noise. Below a couple of percent of the portfolio, a position is usually not worth the maintenance.",
      "Illiquid assets cannot be banded at all. Property sits outside the mechanism and has to be handled by controlling what you add.",
      "Rebalancing across accounts and jurisdictions can have tax consequences that outweigh the benefit, which changes the calculation for anyone not in a zero tax jurisdiction.",
      "It assumes the target allocation was right. Rebalancing precisely to a badly chosen allocation is discipline pointed at the wrong object.",
    ],
    whenToUse:
      "Set the bands the day the allocation is set, not later. Check quarterly, act rarely, and never rebalance because of a market view.",
    sources: [
      { name: "A Wealth of Common Sense, Larry Swedroe's 5/25 rebalancing rule", url: "https://awealthofcommonsense.com/2014/03/larry-swedroe-525-rebalancing-rule/" },
      { name: "Morningstar, Mind the Gap 2025", url: "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf" },
    ],
  },

  {
    slug: "inflation-and-real-returns",
    title: "Inflation and real returns",
    category: "cross-asset",
    tier: 1,
    calculator: "safe-withdrawal-rate",
    reviewed: R,
    summary:
      "A real return is what is left after inflation, and because inflation compounds silently against every asset at once, a portfolio that looks like it is growing in currency terms can be losing purchasing power for years without a single statement showing a loss.",
    body: `Every return quoted anywhere is a nominal return unless it says otherwise. Nominal returns are what the statement shows. Real returns are what you can buy.

## The arithmetic

Real return is roughly the nominal return minus inflation. Precisely, it is (1 + nominal) divided by (1 + inflation), minus one, which matters at higher rates.

Five percent nominal with three percent inflation is about 1.9 percent real. Three percent nominal with three percent inflation is zero. Two percent in a deposit account with four percent inflation is a two percent annual loss, and it will appear on every statement as a gain.

## Why this is the most important number nobody uses

Over a working life the difference compounds enormously. Thirty years at five percent nominal multiplies by 4.3. Thirty years at 1.9 percent real multiplies by 1.76. Both describe the same portfolio. Only the second describes what it will buy.

Cash is the clearest case. Cash has never lost nominal value and has lost purchasing power in most decades. A saver who avoids all volatility has not avoided risk, they have chosen a certain slow loss over an uncertain outcome with a positive expectation. That is a choice, but it should be a conscious one.

## Reading it in the market

The market prices this daily and publishes the answer. The [real yield](/glossary/real-yield/) on an inflation protected government bond is the observable real return on the safest asset available. [Breakeven inflation](/glossary/breakeven-inflation/), the gap between the nominal and real yields at the same maturity, is what the market expects inflation to be.

Those two numbers give you a hurdle. If the ten year real yield is 2.38 percent, that is what a government will pay you, after inflation, for taking no credit risk. Any asset you own instead of that has to beat it, after its own costs, or it is not earning its place.

## What actually protects purchasing power

**Inflation linked bonds** do it by construction, which is why their yield is the definition of a real return.

**Property** does it imperfectly. Rents tend to follow inflation over long periods, though in Dubai the [rent increase caps](/playbooks/rent-increase-caps/) put a legal ceiling on how fast that adjustment happens. Service charges, meanwhile, inflate without a cap.

**Equities** do it well over long horizons and badly over short ones, because companies can raise prices but margins compress before they do.

**Cash** does not, ever, except briefly when rates exceed inflation.

## The practical instruction

Quote every long term plan in real terms. A retirement number, a school fee projection, a target portfolio value: state it in today's money and inflate the contributions, or state it in future money and be honest that the figure is inflated. Mixing the two is how plans that look adequate turn out not to be.`,
    formula: `Real return
  exact       (1 + nominal) / (1 + inflation) - 1
  approximate  nominal - inflation

  5% nominal, 3% inflation  ->  1.94% real
  3% nominal, 3% inflation  ->  0% real
  2% nominal, 4% inflation  ->  -1.92% real

Compounding the difference over 30 years
  5.0% nominal   x 4.32
  1.9% real      x 1.76
  Same portfolio. Different question.

The market's own numbers
  real yield         = return after inflation on an
                       inflation protected government bond
  breakeven          = nominal yield - real yield
                     = the inflation the market expects

  Anything you own instead of that bond has to beat
  the real yield, after costs, to earn its place.`,
    failureModes: [
      "Headline inflation is not your inflation. School fees, rent and healthcare have run well above general indices for long stretches, and those are the categories that dominate an expatriate family's spending.",
      "It assumes a single inflation rate applies to you, when your spending is split across countries and currencies with different rates.",
      "Inflation protected bonds carry duration risk. They protect purchasing power at maturity, not the price along the way.",
      "The property inflation hedge is weaker than usually claimed, because rent adjustment is lagged, capped by regulation in some markets, and costs inflate alongside income.",
      "Comparing a real return against a nominal target, or the reverse, produces an error the size of the inflation rate, and it happens constantly in retirement planning.",
      "Past inflation is a poor guide to future inflation, which is why the market's breakeven rate is more useful than a historical average.",
    ],
    whenToUse:
      "Every time a return, a target or a projection is stated. The first question about any number in a financial plan should be whether it is nominal or real, and most of the time nobody has asked.",
    sources: [
      { name: "Federal Reserve Bank of St. Louis, 10 year real yield", url: "https://fred.stlouisfed.org/series/DFII10" },
      { name: "Federal Reserve Bank of St. Louis, 10 year breakeven inflation", url: "https://fred.stlouisfed.org/series/T10YIE" },
      { name: "U.S. Bureau of Labor Statistics, Consumer Price Index", url: "https://www.bls.gov/cpi/" },
    ],
  },

  {
    slug: "uae-wills-and-succession",
    title: "Wills and succession in the UAE",
    category: "tax",
    tier: 1,
    calculator: "estate-tax-exposure",
    reviewed: R,
    summary:
      "Assets held in the UAE by a non-Muslim expatriate do not automatically pass under their home country will, and without a will registered in a recognised UAE registry the default distribution rules apply to those assets regardless of the owner's nationality or intentions.",
    body: `This is the gap that catches expatriate property owners, and it catches them at the worst possible moment for their families to be discovering it.

## The problem in one paragraph

A foreign will is not automatically recognised by UAE courts for UAE-situated assets. Without a will registered here, UAE succession rules apply to the property, the bank accounts and the company shares held here. Accounts can be frozen while the position is resolved. An unmarried partner may receive nothing. A distribution the owner never intended can become the legal outcome.

## What a registered will does

The DIFC Wills Service allows non-Muslims, of any nationality and whether or not resident in the UAE, to register a will covering UAE assets. Abu Dhabi operates its own registry. A registered will lets you direct where your UAE assets go, and it appoints guardians for minor children, which is frequently the more urgent half.

Several forms exist, from a full estate will covering all UAE assets and guardianship, down to narrower instruments covering only Dubai real property, only financial assets, only business interests, or only guardianship. The narrower ones cost less and cover less.

## The interaction nobody joins up

Succession and tax are separate questions and both bite.

A UAE will governs where your UAE assets go. It does nothing about the [US estate tax](/glossary/us-estate-tax/) exposure created by holding US shares or US domiciled funds, which is a tax on the asset rather than a question of distribution, and which starts above a sixty thousand dollar exemption for a non-resident non-citizen. The [fund domicile](/playbooks/fund-domicile/) framework covers that side.

You can therefore have a perfectly drafted will directing assets to your family, and a tax bill on those same assets that the will does nothing to prevent. Both need addressing, and they are addressed in different places.

## What to actually do

**Establish which assets are situated where.** UAE property and UAE accounts are UAE assets. A fund is situated where it is domiciled, not where your broker is. That is the [situs](/glossary/situs/) question and it decides which rules apply.

**Register a will for the UAE assets**, sized to what you own. If there are minor children, the guardianship provision alone justifies it.

**Check the foreign wills still work.** Multiple wills across jurisdictions can accidentally revoke one another if they are not drafted to sit alongside each other. This is the most common technical failure.

**Review after every material change.** Marriage, divorce, a birth, a new property, a change of residency.

## The honest caveat

This is a framework page, not legal advice, and succession is one of the areas where general information is least adequate. The federal position on non-Muslims and civil succession law has been evolving. Anyone with UAE assets and a family should be taking advice from a UAE qualified lawyer rather than from a website, including this one.

What a page like this can usefully do is make sure the question gets asked, because the common failure is not choosing the wrong structure. It is never realising there was a choice.`,
    formula: `The two questions, which are separate

  1. Where do my assets go?          succession
     answered by a will registered in a
     recognised UAE registry

  2. What is taxed on death?         estate tax
     answered by the situs of each asset
     US shares and US domiciled funds
       -> US estate tax above USD 60,000
          for a non-resident non-citizen

Situs, briefly
  UAE property           UAE
  UAE bank account       UAE
  Fund                   country of domicile
  Company shares         country of incorporation

  Not where your broker is. Not where you live.

Sizing the will
  full estate      all UAE assets + guardianship
  real property    Dubai real estate only
  financial        accounts and portfolios
  business         UAE company shares
  guardianship     minor children`,
    failureModes: [
      "It is general information and not legal advice, and succession is precisely the area where that distinction matters most. Take UAE qualified advice.",
      "Multiple wills across jurisdictions can revoke one another when they are not drafted to coexist, which is the most common technical failure and one a non-specialist will not spot.",
      "A will does nothing about estate tax. Distribution and taxation are separate mechanisms and solving one leaves the other untouched.",
      "The federal legal position on non-Muslims and civil succession has been changing, so anything written on a website has a shelf life.",
      "Registries and fee structures differ between emirates, and a Dubai registration does not necessarily reach assets elsewhere in the UAE.",
      "Joint accounts and jointly held property have their own treatment that a simple will may not address as the owner assumes.",
    ],
    whenToUse:
      "Before or immediately after buying UAE property, and again on marriage, divorce, a birth, or any change of residency. If there are minor children, immediately, for the guardianship provision alone.",
    sources: [
      { name: "DIFC Courts Wills Service", url: "https://www.difc.ae/business/dispute-resolution/difc-courts-wills-service" },
      { name: "DIFC wills for non-Muslims, eligibility and will types, summary", url: "https://www.almaazmilawyers.com/insights/difc-wills-non-muslim-uae-guide" },
      { name: "IRS, estate tax for nonresidents not citizens of the United States", url: "https://www.irs.gov/businesses/small-businesses-self-employed/some-nonresidents-with-us-assets-must-file-estate-tax-returns" },
    ],
  },

  {
    slug: "the-primary-residence",
    title: "The home you live in",
    category: "property",
    tier: 2,
    calculator: "rent-vs-buy",
    reviewed: R,
    summary:
      "A home you live in produces no income and cannot be sold without buying or renting somewhere else, which makes it a consumption asset with an investment attached rather than an investment, and treating it as the latter distorts every other decision in the portfolio.",
    body: `The sentence people say is that their home is their biggest investment. It is usually their biggest asset and it is rarely an investment, and the difference changes what you should do with the rest of your money.

## Why it is not an investment

An investment produces cash or can be sold for cash you get to keep. A home does neither.

It produces no rent, because you are the tenant. It costs money every year in service charges, maintenance and insurance. And when you sell it, you have to live somewhere, so the proceeds are largely committed before they arrive. Selling into a rising market means buying into the same rising market.

What it does produce is imputed rent: the rent you no longer pay. That is real and it belongs in the [rent versus buy](/playbooks/rent-vs-buy/) calculation. But it is consumption, not income, and it never appears in a bank account.

## What it does to a balance sheet

Three distortions, all of them common.

**It hides concentration.** A person with a mortgaged home and one rental in the same city has most of their net worth in one property market, financed with leverage. Counted properly that is a [concentration](/playbooks/concentration-limits/) problem. Counted as "my home plus one investment" it does not look like one.

**It absorbs the emergency fund.** Deposits and acquisition costs are drawn from liquid savings, and the result is an owner with a large asset and no cash. That is the situation the [emergency liquidity](/playbooks/emergency-liquidity/) framework exists to prevent, and the home purchase is the most common way people arrive at it.

**It flatters the return.** House price appreciation gets compared against savings account interest, which ignores the years of service charges, maintenance, interest and transaction costs. Run the same [transaction cost drag](/playbooks/transaction-cost-drag/) arithmetic on your own home and the number is usually sobering.

## The expatriate version

Buying a home in a country where your right to remain depends on employment adds a risk that residents do not carry. If the job ends, the timeline for leaving may be shorter than the timeline for selling a property well, and those two clocks running against each other is how people sell badly.

That is not an argument against buying. It is an argument for the [emergency liquidity](/playbooks/emergency-liquidity/) reserve being genuinely larger here, and for the purchase making sense at a horizon long enough to absorb a bad exit.

## How to count it properly

Keep it on the balance sheet at market value less selling costs, and note beside it that it is not available. Exclude it from the assets funding retirement unless you have a specific, dated plan to downsize or move to a cheaper country, in which case count only the difference.

Then make every other allocation decision on what is left. That number is smaller than the headline net worth and it is the only part that is actually doing any work.`,
    formula: `What a home returns
  imputed rent            real, but consumed, never banked
  - service charge
  - maintenance and insurance
  - mortgage interest
  - amortised transaction costs
  +/- price change
  = the honest figure, and it is not a yield

On the balance sheet
  Value          market value less selling costs
  Available      no, unless there is a dated downsizing
                 or relocation plan
  Counts towards retirement funding
                 only the planned difference between
                 this home and the next one

The concentration check
  home equity + rental equity
  ---------------------------  = one property market,
        net worth               usually leveraged`,
    failureModes: [
      "Imputed rent is genuinely valuable and dismissing it entirely understates the case for owning. The point is that it is consumption rather than income, not that it is worthless.",
      "In markets with strong long run appreciation, a home has built real wealth for many people, and the framework should not be read as an argument against buying one.",
      "Security of tenure has a value no spreadsheet captures, particularly for families with children in school.",
      "A mortgage is a forced savings mechanism, and for people who would not otherwise save, the discipline has produced better outcomes than the arithmetic alone suggests.",
      "It ignores the option to let the home and move, which converts it into an income asset and is available to some owners and not others.",
      "Where residency depends on property ownership, the asset is buying something other than a return and should be valued accordingly.",
    ],
    whenToUse:
      "When calculating net worth for any planning purpose, and before assuming the home forms part of a retirement plan. Also before buying a second property, when the concentration question becomes live.",
    sources: [
      { name: "Dubai Land Department, fees and charges", url: "https://dubailand.gov.ae/en/" },
      { name: "Bank for International Settlements, residential property price statistics", url: "https://www.bis.org/statistics/pp.htm" },
    ],
  },

  {
    slug: "sunk-cost-and-selling",
    title: "Sunk cost and the decision to sell",
    category: "behavioural",
    tier: 2,
    calculator: "net-rental-yield",
    reviewed: R,
    summary:
      "The price paid for an asset has no bearing on whether to keep it, because that money is spent either way, and the only question that matters is whether the asset is the best use of the capital it currently ties up.",
    body: `Nobody wants to sell at a loss. That reluctance is the most expensive habit in investing, and it is entirely about the past.

## The test

Ask one question. If I did not own this, and I had the money it would release, would I buy it today at today's price?

If yes, keep it. If no, the only thing keeping you in the position is the price you paid, and the price you paid is gone regardless of what you do next.

That is the whole framework. Everything else is the reasons people find not to apply it.

## Why it is so hard

The purchase price becomes an anchor, and selling below it converts a paper loss into an admitted one. Loss aversion makes that admission feel worse than the ongoing cost of holding, even when the ongoing cost is larger.

Property makes it worse than markets do. There is no daily price, so the loss stays theoretical for longer. Valuation is a matter of opinion, so a hopeful opinion is always available. And the transaction cost of selling gives a rational-sounding reason to defer a decision that has already been made emotionally.

## The cost of holding, which is real

A property held for reasons of pride still charges you. The service charge continues, the mortgage continues, the maintenance continues, and the capital sits in an asset you have already concluded you would not buy.

That last part is the real cost: opportunity. Capital tied to a unit yielding two percent net, in a building you would not choose again, is capital not doing something better. The loss was incurred when the value fell, not on the day you accept it.

## What the test does not mean

It is not an argument for selling whenever something falls. Applied honestly it will frequently say keep, because a sound asset in a soft market is exactly the thing worth holding through, and the [drawdown recovery](/playbooks/drawdown-recovery-math/) arithmetic favours patience for assets that still work.

The test separates two cases that feel identical from the inside. Holding because the asset is good, and holding because selling would confirm a mistake. Only the first is a decision.

## Doing it before you need to

The reason to write down your reasons for owning something at the time you buy it is that the reasons are available later, in your own handwriting, when the position has moved against you and your memory has become creative about what you originally expected.

That is the same discipline as an investment policy statement in the [behaviour gap](/playbooks/the-behaviour-gap/) framework. Decide while calm what would change your mind, then check against it rather than against your feelings on the day.`,
    formula: `The only question

  If I did not own this, and I held the cash it
  would release, would I buy it today at today's
  price, net of the cost of selling?

    Yes  ->  keep it
    No   ->  the purchase price is the only thing
             holding you, and it is already spent

What does not belong in the decision
  what you paid
  what it was worth at the peak
  what you told people you expected
  how close it is to breaking even

What does
  today's net yield on today's value
  the cost and time of selling
  what the released capital would do instead
  whether the original reasons for owning it hold`,
    failureModes: [
      "Applied carelessly it becomes an argument for constant trading, and turnover has its own costs which in property are punishing.",
      "The would I buy it today test needs an honest current valuation, and for illiquid assets that is exactly what is hardest to obtain.",
      "Some costs of selling are real and forward looking rather than sunk, including agent fees, the NOC and the time the sale takes. Those belong in the decision.",
      "Tax consequences of realising a gain or loss are forward looking too, and in jurisdictions where they apply they can legitimately change the answer.",
      "It ignores non-financial reasons for holding, which can be entirely valid provided they are stated rather than disguised as financial ones.",
      "A property that would not be bought today may still be worth holding if selling now means realising a temporary dislocation, which is a judgement the test cannot make for you.",
    ],
    whenToUse:
      "Annually on everything you own, and immediately whenever you catch yourself explaining a holding by reference to what you paid for it.",
    sources: [
      { name: "Morningstar, Mind the Gap 2025", url: "https://www.morningstar.com/content/cs-assets/v3/assets/blt9415ea4cc4157833/blt2c5c4d9171638c42/689b424311f3880edc4b4813/US_Mind_the_Gap_2025.pdf" },
      { name: "Dubai Land Department, real estate transaction data", url: "https://dubailand.gov.ae/en/open-data/real-estate-data/" },
    ],
  },
];
