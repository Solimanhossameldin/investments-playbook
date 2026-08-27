/* A very small PDF writer. No dependencies beyond node:zlib, which is
   built in.
 
   This exists because the charts are already vector geometry computed
   at build time, and a PDF is a vector format. Handing the same
   coordinates to a page description language is less work than
   installing a headless browser in CI to photograph a web page, and it
   produces a file a tenth the size that stays sharp at any zoom.
 
   Coordinates here are top-left origin, like every other layout system
   on this project. PDF's own origin is bottom-left; the flip happens in
   one place, in `y()`. */

import zlib from "node:zlib";
import { toWinAnsi, textWidth } from "./metrics.mjs";

export const A4 = { w: 595.28, h: 841.89 };

const FONT_IDS = {
  "Times-Roman": "F1",
  "Times-Bold": "F2",
  Helvetica: "F3",
  "Helvetica-Bold": "F4",
  Courier: "F5",
};

const n = (v) => {
  if (!Number.isFinite(v)) throw new Error(`refusing to write ${v} into a PDF`);
  return (Math.round(v * 100) / 100).toString();
};

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

export function createPdf({ size = A4, title = "", author = "", subject = "", compress = true } = {}) {
  const pages = [];
  let ops = null;
  const y = (v) => size.h - v;

  const api = {
    get pageCount() { return pages.length; },
    get width() { return size.w; },
    get height() { return size.h; },

    addPage() {
      ops = [];
      pages.push(ops);
      return api;
    },

    /* Go back to an earlier page to draw on it. Page furniture that needs
       the final page count -- "3 of 9" -- cannot be drawn as each page is
       created, so it is added at the end. Zero-based. */
    selectPage(i) {
      if (!pages[i]) throw new Error(`no page ${i}`);
      ops = pages[i];
      return api;
    },

    /* --- text --- */
    text(str, x, top, { font = "Times-Roman", size: fs = 11, color = [0, 0, 0], align = "left", width = 0 } = {}) {
      const s = toWinAnsi(str);
      if (!s) return api;
      let tx = x;
      if (align === "right") tx = x - textWidth(s, font, fs);
      else if (align === "center") tx = x + (width - textWidth(s, font, fs)) / 2;
      ops.push(
        `BT /${FONT_IDS[font]} ${n(fs)} Tf ${n(color[0])} ${n(color[1])} ${n(color[2])} rg ${n(tx)} ${n(y(top + fs))} Td (${esc(s)}) Tj ET`
      );
      return api;
    },

    /* Draws already-wrapped lines and returns the y just past the last one,
       so a caller can stack blocks without counting line heights by hand. */
    lines(arr, x, top, leading, opts = {}) {
      let t = top;
      for (const l of arr) { api.text(l, x, t, opts); t += leading; }
      return t;
    },

    /* --- shapes --- */
    rect(x, top, w, h, { fill = null, stroke = null, lineWidth = 1 } = {}) {
      const parts = [];
      if (fill) parts.push(`${n(fill[0])} ${n(fill[1])} ${n(fill[2])} rg`);
      if (stroke) parts.push(`${n(stroke[0])} ${n(stroke[1])} ${n(stroke[2])} RG ${n(lineWidth)} w`);
      parts.push(`${n(x)} ${n(y(top + h))} ${n(w)} ${n(h)} re`);
      parts.push(fill && stroke ? "B" : fill ? "f" : "S");
      ops.push(parts.join(" "));
      return api;
    },

    line(x1, t1, x2, t2, { color = [0, 0, 0], lineWidth = 1, dash = null } = {}) {
      ops.push(
        `q ${n(color[0])} ${n(color[1])} ${n(color[2])} RG ${n(lineWidth)} w` +
          (dash ? ` [${dash.join(" ")}] 0 d` : "") +
          ` ${n(x1)} ${n(y(t1))} m ${n(x2)} ${n(y(t2))} l S Q`
      );
      return api;
    },

    /* points are [x, topY] pairs. */
    path(points, { stroke = null, fill = null, lineWidth = 1, close = false } = {}) {
      if (points.length < 2) return api;
      const parts = ["q"];
      if (fill) parts.push(`${n(fill[0])} ${n(fill[1])} ${n(fill[2])} rg`);
      if (stroke) parts.push(`${n(stroke[0])} ${n(stroke[1])} ${n(stroke[2])} RG ${n(lineWidth)} w 1 j 1 J`);
      points.forEach(([px, pt], i) => parts.push(`${n(px)} ${n(y(pt))} ${i ? "l" : "m"}`));
      if (close) parts.push("h");
      parts.push(fill && stroke ? "B" : fill ? "f" : "S", "Q");
      ops.push(parts.join(" "));
      return api;
    },

    circle(cx, ct, r, { fill = null, stroke = null, lineWidth = 1 } = {}) {
      // Four Bezier arcs. 0.5523 is the standard circle approximation.
      const k = r * 0.5523, cy = y(ct);
      const parts = ["q"];
      if (fill) parts.push(`${n(fill[0])} ${n(fill[1])} ${n(fill[2])} rg`);
      if (stroke) parts.push(`${n(stroke[0])} ${n(stroke[1])} ${n(stroke[2])} RG ${n(lineWidth)} w`);
      parts.push(
        `${n(cx - r)} ${n(cy)} m`,
        `${n(cx - r)} ${n(cy + k)} ${n(cx - k)} ${n(cy + r)} ${n(cx)} ${n(cy + r)} c`,
        `${n(cx + k)} ${n(cy + r)} ${n(cx + r)} ${n(cy + k)} ${n(cx + r)} ${n(cy)} c`,
        `${n(cx + r)} ${n(cy - k)} ${n(cx + k)} ${n(cy - r)} ${n(cx)} ${n(cy - r)} c`,
        `${n(cx - k)} ${n(cy - r)} ${n(cx - r)} ${n(cy - k)} ${n(cx - r)} ${n(cy)} c`,
        fill && stroke ? "B" : fill ? "f" : "S",
        "Q"
      );
      ops.push(parts.join(" "));
      return api;
    },

    /* --- output --- */
    build() {
      if (!pages.length) throw new Error("a PDF with no pages is not a PDF");

      const objects = [];
      const add = (body) => { objects.push(body); return objects.length; };

      const catalogId = add(null);   // patched below, once the page tree id is known
      const pagesId = add(null);
      const fontIds = {};
      for (const [name, key] of Object.entries(FONT_IDS)) {
        fontIds[key] = add(
          `<< /Type /Font /Subtype /Type1 /BaseFont /${name} /Encoding /WinAnsiEncoding >>`
        );
      }
      const fontRes = Object.entries(fontIds).map(([k, id]) => `/${k} ${id} 0 R`).join(" ");

      const pageIds = [];
      const streams = [];
      for (const pageOps of pages) {
        const raw = Buffer.from(pageOps.join("\n"), "latin1");
        const data = compress ? zlib.deflateSync(raw, { level: 9 }) : raw;
        const streamId = add(null);
        streams.push({ id: streamId, data, compressed: compress });
        const pageId = add(null);
        pageIds.push({ id: pageId, streamId });
      }

      objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
      objects[pagesId - 1] =
        `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((p) => `${p.id} 0 R`).join(" ")}] ` +
        `/MediaBox [0 0 ${n(size.w)} ${n(size.h)}] /Resources << /Font << ${fontRes} >> >> >>`;
      for (const p of pageIds) objects[p.id - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /Contents ${p.streamId} 0 R >>`;

      const info = add(
        `<< /Title (${esc(toWinAnsi(title))}) /Author (${esc(toWinAnsi(author))}) ` +
          `/Subject (${esc(toWinAnsi(subject))}) /Producer (Investments Playbook, no dependencies) >>`
      );

      // Assemble, tracking byte offsets for the cross-reference table.
      const chunks = [];
      let offset = 0;
      const push = (buf) => { chunks.push(buf); offset += buf.length; };
      const pushStr = (s) => push(Buffer.from(s, "latin1"));

      pushStr("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

      const offsets = new Array(objects.length + 1).fill(0);
      const streamById = new Map(streams.map((s) => [s.id, s]));

      for (let i = 1; i <= objects.length; i++) {
        offsets[i] = offset;
        const st = streamById.get(i);
        if (st) {
          pushStr(
            `${i} 0 obj\n<< /Length ${st.data.length}${st.compressed ? " /Filter /FlateDecode" : ""} >>\nstream\n`
          );
          push(st.data);
          pushStr("\nendstream\nendobj\n");
        } else {
          pushStr(`${i} 0 obj\n${objects[i - 1]}\nendobj\n`);
        }
      }

      const xrefAt = offset;
      let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
      for (let i = 1; i <= objects.length; i++) {
        xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
      }
      pushStr(xref);
      pushStr(
        `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${info} 0 R >>\nstartxref\n${xrefAt}\n%%EOF\n`
      );

      return Buffer.concat(chunks);
    },
  };

  return api;
}
