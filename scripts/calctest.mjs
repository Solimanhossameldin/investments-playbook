#!/usr/bin/env node
// Unit tests for the calculator engine. Runs the same file the browser runs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new Function(fs.readFileSync(path.join(root, "src/app/calc.js"), "utf8"))();
const { CALC } = globalThis.IPCalc;

let fails = 0;
const check = (name, cond, got) => {
  if (cond) console.log(`  pass  ${name}`);
  else { console.log(`  FAIL  ${name}  got: ${JSON.stringify(got)}`); fails++; }
};
const numOf = (s) => parseFloat(String(s).replace(/[^0-9.\-]/g, ""));

console.log("\nNet rental yield");
{
  const r = CALC["net-rental-yield"]({
    price: 1500000, rent: 105000, size: 900, sc: 18, mgmt: 5, vac: 8, maint: 5,
    insur: 1500, dld: 4, agency: 2, vat: 5, closing: 4600, ltv: 0, rate: 4.5, term: 25,
  });
  check("gross yield is 7.00%", r.gross === "7.00%", r.gross);
  // acquisition: 60,000 + 31,500 + 4,600 = 96,100
  check("acquisition costs are 96,100", numOf(r.acq) === 96100, r.acq);
  check("net yield is materially below gross", numOf(r.net) < 5 && numOf(r.net) > 3.5, r.net);
  check("no debt means no debt service", numOf(r.debt) === 0, r.debt);
  check("break-even occupancy under 100% unlevered", numOf(r.breakeven) < 100, r.breakeven);

  const lev = CALC["net-rental-yield"]({
    price: 1500000, rent: 105000, size: 900, sc: 18, mgmt: 5, vac: 8, maint: 5,
    insur: 1500, dld: 4, agency: 2, vat: 5, closing: 4600, ltv: 75, rate: 4.5, term: 25,
  });
  // 1,125,000 at 4.5% over 25y is about 75,100 a year
  check("annuity mortgage cost is right", Math.abs(numOf(lev.debt) - 75100) < 800, lev.debt);
  check("leverage raises break-even occupancy", numOf(lev.breakeven) > numOf(r.breakeven), [r.breakeven, lev.breakeven]);
  check("cash on cash is negative when yield is under the rate", numOf(lev.coc) < 0, lev.coc);
}

/* ---------- the flagship worked example must survive its own calculator ----------
   The net rental yield page is the one the site calls its first page, and its
   worked example said seven percent became 4.2. The calculator, given the same
   property and the same stated assumptions, said 4.3, and so did three other
   frameworks quoting the figure. The page's own components did not add up to
   its own subtotal either: the four operating items it lists come to about
   19,700 and it claimed roughly 22,000.

   A reader who reads the page and then runs the tool would have found that.
   Nothing else would have, because the tool and the prose had never been asked
   the same question. They are now, from the page itself rather than from a
   copy of its numbers. */
console.log("\nThe flagship worked example against the calculator");
{
  const page = fs.readFileSync(path.join(root, "content/playbooks/net-rental-yield.md"), "utf8");
  const stated = (re, what) => {
    const m = page.match(re);
    if (!m) { check(`the page still states ${what}`, false, null); return NaN; }
    return parseFloat(m[1].replace(/,/g, ""));
  };
  // The property and assumptions exactly as the page sets them out.
  const r = CALC["net-rental-yield"]({
    price: 1500000, rent: 105000, size: 900, sc: 18, mgmt: 5, vac: (4 / 52) * 100,
    maint: 5, insur: 1500, dld: 4, agency: 2, vat: 5, closing: 4600, ltv: 0, rate: 0, term: 25,
  });

  const noiSaid = stated(/Net operating income: about \*\*([\d,]+)\*\*/, "a net operating income");
  // Anchored on the net yield line: an unanchored match found the gross
  // yield first and compared 7.0 against 4.33, which is a check failing for
  // the wrong reason and would have been read as the page being wrong.
  const netSaid = stated(/- Net yield: [\d,]+ divided by [\d,]+, which is \*\*([\d.]+) percent\*\*/, "a net yield");
  const acqSaid = stated(/Total \*\*([\d,]+)\*\*/, "an acquisition total");

  check("the page's net operating income matches the calculator",
    Math.abs(noiSaid - numOf(r.noi)) < 100, [noiSaid, r.noi]);
  check("the page's acquisition total matches the calculator",
    Math.abs(acqSaid - numOf(r.acq)) < 1, [acqSaid, r.acq]);
  check("the page's net yield matches the calculator to one decimal",
    Math.abs(netSaid - numOf(r.net)) < 0.05, [netSaid, r.net]);

  // And the components it lists must add up to the subtotal it claims.
  const opexSaid = stated(/reserve and fifteen hundred of \[insurance\]\([^)]*\): roughly ([\d,]+) more/, "an operating subtotal");
  const fourItems = numOf(r.opex) - 900 * 18;
  check("the four operating items add up to the subtotal the page claims",
    Math.abs(opexSaid - fourItems) < 200, [opexSaid, Math.round(fourItems)]);
}

