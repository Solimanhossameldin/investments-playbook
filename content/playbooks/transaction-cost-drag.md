---
{
  "order": 4,
  "slug": "transaction-cost-drag",
  "title": "Transaction costs and the minimum hold period in Dubai",
  "category": "property",
  "tier": 1,
  "calculator": "net-rental-yield",
  "reviewed": "13 October 2026",
  "summary": "Buying and selling the same Dubai apartment costs 9.72% of the price with a mortgage on both sides, which is 2.11 years of net rent, and on the Land Department's own index holding longer did not improve the odds of clearing it.",
  "question": "What does it cost to buy and sell the same Dubai apartment?",
  "formula": "Round trip, computed from the schedules, not estimated\n\n  Buying        registration, agency, trustee, title deed,\n                map, knowledge and innovation fees\n  Borrowing     mortgage registration, trustee, title deed\n  Selling       agency, early settlement, release, registrar,\n                liability and clearance letters\n\n  Round trip    = buy + borrow + sell\n  As a rate     = round trip / price\n  In rent       = round trip / net operating income\n\nAnnualised drag = round trip rate / years held\n  This falls with the hold. It is arithmetic.\n\nWhat does not follow from it\n  The sale still has to clear the break-even rise:\n\n    break-even price = (price + entry + fixed exit)\n                       / (1 - exit commission rate)\n\n  Score that against the published index instead of\n  assuming it. For every entry month in the series,\n  and each hold length:\n\n    covered = index(entry + n months) / index(entry)\n              >= 1 + break-even rise\n\n  Share covered, all residential, 2011 to 2024\n    1 year   34%\n    3 years  52%\n    8 years  51%\n\n  The annualised drag fell by a factor of nearly\n  three across that span. The odds did not move.",
  "failureModes": [
    "The round trip is computed on one illustrative unit, at one price, with one loan to value and one commission rate. The method is general and the figures are not: a cash purchase, a different price or a seller who pays no commission all move it, and the page shows the cash case separately for that reason.",
    "The developer's no objection certificate is in neither the entry nor the exit stack, because no instrument sets it, no cap constrains it and no register publishes it. Every figure here is therefore a floor rather than an estimate.",
    "The hold test is run on overlapping windows. There are 159 months of published index, so the ten-year column contains 39 start months but only about a third of one independent decade, and the table prints both counts so the weaker rows cannot be read as the stronger ones.",
    "It is one market across one full cycle and part of another. A share of holds that cleared the round trip is a description of what the published series did, not a probability for what the next decade will do.",
    "The index is the all-residential sale index for the whole emirate, not the building you are buying in. A specific tower can and does diverge from it by more than the round trip costs.",
    "The series is nominal. It makes no allowance for inflation, so a hold that merely cleared the round trip in these terms did not necessarily preserve purchasing power.",
    "The test scores price only. Net rent is the other half of the return and it is the half that actually pays for the round trip, which is the point the last section makes rather than a gap in the method.",
    "Amortising a fixed cost over a longer hold does not make the cost smaller, only the annual figure. It is a legitimate way to look at it and a poor way to justify holding an asset you should sell."
  ],
  "whenToUse": "Before every purchase, as a test of whether your intended holding period is long enough to absorb the round trip out of rent rather than out of hope. Also before every sale, to see what the exit costs against the reason you are selling.",
  "sources": [
    {
      "name": "Dubai Land Department, residential sale index (Dubai Pulse open data)",
      "url": "https://www.dubaipulse.gov.ae/data/dld-records/dld_oa_residential_sale_index-open"
    },
    {
      "name": "Executive Council Resolution No. (30) of 2013 Approving Fees of the Land Department",
      "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/ECR%2030%20of%202013.html"
    },
    {
      "name": "Central Bank of the UAE, Amendments to Appendix 2 of the Regulations Regarding Bank Loans & Other Services Offered to Individual Customers (Regulation No. 29/2011), in force 8 October 2019",
      "url": "https://rulebook.centralbank.ae/en/entiresection/4406"
    },
    {
      "name": "Dubai Land Department, Property Sale Registration, service fees",
      "url": "https://dubailand.gov.ae/en/eservices/property-sale-registration/"
    },
    {
      "name": "Dubai Land Department, Registering the Sale of a Mortgaged Property, service fees",
      "url": "https://dubailand.gov.ae/en/eservices/registering-the-sale-of-a-mortgaged-property/"
    }
  ]
}
---

