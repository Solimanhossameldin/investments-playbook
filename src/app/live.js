/* Investments Playbook. Live refresh for the four figures that actually move
   during the day. Everything else on this site changes daily at source, so
   polling it from the browser would buy nothing and cost the visitor requests.

   FRED refuses cross origin browser requests, which is the other half of the
   reason Treasuries, CPI, the mortgage rate, oil and the dollar index stay
   build time. Gold, silver and crypto allow them, so those go live here.

   Failure is silent by design: if a provider is down or the visitor is
   offline, the figures rendered at build time stay exactly where they are. */
(function () {
  "use strict";

  if (typeof fetch !== "function") return;

  var EVERY = 60000;
  var LIVE = ["xau", "xag", "btc-usd", "eth-usd"];

  // Nothing to do on a page with no live-capable figure on it.
  var present = LIVE.filter(function (s) { return document.querySelector('[data-sym="' + s + '"]'); });
  if (!present.length) return;

  /* ---------------- formatting, matched to the server side ---------------- */
  function fmt(n, dp) {
    return Number(n).toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  }
  function pct(n) { return (n > 0 ? "+" : "") + n.toFixed(2) + "%"; }
  function glyph(n) { return n > 0 ? "▲" : n < 0 ? "▼" : "–"; }
  function dirClass(n) { return n > 0 ? "up" : n < 0 ? "dn" : "flat"; }

  function gst(d) {
    try {
      return new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Dubai",
      }).format(d);
    } catch (e) {
      return d.toISOString().slice(11, 16);
    }
  }

  /* ---------------- providers ---------------- */
  function kraken() {
    return fetch("https://api.kraken.com/0/public/Ticker?pair=XBTUSD,ETHUSD", { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.result) throw new Error("kraken");
        var out = {};
        var map = { "btc-usd": ["XXBTZUSD", "XBTUSD"], "eth-usd": ["XETHZUSD", "ETHUSD"] };
        Object.keys(map).forEach(function (sym) {
          var row = null;
          map[sym].forEach(function (k) { if (!row && d.result[k]) row = d.result[k]; });
          if (!row) return;
          var last = parseFloat(row.c && row.c[0]);
          var open = parseFloat(row.o);
          if (!isFinite(last)) return;
          out[sym] = {
            value: last,
            dp: 2,
            changePct: isFinite(open) && open ? ((last - open) / open) * 100 : null,
          };
        });
        return out;
      });
  }

  function metal(sym, code) {
    return fetch("https://api.gold-api.com/price/" + code, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var v = parseFloat(d && d.price);
        if (!isFinite(v)) throw new Error(code);
        var o = {};
        // gold-api publishes no previous close, so the change column stays
        // honest rather than being invented from this morning's build.
        o[sym] = { value: v, dp: 2, changePct: null };
        return o;
      });
  }

  /* ---------------- painting ---------------- */
  function paintOne(sym, q, stamp) {
    var nodes = document.querySelectorAll('[data-sym="' + sym + '"]');
    Array.prototype.forEach.call(nodes, function (el) {
      var v = el.querySelector("[data-live-v]");
      if (v) {
        var next = fmt(q.value, q.dp);
        if (v.textContent !== next) {
          v.textContent = next;
          v.classList.remove("tick");
          void v.offsetWidth;
          v.classList.add("tick");
        }
      }
      var c = el.querySelector("[data-live-c]");
      if (c && q.changePct !== null && isFinite(q.changePct)) {
        c.className = c.className.replace(/\b(up|dn|flat)\b/g, "").trim() + " " + dirClass(q.changePct);
        c.textContent = (el.classList.contains("tk") || el.classList.contains("hbx")
          ? glyph(q.changePct) + " " : "") + pct(q.changePct);
      }
      var t = el.querySelector("[data-live-t]");
      if (t) t.textContent = stamp + " GST";
      var dot = el.querySelector("[data-live-dot]");
      if (dot) dot.hidden = false;
      el.classList.remove("tk--stale");
      el.style.opacity = "";
    });
  }

  var everFailed = false;

  function tick() {
    var jobs = [];
    if (present.indexOf("btc-usd") > -1 || present.indexOf("eth-usd") > -1) jobs.push(kraken());
    if (present.indexOf("xau") > -1) jobs.push(metal("xau", "XAU"));
    if (present.indexOf("xag") > -1) jobs.push(metal("xag", "XAG"));

    Promise.all(
      jobs.map(function (p) { return p.catch(function () { return null; }); })
    ).then(function (results) {
      var merged = {};
      results.forEach(function (r) { if (r) Object.keys(r).forEach(function (k) { merged[k] = r[k]; }); });
      var syms = Object.keys(merged);
      if (!syms.length) { everFailed = true; return; }
      var stamp = gst(new Date());
      syms.forEach(function (sym) { paintOne(sym, merged[sym], stamp); });

      // The ticker's own timestamp only claims what it can back up.
      var meta = document.querySelector("[data-live-stamp]");
      if (meta && !everFailed) meta.textContent = "Live " + stamp + " GST";
    });
  }

  /* The first refresh used to fire the moment this script ran, which put three
     third party requests -- Kraken and two gold-api calls -- into the same
     window as the stylesheet and the two preloaded fonts. Measured on the live
     site, those calls took between 200ms and 1.8s and were competing with the
     things a reader is actually waiting to see.

     They buy nothing by being early. Every figure on the page was already
     written at build time and is correct to within a day; the live refresh
     only sharpens four of them. So it waits until the page has finished
     loading, and then until the browser is idle if it will tell us. A reader
     on a slow connection gets their page first and their gold price a second
     later, which is the right way round. */
  var timer;
  function start() {
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 200); };
    idle(function () {
      tick();
      timer = setInterval(tick, EVERY);
    });
  }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });

  // A backgrounded tab does not need fresh prices. Catch up on return.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearInterval(timer);
    } else {
      tick();
      timer = setInterval(tick, EVERY);
    }
  });
})();
