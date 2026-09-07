/* The DLD residential sale index.

   This page publishes a price history under Soliman's name, so the two ways
   it could mislead are guarded here rather than left to a proof-read.

   The first is staleness. The official open series ends in May 2024, and a
   page that implies otherwise is worse than no page. Nothing here extends,
   interpolates or forecasts, and the page is required to state where the
   series stops.

   The second is arithmetic. Every figure quoted in the prose -- the cycle
   legs, the recovery, the whole-series change -- is computed from the points
   rather than typed, so the two cannot drift apart. */

export function analyse(data) {
  const byKey = Object.fromEntries((data.series || []).map((s) => [s.key, s]));
  const need = ["all", "flat", "villa"];
  for (const k of need) if (!byKey[k]?.points?.length) throw new Error(`price index: missing series ${k}`);

  const at = (k, iso) => {
    const p = byKey[k].points.find((p) => p[0].slice(0, 7) === iso.slice(0, 7));
    if (!p) throw new Error(`price index: no ${k} reading for ${iso}`);
    return p[1];
  };
  const pct = (a, b) => Math.round((b / a - 1) * 1000) / 10;

  const all = byKey.all.points;
  const first = all[0], last = all.at(-1);

  /* The peak before the slide, and the first month that got back above it.
     This is the number the page is built on, so it is derived, never typed. */
  const early = all.filter((p) => p[0] <= "2016-12-01");
  const peak = early.reduce((m, p) => (p[1] > m[1] ? p : m), early[0]);
  const recovered = all.find((p) => p[0] > peak[0] && p[1] >= peak[1]) || null;
  const months = recovered
    ? (+recovered[0].slice(0, 4) * 12 + +recovered[0].slice(5, 7)) -
      (+peak[0].slice(0, 4) * 12 + +peak[0].slice(5, 7))
    : null;

  /* The whole page is built on the recovery. If a revised series no longer
     shows one, the honest outcome is a failed build and a rewrite, not a
     page that quietly drops its own headline or crashes in the template
     with an error naming nothing. */
  if (!recovered)
    throw new Error(
      "price index: the series no longer regains its pre-2017 peak. The page's premise has changed and the prose must be rewritten, not rebuilt."
    );

  /* The trough that matters is the low AFTER the peak -- where the slide
     ends and the surge begins. The whole-series minimum is in 2012, before
     the peak, and using it made the chart's own description say prices fell
     to a level they reached three years earlier. It is computed once here so
     the prose and the cycle table cannot describe two different troughs. */
  const troughDate = lowAfter(all, peak[0]);
  const trough = all.find((p) => p[0] === troughDate);

  const leg = (a, b) => ({
    from: a, to: b,
    all: pct(at("all", a), at("all", b)),
    flat: pct(at("flat", a), at("flat", b)),
    villa: pct(at("villa", a), at("villa", b)),
  });

  const priceAt = (k, iso) => byKey[k].prices.find((p) => p[0].slice(0, 7) === iso.slice(0, 7))?.[1];

  return {
    byKey, first: first[0], last: last[0], months: all.length,
    peak: { date: peak[0], value: peak[1] },
    trough: { date: trough[0], value: trough[1] },
    recovered: recovered ? { date: recovered[0], value: recovered[1], months } : null,
    legs: {
      runUp: leg(first[0], peak[0]),
        slide: leg(peak[0], troughDate),
      surge: leg(troughDate, last[0]),
      whole: leg(first[0], last[0]),
    },
    lastPrices: { all: priceAt("all", last[0]), flat: priceAt("flat", last[0]), villa: priceAt("villa", last[0]) },
  };
}

/* The low point after the peak, which is where the slide ends and the surge
   starts. Taken from the data rather than named, so a revised series moves it. */
function lowAfter(all, peakDate) {
  const after = all.filter((p) => p[0] > peakDate);
  return after.reduce((m, p) => (p[1] < m[1] ? p : m), after[0])[0];
}
