---
{
  "order": 23,
  "slug": "price-per-square-foot",
  "title": "Price per square foot in Dubai",
  "category": "valuation",
  "tier": 1,
  "calculator": "net-rental-yield",
  "reviewed": "20 September 2026",
  "summary": "Dubai law lets a developer deliver a unit up to five percent smaller than the area you bought and owe you nothing for it, which on a AED 1,500,000 one bedroom is AED 75,000 of area paid for and not delivered, and raises the price per foot actually paid by 5.26%, so the denominator of this calculation carries a one-sided error band larger than the entire Land Department registration fee.",
  "formula": "Price per square foot\n  = purchase price / area on the Property Register\n\nWhich area, Article 13(1) of the Implementing Bylaw\n  the net area, not the brochure area, is what is\n  registered, and it is also what a service charge\n  is levied on\n\nIf a quoted area is g% larger than the registered area\n  the quoted rate is understated by  g / (100 + g)\n    10% larger  ->  9.09% understated\n  and the service charge per foot is understated by\n  exactly the same fraction, in the same direction\n\nIf a delivered area is s% short of the contracted area\n  the rate actually paid rises by  s / (100 - s)\n    5% short  ->  +5.26%\n  Article 13(3) compensates only a shortfall\n  greater than 5%, so the whole of that band is free\n\nComparison hierarchy, best first\n  1. achieved prices, same building, last 6-12 months\n  2. achieved prices, comparable buildings, same community\n  3. asking prices, same building        (weak)\n  4. district averages in a market report (near useless)\n\nThen, separately\n  net yield        = what the income is worth\n  price per foot   = what the box is worth\n  Both, every time.",
  "failureModes": [
    "The tables on this page are arithmetic, not a market measurement. The identities hold whatever the real spread between quoted and registered areas turns out to be, and this site does not hold a dataset that would let it say what that spread is.",
    "Article 13 governs the area in a sale agreement between a developer and a purchaser. A resale between two individuals is a contract matter, and the protection you are relying on is whatever the contract says rather than the Resolution.",
    "The Resolution adopts the net area for registration but does not define net area inside the instrument, so what is and is not counted comes from the sale agreement and the plan it refers to. Read both.",
    "The Resolution does not say whether compensation above the five percent threshold is calculated on the whole shortfall or only on the part exceeding it. That is a live question and it is settled in the contract or in court, not on a page.",
    "Asking prices are not transactions. In a soft market the gap between asking and achieved is widest precisely when the number matters most.",
    "District averages blend property types that have nothing to do with each other, which is why they are quoted in marketing and rarely in valuations.",
    "It ignores income entirely. A fairly priced box with a poor yield is still a poor rental investment.",
    "Off-plan prices per foot include an expectation about the future, so comparing them against completed units compares two different things.",
    "One transaction is not a market. Three or four comparable sales are the minimum before the number means anything.",
    "This is general information and not legal advice. An area dispute belongs with a lawyer and with the Land Department, not with a calculator."
  ],
  "whenToUse": "Before every offer, again before every listing when selling, and before signing any off-plan sale agreement, where the area clause decides how much of the denominator you are actually buying.",
  "sources": [
    {
      "name": "Executive Council Resolution No. (6) of 2010 approving the Implementing Bylaw of Law No. (13) of 2008, Article 13",
      "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2010/Executive%20Council%20Resolution%20No.%20(6)%20of%202010%20Approving%20the%20Implementing%20Bylaw%20of%20Law%20No.%20(13)%20of%202008.html"
    },
    {
      "name": "Law No. (13) of 2008 regulating the Interim Real Property Register in the Emirate of Dubai, Article 12",
      "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2008/Law%20No.%20(13)%20of%202008.html"
    },
    {
      "name": "Dubai Land Department, real estate transaction data",
      "url": "https://dubailand.gov.ae/en/open-data/real-estate-data/"
    },
    {
      "name": "Dubai Pulse, DLD transactions open dataset",
      "url": "https://www.dubaipulse.gov.ae/data/dld-transactions/dld_transactions-open"
    },
    {
      "name": "Dubai Land Department, eServices",
      "url": "https://dubailand.gov.ae/en/eservices/"
    }
  ]
}
---

