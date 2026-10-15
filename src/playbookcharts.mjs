/* Charts for the playbook pages, built from the modules that compute the
   pages' own figures.

   The reason this file exists rather than SVG in the markdown: every number
   on these pages is typed into the prose and held to the module by a test.
   That works for a sentence, where a human can read the number back. It does
   not work for a chart, where a wrong bar is invisible. So a chart is never
   authored -- it is derived here, at build time, from the same function the
   prose is checked against, and a page gets a chart only if this registry
   knows how to build one for it.

   A page with no entry here renders exactly as it does today. */
import { barChart, lineChart } from "./charts.mjs";
import { OBSERVED, observedRun } from "./holidayhome.mjs";
import { yields } from "./acquisition.mjs";
import { dubai as sgDubai, singapore } from "./singapore.mjs";
import { dubai as ldDubai, london } from "./london.mjs";
import { incomeTable, STRESSED_RATES } from "./mortgage.mjs";
import { sellerStack, roundTrip } from "./disposal.mjs";
import { EXAMPLE_PLAN, paidByMonth } from "./offplan.mjs";
import { byRate } from "./offplanready.mjs";
import { grid as taxGrid } from "./hometax.mjs";
import { shortLetNet, longLetNet } from "./holidayhome.mjs";
import { TIERS } from "./rentcap.mjs";
import { shortfallTable } from "./unitarea.mjs";
import { coverage as d7Coverage } from "./goldenvisa.mjs";
import { EXAMPLE as AQ_EXAMPLE, yields as aqYields } from "./acquisition.mjs";
import { breakEvenTable, BORROWER } from "./refinance.mjs";
import { GROWTHS, atGrowth, CASE } from "./rentbuy.mjs";
import {
  serviceChargeCheck,
  rentCheck,
  feeSplitCheck,
  capitalised,
  commission,
  FINDINGS,
} from "./diligence.mjs";
import { premiumTable, minimumPremium, ASSUMED_RT } from "./districtcooling.mjs";
import { ladder as usufructLadder, MAX_TERM, remainingTerm } from "./foreignownership.mjs";
import { outcomes, plateau } from "./holdperiod.mjs";
import { analyse as analysePriceIndex } from "./priceindex.mjs";
import { readFileSync } from "node:fs";

/* The published index, analysed once. The hold-period outcomes are scored
   against the same points the build and the test suite score, so a revised
   series moves the bars and the prose together rather than leaving one of
   them in print. Lazy, because most pages never ask for it. */
let PI = null;
const priceIndex = () => {
  if (!PI)
    PI = analysePriceIndex(
      JSON.parse(readFileSync(new URL("../content/dld-price-index.json", import.meta.url), "utf8"))
    );
  return PI;
};

const pct0 = (v) => `${Number(v).toFixed(0)}%`;
const pct = (v) => `${Number(v).toFixed(2)}%`;
const pct1 = (v) => `${Number(v).toFixed(1)}%`;
const aed0 = (v) => `AED ${Math.round(v).toLocaleString("en-AE")}`;
const months = (v) => `${Number(v).toFixed(1)} months`;
const yearNo = (v) => `year ${Math.round(v)}`;
const share = (v) => `${Math.round(v)}%`;

/* Spelled-out small whole numbers. Deriving a year count from a module should
   not cost the prose its voice: the pages say "ninety-nine year term", not
   "99 year term". Anything outside 0-100, or not a whole number, comes back
   as digits rather than guessed at. */
const UNITS = ["zero","one","two","three","four","five","six","seven","eight","nine","ten",
  "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const TENS = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function words(n) {
  if (!Number.isInteger(n) || n < 0 || n > 100) return String(n);
  if (n === 100) return "a hundred";
  if (n < 20) return UNITS[n];
  const t = TENS[Math.floor(n / 10)], u = n % 10;
  return u ? `${t}-${UNITS[u]}` : t;
}

const aed = (v) =>
  `${v < 0 ? "−" : "+"}AED ${Math.abs(Math.round(v)).toLocaleString("en-AE")}`;

/* Break-even occupancy: what three vendors' observed Dubai averages net,
   against the annual tenancy the owner gave up to chase them.

   This is the page's central claim and it was a nine-column table. The bar
   is each vendor's shortfall; the dashed line is zero, which is the
   break-even every competing page prints and every vendor clears. The whole
   point is that clearing that line is not the same as beating the tenancy. */
