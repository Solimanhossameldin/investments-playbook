#!/usr/bin/env node
// Tests for the PDF writer and the chartbook PDF.
//
// A malformed PDF usually opens fine in one reader and not at all in
// another, so most of these check the file's structure by hand rather
// than trusting that it looked right in a preview.

import assert from "node:assert/strict";
import zlib from "node:zlib";
import { createPdf, A4 } from "../src/pdf/pdf.mjs";
import { toWinAnsi, textWidth, wrap, charWidth, FONTS, SLACK } from "../src/pdf/metrics.mjs";
import { buildChartbookPdf, pdfPageCount } from "./make-chartbook-pdf.mjs";
import { chartGeometry } from "../src/charts.mjs";

let n = 0;
const t = (name, fn) => { fn(); n++; };

/* ---------- metrics ---------- */
t("every printable ASCII character has a width in every font", () => {
  for (const f of FONTS) {
    for (let c = 32; c <= 126; c++) {
      assert.ok(charWidth(c, f) > 0, `${f} has no width for ${JSON.stringify(String.fromCharCode(c))}`);
    }
  }
});

t("Courier is monospaced and Times is not", () => {
  assert.equal(charWidth(105, "Courier"), charWidth(87, "Courier")); // i and W
  assert.notEqual(charWidth(105, "Times-Roman"), charWidth(87, "Times-Roman"));
});

t("the folding keeps the two dashes and drops what it cannot measure", () => {
  const s = toWinAnsi("a — b – c ’d’ “e” … f");
  assert.ok(s.includes(String.fromCharCode(151)), "em dash lost");
  assert.ok(s.includes(String.fromCharCode(150)), "en dash lost");
  assert.ok(s.includes("'d'") && s.includes('"e"'));
  assert.ok(s.includes("..."));
  assert.equal(toWinAnsi("日本語"), "");
});

t("every character that survives folding can be measured", () => {
  // The failure this prevents: a glyph with no width silently measures as
  // zero, the line looks short, and the text runs off the page.
  const sample = toWinAnsi(
    "Prices — rates, yields – and the dollar’s “peg” … 100% $4,628.70 §105 −1.19 °C • ok"
  );
  for (let i = 0; i < sample.length; i++) {
    assert.ok(charWidth(sample.charCodeAt(i), "Times-Roman") > 0,
      `no width for code ${sample.charCodeAt(i)} (${JSON.stringify(sample[i])})`);
  }
});

t("wrapping never exceeds the column", () => {
  const text = "The real yield is the closest thing that exists to a risk-free hurdle rate, and every other asset on earth is quietly priced against it, which is why this is the chart to read first.";
  for (const width of [120, 200, 340, 471]) {
    for (const [font, size] of [["Times-Roman", 11.5], ["Helvetica", 9.5], ["Times-Bold", 25]]) {
      for (const line of wrap(text, font, size, width)) {
        const w = textWidth(line, font, size);
        // A single word longer than the column is allowed to overhang; nothing else is.
        if (line.includes(" ")) assert.ok(w * SLACK <= width, `"${line}" is ${w.toFixed(1)}pt in a ${width}pt column`);
      }
    }
  }
});

t("wrapping loses no words and invents none", () => {
  const text = "One two three four five six seven eight nine ten eleven twelve";
  assert.equal(wrap(text, "Times-Roman", 11, 90).join(" "), text);
});

t("an unbreakable word is emitted rather than dropped", () => {
  const out = wrap("investmentsplaybook.com/playbooks/due-diligence-before-an-offer/", "Helvetica", 9, 40);
  assert.equal(out.length, 1);
  assert.ok(out[0].length > 20);
});

/* ---------- the writer ---------- */
function structure(buf) {
  const s = buf.toString("latin1");
  const m = s.match(/xref\n0 (\d+)\n([\s\S]*?)trailer/);
  assert.ok(m, "no cross-reference table");
  const count = Number(m[1]);
  const rows = m[2].trim().split("\n");
  return { s, count, rows, buf };
}

