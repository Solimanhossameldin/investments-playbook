import { esc, copy, pageTitle, clampDescription } from "../lib.mjs";
import { briefForm, captureBlock } from "./layout.mjs";

// The path pages route a reader, and route a subscriber. Nothing on them is
// written here: every framework, calculator and term is looked up by slug in
// the arrays the rest of the site is built from, so a page cannot describe a
// framework that no longer exists or quote a summary that has since changed.

const byKey = (arr, k) => new Map(arr.map((x) => [x[k], x]));

// The intent travels to the gated form in the query string, and the form
// reads it back. Encoded once, here, so the two ends cannot disagree.
// The query string has to come before the fragment. Written the other way
// round the browser reads the whole of "?intent=..." as part of the hash
// and location.search is empty, so the form silently stays unset.
export const playbookHref = (p) => `/?intent=${encodeURIComponent(p.intent)}#playbook`;

// A path may offer a document in exchange for an email. Only one does, and the
// block renders only where `magnet` is set, so no page can promise a file that
// was never declared. The download is revealed by the page itself on submit
// rather than posted out later: the reader gets what they were promised even
// on a day the mail automation is not running, which is the only version of
// this that is honest.
function magnetBlock(site, p) {
  const m = p.magnet;
  if (!m || !m.file || !m.title) return "";
  return `<div class="gate__box" id="get" style="max-width:var(--prose);margin-top:56px">
    <h2>${esc(m.title)}</h2>
    <p>${esc(copy(m.blurb || ""))}</p>
    ${briefForm(site, "magnet-form", "Your download is below.", m.file, `start/${p.slug}`, p.intent)}
    <noscript><p style="font-size:13px;margin:14px 0 0">The subscribe form needs JavaScript. <a href="${esc(m.file)}">Download the checklist directly</a> instead.</p></noscript>
    <p style="font-size:12px;color:var(--muted);margin:14px 0 0">Free. Unsubscribe in one click. The frameworks it points at are ungated and always will be.</p>
  </div>`;
}

function steps(p, pbBySlug) {
  const items = p.order.map((s) => pbBySlug.get(s)).filter(Boolean);
  return `<ol class="pth">${items
    .map(
      (pb, i) => `<li class="pth__i">
      <div class="pth__n num">${String(i + 1).padStart(2, "0")}</div>
      <div>
        <a class="pth__t" href="/playbooks/${esc(pb.slug)}/">${esc(pb.title)}</a>
        <p class="pth__d">${esc(copy(pb.summary))}</p>
      </div>
    </li>`
    )
    .join("")}</ol>`;
}

function tools(p, calcBySlug) {
  const items = p.calculators.map((s) => calcBySlug.get(s)).filter(Boolean);
  if (!items.length) return "";
  return `<h2 class="pth__h">Run your own numbers</h2>
  <p class="pth__lead">Nothing is stored and nothing is sent anywhere. The arithmetic runs in your browser.</p>
  <div class="grid grid--3">${items
    .map(
      (c) => `<a class="card" href="/calculators/${esc(c.slug)}/">
      <div class="card__k">${esc(c.category)}</div>
      <div class="card__t">${esc(c.name)}</div>
      <p class="card__d">${esc(copy(c.blurb))}</p>
      <div class="card__f">Open calculator</div>
    </a>`
    )
    .join("")}</div>`;
}

function terms(p, termBySlug) {
  const items = p.terms.map((s) => termBySlug.get(s)).filter(Boolean);
  if (!items.length) return "";
  return `<h2 class="pth__h">Terms you will meet</h2>
  <p class="pth__lead">Each is one sentence, then the trap it hides.</p>
  <div class="pth__terms">${items
    .map(
      (t) => `<a class="pth__term" href="/glossary/${esc(t.slug)}/">${esc(t.term)}</a>`
    )
    .join("")}</div>`;
}

function others(p, paths) {
  const rest = paths.filter((x) => x.slug !== p.slug);
  return `<h2 class="pth__h">Not quite you?</h2>
  <div class="pth__terms">${rest
    .map((x) => `<a class="pth__term" href="/start/${esc(x.slug)}/">${esc(x.label)}</a>`)
    .join("")}</div>`;
}

