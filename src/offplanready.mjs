/* Off-plan against ready, as one comparison instead of two brochures.

   Every page on this query lists pros and cons. The few that put a number
   on it compare headline prices, or add up years of forgone rent without
   discounting them, and none of them answers the only question a buyer
   standing between two sales offices actually has: how far below the ready
   price does the off-plan unit have to be before the two are level?

   That question has an exact answer once one assumption is stated, and
   this module states it. Take the same unit, bought two ways. At handover
   both buyers own an identical apartment worth the same amount, so
   whatever the market does from then on it does to both of them equally
   and drops out. What is left is everything that happens before handover:

     ready     pays price and the full acquisition stack today, and
               collects net rent every month until the off-plan unit
               would have been delivered
     off-plan  pays the plan, instalment by instalment, plus the
               registration fee at contract, and collects nothing

   Discount both at the same rate and set them equal. The off-plan cost is
   linear in its price, so the break-even price is a closed form, not a
   search, and it does not round.

   The assumption is the whole of the method, so the page states it where
   the reader meets the number: equal value at handover. If the off-plan
   unit is worth less on delivery than a comparable ready unit, and in a
   handover glut it frequently is, the break-even discount is larger than
   this, not smaller.

   Every input is somebody else's module: the unit, the rent, the running
   costs and the ready acquisition stack are the net rental yield page's;
   the plans, the discount rate, the construction period and the off-plan
   registration are the off-plan page's. The two pages cannot disagree
   with this one. */

import * as aq from "./acquisition.mjs";
import * as op from "./offplan.mjs";

export const DELAYS = [0, 12, 24];

/* Monthly rate equivalent to an annual one, the same conversion the
   off-plan module uses for its plan present values. */
const monthly = (annualPercent) => Math.pow(1 + annualPercent / 100, 1 / 12) - 1;

/* Net rent received monthly in arrears for `months`, in today's money. */
export function rentPresentValue(annualNoi, annualRatePercent, months) {
  const m = monthly(annualRatePercent);
  const per = annualNoi / 12;
  let t = 0;
  for (let k = 1; k <= months; k++) t += per / Math.pow(1 + m, k);
  return t;
}

/* What the ready purchase costs, in today's money, net of the rent it earns
   while the off-plan building is still going up. */
export function readyCost({ i = aq.EXAMPLE, rate = op.EXAMPLE_PLAN.discountRate, months }) {
  const acquisition = aq.acquisition(i).total;
  const noi = aq.operating(i).net;
  const rent = rentPresentValue(noi, rate, months);
  return { price: i.price, acquisition, noi, rent, net: i.price + acquisition - rent };
}

/* What an off-plan purchase at `price` costs in today's money: the plan's
   present value plus the registration fee at contract, on the same market
   convention the ready stack uses, that the buyer carries all of it. A
   delay stretches the whole schedule, because build instalments are tied
   to milestones and the handover payment is tied to handover. */
export function offPlanCost({ price, plan, rate = op.EXAMPLE_PLAN.discountRate, months }) {
  const pv = op.planPresentValue(price, plan, rate, months);
  const reg = op.initialRegistration(price).combined;
  return { price, pv, registration: reg, net: pv + reg };
}

/* The off-plan cost is a·price + b, where a is the plan factor plus the
   registration rate and b is the flat fees. Solve a·p + b = ready. */
export function breakEven({ plan, delay = 0, haircut = 0, i = aq.EXAMPLE, rate = op.EXAMPLE_PLAN.discountRate, months = op.EXAMPLE_PLAN.months }) {
  const total = months + delay;
  const ready = readyCost({ i, rate, months: total });
  /* A haircut is the off-plan unit being worth `haircut` percent less than a
     comparable ready unit on the day it is delivered. Measured against
     today's ready price, so it assumes a flat market to handover, and
     discounted from handover to today. It is added to the ready side of
     the equation because it is value the off-plan buyer does not get. */
  const shortfall = (i.price * haircut) / 100 / Math.pow(1 + monthly(rate), total);
  const factor = op.planPresentValue(1, plan, rate, total);
  const regRate = op.INITIAL_SALE.sellerRate + op.INITIAL_SALE.purchaserRate;
  const flat = op.INITIAL_SALE.knowledge + op.INITIAL_SALE.innovation;
  const price = (ready.net - shortfall - flat) / (factor + regRate);
  return {
    plan, delay, haircut, months: total, shortfall,
    ready,
    price,
    discount: (1 - price / i.price) * 100,
    check: offPlanCost({ price, plan, rate, months: total }).net + shortfall,
  };
}

/* The plan the off-plan page calls A (front-loaded, 20/60/20) and the one it
   calls B (post-handover, 10/30/20/40 over four years), at each delay. */
export function grid() {
  const plans = [["a", op.EXAMPLE_PLAN.a], ["b", op.EXAMPLE_PLAN.b]];
  return DELAYS.map((delay) => ({
    delay,
    ...Object.fromEntries(plans.map(([k, plan]) => [k, breakEven({ plan, delay })])),
  }));
}

export const RATES = [3, 6, 9];
export const HAIRCUTS = [0, 5, 10];

export function byRate() {
  return RATES.map((rate) => ({
    rate,
    a: breakEven({ plan: op.EXAMPLE_PLAN.a, rate }),
    b: breakEven({ plan: op.EXAMPLE_PLAN.b, rate }),
  }));
}

export function byHaircut() {
  return HAIRCUTS.map((haircut) => ({
    haircut,
    a: breakEven({ plan: op.EXAMPLE_PLAN.a, haircut }),
    b: breakEven({ plan: op.EXAMPLE_PLAN.b, haircut }),
  }));
}

/* The same comparison with the ready purchase carrying no agency
   commission, to show how much of the answer is the broker's fee. */
export function withoutAgency(plan = op.EXAMPLE_PLAN.a) {
  return breakEven({ plan, i: { ...aq.EXAMPLE, agencyRate: 0 } });
}

/* The page's old arithmetic, kept so the suite can show it is not what is
   published: net yield times years, undiscounted, ignoring the plan. */
export function naiveGap(years = op.EXAMPLE_PLAN.months / 12) {
  return aq.yields().net * years;
}

export const money = (n) => Number(Math.round(n)).toLocaleString("en-US");
export const pc2 = (n) => `${Number(n).toFixed(2)}%`;
