import { esc, copy, md, fmt, pct, dir, glyph, gst, briefLabel, longDate, monthKey } from "../lib.mjs";
import { leadBand, authorBand, briefForm } from "./layout.mjs";

const CATS = {
  portfolio: "Portfolio",
  property: "Property",
  risk: "Risk",
  valuation: "Valuation",
  "cross-asset": "Cross-asset",
  behavioural: "Behavioural",
  tax: "Tax",
};

/* ============================ HOME ============================ */

function beat(label, text) {
  return `<div class="beat"><div class="beat__l">${label}</div><p>${esc(copy(text))}</p></div>`;
}

function itemHtml(it, n) {
  return `<article class="item">
  <h3>${n}. ${esc(copy(it.heading))}</h3>
  ${beat("What happened", it.what_happened)}
  ${beat("What it means", it.what_it_means)}
  ${beat("What it means for your portfolio", it.what_it_means_for_you)}
  ${
    (it.sources || []).length
      ? `<p class="item__src">Sources: ${it.sources
          .map((s) => `<a href="${esc(s.url)}" rel="noopener nofollow">${esc(s.name)}</a>`)
          .join(", ")}</p>`
      : ""
  }
</article>`;
}

export function home({ site, market, brief, playbooks, calculators }) {
  const cards = playbooks.slice(0, 9);
  const briefBlock = brief
    ? `<div class="brief-head">
      <span class="brief-date">${esc(briefLabel(brief.date))}</span>
      <span aria-hidden="true" style="font-size:20px">${esc(brief.emoji || "")}</span>
      <span class="badge badge--gold">${brief.readMinutes || 3} min read</span>
    </div>
    <h2 class="brief-title">${esc(copy(brief.title))}</h2>
    <p class="brief-sub">${esc(copy(brief.subtitle))}</p>
    <p class="byline">By ${esc(brief.author || site.author.name)}</p>
    ${brief.items[0] ? itemHtml(brief.items[0], 1) : ""}
    ${
      brief.items[1]
        ? `<div class="gate" id="gate">
      <div class="item" style="margin-bottom:0">
        <h3>2. ${esc(copy(brief.items[1].heading))}</h3>
        <div class="gate__fade" data-gate-fade>${beat("What happened", brief.items[1].what_happened)}</div>
        <div data-gate-rest hidden>
          ${beat("What it means", brief.items[1].what_it_means)}
          ${beat("What it means for your portfolio", brief.items[1].what_it_means_for_you)}
        </div>
      </div>
      <div class="gate__box" data-gate-box>
        <h4>Keep reading, free</h4>
        <p>The full brief in your inbox every weekday morning at 7am GST. No spam, unsubscribe in one click.</p>
        ${briefForm(site)}
      </div>
    </div>`
        : ""
    }
    <p style="margin-top:34px"><a class="btn btn--ghost btn--sm" href="/brief/${esc(brief.slug)}/">Read the full issue</a> <a class="btn btn--ghost btn--sm" href="/brief/">Archive</a></p>`
    : `<h2 class="brief-title">The first brief publishes tomorrow morning</h2>
       <p class="brief-sub">The daily pipeline is live. Subscribe and the first issue lands at 7am GST.</p>
       <div class="gate__box" style="max-width:520px;margin-top:24px"><h4>Get the brief</h4><p>Every weekday morning at 7am GST.</p>${briefForm(site)}</div>`;

  // The typographic hero fills its second column with real figures rather than
  // decoration. Four rows, each carrying its own source, straight off the same
  // market.json the data page publishes.
  const boxOrder = ["us-10y", "us-30y-mortgage", "us-10y-real", "xau"];
  const boxRows = boxOrder
    .map((sym) => (market.quotes || []).find((q) => q.symbol === sym))
    .filter(Boolean);
  const heroBox =
    site.heroGlobe === false && boxRows.length
      ? `<aside class="hero__box rise" aria-label="Selected market figures">
    <p class="hero__box-h">Today's figures</p>
    ${boxRows
      .map(
        (q) => `<div class="hbx" data-sym="${esc(q.symbol)}">
      <span class="hbx__l">${esc(q.label)}</span>
      <span class="hbx__v" data-live-v>${q.unit === "%" ? fmt(q.value, 2) + "%" : fmt(q.value, q.value < 10 ? 4 : 2)}</span>
      <span class="hbx__c ${q.changePct === null || q.changePct === undefined ? "flat" : dir(q.changePct)}" data-live-c>${
        q.changePct === null || q.changePct === undefined ? "n/a" : glyph(q.changePct) + " " + pct(q.changePct)
      }</span>
    </div>`
      )
      .join("")}
    <p class="hero__box-f">Every figure named and timestamped on the <a href="/data/">data page</a>.</p>
  </aside>`
      : "";

  const body = `
<section class="band band--ink hero${site.heroGlobe === false ? " hero--plain" : ""}"><div class="wrap">
  <div class="hero__cols">
  <div>
  <p class="eyebrow rise">Global markets and property</p>
  <h1 class="rise">${esc(site.tagline)}</h1>
  <p class="hero__sub rise">${esc(copy(site.description))} Read it in three minutes. Free.</p>
  <div class="btn-row rise">
    <a class="btn btn--solid" href="#today">Read today's brief</a>
    <a class="btn btn--ghost" href="#playbook">Get the Playbook</a>
  </div>
  </div>
  ${heroBox}
  </div>
  <div class="stats rise">
    <div class="stat"><div class="stat__v" data-count="3" data-suffix=" min">3 min</div><div class="stat__c">To read the daily brief</div></div>
    <div class="stat"><div class="stat__v" data-count="${playbooks.length}">${playbooks.length}</div><div class="stat__c">Frameworks in the library</div></div>
    <div class="stat"><div class="stat__v" data-count="${calculators.length}">${calculators.length}</div><div class="stat__c">Working calculators</div></div>
    <div class="stat"><div class="stat__v">Daily</div><div class="stat__c">Data and brief refresh</div></div>
  </div>
</div></section>

<section class="band" id="today"><div class="wrap">
  <p class="eyebrow rise">Today's brief</p>
  <div class="rise">${briefBlock}</div>
</div></section>

<section class="band band--ink"><div class="wrap">
  <div class="section-head rise">
    <p class="eyebrow">The signature framework</p>
    <h2>The Playbook Matrix</h2>
    <p>Every asset you own sits in one of four boxes. Most portfolios are accidentally crowded into one of them and the owner has never checked which.</p>
  </div>
  <div class="rise">
  <div class="matrix-wrap">
    <div class="matrix-y"><span>Growth</span><span>Income</span></div>
    <div class="matrix">
      <div class="q">
        <div class="q__k">Growth, liquid</div>
        <div class="q__t">Sell it on a Tuesday</div>
        <ul><li>Global equity index funds</li><li>Quality compounders</li><li>Growth ETFs</li><li>Broad emerging markets</li></ul>
        <div class="q__split">Typical split: 10% income, 90% growth</div>
      </div>
      <div class="q">
        <div class="q__k">Growth, illiquid</div>
        <div class="q__t">Locked in for years</div>
        <ul><li>Off-plan property</li><li>Private equity</li><li>Land</li><li>Founder equity</li></ul>
        <div class="q__split">Typical split: 0% income, 100% growth</div>
      </div>
      <div class="q">
        <div class="q__k">Income, liquid</div>
        <div class="q__t">Pays you and lets you leave</div>
        <ul><li>Treasury bills</li><li>Investment grade bonds</li><li>Listed REITs</li><li>Dividend equity</li></ul>
        <div class="q__split">Typical split: 80% income, 20% growth</div>
      </div>
      <div class="q">
        <div class="q__k">Income, illiquid</div>
        <div class="q__t">Pays you and holds you</div>
        <ul><li>Ready rental property</li><li>Direct lending</li><li>Private credit</li><li>Ground rents</li></ul>
        <div class="q__split">Typical split: 70% income, 30% growth</div>
      </div>
    </div>
  </div>
  <div class="matrix-x"><span>Liquid</span><span>Illiquid</span></div>
  <p style="color:#a8a8a8;max-width:64ch;margin-top:30px;font-size:14.5px">The two axes that decide almost everything are not risk and return. They are what an asset pays you while you hold it, and how quickly you can stop holding it. Get both boxes filled and most portfolio arguments dissolve.</p>
  <div class="btn-row" style="margin-top:22px"><a class="btn btn--ghost" href="/playbooks/">See where your portfolio sits</a></div>
  </div>
</div></section>

<section class="band"><div class="wrap">
  <div class="section-head rise">
    <p class="eyebrow">Tools</p>
    <h2>Run your own numbers</h2>
    <p>Every framework on this site ends in a number. These produce yours. Free, no sign up, nothing stored.</p>
  </div>
  <div class="grid grid--3 rise">
    ${calculators
      .map(
        (c) => `<a class="card" href="/calculators/${esc(c.slug)}/">
      <div class="card__k">${esc(c.category)}</div>
      <div class="card__t">${esc(c.name)}</div>
      <p class="card__d">${esc(copy(c.blurb))}</p>
      <div class="card__f">Open calculator</div>
    </a>`
      )
      .join("")}
  </div>
</div></section>

<section class="band band--paper"><div class="wrap">
  <div class="section-head rise">
    <p class="eyebrow">The library</p>
    <h2>Frameworks, not opinions</h2>
    <p>Each page gives you the rule, the arithmetic, and the honest list of where it breaks. If a framework has a known failure mode, it is on the page.</p>
  </div>
  <div class="chips rise" id="pb-chips">
    <button class="chip" aria-pressed="true" data-cat="all">All</button>
    ${[...new Set(playbooks.map((p) => p.category))]
      .map((c) => `<button class="chip" aria-pressed="false" data-cat="${esc(c)}">${esc(CATS[c] || c)}</button>`)
      .join("")}
  </div>
  <div class="grid grid--3 rise" id="pb-grid">
    ${cards
      .map(
        (p) => `<a class="card" href="/playbooks/${esc(p.slug)}/" data-cat="${esc(p.category)}">
      <div class="card__k">${esc(CATS[p.category] || p.category)}</div>
      <div class="card__t">${esc(copy(p.title))}</div>
      <p class="card__d">${esc(copy(p.summary))}</p>
      <div class="card__f">${p.calculator ? "Includes a calculator" : "Read the framework"}</div>
    </a>`
      )
      .join("")}
  </div>
  <div class="btn-row" style="margin-top:30px"><a class="btn btn--ghost" href="/playbooks/">Browse the full library</a></div>
</div></section>

${leadBand(site, { frameworks: playbooks.length, calculators: calculators.length })}
${authorBand(site)}`;

  return {
    title: `${site.name}. Global markets and property, daily.`,
    description: site.description,
    path: "/",
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site.name,
        url: site.origin,
        description: copy(site.description),
      },
      {
        "@context": "https://schema.org",
        "@type": "Person",
        name: site.author.name,
        jobTitle: site.author.role,
        url: site.origin + "/about/",
        sameAs: [site.author.linkedin, site.author.site],
      },
    ],
  };
}

