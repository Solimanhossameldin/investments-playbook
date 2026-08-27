#!/usr/bin/env node
// Tests for the admin Worker's authentication.
//
// The one that matters most is cross-compatibility: the hash is made
// by node's crypto in make-admin-hash.mjs and verified by WebCrypto
// inside the Worker. If those two ever disagree, the password stops
// working and the only symptom is a locked-out owner.

import assert from "node:assert/strict";
import crypto from "node:crypto";
import { timingSafeEqual, pbkdf2, verifyPassword, makeSession, readSession } from "../admin/worker.js";

let n = 0;
const t = async (name, fn) => { await fn(); n++; };

const ITERATIONS = 210000;
const makeHash = (pw) => {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(pw, salt, ITERATIONS, 32, "sha256");
  return `pbkdf2$${ITERATIONS}$${salt.toString("base64")}$${hash.toString("base64")}`;
};

/* ---------- the hash tool and the Worker must agree ---------- */
await t("a hash made by the tool verifies inside the Worker", async () => {
  const stored = makeHash("a correct horse battery staple");
  assert.equal(await verifyPassword("a correct horse battery staple", stored), true);
});

await t("the wrong password is rejected", async () => {
  const stored = makeHash("the real password");
  assert.equal(await verifyPassword("the real passwore", stored), false);
  assert.equal(await verifyPassword("", stored), false);
  assert.equal(await verifyPassword("the real password ", stored), false);
});

await t("a malformed or absent stored hash never authenticates", async () => {
  for (const bad of ["", null, undefined, "hunter2", "pbkdf2$$$", "pbkdf2$1$aaaa$bbbb", "md5$1000$a$b", "$$$$"]) {
    assert.equal(await verifyPassword("anything", bad), false, `accepted ${JSON.stringify(bad)}`);
  }
});

await t("a low iteration count is refused rather than trusted", async () => {
  const salt = crypto.randomBytes(16);
  const weak = `pbkdf2$100$${salt.toString("base64")}$${crypto.pbkdf2Sync("x", salt, 100, 32, "sha256").toString("base64")}`;
  assert.equal(await verifyPassword("x", weak), false);
});

await t("the same password and salt give the same hash every time", async () => {
  const salt = crypto.randomBytes(16);
  const a = await pbkdf2("repeatable", salt, 20000);
  const b = await pbkdf2("repeatable", salt, 20000);
  assert.equal(a, b);
  assert.notEqual(a, await pbkdf2("repeatable", crypto.randomBytes(16), 20000));
});

/* ---------- comparison ---------- */
await t("the comparison rejects different lengths and types", () => {
  assert.equal(timingSafeEqual("abc", "abc"), true);
  assert.equal(timingSafeEqual("abc", "abd"), false);
  assert.equal(timingSafeEqual("abc", "abcd"), false);
  assert.equal(timingSafeEqual(null, "abc"), false);
  assert.equal(timingSafeEqual("abc", undefined), false);
  assert.equal(timingSafeEqual("", ""), true);
});

/* ---------- sessions ---------- */
const SECRET = crypto.randomBytes(32).toString("base64");

await t("a fresh session is accepted", async () => {
  assert.ok(await readSession(SECRET, await makeSession(SECRET)));
});

await t("a session signed with a different secret is rejected", async () => {
  const other = crypto.randomBytes(32).toString("base64");
  assert.equal(await readSession(SECRET, await makeSession(other)), null);
});

await t("an expired session is rejected", async () => {
  const past = Date.now() - 13 * 3600 * 1000;
  const token = await makeSession(SECRET, past);
  assert.equal(await readSession(SECRET, token), null);
});

await t("a tampered expiry is rejected", async () => {
  // The forgery an attacker would actually try: take a valid token and
  // push the expiry out. The signature covers it, so it must fail.
  const token = await makeSession(SECRET);
  const [v, exp, sig] = token.split(".");
  const forged = `${v}.${Number(exp) + 999999999}.${sig}`;
  assert.equal(await readSession(SECRET, forged), null);
});

await t("garbage is rejected without throwing", async () => {
  for (const bad of ["", ".", "v1.", "v1.abc.def", "nonsense", null, undefined, 12345, "v1.999999999999.", "a.b.c.d"]) {
    assert.equal(await readSession(SECRET, bad), null, `accepted ${JSON.stringify(bad)}`);
  }
});

