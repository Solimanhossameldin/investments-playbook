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

import { SECTIONS, validate } from "./content-schema.mjs";
import { parseEntry, serialiseEntry } from "../src/content/format.mjs";

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

export function adminPage() {
  return html(`<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Investments Playbook admin</title>
<style>
 :root{--ink:#171717;--red:#dc0000;--hair:#e3e3e1;--muted:#6b6b6b;--cream:#ece5c0;--paper:#fbfbf9}
 *{box-sizing:border-box}
 body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
 header{display:flex;align-items:center;gap:16px;padding:13px 20px;background:#000;color:#fff;position:sticky;top:0;z-index:20}
 header .mark{font-family:Georgia,serif;font-size:16px;letter-spacing:.04em;text-transform:uppercase}
 header .mark b{color:#ff2d2d}
 header .sp{margin-left:auto}
 header a,header button{color:#bbb;background:none;border:0;font-size:12px;letter-spacing:.06em;text-transform:uppercase;text-decoration:none;cursor:pointer}
 header a:hover,header button:hover{color:#fff}
 .shell{display:flex;min-height:calc(100vh - 48px);align-items:flex-start}
 nav.side{width:196px;flex:0 0 196px;padding:20px 0;border-right:1px solid var(--hair);background:#fff;min-height:calc(100vh - 48px)}
 nav.side button{display:block;width:100%;text-align:left;padding:9px 20px;background:none;border:0;font-size:14px;color:var(--ink);cursor:pointer;border-left:3px solid transparent}
 nav.side button:hover{background:var(--paper)}
 nav.side button[aria-current="true"]{border-left-color:var(--red);font-weight:600;background:var(--paper)}
 main{flex:1;padding:24px 26px 110px;max-width:1000px;min-width:0}
 h1{font-family:Georgia,serif;font-size:25px;margin:0 0 4px;font-weight:400}
 .sub{color:var(--muted);font-size:13.5px;margin:0 0 20px}
 table{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--hair)}
 th,td{padding:9px 12px;text-align:left;border-bottom:1px solid var(--hair)}
 th{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:var(--paper)}
 tr:last-child td{border-bottom:0}
 tbody tr{cursor:pointer}
 tbody tr:hover{background:var(--cream)}
 td.e{font-family:ui-monospace,Menlo,monospace;font-size:12.5px;color:var(--muted)}
 .tag{display:inline-block;padding:2px 8px;font-size:11px;border:1px solid var(--hair);border-radius:999px}
 label{display:block;font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin:18px 0 6px}
 .help{font-size:12.5px;color:var(--muted);margin:-2px 0 6px}
 input,textarea,select{width:100%;padding:10px 11px;font-size:14.5px;font-family:inherit;border:1px solid var(--hair);border-radius:2px;background:#fff}
 textarea{line-height:1.55;resize:vertical}
 textarea.mono{font-family:ui-monospace,Menlo,monospace;font-size:13px}
 input:focus,textarea:focus,select:focus{outline:2px solid var(--red);outline-offset:-2px}
 .pair{display:flex;gap:8px;margin-bottom:7px}
 .pair input:first-child{flex:0 0 44%}
 .row{display:flex;gap:14px;flex-wrap:wrap}
 .row>div{flex:1 1 180px}
 .btn{padding:11px 18px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;border-radius:2px;cursor:pointer;border:1px solid var(--red);background:var(--red);color:#fff}
 .btn.ghost{background:#fff;color:var(--ink);border-color:var(--hair)}
 .btn[disabled]{opacity:.55;cursor:default}
 .bar{position:sticky;bottom:0;display:flex;gap:10px;align-items:center;padding:14px 0;margin-top:22px;border-top:1px solid var(--hair);background:var(--paper);box-shadow:0 -10px 18px -12px rgba(0,0,0,.25)}
 .msg{padding:11px 14px;margin:14px 0;font-size:14px;border-left:3px solid}
 .ok{background:#eaf6f0;border-color:#0e7c70}
 .err{background:#fdecec;border-color:var(--red)}
 .empty{padding:30px 18px;background:#fff;border:1px solid var(--hair);color:var(--muted)}
 .filter{margin-bottom:12px}
 .filter input{max-width:340px}
 @media(max-width:760px){.shell{display:block}nav.side{width:auto;min-height:0;display:flex;overflow-x:auto;padding:0;border-right:0;border-bottom:1px solid var(--hair)}nav.side button{width:auto;white-space:nowrap;border-left:0;border-bottom:3px solid transparent}nav.side button[aria-current="true"]{border-bottom-color:var(--red)}main{padding:18px 16px}}
</style>
<header>
  <span class="mark">Investments <b>Playbook</b></span>
  <span class="sp"></span>
  <a href="https://investmentsplaybook.com" target="_blank" rel="noopener">View site</a>
  <a href="/logout">Sign out</a>
</header>
<div class="shell">
  <nav class="side" id="side"></nav>
  <main id="main"><p class="sub">Loading.</p></main>
</div>
<script>
(function(){
  var SECTIONS=[], cur=null, item=null, main=document.getElementById("main"), side=document.getElementById("side");

  function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}
  function el(h){var d=document.createElement("div");d.innerHTML=h;return d;}
  function msg(kind,text){return '<div class="msg '+kind+'">'+esc(text)+'</div>';}

  function api(path,opts){
    return fetch(path,Object.assign({credentials:"same-origin"},opts||{})).then(function(r){
      if(r.status===401){location.href="/";return null;}
      return r.json().then(function(d){ if(!r.ok) throw new Error(d.error||("The server returned "+r.status)); return d; });
    });
  }

  function nav(){
    side.innerHTML = SECTIONS.map(function(s){
      return '<button data-k="'+s.key+'" aria-current="'+(cur===s.key)+'">'+esc(s.label)+'</button>';
    }).join("") + '<button data-k="leads" aria-current="'+(cur==="leads")+'">Leads</button>';
    Array.prototype.forEach.call(side.querySelectorAll("button"),function(b){
      b.onclick=function(){ open(b.dataset.k); };
    });
  }

  function open(key){ cur=key; item=null; nav(); key==="leads"?leads():list(key); }

  /* ---------- list ---------- */
  function list(key){
    var s=SECTIONS.filter(function(x){return x.key===key;})[0];
    main.innerHTML='<h1>'+esc(s.label)+'</h1><p class="sub">Loading.</p>';
    api("/api/list?section="+encodeURIComponent(key)).then(function(d){
      if(!d)return;
      var rows=d.items||[];
      main.innerHTML='<h1>'+esc(s.label)+'</h1><p class="sub">'+rows.length+' entries. Click one to edit it.</p>'
        +'<div class="filter"><input id="q" type="search" placeholder="Filter" autocomplete="off"></div>'
        +'<table><thead><tr><th>Title</th><th>Category</th><th>Address</th></tr></thead><tbody id="tb"></tbody></table>';
      function draw(){
        var q=(document.getElementById("q").value||"").toLowerCase();
        document.getElementById("tb").innerHTML=rows.filter(function(r){
          return !q || (r.title+" "+r.slug+" "+r.category).toLowerCase().indexOf(q)>-1;
        }).map(function(r){
          return '<tr data-s="'+esc(r.slug)+'"><td>'+esc(r.title)+(r.broken?' <span class="tag">will not parse</span>':'')
            +'</td><td>'+(r.category?'<span class="tag">'+esc(r.category)+'</span>':'')+'</td><td class="e">'+esc(r.slug)+'</td></tr>';
        }).join("");
        Array.prototype.forEach.call(document.querySelectorAll("#tb tr"),function(tr){
          tr.onclick=function(){ edit(key,tr.dataset.s); };
        });
      }
      document.getElementById("q").oninput=draw; draw();
    }).catch(function(e){ main.innerHTML='<h1>'+esc(s.label)+'</h1>'+msg("err",e.message); });
  }

  /* ---------- edit ---------- */
  function field(f,meta,body){
    var v = f.key==="body" ? body : meta[f.key];
    var id="f_"+f.key;
    var h='<label for="'+id+'">'+esc(f.label)+'</label>';
    if(f.help) h+='<p class="help">'+esc(f.help)+'</p>';
    if(f.type==="select"){
      h+='<select id="'+id+'">'+f.options.map(function(o){
        return '<option'+(o===v?' selected':'')+'>'+esc(o)+'</option>';}).join("")+'</select>';
    } else if(f.type==="textarea"){
      h+='<textarea id="'+id+'" rows="'+(f.rows||4)+'"'+(f.key==="formula"?' class="mono"':'')+'>'+esc(v)+'</textarea>';
    } else if(f.type==="markdown"){
      h+='<textarea id="'+id+'" rows="20">'+esc(v)+'</textarea>';
    } else if(f.type==="list"){
      h+='<textarea id="'+id+'" rows="6" data-list="1">'+esc((v||[]).join("\\n"))+'</textarea>';
    } else if(f.type==="pairs"){
      h+='<div id="'+id+'" data-pairs="1">'+((v||[]).concat([{}])).map(function(p){
        return '<div class="pair"><input placeholder="'+esc(f.pair[0])+'" value="'+esc(p[f.pair[0]])+'">'
             + '<input placeholder="'+esc(f.pair[1])+'" value="'+esc(p[f.pair[1]])+'"></div>';
      }).join("")+'</div><p class="help">Leave a row blank to drop it.</p>';
    } else {
      h+='<input id="'+id+'" type="'+(f.type==="number"?"number":"text")+'" value="'+esc(v)+'">';
    }
    return h;
  }

  function collect(fields){
    var meta={}, body="";
    fields.forEach(function(f){
      var node=document.getElementById("f_"+f.key);
      if(!node) return;
      if(f.type==="pairs"){
        meta[f.key]=Array.prototype.map.call(node.querySelectorAll(".pair"),function(row){
          var i=row.querySelectorAll("input");
          var o={}; o[f.pair[0]]=i[0].value.trim(); o[f.pair[1]]=i[1].value.trim(); return o;
        }).filter(function(o){return o[f.pair[0]]||o[f.pair[1]];});
      } else if(f.type==="list"){
        meta[f.key]=node.value.split("\\n").map(function(x){return x.trim();}).filter(Boolean);
      } else if(f.key==="body"){
        body=node.value;
      } else if(f.type==="number"){
        meta[f.key]=Number(node.value);
      } else {
        meta[f.key]=node.value;
      }
    });
    return {meta:meta, body:body};
  }

  function edit(key,slug){
    var s=SECTIONS.filter(function(x){return x.key===key;})[0];
    main.innerHTML='<p class="sub">Loading.</p>';
    api("/api/item?section="+encodeURIComponent(key)+"&slug="+encodeURIComponent(slug)).then(function(d){
      if(!d)return;
      item=d;
      var live = d.meta.path || (s.key==="playbooks"?"/playbooks/":s.key==="glossary"?"/glossary/":"/")+slug+"/";
      main.innerHTML='<h1>'+esc(d.meta[s.titleField]||slug)+'</h1>'
        +'<p class="sub"><a href="https://investmentsplaybook.com'+esc(live)+'" target="_blank" rel="noopener">View this page on the site</a></p>'
        +'<div id="notice"></div>'
        +'<form id="form" onsubmit="return false">'+s.fields.map(function(f){return field(f,d.meta,d.body);}).join("")+'</form>'
        +'<div class="bar"><button class="btn" id="save">Publish</button>'
        +'<button class="btn ghost" id="back">Back</button>'
        +'<span class="sub" id="state" style="margin:0"></span></div>';
      document.getElementById("back").onclick=function(){ open(key); };
      document.getElementById("save").onclick=function(){ save(key,slug,s); };
    }).catch(function(e){ main.innerHTML=msg("err",e.message)+'<button class="btn ghost" id="b2">Back</button>';
      document.getElementById("b2").onclick=function(){ open(key); }; });
  }

  function save(key,slug,s){
    var btn=document.getElementById("save"), state=document.getElementById("state");
    var got=collect(s.fields);
    // Everything the admin does not know about is carried through
    // unchanged, so a field it has no form for is never dropped.
    var meta=Object.assign({},item.meta,got.meta);
    btn.disabled=true; state.textContent="Publishing.";
    api("/api/save",{method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({section:key,slug:slug,meta:meta,body:got.body,sha:item.sha})})
      .then(function(d){
        if(!d)return;
        document.getElementById("notice").innerHTML=msg("ok",d.message);
        state.textContent=""; btn.disabled=false;
        window.scrollTo({top:0,behavior:"smooth"});
        return api("/api/item?section="+encodeURIComponent(key)+"&slug="+encodeURIComponent(slug))
          .then(function(fresh){ if(fresh) item=fresh; });
      })
      .catch(function(e){
        document.getElementById("notice").innerHTML=msg("err",e.message);
        state.textContent=""; btn.disabled=false;
        window.scrollTo({top:0,behavior:"smooth"});
      });
  }

  /* ---------- leads ---------- */
  function leads(){
    main.innerHTML='<h1>Leads</h1><p class="sub">Loading.</p>';
    api("/api/leads").then(function(d){
      if(!d)return;
      var rows=d.leads||[];
      if(!rows.length){
        main.innerHTML='<h1>Leads</h1><div class="empty">Nobody has signed up yet. When somebody fills in a form on the site they appear here.</div>';
        return;
      }
      var byIntent={}; rows.forEach(function(r){var k=r.intent||"not stated";byIntent[k]=(byIntent[k]||0)+1;});
      main.innerHTML='<h1>Leads</h1><p class="sub">'+rows.length+' in total. '
        +Object.keys(byIntent).sort().map(function(k){return byIntent[k]+" "+esc(k);}).join(", ")+'.</p>'
        +'<div class="filter"><input id="q" type="search" placeholder="Filter"></div>'
        +'<p><button class="btn ghost" id="csv">Download CSV</button></p>'
        +'<table><thead><tr><th>Email</th><th>Name</th><th>Intent</th><th>List</th><th>Joined</th></tr></thead><tbody id="tb"></tbody></table>';
      function draw(){
        var q=(document.getElementById("q").value||"").toLowerCase();
        document.getElementById("tb").innerHTML=rows.filter(function(r){
          return !q||[r.email,r.name,r.intent,r.group].join(" ").toLowerCase().indexOf(q)>-1;
        }).map(function(r){
          return '<tr><td class="e">'+esc(r.email)+'</td><td>'+esc(r.name)+'</td><td>'
            +(r.intent?'<span class="tag">'+esc(r.intent)+'</span>':'')+'</td><td>'+esc(r.group)+'</td><td>'+esc((r.joined||"").slice(0,10))+'</td></tr>';
        }).join("");
      }
      document.getElementById("q").oninput=draw; draw();
      document.getElementById("csv").onclick=function(){
        var head=["email","name","intent","group","phone","country","joined","status"];
        var csv=[head.join(",")].concat(rows.map(function(r){
          return head.map(function(k){return '"'+String(r[k]==null?"":r[k]).replace(/"/g,'""')+'"';}).join(",");
        })).join("\\n");
        var a=document.createElement("a");
        a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
        a.download="leads.csv"; a.click();
      };
    }).catch(function(e){ main.innerHTML='<h1>Leads</h1>'+msg("err",e.message); });
  }

  api("/api/sections").then(function(d){
    if(!d)return;
    SECTIONS=d.sections; open(SECTIONS[0].key);
  }).catch(function(e){ main.innerHTML=msg("err",e.message); });
})();
</script>`);
}

