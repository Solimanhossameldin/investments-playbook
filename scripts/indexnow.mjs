#!/usr/bin/env node
/* Submit the site's URLs to the engines that accept submissions.

   Run it after a deploy, never before: it verifies the key file is being
   served and spot-checks that the live site actually returns the pages the
   sitemap promises. Both guards exist because on 29 August the repository held
   147 pages and the deployed site held about forty, and submitting the
   sitemap in that state would have asked four engines to crawl a hundred 404s.

   node scripts/indexnow.mjs             submit
   node scripts/indexnow.mjs --dry-run   run every check, submit nothing */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { submission, submit, urlsFromSitemap, keyFileUrl, probeTargets } from "../src/indexnow.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));
const dry = process.argv.includes("--dry-run");
const key = site.indexnow;
const origin = site.origin;

function log(status, detail) {
  const p = path.join(root, "content/status.json");
  let s = { runs: [] };
  try { s = JSON.parse(fs.readFileSync(p, "utf8")); } catch {}
  s.runs.unshift({ job: "indexnow", status, detail, ranAt: new Date().toISOString() });
  s.runs = s.runs.slice(0, 40);
  fs.writeFileSync(p, JSON.stringify(s, null, 1));
}

function stop(status, detail, code = 0) {
  log(status, detail);
  console.log(`indexnow: ${detail}`);
  process.exit(code);
}

const sitemapPath = path.join(root, "dist/sitemap.xml");
if (!fs.existsSync(sitemapPath)) stop("skipped", "no dist/sitemap.xml, run the build first");
const urls = urlsFromSitemap(fs.readFileSync(sitemapPath, "utf8"));

async function status(url) {
  try {
    const r = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(15000) });
    return { url, status: r.status, body: r.status === 200 ? await r.text() : "" };
  } catch (e) {
    return { url, status: 0, body: "", error: String(e.message || e) };
  }
}

/* GitHub Pages reports a deployment as finished slightly before every edge
   serves it, so a 404 immediately after deploy is propagation rather than an
   older build. Worth waiting out; an unreachable network is not, and neither
   is a key the protocol will not accept, so neither is retried. */
const waitFor = Number((process.argv.find((a) => a.startsWith("--wait=")) || "").split("=")[1] || 0);
const every = 15;

/* Both of these are read after the loop, so both have to outlive it. `s` was
   hoisted and `probes` was not, which threw ReferenceError on the line below
   and took the process down with an exit code and no record -- and only ever
   on the happy path, because any refusal calls stop() first. That is why it
   looked like a mystery: it failed exactly when everything else worked. */
let s, probes;
for (let elapsed = 0; ; elapsed += every) {
  const keyFile = key ? await status(keyFileUrl(origin, key)) : { status: 0 };
  probes = await Promise.all(probeTargets(urls, origin).map(status));
  s = submission({ origin, key, urls, keyFile, probes });
  if (s.ok || s.unreachable || !/not live yet|does not serve/.test(s.reason)) break;
  if (elapsed >= waitFor) break;
  console.log(`indexnow: ${s.reason}. Waiting ${every}s for the deploy to propagate.`);
  await new Promise((r) => setTimeout(r, every * 1000));
}
if (!s.ok) stop("skipped", s.reason);

console.log(`indexnow: ${s.payload.urlList.length} urls, key file served, ${probes.length} spot checks all 200`);
if (dry) stop("ok", `dry run, nothing submitted (${s.payload.urlList.length} urls ready)`);

const verdict = await submit(s.payload);
stop(verdict.ok ? "ok" : "failed", verdict.reason, verdict.ok ? 0 : 1);