await t("a session with no signature is rejected", async () => {
  assert.equal(await readSession(SECRET, `v1.${Date.now() + 100000}`), null);
});

/* ---------- the Worker refuses to run unconfigured ---------- */
const { default: worker } = await import("../admin/worker.js");
const call = (path, env, init = {}) =>
  worker.fetch(new Request("https://admin.example.com" + path, init), env);

const GOOD_ENV = {
  SESSION_SECRET: SECRET,
  ADMIN_PASSWORD_HASH: makeHash("the real password"),
  MAILERLITE_API_KEY: "ml-secret-key-value",
  GITHUB_TOKEN: "gh-secret-token-value",
};

await t("a missing secret takes the whole thing offline", async () => {
  for (const drop of ["SESSION_SECRET", "ADMIN_PASSWORD_HASH", "GITHUB_TOKEN"]) {
    const env = { ...GOOD_ENV, [drop]: "" };
    const r = await call("/", env);
    assert.equal(r.status, 503, `${drop} missing did not stop it`);
  }
});

await t("a short session secret is refused", async () => {
  const r = await call("/", { ...GOOD_ENV, SESSION_SECRET: "tooshort" });
  assert.equal(r.status, 503);
});

/* ---------- routing and access ---------- */
await t("the leads API refuses an unauthenticated request", async () => {
  const r = await call("/api/leads", GOOD_ENV);
  assert.equal(r.status, 401);
  const body = await r.text();
  assert.ok(!body.includes("ml-secret-key-value"), "the MailerLite key leaked into a response");
  assert.ok(!body.includes("gh-secret-token-value"), "the GitHub token leaked into a response");
});

await t("a forged cookie does not open the leads API", async () => {
  const other = crypto.randomBytes(32).toString("base64");
  const r = await call("/api/leads", GOOD_ENV, {
    headers: { cookie: `ip_admin=${await makeSession(other)}` },
  });
  assert.equal(r.status, 401);
});

await t("the root shows a login form when signed out", async () => {
  const r = await call("/", GOOD_ENV);
  const body = await r.text();
  assert.equal(r.status, 200);
  assert.ok(body.includes('name="password"'));
  assert.ok(!body.includes("ml-secret-key-value"));
  assert.ok(!body.includes(GOOD_ENV.ADMIN_PASSWORD_HASH));
});

await t("the root shows the admin when signed in", async () => {
  const r = await call("/", GOOD_ENV, { headers: { cookie: `ip_admin=${await makeSession(SECRET)}` } });
  const body = await r.text();
  assert.ok(body.includes("/api/leads"), "the admin page did not render");
  assert.ok(!body.includes('name="password"'));
});

await t("a wrong password does not set a cookie", async () => {
  const form = new FormData();
  form.set("password", "not it");
  const r = await call("/login", GOOD_ENV, { method: "POST", body: form });
  assert.equal(r.status, 401);
  assert.equal(r.headers.get("set-cookie"), null);
});

await t("the right password sets a locked-down cookie", async () => {
  const form = new FormData();
  form.set("password", "the real password");
  const r = await call("/login", GOOD_ENV, { method: "POST", body: form });
  assert.equal(r.status, 302);
  const c = r.headers.get("set-cookie") || "";
  for (const flag of ["HttpOnly", "Secure", "SameSite=Strict"]) {
    assert.ok(c.includes(flag), `the session cookie is missing ${flag}`);
  }
  const token = c.split(";")[0].split("=").slice(1).join("=");
  assert.ok(await readSession(SECRET, token), "the cookie it set is not a valid session");
});

await t("signing out clears the cookie", async () => {
  const r = await call("/logout", GOOD_ENV);
  assert.equal(r.status, 302);
  assert.ok((r.headers.get("set-cookie") || "").includes("Max-Age=0"));
});

await t("every response refuses framing and indexing", async () => {
  for (const path of ["/", "/api/leads", "/nope"]) {
    const r = await call(path, GOOD_ENV);
    assert.equal(r.headers.get("x-frame-options"), "DENY", path);
    assert.match(r.headers.get("x-robots-tag") || "", /noindex/, path);
    assert.match(r.headers.get("cache-control") || "", /no-store/, path);
  }
});

