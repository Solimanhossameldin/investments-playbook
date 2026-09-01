import { esc, copy, fmt, pct, dir, glyph, gst, clampDescription, COUNTRIES, DIAL, INTENTS } from "../lib.mjs";
import { primaryCta, whatsappUrl } from "./contact.mjs";

// Breadcrumbs are derived from the URL rather than declared per page, because
// the URL is the hierarchy: /playbooks/price-to-rent/ has exactly one parent
// and it is /playbooks/. Only the leaf needs a name a person would recognise,
// and only the caller knows it, so a page without `crumb` emits no trail
// rather than a trail ending in a slug.
const SECTIONS = {
  playbooks: "Playbooks",
  calculators: "Calculators",
  glossary: "Glossary",
  brief: "The Brief",
  start: "Where to start",
  communities: "Communities",
  chartbook: "Chartbook",
};

function breadcrumbs(site, path, crumb) {
  const parts = path.split("/").filter(Boolean);
  if (!crumb || parts.length < 2 || !SECTIONS[parts[0]]) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: site.name, item: `${site.origin}/` },
      { "@type": "ListItem", position: 2, name: SECTIONS[parts[0]], item: `${site.origin}/${parts[0]}/` },
      { "@type": "ListItem", position: 3, name: crumb, item: site.origin + path },
    ],
  };
}

export function head({ site, title, description, path, jsonld = [], ogType = "website", noindex = false, assets = {}, crumb = "" }) {
  const url = site.origin + path;
  // Clamped here rather than at every call site, so a long description
  // written anywhere on the site still ships at a length that survives.
  const desc = clampDescription(description);
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : ""}
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(site.origin)}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(site.name)}. ${esc(site.tagline)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(site.origin)}/og.png">
<link rel="alternate" type="application/atom+xml" title="${esc(site.name)}. The Brief" href="/feed.xml">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/icon-512.png" type="image/png" sizes="512x512">
<link rel="apple-touch-icon" href="/icon-512.png">
<meta name="theme-color" content="#000000">
<link rel="preload" href="/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css${assets.css ? `?v=${assets.css}` : ""}">
${[...jsonld, breadcrumbs(site, path, crumb)].filter(Boolean).map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}`;
}

export function header(site, path) {
  const cur = (h) => (path === h || (h !== "/" && path.startsWith(h)) ? ' aria-current="page"' : "");
  return `<header class="hdr"><div class="wrap hdr__in">
  <a class="mark" href="/">Investments <b>Playbook</b></a>
  <nav class="nav" id="nav">${site.nav.map((n) => `<a href="${n.href}"${cur(n.href)}>${esc(n.label)}</a>`).join("")}</nav>
  <a class="btn btn--ghost btn--sm" href="/#playbook">Get the Playbook</a>
  <button class="burger" id="burger" aria-label="Menu" aria-expanded="false">≡</button>
</div></header>`;
}

export function ticker(market) {
  const q = (market.quotes || []).filter((x) => x.value !== null && x.value !== undefined);
  if (!q.length) {
    return `<div class="ticker"><div class="wrap"><div class="ticker__in">${Array.from({ length: 8 })
      .map(() => `<div class="tk"><span class="tk__l">Loading</span><span class="tk__v">&nbsp;</span></div>`)
      .join("")}</div></div></div>`;
  }
  const order = ["equity", "rate", "commodity", "fx", "crypto", "property"];
  const sorted = [...q].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || a.order - b.order);
  return `<div class="ticker"><div class="wrap"><div class="ticker__in">
${sorted
  .map(
    (x) => `<div class="tk${x.stale ? " tk--stale" : ""}" data-sym="${esc(x.symbol)}"${x.stale ? ' title="Last good value, feed did not refresh"' : ""}>
  <span class="tk__l">${esc(x.label)}</span>
  <span class="tk__r"><span class="tk__v" data-live-v>${x.unit === "%" ? fmt(x.value, 2) + "%" : fmt(x.value, x.value < 10 ? 4 : 2)}</span><span class="tk__c ${
      x.changePct === null || x.changePct === undefined ? "flat" : dir(x.changePct)
    }" data-live-c>${
      x.changePct === null || x.changePct === undefined ? "" : glyph(x.changePct) + " " + pct(x.changePct)
    }</span></span>
</div>`
  )
  .join("")}
<div class="ticker__meta"><span data-live-stamp>As of ${esc(gst(market.asOf))} GST</span><a href="/data/">Sources</a></div>
</div></div></div>`;
}

// `next` is what the page will tell someone the moment after they hand over
// their email address. It is the last place on the site that was still
// promising a brief tomorrow while publication was stopped, and the worst one
// to be wrong in, so it is rendered from the same derived phrase as the rest
// rather than hard-coded in app.js.
// `source` is the page that earned the signup and `intent` is the track it
// should land in. Both are rendered into the form rather than inferred at
// runtime, because the page knows and the runtime does not: a framework page
// knows which framework it is, and a path page knows which of the seven
// intents its reader just told us about by being there.
export function briefForm(site, id = "brief-form", next = "", unlock = "", source = "", intent = "") {
  return `<form class="inline-form" data-ml="brief" id="${id}"${next ? ` data-next="${esc(next)}"` : ""}${unlock ? ` data-unlock="${esc(unlock)}"` : ""}${source ? ` data-source="${esc(source)}"` : ""}${intent ? ` data-intent="${esc(intent)}"` : ""}>
  <label class="sr-only" for="${id}-email" style="position:absolute;left:-9999px">Email address</label>
  <input id="${id}-email" name="email" type="email" required placeholder="your@email.com" autocomplete="email">
  <button class="btn btn--solid" type="submit">Continue</button>
