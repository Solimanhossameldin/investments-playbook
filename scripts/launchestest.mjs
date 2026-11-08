/* The launch list, and the arithmetic that is the only reason it exists.

   A page of a developer's prices is the easiest kind of page to publish and
   the easiest to get quietly wrong: a figure typed in the table instead of
   computed, a dataset that loses its retrieval date, a split that drifts off
   the registration rate the rest of the site uses. Each of those has a check
   here, and each was proved by reverting the thing it guards.

   The validator's refusals are tested too, because a validator that accepts
   an undated table of somebody's prices is worse than no validator: the page
   would publish, and its whole claim is the date. */

import { readFileSync } from "node:fs";
import * as lx from "../src/launches.mjs";
import * as aq from "../src/acquisition.mjs";
import { launchesPage } from "../src/templates/launches.mjs";
import { whatsappUrl } from "../src/templates/contact.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, got) => {
  if (cond) pass++;
  else { fail++; console.log(`  FAIL  ${name}${got === undefined ? "" : `\n        ${got}`}`); }
};
const throws = (fn) => { try { fn(); return false; } catch { return true; } };

const site = JSON.parse(readFileSync("content/site.json", "utf8"));
const raw = JSON.parse(readFileSync("content/nakheel-launches.json", "utf8"));
const ix = lx.validate(raw);

/* ---- the split is derived, not typed ---- */
ok("launches: the seller's share is half the site's own registration rate",
  lx.ownShare === aq.FEES.transferRate / 2, `${lx.ownShare} vs ${aq.FEES.transferRate / 2}`);
ok("launches: every row's share is its price times that rate",
  ix.rows.every((r) => r.share === Math.round(r.priceAed * lx.ownShare)),
  JSON.stringify(ix.rows.filter((r) => r.share !== Math.round(r.priceAed * lx.ownShare)).map((r) => r.name)));
ok("launches: every row's whole fee is twice its share, to the dirham",
  ix.rows.every((r) => Math.abs(r.wholeFee - r.share * 2) <= 1),
  JSON.stringify(ix.rows.filter((r) => Math.abs(r.wholeFee - r.share * 2) > 1).map((r) => r.name)));

/* ---- the dataset's own integrity ---- */
ok("launches: the list is sorted cheapest first",
  ix.rows.every((r, i) => i === 0 || r.priceAed >= ix.rows[i - 1].priceAed));
ok("launches: the headline range is taken from the rows still on sale",
  ix.low === ix.rows.filter((r) => !r.soldOut)[0].priceAed, String(ix.low));
ok("launches: the sold-out count and the live count add up to the whole list",
  ix.liveCount + ix.soldOutCount === ix.count, `${ix.liveCount} + ${ix.soldOutCount} vs ${ix.count}`);
