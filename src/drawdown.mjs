/* The recovery asymmetry, and what it costs in years.

   The page has always carried the required-gain table and it is correct:
   a fall of L needs L/(1-L) back. What it mentioned only in passing, twice,
   in prose, was the figure a reader actually feels, which is how long the
   recovery takes. "A hundred percent gain at eight percent a year takes
   nine years" was the whole of it, and the number that makes the argument
   is the shape of that column, not one point on it.

   So the years are tabulated and charted here. They are also where the
   page's claim about where the curve turns can be tested rather than
   asserted: the required gain roughly doubles every twenty points of fall
   near the top, while the years to recover rise almost linearly, and it is
   the second of those that bounds a human being. A 90% fall needs 900% back
   and that is an abstraction; it needs thirty years at 8% and that is a
   working life.

   Pure arithmetic, no assumptions except the recovery rate, which is a
   declared input and appears in the page as one. Nothing here is empirical
   and nothing needs sourcing. */

/* The falls the page tabulates, as decimals. */
export const FALLS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

/* The rate the page recovers at. Declared, not assumed silently. */
export const RECOVERY_RATE = 0.08;

/* L / (1 - L), as a percentage. */
export const requiredGain = (loss) => (loss / (1 - loss)) * 100;

/* ln(1 / (1 - L)) / ln(1 + r). */
export const yearsToRecover = (loss, r = RECOVERY_RATE) =>
  Math.log(1 / (1 - loss)) / Math.log(1 + r);

export function table(r = RECOVERY_RATE) {
  return FALLS.map((loss) => ({
    loss,
    lossPct: Math.round(loss * 100),
    gain: Math.round(requiredGain(loss)),
    years: Number(yearsToRecover(loss, r).toFixed(1)),
  }));
}

/* The leverage case, which is the page's sharpest point: equity is gone
   when the asset falls by the deposit, and the required recovery on capital
   that no longer exists is not a number. */
export const wipeoutFall = (depositPct) => depositPct;

/* Where the curve turns, derived rather than eyeballed. The page says
   losses and recoveries are "roughly in the same neighbourhood" up to about
   twenty percent: the test of that is the ratio of required gain to the
   fall itself, which is 1.11 at ten percent and 9.00 at ninety. */
export function amplification(r = RECOVERY_RATE) {
  return table(r).map((row) => ({
    ...row,
    /* How many times the fall the recovery has to be. */
    ratio: Number((row.gain / (row.loss * 100)).toFixed(2)),
  }));
}

/* The first fall at which the recovery is more than double the fall. */
export function turnsAt(r = RECOVERY_RATE) {
  return amplification(r).find((row) => row.ratio >= 2) || null;
}
