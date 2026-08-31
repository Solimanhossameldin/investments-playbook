#!/usr/bin/env node
/* Read the MailerLite account and check it against what this repository knows.

   Read-only, always. It fetches, it reports, and it exits non-zero when
   something is wrong. It never writes to the account: sender identity and
   automation content are not the build's to change.

   Without MAILERLITE_API_KEY it prints that it had no key and exits clean, the
   same way scripts/mail-brief.mjs does, so it costs nothing until the secret is
   set.

   Run it by hand:  node scripts/mailaudit.mjs
   In the Action it belongs after the deploy, not before it, because a wrong
   sender name is not a reason to stop publishing the site. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditAccount } from "../src/mail/audit.mjs";
import playbooks from "../content/playbooks.mjs";
import { CALCULATORS } from "../src/templates/calculators.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://connect.mailerlite.com/api";
const KEY = process.env.MAILERLITE_API_KEY;

const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));
const counts = { frameworks: playbooks.length, calculators: CALCULATORS.length };

function log(status, detail) {
  const p = path.join(root, "content/status.json");
  let s = { runs: [] };
  try { s = JSON.parse(fs.readFileSync(p, "utf8")); } catch {}
  s.runs.unshift({ job: "mail-audit", status, detail, ranAt: new Date().toISOString() });
  s.runs = s.runs.slice(0, 40);
  fs.writeFileSync(p, JSON.stringify(s, null, 1));
}

if (!KEY) {
  console.log("mailaudit: no MAILERLITE_API_KEY, nothing to check");
  log("skipped", "no api key");
  process.exit(0);
}

async function ml(url) {
  const r = await fetch(API + url, {
    headers: { Authorization: `Bearer ${KEY}`, Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`MailerLite GET ${url} -> ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

/* The automations list does not carry steps; each one has to be read on its
   own, which is exactly why the defect sat there unseen. */
async function everyAutomation() {
  const out = [];
  for (let page = 1; page <= 10; page++) {
    const r = await ml(`/automations?limit=50&page=${page}`);
    const rows = r.data || [];
    for (const row of rows) out.push((await ml(`/automations/${row.id}`)).data);
    if (rows.length < 50) break;
  }
  return out;
}

/* The campaigns list omits each email's body, and the body is where the most
   expensive defect lives, so each one is read on its own. */
const campaignList = (await ml("/campaigns?limit=100")).data || [];
const campaigns = [];
for (const c of campaignList) {
  const r = await ml(`/campaigns/${c.id}`);
  campaigns.push(r.data || r);
}
const automations = await everyAutomation();

const today = new Date().toISOString().slice(0, 10);
const { findings, examined } = auditAccount({ site, counts, campaigns, automations, today });

console.log(`mailaudit: ${examined} emails across ${campaigns.length} campaigns and ${automations.length} automations`);

const errors = findings.filter((f) => f.level === "error");
const warns = findings.filter((f) => f.level === "warn");

for (const f of [...errors, ...warns])
  console.log(`  ${f.level === "error" ? "ERROR" : " warn"}  ${f.kind}: ${f.where} — ${f.detail}`);

if (!examined) {
  console.log("  ERROR  the account returned no emails at all, which is not a pass");
  log("failed", "no emails returned");
  process.exit(1);
}

if (errors.length) {
  log("failed", `${errors.length} errors, ${warns.length} warnings, ${examined} emails examined`);
  process.exit(1);
}

console.log(warns.length ? `${warns.length} warnings, no errors` : "clean");
log("ok", `${examined} emails examined, ${warns.length} warnings`);
