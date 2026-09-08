import { esc, pageTitle } from "../lib.mjs";
import { captureBlock } from "./layout.mjs";
import { register, AREAS } from "../lawregister.mjs";

/* The Dubai property law register. A reader who searches for the decree
   rather than the arithmetic should land on a page that gives them the
   instrument, what it sets, and the page that does the sums with it. Every
   figure line is a claim a playbook already carries word for word, drawn
   from the module that holds it, so nothing here can outrun the site. */

export function propertyLawPage({ site, playbooks }) {
  const entries = register();
  const titleOf = new Map(playbooks.map((p) => [p.slug, p.title]));
  const reviewedOf = new Map(playbooks.map((p) => [p.slug, p.reviewed]));

  const entry = (e) => `<article class="law" id="${esc(e.key)}" style="max-width:var(--prose);padding:22px 0;border-top:1px solid var(--line)">
    <p class="eyebrow" style="margin:0 0 4px">${e.year ? esc(String(e.year)) : "Land Department service page"}</p>
    <h3 style="margin:0 0 8px"><a href="${esc(e.url)}" rel="noopener" target="_blank">${esc(e.name)}</a></h3>
    <p style="margin:0 0 10px">${esc(e.what)}</p>
    ${e.sets.length ? `<p style="margin:0 0 6px;font-size:13.5px;color:var(--muted)">In the instrument's own words, it sets:</p>
    <ul style="margin:0 0 12px">${e.sets.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
    <p style="margin:0;font-size:14px">Applied, with a worked example, in <a href="/playbooks/${esc(e.applied)}/">${esc(titleOf.get(e.applied) || e.applied)}</a>, reviewed ${esc(reviewedOf.get(e.applied) || "")}.</p>
  </article>`;

  const section = (area) => `<div class="section-head" style="margin-top:44px;margin-bottom:0">
    <h2>${esc(area)}</h2>
  </div>
  ${entries.filter((e) => e.area === area).map(entry).join("\n")}`;

  const body = `<section class="band"><div class="wrap">
  <div class="section-head" style="margin-bottom:8px">
    <p class="eyebrow">The instruments, not the articles about them</p>
    <h1>Dubai property law, the fees and limits it actually sets</h1>
    <p>Every fee, cap and notice period this site quotes is set by a resolution, a decree or a law, and each one is public, free and better written than the brokerage page that paraphrases it. This is the register of those instruments: what each one sets, in its own words, and the page on this site that does the arithmetic with it.</p>
  </div>

  ${AREAS.map(section).join("\n")}

  <p style="max-width:var(--prose);margin-top:36px;font-size:14px;color:var(--muted)">A register of the instruments this site's arithmetic depends on, not legal advice. Every line above is the instrument's own wording. If one has been amended and a page here has not caught up, <a href="/contact/">say so</a> and it will be fixed.</p>

  ${captureBlock(site, {
    source: "dubai-property-law",
    heading: "The arithmetic these instruments feed",
    blurb: "The register is the law. The library is what it does to a purchase: the fee stack line by line, what a rent cap does over five renewals, what a short let nets after the permit and the tourism dirham. One email address, no card, unsubscribe in one click.",
  })}
</div></section>`;

  return {
    title: pageTitle("Dubai property law: the fees, caps and notice periods it sets", site.name),
    description: `The ${entries.length} instruments behind Dubai's transfer fee, mortgage fee, rent caps, notice periods and holiday home charges, each linked to its official text.`,
    path: "/dubai-property-law/",
    body,
  };
}
