#!/usr/bin/env node
/* The community pages publish medians derived from someone else's export.
   Two things have to hold: the parsing must survive the shapes a DLD CSV
   actually takes, and the aggregation must refuse to publish a community it
   cannot support. The second is the one worth testing hardest, because a wrong
   median looks exactly like a right one. */

import { parseCsv, normalise, aggregate, median, slugify } from "./lib/dld.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, got) => {
  if (cond) { pass++; console.log(`  pass  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${got === undefined ? "" : `  got: ${JSON.stringify(got)}`}`); }
};

/* ---------- CSV parsing ---------- */
const CSV = `instance_date,area_name_en,procedure_name_en,actual_worth,procedure_area,property_type_en
2026-06-01,"Dubai Marina",Sell,1500000,83.6,Unit
2026-06-02,"Business Bay",Sell,"1,200,000",70.0,Unit
2026-06-03,"Dubai Marina",Mortgage Registration,900000,83.6,Unit
2026-06-04,"Jumeirah Village, Circle",Sell,850000,92.9,Unit`;

const rows = parseCsv(CSV);
ok("CSV: all data rows parsed", rows.length === 4, rows.length);
ok("CSV: quoted field with a comma stays one field",
  rows[3].area_name_en === "Jumeirah Village, Circle", rows[3].area_name_en);
ok("CSV: header is lowercased for lookup", rows[0].area_name_en === "Dubai Marina");

/* ---------- normalisation ---------- */
const n0 = normalise(rows[0]);
ok("sale is normalised", !!n0);
ok("price per sqft computed from square metres",
  n0.perSqft === +(1500000 / (83.6 * 10.7639)).toFixed(2), n0.perSqft);
ok("square feet derived from square metres", Math.round(n0.sqft) === 900, n0.sqft);

ok("thousands separators in the amount survive", normalise(rows[1]).amount === 1200000);
ok("a mortgage registration is not a sale", normalise(rows[2]) === null);

ok("a row with no community is dropped",
  normalise({ instance_date: "2026-06-01", actual_worth: "100", procedure_name_en: "Sell" }) === null);
ok("a row with no usable date is dropped",
  normalise({ area_name_en: "X", actual_worth: "100", procedure_name_en: "Sell" }) === null);
ok("a zero price is dropped",
  normalise({ area_name_en: "X", instance_date: "2026-06-01", actual_worth: "0", procedure_name_en: "Sell" }) === null);

/* the headers move between exports, so alternates must resolve */
const alt = normalise({
  transaction_date: "2026-06-05", community: "Downtown Dubai",
  amount: "2000000", meter_price: "21528", procedure: "Sales",
});
ok("alternate column names resolve", alt && alt.community === "Downtown Dubai", alt);
ok("price per sqft falls back to a per square metre figure",
  alt && Math.round(alt.perSqft) === 2000, alt && alt.perSqft);

/* ---------- the honesty rule ---------- */
const make = (community, count, price, sqm, day = 1) =>
  Array.from({ length: count }, (_, i) => ({
    community, date: `2026-06-${String((day + (i % 20))).padStart(2, "0")}`,
    amount: price, sqft: +(sqm * 10.7639).toFixed(1),
    perSqft: +(price / (sqm * 10.7639)).toFixed(2), propertyType: "Unit", usage: "Residential", rooms: "1",
  }));

const big = make("Dubai Marina", 40, 1500000, 83.6);
const small = make("Tiny Community", 9, 1000000, 80);
const agg = aggregate([...big, ...small], { now: "2026-06-30T00:00:00Z" });

ok("a community above the threshold is published",
  agg.communities.some((c) => c.name === "Dubai Marina"));
ok("a community below the threshold publishes nothing",
  !agg.communities.some((c) => c.name === "Tiny Community"));
ok("the skipped community is recorded rather than silently dropped",
  agg.skipped.some((s) => s.community === "Tiny Community"), agg.skipped);

const noArea = Array.from({ length: 40 }, (_, i) => ({
  community: "No Areas", date: "2026-06-10", amount: 1000000,
  sqft: null, perSqft: null, propertyType: "Unit",
}));
const agg2 = aggregate(noArea, { now: "2026-06-30T00:00:00Z" });
ok("enough sales but too few carrying an area publishes nothing",
  agg2.communities.length === 0 && agg2.skipped.length === 1, agg2);

/* ---------- the window ---------- */
const old = make("Old Data", 40, 1000000, 80).map((s) => ({ ...s, date: "2024-01-15" }));
const agg3 = aggregate(old, { now: "2026-06-30T00:00:00Z", windowDays: 365 });
ok("sales outside the window are excluded entirely",
  agg3.communities.length === 0 && agg3.totalSales === 0, agg3.totalSales);

/* ---------- the arithmetic ---------- */
ok("median of an odd count", median([1, 3, 2]) === 2);
ok("median of an even count", median([1, 2, 3, 4]) === 2.5);
ok("median ignores nulls", median([1, null, 3]) === 2);
const marina = agg.communities.find((c) => c.name === "Dubai Marina");
ok("median price per sqft is right for a uniform set",
  marina.medianPerSqft === Math.round(1500000 / (83.6 * 10.7639)), marina.medianPerSqft);
ok("the reported period matches the data", marina.from <= marina.to, [marina.from, marina.to]);
ok("sale count is reported", marina.sales === 40, marina.sales);

/* ---------- slugs ---------- */
ok("slug is url safe", slugify("Jumeirah Village, Circle") === "jumeirah-village-circle", slugify("Jumeirah Village, Circle"));
ok("ampersand becomes a word", slugify("Al Barsha & Heights") === "al-barsha-and-heights", slugify("Al Barsha & Heights"));

console.log(`\n${fail === 0 ? `All ${pass} DLD checks passed.` : `${fail} FAILED, ${pass} passed.`}`);
process.exit(fail === 0 ? 0 : 1);