/* ---------- the repository ----------
   Editing writes a commit to GitHub, which triggers the same build and
   deploy that runs twice a day anyway. There is no separate publishing
   system to go wrong, and every edit has an author, a timestamp and a
   diff, which is a better audit trail than most content systems manage.

   You never see any of this. You sign in to your own site with your own
   password; the token below is the Worker's, not yours. */

const REPO = "Solimanhossameldin/investments-playbook";
const BRANCH = "main";

async function gh(env, path, init = {}) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "user-agent": "investments-playbook-admin",
      "content-type": "application/json",
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) {
    const detail = r.status === 404 ? "not found" : r.status === 401 ? "the GitHub token is wrong or expired" : `GitHub returned ${r.status}`;
    throw new Error(detail);
  }
  return r.json();
}

const b64encode = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const b64decode = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\n/g, "")), (c) => c.charCodeAt(0)));

async function listSection(env, key) {
  const section = SECTIONS[key];
  const files = await gh(env, `contents/${section.dir}?ref=${BRANCH}`);
  const items = [];
  for (const f of files) {
    if (!f.name.endsWith(".md")) continue;
    items.push({ slug: f.name.replace(/\.md$/, ""), file: f.name });
  }
  return items;
}

async function readItem(env, key, slug) {
  const section = SECTIONS[key];
  const file = await gh(env, `contents/${section.dir}/${slug}.md?ref=${BRANCH}`);
  const { meta, body } = parseEntry(b64decode(file.content), `${slug}.md`);
  return { meta, body, sha: file.sha };
}