console.log("\nDubai rent increase, Decree 43 of 2013");
{
  const run = (current, index, notice = 90) => CALC["dubai-rent-increase"]({ current, index, notice });
  const pctIncrease = (current, index) => Math.round((numOf(run(current, index).maxrent) / current - 1) * 100);

  // The boundaries are the whole point of the decree, and they are the values
  // a landlord and a tenant will each round in their own favour. Each tier is
  // tested on both sides of its edge.
  const tiers = [
    [110000, 120000, 0,  "8.3 percent below, inside the ten percent band"],
    [108000, 120000, 0,  "exactly ten percent below, still no increase"],
    [107000, 120000, 5,  "just past ten percent below"],
    [96000,  120000, 5,  "exactly twenty percent below"],
    [95000,  120000, 10, "just past twenty percent below"],
    [84000,  120000, 10, "exactly thirty percent below"],
    [83000,  120000, 15, "just past thirty percent below"],
    [72000,  120000, 15, "exactly forty percent below"],
    [71000,  120000, 20, "just past forty percent below"],
    [60000,  120000, 20, "fifty percent below, still capped at twenty"],
  ];
  for (const [cur, idx, want, why] of tiers) {
    const got = pctIncrease(cur, idx);
    check(`${why} gives ${want}%`, got === want, `${got}%`);
  }

  const above = run(130000, 120000);
  check("a rent above the index permits no increase", numOf(above.maxrent) === 130000, above.maxrent);
  check("and says it is above rather than showing a negative", /above the index/.test(above.gap), above.gap);

  check("short notice is called out", /Not satisfied/.test(run(90000, 120000, 45).notice), run(90000, 120000, 45).notice);
  check("ninety days is enough", /^Satisfied/.test(run(90000, 120000, 90).notice), run(90000, 120000, 90).notice);

  // A missing index must not produce Infinity or NaN on a page about a legal cap.
  const zero = run(90000, 0);
  check("a zero index permits nothing rather than breaking", numOf(zero.maxrent) === 90000, zero.maxrent);
  check("nothing in the output is NaN", !Object.values(zero).some((v) => /NaN|Infinity|undefined/.test(String(v))), zero);

  const mid = run(90000, 120000);
  check("headroom left after the increase is reported", numOf(mid.headroom) > 0, mid.headroom);
  check("the tier is named in words", /Up to 10 percent/.test(mid.tier), mid.tier);
}

console.log("\nRent versus buy");
{
  const base = { price: 1500000, rent: 90000, sc: 20000, proptax: 0, deposit: 25, rate: 4.5,
    alt: 6, growth: 3, rentgrowth: 3, roundtrip: 9, hold: 7 };
  const r = CALC["rent-vs-buy"](base);
  // 1,125,000 x 4.5% = 50,625 interest; 375,000 x 6% = 22,500 opp; + 20,000 sc
  check("year one owning cost is 93,125", numOf(r.ownCost) === 93125, r.ownCost);
  check("that is 6.21% of value, above the 5% rule", Math.abs(numOf(r.ratio) - 6.21) < 0.02, r.ratio);
  check("round trip is 135,000", numOf(r.tcost) === 135000, r.tcost);
  const short = CALC["rent-vs-buy"]({ ...base, hold: 2 });
  check("a two year hold favours renting", short.verdict === "Renting costs less", short.verdict);
  const long = CALC["rent-vs-buy"]({ ...base, hold: 25, growth: 5 });
  check("a long hold with growth favours buying", long.verdict === "Buying costs less", long.verdict);
}