function breakEvenOccupancy() {
  const runs = OBSERVED.map((o) => ({ o, r: observedRun(o) }));
  return [
    {
      key: "observed-vs-tenancy",
      label:
        "What each publisher's observed Dubai average nets on this one bedroom, measured against the annual tenancy it replaced",
      reference: 0,
      referenceLabel: "level with the annual tenancy",
      format: aed,
      bars: runs.map(({ o, r }) => ({ label: o.publisher, value: r.versusTenancy })),
      caption:
        "Each bar is that publisher's observed rate and occupancy run through this page's own cost model. Zero is the annual tenancy, not zero profit — every one of the three clears the break-even the competing pages print, and every one lands below the tenancy it replaced.",
    },
  ];
}

/* Net rental yield: the three numbers a buyer is quoted, in the order they
   shrink. The brochure prints the first. The page exists to print the third,
   and a reader who sees the fall is told the whole argument before reading a
   word of it. */
function netRentalYield() {
  const y = yields();
  return [
    {
      key: "yield-ladder",
      label: "The same apartment, measured three ways",
      reference: y.gross,
      referenceLabel: `the ${pct(y.gross)} in the advertisement`,
      format: pct,
      bars: [
        { label: "Gross, on the price", value: y.gross },
        { label: "Net of running costs", value: y.onPrice },
        { label: "Net, on what you actually paid", value: y.net },
      ],
      caption:
        "Every figure computed by the page's own model. The first is the number in the listing; the last is the number that reaches your account, after the service charge, management, vacancy, maintenance and insurance, and after the transfer and agency costs are added to what the property cost you.",
    },
  ];
}

/* Dubai against Singapore. Both start from the same gross, which is the point
   of the pairing: the gap is made entirely by what each government takes. */
function dubaiVsSingapore() {
  const d = sgDubai(), s = singapore();
  return [
    {
      key: "dxb-sg-net",
      label: "The same money, the same gross yield, through two governments' rules",
      reference: d.gross,
      referenceLabel: `the ${pct(d.gross)} gross both start from`,
      format: pct,
      bars: [
        { label: "Dubai, net", value: d.net },
        { label: "Singapore, net", value: s.net },
      ],
      caption:
        `Both properties are bought at the same gross yield. Dubai's entry stamp duty is ${pct(d.stampRate)} of the price; Singapore's is ${pct(s.stampRate)} once Additional Buyer's Stamp Duty applies to a foreign buyer. Nothing else in the comparison does as much work.`,
    },
  ];
}

/* Dubai against London. Here the gross differs too, so both are drawn: the
   London buyer starts lower and is then taxed further down. */
function dubaiVsLondon() {
  const d = ldDubai(), l = london();
  return [
    {
      key: "dxb-ldn-net",
      label: "Dubai against London, gross and net",
      format: pct,
      bars: [
        { label: "Dubai, gross", value: d.gross },
        { label: "Dubai, net", value: d.net },
        { label: "London, gross", value: l.gross },
        { label: "London, net", value: l.net },
      ],
      caption:
        "The London buyer starts from a lower gross and is then taxed down again. No reference line is drawn here because, unlike the Singapore comparison, the two do not begin from the same number.",
    },
  ];
}

/* Mortgage capacity: the income each stressed rate demands, against the
   income the loan-to-value cap demands. Where the bars cross the line is
   where the binding constraint changes, and that crossover is the page. */
function mortgageCapacity() {
  const rows = incomeTable();
  const stock = rows[0].byStock;
  return [
    {
      key: "income-needed",
      label: "The monthly income the bank needs from you, at each stressed rate",
      reference: stock,
      referenceLabel: "what the income multiple alone demands",
      format: aed0,
      bars: rows.map((r) => ({ label: `Stressed at ${pct(r.ratePct)}`, value: r.byFlow })),
      caption:
        "Banks test the loan at a rate above the one you are offered. Below the dashed line the income multiple is what stops you; above it, the debt burden ratio is. Every bar is computed from the page's own model at the rates it publishes.",
    },
  ];
}

/* Selling well: where the exit money goes. One bar dominates, and that is
   the finding -- the agency commission and its VAT are three quarters of the
   whole stack, and they are charged on the price the property sells for
   rather than the price it was bought at. */