Property has a toll booth at both ends, and every page on this question prints the toll as a range. Six to seven per cent going in, two to three coming out, eight to ten for the round trip. Then it says the cost is amortised away by holding for the long term, and stops.

The range is unnecessary, because every line of it is set by a published schedule and can simply be added up. And the conclusion is two claims wearing one sentence. That a fixed cost divided by more years gives a smaller annual figure is arithmetic. That holding longer therefore made it more likely your sale cleared the round trip is a claim about the market, and the Land Department publishes the series that settles it.

It does not settle it the way the advice assumes.

## The round trip, from the schedules

The same illustrative one bedroom this site uses throughout: AED 1,500,000, 900 square feet, let at AED 105,000 a year, with AED 69,127 of net operating income. Bought with a mortgage and sold at the same price with AED 900,000 still outstanding.

| Leg | AED | Itemised, line by instrument, on |
|---|---|---|
| Buying: registration, agency, trustee, title deed, map, fees | 96,220 | [net rental yield](/playbooks/net-rental-yield/) |
| Borrowing: mortgage registration, trustee, title deed, fees | 7,283 | [net rental yield](/playbooks/net-rental-yield/) |
| Selling: agency, early settlement, release, registrar, bank letters | 42,285 | [selling well](/playbooks/selling-well/) |
| **Round trip** | **145,788** | |

That is **9.72% of the price**, and **2.11 years** of net rent. Buying for cash removes the mortgage registration going in and the settlement, release and bank letters coming out, which leaves **AED 127,720**, or **8.51%** of the price and **1.85 years** of net rent.

Both figures are floors. The developer's no objection certificate sits in neither, because no instrument sets it and no register publishes it, which is argued out on [selling well](/playbooks/selling-well/). Every other line traces to Resolution 30 of 2013, to the Central Bank's table of maximum permissible charges, or to a Land Department service page.

## The part of the conventional argument that is true

Divide a fixed cost by more years and the annual figure falls. There is nothing wrong with this table and it is the whole of what most pages on the subject are saying.

| Hold, years | Round trip of 9.72%, annualised |
|---|---|
| 1 | 9.72% |
| 2 | 4.86% |
| 3 | 3.24% |
| 4 | 2.43% |
| 5 | 1.94% |
| 6 | 1.62% |
| 7 | 1.39% |
| 8 | 1.22% |
| 9 | 1.08% |
| 10 | 0.97% |

Against a net yield of 4.33% the drag is most of the return in year one, a third of it by year three and a quarter of it by year five. On that reading the answer to "how long must I hold" is "longer", and the longer the better.

## The claim that does not follow

A sale does not pay the drag in annual instalments. It either clears the round trip or it does not, on one day, at one price. The price that clears it on this unit is **AED 1,648,915**, a rise of **9.93%**, slightly more than the 9.72% the round trip costs, because the exit commission is charged on the higher price too.

So the question is not what the cost looks like annualised. It is how often a Dubai apartment actually rose 9.93% over a given holding period. The Land Department publishes a monthly residential sale index as open data, and this site publishes [the series in full](/dubai-price-index/). It runs from March 2011 to May 2024, 159 months. Take every month in it as an entry, run each forward by each hold length, and score the result against the rise the break-even needs.

| Hold, years | Start months scored | Cleared the 9.93% | Share | Worst outcome | Entered | Independent windows |
|---|---|---|---|---|---|---|
| 1 | 147 | 50 | 34% | -9.9% | July 2018 | 12.3 |
| 2 | 135 | 55 | 41% | -12.5% | March 2018 | 5.6 |
| 3 | 123 | 64 | 52% | -15.6% | November 2017 | 3.4 |
| 4 | 111 | 57 | 51% | -17.2% | May 2017 | 2.3 |
| 5 | 99 | 50 | 51% | -15.3% | March 2015 | 1.6 |
| 6 | 87 | 45 | 52% | -18.0% | May 2015 | 1.2 |
| 7 | 75 | 40 | 53% | -11.8% | June 2014 | 0.9 |
| 8 | 63 | 32 | 51% | 0.4% | June 2013 | 0.7 |
| 9 | 51 | 36 | 71% | 6.4% | November 2011 | 0.5 |
| 10 | 39 | 32 | 82% | 5.3% | April 2011 | 0.3 |

