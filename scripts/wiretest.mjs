#!/usr/bin/env node
/* The wire parser, tested against recorded feed payloads. The network is not
   involved: what breaks a feed reader is a shape it has not seen, not a
   provider being down, and a shape can be recorded. */

import { parse, strip, link, when } from "./fetch-wire.mjs";

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

console.log(`\n${fail === 0 ? "All wire parser checks passed." : `${fail} FAILED, ${pass} passed.`}`);
process.exit(fail === 0 ? 0 : 1);
