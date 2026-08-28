#!/usr/bin/env node
// Daily brief. Drafts from the figures already in content/market.json plus
// headline feeds, then writes content/briefs/YYYY-MM-DD.json.
// Grounded only: the model is forbidden from inventing a figure.
// Needs GEMINI_API_KEY (free tier at aistudio.google.com) or OPENAI_API_KEY.

import BRIEF_FRAMEWORKS from "../content/brief-frameworks.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRIEFS = path.join(root, "content/briefs");
const STATUS = path.join(root, "content/status.json");
const UA = { "User-Agent": "InvestmentsPlaybook/1.0 (+https://investmentsplaybook.com)" };

const GEMINI = process.env.GEMINI_API_KEY;
const OPENAI = process.env.OPENAI_API_KEY;
const MODEL = process.env.BRIEF_MODEL || (GEMINI ? "gemini-2.5-flash" : "gpt-4o-mini");

function log(status, detail) {
  let s = { runs: [] };
  try { s = JSON.parse(fs.readFileSync(STATUS, "utf8")); } catch {}
  s.runs.unshift({ job: "generate-daily-brief", status, detail, ranAt: new Date().toISOString() });
  s.runs = s.runs.slice(0, 40);
  fs.writeFileSync(STATUS, JSON.stringify(s, null, 1));
}

const today = new Date();
const dateStr = today.toISOString().slice(0, 10);
fs.mkdirSync(BRIEFS, { recursive: true });

if (fs.existsSync(path.join(BRIEFS, `${dateStr}.json`))) {
  log("skipped", `A brief for ${dateStr} already exists.`);
  console.log("Brief already published for today.");
  process.exit(0);
}
if (!GEMINI && !OPENAI) {
  log("skipped", "No model API key configured. Set GEMINI_API_KEY or OPENAI_API_KEY.");
  console.log("No API key. Skipping the brief, data still updated.");
  process.exit(0);
}

const market = JSON.parse(fs.readFileSync(path.join(root, "content/market.json"), "utf8"));
const quotes = (market.quotes || [])
  .filter((q) => !q.stale)
  .map((q) => ({ label: q.label, value: q.value, unit: q.unit, changePct: q.changePct, category: q.category, source: q.source, asOf: q.asOf }));

const recent = fs
  .readdirSync(BRIEFS)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .reverse()
  .slice(0, 5)
  .map((f) => {
    const b = JSON.parse(fs.readFileSync(path.join(BRIEFS, f), "utf8"));
    return { title: b.title, subtitle: b.subtitle, headings: (b.items || []).map((i) => i.heading) };
  });

const FEEDS = [
  ["MarketWatch", "https://feeds.content.dowjones.io/public/rss/mw_topstories"],
  ["CNBC", "https://www.cnbc.com/id/100003114/device/rss/rss.html"],
  ["BBC Business", "https://feeds.bbci.co.uk/news/business/rss.xml"],
  ["Arabian Business", "https://www.arabianbusiness.com/feed"],
];

async function headlines() {
  const out = [];
  await Promise.all(
    FEEDS.map(async ([source, url]) => {
      try {
        const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(10000) });
        if (!r.ok) return;
        const xml = await r.text();
        for (const it of xml.split(/<item[\s>]/).slice(1, 9)) {
          const t = it.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
          const l = it.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
          if (t) out.push({ source, title: t[1].trim(), url: l ? l[1].trim() : url });
        }
      } catch { /* a dead feed must never block the brief */ }
    })
  );
  return out;
}

const SYSTEM = `You write the daily brief for Investments Playbook, an independent research desk covering global markets and property for internationally mobile investors, many of them based in the Gulf.

HARD RULES. Violating any of these makes the output unusable.
1. Use ONLY the figures supplied in the DATA block. Never invent, estimate, recall from memory, or round differently. If you want a number you do not have, write around it. A headline may be quoted for its own stated figure only if you attribute the outlet by name.
2. Never give personal investment advice, a buy or sell recommendation, a price target, or a forecast stated as fact. Explain mechanisms and trade-offs. The reader decides.
3. Never use em-dashes. Never use middot separators. Use commas, colons, full stops or line breaks.
4. British English. Plain language. Explain any technical term in five words inside the sentence. Second person. Confident, never promotional. One dry observation per brief is welcome. No jokes about losses.
5. Do not use: unprecedented, game changer, skyrocket, plunge, guru, or any superlative you cannot source.
6. Do not repeat an angle used in the RECENT BRIEFS block.

STRUCTURE. Exactly three items.
Item 1: global markets.
Item 2: property, one Gulf angle and one non-Gulf angle.
Item 3: one number, one mechanism, one thing it changes.

Each item has three beats:
what_happened: the fact with its figures, two to three sentences.
what_it_means: the mechanism. Why this moved and what actually drives it. Three to five sentences.
what_it_means_for_you: the reader consequence, framed as trade-offs and questions to check, never as instructions. Three to four sentences. Where one of the site's frameworks applies, name it in plain words, for example "this is the net yield question, not the gross yield question", or "this is the sequence of returns problem".

Each item is 300 to 350 words across the three beats.

tags: two to four, and take them from this list wherever one fits. Each item's
first matching tag decides which framework the published item links to, so a
tag outside this list costs the reader that link. Add a tag of your own only
when nothing here describes the item.
${Object.keys(BRIEF_FRAMEWORKS).join(", ")}

Also produce:
title: two to four words, a hook, no colon, no full stop.
emoji: one, relevant, never a rocket and never a money bag.
subtitle: one sentence under twenty words.
numbers_block: four to six entries drawn ONLY from the DATA block. label, value as a display string, and a note of under twelve words giving context.
calendar: two to four entries for the week ahead. Only events on a known recurring schedule, for example a scheduled central bank meeting or a monthly data release. If unsure, return an empty array.`;

