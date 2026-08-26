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
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
      rises.forEach(function (el) { io.observe(el); });
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

  /* ---------------- gate ---------------- */
  function openGate() {
    var fade = document.querySelector("[data-gate-fade]");
    var rest = document.querySelector("[data-gate-rest]");
    var box = document.querySelector("[data-gate-box]");
    if (fade) fade.removeAttribute("data-gate-fade"), fade.classList.remove("gate__fade");
    if (rest) rest.hidden = false;
    if (box) box.innerHTML = '<h4>You are on the list</h4><p>The next brief lands at 7am GST. Check your inbox for a confirmation email.</p>';
  }
  try { if (localStorage.getItem("ip_subscribed") === "1") openGate(); } catch (e) {}

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
        form.innerHTML = '<p style="margin:0;font-size:14px">You are on the list. Check your inbox to confirm.</p>';
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

  function paint(out) {
    Object.keys(out).forEach(function (k) {
      var el = root.querySelector('[data-o="' + k + '"]');
      if (el) el.textContent = out[k];
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
