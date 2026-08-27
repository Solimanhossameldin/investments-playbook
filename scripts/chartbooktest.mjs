#!/usr/bin/env node
// Chartbook tests. The fetcher needs the network, so these run against
// synthetic series: the maths, the SVG geometry and the page contract are all
// checkable without FRED, and they are the parts that break.

import assert from "node:assert/strict";
import { downsample, yoy, spread, summarise } from "./fetch-chartbook.mjs";
import { niceStep, axis, lineChart, chartSentence } from "../src/charts.mjs";
import { chartbookPage, NOTES, reading } from "../src/templates/chartbook.mjs";

let n = 0;
const t = (name, fn) => { fn(); n++; };

const site = { name: "Test", origin: "https://example.com", disclaimer: "Not advice." };

/* A deterministic daily series with a spike in the middle, so a downsampler
   that quietly deletes extremes fails visibly. */
function series(days = 900, spikeAt = 450) {
  const out = [];
  const start = Date.UTC(2016, 0, 1);
  for (let i = 0; i < days; i++) {
    const d = new Date(start + i * 86400000).toISOString().slice(0, 10);
    out.push([d, i === spikeAt ? 99 : 1 + Math.sin(i / 40) * 2]);
  }
  return out;
}

/* ---------- downsample ---------- */
t("downsample leaves a short series alone", () => {
  const s = series(50);
  assert.equal(downsample(s, 240).length, 50);
});

t("downsample respects the budget", () => {
  const out = downsample(series(4000), 240);
  assert.ok(out.length <= 244, `got ${out.length}`);
});

t("downsample keeps the spike", () => {
  const out = downsample(series(4000, 2000), 240);
  assert.ok(out.some((p) => p[1] === 99), "the spike was deleted");
});

t("downsample keeps the first and last observation", () => {
  const s = series(4000);
  const out = downsample(s, 240);
  assert.equal(out[0][0], s[0][0]);
  assert.equal(out.at(-1)[0], s.at(-1)[0]);
});

t("downsample stays in date order and never repeats a date", () => {
  const out = downsample(series(4000), 240);
  const seen = new Set();
  for (let i = 1; i < out.length; i++) {
    assert.ok(out[i][0] >= out[i - 1][0], "out of order");
    assert.ok(!seen.has(out[i][0]), "duplicate date");
    seen.add(out[i][0]);
  }
});

/* ---------- year over year ---------- */
t("yoy computes the right percentage", () => {
  const monthly = Array.from({ length: 25 }, (_, i) => [`2020-${String((i % 12) + 1).padStart(2, "0")}-01`, 100 + i]);
  const out = yoy(monthly);
  assert.equal(out.length, 13);
  assert.equal(out[0][1], 12); // 112 against 100
});

t("yoy drops a zero base rather than dividing by it", () => {
  const m = Array.from({ length: 14 }, (_, i) => [`2020-01-${String(i + 1).padStart(2, "0")}`, i === 0 ? 0 : 100]);
  assert.ok(yoy(m).every(([, v]) => Number.isFinite(v)));
});

/* ---------- spread ---------- */
t("spread subtracts on shared dates only", () => {
  const a = [["2020-01-01", 4], ["2020-01-02", 5], ["2020-01-03", 6]];
  const b = [["2020-01-01", 1], ["2020-01-03", 2]];
  assert.deepEqual(spread(a, b), [["2020-01-01", 3], ["2020-01-03", 4]]);
});

t("spread does not carry a missing observation forward", () => {
  const a = [["2020-01-01", 4], ["2020-01-02", 5]];
  const b = [["2020-01-01", 1]];
  assert.equal(spread(a, b).length, 1);
});

/* ---------- summarise ---------- */
const S = summarise(series(900, 450), 2);

t("summarise finds the extremes", () => {
  assert.equal(S.max.value, 99);
  assert.ok(S.min.value < 0);
});

t("summarise picks a year-ago point at or before the anniversary", () => {
  assert.ok(S.yearAgo, "no year-ago point");
  const gap = (Date.parse(S.last) - Date.parse(S.yearAgo.date)) / 86400000;
  assert.ok(gap >= 365 && gap < 380, `gap was ${gap} days`);
});

t("summarise returns null year-ago when the history is too short", () => {
  assert.equal(summarise(series(30), 2).yearAgo, null);
});

/* ---------- axis ---------- */
t("niceStep returns a step a human would pick", () => {
  assert.equal(niceStep(10, 5), 2);
  assert.equal(niceStep(1, 5), 0.2);
});

t("axis brackets the data", () => {
  const a = axis(-1.19, 2.51);
  assert.ok(a.lo <= -1.19 && a.hi >= 2.51);
});

