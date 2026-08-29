/* IndexNow: tell the engines that participate, the moment a page is real.

   Google does not take part, and there is no way to make it crawl faster than
   it wants to. Bing, Yandex, Naver and Seznam do, they share one endpoint, and
   Bing is what DuckDuckGo and several AI answer engines read. For a site with
   145 pages that nothing on the web links to, that is the only submission
   channel that responds to a request rather than to patience.

   The protocol is deliberately small: publish a key file at the site root whose
   contents are the key, then POST the key and a list of URLs. Serving the key
   file is the proof of control, which is also what makes the guard below
   possible - a submission cannot be honest until the deploy carrying the key
   is live, and if the key file is not there yet then neither are the pages.

   Pure, so the checks can be run without the network. scripts/indexnow.mjs
   does the fetching. */

export const ENDPOINT = "https://api.indexnow.org/indexnow";

/* IndexNow accepts at most 10,000 URLs in one submission, and every URL must
   be on the host being submitted for. Anything else is rejected wholesale, so
   the filtering happens here rather than in the error log. */
export const MAX_URLS = 10000;

export function urlsFromSitemap(xml) {
  return [...String(xml || "").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

export function keyFileUrl(origin, key) {
  return `${String(origin).replace(/\/$/, "")}/${key}.txt`;
}

/* Returns { ok, reason, payload }. It refuses rather than submits whenever the
   evidence for a URL being live is missing, because a submitted 404 is worse
   than no submission: it is a request to crawl something, answered with
   nothing there. */
export function submission({ origin, key, urls, keyFile, probes }) {
  const host = String(origin || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!key) return { ok: false, reason: "no indexnow key configured" };
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) return { ok: false, reason: "the key is not in IndexNow's accepted character set" };
  if (!host) return { ok: false, reason: "no origin configured" };

  /* A machine that cannot reach the site at all is not evidence that the site
     is unpublished. The first run of this script refused with "the deploy is
     not live yet" from a VM whose egress does not include the site, which is
     the same mistake that once condemned seven working RSS feeds. Unreachable
     and 404 are different answers and get different words. */
  const kf = keyFile || {};
  const where = keyFileUrl(origin, key);
  if (!kf.status)
    return { ok: false, unreachable: true, reason: `could not reach ${where} from here${kf.error ? ` (${kf.error})` : ""}, so nothing is known about what is deployed` };
  if (kf.status !== 200)
    return { ok: false, reason: `${where} returned ${kf.status}, so the deploy carrying the key is not live yet` };
  if (String(kf.body || "").trim() !== key)
    return { ok: false, reason: `${where} is served but does not contain the key` };

  const mine = (urls || []).filter((u) => {
    try { return new URL(u).host === host; } catch { return false; }
  });
  if (!mine.length) return { ok: false, reason: "no urls on this host to submit" };

  /* Spot check. If pages the sitemap promises are not being served, the build
     that made the sitemap is not the build that is deployed, which is exactly
     the state this repository has been in for days. */
  const unreachable = (probes || []).filter((p) => !p.status);
  if (unreachable.length)
    return { ok: false, unreachable: true, reason: `could not reach ${unreachable.length} of ${probes.length} spot checks from here, so nothing is known about what is deployed` };
  const dead = (probes || []).filter((p) => p.status !== 200);
  if (dead.length)
    return { ok: false, reason: `the live site does not serve ${dead.map((d) => `${d.url} (${d.status})`).join(", ")}` };

  return {
    ok: true,
    payload: {
      host,
      key,
      keyLocation: keyFileUrl(origin, key),
      urlList: mine.slice(0, MAX_URLS),
    },
  };
}

/* Three URLs, chosen to fail loudly rather than quietly: the home page, which
   is live on any deploy, and two pages that only exist in a build newer than
   what is currently deployed. */
export function probeTargets(urls, origin) {
  const home = `${String(origin).replace(/\/$/, "")}/`;
  const deep = urls.filter((u) => u !== home);
  const pick = [deep.find((u) => /\/start\//.test(u)), deep.find((u) => /\/playbooks\//.test(u))];
  return [home, ...pick.filter(Boolean)].slice(0, 3);
}
