import { esc, copy, md } from "../lib.mjs";

const CATS = {
  portfolio: "Portfolio construction",
  property: "Property arithmetic",
  risk: "Risk",
  valuation: "Valuation",
  "cross-asset": "Cross-asset",
  behavioural: "Behaviour",
  tax: "Tax and structure",
};

const ORDER = ["property", "portfolio", "risk", "tax", "behavioural", "valuation", "cross-asset"];

export function playbookDoc({ site, playbooks, calculators }) {
  const grouped = ORDER.map((cat) => ({
    cat,
    label: CATS[cat],
    items: playbooks.filter((p) => p.category === cat).sort((a, b) => a.tier - b.tier),
  })).filter((g) => g.items.length);

  let n = 0;
  const numbered = new Map();
  for (const g of grouped) for (const p of g.items) numbered.set(p.slug, ++n);

  const contents = grouped
    .map(
      (g) => `<li><span class="doc-toc__cat">${esc(g.label)}</span><ol>${g.items
        .map((p) => `<li><a href="#${esc(p.slug)}"><span class="doc-toc__n">${numbered.get(p.slug)}</span> ${esc(copy(p.title))}</a></li>`)
        .join("")}</ol></li>`
    )
    .join("");

  const chapters = grouped
    .map(
      (g) => `<section class="doc-part">
  <h2 class="doc-part__h">${esc(g.label)}</h2>
  ${g.items
    .map(
      (p) => `<article class="doc-ch" id="${esc(p.slug)}">
    <p class="doc-ch__n">Framework ${numbered.get(p.slug)}</p>
    <h3>${esc(copy(p.title))}</h3>
    <div class="definition">${esc(copy(p.summary))}</div>
    <div class="article">${md(p.body)}</div>
    ${p.formula ? `<h4>The arithmetic</h4><div class="formula">${esc(copy(p.formula))}</div>` : ""}
    ${
      (p.failureModes || []).length
        ? `<h4>Where it breaks</h4><ul class="breaks">${p.failureModes.map((f) => `<li>${esc(copy(f))}</li>`).join("")}</ul>`
        : ""
    }
    ${p.whenToUse ? `<h4>When to use it</h4><p>${esc(copy(p.whenToUse))}</p>` : ""}
    ${
      p.calculator
        ? `<p class="doc-ch__calc">Run it on your own numbers: <a href="${site.origin}/calculators/${esc(p.calculator)}/">${site.origin}/calculators/${esc(p.calculator)}/</a></p>`
        : ""
    }
    ${
      (p.sources || []).length
        ? `<h4>Sources</h4><ol class="srcs">${p.sources.map((s) => `<li><a href="${esc(s.url)}">${esc(s.name)}</a></li>`).join("")}</ol>`
        : ""
    }
  </article>`
    )
    .join("")}
</section>`
    )
    .join("");

  const body = `<article class="pbdoc">

<header class="doc-cover">
  <p class="doc-cover__eyebrow">Global markets and property</p>
  <h1>The Investments<br>Playbook</h1>
  <p class="doc-cover__ed">2026 edition</p>
  <p class="doc-cover__by">${esc(site.author.name)}<br><span>${esc(site.author.role)}</span></p>
  <p class="doc-cover__meta">${playbooks.length} frameworks. ${calculators.length} calculators. ${esc(site.domain)}</p>
</header>

<section class="doc-intro">
  <h2>How to use this</h2>
  <p>Every framework here follows the same four beats: the rule, the arithmetic, where it breaks, and when to use it. The third of those is the one most publications leave out, and it is the reason a good framework applied to the wrong situation loses money.</p>
  <p>Read it in any order. The property section is the densest because that is where the gap between the advertised number and the real number is widest. The tax and structure section is the shortest and, for a globally mobile investor, probably the most valuable per page.</p>
  <p>Nothing in this document is personal advice. It is arithmetic and method. Your circumstances, your tax position and your nerve are inputs only you have.</p>
</section>

<nav class="doc-toc">
  <h2>Contents</h2>
  <ol>${contents}</ol>
</nav>

<section class="doc-matrix">
  <h2>The Playbook Matrix</h2>
  <p>The two axes that decide almost everything are not risk and return. They are what an asset pays you while you hold it, and how quickly you can stop holding it.</p>
  <table class="tbl">
    <thead><tr><th></th><th>Liquid</th><th>Illiquid</th></tr></thead>
    <tbody>
      <tr><th>Growth</th><td>Global equity index funds, quality compounders, growth ETFs</td><td>Off-plan property, private equity, land, founder equity</td></tr>
      <tr><th>Income</th><td>Treasury bills, investment grade bonds, listed REITs, dividend equity</td><td>Ready rental property, direct lending, private credit</td></tr>
    </tbody>
  </table>
  <p>Name the box each of your holdings sits in, then count how many share one. That count is your real concentration, and it is usually higher than you expect.</p>
</section>

${chapters}

<section class="doc-part">
  <h2 class="doc-part__h">The calculators</h2>
  <p>Each of these runs entirely in your browser. Nothing you type is sent anywhere or stored.</p>
  <table class="tbl">
    <thead><tr><th>Calculator</th><th>What it answers</th></tr></thead>
    <tbody>${calculators
      .map((c) => `<tr><td><a href="${site.origin}/calculators/${esc(c.slug)}/">${esc(c.name)}</a></td><td>${esc(copy(c.blurb))}</td></tr>`)
      .join("")}</tbody>
  </table>
</section>

<section class="doc-part">
  <h2 class="doc-part__h">Disclosure</h2>
  <p><strong>Commercial relationships.</strong> The author works in Dubai real estate brokerage, as Head of Sales and Marketing at OneLink Properties. Weigh the property sections with that in mind. No developer, brokerage or fund pays for coverage in this document or on the site.</p>
  <p><strong>Sourcing.</strong> Every figure carries a named source. Primary sources are used where a figure is officially published. Full standards at ${site.origin}/disclosure/</p>
  <p><strong>Risk.</strong> ${esc(site.disclaimer)}</p>
</section>

<footer class="doc-end">
  <p>The daily brief publishes every weekday at 7am Gulf time.<br><a href="${site.origin}/">${esc(site.domain)}</a></p>
</footer>

</article>`;

  return {
    title: `The Investments Playbook, 2026 edition`,
    description: `The complete framework library in one document. ${playbooks.length} frameworks across property, portfolio construction, risk, tax and behaviour.`,
    path: "/playbook/",
    noindex: true,
    body: `<section class="band band--paper">${body}</section>`,
  };
}
