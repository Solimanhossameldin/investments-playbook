#!/usr/bin/env node
/* Write the email to a file instead of sending it.

   `npm run mailpreview` renders the most recent brief exactly as the mailer
   would and drops it at dist/mail-preview.html. Open it in a browser. Nothing
   is sent, no key is needed, and nothing reaches MailerLite. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderBriefEmail, subjectFor } from "../src/mail/brief-email.mjs";
import playbooks from "../content/playbooks.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(fs.readFileSync(path.join(root, "content/site.json"), "utf8"));
const slugs = new Set(playbooks.map((p) => p.slug));

const dir = path.join(root, "content/briefs");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
if (!files.length) { console.log("No briefs to preview."); process.exit(0); }

const brief = JSON.parse(fs.readFileSync(path.join(dir, files[files.length - 1]), "utf8"));
const html = renderBriefEmail({ brief, site, slugs });

// Deliberately not in dist/. Anything written there is deployed, and the
// first version of this put the email on the public site as a page with no
// og:image, no skip link and no sitemap entry. The audit caught it, which is
// the audit doing exactly its job.
const out = path.join(root, "mail-preview.html");
fs.writeFileSync(out, `<!doctype html><meta charset="utf-8"><title>${subjectFor(brief)}</title>${html}`);

console.log(`Subject:  ${subjectFor(brief)}`);
console.log(`From:     ${site.mailerlite.fromName} <${site.mailerlite.from}>`);
console.log(`To:       ${site.mailerlite.briefGroupNames.join(", ")}`);
console.log(`Issue:    ${brief.date}, ${brief.items.length} items`);
console.log(`\nWritten to ${path.relative(root, out)}. Nothing was sent.`);
