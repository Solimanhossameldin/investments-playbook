#!/usr/bin/env node
/* The crypto to property checklist, as one PDF.

   This file exists because the crypto path's form promises something
   specific in exchange for an email address. A promise like that has to
   be kept by the build rather than by somebody remembering to upload a
   file, so the checklist is generated on every run and `seoaudit` fails
   if it is not in `dist`.

   Every item here traces to a framework on the site. Nothing is asserted
   that the library cannot source, and the questions are questions rather
   than instructions, because the honest form of this document is a list
   of things to ask rather than a set of answers that do not know the
   reader's residence, counterparty or contract.

   Same vector writer as the chartbook. No dependencies, no browser. */

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

/* Counts on this site are rendered from the arrays and never typed, and a
   cover headline is prose, so the figure has to arrive as a word. This
   covers the range a checklist can plausibly reach; anything beyond it
   falls back to digits rather than lying. */
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
export function words(n) {
  if (!Number.isInteger(n) || n < 0 || n > 99) return String(n);
  if (n < 20) return ONES[n];
  return n % 10 ? `${TENS[Math.floor(n / 10)]} ${ONES[n % 10]}` : TENS[Math.floor(n / 10)];
}
const sentenceCase = (w) => w[0].toUpperCase() + w.slice(1);

/* The five stages, in the order they actually happen. The order is the
   content: the single most common and most expensive mistake in this
   sequence is doing stage three before stage one. */
export const STAGES = [
  {
    n: "01",
    title: "Before you sell anything",
    lead: "The disposal is taxed by where you were tax resident when you made it, not by where the money is spent afterwards. This stage cannot be revisited once the sale executes.",
    playbook: "the-year-you-sell",
    items: [
      "Where am I tax resident on the date I intend to sell, and is a move planned anywhere near that date?",
      "Does my country of departure use split-year treatment, and which side of the split does my sale date fall on?",
      "Does it tax gains realised during a temporary absence if I return within a set period, and what is that period?",
      "Do I hold a citizenship that is taxed regardless of residence?",
      "Is there a filing obligation even where there is no liability, in either country?",
      "Have I priced a conversation with somebody qualified against the size of this disposal?",
    ],
  },
  {
    n: "02",
    title: "Assemble the documentary chain",
    lead: "A UAE property purchase funded from a virtual asset triggers a reporting obligation on the broker. Converting to cash first does not avoid it: that conversion is itself one of the triggers.",
    playbook: "proving-the-source-of-crypto-funds",
    items: [
      "Can I evidence every link: acquisition, custody, disposal, conversion, settlement?",
      "Do I hold statements from a licensed venue, in my own name, covering the whole period?",
      "For older holdings, do the exchange and the funding bank still exist, and have I requested the records already?",
      "Is any tranche routed through a venue or tool that cannot produce a record?",
      "Does the name on every account match the name that will appear on the title?",
      "Have I stored the file somewhere that outlives any single provider, given records are kept for five years?",
    ],
  },
  {
    n: "03",
    title: "Price the conversion",
    lead: "The registry settles in dirhams, so something converts. The spread on that conversion is not a line item and can cost as much as the transfer fee. Ask before signing; it cannot be asked after.",
    playbook: "settling-a-property-purchase-from-crypto",
    items: [
      "Which venue's rate, at which timestamp, and what spread against it?",
      "Is the contract fixing a dirham price or a coin quantity, and who carries the movement in between?",
      "Who is the licensed counterparty holding the funds during conversion?",
      "What does the spread cost in dirhams on this purchase, and how does that compare with the four percent transfer fee?",
      "Is the answer in writing, or was it given on a call?",
    ],
  },
  {
    n: "04",
    title: "Run the ordinary property arithmetic",
    lead: "Downstream of the conversion this is an ordinary Dubai purchase, and the fact that the money began as a coin changes none of it. The frameworks that apply are the ones that apply to every buyer.",
    playbook: "net-rental-yield",
    items: [
      "What is the net yield after service charge, management, void allowance and maintenance, not the gross figure quoted?",
      "What does the full round trip cost, entry and exit, and how many years of net rent is that?",
      "What price per square foot have comparable units in this building actually transacted at?",
      "If this is let, what occupancy does it need simply to break even?",
      "What does this purchase do to my exposure to a single city and a single currency?",
    ],
  },
  {
    n: "05",
    title: "If it is off-plan, before signing the plan",
    lead: "A payment plan is a fixed schedule of dated dirham obligations. Funding one from an asset that can halve converts the purchase into a series of forced sales on dates chosen in advance by somebody else.",
    playbook: "funding-a-payment-plan-from-a-volatile-asset",
    items: [
      "What proportion of the remaining instalments is already sitting in dirhams rather than in the volatile asset?",
      "How many coins would the remaining plan need after a fifty percent fall? After seventy five?",
      "What happens contractually if an instalment is missed, and is any flexibility in writing?",
      "What reserve is still standing on the day the last instalment clears, for service charge, void and fit out?",
      "Have I compared the plans in today's money rather than on headline totals?",
    ],
  },
];

