#!/usr/bin/env node
/* The first property checklist, as one PDF.

   Six of the seven paths offered the compendium and nothing else. The crypto
   path offered a document written for one situation and that is a better
   trade: a person with one question wants the answer to that question, not a
   library. First property is the highest-volume, highest-intent route into
   this site, so it earns the same treatment.

   Same rules as the crypto checklist. Every item traces to a framework the
   library already publishes, nothing is asserted that cannot be sourced, and
   the items are questions rather than instructions, because the honest form
   of this document is the list of things to ask before signing rather than a
   set of answers that do not know the building, the plan or the buyer.

   The build generates it on every run and `seoaudit` fails if it is missing,
   so the form on the page cannot end up promising a file nobody produced. */

import { createPdf, A4 } from "../src/pdf/pdf.mjs";
import { wrap, textWidth } from "../src/pdf/metrics.mjs";

const INK = [0.09, 0.09, 0.09];
const MUTED = [0.42, 0.42, 0.42];
const RED = [0.86, 0, 0];
const HAIR = [0.89, 0.89, 0.88];
const CREAM = [0.925, 0.898, 0.753];

const M = { l: 62, r: 62, t: 64, b: 58 };
const COL = A4.w - M.l - M.r;
const COVER_COL = COL - 110;

const SERIF = "Times-Roman", SERIF_B = "Times-Bold";
const SANS = "Helvetica", SANS_B = "Helvetica-Bold";

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
export function words(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (n < 20) return ONES[n];
  return n % 10 ? `${TENS[Math.floor(n / 10)]} ${ONES[n % 10]}` : TENS[Math.floor(n / 10)];
}
const sentenceCase = (w) => w[0].toUpperCase() + w.slice(1);

/* The order is the order the decisions arrive in. A buyer who runs stage four
   before stage one has already chosen the building. */
export const STAGES = [
  {
    n: "01",
    title: "Before you look at anything",
    lead: "Every number in a listing is a gross number. What decides whether a purchase works is what is left after the costs the listing does not mention, and that calculation is the same for every property you will look at.",
    playbook: "net-rental-yield",
    items: [
      "What net yield, after service charge, management, void allowance and maintenance, would make this worth doing at all?",
      "What is the full round trip in and out, and how many years of net rent does it consume?",
      "Am I buying an income, a capital gain, or a place to live, and does the answer change which of those numbers matters?",
      "What would I need to believe about rents or prices for this to work, and is that belief or evidence?",
      "How much of my net worth will be in one building, one city and one currency once this completes?",
    ],
  },
  {
    n: "02",
    title: "What the bank will actually lend",
    lead: "A mortgage in principle is a view about your income, not about the property. The binding limit is usually the debt burden ratio rather than the loan to value, and it counts obligations most buyers forget they have.",
    playbook: "mortgage-capacity",
    items: [
      "What loan to value applies to me, given residency, whether this is a first property, and the price band?",
      "What does a lender count as my income, and does it include a bonus or commission I am relying on?",
      "What is my total monthly debt service including cards and car finance, as a share of gross monthly income?",
      "Does a credit card with a limit and no balance consume capacity at the lender I am approaching?",
      "Have I included the mortgage registration fee, valuation and arrangement fee in the cash I need on the day?",
      "Am I comparing a mortgage against paying cash on the arithmetic, or on how the debt feels?",
    ],
  },
  {
    n: "03",
    title: "The costs that are not in the price",
    lead: "In Dubai the round trip is commonly six to seven percent on the way in before a tenant has viewed the property. A yield calculated on the price alone is flattered by roughly that amount.",
    playbook: "transaction-cost-drag",
    items: [
      "Transfer fee, administrative charge, agency commission plus VAT on that commission, trustee office fee: totalled, in dirhams, not percentages?",
      "What is the service charge per square foot per year, taken from the owners association rather than from the listing?",
      "Is there a reserve fund contribution, and is the building's reserve actually funded?",
      "What will a fit out, or the gap between handover and habitable, cost me?",
      "If I sell in three years rather than ten, what does the round trip do to the annualised return?",
    ],
  },
  {
    n: "04",
    title: "The specific building, the specific unit",
    lead: "Everything above is arithmetic that applies to any property. This is the part that is only answerable about the one in front of you, and it is where a purchase is usually won or lost.",
    playbook: "due-diligence-before-an-offer",
    items: [
      "What have comparable units in this building actually transacted at, per square foot, rather than been listed at?",
      "Is the building chiller free, or does the tenant pay cooling separately, and what does that do to the rent a tenant will accept?",
      "What is the service charge history, and has it risen faster than rents?",
      "If tenanted, what does the existing contract say, when does it expire, and where does the rent sit against the index?",
      "What occupancy does this need simply to break even, and how much bad luck does that leave room for?",
      "Who else is selling in this building right now, and why?",
    ],
  },
  {
    n: "05",
    title: "If it is off-plan",
    lead: "An off-plan purchase is a payment schedule and a completion risk attached to a price. The comparison that matters is not the headline price but what each plan costs in today's money.",
    playbook: "off-plan-vs-ready",
    items: [
      "Compared in today's money at a realistic discount rate, which plan is actually cheaper?",
      "Is the escrow account registered, and does the Oqood registration match what I am signing?",
      "What is the contractual position if handover slips by a year, and what have this developer's recent projects actually done?",
      "What am I funding the instalments from, and does that source have a fixed value on the dates they fall due?",
      "What reserve is still standing on the day the last instalment clears, for service charge, void and fit out?",
    ],
  },
];

