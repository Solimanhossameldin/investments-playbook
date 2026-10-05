// Build-time SVG line charts. No library, no client JavaScript, no canvas.
//
// The chart is a static element in the HTML, so it prints, it works with
// JavaScript off, it survives a slow connection, and a screen reader gets a
// sentence rather than a shrug. Everything is drawn in the site palette.

import { esc } from "./lib.mjs";

const W = 760;
const H = 250;
// Top padding leaves room for the final value label above the line.
const PAD = { t: 34, r: 14, b: 26, l: 52 };

/* A step a human would have chosen: 1, 2, 2.5, 5 or 10 times a power of ten. */
export function niceStep(range, target = 5) {
  if (!(range > 0)) return 1;
  const raw = range / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  return step * mag;
}

export function axis(min, max, target = 5) {
  if (min === max) { min -= 0.5; max += 0.5; }
  const step = niceStep(max - min, target);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks = [];
  // Accumulating with += drifts on values like 0.1, so ticks are indexed.
  const n = Math.round((hi - lo) / step);
  for (let i = 0; i <= n; i++) ticks.push(+(lo + i * step).toFixed(10));
  return { lo, hi, step, ticks };
}

const days = (iso) => Date.parse(iso + "T00:00:00Z") / 86400000;

function yearTicks(fromIso, toIso) {
  const a = Number(fromIso.slice(0, 4));
  const b = Number(toIso.slice(0, 4));
  const years = [];
  for (let y = a + 1; y <= b; y++) years.push(y);
  // Eight labels is the most that fits without them touching.
  const stride = Math.max(1, Math.ceil(years.length / 8));
  return years.filter((_, i) => i % stride === 0).map((y) => ({ y, iso: `${y}-01-01` }));
}

/* A sentence describing the chart, used as the accessible label and as the
   fallback for anything that cannot render SVG. It states only what the data
   says: where it is now, where it was, and the range it moved through. */
export function chartSentence(s) {
  /* A series may carry its own sentence where the default framing would be
     false. The default says "Now X on <date>", which is right for a series
     that refreshes daily and wrong for a closed historical one: the DLD
     price index stops in May 2024, and "now" is not what that reading is. */
  if (s.sentence) return s.sentence;
  const u = s.unit === "USD" ? "" : s.unit === "index" ? "" : s.unit;
  const n = (v) => `${s.unit === "USD" ? "$" : ""}${Number(v).toFixed(s.dp)}${u}`;
  const parts = [
    `${s.label}. Now ${n(s.latest.value)} on ${s.latest.date}.`,
  ];
  if (s.yearAgo) parts.push(`A year earlier, ${n(s.yearAgo.value)}.`);
  parts.push(
    `Over the period shown it ranged from ${n(s.min.value)} in ${s.min.date.slice(0, 7)} to ${n(
      s.max.value
    )} in ${s.max.date.slice(0, 7)}.`
  );
  return parts.join(" ");
}

/* All the geometry of a chart, in one place, so the SVG on the page and
   the PDF in the chartbook are drawn from the same numbers rather than
   from two implementations that drift apart. Coordinates are top-left
   origin in the given box; both renderers below just transcribe them. */
