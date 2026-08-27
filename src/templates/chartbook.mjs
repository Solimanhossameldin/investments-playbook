import { esc, longDate } from "../lib.mjs";
import { lineChart } from "../charts.mjs";

/* Editorial notes. These explain what a series is and why it moves the things
   this site is about. They are deliberately written to be true in any market,
   because prose that describes today's level goes wrong the day after it is
   written. Everything about the current reading is computed from the data. */
const NOTES = {
  "real-yield": {
    heading: "The real yield",
    what: "What ten-year US government debt pays after the inflation the market expects. It is the closest thing that exists to a risk-free hurdle rate, and it is the number every other asset on earth is quietly priced against.",
    body: [
      "This is the chart to read first, because it sets the bar the rest have to clear. If a government will pay you a positive return above inflation for taking no credit risk and no liquidity risk, then a property has to pay you materially more than that to be worth owning — enough to cover the vacancy, the service charge, the agent, the tenant who leaves early, and the fact that you cannot sell half of it on a Tuesday.",
      "When the real yield sat below zero, which it did for most of the decade after 2011, almost any income-producing asset cleared the bar and prices rose nearly everywhere at once. That was not skill. When it is positive, the bar is real, and a five percent gross yield that nets three has to argue for itself.",
    ],
    links: [
      ["/playbooks/net-rental-yield/", "Net rental yield", "The only yield figure that describes money actually reaching the owner."],
      ["/playbooks/property-vs-index-funds/", "Property versus index funds", "The comparison run properly, with the costs both sides usually leave out."],
    ],
  },
  mortgage: {
    heading: "The price of a mortgage",
    what: "The average rate on a thirty-year fixed mortgage in the United States, published weekly by Freddie Mac.",
    body: [
      "This is not the rate you will be quoted in Dubai or London, and it is not meant to be. It is here because it is the most closely watched mortgage price in the world and it moves on the same underlying government bond that everything else on this page moves on. When it rises, the monthly payment on the same house rises with it, and the buyer's budget falls even though the asking price has not moved.",
      "For anyone buying in the UAE the link is more direct than it looks. The dirham is pegged to the dollar, so the central bank follows the Federal Reserve rather than local conditions. UAE mortgage pricing therefore takes its direction from US policy, which is a strange thing to accept until you notice it has held since 1997.",
    ],
    links: [
      ["/playbooks/currency-risk-and-the-peg/", "Currency risk and the peg", "What the dirham's peg does to you, in both directions."],
      ["/playbooks/mortgage-vs-cash/", "Mortgage versus cash", "When leverage helps and the point at which it stops."],
    ],
  },
  curve: {
    heading: "The yield curve",
    what: "What the government pays to borrow for ten years, minus what it pays to borrow for two. Positive is the normal shape. Negative means it costs more to borrow short than long.",
    body: [
      "A negative reading means the bond market expects rates to be lower in a few years than they are now, which is usually another way of saying it expects something to break. It has preceded most US recessions, which is why it gets the attention it does.",
      "Treat that record carefully. The lead time between an inversion and anything actually happening has ranged from months to well over two years, and it has been early enough to be useless as a trading signal more than once. It tells you what the market expects. It does not tell you when, and it has been wrong.",
    ],
    links: [
      ["/playbooks/asset-allocation-by-horizon/", "Asset allocation by horizon", "Why the date you need the money decides the mix, not the forecast."],
      ["/playbooks/what-bonds-are-for/", "What bonds are for", "Not returns. Something more specific than that."],
    ],
  },
  breakeven: {
    heading: "The inflation the market expects",
    what: "The gap between ordinary ten-year US government debt and the inflation-linked kind. It is what inflation would have to average over ten years for the two to break even.",
    body: [
      "This is not a forecast published by an economist. It is the number at which people with money at risk are indifferent between the two bonds, which makes it the most honest inflation expectation available: everyone quoted in it has had to back it.",
      "It matters for property because the whole inflation-hedge argument for owning real assets is that rents rise with prices. That argument is only as good as your ability to actually raise the rent, which in Dubai is governed by a decree with fixed tiers rather than by what the market will bear.",
    ],
    links: [
      ["/playbooks/inflation-and-real-returns/", "Inflation and real returns", "The only return that matters is the one after inflation."],
      ["/playbooks/rent-increase-caps/", "Rent increase caps", "Decree 43 of 2013, and what it lets you actually do."],
    ],
  },
  cpi: {
    heading: "The inflation that actually happened",
    what: "US consumer prices against the same month a year earlier.",
    body: [
      "Put this next to the chart above it. One is what the market expected inflation to be; this is what it turned out to be. They are rarely the same, and the gap between them is the reason a portfolio built entirely on a forecast tends to disappoint.",
      "One caveat worth carrying: a single national index describes an average basket in one country. It is not your cost of living, it is not Dubai's, and it is not the rate at which your rent, your school fees or your service charge went up.",
    ],
    links: [
      ["/playbooks/inflation-and-real-returns/", "Inflation and real returns", "Why a seven percent return in a five percent year is not seven percent."],
      ["/playbooks/service-charge-and-reserves/", "Service charge and reserves", "The cost that rises quietly and eats the yield."],
    ],
  },
  dollar: {
    heading: "The dollar",
    what: "The Federal Reserve's broad trade-weighted dollar index, measured against a basket of the currencies the United States actually trades with.",
    body: [
      "If you hold dirhams, you hold dollars. The peg means this line is your currency, whether or not you ever think about it that way, and a strong dollar makes Dubai property more expensive for every buyer earning in sterling, euros, rupees or roubles without a single price changing.",
      "The reverse is the risk most cross-border buyers ignore. Earn in one currency, buy in another, and you have taken a currency position the size of the property on top of the property itself. It is rarely deliberate and it is almost never hedged.",
    ],
    links: [
      ["/playbooks/currency-risk-and-the-peg/", "Currency risk and the peg", "The position you took without deciding to."],
      ["/playbooks/dubai-vs-london/", "Dubai versus London", "The same money, run through both tax and cost regimes."],
    ],
  },
  oil: {
    heading: "Oil",
    what: "West Texas Intermediate crude, the US benchmark, in dollars a barrel.",
    body: [
      "Oil is on this page because of what it funds rather than what it costs. Gulf government budgets, infrastructure programmes and the hiring that follows them still move with the oil price, and that flows through to population, to rental demand and eventually to property.",
      "The link is weaker than people assume, though, and it is weakest exactly where they apply it hardest. Dubai's economy is far less oil-dependent than its neighbours': trade, logistics, tourism and financial services do most of the work. Treating the oil price as a Dubai property indicator is a habit inherited from the wrong emirate.",
    ],
    links: [
      ["/playbooks/concentration-limits/", "Concentration limits", "How much of one economy you can afford to own."],
      ["/playbooks/what-diversification-does/", "What diversification does", "And the specific thing it does not do."],
    ],
  },
};

