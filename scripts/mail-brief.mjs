#!/usr/bin/env node
/* Send the day's brief to the list.

   This is the piece that was missing. The Action already generates a brief
   into content/briefs/ and the site already publishes it; nothing carried it
   to MailerLite, so every issue that went out was built by hand in the
   dashboard. Three went out in the week before this was written, on 24, 25
   and 28 August, at 06:48, 17:58 and 12:03.

   MAIL_MODE decides what this does, and it ships as `draft`:

     draft     build the campaign and stop. Nothing is sent. Look at it in
               MailerLite, and if it is right, change the mode.
     schedule  build it and schedule it for MAIL_AT, Gulf time, today.
     send      build it and send it now.

   It defaults to draft on purpose. Pointing an unattended job at 228 real
   people is not something to switch on and hope; the first few should be
   looked at. Changing the repository variable is a ten second job and needs
   no code change.

   It refuses to send rather than send something wrong:

     - no brief written for today            skip
     - a campaign already exists for today   skip, so a re-run cannot double send
     - the brief has fewer than three items  skip
     - the market data is stale              skip, because the numbers block
                                             would be quoting yesterday as today
     - no API key                            skip

   Every outcome is written to status.json, which the data page publishes, so
   a silent skip is still visible. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderBriefEmail, subjectFor } from "../src/mail/brief-email.mjs";
import playbooks from "../content/playbooks.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://connect.mailerlite.com/api";
const KEY = process.env.MAILERLITE_API_KEY;
const MODE = (process.env.MAIL_MODE || "draft").toLowerCase();
const AT = process.env.MAIL_AT || "07:00";

const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));
const slugs = new Set(playbooks.map((p) => p.slug));

function log(status, detail) {
  const p = path.join(root, "content/status.json");
  let s = { runs: [] };
  try { s = JSON.parse(fs.readFileSync(p, "utf8")); } catch {}
  s.runs.unshift({ job: "mail-daily-brief", status, detail, ranAt: new Date().toISOString() });
  s.runs = s.runs.slice(0, 40);
  fs.writeFileSync(p, JSON.stringify(s, null, 1));
}

function stop(status, detail, code = 0) {
  log(status, detail);
  console.log(detail);
  process.exit(code);
}

async function ml(method, url, body) {
  const r = await fetch(API + url, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(30000),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`MailerLite ${method} ${url} -> ${r.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

/* ---------------- the guards ---------------- */

if (!["draft", "schedule", "send"].includes(MODE)) {
  stop("failed", `MAIL_MODE is "${MODE}". It must be draft, schedule or send.`, 1);
}

const today = new Date().toISOString().slice(0, 10);
const briefPath = path.join(root, "content/briefs", `${today}.json`);
if (!fs.existsSync(briefPath)) {
  stop("skipped", `No brief written for ${today}, so there is nothing to send.`);
}
const brief = JSON.parse(fs.readFileSync(briefPath, "utf8"));

if (!Array.isArray(brief.items) || brief.items.length < 3) {
  stop("skipped", `The brief for ${today} has ${(brief.items || []).length} items. Not sending a partial issue.`);
}

// The numbers block is the reason people open this. Quoting stale figures as
// today's is the one mistake that would cost more than not sending at all.
try {
  const market = JSON.parse(fs.readFileSync(path.join(root, "content/market.json"), "utf8"));
  const fresh = (market.quotes || []).filter((q) => !q.stale).length;
  const total = (market.quotes || []).length;
  if (total && fresh / total < 0.5) {
    stop("skipped", `Only ${fresh} of ${total} market figures are fresh. Not mailing a numbers block that is mostly stale.`);
  }
} catch {
  stop("skipped", "Could not read market.json, so the freshness of the numbers is unknown.");
}

if (!KEY) {
  stop("skipped", "No MAILERLITE_API_KEY configured. The brief was built but not mailed.");
}

const groups = (site.mailerlite.briefGroups || []).map(String);
if (!groups.length) stop("failed", "No mailerlite.briefGroups configured in site.json.", 1);

/* ---------------- do it ---------------- */

const name = `The Dubai Signal – Daily Brief · ${today}`;

const existing = await ml("GET", `/campaigns?filter[status]=draft&limit=50`)
  .then((r) => (r.data || []).find((c) => c.name === name))
  .catch(() => null);
const alreadySent = await ml("GET", `/campaigns?filter[status]=sent&limit=25`)
  .then((r) => (r.data || []).find((c) => c.name === name))
  .catch(() => null);

if (alreadySent) {
  stop("skipped", `An issue named "${name}" has already been sent. Not sending it twice.`);
}

const html = renderBriefEmail({ brief, site, slugs });
const subject = subjectFor(brief);

const payload = {
  name,
  type: "regular",
  emails: [{
    subject,
    from_name: site.mailerlite.fromName,
    from: site.mailerlite.from,
    content: html,
  }],
  groups,
};

let campaign;
if (existing) {
  campaign = await ml("PUT", `/campaigns/${existing.id}`, payload);
  console.log(`Updated the existing draft for ${today}.`);
} else {
  campaign = await ml("POST", "/campaigns", payload);
}
const id = campaign.data?.id || campaign.id;

if (MODE === "draft") {
  stop("ok", `Draft ready for ${today}: "${subject}". Nothing sent. Set MAIL_MODE to schedule or send when you want it to go out.`);
}

// Gulf time is UTC+4 and does not observe daylight saving, so the offset is
// fixed and this needs no timezone database.
const schedule = MODE === "send"
  ? { delivery: "instant" }
  : { delivery: "scheduled", schedule: { date: today, hours: AT.split(":")[0], minutes: AT.split(":")[1] || "00", timezone_id: 143 } };

await ml("POST", `/campaigns/${id}/schedule`, schedule);
stop("ok", `${MODE === "send" ? "Sent" : `Scheduled for ${AT} GST`}: "${subject}" to ${groups.length} group(s).`);