t("axis ticks do not drift on fractional steps", () => {
  for (const tick of axis(0, 1).ticks) {
    assert.ok(Math.abs(tick * 10 - Math.round(tick * 10)) < 1e-6, `drifted: ${tick}`);
  }
});

t("axis handles a flat series without dividing by zero", () => {
  const a = axis(3, 3);
  assert.ok(a.hi > a.lo && a.ticks.length > 1);
});

/* ---------- the chart ---------- */
const spec = {
  key: "test", label: "Test series", unit: "%", dp: 2, zero: true,
  source: "Nowhere", sourceUrl: "https://example.com",
  ...summarise(series(900), 2), points: downsample(series(900), 240),
};
const svg = lineChart(spec);

t("the chart renders an svg", () => {
  assert.ok(svg.startsWith("<figure"));
  assert.ok(svg.includes("<svg viewBox="));
});

t("every coordinate is a finite number", () => {
  const d = svg.match(/ d="([^"]+)"/g).join(" ");
  for (const num of d.match(/-?\d+(\.\d+)?/g)) {
    assert.ok(Number.isFinite(Number(num)), `bad coordinate ${num}`);
  }
  assert.ok(!/NaN|Infinity|undefined/.test(svg), "svg contains a non-number");
});

t("the chart carries an accessible sentence, not just a picture", () => {
  assert.ok(/role="img"/.test(svg));
  assert.ok(/aria-labelledby="test-t"/.test(svg));
  assert.ok(/<title id="test-t">/.test(svg));
});

t("gradient ids are namespaced so two charts on a page do not collide", () => {
  const a = lineChart({ ...spec, key: "alpha" });
  const b = lineChart({ ...spec, key: "beta" });
  assert.ok(a.includes('id="alpha-f"') && b.includes('id="beta-f"'));
  assert.ok(!a.includes("beta-f"));
});

t("a zero line is drawn when the range crosses zero", () => {
  assert.ok(svg.includes("ch__g--zero"));
  assert.ok(!lineChart({ ...spec, zero: false }).includes("ch__g--zero"));
});

t("a series with one point renders nothing rather than a broken path", () => {
  assert.equal(lineChart({ ...spec, points: [["2020-01-01", 1]] }), "");
});

t("the sentence states now, a year ago, and the range", () => {
  const s = chartSentence(spec);
  assert.ok(/Now /.test(s) && /A year earlier/.test(s) && /ranged from/.test(s));
});

/* ---------- the page ---------- */
t("the page renders an honest empty state rather than blank charts", () => {
  const p = chartbookPage({ site, data: { asOf: null, windowYears: 12, series: {} } });
  assert.ok(p.body.includes("Not built yet"));
  assert.ok(!p.body.includes("<svg"));
  assert.deepEqual(p.jsonld, []);
});

const full = chartbookPage({
  site,
  data: { asOf: "2026-08-27T00:00:00.000Z", windowYears: 12, series: { "real-yield": { ...spec, key: "real-yield" } } },
});

t("the page renders a chart when there is data", () => {
  assert.ok(full.body.includes("<svg"));
  assert.ok(full.body.includes(NOTES["real-yield"].heading));
  assert.equal(full.path, "/chartbook/");
});

t("the page publishes the data date, not the build date", () => {
  assert.ok(/Data last refreshed/.test(full.body));
  assert.ok(!/twice a day/.test(full.body), "still claims a cadence it does not keep");
});

t("the page says it is free and ungated, and has no form", () => {
  assert.ok(/ungated/i.test(full.body));
  assert.ok(!/<form/.test(full.body));
});

t("every note points at frameworks that exist", async () => {
  const playbooks = (await import("../content/playbooks.mjs")).default;
  const slugs = new Set(playbooks.map((p) => p.slug));
  for (const [key, note] of Object.entries(NOTES)) {
    for (const [href] of note.links) {
      const slug = href.replace(/^\/playbooks\/|\/$/g, "");
      assert.ok(slugs.has(slug), `${key} links to /playbooks/${slug}/ which does not exist`);
    }
  }
});

t("every chart in the fetcher has an editorial note", async () => {
  const { CHARTS } = await import("./fetch-chartbook.mjs");
  for (const c of CHARTS) assert.ok(NOTES[c.key], `no note for ${c.key}`);
});

t("no proprietary index appears anywhere in the chartbook", async () => {
  const { CHARTS } = await import("./fetch-chartbook.mjs");
  const text = JSON.stringify(CHARTS) + JSON.stringify(NOTES);
  for (const banned of ["S&P", "Case-Shiller", "CaseShiller", "VIX", "FTSE", "Dow Jones", "Nasdaq", "DAX"]) {
    assert.ok(!text.includes(banned), `${banned} must not be published`);
  }
});