const doc = createPdf({ title: "T", author: "A" });
doc.addPage().text("Hello", 40, 40).line(40, 60, 200, 60);
doc.addPage().text("Second", 40, 40);
const simple = doc.build();

t("the file has a header and a terminator", () => {
  assert.ok(simple.subarray(0, 8).toString() === "%PDF-1.4");
  assert.ok(simple.toString("latin1").trimEnd().endsWith("%%EOF"));
});

t("every cross-reference offset points at the object it claims", () => {
  const { s, count, rows, buf } = structure(simple);
  assert.equal(rows.length, count);
  for (let i = 1; i < count; i++) {
    const off = Number(rows[i].slice(0, 10));
    const at = buf.subarray(off, off + 24).toString("latin1");
    assert.ok(at.startsWith(`${i} 0 obj`), `object ${i} is not at offset ${off} (found ${JSON.stringify(at.slice(0, 12))})`);
  }
  const start = Number(s.match(/startxref\n(\d+)/)[1]);
  assert.equal(buf.subarray(start, start + 4).toString(), "xref");
});

t("page count in the tree matches the pages written", () => {
  const s = simple.toString("latin1");
  assert.match(s, /\/Type \/Pages \/Count 2 /);
  assert.equal((s.match(/\/Type \/Page /g) || []).length, 2);
});

t("parentheses and backslashes in text cannot break the stream", () => {
  const d = createPdf();
  d.addPage().text("a (b) c \\ d", 10, 10);
  const raw = zlib.inflateSync(
    Buffer.from(d.build().toString("latin1").match(/stream\n([\s\S]*?)\nendstream/)[1], "latin1")
  ).toString("latin1");
  assert.ok(raw.includes("\\(b\\)"), "unescaped parenthesis");
  assert.ok(raw.includes("\\\\"), "unescaped backslash");
});

t("a non-finite coordinate is refused rather than written", () => {
  const d = createPdf();
  d.addPage();
  assert.throws(() => d.text("x", NaN, 10), /refusing to write/);
  assert.throws(() => d.line(0, 0, Infinity, 10), /refusing to write/);
});

t("a document with no pages is refused", () => {
  assert.throws(() => createPdf().build(), /no pages/);
});

t("selectPage reaches an earlier page and rejects one that does not exist", () => {
  const d = createPdf();
  d.addPage().text("one", 10, 10);
  d.addPage().text("two", 10, 10);
  d.selectPage(0).text("added later", 10, 30);
  assert.throws(() => d.selectPage(9), /no page 9/);
  assert.ok(d.build().length > 0);
});

/* ---------- the chartbook ---------- */
t("no data means no PDF, rather than an empty one", () => {
  assert.equal(buildChartbookPdf({ series: {} }), null);
  assert.equal(buildChartbookPdf({}), null);
});

const data = JSON.parse(
  (await import("node:fs")).readFileSync(new URL("../content/chartbook.json", import.meta.url), "utf8")
);
const series = Object.values(data.series || {});
const pdf = series.length ? buildChartbookPdf(data) : null;