const SCHEMA_PROPS = {
  title: { type: "string" },
  emoji: { type: "string" },
  subtitle: { type: "string" },
  items: {
    type: "array",
    items: {
      type: "object",
      properties: {
        heading: { type: "string" },
        what_happened: { type: "string" },
        what_it_means: { type: "string" },
        what_it_means_for_you: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        sources: {
          type: "array",
          items: { type: "object", properties: { name: { type: "string" }, url: { type: "string" } }, required: ["name", "url"] },
        },
      },
      required: ["heading", "what_happened", "what_it_means", "what_it_means_for_you", "tags", "sources"],
    },
  },
  numbers_block: {
    type: "array",
    items: {
      type: "object",
      properties: { label: { type: "string" }, value: { type: "string" }, note: { type: "string" } },
      required: ["label", "value", "note"],
    },
  },
  calendar: {
    type: "array",
    items: {
      type: "object",
      properties: { day: { type: "string" }, event: { type: "string" } },
      required: ["day", "event"],
    },
  },
};

const news = await headlines();
const USER = `DATA. The only figures you may use.
${JSON.stringify(quotes, null, 1)}

HEADLINES. Context and sourcing only.
${JSON.stringify(news.slice(0, 24), null, 1)}

RECENT BRIEFS. Do not repeat these angles.
${JSON.stringify(recent, null, 1)}

Today is ${today.toUTCString()}. Write today's brief.`;

async function callGemini() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: USER }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: SCHEMA_PROPS,
          required: ["title", "emoji", "subtitle", "items", "numbers_block", "calendar"],
        },
      },
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const d = await r.json();
  const text = d?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
  return JSON.parse(text);
}

async function callOpenAI() {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${SYSTEM}\n\nReturn a single JSON object with keys: title, emoji, subtitle, items, numbers_block, calendar.` },
        { role: "user", content: USER },
      ],
    }),
    signal: AbortSignal.timeout(180000),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const d = await r.json();
  return JSON.parse(d.choices[0].message.content);
}

let brief;
try {
  brief = GEMINI ? await callGemini() : await callOpenAI();
} catch (e) {
  log("failed", String(e.message || e).slice(0, 300));
  console.error("Brief generation failed:", e.message || e);
  process.exit(0); // the data build must still ship
}

/* ---------- validate and clean ---------- */
const clean = (s) => String(s || "").replace(/—/g, ",").replace(/\s·\s/g, ", ").trim();

if (!Array.isArray(brief.items) || brief.items.length < 3) {
  log("failed", `Model returned ${brief.items?.length ?? 0} items, expected 3.`);
  console.error("Bad shape from the model. Nothing published.");
  process.exit(0);
}
brief.items = brief.items.slice(0, 3).map((it) => ({
  heading: clean(it.heading),
  what_happened: clean(it.what_happened),
  what_it_means: clean(it.what_it_means),
  what_it_means_for_you: clean(it.what_it_means_for_you),
  tags: (it.tags || []).map(clean),
  sources: (it.sources || []).filter((s) => s && s.url && /^https?:\/\//.test(s.url)),
}));

const words = brief.items.reduce(
  (n, i) => n + `${i.what_happened} ${i.what_it_means} ${i.what_it_means_for_you}`.split(/\s+/).length,
  0
);

const title = clean(brief.title) || "Morning brief";
const slug = `${dateStr}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

const record = {
  slug,
  date: dateStr,
  title,
  emoji: (brief.emoji || "📈").slice(0, 4),
  subtitle: clean(brief.subtitle),
  readMinutes: Math.max(2, Math.round(words / 240)),
  author: "Soliman Hossam Eldin",
  items: brief.items,
  numbers: (brief.numbers_block || []).slice(0, 6).map((n) => ({ label: clean(n.label), value: String(n.value), note: clean(n.note) })),
  calendar: (brief.calendar || []).slice(0, 4).map((c) => ({ day: clean(c.day), event: clean(c.event) })),
  publishedAt: new Date().toISOString(),
  generatedBy: MODEL,
};

fs.writeFileSync(path.join(BRIEFS, `${dateStr}.json`), JSON.stringify(record, null, 1));
log("ok", `Published "${title}", ${words} words, from ${quotes.length} live figures.`);
console.log(`Published ${slug} (${words} words).`);
