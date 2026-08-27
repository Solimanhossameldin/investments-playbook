/* The glossary. One term per page, and the first sentence of each is written to
   be lifted verbatim by an answer engine: it must define the term completely,
   on its own, without the paragraph that follows it.

   Every entry carries a `trap`, because every one of these terms has a specific
   way people get it wrong, and naming it is the part that makes the page worth
   reading rather than worth scraping. */

const P = "property", M = "markets", T = "tax", B = "behaviour";

export default [
  /* ---------------- property ---------------- */
  {
    term: "Gross rental yield",
    slug: "gross-rental-yield",
    category: P,
    definition:
      "Gross rental yield is annual rent divided by the purchase price, expressed as a percentage, before any running cost or acquisition cost is deducted.",
    body: `It is the number in the listing, and it is the easiest yield to calculate because it ignores everything that happens after the sale. Annual rent over price, and stop.

That makes it useful for one thing only: comparing two properties in the same market on the same basis, quickly. It is not a return, it is not income, and it is not what reaches your account.`,
    trap: "Treating it as the return. In Dubai the gap between gross and net is typically two to three percentage points, which is often more than half of the number.",
    playbook: "net-rental-yield",
    related: ["net-rental-yield", "service-charge", "void-period"],
  },
  {
    term: "Net rental yield",
    slug: "net-rental-yield",
    category: P,
    definition:
      "Net rental yield is annual rent minus every running cost, divided by the purchase price plus every acquisition cost, which makes it the only yield figure that describes money actually reaching the owner.",
    body: `The numerator drops service charges, management, maintenance, insurance and a vacancy allowance. The denominator adds the transfer fee, agency commission and VAT, trustee and administrative charges, and any mortgage registration fee.

Both adjustments push in the same direction, which is why the net figure sits so far below the gross one.`,
    trap: "Deducting the costs but forgetting to add the acquisition costs to the denominator. That flatters the answer by roughly the same amount again.",
    playbook: "net-rental-yield",
    related: ["gross-rental-yield", "service-charge", "void-period"],
  },
  {
    term: "Service charge",
    slug: "service-charge",
    category: P,
    definition:
      "A service charge is the annual fee an apartment owner pays the owners association for maintaining shared parts of the building, quoted in Dubai as dirhams per square foot per year and levied whether or not the unit is occupied.",
    body: `It covers the lifts, the chillers, the lobby, security, insurance of the structure, and the reserve fund for large future works. It is the single largest deduction between gross and net yield on most apartments.

It is also the cost most buyers never see before they buy, because it does not appear on the listing and is quoted per square foot rather than as a total.`,
    trap: "Assuming it is fixed. Owners associations raise charges, and an ageing chiller or a disputed handover can produce a step change that removes a full point of net yield.",
    playbook: "net-rental-yield",
    related: ["owners-association", "net-rental-yield", "chiller-free"],
  },
  {
    term: "Transfer fee",
    slug: "transfer-fee",
    category: P,
    definition:
      "The transfer fee is the charge levied by the Dubai Land Department to register a change of property ownership, set at four percent of the sale price and customarily paid by the buyer.",
    body: `It is due at the trustee office on the day of transfer, in addition to an administrative charge for issuing the title deed. It is not recoverable on resale.

Because it is charged on the price rather than on the gain, it falls hardest on short holds. Two buyers paying it in the same year on the same unit have paid it twice.`,
    trap: "Budgeting four percent and stopping. Add both agency commissions with VAT, the trustee fee and the administrative charge, and the real entry cost is closer to six or seven percent.",
    playbook: "transaction-cost-drag",
    related: ["transaction-cost-drag", "no-objection-certificate", "minimum-hold-period"],
  },
  {
    term: "Transaction cost drag",
    slug: "transaction-cost-drag",
    category: P,
    definition:
      "Transaction cost drag is the round trip cost of buying and selling an asset expressed as an annual percentage, calculated by dividing the total cost by the number of years held.",
    body: `A Dubai round trip costs roughly eight to ten percent of value once the transfer fee, both agency commissions with VAT, and the trustee and NOC charges are counted.

Held two years, that is four to five percent a year, which consumes an entire net yield. Held seven years, it is under one and a half percent. The cost did not change. The denominator did.`,
    trap: "Thinking of it as a one-off. It is a rate, and the rate is set by how long you hold, which is the one part of it you control.",
    playbook: "transaction-cost-drag",
    related: ["minimum-hold-period", "transfer-fee", "net-rental-yield"],
  },
  {
    term: "Minimum hold period",
    slug: "minimum-hold-period",
    category: P,
    definition:
      "The minimum hold period is the number of years a property must be held for its income and growth to cover the round trip transaction costs, below which the purchase cannot pay for itself.",
    body: `It is not a rule of thumb, it is an output. Divide the round trip cost by the annual net yield plus expected growth, and the answer is the number of years before you are level.

In a market rising fifteen percent a year the period is short enough to ignore. In a flat market it is the whole investment case.`,
    trap: "Setting it by intention rather than arithmetic. A plan that required an exit inside three years does not become viable because that was the plan.",
    playbook: "transaction-cost-drag",
    related: ["transaction-cost-drag", "net-rental-yield"],
  },
  {
    term: "Cash on cash return",
    slug: "cash-on-cash-return",
    category: P,
    definition:
      "Cash on cash return is the annual cash left after every running cost and every mortgage payment, divided by the cash the buyer actually put in, which makes it the only property return figure that answers what your own money earned.",
    body: `Where net yield measures the property, cash on cash measures your position in it. A leveraged purchase and an unleveraged one can have identical net yields and completely different cash on cash returns.

It rises with leverage while rates are below the yield and collapses when they are not, which is the whole of the leverage argument in one number.`,
    trap: "Reading a high figure as a good investment. Leverage raises it in both directions, and the same gearing that produces twelve percent produces the margin call.",
    playbook: "cash-on-cash",
    related: ["loan-to-value", "net-rental-yield", "debt-service-coverage-ratio"],
  },
  {
    term: "Off-plan",
    slug: "off-plan",
    category: P,
    definition:
      "Off-plan means buying a property before it is built, paying in instalments against construction milestones and taking ownership only at handover, which in Dubai is registered through Oqood rather than an immediate title deed.",
    body: `The attraction is the payment plan: money paid later costs less in present value than money paid today, and a post handover plan can be worth eight to fifteen percent of the headline price against a front loaded one.

The cost is time without income. A unit under construction pays nothing while a completed one is collecting rent.`,
    trap: "Comparing an off-plan price against a ready price as though they are the same kind of number. They are cash flows at different dates and only an IRR compares them honestly.",
    playbook: "off-plan-vs-ready",
    related: ["oqood", "escrow-account", "handover", "payment-plan"],
  },
  {
    term: "Oqood",
    slug: "oqood",
    category: P,
    definition:
      "Oqood is the Dubai Land Department system that registers off-plan property sales contracts before a title deed exists, creating an official record of the buyer's interest during construction.",
    body: `Registration is what converts a private agreement with a developer into a recognised interest in the project. Until the building completes and a title deed is issued, this is the record of ownership.

An unregistered off-plan purchase is a contract with a company, not a property interest.`,
    trap: "Assuming the developer has registered it. Confirm the registration exists rather than accepting that it will be handled.",
    playbook: "off-plan-vs-ready",
    related: ["off-plan", "title-deed", "escrow-account"],
  },
  {
    term: "Escrow account",
    slug: "escrow-account",
    category: P,
    definition:
      "In Dubai, an escrow account is a project-specific account required by Law No. 8 of 2007 into which all off-plan buyer payments and project finance must be deposited, dedicated exclusively to that project's construction and protected from the developer's other creditors.",
    body: `The escrow agent releases funds against construction progress rather than on request. After the completion certificate, five percent of the account is retained and released to the developer one year after units are registered to buyers.

It is one of the stronger protections in any off-plan market.`,
    trap: "Reading it as a guarantee of delivery. It protects your money from being spent elsewhere or seized by an unrelated creditor. It does not promise the building arrives on time, to specification, or worth what you paid.",
    playbook: "off-plan-vs-ready",
    related: ["off-plan", "oqood", "handover"],
  },
  {
    term: "Handover",
    slug: "handover",
    category: P,
    definition:
      "Handover is the point at which a completed off-plan unit is delivered to its buyer, the final payment falls due, the title deed is issued and the service charge begins.",
    body: `It is also when the property starts being able to earn. Everything before it is outflow.

Units in a tower hand over in batches, which means several hundred near identical apartments reach the sale and rental market in the same month.`,
    trap: "Planning an exit within a year of handover. That is precisely when every other investor in the building is trying the same thing.",
    playbook: "off-plan-vs-ready",
    related: ["off-plan", "snagging", "service-charge"],
  },
  {
    term: "Payment plan",
    slug: "payment-plan",
    category: P,
    definition:
      "A payment plan is the schedule of instalments by which an off-plan property is paid for, and because money paid later is worth less than money paid today, two plans at the same headline price are not the same price.",
    body: `Front loaded plans demand most of the money during construction. Post handover plans spread instalments over years after you have the keys and can be earning rent.

The difference between them, discounted properly, is commonly eight to fifteen percent of the headline figure.`,
    trap: "Accepting that a plan is a discount without discounting it. The advantage is real but it has a size, and the size depends on your own cost of money.",
    playbook: "off-plan-irr",
    related: ["off-plan", "internal-rate-of-return", "handover"],
  },
  {
    term: "Freehold",
    slug: "freehold",
    category: P,
    definition:
      "Freehold ownership means owning the property and the land it sits on outright and indefinitely, which in Dubai is available to all nationalities only in designated freehold areas.",
    body: `It is the strongest form of ownership: no expiry, no ground rent, and the right to sell, lease or bequeath.

Outside the designated areas, ownership for non-GCC nationals is generally leasehold or restricted.`,
    trap: "Assuming any Dubai property is freehold for a foreign buyer. The designation is by area, and it is worth confirming rather than presuming.",
    related: ["leasehold", "title-deed"],
  },
  {
    term: "Leasehold",
    slug: "leasehold",
    category: P,
    definition:
      "Leasehold ownership is the right to occupy a property for a fixed term of years while the freehold remains with someone else, after which the property reverts to the freeholder.",
    body: `The remaining term is the asset. A long lease behaves much like freehold; a short one is a wasting asset that gets harder to mortgage and harder to sell as the term runs down.

In the UK, leasehold flats also carry ground rent and service charges set by the freeholder, which is a common source of unpleasant surprises for overseas buyers.`,
    trap: "Ignoring the unexpired term. Below roughly eighty years a UK lease starts costing real money to extend, and lenders grow reluctant.",
    playbook: "dubai-vs-london",
    related: ["freehold", "service-charge"],
  },
  {
    term: "Title deed",
    slug: "title-deed",
    category: P,
    definition:
      "A title deed is the Dubai Land Department document proving ownership of a completed property, issued at transfer or at handover and naming the owner, the unit and its area.",
    body: `It is the instrument that transfers at sale. Until it is issued, an off-plan buyer's interest is recorded in Oqood instead.

The area stated on it is the figure to use in any per square foot calculation, not the one in the brochure.`,
    trap: "Using the brochure area for the service charge or price per foot. The deed area is the one the charges are levied on.",
    related: ["oqood", "freehold", "service-charge"],
  },
  {
    term: "No objection certificate",
    slug: "no-objection-certificate",
    category: P,
    definition:
      "A no objection certificate, or NOC, is a document from the developer confirming there are no outstanding service charges or breaches on a unit, and it is required before the Dubai Land Department will register a resale.",
    body: `The developer charges a fee to issue it, typically a few thousand dirhams, and will not issue it while charges are unpaid.

It is a routine step, but it is a step that can hold up a transfer if the seller has arrears they had not mentioned.`,
    trap: "Leaving it to the last week. Outstanding service charges surface here, and they become the seller's problem only if the contract said so.",
    playbook: "transaction-cost-drag",
    related: ["service-charge", "transfer-fee", "owners-association"],
  },
  {
    term: "Owners association",
    slug: "owners-association",
    category: P,
    definition:
      "An owners association is the body of unit owners responsible for managing and maintaining the shared parts of a building, and it is the body that sets and collects the service charge.",
    body: `It appoints the managing agent, approves the annual budget, and holds the reserve fund for major works such as chiller or lift replacement.

A well run association with a funded reserve is worth real money to an owner. An underfunded one means a special levy is somewhere in your future.`,
    trap: "Never reading the budget. It is the document that tells you what next year's service charge will be, and it is available before you buy.",
    related: ["service-charge", "no-objection-certificate"],
  },
  {
    term: "Chiller free",
    slug: "chiller-free",
    category: P,
    definition:
      "Chiller free means the cost of district cooling is included in the rent or the service charge rather than billed separately to the occupier, which materially changes what a headline rent is worth.",
    body: `Cooling is a large running cost in the Gulf. Where it is paid separately, the tenant carries it and the achievable rent is lower. Where it is included, the rent is higher and the owner carries the cost.

Two units advertising the same rent are not offering the same income if one is chiller free and the other is not.`,
    trap: "Comparing rents across chiller free and chiller paid units without adjusting. The gap can be several thousand dirhams a year.",
    playbook: "net-rental-yield",
    related: ["service-charge", "gross-rental-yield"],
  },
  {
    term: "Snagging",
    slug: "snagging",
    category: P,
    definition:
      "Snagging is the inspection of a newly completed property to list defects for the developer to fix, carried out at or shortly before handover while the obligation to remedy them still sits with the developer.",
    body: `A snagging report covers finishes, fittings, mechanical and electrical work, and anything that does not match the specification sold.

It has a window. Once handover is accepted and the defects liability period expires, remedy becomes the owner's cost.`,
    trap: "Accepting handover before inspecting, because the keys are ready and the tenant is waiting. That trades a week of rent for the cost of every defect.",
    related: ["handover", "off-plan"],
  },
  {
    term: "Void period",
    slug: "void-period",
    category: P,
    definition:
      "A void period is time during which a rental property has no paying tenant, and it is a cost rather than an absence of income because the service charge, mortgage and maintenance continue throughout.",
    body: `A month of void on an annual tenancy is roughly eight percent of the year's rent. Two months is sixteen.

Any yield calculation without a vacancy allowance is assuming a tenancy that never gaps, never ends and never pays late.`,
    trap: "Modelling twelve months of rent. Even a well let unit turns over, and turnover has a gap in it.",
    playbook: "net-rental-yield",
    related: ["net-rental-yield", "gross-rental-yield"],
  },
  {
    term: "Loan to value",
    slug: "loan-to-value",
    category: P,
    definition:
      "Loan to value, or LTV, is the mortgage amount expressed as a percentage of the property's value, and it is the single number that determines how far a price fall has to go before the owner's equity is gone.",
    body: `At seventy five percent LTV the owner has twenty five percent equity, so a twenty five percent price fall wipes it out entirely, before selling costs.

Lenders price on it, and the rate steps at the standard thresholds rather than sliding smoothly.`,
    trap: "Reading it as a borrowing limit rather than a risk measure. It is both, and the second reading is the one that matters in a falling market.",
    playbook: "cash-on-cash",
    related: ["cash-on-cash-return", "debt-service-coverage-ratio", "drawdown"],
  },
  {
    term: "Debt service coverage ratio",
    slug: "debt-service-coverage-ratio",
    category: P,
    definition:
      "Debt service coverage ratio is net operating income divided by annual mortgage payments, and a ratio below one means the property does not earn enough to pay its own debt.",
    body: `Lenders use it to size loans. Owners should use it to size risk: it says how much income can be lost before the shortfall has to come out of salary.

A ratio of 1.2 means a twenty percent fall in net income takes the property to break even.`,
    trap: "Calculating it on gross rent. Net operating income is after every running cost, and using gross rent can turn a ratio of 0.9 into an apparent 1.4.",
    related: ["cash-on-cash-return", "loan-to-value", "net-rental-yield"],
  },

  /* ---------------- markets ---------------- */
  {
    term: "Basis point",
    slug: "basis-point",
    category: M,
    definition:
      "A basis point is one hundredth of a percentage point, so one hundred basis points equals one percent, and it exists because saying a rate rose one percent is ambiguous between one percentage point and one percent of the rate.",
    body: `A move from 4.70 percent to 4.74 percent is four basis points. It is not a four percent move and it is not a 0.04 percent move.

The abbreviation is bps, pronounced bips.`,
    trap: "Confusing a percentage point with a percent. A rate going from two percent to three percent rose one hundred basis points and also rose fifty percent, and those are very different sentences.",
    related: ["yield-curve", "real-yield"],
  },
  {
    term: "Yield curve",
    slug: "yield-curve",
    category: M,
    definition:
      "The yield curve plots the yields of government bonds against their maturities, showing what the market charges to lend for two years against ten or thirty, and its shape is read as a statement about growth, inflation and risk.",
    body: `An upward sloping curve is the normal state: longer lending pays more. A flat or inverted curve, where short rates exceed long ones, has historically preceded recessions.

Which end moves matters more than the direction. Short rates are largely set by the central bank; long rates are set by the market.`,
    trap: "Reading a steepening as one thing. Steepening because short rates fell is a growth story. Steepening because long rates rose is a risk story.",
    related: ["term-premium", "basis-point", "real-yield"],
  },
  {
    term: "Term premium",
    slug: "term-premium",
    category: M,
    definition:
      "Term premium is the extra yield investors demand for holding a long dated bond rather than rolling short dated ones, compensating for the uncertainty of committing money for decades.",
    body: `It responds to the supply of government debt, to uncertainty about future inflation, and to how confident lenders feel about the fiscal path. None of those is directly controlled by a central bank.

When the long end of the curve rises while the short end does not, term premium is usually what moved.`,
    trap: "Attributing every long rate move to expected policy. Some of it is the price of uncertainty, and that part does not fall because a central bank cuts.",
    related: ["yield-curve", "real-yield", "breakeven-inflation"],
  },
  {
    term: "Real yield",
    slug: "real-yield",
    category: M,
    definition:
      "Real yield is the return on a bond after inflation, observable directly in the market as the yield on an inflation protected government bond, and it is the hurdle every other asset has to beat to be worth owning.",
    body: `A nominal yield of 4.70 percent with a real yield of 2.38 percent means roughly half the nominal is compensation for expected inflation and roughly half is genuine return.

A positive real yield raises the opportunity cost of holding anything that pays no income, which is the textbook argument against gold.`,
    trap: "Comparing a nominal yield against a real return, or vice versa. Both are commonly quoted and mixing them produces an answer that is wrong by the inflation rate.",
    related: ["breakeven-inflation", "yield-curve", "term-premium"],
  },
  {
    term: "Breakeven inflation",
    slug: "breakeven-inflation",
    category: M,
    definition:
      "Breakeven inflation is the difference between a nominal government bond yield and the real yield on an inflation protected bond of the same maturity, and it is read as the inflation rate the market expects over that period.",
    body: `If the ten year nominal is 4.70 percent and the ten year real is 2.38 percent, the ten year breakeven is 2.32 percent. At that rate of inflation, both bonds return the same.

It is the cleanest market read on inflation expectations available, and it updates every day.`,
    trap: "Treating it as a forecast rather than a price. It contains a risk premium as well as an expectation, and the two cannot be separated by looking at it.",
    related: ["real-yield", "yield-curve"],
  },
  {
    term: "Duration",
    slug: "duration",
    category: M,
    definition:
      "Duration measures how much a bond's price moves for a one percent change in interest rates, so a bond with a duration of eight falls roughly eight percent when rates rise one percentage point.",
    body: `It rises with maturity and falls with coupon. A thirty year zero coupon bond has enormous duration; a two year bond has very little.

It is the reason a portfolio described as safe because it holds bonds can lose double digits in a year.`,
    trap: "Assuming bonds are the low risk part by definition. The risk is duration, and a long duration bond fund is a rates bet, not a cash substitute.",
    playbook: "three-fund-portfolio",
    related: ["yield-curve", "drawdown", "real-yield"],
  },
  {
    term: "Index fund",
    slug: "index-fund",
    category: M,
    definition:
      "An index fund is a fund that holds the constituents of a published index in their published weights rather than selecting them, which removes manager judgement and most of the cost that comes with it.",
    body: `The result tracks the index minus fees and tracking difference. It will never beat the market and, net of costs, that is the point.

An ETF is an index fund that trades on an exchange. The wrapper differs; the underlying idea does not.`,
    trap: "Assuming all funds tracking the same index are equivalent. Domicile, replication method and withholding tax treatment can differ by more than the fee.",
    playbook: "three-fund-portfolio",
    related: ["expense-ratio", "fund-domicile", "accumulating-vs-distributing"],
  },
  {
    term: "Expense ratio",
    slug: "expense-ratio",
    category: M,
    definition:
      "The expense ratio is the annual percentage of assets a fund deducts to cover its running costs, charged continuously and reflected in the fund's price rather than billed separately.",
    body: `It compounds against you. Fifty basis points a year over twenty five years is a meaningful share of the total return, taken quietly.

It is also the most visible cost and therefore the one investors optimise hardest, sometimes at the expense of costs that matter more.`,
    trap: "Optimising the expense ratio while ignoring domicile. For a non-US investor the withholding tax difference between fund domiciles can dwarf a few basis points of fee.",
    playbook: "fund-domicile",
    related: ["index-fund", "fund-domicile", "tracking-difference"],
  },
  {
    term: "Tracking difference",
    slug: "tracking-difference",
    category: M,
    definition:
      "Tracking difference is the gap between a fund's actual return and the return of the index it follows over a period, and unlike the expense ratio it captures every cost and every offsetting gain.",
    body: `It includes the fee, dealing costs, cash drag, and any income the fund earns from securities lending or recovers through favourable tax treatment.

A fund with a higher fee can have a smaller tracking difference than a cheaper one, which makes it the better measure of what tracking actually cost.`,
    trap: "Confusing it with tracking error. Tracking error measures the volatility of the gap; tracking difference measures the gap itself, and the second is what you keep.",
    related: ["expense-ratio", "index-fund", "fund-domicile"],
  },
  {
    term: "Accumulating versus distributing",
    slug: "accumulating-vs-distributing",
    category: M,
    definition:
      "An accumulating fund reinvests its dividends inside the fund while a distributing fund pays them out to the holder, which changes the tax treatment and the administration but not the underlying holdings.",
    body: `Accumulating units compound without the holder having to reinvest, which suits someone building wealth. Distributing units produce cash, which suits someone spending it.

In a jurisdiction with no personal income tax the choice is largely one of convenience. Elsewhere it can be a tax decision.`,
    trap: "Assuming accumulating means untaxed. It means undistributed. Several tax regimes still tax the reinvested income in the year it arises.",
    playbook: "fund-domicile",
    related: ["index-fund", "fund-domicile", "withholding-tax"],
  },
  {
    term: "Fund domicile",
    slug: "fund-domicile",
    category: T,
    definition:
      "A fund's domicile is the country in which it is legally established, and it determines the withholding tax the fund suffers on its holdings and the estate tax exposure of the person who owns it.",
    body: `Two funds tracking the same index from different domiciles can deliver materially different returns to the same investor, purely through treaty treatment of dividends.

For a non-US investor, a US domiciled ETF is a US situs asset. An Irish domiciled fund tracking the same index generally is not.`,
    trap: "Choosing on fee alone. For a globally mobile investor, domicile is usually the larger number and it is decided once, at purchase.",
    playbook: "fund-domicile",
    related: ["withholding-tax", "situs", "us-estate-tax", "expense-ratio"],
  },
  {
    term: "Withholding tax",
    slug: "withholding-tax",
    category: T,
    definition:
      "Withholding tax is tax deducted at source by the country where income arises before it reaches the recipient, and for fund investors it is deducted from dividends before they ever appear in the fund's return.",
    body: `The rate depends on the treaty between the source country and the fund's domicile, not between the source country and the investor.

That is why domicile matters: the fund, not you, is the party claiming the treaty rate.`,
    trap: "Assuming your own country's treaty applies. The fund's domicile is what the source country sees.",
    playbook: "fund-domicile",
    related: ["fund-domicile", "double-tax-treaty", "index-fund"],
  },
  {
    term: "Situs",
    slug: "situs",
    category: T,
    definition:
      "Situs is the legal location of an asset for tax purposes, which for shares is generally the country of the issuing company and for funds the country of domicile, regardless of where the owner lives or where the asset is held.",
    body: `It is the concept that decides which country may tax an asset on death. It has nothing to do with which broker holds it or which currency it is priced in.

A Dubai resident holding US shares through a Swiss bank still holds US situs assets.`,
    trap: "Believing the custodian's location changes it. Moving the account does not move the situs.",
    playbook: "fund-domicile",
    related: ["us-estate-tax", "fund-domicile", "tax-residency"],
  },
  {
    term: "US estate tax for non-residents",
    slug: "us-estate-tax",
    category: T,
    definition:
      "A person who is neither a US citizen nor US domiciled is subject to US federal estate tax on US situs assets above an exemption of sixty thousand dollars, at rates rising to forty percent.",
    body: `US shares and US domiciled funds are US situs. The exemption available to non-residents is a tiny fraction of the one available to US persons, and a treaty may raise it for residents of some countries.

The UAE has no estate tax treaty with the United States.`,
    trap: "Assuming the large US exemption applies to everyone. For a non-domiciled non-citizen it is sixty thousand dollars, not millions.",
    playbook: "fund-domicile",
    related: ["situs", "fund-domicile", "double-tax-treaty"],
  },
  {
    term: "Double tax treaty",
    slug: "double-tax-treaty",
    category: T,
    definition:
      "A double tax treaty is an agreement between two countries setting out which of them may tax a given kind of income and at what rate, so that the same income is not fully taxed twice.",
    body: `Treaties typically reduce withholding on dividends and interest, allocate taxing rights over employment and property income, and define residency where both countries would otherwise claim it.

Property income is the usual exception: it is nearly always taxable where the property is.`,
    trap: "Expecting a treaty to eliminate tax. It allocates and reduces. Rental income from a UK property stays UK taxable whatever your residency.",
    playbook: "dubai-vs-london",
    related: ["withholding-tax", "tax-residency", "situs"],
  },
  {
    term: "Tax residency",
    slug: "tax-residency",
    category: T,
    definition:
      "Tax residency is the status that determines which country taxes your worldwide income, decided by each country's own statutory tests rather than by your nationality or your visa.",
    body: `Day counts are the most common test but rarely the only one. Ties such as a home, family or business can make a country claim you on far fewer days than you expect.

It is possible to be resident in two countries at once, which is what treaty tie-breaker rules exist to resolve.`,
    trap: "Assuming leaving is enough. Several countries continue to treat departing residents as resident until specific conditions are met.",
    related: ["double-tax-treaty", "situs", "stamp-duty-land-tax"],
  },
  {
    term: "Stamp duty land tax",
    slug: "stamp-duty-land-tax",
    category: T,
    definition:
      "Stamp Duty Land Tax is the tax paid on property purchases in England and Northern Ireland, charged in bands on the portion of price falling in each band, with surcharges for additional properties and for non-UK residents.",
    body: `The additional property surcharge and the non-resident surcharge both apply on top of the standard rates, and both apply to every band including the one that would otherwise be zero.

For an overseas buyer purchasing a rental, the two together add seven percentage points across the whole price.`,
    trap: "Reading the headline bands and stopping. On a six hundred thousand pound flat the surcharges take the bill from about twenty thousand pounds to about sixty two thousand.",
    playbook: "dubai-vs-london",
    related: ["tax-residency", "transfer-fee", "leasehold"],
  },
  {
    term: "Internal rate of return",
    slug: "internal-rate-of-return",
    category: M,
    definition:
      "The internal rate of return is the single annual rate at which a series of dated cash flows has a present value of zero, which makes it the only fair way to compare investments whose money moves in and out at different times.",
    body: `It handles what a simple percentage cannot: instalments, delays, income arriving during the hold, and a lump sum at the end.

It is the right tool for comparing an off-plan payment plan against a ready purchase, because those differ almost entirely in timing.`,
    trap: "Comparing IRRs across very different durations. A thirty percent IRR over eight months and a twelve percent IRR over ten years are not ranked by the number alone.",
    playbook: "off-plan-irr",
    related: ["payment-plan", "off-plan", "cash-on-cash-return"],
  },
  {
    term: "Drawdown",
    slug: "drawdown",
    category: B,
    definition:
      "A drawdown is the fall from a portfolio's peak value to its trough, expressed as a percentage, and recovering from one requires a larger percentage gain than the loss because the gain is calculated on a smaller base.",
    body: `A fifty percent fall needs a one hundred percent gain to get back. A twenty percent fall needs twenty five percent.

The asymmetry is arithmetic, not sentiment, and it is why avoiding large losses matters more than capturing large gains.`,
    trap: "Assuming a thirty percent fall needs a thirty percent recovery. It needs nearly forty three.",
    playbook: "drawdown-recovery-math",
    related: ["volatility-drag", "duration", "loan-to-value"],
  },
  {
    term: "Volatility drag",
    slug: "volatility-drag",
    category: M,
    definition:
      "Volatility drag is the gap between the average annual return of an investment and the return an investor actually compounds, caused by losses reducing the base on which later gains are earned.",
    body: `Up fifty percent then down fifty percent averages zero and leaves you down twenty five.

The more volatile the path, the wider the gap between the arithmetic average and what ended up in the account.`,
    trap: "Quoting average annual returns as though they compound. The geometric return is the one you can spend.",
    playbook: "drawdown-recovery-math",
    related: ["drawdown", "sequence-of-returns-risk"],
  },
  {
    term: "Sequence of returns risk",
    slug: "sequence-of-returns-risk",
    category: B,
    definition:
      "Sequence of returns risk is the danger that poor returns arriving early in retirement permanently damage a portfolio, because withdrawals during a fall sell more units and leave less to recover with.",
    body: `Two retirees with identical average returns over thirty years can end with wildly different outcomes purely because of the order those returns arrived.

It is why the safe withdrawal rate is a rate rather than a share of the average return.`,
    trap: "Planning on averages. The average is fine. The order is what ruins people, and the order is unknowable in advance.",
    playbook: "safe-withdrawal-rate",
    related: ["safe-withdrawal-rate", "volatility-drag", "drawdown"],
  },
  {
    term: "Safe withdrawal rate",
    slug: "safe-withdrawal-rate",
    category: B,
    definition:
      "A safe withdrawal rate is the percentage of a portfolio that can be withdrawn in the first year of retirement, then increased with inflation, with a high probability of the money outlasting the retiree.",
    body: `The familiar four percent figure came from US historical data over thirty year periods, which is a specific market, a specific horizon and a specific asset mix.

Its practical use is the inverse: a four percent rate means you need twenty five times your annual spending.`,
    trap: "Applying a US derived rate to a portfolio that is not US, a horizon that is not thirty years, or a spending pattern that is not constant.",
    playbook: "safe-withdrawal-rate",
    related: ["sequence-of-returns-risk", "rebalancing"],
  },
  {
    term: "Rebalancing",
    slug: "rebalancing",
    category: B,
    definition:
      "Rebalancing is selling assets that have grown beyond their target weight and buying those that have fallen below it, restoring a portfolio to its intended allocation.",
    body: `Its purpose is risk control rather than return enhancement. Left alone, a portfolio drifts towards whatever has performed best and becomes concentrated in it, usually just before it stops performing.

Rules based approaches, whether by calendar or by band, exist because doing it by judgement means never doing it.`,
    trap: "Reading it as a way to boost returns. It is a way to stop a portfolio quietly becoming something you did not choose.",
    playbook: "the-behaviour-gap",
    related: ["home-bias", "correlation", "safe-withdrawal-rate"],
  },
  {
    term: "Home bias",
    slug: "home-bias",
    category: B,
    definition:
      "Home bias is the tendency to hold far more of one's own country's assets than its share of the world market justifies, driven by familiarity rather than by analysis.",
    body: `For an investor whose salary, property and currency are already concentrated in one place, a portfolio tilted the same way multiplies a single exposure rather than diversifying it.

For expatriates the question is sharper still: home is not obviously the country of birth, the country of residence, or the currency of the salary.`,
    trap: "Applying a standard home bias tilt without asking which country is home. The advice assumes a resident with a matching pension and currency, which an expatriate rarely is.",
    playbook: "three-fund-portfolio",
    related: ["correlation", "rebalancing", "index-fund"],
  },
  {
    term: "Correlation",
    slug: "correlation",
    category: M,
    definition:
      "Correlation measures how two assets move relative to each other on a scale from minus one to plus one, and diversification only works to the extent that the correlation between holdings is below one.",
    body: `It is not stable. Assets that behave independently in calm markets frequently move together in a crisis, which is when the diversification was supposed to help.

A portfolio of several holdings that all need the same economic conditions is concentrated regardless of how many lines it has.`,
    trap: "Treating a historical correlation as a property of the asset. It is a description of a past period, and the periods that matter most are the ones where it changes.",
    playbook: "all-weather",
    related: ["home-bias", "rebalancing", "real-yield"],
  },
];
