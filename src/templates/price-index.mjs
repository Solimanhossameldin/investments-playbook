import { esc, longDate, pageTitle } from "../lib.mjs";
import { captureBlock } from "./layout.mjs";
import { lineChart } from "../charts.mjs";

/* Monthly data gets a monthly label. longDate would render 2015-05-01 as
   "1 May 2015", which claims a precision the DLD never published -- the
   reading is the month, not the first of it. */
const month = (iso) =>
  new Date(`${iso.slice(0, 7)}-01T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "long", year: "numeric", timeZone: "UTC",
  });

const pc = (n) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
const money = (n) => `AED ${Math.round(n).toLocaleString("en-AE")}`;

export function priceIndexPage({ site, data, a }) {
  const yrs = (a.recovered.months / 12).toFixed(1);
  const stops = month(data.coverageTo);

  /* The chart's accessible sentence is written here rather than taken from
     the default, which says "Now X on <date>". On a series that closed in
     May 2024 that word would be false to a screen reader and true to nobody. */
  const pts = a.byKey.all.points;
  const lo = pts.reduce((m, p) => (p[1] < m[1] ? p : m), pts[0]);
  const hi = pts.reduce((m, p) => (p[1] > m[1] ? p : m), pts[0]);
  const series = {
    key: "dld-all",
    label: "DLD residential sale index, all residential property (2012 = 1.000)",
    unit: "index", dp: 3, points: pts,
    source: data.source, sourceUrl: data.sourceUrl,
    latest: { date: a.last, value: pts.at(-1)[1] },
    min: { date: lo[0], value: lo[1] },
    max: { date: hi[0], value: hi[1] },
    sentence:
      `DLD residential sale index, all residential property, 2012 = 1.000. ` +
      `${a.months} monthly readings from ${month(a.first)} to ${stops}, where the published series stops. ` +
      `It peaked at ${a.peak.value.toFixed(3)} in ${month(a.peak.date)}, fell to ${a.trough.value.toFixed(3)} by ${month(a.trough.date)}, ` +
      `regained the peak in ${month(a.recovered.date)} after ${a.recovered.months} months, and its last reading is ${pts.at(-1)[1].toFixed(3)}.`,
  };
  const chart = lineChart(series, { id: "dld-all" }) +
    `<p class="cb__src">${esc(series.label)}. Source: <a href="${esc(data.sourceUrl)}" rel="nofollow noopener" target="_blank">${esc(data.source)}</a>. Shown from ${month(a.first)} to ${stops}, retrieved ${longDate(data.retrievedAt)}.</p>`;

  const row = (name, l) => `<tr>
    <th scope="row">${esc(name)}</th>
    <td>${esc(l.from.slice(0, 7))} &rarr; ${esc(l.to.slice(0, 7))}</td>
    <td style="text-align:right;font-variant-numeric:tabular-nums">${pc(l.all)}</td>
    <td style="text-align:right;font-variant-numeric:tabular-nums">${pc(l.flat)}</td>
    <td style="text-align:right;font-variant-numeric:tabular-nums">${pc(l.villa)}</td>
  </tr>`;

  const body = `<section class="band"><div class="wrap">
  <div class="section-head" style="margin-bottom:8px">
    <p class="eyebrow">Free, ungated, and meant to be linked to</p>
    <h1>Dubai took seven years to get back to its 2015 price</h1>
    <p>The official Dubai Land Department residential sale index, ${a.months} consecutive months from ${month(a.first)} to ${stops}. Every brokerage in this city sells Dubai on the surge that ended this series. Far fewer mention the ${a.recovered.months} months in front of it.</p>
  </div>

  <div class="callout" style="max-width:var(--prose)">
    <b>Where this series stops</b>
    The official open dataset ends at <b>${stops}</b>, and nothing here is extended, smoothed or forecast past it. This is the last full cycle as the DLD recorded it, not a reading of the market today. If you need a current figure, the index is the wrong instrument &mdash; ask for a valuation.
  </div>

  ${chart}

  <div class="section-head" style="margin-top:44px;margin-bottom:8px">
    <h2>The cycle, in four legs</h2>
    <p>Index change between the turning points the data itself picks out.</p>
  </div>

  <div class="table-scroll">
  <table class="tbl">
    <thead><tr>
      <th scope="col">Leg</th><th scope="col">Period</th>
      <th scope="col" style="text-align:right">All</th>
      <th scope="col" style="text-align:right">Flats</th>
      <th scope="col" style="text-align:right">Villas</th>
    </tr></thead>
    <tbody>
      ${row("The run-up", a.legs.runUp)}
      ${row("The slide", a.legs.slide)}
      ${row("The surge", a.legs.surge)}
      ${row("Whole series", a.legs.whole)}
    </tbody>
  </table>
  </div>

  <div class="section-head" style="margin-top:44px;margin-bottom:8px">
    <h2>Two things worth taking from this</h2>
  </div>
  <div style="max-width:var(--prose)">
    <p><b>The recovery took ${yrs} years.</b> The index peaked at ${a.peak.value.toFixed(3)} in ${month(a.peak.date)} and did not close above that level again until ${month(a.recovered.date)} &mdash; ${a.recovered.months} months. Anyone who bought at the top and needed their money in 2019 did not have the option of waiting for this cycle. That is what a property market's illiquidity actually costs, and it is not visible in any headline growth figure.</p>
    <p><b>Villas fell much harder, and did not rise enough to make it back.</b> Through the slide villas gave up ${pc(a.legs.slide.villa)} against ${pc(a.legs.slide.flat)} for flats. Through the surge the two are level &mdash; ${pc(a.legs.surge.villa)} for villas against ${pc(a.legs.surge.flat)} for flats, a gap of well under a percentage point. A bigger hole and the same climb out of it is why, over the whole ${a.months} months, flats are the ones ahead: ${pc(a.legs.whole.flat)} against ${pc(a.legs.whole.villa)}. &ldquo;Villas always outperform&rdquo; is a description of ${a.legs.surge.from.slice(0, 4)} onwards that got mistaken for a rule about Dubai.</p>
    <p>At the end of the series the average recorded price was ${money(a.lastPrices.all)} across all residential property, ${money(a.lastPrices.flat)} for flats and ${money(a.lastPrices.villa)} for villas.</p>
  </div>

  <div class="section-head" style="margin-top:44px;margin-bottom:8px">
    <h2>Method</h2>
  </div>
  <div style="max-width:var(--prose)">
    <ul>
      <li><b>Source.</b> <a href="${esc(data.sourceUrl)}" rel="nofollow noopener">${esc(data.source)}</a>, retrieved ${longDate(data.retrievedAt)}.</li>
      <li><b>Coverage.</b> ${a.months} consecutive months, ${month(a.first)} to ${stops}. No gaps and no interpolation &mdash; every month in that span is a published reading.</li>
      <li><b>The index.</b> Published by the DLD with 2012 as the base year, so 1.000 is the 2012 average. It is a transaction index, not a valuation model.</li>
      <li><b>Turning points.</b> Not chosen by hand. The peak is the highest reading before 2017, the trough is the lowest reading after it, and the recovery is the first month closing above the peak. Change the data and they move.</li>
      <li><b>What it cannot tell you.</b> Anything after ${stops}, anything about a specific building or area, and anything about what you would achieve on a sale today. It is a market-wide history.</li>
      <li><b>Corrections.</b> If something here is wrong it should be fixed rather than defended. <a href="/contact/">Tell me</a>.</li>
    </ul>
  </div>

  <div class="callout" style="max-width:var(--prose);margin-top:36px">
    <b>Use it</b>
    Free to quote, screenshot and republish with attribution to ${esc(site.name)}. No permission needed. The underlying data is the DLD's and is open.
  </div>

  <p style="margin-top:28px"><a class="btn btn--ghost btn--sm" href="/playbooks/net-rental-yield/">What a building actually nets you</a> <a class="btn btn--ghost btn--sm" href="/playbooks/off-plan-vs-ready/">Off-plan against ready</a> <a class="btn btn--ghost btn--sm" href="/playbooks/short-let-vs-long-let/">Short let against long let</a></p>

  ${captureBlock(site, {
    source: "dubai-price-index",
    heading: "The rest of the arithmetic",
    blurb: "This page is the history. The library is what it costs to own one of these, line by line: service charges, the transfer fee, the agency fee, what a short let nets after the permit and the cleaning. One email address, no card, unsubscribe in one click.",
  })}
</div></section>`;

  return {
    title: pageTitle(`Dubai property prices 2011 to 2024, the official DLD index`, site.name),
    description: `The DLD residential sale index, ${a.months} months to ${stops}. Prices took ${a.recovered.months} months to recover the 2015 peak. Flats ${pc(a.legs.whole.flat)}, villas ${pc(a.legs.whole.villa)}.`,
    path: "/dubai-price-index/",
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "Dubai residential sale index, 2011 to 2024",
        description: `The Dubai Land Department residential sale index over ${a.months} consecutive months, split by all property, flats and villas, with the average recorded price behind each reading.`,
        url: `${site.origin}/dubai-price-index/`,
        /* No license field. The compilation is mine to give away, the
           underlying series is the DLD's, and a machine-readable CC-BY here
           would read as a licence over their data that I cannot grant. The
           page says in words what may be done with it. */
        isAccessibleForFree: true,
        creator: { "@type": "Organization", name: site.name, url: site.origin },
        temporalCoverage: `${a.first.slice(0, 10)}/${data.coverageTo}`,
        spatialCoverage: { "@type": "Place", name: "Dubai, United Arab Emirates" },
        isBasedOn: data.sourceUrl,
        variableMeasured: [
          { "@type": "PropertyValue", name: "Residential sale index", description: "Transaction index, 2012 = 1.000" },
          { "@type": "PropertyValue", name: "Average recorded price", unitText: "AED" },
        ],
      },
    ],
  };
}