async function writeItem(env, key, slug, meta, body, sha) {
  const section = SECTIONS[key];
  const content = serialiseEntry(meta, body);
  return gh(env, `contents/${section.dir}/${slug}.md`, {
    method: "PUT",
    body: JSON.stringify({
      message: `Edit ${section.label.toLowerCase()}: ${slug}`,
      content: b64encode(content),
      sha,
      branch: BRANCH,
    }),
  });
}

/* ---------- routing ---------- */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    // Refuse to run at all rather than run without a secret.
    const missing = ["SESSION_SECRET", "ADMIN_PASSWORD_HASH", "MAILERLITE_API_KEY", "GITHUB_TOKEN"]
      .filter((k) => !env[k]);
    if (missing.length) {
      return html(`<h1>Not configured</h1><p>This Worker is missing ${missing.join(", ")}. Add them under Settings, Variables and Secrets, then deploy again.</p>`, 503);
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


    if (path === "/api/sections") {
      if (!session) return json({ error: "Not signed in" }, 401);
      return json({
        sections: Object.entries(SECTIONS).map(([key, v]) => ({
          key, label: v.label, titleField: v.titleField, fields: v.fields,
        })),
      });
    }

    if (path === "/api/list") {
      if (!session) return json({ error: "Not signed in" }, 401);
      const key = url.searchParams.get("section");
      if (!SECTIONS[key]) return json({ error: "Unknown section" }, 400);
      try {
        const files = await listSection(env, key);
        // The list needs a title, and the title lives inside each file.
        // Fetched in parallel so opening the admin is one wait, not forty.
        const items = await Promise.all(files.map(async (f) => {
          try {
            const { meta } = await readItem(env, key, f.slug);
            return { slug: f.slug, title: meta[SECTIONS[key].titleField] || f.slug, category: meta.category || "", order: meta.order };
          } catch { return { slug: f.slug, title: f.slug, category: "", order: 9999, broken: true }; }
        }));
        items.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
        return json({ items });
      } catch (e) {
        return json({ error: String(e.message).slice(0, 140) }, 502);
      }
    }

    if (path === "/api/item") {
      if (!session) return json({ error: "Not signed in" }, 401);
      const key = url.searchParams.get("section");
      const slug = url.searchParams.get("slug");
      if (!SECTIONS[key] || !/^[a-z0-9-]+$/.test(slug || "")) return json({ error: "Unknown item" }, 400);
      try {
        const { meta, body, sha } = await readItem(env, key, slug);
        return json({ meta, body, sha });
      } catch (e) {
        return json({ error: String(e.message).slice(0, 140) }, 502);
      }
    }

    if (path === "/api/save") {
      if (!session) return json({ error: "Not signed in" }, 401);
      if (request.method !== "POST") return json({ error: "Use POST" }, 405);
      let payload;
      try { payload = await request.json(); } catch { return json({ error: "That was not valid JSON" }, 400); }

      const { section: key, slug, meta, body, sha } = payload || {};
      if (!SECTIONS[key] || !/^[a-z0-9-]+$/.test(slug || "")) return json({ error: "Unknown item" }, 400);
      if (!meta || typeof meta !== "object") return json({ error: "Nothing to save" }, 400);
      if (typeof body !== "string") return json({ error: "The body is missing" }, 400);

      // Validated here, on the server, because the browser is not where
      // this has to hold. Anyone can post to this endpoint.
      const errors = validate(key, meta, body);
      if (errors.length) return json({ error: errors.join(" "), errors }, 422);

      try {
        // The stored copy is re-read and re-parsed after writing. If the
        // file that lands cannot be parsed back, the site would fail to
        // build, and you would find out from a red cross rather than here.
        const check = serialiseEntry(meta, body);
        parseEntry(check, `${slug}.md`);
        await writeItem(env, key, slug, meta, body, sha);
        return json({ ok: true, message: "Published. The site rebuilds in about two minutes." });
      } catch (e) {
        const m = String(e.message || "");
        if (/409|sha/i.test(m)) return json({ error: "Somebody changed this since you opened it. Reload the entry and apply your change again." }, 409);
        return json({ error: m.slice(0, 140) }, 502);
      }
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
