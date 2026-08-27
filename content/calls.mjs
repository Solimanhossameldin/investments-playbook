/* THE CALL REGISTER
   ==============================================================
   Every forward-looking claim this site makes, with the date it
   was made, the date it resolves, and — once it resolves — what
   actually happened.

   Three rules, and the code enforces all three.

   1. A call goes in here on the day it is published, not later.
      Adding a call after the fact, or after seeing how it went,
      is the entire thing this page exists to make impossible.

   2. A call is never removed. Once the horizon passes, it either
      carries a resolution or it is published as OVERDUE, by
      name, until it is resolved. Deleting a call that went badly
      shows up as a gap in the register, and the tests fail.

   3. Where a call names a public data series and a threshold, it
      is scored by machine, not by judgement. `npm run resolve`
      fetches the series, applies the test, and writes the
      verdict. Nobody marks their own homework on those.

   ---------------------------------------------------------------
   SHAPE

   {
     id:      "2026-08-27-real-yield-holds",   // unique, never reused
     made:    "2026-08-27",                    // published on
     horizon: "2026-12-31",                    // resolves on
     claim:   "One sentence, falsifiable, no hedging.",
     because: "The reasoning. A wrong call with stated reasoning
               teaches something. A wrong call with no reasoning
               is just noise.",
     stakes:  "What a reader should do differently if this is right.",
     where:   "/brief/2026-08-27-slug/",       // where it was published

     // Optional. Include it wherever the claim can be reduced to a
     // number, because a machine-scored call cannot be argued with.
     test: {
       series: "DFII10",        // a FRED series id
       op:     "above",         // above | below | between | rose | fell
       value:  1.5,             // or [lo, hi] for between
       unit:   "%",
     },

     // Only for calls with no `test`. A hand-scored call is marked
     // as such on the page, in as many words, because it is.
     resolution: {
       date:    "2026-12-31",
       verdict: "right",        // right | wrong | partly | void
       actual:  "What happened, with a figure and a source.",
       note:    "Required for `partly` and `void`.",
     },
   }
   ---------------------------------------------------------------

   The register is empty. There are no calls on this site yet, and
   an empty register is the correct thing to publish until there
   are. It is not seeded with anything, because a track record
   that begins with entries written after the fact is not a track
   record.
*/

export default [];