function rule(doc, y, { color = HAIR, width = 1, from = M.l, to = A4.w - M.r } = {}) {
  doc.line(from, y, to, y, { color, lineWidth: width });
}

function footer(doc, page, total) {
  const y = A4.h - 34;
  rule(doc, y - 12);
  doc.text("The first property checklist  |  investmentsplaybook.com/start/first-property", M.l, y, { font: SANS, size: 7.5, color: MUTED });
  doc.text(`${page} of ${total}`, A4.w - M.r, y, { font: SANS, size: 7.5, color: MUTED, align: "right" });
}

function cover(doc, origin) {
  doc.addPage();
  doc.rect(0, 0, A4.w, 150, { fill: [0.04, 0.04, 0.04] });
  doc.text("INVESTMENTS", M.l, 52, { font: SERIF, size: 21, color: [1, 1, 1] });
  doc.text("PLAYBOOK", M.l + textWidth("INVESTMENTS ", SERIF, 21), 52, { font: SERIF_B, size: 21, color: [0.92, 0.15, 0.15] });
  doc.line(M.l, 96, M.l + 40, 96, { color: RED, lineWidth: 2.5 });
  doc.text("YOUR FIRST INVESTMENT PROPERTY", M.l, 108, { font: SANS_B, size: 9, color: [0.75, 0.75, 0.75] });

  let y = 214;
  const head = `${sentenceCase(words(checklistQuestionCount()))} questions`;
  for (const line of [head, "to answer before", "you make an offer."]) {
    doc.text(line, M.l, y, { font: SERIF, size: 34, color: INK });
    y += 42;
  }

  y += 26;
  rule(doc, y, { to: M.l + COVER_COL });
  y += 22;
  for (const line of wrap(
    "The yield in a listing is a gross yield. The costs that turn it into a net one are not in the listing, and in Dubai they are commonly six to seven percent on the way in before a tenant has viewed the property. Almost every first purchase goes wrong in the same place, and it is not the place people worry about.",
    SERIF, 11.5, COVER_COL
  )) {
    doc.text(line, M.l, y, { font: SERIF, size: 11.5, color: INK });
    y += 17;
  }

  y += 26;
  doc.rect(M.l, y, COVER_COL, 2, { fill: RED });
  y += 18;
  doc.text(`THE ${words(STAGES.length).toUpperCase()} STAGES`, M.l, y, { font: SANS_B, size: 8, color: MUTED });
  y += 18;
  for (const s of STAGES) {
    doc.text(s.n, M.l, y, { font: "Courier", size: 9, color: RED });
    doc.text(s.title, M.l + 26, y, { font: SERIF, size: 11.5, color: INK });
    doc.text(`${s.items.length} questions`, A4.w - M.r, y, { font: SANS, size: 9, color: MUTED, align: "right" });
    y += 19;
  }

  y = A4.h - 96;
  rule(doc, y);
  for (const [i, line] of [
    "Every item here traces to a framework at investmentsplaybook.com/playbooks, where the arithmetic is shown in full.",
    "Educational research and general information. Not personal investment advice, and not legal or tax advice.",
  ].entries()) {
    doc.text(line, M.l, y + 12 + i * 14, { font: SANS, size: 8, color: MUTED });
  }
}

