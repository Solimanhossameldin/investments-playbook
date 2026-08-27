/* The framework library.
 
   The entries themselves are one file each in content/playbooks/, so a
   single framework can be opened and edited on its own, and a mistake
   in one cannot take the other thirty-nine down with it. This module
   just loads them and hands back the same array everything downstream
   already expects.
 
   Publication order comes from the `order` field in each file, not
   from the filename. */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEntries } from "../src/content/entry.mjs";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "playbooks");

export default loadEntries(dir);
