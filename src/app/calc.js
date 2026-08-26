/* Investments Playbook. Calculator engine. Pure functions, no DOM.
   Kept separate so it can be unit tested in Node. */
(function (root) {
  "use strict";
  var CUR = "AED", USD = "USD";
  function money(v, cur) {
    if (!isFinite(v)) return "n/a";
    return (cur || CUR) + " " + Math.round(v).toLocaleString("en-US");
  }
  function pc(v, d) { return isFinite(v) ? (v * 100).toFixed(d === undefined ? 2 : d) + "%" : "n/a"; }
  function num(v, d) { return isFinite(v) ? v.toFixed(d === undefined ? 1 : d) : "n/a"; }


  /* -------- the six -------- */
  var CALC = {};

  CALC["net-rental-yield"] = function (v) {
    var serviceCharge = v.size * v.sc;
    var vacancyCost = v.rent * v.vac / 100;
    var effectiveRent = v.rent - vacancyCost;
    var mgmtCost = effectiveRent * v.mgmt / 100;
    var maintCost = v.rent * v.maint / 100;
    var opex = serviceCharge + mgmtCost + maintCost + v.insur + vacancyCost;
    var noi = v.rent - opex;
    var acq = v.price * v.dld / 100 + v.price * (v.agency / 100) * (1 + v.vat / 100) + v.closing;
    var loan = v.price * v.ltv / 100;
    var equity = v.price - loan;
    var invested = equity + acq;
    var r = v.rate / 100 / 12, nper = v.term * 12;
    var debt = loan <= 0 ? 0 : r > 0 ? (loan * r / (1 - Math.pow(1 + r, -nper))) * 12 : loan / v.term;
    var fixed = serviceCharge + maintCost + v.insur + debt;
    var breakeven = fixed / (v.rent * (1 - v.mgmt / 100));
    return {
      net: pc(noi / (v.price + acq)),
      gross: pc(v.rent / v.price),
      opex: money(opex),
      noi: money(noi),
      acq: money(acq),
      invested: money(invested),
      debt: money(debt),
      coc: pc((noi - debt) / invested),
      breakeven: pc(breakeven),
    };
  };

  CALC["rent-vs-buy"] = function (v) {
    var debt = v.price * (1 - v.deposit / 100);
    var equity = v.price * v.deposit / 100;
    var interest = debt * v.rate / 100;
    var opp = equity * v.alt / 100;
    var tax = v.price * v.proptax / 100;
    var ownCost = interest + opp + v.sc + tax;
    var tcost = v.price * v.roundtrip / 100;
    var g = v.growth / 100, rg = v.rentgrowth / 100;
    function ann(base, rate, n) { var s = 0; for (var i = 0; i < n; i++) s += base * Math.pow(1 + rate, i); return s; }
    function ownTo(n) {
      return n * (interest + opp + tax) + ann(v.sc, rg, n) + tcost - v.price * (Math.pow(1 + g, n) - 1);
    }
    function rentTo(n) { return ann(v.rent, rg, n); }
    var be = null;
    for (var y = 1; y <= 40; y++) { if (ownTo(y) <= rentTo(y)) { be = y; break; } }
    var h = Math.max(1, Math.round(v.hold));
    var o = ownTo(h), rr = rentTo(h);
    return {
      verdict: o < rr ? "Buying costs less" : "Renting costs less",
      ownCost: money(ownCost),
      rentCost: money(v.rent),
      ratio: pc(ownCost / v.price),
      tcost: money(tcost),
      ownTotal: money(o),
      rentTotal: money(rr),
      breakeven: be ? num(be, 0) + " years" : "Beyond 40 years",
    };
  };

  CALC["off-plan-irr"] = function (v) {
    var m = Math.pow(1 + v.disc / 100, 1 / 12) - 1;
    var M = Math.max(1, Math.round(v.months));
    function pv(down, build, hand, post, postMonths) {
      var t = v.price * down / 100;
      if (build > 0) { var per = v.price * build / 100 / M; for (var k = 1; k <= M; k++) t += per / Math.pow(1 + m, k); }
      t += (v.price * hand / 100) / Math.pow(1 + m, M);
      var pm = Math.max(0, Math.round(postMonths));
      if (post > 0 && pm > 0) { var pp = v.price * post / 100 / pm; for (var j = 1; j <= pm; j++) t += pp / Math.pow(1 + m, M + j); }
      return t;
    }
    var a = pv(v.aDown, v.aBuild, v.aHand, v.aPost, v.aPostMonths);
    var b = pv(v.bDown, v.bBuild, v.bHand, v.bPost, v.bPostMonths);
    var sa = v.aDown + v.aBuild + v.aHand + v.aPost, sb = v.bDown + v.bBuild + v.bHand + v.bPost;
    return {
      winner: Math.abs(a - b) < 1 ? "Level" : a < b ? "Plan A" : "Plan B",
      aPV: money(a),
      aEff: pc(1 - a / v.price),
      bPV: money(b),
      bEff: pc(1 - b / v.price),
      gap: money(Math.abs(a - b)),
      checkA: sa.toFixed(0) + "%" + (Math.abs(sa - 100) > 0.5 ? " check" : ""),
      checkB: sb.toFixed(0) + "%" + (Math.abs(sb - 100) > 0.5 ? " check" : ""),
    };
  };

  CALC["safe-withdrawal-rate"] = function (v) {
    var gap = Math.max(0, v.spend - v.other);
    var r = v.real / 100;
    var classic = gap / 0.04;
    function yearsTo(target) {
      var bal = v.have;
      for (var y = 1; y <= 60; y++) { bal = bal * (1 + r) + v.save; if (bal >= target) return y; }
      return null;
    }
    var y = yearsTo(classic);
    return {
      classic: money(classic),
      gap: money(gap),
      cons: money(gap / 0.039),
      opt: money(gap / 0.047),
      yourTarget: money(gap / (v.custom / 100)),
      years: y === null ? "Beyond 60" : num(y, 0) + " years",
      firstYear: money(classic * 0.04),
    };
  };

  var BRACKETS = [[10000, 0.18], [10000, 0.2], [20000, 0.22], [20000, 0.24], [20000, 0.26], [20000, 0.28],
    [50000, 0.3], [100000, 0.32], [250000, 0.34], [250000, 0.37], [250000, 0.39], [Infinity, 0.4]];

  CALC["estate-tax-exposure"] = function (v) {
    var left = Math.max(0, v.us), tax = 0;
    for (var i = 0; i < BRACKETS.length && left > 0; i++) {
      var band = Math.min(left, BRACKETS[i][0]);
      tax += band * BRACKETS[i][1];
      left -= band;
    }
    var estate = Math.max(0, tax - 13000);
    var div = v.us * v.divYield / 100;
    var dUS = div * v.wht / 100, dIE = div * v.ucitsWht / 100;
    return {
      estateTax: money(estate, USD),
      exempt: money(60000, USD),
      taxable: money(Math.max(0, v.us - 60000), USD),
      effective: pc(v.us > 0 ? estate / v.us : 0),
      divUS: money(dUS, USD),
      divUCITS: money(dIE, USD),
      divSaving: money(dUS - dIE, USD),
      divSavingTotal: money((dUS - dIE) * v.years, USD),
    };
  };

  CALC["lump-sum-vs-dca"] = function (v) {
    var N = Math.max(1, Math.round(v.months));
    var T = Math.max(N / 12, v.horizon);
    var M = Math.round(T * 12);
    var rm = Math.pow(1 + v.ret / 100, 1 / 12) - 1;
    var cm = Math.pow(1 + v.cash / 100, 1 / 12) - 1;

    // Price path: the expected drift at r, with a decline of F superimposed
    // linearly across the averaging window. F = 0 is the base case, pure drift.
    function path(F) {
      return function (k) {
        var drift = Math.pow(1 + rm, k);
        var fall = 1 - F * (Math.min(k, N) / N);
        return drift * fall;
      };
    }
    function values(F) {
      var p = path(F);
      var lump = v.amount * (p(M) / p(0));
      var units = 0;
      for (var k = 0; k < N; k++) units += (v.amount / N) * Math.pow(1 + cm, k) / p(k);
      return { lump: lump, dca: units * p(M) };
    }
    var base = values(0);
    var lo = 0, hi = 0.95, be = null;
    if (values(hi).dca > values(hi).lump) {
      for (var i = 0; i < 40; i++) {
        var mid = (lo + hi) / 2, r2 = values(mid);
        if (r2.dca > r2.lump) hi = mid; else lo = mid;
      }
      be = hi;
    }
    return {
      verdict: base.lump > base.dca ? "Investing now wins" : "Cost averaging wins",
      lump: money(base.lump),
      dca: money(base.dca),
      gap: money(Math.abs(base.lump - base.dca)),
      gapPct: pc(Math.abs(base.lump - base.dca) / v.amount),
      avgIn: num((N - 1) / 2, 1) + " months",
      breakeven: be === null ? "No realistic fall flips it" : "A fall of " + pc(be, 1),
    };
  };


  root.IPCalc = { CALC: CALC, money: money, pc: pc, num: num };
})(typeof globalThis !== "undefined" ? globalThis : this);
