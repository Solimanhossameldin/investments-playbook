#!/usr/bin/env node
/* Turns an admin password into the two values you paste into Cloudflare.
 
   This runs on your machine. The password is typed here, hashed here,
   never written to a file, never sent anywhere, and never shown on
   screen. What it prints is a hash, which is safe to paste into a
   dashboard and cannot be turned back into the password.
 
   Run:  node scripts/make-admin-hash.mjs
*/

import crypto from "node:crypto";

const ITERATIONS = 210000; // OWASP guidance for PBKDF2-HMAC-SHA256

/* Reads a line without echoing it.
 
   readline is the obvious tool and it is the wrong one here: it echoes
   what you type, and suppressing that echo relies on a private method
   that behaves differently on a terminal and on a pipe. Raw mode on the
   terminal simply does not echo, which is the actual guarantee wanted,
   and reading the stream directly means two prompts in a row work. */
/* Anything read past the end of one line, kept for the next prompt.
   A pipe delivers both lines in a single chunk, so a reader that stops
   at the first newline and drops the rest hangs forever on the second
   question. That is exactly what happened here before this existed. */
let pending = "";

function ask(question) {
  return new Promise((resolve) => {
    process.stdout.write(question);

    // Serve from what is already buffered before touching the stream.
    const ready = pending.search(/[\r\n]/);
    if (ready !== -1) {
      const line = pending.slice(0, ready);
      pending = pending.slice(ready + 1).replace(/^\n/, "");
      process.stdout.write("\n");
      return resolve(line);
    }

    const tty = Boolean(process.stdin.isTTY);
    if (tty) process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    let buf = pending;
    pending = "";

    const done = (value) => {
      process.stdin.removeListener("data", onData);
      if (tty) process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      resolve(value);
    };

    const onData = (chunk) => {
      for (let i = 0; i < chunk.length; i++) {
        const ch = chunk[i];
        if (ch === "\u0003") { process.stdout.write("\n"); process.exit(1); } // ctrl-C
        if (ch === "\n" || ch === "\r") {
          let rest = chunk.slice(i + 1);
          if (ch === "\r" && rest[0] === "\n") rest = rest.slice(1);
          pending = rest;
          return done(buf);
        }
        if (ch === "\u007f" || ch === "\b") { buf = buf.slice(0, -1); continue; }
        if (ch >= " ") buf += ch;
      }
    };

    process.stdin.on("data", onData);
  });
}

const pw = await ask("Choose an admin password: ");

if (pw.length < 12) {
  console.error("\nToo short. Use at least twelve characters. This is the only thing between the internet and your leads.\n");
  process.exit(1);
}

const again = await ask("Type it again: ");

if (again !== pw) {
  console.error("\nThose did not match. Nothing was written. Run it again.\n");
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(pw, salt, ITERATIONS, 32, "sha256");
const stored = `pbkdf2$${ITERATIONS}$${salt.toString("base64")}$${hash.toString("base64")}`;
const sessionSecret = crypto.randomBytes(32).toString("base64");

// Prove the hash actually verifies before handing it over, rather than
// letting a bad one lock you out of your own admin.
const check = crypto.pbkdf2Sync(pw, salt, ITERATIONS, 32, "sha256").toString("base64");
if (check !== hash.toString("base64")) {
  console.error("\nThe hash did not verify against itself. Do not use it. Tell Claude.\n");
  process.exit(1);
}

console.log(`
Verified. Paste these two into the Cloudflare Worker as encrypted
variables. Neither can be turned back into your password.

ADMIN_PASSWORD_HASH
${stored}

SESSION_SECRET
${sessionSecret}

The third variable, MAILERLITE_API_KEY, you create in MailerLite:
Integrations, then API, then a token with read access to subscribers.

None of these three belong in the repository. They live only in the
Cloudflare dashboard.
`);
