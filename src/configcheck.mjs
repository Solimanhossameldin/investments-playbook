/* Which of the things this build expects to be configured actually arrived.

   Twice now a key has been set and the next run still reported it missing, and
   there was no way to tell from outside the repository whether the secret had
   not been created, had been created in the wrong place, or had been created
   correctly and simply not picked up yet. The answer lived in an Actions log
   that needs an account to read, so the loop was: set it, push, wait, read the
   same message again, guess.

   The runner knows. It can say which names are present without ever saying
   what they contain, and that one line ends the guessing.

   Nothing here ever reads a value. It reads whether a value exists, and the
   length of nothing is not reported either, because a length is a clue. */

export const EXPECTED = [
  { name: "GEMINI_API_KEY", kind: "secret", needed: "the daily brief is written by a model" },
  { name: "OPENAI_API_KEY", kind: "secret", needed: "an alternative to GEMINI_API_KEY", optional: true },
  { name: "MAILERLITE_API_KEY", kind: "secret", needed: "the brief is mailed, and the account is audited" },
  { name: "MAIL_MODE", kind: "variable", needed: "draft, schedule or send", optional: true },
];

/* Present means a non-empty string. An empty environment variable is what an
   unset GitHub secret looks like from inside a step, so empty and absent are
   the same answer and are reported the same way. */
export function present(env, name) {
  return typeof env[name] === "string" && env[name].trim() !== "";
}

export function report(env = process.env) {
  const seen = EXPECTED.map((e) => ({ ...e, present: present(env, e.name) }));
  const missing = seen.filter((e) => !e.present && !e.optional);
  const have = seen.filter((e) => e.present).map((e) => e.name);
  const detail = have.length
    ? `set: ${have.join(", ")}${missing.length ? `; missing: ${missing.map((m) => m.name).join(", ")}` : ""}`
    : `nothing configured. Missing: ${missing.map((m) => m.name).join(", ")}`;
  return { status: missing.length ? "incomplete" : "ok", detail, missing: missing.map((m) => m.name), have };
}
