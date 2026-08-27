#!/usr/bin/env node
/* The Chartbook as one PDF. Same seven charts, same figures, same
   sources, still ungated. Built from the same `chartbook.json` and the
   same geometry the web page uses, so the two cannot disagree.
 
   Vector throughout: no screenshots, no headless browser, nothing to
   install. The whole file is a few hundred kilobytes and stays sharp
   at any zoom or print size. */

import { createPdf, A4 } from "../src/pdf/pdf.mjs";
import { wrap, textWidth, toWinAnsi } from "../src/pdf/metrics.mjs";
import { chartGeometry } from "../src/charts.mjs";
import { NOTES, reading } from "../src/templates/chartbook.mjs";
import { longDate } from "../src/lib.mjs";

/* Palette, matching the site. PDF wants 0-1 components. */
const INK = [0.09, 0.09, 0.09];
const MUTED = [0.42, 0.42, 0.42];
const RED = [0.86, 0, 0];
const HAIR = [0.89, 0.89, 0.88];
const CREAM = [0.925, 0.898, 0.753];
const WHITE = [1, 1, 1];

const M = { l: 62, r: 62, t: 64, b: 58 };
const COL = A4.w - M.l - M.r;
// The cover sets a shorter measure than the body pages; long lines under a
// 34pt headline read badly.
const COVER_COL = COL - 120;

const SERIF = "Times-Roman", SERIF_B = "Times-Bold";
const SANS = "Helvetica", SANS_B = "Helvetica-Bold";

/* Strip the light HTML the reading line carries, since a PDF has no
   <b>. The emphasis is lost; the number is not, and the number is the
   part that matters. */
const plain = (s) => String(s).replace(/<[^>]+>/g, "");

/* The latest reading, formatted the way the chart labels it. Reading
   `s.latest.value` raw drops the decimals and the unit, which turned
   0.47 percentage points into a bare "0.47" on the contents page. */
const latest = (s) =>
  `${s.unit === "USD" ? "$" : ""}${Number(s.latest.value).toFixed(s.dp)}${
    s.unit === "%" ? "%" : s.unit === "pp" ? "pp" : ""
  }`;

function rule(doc, y, { color = HAIR, width = 1, from = M.l, to = A4.w - M.r } = {}) {
  doc.line(from, y, to, y, { color, lineWidth: width });
}

function eyebrow(doc, text, y) {
  doc.line(M.l, y - 4, M.l + 18, y - 4, { color: RED, lineWidth: 2 });
  doc.text(text.toUpperCase(), M.l + 26, y - 9, { font: SANS_B, size: 8, color: INK });
  return y + 10;
}

function footer(doc, page, total) {
  const y = A4.h - 34;
  rule(doc, y - 12);
  doc.text("The Chartbook  |  investmentsplaybook.com/chartbook", M.l, y, { font: SANS, size: 7.5, color: MUTED });
  doc.text(`${page} of ${total}`, A4.w - M.r, y, { font: SANS, size: 7.5, color: MUTED, align: "right" });
}

/* ---------------- the chart ---------------- */
function drawChart(doc, s, top, width, height) {
  const g = chartGeometry(s, { w: width, h: height, pad: { l: 46, r: 16, t: 30, b: 24 } });
  if (!g) return top;
  const X = (v) => M.l + v;
  const Y = (v) => top + v;

  // Gridlines and their labels.
  for (const t of g.grid) {
    doc.line(X(g.plot.x0), Y(t.y), X(g.plot.x1), Y(t.y), {
      color: t.zero ? [0.55, 0.55, 0.55] : HAIR,
      lineWidth: t.zero ? 0.9 : 0.5,
    });
    doc.text(t.label, X(g.plot.x0) - 6, Y(t.y) - 3.4, { font: SANS, size: 6.8, color: MUTED, align: "right" });
  }

  // The area under the line. A flat wash rather than the page's gradient:
  // PDF shading patterns are a lot of machinery for a tint nobody would
  // miss, and a solid 8 percent reads the same at print size.
  doc.path(
    [...g.line.map(([x, y]) => [X(x), Y(y)]), [X(g.line.at(-1)[0]), Y(g.plot.y1)], [X(g.line[0][0]), Y(g.plot.y1)]],
    { fill: [0.98, 0.92, 0.92], close: true }
  );

  doc.path(g.line.map(([x, y]) => [X(x), Y(y)]), { stroke: RED, lineWidth: 1.1 });

  // The last observation, marked and labelled.
  doc.circle(X(g.last.x), Y(g.last.y), 2, { fill: RED, stroke: WHITE, lineWidth: 1 });
  const lw = textWidth(toWinAnsi(g.last.label), SANS_B, 8);
  const lx = g.last.anchor === "end" ? X(g.last.labelX) - lw : X(g.last.labelX);
  // A white plate behind the figure, for the same reason the web chart has
  // a halo: on a noisy daily series the label sometimes lands on the line.
  doc.rect(lx - 2, Y(g.last.labelY) - 2, lw + 4, 10, { fill: WHITE });
  doc.text(g.last.label, lx, Y(g.last.labelY), { font: SANS_B, size: 8, color: RED });

  for (const t of g.years) {
    doc.text(String(t.year), X(t.x), Y(g.h - 16), { font: SANS, size: 6.8, color: MUTED, align: "center", width: 0 });
  }
  // Year labels are centred by hand, since `align: center` needs a box width.
  return top + height;
}