/* ---------- the editor ---------- */
import { SECTIONS, validate } from "../admin/content-schema.mjs";
import { parseEntry, serialiseEntry } from "../src/content/format.mjs";

const EDIT_ENV = GOOD_ENV;
const signedIn = async () => ({ cookie: `ip_admin=${await makeSession(SECRET)}` });

await t("the admin works before MailerLite is connected", async () => {
  const r = await call("/api/leads", { ...GOOD_ENV, MAILERLITE_API_KEY: "" }, { headers: await signedIn() });
  assert.equal(r.status, 200, "a missing MailerLite key should not break the admin");
  const d = await r.json();
  assert.deepEqual(d.leads, []);
  assert.match(d.note, /not connected yet/);
  // and the rest of the admin still works
  const s2 = await call("/", { ...GOOD_ENV, MAILERLITE_API_KEY: "" }, { headers: await signedIn() });
  assert.equal(s2.status, 200);
});

await t("the editor refuses to run without a GitHub token", async () => {
  const r = await call("/", { ...EDIT_ENV, GITHUB_TOKEN: "" });
  assert.equal(r.status, 503);
  assert.match(await r.text(), /GITHUB_TOKEN/);
});

await t("the schema is only served to someone signed in", async () => {
  assert.equal((await call("/api/sections", EDIT_ENV)).status, 401);
  const r = await call("/api/sections", EDIT_ENV, { headers: await signedIn() });
  const d = await r.json();
  assert.deepEqual(d.sections.map((s) => s.key), ["playbooks", "glossary", "pages"]);
  assert.ok(d.sections[0].fields.length > 5);
});

await t("every editable section points at a directory that exists", async () => {
  const fs = await import("node:fs");
  for (const [key, s] of Object.entries(SECTIONS)) {
    assert.ok(fs.existsSync(new URL("../" + s.dir, import.meta.url)), `${key} points at ${s.dir}, which is not there`);
  }
});

await t("every field the editor offers is one the site actually renders", async () => {
  // A field in the form that nothing reads is a control that silently
  // does nothing, which is worse than no control.
  const playbooks = (await import("../content/playbooks.mjs")).default;
  const keys = new Set(Object.keys(playbooks[0]));
  for (const f of SECTIONS.playbooks.fields) {
    assert.ok(keys.has(f.key), `the form offers "${f.key}", which no framework has`);
  }
  const glossary = (await import("../content/glossary.mjs")).default;
  const gkeys = new Set(Object.keys(glossary[0]));
  for (const f of SECTIONS.glossary.fields) {
    assert.ok(gkeys.has(f.key), `the glossary form offers "${f.key}", which no term has`);
  }
});

await t("saving is refused when not signed in", async () => {
  const r = await call("/api/save", EDIT_ENV, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ section: "playbooks", slug: "x", meta: {}, body: "" }),
  });
  assert.equal(r.status, 401);
});

await t("saving validates on the server, not just in the browser", async () => {
  // The browser can be bypassed entirely by posting here directly, so
  // an empty required field has to be caught on this side.
  const r = await call("/api/save", EDIT_ENV, {
    method: "POST",
    headers: { "content-type": "application/json", ...(await signedIn()) },
    body: JSON.stringify({
      section: "playbooks",
      slug: "net-rental-yield",
      meta: { slug: "net-rental-yield", order: 0, title: "", category: "property", tier: 1, reviewed: "x", summary: "", formula: "f", failureModes: [], whenToUse: "w", sources: [] },
      body: "some body",
      sha: "abc",
    }),
  });
  assert.equal(r.status, 422);
  const d = await r.json();
  assert.match(d.error, /Title cannot be empty/);
});

await t("a slug that could escape the content directory is refused", async () => {
  for (const slug of ["../../etc/passwd", "a/b", "UPPER", "", "with space"]) {
    const r = await call("/api/save", EDIT_ENV, {
      method: "POST",
      headers: { "content-type": "application/json", ...(await signedIn()) },
      body: JSON.stringify({ section: "playbooks", slug, meta: {}, body: "" }),
    });
    assert.equal(r.status, 400, `accepted slug ${JSON.stringify(slug)}`);
  }
});

