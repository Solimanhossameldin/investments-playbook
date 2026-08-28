/* Investments Playbook. Client runtime. No dependencies. */
(function () {
  "use strict";

  var ML = { account: "__ML_ACCOUNT__", brief: "__ML_BRIEF__", lead: "__ML_LEAD__" };

  /* ---------------- nav ---------------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("nav--open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------------- scroll reveal ---------------- */
  var rises = document.querySelectorAll(".rise");
  if (rises.length) {
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rises.forEach(function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px 18% 0px", threshold: 0.01 });
      rises.forEach(function (el) { io.observe(el); });
      // Nothing on a reading site should ever be stuck invisible. If the
      // observer has not fired within three seconds, show everything.
      setTimeout(function () {
        rises.forEach(function (el) { el.classList.add("in"); });
      }, 3000);
    }
  }

  /* ---------------- count up ---------------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, target = parseFloat(el.getAttribute("data-count")), sfx = el.getAttribute("data-suffix") || "";
        var t0 = performance.now(), dur = 900;
        (function step(t) {
          var k = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + sfx;
          if (k < 1) requestAnimationFrame(step);
        })(t0);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------------- library filter and search ---------------- */
  var grid = document.getElementById("pb-grid");
  if (grid) {
    var chips = document.querySelectorAll("#pb-chips .chip");
    var search = document.getElementById("pb-search");
    var empty = document.getElementById("pb-empty");
    var cat = "all";

    function apply() {
      var q = search && search.value ? search.value.trim().toLowerCase() : "";
      var shown = 0;
      Array.prototype.forEach.call(grid.children, function (card) {
        var okCat = cat === "all" || card.getAttribute("data-cat") === cat;
        var text = card.getAttribute("data-text") || card.textContent.toLowerCase();
        var okQ = !q || text.indexOf(q) > -1;
        var on = okCat && okQ;
        card.style.display = on ? "" : "none";
        if (on) shown++;
      });
      if (empty) empty.hidden = shown > 0;
    }
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        chips.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        c.setAttribute("aria-pressed", "true");
        cat = c.getAttribute("data-cat");
        apply();
      });
    });
    if (search) search.addEventListener("input", apply);
  }

  /* ---------------- glossary filter ---------------- */
  var glChips = document.querySelectorAll("#gl-chips .chip");
  var glSearch = document.getElementById("gl-search");
  if (glChips.length || glSearch) {
    var glEmpty = document.getElementById("gl-empty");
    var glCat = "all";
    var glApply = function () {
      var q = glSearch && glSearch.value ? glSearch.value.trim().toLowerCase() : "";
      var shown = 0;
      document.querySelectorAll(".glblock .gl").forEach(function (row) {
        var okCat = glCat === "all" || row.getAttribute("data-cat") === glCat;
        var text = row.getAttribute("data-text") || row.textContent.toLowerCase();
        var on = okCat && (!q || text.indexOf(q) > -1);
        row.style.display = on ? "" : "none";
        if (on) shown++;
      });
      // A letter heading with nothing under it is noise, so it goes too.
      document.querySelectorAll("[data-letter]").forEach(function (block) {
        var any = Array.prototype.some.call(block.querySelectorAll(".gl"), function (r) {
          return r.style.display !== "none";
        });
        block.hidden = !any;
      });
      if (glEmpty) glEmpty.hidden = shown > 0;
    };
    glChips.forEach(function (c) {
      c.addEventListener("click", function () {
        glChips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
        glCat = c.getAttribute("data-cat");
        glApply();
      });
    });
    if (glSearch) glSearch.addEventListener("input", glApply);
  }

  /* ---------------- wire filter ---------------- */
  var wireChips = document.querySelectorAll("#wire-chips .chip");
  if (wireChips.length) {
    var wireEmpty = document.getElementById("wire-empty");
    wireChips.forEach(function (c) {
      c.addEventListener("click", function () {
        var cat = c.getAttribute("data-cat");
        wireChips.forEach(function (x) { x.setAttribute("aria-pressed", String(x === c)); });
        var shown = 0;
        document.querySelectorAll(".wi").forEach(function (row) {
          var on = cat === "all" || row.getAttribute("data-cat") === cat;
          row.style.display = on ? "" : "none";
          if (on) shown++;
        });
        // A day heading with nothing under it is noise, so it goes too.
        document.querySelectorAll("[data-day]").forEach(function (day) {
          var any = Array.prototype.some.call(day.querySelectorAll(".wi"), function (r) {
            return r.style.display !== "none";
          });
          day.hidden = !any;
        });
        if (wireEmpty) wireEmpty.hidden = shown > 0;
      });
    });
  }

  /* ---------------- gate ---------------- */
  function openGate() {
    var fade = document.querySelector("[data-gate-fade]");
    var rest = document.querySelector("[data-gate-rest]");
    var box = document.querySelector("[data-gate-box]");
    if (fade) fade.removeAttribute("data-gate-fade"), fade.classList.remove("gate__fade");
    if (rest) rest.hidden = false;
    // The cadence line is rendered into the form by the build, because only the
    // build knows whether the brief is actually publishing. Falling back to a
    // sentence that promises nothing is the safe direction to be wrong in.
    var form = document.querySelector("form[data-ml='brief'][data-next]");
    var next = (form && form.getAttribute("data-next")) || "You will get the next issue when it publishes.";
    if (box) box.innerHTML = '<h2>You are on the list</h2><p>' + next + ' Check your inbox for a confirmation email.</p>';
  }
  try { if (localStorage.getItem("ip_subscribed") === "1") openGate(); } catch (e) {}

  // Somebody who already subscribed gets the document back without being
  // asked for an address a second time.
  try {
    if (localStorage.getItem("ip_subscribed") === "1") {
      document.querySelectorAll("form[data-unlock]").forEach(function (f) {
        var u = f.getAttribute("data-unlock");
        f.innerHTML = '<a class="btn btn--solid" href="' + u + '" download>Download the checklist</a>' +
          '<p style="margin:12px 0 0;font-size:13px;color:var(--muted)">You are already on the list.</p>';
      });
    }
  } catch (e) {}

  /* ---------------- MailerLite ---------------- */
  function mlPost(formId, fields) {
    var fd = new FormData();
    Object.keys(fields).forEach(function (k) { if (fields[k]) fd.append("fields[" + k + "]", fields[k]); });
    fd.append("ml-submit", "1");
    fd.append("anticsrf", "true");
    var url = "https://assets.mailerlite.com/jsonp/" + ML.account + "/forms/" + formId + "/subscribe";
    return fetch(url, { method: "POST", body: fd }).catch(function () {
      return fetch(url, { method: "POST", body: fd, mode: "no-cors" });
    });
  }

  function busy(form, on, label) {
    var b = form.querySelector("button[type=submit]");
    if (!b) return;
    if (on) { b.dataset.prev = b.textContent; b.textContent = label || "Sending"; b.disabled = true; }
    else { b.textContent = b.dataset.prev || "Submit"; b.disabled = false; }
  }

  document.querySelectorAll('form[data-ml="brief"]').forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = form.querySelector('input[name=email]').value.trim();
      if (!email) return;
      busy(form, true);
      mlPost(ML.brief, { email: email, lead_source: "investmentsplaybook.com brief" }).then(function () {
        try { localStorage.setItem("ip_subscribed", "1"); } catch (e) {}
        // Where a form promised a document, the page hands it over itself.
        // Waiting on an email would make the promise depend on a mail
        // automation being switched on, and the reader has already paid.
        var unlock = form.getAttribute("data-unlock");
        if (unlock) {
          try { localStorage.setItem("ip_unlocked", "1"); } catch (e) {}
          form.innerHTML =
            '<p style="margin:0 0 12px;font-size:14px">You are on the list. Check your inbox to confirm.</p>' +
            '<a class="btn btn--solid" href="' + unlock + '" download>Download the checklist</a>';
        } else {
          form.innerHTML = '<p style="margin:0;font-size:14px">You are on the list. Check your inbox to confirm.</p>';
        }
        openGate();
      }).catch(function () {
        busy(form, false);
        var e = document.createElement("p");
        e.className = "err";
        e.textContent = "That did not go through. Try again in a moment.";
        form.appendChild(e);
      });
    });
  });

  /* ---------------- intent carried in from a path page ----------------
     A reader who arrived from /start/<path>/ has already told us what they
     are trying to do. Pre-selecting it saves them a choice and, more to the
     point, it is what routes them into the right email track. The value is
     only accepted if it matches an option the select already offers, so a
     crafted query string cannot write an arbitrary value into MailerLite. */
  (function () {
    var want = new URLSearchParams(location.search).get("intent");
    if (!want) return;
    document.querySelectorAll('form[data-ml="lead"] [name=intent]').forEach(function (sel) {
      for (var i = 0; i < sel.options.length; i++) {
        if (sel.options[i].value === want) { sel.selectedIndex = i; return; }
      }
    });
  })();

  document.querySelectorAll('form[data-ml="lead"]').forEach(function (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var g = function (n) { var el = form.querySelector('[name=' + n + ']'); return el ? el.value.trim() : ""; };
      busy(form, true, "Sending the Playbook");
      var params = new URLSearchParams(location.search);
      mlPost(ML.lead, {
        name: g("name"),
        email: g("email"),
        phone: g("dial") + " " + g("phone"),
        country: g("country"),
        investor_intent: g("intent"),
        lead_source: "investmentsplaybook.com" + (params.get("utm_source") ? " / " + params.get("utm_source") : ""),
        lead_status: "New",
      }).then(function () {
        var wrap = form.parentNode;
        wrap.innerHTML = '<div class="ok"><h4>Here it is</h4><p style="margin:0 0 14px;font-size:14px">Open it now, and confirm the email we just sent so the daily brief reaches you.</p><a class="btn btn--solid" href="/playbook/">Read the Playbook</a></div>';
      }).catch(function () {
        busy(form, false);
        var e = document.createElement("p");
        e.className = "err";
        e.textContent = "That did not go through. Try again, or email us directly.";
        form.appendChild(e);
      });
    });
  });

  /* ================= CALCULATORS ================= */
  var root = document.querySelector("[data-calc]");
  if (!root) return;
  var slug = root.getAttribute("data-calc");

  function vals() {
    var o = {};
    root.querySelectorAll("[data-f]").forEach(function (el) {
      var v = el.value;
      o[el.getAttribute("data-f")] = el.type === "number" || el.type === "range" ? (v === "" ? 0 : parseFloat(v)) : v;
    });
    return o;
  }

  var CALC = (window.IPCalc || {}).CALC || {};

  var calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function paint(out) {
    Object.keys(out).forEach(function (k) {
      var el = root.querySelector('[data-o="' + k + '"]');
      if (!el || el.textContent === String(out[k])) return;
      el.textContent = out[k];
      if (calm) return;
      // Re-trigger the animation rather than let a repeated class do nothing.
      el.classList.remove("bump");
      void el.offsetWidth;
      el.classList.add("bump");
    });
  }

  function run() {
    var v = vals();
    root.querySelectorAll('input[type="range"]').forEach(function (el) {
      var lbl = document.getElementById("v-" + el.getAttribute("data-f"));
      if (lbl) lbl.textContent = el.value + "%";
    });
    var fn = CALC[slug];
    if (fn) { try { paint(fn(v)); } catch (e) { /* keep the last good result */ } }
  }

  root.addEventListener("input", run);
  root.addEventListener("change", run);
  run();
})();
