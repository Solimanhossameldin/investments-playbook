/* Sequence of returns risk, computed rather than asserted.

   The page this feeds has said for months that one ordering "can leave a
   portfolio intact after thirty years and another can exhaust it in
   eighteen". Nothing computed it. It is the kind of sentence that is true
   in spirit and unchecked in fact, and on a site whose argument is that
   everybody else asserts and nobody arithmetises, an unchecked claim on our
   own page is the expensive kind of error.

   So this module computes it, and the figures below are what came back.
   They do not support the eighteen years, at the withdrawal rate the rest
   of the library uses, and the page now says what is true instead.

   The design decision that makes this honest: the demonstration is a
   mathematical identity, not an empirical claim. One declared sequence is
   compared against ITS OWN REVERSE. Same returns, same multiset, same
   arithmetic mean, same geometric mean, and provably the same terminal
   value when nothing is withdrawn, because multiplication commutes. Order
   is therefore the only thing left that can explain a gap, and any gap is
   caused by the cash flow rather than by the returns.

   That is why no market data is fetched and none is claimed. A page that
   said "the S&P 500 from 1966" would be making a historical claim this site
   would then have to source and keep current. The identity needs no such
   claim: it holds for any sequence, and the one here is declared
   illustrative in the page's own words.

   Three findings come out of it.

   One: with no withdrawals both orders end at exactly the same figure, to
   the cent. The chart shows that as one bar.

   Two: with 4% withdrawals the order is worth roughly half the ending
   balance. Same returns.

   Three, and this is the one worth quoting: the highest withdrawal rate
   that survives thirty years is 5.47% if the bad decade comes first and
   8.35% if it comes last. The ORDER of the returns is worth 2.89 points of
   withdrawal rate. That converts "sequence risk matters" into a number, and
   it is solved by bisection rather than looked up, like the crossover rate
   on the mortgage pages. */

/* An illustrative thirty year sequence. It is not a market record and the
   page does not present it as one: eight down years in thirty, a worst year
   of -22% and a best of +31%. What matters is that the reversed order below
   is the same multiset, so the comparison is controlled by construction. */
export const SEQUENCE = [
  -0.09, -0.12, -0.22, 0.28, 0.10, -0.04, 0.15, 0.05, 0.16, 0.31,
   0.07, -0.02, 0.26, 0.04, 0.12, -0.11, 0.21, 0.09, 0.03, 0.18,
   0.06,  0.23, -0.07, 0.14, 0.01, 0.19, 0.08, 0.11, -0.05, 0.13,
];

/* The retiree. The withdrawal is a flat nominal amount set as a share of
   the opening balance, which is the convention the safe withdrawal rate
   page uses, so the two pages describe the same person. */
export const EXAMPLE = { start: 1000000, withdrawalRate: 0.04 };

export const badFirst = () => SEQUENCE.slice();
export const badLast = () => SEQUENCE.slice().reverse();

/* Balance(t) = (Balance(t-1) - Withdrawal) x (1 + r(t)), which is the
   formula the page prints: the withdrawal is taken, then the market acts on
   what is left. A balance that reaches zero stays at zero. */
export function run(seq, { start = EXAMPLE.start, withdrawal } = {}) {
  const w = withdrawal ?? start * EXAMPLE.withdrawalRate;
  let bal = start, depletedYear = null;
  const path = [{ year: 0, balance: start }];
  seq.forEach((r, i) => {
    if (depletedYear === null) {
      bal = (bal - w) * (1 + r);
      if (bal <= 0) { depletedYear = i + 1; bal = 0; }
    }
    path.push({ year: i + 1, balance: Math.max(bal, 0) });
  });
  return { path, depletedYear, end: Math.max(bal, 0), withdrawal: w };
}

/* The same sequence with nothing taken out. Order cannot matter here and
   the suite proves it rather than trusting the comment. */
export function terminalWithoutCashFlows(seq, start = EXAMPLE.start) {
  return seq.reduce((b, r) => b * (1 + r), start);
}

/* The identity, as a measured quantity rather than a claim.

   Multiplying the same thirty factors in two orders is exact in arithmetic
   and not quite exact in IEEE 754: the two products differ by one unit in
   the last place, about four billionths on seven million, a relative error
   of 5e-16. So the suite asserts they agree to the cent rather than
   asserting bitwise equality, which would fail for a reason that has
   nothing to do with the finance. */
export function identityGap() {
  const a = terminalWithoutCashFlows(badFirst());
  const b = terminalWithoutCashFlows(badLast());
  return { a, b, gap: Math.abs(a - b), sameToTheCent: Math.round(a * 100) === Math.round(b * 100) };
}

export const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
export const geometricMean = (xs) =>
  Math.pow(xs.reduce((a, r) => a * (1 + r), 1), 1 / xs.length) - 1;

/* The highest withdrawal rate that still leaves something after the last
   year, solved rather than tabulated. Bisection on the rate, to the same
   tolerance the refinancing page uses for its crossover. */
export function survivableRate(seq, { start = EXAMPLE.start, iterations = 60 } = {}) {
  let lo = 0, hi = 0.2;
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2;
    if (run(seq, { start, withdrawal: start * mid }).depletedYear === null) lo = mid;
    else hi = mid;
  }
  return Number((lo * 100).toFixed(2));
}

/* Where in the thirty years the bad run sits. The page has always claimed
   the first decade carries the exposure; rotating the same sequence is how
   that claim gets tested instead of repeated. */
export function byClusterPosition() {
  const w = EXAMPLE.start * EXAMPLE.withdrawalRate;
  return [0, 10, 20].map((shift) => {
    const rot = shift
      ? SEQUENCE.slice(-shift).concat(SEQUENCE.slice(0, -shift))
      : SEQUENCE.slice();
    return {
      shift,
      label: `years ${shift + 1} to ${shift + 10}`,
      end: Math.round(run(rot, { withdrawal: w }).end),
    };
  });
}

/* Everything the page prints, in one call, so the prose, the tables and the
   charts all read the same object. */
export function comparison() {
  const first = run(badFirst()), last = run(badLast());
  const noCashFlows = terminalWithoutCashFlows(SEQUENCE);
  return {
    years: SEQUENCE.length,
    downYears: SEQUENCE.filter((r) => r < 0).length,
    worst: Math.round(Math.min(...SEQUENCE) * 100),
    best: Math.round(Math.max(...SEQUENCE) * 100),
    arithmetic: Number((mean(SEQUENCE) * 100).toFixed(2)),
    geometric: Number((geometricMean(SEQUENCE) * 100).toFixed(2)),
    withdrawal: first.withdrawal,
    noCashFlows: Math.round(noCashFlows),
    badFirstEnd: Math.round(first.end),
    badLastEnd: Math.round(last.end),
    /* What the bad order keeps, as a share of what the good order keeps. */
    keptShare: Number(((first.end / last.end) * 100).toFixed(1)),
    shortfall: Math.round(last.end - first.end),
    badFirstRate: survivableRate(badFirst()),
    badLastRate: survivableRate(badLast()),
  };
}

/* The headline: what the ORDER is worth, in points of withdrawal rate. */
export function orderWorth() {
  const c = comparison();
  return Number((c.badLastRate - c.badFirstRate).toFixed(2));
}

export const money = (n) => Math.round(n).toLocaleString("en-US");
