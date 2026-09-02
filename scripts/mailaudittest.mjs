#!/usr/bin/env node
/* Prove the mailing-list audit, by breaking each thing it guards.

   The fixtures are the shape the MailerLite API actually returns, not a
   convenient one: an automation email carries `from_name` on the step and
   again on the nested `email` object, and `is_designed` only on the nested
   one. The first fixture below is the account as it was found on 29 August,
   defect included, so at least one case here is a real regression test rather
   than an invention. */

import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditAccount, everyEmail, readNumber, spell, cadenceHolds, sentIssueDates, completedWeekdays } from "../src/mail/audit.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0;
const fails = [];
const ok = (name, cond, detail = "") => {
  if (cond) pass++;
  else fails.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

const SITE = {
  domain: "investmentsplaybook.com",
  mailerlite: { from: "soliman.hossameldin.aly@gmail.com", fromName: "The Dubai Signal" },
  brief: { phrase: "most weekday mornings" },
};

const LINKED = '<a href="https://investmentsplaybook.com/playbooks/cap-rate/">Read it</a>';
const COUNTS = { frameworks: 67, calculators: 8 };

const email = (subject, over = {}) => ({
  id: String(Math.random()).slice(2),
  type: "email",
  name: subject,
  subject,
  from: "soliman.hossameldin.aly@gmail.com",
  from_name: "The Dubai Signal",
  email: {
    from: "soliman.hossameldin.aly@gmail.com",
    from_name: "The Dubai Signal",
    subject,
    is_designed: true,
    content: `<p>${subject}</p>${LINKED}`,
  },
  ...over,
});

const automation = (name, subjects, over = {}) => ({
  id: String(Math.random()).slice(2),
  name,
  enabled: false,
  broken: false,
  steps: [{ id: "d1", type: "delay", unit: "days", value: 2 }, ...subjects.map((s) => email(s))],
  ...over,
});

const campaign = (name, over = {}) => ({
  id: String(Math.random()).slice(2),
  name,
  status: "sent",
  emails: [{
    from: "soliman.hossameldin.aly@gmail.com",
    from_name: "The Dubai Signal",
    subject: name,
    is_designed: true,
    content: `<p>${name}</p>${LINKED}`,
  }],
  ...over,
});

const clean = () => ({
  site: SITE,
  counts: COUNTS,
  campaigns: [campaign("The Dubai Signal, 28 August")],
  automations: [
    automation("IP: Daily Brief welcome", ["You are on the list. Here is what arrives, and when"]),
    automation("IP: Track, property", ["The number in the advertisement", "How empty can it get", "Two percentage points"]),
  ],
});

const kinds = (a) => auditAccount(a).findings.map((f) => f.kind);

/* ---------------- the control ---------------- */
{
  const { findings, examined } = auditAccount(clean());
  ok("a clean account reports nothing", findings.length === 0, findings.map((f) => f.kind).join(", "));
  ok("and it examined the emails", examined === 5, `examined ${examined}`);
}

/* An empty account is not a pass. This is the check that would otherwise
   report "clean" having looked at nothing at all. */
{
  const { findings, examined } = auditAccount({ site: SITE, counts: COUNTS });
  ok("an empty account examines nothing", examined === 0);
  ok("and reports no false findings either", findings.length === 0);
}

/* ---------------- the defect that prompted this ---------------- */
{
  const a = clean();
  for (const auto of a.automations)
    for (const s of auto.steps) {
      if (s.type !== "email") continue;
      s.from_name = "Unrelated Holdings L. L. C";
      s.email.from_name = "Unrelated Holdings L. L. C";
    }
  const found = auditAccount(a).findings.filter((f) => f.kind === "wrong sender name");
  ok("every automation email sending as another company is caught", found.length === 4, `${found.length} of 4`);
  ok("and the campaign, which was correct, is not", !found.some((f) => f.where.startsWith("campaign")));
  ok("and the finding names the wrong sender", found[0] && found[0].detail.includes("Unrelated Holdings"));
  ok("and says whether it is switched on", found[0] && found[0].detail.includes("not live"));
}

{
  const a = clean();
  a.automations[0].enabled = true;
  a.automations[0].steps[1].from_name = "Someone Else";
  a.automations[0].steps[1].email.from_name = "Someone Else";
  const f = auditAccount(a).findings.find((x) => x.kind === "wrong sender name");
  ok("an enabled automation is reported as live", f && f.detail.includes("(live)"), f && f.detail);
}

{
  const a = clean();
  a.automations[0].steps[1].from = "someone@example.com";
  a.automations[0].steps[1].email.from = "someone@example.com";
  ok("a wrong sender address is caught", kinds(a).includes("wrong sender address"));
}

/* ---------------- content that would send empty ---------------- */
{
  const a = clean();
  a.automations[0].steps[1].email.is_designed = false;
  const f = auditAccount(a).findings.find((x) => x.kind === "email has no content");
  ok("an email that was never designed is caught", !!f);
  ok("and a designed one is not", auditAccount(clean()).findings.length === 0);
}

/* ---------------- counts stated in a subject line ---------------- */
for (const [said, shouldFail] of [["Forty frameworks", true], ["Sixty-seven frameworks", false],
  ["40 frameworks", true], ["67 frameworks", false], ["Six tools", true], ["Eight tools", false],
  ["Eight calculators", false], ["Seven calculators", true]]) {
  const a = clean();
  a.automations[0].steps[1].subject = `${said}, and the four worth reading first`;
  a.automations[0].steps[1].email.subject = a.automations[0].steps[1].subject;
  const has = kinds(a).includes("stale count");
  ok(`"${said}" ${shouldFail ? "is" : "is not"} a stale count`, has === shouldFail);
}

{
  const a = clean();
  a.automations[0].steps[1].subject = "Forty frameworks and six tools";
  a.automations[0].steps[1].email.subject = a.automations[0].steps[1].subject;
  const f = auditAccount(a).findings.filter((x) => x.kind === "stale count");
  ok("two stale counts in one subject are two findings", f.length === 2, `${f.length}`);
  ok("and each states the real number", f.some((x) => x.detail.includes("67")) && f.some((x) => x.detail.includes("8 (eight)")));
}

/* A number that is not a count of anything the site publishes is left alone. */
{
  const a = clean();
  a.automations[0].steps[1].subject = "Two percentage points, and the same building";
  a.automations[0].steps[1].email.subject = a.automations[0].steps[1].subject;
  ok("a number that counts nothing we publish is ignored", auditAccount(a).findings.length === 0);
}

/* ---------------- cadence ---------------- */
{
  const a = clean();
  a.automations[0].steps[1].subject = "Your brief arrives every weekday at 7am GST";
  a.automations[0].steps[1].email.subject = a.automations[0].steps[1].subject;
  ok("a subject naming a time the site does not claim is caught", kinds(a).includes("cadence overclaimed"));

  a.site = { ...SITE, brief: { phrase: "every weekday at 7am GST" } };
  ok("and is allowed once the site says the same", !kinds(a).includes("cadence overclaimed"));
}

/* ---------------- automations, as automations ---------------- */
{
  const a = clean();
  a.automations[0].enabled = true;
  a.automations[0].broken = true;
  ok("a broken automation that is switched on is caught", kinds(a).includes("broken automation is running"));

  a.automations[0].broken = false;
  a.automations[0].steps = [{ id: "d", type: "delay" }];
  ok("an enabled automation with no email is a warning",
    auditAccount(a).findings.some((f) => f.kind === "automation sends nothing" && f.level === "warn"));
}

{
  const a = clean();
  a.automations[0].broken = true;
  ok("a broken automation that is switched off is not reported",
    !kinds(a).includes("broken automation is running"));
}

/* ---------------- the configuration itself ---------------- */
{
  const a = clean();
  a.site = { mailerlite: { from: "x@y.z" }, brief: { phrase: "most weekday mornings" } };
  ok("an empty fromName is itself the finding", kinds(a).includes("no sender configured"));
}

/* ---------------- reading numbers ---------------- */
for (const [text, want] of [["forty", 40], ["sixty-seven", 67], ["67", 67], ["Six", 6],
  ["  eight  ", 8], ["ninety-nine", 99], ["twelve", 12], ["hundred", null], ["", null], ["ten-four", null]])
  ok(`readNumber(${JSON.stringify(text)}) is ${want}`, readNumber(text) === want, `got ${readNumber(text)}`);

ok("spell(67) is sixty-seven", spell(67) === "sixty-seven");
ok("spell(8) is eight", spell(8) === "eight");
ok("spell(40) is forty", spell(40) === "forty");

/* ---------------- flattening ---------------- */
{
  const rows = everyEmail(clean());
  ok("campaigns and automation steps flatten together", rows.length === 5);
  ok("delay steps are not emails", rows.every((r) => r.subject));
  ok("a sent campaign counts as live", rows[0].live === true);
}

/* ---------------- the shipped job, with no key ---------------- */
{
  const env = { ...process.env };
  delete env.MAILERLITE_API_KEY;
  const before = fs.readFileSync(path.join(root, "content/status.json"), "utf8");
  const out = execFileSync("node", [path.join(root, "scripts/mailaudit.mjs")], { env, encoding: "utf8" });
  ok("with no key the job stops and says so", /no MAILERLITE_API_KEY/.test(out), out.trim());
  const after = JSON.parse(fs.readFileSync(path.join(root, "content/status.json"), "utf8"));
  ok("and the skip is written to status.json",
    after.runs[0].job === "mail-audit" && after.runs[0].status === "skipped");
  fs.writeFileSync(path.join(root, "content/status.json"), before);
}


/* ---------------- the email that leads nowhere ----------------

   The daily brief that has actually been going out to 228 people carries one
   link and it is a WhatsApp number. Thirty percent open it; under one percent
   click anything; the site it is meant to feed has never once been named in
   it. That is the defect this project exists to fix, so it is a finding. */
{
  const a = clean();
  a.automations[0].steps[1].email.content =
    '<p>Ask me what your unit would resell for</p><a href="https://wa.me/971507795060">WhatsApp</a>';
  const f = auditAccount(a).findings.find((x) => x.kind === "no way back to the site");
  ok("an email that links nowhere on the site is caught", !!f);
  ok("and it names the domain it looked for", f && f.detail.includes("investmentsplaybook.com"));
}

{
  const a = clean();
  a.campaigns[0].emails[0].content =
    '<p>Read the Playbook</p><a href="https://investmentsplaybook.com/playbook">Go</a>';
  ok("one link home is enough", !kinds(a).includes("no way back to the site"));
}

/* Both sides. Removing the campaign body from the flattened rows left every
   assertion above still passing, because nothing here had ever asked a
   campaign the question. */
{
  const a = clean();
  a.campaigns[0].emails[0].content = '<p>Ask me</p><a href="https://wa.me/971507795060">WhatsApp</a>';
  const f = auditAccount(a).findings.find((x) => x.kind === "no way back to the site");
  ok("a campaign that links nowhere is caught too", !!f);
  ok("and it is reported as the campaign, not an automation", f && f.where.startsWith("campaign"));
}

/* Bodies are not in the campaigns list, only in the per-campaign fetch. A
   missing body must not read as an email that links nowhere. */
{
  const a = clean();
  delete a.automations[0].steps[1].email.content;
  ok("an unfetched body is not treated as a failure", !kinds(a).includes("no way back to the site"));
  a.automations[0].steps[1].email.content = "";
  ok("and neither is an empty one", !kinds(a).includes("no way back to the site"));
}


/* ---------------- an account in the middle of a rename ----------------

   On 29 August the account legitimately held two sender names at once: the
   daily brief still going out as The Dubai Signal, and every automation plus
   the announcement already saying Investments Playbook, because none of those
   can reach a subscriber before the announcement does. A check insisting on
   one name would have fired on the intended state, and a check that fires on
   the intended state stops being read. */
const RENAMING = {
  ...SITE,
  mailerlite: { ...SITE.mailerlite, senderNames: ["The Dubai Signal", "Investments Playbook"] },
};

{
  const a = clean();
  a.site = RENAMING;
  a.automations[0].steps[1].from_name = "Investments Playbook";
  a.automations[0].steps[1].email.from_name = "Investments Playbook";
  ok("either name in the set is accepted while renaming", !kinds(a).includes("wrong sender name"));
}

{
  const a = clean();
  a.site = RENAMING;
  a.automations[0].steps[1].from_name = "Unrelated Holdings L. L. C";
  a.automations[0].steps[1].email.from_name = "Unrelated Holdings L. L. C";
  const f = auditAccount(a).findings.find((x) => x.kind === "wrong sender name");
  ok("a third name is still caught while renaming", !!f);
  ok("and the finding lists both permitted names",
    f && f.detail.includes("The Dubai Signal") && f.detail.includes("Investments Playbook"));
}

{
  const a = clean();
  a.site = { ...SITE, mailerlite: { ...SITE.mailerlite, fromName: "Something Else", senderNames: ["A", "B"] } };
  ok("the mailer's own name must be in the set it permits",
    kinds(a).includes("sender not in the allowed set"));
}

{
  const a = clean();
  ok("with no set configured the single name still governs",
    !kinds(a).includes("wrong sender name"));
  a.automations[0].steps[1].from_name = "Investments Playbook";
  a.automations[0].steps[1].email.from_name = "Investments Playbook";
  ok("and a second name is rejected when no set permits it",
    kinds(a).includes("wrong sender name"));
}

/* The repository's own configuration, not a fixture. */
{
  const real = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));
  const names = real.mailerlite.senderNames;
  ok("site.json lists the names the account is allowed to send as", Array.isArray(names) && names.length > 0);
  ok("and the name the mailer uses is one of them", names.includes(real.mailerlite.fromName),
    `${real.mailerlite.fromName} not in ${JSON.stringify(names)}`);
}


