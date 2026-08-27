/* Scoring the register. Pure functions, no I/O, so the tests can
   drive them and the page and the resolver share one definition of
   what "right" means. */

export const DAY = 86400000;
const t = (iso) => Date.parse(iso + "T00:00:00Z");

/* Apply a call's machine test to an observed value.
   Returns "right" | "wrong". Anything it cannot evaluate throws,
   rather than guessing, because a guessed verdict is worse than none. */
export function score(test, actual, first = null) {
  if (!test || typeof actual !== "number" || !Number.isFinite(actual))
    throw new Error("score needs a test and a finite observation");
  switch (test.op) {
    case "above": return actual > test.value ? "right" : "wrong";
    case "below": return actual < test.value ? "right" : "wrong";
    case "between": {
      if (!Array.isArray(test.value) || test.value.length !== 2)
        throw new Error("between needs [lo, hi]");
      const [lo, hi] = test.value;
      return actual >= lo && actual <= hi ? "right" : "wrong";
    }
    case "rose":
      if (typeof first !== "number") throw new Error("rose needs a starting value");
      return actual > first ? "right" : "wrong";
    case "fell":
      if (typeof first !== "number") throw new Error("fell needs a starting value");
      return actual < first ? "right" : "wrong";
    default:
      throw new Error(`unknown test op: ${test.op}`);
  }
}

export function describeTest(test) {
  if (!test) return null;
  const u = test.unit || "";
  switch (test.op) {
    case "above": return `${test.series} above ${test.value}${u}`;
    case "below": return `${test.series} below ${test.value}${u}`;
    case "between": return `${test.series} between ${test.value[0]}${u} and ${test.value[1]}${u}`;
    case "rose": return `${test.series} higher than on the day the call was made`;
    case "fell": return `${test.series} lower than on the day the call was made`;
    default: return `${test.series} ${test.op} ${test.value}`;
  }
}

/* Merge the register with whatever the resolver has computed, and sort
   every call into exactly one bucket. A call that has matured without a
   verdict lands in `overdue`, which is published rather than hidden. */
export function classify(calls, results = {}, now = Date.now()) {
  const open = [], overdue = [], resolved = [];
  for (const c of calls) {
    const auto = results[c.id];
    const res = auto
      ? { ...auto, scoredBy: "machine" }
      : c.resolution
        ? { ...c.resolution, scoredBy: "hand" }
        : null;
    const entry = { ...c, res };
    if (res) resolved.push(entry);
    else if (t(c.horizon) < now) overdue.push(entry);
    else open.push(entry);
  }
  open.sort((a, b) => t(a.horizon) - t(b.horizon));
  overdue.sort((a, b) => t(a.horizon) - t(b.horizon));
  resolved.sort((a, b) => t(b.res.date || b.horizon) - t(a.res.date || a.horizon));
  return { open, overdue, resolved };
}

/* The scoreboard. Every number here is counted, never typed.
   `rate` is null below `minSample` on purpose: a hit rate computed on
   three calls is a number that misleads, and publishing it would be the
   opposite of what this page is for. */
export function scoreboard(resolved, minSample = 10) {
  const count = (v) => resolved.filter((c) => c.res.verdict === v).length;
  const right = count("right"), wrong = count("wrong");
  const partly = count("partly"), voided = count("void");
  const scored = right + wrong + partly;
  return {
    total: resolved.length,
    right, wrong, partly, void: voided, scored,
    byMachine: resolved.filter((c) => c.res.scoredBy === "machine").length,
    byHand: resolved.filter((c) => c.res.scoredBy === "hand").length,
    minSample,
    rate: scored >= minSample ? +((right / scored) * 100).toFixed(1) : null,
  };
}

export function daysUntil(iso, now = Date.now()) {
  return Math.ceil((t(iso) - now) / DAY);
}