Read the share column against the annualised one above.

**Between three years and eight years the annualised drag falls from 3.24% to 1.22%, and the share of holds that cleared the round trip moves from 52% to 51%.** A spread of two points across six years of extra patience. The cost per year fell by a factor of nearly three; the odds did not move at all.

The worst-outcome column is the other half of it, and it goes the wrong way too. The deepest shortfall is not in the one-year row. It is the **six year** hold entered in **May 2015**, down **18.0%** at sale, because a longer hold was long enough to contain the whole slide rather than to escape it. Holding through is only an answer if you are not selling, and a hold period is not a plan unless it is longer than the wait.

## What the long rows do and do not say

Nine and ten years clear 71% and 82%, and it is tempting to read that as patience finally paying. The independent-windows column is there to stop that reading. There are 159 months of published index. A ten-year hold needs 120 of them, so the 39 start months it scores overlap almost completely and amount to about a third of one independent decade. Every one of them also begins between April 2011 and May 2014, which is to say at the bottom of a run-up.

So the honest statement about the bottom of that table is that the series contains barely one long hold, and it was entered well. That is a fact about the window, not a property of waiting.

Three limits belong on the table rather than under it. The index is the all-residential sale index for the whole emirate, not the building you are buying in, and a single tower diverges from it by more than the round trip costs. The series is nominal, so a hold that merely cleared the round trip in these terms did not necessarily preserve purchasing power. And the test scores price alone, which is the point the last section turns on rather than a gap in the method.

The shape survives the obvious robustness check. Run the same test on the apartments series rather than all residential and the middle of the table is 52% at three years and 52% at four; on villas it falls from 54% at three years to 33% at seven. Neither series shows the steady improvement the advice implies, and one of them shows the opposite.

## So what actually pays for the round trip

The rent does, and it does it on a schedule rather than on a market.

The round trip on this unit is **2.11 years** of net operating income, or **1.85** if it was bought for cash. That figure does not depend on the index, on the cycle or on timing. It is a quotient of two numbers you can verify before you make the offer: the schedules that set the fees, and a net operating income computed from a service charge you have read off the approved budget and a rent you have checked against Ejari registrations.

Which reframes the minimum hold period usefully. It is not the number of years at which the annualised drag looks small. It is the number of years at which the round trip has been paid out of rent you actually collected, so that the sale price only has to be flat rather than higher. The borrowing line above is also what [refinancing costs a second time](/playbooks/refinancing-a-dubai-mortgage/), because the Land Department prices transferring a mortgage at the same rate as registering one.

On this unit that is just over two years of full occupancy, and that is why [break-even occupancy](/playbooks/break-even-occupancy/) is the companion calculation rather than an optional one, because a hold that was planned on 100% occupancy and ran at 80% has not paid for the round trip when the owner thinks it has. The other way to lower the bar is to lower the stack: the single largest negotiable line in it is the statutory half of the registration fee, worth AED 30,000 on this purchase, which [net rental yield](/playbooks/net-rental-yield/) traces to Article 3 of the resolution and almost nobody asks for.

## What this means before an offer

Three things, in order.

Compute the round trip from the actual schedules for the actual price, not from a range. Then divide it by a net operating income you have verified rather than one implied by a listing, which gives you the hold period in years of rent. Then ask whether you can hold that long without being a forced seller. The published series spent **73 months** falling from its May 2015 peak and **85 months** before it regained it, and that is the one measured instance of how long the wait can be.

If the answer is yes, the drag is a cost of doing business. If the answer is no, the round trip is being funded by the market rather than by the asset, and the table above is what that has looked like.

[The year you sell](/playbooks/the-year-you-sell/) is the timing question that sits on top of this one, [rent or buy](/playbooks/rent-vs-buy/) is the same arithmetic run against not owning at all, and the [minimum hold period](/glossary/minimum-hold-period/) is the term itself. [Run the net yield on your own figures](/calculators/net-rental-yield/) to get the denominator this page divides by.

Every instrument cited here is listed, with what it sets in its own words and a link to the official text, on the [Dubai property law register](/dubai-property-law/).