console.log("\nOff-plan payment plan");
{
  const base = { price: 1500000, disc: 6, months: 30,
    aDown: 20, aBuild: 60, aHand: 20, aPost: 0, aPostMonths: 0,
    bDown: 10, bBuild: 30, bHand: 20, bPost: 40, bPostMonths: 48 };
  const r = CALC["off-plan-irr"](base);
  check("the back-loaded plan is cheaper today", r.winner === "Plan B", r.winner);
  check("plan A present value below headline", numOf(r.aPV) < 1500000, r.aPV);
  check("plan B discount beats plan A", numOf(r.bEff) > numOf(r.aEff), [r.aEff, r.bEff]);
  check("instalments sum to 100 percent", r.checkA === "100%" && r.checkB === "100%", [r.checkA, r.checkB]);
  const zero = CALC["off-plan-irr"]({ ...base, disc: 0 });
  check("at a zero discount rate both plans cost the headline", numOf(zero.aPV) === 1500000 && numOf(zero.bPV) === 1500000, [zero.aPV, zero.bPV]);
  check("and the verdict is level", zero.winner === "Level", zero.winner);
  const badSum = CALC["off-plan-irr"]({ ...base, aPost: 10 });
  check("a plan that does not total 100 is flagged", badSum.checkA.includes("check"), badSum.checkA);
}

console.log("\nSafe withdrawal rate");
{
  const r = CALC["safe-withdrawal-rate"]({ spend: 180000, other: 0, have: 400000, save: 90000, real: 5, custom: 4 });
  check("classic target is 25x the gap", numOf(r.classic) === 4500000, r.classic);
  check("conservative target is larger", numOf(r.cons) > numOf(r.classic), [r.cons, r.classic]);
  check("optimistic target is smaller", numOf(r.opt) < numOf(r.classic), [r.opt, r.classic]);
  check("year one income equals the spend", numOf(r.firstYear) === 180000, r.firstYear);
  check("years to target is finite and sensible", numOf(r.years) > 15 && numOf(r.years) < 30, r.years);
  const withPension = CALC["safe-withdrawal-rate"]({ spend: 180000, other: 60000, have: 0, save: 90000, real: 5, custom: 4 });
  check("other income shrinks the target", numOf(withPension.classic) === 3000000, withPension.classic);
}

console.log("\nUS estate tax exposure");
{
  const under = CALC["estate-tax-exposure"]({ us: 60000, divYield: 1.5, wht: 30, ucitsWht: 15, years: 20 });
  check("nothing is due at exactly 60,000", numOf(under.estateTax) === 0, under.estateTax);
  const r = CALC["estate-tax-exposure"]({ us: 500000, divYield: 1.5, wht: 30, ucitsWht: 15, years: 20 });
  // tentative on 500,000 = 155,800; less the 13,000 credit = 142,800
  check("500,000 produces 142,800", numOf(r.estateTax) === 142800, r.estateTax);
  check("taxable above the exemption is 440,000", numOf(r.taxable) === 440000, r.taxable);
  check("dividend cost on the US fund is 2,250", numOf(r.divUS) === 2250, r.divUS);
  check("the UCITS halves it", numOf(r.divUCITS) === 1125, r.divUCITS);
  check("twenty year dividend saving is 22,500", numOf(r.divSavingTotal) === 22500, r.divSavingTotal);
  const big = CALC["estate-tax-exposure"]({ us: 5000000, divYield: 1.5, wht: 30, ucitsWht: 15, years: 20 });
  check("effective rate rises with size but stays under 40%", numOf(big.effective) > numOf(r.effective) && numOf(big.effective) < 40, [r.effective, big.effective]);
}

