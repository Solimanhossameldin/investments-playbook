#!/usr/bin/env node
/* Builds content/communities.json from Dubai Land Department transactions.

   Two sources, same output, deliberately:

   1. Any CSV files dropped in content/dld/. The DLD publishes a transaction
      search with a CSV export behind a captcha, which a person can use once a
      month and a script cannot. Drop the file in and this works today.
   2. The Dubai Pulse API, when DUBAI_PULSE_KEY and DUBAI_PULSE_SECRET exist.
      Registration takes up to a fortnight, which is why it is not the only path.

   Everything downstream reads the normalised shape, so switching sources
   changes nothing else. */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseCsv, normalise, aggregate } from "./lib/dld.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dropDir = path.join(root, "content/dld");
const outPath = path.join(root, "content/communities.json");

const MIN_SALES = 30;
const WINDOW_DAYS = 365;

function fromCsvDrop() {
  if (!fs.existsSync(dropDir)) return { sales: [], files: [] };
  const files = fs.readdirSync(dropDir).filter((f) => f.toLowerCase().endsWith(".csv"));
  const sales = [];
  for (const f of files) {
    const text = fs.readFileSync(path.join(dropDir, f), "utf8");
    for (const row of parseCsv(text)) {
      const s = normalise(row);
      if (s) sales.push(s);
    }
  }
  return { sales, files };
}

async function fromApi() {
  const key = process.env.DUBAI_PULSE_KEY;
  const secret = process.env.DUBAI_PULSE_SECRET;
  if (!key || !secret) return null;

  // The response shape is mapped in exactly one place on purpose. If the real
  // API differs from the documentation, this function is the only thing to fix.
  const from = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString().slice(0, 10);
  const url =
    "https://api.dubaipulse.gov.ae/open/dld/dld_transactions-open" +
    `?limit=50000&filter=instance_date>=${from}`;

  const r = await fetch(url, {
    headers: { "X-API-Key": key, "X-API-Secret": secret, Accept: "application/json" },
  });
  if (!r.ok) throw new Error(`Dubai Pulse HTTP ${r.status}`);
  const body = await r.json();
  const rows = Array.isArray(body) ? body : body.data || body.results || [];

  const sales = [];
  for (const row of rows) {
    // lowercase the keys so the same resolver works on API rows and CSV rows
    const lower = {};
    Object.keys(row).forEach((k) => { lower[k.toLowerCase()] = row[k]; });
    const s = normalise(lower);
    if (s) sales.push(s);
  }
  return sales;
}

let sales = [];
let source = "none";
let note = "";

try {
  const api = await fromApi();
  if (api && api.length) { sales = api; source = "Dubai Pulse API"; }
} catch (e) {
  note = `API attempt failed: ${String(e.message || e).slice(0, 140)}`;
}

if (!sales.length) {
  const drop = fromCsvDrop();
  if (drop.sales.length) {
    sales = drop.sales;
    source = `CSV export (${drop.files.join(", ")})`;
  }
}

const out = sales.length
  ? { source, note, ...aggregate(sales, { minSales: MIN_SALES, windowDays: WINDOW_DAYS }) }
  : {
      source: "none",
      note:
        note ||
        "No data yet. Export a transactions CSV from the Dubai Land Department open data search and drop it in content/dld/, or set DUBAI_PULSE_KEY and DUBAI_PULSE_SECRET.",
      generatedAt: new Date().toISOString(),
      windowDays: WINDOW_DAYS,
      minSales: MIN_SALES,
      totalSales: 0,
      communities: [],
      skipped: [],
    };

fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + "\n");

console.log(`Communities: ${out.communities.length} published, ${out.skipped.length} withheld for too little data.`);
console.log(`  source: ${out.source}${out.note ? `  (${out.note})` : ""}`);
if (out.communities.length) {
  console.log(`  ${out.totalSales} sales in the last ${WINDOW_DAYS} days`);
}
