/* Charts for the playbook pages, built from the modules that compute the
   pages' own figures.

   The reason this file exists rather than SVG in the markdown: every number
   on these pages is typed into the prose and held to the module by a test.
   That works for a sentence, where a human can read the number back. It does
   not work for a chart, where a wrong bar is invisible. So a chart is never
   authored -- it is derived here, at build time, from the same function the
   prose is checked against, and a page gets a chart only if this registry
   knows how to build one for it.

   A page with no entry here renders exactly as it does today. */
import { barChart } from "./charts.mjs";
import { OBSERVED, observedRun } from "./holidayhome.mjs";

const aed = (v) =>
  `${v < 0 ? "−" : "+"}AED ${Math.abs(Math.round(v)).toLocaleString("en-AE")}`;

/* Break-even occupancy: what three vendors' observed Dubai averages net,
   against the annual tenancy the owner gave up to chase them.

   This is the page's central claim and it was a nine-column table. The bar
   is each vendor's shortfall; the dashed line is zero, which is the
   break-even every competing page prints and every vendor clears. The whole
   point is that clearing that line is not the same as beating the tenancy. */
function breakEvenOccupancy() {
  const runs = OBSERVED.map((o) => ({ o, r: observedRun(o) }));
  return [
    {
      key: "observed-vs-tenancy",
      label:
        "What each publisher's observed Dubai average nets on this one bedroom, measured against the annual tenancy it replaced",
      reference: 0,
      referenceLabel: "level with the annual tenancy",
      format: aed,
      bars: runs.map(({ o, r }) => ({ label: o.publisher, value: r.versusTenancy })),
      caption:
        "Each bar is that publisher's observed rate and occupancy run through this page's own cost model. Zero is the annual tenancy, not zero profit — every one of the three clears the break-even the competing pages print, and every one lands below the tenancy it replaced.",
    },
  ];
}

const REGISTRY = { "break-even-occupancy": breakEvenOccupancy };

/* Returns rendered figures for a playbook, or "" when the page has none. */
export function playbookCharts(slug) {
  const build = REGISTRY[slug];
  if (!build) return "";
  return build()
    .map(
      (s) =>
        `${barChart(s, { id: s.key })}${
          s.caption ? `<p class="cb__src">${s.caption}</p>` : ""
        }`
    )
    .join("");
}

export { REGISTRY as CHART_REGISTRY };