console.log("\nLump sum versus cost averaging");
{
  const base = { amount: 500000, months: 12, ret: 7, cash: 4, horizon: 10 };
  const r = CALC["lump-sum-vs-dca"](base);
  check("investing now wins on a rising expectation", r.verdict === "Investing now wins", r.verdict);
  check("the gap is positive and modest", numOf(r.gapPct) > 0 && numOf(r.gapPct) < 10, r.gapPct);
  check("average time uninvested is 5.5 months", r.avgIn === "5.5 months", r.avgIn);
  check("a break-even fall is identified", r.breakeven.startsWith("A fall of"), r.breakeven);
  const one = CALC["lump-sum-vs-dca"]({ ...base, months: 1 });
  check("a one month window makes them identical", Math.abs(numOf(one.lump) - numOf(one.dca)) < 1, [one.lump, one.dca]);
  const cashBeats = CALC["lump-sum-vs-dca"]({ ...base, ret: 2, cash: 8 });
  check("if cash out-earns the market, averaging wins", cashBeats.verdict === "Cost averaging wins", cashBeats.verdict);
}

console.log("\nCrypto to dirhams");
{
  const base = { coins: 1, price: 80000, rate: 3.6725, spread: 2.5, fees: 0, target: 2000000, move: 0 };
  const r = CALC["crypto-conversion"](base);

  check("mid-market is coins times price times the rate",
    numOf(r.mid) === Math.round(1 * 80000 * 3.6725), r.mid);

  // The whole reason this calculator exists: the gap between what the coins
  // are worth and what arrives is real money, and nothing itemises it.
  check("what arrives is the mid-market less the spread",
    Math.abs(numOf(r.net) - 80000 * 3.6725 * 0.975) < 1, r.net);
  check("the cost is the difference between the two",
    Math.abs(numOf(r.cost) - 80000 * 3.6725 * 0.025) < 1, r.cost);

  const free = CALC["crypto-conversion"]({ ...base, spread: 0 });
  check("no spread means no cost, and the arithmetic says so rather than rounding to it",
    numOf(free.cost) === 0, free.cost);
  check("with no spread the delivered amount is the mid-market",
    numOf(free.net) === numOf(free.mid), free.net);

  const fee = CALC["crypto-conversion"]({ ...base, fees: 5000 });
  check("a fixed fee comes off after the spread, not before",
    Math.abs(numOf(fee.net) - (80000 * 3.6725 * 0.975 - 5000)) < 1, fee.net);

  // A conversion cost has no line item, so the only useful yardstick is the
  // one cost of that size every buyer already budgets for.
  check("the cost is set against the four percent transfer fee",
    /transfer fee/.test(r.vsFee), r.vsFee);
  const big = CALC["crypto-conversion"]({ ...base, spread: 6, target: 200000 });
  check("a conversion larger than the transfer fee is expressed as a multiple",
    /x the 4% transfer fee/.test(big.vsFee), big.vsFee);

  // The price move is the framework's actual warning, made interactive.
  const down = CALC["crypto-conversion"]({ ...base, move: -50 });
  check("a fifty percent fall halves what the same coins deliver",
    Math.abs(numOf(down.afterMove) - numOf(r.afterMove) / 2) < 2, down.afterMove);
  check("and roughly doubles the coins needed to cover the purchase",
    Math.abs(numOf(down.needCoins) - numOf(r.needCoins) * 2) < 0.01, down.needCoins);
  check("a rise reduces the coins needed",
    numOf(CALC["crypto-conversion"]({ ...base, move: 50 }).needCoins) < numOf(r.needCoins));

  // Nonsense in must not produce confident nonsense out.
  const zero = CALC["crypto-conversion"]({ ...base, price: 0 });
  check("a zero price cannot deliver anything", numOf(zero.net) === 0, zero.net);
  check("and says so rather than reporting infinite coins",
    /No amount covers it/.test(zero.needCoins), zero.needCoins);
  const huge = CALC["crypto-conversion"]({ ...base, spread: 100, fees: 999999 });
  check("delivered never goes negative", numOf(huge.net) === 0, huge.net);
  const noTarget = CALC["crypto-conversion"]({ ...base, target: 0 });
  check("with no property price it asks for one instead of dividing by zero",
    /Set a property price/.test(noTarget.vsFee), noTarget.vsFee);
}

console.log(fails ? `\n${fails} check(s) failed.\n` : "\nAll calculator checks passed.\n");
process.exit(fails ? 1 : 0);
