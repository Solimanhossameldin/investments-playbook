import { esc, fmt } from "../lib.mjs";

const money = (n) => "AED " + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });

function period(c) {
  const f = new Date(c.from + "T12:00:00Z"), t = new Date(c.to + "T12:00:00Z");
  const o = { month: "long", year: "numeric" };
  const a = f.toLocaleDateString("en-GB", o), b = t.toLocaleDateString("en-GB", o);
  return a === b ? a : `${a} to ${b}`;
}

export function communityIndex({ site, data }) {
  const cs = data.communities || [];

  const empty = `<div class="callout" style="max-width:var(--prose)">
    <b>Nothing published yet</b>
    These pages are built from Dubai Land Department transaction records, and none have been loaded. A community appears here only once there are enough recorded sales in the last twelve months to support a median, which is ${data.minSales || 30}. Until then this page says so rather than showing an estimate.
  </div>`;

  const table = cs.length
    ? `<div class="table-scroll"><table class="tbl">
    <caption>Median price per square foot, last twelve months</caption>
    <thead><tr><th>Community</th><th class="n">Median per sq ft</th><th class="n">Middle half</th><th class="n">Sales</th></tr></thead>
    <tbody>${cs
      .map(
        (c) => `<tr>
      <td><a href="/communities/${esc(c.slug)}/">${esc(c.name)}</a></td>
      <td class="n">${money(c.medianPerSqft)}</td>
      <td class="n note">${money(c.p25PerSqft)} to ${money(c.p75PerSqft)}</td>
      <td class="n">${c.sales.toLocaleString("en-US")}</td>
    </tr>`
      )
      .join("")}</tbody></table></div>`
    : empty;

  const withheld = (data.skipped || []).length
    ? `<h2 style="font-size:1.5rem;margin:56px 0 6px">Withheld</h2>
  <p style="font-size:13.5px;color:var(--muted);margin:0 0 16px;max-width:var(--prose)">These communities had recorded sales in the period but not enough of them to publish a median that means anything. A page that said "insufficient data" would be more honest than a number, and no page at all is more honest still.</p>
  <p style="font-size:13.5px;color:var(--muted);max-width:var(--prose)">${(data.skipped || [])
    .slice(0, 40)
    .map((s) => `${esc(s.community)} (${s.sales})`)
    .join(", ")}</p>`
    : "";

  const body = `<section class="band"><div class="wrap">
  <div class="section-head" style="margin-bottom:24px">
    <p class="eyebrow">Built from recorded transactions</p>
    <h2>Dubai by community</h2>
    <p>What property actually changed hands for, by community, from Dubai Land Department records. Median price per square foot, the middle half of the range, and the number of sales behind each figure so you can judge how much weight it carries.</p>
  </div>

  ${
    cs.length
      ? `<p class="wire-meta"><span class="livedot"></span> ${data.totalSales.toLocaleString(
          "en-US"
        )} recorded sales across ${cs.length} communities, last ${Math.round(
          (data.windowDays || 365) / 30
        )} months. Source: ${esc(data.source || "Dubai Land Department")}.</p>`
      : ""
  }

  ${table}
  ${withheld}

  <div class="callout" style="margin-top:56px;max-width:var(--prose)">
    <b>What these numbers are not</b>
    A median is the middle of a range, not a valuation of your unit. Floor, view, layout, age and condition move a specific property a long way from its community median, which is what the <a href="/playbooks/price-per-square-foot/">price per square foot</a> framework is for. Nothing here is an estimate of what anything is worth.
  </div>

  <p style="font-size:12px;color:var(--muted);margin-top:34px;max-width:var(--prose)">${esc(site.disclaimer)}</p>
</div></section>`;

  return {
    title: `Dubai property prices by community. ${site.name}`,
    description:
      "Median price per square foot by Dubai community, built from Dubai Land Department transaction records, with the number of sales behind every figure.",
    path: "/communities/",
    body,
  };
}

