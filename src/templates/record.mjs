import { esc, longDate } from "../lib.mjs";
import { classify, scoreboard, daysUntil, describeTest } from "../../scripts/lib/record.mjs";

const VERDICT = {
  right: ["Right", "rec__v--right"],
  wrong: ["Wrong", "rec__v--wrong"],
  partly: ["Partly right", "rec__v--partly"],
  void: ["Void", "rec__v--void"],
};

function callCard(c, kind) {
  const v = c.res ? VERDICT[c.res.verdict] || ["Unscored", ""] : null;

  const head = c.res
    ? `<span class="rec__v ${v[1]}">${v[0]}</span>`
    : kind === "overdue"
      ? `<span class="rec__v rec__v--overdue">Overdue</span>`
      : `<span class="rec__v rec__v--open">${daysUntil(c.horizon)} days to run</span>`;

  const outcome = c.res
    ? `<div class="rec__out">
      <p><b>What happened.</b> ${
        typeof c.res.actual === "number"
          ? `${esc(describeTest(c.test) || "")} — the reading was <b>${c.res.actual}</b> on ${longDate(c.res.date)}.`
          : esc(String(c.res.actual || ""))
      }${c.res.note ? ` ${esc(c.res.note)}` : ""}</p>
      <p class="rec__by">${
        c.res.scoredBy === "machine"
          ? `Scored by machine against <a href="${esc(c.res.sourceUrl || "#")}" rel="nofollow noopener" target="_blank">${esc(c.res.series || "the series")}</a>. No judgement was involved and rerunning it gives the same answer.`
          : `<b>Scored by hand.</b> This call could not be reduced to a number, so somebody on this side decided whether it was right. Weigh it accordingly.`
      }</p>
    </div>`
    : kind === "overdue"
      ? `<div class="rec__out"><p><b>This call matured on ${longDate(
          c.horizon
        )} and has not been scored.</b> It stays here, by name, until it is. It cannot be withdrawn.</p></div>`
      : "";

  return `<article class="rec">
  <div class="rec__h">${head}<span class="rec__d">Made ${longDate(c.made)} &middot; resolves ${longDate(c.horizon)}</span></div>
  <h3>${esc(c.claim)}</h3>
  <p class="rec__b"><b>Because.</b> ${esc(c.because)}</p>
  ${c.stakes ? `<p class="rec__b"><b>What it means for you.</b> ${esc(c.stakes)}</p>` : ""}
  ${c.test ? `<p class="rec__t">Scored automatically: ${esc(describeTest(c.test))}.</p>` : ""}
  ${outcome}
  ${c.where ? `<p class="rec__w"><a href="${esc(c.where)}">Where this was published</a></p>` : ""}
</article>`;
}

export function recordPage({ site, calls, results, briefs }) {
  const { open, overdue, resolved } = classify(calls, results);
  const s = scoreboard(resolved);

  // Corrections are not typed here. They are read off the issues that
  // carry them, so a correction cannot exist on the brief and be missing
  // from this page.
  const corrections = (briefs || [])
    .filter((b) => b.correction)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const tally = `<div class="rec__score">
    <div><b>${calls.length}</b><span>calls on record</span></div>
    <div><b>${open.length}</b><span>still running</span></div>
    <div><b>${s.right}</b><span>right</span></div>
    <div><b>${s.wrong}</b><span>wrong</span></div>
    ${overdue.length ? `<div class="rec__score--bad"><b>${overdue.length}</b><span>overdue</span></div>` : ""}
    <div><b>${corrections.length}</b><span>corrections issued</span></div>
  </div>`;

  const rate = s.rate !== null
    ? `<p class="rec__rate"><b>${s.rate}%</b> of ${s.scored} scored calls were right. ${s.byMachine} of ${s.total} were scored by machine rather than by us.</p>`
    : `<p class="rec__rate">No hit rate is shown. ${
        s.scored === 0
          ? "Nothing has been scored yet."
          : `Only ${s.scored} call${s.scored === 1 ? " has" : "s have"} been scored, and a percentage computed on that many is a number that misleads.`
      } It appears at ${s.minSample}.</p>`;

  const section = (title, note, items, kind) =>
    items.length
      ? `<h2 class="rec__sec">${esc(title)}</h2>
         <p class="rec__note">${note}</p>
         ${items.map((c) => callCard(c, kind)).join("")}`
      : "";

  const emptyCalls = `<div class="callout" style="max-width:var(--prose)">
    <b>No calls yet</b>
    There are none on record, and this page shows nothing rather than something. A track record that starts with entries written after the fact is not a track record, so it starts empty and fills in one call at a time. What is below it — the corrections — is real and starts today.
  </div>`;

  const correctionList = corrections.length
    ? corrections
        .map(
          (b) => `<article class="rec rec--corr">
  <div class="rec__h"><span class="rec__v rec__v--corr">Correction</span><span class="rec__d">${longDate(b.date)}</span></div>
  <p class="rec__b">${esc(b.correction)}</p>
  <p class="rec__w"><a href="/brief/${esc(b.slug)}/">Read the issue it corrects</a></p>