/* ---------------- pages ---------------- */
function cover(doc, data, series) {
  doc.addPage();
  doc.rect(0, 0, A4.w, 150, { fill: [0.04, 0.04, 0.04] });
  doc.text("INVESTMENTS", M.l, 52, { font: SERIF, size: 21, color: [1, 1, 1] });
  doc.text("PLAYBOOK", M.l + textWidth("INVESTMENTS ", SERIF, 21), 52, { font: SERIF_B, size: 21, color: [0.92, 0.15, 0.15] });
  doc.line(M.l, 96, M.l + 40, 96, { color: RED, lineWidth: 2.5 });
  doc.text("THE CHARTBOOK", M.l, 108, { font: SANS_B, size: 9, color: [0.75, 0.75, 0.75] });

  let y = 210;
  doc.text(`${series.length} charts. ${data.windowYears || 12} years.`, M.l, y, { font: SERIF, size: 34, color: INK });
  y += 42;
  doc.text("What each one does to the price", M.l, y, { font: SERIF, size: 34, color: INK });
  y += 42;
  doc.text("of a property.", M.l, y, { font: SERIF, size: 34, color: INK });

  y += 70;
  rule(doc, y, { to: M.l + COVER_COL });
  y += 22;
  for (const line of wrap(
    "This is the same chartbook published at investmentsplaybook.com/chartbook, in one file. There is no email gate on either. Every series here is produced by an agency of the United States government and is public domain under 17 U.S.C. 105, which is what makes republishing it in full legitimate. Reproduce these charts, quote the figures, put them in a deck. A link back is appreciated and not required.",
    SERIF, 11.5, COVER_COL
  )) {
    doc.text(line, M.l, y, { font: SERIF, size: 11.5, color: INK });
    y += 17;
  }

  y += 30;
  doc.rect(M.l, y, COVER_COL, 2, { fill: RED });
  y += 18;
  doc.text("IN THIS EDITION", M.l, y, { font: SANS_B, size: 8, color: MUTED });
  y += 18;
  series.forEach((s, i) => {
    const note = NOTES[s.key];
    doc.text(String(i + 1).padStart(2, "0"), M.l, y, { font: "Courier", size: 9, color: RED });
    doc.text(note ? note.heading : s.label, M.l + 26, y, { font: SERIF, size: 11.5, color: INK });
    doc.text(latest(s), A4.w - M.r, y, { font: SANS_B, size: 9.5, color: INK, align: "right" });
    y += 19;
  });

  y = A4.h - 92;
  rule(doc, y);
  doc.text(
    `Data last refreshed ${longDate((data.asOf || "").slice(0, 10))}. Figures are as published by their sources on the dates shown on each chart.`,
    M.l, y + 12, { font: SANS, size: 8, color: MUTED }
  );
  doc.text("Educational research and general information. Not personal investment advice.", M.l, y + 26, { font: SANS, size: 8, color: MUTED });
}

