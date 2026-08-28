import { esc, copy, md, pageTitle } from "../lib.mjs";
import { captureBlock } from "./layout.mjs";

const CATS = { property: "Property", markets: "Markets", tax: "Tax and structure", behaviour: "Behaviour" };

const letterOf = (t) => t.term.trim()[0].toUpperCase();

export function glossaryIndex({ site, terms }) {
  const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term));
  const letters = [...new Set(sorted.map(letterOf))];

  const jump = `<div class="alpha">${letters
    .map((l) => `<a href="#l-${l}">${l}</a>`)
    .join("")}</div>`;

  const chips = `<div class="chips" id="gl-chips">
    <button class="chip" data-cat="all" aria-pressed="true">Everything</button>
    ${Object.entries(CATS)
      .filter(([k]) => sorted.some((t) => t.category === k))
      .map(([k, v]) => `<button class="chip" data-cat="${k}" aria-pressed="false">${esc(v)}</button>`)
      .join("")}
  </div>`;

  const groups = letters
    .map((l) => {
      const rows = sorted.filter((t) => letterOf(t) === l);
      return `<section class="glblock" id="l-${l}" data-letter>
    <h2 class="glblock__l">${l}</h2>
    <div class="glrows">
      ${rows
        .map(
          (t) => `<a class="gl" href="/glossary/${esc(t.slug)}/" data-cat="${esc(t.category)}" data-text="${esc(
            (t.term + " " + t.definition).toLowerCase()
          )}">
        <span class="gl__t">${esc(t.term)}</span>
        <span class="gl__d">${esc(copy(t.definition))}</span>
      </a>`
        )
        .join("")}
    </div>
  </section>`;
    })
    .join("");

  const body = `<section class="band"><div class="wrap">
  <div class="section-head" style="margin-bottom:24px">
    <p class="eyebrow">Plain definitions</p>
    <h1>Glossary</h1>
    <p>Every term used on this site, defined in one sentence that stands on its own, with the specific way people get it wrong written underneath. ${sorted.length} entries.</p>
  </div>

  <div class="field" style="max-width:420px;margin-bottom:18px">
    <label for="gl-search">Search</label>
    <input id="gl-search" type="text" placeholder="yield, situs, duration">
  </div>
  ${chips}
  ${jump}
  ${groups}
  <p id="gl-empty" hidden style="color:var(--muted);padding:26px 0">No term matches that.</p>

${captureBlock(site, { source: "glossary-index", heading: "Definitions are the easy half", blurb: "The frameworks that use these terms, as one document. Free, one email address, unsubscribe in one click." })}
</div></section>`;

  return {
    title: pageTitle("Glossary of investing and property terms", site.name),
    description: `${sorted.length} property, markets and tax terms, each defined in a single sentence, with the common mistake named underneath.`,
    path: "/glossary/",
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "DefinedTermSet",
        name: `${site.name} Glossary`,
        url: `${site.origin}/glossary/`,
        hasDefinedTerm: sorted.map((t) => ({
          "@type": "DefinedTerm",
          name: copy(t.term),
          description: copy(t.definition),
          url: `${site.origin}/glossary/${t.slug}/`,
        })),
      },
    ],
  };
}

export function glossaryTerm({ site, term, terms, playbookTitles }) {
  const bySlug = Object.fromEntries(terms.map((t) => [t.slug, t]));
  const related = (term.related || []).map((s) => bySlug[s]).filter(Boolean);

  const pb =
    term.playbook && playbookTitles[term.playbook]
      ? `<div class="callout" style="margin-top:34px">
    <b>The framework behind it</b>
    ${esc(playbookTitles[term.playbook])} sets out the rule, the arithmetic and where it breaks.
    <p style="margin:12px 0 0"><a class="btn btn--ghost btn--sm" href="/playbooks/${esc(term.playbook)}/">Read the framework</a></p>
  </div>`
      : "";

  const body = `<section class="band"><div class="wrap">
  <p class="eyebrow"><a href="/glossary/" style="color:inherit;text-decoration:none">Glossary</a> / ${esc(CATS[term.category] || term.category)}</p>
  <h1 style="font-size:clamp(2rem,4.4vw,3rem);max-width:18ch">${esc(term.term)}</h1>

  <p class="definition" style="margin-top:26px">${esc(copy(term.definition))}</p>

  <div class="article" style="margin-top:6px">${md(term.body)}</div>

  <div class="trap">
    <span class="trap__l">Where people get it wrong</span>
    <p>${esc(copy(term.trap))}</p>
  </div>

  ${pb}

  ${
    related.length
      ? `<div style="margin-top:44px;max-width:var(--prose)">
    <h2 style="font-size:1.3rem;margin-bottom:14px">Related terms</h2>
    <div class="glrows">${related
      .map(
        (r) => `<a class="gl" href="/glossary/${esc(r.slug)}/">
      <span class="gl__t">${esc(r.term)}</span>
      <span class="gl__d">${esc(copy(r.definition))}</span>
    </a>`
      )
      .join("")}</div>
  </div>`
      : ""
  }

  ${captureBlock(site, {
    source: `glossary/${term.slug}`,
    heading: "A definition is the start of it",
    blurb: "The frameworks that use this term, and every other one on the site, as a single document. Free, one email address, unsubscribe in one click.",
  })}

  <p style="font-size:12px;color:var(--muted);margin-top:40px;max-width:var(--prose)">${esc(site.disclaimer)}</p>
</div></section>`;

  return {
    title: pageTitle(`${copy(term.term)}, defined`, site.name),
    description: copy(term.definition),
    path: `/glossary/${term.slug}/`,
    crumb: term.term,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "DefinedTerm",
        name: copy(term.term),
        description: copy(term.definition),
        url: `${site.origin}/glossary/${term.slug}/`,
        inDefinedTermSet: `${site.origin}/glossary/`,
      },
    ],
  };
}
