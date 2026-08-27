#!/usr/bin/env node
/* The back end, running on your own machine.
 
   Same screens, same fields, same validation as the published admin.
   The difference is where it writes: this one edits the files in this
   folder directly, so you can see and use the whole thing before any
   hosting account exists.
 
   It listens on 127.0.0.1 only. That is the loopback address, which
   means it is reachable from this computer and from nowhere else --
   not from the internet, not from the office wifi. That is why it has
   no password: there is nobody else who could reach it. The published
   version on Cloudflare does have one, because that one is public.
 
   Run:  node scripts/admin-local.mjs
   Or double-click admin.command.
*/

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adminPage } from "../admin/worker.js";
import { SECTIONS, validate } from "../admin/content-schema.mjs";
import { parseEntry, serialiseEntry } from "../src/content/format.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 4174);

const send = (res, status, body, type = "application/json") => {
  res.writeHead(status, {
    "content-type": type + "; charset=utf-8",
    "cache-control": "no-store",
    "x-robots-tag": "noindex, nofollow",
  });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
};

const safeSlug = (s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s || "");
const fileFor = (key, slug) => path.join(root, SECTIONS[key].dir, `${slug}.md`);

function readItem(key, slug) {
  const { meta, body } = parseEntry(fs.readFileSync(fileFor(key, slug), "utf8"), `${slug}.md`);
  return { meta, body, sha: "local" };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const p = url.pathname.replace(/\/+$/, "") || "/";

  try {
    if (p === "/") {
      // The admin page is taken from the Worker itself rather than
      // copied, so this preview cannot drift away from the real thing.
      const page = adminPage();
      return send(res, 200, await page.text(), "text/html");
    }

    if (p === "/api/sections") {
      return send(res, 200, {
        sections: Object.entries(SECTIONS).map(([key, v]) => ({
          key, label: v.label, titleField: v.titleField, fields: v.fields,
        })),
      });
    }

    if (p === "/api/list") {
      const key = url.searchParams.get("section");
      if (!SECTIONS[key]) return send(res, 400, { error: "Unknown section" });
      const dir = path.join(root, SECTIONS[key].dir);
      const items = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).map((f) => {
        const slug = f.replace(/\.md$/, "");
        try {
          const { meta } = readItem(key, slug);
          return { slug, title: meta[SECTIONS[key].titleField] || slug, category: meta.category || "", order: meta.order };
        } catch {
          return { slug, title: slug, category: "", order: 9999, broken: true };
        }
      });
      items.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
      return send(res, 200, { items });
    }

    if (p === "/api/item") {
      const key = url.searchParams.get("section");
      const slug = url.searchParams.get("slug");
      if (!SECTIONS[key] || !safeSlug(slug)) return send(res, 400, { error: "Unknown item" });
      return send(res, 200, readItem(key, slug));
    }

    if (p === "/api/save") {
      if (req.method !== "POST") return send(res, 405, { error: "Use POST" });
      const chunks = [];
      for await (const c of req) chunks.push(c);
      let payload;
      try { payload = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
      catch { return send(res, 400, { error: "That was not valid JSON" }); }

      const { section: key, slug, meta, body } = payload || {};
      if (!SECTIONS[key] || !safeSlug(slug)) return send(res, 400, { error: "Unknown item" });

      const errors = validate(key, meta, body);
      if (errors.length) return send(res, 422, { error: errors.join(" "), errors });

      const text = serialiseEntry(meta, body);
      parseEntry(text, `${slug}.md`);   // must be readable back before it is written
      fs.writeFileSync(fileFor(key, slug), text);
      console.log(`saved ${SECTIONS[key].dir}/${slug}.md`);
      return send(res, 200, {
        ok: true,
        message: "Saved to this computer. Double-click push.command to put it on the live site.",
      });
    }

    if (p === "/api/leads") {
      return send(res, 200, {
        leads: [],
        note: "Leads are not shown in the local preview. The published admin reads them live from MailerLite.",
      });
    }

    if (p === "/logout") {
      return send(res, 200, "<h1>This is the local preview</h1><p>There is nothing to sign out of. Close the Terminal window to stop it.</p>", "text/html");
    }

    return send(res, 404, { error: "Not found" });
  } catch (e) {
    console.error(e);
    return send(res, 500, { error: String(e.message || e).slice(0, 200) });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`
  The back end is running.

      http://127.0.0.1:${PORT}

  Open that in your browser. Edit anything, press Publish, and the
  change is written to the files in this folder. Then double-click
  push.command to put it on the live site.

  This is reachable from this computer only. Close this window to stop it.
`);
});
