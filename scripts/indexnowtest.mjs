#!/usr/bin/env node
/* Prove the submission guards, including the one that was wrong first time.

   The whole value of this script is that it refuses in the state the site has
   actually been in for a week: a repository holding 147 pages and a deployment
   holding forty. A submission of the sitemap in that state asks four search
   engines to crawl a hundred pages that are not there. So the guards get
   tested harder than the submission does. */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { submission, urlsFromSitemap, keyFileUrl, probeTargets, MAX_URLS } from "../src/indexnow.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));

/* Half of these assertions are about what the build emits, so on a clean
   checkout there has to be a build to read. Cheaper than depending on some
   earlier suite having happened to leave one behind. */
if (!fs.existsSync(path.join(root, "dist/sitemap.xml")))
  execFileSync("node", [path.join(root, "scripts/build.mjs")], { stdio: "ignore" });

let n = 0;
const fails = [];
const t = (name, fn) => {
  try { fn(); n++; console.log(`  pass  ${name}`); }
  catch (e) { fails.push(`${name}: ${e.message}`); console.log(`  FAIL  ${name}: ${e.message}`); }
};

const KEY = "31796d29a0fb45bf910e908521071620";
const ORIGIN = "https://investmentsplaybook.com";
const URLS = [`${ORIGIN}/`, `${ORIGIN}/start/first-property/`, `${ORIGIN}/playbooks/cape/`];
const live = (over = {}) => ({
  origin: ORIGIN, key: KEY, urls: URLS,
  keyFile: { status: 200, body: KEY },
  probes: URLS.map((url) => ({ url, status: 200 })),
  ...over,
});

t("with everything live it submits", () => {
  const s = submission(live());
  assert.equal(s.ok, true, s.reason);
  assert.equal(s.payload.host, "investmentsplaybook.com");
  assert.equal(s.payload.key, KEY);
  assert.equal(s.payload.keyLocation, `${ORIGIN}/${KEY}.txt`);
  assert.equal(s.payload.urlList.length, 3);
});

/* The state this repository has been in all week. */
t("a deployment older than the sitemap is refused", () => {
  const s = submission(live({ probes: [
    { url: `${ORIGIN}/`, status: 200 },
    { url: `${ORIGIN}/start/first-property/`, status: 404 },
    { url: `${ORIGIN}/playbooks/cape/`, status: 404 },
  ] }));
  assert.equal(s.ok, false);
  assert.match(s.reason, /does not serve/);
  assert.match(s.reason, /404/);
});

t("a key file that is not deployed yet is refused", () => {
  const s = submission(live({ keyFile: { status: 404, body: "" } }));
  assert.equal(s.ok, false);
  assert.match(s.reason, /not live yet/);
});

t("a key file serving something else is refused, and says so distinctly", () => {
  const s = submission(live({ keyFile: { status: 200, body: "not the key" } }));
  assert.equal(s.ok, false);
  assert.match(s.reason, /does not contain the key/);
});

/* The mistake this script made on its first run. A VM whose egress does not
   include the site reported the site as unpublished. Unreachable is not a
   negative result, it is an absent one. */
t("unreachable is reported as unreachable, not as unpublished", () => {
  const s = submission(live({ keyFile: { status: 0, error: "fetch failed" } }));
  assert.equal(s.ok, false);
  assert.equal(s.unreachable, true);
  assert.match(s.reason, /could not reach/);
  assert.doesNotMatch(s.reason, /not live yet/);
});

t("an unreachable spot check is unreachable too, not a 404", () => {
  const s = submission(live({ probes: [{ url: URLS[0], status: 200 }, { url: URLS[1], status: 0 }] }));
  assert.equal(s.ok, false);
  assert.equal(s.unreachable, true);
  assert.match(s.reason, /could not reach/);
});

t("no key configured is refused before anything is fetched", () => {
  assert.match(submission(live({ key: "" })).reason, /no indexnow key/);
});

/* Every one of these keys is also served correctly by its own key file, so the
   character-set rule is the only thing that can reject them. Written the lazy
   way first, they were rejected by the body comparison instead and the test
   passed with the rule deleted. */
