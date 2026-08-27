/* investmentsplaybook.com admin
   ==========================================================
   One Cloudflare Worker. Serves a login page, holds a session,
   and reads leads from MailerLite server-side.

   The whole reason this exists rather than a page on the static
   site: a static site cannot keep a secret. Anything it knows,
   every visitor knows, because they can read the source. The
   MailerLite key lives here, in Worker environment variables,
   and never reaches a browser.

   Three secrets, set in the Cloudflare dashboard, never in this file:
     MAILERLITE_API_KEY   the key, with read access to subscribers
     ADMIN_PASSWORD_HASH  produced by scripts/make-admin-hash.mjs
     SESSION_SECRET       32+ random characters

   If any of the three is missing the Worker refuses to serve
   anything rather than falling back to something open.
   ========================================================== */

const SESSION_HOURS = 12;
const COOKIE = "ip_admin";

/* The two groups the website forms feed. */
const GROUPS = [
  { id: "196852856803821437", label: "Daily Brief" },
  { id: "196852859365492262", label: "Playbook" },
];

/* ---------- small helpers ---------- */
const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

/* Compares in time that does not depend on where the first
   difference is. A normal === leaks the position of the mismatch
   through timing, which is enough to reconstruct a secret. */
export function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ---------- password ---------- */
/* PBKDF2-HMAC-SHA256. The iteration count is stored with the hash
   so it can be raised later without invalidating existing hashes. */
export async function pbkdf2(password, salt, iterations) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    256
  );
  return b64(bits);
}

export async function verifyPassword(password, stored) {
  // stored is "pbkdf2$<iterations>$<saltB64>$<hashB64>"
  const parts = String(stored || "").split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations < 10000) return false;
  let salt;
  try { salt = unb64(parts[2]); } catch { return false; }
  const got = await pbkdf2(password, salt, iterations);
  return timingSafeEqual(got, parts[3]);
}

