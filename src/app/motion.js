/* Investments Playbook. Depth and motion layer. No dependencies.
   Everything here is progressive enhancement: if it never runs, the
   site is exactly the site it was, just flatter. */
(function () {
  "use strict";

  var reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var raf = window.requestAnimationFrame;
  if (!raf) return;

  /* ---------------- scroll progress ---------------- */
  (function () {
    if (reduced) return;
    var bar = document.createElement("div");
    bar.className = "prog";
    document.body.appendChild(bar);
    var ticking = false;
    function draw() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var k = h > 0 ? Math.min(1, Math.max(0, window.pageYOffset / h)) : 0;
      bar.style.transform = "scaleX(" + k + ")";
      ticking = false;
    }
    addEventListener("scroll", function () {
      if (!ticking) { ticking = true; raf(draw); }
    }, { passive: true });
    draw();
  })();

  /* ---------------- header condense ---------------- */
  (function () {
    var hdr = document.querySelector(".hdr");
    if (!hdr) return;
    var on = false;
    addEventListener("scroll", function () {
      var want = window.pageYOffset > 40;
      if (want !== on) { on = want; hdr.classList.toggle("hdr--on", on); }
    }, { passive: true });
  })();

  /* ---------------- headline, word by word ---------------- */
  (function () {
    if (reduced) return;
    var heads = document.querySelectorAll(".hero h1, .doc-cover h1");
    Array.prototype.forEach.call(heads, function (h) {
      var words = h.textContent.trim().split(/\s+/);
      if (words.length > 24) return;
      h.textContent = "";
      words.forEach(function (w, i) {
        var s = document.createElement("span");
        s.className = "w";
        s.textContent = w;
        s.style.setProperty("--d", 90 + i * 55 + "ms");
        h.appendChild(s);
        if (i < words.length - 1) h.appendChild(document.createTextNode(" "));
      });
    });
  })();

  /* ---------------- stagger the scroll reveals ---------------- */
  (function () {
    if (reduced) return;
    var seen = new Map();
    document.querySelectorAll(".rise").forEach(function (el) {
      var p = el.parentNode;
      var i = seen.get(p) || 0;
      seen.set(p, i + 1);
      el.style.setProperty("--d", Math.min(i * 55, 220) + "ms");
    });
  })();

  /* ---------------- 3D tilt ---------------- */
  (function () {
    if (reduced || !fine) return;
    var sel = ".card, .stat, .lead__stat, .q, .gate__box, .ok, .rail__box, .calc__out, .author__img, .definition, .callout";
    var els = document.querySelectorAll(sel);
    if (!els.length) return;
    var MAX = 6;

    function enter(el) { el.classList.add("tilting"); }
    function move(el, ev) {
      var r = el.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width - 0.5;
      var py = (ev.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        "perspective(900px) rotateX(" + (-py * MAX).toFixed(2) + "deg) rotateY(" +
        (px * MAX).toFixed(2) + "deg) translate3d(0,-3px,0)";
    }
    function leave(el) {
      el.classList.remove("tilting");
      el.style.transform = "";
    }

    Array.prototype.forEach.call(els, function (el) {
      el.setAttribute("data-tilt", "");
      el.addEventListener("pointerenter", function () { enter(el); });
      el.addEventListener("pointermove", function (ev) { move(el, ev); });
      el.addEventListener("pointerleave", function () { leave(el); });
    });
  })();

  /* ---------------- the ticker actually runs ---------------- */
  (function () {
    if (reduced) return;
    var tk = document.querySelector(".ticker");
    var inner = tk && tk.querySelector(".ticker__in");
    if (!inner) return;
    var items = inner.querySelectorAll(".tk");
    if (items.length < 4) return;

    var track = document.createElement("div");
    track.className = "ticker__track";
    Array.prototype.forEach.call(items, function (el) { track.appendChild(el); });
    // A second copy is what makes a translate of minus fifty percent loop seamlessly.
    var copy = track.cloneNode(true);
    while (copy.firstChild) track.appendChild(copy.firstChild);
    inner.insertBefore(track, inner.firstChild);
    tk.classList.add("ticker--run");

    // Pace it by content width so a long list is not a blur and a short one is not a crawl.
    var w = track.scrollWidth / 2;
    if (w > 0) track.style.animationDuration = Math.round(Math.max(28, w / 26)) + "s";
  })();

  /* ---------------- the hero globe ---------------- */
  (function () {
    if (reduced) return;
    var hero = document.querySelector(".hero");
    if (!hero) return;

    var glow = document.createElement("div");
    glow.className = "hero__glow";
    glow.setAttribute("aria-hidden", "true");
    hero.insertBefore(glow, hero.firstChild);

    var cv = document.createElement("canvas");
    cv.className = "hero__canvas";
    cv.setAttribute("aria-hidden", "true");
    hero.insertBefore(cv, hero.firstChild.nextSibling);
    var ctx = cv.getContext && cv.getContext("2d");
    if (!ctx) return;

    var W = 0, H = 0, dpr = 1, R = 0, cx = 0, cy = 0, small = false;

    function size() {
      var r = hero.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(r.width));
      H = Math.max(1, Math.round(r.height));
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = W + "px";
      cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      small = W < 900;
      // Sized off the width as well as the height, so a tall hero on a
      // laptop does not turn the globe into a wall.
      R = small ? Math.min(W * 0.30, H * 0.22) : Math.min(W * 0.175, H * 0.30);
      cx = small ? W * 0.5 : W * 0.76;
      cy = small ? H * 0.70 : H * 0.44;
    }

    /* a dot cloud in the shape of a lat/lon grid */
    var pts = [];
    for (var lat = -78; lat <= 78; lat += 6) {
      var rad = Math.cos((lat * Math.PI) / 180);
      var n = Math.max(6, Math.round(46 * rad));
      for (var i = 0; i < n; i++) {
        var lon = (360 / n) * i;
        pts.push(vec(lat, lon));
      }
    }

    function vec(lat, lon) {
      var a = (lat * Math.PI) / 180, b = (lon * Math.PI) / 180;
      return [Math.cos(a) * Math.cos(b), Math.sin(a), Math.cos(a) * Math.sin(b)];
    }

    var CITIES = [
      ["Dubai", 25.2, 55.3], ["London", 51.5, -0.13], ["New York", 40.7, -74.0],
      ["Singapore", 1.35, 103.8], ["Hong Kong", 22.3, 114.2], ["Zurich", 47.4, 8.5],
      ["Mumbai", 19.1, 72.9], ["Tokyo", 35.7, 139.7],
    ].map(function (c) { return { v: vec(c[1], c[2]) }; });

    var ROUTES = [[0, 1], [0, 3], [1, 2], [0, 6], [4, 7], [1, 5]];

    /* great circle sampling, so a route bends over the surface */
    function slerp(a, b, t) {
      var d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      d = Math.max(-1, Math.min(1, d));
      var o = Math.acos(d);
      if (o < 1e-6) return a.slice();
      var s = Math.sin(o), k1 = Math.sin((1 - t) * o) / s, k2 = Math.sin(t * o) / s;
      return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
    }

    var yaw = 0, tiltX = -0.32, targetYaw = 0, targetTilt = -0.32;
    var easeYaw = 0, easeTilt = -0.32;

    function rot(p) {
      var cy1 = Math.cos(yaw), sy = Math.sin(yaw);
      var x = p[0] * cy1 - p[2] * sy, z = p[0] * sy + p[2] * cy1, y = p[1];
      var ct = Math.cos(tiltX), st = Math.sin(tiltX);
      return [x, y * ct - z * st, y * st + z * ct];
    }

    function project(p, k) {
      var d = 3.1;
      var s = d / (d - p[2] * (k || 1));
      return [cx + p[0] * R * s, cy - p[1] * R * s, p[2], s];
    }

    if (fine) {
      hero.addEventListener("pointermove", function (ev) {
        var r = hero.getBoundingClientRect();
        targetYaw = ((ev.clientX - r.left) / r.width - 0.5) * 0.6;
        targetTilt = -0.32 + ((ev.clientY - r.top) / r.height - 0.5) * 0.35;
      });
      hero.addEventListener("pointerleave", function () { targetYaw = 0; targetTilt = -0.32; });
    }

    var spin = 0, running = true, t0 = performance.now();

    function frame(t) {
      if (!running) return;
      var dt = Math.min(64, t - t0);
      t0 = t;
      spin += dt * 0.00011;
      // the pointer offset eases in on its own, on top of the constant spin
      easeYaw += (targetYaw - easeYaw) * 0.05;
      easeTilt += (targetTilt - easeTilt) * 0.05;
      yaw = spin + easeYaw;
      tiltX = easeTilt;

      ctx.clearRect(0, 0, W, H);

      /* atmosphere, so the dot cloud reads as a solid body and not confetti */
      var atmo = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R * 1.5);
      atmo.addColorStop(0, "rgba(23,52,96,0.62)");
      atmo.addColorStop(0.62, "rgba(15,33,62,0.38)");
      atmo.addColorStop(1, "rgba(10,22,40,0)");
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.5, 0, 6.2832);
      ctx.fill();

      /* the silhouette. For a unit sphere viewed from d, the tangent radius
         is d / sqrt(d*d - 1), which is where the rim actually falls. */
      var rim = R * 1.0565;
      ctx.beginPath();
      ctx.arc(cx, cy, rim, 0, 6.2832);
      ctx.strokeStyle = "rgba(201,169,97,0.30)";
      ctx.lineWidth = 1;
      ctx.stroke();

      /* the sphere itself */
      for (var i = 0; i < pts.length; i++) {
        var p = rot(pts[i]);
        var q = project(p);
        var front = p[2] > 0;
        var a = front ? 0.20 + p[2] * 0.62 : 0.075;
        ctx.fillStyle = "rgba(201,169,97," + a.toFixed(3) + ")";
        var r = (front ? 1.7 : 1.1) * q[3];
        ctx.fillRect(q[0] - r / 2, q[1] - r / 2, r, r);
      }

      /* the routes */
      for (var j = 0; j < ROUTES.length; j++) {
        var A = CITIES[ROUTES[j][0]].v, B = CITIES[ROUTES[j][1]].v;
        ctx.beginPath();
        var started = false;
        for (var s = 0; s <= 36; s++) {
          var m = slerp(A, B, s / 36);
          var lift = 1 + 0.07 * Math.sin((s / 36) * Math.PI);
          var pm = rot([m[0] * lift, m[1] * lift, m[2] * lift]);
          var qm = project(pm);
          if (pm[2] < -0.15) { started = false; continue; }
          if (!started) { ctx.moveTo(qm[0], qm[1]); started = true; }
          else ctx.lineTo(qm[0], qm[1]);
        }
        ctx.strokeStyle = "rgba(214,183,116,0.42)";
        ctx.lineWidth = 1.1;
        ctx.stroke();

        /* one packet travelling the route */
        var tt = ((t * 0.00013) + j * 0.17) % 1;
        var mp = slerp(A, B, tt);
        var lf = 1 + 0.07 * Math.sin(tt * Math.PI);
        var pp = rot([mp[0] * lf, mp[1] * lf, mp[2] * lf]);
        if (pp[2] > -0.1) {
          var qp = project(pp);
          ctx.beginPath();
          ctx.arc(qp[0], qp[1], 2.1 * qp[3], 0, 6.2832);
          ctx.fillStyle = "rgba(232,206,150,0.9)";
          ctx.fill();
        }
      }

      /* the centres */
      for (var c = 0; c < CITIES.length; c++) {
        var pc = rot(CITIES[c].v);
        if (pc[2] <= 0) continue;
        var qc = project(pc);
        ctx.beginPath();
        ctx.arc(qc[0], qc[1], 2.4 * qc[3], 0, 6.2832);
        ctx.fillStyle = "rgba(201,169,97,0.95)";
        ctx.fill();
        var pulse = (Math.sin(t * 0.0016 + c) + 1) / 2;
        ctx.beginPath();
        ctx.arc(qc[0], qc[1], (3 + pulse * 8) * qc[3], 0, 6.2832);
        ctx.strokeStyle = "rgba(201,169,97," + (0.28 * (1 - pulse)).toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      raf(frame);
    }

    size();
    addEventListener("resize", size);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; t0 = performance.now(); raf(frame); }
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !running) { running = true; t0 = performance.now(); raf(frame); }
          else if (!e.isIntersecting) running = false;
        });
      }, { threshold: 0 }).observe(hero);
    }

    raf(frame);
    setTimeout(function () { cv.classList.add("on"); }, 60);
  })();
})();