ok("launches: every row carries a positive price", ix.rows.every((r) => r.priceAed > 0));
ok("launches: the source is an https url", /^https:\/\//.test(ix.sourceUrl));
ok("launches: the dataset is dated", /^\d{4}-\d{2}-\d{2}$/.test(ix.retrievedAt));

/* ---- the refusals. A validator is only worth the things it rejects. ---- */
ok("launches: an undated dataset is refused",
  throws(() => lx.validate({ ...raw, retrievedAt: "" })));
ok("launches: a dataset with no source url is refused",
  throws(() => lx.validate({ ...raw, sourceUrl: "" })));
ok("launches: a non-https source url is refused",
  throws(() => lx.validate({ ...raw, sourceUrl: "http://example.com" })));
ok("launches: a launch with no price is refused",
  throws(() => lx.validate({ ...raw, launches: [{ name: "x" }] })));
ok("launches: a launch with a negative price is refused",
  throws(() => lx.validate({ ...raw, launches: [{ name: "x", priceAed: -1 }] })));
ok("launches: an empty list is refused", throws(() => lx.validate({ ...raw, launches: [] })));

/* ---- the page itself ---- */
const spec = launchesPage({ site, index: ix });
const html = spec.body;

ok("launches: the page prints every project name", ix.rows.every((r) => html.includes(r.name)),
  JSON.stringify(ix.rows.filter((r) => !html.includes(r.name)).map((r) => r.name)));
ok("launches: the page prints every computed share",
  ix.rows.every((r) => html.includes(r.share.toLocaleString("en-US"))),
  JSON.stringify(ix.rows.filter((r) => !html.includes(r.share.toLocaleString("en-US"))).map((r) => r.name)));
ok("launches: the page prints the retrieval date", html.includes("7 November 2026") || html.includes(ix.retrievedAt));
ok("launches: the page names its source and links to it",
  html.includes(ix.source) && html.includes(ix.sourceUrl));
ok("launches: the page carries the Article 3 quotation word for word",
  html.includes("shared equally by the seller and purchaser"));
/* The claim lives in the dataset's own note, so this guards the note: blank
   it and the page ships a developer's prices without saying whose they are
   not. Proved by blanking it. */
ok("launches: the page says somewhere that it is not the developer's price list",
  new RegExp(`not a ${ix.developer} price list`).test(html));
ok("launches: and it says it exactly once, so the rendered copy does not repeat itself",
  (html.match(new RegExp(`not a ${ix.developer} price list`, "g")) || []).length === 1,
  String((html.match(new RegExp(`not a ${ix.developer} price list`, "g")) || []).length));
ok("launches: the page disclaims an agency relationship",
  /no agency relationship/.test(html));
ok("launches: the page names the three costs it will not estimate",
  /service charge/.test(html) && /payment plan/.test(html) && /no objection certificate/.test(html));

/* The one rule the whole site turns on: the inbound link runs one way. */
ok("launches: Onelink Properties appears nowhere on the page",
  !/onelink/i.test(html), "the one-way link rule");

/* The call to action is the site's configured route or nothing at all. A
   hardcoded number would survive the config being emptied; this does not. */
const wa = whatsappUrl(site);
ok("launches: the WhatsApp route is the one in site.json, or absent",
  wa ? html.includes(wa) : !/wa\.me/.test(html), wa || "no route configured");
if (wa) {
  ok("launches: each row's WhatsApp message names that project",
    ix.rows.every((r) => html.includes(encodeURIComponent(r.name))),
    JSON.stringify(ix.rows.filter((r) => !html.includes(encodeURIComponent(r.name))).map((r) => r.name)));
  ok("launches: outbound WhatsApp links do not pass authority",
    (html.match(/wa\.me[^"]*"/g) || []).length > 0
    && !/href="https:\/\/wa\.me[^"]*"(?![^>]*nofollow)/.test(html));
}
ok("launches: the page gates nothing and asks for no email address",
  !/type="email"/.test(html) && !/<form/.test(html));

/* The page must be findable from the library, which the audit also enforces
   site-wide; named here so the reason is legible when it fails. */
const inbound = ["cost-of-buying-in-dubai", "off-plan-irr"]
  .filter((s) => readFileSync(`content/playbooks/${s}.md`, "utf8").includes("](/nakheel-launches/)"));
ok("launches: at least two frameworks link to the page", inbound.length >= 2, inbound.join(", "));

/* ---- the photograph, when there is one ----

   The page must work with and without one: the photo arrives from the
   pipeline, so a build before it has run has none, and that must not be a
   broken page. When one is there it carries its own credit and licence, and
   the caption says the picture is of the place rather than of a project,
   because an image asserts things a table does not. */
{
  const shot = {
    file: "dubai-islands-causeway.jpg",
    alt: "A long test caption describing the causeway and the water",
    credit: "Iwona Rege", licence: "CC-BY-SA-4.0",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Deira_Bridge.jpg",
    width: 960, height: 640,
  };
  const withPhoto = launchesPage({ site, index: ix, photos: [shot] }).body;
  const without = launchesPage({ site, index: ix, photos: [] }).body;

  ok("launches: with no photograph the page still builds and shows no figure",
    !/<figure/.test(without));
  ok("launches: a photograph renders as a figure with its own credit and licence",
    /<figure/.test(withPhoto) && withPhoto.includes("Iwona Rege")
    && withPhoto.includes("CC-BY-SA-4.0") && withPhoto.includes(shot.sourceUrl));
  ok("launches: the photograph carries the alt text it was given",
    withPhoto.includes(shot.alt));
  ok("launches: the caption says the picture is of the place, not of a project",
    /photograph is of the place, not of a project in the table/.test(withPhoto));
  ok("launches: the caption counts the Dubai Islands rows rather than asserting a number",
    withPhoto.includes(`${ix.rows.filter((r) => r.location === "Dubai Islands").length} of the ${ix.count} launches`),
    String(ix.rows.filter((r) => r.location === "Dubai Islands").length));
}

/* The curated source entry is what makes the photograph appear at all, so the
   page's own slug has to be the one it is filed under. */
{
  const sources = JSON.parse(readFileSync("content/photo-sources.json", "utf8")).sources;
  const mine = sources.filter((s) => s.slug === "nakheel-launches");
  ok("launches: exactly one photograph is curated for this page", mine.length === 1,
    JSON.stringify(mine.map((s) => s.file)));
  if (mine[0]) {
    ok("launches: it names a Commons file and carries alt text a reader could use",
      /^File:/.test(mine[0].commons) && String(mine[0].alt).trim().split(/\s+/).length >= 6,
      mine[0].commons);
    ok("launches: it claims no place, because the file carries no coordinates to check one against",
      mine[0].place === undefined, String(mine[0].place));
  }
}

ok("launches: the page declares a dated Dataset that names its source and claims no licence", (() => {
  const d = (spec.jsonld || []).find((x) => x["@type"] === "Dataset");
  return !!d && d.dateModified === ix.retrievedAt && d.isAccessibleForFree === true
    && d.isBasedOn && d.isBasedOn.url === ix.sourceUrl
    && d.license === undefined && d.licence === undefined;
})(), JSON.stringify((spec.jsonld || []).map((x) => x["@type"])));

console.log(`\n${fail === 0 ? `launches: ${pass} checks passed across ${ix.count} launches.` : `${fail} FAILED, ${pass} passed.`}`);
process.exit(fail === 0 ? 0 : 1);