/* ============================ BRIEF ============================ */

export function briefIndex({ site, briefs }) {
  let lastMonth = "";
  const rows = briefs
    .map((b) => {
      const m = monthKey(b.date);
      const div = m !== lastMonth ? `<div class="month">${esc(m)}</div>` : "";
      lastMonth = m;
      return `${div}<a href="/brief/${esc(b.slug)}/">
      <span class="arch__d">${esc(briefLabel(b.date))}</span>
      <span><span class="arch__t">${esc(b.emoji || "")} ${esc(copy(b.title))}</span><span class="arch__s">${esc(copy(b.subtitle))}</span></span>
      <span class="badge">${b.readMinutes || 3} min</span>
    </a>`;
    })
    .join("");

  const body = `<section class="band"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Published every weekday, 7am GST</p>
    <h2>The Brief</h2>
    <p>Three items. Global markets, property, and one number worth knowing. Written from the figures on the market data page, every one of which carries its own source.</p>
  </div>
  <div class="gate__box" style="max-width:560px;margin-bottom:44px"><h4>Get it in your inbox</h4><p>Free. Unsubscribe in one click.</p>${briefForm(site, "arch-form")}</div>
  <div class="arch">${rows || '<p style="padding:26px 0;color:var(--muted)">The first issue publishes tomorrow morning.</p>'}</div>
</div></section>`;

  return { title: `The Brief. Daily markets and property. ${site.name}`, description: "A three minute brief on global markets and property, published every weekday morning at 7am GST.", path: "/brief/", body };
}

