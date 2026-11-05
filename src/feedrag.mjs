/* What a percentage a year actually costs, over a working life.

   The page states the arithmetic correctly and in one line: a fee is not an
   annual event, it is a permanent reduction in the base everything
   afterwards compounds on. What it did not have was the column that makes
   the case, which is not the multiple but the SHARE of the result the fee
   takes. "One percent costs about 25%" was in the formula block and nowhere
   a reader would meet it.

   The model is the page's own: value = (1 + r - f)^n, the fee as a
   reduction in the rate. That is the standard simplification and it is what
   the page prints, so it is what this computes. Nothing empirical, nothing
   to source, and no currency: the whole argument is a multiple, which is
   why it travels to a reader holding any currency at all. */

export const GROSS = 0.07;
export const YEARS = 30;
export const FEES = [0, 0.01, 0.02, 0.03];

export const multiple = (fee, { gross = GROSS, years = YEARS } = {}) =>
  Math.pow(1 + gross - fee, years);

export function table({ gross = GROSS, years = YEARS, fees = FEES } = {}) {
  const base = multiple(0, { gross, years });
  return fees.map((fee) => {
    const m = multiple(fee, { gross, years });
    return {
      fee,
      feePct: Number((fee * 100).toFixed(0)),
      multiple: Number(m.toFixed(2)),
      /* The finding: what share of the no-fee result the fee removes. */
      costShare: Number((((base - m) / base) * 100).toFixed(1)),
    };
  });
}

/* The ratio that names the surprise: the share taken, divided by the fee.
   One percent a year taking a quarter of the result is a 25x multiplier on
   the number in the brochure, and that is the sentence worth quoting. */
export function amplification(opts = {}) {
  return table(opts)
    .filter((r) => r.fee > 0)
    .map((r) => ({ ...r, times: Number((r.costShare / r.feePct).toFixed(1)) }));
}

/* How the same fee grows with the horizon, which is the half of the
   argument the page gestures at ("extend to forty years and the gap widens
   again") without ever printing. */
export function byHorizon(fee = 0.01, horizons = [10, 20, 30, 40]) {
  return horizons.map((years) => {
    const base = multiple(0, { years });
    const m = multiple(fee, { years });
    return { years, costShare: Number((((base - m) / base) * 100).toFixed(1)) };
  });
}
