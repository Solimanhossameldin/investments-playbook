#!/usr/bin/env node
/* Validates every content file on disk.
 
   This is what stands between an edit made in the admin and a broken
   site. The build imports these files; if one of them is malformed the
   build fails with a stack trace and no clue which entry caused it.
   These checks name the file. */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEntry, serialiseEntry, loadEntries } from "../src/content/entry.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let n = 0;
const t = (name, fn) => { fn(); n++; };

/* ---------- the format itself ---------- */
t("a well formed entry parses", () => {
  const { meta, body } = parseEntry('---\n{ "a": 1 }\n---\n\nHello.');
  assert.equal(meta.a, 1);
  assert.equal(body, "Hello.");
});

t("a malformed entry says what is wrong and where", () => {
  assert.throws(() => parseEntry("no rule at all", "x.md"), /x\.md: must begin with a --- rule/);
  assert.throws(() => parseEntry('---\n{ "a": 1 }\nno close', "y.md"), /y\.md: the frontmatter is never closed/);
  assert.throws(() => parseEntry('---\n{ a: 1 }\n---\n', "z.md"), /z\.md: the frontmatter is not valid JSON/);
  assert.throws(() => parseEntry('---\n[1,2]\n---\n', "w.md"), /w\.md: the frontmatter must be a JSON object/);
});

t("a body containing a --- rule survives", () => {
  // A horizontal rule inside markdown must not be mistaken for the
  // end of the frontmatter, which is why only the first one counts.
  const { body } = parseEntry('---\n{ "a": 1 }\n---\n\nOne\n\n---\n\nTwo');
  assert.ok(body.includes("---"));
  assert.ok(body.startsWith("One"));
});

t("windows line endings parse the same", () => {
  const { meta, body } = parseEntry('---\r\n{ "a": 1 }\r\n---\r\n\r\nHello.');
  assert.equal(meta.a, 1);
  assert.equal(body, "Hello.");
});

t("what is written can be read back exactly", () => {
  const meta = { title: "A — dash", list: ["x", "y"], n: 3 };
  const body = "Body with a `code` span and a — dash.";
  const back = parseEntry(serialiseEntry(meta, body));
  assert.deepEqual(back.meta, meta);
  assert.equal(back.body, body);
});

/* ---------- the real files ---------- */
const dirs = [
  {
    dir: "content/playbooks",
    label: "framework",
    required: ["slug", "title", "category", "tier", "reviewed", "summary", "formula", "failureModes", "whenToUse", "sources"],
    arrays: ["failureModes", "sources"],
  },
  {
    dir: "content/glossary",
    label: "glossary term",
    required: ["slug", "term", "category", "definition", "trap", "related"],
    arrays: ["related"],
  },
];

for (const spec of dirs) {
  const full = path.join(root, spec.dir);
  const files = fs.readdirSync(full).filter((f) => f.endsWith(".md"));

  t(`every ${spec.label} file parses`, () => {
    for (const f of files) {
      assert.doesNotThrow(() => parseEntry(fs.readFileSync(path.join(full, f), "utf8"), f), `${spec.dir}/${f}`);
    }
  });

  t(`every ${spec.label} has the fields the site renders`, () => {
    for (const f of files) {
      const { meta, body } = parseEntry(fs.readFileSync(path.join(full, f), "utf8"), f);
      for (const key of spec.required) {
        assert.ok(meta[key] !== undefined && meta[key] !== "", `${spec.dir}/${f} is missing ${key}`);
      }
      for (const key of spec.arrays) {
        assert.ok(Array.isArray(meta[key]), `${spec.dir}/${f}: ${key} must be a list`);
      }
      assert.ok(body.length > 40, `${spec.dir}/${f} has almost no body`);
    }
  });

  t(`every ${spec.label} filename matches its slug`, () => {
    // The admin finds a file by slug. If the two ever disagree, saving
    // an edit creates a second copy instead of replacing the first.
    for (const f of files) {
      const { meta } = parseEntry(fs.readFileSync(path.join(full, f), "utf8"), f);
      assert.equal(`${meta.slug}.md`, f, `${spec.dir}/${f} is named for a different slug`);
    }
  });

  t(`every ${spec.label} has a unique order`, () => {
    const orders = files.map((f) => parseEntry(fs.readFileSync(path.join(full, f), "utf8"), f).meta.order);
    assert.ok(orders.every((o) => typeof o === "number"), `${spec.dir}: an entry has no order`);
    assert.equal(new Set(orders).size, orders.length, `${spec.dir}: two entries share an order`);
  });

  t(`loading ${spec.dir} returns them in order`, () => {
    const loaded = loadEntries(full);
    assert.equal(loaded.length, files.length);
    assert.ok(!("order" in loaded[0]), "order should not leak into the rendered entry");
    assert.ok(loaded[0].body, "the body was not attached");
  });
}

/* ---------- cross references still resolve ---------- */
t("every glossary cross reference points at a term that exists", async () => {
  const terms = (await import("../content/glossary.mjs")).default;
  const slugs = new Set(terms.map((x) => x.slug));
  for (const term of terms) {
    for (const r of term.related || []) {
      assert.ok(slugs.has(r), `${term.slug} points at ${r}, which does not exist`);
    }
  }
});

t("every framework a glossary term names exists", async () => {
  const [terms, playbooks] = await Promise.all([
    import("../content/glossary.mjs"),
    import("../content/playbooks.mjs"),
  ]);
  const slugs = new Set(playbooks.default.map((p) => p.slug));
  for (const term of terms.default) {
    if (term.playbook) assert.ok(slugs.has(term.playbook), `${term.slug} points at framework ${term.playbook}, which does not exist`);
  }
});

console.log(`content: ${n} checks passed across ${fs.readdirSync(path.join(root, "content/playbooks")).length} frameworks and ${fs.readdirSync(path.join(root, "content/glossary")).length} glossary terms.`);
