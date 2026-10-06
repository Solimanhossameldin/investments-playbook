#!/usr/bin/env node
// Photographs, fetched the way every figure on this site is fetched: from the
// source, on every run, with the provenance read off the source rather than
// typed by whoever added it.
//
// content/photo-sources.json is the curated half. It says which Wikimedia
// Commons file belongs on which page, what the picture shows (the alt text,
// which only a person who has looked at it can write), and, when the caption
// names a place, the box on the map that the camera has to have been standing
// in. Everything a reader could check -- who took it, the licence, where it
// lives, when it was obtained -- is taken from the Commons API each run.
//
// So a photograph is held to the same standard as a yield or a rate: if its
// licence changes, its file is deleted, or its author adds conditions, it
// drops off the next build instead of staying up on the strength of a note
// somebody wrote once.
//
// Writes content/photos/<file> and content/photos.json, appends to
// content/status.json. Zero dependencies, Node 18+ global fetch.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { recordProblems } from "../src/photos.mjs";

const API = "https://commons.wikimedia.org/w/api.php";

// Wikimedia's user-agent policy asks for a client that names itself and says
// how to reach whoever runs it. The browser string the market fetcher sends
// would be throttled here, and it would also be untrue.
const UA = {
  "User-Agent": "InvestmentsPlaybook/1.0 (https://investmentsplaybook.com; photo provenance fetch)",
  Accept: "*/*",
};
const TIMEOUT = 20000;

// Commons serves thumbnails at fixed widths and throttles odd ones. 960 is one
// of them; at the prose column it is about 1.4x, and it keeps a night skyline
// under 200KB, which matters for a picture that sits at the top of the page.
export const DEFAULT_WIDTH = 960;
export const MAX_BYTES = 400 * 1024;

/* Commons' short names, mapped onto the licences src/photos.mjs accepts. A
   licence that is not here is refused, not interpreted: NC, ND, PD-marks and
   every bespoke tag fall out by omission, which is the point. */
const LICENCE_MAP = {
  "CC0": "CC0-1.0",
  "CC BY 4.0": "CC-BY-4.0",
  "CC BY-SA 4.0": "CC-BY-SA-4.0",
  "CC BY 3.0": "CC-BY-3.0",
  "CC BY-SA 3.0": "CC-BY-SA-3.0",
};
export function licenceFromCommons(short) {
  return LICENCE_MAP[String(short || "").trim()] || null;
}

