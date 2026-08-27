/* The standing pages: about, disclosure, privacy.
 
   One file each in content/pages/, same format as the frameworks and
   the glossary. The named exports below are what the build already
   imports, so nothing downstream changed when these moved. */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEntries } from "../src/content/entry.mjs";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "pages");
const pages = Object.fromEntries(loadEntries(dir).map((p) => [p.slug, p.body]));

export const about = pages.about;
export const disclosure = pages.disclosure;
export const privacy = pages.privacy;
