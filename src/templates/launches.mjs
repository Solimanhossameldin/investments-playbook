import { esc, longDate, pageTitle } from "../lib.mjs";
import { whatsappUrl } from "./contact.mjs";
import { ownShare, FEES } from "../launches.mjs";

/* A developer's launch list, dated, with the fee split done per project.

   Every page competing on this query is a brokerage listing page: a grid of
   project names and "from" prices, no date on the figures, no source for
   them, and a form. This page gives the same list with the day it was read
   and the listing it came from printed at the top, and then does the one
   piece of arithmetic none of them does -- the half of the registration fee
   that Article 3 leaves with the seller, which on an initial sale is the
   developer.

   The page sells nothing and gates nothing. The only call to action is the
   site's own WhatsApp route, rendered only if one is configured, with the
   project's name prefilled so the question arrives already specific. */

const aed = (n) => n.toLocaleString("en-US");

export function launchesPage({ site, index }) {
  const { developer, source, sourceUrl, retrievedAt, note, rows, count, liveCount,
    soldOutCount, low, high, shareLow, shareHigh, locations } = index;

  const wa = whatsappUrl(site);
  const ask = (name) =>
    wa ? `${wa}?text=${encodeURIComponent(`I'm looking at ${developer} ${name}. Who is paying the 2% registration share on the initial sale?`)}` : "";

  const pct = (r) => `${(r * 100).toFixed(0)}%`;

  const tableRows = rows.map((r) => `    <tr${r.soldOut ? ' class="muted"' : ""}>
      <td>${esc(r.name)}${r.soldOut ? " <small>(listed sold out)</small>" : ""}${r.note ? `<br><small>${esc(r.note)}</small>` : ""}</td>
      <td>${esc(r.location || "")}</td>
      <td>${esc(r.delivery || "not stated")}</td>
      <td class="num">${aed(r.priceAed)}</td>
      <td class="num">${aed(r.wholeFee)}</td>
      <td class="num"><b>${aed(r.share)}</b></td>
      <td>${ask(r.name) ? `<a href="${esc(ask(r.name))}" rel="noopener nofollow" target="_blank">Ask who pays it</a>` : ""}</td>
    </tr>`).join("\n");

  const body = `<section class="band"><div class="wrap">
  <div class="section-head" style="margin-bottom:8px">
    <p class="eyebrow">Dated, sourced, and nothing behind a form</p>
    <h1>${esc(developer)} launch prices, and the 2% the law leaves with the seller</h1>
    <p><b>${liveCount} ${esc(developer)} launches are currently listed, from AED&nbsp;${aed(low)} to AED&nbsp;${aed(high)}, read on ${longDate(retrievedAt)}.</b> On an initial sale the seller is the developer, and Article 3 of Executive Council Resolution No. (30) of 2013 makes the ${pct(FEES.transferRate)} registration fee <b>shared equally by the seller and purchaser</b> in the absence of an agreement to the contrary. So the ${pct(ownShare)} in the last column below, AED&nbsp;${aed(shareLow)} to AED&nbsp;${aed(shareHigh)} across this list, is the developer's half by default, and a buyer who pays the whole ${pct(FEES.transferRate)} is paying it under a term of the contract rather than a rule of law.</p>
  </div>

  <div class="callout" style="max-width:var(--prose)">
    <b>What these figures are, and what they are not</b>
    Every price here is the launch price <a href="${esc(sourceUrl)}" rel="noopener nofollow" target="_blank">${esc(source)}</a> states, read on ${longDate(retrievedAt)}. ${note ? esc(note) + " " : ""}This site has no agency relationship with ${esc(developer)}, and nothing here is an offer. Launch prices move, releases sell out, and a figure is worth exactly the date printed beside it.
  </div>

  <div class="section-head" style="margin-top:44px;margin-bottom:8px">
    <h2>The list, cheapest first</h2>
    <p>${count} projects, ${soldOutCount ? `${soldOutCount} of them listed as sold out, ` : ""}across ${locations.length} ${locations.length === 1 ? "location" : "locations"}. The two fee columns are arithmetic on the price in the row beside them, at the ${pct(FEES.transferRate)} the Schedule sets.</p>
  </div>

  <div class="tablewrap"><table>
    <thead><tr>
      <th>Project</th><th>Location</th><th>Delivery</th>
      <th class="num">Launch price, AED</th>
      <th class="num">Registration fee, ${pct(FEES.transferRate)}</th>
      <th class="num">The seller's ${pct(ownShare)}</th>
      <th></th>
    </tr></thead>
    <tbody>
${tableRows}
    </tbody>
  </table></div>

  <div class="section-head" style="margin-top:44px;margin-bottom:8px">
    <h2>Why the last column is the one to read</h2>
  </div>
  <div class="prose">
    <p>A launch price is a floor, not a price. It is the cheapest unit in the release, usually the smallest and the worst positioned, and the unit a buyer actually wants is above it. So the useful thing on a launch list is not the ranking of the prices but the costs that attach to whichever unit is chosen, and the largest single one of those is the registration fee.</p>
    <p>Article 3 of the Resolution makes that fee a joint liability, <b>shared equally by the seller and purchaser</b> unless the contract says otherwise. In Dubai the contract almost always says otherwise, and the buyer carries all ${pct(FEES.transferRate)}. On a resale that is a negotiation between two private individuals. On an initial sale the counterparty is the developer, the ${pct(ownShare)} being waived is the developer's, and the amount is in the table above: AED&nbsp;${aed(shareLow)} at the bottom of this list and AED&nbsp;${aed(shareHigh)} at the top.</p>
    <p>It is the one line on an initial sale that is written into a law rather than into a brochure, which makes it the one worth asking about by name before anything is signed. <a href="/playbooks/cost-of-buying-in-dubai/">The cost of buying in Dubai</a> itemises the rest of the stack to the dirham, <a href="/playbooks/off-plan-irr/">off-plan payment plans</a> prices what a deferral is actually worth against the premium charged for it, and <a href="/playbooks/due-diligence-before-an-offer/">due diligence before an offer</a> puts this negotiation beside the two others worth having.</p>
    <p>Three costs on this list are not in the table because nobody has published them yet. The service charge on an unbuilt building has no approved budget, so it cannot be looked up in <a href="/playbooks/service-charge-and-reserves/">the Land Department's index</a> until there is one. The payment plan decides the real price and is not a price. And the developer's own no objection certificate fee on a later resale is set by the developer and published centrally nowhere. A page that estimated any of the three would be guessing, so this one names them instead.</p>
  </div>
${wa ? `
  <aside class="cap" aria-label="Ask about a launch">
    <h2>Ask about one of these before you commit to it</h2>
    <p>No form, no email address required, and nothing is gated. Pick a project in the table and the message arrives with its name already in it, or start here. The question that gets the most useful answer fastest is the one in the last column: who is paying the ${pct(ownShare)}.</p>
    <p><a class="btn" href="${esc(wa)}" rel="noopener nofollow" target="_blank">Ask on WhatsApp</a></p>
  </aside>` : ""}
</div></section>`;

  return {
    title: pageTitle(`${developer} launch prices and the seller's ${pct(ownShare)}`, site.name),
    description: `${liveCount} ${developer} launches listed from AED ${aed(low)} to AED ${aed(high)}, read ${longDate(retrievedAt)}, with the ${pct(ownShare)} registration share Article 3 leaves with the developer worked out per project.`,
    path: "/nakheel-launches/",
    crumb: `${developer} launches`,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "Dataset",
        name: `${developer} launch prices, Dubai`,
        description: `Launch prices for ${count} ${developer} projects in Dubai as listed on ${retrievedAt}, with the registration fee and the seller's ${pct(ownShare)} share computed for each.`,
        url: `${site.origin}/nakheel-launches/`,
        dateModified: retrievedAt,
        isAccessibleForFree: true,
        /* Where the figures came from. The audit refuses a Dataset without
           it, and rightly: these are a third party's published prices, not
           this site's measurements. No licence is asserted over them for the
           same reason. */
        isBasedOn: { "@type": "WebPage", name: source, url: sourceUrl },
        creator: { "@type": "Organization", name: site.name, url: site.origin },
        variableMeasured: ["Launch price, AED", `Registration fee at ${pct(FEES.transferRate)}`, `Seller's ${pct(ownShare)} share`],
      },
    ],
  };
}
