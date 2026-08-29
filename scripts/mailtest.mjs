#!/usr/bin/env node
/* The daily email.

   What makes this worth testing carefully is that it is unattended and it is
   sent to real people once a day. A defect here is not a page nobody visits,
   it is 228 inboxes.

   No network. The renderer is pure, and the job's guards are exercised by
   running the job itself with a stubbed environment, so these are the shipped
   lines rather than a description of them. */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { renderBriefEmail, subjectFor, frameworkFor, esc } from "../src/mail/brief-email.mjs";
import { isTodaysIssue, dateForms } from "../src/mail/issues.mjs";
import playbooks from "../content/playbooks.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));
const slugs = new Set(playbooks.map((p) => p.slug));

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`  pass  ${name}`); };

const brief = JSON.parse(fs.readFileSync(path.join(root, "content/briefs/2026-08-26.json"), "utf8"));
const html = renderBriefEmail({ brief, site, slugs });

/* ---------------- the rendered issue ---------------- */

t("every item reaches the email", () => {
  for (const it of brief.items) assert.ok(html.includes(esc(it.heading)), it.heading);
});

t("all three beats of each item are there, not just the headline", () => {
  for (const it of brief.items) {
    assert.ok(html.includes(esc(it.what_happened.slice(0, 40))), "what happened");
    assert.ok(html.includes(esc(it.what_it_means.slice(0, 40))), "what it means");
    assert.ok(html.includes(esc(it.what_it_means_for_you.slice(0, 40))), "for your portfolio");
  }
});

// The whole reason for doing this: three campaigns produced four clicks between
// them, because the email had nowhere to send anyone.
t("every item carries a link to the framework behind its own number", () => {
  const linked = brief.items.filter((it) => frameworkFor(it, slugs)).length;
  assert.equal(linked, brief.items.length, `${linked} of ${brief.items.length} items linked`);
  for (const it of brief.items) {
    const slug = frameworkFor(it, slugs);
    assert.ok(html.includes(`/playbooks/${slug}/`), slug);
  }
});

t("a framework the map points at must exist, or no link is rendered", () => {
  assert.equal(frameworkFor({ tags: ["rates"] }, new Set()), "");
});

