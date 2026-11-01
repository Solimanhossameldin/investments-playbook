/* Wills and succession in the UAE, and the sentence that does not finish.

   Every page on this query answers the same question twice and the real one
   never. They say: make a will, or UAE law applies. Since 1 February 2023
   that second half has a specific meaning, and it is not the one most of the
   pages still carry.

   Federal Decree-Law No. (41) of 2022 is the instrument. Article 11(2) sets
   the default distribution where a non-Muslim leaves no will, and the first
   sentence is clean enough to compute to the dirham: half to the spouse, the
   other half equally among the children, "with no differentiation between
   male and female". On the illustrative one bedroom that is a number, and
   this module computes it.

   The second sentence is where the page earns its place. Read it as drafted:

     "If the deceased has no children, the legacy shall devolve to the
      parents of the deceased if they are alive equally or half of the
      legacy shall devolve to either of the parents in the case the other
      parent has died, while the other half shall devolve to the brother
      and sisters thereof."

   It never says what the spouse gets. The first sentence gives the spouse
   half where there are children; no sentence in the Article fixes the
   spouse's share where there are none. That is not a gap this module
   resolves, because resolving it is a court's job and not a website's. What
   the module does is price it: the three readings in circulation on the
   pages that currently rank put a childless spouse's share of the same flat
   at half of it, nothing, or all of it. The drafting leaves the whole unit
   in play, and that — not the choice between a DIFC will and a home country
   one — is the strongest argument for registering something.

   The three readings are recorded here with the pages that hold them so the
   disagreement is checkable rather than asserted. They are not ranked. A
   reader who wants to know which one a Dubai court would reach has a
   question for a UAE qualified lawyer, and the page says so.

   Two further consequences, both from the instruments and neither on any
   competing page:

   1. The election under Article 11(3) belongs to the HEIRS, not to the
      owner, and a registered will switches it off. So a will does not only
      direct the assets; it removes a decision the survivors would otherwise
      be able to take against each other.

   2. Real property is the one asset where the home country will does not
      reach. The Civil Transactions Law applies UAE law to a foreigner's
      will disposing of real property in the State. Note the source quality
      honestly: the only English text of Article 17 reachable from here is
      an unofficial translation, and the official portal entry was not
      located. The page labels it as such. Two of the pages that rank
      contradict each other outright on this point.

   The unit is the net rental yield page's illustrative one bedroom, so the
   pages chain and a reader carries one flat across the site. */

import { EXAMPLE, FEES, money } from "./acquisition.mjs";

export const INSTRUMENTS = {
  decree41: {
    name: "Federal Decree-Law No. (41) of 2022 On the Civil Personal Status, Articles 1, 4, 11, 13 and 18",
    url: "https://uaelegislation.gov.ae/en/legislations/1586",
  },
  civilCode: {
    name: "Federal Law No. (5) of 1985 Promulgating the Civil Transactions Law, Article 17 — unofficial English translation, official portal entry not located",
    url: "https://lexemiratidotnet.wordpress.com/wp-content/uploads/2011/07/uae-civil-code-_english-translation_.pdf",
  },
  difcFees: {
    name: "DIFC Courts, Schedule of Fees, the DIFC Courts Wills Service",
    url: "https://www.difccourts.ae/about/fees",
  },
  difcRules: {
    name: "DIFC Courts, Wills Service rules and directions",
    url: "https://www.difccourts.ae/difc-courts-wills/rules-directions",
  },
};

/* Quoted from the official English text on the federal legislation portal,
   which carries the note that in case of conflict the Arabic text will
   prevail. The portal's entry for the Decree-Law lists no amendments and a
   last-update date of 3 October 2022, so these are the words of the original
   instrument; an amending decree-law, if one is in force, is not reflected
   here and the page says so rather than implying a consolidated text.

   The real-property claim is filed against the unofficial translation on
   purpose. It is the weakest source on this page and the page names it as
   the weakest source. */
export const STATUTORY = [
  { key: "scope", claim: "non-Muslims who are national citizens of the United Arab Emirates, and to non-Muslim foreigners residing in the state", instrument: "decree41" },
  { key: "optOut", claim: "unless any of them adheres to the application of the law of their home country", instrument: "decree41" },
  { key: "incidentsAfter", claim: "The provisions of this Decree-Law shall apply to all incidents that occur after the entry into force of these provisions", instrument: "decree41" },
  { key: "equality", claim: "Inheritance shall be equally distributed between men and women in accordance with the provisions of this Decree-Law", instrument: "decree41" },
  { key: "willFreedom", claim: "The testator shall have the right to leave a will with the entire property he owns in the State in favor of anybody he wants", instrument: "decree41" },
  { key: "spouseHalf", claim: "half of the inheritance shall devolve to the husband or wife", instrument: "decree41" },
  { key: "childrenEqual", claim: "the other half shall be distributed equally among the children with no differentiation between male and female", instrument: "decree41" },
  { key: "noChildren", claim: "If the deceased has no children, the legacy shall devolve to the parents of the deceased if they are alive equally", instrument: "decree41" },
  { key: "oneParent", claim: "half of the legacy shall devolve to either of the parents in the case the other parent has died, while the other half shall devolve to the brother and sisters thereof", instrument: "decree41" },
  { key: "noParents", claim: "In the event of absence of both parents, the entire legacy shall devolve into the testator's brothers and sisters", instrument: "decree41" },
  { key: "heirsElection", claim: "any of the foreigner's heirs may request the application of the law applicable to the estate in accordance with the provisions stipulated in the Civil Code, unless there is a registered will to the contrary", instrument: "decree41" },
  { key: "registration", claim: "shall be recorded in the register prepared for this purpose", instrument: "decree41" },
  { key: "marriageForm", claim: "The married couple may fill out a will registration form during the signing of the marriage contract to indicate how the property will be distributed in the event of the death of either of them", instrument: "decree41" },
  { key: "inForce", claim: "shall enter into force as of February 1, 2023", instrument: "decree41" },
  { key: "realProperty", claim: "The law of the United Arab Emirates shall apply to wills made by aliens disposing of their real property located in the State", instrument: "civilCode" },
  { key: "difcNonMuslim", claim: "regulating inheritance, wills and probate for non-Muslims", instrument: "difcRules" },
];

