/* The Dubai service charge index.

   Every figure on this site is checkable, and this page is the one where that
   promise is easiest to break: a table of numbers looks authoritative whether
   or not anyone sourced it. Every competitor found on 7 September published
   either area bands with no building named, or five towers attributed to
   "2026 Mollak data" with no retrieval date and no sample size.

   So the rule here is structural rather than editorial. A record without a
   named source, a resolvable source URL and the date it was retrieved is not
   incomplete, it is inadmissible, and the build refuses it. There is no path
   through this file that publishes a number nobody can check. */

const PLACEHOLDER = /\b(tbd|todo|tba|example|sample|placeholder|lorem|xxx+|n\/?a|unknown|\?\?+)\b/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const REQUIRED = ["project", "area", "psf", "period", "source", "sourceUrl", "retrievedAt"];

/* Returns [] for a clean record, or the reasons it cannot be published. */
export function recordProblems(r, i = 0) {
  const out = [];
  const at = `record ${i}${r && r.project ? ` (${r.project})` : ""}`;
  if (!r || typeof r !== "object") return [`${at}: not an object`];

  for (const k of REQUIRED) {
    if (r[k] === undefined || r[k] === null || r[k] === "") out.push(`${at}: missing ${k}`);
  }

  /* A number is the whole point of the row. Strings that look like numbers are
     refused rather than coerced, because "17-20" and "about 17" both coerce to
     something and neither is a figure anyone can check. */
  if (r.psf !== undefined && typeof r.psf !== "number") out.push(`${at}: psf must be a number, got ${typeof r.psf}`);
  else if (typeof r.psf === "number" && !(r.psf > 0 && r.psf < 500)) out.push(`${at}: psf ${r.psf} is outside any plausible range`);

  if (r.sourceUrl && !/^https?:\/\/\S+$/i.test(String(r.sourceUrl))) out.push(`${at}: sourceUrl is not a URL`);
  if (r.retrievedAt && !ISO_DATE.test(String(r.retrievedAt))) out.push(`${at}: retrievedAt must be YYYY-MM-DD`);

  /* Scaffolding must never survive into a published table. */
  for (const k of ["project", "area", "period", "source"]) {
    if (r[k] && PLACEHOLDER.test(String(r[k]))) out.push(`${at}: ${k} still contains placeholder text`);
  }
  return out;
}

/* Throws on anything unpublishable. Returns the rows, sorted dearest first,
   plus the summary the page and its schema block both read from. */
export function validate(records) {
  if (!Array.isArray(records)) throw new Error("service charges: expected an array");
  const problems = records.flatMap((r, i) => recordProblems(r, i));
  if (problems.length) throw new Error("service charges refused:\n  " + problems.join("\n  "));

  const rows = [...records].sort((a, b) => b.psf - a.psf);
  const psf = rows.map((r) => r.psf).sort((a, b) => a - b);
  const mid = psf.length ? (psf.length % 2 ? psf[(psf.length - 1) / 2] : (psf[psf.length / 2 - 1] + psf[psf.length / 2]) / 2) : 0;
  return {
    rows,
    count: rows.length,
    median: psf.length ? Math.round(mid * 100) / 100 : 0,
    low: psf[0] ?? 0,
    high: psf[psf.length - 1] ?? 0,
    areas: [...new Set(rows.map((r) => r.area))].sort(),
    sources: [...new Set(rows.map((r) => r.source))].sort(),
    retrievedFrom: rows.map((r) => r.retrievedAt).sort()[0] || "",
    retrievedTo: rows.map((r) => r.retrievedAt).sort().pop() || "",
  };
}
