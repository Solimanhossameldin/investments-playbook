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
export function auditAccount({ site, counts, campaigns = [], automations = [] }) {
  const findings = [];
  const note = (level, kind, where, detail) => findings.push({ level, kind, where, detail });

  const wantName = String((site.mailerlite && site.mailerlite.fromName) || "");
  const wantFrom = String((site.mailerlite && site.mailerlite.from) || "");
  const phrase = String((site.brief && site.brief.phrase) || "");
  const phraseNamesATime = CLOCK.test(phrase);

  const emails = everyEmail({ campaigns, automations });

  if (!wantName) note("error", "no sender configured",
    "content/site.json", "mailerlite.fromName is empty, so nothing can be checked against it");

  for (const e of emails) {
    const live = e.live ? "live" : "not live";

    if (wantName && e.from_name !== wantName)
      note("error", "wrong sender name", e.where,
        `sends as "${e.from_name}", should be "${wantName}" (${live})`);

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
