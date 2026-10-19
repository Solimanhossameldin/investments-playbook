---
{
  "order": 450,
  "slug": "when-the-valuation-comes-in-low",
  "title": "When the bank values a Dubai property below the price",
  "category": "property",
  "tier": 1,
  "calculator": "net-rental-yield",
  "reviewed": "17 October 2026",
  "question": "What happens if the bank's valuation is lower than the price I agreed in Dubai?",
  "summary": "The Central Bank caps a Dubai mortgage against the value of the property and the Land Department charges its fee on the value of the sale contract, so a 5% down-valuation asks the buyer for AED 59,850 in cash the week of transfer, almost exactly the 4% registration fee.",
  "formula": "Two instruments, two denominators, one flat\n\n  The loan is capped on the VALUATION\n    Article 3: a percentage of the value of the property\n  The fee is charged on the PRICE\n    Resolution 30: 4% of the value of the sale contract\n\n  Nothing requires the two figures to agree.\n\nWith a valuation below the agreed price\n\n  valuation = price - shortfall\n  loan      = band x min(price, valuation)\n            = band x valuation\n\n  deposit   = price - loan        (the price is still owed)\n  fees      = charged on the price, so unchanged\n  cash      = deposit + fees\n\n  extra cash = band x shortfall\n\nThree consequences, in order of surprise\n\n  1. Exposure rises WITH the band, so the best financed\n     buyer has the most cash at risk, not the least\n       80% band, 5% short   AED 59,850\n       60% band, 5% short   AED 44,888\n       50% band, 5% short   AED 37,406\n\n  2. The fee stack does not move. The full 4% is paid on\n     a price the bank declined to lend against.\n\n  3. The income tests get EASIER, never harder, because\n     the loan shrank. A down-valuation is a cash event\n     and never an affordability one.\n\nThe comparison worth remembering\n  extra cash = the registration fee at a 5.01% shortfall",
  "failureModes": [
    "The arithmetic is run on one illustrative unit at one price and one band. The method is general, the figures are not, and the direction of every result follows from the band rather than from the example.",
    "It assumes the lender applies the cap to the lower of price and valuation, which is what a cap expressed against the value of the property means. A lender that is more generous than the regulation requires is not modelled, and a buyer should not plan on meeting one.",
    "It treats the agreed price as fixed. In practice the first move is to reopen the price, and whether that works is a question about the seller's position rather than about arithmetic.",
    "What happens if the buyer walks away is deliberately absent. The deposit, and whether it is forfeit, is a term of the sale contract. No instrument sets it, no cap constrains it and no register publishes it, so it is not estimated here.",
    "The valuation fee itself is excluded. Appendix 2 of the Central Bank's fee caps publishes no maximum for a valuation fee, this site holds no dataset for it, and it is therefore left out rather than guessed at, which makes every total here a floor.",
    "A second valuation, or a challenge to the first, may be possible and is a matter of the lender's own policy rather than of regulation. Policy is arguable in a way that a regulation is not, and the page says nothing about the odds.",
    "It does not model what a down-valuation implies about the price. A valuer disagreeing with the contract is information about the purchase, and the last section is about that rather than about how to fund the gap.",
    "This is general information and not financial or legal advice."
  ],
  "whenToUse": "Before signing a sale contract on a mortgaged purchase, so the cash you hold back covers a shortfall rather than only the deposit. And on the day a valuation comes in low, to size the gap before answering the agent who is telling you it is small.",
  "sources": [
    {
      "name": "Central Bank of the UAE, Regulations Regarding Mortgage Loans (Circular No. 31/2013), Article 3, Important Ratios",
      "url": "https://rulebook.centralbank.ae/en/rulebook/article-3-important-ratios"
    },
    {
      "name": "Executive Council Resolution No. (30) of 2013 Approving Fees of the Land Department, Article 3 and Schedule",
      "url": "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/ECR%2030%20of%202013.html"
    },
    {
      "name": "Dubai Land Department, Property Sale Registration, service fees",
      "url": "https://dubailand.gov.ae/en/eservices/property-sale-registration/"
    },
    {
      "name": "Central Bank of the UAE, Amendments to Appendix 2 of the Regulations Regarding Bank Loans & Other Services Offered to Individual Customers (Regulation No. 29/2011), in force 8 October 2019",
      "url": "https://rulebook.centralbank.ae/en/entiresection/4406"
    }
  ]
}
---

