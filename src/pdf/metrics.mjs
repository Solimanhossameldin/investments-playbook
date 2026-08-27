/* Character widths for the PDF base-14 fonts, in 1000ths of an em.
   These are Adobe's own metrics for Times and Helvetica, which every
   PDF reader on earth already has, so nothing needs embedding and the
   file stays small.

   Index is the WinAnsiEncoding code point. 32 to 126 is plain ASCII.
   Above 127 only the few characters this document actually uses are
   defined; anything else is transliterated to ASCII before it gets
   here, so a character with no width can never be measured wrong. */

const T = (s) => s.split(" ").map(Number);

const ASCII = {
  "Times-Roman": T("250 333 408 500 500 833 778 180 333 333 500 564 250 333 250 278 500 500 500 500 500 500 500 500 500 500 278 278 564 564 564 444 921 722 667 667 722 611 556 722 722 333 389 722 611 889 722 722 556 722 667 556 611 722 722 944 722 722 611 333 278 333 469 500 333 444 500 444 500 444 333 500 500 278 278 500 278 778 500 500 500 500 333 389 278 500 500 722 500 500 444 480 200 480 541"),
  "Times-Bold": T("250 333 555 500 500 1000 833 278 333 333 500 570 250 333 250 278 500 500 500 500 500 500 500 500 500 500 333 333 570 570 570 500 930 722 667 722 722 667 611 778 778 389 500 778 667 944 722 778 611 778 722 556 667 722 722 1000 722 722 667 333 278 333 581 500 333 500 556 444 556 444 333 500 556 278 333 556 278 833 556 500 556 556 444 389 333 556 500 722 500 500 444 394 220 394 520"),
  "Helvetica": T("278 278 355 556 556 889 667 191 333 333 389 584 278 333 278 278 556 556 556 556 556 556 556 556 556 556 278 278 584 584 584 556 1015 667 667 722 722 667 611 778 722 278 500 667 556 833 722 778 667 778 722 667 611 722 667 944 667 667 611 278 278 278 469 556 333 556 556 500 556 556 278 556 556 222 222 500 222 833 556 556 556 556 333 500 278 556 500 722 500 500 500 334 260 334 584"),
  "Helvetica-Bold": T("278 333 474 556 556 889 722 238 333 333 389 584 278 333 278 278 556 556 556 556 556 556 556 556 556 556 333 333 584 584 584 611 975 722 722 722 722 667 611 778 722 278 556 722 611 833 722 778 667 778 722 667 611 722 667 944 667 667 611 333 278 333 584 556 333 556 611 556 611 556 333 611 611 278 278 556 278 889 611 611 611 611 389 556 333 611 556 778 556 556 500 389 280 389 584"),
  Courier: Array(95).fill(600),
};

// The only characters above 127 this document uses. Everything else is
// transliterated in toWinAnsi below.
const HIGH = {
  "Times-Roman": { 150: 500, 151: 1000 },
  "Times-Bold": { 150: 500, 151: 1000 },
  Helvetica: { 150: 556, 151: 1000 },
  "Helvetica-Bold": { 150: 556, 151: 1000 },
  Courier: { 150: 600, 151: 600 },
};

export const FONTS = Object.keys(ASCII);

/* Fold typographic characters onto what WinAnsiEncoding and the width
   tables above can actually account for. An em dash and an en dash are
   kept because they carry meaning in this prose; the rest become their
   ASCII equivalents, which is better than a glyph of unknown width. */
export function toWinAnsi(s = "") {
  return String(s)
    .replace(/—/g, "")   // em dash
    .replace(/–/g, "")   // en dash
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/°/g, " deg")
    .replace(/§/g, "S.")
    .replace(/−/g, "-")
    .replace(/[•·]/g, "-")
    .replace(/[^\x20-\x7E]/g, "");
}

export function charWidth(code, font) {
  if (code >= 32 && code <= 126) return ASCII[font][code - 32];
  const h = HIGH[font];
  if (h && h[code] !== undefined) return h[code];
  return 0;
}

/* Width of an already-folded string, in points. */
export function textWidth(s, font, size) {
  let w = 0;
  for (let i = 0; i < s.length; i++) w += charWidth(s.charCodeAt(i), font);
  return (w * size) / 1000;
}

/* Greedy wrap. The 1.02 is slack: the metrics are exact for the base-14
   fonts, but a reader substituting a near-metric clone can be a hair
   wider, and a line that overflows the column is worse than one that
   breaks a word early. */
export const SLACK = 1.02;

export function wrap(text, font, size, maxWidth) {
  const words = toWinAnsi(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, font, size) * SLACK <= maxWidth || !line) {
      line = next;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}
