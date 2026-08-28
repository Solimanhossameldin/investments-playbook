/* The brief has been published since the site launched with no way to follow it
   except handing over an email address. This is that way.

   Atom rather than RSS 2.0: dates are RFC 3339, which is the format the rest of
   this codebase already speaks, and there is no ambiguity about which element
   carries the content. Full issue text goes in, not a teaser. A feed that makes
   the reader click through is an advertisement for the site rather than a way
   to read it, and the site is not short of places to ask for an email. */

import { esc, copy, md } from "../lib.mjs";

// Exported only so the test can reach it. Every value entryBody puts inside a
// CDATA section has already been through esc(), which turns ">" into "&gt;",
// so a terminator cannot occur by that route today and this split never fires
// in the feed as built. It is here for the caller who one day passes real
// HTML through, and it is tested directly rather than through the feed,
// because a guard exercised by nothing is a guard nobody knows is broken.
export const cdata = (html) => `<![CDATA[${String(html).replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;

const stamp = (b) => b.publishedAt || `${b.date}T00:00:00Z`;

// The issue as a reader would read it: the subtitle, then each item's three
// beats in the order the page uses, then its sources.
function entryBody(brief) {
  const parts = [`<p><em>${esc(copy(brief.subtitle))}</em></p>`];
  if (brief.correction) {
    parts.push(`<p><strong>Correction.</strong> ${esc(copy(brief.correction))}</p>`);
  }
  (brief.items || []).forEach((it, i) => {
    parts.push(`<h2>${i + 1}. ${esc(copy(it.heading))}</h2>`);
    for (const [label, key] of [
      ["What happened", "what_happened"],
      ["What it means", "what_it_means"],
      ["What it means for your portfolio", "what_it_means_for_you"],
    ]) {
      if (it[key]) parts.push(`<p><strong>${label}.</strong> ${esc(copy(it[key]))}</p>`);
    }
    if ((it.sources || []).length) {
      parts.push(
        `<p>Sources: ${it.sources
          .map((s) => `<a href="${esc(s.url)}">${esc(s.name)}</a>`)
          .join(", ")}</p>`
      );
    }
  });
  return parts.join("\n");
}

export function feed({ site, briefs = [] }) {
  const items = briefs.slice(0, 50);
  // An empty feed still has to be a valid feed, and its updated stamp still has
  // to be a real instant, so it falls back to now rather than to nothing.
  const updated = items.length ? stamp(items[0]) : new Date().toISOString();

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(site.name)}</title>
  <subtitle>${esc(site.tagline)}</subtitle>
  <link rel="self" type="application/atom+xml" href="${site.origin}/feed.xml"/>
  <link rel="alternate" type="text/html" href="${site.origin}/brief/"/>
  <id>${site.origin}/</id>
  <updated>${esc(updated)}</updated>
  <icon>${site.origin}/icon-512.png</icon>
  <logo>${site.origin}/og.png</logo>
  <rights>Educational research. Not personal investment advice.</rights>
  <author><name>${esc(site.author.name)}</name><uri>${site.origin}/about/</uri></author>
${items
  .map(
    (b) => `  <entry>
    <title>${esc(copy(b.title))}</title>
    <link rel="alternate" type="text/html" href="${site.origin}/brief/${esc(b.slug)}/"/>
    <id>${site.origin}/brief/${esc(b.slug)}/</id>
    <published>${esc(stamp(b))}</published>
    <updated>${esc(stamp(b))}</updated>
    <author><name>${esc(b.author || site.author.name)}</name></author>
    <summary type="text">${esc(copy(b.subtitle))}</summary>
    <content type="html">${cdata(entryBody(b))}</content>
  </entry>`
  )
  .join("\n")}
</feed>
`;
}
