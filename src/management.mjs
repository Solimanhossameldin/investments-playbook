/* What a Dubai property manager has to deliver to be worth the fee.

   Every guide on this query answers a different question from the one the
   landlord is asking. They answer "what is the fee", and they answer it with
   a band -- five to eight per cent of annual rent for a long let -- that none
   of them attributes to a regulator, a law, a schedule or a survey. Checked
   on 6 November 2026, the three pages ranking for the query quoted a band,
   two of them contradicted themselves on whether it was charged on monthly or
   annual rent, and not one of them did any arithmetic with the figure beyond
   multiplying it by a rent.

   The question underneath is whether the fee can be recovered, and that one
   has an answer. A fee charged as a share of rent can be recovered from
   exactly two places: rent that would otherwise not have been collected, and
   rent that would otherwise not have been charged. Nothing else on a long let
   is in the manager's gift. Both have closed forms, and the first has a
   ceiling that no amount of skill gets past.

   Set the managed landlord's net equal to the self-managing landlord's net.
   With rent R, vacancy v and fee rate f, self-management nets R(1-v) and
   management that removes vacancy entirely nets R(1-f). Solving for the
   reduction in vacancy the manager must deliver,

     cut = (1 - v) * f / (1 - f)

   and that equals the whole vacancy allowance exactly when f = v. Above that
   fee rate there is no letting performance that pays for the fee, because a
   manager cannot remove more vacancy than the flat has. It is not a claim
   about managers. It is what charging a percentage of a number does when the
   number cannot rise far enough.

   Nothing here estimates a fee. The rate is the page's parameter, because no
   instrument sets it and this site holds no dataset for it -- the same
   treatment `acquisition.mjs` gives the developer NOC fee and `refinance.mjs`
   gives the bank's arrangement and valuation fees. The reader supplies the
   rate they were quoted; the arithmetic says what it demands. */

import { EXAMPLE, money, pctText, yields } from "./acquisition.mjs";
import { EJARI, ejariFee } from "./rentbuy.mjs";
import { TIERS } from "./rentcap.mjs";

/* Instruments this page cites. Deliberately NOT called INSTRUMENTS and
   deliberately not registered in the law register: every one of them is
   already owned by another module -- `jointproperty.mjs` owns Law 6,
   `rentbuy.mjs` owns the tenancy service page, `rentcap.mjs` owns Decree 43 --
   and the register keys on the instrument URL, so a second declaration would
   file the same law under two pages. The page carries the quotations and the
   checks below hold it to them; the register stays the register. */
export const CITED = {
  law6: {
    name: "Law No. (6) of 2019 Concerning Ownership of Jointly Owned Real Property in the Emirate of Dubai, Articles 25 and 27",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2019/Law%20No.%20(6)%20of%202019%20Concerning%20Ownership%20of%20Jointly%20Owned%20Real%20Property%20in%20the%20Emirate%20of%20Dubai.html",
  },
  decree43: {
    name: "Decree No. (43) of 2013 Determining Rent Increase for Real Property, Article 1",
    url: "https://dlp.dubai.gov.ae/Legislation%20Reference/2013/Decree%20No.%20(43)%20of%202013%20Determining%20Rent%20Increase%20for%20Real%20Property.pdf",
  },
  ejari: {
    name: "Dubai Land Department, Register / Renew Tenancy Contract, service fees",
    url: "https://dubailand.gov.ae/en/eservices/register-renew-ejari-contract/",
  },
};

/* The claims the page must carry word for word, in the instruments' own
   official English. Checked by name below rather than through the shared
   STATUTORY_PAGES machinery, for the registration reason given above. */
export const QUOTED = [
  { key: "reraApproval", claim: "without first obtaining the relevant approval of RERA", instrument: "law6" },
  { key: "noIncrease", claim: "up to ten percent (10%) less than the average rental value", instrument: "decree43" },
  { key: "ejariRegistration", claim: "AED 100 for registering a tenancy contract", instrument: "ejari" },
];

