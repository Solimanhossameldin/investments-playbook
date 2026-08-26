import { esc, copy } from "../lib.mjs";
import { leadBand } from "./layout.mjs";

const n = (id, label, def, opts = {}) => ({ kind: "num", id, label, def, ...opts });
const rng = (id, label, def, min, max, step, suffix = "%") => ({ kind: "range", id, label, def, min, max, step, suffix });
const sel = (id, label, options, def) => ({ kind: "sel", id, label, options, def });

export const CALCULATORS = [
  {
    slug: "net-rental-yield",
    name: "Net Rental Yield",
    category: "Property",
    blurb: "Gross yield is what the brochure shows you. This is what reaches your account.",
    playbook: "net-rental-yield",
    intro:
      "Gross yield divides rent by price and stops there. It ignores the four to eight percent of the purchase price you spend on the day you buy, and it ignores every recurring cost that lands between the tenant paying and you banking. This calculator does not.",
    note: "Defaults are set to Dubai: 4 percent Dubai Land Department transfer fee, 2 percent agency commission plus 5 percent VAT on that commission, and a service charge quoted per square foot per year. Change any of them for another market. Nothing you type leaves your browser.",
    fields: [
      n("price", "Purchase price", 1500000, { prefix: "AED" }),
      n("rent", "Annual rent achieved", 105000, { prefix: "AED" }),
      n("size", "Size, square feet", 900),
      n("sc", "Service charge per sq ft per year", 18, { prefix: "AED" }),
      rng("mgmt", "Management fee, share of rent", 5, 0, 15, 0.5),
      rng("vac", "Vacancy allowance, share of the year", 8, 0, 30, 1),
      rng("maint", "Maintenance reserve, share of rent", 5, 0, 20, 0.5),
      n("insur", "Insurance and other fixed costs, per year", 1500, { prefix: "AED" }),
      rng("dld", "Transfer fee", 4, 0, 12, 0.1),
      rng("agency", "Agency commission", 2, 0, 6, 0.25),
      rng("vat", "VAT on the commission", 5, 0, 25, 1),
      n("closing", "Other closing costs, trustee and admin", 4600, { prefix: "AED" }),
      rng("ltv", "Mortgage, share of price", 0, 0, 80, 5),
      rng("rate", "Mortgage rate", 4.5, 0, 12, 0.1),
      n("term", "Mortgage term, years", 25),
    ],
    outputs: [
      ["gross", "Gross yield", "pct"],
      ["opex", "Total annual running cost", "cur"],
      ["noi", "Net operating income", "cur"],
      ["acq", "Acquisition costs on day one", "cur"],
      ["invested", "Total cash invested", "cur"],
      ["debt", "Annual mortgage payments", "cur"],
      ["coc", "Cash on cash return", "pct"],
      ["breakeven", "Break-even occupancy", "pct"],
    ],
    hero: ["net", "Net yield on total outlay", "pct"],
  },

  {
    slug: "rent-vs-buy",
    name: "Rent versus Buy",
    category: "Property",
    blurb: "The unrecoverable cost of owning against the unrecoverable cost of renting.",
    playbook: "rent-vs-buy",
    intro:
      "Rent is not money down the drain and a mortgage payment is not saving. The only fair comparison is unrecoverable cost against unrecoverable cost: the rent you pay, against the costs of owning that you never get back. Everything else is a transfer between your own pockets.",
    note: "This is the five percent rule, recalibrated for a market with no annual property tax, where the service charge does that work instead. The break-even is the hold period at which the round-trip transaction cost has been amortised away.",
    fields: [
      n("price", "Property price", 1500000, { prefix: "AED" }),
      n("rent", "Annual rent for the same home", 90000, { prefix: "AED" }),
      n("sc", "Annual service charge and maintenance", 20000, { prefix: "AED" }),
      rng("proptax", "Annual property tax", 0, 0, 3, 0.05),
      rng("deposit", "Deposit", 25, 0, 100, 5),
      rng("rate", "Mortgage rate", 4.5, 0, 12, 0.1),
      rng("alt", "Return you would earn on the deposit instead", 6, 0, 15, 0.25),
      rng("growth", "Expected annual price growth", 3, -5, 12, 0.25),
      rng("rentgrowth", "Expected annual rent growth", 3, -5, 12, 0.25),
      rng("roundtrip", "Round-trip transaction cost", 9, 0, 20, 0.5),
      n("hold", "Years you expect to hold", 7),
    ],
    outputs: [
      ["ownCost", "Unrecoverable cost of owning, year one", "cur"],
      ["rentCost", "Unrecoverable cost of renting, year one", "cur"],
      ["ratio", "Owning cost as a share of price", "pct"],
      ["tcost", "Round-trip transaction cost in money", "cur"],
      ["ownTotal", "Total cost of owning over the hold", "cur"],
      ["rentTotal", "Total cost of renting over the hold", "cur"],
      ["breakeven", "Break-even hold period, years", "num"],
    ],
    hero: ["verdict", "Over your hold period", "text"],
  },

  {
    slug: "off-plan-irr",
    name: "Off-Plan Payment Plan IRR",
    category: "Property",
    blurb: "Two plans with the same headline price are not the same price.",
    playbook: "off-plan-irr",
    intro:
      "A developer offering sixty forty on a three year build and one offering a post-handover plan over four years are quoting the same number and charging you two different prices. Money you pay later costs you less, because the money you keep is earning. This discounts every instalment back to today.",
    note: "The discount rate is what your money would earn elsewhere. Use your realistic alternative, not a hopeful one. A rate of zero makes both plans identical, which is exactly the mistake this calculator exists to prevent.",
    fields: [
      n("price", "Headline price, both plans", 1500000, { prefix: "AED" }),
      rng("disc", "Your discount rate, what your money earns elsewhere", 6, 0, 20, 0.25),
      n("months", "Months to handover", 30),
      { kind: "head", label: "Plan A" },
      rng("aDown", "Down payment now", 20, 0, 100, 1),
      rng("aBuild", "Paid during construction", 60, 0, 100, 1),
      rng("aHand", "Paid at handover", 20, 0, 100, 1),
      rng("aPost", "Paid after handover", 0, 0, 100, 1),
      n("aPostMonths", "Months of post-handover payments", 0),
      { kind: "head", label: "Plan B" },
      rng("bDown", "Down payment now", 10, 0, 100, 1),
      rng("bBuild", "Paid during construction", 30, 0, 100, 1),
      rng("bHand", "Paid at handover", 20, 0, 100, 1),
      rng("bPost", "Paid after handover", 40, 0, 100, 1),
      n("bPostMonths", "Months of post-handover payments", 48),
    ],
    outputs: [
      ["aPV", "Plan A, cost in today's money", "cur"],
      ["aEff", "Plan A, effective discount to headline", "pct"],
      ["bPV", "Plan B, cost in today's money", "cur"],
      ["bEff", "Plan B, effective discount to headline", "pct"],
      ["gap", "Difference in today's money", "cur"],
      ["checkA", "Plan A instalments total", "pct"],
      ["checkB", "Plan B instalments total", "pct"],
    ],
    hero: ["winner", "Cheaper in today's money", "text"],
  },

  {
    slug: "safe-withdrawal-rate",
    name: "Safe Withdrawal Rate",
    category: "Portfolio",
    blurb: "What is my number, arbitrated across the three rates the research currently supports.",
    playbook: "safe-withdrawal-rate",
    intro:
      "There is no single safe withdrawal rate, there is a range, and the honest thing to do is show you all of it. Bengen's original work gave four percent. His later revision, with a wider asset mix, raised it. Morningstar's forward-looking work, starting from today's valuations, lowered it. Your number sits somewhere in that spread.",
    note: "These are real, inflation adjusted rates applied to a portfolio you have not yet built. Sequence of returns risk means the order of your returns matters as much as the average, which is why the conservative column exists. This is arithmetic, not a plan. A plan needs a regulated adviser.",
    fields: [
      n("spend", "Annual spending you want to fund, in today's money", 180000, { prefix: "AED" }),
      n("other", "Other annual income, pension or rent", 0, { prefix: "AED" }),
      n("have", "What you have invested today", 400000, { prefix: "AED" }),
      n("save", "What you add each year", 90000, { prefix: "AED" }),
      rng("real", "Expected real return, after inflation", 5, 0, 12, 0.25),
      rng("custom", "Your own withdrawal rate", 4, 2, 8, 0.1),
    ],
    outputs: [
      ["gap", "Annual gap the portfolio must fund", "cur"],
      ["cons", "Target at 3.9 percent, the conservative case", "cur"],
      ["classic", "Target at 4.0 percent, the classic rule", "cur"],
      ["opt", "Target at 4.7 percent, the revised case", "cur"],
      ["yourTarget", "Target at your own rate", "cur"],
      ["years", "Years to reach the classic target", "num"],
      ["firstYear", "What the classic target pays in year one", "cur"],
    ],
    hero: ["classic", "Portfolio needed at four percent", "cur"],
  },

  {
    slug: "estate-tax-exposure",
    name: "US Estate Tax Exposure",
    category: "Tax and structure",
    blurb: "The sixty thousand dollar threshold most non-US investors have never heard of.",
    playbook: "fund-domicile",
    intro:
      "If you are not a US person and you hold US domiciled shares or funds, US estate tax can apply to everything above sixty thousand dollars of US situs assets, at rates rising to forty percent. Holding the same underlying index through an Irish domiciled UCITS fund generally removes that exposure entirely, and usually cuts the dividend withholding in half.",
    note: "This is a rough exposure indicator, not a tax computation. Treaty positions, joint ownership, trusts, domicile and your own citizenship all change the answer. The United Arab Emirates has no US estate tax treaty. Take advice from a cross-border tax professional before you act on any of this.",
    fields: [
      n("us", "Value of US domiciled holdings, US dollars", 500000, { prefix: "USD" }),
      rng("divYield", "Dividend yield on those holdings", 1.5, 0, 8, 0.1),
      rng("wht", "Your dividend withholding rate on US domiciled funds", 30, 0, 30, 1),
      rng("ucitsWht", "Withholding suffered inside an Irish UCITS", 15, 0, 30, 1),
      n("years", "Years you expect to hold", 20),
    ],
    outputs: [
      ["exempt", "Exempt amount for a non-US person", "usd"],
      ["taxable", "Estate value above the exemption", "usd"],
      ["effective", "Effective estate tax rate on the holding", "pct"],
      ["divUS", "Annual dividend tax, US domiciled", "usd"],
      ["divUCITS", "Annual dividend tax, Irish UCITS", "usd"],
      ["divSaving", "Annual dividend saving from the Irish fund", "usd"],
      ["divSavingTotal", "Dividend saving over the holding period", "usd"],
    ],
    hero: ["estateTax", "Estimated US estate tax exposure", "usd"],
  },

  {
    slug: "lump-sum-vs-dca",
    name: "Lump Sum versus DCA",
    category: "Portfolio",
    blurb: "Vanguard tested it. Investing immediately won roughly two thirds of the time.",
    playbook: "lump-sum-vs-dca",
    intro:
      "Feeding money in gradually feels safer, and sometimes it is. But markets rise more often than they fall, so money held back is money not compounding. Vanguard's work across US, UK and Australian markets found investing immediately beat cost averaging in roughly two thirds of the rolling periods tested. This shows you the expected cost of waiting on your own numbers.",
    note: "This is an expected-value comparison, not a forecast. Cost averaging still wins in the third of periods where the market falls while you are feeding money in, and the case for it is emotional rather than mathematical. That is a real reason, it is just not an arithmetic one.",
    fields: [
      n("amount", "Amount to invest", 500000, { prefix: "AED" }),
      n("months", "Months you would spread it over", 12),
      rng("ret", "Expected annual return once invested", 7, -5, 20, 0.25),
      rng("cash", "Return on the money still in cash", 4, 0, 12, 0.25),
      n("horizon", "Total horizon, years", 10),
    ],
    outputs: [
      ["lump", "Lump sum, value at the horizon", "cur"],
      ["dca", "Cost averaging, value at the horizon", "cur"],
      ["gap", "Expected cost of waiting", "cur"],
      ["gapPct", "As a share of the amount invested", "pct"],
      ["avgIn", "Average months your money was uninvested", "num"],
      ["breakeven", "Market fall during the averaging period that would flip it", "pct"],
    ],
    hero: ["verdict", "On these assumptions", "text"],
  },
];