export function chartGeometry(s, box = {}) {
  const pts = s.points || [];
  if (pts.length < 2) return null;

  const w = box.w ?? W, h = box.h ?? H;
  const pad = { ...PAD, ...(box.pad || {}) };
  const x0 = pad.l, x1 = w - pad.r, y0 = pad.t, y1 = h - pad.b;

  const dLo = days(pts[0][0]), dHi = days(pts.at(-1)[0]);
  const span = dHi - dLo || 1;

  let vMin = Infinity, vMax = -Infinity;
  for (const p of pts) { if (p[1] < vMin) vMin = p[1]; if (p[1] > vMax) vMax = p[1]; }
  if (s.zero) { vMin = Math.min(vMin, 0); vMax = Math.max(vMax, 0); }
  const { lo, hi, ticks } = axis(vMin, vMax);

  const sx = (iso) => x0 + ((days(iso) - dLo) / span) * (x1 - x0);
  const sy = (v) => y1 - ((v - lo) / (hi - lo || 1)) * (y1 - y0);
  const r = (v) => Math.round(v * 10) / 10;

  // Decimals are decided once, from the tick step, so an axis never mixes
  // "150" with "0.0". Per-tick formatting is how that happens.
  const step = ticks.length > 1 ? Math.abs(ticks[1] - ticks[0]) : 1;
  const axDp = step >= 1 ? 0 : step >= 0.1 ? 1 : 2;

  const line = pts.map((p) => [r(sx(p[0])), r(sy(p[1]))]);

  const last = pts.at(-1);
  const lx = r(sx(last[0])), ly = r(sy(last[1]));
  const label = `${s.unit === "USD" ? "$" : ""}${Number(last[1]).toFixed(s.dp)}${
    s.unit === "%" ? "%" : s.unit === "pp" ? "pp" : ""
  }`;
  // The final label sits on the side the line is not arriving from, and is
  // pinned inside the frame so a long number never clips. Direction comes
  // from a short window: on a daily series the last two observations are
  // noise and decide nothing.
  const anchor = lx > w - 90 ? "end" : "start";
  const tx = anchor === "end" ? lx - 8 : lx + 8;
  const tail = pts.slice(-10);
  const mean = tail.reduce((a, p) => a + p[1], 0) / tail.length;
  const rising = last[1] >= mean;
  const fits = (v) => v >= 14 && v <= y1 - 2;
  const above = ly - 16, below = ly + 22;
  let ty = rising ? above : below;
  if (!fits(ty)) ty = rising ? below : above;
  if (!fits(ty)) ty = Math.min(y1 - 2, Math.max(14, ly));

  return {
    w, h, plot: { x0, x1, y0, y1 },
    line,
    grid: ticks.map((t) => ({
      value: t,
      y: r(sy(t)),
      label: t.toFixed(axDp),
      zero: !!s.zero && Math.abs(t) < 1e-9,
    })),
    years: yearTicks(pts[0][0], pts.at(-1)[0])
      .filter((t) => days(t.iso) >= dLo && days(t.iso) <= dHi)
      .map((t) => ({ year: t.y, x: r(sx(t.iso)) })),
    last: { x: lx, y: ly, label, anchor, labelX: tx, labelY: ty },
    sentence: chartSentence(s),
  };
}

export function lineChart(s, { id = s.key } = {}) {
  const g = chartGeometry(s);
  if (!g) return "";
  const { plot, line, grid, years, last } = g;

  const d = line.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join("");
  const area = `${d}L${line.at(-1)[0]} ${plot.y1}L${line[0][0]} ${plot.y1}Z`;

  const gridSvg = grid
    .map(
      (t) => `<line x1="${plot.x0}" y1="${t.y}" x2="${plot.x1}" y2="${t.y}" class="ch__g${t.zero ? " ch__g--zero" : ""}"/>
<text x="${plot.x0 - 8}" y="${t.y + 4}" class="ch__yl">${t.label}</text>`
    )
    .join("");

  const xl = years.map((t) => `<text x="${t.x}" y="${g.h - 8}" class="ch__xl">${t.year}</text>`).join("");

  return `<figure class="ch">
<svg viewBox="0 0 ${g.w} ${g.h}" role="img" aria-labelledby="${esc(id)}-t" preserveAspectRatio="xMidYMid meet">
<title id="${esc(id)}-t">${esc(g.sentence)}</title>
<defs><linearGradient id="${esc(id)}-f" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="var(--gold)" stop-opacity="0.14"/>
<stop offset="100%" stop-color="var(--gold)" stop-opacity="0"/>
</linearGradient></defs>
${gridSvg}
<path d="${area}" fill="url(#${esc(id)}-f)"/>
<path d="${d}" class="ch__l"/>
<circle cx="${last.x}" cy="${last.y}" r="3.5" class="ch__p"/>
<text x="${last.labelX}" y="${last.labelY}" text-anchor="${last.anchor}" class="ch__v">${esc(last.label)}</text>
${xl}
</svg>
</figure>`;
}

