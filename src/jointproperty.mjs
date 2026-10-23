/* The Dubai service charge, and the reserve fund the law keeps in a separate
   bank account.

   Every page found on this query on 10 September 2026 does the same thing:
   a table of dirhams per square foot by community, no source, no retrieval
   date, no year the rates belong to, and then the sentence "service charges
   are regulated by the Dubai Land Department" with nothing after it. The
   strongest of them lists thirteen communities and cites no instrument at
   all.

   There is an instrument, and it is unusually specific. Law No. (6) of 2019
   sets who pays, on what area, on whose approval, into which bank account,
   what the money may be spent on, where the reserve is held, what happens
   when the reserve runs short, and what happens to an owner who does not
   pay. Six of those nine are things a buyer can check before making an
   offer, and none of them appear on a competing page.

   The arithmetic here is the one question the "a low charge is a deferred
   bill" warning never answers: deferred by how much. The answer has a closed
   form, and the unit area cancels out of it, which is why it can be printed
   once for every apartment in Dubai. */

import { EXAMPLE, yields } from "./acquisition.mjs";

export const INSTRUMENTS = {
  law6: {
    name: "Law No. (6) of 2019 Concerning Ownership of Jointly Owned Real Property in the Emirate of Dubai, Articles 25, 27, 30, 32 and 34",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2019/Law%20No.%20(6)%20of%202019%20Concerning%20Ownership%20of%20Jointly%20Owned%20Real%20Property%20in%20the%20Emirate%20of%20Dubai.html",
  },
  scIndex: {
    name: "Dubai Land Department, Service Charge Index, e-service description",
    url: "https://dubailand.gov.ae/en/eservices/service-charge-index-overview/",
  },
  mollak: {
    name: "Dubai Land Department, Mollak, the service charge system for jointly owned property",
    url: "https://mollak.dubailand.gov.ae/publicpages/about-us.html",
  },
};

/* Claims the page carries in the instrument's own words. The grammar of the
   official English is left exactly as published; it is the signature of a
   quotation rather than a paraphrase of one. */
export const STATUTORY = [
  { key: "apportionment", claim: "based on ratio of the area of the Owner's Unit to the total area", instrument: "law6" },
  { key: "deedArea", claim: "based on the area of his Unit as recorded in the Real Property Register", instrument: "law6" },
  { key: "unsoldUnits", claim: "A Developer will pay his share of the annual Service Charges in respect of unsold Units", instrument: "law6" },
  { key: "reraApproval", claim: "without first obtaining the relevant approval of RERA", instrument: "law6" },
  { key: "auditedBudget", claim: "unless it is approved by a certified audit firm recognised by RERA", instrument: "law6" },
  { key: "temporaryBudget", claim: "RERA may approve a temporary Service Charges budget", instrument: "law6" },
  { key: "sevenDays", claim: "within seven (7) working days from the date of collection", instrument: "law6" },
  { key: "closedList", claim: "may not be disposed of, and may only be used for the following purposes", instrument: "law6" },
  { key: "separateAccount", claim: "must be deposited in an account separate from the Service Charges account", instrument: "law6" },
  { key: "reserveLocked", claim: "other than in critical emergencies, without first obtaining the approval of RERA", instrument: "law6" },
  { key: "theLevy", claim: "request Owners to cover these expenses", instrument: "law6" },
  { key: "lien", claim: "A Unit may not be disposed of unless these charges are paid", instrument: "law6" },
  { key: "auction", claim: "sold by public auction to collect these charges", instrument: "law6" },
  { key: "sixMonths", claim: "every six (6) months, with a periodic report", instrument: "law6" },
  { key: "lookup", claim: "inquire about the approved service fees for Joint ownership properties", instrument: "scIndex" },
  { key: "escrow", claim: "operating according to the mechanism of the escrow account", instrument: "mollak" },
];

/* ---- the deferred bill, priced ----

   Two comparable buildings, one charging `gap` dirhams a foot a year less
   than the other. The cheaper one's advantage accumulates; a levy under
   Article 30(f) lands as a one-off charge on the same square feet. Both
   sides of that comparison are the unit's area times a rate, so the area
   divides out and the answer is a rate: the levy per square foot at which
   the buyer of the cheaper building is exactly back where they started.

   Undiscounted it is the gap times the years. Money in hand earns something,
   so the honest version compounds each year's saving forward at `rate`,
   which is the future value of an ordinary annuity and reduces to the years
   when the rate is zero. */
export const LEVY_YEARS = [5, 10, 15, 20];
export const LEVY_GAPS = [2, 4, 6];
export const LEVY_RATE = 0.05;

export function fvFactor(rate, years) {
  if (!rate) return years;
  return (Math.pow(1 + rate, years) - 1) / rate;
}

export function breakEvenLevy({ gap, years, rate = 0 }) {
  return gap * fvFactor(rate, years);
}

export function levyTable(rate = LEVY_RATE) {
  return LEVY_YEARS.map((years) => ({
    years,
    cells: LEVY_GAPS.map((gap) => Number(breakEvenLevy({ gap, years, rate }).toFixed(2))),
  }));
}

/* ---- what a dirham a foot is worth ----

   The service charge is the only line in the running costs that a listing
   never carries and a buyer can verify before the offer. These are its price
   in the three units the reader is already holding: dirhams a year, a share
   of the rent, and points of net yield on the same illustrative one bedroom
   the net rental yield page computes. Imported rather than retyped, so the
   two pages cannot drift apart. */
export function perDirham(i = EXAMPLE) {
  const cost = i.sqft;
  return {
    cost,
    ofRent: Number(((cost / i.rent) * 100).toFixed(2)),
    netPoints: Number(((cost / yields(i).outlay) * 100).toFixed(3)),
  };
}

