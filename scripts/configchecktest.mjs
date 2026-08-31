#!/usr/bin/env node
/* The one thing this must never do is leak what it is checking for. */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { report, present, EXPECTED } from "../src/configcheck.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let n = 0; const fails = [];
const t = (name, fn) => {
  try { fn(); n++; console.log(`  pass  ${name}`); }
  catch (e) { fails.push(name); console.log(`  FAIL  ${name}: ${e.message}`); }
};

const SECRET = "AQ.Ab8RN6-this-must-never-appear-anywhere";

t("a value is never repeated back, anywhere in the output", () => {
  const r = report({ GEMINI_API_KEY: SECRET, MAILERLITE_API_KEY: SECRET, MAIL_MODE: SECRET });
  const all = JSON.stringify(r);
  assert.ok(!all.includes(SECRET), "the report contains the value it was given");
  assert.ok(!all.includes("Ab8RN6"), "a fragment of the value survived");
});

t("nor is its length, because a length is a clue", () => {
  const short = report({ GEMINI_API_KEY: "a", MAILERLITE_API_KEY: "b" });
  const long = report({ GEMINI_API_KEY: "a".repeat(120), MAILERLITE_API_KEY: "b".repeat(120) });
  assert.equal(short.detail, long.detail, "the report changes with the size of the value");
});

t("an empty variable is the same answer as an absent one", () => {
  assert.equal(present({ K: "" }, "K"), false);
  assert.equal(present({ K: "   " }, "K"), false);
  assert.equal(present({}, "K"), false);
  assert.equal(present({ K: "x" }, "K"), true);
});

t("with nothing configured it says so, and names what is missing", () => {
  const r = report({});
  assert.equal(r.status, "incomplete");
  assert.deepEqual(r.missing, ["GEMINI_API_KEY", "MAILERLITE_API_KEY"]);
  assert.match(r.detail, /nothing configured/);
});

t("an optional name missing does not make the run incomplete", () => {
  const r = report({ GEMINI_API_KEY: "x", MAILERLITE_API_KEY: "y" });
  assert.equal(r.status, "ok");
  assert.deepEqual(r.missing, []);
});

t("it reports on every name the workflow actually passes", () => {
  const yml = fs.readFileSync(path.join(root, ".github/workflows/daily.yml"), "utf8");
  for (const e of EXPECTED) {
    const ref = e.kind === "secret" ? `secrets.${e.name}` : `vars.${e.name}`;
    assert.ok(yml.includes(ref), `${e.name} is expected but the workflow never passes ${ref}`);
  }
});

t("and the scripts read the names it checks for", () => {
  const src = ["scripts/generate-brief.mjs", "scripts/mail-brief.mjs", "scripts/mailaudit.mjs"]
    .map((f) => fs.readFileSync(path.join(root, f), "utf8")).join("\n");
  for (const e of EXPECTED) assert.ok(src.includes(e.name), `nothing reads ${e.name}`);
});

t("the shipped script writes a run to the status file and prints one line", () => {
  const before = fs.readFileSync(path.join(root, "content/status.json"), "utf8");
  const env = { ...process.env };
  delete env.GEMINI_API_KEY; delete env.MAILERLITE_API_KEY;
  const out = execFileSync("node", [path.join(root, "scripts/configcheck.mjs")], { env, encoding: "utf8" });
  assert.match(out, /^configuration: /);
  const after = JSON.parse(fs.readFileSync(path.join(root, "content/status.json"), "utf8"));
  assert.equal(after.runs[0].job, "configuration");
  assert.equal(after.runs[0].status, "incomplete");
  assert.ok(after.runs[0].ranAt, "no timestamp, which is the defect this file exists to avoid");
  fs.writeFileSync(path.join(root, "content/status.json"), before);
});

console.log(`\nconfigcheck: ${n} checks passed${fails.length ? `, ${fails.length} FAILED` : ""}.`);
process.exit(fails.length ? 1 : 0);