/* ---------- the reading line ---------- */
t("the reading line reports the direction correctly", () => {
  const up = reading({ ...spec, latest: { date: "2026-08-01", value: 2 }, yearAgo: { date: "2025-08-01", value: 1 }, min: { value: 0, date: "2020-01-01" }, max: { value: 3, date: "2021-01-01" } });
  assert.ok(up.includes("up from"));
  const down = reading({ ...spec, latest: { date: "2026-08-01", value: 1 }, yearAgo: { date: "2025-08-01", value: 2 }, min: { value: 0, date: "2020-01-01" }, max: { value: 3, date: "2021-01-01" } });
  assert.ok(down.includes("down from"));
  const flat = reading({ ...spec, latest: { date: "2026-08-01", value: 2 }, yearAgo: { date: "2025-08-01", value: 2 }, min: { value: 0, date: "2020-01-01" }, max: { value: 3, date: "2021-01-01" } });
  assert.ok(flat.includes("unchanged from"));
});

t("the reading line places the latest value in its range", () => {
  const hi = reading({ ...spec, latest: { date: "2026-08-01", value: 2.9 }, yearAgo: null, min: { value: 0, date: "2020-01-01" }, max: { value: 3, date: "2021-01-01" } });
  assert.ok(hi.includes("close to its high"));
  const lo = reading({ ...spec, latest: { date: "2026-08-01", value: 0.1 }, yearAgo: null, min: { value: 0, date: "2020-01-01" }, max: { value: 3, date: "2021-01-01" } });
  assert.ok(lo.includes("close to its low"));
});

t("a stale series says so on the page", () => {
  const p = chartbookPage({ site, data: { asOf: "2026-08-27T00:00:00.000Z", windowYears: 12, series: { "real-yield": { ...spec, key: "real-yield", stale: true } } } });
  assert.ok(p.body.includes("did not refresh"));
});

console.log(`chartbook: ${n} checks passed.`);

/* ---------- regressions found by looking at the rendered chart ---------- */
{
  const oil = { ...spec, unit: "USD", dp: 2, zero: true, points: downsample(series(900).map(([d, v]) => [d, v * 40]), 240) };
  const svgOil = lineChart({ ...oil, ...summarise(oil.points, 2) });
  t("an axis never mixes 150 with 0.0", () => {
    const labels = [...svgOil.matchAll(/class="ch__yl">(-?[\d.]+)</g)].map((m) => m[1]);
    const decimals = new Set(labels.map((l) => (l.split(".")[1] || "").length));
    assert.equal(decimals.size, 1, `mixed decimal formats: ${labels.join(", ")}`);
  });

  t("percentage points are not labelled as percent", () => {
    const pp = lineChart({ ...spec, key: "pp", unit: "pp" });
    assert.ok(/>-?[\d.]+pp</.test(pp), "pp suffix missing");
    assert.ok(!/>-?[\d.]+%</.test(pp), "pp series labelled as percent");
    assert.ok(reading({ ...spec, unit: "pp" }).includes(" points"));
  });

  t("the final label sits clear of the line it labels", () => {
    const up = [["2024-01-01", 1], ["2025-01-01", 2], ["2026-01-01", 3]];
    const down = [["2024-01-01", 3], ["2025-01-01", 2], ["2026-01-01", 1]];
    const yOf = (svg) => {
      const dot = +svg.match(/<circle cx="[\d.]+" cy="([\d.-]+)"/)[1];
      const txt = +svg.match(/<text x="[\d.-]+" y="([\d.-]+)" text-anchor/)[1];
      return { dot, txt };
    };
    const a = yOf(lineChart({ ...spec, key: "up", points: up, ...summarise(up, 2) }));
    const b = yOf(lineChart({ ...spec, key: "dn", points: down, ...summarise(down, 2) }));
    // SVG y grows downward: above the point is a smaller y.
    assert.ok(a.txt < a.dot, "a rising line should be labelled above");
    assert.ok(b.txt > b.dot, "a falling line should be labelled below");
  });

  t("the final label stays inside the frame", () => {
    for (const pts of [[["2024-01-01", 1], ["2026-01-01", 99]], [["2024-01-01", 99], ["2026-01-01", 1]]]) {
      const svg = lineChart({ ...spec, key: "edge", points: pts, ...summarise(pts, 2) });
      const y = +svg.match(/<text x="[\d.-]+" y="([\d.-]+)" text-anchor/)[1];
      assert.ok(y > 0 && y < 250, `label escaped the frame at y=${y}`);
    }
  });
}

console.log(`chartbook: 4 rendering regressions also covered.`);
