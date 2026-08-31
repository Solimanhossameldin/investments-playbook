// Shared helpers. No dependencies.

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Copy rules: no em-dashes, no middot separators. Enforced at render time.
export const copy = (s = "") =>
  String(s).replace(/—/g, ",").replace(/\s·\s/g, ", ").replace(/–/g, " to ");

export const fmt = (v, d = 2) =>
  v === null || v === undefined || Number.isNaN(v)
    ? "n/a"
    : Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export const pct = (v) =>
  v === null || v === undefined || Number.isNaN(v) ? "" : `${v > 0 ? "+" : ""}${Number(v).toFixed(2)}%`;

export const dir = (v) => (v > 0 ? "up" : v < 0 ? "dn" : "flat");
export const glyph = (v) => (v > 0 ? "▲" : v < 0 ? "▼" : "–");

export function briefLabel(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${String(d.getUTCFullYear()).slice(2)}`;
}

export function longDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

// The inverse of longDate. Framework frontmatter stores "27 August 2026",
// the form a person writes and the page prints, but schema.org dateModified
// is a Date and Google discards anything that is not ISO 8601. Returns "" on
// anything it cannot parse, so a caller emits no date rather than a bad one.
export function isoDate(display = "") {
  const m = String(display).trim().match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/);
  if (!m) return "";
  const i = MONTH_NAMES.indexOf(m[2]);
  if (i < 0) return "";
  const d = new Date(Date.UTC(Number(m[3]), i, Number(m[1])));
  // Round-trip guards the overflow that makes "31 September" quietly become
  // 1 October rather than an error.
  if (d.getUTCDate() !== Number(m[1]) || d.getUTCMonth() !== i) return "";
  return d.toISOString().slice(0, 10);
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function gst(iso) {
  if (!iso) return "n/a";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "n/a";
  const h = (d.getUTCHours() + 4) % 24;
  return `${String(h).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export function monthKey(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

/* ---------------------------------------------------------------
   Minimal markdown. Handles headings, paragraphs, lists, tables,
   bold, italic, inline code, links and blockquote callouts.
   Deliberately small: the content is ours, so we control the input.
----------------------------------------------------------------*/
function inline(s) {
  return esc(copy(s))
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
}

export function md(src = "") {
  const lines = String(src).replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  const flushList = (tag, items) => out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</${tag}>`);

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    if (/^###\s+/.test(line)) { out.push(`<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`); i++; continue; }
    if (/^##\s+/.test(line)) { out.push(`<h2>${inline(line.replace(/^##\s+/, ""))}</h2>`); i++; continue; }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      const head = buf.shift() || "";
      out.push(`<div class="callout"><b>${inline(head)}</b>${buf.length ? `<p>${inline(buf.join(" "))}</p>` : ""}</div>`);
      continue;
    }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = (r) => r.split("|").slice(1, -1).map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      const isNum = (v) => /^[\-+]?[\d(]/.test(v);
      out.push(
        `<div class="table-scroll"><table class="tbl"><thead><tr>${head
          .map((h, n) => `<th${n > 0 ? ' class="n"' : ""}>${inline(h)}</th>`)
          .join("")}</tr></thead><tbody>${body
          .map((r) => `<tr>${r.map((c, n) => `<td${n > 0 && isNum(c) ? ' class="n"' : ""}>${inline(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^[-*]\s+/, "")); i++; }
      flushList("ul", items);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s+/, "")); i++; }
      flushList("ol", items);
      continue;
    }

    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|[-*]\s|\d+\.\s|\||>)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}

export const COUNTRIES = ["United Arab Emirates","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman","United Kingdom","United States","India","Pakistan","Egypt","Jordan","Lebanon","Canada","Australia","Singapore","Hong Kong","China","Germany","France","Italy","Spain","Netherlands","Switzerland","Sweden","Norway","Denmark","Ireland","Portugal","Greece","Turkey","Russia","Ukraine","Kazakhstan","Azerbaijan","Nigeria","Kenya","South Africa","Ghana","Morocco","Tunisia","Algeria","Iraq","Syria","Yemen","Sudan","Libya","Bangladesh","Sri Lanka","Nepal","Philippines","Indonesia","Malaysia","Thailand","Vietnam","Japan","South Korea","New Zealand","Brazil","Argentina","Mexico","Chile","Colombia","Poland","Czechia","Romania","Hungary","Austria","Belgium","Finland","Israel","Cyprus","Malta","Other"];

export const DIAL = [["+971","AE"],["+966","SA"],["+974","QA"],["+965","KW"],["+973","BH"],["+968","OM"],["+44","UK"],["+1","US"],["+91","IN"],["+92","PK"],["+20","EG"],["+962","JO"],["+961","LB"],["+61","AU"],["+65","SG"],["+852","HK"],["+86","CN"],["+49","DE"],["+33","FR"],["+39","IT"],["+34","ES"],["+31","NL"],["+41","CH"],["+353","IE"],["+90","TR"],["+7","RU"],["+234","NG"],["+254","KE"],["+27","ZA"],["+212","MA"],["+880","BD"],["+94","LK"],["+63","PH"],["+62","ID"],["+60","MY"],["+66","TH"],["+81","JP"],["+82","KR"],["+55","BR"],["+52","MX"],["+48","PL"],["+972","IL"]];

export const INTENTS = [
  "Buy my first investment property",
  "Add to an existing property portfolio",
  "Build a global markets portfolio",
  "Diversify out of a single market",
  "Relocate or set up in the UAE",
  "Move crypto gains into property",
  "Just learning",
];

/* ----------------------------------------------------------------
   Search result hygiene. Both of these exist because a title or a
   description that overflows is silently cut mid-word by the search
   engine, and the cut lands wherever it lands.
   ---------------------------------------------------------------- */

export const TITLE_MAX = 60;
export const DESC_MAX = 155;

/* Append the site name only when it fits. A long, specific title with no
   brand on it beats a truncated one, and the domain is shown next to the
   result anyway. */
export function pageTitle(base, siteName, max = TITLE_MAX) {
  const b = String(base).trim().replace(/\.$/, "");
  const withBrand = `${b}. ${siteName}`;
  return withBrand.length <= max ? withBrand : b;
}

/* Trim to whole sentences where possible, and to a word boundary when a
   single sentence is already too long. Never cuts mid-word. */
export function clampDescription(text, max = DESC_MAX) {
  const t = copy(String(text || "")).trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;

  const sentences = t.match(/[^.!?]+[.!?]+(\s|$)/g) || [];
  let out = "";
  for (const s of sentences) {
    if ((out + s).trim().length > max) break;
    out += s;
  }
  out = out.trim();
  if (out.length >= 70) return out;

  const cut = t.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return (at > 40 ? cut.slice(0, at) : cut).replace(/[,;:\-\s]+$/, "");
}

/* ---------- is the brief actually keeping its promise? ----------
   The site advertises a brief every weekday at 7am GST in seven places,
   including the meta description. That claim is only true while issues are
   actually being published, and on 27 August it was not: one issue existed,
   dated the 26th, because no model key is configured.

   This is the same problem the data page already solves for market figures.
   A source that stops answering is flagged stale and the failure is published,
   rather than the last good number being shown as though it were current. The
   brief gets the same treatment: when it falls behind, the site says so where
   the promise is made, instead of repeating a cadence it is not meeting.

   Weekends are excluded, because a weekday cadence is not broken by a Sunday. */
/* The cadence phrase itself, derived rather than typed.

   briefLate() put an honest notice on /brief/. It did not touch the other
   fifty-one pages that assert the cadence as current fact, including the rail
   box on every framework page and the copy beside the form that takes a
   reader's email address. That is the "Book a call" shape exactly: true in one
   place, false in the most visible fifty.

   So the phrase is generated from the issues. Every sentence that advertises
   the brief takes it from here, and all of them change together the moment
   publication resumes or stops. */
export function cadence(briefs = [], nowISO, opts = {}) {
  // Two different claims that were being collapsed into one. Whether the brief
  // is published, and whether this site's archive of it is current. It went
  // out by email every weekday for weeks while the archive here held a single
  // issue, so "paused at the moment" was on 52 pages and was false.
  //
  // byEmail is the ground truth about publication. The archive lagging is a
  // separate fact, stated separately, on the page where the archive lives.
  // The phrase itself is configuration, because the site cannot observe the
  // mail account and must not assert a precision it has no way to check.
  //
  // It said "every weekday at 7am GST" on 140 pages on the strength of a
  // verbal report that it went out daily. The campaign record showed three
  // issues in that week, at 06:48, 17:58 and 12:03. The weaker sentence is
  // true today; strengthen it in site.json on the day the mailer is switched
  // from draft to schedule, and not before.
  if (opts.byEmail) {
    const phrase = opts.phrase || "most weekday mornings";
    return { live: true, phrase, short: phrase, intended: phrase, next: nextLine(phrase) };
  }
  // This branch used to hard code "every weekday at 7am GST" twice. That is the
  // sentence that went onto 140 pages against a record of 06:48, 17:58 and
  // 12:03, and removing it from the other branch left it sitting here, one
  // boolean away from coming back. Both branches read the configured phrase
  // now, so there is one place where this claim is made and it is a file
  // somebody has to edit on purpose.
  const intended = opts.phrase || "weekday mornings";
  const st = briefStatus(briefs, nowISO);
  return st.behind
    ? { live: false, phrase: `${intended}, paused at the moment`, intended,
        short: "paused at the moment", next: "You will get the next issue when publication resumes." }
    : { live: true, phrase: intended, short: intended, intended, next: nextLine(intended) };
}

/* The sentence a reader sees the instant after handing over an email address.
   It was hard coded to "The next brief lands at 7am GST" in four templates,
   which is a precise promise made in the worst possible place to be wrong.
   It now takes its precision from the advertised phrase: name a time only
   where the site is claiming one. */
export function nextLine(phrase) {
  const at = String(phrase).match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*\w*)/i);
  return at ? `The next brief lands at ${at[1]}.` : "The next issue goes out on a weekday morning.";
}

export function weekdaysBetween(fromISO, toISO) {
  const a = new Date(fromISO + "T12:00:00Z"), b = new Date(toISO + "T12:00:00Z");
  if (!(a <= b)) return 0;
  let n = 0;
  for (const d = new Date(a); d < b; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = d.getUTCDay();
    if (day !== 5 && day !== 6) n++;   // Gulf weekend: Friday and Saturday
  }
  return n;
}

// `behind` is deliberately forgiving: one missed weekday is a late morning,
// two is a pattern worth admitting to.
export function briefStatus(briefs = [], nowISO = new Date().toISOString().slice(0, 10)) {
  const dates = briefs.map((b) => b && b.date).filter(Boolean).sort();
  const latest = dates[dates.length - 1] || null;
  if (!latest) return { latest: null, weekdaysBehind: null, behind: true, none: true };
  const weekdaysBehind = weekdaysBetween(latest, nowISO);
  return { latest, weekdaysBehind, behind: weekdaysBehind >= 2, none: false };
}