/* A horizontal bar chart with a reference line.

   The line charts above answer "what happened over time". This answers a
   different and, on the playbook pages, more common question: "how do these
   few things compare against one threshold". The observed-occupancy finding
   is exactly that shape -- three vendors' net, against the annual tenancy
   they are being measured against -- and it was trapped in a table.

   Every bar's value is passed in by the caller from the module that computes
   it, never typed, so a bar cannot disagree with the prose beside it.
   Bars use --gold, which on this site resolves to the brand red (#dc0000),
   so a chart matches the line charts and everything else rather than
   introducing a colour of its own. A bar below its threshold is the same
   colour at lower opacity, not a separate alarm colour: on these pages
   falling short IS the finding, and a warning colour would editorialise it. The
   reference line is labelled, because a bar chart without the threshold
   drawn is a picture of three numbers rather than of a finding. */
export function barChart(s, { id = s.key } = {}) {
  const bars = s.bars || [];
  if (!bars.length) return "";

  const w = 900;
  const rowH = 52, padT = 18, padB = 46, padL = 150, padR = 92;
  const h = padT + bars.length * rowH + padB;
  const x1 = w - padR;

  const vals = bars.map((b) => b.value).concat(s.reference != null ? [s.reference] : []);
  const lo = Math.min(0, ...vals);
  const hi = Math.max(0, ...vals);
  const span = hi - lo || 1;
  const sx = (v) => padL + ((v - lo) / span) * (x1 - padL);
  const zero = sx(0);

  const fmt = s.format || ((v) => String(Math.round(v)));

  const rows = bars
    .map((b, i) => {
      const y = padT + i * rowH;
      const bx = sx(b.value);
      const left = Math.min(zero, bx), width = Math.abs(bx - zero);
      const neg = b.value < 0;
      // The value label sits outside the bar on the side it grows towards, so
      // a short bar never has its number painted on top of itself.
      const lx = neg ? left - 8 : left + width + 8;
      return `<rect x="${left.toFixed(1)}" y="${y + 9}" width="${Math.max(width, 1).toFixed(1)}" height="22" class="ch__bar${neg ? " ch__bar--neg" : ""}"/>
<text x="${padL - 12}" y="${y + 24}" class="ch__blab">${esc(b.label)}</text>
<text x="${lx.toFixed(1)}" y="${y + 24}" class="ch__v" text-anchor="${neg ? "end" : "start"}">${esc(fmt(b.value))}</text>`;
    })
    .join("");

  const refX = s.reference != null ? sx(s.reference) : null;
  const ref =
    refX == null
      ? ""
      : `<line x1="${refX.toFixed(1)}" y1="${padT - 4}" x2="${refX.toFixed(1)}" y2="${h - padB + 6}" class="ch__ref"/>
<text x="${refX.toFixed(1)}" y="${h - padB + 24}" class="ch__xl">${esc(s.referenceLabel || fmt(s.reference))}</text>`;

  const zeroLine =
    lo < 0 ? `<line x1="${zero.toFixed(1)}" y1="${padT - 4}" x2="${zero.toFixed(1)}" y2="${h - padB + 6}" class="ch__g ch__g--zero"/>` : "";

  return `<figure class="ch">
<svg viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="${esc(id)}-t" preserveAspectRatio="xMidYMid meet">
<title id="${esc(id)}-t">${esc(s.sentence || barSentence(s, fmt))}</title>
${zeroLine}${ref}${rows}
</svg>
</figure>`;
}

/* The accessible sentence for a bar chart. Built from the same values the
   bars are drawn from, so a screen reader and a sighted reader get the same
   finding rather than two that drifted. */
export function barSentence(s, fmt = (v) => String(Math.round(v))) {
  const parts = [s.label + "."];
  for (const b of s.bars || []) parts.push(`${b.label}, ${fmt(b.value)}.`);
  if (s.reference != null) parts.push(`Measured against ${s.referenceLabel || fmt(s.reference)}.`);
  return parts.join(" ");
}