t("every link is absolute, because an email has no origin to resolve against", () => {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const bad = hrefs.filter((h) => !/^https?:\/\//.test(h) && h !== "{$unsubscribe}");
  assert.equal(bad.length, 0, bad.join(", "));
});

t("the unsubscribe placeholder survives, because a mail without one is spam", () => {
  assert.ok(html.includes("{$unsubscribe}"));
});

t("the disclaimer travels with the issue", () => {
  assert.ok(html.includes(esc(site.disclaimer.slice(0, 60))));
});

t("the numbers block carries every figure and its note", () => {
  for (const num of brief.numbers) {
    assert.ok(html.includes(esc(num.label)), num.label);
    assert.ok(html.includes(esc(num.value)), num.value);
  }
});

t("a correction, when there is one, is not quietly dropped", () => {
  assert.ok(html.includes(esc(brief.correction.slice(0, 40))));
});

t("clicks are attributable, so which issue produced a signup is knowable",
  () => assert.ok(html.includes("utm_source=brief")));

t("nothing is styled by a stylesheet the client will not load", () => {
  assert.ok(!/<style/i.test(html), "a <style> block will be stripped by several clients");
  assert.ok(!/class=/i.test(html), "class attributes have nothing to match against here");
});

t("a hostile figure in the source data cannot inject markup", () => {
  const nasty = { ...brief, title: '</td></tr></table><script>alert(1)</script>' };
  const out = renderBriefEmail({ brief: nasty, site, slugs });
  assert.ok(!out.includes("<script>"), "unescaped markup reached the email");
  assert.ok(out.includes("&lt;script&gt;"));
});

/* ---------------- the subject line ---------------- */

t("a usable subject from the model is used as written",
  () => assert.equal(subjectFor({ subject: "Rents fell for the first time in five years", title: "T" }),
                     "Rents fell for the first time in five years"));

t("a missing, empty or absurd subject falls back to the title rather than inventing one", () => {
  assert.equal(subjectFor({ title: "The curve and the keys" }), "The curve and the keys");
  assert.equal(subjectFor({ subject: "  ", title: "The curve and the keys" }), "The curve and the keys");
  assert.equal(subjectFor({ subject: "x".repeat(400), title: "The curve and the keys" }), "The curve and the keys");
});

/* ---------------- the guards, by running the job ---------------- */

function run(env) {
  try {
    return { out: execFileSync("node", [path.join(root, "scripts/mail-brief.mjs")], {
      env: { ...process.env, MAILERLITE_API_KEY: "", MAIL_MODE: "draft", ...env },
      encoding: "utf8", timeout: 30000 }), code: 0 };
  } catch (e) {
    return { out: (e.stdout || "") + (e.stderr || ""), code: e.status };
  }
}

const status = path.join(root, "content/status.json");
const keep = fs.readFileSync(status, "utf8");

t("with no brief for today it skips, and says so rather than failing", () => {
  const r = run({});
  assert.match(r.out, /No brief written for|Only \d+ of \d+ market figures|Could not read market\.json|MAILERLITE_API_KEY/);
  assert.equal(r.code, 0, "a quiet day must not fail the build");
});

t("an unknown MAIL_MODE stops rather than guessing", () => {
  const r = run({ MAIL_MODE: "blast" });
  assert.match(r.out, /must be draft, schedule or send/);
  assert.equal(r.code, 1);
});

// The guard that matters most: without a key it must not pretend to have sent.
t("without a key it never claims to have sent anything", () => {
  const r = run({ MAILERLITE_API_KEY: "" });
  assert.ok(!/\bSent\b/.test(r.out), r.out.slice(0, 120));
});

t("every outcome is written to the status file the data page publishes", () => {
  run({});
  const s = JSON.parse(fs.readFileSync(status, "utf8"));
  assert.equal(s.runs[0].job, "mail-daily-brief");
  assert.ok(s.runs[0].status && s.runs[0].detail);
});

fs.writeFileSync(status, keep);

t("it ships in draft, so switching it on is a deliberate act", () => {
  const src = fs.readFileSync(path.join(root, "scripts/mail-brief.mjs"), "utf8");
  assert.match(src, /MAIL_MODE \|\| "draft"/);
});

// The first version wrote the preview into dist/, which is the deployed
// directory, so the email would have shipped as a public page. The audit
// caught it. This keeps it caught.
t("the preview is never written into the deployed output", () => {
  const src = fs.readFileSync(path.join(root, "scripts/mail-preview.mjs"), "utf8");
  assert.ok(!/path\.join\(root, "dist/.test(src), "the preview is being written into dist/");
  assert.match(fs.readFileSync(path.join(root, ".gitignore"), "utf8"), /mail-preview\.html/);
});

t("both lists are configured: the existing readers and the site's own signups", () => {
  assert.equal(site.mailerlite.briefGroups.length, 2);
  for (const g of site.mailerlite.briefGroups) assert.match(String(g), /^\d{15,}$/);
});


/* ---------------- not sending the same day twice ----------------

   Something outside this repository drops a draft named "The Dubai Signal –
   Daily Brief · 29 Aug 2026" into the account each morning. The guard used to
   match our own exact name and would have walked straight past it. */

t("today's issue is recognised in either spelling of the date", () => {
  const iso = "2026-08-29";
  assert.equal(isTodaysIssue({ name: "The Dubai Signal – Daily Brief · 2026-08-29" }, iso), true);
  assert.equal(isTodaysIssue({ name: "The Dubai Signal – Daily Brief · 29 Aug 2026" }, iso), true);
  assert.deepEqual(dateForms(iso), ["2026-08-29", "29 Aug 2026"]);
});

t("a brief made today counts even if its name says nothing about the date", () => {
  assert.equal(isTodaysIssue({ name: "Daily Brief", created_at: "2026-08-29 04:48:58" }, "2026-08-29"), true);
  assert.equal(isTodaysIssue({ name: "Daily Brief", created_at: "2026-08-28 04:48:58" }, "2026-08-29"), false);
});

t("yesterday's issue is not today's", () => {
  assert.equal(isTodaysIssue({ name: "The Dubai Signal – Daily Brief · 28 Aug 2026" }, "2026-08-29"), false);
  assert.equal(isTodaysIssue({ name: "The Dubai Signal – Daily Brief · 2026-08-28" }, "2026-08-29"), false);
});

t("a campaign that is not the brief is never mistaken for it", () => {
  assert.equal(isTodaysIssue({ name: "Rename and site announcement", created_at: "2026-08-29 10:00:00" }, "2026-08-29"), false);
  assert.equal(isTodaysIssue({ name: "", created_at: "2026-08-29 10:00:00" }, "2026-08-29"), false);
  assert.equal(isTodaysIssue({}, "2026-08-29"), false);
});

t("the month spelling is right at both ends of the year", () => {
  assert.deepEqual(dateForms("2026-01-01"), ["2026-01-01", "1 Jan 2026"]);
  assert.deepEqual(dateForms("2026-12-31"), ["2026-12-31", "31 Dec 2026"]);
});

console.log(`\nmail: ${n} checks passed. Email renders ${brief.items.length} items, all linked to a framework.`);
