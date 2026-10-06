#!/usr/bin/env node
// Offline tests for scripts/fetch-photos.mjs. Commons is stubbed with the
// payload shape the API really returns (formatversion=2, extmetadata values
// as HTML), so these run on a plane and still mean something.
// Run with: node scripts/phototest.mjs

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  run, toRecord, licenceFromCommons, extraConditions, inBox, strip, thumbProblem, MAX_BYTES,
} from "./fetch-photos.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0, passed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log("  pass  " + name); }
  else { failed++; console.log("  FAIL  " + name + (detail ? `\n        ${detail}` : "")); }
}
const today = "2026-10-06";

/* ---- the curated half ---- */
const SRC = {
  commons: "File:Skylines of the Central Business District, Singapore at dusk.jpg",
  file: "singapore-cbd-dusk.jpg",
  slug: "dubai-vs-singapore",
  alt: "The towers of Singapore's Central Business District at dusk, photographed from the observation deck of Marina Bay Sands",
  place: "Singapore's Central Business District, from Marina Bay Sands",
  bbox: [1.278, 103.855, 1.290, 103.866],
};

/* ---- what Commons sends back, trimmed to the fields that are read ---- */
function page(over = {}, meta = {}) {
  const em = {
    LicenseShortName: { value: "CC BY-SA 4.0" },
    Artist: { value: '<a href="//commons.wikimedia.org/wiki/User:Basile_Morin" title="User:Basile Morin">Basile Morin</a>' },
    Credit: { value: '<span class="int-own-work" lang="en">Own work</span>' },
    UsageTerms: { value: "Creative Commons Attribution-Share Alike 4.0" },
    AttributionRequired: { value: "true" },
    GPSLatitude: { value: "1.285198" },
    GPSLongitude: { value: "103.860720" },
    ...meta,
  };
  for (const k of Object.keys(em)) if (em[k] === undefined) delete em[k];
  return {
    title: SRC.commons,
    categories: [{ title: "Category:Featured pictures of Singapore" }, { title: "Category:Quality images" }],
    imageinfo: [{
      // Shape copied from the live API on 6 October 2026: thumb.wikimedia.org,
      // and tracking parameters after the extension.
      thumburl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/x/xy/Skylines.jpg/960px-Skylines.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail",
      thumbwidth: 960, thumbheight: 640,
      descriptionurl: "https://commons.wikimedia.org/wiki/File:Skylines_of_the_Central_Business_District,_Singapore_at_dusk.jpg",
      sha1: "aaaa1111",
      extmetadata: em,
    }],
    ...over,
  };
}

const JPEG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(2000, 7)]);

/* ---- the pure parts ---- */
check("CC BY-SA 4.0 maps to the site's CC-BY-SA-4.0", licenceFromCommons("CC BY-SA 4.0") === "CC-BY-SA-4.0");
check("CC0 maps to CC0-1.0", licenceFromCommons("CC0") === "CC0-1.0");
check("a NonCommercial licence is refused, not interpreted", licenceFromCommons("CC BY-NC 4.0") === null);
check("a public-domain mark is refused, since the site's list does not carry it", licenceFromCommons("Public domain") === null);
check("strip removes the HTML Commons wraps around an author", strip(page().imageinfo[0].extmetadata.Artist.value) === "Basile Morin");

check("an author who asks to be contacted before commercial use is caught",
  !!extraConditions("Feel free to use my photos, but please mention me as the author. Please contact me before commercial use."));
check("a plain name is not mistaken for a condition", extraConditions("Basile Morin", "Own work") === null);

check("a thumbnail with Wikimedia's tracking parameters on the end is still a JPEG",
  thumbProblem("https://thumb.wikimedia.org/a/960px-B.jpg?utm_source=commons.wikimedia.org&utm_content=thumbnail") === null);
check("the older upload.wikimedia.org host is accepted too", thumbProblem("https://upload.wikimedia.org/a/960px-B.jpg") === null);
check("a thumbnail on any other host is refused", /not Wikimedia/.test(thumbProblem("https://wikimedia.org.evil.example/a.jpg") || ""));
check("a PNG thumbnail is refused", /not a JPEG/.test(thumbProblem("https://thumb.wikimedia.org/a/960px-B.png?x=1") || ""));
check("plain HTTP is refused", /HTTPS/.test(thumbProblem("http://thumb.wikimedia.org/a/960px-B.jpg") || ""));
check("a camera inside the box is inside", inBox(1.285198, 103.860720, SRC.bbox));
check("a camera a kilometre north is outside", !inBox(1.295, 103.860720, SRC.bbox));
check("a box that is not four numbers verifies nothing", !inBox(1.285, 103.86, [1, 2, 3]));

