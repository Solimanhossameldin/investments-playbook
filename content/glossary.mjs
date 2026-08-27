/* The glossary.
 
   One file per term in content/glossary/. See content/playbooks.mjs
   for why, and src/content/entry.mjs for the file format. */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEntries } from "../src/content/entry.mjs";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "glossary");

export default loadEntries(dir);
