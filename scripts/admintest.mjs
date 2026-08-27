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
};

await t("a missing secret takes the whole thing offline", async () => {
  for (const drop of ["SESSION_SECRET", "ADMIN_PASSWORD_HASH", "MAILERLITE_API_KEY"]) {
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
  assert.ok(!body.includes("ml-secret-key-value"), "the key leaked into a response");
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

console.log(`admin: ${n} checks passed.`);