/* ---- one source, one page, to a record ---- */
{
  const r = toRecord(SRC, page(), today);
  check("a clean Featured Picture becomes a record with no problems", r.problems.length === 0, r.problems.join("; "));
  check("its credit is the author's name as Commons gives it", r.record && r.record.credit === "Basile Morin");
  check("its licence is the site's spelling", r.record && r.record.licence === "CC-BY-SA-4.0");
  check("its source is the Commons file page", r.record && /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(r.record.sourceUrl));
  check("its place is printed only because the camera was where the caption says", r.record && r.record.verified === true && r.record.place === SRC.place);
  check("its dimensions are carried, so the page reserves the space", r.record && r.record.width === 960 && r.record.height === 640);
}
{
  const r = toRecord(SRC, page({}, { Artist: { value: "This photo was taken by A. Person. Please contact me before commercial use." } }), today);
  check("an author's added conditions refuse the photo", r.problems.some((p) => /conditions/.test(p)), r.problems.join("; "));
}
{
  const r = toRecord(SRC, page({}, { GPSLatitude: { value: "25.2268" }, GPSLongitude: { value: "55.3401" } }), today);
  check("a caption naming Singapore on a photo taken in Dubai is refused", r.problems.some((p) => /outside the declared box/.test(p)), r.problems.join("; "));
}
{
  const r = toRecord(SRC, page({}, { GPSLatitude: undefined, GPSLongitude: undefined }), today);
  check("a place with no camera position to check it against is refused", r.problems.some((p) => /no camera position/.test(p)), r.problems.join("; "));
}
{
  const r = toRecord(SRC, page({}, { LicenseShortName: { value: "CC BY-NC-SA 4.0" } }), today);
  check("a NonCommercial file is refused", r.problems.some((p) => /licence/.test(p)), r.problems.join("; "));
}
{
  const r = toRecord(SRC, page({ categories: [{ title: "Category:Deletion requests October 2026" }] }), today);
  check("a file Commons is considering deleting is refused", r.problems.some((p) => /under review/.test(p)));
}
{
  const r = toRecord(SRC, { title: SRC.commons, missing: true }, today);
  check("a deleted file is a definitive no, not a network blip", r.gone === true);
}
{
  const r = toRecord(SRC, page(), today, { commonsSha1: "aaaa1111", retrievedAt: "2026-09-01" });
  check("the date obtained survives a re-check of the same file", r.record.retrievedAt === "2026-09-01" && r.record.checkedAt === today);
  const r2 = toRecord(SRC, page(), today, { commonsSha1: "changed", retrievedAt: "2026-09-01" });
  check("a file that changed on Commons is dated afresh", r2.record.retrievedAt === today);
}

/* ---- the whole run, in a scratch copy of the content tree ---- */
function scratch(sources, manifest = { photos: [] }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "phototest-"));
  fs.mkdirSync(path.join(dir, "content/photos"), { recursive: true });
  fs.writeFileSync(path.join(dir, "content/photo-sources.json"), JSON.stringify({ sources }));
  fs.writeFileSync(path.join(dir, "content/photos.json"), JSON.stringify(manifest));
  fs.writeFileSync(path.join(dir, "content/status.json"), JSON.stringify({ runs: [] }));
  return dir;
}
const quiet = () => {};
function stub({ pageFor = () => page(), image = JPEG, apiFails = false, imageFails = false } = {}) {
  const calls = [], agents = [];
  const f = async (url, opts = {}) => {
    const u = String(url); calls.push(u); agents.push((opts.headers || {})["User-Agent"] || "");
    if (u.startsWith("https://commons.wikimedia.org/w/api.php")) {
      if (apiFails) throw new Error("ECONNRESET");
      return { ok: true, status: 200, json: async () => ({ query: { pages: [pageFor()] } }) };
    }
    if (/^https:\/\/(thumb|upload)\.wikimedia\.org\//.test(u)) {
      if (imageFails) return { ok: false, status: 503 };
      return { ok: true, status: 200, arrayBuffer: async () => image.buffer.slice(image.byteOffset, image.byteOffset + image.length) };
    }
    throw new Error("unexpected url " + u);
  };
  f.calls = calls; f.agents = agents;
  return f;
}
const manifestOf = (dir) => JSON.parse(fs.readFileSync(path.join(dir, "content/photos.json"), "utf8")).photos;
const statusOf = (dir) => JSON.parse(fs.readFileSync(path.join(dir, "content/status.json"), "utf8")).runs[0];

