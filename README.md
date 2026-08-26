# Investments Playbook

A daily-updating investing site for global markets and property. Static, zero runtime dependencies, and it updates itself every morning without anyone touching it.

**Live at:** investmentsplaybook.com

---

## What it does every day at 07:05 Gulf time

1. `scripts/fetch-market-data.mjs` pulls eleven live figures from five providers and writes `content/market.json`.
2. `scripts/generate-brief.mjs` drafts the day's brief from those figures plus headline feeds, and writes `content/briefs/YYYY-MM-DD.json`.
3. `scripts/build.mjs` regenerates the whole site into `dist/`.
4. GitHub Actions commits the day's content and deploys to GitHub Pages.

If a data source fails, the last good value is kept and flagged stale rather than blanked. If the brief fails, the data still ships. Both outcomes are published on the public [automation status panel](https://investmentsplaybook.com/data/), so the pipeline is verifiable by anyone.

---

## Setting it up, once

### 1. Put it on GitHub

```bash
cd investments-playbook
git init
git add .
git commit -m "Investments Playbook"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/investments-playbook.git
git push -u origin main
```

### 2. Turn on Pages

Repository **Settings**, then **Pages**, then set **Source** to **GitHub Actions**. Nothing else.

### 3. Add the model key for the daily brief

Get a free key at [aistudio.google.com](https://aistudio.google.com/apikey). The free tier is comfortably enough for one brief a day.

Repository **Settings**, then **Secrets and variables**, then **Actions**, then **New repository secret**:

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | your key |

`OPENAI_API_KEY` works instead if you prefer. Without either, the data still updates daily and the brief is skipped, which the status panel will say plainly.

### 4. Point the domain

At your domain registrar, for `investmentsplaybook.com`:

| Type | Name | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | YOUR-USERNAME.github.io |

Then in **Settings**, **Pages**, put `investmentsplaybook.com` in **Custom domain** and tick **Enforce HTTPS** once the certificate is issued. The `CNAME` file is already generated on every build.

DNS takes anywhere from ten minutes to a few hours.

### 5. Run it once by hand

**Actions** tab, **Daily update and deploy**, **Run workflow**. That builds the first live version and proves the pipeline end to end.

---

## Where the leads go

Both forms post straight into your existing MailerLite account, number 2532906.

| Form | MailerLite group | Fields captured |
|---|---|---|
| Daily brief signup | IP: Daily Brief | email, lead source |
| Playbook download gate | IP: Playbook Download | name, email, phone with dial code, country, investor intent, lead source |

`Investor Intent` was created as a custom field. It is the lead-scoring field. `Country` is the segmentation field.

**Both forms are set to double opt-in**, which protects deliverability but adds a confirmation step before the Playbook is delivered. If you would rather trade list health for speed on the lead form, turn it off on that form in MailerLite.

Two things still to do in MailerLite, which take about twenty minutes each:

1. **Attach the actual Playbook PDF** to the confirmation email on the IP: Playbook Download form, or the gate promises a document that does not arrive yet.
2. **Build one automation per intent option**, so a "Buy my first investment property" lead gets a different sequence from a "Build a global markets portfolio" lead. That is the whole reason the intent field exists.

---

## Running it locally

Needs Node 18 or newer. There are no dependencies to install.

```bash
npm run build     # build the site into dist/
npm run serve     # build and serve at http://localhost:4173
npm run data      # pull live market data
npm run brief     # draft today's brief (needs GEMINI_API_KEY)
npm run daily     # all three, exactly as the Action runs them
```

Tests:

```bash
npm test                        # all three suites
node scripts/selftest.mjs       # data parsers, against real recorded payloads
node scripts/fallbacktest.mjs   # the FRED and stooq.pl fallback paths
node scripts/calctest.mjs       # all six calculators, 40 assertions
node scripts/wiretest.mjs   # the feed parser, against recorded RSS and Atom payloads
node scripts/glossarytest.mjs # 911 checks: one-sentence definitions, resolving links, house style
node scripts/playbooktest.mjs # 803 checks: summary format, failure modes present, internal links resolve
```

---

## Writing content

**A new framework page.** Add an object to `content/playbooks.mjs`. It appears in the library, the filters, the sitemap and the related links automatically. The fields are `slug, title, category, tier, summary, body, formula, failureModes, whenToUse, calculator, sources, reviewed`.

`scripts/playbooktest.mjs` enforces the shape: a single self-contained summary sentence, at least three failure modes, at least one https source, and every `/playbooks/...` or `/glossary/...` link in the prose resolving to something that exists. That last check is the one that earns its keep, because a broken internal link builds and deploys perfectly and only fails for the reader.

The page order is fixed and deliberate: definition, the rule, the arithmetic, where it breaks, when to use it, sources. That order is built for AI answer engines, which lift a clean one-sentence definition from the top of a page. Do not reorder it.

**Assets are versioned by content hash.** `/styles.css?v=…` and `/app.js?v=…`, where the hash is of the file itself. GitHub Pages caches those files, so without this a returning visitor keeps yesterday's stylesheet after a deploy and reports that nothing changed. A changed file is now a changed URL.

**Four figures are live, fifteen are not, and that is a provider limit rather than a choice.** `src/app/live.js` refreshes gold, silver, Bitcoin and Ethereum in the visitor's browser once a minute, direct from gold-api.com and Kraken, which both allow cross-origin browser requests. FRED does not, so Treasuries, the real yield, breakeven, the mortgage rate, CPI, oil and the dollar index stay build-time. Nothing is lost by that: at source they change daily, weekly or monthly. Live rows carry a green dot on the data page. Failure is silent, and the built figures remain.

The pipeline now runs **twice a day**, at 03:05 UTC and again at 21:15 UTC, because FRED posts the daily Treasury curve around 20:15 UTC and the second pass catches it the same day. The brief generator skips when an issue already exists for the date, so only the data refreshes on the evening run.

**The hero has two forms.** `heroGlobe` in `content/site.json` switches between them. `true` gives the rotating globe. `false` gives the typographic hero: no canvas, a red rule, and a Today's Figures box built from the same `market.json` the data page publishes. One word, no other edits.

**Counts are never typed by hand.** The framework and calculator numbers in the hero stats and the lead band are rendered from `playbooks.length` and `CALCULATORS.length`. A site whose argument is that the advertised number and the real number differ cannot afford to advertise a number it does not have.

**The look.** Business-press: black masthead, white page, Georgia headlines and serif article body, one red (`#DC0000`) used as punctuation, a cream (`#ECE5C0`) for pulled-out blocks, and hairline rules doing the separating. The palette lives entirely in the `:root` block at the top of `src/styles.css`. The variable names are inherited from the first edition, so `--gold` now carries the red. Rename them if it bothers you, but change the values in one place, not scattered through the file.

Georgia is on every device already, so the only webfont loaded is Inter for the interface type, plus IBM Plex Mono for figures.

**The depth and motion layer.** `src/app/motion.js` and the block at the bottom of `src/styles.css` hold every 3D and animation effect: the hero globe, the running ticker, card tilt, scroll reveals, the header condense and the scroll progress bar. It is entirely additive. Delete both and the site renders correctly, just flat. Everything in it is switched off under `prefers-reduced-motion`, and the tilt is gated behind `(hover: hover) and (pointer: fine)` so phones never get it.

The globe is plain canvas 2D with the projection written out by hand, not WebGL and not a library, which is why it costs a few kilobytes rather than a few hundred.

**A new glossary term.** Add an object to `content/glossary.mjs`. The page, the index entry, the A to Z, the schema markup and the related links all follow. `scripts/glossarytest.mjs` then enforces the part that matters: the definition must be a single self-contained sentence between 80 and 340 characters that does not open with a pronoun, because the whole point of the page is that an answer engine can lift that sentence alone. Every entry also carries a `trap`, the specific way people get that term wrong, which is what makes the page worth reading rather than worth scraping.

**A new calculator.** Add a spec to `CALCULATORS` in `src/templates/calculators.mjs` and the matching maths function to `CALC` in `src/app/calc.js`. Then add assertions to `scripts/calctest.mjs`, because a calculator that is quietly wrong is worse than no calculator.

**Editing a brief.** Briefs are JSON in `content/briefs/`. Edit and rebuild. If you correct a factual error, note the correction at the top of the next issue, as the [disclosure standards](https://investmentsplaybook.com/disclosure/) page promises.

---

## Rules the code enforces so you do not have to

**No em-dashes, no middot separators.** Stripped at render time in `src/lib.mjs`, and again in the brief generator before anything is written to disk.

**No proprietary index levels.** The site shows ETF prices, never S&P 500, FTSE or DAX index levels. Republishing index levels needs a licence from the index provider. `scripts/selftest.mjs` asserts this and will fail the build if an index label ever appears.

**Every figure names a source and a timestamp.** The data page and the ticker both render them, and the parsers refuse to write a row without them.

**The brief cannot invent a number.** It is given only the figures already in `market.json` and is explicitly forbidden from recalling or estimating. This is the constraint that makes an automated brief publishable.

---

## Where things live

```
content/
  site.json          global config, MailerLite IDs, heroGlobe flag, disclaimer text
  playbooks.mjs      the 40 framework articles
  glossary.mjs       47 defined terms
  wire-sources.mjs   the primary source feeds the wire reads
  wire.json          written by the wire job, every quarter hour
  static.mjs         about, disclosure standards, privacy
  market.json        written daily by the pipeline
  status.json        automation health, shown publicly
  briefs/            one JSON file per day
src/
  styles.css         the whole design system
  lib.mjs            helpers, markdown, copy rules
  templates/         layout, pages, calculators
  app/calc.js        calculator maths, pure, unit tested
  app/app.js         DOM wiring, forms, filters
scripts/
  fetch-market-data.mjs
  fetch-wire.mjs
  generate-brief.mjs
  build.mjs
  selftest.mjs
  calctest.mjs
.github/workflows/daily.yml
```

---

## Data providers and their terms

| Source | Used for | Notes |
|---|---|---|
| FRED, Federal Reserve Bank of St. Louis | 2Y, 10Y, 30Y Treasury yields, the 10Y real yield, the 10Y breakeven, the US 30Y mortgage rate, CPI, WTI crude, the broad dollar index | Keyless CSV, reachable from CI. The underlying series are published by the U.S. Treasury, the Federal Reserve Board, the Bureau of Labor Statistics, the Energy Information Administration and Freddie Mac |
| ExchangeRate-API | EUR, GBP, JPY, AED, CHF, INR | Free commercial, **attribution link required**, it is in the footer |
| gold-api.com | Gold and silver | No published terms, display only, treat as best effort |
| Kraken | Bitcoin and Ethereum | Public exchange data |

Five HTTP calls a day.

### What is deliberately not published

**No proprietary index levels.** Not the S&P 500, FTSE, DAX or Dow. Not Case-Shiller, which is S&P and CoreLogic intellectual property. Not the VIX, which is Cboe's. Republishing any of them needs a licence this site does not hold, and free availability through a data pipe is not the same as redistribution rights. `scripts/selftest.mjs` asserts this and fails the build if such a label ever appears.

The first production run made the reason concrete: Stooq, the usual keyless source for equity prices, refuses GitHub's datacentre ranges outright. Rather than reach for an unofficial endpoint with no redistribution permission, the equity tiles were replaced with the FRED macro series above, which are licence-clean, more reliable, and frankly more useful on a site about property and portfolio arithmetic than a QQQ price.

### Resilience

Every fetch is wrapped in a timeout. When a source fails, the previous value is kept and flagged stale rather than blanked, and the failure is written to the public automation status panel. A row that has not refreshed in fourteen days is dropped entirely, so a retired series does not sit on the page forever wearing a stale badge.

## The next things worth building

In the order they will pay for themselves:

1. Finish the Playbook PDF and attach it to the MailerLite confirmation email.
2. Intent-based email sequences, one per option on the lead form.
3. The remaining twenty eight framework pages. The tier one gaps are the comparison cluster: Dubai versus London, off-plan versus ready, property versus index funds.
4. A glossary page per term, one clean sentence first. Cheapest AI-citation asset available.
5. The quarterly chartbook, deliberately ungated, as the asset other people link to.
6. A public tracked-calls log with dates and misses included. Nothing else differentiates this from promotional content as sharply.