export function communityPage({ site, c, data }) {
  const mix =
    c.apartments || c.villas
      ? `<p style="font-size:14.5px;color:var(--muted);margin:0 0 22px">Of the ${c.sales.toLocaleString(
          "en-US"
        )} sales, ${c.apartments.toLocaleString("en-US")} were apartments and ${c.villas.toLocaleString(
          "en-US"
        )} were villas or townhouses. The rest were not classified.</p>`
      : "";

  const body = `<section class="band"><div class="wrap">
  <p class="eyebrow"><a href="/communities/" style="color:inherit;text-decoration:none">Communities</a> / Dubai</p>
  <h1 style="font-size:clamp(2rem,4.4vw,3rem);max-width:18ch">${esc(c.name)}</h1>

  <p class="definition" style="margin-top:26px">Property in ${esc(c.name)} sold at a median of ${money(
    c.medianPerSqft
  )} per square foot over ${esc(period(c))}, across ${c.sales.toLocaleString(
    "en-US"
  )} recorded transactions.</p>

  <div class="table-scroll" style="max-width:var(--prose);margin:30px 0 10px"><table class="tbl">
    <caption>The figures</caption>
    <tbody>
      <tr><td>Median price per square foot</td><td class="n">${money(c.medianPerSqft)}</td></tr>
      <tr><td>Middle half of sales</td><td class="n">${money(c.p25PerSqft)} to ${money(c.p75PerSqft)}</td></tr>
      <tr><td>Median sale price</td><td class="n">${money(c.medianPrice)}</td></tr>
      ${c.medianSqft ? `<tr><td>Median size</td><td class="n">${fmt(c.medianSqft, 0)} sq ft</td></tr>` : ""}
      <tr><td>Recorded sales in the period</td><td class="n">${c.sales.toLocaleString("en-US")}</td></tr>
      <tr><td>Period covered</td><td class="n">${esc(period(c))}</td></tr>
    </tbody>
  </table></div>

  <p style="font-size:12.5px;color:var(--muted);max-width:var(--prose);margin-bottom:26px">Source: Dubai Land Department transaction records. Sales only, excluding mortgages and gifts.</p>

  ${mix}

  <div class="article" style="margin-top:10px">
    <h2>How to use this</h2>
    <p>The median is the middle of what actually transacted, which makes it a far better anchor than an asking price. It is not a valuation. Half of the sales in ${esc(
      c.name
    )} happened between ${money(c.p25PerSqft)} and ${money(
    c.p75PerSqft
  )} per square foot, and that spread is the honest measure of how much a specific unit can differ from the middle.</p>
    <p>Before making an offer, work out the price per square foot of the unit you are looking at using the area on the title deed, and place it in that range. Then ask what justifies its position: floor, view, layout, condition, or nothing at all.</p>
    <h2>What the price does not tell you</h2>
    <p>Nothing on this page describes the income. Two units at the same price per square foot with different service charges and different achievable rents are different investments, and the difference is usually larger than the price gap that gets negotiated over.</p>
  </div>

  <div class="callout" style="margin-top:34px;max-width:var(--prose)">
    <b>Run it on your own numbers</b>
    The net yield calculator uses the verified service charge and the achievable rent rather than the advertised ones.
    <p style="margin:12px 0 0"><a class="btn btn--solid btn--sm" href="/calculators/net-rental-yield/">Open the calculator</a></p>
  </div>

  <div style="margin-top:44px;max-width:var(--prose)">
    <h2 style="font-size:1.3rem;margin-bottom:14px">The frameworks that apply</h2>
    <div class="glrows">
      <a class="gl" href="/playbooks/price-per-square-foot/"><span class="gl__t">Price per square foot</span><span class="gl__d">What to compare against, and why district averages are near useless for a specific unit.</span></a>
      <a class="gl" href="/playbooks/net-rental-yield/"><span class="gl__t">Net rental yield</span><span class="gl__d">The only yield figure that describes money actually reaching the owner.</span></a>
      <a class="gl" href="/playbooks/due-diligence-before-an-offer/"><span class="gl__t">Due diligence before an offer</span><span class="gl__d">The four things to verify, all of them checkable before you offer.</span></a>
      <a class="gl" href="/playbooks/transaction-cost-drag/"><span class="gl__t">Transaction cost drag</span><span class="gl__d">The round trip costs eight to ten percent. How long you hold decides what that is per year.</span></a>
    </div>
  </div>

  <p style="font-size:12px;color:var(--muted);margin-top:40px;max-width:var(--prose)">${esc(site.disclaimer)}</p>
</div></section>`;

  return {
    title: `${c.name} property prices per square foot. ${site.name}`,
    description: `Property in ${c.name} sold at a median of ${money(c.medianPerSqft)} per square foot across ${c.sales} recorded Dubai Land Department transactions.`,
    path: `/communities/${c.slug}/`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: `${c.name} recorded property sales`,
        description: `Median price per square foot and sale price for ${c.name}, Dubai, derived from Dubai Land Department transaction records.`,
        url: `${site.origin}/communities/${c.slug}/`,
        temporalCoverage: `${c.from}/${c.to}`,
        creator: { "@type": "Organization", name: "Dubai Land Department" },
        isAccessibleForFree: true,
      },
    ],
  };
}
