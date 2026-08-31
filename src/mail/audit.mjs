/* Audit the MailerLite account against the repository's own facts.

   The site has checks that will not let it publish a stale count or a cadence
   it is not keeping. The mailing list had none, and it showed: on 29 August
   every one of the sixteen automation emails was set to send from "TOP MASTERS
   REAL ESTATE L. L. C", a different business, while the sent campaigns were
   correctly from "The Dubai Signal". Nothing in the account can notice that,
   because MailerLite has no opinion about which company the account belongs to.

   This module has that opinion. It is pure: it takes what the API returned and
   what the repository knows, and returns findings. scripts/mailaudit.mjs does
   the fetching. Keeping them apart is what lets the test run the real checks
   against the real defect without touching the network.

   The rule it enforces is the same one the site lives under: a claim made to a
   reader is a promise the build should not let us break. An envelope naming the
   wrong company is that, at the worst possible moment, on the first email a new
   subscriber ever receives. */

const WORD = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

export function spell(n) {
  if (n < 20) return WORD[n];
  const t = Math.floor(n / 10), u = n % 10;
  return u ? `${TENS[t]}-${WORD[u]}` : TENS[t];
}

/* Returns a number, or null when the text is not one we can read. Digits count:
   a subject line saying "67 frameworks" is as stale as one saying "sixty-seven"
   when the number is wrong. */
export function readNumber(text) {
  const s = String(text || "").toLowerCase().trim().replace(/\s+/g, " ");
  if (/^\d+$/.test(s)) return Number(s);
  const i = WORD.indexOf(s);
  if (i >= 0) return i;
  const m = s.match(/^([a-z]+)[- ]([a-z]+)$/);
  if (m) {
    const t = TENS.indexOf(m[1]), u = WORD.indexOf(m[2]);
    if (t > 1 && u > 0 && u < 10) return t * 10 + u;
  }
  const t = TENS.indexOf(s);
  return t > 1 ? t * 10 : null;
}

/* What a subject line may claim a count of, and which count it must match. */
const COUNTED = [
  [/\b([a-z-]+|\d+)\s+frameworks?\b/gi, "frameworks"],
  [/\b([a-z-]+|\d+)\s+(?:calculators?|tools)\b/gi, "calculators"],
];

const CLOCK = /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i;

/* Every email in the account, campaigns and automation steps alike, flattened
   so the checks below do not have to care which shape it arrived in. Automation
   emails live on the step, campaigns on the campaign; both carry from,
   from_name, subject and is_designed. */
export function everyEmail({ campaigns = [], automations = [] } = {}) {
  const out = [];
  for (const c of campaigns) {
    const e = (c.emails && c.emails[0]) || c;
    out.push({
      where: `campaign "${c.name || e.name || c.id}"`,
      id: String(c.id),
      live: c.status !== "draft",
      from: e.from,
      from_name: e.from_name,
      subject: e.subject || c.name,
      is_designed: e.is_designed,
      content: e.content,
    });
  }
  for (const a of automations) {
    for (const s of a.steps || []) {
      if (s.type !== "email") continue;
      const e = s.email || s;
      out.push({
        where: `automation "${a.name}" -> "${s.subject || s.name}"`,
        id: String(s.id),
        live: !!a.enabled,
        from: s.from ?? e.from,
        from_name: s.from_name ?? e.from_name,
        subject: s.subject || s.name,
        is_designed: e.is_designed,
        content: e.content,
      });
    }
  }
  return out;
}

/* site:       content/site.json
   counts:     { frameworks, calculators } read from the content arrays
   campaigns:  whatever /campaigns returned
   automations: whatever /automations returned, steps included

   Returns { findings, examined }. `examined` exists so a run that found nothing
   can be told apart from a run that looked at nothing, which is the way these
   checks fail in practice. */
