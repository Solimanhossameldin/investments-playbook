/* Which framework a brief item belongs to.

   The brief has gone out most weekday mornings for weeks and has been opened
   at around thirty percent. It has produced one or two clicks per issue,
   because until this week there was nowhere for a reader to go. An engaged
   audience with no destination is the cheapest problem on this site to fix
   and the most expensive to leave.

   So every item now offers the framework behind its own number. Not a
   newsletter footer full of links, which people learn to ignore: one link,
   attached to the thing they have just read, going to the page that shows the
   arithmetic in full.

   The mapping is explicit rather than clever. The model that drafts the brief
   emits free-text tags, and asking it for a URL instead would invite it to
   invent one; asking it for a slug would invite it to invent that. It emits a
   tag, this file decides what that tag means, and `brieftest` fails the build
   if any slug here stops existing. A tag with no entry produces no link at
   all, which is the correct behaviour for an unknown subject.

   Add a tag here when the brief starts using it. Leaving one out costs a
   link. Guessing at one costs a reader's trust in every link on the site. */

export default {
  // rates and the curve
  rates: "what-bonds-are-for",
  "real rates": "inflation-and-real-returns",
  duration: "what-bonds-are-for",
  inflation: "inflation-and-real-returns",
  curve: "what-bonds-are-for",
  treasuries: "what-bonds-are-for",
  bonds: "what-bonds-are-for",

  // property, the Dubai side
  property: "net-rental-yield",
  dubai: "net-rental-yield",
  rent: "net-rental-yield",
  rents: "rent-increase-caps",
  yield: "net-rental-yield",
  yields: "net-rental-yield",
  "off-plan": "off-plan-irr",
  offplan: "off-plan-irr",
  mortgage: "mortgage-capacity",
  mortgages: "mortgage-capacity",
  "transaction costs": "transaction-cost-drag",
  "service charge": "service-charge-and-reserves",
  supply: "price-per-square-foot",
  handover: "off-plan-vs-ready",

  // portfolio and cross-asset
  equities: "what-diversification-does",
  correlation: "what-diversification-does",
  diversification: "what-diversification-does",
  gold: "gold-and-real-rates",
  metals: "gold-and-real-rates",
  oil: "inflation-and-real-returns",
  dollar: "currency-risk-and-the-peg",
  currency: "currency-risk-and-the-peg",
  fx: "currency-risk-and-the-peg",
  peg: "currency-risk-and-the-peg",
  valuation: "cape",
  cape: "cape",
  earnings: "expected-return-decomposition",
  buybacks: "expected-return-decomposition",
  multiples: "the-fed-model",
  "equity risk premium": "the-fed-model",
  drawdown: "drawdown-recovery-math",
  volatility: "position-sizing",
  liquidity: "liquidity-risk",
  crypto: "crypto-concentration-and-property",
  bitcoin: "crypto-concentration-and-property",

  // behaviour and structure
  behaviour: "the-behaviour-gap",
  tax: "residency-and-tax",
  residency: "residency-and-tax",
  fees: "fee-drag",
  withdrawal: "safe-withdrawal-rate",
  retirement: "safe-withdrawal-rate",
};