Price divided by area. There is no page on this subject that gets the numerator wrong, and almost none that says anything at all about the denominator, which is where the entire difficulty lives.

A Dubai unit has an area in the brochure, an area on the floor plan, an area in the sale agreement and an area on the Property Register. Only the last of those has an instrument behind it, and the instrument says something about the other ones that nobody prices.

## Which area, and the instrument that decides it

Article 13 of the Implementing Bylaw of Law No. (13) of 2008, issued by [Executive Council Resolution No. (6) of 2010](https://dlp.dubai.gov.ae/Legislation%20Reference/2010/Executive%20Council%20Resolution%20No.%20(6)%20of%202010%20Approving%20the%20Implementing%20Bylaw%20of%20Law%20No.%20(13)%20of%202008.html), opens by settling it. As of that Resolution, the net area of a Real Property Unit will be adopted for the purposes of registration on the Real Property Register.

So the registered area is the net area, and the registered area is what appears on the [title deed](/glossary/title-deed/). It is also the area a service charge is levied on under the jointly owned property law, which is what makes the two errors below compound rather than cancel.

The Resolution adopts net area without defining it. Paragraph 5 says where the definition comes from instead: the net area of a Real Property Unit, as set forth in its sale agreement and plan, will be adopted as the basis for calculation. The plan referred to in your own contract is the authority on what is inside the number, which is a reason to read it before the marketing material rather than after.

## What a mismatched area does to the comparison

Suppose a quoted area is larger than the registered one: a balcony counted, a share of common space added, a plan superseded. The price does not move, so the rate reads low. The understatement is not the gap; it is the gap divided by one plus the gap.

On this site's illustrative one bedroom, AED 1,500,000 over a registered 900 sq ft, with the service charge at AED 18 a foot:

| Quoted area larger by | Area quoted | Price per foot it reads | Service charge it reads | Understated by |
|---|---|---|---|---|
| 0% | 900 sq ft | AED 1,666.67 | AED 18.00 | 0.00% |
| 5% | 945 sq ft | AED 1,587.30 | AED 17.14 | 4.76% |
| 10% | 990 sq ft | AED 1,515.15 | AED 16.36 | 9.09% |
| 15% | 1,035 sq ft | AED 1,449.28 | AED 15.65 | 13.04% |
| 20% | 1,080 sq ft | AED 1,388.89 | AED 15.00 | 16.67% |

Read the two middle columns together. One wrong denominator makes the unit look cheaper **and** makes the building look cheaper to run, because the service charge is a fixed annual amount set on the registered area and dividing it by a bigger number produces a smaller rate. The error flatters the property twice, in the two figures a buyer uses to decide, and it never flatters it in the other direction. That is why the [service charge](/playbooks/service-charge-and-reserves/) should be checked as a total in dirhams before it is checked as a rate per foot.

These rows are arithmetic. They are not a claim about how far apart the two areas typically are in Dubai, because that would need a dataset this site does not have.

## The five percent nobody prices

The second half of Article 13 is about off-plan, and it is the part worth the reading.

Paragraph 2 protects the buyer: unless otherwise agreed, any area in excess of the net area of the sold Real Property Unit will not be taken into account, and the Developer may not claim any payment for that excess area. A unit delivered larger is delivered larger for free.

Paragraph 3 is the one to price. The Developer must compensate the purchaser if the actual area of the Real Property Unit is less than its net area by more than five percent (5%). Read it as written. Compensation is owed where the shortfall *exceeds* five percent. Everything at or below five percent is lawful, uncompensated, and paid for.

That band has a price, and it is the denominator of your price per foot:

| Shortfall | Delivered area | Price per foot you actually paid | Uplift | Area paid for, not delivered | Article 13(3) |
|---|---|---|---|---|---|
| 1% | 891 sq ft | AED 1,683.50 | +1.01% | AED 15,000 | nothing due |
| 2% | 882 sq ft | AED 1,700.68 | +2.04% | AED 30,000 | nothing due |
| 3% | 873 sq ft | AED 1,718.21 | +3.09% | AED 45,000 | nothing due |
| 5% | 855 sq ft | AED 1,754.39 | +5.26% | AED 75,000 | nothing due |
| 7% | 837 sq ft | AED 1,792.11 | +7.53% | AED 105,000 | compensation due |
| 10% | 810 sq ft | AED 1,851.85 | +11.11% | AED 150,000 | compensation due |

The fourth row is the one that matters, because it is the largest shortfall a developer can deliver at no cost. **AED 75,000 of area, paid for and not delivered, and the price per foot actually paid is 5.26% above the price per foot agreed.**

Set that against the fee stack the [net rental yield](/playbooks/net-rental-yield/) page itemises for the same unit. The Land Department's registration fee on this purchase is AED 60,000 and the whole acquisition cost, every fee and the agency commission included, is AED 96,220. The largest free area shortfall is **125% of the entire registration fee** and 77.95% of the complete transaction stack. Buyers negotiate hard over the 4%. Almost nobody reads the area clause, and the area clause is the larger number.

Note also the asymmetry in the uplift itself. A shortfall of five percent does not raise your rate by five percent; it raises it by 5.26%, because the shortfall comes out of the denominator. Every row in that column is larger than the shortfall that produced it.

Two things the Resolution does not say, and the page will not pretend it does. It does not say whether compensation above the threshold is computed on the whole shortfall or only on the part exceeding five percent, because paragraph 4 says only that it is calculated on the agreed price. And it does not set a remedy other than compensation. If you want a shortfall below five percent to cost the developer something, that has to be written into the sale agreement, which is a negotiation to have before signing rather than a right to discover afterwards.

The parent law is consistent with this. Article 12 of [Law No. (13) of 2008](https://dlp.dubai.gov.ae/Legislation%20Reference/2008/Law%20No.%20(13)%20of%202008.html) says the area of a sold unit "will be deemed to be correct", that a developer may not claim more for an increase, and that a decrease must be compensated "unless such decrease is inconsequential". The Resolution is what puts a number on inconsequential.

## What to compare against

The hierarchy runs from most useful to least, and most buyers work it backwards.

**Recent transactions in the same building.** The gold standard. Same service charge, same association, same view corridors, same everything except floor and layout. Dubai publishes transaction data, so this is checkable rather than a matter of opinion.

**Recent transactions in comparable buildings in the same community.** Good, with adjustments for age, amenity and finish.

**Asking prices in the same building.** Weak. An asking price is a hypothesis, and in a soft market the gap between asking and achieved widens exactly when you most need the number to be right.

**District averages in a portal or a market report.** Nearly useless for a specific unit. A district average blends studios and penthouses, towers and villas, new and fifteen years old.

Recorded transaction prices by community, taken from Land Department records rather than from asking prices, are published at [Dubai by community](/communities/), and the whole-market series they sit inside is at the [Dubai price index](/dubai-price-index/). A community median is the anchor you compare a specific unit against. It is not a valuation of that unit, and the spread between the middle half of sales is the honest measure of how far a particular property can sit from the middle.

## The adjustments that actually matter

Floor level, within reason. View, which can be worth a great deal and can be lost when the plot opposite is developed. Layout efficiency, because two units of identical area can have very different usable space. Age and condition. Whether the sale was at arm's length, since a transfer between related parties tells you nothing about market value.

Also adjust for what is included. A furnished unit and an empty one at the same price per foot are not the same deal, and the furniture is worth far less to you than it cost the seller.

## Where it stops being useful

Price per square foot values the box. It does not value the income. Two units at the same price per foot with different service charges and different achievable rents have different [net yields](/playbooks/net-rental-yield/), and the yield is what you are buying if you are buying a rental.

Run both. Price per foot tells you whether you are paying a fair price for the asset. Net yield tells you whether the asset is worth owning.

Before an offer, the area is one of the things worth verifying against the register rather than the listing, alongside everything else on the [due diligence](/playbooks/due-diligence-before-an-offer/) list. Off-plan, the area clause belongs in the same reading as the payment plan and the default schedule on the [off-plan](/playbooks/off-plan-irr/) page.

Every instrument cited here is listed, with what it sets in its own words and a link to the official text, on the [Dubai property law register](/dubai-property-law/).
