#!/usr/bin/env node
/* The wire parser, tested against recorded feed payloads. The network is not
   involved: what breaks a feed reader is a shape it has not seen, not a
   provider being down, and a shape can be recorded. */

import { parse, strip, link, when, wireReport } from "./fetch-wire.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, got) => {
  if (cond) { pass++; console.log(`  pass  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${got === undefined ? "" : `  got: ${JSON.stringify(got)}`}`); }
};

/* ---------- RSS 2.0, the Federal Reserve shape ---------- */
const RSS = `<?xml version="1.0"?>
<rss version="2.0"><channel>
<title>FRB: Press Release - All Releases</title>
<item>
  <title>Minutes of the Board's discount rate meetings on July 20 and July 29, 2026</title>
  <link>https://www.federalreserve.gov/newsevents/pressreleases/monetary20260825a.htm</link>
  <pubDate>Tue, 25 Aug 2026 14:00:00 GMT</pubDate>
</item>
<item>
  <title><![CDATA[Federal Reserve Board announces approval &amp; terms]]></title>
  <link>https://www.federalreserve.gov/newsevents/pressreleases/orders20260820a.htm</link>
  <pubDate>Thu, 20 Aug 2026 18:30:00 GMT</pubDate>
</item>
</channel></rss>`;

const rss = parse(RSS);
ok("RSS: both items parsed", rss.length === 2, rss.length);
ok("RSS: title read", rss[0].title.startsWith("Minutes of the Board's"), rss[0].title);
ok("RSS: link read", rss[0].url.endsWith("monetary20260825a.htm"), rss[0].url);
ok("RSS: date to ISO", rss[0].published === "2026-08-25T14:00:00.000Z", rss[0].published);
ok("RSS: CDATA unwrapped and entity decoded",
  rss[1].title === "Federal Reserve Board announces approval & terms", rss[1].title);

/* ---------- Atom, where the URL lives in an attribute ---------- */
const ATOM = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<title>Press</title>
<entry>
  <title>ECB publishes its annual report</title>
  <link rel="alternate" type="text/html" href="https://www.ecb.europa.eu/press/pr/date/2026/html/x.en.html"/>
  <link rel="self" href="https://www.ecb.europa.eu/rss/press.html"/>
  <updated>2026-08-24T09:00:00Z</updated>
</entry>
</feed>`;

const atom = parse(ATOM);
ok("Atom: entry parsed", atom.length === 1, atom.length);
ok("Atom: alternate link preferred over self",
  atom[0].url === "https://www.ecb.europa.eu/press/pr/date/2026/html/x.en.html", atom[0].url);
ok("Atom: updated used as the date", atom[0].published === "2026-08-24T09:00:00.000Z", atom[0].published);

/* ---------- the awkward shapes ---------- */
const GUID_ONLY = `<rss><channel><item>
  <title>Release with no link element</title>
  <guid isPermaLink="true">https://www.bls.gov/news.release/cpi.htm</guid>
  <pubDate>Fri, 21 Aug 2026 12:30:00 GMT</pubDate>
</item></channel></rss>`;
const g = parse(GUID_ONLY);
ok("guid falls back to being the link", g.length === 1 && g[0].url.endsWith("cpi.htm"), g[0] && g[0].url);

const NO_DATE = `<rss><channel><item>
  <title>Undated item</title><link>https://example.gov/a</link>
</item></channel></rss>`;
const nd = parse(NO_DATE);
ok("undated item still parses, date left null", nd.length === 1 && nd[0].published === null, nd[0]);

const EMPTY = parse("<rss><channel><title>Nothing here</title></channel></rss>");
ok("a feed with no items yields none, rather than throwing", EMPTY.length === 0, EMPTY.length);

const NO_TITLE = parse(`<rss><channel><item><link>https://example.gov/b</link></item></channel></rss>`);
ok("an item with no title is dropped", NO_TITLE.length === 0, NO_TITLE.length);

/* ---------- entity and markup handling ---------- */
ok("html inside a title is stripped", strip("<b>Rates</b> &amp; <i>curves</i>") === "Rates & curves");
ok("numeric entities decode", strip("caf&#233; &#x2014; test").includes("café"));
ok("whitespace collapses", strip("a\n\n   b") === "a b");

