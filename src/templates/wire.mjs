import { esc, gst, pageTitle } from "../lib.mjs";

const CATS = {
  rates: "Rates and policy",
  macro: "Economic data",
  markets: "Markets and regulation",
  gulf: "Gulf",
};

/* Official broadcasts. Links, not embeds: an embed would load a third party
   player and its cookies onto every visitor, and these pages carry the
   institution's own stream anyway. */
const WATCH = [
  { name: "FOMC press conference", org: "Federal Reserve",
    url: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
    note: "Live at the close of each policy meeting, plus the statement and projections." },
  { name: "Governing Council press conference", org: "European Central Bank",
    url: "https://www.ecb.europa.eu/press/press_conference/html/index.en.html",
    note: "Streamed after each rate decision." },
  { name: "Monetary Policy Report press conference", org: "Bank of England",
    url: "https://www.bankofengland.co.uk/news/speeches",
    note: "Streamed on Bank Rate decision days." },
];

const dayKey = (iso) => new Date(iso).toISOString().slice(0, 10);

function dayLabel(key) {
  const d = new Date(`${key}T12:00:00Z`);
  const today = new Date().toISOString().slice(0, 10);
  const yday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (key === today) return "Today";
  if (key === yday) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export function wirePage({ site, wire }) {
  const items = (wire.items || []).filter((i) => i.title && i.url);

  const days = [];
  for (const it of items) {
    const k = dayKey(it.published);
    const last = days[days.length - 1];
    if (last && last.key === k) last.rows.push(it);
    else days.push({ key: k, rows: [it] });
  }

  const cats = [...new Set(items.map((i) => i.category))];

  const chips = `<div class="chips" id="wire-chips">
    <button class="chip" data-cat="all" aria-pressed="true">Everything</button>
    ${cats.map((c) => `<button class="chip" data-cat="${esc(c)}" aria-pressed="false">${esc(CATS[c] || c)}</button>`).join("")}
  </div>`;

  const feed = days
    .map(
      (d) => `<section class="wireday" data-day>
  <h2 class="wireday__h">${esc(dayLabel(d.key))}</h2>
  <ol class="wirelist">
    ${d.rows
      .map(
        (it) => `<li class="wi" data-cat="${esc(it.category)}">
      <span class="wi__t">${esc(gst(it.published))}</span>
      <span class="wi__s">${esc(it.source)}</span>
      <a class="wi__h" href="${esc(it.url)}" rel="noopener nofollow" target="_blank">${esc(it.title)}</a>
    </li>`
      )
      .join("")}
  </ol>
</section>`
    )
    .join("");

  const watch = `<section style="margin-top:64px">
  <h2 style="font-size:1.8rem;margin-bottom:6px">Watch it live</h2>
  <p style="font-size:13.5px;color:var(--muted);margin:0 0 18px;max-width:var(--prose)">The institutions stream their own press conferences. These are their pages, not a copy of them.</p>
  <div class="grid grid--3">
    ${WATCH.map(
      (w) => `<a class="card" href="${esc(w.url)}" rel="noopener nofollow" target="_blank">
      <span class="card__k">${esc(w.org)}</span>
      <span class="card__t">${esc(w.name)}</span>
      <p class="card__d">${esc(w.note)}</p>
      <span class="card__f">Open the source</span>
    </a>`
    ).join("")}
  </div>
</section>`;

  const body = `<section class="band"><div class="wrap">
  <div class="section-head" style="margin-bottom:26px">
    <p class="eyebrow">Primary sources, as they publish</p>
    <h1>The Wire</h1>
    <p>Central banks, statistical agencies and regulators, in the order they released it. Every headline is the one the institution wrote, and every link goes to the institution. Nothing here is republished, summarised or rewritten.</p>
  </div>

  <p class="wire-meta"><span class="livedot"></span> Checked ${esc(gst(wire.fetchedAt))} GST, ${
    wire.sourcesOk || 0
  } of ${wire.sourcesTotal || 0} feeds answering. Refreshes through the day. <a href="/data/">Pipeline status</a></p>

  ${chips}
  ${feed || '<p style="color:var(--muted)">The first pull runs shortly.</p>'}
  <p id="wire-empty" hidden style="color:var(--muted);padding:26px 0">Nothing in that category yet.</p>

  ${watch}

  <div class="callout" style="margin-top:64px;max-width:var(--prose)">
    <b>Why there are no newspapers here</b>
    Wire services and newspapers licence their headlines and their photographs, and a site that reposts them is one of ten thousand doing the same thing. This page carries the release itself, which is public, free to redistribute, and roughly a news cycle ahead of the coverage written about it.
  </div>

  <p style="font-size:12px;color:var(--muted);margin-top:34px;max-width:var(--prose)">${esc(site.disclaimer)}</p>
</div></section>`;

  return {
    title: pageTitle("The Wire. Central banks, as they publish", site.name),
    description:
      "Releases from the Federal Reserve, the ECB, the Bank of England, the BLS, the SEC and Gulf authorities, in the order they were published, each linking to the source.",
    path: "/wire/",
    body,
  };
}

/* the compact strip used on the home page */
export function wireStrip({ wire, limit = 6 }) {
  const items = (wire.items || []).slice(0, limit);
  if (!items.length) return "";
  return `<div class="wirestrip">
  ${items
    .map(
      (it) => `<a class="ws" href="${esc(it.url)}" rel="noopener nofollow" target="_blank">
    <span class="ws__s">${esc(it.source)}</span>
    <span class="ws__h">${esc(it.title)}</span>
    <span class="ws__t">${esc(gst(it.published))} GST</span>
  </a>`
    )
    .join("")}
</div>`;
}