const FAQ = {
  "net-rental-yield": [
    { q: "What is a good net rental yield?", a: "In Dubai, gross yields of six to nine percent are common and net yields of four to six percent are realistic once the service charge, management, vacancy and acquisition costs are taken out. The gap between the two is usually two to three percentage points. If a listing quotes a yield without saying which one it is, assume gross." },
    { q: "Why does the calculator divide by more than the purchase price?", a: "Because you spent more than the purchase price. The transfer fee, the commission, the VAT on the commission and the trustee fee are real money you will never see again. Dividing income by price alone flatters the return by roughly the size of those costs, which in Dubai is around six to seven percent." },
    { q: "How much should I assume for service charges?", a: "Service charges are quoted per square foot per year and vary enormously by building, from around twelve dirhams in a simple mid-market tower to over thirty in a serviced or waterfront development. Get the actual figure from the owners association before you buy. It is the single most under-modelled cost in Dubai property." },
    { q: "What is break-even occupancy?", a: "The share of the year the property must be let for the income to cover the running costs and any mortgage. Above it you are profitable, below it you are funding the asset from your salary. It is the number that tells you how much bad luck the deal can absorb." },
  ],
  "rent-vs-buy": [
    { q: "Is renting really throwing money away?", a: "No. Renting buys you shelter and flexibility, and the rent is the whole cost. Owning also has costs you never get back: the interest, the service charge, the maintenance, the opportunity cost of your deposit, and the transaction costs spread over your hold. The honest comparison is unrecoverable cost against unrecoverable cost." },
    { q: "What is the five percent rule?", a: "A shorthand that the annual unrecoverable cost of owning tends to come to about five percent of the property value: roughly one percent maintenance, one percent property tax, and three percent cost of capital. If annual rent is below that figure, renting is cheaper on cash flow. In a market with no property tax the components shift but the method holds." },
    { q: "Why does the hold period matter so much?", a: "Because the round trip cost of buying and selling is front loaded and does not care how long you stay. Spread over two years it is crushing. Spread over ten it is a rounding error. The break-even output tells you the point at which owning stops paying a penalty for the transaction." },
    { q: "Does price growth not settle the argument?", a: "It changes it, and the calculator includes it, but growth is the one input you cannot know. Notice how much of the answer swings when you move that slider. Any case for buying that depends on a growth assumption you cannot defend is a bet, not a calculation." },
  ],
  "off-plan-irr": [
    { q: "Why compare payment plans at all if the price is the same?", a: "Because a dirham paid in four years is not a dirham paid today. If your money can earn six percent elsewhere, an instalment due in four years costs you about seventy nine percent of its face value in today's money. Two plans at the same headline price can differ by ten percent or more in real cost." },
    { q: "What discount rate should I use?", a: "What your money would realistically earn if you did not hand it to the developer. For most people that is a cash or bond rate, not a hoped-for equity return. Using a high rate flatters back-loaded plans, so be conservative or you will talk yourself into the wrong plan." },
    { q: "Is a post-handover plan always better?", a: "In present value terms it usually is, and that is why developers charge for it, often through a higher headline price on that plan. Compare the plans at their actual headline prices, not at a single price, and the advantage frequently shrinks or disappears." },
    { q: "What does this calculator not include?", a: "Handover-date risk, which is the real risk in off-plan. It also excludes the service charges that start at handover whether or not you have a tenant, the leasing lag before first rent, and the possibility that the market price at handover is below your purchase price. Those belong in a separate stress test." },
  ],
  "safe-withdrawal-rate": [
    { q: "Is the four percent rule still valid?", a: "It is a starting point that is actively contested. Bengen's original work produced four percent, his later revision with a broader asset mix raised it, and Morningstar's forward looking work from current valuations has been lower. The honest answer is a range, which is why this calculator shows three at once." },
    { q: "Why does the order of returns matter?", a: "A bad decade at the start of drawdown does far more damage than the same decade at the end, because you are selling units while they are cheap and they never come back. This is sequence of returns risk, and it is the main reason the conservative column exists." },
    { q: "Should I use a nominal or a real return?", a: "Real, after inflation. All three withdrawal rates assume you increase your spending with inflation each year, so the return assumption has to be on the same basis or you will double count." },
    { q: "What does this deliberately not do?", a: "It does not model taxes, healthcare, a mortgage running into retirement, or guardrails that cut spending in bad years. It gives you the size of the target. Getting to it, and drawing from it safely, is work for a regulated adviser." },
  ],
  "estate-tax-exposure": [
    { q: "Does US estate tax really apply to a non-US investor?", a: "Yes, on US situs assets, which includes shares in US companies and US domiciled funds, held by someone who is not a US citizen or domiciliary. The exempt amount for a non-US person is sixty thousand dollars, against roughly fourteen million for a US person. Rates rise to forty percent above it." },
    { q: "How does an Irish domiciled fund change this?", a: "A fund domiciled in Ireland is an Irish situs asset, not a US one, so it generally sits outside US estate tax however much US stock it holds inside. It also benefits from the Ireland to United States treaty rate on dividends, typically fifteen percent at fund level, against thirty percent withheld from a Gulf resident holding the US fund directly." },
    { q: "Is the ticker the same fund?", a: "No. VOO and CSPX track the same index and are different legal products in different jurisdictions with different tax outcomes. Check the domicile in the fund factsheet, not the index name. Most Gulf-based brokers offer both." },
    { q: "Can I rely on this figure?", a: "No. It is an indicator built to show you the size of a problem you may not have known you had. Treaty relief, joint ownership, trust structures, your citizenship and your domicile all change the answer materially. This is the point at which you pay a cross-border tax professional." },
  ],
  "lump-sum-vs-dca": [
    { q: "Which actually wins?", a: "Investing immediately, roughly two thirds of the time, across the markets and periods Vanguard tested. The reason is unglamorous: markets rise more often than they fall, so cash held back is cash not compounding. The remaining third is not a rounding error though." },
    { q: "So is cost averaging a mistake?", a: "Not necessarily. It is a worse expected outcome bought in exchange for a better worst case and a much better chance you actually go through with it. If spreading the money in is the difference between investing and not investing, spread it in. Just do it knowing the price." },
    { q: "Does this apply to money I earn monthly?", a: "No. Investing each salary as it arrives is not cost averaging, it is investing immediately with the money you have. The question only arises when you are holding a lump you could deploy today, from a bonus, a sale or an inheritance." },
    { q: "What would flip the answer?", a: "A market fall during your averaging window deep enough to more than offset the return you gave up by holding cash. The calculator shows that threshold. If you think a fall of that size is likely, the honest conclusion is that your asset allocation is wrong, not your deployment schedule." },
  ],
};
for (const c of CALCULATORS) c.faq = FAQ[c.slug];