/* ---------- the channel title must not be mistaken for an item ---------- */
const CHANNEL_TRAP = `<rss><channel><title>Channel title</title><link>https://example.gov</link>
<item><title>Real item</title><link>https://example.gov/item</link><pubDate>Mon, 24 Aug 2026 00:00:00 GMT</pubDate></item>
</channel></rss>`;
const trap = parse(CHANNEL_TRAP);
ok("channel metadata is not emitted as an item",
  trap.length === 1 && trap[0].title === "Real item", trap.map((t) => t.title));

/* ---- a dead feed is not a flaky feed ----
   Five sources have URLs verified dead: they return 404, or HTML, or a soft
   404 that renders a homepage. Counting them in "N of M answering" reports a
   working pipeline as half broken and hides the actual fact, which is that
   five institutions stopped publishing RSS. They are excluded from the count
   and named on the page instead. */
{
  const SOURCES = (await import(`${new URL("../content/wire-sources.mjs", import.meta.url).href}`)).default;
  const retired = SOURCES.filter((s) => s.retired);
  const live = SOURCES.filter((s) => !s.retired);

  ok("every retired source records why and when", retired.length > 0 &&
    retired.every((s) => typeof s.retired === "string" && /\d{4}/.test(s.retired)),
    JSON.stringify(retired.filter((s) => !/\d{4}/.test(String(s.retired))).map((s) => s.id)));

  ok("retired sources keep their url so they can be rechecked",
    retired.every((s) => /^https:\/\//.test(s.url)));

  ok("the live count excludes them", live.length === SOURCES.length - retired.length);

  const { wirePage } = await import(`${new URL("../src/templates/wire.mjs", import.meta.url).href}`);
  const page = wirePage({
    site: { name: "T", origin: "https://e.com", disclaimer: "Not advice." },
    wire: { fetchedAt: new Date().toISOString(), sourcesOk: live.length, sourcesTotal: live.length,
            retired: retired.map((s) => ({ name: s.name, note: s.retired })), items: [] },
  });
  ok("the page names withdrawn sources rather than hiding them in a ratio",
    retired.every((s) => page.body.includes(s.name)),
    "a retired source is not named on the page");
  ok("the page does not present them as today's failures",
    /withdrawn/i.test(page.body), "no withdrawal wording on the page");
}

/* ---- what the run reports about itself ----
   These guard a bug that survived because the parsers were testable and the
   reporting was not. Each one fails if the denominator goes back to counting
   every configured source, or if a permanently dead source is allowed to hold
   the status at "partial" forever. A status that cannot go green cannot go
   red: a real outage would have looked exactly like the four dead feeds. */
{
  const src = (id, retired) => ({ id, name: id, url: "https://x/", ...(retired ? { retired: "dead" } : {}) });
  const mk = (rows) => rows.map(([id, answered, retired]) => ({ src: src(id, retired), answered }));

  const healthy = wireReport({
    itemCount: 27,
    perSource: mk([["fed", true], ["bls", true], ["wam", false, true], ["imf", false, true]]),
  });
  ok("the denominator counts live sources only, not the whole list",
    /27 items from 2 of 2 feeds/.test(healthy.detail), healthy.detail);
  ok("dead sources cannot hold the status at partial forever",
    healthy.status === "ok", healthy.status);
  ok("withdrawn sources are still named, not silently dropped",
    /Withdrawn, still asked: wam, imf/.test(healthy.detail), healthy.detail);

  const degraded = wireReport({
    itemCount: 5,
    perSource: mk([["fed", true], ["bls", false], ["wam", false, true]]),
    errors: { bls: "HTTP 503" },
  });
  ok("a real live failure still reports partial, with the reason",
    degraded.status === "partial" && /Down: bls \(HTTP 503\)/.test(degraded.detail), degraded.detail);
  ok("a live failure is not diluted by the dead ones in the ratio",
    /5 items from 1 of 2 feeds/.test(degraded.detail), degraded.detail);

  const allGone = wireReport({ itemCount: 0, perSource: mk([["fed", false], ["wam", false, true]]) });
  ok("every live feed failing is failed, not partial", allGone.status === "failed", allGone.status);

  const back = wireReport({ itemCount: 9, perSource: mk([["fed", true], ["wam", true, true]]) });
  ok("a retired source that answers again is announced, not counted quietly",
    /RESTORED: wam/.test(back.detail) && back.liveTotal === 1, back.detail);
}

console.log(`\n${fail === 0 ? "All wire parser checks passed." : `${fail} FAILED, ${pass} passed.`}`);
process.exit(fail === 0 ? 0 : 1);