export function auditAccount({ site, counts, campaigns = [], automations = [], today }) {
  const findings = [];
  const note = (level, kind, where, detail) => findings.push({ level, kind, where, detail });

  const ml = site.mailerlite || {};
  const wantName = String(ml.fromName || "");
  /* An account mid-rename legitimately carries two names at once: the daily
     brief still goes out as the old one, while everything that cannot reach a
     subscriber before the announcement already uses the new one. A check that
     insisted on a single name would fire on the intended state, which is how a
     check stops being read. senderNames is the set that is allowed; fromName,
     what the mailer itself sends as, must be one of them. Delete the old entry
     on the day the announcement goes and this tightens by itself. */
  const allowed = Array.isArray(ml.senderNames) && ml.senderNames.length
    ? ml.senderNames.map(String)
    : (wantName ? [wantName] : []);
  const wantFrom = String((site.mailerlite && site.mailerlite.from) || "");
  const phrase = String((site.brief && site.brief.phrase) || "");
  const domain = String(site.domain || "");
  const phraseNamesATime = CLOCK.test(phrase);

  const emails = everyEmail({ campaigns, automations });

  if (!wantName) note("error", "no sender configured",
    "content/site.json", "mailerlite.fromName is empty, so nothing can be checked against it");
  else if (allowed.length && !allowed.includes(wantName))
    note("error", "sender not in the allowed set", "content/site.json",
      `mailerlite.fromName is "${wantName}", which is not one of ${JSON.stringify(allowed)}`);

  for (const e of emails) {
    const live = e.live ? "live" : "not live";

    if (allowed.length && !allowed.includes(e.from_name))
      note("error", "wrong sender name", e.where,
        `sends as "${e.from_name}", should be one of ${allowed.map((n) => `"${n}"`).join(" or ")} (${live})`);

    if (wantFrom && e.from && e.from !== wantFrom)
      note("error", "wrong sender address", e.where,
        `sends from ${e.from}, should be ${wantFrom} (${live})`);

    if (e.is_designed === false)
      note("error", "email has no content", e.where,
        `never designed, so it would send the empty fallback (${live})`);

    const subject = String(e.subject || "");

    for (const [re, what] of COUNTED) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(subject))) {
        const said = readNumber(m[1]);
        if (said === null) continue;
        const actual = counts[what];
        if (typeof actual === "number" && said !== actual)
          note("error", "stale count", e.where,
            `says "${m[0].trim()}", there are ${actual} (${spell(actual)})`);
      }
    }

    if (!phraseNamesATime && CLOCK.test(subject))
      note("error", "cadence overclaimed", e.where,
        `names a time, and the site says only "${phrase}"`);

    /* The whole thesis of the project is that a newsletter with nowhere to send
       people is a newsletter that converts nothing: 228 subscribers, thirty
       percent opens, and under one percent clicks. The daily brief that has
       been going out carries exactly one link and it is a WhatsApp number, so
       the list has never once been pointed at the site it is meant to feed.
       An email we send that offers no way back is the defect, not an
       omission. Only checked when the body was actually fetched. */
    if (domain && typeof e.content === "string" && e.content && !e.content.includes(domain))
      note("error", "no way back to the site", e.where,
        `the body links nowhere on ${domain} (${live})`);
  }

  /* The cadence the site advertises, against the cadence the account kept. */
  if (today) {
    const v = cadenceHolds({ phrase, sentDates: sentIssueDates(campaigns), today });
    if (v.checked && !v.ok)
      note("error", "cadence not kept", "the site's own claim", v.reason);
  }

  for (const a of automations) {
    if (!a.enabled) continue;
    if (a.broken)
      note("error", "broken automation is running", `automation "${a.name}"`,
        "MailerLite reports it as broken and it is switched on");
    const emailsIn = (a.steps || []).filter((s) => s.type === "email").length;
    if (!emailsIn)
      note("warn", "automation sends nothing", `automation "${a.name}"`,
        "switched on with no email step");
  }

  return { findings, examined: emails.length };
}

/* Does the cadence the site advertises match the cadence it is keeping?

   Nothing has ever asked. The site prints `brief.phrase` from site.json as
   fact, and the only thing standing behind that string is that a human typed
   it. That is exactly how "every weekday at 7am GST" ended up on 140 pages
   against a record of three sends at 06:48, 17:58 and 12:03; the fix at the
   time was to stop inferring the phrase and start configuring it, which made
   it stable but no more true.

   The account knows the answer. Every issue that went out is a sent campaign
   with a date on it, so the claim can be checked against the record rather
   than trusted.

   Weekdays are Monday to Friday. The current day is excluded: an issue that
   has not gone out yet at ten in the morning is not a missed issue. */
const WEEK = 7;

export function completedWeekdays(today, count) {
  const out = [];
  const d = new Date(`${today}T00:00:00Z`);
  while (out.length < count) {
    d.setUTCDate(d.getUTCDate() - 1);
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

/* Returns { checked, kept, missed, ok, reason } - or { checked: 0 } when the
   phrase makes no claim this can test. */
export function cadenceHolds({ phrase, sentDates, today, window: w = 10 }) {
  const p = String(phrase || "").toLowerCase();
  const everyDay = /\bevery\s+weekday\b/.test(p);
  const most = /\bmost\b/.test(p);
  if (!everyDay && !most) return { checked: 0 };

  const days = completedWeekdays(today, w);
  const sent = new Set(sentDates || []);
  const kept = days.filter((d) => sent.has(d));
  const missed = days.filter((d) => !sent.has(d));

  if (everyDay && missed.length)
    return { checked: days.length, kept: kept.length, missed, ok: false,
      reason: `the site says "${phrase}" and ${missed.length} of the last ${days.length} weekdays had no issue (${missed.slice(0, 5).join(", ")})` };

  if (most && kept.length * 2 <= days.length)
    return { checked: days.length, kept: kept.length, missed, ok: false,
      reason: `the site says "${phrase}" and only ${kept.length} of the last ${days.length} weekdays had an issue` };

  return { checked: days.length, kept: kept.length, missed, ok: true };
}

/* The dates of every issue actually sent, read off the campaign names and
   send times rather than assumed. */
export function sentIssueDates(campaigns = []) {
  const out = [];
  for (const c of campaigns) {
    if (c.status !== "sent") continue;
    if (!/daily brief/i.test(String(c.name || ""))) continue;
    const when = c.finished_at || c.started_at || c.scheduled_for || c.created_at || "";
    const d = String(when).slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) out.push(d);
  }
  return [...new Set(out)];
}
