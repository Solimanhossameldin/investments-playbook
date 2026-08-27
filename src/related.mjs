/* Choosing which frameworks link to which.
 
   The obvious way to do this is to sort candidates by category and tier
   and take the first four. That is what this site did, and because the
   sort is deterministic the same handful of pages won every time: a few
   were linked from thirty other pages and several were linked from none.
   A page nothing links to is a page a search engine has little reason to
   think matters, and a reader never stumbles onto it either.
 
   So the picker also tracks how often each page has already been chosen
   and prefers the ones that have been chosen least. Relevance still comes
   first -- same category always outranks a different one -- but among
   equally relevant candidates, the rarely-linked one wins. */

const MIN_INBOUND = 2;

export function pickRelated(items, { count = 4, min = MIN_INBOUND, key = "slug", group = "category", rank = "tier" } = {}) {
  const refs = new Map(items.map((i) => [i[key], 0]));
  const chosen = new Map();

  for (const item of items) {
    const cands = items
      .filter((o) => o[key] !== item[key])
      .sort((a, b) => {
        const ag = a[group] === item[group] ? 0 : 1;
        const bg = b[group] === item[group] ? 0 : 1;
        if (ag !== bg) return ag - bg;
        const ar = refs.get(a[key]), br = refs.get(b[key]);
        if (ar !== br) return ar - br;
        const at = a[rank] ?? 99, bt = b[rank] ?? 99;
        if (at !== bt) return at - bt;
        return a[key] < b[key] ? -1 : 1;
      });
    const pick = cands.slice(0, count);
    for (const p of pick) refs.set(p[key], refs.get(p[key]) + 1);
    chosen.set(item[key], pick);
  }

  /* The first pages processed chose before there was anything to level
     against, so a few can still come out short. Swap them in over an
     entry that has more links than it needs, preferring a host in the
     same category so the substitution still makes sense to a reader. */
  const byKey = new Map(items.map((i) => [i[key], i]));
  for (const item of items) {
    if (refs.get(item[key]) >= min) continue;
    for (const host of items) {
      if (refs.get(item[key]) >= min) break;
      if (host[key] === item[key]) continue;
      const list = chosen.get(host[key]);
      if (list.some((c) => c[key] === item[key])) continue;
      const sameCat = host[group] === item[group];
      const idx = list.findIndex((c) => refs.get(c[key]) > min && (sameCat || c[group] !== host[group]));
      if (idx === -1) continue;
      refs.set(list[idx][key], refs.get(list[idx][key]) - 1);
      list[idx] = byKey.get(item[key]);
      refs.set(item[key], refs.get(item[key]) + 1);
    }
  }

  return { chosen, refs };
}