function stagePage(doc, stage, origin) {
  doc.addPage();
  doc.line(M.l, M.t - 4, M.l + 18, M.t - 4, { color: RED, lineWidth: 2 });
  doc.text(`STAGE ${stage.n}`, M.l + 26, M.t - 9, { font: SANS_B, size: 8, color: INK });

  let y = M.t + 34;
  for (const line of wrap(stage.title, SERIF, 26, COL)) {
    doc.text(line, M.l, y, { font: SERIF, size: 26, color: INK });
    y += 32;
  }

  y += 16;
  const leadLines = wrap(stage.lead, SERIF, 11.5, COL - 24);
  const boxTop = y;
  doc.rect(M.l, boxTop, COL, leadLines.length * 17 + 26, { fill: CREAM });
  y = boxTop + 14;
  for (const line of leadLines) {
    doc.text(line, M.l + 14, y, { font: SERIF, size: 11.5, color: INK });
    y += 17;
  }
  y = boxTop + leadLines.length * 17 + 26 + 34;

  for (const item of stage.items) {
    doc.rect(M.l, y + 2, 10, 10, { stroke: [0.6, 0.6, 0.6], lineWidth: 0.8 });
    for (const line of wrap(item, SERIF, 11.5, COL - 24)) {
      doc.text(line, M.l + 24, y, { font: SERIF, size: 11.5, color: INK });
      y += 17;
    }
    y += 9;
  }

  y += 6;
  rule(doc, y);
  y += 14;
  doc.text("THE FRAMEWORK BEHIND THIS STAGE", M.l, y, { font: SANS_B, size: 7.5, color: MUTED });
  y += 13;
  doc.text(`${origin}/playbooks/${stage.playbook}/`, M.l, y, { font: SANS, size: 9, color: RED });
}

function backPage(doc, origin) {
  doc.addPage();
  let y = M.t + 20;
  doc.text("What this is, and is not", M.l, y, { font: SERIF, size: 26, color: INK });
  y += 46;

  for (const [heading, body] of [
    ["It is a list of questions", "Not a set of answers. The answers depend on the building, the plan and your own position, none of which a document can know. Every question here costs nothing to ask before an offer and a great deal to ask after one."],
    ["The disclosure that matters", "The author works in Dubai real estate brokerage. That is a commercial interest in you buying property, and it is the reason every framework on this site carries a list of the situations in which it stops working. Read the disclosure standards on the site."],
    ["It is not advice", "Investments Playbook publishes educational research and general information. Nothing here is personal investment advice, legal advice or tax advice, and nothing is a recommendation to buy or sell any asset. Property can fall in value."],
    ["Where the workings are", "Each stage names the framework it comes from. Those pages show the arithmetic, the failure modes, and the sources every claim rests on. This file is the sequence; the library is the reasoning."],
  ]) {
    doc.text(heading, M.l, y, { font: SANS_B, size: 9.5, color: INK });
    y += 18;
    for (const line of wrap(body, SERIF, 11.5, COL)) {
      doc.text(line, M.l, y, { font: SERIF, size: 11.5, color: INK });
      y += 17;
    }
    y += 22;
  }

  y = A4.h - 150;
  doc.rect(M.l, y, COL, 2, { fill: RED });
  y += 20;
  doc.text("THE LIBRARY", M.l, y, { font: SANS_B, size: 8, color: MUTED });
  y += 18;
  doc.text(`${origin}/start/first-property/`, M.l, y, { font: SERIF, size: 12, color: INK });
  y += 18;
  doc.text(`${sentenceCase(words(STAGES.length))} stages, ${words(checklistQuestionCount())} questions, and the frameworks each one comes from.`, M.l, y, { font: SANS, size: 9, color: MUTED });
}

export function buildFirstPropertyPdf(site) {
  const origin = (site && site.origin) || "https://investmentsplaybook.com";
  const doc = createPdf({
    title: "The first property checklist",
    author: (site && site.author && site.author.name) || "Investments Playbook",
    subject: "Questions to answer before making an offer on a first investment property",
  });

  cover(doc, origin);
  for (const s of STAGES) stagePage(doc, s, origin);
  backPage(doc, origin);

  const total = doc.pageCount;
  for (let i = 1; i < total; i++) {
    doc.selectPage(i);
    footer(doc, i + 1, total);
  }
  return doc.build();
}

export const checklistPageCount = () => STAGES.length + 2;
export const checklistQuestionCount = () => STAGES.reduce((n, s) => n + s.items.length, 0);
