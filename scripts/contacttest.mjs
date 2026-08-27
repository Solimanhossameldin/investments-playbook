#!/usr/bin/env node
// Tests for the contact routes.
//
// These exist because of a specific failure. Until 27 August the header, the
// author band and the about page all offered to book a call, and all three
// linked to the email capture form. The disclosure page promised a
// corrections route and pointed at a page that did not have one. Nothing in
// the build objected, because a link that resolves to a real page is a valid
// link even when the label is a lie.
//
// So the checks below are not about whether a link works. They are about
// whether the site is claiming something it cannot do.

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { contactPage, routes, primaryCta, bookingUrl, emailUrl, whatsappUrl } from "../src/templates/contact.mjs";
import { page, footer, authorBand } from "../src/templates/layout.mjs";
import * as STATIC from "../content/static.mjs";

let n = 0;
const t = (name, fn) => { fn(); n++; };

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const real = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));

const withContact = (contact) => ({ ...real, contact: { ...real.contact, ...contact } });

/* ---------- the claim can never exceed the configuration ---------- */
t("with no booking configured, nothing anywhere offers to book a call", () => {
  const site = withContact({ booking: "", email: "", whatsapp: "" });
  const surfaces = { "author band": authorBand(site), footer: footer(site), "contact page": contactPage({ site }).body };
  for (const [where, html] of Object.entries(surfaces)) {
    assert.ok(!/Book a call/.test(html), `${where} offers to book a call with nothing to book`);
  }
});

t("with a booking url configured, the offer appears and points at it", () => {
  const url = "https://cal.example.com/soliman";
  const site = withContact({ booking: url });
  const cta = primaryCta(site);
  assert.equal(cta.label, "Book a call");
  assert.equal(cta.href, url);
  assert.ok(authorBand(site).includes(url), "the author band still points somewhere else");
  assert.ok(contactPage({ site }).body.includes(url), "the contact page does not list the booking route");
});

t("the fallback label is one the site can honour", () => {
  const cta = primaryCta(withContact({ booking: "" }));
  assert.equal(cta.href, "/contact/");
  assert.ok(!/call/i.test(cta.label), `the fallback still mentions a call: ${cta.label}`);
});

t("a half written booking url is treated as absent, not as a link", () => {
  for (const bad of ["cal.example.com/x", "http://cal.example.com/x", "TODO", " ", "https://"]) {
    assert.equal(bookingUrl(withContact({ booking: bad })), "", `accepted a bad booking value: ${bad}`);
    assert.equal(primaryCta(withContact({ booking: bad })).label, "Get in touch");
  }
});

t("a malformed address never becomes a mailto link", () => {
  for (const bad of ["soliman", "soliman@", "@example.com", "soliman at example.com", ""]) {
    assert.equal(emailUrl(withContact({ email: bad })), "", `accepted a bad address: ${bad}`);
  }
  assert.equal(emailUrl(withContact({ email: " a@b.co " })), "mailto:a@b.co");
});

t("a whatsapp number too short to dial is not published", () => {
  assert.equal(whatsappUrl(withContact({ whatsapp: "1234" })), "");
  assert.equal(whatsappUrl(withContact({ whatsapp: "+971 50 123 4567" })), "https://wa.me/971501234567");
});

/* ---------- every rendered route resolves ---------- */
t("no route is rendered without a usable href", () => {
  const site = withContact({ booking: "https://cal.example.com/s", email: "a@b.co", whatsapp: "+971501234567" });
  const rs = routes(site);
  assert.ok(rs.length >= 4, `expected every route configured, got ${rs.length}`);
  for (const r of rs) {
    assert.ok(r.label && r.label.trim(), "a route has no label");
    assert.ok(/^(https:\/\/|mailto:|\/)/.test(r.href), `${r.key} has an unusable href: ${r.href}`);
    assert.ok(r.note && r.note.trim().length > 20, `${r.key} has no note explaining what it is for`);
  }
});

t("the page never renders an empty route list", () => {
  // LinkedIn is a published fact rather than a configured one, so the page is
  // useful even with nothing filled in. If that ever stops being true the
  // page must say so rather than showing an empty section.
  const site = withContact({ booking: "", email: "", whatsapp: "" });
  assert.ok(routes(site).length >= 1, "with nothing configured there is no route at all");
  assert.ok(/no direct line published here yet/i.test(contactPage({ site }).body),
    "the page does not say plainly that there is no direct route");
});

/* ---------- the promise chain ---------- */
t("the disclosure page's corrections route points at a page that exists", () => {
  assert.ok(/\/contact\//.test(STATIC.disclosure), "disclosure does not link to the contact page");
  assert.ok(!/contact route on the \[about page\]/.test(STATIC.disclosure),
    "disclosure still sends readers to a page with no contact route");
});

t("the about page sends people to the contact page", () => {
  assert.ok(/\/contact\//.test(STATIC.about), "about does not link to the contact page");
});

t("the contact page honours the corrections promise in as many words", () => {
  const body = contactPage({ site: real }).body;
  for (const phrase of ["correction", "/disclosure/", "/record/"]) {
    assert.ok(body.toLowerCase().includes(phrase.toLowerCase()), `the contact page never mentions ${phrase}`);
  }
});

t("the commercial interest is declared on the page where a conversation starts", () => {
  const body = contactPage({ site: real }).body;
  assert.ok(body.includes(real.disclaimer), "the page drops the risk disclaimer");

  // Everything below is checked against the page with the boilerplate
  // disclaimer removed. The site-wide disclaimer already contains these
  // words, so testing the whole body passes even when the page itself says
  // nothing, which is exactly what happened the first time this was written.
  const own = body.split(real.disclaimer).join(" ");
  // Assert the substance, not one phrasing of it. "nothing is personal
  // investment advice" and "this is not personal investment advice" are the
  // same commitment and a regex for one of them fails on the other.
  assert.ok(/personal investment advice/i.test(own), "the page never disclaims personal advice in its own words");
  assert.ok(/solicitation/i.test(own), "the page never disclaims solicitation in its own words");
  assert.ok(/disclosure/i.test(own), "the page does not point at the disclosure standards");
  assert.ok(/commercial interest/i.test(own), "the page does not declare the commercial interest before a conversation");
});

t("the contact page is reachable from the footer of every page", () => {
  assert.ok(footer(real).includes('href="/contact/"'), "the footer does not link to the contact page");
});

/* ---------- shape ---------- */
t("the page renders cleanly and stays inside the search limits", () => {
  for (const site of [real, withContact({ booking: "https://cal.example.com/s", email: "a@b.co", whatsapp: "+971501234567" })]) {
    const p = contactPage({ site });
    assert.ok(!/NaN|undefined|null|Invalid Date/.test(p.body), "the page rendered a broken value");
    assert.equal(p.path, "/contact/");
    assert.ok(p.title.length <= 60, `title is ${p.title.length} characters`);
    assert.ok(p.description.length <= 155 && p.description.length > 40, `description is ${p.description.length} characters`);
    assert.ok(!/—|·/.test(p.body), "house style: em dash or middot on the page");
  }
});

t("the whole page renders through the layout without throwing", () => {
  const html = page({ site: real, market: { asOf: null, quotes: [] }, assets: {}, ...contactPage({ site: real }) });
  assert.ok(html.startsWith("<!doctype html>"));
  assert.ok(html.includes("Reaching the desk"));
});

console.log(`contact: ${n} checks passed, ${routes(real).length} route(s) live in the current configuration.`);