/* This file counts with ok(cond); the cases below read better as assertions,
   so they borrow the same counter through a thin wrapper. */
const t = (name, fn) => { try { fn(); ok(name, true); } catch (e) { ok(name, false, e.message); } };

/* ---------------- the cadence the site advertises, against the record ----------------

   Nothing had ever asked. The site prints brief.phrase as fact and the only
   thing behind that string is that a human typed it, which is how "every
   weekday at 7am GST" reached 140 pages against a record of three sends. The
   account knows the answer: every issue that went out is a sent campaign with
   a date on it. Checked here against the real record of 24, 25 and 28 August. */

const SENT = ["2026-08-24", "2026-08-25", "2026-08-28"];
const sentCampaign = (name, finished) => ({ id: String(Math.random()).slice(2), name, status: "sent", finished_at: finished });

t("weekends are not missed issues", () => {
  // 29 and 30 August 2026 are a Saturday and a Sunday.
  const days = completedWeekdays("2026-08-31", 6);
  assert.ok(!days.includes("2026-08-29") && !days.includes("2026-08-30"), days.join(" "));
  assert.equal(days[0], "2026-08-28");
});

t("today is never counted as missed, because it may still go out", () => {
  assert.ok(!completedWeekdays("2026-08-31", 6).includes("2026-08-31"));
});