function chartPage(doc, s, index, total) {
  const note = NOTES[s.key];
  doc.addPage();

  let y = M.t;
  y = eyebrow(doc, `Chart ${index} of ${total}`, y);
  doc.text(note ? note.heading : s.label, M.l, y, { font: SERIF, size: 25, color: INK });
  y += 36;

  if (note) {
    for (const line of wrap(note.what, SERIF, 11.5, COL)) {
      doc.text(line, M.l, y, { font: SERIF, size: 11.5, color: INK });
      y += 16.5;
    }
  }
  y += 14;

  y = drawChart(doc, s, y, COL, 200);
  y += 6;

  doc.text(
    `${s.label}. Source: ${s.source}. Shown from ${longDate(s.first)} to ${longDate(s.last)}.`,
    M.l, y, { font: SANS, size: 7.5, color: MUTED }
  );
  y += 22;

  // The reading, in the cream block the site uses for the same thing.
  const readLines = wrap(plain(reading(s)), SANS, 9.5, COL - 24);
  const boxH = readLines.length * 13 + 18;
  doc.rect(M.l, y, COL, boxH, { fill: CREAM });
  doc.rect(M.l, y, 2.5, boxH, { fill: RED });
  let ry = y + 9;
  for (const line of readLines) { doc.text(line, M.l + 14, ry, { font: SANS, size: 9.5, color: INK }); ry += 13; }
  y += boxH + 24;

  if (note) {
    for (const para of note.body) {
      for (const line of wrap(para, SERIF, 11.5, COL)) {
        doc.text(line, M.l, y, { font: SERIF, size: 11.5, color: INK });
        y += 16.5;
      }
      y += 10;
    }
    y += 4;
    rule(doc, y);
    y += 12;
    doc.text("THE FRAMEWORKS THAT APPLY", M.l, y, { font: SANS_B, size: 7.5, color: MUTED });
    y += 14;
    for (const [href, title, blurb] of note.links) {
      doc.text(title, M.l, y, { font: SERIF_B, size: 10, color: INK });
      // The URL is set flush right on the same line. If the two would meet,
      // the path alone still identifies the page, so the host is dropped
      // rather than letting the strings overlap.
      const full = `investmentsplaybook.com${href}`;
      const room = COL - textWidth(toWinAnsi(title), SERIF_B, 10) - 16;
      const url = textWidth(toWinAnsi(full), SANS, 7.5) <= room ? full : href;
      doc.text(url, A4.w - M.r, y + 1, { font: SANS, size: 7.5, color: MUTED, align: "right" });
      y += 13;
      for (const line of wrap(blurb, SERIF, 9.5, COL - 40)) { doc.text(line, M.l, y, { font: SERIF, size: 9.5, color: MUTED }); y += 12; }
      y += 6;
    }
  }
}

function backPage(doc, data, series) {
  doc.addPage();
  let y = M.t;
  y = eyebrow(doc, "Sources and terms", y);
  doc.text("Where every figure came from.", M.l, y, { font: SERIF, size: 25, color: INK });
  y += 44;

  for (const s of series) {
    doc.text(NOTES[s.key] ? NOTES[s.key].heading : s.label, M.l, y, { font: SERIF_B, size: 10.5, color: INK });
    y += 14;
    for (const line of wrap(`${s.label}. ${s.source}. ${s.sourceUrl}`, SANS, 8.5, COL)) {
      doc.text(line, M.l, y, { font: SANS, size: 8.5, color: MUTED });
      y += 11;
    }
    y += 10;
  }

  y += 10;
  rule(doc, y);
  y += 20;
  for (const [title, text] of [
    ["Reuse", "Every series in this document is produced by an agency of the United States government and is in the public domain under 17 U.S.C. 105. The charts and figures may be reproduced freely. A link to investmentsplaybook.com/chartbook is appreciated and not required."],
    ["What is deliberately absent", "No proprietary equity index appears anywhere in this document. No S&P 500, no FTSE, no Dow, and no Case-Shiller or VIX, which are the intellectual property of their publishers and are not ours to republish."],
    ["How current this is", `The underlying history is refreshed weekly rather than daily, because twelve years of data does not move between one day and the next. This edition was generated from data last refreshed ${longDate((data.asOf || "").slice(0, 10))}. The live version at investmentsplaybook.com/chartbook always carries the latest.`],
    ["What this is not", "Investments Playbook publishes educational research and general information. Nothing here is personal investment advice, a solicitation, or a recommendation to buy or sell any asset. Property and securities can fall in value, and past performance does not predict future returns. Always take regulated professional advice before acting."],
  ]) {
    doc.text(title.toUpperCase(), M.l, y, { font: SANS_B, size: 8, color: RED });
    y += 14;
    for (const line of wrap(text, SERIF, 10.5, COL)) { doc.text(line, M.l, y, { font: SERIF, size: 10.5, color: INK }); y += 15; }
    y += 14;
  }
}

/* ---------------- build ---------------- */

/* Cover, one page per chart, sources at the back. Exported so the page
   that links to the PDF can state its length without anyone typing a
   number, and asserted against the real page count in the tests. */
export const pdfPageCount = (data) => {
  const n = Object.values(data.series || {}).length;
  return n ? n + 2 : 0;
};

export function buildChartbookPdf(data) {
  const series = Object.values(data.series || {});
  if (!series.length) return null;

  const doc = createPdf({
    title: `The Chartbook. ${series.length} charts, ${data.windowYears || 12} years.`,
    author: "Investments Playbook",
    subject: "Long-run US rates, inflation, the dollar and oil, and what each does to property and portfolios.",
  });

  cover(doc, data, series);
  series.forEach((s, i) => chartPage(doc, s, i + 1, series.length));
  backPage(doc, data, series);

  // Footers last, because "3 of 9" needs a page count that does not exist
  // until every page has been laid out. The cover gets none.
  const total = doc.pageCount;
  for (let i = 1; i < total; i++) {
    doc.selectPage(i);
    footer(doc, i + 1, total);
  }

  return doc.build();
}