export function briefPage({ site, brief, prev, next }) {
  const numbers = (brief.numbers || []).length
    ? `<div class="table-scroll" style="margin:34px 0 10px;max-width:var(--prose)"><table class="tbl"><caption>The numbers</caption>
    <thead><tr><th>Measure</th><th class="n">Level</th><th>Context</th></tr></thead>
    <tbody>${brief.numbers
      .map((n) => `<tr><td>${esc(copy(n.label))}</td><td class="n">${esc(n.value)}</td><td class="note">${esc(copy(n.note))}</td></tr>`)
      .join("")}</tbody></table></div>`
    : "";

  const cal = (brief.calendar || []).length
    ? `<div class="table-scroll" style="margin-top:44px;max-width:var(--prose)"><table class="tbl"><caption>The week ahead</caption>
    <tbody>${brief.calendar.map((c) => `<tr><td style="width:120px">${esc(c.day)}</td><td>${esc(copy(c.event))}</td></tr>`).join("")}</tbody></table></div>`
    : "";

  // A correction is published on the issue it corrects, not only in the next one.
  const correction = brief.correction
    ? `<div style="max-width:var(--prose);margin:26px 0 0;padding:14px 18px;border-left:3px solid var(--gold-muted);background:rgba(201,169,97,.07)"><p style="margin:0;font-size:13px;line-height:1.65"><strong>Correction.</strong> ${esc(copy(brief.correction))}</p></div>`
    : "";

  const body = `<section class="band"><div class="wrap">
  <div class="brief-head">
    <span class="brief-date">${esc(briefLabel(brief.date))}</span>
    <span aria-hidden="true" style="font-size:22px">${esc(brief.emoji || "")}</span>
    <span class="badge badge--gold">${brief.readMinutes || 3} min read</span>
  </div>
  <h1 class="brief-title" style="font-size:clamp(2.2rem,5vw,3.4rem)">${esc(copy(brief.title))}</h1>
  <p class="brief-sub">${esc(copy(brief.subtitle))}</p>
  <p class="byline">By ${esc(brief.author || site.author.name)}. ${esc(longDate(brief.date))}.</p>
  ${correction}
  ${numbers}
  <p style="font-size:12px;color:var(--muted);max-width:var(--prose)">Every figure above is drawn from the live table on the <a href="/data/" style="color:var(--gold-muted)">market data page</a>, where each row names its own source and timestamp.</p>
  ${brief.items.map((it, i) => itemHtml(it, i + 1)).join("")}
  ${cal}
  <div class="gate__box" style="max-width:560px;margin-top:44px"><h4>Get tomorrow's brief</h4><p>Free, every weekday at 7am GST.</p>${briefForm(site, "post-form")}</div>
  <nav style="display:flex;justify-content:space-between;gap:20px;margin-top:44px;border-top:1px solid var(--hair-light);padding-top:22px;font-size:13px">
    <span>${prev ? `<a href="/brief/${esc(prev.slug)}/" style="color:var(--gold-muted)">Previous: ${esc(briefLabel(prev.date))}</a>` : ""}</span>
    <span>${next ? `<a href="/brief/${esc(next.slug)}/" style="color:var(--gold-muted)">Next: ${esc(briefLabel(next.date))}</a>` : ""}</span>
  </nav>
  <p style="font-size:12px;color:var(--muted);margin-top:34px;max-width:var(--prose)">${esc(site.disclaimer)}</p>
</div></section>`;

  return {
    title: `${briefLabel(brief.date)} ${copy(brief.title)}. ${site.name}`,
    description: copy(brief.subtitle),
    path: `/brief/${brief.slug}/`,
    ogType: "article",
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: copy(brief.title),
        description: copy(brief.subtitle),
        datePublished: brief.publishedAt || brief.date,
        dateModified: brief.publishedAt || brief.date,
        author: { "@type": "Person", name: brief.author || site.author.name },
        publisher: { "@type": "Organization", name: site.name },
        mainEntityOfPage: `${site.origin}/brief/${brief.slug}/`,
      },
    ],
  };
}

