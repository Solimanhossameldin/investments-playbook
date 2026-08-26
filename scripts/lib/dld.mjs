/* Turning Dubai Land Department transaction records into something publishable.

   Two things shape this file. First, the column names in a DLD export are not
   stable across sources and years, so every field is resolved from a list of
   candidates rather than a fixed key. Second, and more importantly, a community
   with a handful of sales cannot support a published median, so the aggregation
   refuses to produce one rather than producing a bad one. */

/* ---------- CSV, including quoted fields with commas in them ---------- */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"') { inQuotes = true; continue; }
    if (c === ",") { row.push(field); field = ""; continue; }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
      continue;
    }
    field += c;
  }
  row.push(field);
  if (row.some((x) => x !== "")) rows.push(row);

  if (!rows.length) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/﻿/g, ""));
  return rows.slice(1).map((r) => {
    const o = {};
    header.forEach((h, i) => { o[h] = (r[i] ?? "").trim(); });
    return o;
  });
}

/* ---------- field resolution, because the headers move ---------- */
const CANDIDATES = {
  community: ["area_name_en", "area_name", "community", "master_project_en", "location", "area"],
  date: ["instance_date", "transaction_date", "date", "procedure_date"],
  amount: ["actual_worth", "trans_value", "amount", "property_price", "worth", "price"],
  areaSqm: ["procedure_area", "area_sqm", "property_size_sqm", "size_sqm", "procedure area"],
  meterPrice: ["meter_sale_price", "price_per_sqm", "meter_price"],
  propertyType: ["property_type_en", "property_type", "prop_type_en"],
  usage: ["property_usage_en", "property_usage", "usage_en"],
  procedure: ["procedure_name_en", "procedure_name", "trans_group_en", "procedure"],
  rooms: ["rooms_en", "rooms", "no_of_rooms"],
};

function pick(row, key) {
  for (const c of CANDIDATES[key]) {
    if (row[c] !== undefined && row[c] !== "") return row[c];
  }
  return "";
}

const num = (v) => {
  const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const SQFT_PER_SQM = 10.7639;

/* ---------- one CSV row to one normalised sale ---------- */
export function normalise(row) {
  const community = pick(row, "community").trim();
  if (!community) return null;

  // Sales only. Mortgages and gifts are transactions but they are not prices.
  const procedure = pick(row, "procedure").toLowerCase();
  if (procedure && !/sell|sale/.test(procedure)) return null;

  const amount = num(pick(row, "amount"));
  if (!amount || amount <= 0) return null;

  const sqm = num(pick(row, "areaSqm"));
  const meterPrice = num(pick(row, "meterPrice"));

  // Price per square foot, from whichever of the two is present.
  let perSqft = null;
  if (sqm && sqm > 0) perSqft = amount / (sqm * SQFT_PER_SQM);
  else if (meterPrice && meterPrice > 0) perSqft = meterPrice / SQFT_PER_SQM;

  const raw = pick(row, "date");
  const d = raw ? new Date(raw.length === 10 && raw.includes("-") ? raw : Date.parse(raw)) : null;
  const date = d && !isNaN(d) ? d.toISOString().slice(0, 10) : null;
  if (!date) return null;

  return {
    community,
    date,
    amount,
    sqft: sqm ? +(sqm * SQFT_PER_SQM).toFixed(1) : null,
    perSqft: perSqft ? +perSqft.toFixed(2) : null,
    propertyType: pick(row, "propertyType") || null,
    usage: pick(row, "usage") || null,
    rooms: pick(row, "rooms") || null,
  };
}

export function median(values) {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

function quantile(values, q) {
  const v = values.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const pos = (v.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return lo === hi ? v[lo] : v[lo] + (v[hi] - v[lo]) * (pos - lo);
}

export const slugify = (s) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---------- aggregation, with the honesty rule built in ---------- */
export function aggregate(sales, opts = {}) {
  const minSales = opts.minSales ?? 30;      // below this, publish nothing
  const windowDays = opts.windowDays ?? 365;
  const now = opts.now ? new Date(opts.now) : new Date();
  const cutoff = new Date(now.getTime() - windowDays * 86400000).toISOString().slice(0, 10);

  const byCommunity = new Map();
  for (const s of sales) {
    if (!s || s.date < cutoff) continue;
    if (!byCommunity.has(s.community)) byCommunity.set(s.community, []);
    byCommunity.get(s.community).push(s);
  }

  const communities = [];
  const skipped = [];

  for (const [name, rows] of byCommunity) {
    if (rows.length < minSales) {
      skipped.push({ community: name, sales: rows.length });
      continue;
    }

    const perSqft = rows.map((r) => r.perSqft).filter(Number.isFinite);
    // A median price per foot from a handful of usable rows is not a median.
    if (perSqft.length < Math.max(10, Math.floor(minSales / 3))) {
      skipped.push({ community: name, sales: rows.length, reason: "too few rows carry an area" });
      continue;
    }

    const dates = rows.map((r) => r.date).sort();
    const apartments = rows.filter((r) => /apart|flat|unit/i.test(r.propertyType || "")).length;
    const villas = rows.filter((r) => /villa|town/i.test(r.propertyType || "")).length;

    communities.push({
      name,
      slug: slugify(name),
      sales: rows.length,
      medianPerSqft: +median(perSqft).toFixed(0),
      p25PerSqft: +quantile(perSqft, 0.25).toFixed(0),
      p75PerSqft: +quantile(perSqft, 0.75).toFixed(0),
      medianPrice: +median(rows.map((r) => r.amount)).toFixed(0),
      medianSqft: median(rows.map((r) => r.sqft).filter(Number.isFinite)),
      apartments,
      villas,
      from: dates[0],
      to: dates[dates.length - 1],
    });
  }

  communities.sort((a, b) => b.sales - a.sales);
  skipped.sort((a, b) => b.sales - a.sales);

  return {
    generatedAt: now.toISOString(),
    windowDays,
    minSales,
    totalSales: sales.filter((s) => s && s.date >= cutoff).length,
    communities,
    skipped,
  };
}