export function strip(s) {
  return String(s || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* Authors on Commons sometimes write terms into the author field on top of
   the licence: "contact me before commercial use", "email me", "do not
   upload an edited version". A CC licence cannot legally be narrowed that
   way, and that is exactly why it is refused rather than argued: this is a
   commercial site, and publishing a picture over its author's stated wishes
   because the licence technically allows it is how a site ends up in a
   dispute it deserved. The first time this was checked by hand, on
   6 October 2026, the best Dubai skyline on Commons carried precisely that
   sentence. */
const CONDITIONS = /\b(contact|commercial|permission|e-?mail|consult|do not|don't|must not|not allowed|ask me|notify|non-?commercial)\b/i;
export function extraConditions(...fields) {
  const hit = fields.map(strip).find((f) => CONDITIONS.test(f));
  return hit ? hit.slice(0, 120) : null;
}

/* box is [south, west, north, east]. The camera position from the file's own
   EXIF has to fall inside it. That is what "verified" means on this site: not
   that someone believed the caption, but that the photograph was taken where
   the caption says it was. */
export function inBox(lat, lon, box) {
  if (!Array.isArray(box) || box.length !== 4) return false;
  const [s, w, n, e] = box.map(Number);
  const la = Number(lat), lo = Number(lon);
  if (![la, lo, s, w, n, e].every(Number.isFinite)) return false;
  return la >= s && la <= n && lo >= w && lo <= e;
}

/* One Commons page (formatversion=2) plus one curated source, to a
   publishable record or the reasons it is not one. `gone` marks a definitive
   negative -- deleted, renamed, relicensed -- as against a network failure,
   which the caller treats differently. */
export function toRecord(src, page, today, prev = null) {
  if (!page || page.missing || page.invalid || !page.imageinfo || !page.imageinfo[0]) {
    return { problems: [`${src.commons}: not on Commons (deleted or renamed)`], gone: true };
  }
  const ii = page.imageinfo[0];
  const m = ii.extmetadata || {};
  const v = (k) => strip(m[k] && m[k].value);
  const problems = [];

  const licence = licenceFromCommons(m.LicenseShortName && m.LicenseShortName.value);
  if (!licence) problems.push(`licence "${v("LicenseShortName") || "none"}" is not one this site publishes under`);

  const credit = v("Artist");
  if (!credit) problems.push("no author named");
  else if (credit.length > 80) problems.push("the author field is a paragraph, not a name; read it before publishing");

  const cond = extraConditions(m.Artist && m.Artist.value, m.Credit && m.Credit.value, m.UsageTerms && m.UsageTerms.value);
  if (cond) problems.push(`the author has added conditions: "${cond}"`);

  if (v("Restrictions")) problems.push(`Commons flags restrictions on reuse: ${v("Restrictions")}`);

  const cats = (page.categories || []).map((c) => String(c.title || c));
  const flagged = cats.find((c) => /deletion requests|copyright violations|license review needed|no permission/i.test(c));
  if (flagged) problems.push(`Commons has it under review: ${flagged}`);

  if (!ii.thumburl || !ii.thumbwidth || !ii.thumbheight) problems.push("Commons returned no thumbnail");
  else {
    const t = thumbProblem(ii.thumburl);
    if (t) problems.push(t);
  }

  const record = {
    file: src.file,
    slug: src.slug,
    alt: src.alt,
    credit,
    licence: licence || v("LicenseShortName"),
    sourceUrl: ii.descriptionurl,
    retrievedAt: prev && prev.commonsSha1 === ii.sha1 && prev.retrievedAt ? prev.retrievedAt : today,
    width: ii.thumbwidth,
    height: ii.thumbheight,
    commons: page.title,
    commonsSha1: ii.sha1,
    checkedAt: today,
  };

  if (src.place) {
    const lat = m.GPSLatitude && m.GPSLatitude.value;
    const lon = m.GPSLongitude && m.GPSLongitude.value;
    if (lat == null || lon == null) problems.push(`names "${src.place}" but the file carries no camera position to check it against`);
    else if (!inBox(lat, lon, src.bbox)) problems.push(`names "${src.place}" but was taken at ${lat},${lon}, outside the declared box`);
    else { record.place = src.place; record.verified = true; }
  }

  // A preview has no page and no alt text yet -- deciding those is what the
  // preview is for -- so only the provenance gates above apply to it.
  if (!src.preview) problems.push(...recordProblems(record).map((p) => p.replace(/^photo \d+ /, "")));
  return { record, problems, thumbUrl: ii.thumburl, gone: problems.length > 0 };
}

/* Thumbnails come from thumb.wikimedia.org today and came from
   upload.wikimedia.org until recently, with utm_* tracking parameters on the
   end -- so the extension is read off the path, not the end of the string, and
   any Wikimedia host is accepted while nothing else is. Both of those were
   wrong in the first draft of this file and right in its tests, because the
   tests were written from memory. They are now written from the live API. */
export function thumbProblem(url) {
  let u;
  try { u = new URL(String(url)); } catch { return "thumbnail URL does not parse"; }
  if (u.protocol !== "https:") return "thumbnail is not served over HTTPS";
  if (!/(^|\.)wikimedia\.org$/i.test(u.hostname)) return `thumbnail is on ${u.hostname}, not Wikimedia`;
  if (!/\.jpe?g$/i.test(u.pathname)) return "thumbnail is not a JPEG";
  return null;
}

function isJpeg(buf) {
  return buf && buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}

const readJson = (p, fallback) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; } };

export async function run({ root, fetchImpl = globalThis.fetch, today = new Date().toISOString().slice(0, 10), log = console.log } = {}) {
  const SOURCES = path.join(root, "content/photo-sources.json");
  const MANIFEST = path.join(root, "content/photos.json");
  const DIR = path.join(root, "content/photos");
  const STATUS = path.join(root, "content/status.json");
  // Candidates someone wants to look at before they go on a page. Downloaded
  // here, committed with the day's content, never put in the manifest -- and
  // the build copies only what the manifest lists, so a preview cannot reach
  // the site. Look at it on GitHub, then give it a slug and alt text, or drop it.
  const PREVIEW_DIR = path.join(DIR, "preview");

  const sources = (readJson(SOURCES, { sources: [] }).sources) || [];
  const prevList = (readJson(MANIFEST, { photos: [] }).photos) || [];
  const prevBy = new Map(prevList.map((p) => [p.file, p]));

  const kept = [], published = [], dropped = [], notes = [], previews = [];

  for (const src of sources) {
    const width = Number(src.width) || DEFAULT_WIDTH;
    const prev = prevBy.get(src.file) || null;
    let page;
    try {
      const q = new URLSearchParams({
        action: "query", format: "json", formatversion: "2", redirects: "1",
        titles: src.commons, prop: "imageinfo|categories", cllimit: "100",
        iiprop: "url|size|sha1|extmetadata", iiurlwidth: String(width),
      });
      const r = await fetchImpl(`${API}?${q}`, { headers: UA, signal: AbortSignal.timeout(TIMEOUT) });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      page = d && d.query && d.query.pages && d.query.pages[0];
    } catch (e) {
      // Commons being unreachable says nothing about the photograph. Keep the
      // one that passed last time, if its file is still here.
      if (prev && fs.existsSync(path.join(DIR, prev.file))) { kept.push(prev); notes.push(`${src.file} kept (Commons unreachable: ${e.message})`); }
      else notes.push(`${src.file} skipped (Commons unreachable: ${e.message})`);
      continue;
    }

    const out = toRecord(src, page, today, prev);
    if (out.problems.length) { dropped.push(src.file); notes.push(`${src.file} refused: ${out.problems.join("; ")}`); continue; }

    const dest = src.preview ? path.join(PREVIEW_DIR, src.file) : path.join(DIR, src.file);
    const fresh = src.preview
      ? fs.existsSync(dest)
      : prev && prev.commonsSha1 === out.record.commonsSha1 && prev.width === out.record.width && fs.existsSync(dest);
    if (!fresh) {
      try {
        const r = await fetchImpl(out.thumbUrl, { headers: UA, signal: AbortSignal.timeout(TIMEOUT) });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const buf = Buffer.from(await r.arrayBuffer());
        if (!isJpeg(buf)) throw new Error("download is not a JPEG");
        if (buf.length > MAX_BYTES) throw new Error(`download is ${Math.round(buf.length / 1024)}KB, over ${MAX_BYTES / 1024}KB`);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, buf);
      } catch (e) {
        if (prev && fs.existsSync(dest)) { kept.push(prev); notes.push(`${src.file} kept (download failed: ${e.message})`); }
        else notes.push(`${src.file} skipped (download failed: ${e.message})`);
        continue;
      }
    }
    if (src.preview) { previews.push(src.file); continue; }
    published.push(out.record);
  }

  // A preview taken out of the list is cleared, so the folder only ever holds
  // what is currently under consideration.
  const wanted = new Set(sources.filter((s) => s.preview).map((s) => s.file));
  if (fs.existsSync(PREVIEW_DIR)) {
    for (const f of fs.readdirSync(PREVIEW_DIR)) {
      if (!wanted.has(f)) { try { fs.rmSync(path.join(PREVIEW_DIR, f)); notes.push(`preview ${f} cleared`); } catch {} }
    }
  }

  // The build refuses a manifest entry whose file is missing, and a refused
  // build is a site that does not deploy. Nothing goes in that is not on disk
  // in the published folder -- which also makes this the second line keeping
  // previews off the site, since theirs live one folder down.
  const photos = [...published, ...kept].filter((p) => fs.existsSync(path.join(DIR, p.file)));
  const order = new Map(sources.map((s, i) => [s.file, i]));
  photos.sort((a, b) => (order.get(a.file) ?? 0) - (order.get(b.file) ?? 0));

  fs.writeFileSync(MANIFEST, JSON.stringify({ photos }, null, 1) + "\n");

  const pub = sources.filter((s) => !s.preview).length;
  const status = !pub ? (previews.length ? "ok" : "skipped") : photos.length === pub ? "ok" : photos.length ? "partial" : "failed";
  const s = readJson(STATUS, { runs: [] });
  s.runs = s.runs || [];
  s.runs.unshift({
    job: "fetch-photos",
    status,
    detail: `${photos.length} of ${pub} photographs published${previews.length ? `, ${previews.length} staged for preview` : ""}${notes.length ? `. ${notes.join("; ").slice(0, 300)}` : ""}`,
    ranAt: new Date().toISOString(),
  });
  s.runs = s.runs.slice(0, 40);
  fs.writeFileSync(STATUS, JSON.stringify(s, null, 1));

  log(`fetch-photos: ${status}. ${photos.length}/${pub} published, ${previews.length} previews, ${dropped.length} refused.`);
  for (const n of notes) log("  " + n);
  return { status, photos, dropped, notes, previews };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  run({ root }).then((r) => { if (r.status === "failed") process.exitCode = 1; });
}
