/* The daily brief, as an email.

   Pure functions. No network, no environment, no clock: everything it needs
   arrives as an argument, so `mailtest` can render a real issue and assert on
   the result without a key and without sending anything to anybody.

   Email HTML is not web HTML. No stylesheet is loaded, several clients strip
   <style> blocks entirely, and layout that relies on flex or grid collapses.
   So every rule here is inline and the structure is tables, which is ugly and
   is what survives.

   The one thing this must not lose is the per-item framework link. The brief
   has been opened by roughly thirty percent of the list and clicked by one or
   two people an issue, because until now it had nowhere to send them. */

import BRIEF_FRAMEWORKS from "../../content/brief-frameworks.mjs";

const RED = "#DC0000";
const INK = "#171717";
const MUTED = "#6b6b6b";
const HAIR = "#e3e3e1";

export function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* Which framework an item belongs to. The same map the site uses, so a reader
   who clicks from the email lands on the page the site would have sent them
   to, and a renamed framework breaks both in the same place rather than one. */
export function frameworkFor(item, slugs) {
  for (const raw of item.tags || []) {
    const slug = BRIEF_FRAMEWORKS[String(raw).toLowerCase().trim()];
    if (slug && (!slugs || slugs.has(slug))) return slug;
  }
  return "";
}

export function titleFor(slug) {
  return slug.split("-").join(" ");
}

/* The subject line. The model is asked for one; where it has not produced a
   usable one the title is a truthful fallback rather than an invented hook. */
export function subjectFor(brief) {
  const s = String(brief.subject || "").trim();
  if (s.length >= 12 && s.length <= 120) return s;
  return String(brief.title || "The Dubai Signal").trim();
}

function numbersTable(numbers = []) {
  if (!numbers.length) return "";
  const rows = numbers.map((n, i) => `
    <tr>
      <td style="padding:9px 12px;border-bottom:1px solid ${HAIR};font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${INK}">${esc(n.label)}</td>
      <td style="padding:9px 12px;border-bottom:1px solid ${HAIR};font-family:'Courier New',monospace;font-size:13px;color:${INK};text-align:right;white-space:nowrap">${esc(n.value)}</td>
      <td style="padding:9px 12px;border-bottom:1px solid ${HAIR};font-family:Helvetica,Arial,sans-serif;font-size:12px;color:${MUTED}">${esc(n.note || "")}</td>
    </tr>`).join("");
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid ${HAIR};margin:0 0 34px">
    <tr><td colspan="3" style="padding:10px 12px;background:${INK};color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.14em;text-transform:uppercase">The numbers</td></tr>
    ${rows}
  </table>`;
}

function itemBlock(item, n, origin, slugs) {
  const slug = frameworkFor(item, slugs);
  const link = slug
    ? `<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px">
         <a href="${origin}/playbooks/${esc(slug)}/?utm_source=brief&amp;utm_medium=email&amp;utm_campaign=daily" style="color:${RED};text-decoration:none;font-weight:bold">The arithmetic behind this &rarr; ${esc(titleFor(slug))}</a>
       </p>`
    : "";
  const para = (label, text) => text
    ? `<p style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.62;color:${INK}">
         <span style="font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED};display:block;margin-bottom:5px">${esc(label)}</span>${esc(text)}</p>`
    : "";
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 34px">
    <tr><td>
      <p style="margin:0 0 4px;font-family:'Courier New',monospace;font-size:12px;color:${RED}">${n}</p>
      <h2 style="margin:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:1.3;color:${INK};font-weight:normal">${esc(item.heading)}</h2>
      ${para("What happened", item.what_happened)}
      ${para("What it means", item.what_it_means)}
      ${para("What it means for your portfolio", item.what_it_means_for_you)}
      ${link}
    </td></tr>
  </table>`;
}

function calendarBlock(calendar = []) {
  if (!calendar.length) return "";
  const rows = calendar.map((c) => `
    <tr><td style="padding:6px 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:${INK}"><strong>${esc(c.day)}</strong> &nbsp;${esc(c.event)}</td></tr>`).join("");
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 34px;border-top:2px solid ${INK};padding-top:8px">
    <tr><td style="padding:12px 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;color:${MUTED}">The week ahead</td></tr>
    ${rows}
  </table>`;
}

export function renderBriefEmail({ brief, site, slugs }) {
  const origin = String(site.origin || "").replace(/\/$/, "");
  const items = (brief.items || []).map((it, i) => itemBlock(it, i + 1, origin, slugs)).join("");
  const correction = brief.correction
    ? `<p style="margin:0 0 26px;padding:12px 14px;background:#fdf3f3;border-left:3px solid ${RED};font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:${INK}"><strong>Correction.</strong> ${esc(brief.correction)}</p>`
    : "";

  return `<div style="background:#fbfbf9;padding:0;margin:0">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbfbf9">
 <tr><td align="center" style="padding:0 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff">

   <tr><td style="background:#000000;padding:16px 24px">
     <a href="${origin}/?utm_source=brief&amp;utm_medium=email&amp;utm_campaign=daily" style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#ffffff;text-decoration:none;letter-spacing:0.02em">Investments <b style="color:#ff4d4d">Playbook</b></a>
   </td></tr>

   <tr><td style="padding:30px 24px 0">
     <p style="margin:0 0 8px;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:${MUTED}">The Dubai Signal &nbsp;&middot;&nbsp; ${esc(brief.date)} &nbsp;&middot;&nbsp; ${esc(brief.readMinutes || 3)} min</p>
     <h1 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.22;color:${INK};font-weight:normal">${esc(brief.title)}</h1>
     <p style="margin:0 0 28px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.55;color:${MUTED}">${esc(brief.subtitle)}</p>
     ${correction}
     ${numbersTable(brief.numbers)}
     ${items}
     ${calendarBlock(brief.calendar)}

     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 30px">
      <tr><td align="center" style="padding:22px 0;border-top:1px solid ${HAIR};border-bottom:1px solid ${HAIR}">
        <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:${INK}">Sixty-seven frameworks, eight calculators, and where each one stops working.</p>
        <a href="${origin}/start/?utm_source=brief&amp;utm_medium=email&amp;utm_campaign=daily" style="display:inline-block;background:${RED};color:#ffffff;text-decoration:none;padding:12px 22px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:bold;letter-spacing:0.1em;text-transform:uppercase">Find your starting point</a>
      </td></tr>
     </table>

     <p style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:${INK}">${esc(brief.author || site.author?.name || "")}</p>
   </td></tr>

   <tr><td style="padding:20px 24px 30px;border-top:1px solid ${HAIR}">
     <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:11.5px;line-height:1.65;color:${MUTED}">${esc(site.disclaimer || "")}</p>
     <p style="margin:14px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:11.5px;color:${MUTED}">
       <a href="{$unsubscribe}" style="color:${MUTED}">Unsubscribe</a> &nbsp;&middot;&nbsp;
       <a href="${origin}/data/?utm_source=brief&amp;utm_medium=email&amp;utm_campaign=daily" style="color:${MUTED}">Where these figures come from</a>
     </p>
   </td></tr>

  </table>
 </td></tr>
</table>
</div>`;
}
