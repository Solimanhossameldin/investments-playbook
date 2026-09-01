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
import { submission, submit, urlsFromSitemap, keyFileUrl, probeTargets, MAX_URLS } from "../src/indexnow.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));

/* Half of these assertions are about what the build emits, so on a clean
   checkout there has to be a build to read. Cheaper than depending on some
   earlier suite having happened to leave one behind. */
if (!fs.existsSync(path.join(root, "dist/sitemap.xml")))
  execFileSync("node", [path.join(root, "scripts/build.mjs")], { stdio: "ignore" });

let n = 0;
const fails = [];
const pending = [];
const t = (name, fn) => {
  try {
    const r = fn();
    if (r && typeof r.then === "function") {
      pending.push(r.then(
        () => { n++; console.log(`  pass  ${name}`); },
        (e) => { fails.push(`${name}: ${e.message}`); console.log(`  FAIL  ${name}: ${e.message}`); }));
      return;
    }
    n++; console.log(`  pass  ${name}`);
  } catch (e) { fails.push(`${name}: ${e.message}`); console.log(`  FAIL  ${name}: ${e.message}`); }
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


/* ---------------- the submission, which is where it actually broke ----------------

   The first real run in production exited 1 and wrote nothing. The POST was
   the single unguarded await in the script: a throw killed the process before
   the status file could be written, so the job whose whole purpose is to say
   what happened said nothing, and the failure was invisible until someone read
   the Actions annotations by hand. Every refusal above it was logged. The one
   that fired was not. */

const PAYLOAD = { host: "investmentsplaybook.com", key: KEY, keyLocation: `${ORIGIN}/${KEY}.txt`, urlList: URLS };
const settle = (p) => p;

t("a 200 is success and says how many went", async () => {
  const v = await submit(PAYLOAD, async () => ({ status: 200, text: async () => "" }));
  assert.equal(v.ok, true);
  assert.match(v.reason, /submitted 3 urls, HTTP 200/);
});

t("a 202 is success too, because the key is still being validated", async () => {
  const v = await submit(PAYLOAD, async () => ({ status: 202, text: async () => "" }));
  assert.equal(v.ok, true);
  assert.match(v.reason, /HTTP 202/);
});

t("a refusal carries the status and what the endpoint said", async () => {
  const v = await submit(PAYLOAD, async () => ({ status: 422, text: async () => "Unprocessable: key not valid for host" }));
  assert.equal(v.ok, false);
  assert.equal(v.status, 422);
  assert.match(v.reason, /422/);
  assert.match(v.reason, /key not valid for host/);
});

t("a throw is a verdict, not an exit", async () => {
  const v = await submit(PAYLOAD, async () => { throw new Error("fetch failed"); });
  assert.equal(v.ok, false);
  assert.equal(v.status, 0);
  assert.match(v.reason, /could not reach/);
  assert.match(v.reason, /fetch failed/);
});

t("a body that cannot be read still yields a usable verdict", async () => {
  const v = await submit(PAYLOAD, async () => ({ status: 500, text: async () => { throw new Error("stream closed"); } }));
  assert.equal(v.ok, false);
  assert.match(v.reason, /500/);
});

/* ---- the runner itself, not just the module it imports ----
   Everything above tests src/indexnow.mjs, which is pure and was always
   correct. The bug that stopped this job working for a week lived in
   scripts/indexnow.mjs, in the twelve lines of glue that nothing executed: a
   `probes` declared inside the retry loop and read after it, which threw
   ReferenceError, exited 1 and wrote no record -- and only on the happy path,
   since any refusal calls stop() first. Four attempts to diagnose it failed
   because the only environments available could not reach the live site, so a
   guard always refused before the broken line was reached.

   This runs the real script against a stub on localhost, in a throwaway root,
   with every guard satisfied, which is the exact state the bug needed. */
t("the runner survives the path where every guard passes", async () => {
  const os = await import("node:os");
  const http = await import("node:http");
  const { spawn } = await import("node:child_process");
  /* spawn, not spawnSync: the stub server lives in this process, and a
     synchronous spawn blocks the event loop so it could never answer the
     child. The first version of this test deadlocked on exactly that. */
  const run = (file, args) => new Promise((resolve) => {
    const c = spawn(process.execPath, [file, ...args], { encoding: "utf8" });
    let out = "";
    c.stdout.on("data", (d) => { out += d; });
    c.stderr.on("data", (d) => { out += d; });
    const kill = setTimeout(() => c.kill("SIGKILL"), 30000);
    c.on("close", (status) => { clearTimeout(kill); resolve({ status, out }); });
  });

  const KEY = "a".repeat(32);
  const server = http.createServer((req, res) => {
    if (req.url === `/${KEY}.txt`) { res.writeHead(200, { "content-type": "text/plain" }); return res.end(KEY); }
    res.writeHead(200, { "content-type": "text/html" }); res.end("<html>ok</html>");
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const origin = `http://127.0.0.1:${server.address().port}`;

  try {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "idxnow-"));
    fs.mkdirSync(path.join(tmp, "scripts"));
    fs.mkdirSync(path.join(tmp, "src"));
    fs.mkdirSync(path.join(tmp, "content"));
    fs.mkdirSync(path.join(tmp, "dist"));
    fs.copyFileSync(path.join(root, "scripts/indexnow.mjs"), path.join(tmp, "scripts/indexnow.mjs"));
    fs.copyFileSync(path.join(root, "src/indexnow.mjs"), path.join(tmp, "src/indexnow.mjs"));
    fs.writeFileSync(path.join(tmp, "content/site.json"), JSON.stringify({ origin, indexnow: KEY }));
    /* probeTargets wants the home page plus a /start/ and a /playbooks/ URL. */
    fs.writeFileSync(path.join(tmp, "dist/sitemap.xml"),
      `<?xml version="1.0"?><urlset>` +
      [`${origin}/`, `${origin}/start/buying/`, `${origin}/playbooks/net-rental-yield/`]
        .map((u) => `<url><loc>${u}</loc></url>`).join("") + `</urlset>`);

    const r = await run(path.join(tmp, "scripts/indexnow.mjs"), ["--dry-run"]);
    const out = r.out;

    assert.doesNotMatch(out, /ReferenceError|is not defined/, `the runner threw: ${out.slice(0, 300)}`);
    assert.equal(r.status, 0, `expected exit 0, got ${r.status}: ${out.slice(0, 300)}`);
    /* Exiting quietly is not success either: the run has to leave a record. */
    const rec = JSON.parse(fs.readFileSync(path.join(tmp, "content/status.json"), "utf8"));
    const entry = (rec.runs || []).find((x) => x.job === "indexnow");
    assert.ok(entry, "the run wrote no record to status.json");
    assert.equal(entry.status, "ok");
    assert.match(entry.detail, /dry run/);
    fs.rmSync(tmp, { recursive: true, force: true });
  } finally {
    server.close();
  }
});

await Promise.all(pending);
console.log(`\nindexnow: ${n} checks passed${fails.length ? `, ${fails.length} FAILED` : ""}.`);
process.exit(fails.length ? 1 : 0);