{
  const dir = scratch([SRC]);
  const f = stub();
  const r = await run({ root: dir, fetchImpl: f, today, log: quiet });
  check("a clean run publishes the photograph", r.status === "ok" && manifestOf(dir).length === 1);
  check("and writes the file the manifest names", fs.existsSync(path.join(dir, "content/photos", SRC.file)));
  check("and records itself in status.json", statusOf(dir).job === "fetch-photos" && statusOf(dir).status === "ok");
  check("and identifies itself to Wikimedia rather than posing as a browser",
    f.agents.length > 0 && f.agents.every((a) => /^InvestmentsPlaybook\/\d/.test(a) && !/Mozilla/.test(a)), f.agents[0]);
  const again = stub();
  await run({ root: dir, fetchImpl: again, today, log: quiet });
  check("an unchanged file is not downloaded twice", !again.calls.some((u) => /^https:\/\/(thumb|upload)\.wikimedia\.org\//.test(u)));
}
{
  const dir = scratch([SRC]);
  await run({ root: dir, fetchImpl: stub(), today: "2026-10-01", log: quiet });
  const r = await run({ root: dir, fetchImpl: stub({ apiFails: true }), today, log: quiet });
  check("Commons being down keeps yesterday's photograph up", manifestOf(dir).length === 1 && r.status === "ok");
  check("and says so", /kept \(Commons unreachable/.test(statusOf(dir).detail));
}
{
  const dir = scratch([SRC]);
  await run({ root: dir, fetchImpl: stub(), today: "2026-10-01", log: quiet });
  const r = await run({ root: dir, fetchImpl: stub({ pageFor: () => ({ title: SRC.commons, missing: true }) }), today, log: quiet });
  check("a file deleted from Commons comes off the site on the next run", manifestOf(dir).length === 0 && r.status === "failed");
}
{
  const dir = scratch([SRC]);
  await run({ root: dir, fetchImpl: stub(), today: "2026-10-01", log: quiet });
  await run({ root: dir, fetchImpl: stub({ pageFor: () => page({}, { LicenseShortName: { value: "CC BY-NC 4.0" } }) }), today, log: quiet });
  check("a file relicensed NonCommercial comes off the site on the next run", manifestOf(dir).length === 0);
}
{
  const dir = scratch([SRC]);
  const r = await run({ root: dir, fetchImpl: stub({ image: Buffer.from("<html>rate limited</html>") }), today, log: quiet });
  check("an HTML error page served as the image is not published", manifestOf(dir).length === 0 && !fs.existsSync(path.join(dir, "content/photos", SRC.file)));
  check("and the run says why", /not a JPEG/.test(statusOf(dir).detail), statusOf(dir).detail);
}
{
  const dir = scratch([SRC]);
  const big = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(MAX_BYTES + 10)]);
  await run({ root: dir, fetchImpl: stub({ image: big }), today, log: quiet });
  check("an oversized download is refused rather than shipped to every reader", manifestOf(dir).length === 0);
}
{
  const dir = scratch([SRC], { photos: [{ file: "ghost.jpg", slug: "x", alt: "a b c d", credit: "c", licence: "owned", sourceUrl: "s", retrievedAt: today }] });
  // Its file is still on disk, as it would be: nothing here deletes images.
  fs.writeFileSync(path.join(dir, "content/photos/ghost.jpg"), JSON.stringify("x"));
  await run({ root: dir, fetchImpl: stub({ apiFails: true }), today, log: quiet });
  // What this proves is that the curated list is the whole truth: a photo
  // taken out of it comes off the site, even when Commons cannot be reached to
  // confirm anything. (The on-disk filter in run() is a second line here, and
  // for previews it is one of two; removing both is what the preview tests catch.)
  check("a photo removed from the curated list comes off the site, even with Commons down", !manifestOf(dir).some((p) => p.file === "ghost.jpg"));
}
{
  const dir = scratch([]);
  const r = await run({ root: dir, fetchImpl: stub(), today, log: quiet });
  check("no sources is a skip, not a failure", r.status === "skipped");
}

/* ---- previews: looked at before they are published, never published by accident ---- */
const PREV = { commons: "File:Dubai Marina in March 2022 04.jpg", file: "dubai-marina-2022.jpg", preview: true };
{
  const dir = scratch([PREV]);
  const r = await run({ root: dir, fetchImpl: stub({ pageFor: () => page({ title: PREV.commons }) }), today, log: quiet });
  check("a preview is downloaded into content/photos/preview/", fs.existsSync(path.join(dir, "content/photos/preview", PREV.file)));
  check("and is never put in the manifest, so the build cannot copy it to the site", manifestOf(dir).length === 0);
  check("and is not left in the published folder either", !fs.existsSync(path.join(dir, "content/photos", PREV.file)));
  check("a run with only previews is ok, not a failure", r.status === "ok" && /1 staged for preview/.test(statusOf(dir).detail), statusOf(dir).detail);
}
{
  const dir = scratch([PREV]);
  await run({ root: dir, fetchImpl: stub({ pageFor: () => page({ title: PREV.commons }, { Artist: { value: "A. Person. Please contact me before commercial use." } }) }), today, log: quiet });
  check("a preview whose author added conditions is not even downloaded", !fs.existsSync(path.join(dir, "content/photos/preview", PREV.file)));
}
{
  const dir = scratch([PREV]);
  await run({ root: dir, fetchImpl: stub({ pageFor: () => page({ title: PREV.commons }) }), today, log: quiet });
  fs.writeFileSync(path.join(dir, "content/photo-sources.json"), JSON.stringify({ sources: [] }));
  await run({ root: dir, fetchImpl: stub(), today, log: quiet });
  check("a preview taken out of the list is cleared from the folder", !fs.existsSync(path.join(dir, "content/photos/preview", PREV.file)));
}
{
  const dir = scratch([SRC, PREV]);
  await run({ root: dir, fetchImpl: stub({ pageFor: () => page() }), today, log: quiet });
  const m = manifestOf(dir);
  check("previews and published photos coexist: only the published one is in the manifest", m.length === 1 && m[0].file === SRC.file);
}

/* ---- the real curated list ---- */
{
  const real = JSON.parse(fs.readFileSync(path.join(root, "content/photo-sources.json"), "utf8")).sources;
  check("the curated list has at least one source", real.length > 0);
  for (const s of real) {
    check(`${s.file}: names a Commons file`, /^File:.+\.jpe?g$/i.test(s.commons || ""));
    check(`${s.file}: is a plain JPEG filename`, /^[a-z0-9][a-z0-9-]*\.jpe?g$/.test(s.file || ""));
    if (s.preview) { check(`${s.file}: a preview carries no slug, so it cannot be mistaken for a published photo`, !s.slug); continue; }
    check(`${s.file}: belongs to a page that exists`, fs.existsSync(path.join(root, "content/playbooks", `${s.slug}.md`)), s.slug);
    check(`${s.file}: its alt text describes something`, String(s.alt || "").trim().split(/\s+/).length >= 6);
    if (s.place) check(`${s.file}: a named place comes with a box to check it against`, Array.isArray(s.bbox) && s.bbox.length === 4 && s.bbox[0] < s.bbox[2] && s.bbox[1] < s.bbox[3]);
  }
  for (const s of real.filter((x) => !x.preview)) {
    // The real entry, through the real gate, against a page shaped like the
    // live API's. Catches alt text or a place name the build would refuse.
    const lat = (s.bbox ? (s.bbox[0] + s.bbox[2]) / 2 : 1.285).toFixed(6);
    const lon = (s.bbox ? (s.bbox[1] + s.bbox[3]) / 2 : 103.86).toFixed(6);
    const r = toRecord(s, page({ title: s.commons }, { GPSLatitude: { value: lat }, GPSLongitude: { value: lon } }), today);
    check(`${s.file}: the curated entry passes the site's own photo rules`, r.problems.length === 0, r.problems.join("; "));
  }
  const files = real.map((s) => s.file);
  check("no two sources write the same file", new Set(files).size === files.length);
}

/* ---- and it actually runs, every day, before the commit and the build ---- */
{
  const yml = fs.readFileSync(path.join(root, ".github/workflows/daily.yml"), "utf8");
  const at = yml.indexOf("node scripts/fetch-photos.mjs");
  check("the daily workflow runs fetch-photos", at > -1);
  check("it runs before the day's content is committed", at > -1 && at < yml.indexOf("name: Commit the day's content"));
  check("it runs before the site is built", at > -1 && at < yml.indexOf("run: node scripts/build.mjs"));
  const step = yml.slice(yml.lastIndexOf("- name:", at), at + 60);
  check("a photo failure cannot stop the site deploying", /continue-on-error:\s*true/.test(yml.slice(at, at + 120)) || /continue-on-error:\s*true/.test(step));
}

console.log(`\nphototest: ${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