function field(f) {
  if (f.kind === "head") return `<h4 style="font-family:var(--serif);font-size:1.3rem;margin:30px 0 14px;padding-top:18px;border-top:1px solid var(--hair-light)">${esc(f.label)}</h4>`;
  if (f.kind === "range")
    return `<div class="field">
    <label for="f-${f.id}">${esc(f.label)}<span class="slider-val" id="v-${f.id}">${f.def}${f.suffix || ""}</span></label>
    <input type="range" id="f-${f.id}" data-f="${f.id}" min="${f.min}" max="${f.max}" step="${f.step}" value="${f.def}">
  </div>`;
  if (f.kind === "sel")
    return `<div class="field"><label for="f-${f.id}">${esc(f.label)}</label>
    <select id="f-${f.id}" data-f="${f.id}">${f.options.map((o) => `<option value="${esc(o)}"${o === f.def ? " selected" : ""}>${esc(o)}</option>`).join("")}</select></div>`;
  return `<div class="field"><label for="f-${f.id}">${esc(f.label)}${f.prefix ? ` <span style="color:var(--gold-muted)">${esc(f.prefix)}</span>` : ""}</label>
  <input type="number" inputmode="decimal" id="f-${f.id}" data-f="${f.id}" value="${f.def}" step="any"></div>`;
}

