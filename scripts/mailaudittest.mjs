#!/usr/bin/env node
/* Prove the mailing-list audit, by breaking each thing it guards.

   The fixtures are the shape the MailerLite API actually returns, not a
   convenient one: an automation email carries `from_name` on the step and
   again on the nested `email` object, and `is_designed` only on the nested
   one. The first fixture below is the account as it was found on 29 August,
   defect included, so at least one case here is a real regression test rather
   than an invention. */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditAccount, everyEmail, readNumber, spell } from "../src/mail/audit.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0;
const fails = [];
const ok = (name, cond, detail = "") => {
  if (cond) pass++;
  else fails.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

const SITE = {
  mailerlite: { from: "soliman.hossameldin.aly@gmail.com", fromName: "The Dubai Signal" },
  brief: { phrase: "most weekday mornings" },
};
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
      s.from_name = "TOP MASTERS REAL ESTATE L. L. C";
      s.email.from_name = "TOP MASTERS REAL ESTATE L. L. C";
    }
  const found = auditAccount(a).findings.filter((f) => f.kind === "wrong sender name");
  ok("every automation email sending as another company is caught", found.length === 4, `${found.length} of 4`);
  ok("and the campaign, which was correct, is not", !found.some((f) => f.where.startsWith("campaign")));
  ok("and the finding names the wrong sender", found[0] && found[0].detail.includes("TOP MASTERS"));
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

console.log(`mailaudittest: ${pass} passed, ${fails.length} failed`);
for (const f of fails) console.log(`  FAIL ${f}`);
process.exit(fails.length ? 1 : 0);