function sellingWell() {
  const st = sellerStack();
  return [
    {
      key: "seller-stack",
      label: "What it costs to sell, line by line",
      format: aed0,
      bars: st.lines.map(([label, value]) => ({ label, value })),
      caption:
        `AED ${Math.round(st.total).toLocaleString("en-AE")} in total on the illustrative one bedroom, of which the agency commission and its VAT are ${st.commissionShare.toFixed(1)}%. No reference line is drawn here: these are components of one total, not competing figures measured against a common threshold.`,
    },
  ];
}

/* Off-plan: what each plan has actually taken from you, month by month. The
   shape is the argument -- the money leaves on the developer's schedule, not
   on the building's progress, and a line makes that visible in a way the
   payment table never did. */
function offPlanIrr() {
  const P = EXAMPLE_PLAN;
  const series = (plan) => {
    const pts = [];
    for (let k = 0; k <= P.months; k++) {
      const d = new Date(Date.UTC(2026, 0, 1));
      d.setUTCMonth(d.getUTCMonth() + k);
      pts.push([d.toISOString().slice(0, 10), paidByMonth(P.price, plan, k, P.months)]);
    }
    return pts;
  };
  const a = series(P.a);
  const last = a.at(-1);
  return [
    {
      key: "off-plan-paid",
      kind: "line",
      label: "What the front-loaded plan has taken from you, month by month",
      unit: "", dp: 0,
      points: a,
      latest: { date: last[0], value: last[1] },
      min: { date: a[0][0], value: a[0][1] },
      max: { date: last[0], value: last[1] },
      sentence:
        `What the front-loaded plan has taken from you, month by month, over ${P.months} months to handover. It starts at ${pct0(P.a.down)} of the price on day one and reaches AED ${Math.round(last[1]).toLocaleString("en-AE")} by handover.`,
      caption:
        `The ${P.a.down}% deposit leaves on day one and the construction instalments follow the developer's schedule across ${P.months} months. Every point is computed by the page's own model from the published plan.`,
    },
  ];
}

/* Off-plan against ready: the discount off-plan has to give you before it
   beats buying something finished, at each rate you could otherwise earn.
   The bar going negative is the whole page -- above a certain hurdle rate,
   off-plan has to be dearer than ready to be worth it, which is the opposite
   of how it is sold. */
function offPlanVsReady() {
  const rows = byRate();
  return [
    {
      key: "offplan-discount-needed",
      label: "The discount off-plan must give you to beat buying ready, at each rate you could otherwise earn",
      reference: 0,
      referenceLabel: "no discount needed",
      format: pct,
      bars: rows.map((r) => ({ label: `If you could earn ${pct0(r.rate)}`, value: r.a.discount })),
      caption:
        "Below the line, off-plan needs a discount to be worth the wait. Above it, the arithmetic reverses and off-plan would have to be more expensive than ready to leave you level — which is not an argument anyone selling it makes.",
    },
  ];
}

/* Residency and tax: what the same Dubai property nets a UK resident, by
   band, against what it nets somebody who owes no tax on it. The property
   does not change. The passport does. */
function residencyAndTax() {
  const g = taxGrid();
  return [
    {
      key: "uk-bands-net",
      label: "What the same Dubai property nets, by the owner's UK tax band",
      reference: aqYields().net,
      referenceLabel: `${pct(aqYields().net)}, owing no tax on it`,
      format: pct,
      bars: g.map((r) => ({ label: r.band.name, value: r.net })),
      caption:
        "The building, the rent and the service charge are identical in every bar. The only thing that changes is where the owner is tax resident, and the UK taxes this income whether or not a dirham of it ever reaches the UK.",
    },
  ];
}

/* Short let against long let. The bars are deliberately close, because the
   finding is that they are close: the gap is thinner than the work. */
function shortLetVsLongLet() {
  const s = shortLetNet(), l = longLetNet();
  return [
    {
      key: "short-vs-long",
      label: "What a year of each nets on the same apartment",
      reference: l.net,
      referenceLabel: "the annual tenancy",
      format: aed0,
      bars: [
        { label: "Short let, at the illustrative rate", value: s.net },
        { label: "Annual tenancy", value: l.net },
      ],
      caption:
        `A difference of AED ${Math.abs(Math.round(s.net - l.net)).toLocaleString("en-AE")} on the year, before the owner's own time, the furniture, the permit renewals and the guest who does not leave. The bars are close because the finding is that they are close.`,
    },
  ];
}

/* Rent caps: the statutory ladder. How far below the market index a rent
   sits decides, by decree rather than by negotiation, what can be added. */