export function calcIndex({ site }) {
  const body = `<section class="band"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Free, no sign up, nothing stored</p>
    <h2>Calculators</h2>
    <p>Every framework on this site ends in a number. These produce yours. They run entirely in your browser: nothing you type is sent anywhere.</p>
  </div>
  <div class="grid grid--3">
    ${CALCULATORS.map(
      (c) => `<a class="card" href="/calculators/${esc(c.slug)}/">
      <div class="card__k">${esc(c.category)}</div>
      <div class="card__t">${esc(c.name)}</div>
      <p class="card__d">${esc(copy(c.blurb))}</p>
      <div class="card__f">Open calculator</div>
    </a>`
    ).join("")}
  </div>
</div></section>`;
  return { title: `Calculators. Property and portfolio arithmetic. ${site.name}`, description: "Six free calculators for property and portfolio decisions. Net rental yield, rent versus buy, off-plan IRR, withdrawal rate, US estate tax exposure and lump sum versus cost averaging.", path: "/calculators/", body };
}

export function calcPage({ site, calc, counts }) {
  const body = `<section class="band"><div class="wrap">
  <p class="eyebrow"><a href="/calculators/" style="color:inherit;text-decoration:none">Calculators</a> / ${esc(calc.category)}</p>
  <h1 style="font-size:clamp(2.1rem,5vw,3.2rem);max-width:20ch">${esc(calc.name)}</h1>
  <p class="prose" style="margin:20px 0 36px;font-size:17px">${esc(copy(calc.intro))}</p>

  <div class="calc" data-calc="${esc(calc.slug)}">
    <div class="calc__in">
      <p class="eyebrow" style="margin-bottom:22px">Your numbers</p>
      ${calc.fields.map(field).join("")}
    </div>
    <div class="calc__out">
      <h3>Result</h3>
      <div class="res res--hero"><span class="res__l">${esc(calc.hero[1])}</span><span class="res__v" data-o="${esc(calc.hero[0])}">&nbsp;</span></div>
      <div style="margin-top:22px">
      ${calc.outputs
        .map((o) => `<div class="res"><span class="res__l">${esc(o[1])}</span><span class="res__v" data-o="${esc(o[0])}">&nbsp;</span></div>`)
        .join("")}
      </div>
      <p class="calc__note">${esc(copy(calc.note))}</p>
    </div>
  </div>

  <div class="callout" style="max-width:var(--prose);margin-top:40px">
    <b>The framework behind it</b>
    <p style="margin:0 0 14px">Read the rule, the arithmetic and the honest list of where this breaks.</p>
    <a class="btn btn--solid btn--sm" href="/playbooks/${esc(calc.playbook)}/">Open the playbook</a>
  </div>

  <div class="article" style="margin-top:52px">
    <h2>Questions people ask</h2>
    ${calc.faq
      .map((f) => `<h3>${esc(f.q)}</h3><p>${esc(copy(f.a))}</p>`)
      .join("")}
  </div>
  <p style="font-size:12px;color:var(--muted);margin-top:40px;max-width:var(--prose)">${esc(site.disclaimer)}</p>
</div></section>
${leadBand(site, counts)}`;

  return {
    title: `${calc.name} calculator. ${site.name}`,
    description: copy(calc.blurb),
    path: `/calculators/${calc.slug}/`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: calc.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: copy(f.a) },
        })),
      },
    ],
  };
}