/* ============================ PLAYBOOKS ============================ */

export function playbookIndex({ site, playbooks }) {
  const body = `<section class="band"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">The library</p>
    <h2>Playbooks</h2>
    <p>One framework per page. The rule, the arithmetic, and where it breaks. Nothing here is a recommendation, all of it is a method.</p>
  </div>
  <div class="field" style="max-width:420px"><label for="pb-search">Search the library</label><input id="pb-search" type="text" placeholder="net yield, withdrawal rate, domicile"></div>
  <div class="chips" id="pb-chips">
    <button class="chip" aria-pressed="true" data-cat="all">All</button>
    ${Object.entries(CATS)
      .filter(([k]) => playbooks.some((p) => p.category === k))
      .map(([k, v]) => `<button class="chip" aria-pressed="false" data-cat="${esc(k)}">${esc(v)}</button>`)
      .join("")}
  </div>
  <div class="grid grid--3" id="pb-grid">
    ${playbooks
      .map(
        (p) => `<a class="card" href="/playbooks/${esc(p.slug)}/" data-cat="${esc(p.category)}" data-text="${esc((p.title + " " + p.summary).toLowerCase())}">
      <div class="card__k">${esc(CATS[p.category] || p.category)}</div>
      <div class="card__t">${esc(copy(p.title))}</div>
      <p class="card__d">${esc(copy(p.summary))}</p>
      <div class="card__f">${p.calculator ? "Includes a calculator" : "Read the framework"}</div>
    </a>`
      )
      .join("")}
  </div>
  <p id="pb-empty" hidden style="padding:30px 0;color:var(--muted)">Nothing matches that. Try a shorter word.</p>
</div></section>`;
  return { title: `Playbooks. Investing frameworks with the arithmetic. ${site.name}`, description: "A library of investing frameworks for markets and property. Each page gives the rule, the arithmetic, and where it breaks.", path: "/playbooks/", body };
}

