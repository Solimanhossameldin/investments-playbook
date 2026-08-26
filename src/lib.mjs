// Shared helpers. No dependencies.

export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Copy rules: no em-dashes, no middot separators. Enforced at render time.
export const copy = (s = "") =>
  String(s).replace(/—/g, ",").replace(/\s·\s/g, ", ").replace(/–/g, " to ");

export const fmt = (v, d = 2) =>
  v === null || v === undefined || Number.isNaN(v)
    ? "n/a"
    : Number(v).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export const pct = (v) =>
  v === null || v === undefined || Number.isNaN(v) ? "" : `${v > 0 ? "+" : ""}${Number(v).toFixed(2)}%`;

export const dir = (v) => (v > 0 ? "up" : v < 0 ? "dn" : "flat");
export const glyph = (v) => (v > 0 ? "▲" : v < 0 ? "▼" : "–");

export function briefLabel(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}.${p(d.getUTCMonth() + 1)}.${String(d.getUTCFullYear()).slice(2)}`;
}

export function longDate(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function gst(iso) {
  if (!iso) return "n/a";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "n/a";
  const h = (d.getUTCHours() + 4) % 24;
  return `${String(h).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

export function monthKey(iso) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

/* ---------------------------------------------------------------
   Minimal markdown. Handles headings, paragraphs, lists, tables,
   bold, italic, inline code, links and blockquote callouts.
   Deliberately small: the content is ours, so we control the input.
----------------------------------------------------------------*/
function inline(s) {
  return esc(copy(s))
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
}

export function md(src = "") {
  const lines = String(src).replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  const flushList = (tag, items) => out.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</${tag}>`);

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    if (/^###\s+/.test(line)) { out.push(`<h3>${inline(line.replace(/^###\s+/, ""))}</h3>`); i++; continue; }
    if (/^##\s+/.test(line)) { out.push(`<h2>${inline(line.replace(/^##\s+/, ""))}</h2>`); i++; continue; }

    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
      const head = buf.shift() || "";
      out.push(`<div class="callout"><b>${inline(head)}</b>${buf.length ? `<p>${inline(buf.join(" "))}</p>` : ""}</div>`);
      continue;
    }

    if (/^\|/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) { rows.push(lines[i]); i++; }
      const cells = (r) => r.split("|").slice(1, -1).map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(2).map(cells);
      const isNum = (v) => /^[\-+]?[\d(]/.test(v);
      out.push(
        `<div class="table-scroll"><table class="tbl"><thead><tr>${head
          .map((h, n) => `<th${n > 0 ? ' class="n"' : ""}>${inline(h)}</th>`)
          .join("")}</tr></thead><tbody>${body
          .map((r) => `<tr>${r.map((c, n) => `<td${n > 0 && isNum(c) ? ' class="n"' : ""}>${inline(c)}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^[-*]\s+/, "")); i++; }
      flushList("ul", items);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\d+\.\s+/, "")); i++; }
      flushList("ol", items);
      continue;
    }

    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|[-*]\s|\d+\.\s|\||>)/.test(lines[i])) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(buf.join(" "))}</p>`);
  }
  return out.join("\n");
}

export const COUNTRIES = ["United Arab Emirates","Saudi Arabia","Qatar","Kuwait","Bahrain","Oman","United Kingdom","United States","India","Pakistan","Egypt","Jordan","Lebanon","Canada","Australia","Singapore","Hong Kong","China","Germany","France","Italy","Spain","Netherlands","Switzerland","Sweden","Norway","Denmark","Ireland","Portugal","Greece","Turkey","Russia","Ukraine","Kazakhstan","Azerbaijan","Nigeria","Kenya","South Africa","Ghana","Morocco","Tunisia","Algeria","Iraq","Syria","Yemen","Sudan","Libya","Bangladesh","Sri Lanka","Nepal","Philippines","Indonesia","Malaysia","Thailand","Vietnam","Japan","South Korea","New Zealand","Brazil","Argentina","Mexico","Chile","Colombia","Poland","Czechia","Romania","Hungary","Austria","Belgium","Finland","Israel","Cyprus","Malta","Other"];

export const DIAL = [["+971","AE"],["+966","SA"],["+974","QA"],["+965","KW"],["+973","BH"],["+968","OM"],["+44","UK"],["+1","US"],["+91","IN"],["+92","PK"],["+20","EG"],["+962","JO"],["+961","LB"],["+61","AU"],["+65","SG"],["+852","HK"],["+86","CN"],["+49","DE"],["+33","FR"],["+39","IT"],["+34","ES"],["+31","NL"],["+41","CH"],["+353","IE"],["+90","TR"],["+7","RU"],["+234","NG"],["+254","KE"],["+27","ZA"],["+212","MA"],["+880","BD"],["+94","LK"],["+63","PH"],["+62","ID"],["+60","MY"],["+66","TH"],["+81","JP"],["+82","KR"],["+55","BR"],["+52","MX"],["+48","PL"],["+972","IL"]];

export const INTENTS = [
  "Buy my first investment property",
  "Add to an existing property portfolio",
  "Build a global markets portfolio",
  "Diversify out of a single market",
  "Relocate or set up in the UAE",
  "Just learning",
];