await t("an unknown section is refused", async () => {
  const r = await call("/api/list?section=nope", EDIT_ENV, { headers: await signedIn() });
  assert.equal(r.status, 400);
});

await t("validation accepts a real entry unchanged", async () => {
  const fs = await import("node:fs");
  const file = fs.readFileSync(new URL("../content/playbooks/net-rental-yield.md", import.meta.url), "utf8");
  const { meta, body } = parseEntry(file);
  assert.deepEqual(validate("playbooks", meta, body), []);
});

await t("validation catches the mistakes an editor would actually make", () => {
  const fine = { slug: "a-b", order: 1, term: "T", definition: "d", category: "property", trap: "t", related: [] };
  assert.deepEqual(validate("glossary", fine, "body"), []);
  assert.match(validate("glossary", { ...fine, category: "invented" }, "b").join(" "), /Category must be one of/);
  assert.match(validate("glossary", { ...fine, slug: "Not A Slug" }, "b").join(" "), /slug must be lower case/);
  assert.match(validate("glossary", { ...fine, order: undefined }, "b").join(" "), /order is missing/);
  assert.match(validate("playbooks", { slug: "a", order: 1, tier: "high" }, "b").join(" "), /Tier has to be a number/);
});

await t("a source with a link that is not a web address is caught", () => {
  const base = { slug: "a", order: 1, title: "T", category: "property", tier: 1, reviewed: "r", summary: "s", formula: "f", failureModes: ["x"], whenToUse: "w" };
  assert.deepEqual(validate("playbooks", { ...base, sources: [{ name: "A", url: "https://example.com" }] }, "b"), []);
  assert.match(validate("playbooks", { ...base, sources: [{ name: "A", url: "javascript:alert(1)" }] }, "b").join(" "), /not a web address/);
  assert.match(validate("playbooks", { ...base, sources: [{ name: "", url: "https://example.com" }] }, "b").join(" "), /needs a name/);
});

await t("what the editor writes can always be read back", () => {
  // If a saved file cannot be parsed, the site stops building, and the
  // first anyone knows is a failed deploy.
  const awkward = {
    slug: "a", order: 1, title: 'Quotes " and \\ backslashes',
    category: "property", tier: 1, reviewed: "r",
    summary: "A summary — with an em dash", formula: "line one\nline two",
    failureModes: ["one\ntwo", "three"], whenToUse: "w",
    sources: [{ name: "S", url: "https://x.test" }],
  };
  const body = "Body with\n\n---\n\na rule and `code`.";
  const back = parseEntry(serialiseEntry(awkward, body));
  assert.deepEqual(back.meta, awkward);
  assert.equal(back.body, body);
});

/* ---------- the file that actually gets pasted ---------- */
await t("the bundle behaves the same as the source", async () => {
  const bundled = await import("../admin/worker.bundled.js");
  const r = await bundled.default.fetch(new Request("https://admin.example.com/api/sections"), EDIT_ENV);
  assert.equal(r.status, 401, "the bundle does not enforce sign-in");

  const ok = await bundled.default.fetch(
    new Request("https://admin.example.com/api/sections", { headers: await signedIn() }),
    EDIT_ENV
  );
  assert.equal(ok.status, 200);
  assert.deepEqual((await ok.json()).sections.map((s) => s.key), ["playbooks", "glossary", "pages"]);
});

await t("the bundle carries no import statement", async () => {
  const fs = await import("node:fs");
  const text = fs.readFileSync(new URL("../admin/worker.bundled.js", import.meta.url), "utf8");
  assert.ok(!/^\s*import\s/m.test(text), "an import survived, so Cloudflare would reject it");
  assert.ok(/export default\s*\{/.test(text), "no default export");
});

await t("the bundle is current", async () => {
  // A stale bundle is the worst kind of bug here: the code is fixed and
  // the deployed Worker is not.
  const fs = await import("node:fs");
  const src = new URL("../admin/worker.js", import.meta.url);
  const out = new URL("../admin/worker.bundled.js", import.meta.url);
  assert.ok(
    fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs,
    "admin/worker.js is newer than the bundle. Run: npm run buildadmin"
  );
});

console.log(`admin: ${n} checks passed in total.`);