/* ---------- session ---------- */
/* A signed token, not an encrypted one. It carries only an expiry,
   so there is nothing in it worth hiding, and the signature is what
   stops anyone writing their own. */
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  return b64(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

export async function makeSession(secret, now = Date.now()) {
  const exp = now + SESSION_HOURS * 3600 * 1000;
  const payload = `v1.${exp}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function readSession(secret, token, now = Date.now()) {
  if (typeof token !== "string") return null;
  const i = token.lastIndexOf(".");
  if (i < 1) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = await hmac(secret, payload);
  // Signature first. Checking expiry first would tell an attacker
  // whether their forged payload parsed, before rejecting it.
  if (!timingSafeEqual(sig, expected)) return null;
  const [v, expRaw] = payload.split(".");
  if (v !== "v1") return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= now) return null;
  return { exp };
}

function cookieFrom(req, name) {
  const raw = req.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return v.join("=");
  }
  return null;
}

/* ---------- responses ---------- */
const SECURITY_HEADERS = {
  "content-security-policy":
    "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-robots-tag": "noindex, nofollow, noarchive",
  "cache-control": "no-store, max-age=0",
};

const html = (body, status = 200, extra = {}) =>
  new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", ...SECURITY_HEADERS, ...extra },
  });

const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...SECURITY_HEADERS, ...extra },
  });

const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------- MailerLite ---------- */
async function fetchGroup(key, group) {
  const out = [];
  let cursor = null;
  // Two pages is 200 leads. Enough for a long time, and it bounds
  // the work so a slow upstream cannot hang the request.
  for (let page = 0; page < 2; page++) {
    const url = new URL("https://connect.mailerlite.com/api/subscribers");
    url.searchParams.set("filter[group]", group.id);
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);
    const r = await fetch(url, {
      headers: { authorization: `Bearer ${key}`, accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error(`MailerLite returned ${r.status} for ${group.label}`);
    const body = await r.json();
    for (const s of body.data || []) out.push({ ...s, _group: group.label });
    cursor = body.meta && body.meta.next_cursor;
    if (!cursor) break;
  }
  return out;
}

function shape(s) {
  const f = s.fields || {};
  const pick = (...names) => {
    for (const n of names) {
      for (const k of Object.keys(f)) {
        if (k.toLowerCase().replace(/[^a-z]/g, "") === n && f[k]) return String(f[k]);
      }
    }
    return "";
  };
  return {
    email: s.email || "",
    name: [pick("name"), pick("lastname")].filter(Boolean).join(" "),
    phone: pick("phone", "mobilephone"),
    country: pick("country"),
    intent: pick("investorintent", "intent"),
    source: pick("leadsource", "source"),
    group: s._group,
    status: s.status || "",
    joined: s.subscribed_at || s.created_at || "",
  };
}

/* ---------- pages ---------- */
function loginPage(error = "") {
  return html(`<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Sign in</title>
<style>
 :root{--ink:#171717;--red:#dc0000;--hair:#e3e3e1;--muted:#6b6b6b}
 *{box-sizing:border-box}
 body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fbfbf9;
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;color:var(--ink)}
 .box{width:100%;max-width:360px;padding:34px 30px;background:#fff;border:1px solid var(--hair)}
 .mark{font-family:Georgia,serif;font-size:19px;letter-spacing:.04em;text-transform:uppercase;margin:0 0 4px}
 .mark b{color:var(--red)}
 p.sub{margin:0 0 26px;font-size:13px;color:var(--muted)}
 label{display:block;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:7px}
 input{width:100%;padding:12px 13px;font-size:15px;border:1px solid var(--hair);border-radius:2px;background:#fff}
 input:focus{outline:2px solid var(--red);outline-offset:-2px}
 button{width:100%;margin-top:18px;padding:13px;font-size:12px;font-weight:700;letter-spacing:.12em;
        text-transform:uppercase;color:#fff;background:var(--red);border:1px solid var(--red);border-radius:2px;cursor:pointer}
 .err{margin:16px 0 0;padding:10px 12px;background:#fdecec;border-left:3px solid var(--red);font-size:13px}
</style>
<form class="box" method="POST" action="/login">
  <p class="mark">Investments <b>Playbook</b></p>
  <p class="sub">Admin. Authorised access only.</p>
  <label for="p">Password</label>
  <input id="p" name="password" type="password" autocomplete="current-password" autofocus required>
  <button type="submit">Sign in</button>
  ${error ? `<p class="err">${esc(error)}</p>` : ""}
</form>`, error ? 401 : 200);
}

function adminPage() {
  return html(`<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Leads</title>
<style>
 :root{--ink:#171717;--red:#dc0000;--hair:#e3e3e1;--muted:#6b6b6b;--cream:#ece5c0}
 *{box-sizing:border-box}
 body{margin:0;background:#fbfbf9;color:var(--ink);
      font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
 header{display:flex;align-items:center;gap:16px;padding:14px 22px;background:#000;color:#fff}
 header .mark{font-family:Georgia,serif;font-size:17px;letter-spacing:.04em;text-transform:uppercase}
 header .mark b{color:#ff2d2d}
 header .sp{margin-left:auto}
 header a{color:#bbb;font-size:12px;text-decoration:none;letter-spacing:.06em;text-transform:uppercase}
 header a:hover{color:#fff}
 main{padding:26px 22px;max-width:1200px;margin:0 auto}
 .tiles{display:flex;flex-wrap:wrap;gap:0;border:1px solid var(--hair);background:#fff;margin-bottom:22px}
 .tiles div{flex:1 1 150px;padding:16px 18px;border-right:1px solid var(--hair)}
 .tiles div:last-child{border-right:0}
 .tiles b{display:block;font-size:27px;line-height:1;font-variant-numeric:tabular-nums}
 .tiles span{display:block;margin-top:7px;font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
 .bar{display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap}
 .bar input{flex:1 1 220px;padding:9px 11px;font-size:14px;border:1px solid var(--hair);border-radius:2px}
 .bar button{padding:9px 14px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;
             background:#fff;border:1px solid var(--hair);border-radius:2px;cursor:pointer}
 table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--hair);font-size:14px}
 th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--hair);vertical-align:top}
 th{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:#fbfbf9}
 tr:last-child td{border-bottom:0}
 td.e{font-family:ui-monospace,Menlo,monospace;font-size:13px}
 .tag{display:inline-block;padding:2px 8px;font-size:11px;border:1px solid var(--hair);border-radius:999px}
 .empty{padding:34px 18px;background:#fff;border:1px solid var(--hair);color:var(--muted);font-size:14px;line-height:1.6}
 .err{padding:14px 16px;background:#fdecec;border-left:3px solid var(--red);font-size:14px}
 .wrap{overflow-x:auto}
</style>
<header>
  <span class="mark">Investments <b>Playbook</b></span>
  <span class="sp"></span>
  <a href="#" id="csv">Download CSV</a>
  <a href="/logout">Sign out</a>
</header>
<main>
  <div class="tiles" id="tiles"></div>
  <div class="bar">
    <input id="q" type="search" placeholder="Filter by email, name, intent or source" autocomplete="off">
    <button id="refresh" type="button">Refresh</button>
  </div>
  <div id="out" class="empty">Loading.</div>
</main>
<script>
(function(){
  var rows = [];
  var out = document.getElementById("out");
  var tiles = document.getElementById("tiles");

  function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }

  function when(iso){
    if(!iso) return "";
    var d = new Date(iso.replace(" ","T")+(/Z|\\+/.test(iso)?"":"Z"));
    if(isNaN(d)) return esc(iso);
    return d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
  }

  function render(){
    var q = document.getElementById("q").value.trim().toLowerCase();
    var list = rows.filter(function(r){
      if(!q) return true;
      return [r.email,r.name,r.intent,r.source,r.group,r.country].join(" ").toLowerCase().indexOf(q) > -1;
    });

    var byIntent = {};
    rows.forEach(function(r){ var k = r.intent || "not stated"; byIntent[k] = (byIntent[k]||0)+1; });
    var t = '<div><b>'+rows.length+'</b><span>Leads</span></div>';
    Object.keys(byIntent).sort().forEach(function(k){
      t += '<div><b>'+byIntent[k]+'</b><span>'+esc(k)+'</span></div>';
    });
    tiles.innerHTML = t;

    if(!list.length){
      out.className = "empty";
      out.textContent = rows.length
        ? "Nothing matches that filter."
        : "No leads yet. When somebody fills in a form on the site they appear here within a minute of you refreshing.";
      return;
    }
    out.className = "wrap";
    out.innerHTML = '<table><thead><tr><th>Email</th><th>Name</th><th>Intent</th><th>List</th><th>Phone</th><th>Country</th><th>Joined</th><th>Status</th></tr></thead><tbody>'
      + list.map(function(r){
          return '<tr><td class="e">'+esc(r.email)+'</td><td>'+esc(r.name)+'</td>'
            + '<td>'+(r.intent?'<span class="tag">'+esc(r.intent)+'</span>':'')+'</td>'
            + '<td>'+esc(r.group)+'</td><td>'+esc(r.phone)+'</td><td>'+esc(r.country)+'</td>'
            + '<td>'+when(r.joined)+'</td><td>'+esc(r.status)+'</td></tr>';
        }).join("")
      + '</tbody></table>';
  }

  function load(){
    out.className="empty"; out.textContent="Loading.";
    fetch("/api/leads",{credentials:"same-origin"}).then(function(r){
      if(r.status===401){ location.href="/"; return null; }
      if(!r.ok) throw new Error("The server returned "+r.status);
      return r.json();
    }).then(function(d){
      if(!d) return;
      rows = d.leads || [];
      render();
    }).catch(function(e){
      out.className="err";
      out.textContent = "Could not load leads. "+e.message;
    });
  }

  document.getElementById("q").addEventListener("input", render);
  document.getElementById("refresh").addEventListener("click", load);
  document.getElementById("csv").addEventListener("click", function(ev){
    ev.preventDefault();
    var head = ["email","name","intent","group","phone","country","joined","status"];
    var csv = [head.join(",")].concat(rows.map(function(r){
      return head.map(function(k){ return '"'+String(r[k]==null?"":r[k]).replace(/"/g,'""')+'"'; }).join(",");
    })).join("\\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download = "leads.csv";
    a.click();
  });
  load();
})();
</script>`);
}

/* ---------- routing ---------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    // Refuse to run at all rather than run without a secret.
    if (!env.SESSION_SECRET || !env.ADMIN_PASSWORD_HASH || !env.MAILERLITE_API_KEY) {
      return html("<h1>Not configured</h1><p>Set MAILERLITE_API_KEY, ADMIN_PASSWORD_HASH and SESSION_SECRET on this Worker.</p>", 503);
    }
    if (env.SESSION_SECRET.length < 24) {
      return html("<h1>Not configured</h1><p>SESSION_SECRET is too short. Use at least 32 random characters.</p>", 503);
    }

    const session = await readSession(env.SESSION_SECRET, cookieFrom(request, COOKIE));

    if (path === "/logout") {
      return new Response(null, {
        status: 302,
        headers: {
          location: "/",
          "set-cookie": `${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
          ...SECURITY_HEADERS,
        },
      });
    }

    if (path === "/login") {
      if (request.method !== "POST") return Response.redirect(url.origin + "/", 302);
      const form = await request.formData();
      const ok = await verifyPassword(String(form.get("password") || ""), env.ADMIN_PASSWORD_HASH);
      if (!ok) {
        // A deliberate pause. It costs a real person one second and
        // costs anyone guessing at scale their whole approach.
        await new Promise((r) => setTimeout(r, 1000));
        return loginPage("That password is not right.");
      }
      const token = await makeSession(env.SESSION_SECRET);
      return new Response(null, {
        status: 302,
        headers: {
          location: "/",
          "set-cookie": `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_HOURS * 3600}`,
          ...SECURITY_HEADERS,
        },
      });
    }

    if (path === "/api/leads") {
      if (!session) return json({ error: "Not signed in" }, 401);
      try {
        const all = [];
        for (const g of GROUPS) all.push(...(await fetchGroup(env.MAILERLITE_API_KEY, g)));
        const seen = new Set();
        const leads = [];
        for (const s of all) {
          const row = shape(s);
          const key = row.email.toLowerCase() + "|" + row.group;
          if (seen.has(key)) continue;
          seen.add(key);
          leads.push(row);
        }
        leads.sort((a, b) => (a.joined < b.joined ? 1 : -1));
        return json({ leads, count: leads.length });
      } catch (e) {
        // The message is ours, never the upstream body, which could
        // echo the key back in an error payload.
        return json({ error: String(e.message || "Upstream failure").slice(0, 120) }, 502);
      }
    }

    if (path === "/") return session ? adminPage() : loginPage();

    return html("<h1>Not found</h1>", 404);
  },
};