/* The one figure on this page with no published maximum anywhere, named
   rather than estimated. */
export const UNPRICED = ["the management fee itself, which no Dubai instrument caps and no public schedule publishes"];

/* The flat is the one every property page on this site uses: the 900 sq ft
   one bedroom at AED 1,500,000 letting for AED 105,000 with a four week
   vacancy allowance. Keeping it identical is what lets this page be added to
   the yield page rather than read beside it. */
export const VACANCY = EXAMPLE.vacancyWeeks / 52;

export const FEE_LADDER = [0.05, 0.06, 0.07, 0.08, 0.10];

/* The allowance in the unit the page argues in. The four weeks are the
   yield page's assumption; the days are what a letting agent counts. */
export const vacancyDays = Number((VACANCY * 365).toFixed(2));

const r6 = (n) => Number(n.toFixed(6));
const r2 = (n) => Number(n.toFixed(2));

/* The reduction in vacancy that exactly pays for a fee of `fee`, as a
   fraction of the year and in the units a landlord thinks in. */
export const rawCut = (fee) => (1 - VACANCY) * fee / (1 - fee);

export function vacancyCut(fee) {
  const fraction = rawCut(fee);
  return { fraction: r6(fraction), weeks: r2(fraction * 52), days: r2(fraction * 365) };
}

/* The fee rate above which the vacancy route closes, found by bisection on
   the cut rather than by quoting the identity, so the page's whole argument
   rests on a solved figure and not on an algebraic claim the reader has to
   take on trust. It lands on VACANCY, and `ceilingAgrees` is the evidence. */
export function ceilingBySearch() {
  let lo = 0, hi = 0.9;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    if (rawCut(mid) < VACANCY) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

export const feeCeiling = ceilingBySearch();
export const ceilingAgrees = Math.abs(feeCeiling - VACANCY) < 1e-9;
export const ceilingPct = Number((feeCeiling * 100).toFixed(2));

export const recoverableFromVacancy = (fee) => fee < VACANCY;

/* The second route. Holding vacancy where it is, the rent the manager
   achieves has to rise by this much for the fee to come back. */
export function rentUplift(fee) {
  return r6(fee / (1 - fee));
}

/* And the reason the second route is usually shut on a sitting tenant.
   Decree No. (43) of 2013 permits an increase only where the rent sits far
   enough below the index average, so the uplift the fee needs has to fit
   inside a band the decree allows. This returns the first band that permits
   it, or null where no band does. */
export function firstPermittingTier(fee) {
  const needed = rentUplift(fee) * 100;
  return TIERS.find((t) => t.increase >= needed) || null;
}

export function ladder() {
  return FEE_LADDER.map((fee) => {
    const cut = vacancyCut(fee);
    const tier = firstPermittingTier(fee);
    return {
      fee,
      feePct: r2(fee * 100),
      cutWeeks: cut.weeks,
      cutDays: cut.days,
      shareOfAllowance: r2(cut.fraction / VACANCY * 100),
      recoverable: recoverableFromVacancy(fee),
      upliftPct: r2(rentUplift(fee) * 100),
      tierUpTo: tier ? tier.upTo : null,
      tierIncrease: tier ? tier.increase : null,
    };
  });
}

/* What the fee costs where the reader already measures things: the net yield
   on the same flat, with the fee and without it. Taken from the acquisition
   module's own yield function so the two pages cannot disagree. */
export function yieldCost() {
  const withFee = yields(EXAMPLE);
  const without = yields({ ...EXAMPLE, managementRate: 0 });
  return {
    withFee: withFee.net,
    without: without.net,
    points: r2(without.net - withFee.net),
    dirhams: without.noi - withFee.noi,
    shareOfNet: r2((without.net - withFee.net) / without.net * 100),
  };
}

/* The one line in the whole annual stack that is published to the dirham.
   Taken from the tenancy module rather than retyped. */
export function registration() {
  return { app: ejariFee(), centre: ejariFee({ centre: true }), publishedCentre: EJARI.publishedCentre };
}

export { money, pctText };