/* The date the default changed, and the date from which it bites. */
export const IN_FORCE = "1 February 2023";

/* The estate this page works, which is the net yield page's flat. The page
   values the estate at the unit alone so that every figure on it is a figure
   about one asset a reader can picture, rather than a notional total. */
export const ESTATE = EXAMPLE.price;

/* The spouse's share where there are children, as Article 11(2) states it in
   its first sentence. One half. Expressed as a fraction rather than a
   literal so that the tables and the prose cannot disagree. */
export const SPOUSE_SHARE_WITH_CHILDREN = 1 / 2;

/* Article 11(2), first sentence, computed. The spouse takes half; the
   children divide the other half equally, and the Article says explicitly
   that sons and daughters are not distinguished, so the count is all that
   matters. */
export function withChildren(estate, children) {
  const n = Math.max(1, Math.round(children));
  const spouse = estate * SPOUSE_SHARE_WITH_CHILDREN;
  return { spouse, perChild: (estate - spouse) / n, children: n };
}

/* The published table of the first sentence, over the child counts a reader
   is likely to be. */
export const CHILD_COUNTS = [1, 2, 3, 4];

/* Article 11(2), third clause: no children, one parent already dead. Here
   the Article does fix the split — half to the surviving parent, half to the
   siblings — and again says nothing about a spouse. */
export function oneParentGone(estate, siblings) {
  const n = Math.max(1, Math.round(siblings));
  return { parent: estate / 2, perSibling: estate / 2 / n, siblings: n };
}

/* Article 11(2), final clause: both parents gone, no children. The whole
   legacy to the brothers and sisters, equally. */
export function siblingsOnly(estate, siblings) {
  const n = Math.max(1, Math.round(siblings));
  return { perSibling: estate / n, siblings: n };
}

/* The childless spouse, which is the point of the page.

   Article 11(2) gives the spouse half in the sentence about children and
   fixes no share in the sentence about no children. Three readings are in
   circulation on the pages that currently answer this query, and each is
   recorded with a page that holds it. The fractions are the readings', not
   this module's, and the module takes no view on which is right. */
export const CHILDLESS_READINGS = [
  {
    key: "half",
    spouse: 1 / 2,
    reading: "the spouse keeps the half the first sentence gives, and the parents divide the other half",
    heldBy: "Dubizzle",
  },
  {
    key: "none",
    spouse: 0,
    reading: "the no-children sentence is read as it is drafted, devolving the legacy on the parents, and the spouse's half does not survive the absence of children",
    heldBy: "a literal reading of the sentence",
  },
  {
    key: "all",
    spouse: 1,
    reading: "the spouse takes the whole estate",
    heldBy: "START",
  },
];

/* What each reading pays a childless spouse out of the same flat, and the
   distance between the best and the worst of them. The spread is the whole
   unit, which is the finding: this is not a rounding disagreement. */
export function childlessSpouse(estate) {
  const rows = CHILDLESS_READINGS.map((r) => ({ ...r, amount: estate * r.spouse }));
  const amounts = rows.map((r) => r.amount);
  const low = Math.min(...amounts);
  const high = Math.max(...amounts);
  return { rows, low, high, spread: high - low };
}

/* The cost of not leaving the question open, against the cost of the
   purchase that created the asset.

   The DIFC Courts publish a fee for each will type. The schedule on the
   fees page carries no effective date on its face, so the page cites it as
   published and tells the reader to confirm the figure at booking rather
   than presenting it as a rate fixed by an instrument. */
export const DIFC_WILLS = [
  { key: "full", name: "Full Will", single: 10000, mirror: 15000, covers: "all moveable and immoveable assets" },
  { key: "property", name: "Property Will", single: 7500, mirror: 10000, covers: "shares in up to five real estate properties within the UAE" },
  { key: "guardianship", name: "Guardianship Will", single: 5000, mirror: 7500, covers: "minor children" },
  { key: "business", name: "Business Owners Will", single: 5000, mirror: 7500, covers: "UAE company shares" },
  { key: "financial", name: "Financial Assets Will", single: 5000, mirror: 7500, covers: "accounts and portfolios" },
  { key: "digital", name: "Digital Assets Will", single: 5000, mirror: 7500, covers: "digital assets" },
];

export function willFee(key, mirror = false) {
  const w = DIFC_WILLS.find((x) => x.key === key);
  if (!w) return 0;
  return mirror ? w.mirror : w.single;
}

/* The registration fee the buyer already paid the Land Department to put the
   unit in his name, which is the only fee on this subject a Dubai owner has
   certainly met. It is the honest yardstick for the will fee: both are one
   off costs of holding the same flat properly. */
export function transferFeePaid(estate) {
  return estate * FEES.transferRate;
}

/* The will fee as a share of the estate, and as a share of what registering
   the purchase cost. The second ratio is the one worth printing: it puts the
   price of certainty next to a number the owner has already written a cheque
   for. */
export function feeAgainstEstate(key, estate, mirror = false) {
  return willFee(key, mirror) / estate;
}

export function feeAgainstTransfer(key, estate, mirror = false) {
  return willFee(key, mirror) / transferFeePaid(estate);
}

export { money };