t("\"most weekday mornings\" fails on the record as it actually stands", () => {
  const v = cadenceHolds({ phrase: "most weekday mornings", sentDates: SENT, today: "2026-08-31", window: 6 });
  assert.equal(v.ok, false);
  assert.equal(v.kept, 3);
  assert.match(v.reason, /only 3 of the last 6/);
});

t("and holds once most of them are kept", () => {
  const v = cadenceHolds({ phrase: "most weekday mornings", sentDates: [...SENT, "2026-08-26", "2026-08-27"], today: "2026-08-31", window: 6 });
  assert.equal(v.ok, true);
  assert.equal(v.kept, 5);
});

t("\"every weekday\" is a stricter claim and fails on one miss", () => {
  const all = completedWeekdays("2026-08-31", 6);
  assert.equal(cadenceHolds({ phrase: "every weekday at 7am GST", sentDates: all, today: "2026-08-31", window: 6 }).ok, true);
  assert.equal(cadenceHolds({ phrase: "every weekday at 7am GST", sentDates: all.slice(1), today: "2026-08-31", window: 6 }).ok, false);
});

t("a phrase that claims nothing measurable is not judged", () => {
  assert.equal(cadenceHolds({ phrase: "when there is something worth saying", sentDates: [], today: "2026-08-31" }).checked, 0);
  assert.equal(cadenceHolds({ phrase: "", sentDates: [], today: "2026-08-31" }).checked, 0);
});

