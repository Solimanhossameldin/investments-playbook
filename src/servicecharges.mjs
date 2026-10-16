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

  /* The index reports an approved budget in two parts, and the parts are the
     check on the whole. A general fund and a reserve that do not add up to
     the headline rate mean one of the three was mistyped, which is the one
     error a reader cannot catch and the table cannot survive. A row with no
     reserve line at all is a real thing -- Barton House 1 has none, and its
     general fund is the entire charge -- so it is allowed, and then the
     general fund must equal the total exactly.

     Half a fil of tolerance, because every figure here is published to two
     decimals and the source rounds each part on its own. */
  if (typeof r.psf === "number" && typeof r.generalFund === "number") {
    const parts = r.generalFund + (typeof r.reserveFund === "number" ? r.reserveFund : 0);
    if (Math.abs(parts - r.psf) > 0.005) {
      out.push(`${at}: general fund ${r.generalFund}${r.reserveFund === undefined ? " and no reserve" : ` plus reserve ${r.reserveFund}`} is ${parts.toFixed(2)}, not the stated ${r.psf}`);
    }
  }
  if (r.reserveFund !== undefined && typeof r.reserveFund !== "number") out.push(`${at}: reserveFund must be a number when present, got ${typeof r.reserveFund}`);
  if (typeof r.reserveFund === "number" && r.reserveFund < 0) out.push(`${at}: reserveFund ${r.reserveFund} is negative`);
  if (r.generalFund !== undefined && typeof r.generalFund !== "number") out.push(`${at}: generalFund must be a number, got ${typeof r.generalFund}`);

  /* Scaffolding must never survive into a published table. */
  for (const k of ["project", "area", "period", "source"]) {
    if (r[k] && PLACEHOLDER.test(String(r[k]))) out.push(`${at}: ${k} still contains placeholder text`);
  }
  return out;
}

/* The official lookup's own shape, which is a different claim from a row.

   The page now tells a reader what the DLD Service Charge Index contains:
   how many projects its menu offers and which budget years it covers. That
   is a figure about a government service rather than about a building, and
   it drifts on its own as projects are added, so it gets the same treatment
   as a row: it is not publishable without the service it describes, the URL
   that returns it and the date somebody actually looked. A count with no
   retrieval date is the exact defect this file exists to refuse. */
export const INDEX_REQUIRED = ["projectEntries", "projects", "yearFrom", "yearTo", "source", "sourceUrl", "retrievedAt"];

export function indexProblems(ix) {
  const out = [];
  if (!ix || typeof ix !== "object") return ["officialIndex: not an object"];

  for (const k of INDEX_REQUIRED) {
    if (ix[k] === undefined || ix[k] === null || ix[k] === "") out.push(`officialIndex: missing ${k}`);
  }
  for (const k of ["projectEntries", "projects", "yearFrom", "yearTo"]) {
    if (ix[k] !== undefined && !Number.isInteger(ix[k])) out.push(`officialIndex: ${k} must be an integer, got ${typeof ix[k]}`);
  }
  /* Menu entries are what the dropdown shows and projects are the distinct
     ones behind them, so entries can equal projects but can never be fewer. */
  if (Number.isInteger(ix.projectEntries) && Number.isInteger(ix.projects) && ix.projectEntries < ix.projects) {
    out.push(`officialIndex: projectEntries ${ix.projectEntries} is fewer than projects ${ix.projects}`);
  }
  if (Number.isInteger(ix.yearFrom) && Number.isInteger(ix.yearTo) && ix.yearFrom > ix.yearTo) {
    out.push(`officialIndex: yearFrom ${ix.yearFrom} is after yearTo ${ix.yearTo}`);
  }
  if (ix.sourceUrl && !/^https?:\/\/\S+$/i.test(String(ix.sourceUrl))) out.push("officialIndex: sourceUrl is not a URL");
  if (ix.retrievedAt && !ISO_DATE.test(String(ix.retrievedAt))) out.push("officialIndex: retrievedAt must be YYYY-MM-DD");
  if (ix.source && PLACEHOLDER.test(String(ix.source))) out.push("officialIndex: source still contains placeholder text");
  return out;
}

/* Throws, like validate(), because the build is where this has to stop. */
export function validateIndex(ix) {
  const problems = indexProblems(ix);
  if (problems.length) throw new Error("service charge index refused:\n  " + problems.join("\n  "));
  return ix;
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