export function playbookPage({ site, pb, calcName, related = [] }) {
  const jump = [
    ["the-rule", "The rule"],
    pb.formula ? ["the-arithmetic", "The arithmetic"] : null,
    (pb.failureModes || []).length ? ["where-it-breaks", "Where it breaks"] : null,
    pb.whenToUse ? ["when-to-use-it", "When to use it"] : null,
    (pb.sources || []).length ? ["sources", "Sources"] : null,
  ].filter(Boolean);

  const rail = `<aside class="rail">
  <h5>On this page</h5>
  <ol>${jump.map(([id, label]) => `<li><a href="#${id}">${esc(label)}</a></li>`).join("")}</ol>
  ${
    pb.calculator
      ? `<div class="rail__box" style="margin-bottom:22px"><h5>Run the numbers</h5><p>The ${esc(calcName || "calculator")} does this arithmetic on your own figures.</p><a class="btn btn--ghost btn--sm" href="/calculators/${esc(pb.calculator)}/">Open it</a></div>`
      : ""
  }
  ${
    related.length
      ? `<h5>Related frameworks</h5><ol>${related.map((r) => `<li><a href="/playbooks/${esc(r.slug)}/">${esc(copy(r.title))}</a></li>`).join("")}</ol>`
      : ""
  }
  <div class="rail__box"><h5>The daily brief</h5><p>Three minutes on global markets and property, every weekday at 7am GST.</p><a class="btn btn--ghost btn--sm" href="/#playbook">Subscribe free</a></div>
</aside>`;

  const body = `<section class="band"><div class="wrap">
  <p class="eyebrow"><a href="/playbooks/" style="color:inherit;text-decoration:none">Playbooks</a> / ${esc(CATS[pb.category] || pb.category)}</p>
  <h1 style="font-size:clamp(2.2rem,5vw,3.4rem);max-width:18ch">${esc(copy(pb.title))}</h1>
  <div class="doc" style="margin-top:34px">
  <div class="article">
    <div class="definition">${esc(copy(pb.summary))}</div>
    <h2 id="the-rule">The rule</h2>
    ${md(pb.body)}
    ${pb.formula ? `<h2 id="the-arithmetic">The arithmetic</h2><div class="formula">${esc(copy(pb.formula))}</div>` : ""}
    ${
      (pb.failureModes || []).length
        ? `<h2 id="where-it-breaks">Where it breaks</h2><ul class="breaks">${pb.failureModes.map((f) => `<li>${esc(copy(f))}</li>`).join("")}</ul>`
        : ""
    }
    ${pb.whenToUse ? `<h2 id="when-to-use-it">When to use it</h2><p>${esc(copy(pb.whenToUse))}</p>` : ""}
    ${
      pb.calculator
        ? `<div class="callout"><b>Run it on your own numbers</b><p style="margin:0 0 14px">The ${esc(calcName || "calculator")} does this arithmetic for you, in your currency, in about thirty seconds.</p><a class="btn btn--solid btn--sm" href="/calculators/${esc(pb.calculator)}/">Open the calculator</a></div>`
        : ""
    }
    ${
      (pb.sources || []).length
        ? `<h2 id="sources">Sources</h2><ol class="srcs">${pb.sources
            .map((s) => `<li><a href="${esc(s.url)}" rel="noopener nofollow">${esc(s.name)}</a></li>`)
            .join("")}</ol>`
        : ""
    }
    <p class="reviewed">Last reviewed ${esc(pb.reviewed)}. ${
      pb.category === "property"
        ? "Commercial relationship disclosure: the author works in Dubai real estate brokerage. See the disclosure standards."
        : "Educational research, not personal advice."
    } <a href="/disclosure/" style="color:var(--gold-muted)">Disclosure standards</a>.</p>
  </div>
  ${rail}
  </div>
</div></section>`;

  const faqs = (pb.failureModes || []).slice(0, 3).map((f, i) => ({
    "@type": "Question",
    name: `${copy(pb.title)}: known limitation ${i + 1}`,
    acceptedAnswer: { "@type": "Answer", text: copy(f) },
  }));

  return {
    title: `${copy(pb.title)}. ${site.name}`,
    description: copy(pb.summary),
    path: `/playbooks/${pb.slug}/`,
    ogType: "article",
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: copy(pb.title),
        description: copy(pb.summary),
        dateModified: pb.reviewed,
        author: { "@type": "Person", name: site.author.name },
        publisher: { "@type": "Organization", name: site.name },
        mainEntityOfPage: `${site.origin}/playbooks/${pb.slug}/`,
      },
      ...(faqs.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs }] : []),
    ],
  };
}