export function pathIndex({ site, paths, playbooks, calculators }) {
  const body = `<section class="band"><div class="wrap">
  <div class="section-head rise" style="margin-bottom:34px">
    <p class="eyebrow">Where to start</p>
    <h1>${playbooks.length} frameworks is too many to start with.</h1>
    <p>So start with one of these instead. Each is an ordered route through the library built for one situation, using the same frameworks, the same ${calculators.length} calculators and the same glossary as everything else on the site. Pick the one that describes you this year.</p>
  </div>

  <div class="grid grid--3 rise">${paths
    .map(
      (p, i) => `<a class="card" href="/start/${esc(p.slug)}/">
    <div class="card__k num">${String(i + 1).padStart(2, "0")}</div>
    <div class="card__t">${esc(p.title)}</div>
    <p class="card__d">${esc(copy(p.blurb))}</p>
    <div class="card__f">${p.order.length} frameworks</div>
  </a>`
    )
    .join("")}</div>

  <div class="callout" style="margin-top:56px;max-width:var(--prose)">
    <b>None of these is a recommendation</b>
    A path is an order to read in, not advice about what to own. Two people in the same situation should reach different conclusions from the same frameworks, which is the point of publishing the frameworks rather than the conclusions.
  </div>

  <p style="font-size:12px;color:var(--muted);margin-top:34px;max-width:var(--prose)">${esc(site.disclaimer)}</p>

${captureBlock(site, { source: "start-index", heading: "Not sure which route", blurb: "Take the whole library instead: every framework as one document, free. One email address, unsubscribe in one click." })}
</div></section>`;

  return {
    title: pageTitle("Where to start", site.name),
    // Rendered, because adding a seventh path made "six" wrong here and
    // nothing but a person reading it would have caught that.
    description: clampDescription(
      `${paths.length} ordered routes through the framework library, one for each situation: ${paths
        .map((p) => copy(p.label).toLowerCase())
        .join(", ")}.`
    ),
    path: "/start/",
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Where to start",
        itemListElement: paths.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          url: `${site.origin}/start/${p.slug}/`,
        })),
      },
    ],
  };
}

export function pathPage({ site, p, paths, playbooks, calculators, glossary, liveBand = "" }) {
  const pbBySlug = byKey(playbooks, "slug");
  const calcBySlug = byKey(calculators, "slug");
  const termBySlug = byKey(glossary, "slug");
  const items = p.order.map((s) => pbBySlug.get(s)).filter(Boolean);

  const body = `<section class="band"><div class="wrap">
  <div class="section-head rise" style="margin-bottom:34px">
    <p class="eyebrow"><a href="/start/" style="color:inherit;text-decoration:none">Where to start</a></p>
    <h1>${esc(p.title)}</h1>
    <p>${esc(copy(p.lede))}</p>
  </div>

  ${liveBand}

  <div class="rise">
  <h2 class="pth__h">Read these in this order</h2>
  <p class="pth__lead">${items.length} frameworks. Each one ends in a number rather than an opinion.</p>
  ${steps(p, pbBySlug)}

  ${tools(p, calcBySlug)}

  ${terms(p, termBySlug)}

  <div class="callout" style="margin-top:56px;max-width:var(--prose)">
    <b>One thing worth reading twice</b>
    ${esc(copy(p.close))}
  </div>

  ${
    p.magnet
      ? magnetBlock(site, p)
      : captureBlock(site, {
          source: `start/${p.slug}`,
          intent: p.intent,
          heading: `Get all of these as one document`,
          blurb: "Every framework on this path, and the other forty odd, in a single file. Your answer above is carried with it, so what arrives is the part that applies to you.",
          id: `cap-start-${p.slug}`,
        })
  }

  <div class="btn-row" style="margin-top:40px">
    <a class="btn btn--solid" href="${playbookHref(p)}">Get all ${playbooks.length} frameworks as one document</a>
    <a class="btn btn--ghost" href="/playbooks/">Browse the whole library</a>
  </div>

  ${others(p, paths)}
  </div>

  <p style="font-size:12px;color:var(--muted);margin-top:44px;max-width:var(--prose)">${esc(site.disclaimer)}</p>
</div></section>`;

  return {
    title: pageTitle(p.title, site.name),
    description: clampDescription(copy(p.blurb)),
    path: `/start/${p.slug}/`,
    crumb: p.label,
    body,
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: p.title,
        description: copy(p.blurb),
        itemListElement: items.map((pb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: pb.title,
          url: `${site.origin}/playbooks/${pb.slug}/`,
        })),
      },
    ],
  };
}

// The homepage block. Kept here so the six labels live in one place.
export function pathBand({ paths }) {
  return `<section class="band band--tight band--ivory"><div class="wrap">
  <div style="display:flex;align-items:baseline;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:20px">
    <p class="eyebrow" style="margin:0">Where to start</p>
    <a href="/start/" style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-muted);text-decoration:none">All six routes</a>
  </div>
  <div class="pth__terms">${paths
    .map((p) => `<a class="pth__term" href="/start/${esc(p.slug)}/">${esc(p.label)}</a>`)
    .join("")}</div>
</div></section>`;
}