function rentIncreaseCaps() {
  return [
    {
      key: "rent-cap-ladder",
      label: "The increase Decree 43 permits, by how far the rent sits below the market index",
      reference: 0,
      referenceLabel: "no increase permitted",
      format: pct0,
      bars: TIERS.map((t) => ({
        label: t.upTo === null ? "More than 40% below" : `Up to ${t.upTo}% below`,
        value: t.increase,
      })),
      caption:
        "These are the statutory steps, not a negotiating range. A rent within ten percent of the index cannot be raised at all, however long the tenant has been there and whatever the landlord's costs have done.",
    },
  ];
}

/* Price per square foot: what a shortfall in delivered area does to the rate
   actually paid. The quoted figure is computed on the area in the brochure;
   the realised one on the area that exists. */
function pricePerSquareFoot() {
  const rows = shortfallTable(AQ_EXAMPLE);
  return [
    {
      key: "ppsf-uplift",
      label: "How much more per square foot you actually paid, by how short the delivered area came",
      reference: 0,
      referenceLabel: "the rate you were quoted",
      format: pct,
      bars: rows.map((r) => ({ label: `${r.shortfallPct}% short`, value: r.upliftPct })),
      caption:
        "The price does not move. The area does, so the rate per square foot you actually paid rises by the same proportion the area fell short — and below the statutory tolerance none of it is compensable.",
    },
  ];
}


/* The golden visa page: what one ordinary Dubai one bedroom covers of the
   Portugal D7 income threshold, household by household.

   The whole page turns on a near-miss, and a near-miss is the one finding a
   table hides and a bar shows: the couple's bar sits a hair above the line
   and the bar with a child in it sits clearly below. The reference is 100%
   of the published minimum, which is a floor rather than a target, and the
   caption says so, because a bar just above a floor is not a comfortable
   application. */
function goldenVisaVsPortugalD7() {
  const rows = d7Coverage();
  return [
    {
      key: "d7-coverage",
      label:
        "What the net income of one illustrative Dubai one bedroom covers of the Portugal D7 means-of-subsistence threshold, by household",
      reference: 100,
      referenceLabel: "the published minimum",
      format: pct1,
      bars: rows.map((r) => ({ label: r.label, value: r.covers })),
      caption:
        `Each bar is this one apartment's net operating income against that household's threshold, the Portuguese minimum wage run through the subsistence portaria and converted at the published euro reference rate. The line is the floor the assessment starts from, not a target: clearing it by ${pct1(
          rows.find((r) => r.covers >= 100 && r.covers < 110)?.covers - 100
        )} is not the same position as clearing it by half.`,
    },
  ];
}

/* Refinancing: how long the switching cost takes to come back, by rate move.

   The page's central claim is that the half point every broker recommends
   switching for takes five years to repay, and five years is longer than a
   great many owners hold the flat. A table of months makes the reader do the
   comparison; a bar against a five-year line makes it the picture. The bars
   are the module's own break-even months, so they cannot disagree with the
   table above them. */
function refinancingADubaiMortgage() {
  const rows = breakEvenTable();
  return [
    {
      key: "refi-break-even",
      label:
        "How many months of the monthly saving it takes to recover the AED 19,715 switching cost, by the rate move",
      reference: 60,
      referenceLabel: "five more years in the same property",
      format: months,
      bars: rows.map((r) => ({
        label: `${r.fromRatePct.toFixed(2)}% to ${r.toRatePct.toFixed(2)}%`,
        value: r.months,
      })),
      caption:
        (() => {
          const inTwo = rows.filter((r) => r.months <= 24);
          const worst = rows.reduce((a, b) => (b.months > a.months ? b : a));
          const gap = (r) => Number((r.fromRatePct - r.toRatePct).toFixed(2));
          return `The term is held at ${words(BORROWER.years)} years on both sides, so every bar is the rate and nothing else. ${
            inTwo.length === 1
              ? `Only the move of ${gap(inTwo[0])} points comes back inside two years.`
              : `${inTwo.length} of these come back inside two years, the smallest being a move of ${gap(
                  inTwo.reduce((a, b) => (gap(b) < gap(a) ? b : a))
                )} points.`
          } The ${gap(worst)} point move takes ${months(
            worst.months
          )}, which is to say it never happens: the fixed period expires first and the question becomes a different one.`;
        })(),
    },
  ];
}