export function shareOfRent(i = EXAMPLE) {
  const charge = i.sqft * i.serviceChargePerSqft;
  return { charge, pct: Number(((charge / i.rent) * 100).toFixed(1)) };
}

export const money = (n) => Number(Math.round(n)).toLocaleString("en-US");

/* ---- the reserve rate, which is published and nobody compares ----

   The section above prices the deferred bill and then leaves the reader with
   the one thing it cannot supply: which of two buildings is actually
   reserving. Every competing page has the same hole, and all of them fill it
   the same way, by telling the buyer to ask the management company for the
   reserve fund balance. That is sound advice and it needs a cooperative
   seller, a signed NDA-free conversation and a week.

   It is also unnecessary for the first cut, because the Service Charge Index
   does not publish one number per project. It publishes the approved budget
   in two parts, a general fund and a reserve, and the second part is a
   statement of the building's reserving policy for that budget year, made by
   the manager, audited by a RERA-recognised firm and ratified by RERA. It is
   free, it is per project, and no page found on this query mentions that it
   exists.

   What follows is arithmetic over the rows in content/service-charges.json
   and nothing else. The records carry the split already -- the validator in
   servicecharges.mjs refuses a row whose parts do not add up to its headline
   rate -- so these functions add no figures, they only ask the dataset
   questions it has not been asked.

   The one thing the split is NOT is a balance. An approved contribution is a
   flow and the cushion against Article 30(f) is a stock, so a building in its
   fifteenth year at AED 0.30 a foot and one in its first at AED 5.99 are not
   ranked by this column. That is a real limit, it is on the page as a stated
   failure mode, and it is why the page still says to ask for the balance. */

/* Dirhams a square foot. Two approved rates this close are, to a buyer
   comparing them, the same bill: five fils a foot a year is AED 45 on the
   illustrative 900 square foot flat, which is a rounding error beside the
   reserve differences it conceals. */
export const PAIR_WITHIN = 0.05;
export const RESERVE_HORIZON = 10;

/* Every record that publishes the split, cheapest reserve share first. A row
   with no reserve line (Barton House 1) is absent rather than scored as zero:
   the index not breaking a budget out is a different fact from a budget that
   reserves nothing, and only the second one is a finding. */
export function reserveRows(records) {
  return records
    .filter((r) => typeof r.reserveFund === "number" && typeof r.psf === "number" && r.psf > 0)
    .map((r) => ({
      project: r.project,
      area: r.area,
      psf: r.psf,
      reserve: r.reserveFund,
      general: r.generalFund,
      share: Number(((r.reserveFund / r.psf) * 100).toFixed(1)),
    }))
    .sort((a, b) => a.share - b.share || a.project.localeCompare(b.project));
}

/* Pearson's r between the headline rate and the reserve's share of it. The
   page states it because the claim it supports is a negative one -- that
   comparing the headline rate tells you little about the reserve -- and a
   negative claim about a published set should carry the statistic that
   measures it rather than an adjective. */
export function correlation(xs, ys) {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
    syy += (ys[i] - my) ** 2;
  }
  if (!sxx || !syy) return 0;
  return sxy / Math.sqrt(sxx * syy);
}

export function reserveSpread(records) {
  const rows = reserveRows(records);
  if (!rows.length) return null;
  const shares = rows.map((r) => r.share).slice().sort((a, b) => a - b);
  const mid = shares.length % 2
    ? shares[(shares.length - 1) / 2]
    : (shares[shares.length / 2 - 1] + shares[shares.length / 2]) / 2;
  const r = correlation(rows.map((x) => x.psf), rows.map((x) => x.share));
  return {
    count: rows.length,
    lowest: rows[0],
    highest: rows[rows.length - 1],
    median: Number(mid.toFixed(1)),
    correlation: Number(r.toFixed(2)),
    rSquared: Number((r * r).toFixed(2)),
    fold: Number((rows[rows.length - 1].share / rows[0].share).toFixed(1)),
  };
}

/* The two buildings whose approved rates are closest together and whose
   reserves differ most: the page's evidence that the headline rate is the
   wrong column to compare on. Deterministic -- ties on the ratio break on the
   smaller gap, then on the project name -- so the prose and the suite cannot
   disagree about which pair the dataset currently holds. */
export function closestPair(records, within = PAIR_WITHIN) {
  const rows = reserveRows(records).filter((r) => r.reserve > 0);
  let best = null;
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const gap = Math.abs(rows[i].psf - rows[j].psf);
      if (gap > within) continue;
      const full = rows[i].reserve > rows[j].reserve ? rows[i] : rows[j];
      const lean = rows[i].reserve > rows[j].reserve ? rows[j] : rows[i];
      const ratio = full.reserve / lean.reserve;
      const cand = { full, lean, gap: Number(gap.toFixed(2)), ratio: Number(ratio.toFixed(2)) };
      if (
        !best ||
        cand.ratio > best.ratio ||
        (cand.ratio === best.ratio && cand.gap < best.gap) ||
        (cand.ratio === best.ratio && cand.gap === best.gap && cand.full.project < best.full.project)
      ) best = cand;
    }
  }
  return best;
}

/* An approved reserve rate run forward through the same annuity as the levy
   table above, so the two sit in the same units and can be read against each
   other. Nothing new: fvFactor, applied to a different rate. */
export function reserveOver(perFoot, years = RESERVE_HORIZON, rate = LEVY_RATE) {
  return Number((perFoot * fvFactor(rate, years)).toFixed(2));
}
