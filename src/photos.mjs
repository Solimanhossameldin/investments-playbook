/* Photographs on the playbook pages.

   This site's whole claim is that every figure on it is checkable. A
   photograph is the easiest place to break that promise, because an image
   asserts things a number never does: that a place looks like this, that this
   is the building named beside it, that someone was there. None of that is
   visible as false the way a wrong number is.

   So the rule is structural, exactly as it is for the service charge table.
   An image without a named owner, a licence that permits the use, a
   resolvable source and the date it was obtained is not incomplete, it is
   inadmissible, and the build refuses it.

   Two rules on top of the obvious ones, both learned from what this site is
   arguing against:

   A photograph that NAMES A PLACE must be confirmed to be that place. A
   stock skyline captioned "Dubai Marina" that was taken in Doha is the exact
   fabrication the site exists to correct, and it would be published in good
   faith by anyone who did not check. `place` therefore requires `verified`.

   AN IMAGE THAT IS NOT A PHOTOGRAPH MAY NOT PRETEND TO BE ONE. Anything
   generated or composited carries `synthetic: true`, and the page says so
   next to it. An invented building presented as a record of a real one is
   not a lesser version of the same thing, it is the opposite of it. */

const PLACEHOLDER = /\b(tbd|todo|tba|example|sample|placeholder|lorem|xxx+|n\/?a|unknown|\?\?+)\b/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const IMAGE_FILE = /^[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp|avif)$/i;

/* Licences that permit commercial use with attribution. A licence outside
   this list is refused rather than judged: deciding on the fly whether some
   bespoke terms permit this use is how a site ends up in a dispute. */
export const LICENCES = [
  "CC0-1.0", "CC-BY-4.0", "CC-BY-SA-4.0", "CC-BY-3.0", "CC-BY-SA-3.0",
  "unsplash", "pexels", "pixabay", "owned",
];

export const REQUIRED = ["file", "slug", "alt", "credit", "licence", "sourceUrl", "retrievedAt"];

/* Returns [] for a publishable record, or the reasons it is not. */
export function recordProblems(r, i = 0) {
  const out = [];
  const at = `photo ${i}${r && r.file ? ` (${r.file})` : ""}`;
  if (!r || typeof r !== "object") return [`${at}: not an object`];

  for (const k of REQUIRED) {
    if (r[k] === undefined || r[k] === null || r[k] === "") out.push(`${at}: missing ${k}`);
  }

  if (r.file && !IMAGE_FILE.test(String(r.file))) out.push(`${at}: file is not a plain image filename`);
  if (r.licence && !LICENCES.includes(String(r.licence))) out.push(`${at}: licence ${r.licence} is not one that permits this use`);
  if (r.sourceUrl && String(r.licence) !== "owned" && !/^https?:\/\/\S+$/i.test(String(r.sourceUrl)))
    out.push(`${at}: sourceUrl is not a URL`);
  if (r.retrievedAt && !ISO_DATE.test(String(r.retrievedAt))) out.push(`${at}: retrievedAt must be YYYY-MM-DD`);

  /* Alt text is the image for anyone who cannot see it. One word is not a
     description, it is a label, and it fails the same readers twice. */
  if (r.alt && String(r.alt).trim().split(/\s+/).length < 4) out.push(`${at}: alt text is too short to describe anything`);

  /* Naming a place is a claim. It needs confirming. */
  if (r.place && r.verified !== true) out.push(`${at}: names the place "${r.place}" but is not marked verified`);

  /* A generated image may be used; it may not be passed off as a record. */
  if (r.synthetic === true && r.place) out.push(`${at}: a synthetic image may not name a real place`);

  for (const k of ["alt", "credit", "place"]) {
    if (r[k] && PLACEHOLDER.test(String(r[k]))) out.push(`${at}: ${k} still contains placeholder text`);
  }
  return out;
}

/* Throws on anything unpublishable. Returns the photos grouped by the page
   they belong to, so the template can ask for one slug's images and get
   either a list or nothing at all. */
export function validate(photos) {
  if (!Array.isArray(photos)) throw new Error("photos: expected an array");
  const problems = photos.flatMap((r, i) => recordProblems(r, i));
  if (problems.length) throw new Error("photos refused:\n  " + problems.join("\n  "));

  const bySlug = new Map();
  for (const p of photos) {
    if (!bySlug.has(p.slug)) bySlug.set(p.slug, []);
    bySlug.get(p.slug).push(p);
  }
  return { photos, count: photos.length, bySlug };
}
