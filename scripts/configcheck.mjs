#!/usr/bin/env node
/* Write down which secrets and variables reached this run. Never their values. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { report } from "../src/configcheck.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const r = report(process.env);

const p = path.join(root, "content/status.json");
let s = { runs: [] };
try { s = JSON.parse(fs.readFileSync(p, "utf8")); } catch {}
s.runs.unshift({ job: "configuration", status: r.status, detail: r.detail, ranAt: new Date().toISOString() });
s.runs = s.runs.slice(0, 40);
fs.writeFileSync(p, JSON.stringify(s, null, 1));

console.log(`configuration: ${r.detail}`);