t("only sent briefs count, not drafts and not other campaigns", () => {
  const cs = [
    sentCampaign("The Dubai Signal – Daily Brief · 28 Aug 2026", "2026-08-28 06:49:48"),
    { id: "1", name: "The Dubai Signal – Daily Brief · 29 Aug 2026", status: "draft", created_at: "2026-08-29 04:48:58" },
    sentCampaign("Rename and site announcement", "2026-08-27 10:00:00"),
  ];
  assert.deepEqual(sentIssueDates(cs), ["2026-08-28"]);
});

t("the audit reports it, and names the claim it is judging", () => {
  const a = clean();
  a.today = "2026-08-31";
  a.campaigns = SENT.map((d) => sentCampaign(`The Dubai Signal – Daily Brief · ${d}`, `${d} 06:49:00`));
  const f = auditAccount(a).findings.find((x) => x.kind === "cadence not kept");
  assert.ok(f, "the audit did not report a cadence the account is not keeping");
  assert.match(f.detail, /most weekday mornings/);
});

t("with no date supplied the check does not run at all", () => {
  const a = clean();
  a.campaigns = SENT.map((d) => sentCampaign(`Daily Brief · ${d}`, `${d} 06:49:00`));
  assert.ok(!kinds(a).includes("cadence not kept"));
});

console.log(`mailaudittest: ${pass} passed, ${fails.length} failed`);
for (const f of fails) console.log(`  FAIL ${f}`);
process.exit(fails.length ? 1 : 0);
