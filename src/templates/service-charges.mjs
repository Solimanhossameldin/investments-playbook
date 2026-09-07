import { esc, longDate, pageTitle } from "../lib.mjs";

/* The service charge index.

   Every page found competing on this query in September 2026 published either
   area bands with no building named, or a handful of towers credited to
   "Mollak data" with no retrieval date and no sample size. The gap is not that
   nobody covers it. The gap is that nobody shows their working.

   So this page leads with the method and the sample, not the table, and every
   row carries the source it came from and the day it was read. That is the
   only reason for it to exist and the only reason anyone would cite it. */

const money = (n) => n.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function serviceChargePage({ site, index }) {
  const { rows, count, median, low, high, areas, sources, retrievedFrom, retrievedTo } = index;

  const window =
    retrievedFrom && retrievedTo && retrievedFrom !== retrievedTo
      ? `${longDate(retrievedFrom)} to ${longDate(retrievedTo)}`
      : longDate(retrievedTo || retrievedFrom);

  const body = `<section class="band"><div class="wrap">
  <div class="section-head" style="margin-bottom:8px">
    <p class="eyebrow">Free, ungated, and meant to be linked to</p>
    <h1>Dubai service charges, by building</h1>
    <p>Service charge per square foot for ${count} named ${count === 1 ? "building" : "buildings"} across ${areas.length} ${areas.length === 1 ? "area" : "areas"}, each row carrying the source it came from and the day it was read. The median here is <b>AED&nbsp;${money(median)}</b> per square foot a year, against a range of AED&nbsp;${money(low)} to AED&nbsp;${money(high)}.</p>
  </div>

  <div class="callout" style="max-width:var(--prose)">
    <b>How to read this</b>
    A service charge is quoted per square foot of your unit, per year, and it is the single largest recurring cost of owning Dubai property. On a 900&nbsp;sq&nbsp;ft flat, the difference between AED&nbsp;12 and AED&nbsp;25 per square foot is AED&nbsp;11,700 a year — which is worth more than most buyers negotiate off the purchase price. What it buys differs by building: a tower with a pool, a gym, concierge and chilled water costs more to run than one without, so a high figure is not automatically a bad one. It is only a bad one if you did not price it.
  </div>

  <div class="section-head" style="margin-top:44px;margin-bottom:8px">
    <h2>Method</h2>
    <p>Stated in full, because a table of numbers looks authoritative whether or not anyone sourced it.</p>
  </div>
  <div style="max-width:var(--prose)">
    <ul>
      <li><b>Sample.</b> ${count} ${count === 1 ? "building" : "buildings"}. This is not every building in Dubai and does not claim to be a representative sample of the market. It is the set that could be sourced to a named, checkable figure.</li>
      <li><b>Source.</b> ${sources.map((s) => esc(s)).join(", ")}. Every row names its own source and links to it.</li>
      <li><b>Retrieved.</b> ${esc(window)}. Service charges are re-approved annually, so a figure read on one date can be superseded.</li>
      <li><b>Unit.</b> AED per square foot of unit area, per year, as approved. Figures are not adjusted, smoothed or averaged across buildings.</li>
      <li><b>What is excluded.</b> Chilled water consumption billed separately, utility deposits, and any one-off reserve fund levy. Where a building's approved figure bundles these, the row says so.</li>
      <li><b>Corrections.</b> If a figure here is wrong, it should be corrected rather than defended. <a href="/contact/">Tell me</a> and it will be fixed with the change noted.</li>
    </ul>
  </div>

  <div class="section-head" style="margin-top:44px;margin-bottom:8px">
    <h2>The table</h2>
    <p>Sorted dearest first. ${count} ${count === 1 ? "row" : "rows"}.</p>
  </div>

  <div style="overflow-x:auto">
  <table class="tbl">
    <thead><tr>
      <th scope="col">Building</th>
      <th scope="col">Area</th>
      <th scope="col" style="text-align:right">AED / sq ft / year</th>
      <th scope="col">Period</th>
      <th scope="col">Source</th>
    </tr></thead>
    <tbody>
      ${rows
        .map(
          (r) => `<tr>
        <th scope="row">${esc(r.project)}</th>
        <td>${esc(r.area)}</td>
        <td style="text-align:right;font-variant-numeric:tabular-nums">${money(r.psf)}</td>
        <td>${esc(r.period)}</td>
        <td><a href="${esc(r.sourceUrl)}" rel="nofollow noopener">${esc(r.source)}</a><span class="sr-only">, retrieved ${esc(r.retrievedAt)}</span></td>
      </tr>`
        )
        .join("")}
    </tbody>
  </table>
  </div>

  <div class="callout" style="max-width:var(--prose);margin-top:36px">
    <b>Use it</b>
    This table is free to quote, screenshot and republish with attribution to ${esc(site.name)}. No permission needed and no link required, though one is appreciated. If you want it as a file rather than a page, <a href="/contact/">ask</a>.
  </div>

  <p style="margin-top:28px"><a class="btn btn--ghost btn--sm" href="/playbooks/service-charge-and-reserves/">What a service charge actually pays for</a> <a class="btn btn--ghost btn--sm" href="/calculators/net-rental-yield/">Put it through the net yield calculator</a></p>
</div></section>`;

  return {
    title: pageTitle(`Dubai service charges by building, ${count} towers with sources`, site.name),
    description: `Service charge per square foot for ${count} named Dubai buildings, median AED ${money(median)}, every row sourced and dated. Free to quote.`,
    path: "/service-charges/",
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: "Dubai service charges by building",
        description: `Service charge per square foot per year for ${count} named Dubai buildings across ${areas.length} areas, each figure attributed to a named source and the date it was retrieved.`,
        url: `${site.origin}/service-charges/`,
        license: "https://creativecommons.org/licenses/by/4.0/",
        isAccessibleForFree: true,
        creator: { "@type": "Organization", name: site.name, url: site.origin },
        temporalCoverage: [...new Set(rows.map((r) => r.period))].sort().join(", "),
        spatialCoverage: { "@type": "Place", name: "Dubai, United Arab Emirates" },
        variableMeasured: {
          "@type": "PropertyValue",
          name: "Service charge",
          unitText: "AED per square foot per year",
          minValue: low,
          maxValue: high,
          median: median,
        },
      },
    ],
  };
}