</article>`
        )
        .join("")
    : `<div class="callout" style="max-width:var(--prose)"><b>None issued</b>No figure published on this site has needed correcting yet. When one does, it will appear here and on the issue itself.</div>`;

  const body = `<section class="band"><div class="wrap">
  <div class="section-head" style="margin-bottom:10px">
    <p class="eyebrow">Including the ones that went wrong</p>
    <h2>The Record</h2>
    <p>Every forward-looking claim this site makes, the date it was made, and what actually happened. Plus every correction issued. Most places publishing market opinion do not keep a page like this, for a reason that becomes obvious the moment you keep one.</p>
  </div>

  ${tally}
  ${rate}

  <div class="article" style="margin-top:40px">
    <h2>How this works</h2>
    <p>A call is a sentence that can turn out to be wrong. It goes on this page the day it is published, with a date it resolves by, and it is never removed. If the resolution date passes and the call has not been scored, it appears here marked <b>overdue</b>, by name, until it is. Deleting the ones that aged badly is the specific failure this page is built to prevent.</p>
    <p>Where a claim can be reduced to a number — a rate above a level on a date, a series higher than where it started — it names a public data series and a threshold, and a script fetches the data and applies the test. Nobody on this side decides those. A call that cannot be reduced to a number is scored by hand and labelled <b>scored by hand</b> wherever it appears, because that is a person judging their own work and you should read it that way.</p>
    <p>No hit rate is published until there are ${s.minSample} scored calls. A percentage computed on three is worse than no percentage, and every forecaster who has ever quoted one on a small sample was quoting the sample, not the skill.</p>
  </div>

  ${calls.length ? "" : emptyCalls}
  ${section("Overdue", "Matured and not yet scored. Published here rather than quietly dropped.", overdue, "overdue")}
  ${section("Open", "Made, dated, and still running. Nothing here can be edited or withdrawn.", open, "open")}
  ${section("Resolved", "Scored, right and wrong together, newest first.", resolved, "resolved")}

  <h2 class="rec__sec">Corrections</h2>
  <p class="rec__note">A correction runs on the issue it corrects as well as here, so a reader who finds the original later sees it too. Read off the issues themselves, so one cannot exist on a brief and be missing from this page.</p>
  ${correctionList}

  <div class="callout" style="margin-top:56px;max-width:var(--prose)">
    <b>How to hold this site to it</b>
    Every figure published here names its source and the moment it was read, on the <a href="/data/">market data page</a>. If a number looks wrong, it is checkable at the source, and if it is wrong it gets a correction on this page with the original still visible. That is the whole standard, and it is written out in full in the <a href="/disclosure/">editorial standards</a>.
  </div>

  <p style="font-size:12px;color:var(--muted);margin-top:40px;max-width:var(--prose)">${esc(site.disclaimer)}</p>
</div></section>`;

  return {
    title: `The Record. Every call scored, including the wrong ones. ${site.name}`,
    description:
      "Every forward-looking claim Investments Playbook makes, the date it was made, what actually happened, and every correction issued. Calls that can be reduced to a number are scored by machine, not by us.",
    path: "/record/",
    body,
  };
}
