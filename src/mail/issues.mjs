/* Recognising today's issue in an account we do not fully control.

   scripts/mail-brief.mjs used to look for a draft with exactly the name it
   would itself have used. That is only safe in an account where nothing else
   writes. This one is not: a draft named "The Dubai Signal – Daily Brief ·
   29 Aug 2026" appears every morning at 04:48 UTC from something outside this
   repository, and it is sent by hand. Matching on our own name would not have
   seen it, and the first day the job ran there would have been two drafts for
   the same date, and in send mode two issues in the same inbox.

   So an issue is recognised by what it is: a brief campaign carrying today's
   date in either spelling, or made today. */

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Both spellings the account has used: "2026-08-29" and "29 Aug 2026". */
export function dateForms(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return [iso];
  return [iso, `${d.getUTCDate()} ${MONTH[d.getUTCMonth()]} ${d.getUTCFullYear()}`];
}

export function isTodaysIssue(campaign, iso) {
  const name = String((campaign && campaign.name) || "");
  if (!/daily brief/i.test(name)) return false;
  if (dateForms(iso).some((f) => name.includes(f))) return true;
  return String((campaign && campaign.created_at) || "").slice(0, 10) === iso;
}
