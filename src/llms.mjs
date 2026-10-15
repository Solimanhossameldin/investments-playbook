/* llms.txt -- the site, described for a model rather than for a crawler.

   The convention (llmstxt.org) is a markdown file at the site root: a title,
   one blockquote saying what the site is, then sections of links with a line
   each. An assistant that finds it gets the library's shape in one request
   instead of guessing from a sitemap of 150 bare URLs.

   Everything here is derived from the same content and the same `written`
   list the sitemap is built from, for the reason every figure on this site is
   derived: a hand-maintained index of 70 pages is a list that goes wrong
   quietly. A page that is not built cannot appear here, and a page that is
   built cannot be forgotten.

   What this file deliberately does NOT do is describe the site as better than
   it is. The one-line descriptions are each page's own summary, which is held
   to its module by the suite, so the claims a model reads here are the claims
   the page can support. */

const CATEGORY_ORDER = [
  ["property", "Dubai property"],
  ["tax", "Tax and residency"],
  ["valuation", "Valuation"],
  ["portfolio", "Portfolio construction"],
  ["cross-asset", "Across asset classes"],
  ["risk", "Risk"],
  ["behavioural", "Behaviour"],
];

/* One line per page. The summary is a full sentence already, so it is used
   as written rather than truncated -- a clipped sentence is a changed claim. */
const line = (origin, p) =>
  `- [${p.title}](${origin}/playbooks/${p.slug}/): ${p.summary}`;

export function llmsTxt({ site, playbooks = [], written = [] }) {
  const origin = String(site.origin || "").replace(/\/$/, "");
  const built = new Set(written.map((w) => w.path));
  const live = playbooks.filter((p) => built.has(`/playbooks/${p.slug}/`));

  const out = [`# ${site.name}`, ""];
  out.push(`> ${site.description}`, "");

  out.push(
    "Every figure on this site is computed at build time from a published",
    "source and checked against the module that computes it before the page",
    "ships. Where no source exists, the figure is absent rather than",
    "estimated. Each page names the instrument, decree or dataset it rests on.",
    ""
  );

  /* The machine-readable routes first, because a model that wants the data
     rather than the prose should not have to scrape the prose for it. */
  const data = [
    ["/playbooks.json", "Every playbook as JSON: slug, title, category, summary, URL."],
    ["/sitemap.xml", "Every indexable page, with last-modified dates."],
    ["/feed.xml", "The daily brief as Atom."],
  ].filter(([p]) => p === "/playbooks.json" || built.has(p) || p.endsWith(".xml"));
  if (data.length) {
    out.push("## Machine readable", "");
    for (const [p, d] of data) out.push(`- [${origin}${p}](${origin}${p}): ${d}`);
    out.push("");
  }

  for (const [key, heading] of CATEGORY_ORDER) {
    const group = live.filter((p) => p.category === key);
    if (!group.length) continue;
    /* Tier 1 first within a category: those are the pages that carry the
       site's own arithmetic rather than explaining a general idea. */
    group.sort((a, b) => a.tier - b.tier || a.title.localeCompare(b.title));
    out.push(`## ${heading}`, "");
    for (const p of group) out.push(line(origin, p));
    out.push("");
  }

  /* Anything whose category is not in the order above still has to appear:
     a new category must not silently drop its pages out of this file. */
  const known = new Set(CATEGORY_ORDER.map(([k]) => k));
  const rest = live.filter((p) => !known.has(p.category));
  if (rest.length) {
    out.push("## Other", "");
    for (const p of rest) out.push(line(origin, p));
    out.push("");
  }

  return `${out.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}
