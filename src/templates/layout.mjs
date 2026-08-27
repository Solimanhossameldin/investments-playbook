import { esc, copy, fmt, pct, dir, glyph, gst, clampDescription, COUNTRIES, DIAL, INTENTS } from "../lib.mjs";
import { primaryCta } from "./contact.mjs";

export function head({ site, title, description, path, jsonld = [], ogType = "website", noindex = false, assets = {} }) {
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
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="/styles.css${assets.css ? `?v=${assets.css}` : ""}">
${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join("\n")}`;
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

export function briefForm(site, id = "brief-form") {
  return `<form class="inline-form" data-ml="brief" id="${id}">
  <label class="sr-only" for="${id}-email" style="position:absolute;left:-9999px">Email address</label>
  <input id="${id}-email" name="email" type="email" required placeholder="your@email.com" autocomplete="email">
  <button class="btn btn--solid" type="submit">Continue</button>
</form>`;
}

export function leadForm(site) {
  return `<form class="lead-form" data-ml="lead" id="lead-form">
  <div class="field"><label for="lf-name">Full name</label><input id="lf-name" name="name" type="text" required autocomplete="name"></div>
  <div class="field"><label for="lf-email">Email</label><input id="lf-email" name="email" type="email" required autocomplete="email"></div>
  <div class="field field--row">
    <div><label for="lf-dial">Dial code</label><select id="lf-dial" name="dial">${DIAL.map(
      ([d, c], i) => `<option value="${d}"${i === 0 ? " selected" : ""}>${d} ${c}</option>`
    ).join("")}</select></div>
    <div><label for="lf-phone">Phone</label><input id="lf-phone" name="phone" type="tel" required autocomplete="tel"></div>
  </div>
  <div class="field"><label for="lf-country">Country</label>
    <input id="lf-country" name="country" list="country-list" required autocomplete="country-name" placeholder="Start typing">
    <datalist id="country-list">${COUNTRIES.map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
  </div>
  <div class="field"><label for="lf-intent">What are you trying to do?</label>
    <select id="lf-intent" name="intent" required>
      <option value="" selected disabled>Choose one</option>
      ${INTENTS.map((i) => `<option value="${esc(i)}">${esc(i)}</option>`).join("")}
    </select>
  </div>
  <label class="check"><input type="checkbox" required> I agree to receive the Playbook and the daily brief by email. I can unsubscribe in one click.</label>
  <label class="check"><input type="checkbox" required> I have read the <a href="/privacy/">privacy policy</a> and the <a href="/disclosure/">disclosure standards</a>.</label>
  <button class="btn btn--solid" type="submit" style="width:100%;margin-top:8px">Send me the Playbook</button>
  <p class="form-note">Nothing here is personal advice. The Playbook is educational research.</p>
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

export function authorBand(site) {
  const a = site.author;
  return `<section class="band band--tight"><div class="wrap">
  <div class="author">
    <div class="author__img" aria-hidden="true">${esc(a.initials)}</div>
    <div>
      <p class="eyebrow">Who writes this</p>
      <h3>${esc(a.name)}</h3>
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
    <div><h4>The Brief</h4><ul>
      <li><a href="/brief/">Latest issue</a></li>
      <li><a href="/brief/">Archive</a></li>
      <li><a href="/#playbook">Subscribe</a></li>
    </ul></div>
    <div><h4>Playbooks</h4><ul>
      <li><a href="/start/">Where to start</a></li>
      <li><a href="/playbooks/">All frameworks</a></li>
      <li><a href="/playbooks/net-rental-yield/">Net rental yield</a></li>
      <li><a href="/playbooks/off-plan-irr/">Off-plan IRR</a></li>
      <li><a href="/playbooks/fund-domicile/">Fund domicile</a></li>
    </ul></div>
    <div><h4>Calculators</h4><ul>
      <li><a href="/calculators/">All calculators</a></li>
      <li><a href="/calculators/net-rental-yield/">Net rental yield</a></li>
      <li><a href="/calculators/rent-vs-buy/">Rent versus buy</a></li>
      <li><a href="/calculators/safe-withdrawal-rate/">Withdrawal rate</a></li>
    </ul></div>
    <div><h4>Company</h4><ul>
      <li><a href="/about/">About</a></li>
      <li><a href="/contact/">Contact</a></li>
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

export function page({ site, market, title, description, path, body, jsonld, ogType, noindex, assets = {} }) {
  return `<!doctype html>
<html lang="en">
<head>
${head({ site, title, description, path, jsonld, ogType, noindex, assets })}
</head>
<body>
${header(site, path)}
${ticker(market)}
<main>
${body}
</main>
${footer(site)}
<script src="/app.js${assets.js ? `?v=${assets.js}` : ""}" defer></script>
</body>
</html>`;
}