if (!pdf) {
  console.log(`pdf: ${n} checks passed. Chartbook data is empty, so its own checks were skipped.`);
} else {
  const text = pdf.toString("latin1");

  t("one cover, one page per chart, one back page", () => {
    assert.match(text, new RegExp(`/Type /Pages /Count ${series.length + 2} `));
  });

  t("the chartbook's cross-reference table is sound", () => {
    const { count, rows, buf } = structure(pdf);
    for (let i = 1; i < count; i++) {
      const off = Number(rows[i].slice(0, 10));
      assert.ok(buf.subarray(off, off + 24).toString("latin1").startsWith(`${i} 0 obj`), `bad offset for object ${i}`);
    }
  });

  t("every page's content stream decompresses", () => {
    const streams = [...text.matchAll(/\/Filter \/FlateDecode >>\nstream\n/g)];
    assert.equal(streams.length, series.length + 2);
    let at = 0, ok = 0;
    for (const m of streams) {
      const start = m.index + m[0].length;
      const end = text.indexOf("\nendstream", start);
      const out = zlib.inflateSync(Buffer.from(text.slice(start, end), "latin1")).toString("latin1");
      assert.ok(out.length > 0);
      assert.ok(!/NaN|Infinity|undefined/.test(out), "a page stream contains a non-number");
      ok++; at = end;
    }
    assert.equal(ok, series.length + 2);
  });

  t("the contents page prints each figure with its unit and decimals", () => {
    const cover = zlib.inflateSync(
      Buffer.from(text.slice(text.indexOf("stream\n", text.indexOf("/FlateDecode")) + 7, text.indexOf("\nendstream")), "latin1")
    ).toString("latin1");
    for (const s of series) {
      const want = `${s.unit === "USD" ? "$" : ""}${Number(s.latest.value).toFixed(s.dp)}${
        s.unit === "%" ? "%" : s.unit === "pp" ? "pp" : ""
      }`;
      assert.ok(cover.includes(`(${want})`), `the cover does not show ${s.key} as ${want}`);
    }
  });

  t("the chart geometry stays inside its box", () => {
    for (const s of series) {
      const g = chartGeometry(s, { w: 471, h: 200, pad: { l: 46, r: 16, t: 30, b: 24 } });
      for (const [x, y] of g.line) {
        assert.ok(x >= g.plot.x0 - 0.5 && x <= g.plot.x1 + 0.5, `${s.key}: x ${x} outside the plot`);
        assert.ok(y >= g.plot.y0 - 0.5 && y <= g.plot.y1 + 0.5, `${s.key}: y ${y} outside the plot`);
      }
      assert.ok(g.last.labelY >= 0 && g.last.labelY <= g.h, `${s.key}: label escaped the chart`);
    }
  });

  t("no proprietary index appears on any page that carries data", () => {
    // The rule is about republishing index levels, not about saying the
    // words. The back page names S&P, FTSE and the rest precisely to
    // declare that they are deliberately absent, which is the opposite of
    // the problem, so it is exempt. The cover and the chart pages are not.
    const pageStreams = [...text.matchAll(/\/Filter \/FlateDecode >>\nstream\n/g)].map((m) => {
      const start = m.index + m[0].length;
      return zlib.inflateSync(Buffer.from(text.slice(start, text.indexOf("\nendstream", start)), "latin1")).toString("latin1");
    });
    const dataPages = pageStreams.slice(0, -1).join(" ");
    const backPage = pageStreams.at(-1);
    for (const banned of ["S&P", "Case-Shiller", "VIX", "FTSE", "Dow Jones", "Nasdaq"]) {
      assert.ok(!dataPages.includes(banned), `${banned} must not appear on a page carrying figures`);
    }
    assert.ok(backPage.includes("Case-Shiller"), "the exclusion should be declared, not silent");
    assert.ok(pageStreams.join(" ").includes("17 U.S.C. 105"), "the licence basis should be stated");
  });

  t("the advertised page count is the real one", () => {
    // The page links to the PDF and states its length. That number comes
    // from pdfPageCount, so this asserts the two cannot drift.
    const actual = (text.match(/\/Type \/Page /g) || []).length;
    assert.equal(pdfPageCount(data), actual, "the advertised page count is not what was written");
    assert.equal(pdfPageCount({ series: {} }), 0);
  });

  t("the PDF stays small enough to email", () => {
    assert.ok(pdf.length < 900 * 1024, `${(pdf.length / 1024).toFixed(0)}KB is too big for a vector document`);
  });

  console.log(`pdf: ${n} checks passed, ${series.length + 2} pages, ${(pdf.length / 1024).toFixed(0)}KB.`);
}