/* ============================ DATA ============================ */

const GROUPS = [
  ["rate", "Rates and inflation", "Treasury yields, the real yield, the market's inflation expectation, the US mortgage rate and CPI."],
  ["commodity", "Commodities", "Spot and reference prices."],
  ["fx", "Currencies", "Rates per one US dollar, plus the Federal Reserve's broad dollar index."],
  ["crypto", "Crypto", "Last traded price on a public exchange."],
  ["property", "Property", "Listed property proxies and published indices."],
];

export function dataPage({ site, market, status }) {
  const tables = GROUPS.map(([key, label, note]) => {
    const rows = (market.quotes || []).filter((q) => q.category === key).sort((a, b) => a.order - b.order);
    if (!rows.length) return "";
    return `<h2 style="font-size:1.8rem;margin:52px 0 6px">${esc(label)}</h2>
    <p style="font-size:13px;color:var(--muted);margin:0 0 16px">${esc(note)}</p>
    <div class="table-scroll"><table class="tbl">
      <thead><tr><th>Measure</th><th class="n">Level</th><th class="n">Change</th><th>As of</th><th>Source</th></tr></thead>
      <tbody>${rows
        .map(
          (q) => `<tr data-sym="${esc(q.symbol)}"${q.stale ? ' style="opacity:.55"' : ""}>
        <td>${esc(q.label)}${q.stale ? ' <span class="badge">last good</span>' : ""}<span class="livedot" data-live-dot hidden title="Refreshing live in your browser"></span></td>
        <td class="n" data-live-v>${q.unit === "%" ? fmt(q.value, 2) + "%" : fmt(q.value, q.value < 10 ? 4 : 2)}</td>
        <td class="n ${dir(q.changePct)}" data-live-c>${q.changePct === null || q.changePct === undefined ? "n/a" : pct(q.changePct)}</td>
        <td class="note" data-live-t>${esc(gst(q.asOf))} GST</td>
        <td><a href="${esc(q.sourceUrl)}" rel="noopener nofollow">${esc(q.source)}</a></td>
      </tr>`
        )
        .join("")}</tbody>
    </table></div>`;
  }).join("");

  const runs = (status.runs || []).slice(0, 6);
  const body = `<section class="band"><div class="wrap">
  <div class="section-head">
    <p class="eyebrow">Refreshed daily, automatically</p>
    <h2>Market data</h2>
    <p>These figures are indicative and may be delayed. Each row names its own source and its own timestamp, because a number without a provenance is not a number, it is a claim.</p>
    <p style="font-size:13.5px">Gold, silver, Bitcoin and Ethereum carry a <span class="livedot" style="position:relative;top:-1px"></span> and refresh in your browser about once a minute, straight from the provider named in the row. Everything else is rebuilt twice a day, because at source it changes daily, weekly or monthly and a faster clock on this page would not make it any newer.</p>
  </div>
  ${tables || '<p style="color:var(--muted)">The first data pull runs tonight.</p>'}

  <h2 style="font-size:1.8rem;margin:64px 0 6px">Automation status</h2>
  <p style="font-size:13px;color:var(--muted);margin:0 0 16px">The daily pipeline publishes its own health here. If a source fails, the previous value is kept and flagged rather than blanked.</p>
  <div class="table-scroll"><table class="tbl">
    <thead><tr><th>Job</th><th>Result</th><th>Detail</th><th>Ran at</th></tr></thead>
    <tbody>${
      runs.length
        ? runs
            .map(
              (r) => `<tr><td>${esc(r.job)}</td><td class="${r.status === "ok" ? "up" : r.status === "failed" ? "dn" : "flat"}">${esc(r.status)}</td><td class="note">${esc(r.detail || "")}</td><td class="note">${esc(gst(r.ranAt))} GST</td></tr>`
            )
            .join("")
        : '<tr><td colspan="4" class="note">No runs recorded yet.</td></tr>'
    }</tbody>
  </table></div>
  <p style="font-size:12px;color:var(--muted);margin-top:34px;max-width:var(--prose)">${esc(site.attribution)} ${esc(site.disclaimer)}</p>
</div></section>`;
  return { title: `Market data. Live figures with named sources. ${site.name}`, description: "Live market figures for equities, rates, commodities, currencies, crypto and property. Every row names its source and its timestamp.", path: "/data/", body };
}

