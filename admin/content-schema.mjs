/* What the admin lets you edit, and what each field is.
 
   The form is generated from this, so adding a field to a framework
   means adding a line here, not writing HTML. `list` is a repeating
   text field; `pairs` is a repeating pair, which is what a source is.
 
   Anything not listed is left exactly as it was when a file is saved,
   so a field the admin does not know about is never quietly dropped. */

export const SECTIONS = {
  playbooks: {
    label: "Frameworks",
    dir: "content/playbooks",
    titleField: "title",
    urlPrefix: "/playbooks/",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "summary", label: "Summary", type: "textarea", rows: 3, required: true,
        help: "One sentence. This is what shows in search results and on the library page." },
      { key: "category", label: "Category", type: "select", required: true,
        options: ["property", "portfolio", "risk", "tax", "cross-asset", "valuation", "behavioural"] },
      { key: "tier", label: "Tier", type: "number", required: true, help: "1 is a core framework, 2 is supporting." },
      { key: "calculator", label: "Calculator", type: "text", help: "The slug of a calculator, or leave blank." },
      { key: "reviewed", label: "Last reviewed", type: "text", required: true, help: "For example: 27 August 2026" },
      { key: "body", label: "The framework", type: "markdown", required: true },
      { key: "formula", label: "The arithmetic", type: "textarea", rows: 10, required: true,
        help: "Shown in a monospaced block. Line breaks are kept." },
      { key: "failureModes", label: "Where it breaks", type: "list", required: true,
        help: "One per line. This is the section that makes the page worth reading." },
      { key: "whenToUse", label: "When to use it", type: "textarea", rows: 3, required: true },
      { key: "sources", label: "Sources", type: "pairs", required: true, pair: ["name", "url"] },
    ],
  },
  glossary: {
    label: "Glossary",
    dir: "content/glossary",
    titleField: "term",
    urlPrefix: "/glossary/",
    fields: [
      { key: "term", label: "Term", type: "text", required: true },
      { key: "definition", label: "Definition", type: "textarea", rows: 3, required: true,
        help: "One self-contained sentence. It has to make sense with nothing else around it." },
      { key: "category", label: "Category", type: "select", required: true,
        options: ["property", "markets", "tax", "behaviour"] },
      { key: "trap", label: "The trap", type: "textarea", rows: 3, required: true,
        help: "What people get wrong about it." },
      { key: "body", label: "The longer explanation", type: "markdown", required: true },
      { key: "playbook", label: "Related framework", type: "text", help: "A framework slug, or blank." },
      { key: "related", label: "Related terms", type: "list", help: "Glossary slugs, one per line." },
    ],
  },
  pages: {
    label: "Pages",
    dir: "content/pages",
    titleField: "title",
    urlField: "path",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "body", label: "The page", type: "markdown", required: true },
    ],
  },
};

/* Server-side validation. The browser checks too, but the browser is
   not where this has to hold: anyone can post whatever they like to
   the endpoint, so nothing is committed until it passes here. */
export function validate(sectionKey, meta, body) {
  const section = SECTIONS[sectionKey];
  if (!section) return ["Unknown section."];
  const errors = [];

  for (const f of section.fields) {
    const value = f.key === "body" ? body : meta[f.key];
    if (f.required) {
      const empty =
        value === undefined || value === null || value === "" ||
        (Array.isArray(value) && value.length === 0);
      if (empty) errors.push(`${f.label} cannot be empty.`);
    }
    if (f.type === "number" && value !== undefined && value !== "" && !Number.isFinite(Number(value))) {
      errors.push(`${f.label} has to be a number.`);
    }
    if (f.type === "select" && value && !f.options.includes(value)) {
      errors.push(`${f.label} must be one of: ${f.options.join(", ")}.`);
    }
    if (f.type === "list" && value !== undefined && !Array.isArray(value)) {
      errors.push(`${f.label} must be a list.`);
    }
    if (f.type === "pairs" && Array.isArray(value)) {
      for (const p of value) {
        if (!p || !p[f.pair[0]]) errors.push(`Every ${f.label.toLowerCase()} entry needs a ${f.pair[0]}.`);
        else if (p[f.pair[1]] && !/^https?:\/\//i.test(p[f.pair[1]])) {
          errors.push(`"${String(p[f.pair[0]]).slice(0, 40)}" has a link that is not a web address.`);
        }
      }
    }
  }

  if (!meta.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.slug)) {
    errors.push("The slug must be lower case letters, numbers and single hyphens.");
  }
  if (typeof meta.order !== "number") errors.push("The order is missing.");

  return errors;
}