Two instruments price the same flat, and they use different numbers.

The Central Bank caps the loan at a percentage of **the value of the property**. The Land Department charges its registration fee on **4% of the value of the sale contract**. Nothing requires a valuer and a contract to agree, and when they do not, the loan is computed on the smaller figure while the fee is computed on the larger one.

Every mortgage calculator in Dubai, including the ones on this site until today, quietly assumes the two are the same number. Every competing page on this question describes the problem in sentences and then declines to size it. So here is the size of it.

## The gap, on the illustrative unit

The same one bedroom used throughout this site: **AED 1,500,000** agreed, bought by an expatriate on a first home, which [Article 3](https://rulebook.centralbank.ae/en/rulebook/article-3-important-ratios) allows at a **maximum 80% of the value of the property**.

| Valuation below price | Valuation | Loan | Effective LTV on the price | Cash to close | Extra cash |
|---|---|---|---|---|---|
| 0% | 1,500,000 | 1,200,000 | 80.00% | 403,690 | 0 |
| 2.5% | 1,462,500 | 1,170,000 | 78.00% | 433,615 | 29,925 |
| 5% | 1,425,000 | 1,140,000 | 76.00% | 463,540 | 59,850 |
| 7.5% | 1,387,500 | 1,110,000 | 74.00% | 493,465 | 89,775 |
| 10% | 1,350,000 | 1,080,000 | 72.00% | 523,390 | 119,700 |

Read the two right-hand columns together. A **5%** down-valuation on this flat asks the buyer for **AED 59,850** that was not in any plan, and it does it in the week of transfer.

Set that beside the one number every Dubai buyer does know. The Land Department's registration fee on this purchase is **AED 60,000**. Solving it exactly rather than reading it off the table, the extra cash a shortfall demands equals the whole registration fee at a shortfall of **5.01%**.

**A five per cent down-valuation costs what the 4% fee costs.** One of those two numbers is argued over in every transaction in the emirate. The other is not budgeted for at all.

In the idiom the rest of this site uses: that extra cash is **0.87 years** of the net operating income the flat produces, which [net rental yield](/playbooks/net-rental-yield/) computes line by line.

## Why the fee does not fall with the valuation

Because it is not charged on the valuation. Resolution 30 of 2013 charges **4% of the value of the sale contract**, and the sale contract still says AED 1,500,000. The agency commission is a percentage of the same contract. The trustee's fee is banded on the sale value.

So the fee stack is indexed to the price and the loan is indexed to the valuation, and a down-valuation moves one without touching the other. The buyer pays the full **AED 96,220** acquisition stack on a price the bank has just declined to lend against. The only line that falls at all is the mortgage registration fee, a quarter of one per cent of a loan that got smaller, which is why the extra cash works out at **79.8%** of the shortfall rather than the full 80%.

## The result that surprises people

The extra cash is the band multiplied by the shortfall. So exposure to a down-valuation **rises with the loan to value band**, and the buyer who qualified for the best financing is the one with the most cash at risk.

| Band | Rate | Extra cash on a 5% shortfall | As a share of price |
|---|---|---|---|
| Expatriate, first home below AED 5 million | 80% | 59,850 | 3.99% |
| Expatriate, second or subsequent | 60% | 44,888 | 2.99% |
| Anyone, bought off plan | 50% | 37,406 | 2.49% |

Article 3 is blunt that the last of those is not negotiable: **the maximum LTV for mortgages on property being purchased off plans is 50% regardless of purpose, value, or category of purchaser**.

The ordering is the opposite of the intuition. Leverage is usually described as the thing that makes a purchase fragile, and on the income side it is. Here the high-leverage buyer is fragile for a different reason: a larger share of the price is coming from a lender whose number can move, so a given disagreement about value translates into a larger demand for cash. An investor at the 60% band absorbs the same shortfall with **AED 14,962** less.

## The test that does not get harder

A down-valuation shrinks the loan, and both of the income tests in Article 3 are tests on the size of the loan. So neither can bind harder than it did before.

On this purchase at a stressed rate of 6%, the income the binding test needs falls from **AED 15,463** a month to **AED 14,690**, which is **AED 773** a month easier, because the loan fell from AED 1,200,000 to AED 1,140,000. [Mortgage capacity](/playbooks/mortgage-capacity/) sets out the three caps and which of them actually decides.

That matters for what you do next. A down-valuation can only ever fail you on cash. It is not an affordability problem, the bank has not changed its mind about you, and nothing about your income needs re-arguing. Which means the question in the room is narrow and answerable: can you put your hands on the gap in the time the contract allows.

## The three answers, and what each costs

**Reopen the price.** The valuation is an argument that the contract is high, made by somebody the buyer is not paying. Settling at the valuation removes the gap entirely and lowers the fee stack with it, because the fee follows the contract: at AED 1,425,000 the registration fee falls to AED 57,000. Whether a seller accepts is a question about their position, not about arithmetic, and in a market with other buyers the answer is usually no. It is still the move to make first, because it is the only one that costs nothing to attempt.

**Fund the gap.** The table above is the price of this option, and it is a cash price rather than a financing one. The gap cannot be borrowed on the property, because the cap is the cap. Borrowing it unsecured to complete a mortgaged purchase puts a new monthly commitment into the debt burden ratio the lender has already assessed, which is the one way to turn a cash problem into the affordability problem it was not.

**Walk away.** What this costs is a term of your sale contract, and there is no figure for it on this page. No instrument sets a deposit, no cap constrains it, and no register publishes it, so the honest statement is that it is whatever you signed. Read that clause before the valuation is instructed rather than after, in the same pass as everything in [due diligence before an offer](/playbooks/due-diligence-before-an-offer/).

## What the valuation is telling you

There is a fourth reading, and it is the one worth sitting with.

A valuer paid by the lender, with no commission in the transaction, has looked at the same flat and come to a lower number than the one in the contract. That is the only opinion on the price anyone involved is not paid to inflate. It may be conservative, it may be using comparables from a slower quarter, and a buyer who has verified the [price per square foot against genuine recent transactions in the same building](/playbooks/price-per-square-foot/) is entitled to argue with it.

But a buyer who has done none of that work, and who is now being told by the agent that the valuation is a formality, is in a conversation where exactly one participant has no stake in the price. The cheapest response to a down-valuation is to do the arithmetic the valuer did, before deciding the valuer is wrong.

## What to do before any of this happens

Hold back the shortfall, not just the deposit. On this purchase the cash required at the 80% band is **AED 403,690** with the valuation at the price, which is already **26.91%** against an advertised 20%, as [mortgage capacity](/playbooks/mortgage-capacity/) sets out. A buyer who can also cover a five per cent down-valuation needs **AED 463,540**, or **30.90%** of the price.

That is the number to search below. It is not the deposit, and it is not the deposit plus fees. It is the deposit, plus fees, plus the band times a shortfall you have decided in advance you could absorb. [Run the net yield on your own figures](/calculators/net-rental-yield/) to see what the extra cash costs in years of rent, and read [transaction costs and the minimum hold period](/playbooks/transaction-cost-drag/) for what the whole round trip comes to once the purchase completes.

Every instrument cited here is listed, with what it sets in its own words and a link to the official text, on the [Dubai property law register](/dubai-property-law/).
