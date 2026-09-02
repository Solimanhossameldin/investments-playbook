/* Investments Playbook. Client runtime. No dependencies. */
(function () {
  "use strict";

  var ML = { account: "__ML_ACCOUNT__", brief: "__ML_BRIEF__", lead: "__ML_LEAD__", whatsapp: "__ML_WHATSAPP__" };

  /* ---------------- a number you can actually ring ----------------
     Both forms demand a phone now, so both have to check it is one. The
     digit counts come from src/lib.mjs at build time rather than being typed
     again here, and selftest runs this function and that one over the same
     table and fails if they ever disagree.

     It normalises before it judges, because the commonest "wrong" number is
     a right one written the way people say it out loud: 050 in the UAE, 07
     in the UK, or the country code typed again in the box beside the menu
     that already asks for it. Rejecting those would be the form's mistake,
     not the reader's. */
  var PHONE_DIGITS = __PHONE_DIGITS__;

  function normalisePhone(dial, raw) {
    var code = String(dial || "").trim();
    var d = String(raw || "").replace(/\D+/g, "");
    if (!d) return { ok: false, reason: "Enter your phone number." };
    var bare = code.replace("+", "");
    var rule = PHONE_DIGITS[code];
    if (d.indexOf("00" + bare) === 0) d = d.slice(2 + bare.length);
    else if (d.indexOf(bare) === 0 && d.length > (rule ? rule[0] : 7)) d = d.slice(bare.length);
    d = d.replace(/^0+/, "");
    if (!d) return { ok: false, reason: "That is not a phone number." };
    if (!rule) return { ok: true, national: d, pretty: code + " " + d };
    var min = rule[0], max = rule[1], want = min === max ? String(min) : min + " to " + max;
    if (d.length < min) return { ok: false, reason: "That looks short for " + code + ". Expected " + want + " digits after the code, got " + d.length + "." };
    if (d.length > max) return { ok: false, reason: "That looks long for " + code + ". Expected " + want + " digits after the code, got " + d.length + "." };
    return { ok: true, national: d, pretty: code + " " + d };
  }

  /* Say it where the reader is looking, and let the browser say it too, so
     the message survives being missed on screen. */
  function tellPhone(form, message) {
    var el = form.querySelector("[name=phone]");
    if (!el) return;
    el.setCustomValidity(message || "");
    if (message) { el.reportValidity(); el.focus(); }
  }

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

  /* ---------------- the channel that brought them ----------------
     `lead_source` names the page that earned a signup. It does not name the
     channel that produced the visit, and only the six field lead form ever
     looked, reading utm_source at the moment of submit. So a reader who
     arrives on a framework from LinkedIn, reads three more and subscribes on
     the fourth had no query string left by then, and the channel was lost on
     exactly the signups worth tracing.

     First touch is captured on arrival and kept. Somebody who came from a
     forwarded link and returns a week later by typing the address is still a
     reader that link produced, and the page that earned the signup is a
     different question the source string already answers.

     Anything arriving in a URL is untrusted. The value is lower cased,
     reduced to a conservative character set and cut to forty characters
     before it is stored, so a crafted link cannot write arbitrary text into
     a lead record. */
  (function () {
    var clean = function (v) {
      return String(v || "")
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
    };
    var params = new URLSearchParams(location.search);
    var parts = [
      clean(params.get("ref") || params.get("utm_source")),
      clean(params.get("utm_medium")),
      clean(params.get("utm_campaign")),
    ].filter(Boolean);
    if (!parts.length) return;
    try {
      if (!localStorage.getItem("ip_channel")) {
        localStorage.setItem("ip_channel", parts.join(" / "));
      }
    } catch (e) {}
  })();

  function channel() {
    try { return localStorage.getItem("ip_channel") || ""; } catch (e) { return ""; }
  }

  /* ---------------- MailerLite ---------------- */
  /* ---------------- the submit, and what it may honestly claim ----------------
     A reader is told "you are on the list" in the second after handing over an
     address, so that sentence has to be true. It was not. Two ways it lied:

       - no status was ever checked, so a 400 or a 500 from MailerLite resolved
         and was reported to the reader as a successful signup;
       - the fallback sends with mode:"no-cors", whose response is opaque by
         specification: it always resolves and its status cannot be read.
         Returning that promise made the failure branch unreachable, so the
         page could never say a signup had failed, however badly it had.

     An opaque response is not evidence of anything, so it is not called a
     success. It resolves { verified: false } and the page says something
     weaker and true, with a way to reach a human. Only a 2xx this origin was
     allowed to read returns { verified: true }. A status we could read and
     that was bad rejects, because that is the one case genuinely known to
     have gone wrong. */
  function mlPost(formId, fields) {
    var fd = new FormData();
    Object.keys(fields).forEach(function (k) { if (fields[k]) fd.append("fields[" + k + "]", fields[k]); });
    fd.append("ml-submit", "1");
    fd.append("anticsrf", "true");
    var url = "https://assets.mailerlite.com/jsonp/" + ML.account + "/forms/" + formId + "/subscribe";
    return fetch(url, { method: "POST", body: fd }).then(
      function (r) {
        if (!r || !r.ok) throw new Error("HTTP " + ((r && r.status) || "unknown"));
        return { verified: true };
      },
      function () {
        /* Blocked before any status existed. Retry opaquely so the data still
           arrives, and record that nothing about it can be confirmed. */
        return fetch(url, { method: "POST", body: fd, mode: "no-cors" }).then(function () {
          return { verified: false };
        });
      }
    );
  }

  /* What the reader is shown, given what is actually known. Kept next to the
     post rather than at each call site so the two cannot drift apart. */
  function confirmLine(res) {
    if (res && res.verified) return "You are on the list. Check your inbox to confirm.";
    var wa = ML.whatsapp && ML.whatsapp.indexOf("http") === 0
      ? ' or <a href="' + ML.whatsapp + '">message us on WhatsApp</a>'
      : "";
    return "Sent. Check your inbox to confirm \u2014 if nothing arrives in a few minutes, try again" + wa + ".";
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
      /* The short form asks for a number now. Read it the same way the lead
         form does, so a signup from any door on the site arrives dialable. */
      var f = function (n) { var el = form.querySelector('[name=' + n + ']'); return el ? el.value.trim() : ""; };
      var tel = "";
      if (f("phone")) {
        var ph = normalisePhone(f("dial"), f("phone"));
        if (!ph.ok) { tellPhone(form, ph.reason); return; }
        tellPhone(form, "");
        tel = ph.pretty;
      }
      busy(form, true);
      // A constant lead_source made every signup look identical, so nothing
      // could be traced to the page that earned it. The page now says.
      var src = form.getAttribute("data-source");
      var intent = form.getAttribute("data-intent");
      mlPost(ML.brief, {
        email: email,
        phone: tel,
        lead_source: "investmentsplaybook.com" + (src ? " / " + src : " / brief")
          + (channel() ? " / " + channel() : ""),
        investor_intent: intent || ""
      }).then(function (res) {
        try { localStorage.setItem("ip_subscribed", "1"); } catch (e) {}
        // Where a form promised a document, the page hands it over itself.
        // Waiting on an email would make the promise depend on a mail
        // automation being switched on, and the reader has already paid.
        var unlock = form.getAttribute("data-unlock");
        if (unlock) {
          try { localStorage.setItem("ip_unlocked", "1"); } catch (e) {}
          form.innerHTML =
            '<p style="margin:0 0 12px;font-size:14px">' + confirmLine(res) + '</p>' +
            '<a class="btn btn--solid" href="' + unlock + '" download>Download the checklist</a>';
        } else {
          form.innerHTML = '<p style="margin:0;font-size:14px">' + confirmLine(res) + '</p>';
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
      var lp = normalisePhone(g("dial"), g("phone"));
      if (!lp.ok) { tellPhone(form, lp.reason); return; }
      tellPhone(form, "");
      busy(form, true, "Sending the Playbook");
      mlPost(ML.lead, {
        name: g("name"),
        email: g("email"),
        phone: lp.pretty,
        country: g("country"),
        investor_intent: g("intent"),
        lead_source: "investmentsplaybook.com"
          + (form.getAttribute("data-source") ? " / " + form.getAttribute("data-source") : "")
          + (channel() ? " / " + channel() : ""),
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