t("a key outside IndexNow's character set is refused, for that reason", () => {
  for (const bad of ["short", "has spaces in it", "sym$bols!", "a".repeat(129)]) {
    const s = submission(live({ key: bad, keyFile: { status: 200, body: bad } }));
    assert.equal(s.ok, false, bad);
    assert.match(s.reason, /character set/, `"${bad}" was rejected for the wrong reason: ${s.reason}`);
  }
  const long = "a".repeat(128);
  assert.equal(submission(live({ key: long, keyFile: { status: 200, body: long } })).ok, true);
});

t("urls on another host are dropped, not submitted", () => {
  const s = submission(live({ urls: [...URLS, "https://example.com/x", "not a url"] }));
  assert.equal(s.payload.urlList.length, 3);
  assert.ok(s.payload.urlList.every((u) => u.startsWith(ORIGIN)));
});

t("nothing on this host is a refusal rather than an empty submission", () => {
  const s = submission(live({ urls: ["https://example.com/x"] }));
  assert.equal(s.ok, false);
  assert.match(s.reason, /no urls on this host/);
});

t("a submission is capped at what IndexNow accepts", () => {
  const many = Array.from({ length: MAX_URLS + 50 }, (_, i) => `${ORIGIN}/p/${i}/`);
  assert.equal(submission(live({ urls: many })).payload.urlList.length, MAX_URLS);
});

/* ---------------- reading the build's own output ---------------- */

t("the sitemap parses, and it is the real one", () => {
  const p = path.join(root, "dist/sitemap.xml");
  assert.ok(fs.existsSync(p), "run the build first");
  const urls = urlsFromSitemap(fs.readFileSync(p, "utf8"));
  assert.ok(urls.length > 100, `only ${urls.length} urls`);
  assert.ok(urls.every((u) => u.startsWith(site.origin)), "a sitemap url is off-origin");
});

t("the key file the build writes is the key site.json configures", () => {
  assert.equal(site.indexnow, KEY);
  const p = path.join(root, `dist/${site.indexnow}.txt`);
  assert.ok(fs.existsSync(p), "the build did not write the key file");
  assert.equal(fs.readFileSync(p, "utf8").trim(), site.indexnow);
});

t("the key file is not in the sitemap, and does not stop the site being crawled", () => {
  const urls = urlsFromSitemap(fs.readFileSync(path.join(root, "dist/sitemap.xml"), "utf8"));
  assert.ok(!urls.some((u) => u.includes(site.indexnow)));
  assert.match(fs.readFileSync(path.join(root, "dist/robots.txt"), "utf8"), /Allow: \//);
});

t("the spot checks include pages that only a current deploy would serve", () => {
  const urls = urlsFromSitemap(fs.readFileSync(path.join(root, "dist/sitemap.xml"), "utf8"));
  const targets = probeTargets(urls, site.origin);
  assert.equal(targets[0], `${site.origin}/`);
  assert.equal(targets.length, 3);
  assert.ok(targets.some((u) => u.includes("/start/")), "no path page probed");
  assert.ok(targets.some((u) => u.includes("/playbooks/")), "no framework probed");
});

t("keyFileUrl does not double the slash", () => {
  assert.equal(keyFileUrl("https://x.com/", "abc"), "https://x.com/abc.txt");
  assert.equal(keyFileUrl("https://x.com", "abc"), "https://x.com/abc.txt");
});

/* ---------------- the shipped script ---------------- */

t("the shipped script refuses from a machine that cannot reach the site", () => {
  const before = fs.readFileSync(path.join(root, "content/status.json"), "utf8");
  const out = execFileSync("node", [path.join(root, "scripts/indexnow.mjs"), "--dry-run"], { encoding: "utf8" });
  assert.match(out, /indexnow:/);
  const after = JSON.parse(fs.readFileSync(path.join(root, "content/status.json"), "utf8"));
  assert.equal(after.runs[0].job, "indexnow");
  assert.ok(["ok", "skipped"].includes(after.runs[0].status), after.runs[0].status);
  fs.writeFileSync(path.join(root, "content/status.json"), before);
});

console.log(`\nindexnow: ${n} checks passed${fails.length ? `, ${fails.length} FAILED` : ""}.`);
process.exit(fails.length ? 1 : 0);