function rule(doc, y, { color = HAIR, width = 1, from = M.l, to = A4.w - M.r } = {}) {
  doc.line(from, y, to, y, { color, lineWidth: width });
}

function footer(doc, page, total) {
  const y = A4.h - 34;
  rule(doc, y - 12);
  doc.text("The crypto to property checklist  |  investmentsplaybook.com/start/crypto-to-property", M.l, y, { font: SANS, size: 7.5, color: MUTED });
  doc.text(`${page} of ${total}`, A4.w - M.r, y, { font: SANS, size: 7.5, color: MUTED, align: "right" });
}

function cover(doc, origin) {
  doc.addPage();
  doc.rect(0, 0, A4.w, 150, { fill: [0.04, 0.04, 0.04] });
  doc.text("INVESTMENTS", M.l, 52, { font: SERIF, size: 21, color: [1, 1, 1] });
  doc.text("PLAYBOOK", M.l + textWidth("INVESTMENTS ", SERIF, 21), 52, { font: SERIF_B, size: 21, color: [0.92, 0.15, 0.15] });
  doc.line(M.l, 96, M.l + 40, 96, { color: RED, lineWidth: 2.5 });
  doc.text("CRYPTO TO PROPERTY", M.l, 108, { font: SANS_B, size: 9, color: [0.75, 0.75, 0.75] });

  let y = 214;
  const head = `${sentenceCase(words(checklistQuestionCount()))} questions`;
  for (const line of [head, "to answer before you", "sell the coins."]) {
    doc.text(line, M.l, y, { font: SERIF, size: 34, color: INK });
    y += 42;
  }

  y += 26;
  rule(doc, y, { to: M.l + COVER_COL });
  y += 22;
  for (const line of wrap(
    "You do not buy Dubai property with cryptocurrency. You sell cryptocurrency and buy Dubai property with dirhams, and almost everything that decides what the purchase costs you happens in the gap between those two sentences. This is the sequence in the order it actually occurs, because the most expensive mistake in it is doing stage three before stage one.",
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

  // text(x, top) sets the top of the em box, so a 26pt line runs to y + 26
  // plus descenders. The cream panel needs to clear that, not sit inside it.
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
    // An empty box, because this is a checklist and a reader should be able
    // to work through it on paper.
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
    ["It is a list of questions", "Not a set of answers. The answers depend on your residence, your counterparty and your contract, none of which a document can know. Every question here is one that costs nothing to ask in advance and cannot be asked afterwards."],
    ["It is not advice", "Investments Playbook publishes educational research and general information. Nothing here is personal investment advice, legal advice or tax advice, and nothing here is a recommendation to buy or sell any asset. Property and digital assets can fall in value, in some cases to nothing."],
    ["It goes out of date", "The regulatory position on virtual assets in the UAE is moving. The pilots described in the frameworks were pilots when this was written. Check the primary sources cited on each framework page rather than relying on this file a year from now."],
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
  doc.text(`${origin}/start/crypto-to-property/`, M.l, y, { font: SERIF, size: 12, color: INK });
  y += 18;
  doc.text(`${sentenceCase(words(STAGES.length))} stages, ${words(checklistQuestionCount())} questions, and the frameworks each one comes from.`, M.l, y, { font: SANS, size: 9, color: MUTED });
}

export function buildCryptoChecklistPdf(site) {
  const origin = (site && site.origin) || "https://investmentsplaybook.com";
  const doc = createPdf({
    title: "The crypto to property checklist",
    author: (site && site.author && site.author.name) || "Investments Playbook",
    subject: "Questions to answer before converting cryptocurrency into a Dubai property purchase",
  });

  cover(doc, origin);
  for (const s of STAGES) stagePage(doc, s, origin);
  backPage(doc, origin);

  // Footers last, because "3 of 7" needs a page count that does not exist
  // until every page has been laid out. The cover gets none.
  const total = doc.pageCount;
  for (let i = 1; i < total; i++) {
    doc.selectPage(i);
    footer(doc, i + 1, total);
  }

  return doc.build();
}

export const checklistPageCount = () => STAGES.length + 2;
export const checklistQuestionCount = () => STAGES.reduce((n, s) => n + s.items.length, 0);