/* Rent or buy: the year owning overtakes renting, by the capital growth rate
   assumed. The consensus answer of three to five years is a growth bet that
   nobody labels as one, so the reference line is the consensus and the bars
   are what each growth rate actually produces.

   The three negative growth rates return no break-even inside the term at
   all. A bar cannot show "never", so those rows are left out and the caption
   says so -- the alternative is plotting the term length as though the
   crossing happened in the final year, which would be a fabricated bar. */
function rentVsBuy() {
  const rows = GROWTHS.map((g) => ({ g, year: atGrowth(g).year })).filter(
    (r) => r.year !== null
  );
  return [
    {
      key: "rent-buy-break-even",
      label:
        "The year from which owning the illustrative apartment has cost less than renting it, by the capital growth assumed",
      reference: 5,
      referenceLabel: "the three-to-five years the consensus asserts",
      format: yearNo,
      bars: rows.map((r) => ({
        label: `${(r.g * 100).toFixed(0)}% a year`,
        value: r.year,
      })),
      caption:
        (() => {
          const flat = rows.find((r) => r.g === 0);
          const missing = GROWTHS.filter((g) => atGrowth(g).year === null);
          const highest = Math.max(...missing);
          return `At flat prices the crossing is ${yearNo(
            flat.year
          )}, and the consensus answer needs capital growth to be true rather than arithmetic. ${
            words(missing.length).replace(/^./, (c) => c.toUpperCase())
          } rates are missing because at ${(highest * 100).toFixed(
            0
          )}% a year and below owning never costs less inside the ${words(CASE.years)} year term, and a bar cannot say never.`;
        })(),
    },
  ];
}

/* Due diligence: two documents against the one negotiation, on a single
   scale. The recurring findings are capitalised at the property's own net
   yield -- the amount of price that buys the same income -- which is what
   puts an annual saving and a one-off on one axis honestly. The reference is
   the agency commission, because that is the number every buyer knows and
   argues about, and the finding is that reading the budget is worth several
   of it. */
function dueDiligenceBeforeAnOffer() {
  const sc = capitalised(serviceChargeCheck().perYear);
  const rt = capitalised(rentCheck().perYear);
  const split = feeSplitCheck().once;
  return [
    {
      key: "diligence-worth",
      label:
        "What each check is worth on the illustrative one bedroom, recurring findings capitalised at the property's own net yield",
      reference: commission(),
      referenceLabel: "the agency commission, with VAT",
      format: aed0,
      bars: [
        { label: "Reading the approved service charge budget", value: sc },
        { label: "Checking the asking rent against Ejari", value: rt },
        { label: "Winning the registration fee split", value: split },
      ],
      caption:
        `The first two bars are ordinary findings, not disasters: ${words(
          FINDINGS.serviceChargeFound - AQ_EXAMPLE.serviceChargePerSqft
        )} dirhams a square foot on the charge and a ${pct0(
          FINDINGS.rentHaircut * 100
        )} haircut on the rent. Each is worth more than the whole commission, and more than the one negotiation every buyer has. Capitalising at the net yield is what puts a yearly saving and a one-off on the same axis.`,
    },
  ];
}

/* District cooling: what a chiller-free rent premium has left once the
   standing cost is paid. The page's finding is the first row -- a premium
   below the standing cost buys the tenant nothing and is a discount wearing
   a better word -- and a bar crossing zero is the one chart shape that shows
   it without a word of prose. */