/* ============================ STATIC ============================ */

export function staticPage({ site, title, description, path, eyebrow, heading, bodyMd, extra = "" }) {
  const body = `<section class="band"><div class="wrap">
  <p class="eyebrow">${esc(eyebrow)}</p>
  <h1 style="font-size:clamp(2.2rem,5vw,3.4rem);max-width:20ch">${esc(heading)}</h1>
  <div class="article" style="margin-top:30px">${md(bodyMd)}</div>
  ${extra}
</div></section>`;
  return { title, description, path, body };
}

export function notFound({ site }) {
  const body = `<section class="band band--ink" style="min-height:52vh"><div class="wrap">
  <p class="eyebrow">404</p>
  <h1 style="font-size:clamp(2.4rem,6vw,4rem)">That page is not in the Playbook.</h1>
  <p style="color:#c4c4c4;max-width:48ch;margin-top:20px">The link may be old, or the framework may have moved. The library index is the fastest way back.</p>
  <div class="btn-row" style="margin-top:26px">
    <a class="btn btn--solid" href="/playbooks/">Browse the library</a>
    <a class="btn btn--ghost" href="/">Home</a>
  </div>
</div></section>`;
  return { title: `Not found. ${site.name}`, description: "Page not found.", path: "/404.html", body };
}