const num = (s, v) =>
  `${s.unit === "USD" ? "$" : ""}${Number(v).toFixed(s.dp)}${
    s.unit === "%" ? "%" : s.unit === "pp" ? " points" : ""
  }`;

/* Computed, never written. Every clause below is arithmetic on the series. */
function reading(s) {
  const bits = [`It last read <b>${num(s, s.latest.value)}</b> on ${longDate(s.latest.date)}.`];
  if (s.yearAgo) {
    const d = s.latest.value - s.yearAgo.value;
    const dir = Math.abs(d) < Math.pow(10, -s.dp) / 2 ? "unchanged from" : d > 0 ? "up from" : "down from";
    bits.push(`That is ${dir} ${num(s, s.yearAgo.value)} a year earlier.`);
  }
  const range = s.max.value - s.min.value;
  const at = range ? (s.latest.value - s.min.value) / range : 0.5;
  const where =
    at < 0.15 ? "close to its low for the period"
      : at < 0.4 ? "in the lower part of its range"
      : at < 0.6 ? "around the middle of its range"
      : at < 0.85 ? "in the upper part of its range"
      : "close to its high for the period";
  bits.push(`It sits ${where}, which ran from ${num(s, s.min.value)} to ${num(s, s.max.value)}.`);
  return bits.join(" ");
}