function districtCoolingAndChillerCharges() {
  const rows = premiumTable();
  return [
    {
      key: "chiller-premium-headroom",
      label:
        `What a chiller-free rent premium has left for cooling once the standing cost is paid, at ${ASSUMED_RT} contracted tons`,
      reference: 0,
      referenceLabel: `the standing cost alone, AED ${minimumPremium().toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      format: aed,
      bars: rows.map((r) => ({
        label: `AED ${r.premium.toLocaleString("en-AE")} a year`,
        value: r.headroom,
      })),
      caption:
        (() => {
          const cleared = rows.filter((r) => r.hoursPerDay != null);
          const lo = cleared[0], hi = cleared[cleared.length - 1];
          return `Left of the line the premium does not reach the fixed charge, so it buys no cooling at all. Right of it the headroom buys less than it looks: ${aed0(
            lo.premium
          )} a year covers about ${lo.hoursPerDay} hours a day at full contracted capacity and ${aed0(
            hi.premium
          )} about ${hi.hoursPerDay}, both against a consumption the tenant now chooses and no longer pays for.`;
        })(),
    },
  ];
}

/* Transaction cost drag: the conventional argument is that holding longer
   spreads the round trip thinner, which is arithmetically true and is the
   one thing this page does not dispute. What it disputes is that spreading
   the cost thinner improved the odds of covering it. So the bars are not the
   annualised drag -- charting that would make the boring true half the
   visual headline -- they are the share of historical holds that actually
   cleared the round trip, which is flat from three years to eight.

   The reference is an even chance, because that is what the middle of this
   distribution sits on and a reader can judge a coin toss without being
   told what to think about it. */
function transactionCostDrag() {
  const o = outcomes(priceIndex(), "all");
  const p = plateau(o);
  return [
    {
      key: "hold-outcomes",
      label:
        `Share of historical holds on the Land Department's ${o.label.toLowerCase()} index that cleared the ${o.need}% a round trip needs, by how long the property was held`,
      reference: 50,
      referenceLabel: "an even chance",
      format: share,
      bars: o.rows.map((r) => ({ label: `${r.years} year${r.years === 1 ? "" : "s"}`, value: r.share })),
      caption:
        `Between ${p.from} and ${p.to} years the annualised drag more than halves and the share that cleared it moves between ${p.low}% and ${p.high}%. The windows overlap, so the long bars rest on very little: the ${o.rows[o.rows.length - 1].years} year bar scores ${o.rows[o.rows.length - 1].n} start months but only ${o.rows[o.rows.length - 1].independent} independent windows, which is one sample wearing a percentage. Read the right-hand end as thin evidence, not as a reward for patience.`,
    },
  ];
}

/* Freehold against leasehold: Regulation 3 of 2006 grants a ninety-nine year
   term as readily as freehold, and a term is worth less than forever by an
   amount the page can compute rather than assert. The bars are the share of
   freehold value a remaining term is worth, capitalised at the property's own
   rate, against freehold itself as the line.

   The shape is the argument: at ninety-nine years the gap is almost nothing,
   which is why nobody minds, and it widens quietly every year the term runs
   down. */
function freeholdAreasAndForeignOwnership() {
  const rows = usufructLadder();
  return [
    {
      key: "usufruct-ladder",
      label:
        "What a remaining leasehold term is worth as a share of freehold on the illustrative apartment, capitalised at the property's own rate",
      reference: 100,
      referenceLabel: "freehold, without time restriction",
      format: pct,
      bars: rows.map((r) => ({ label: `${r.years} years left`, value: r.pct })),
      caption:
        `The top bar is why this is not felt at grant: a ${words(MAX_TERM)} year term is worth ${pct(
          rows[0].pct
        )} of freehold, a gap of ${aed0(rows[0].discount)} on this unit. The gap is not static. A term granted when the regulation came into force has ${words(
          remainingTerm(new Date().getUTCFullYear())
        )} years left today, and every year the discount the arithmetic implies has been growing.`,
    },
  ];
}

const REGISTRY = {
  "break-even-occupancy": breakEvenOccupancy,
  "net-rental-yield": netRentalYield,
  "dubai-vs-singapore": dubaiVsSingapore,
  "dubai-vs-london": dubaiVsLondon,
  "mortgage-capacity": mortgageCapacity,
  "selling-well": sellingWell,
  "off-plan-irr": offPlanIrr,
  "off-plan-vs-ready": offPlanVsReady,
  "residency-and-tax": residencyAndTax,
  "short-let-vs-long-let": shortLetVsLongLet,
  "rent-increase-caps": rentIncreaseCaps,
  "price-per-square-foot": pricePerSquareFoot,
  "golden-visa-vs-portugal-d7": goldenVisaVsPortugalD7,
  "refinancing-a-dubai-mortgage": refinancingADubaiMortgage,
  "rent-vs-buy": rentVsBuy,
  "due-diligence-before-an-offer": dueDiligenceBeforeAnOffer,
  "district-cooling-and-chiller-charges": districtCoolingAndChillerCharges,
  "transaction-cost-drag": transactionCostDrag,
  "freehold-areas-and-foreign-ownership": freeholdAreasAndForeignOwnership,
};

/* Returns rendered figures for a playbook, or "" when the page has none. */
export function playbookCharts(slug) {
  const build = REGISTRY[slug];
  if (!build) return "";
  return build()
    .map(
      (s) =>
        `${(s.kind === "line" ? lineChart : barChart)(s, { id: s.key })}${
          s.caption ? `<p class="cb__src">${s.caption}</p>` : ""
        }`
    )
    .join("");
}

export { REGISTRY as CHART_REGISTRY };