</form>`;
}

export function leadForm(site) {
  /* Two rendering bugs and a conversion problem, all visible in one screenshot.

     `.check` is display:flex, so every child of the label became a flex item:
     the two anchors and each bare text node between them laid out side by side
     as columns, with the full stop stranded on its own. Wrapping the text in a
     single span gives the flex container two children -- the box and the text
     -- which is what it was always meant to have.

     The country input carried no `type`, and the stylesheet targets
     input[type="text"], which does not match an element with no type
     attribute. It fell out of the design system entirely and rendered as a
     small native box. Every input here now states its type, and selftest
     checks that each type the form uses is one the stylesheet actually styles.

     And it asked for eight required things before handing over a free PDF:
     six fields and two tick boxes. Name, email and phone are the record; the
     rest now help rather than block. The privacy and disclosure links move
     under the button as a sentence, which is where a statement of terms
     belongs -- the consent that legally matters is the email opt-in, and that
     is still an explicit, unticked box. */
  return `<form class="lead-form" data-ml="lead" id="lead-form">
  <div class="field"><label for="lf-name">Full name</label><input id="lf-name" name="name" type="text" required autocomplete="name"></div>
  <div class="field"><label for="lf-email">Email</label><input id="lf-email" name="email" type="email" required autocomplete="email" inputmode="email"></div>
  <div class="field field--row">
    <div><label for="lf-dial">Dial code</label><select id="lf-dial" name="dial">${DIAL.map(
      ([d, c], i) => `<option value="${d}"${i === 0 ? " selected" : ""}>${d} ${c}</option>`
    ).join("")}</select></div>
    <div><label for="lf-phone">Phone</label><input id="lf-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel"></div>
  </div>
  <div class="field"><label for="lf-country">Country <span class="opt">optional</span></label>
    <input id="lf-country" name="country" type="text" list="country-list" autocomplete="country-name" placeholder="Start typing">
    <datalist id="country-list">${COUNTRIES.map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
  </div>
  <div class="field"><label for="lf-intent">What are you trying to do? <span class="opt">optional</span></label>
    <select id="lf-intent" name="intent">
      <option value="" selected>Choose one, or skip it</option>
      ${INTENTS.map((i) => `<option value="${esc(i)}">${esc(i)}</option>`).join("")}
    </select>
  </div>
  <label class="check"><input type="checkbox" required> <span>I agree to receive the Playbook and the daily brief by email. I can unsubscribe in one click.</span></label>
  <button class="btn btn--solid" type="submit" style="width:100%;margin-top:8px">Send me the Playbook</button>
  <p class="form-note">By continuing you accept the <a href="/privacy/">privacy policy</a> and the <a href="/disclosure/">disclosure standards</a>. Nothing here is personal advice. The Playbook is educational research.</p>
</form>`;
}

// Counts are passed in and rendered, never typed in by hand. A site whose
// argument is that the advertised number and the real number differ cannot
// afford to advertise a number it does not have.
export function leadBand(site, counts = {}) {
  const frameworks = counts.frameworks ?? 0;
  const calculators = counts.calculators ?? 0;
  return `<section class="band band--ink" id="playbook"><div class="wrap">
  <div class="lead">
    <div>
      <p class="eyebrow">The flagship document</p>
      <h2 style="font-size:clamp(2.1rem,4.4vw,3.2rem)">The Investments Playbook, 2026 edition</h2>
      <p style="color:#c4c4c4;max-width:52ch;margin-top:18px">Every framework in the library, in one document. Portfolio construction, property arithmetic, risk sizing, and the tax and structure decisions that quietly cost globally mobile investors the most money.</p>
      <div class="lead__stats">
        <div class="lead__stat"><b>13+</b><span>Years in market</span></div>
        <div class="lead__stat"><b>${frameworks}</b><span>Frameworks</span></div>
        <div class="lead__stat"><b>${calculators}</b><span>Calculators</span></div>
        <div class="lead__stat"><b>Free</b><span>No card required</span></div>
      </div>
      <p style="font-size:12px;color:#8c8c8c;margin-top:16px">Framework count as of ${new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}. Calculator count as of the same date.</p>
    </div>
    <div>${leadForm(site)}</div>
  </div>
</div></section>`;
}

/* The capture that lives where the reading happens.

   The library is the part of this site search actually lands people on, and
   until now the 55 framework pages and 48 glossary pages had no form on them
   at all. Their only call to action navigated to the homepage, which asks a
   reader who has just finished one page to start a second journey before they
   can act. Almost nobody does that.

   Deliberately the light form. Email only, one field, at the moment a reader
   has just been given something. The six-field lead form still exists and
   still gates the compendium on the homepage; this is the top of that funnel
   rather than a replacement for it, and a reader who gives an email here can
   be asked for the rest later, having received something first.

   `source` is what makes it worth having: every signup names the page that
   earned it, so it is possible to find out which frameworks convert instead
   of guessing. */
export function captureBlock(site, { source, intent = "", heading = "", blurb = "", id = "" } = {}) {
  const formId = id || `cap-${String(source).replace(/[^a-z0-9]+/gi, "-")}`;
  return `<aside class="cap" aria-label="Get the framework library">
  <h2>${esc(heading || "Get every framework as one document")}</h2>
  <p>${esc(blurb || "The whole library in a single file, free, and the daily brief with it. One email address, no card, unsubscribe in one click.")}</p>
  ${briefForm(site, formId, "", "", source, intent)}
</aside>`;
}

export function authorBand(site) {
  const a = site.author;
  return `<section class="band band--tight"><div class="wrap">
  <div class="author">
    <div class="author__img" aria-hidden="true">${esc(a.initials)}</div>
    <div>
      <p class="eyebrow">Who writes this</p>
      <h2>${esc(a.name)}</h2>
      <p class="author__role">${esc(a.role)}. ${esc(a.years)}.</p>
      <p style="max-width:56ch">${esc(copy(a.bio))}</p>
      <div class="btn-row" style="margin-top:20px">
        <a class="btn btn--ghost btn--sm" href="${esc(a.linkedin)}" rel="noopener">Connect on LinkedIn</a>
        ${(() => { const c = primaryCta(site); return `<a class="btn btn--ghost btn--sm" href="${esc(c.href)}"${c.external ? ' rel="noopener"' : ""}>${esc(c.label)}</a>`; })()}
      </div>
    </div>
  </div>
</div></section>`;
}

export function footer(site) {
  return `<footer class="band band--ink-deep ftr"><div class="wrap">
  <div class="ftr__cols">
    <div>
      <a class="mark" href="/" style="color:#ffffff">Investments <b>Playbook</b></a>
      <p style="font-size:13.5px;color:#8c8c8c;margin-top:14px;max-width:34ch">${esc(copy(site.description))}</p>
    </div>
    <div><h2>The Brief</h2><ul>
      <li><a href="/brief/">Latest issue</a></li>
      <li><a href="/brief/">Archive</a></li>
      <li><a href="/brief/#get">Subscribe</a></li>
      <li><a href="/feed.xml">RSS feed</a></li>
    </ul></div>
    <div><h2>Playbooks</h2><ul>
      <li><a href="/start/">Where to start</a></li>
      <li><a href="/playbooks/">All frameworks</a></li>
      <li><a href="/playbooks/net-rental-yield/">Net rental yield</a></li>
      <li><a href="/playbooks/off-plan-irr/">Off-plan IRR</a></li>
      <li><a href="/playbooks/fund-domicile/">Fund domicile</a></li>
    </ul></div>
    <div><h2>Calculators</h2><ul>
      <li><a href="/calculators/">All calculators</a></li>
      <li><a href="/calculators/net-rental-yield/">Net rental yield</a></li>
      <li><a href="/calculators/rent-vs-buy/">Rent versus buy</a></li>
      <li><a href="/calculators/safe-withdrawal-rate/">Withdrawal rate</a></li>
    </ul></div>
    <div><h2>Company</h2><ul>
      <li><a href="/about/">About</a></li>
      <li><a href="/contact/">Contact</a></li>
      ${whatsappUrl(site) ? `<li><a href="${esc(whatsappUrl(site))}" rel="noopener">WhatsApp</a></li>` : ""}
      <li><a href="/record/">The Record</a></li>
      <li><a href="/data/">Market data</a></li>
      <li><a href="/disclosure/">Disclosure standards</a></li>
      <li><a href="/privacy/">Privacy</a></li>
    </ul></div>
  </div>
  <div class="ftr__legal">
    <p><strong style="color:#a8a8a8">Data attribution.</strong> ${esc(site.attribution)} Currency rates are provided by <a href="https://www.exchangerate-api.com" rel="noopener">ExchangeRate-API</a>. Proprietary index levels are deliberately not republished. Case-Shiller and VIX are excluded for the same reason, being S&P and Cboe intellectual property.</p>
    <p><strong style="color:#a8a8a8">Risk disclaimer.</strong> ${esc(site.disclaimer)}</p>
    <p>&copy; ${new Date().getFullYear()} ${esc(site.name)}. <a href="/disclosure/">Editorial and disclosure standards</a>. <a href="/privacy/">Privacy</a>.</p>
  </div>
</div></footer>`;
}

export function page({ site, market, title, description, path, body, jsonld, ogType, noindex, assets = {}, crumb = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
${head({ site, title, description, path, jsonld, ogType, noindex, assets, crumb })}
</head>
<body>
<a class="skip" href="#main">Skip to the content</a>
${header(site, path)}
${ticker(market)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(site)}
<script src="/app.js${assets.js ? `?v=${assets.js}` : ""}" defer></script>
</body>
</html>`;
}