function section(s, note) {
  if (!note) return "";
  const links = note.links
    .map(([href, t, d]) => `<a class="gl" href="${href}"><span class="gl__t">${esc(t)}</span><span class="gl__d">${esc(d)}</span></a>`)
    .join("");
  return `<section class="cb" id="${esc(s.key)}">
  <h2>${esc(note.heading)}</h2>
  <p class="cb__what">${esc(note.what)}</p>
  ${lineChart(s)}
  <p class="cb__src">${esc(s.label)}. Source: <a href="${esc(s.sourceUrl)}" rel="nofollow noopener" target="_blank">${esc(s.source)}</a>. ${
    s.stale ? "This series did not refresh on the last run and is shown as last retrieved. " : ""
  }Shown from ${longDate(s.first)} to ${longDate(s.last)}.</p>
  <p class="cb__read">${reading(s)}</p>
  <div class="article">${note.body.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
  <div class="glrows" style="margin-top:24px">${links}</div>
</section>`;
}

export function chartbookPage({ site, data }) {
  const series = Object.values(data.series || {});

  const empty = `<div class="callout" style="max-width:var(--prose)">
    <b>Not built yet</b>
    The chartbook is generated from long-run series published by the U.S. Treasury, the Federal Reserve, the Bureau of Labor Statistics and the Energy Information Administration. None have been retrieved yet. It will fill in on the next scheduled run.
  </div>`;

  const toc = series.length
    ? `<nav class="cb__toc" aria-label="Charts on this page">${series
        .map((s) => `<a href="#${esc(s.key)}">${esc(NOTES[s.key]?.heading || s.label)}</a>`)
        .join("")}</nav>`
    : "";

  const body = `<section class="band"><div class="wrap">
  <div class="section-head" style="margin-bottom:8px">
    <p class="eyebrow">Free, ungated, and meant to be linked to</p>
    <h2>The Chartbook</h2>
    <p>${series.length ? series.length : "Seven"} charts covering ${
      data.windowYears || 12
    } years, and what each one actually does to the price of a property and the value of a portfolio. No email required, no download, no form. Every series is public data from a public source, and every chart names it.</p>
  </div>

  ${
    series.length
      ? `<p class="wire-meta">Data last refreshed ${longDate(
          (data.asOf || "").slice(0, 10)
        )}. Twelve years of history does not move much in a day, so these are pulled weekly rather than daily, and the date above is the real one.</p>`
      : ""
  }

  ${toc}
  ${series.length ? series.map((s) => section(s, NOTES[s.key])).join("") : empty}

  ${
    series.length
      ? `<div class="callout" style="margin-top:56px;max-width:var(--prose)">
    <b>Use it</b>
    Everything here is drawn from series produced by agencies of the United States government, which are public domain under 17 U.S.C. §105. Reproduce the charts, quote the figures, put them in a deck. A link back to <a href="${esc(
      site.origin
    )}/chartbook/">this page</a> is appreciated and not required.
  </div>`
      : ""
  }

  <p style="font-size:12px;color:var(--muted);margin-top:40px;max-width:var(--prose)">${esc(site.disclaimer)}</p>
</div></section>`;

  return {
    title: `The Chartbook. ${data.windowYears || 12} years of the cost of money. ${site.name}`,
    description: `Seven long-run charts — the real yield, mortgage rates, the yield curve, inflation expected and realised, the dollar and oil — with what each one does to property and portfolios. Ungated.`,
    path: "/chartbook/",
    body,
    jsonld: series.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: "Investments Playbook Chartbook",
            description: `Long-run series covering the US real yield, mortgage rates, the yield curve, inflation expectations, realised inflation, the trade-weighted dollar and crude oil, over ${
              data.windowYears || 12
            } years.`,
            url: `${site.origin}/chartbook/`,
            isAccessibleForFree: true,
            license: "https://www.usa.gov/government-works",
            creator: {
              "@type": "Organization",
              name: "Federal Reserve Bank of St. Louis",
              url: "https://fred.stlouisfed.org",
            },
            variableMeasured: series.map((s) => s.label),
            temporalCoverage: `${series[0].first}/${series[0].last}`,
          },
        ]
      : [],
  };
}

export { NOTES, reading };
